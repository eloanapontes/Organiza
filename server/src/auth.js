import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { getPool } from './db.js'
import { config } from './config.js'
import { logger } from './logger.js'
import crypto from 'node:crypto'

const SESSION_COOKIE = 'organiza_session'
const memoryUsers = []

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome').max(120),
  email: z.string().trim().email('Informe um e-mail válido').max(190),
  password: z.string().min(6, 'A senha precisa ter pelo menos 6 caracteres').max(100)
})
const loginSchema = z.object({ email: z.string().trim().email('Informe um e-mail válido'), password: z.string().min(1, 'Informe sua senha') })

function publicUser(user) { return { id: user.id, name: user.name, email: user.email } }
function cookieOptions(req) {
  const forwardedProto = req.headers['x-forwarded-proto']
  const isHttps = forwardedProto === 'https' || process.env.COOKIE_SECURE === 'true'
  return { httpOnly: true, secure: isHttps, sameSite: isHttps ? 'none' : 'lax', maxAge: config.sessionMaxAgeMs, path: '/' }
}
function issueToken(user) { return jwt.sign({ sub: String(user.id), email: user.email, name: user.name }, config.jwtSecret, { expiresIn: '7d' }) }
function normalizeEmail(email) { return email.toLowerCase().trim() }
function authError(message = 'E-mail ou senha inválidos') { const error = new Error(message); error.statusCode = 401; error.code = 'AUTH_INVALID'; return error }

export async function register(input, res, req) {
  const data = registerSchema.parse({ ...input, email: normalizeEmail(input.email) })
  const pool = getPool()
  let user
  if (pool) {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [data.email])
    if (existing.length) { const error = new Error('Este e-mail já está cadastrado'); error.statusCode = 409; error.code = 'EMAIL_ALREADY_REGISTERED'; throw error }
    const passwordHash = await bcrypt.hash(data.password, 12)
    const [result] = await pool.query('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', [data.name, data.email, passwordHash])
    user = { id: result.insertId, name: data.name, email: data.email }
  } else {
    if (memoryUsers.some((item) => item.email === data.email)) { const error = new Error('Este e-mail já está cadastrado'); error.statusCode = 409; error.code = 'EMAIL_ALREADY_REGISTERED'; throw error }
    user = { id: memoryUsers.length + 1, name: data.name, email: data.email, password_hash: await bcrypt.hash(data.password, 10) }
    memoryUsers.push(user)
  }
  res.cookie(SESSION_COOKIE, issueToken(user), cookieOptions(req))
  logger.info('Usuário cadastrado', { userId: user.id })
  return publicUser(user)
}

export async function login(input, res, req) {
  const data = loginSchema.parse({ ...input, email: normalizeEmail(input.email) })
  const pool = getPool()
  let user
  if (pool) {
    const [rows] = await pool.query('SELECT id, name, email, password_hash FROM users WHERE email = ?', [data.email])
    user = rows[0]
  } else user = memoryUsers.find((item) => item.email === data.email)
  if (!user || !(await bcrypt.compare(data.password, user.password_hash))) throw authError()
  res.cookie(SESSION_COOKIE, issueToken(user), cookieOptions(req))
  logger.info('Login realizado', { userId: user.id })
  return publicUser(user)
}

export function logout(res, req) { res.clearCookie(SESSION_COOKIE, { ...cookieOptions(req), maxAge: undefined }); logger.info('Logout realizado') }

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.[SESSION_COOKIE]
    if (!token) throw authError('Faça login para continuar')
    const payload = jwt.verify(token, config.jwtSecret)
    const pool = getPool()
    let user
    if (pool) {
      const [rows] = await pool.query('SELECT id, name, email FROM users WHERE id = ?', [payload.sub])
      user = rows[0]
    } else user = memoryUsers.find((item) => String(item.id) === String(payload.sub))
    if (!user) throw authError('Usuário não encontrado')
    req.user = publicUser(user)
    next()
  } catch (error) { next(error.code ? error : authError('Sessão expirada. Faça login novamente.')) }
}

export async function currentUser(req) {
  const token = req.cookies?.[SESSION_COOKIE]
  if (!token) return null
  try {
    const payload = jwt.verify(token, config.jwtSecret)
    const pool = getPool()
    if (pool) {
      const [rows] = await pool.query('SELECT id, name, email FROM users WHERE id = ?', [payload.sub])
      return rows[0] ? publicUser(rows[0]) : null
    }
    const user = memoryUsers.find((item) => String(item.id) === String(payload.sub))
    return user ? publicUser(user) : null
  } catch { return null }
}

export const authSchemas = { register: registerSchema, login: loginSchema }
export const sessionCookieName = SESSION_COOKIE
export const createMemoryUserForTest = () => ({ id: crypto.randomUUID() })

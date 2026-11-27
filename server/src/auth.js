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
  password: z.string()
    .min(6, 'A senha precisa ter pelo menos 6 caracteres')
    .max(100)
})

const loginSchema = z.object({
  email: z.string().trim().email('Informe um e-mail válido'),
  password: z.string().min(1, 'Informe sua senha')
})

const profileSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome').max(120),
  email: z.string().trim().email('Informe um e-mail válido').max(190),
  profilePhoto: z
    .string()
    .max(4_500_000, 'A foto precisa ter no máximo 3 MB')
    .nullable()
    .optional()
})

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    profilePhoto: user.profile_photo ?? user.profilePhoto ?? null
  }
}

function cookieOptions(req) {
  const forwardedProto = req.headers['x-forwarded-proto']
  const isHttps =
    forwardedProto === 'https' || process.env.COOKIE_SECURE === 'true'

  return {
    httpOnly: true,
    secure: isHttps,
    sameSite: isHttps ? 'none' : 'lax',
    maxAge: config.sessionMaxAgeMs,
    path: '/'
  }
}

function issueToken(user) {
  return jwt.sign(
    {
      sub: String(user.id),
      email: user.email,
      name: user.name
    },
    config.jwtSecret,
    { expiresIn: '7d' }
  )
}

function normalizeEmail(email) {
  return email.toLowerCase().trim()
}

function authError(message = 'E-mail ou senha inválidos') {
  const error = new Error(message)
  error.statusCode = 401
  error.code = 'AUTH_INVALID'
  return error
}

function conflictError(message) {
  const error = new Error(message)
  error.statusCode = 409
  error.code = 'EMAIL_ALREADY_REGISTERED'
  return error
}

export async function register(input, res, req) {
  const data = registerSchema.parse({
    ...input,
    email: normalizeEmail(input.email)
  })

  const pool = getPool()
  let user

  if (pool) {
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [data.email]
    )

    if (existing.length) {
      throw conflictError('Este e-mail já está cadastrado')
    }

    const passwordHash = await bcrypt.hash(data.password, 12)

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [data.name, data.email, passwordHash]
    )

    user = {
      id: result.insertId,
      name: data.name,
      email: data.email,
      profilePhoto: null
    }
  } else {
    if (memoryUsers.some((item) => item.email === data.email)) {
      throw conflictError('Este e-mail já está cadastrado')
    }

    user = {
      id: memoryUsers.length + 1,
      name: data.name,
      email: data.email,
      password_hash: await bcrypt.hash(data.password, 10),
      profilePhoto: null
    }

    memoryUsers.push(user)
  }

  res.cookie(SESSION_COOKIE, issueToken(user), cookieOptions(req))

  logger.info('Usuário cadastrado', {
    userId: user.id
  })

  return publicUser(user)
}

export async function login(input, res, req) {
  const data = loginSchema.parse({
    ...input,
    email: normalizeEmail(input.email)
  })

  const pool = getPool()
  let user

  if (pool) {
    const [rows] = await pool.query(
      `
        SELECT
          id,
          name,
          email,
          password_hash,
          profile_photo
        FROM users
        WHERE email = ?
      `,
      [data.email]
    )

    user = rows[0]
  } else {
    user = memoryUsers.find((item) => item.email === data.email)
  }

  if (!user || !(await bcrypt.compare(data.password, user.password_hash))) {
    throw authError()
  }

  res.cookie(SESSION_COOKIE, issueToken(user), cookieOptions(req))

  logger.info('Login realizado', {
    userId: user.id
  })

  return publicUser(user)
}

export function logout(res, req) {
  res.clearCookie(SESSION_COOKIE, {
    ...cookieOptions(req),
    maxAge: undefined
  })

  logger.info('Logout realizado')
}

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.[SESSION_COOKIE]

    if (!token) {
      throw authError('Faça login para continuar')
    }

    const payload = jwt.verify(token, config.jwtSecret)
    const pool = getPool()
    let user

    if (pool) {
      const [rows] = await pool.query(
        `
          SELECT
            id,
            name,
            email,
            profile_photo
          FROM users
          WHERE id = ?
        `,
        [payload.sub]
      )

      user = rows[0]
    } else {
      user = memoryUsers.find(
        (item) => String(item.id) === String(payload.sub)
      )
    }

    if (!user) {
      throw authError('Usuário não encontrado')
    }

    req.user = publicUser(user)
    next()
  } catch (error) {
    next(
      error.code
        ? error
        : authError('Sessão expirada. Faça login novamente.')
    )
  }
}

export async function currentUser(req) {
  const token = req.cookies?.[SESSION_COOKIE]

  if (!token) {
    return null
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret)
    const pool = getPool()

    if (pool) {
      const [rows] = await pool.query(
        `
          SELECT
            id,
            name,
            email,
            profile_photo
          FROM users
          WHERE id = ?
        `,
        [payload.sub]
      )

      return rows[0] ? publicUser(rows[0]) : null
    }

    const user = memoryUsers.find(
      (item) => String(item.id) === String(payload.sub)
    )

    return user ? publicUser(user) : null
  } catch {
    return null
  }
}

export async function updateProfile(userId, input, res, req) {
  const data = profileSchema.parse({
    ...input,
    email: normalizeEmail(input.email)
  })

  const pool = getPool()
  let user

  if (pool) {
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ? AND id <> ?',
      [data.email, userId]
    )

    if (existing.length) {
      throw conflictError('Este e-mail já está cadastrado')
    }

    const [currentRows] = await pool.query(
      `
        SELECT
          id,
          name,
          email,
          profile_photo
        FROM users
        WHERE id = ?
      `,
      [userId]
    )

    const currentUserData = currentRows[0]

    if (!currentUserData) {
      throw authError('Usuário não encontrado')
    }

    const profilePhoto =
      data.profilePhoto !== undefined
        ? data.profilePhoto
        : currentUserData.profile_photo

    await pool.query(
      `
        UPDATE users
        SET
          name = ?,
          email = ?,
          profile_photo = ?
        WHERE id = ?
      `,
      [data.name, data.email, profilePhoto, userId]
    )

    const [rows] = await pool.query(
      `
        SELECT
          id,
          name,
          email,
          profile_photo
        FROM users
        WHERE id = ?
      `,
      [userId]
    )

    user = rows[0]
  } else {
    user = memoryUsers.find(
      (item) => String(item.id) === String(userId)
    )

    if (!user) {
      throw authError('Usuário não encontrado')
    }

    const emailAlreadyUsed = memoryUsers.some(
      (item) =>
        item.email === data.email &&
        String(item.id) !== String(userId)
    )

    if (emailAlreadyUsed) {
      throw conflictError('Este e-mail já está cadastrado')
    }

    user.name = data.name
    user.email = data.email

    if (data.profilePhoto !== undefined) {
      user.profilePhoto = data.profilePhoto
    }
  }

  res.cookie(SESSION_COOKIE, issueToken(user), cookieOptions(req))

  logger.info('Perfil atualizado', {
    userId
  })

  return publicUser(user)
}

export const authSchemas = {
  register: registerSchema,
  login: loginSchema,
  profile: profileSchema
}

export const sessionCookieName = SESSION_COOKIE

export const createMemoryUserForTest = () => ({
  id: crypto.randomUUID()
})
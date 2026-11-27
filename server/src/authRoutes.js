import { Router } from 'express'
import { currentUser, login, logout, register } from './auth.js'

export const authRouter = Router()

authRouter.get('/me', async (req, res, next) => {
  try {
    const user = await currentUser(req)
    if (!user) return res.status(401).json({ error: { code: 'NOT_AUTHENTICATED', message: 'Faça login para continuar' } })
    return res.json({ data: user })
  } catch (error) { return next(error) }
})

authRouter.post('/register', async (req, res, next) => {
  try { res.status(201).json({ data: await register(req.body, res, req) }) } catch (error) { next(error) }
})

authRouter.post('/login', async (req, res, next) => {
  try { res.json({ data: await login(req.body, res, req) }) } catch (error) { next(error) }
})

authRouter.post('/logout', (req, res) => { logout(res, req); res.status(204).send() })

import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { databaseStatus } from './db.js'
import { redisStatus } from './cache.js'
import { logger } from './logger.js'
import { tasksRouter } from './tasksRoutes.js'
import { authRouter } from './authRoutes.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const app = express()
app.disable('x-powered-by')
app.use(cors({ origin: true, credentials: true }))
app.use(cookieParser())
app.use(express.json({ limit: '1mb' }))
app.use((req, res, next) => { const startedAt = Date.now(); res.on('finish', () => logger.info('HTTP request', { method: req.method, path: req.originalUrl, status: res.statusCode, durationMs: Date.now() - startedAt })); next() })
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'organiza-api', timestamp: new Date().toISOString(), dependencies: { database: databaseStatus(), redis: redisStatus() } }))
app.get('/api', (req, res) => res.json({ name: 'Organiza API', version: '1.0.0', docs: '/openapi.yaml' }))
app.use('/api/auth', authRouter)
app.use('/api/tasks', tasksRouter)
const clientDist = path.resolve(__dirname, '../../client/dist')
app.use(express.static(clientDist))
app.get(/^(?!\/api|\/health).*/, (req, res) => res.sendFile(path.join(clientDist, 'index.html')))
app.use((error, req, res, next) => { logger.error('Erro não tratado na API', { code: error.code, error: error.message, path: req.originalUrl }); const status = error.name === 'ZodError' ? 400 : error.statusCode || 500; res.status(status).json({ error: { code: error.code || (status === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR'), message: status === 500 ? 'Ocorreu um erro interno. Tente novamente.' : error.message } }) })

import { app } from './app.js'
import { config } from './config.js'
import { initDatabase } from './db.js'
import { initRedis } from './cache.js'
import { logger } from './logger.js'

await initDatabase()
await initRedis()
app.listen(config.port, '0.0.0.0', () => logger.info('Organiza API pronta', { port: config.port, environment: config.nodeEnv }))

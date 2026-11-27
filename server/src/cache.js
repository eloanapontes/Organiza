import { createClient } from 'redis'
import { config } from './config.js'
import { logger } from './logger.js'

let cacheClient = null
let publisher = null
let subscriber = null
let redisReady = false

export async function initRedis(onEvent) {
  if (!config.redisUrl) {
    logger.warn('REDIS_URL não configurada; seguindo sem cache e mensageria')
    return
  }

  cacheClient = createClient({ url: config.redisUrl })
  publisher = cacheClient.duplicate()
  subscriber = cacheClient.duplicate()
  for (const client of [cacheClient, publisher, subscriber]) {
    client.on('error', (error) => logger.error('Erro Redis', { error: error.message }))
  }

  try {
    await Promise.all([cacheClient.connect(), publisher.connect(), subscriber.connect()])
    await subscriber.subscribe('organiza:tasks', (message) => {
      const event = JSON.parse(message)
      logger.info('Evento recebido via Redis Pub/Sub', { eventType: event.type, taskId: event.taskId })
      onEvent?.(event)
    })
    redisReady = true
    logger.info('Redis conectado; cache-aside e Pub/Sub ativos')
  } catch (error) {
    logger.error('Redis indisponível; seguindo sem cache', { error: error.message })
    redisReady = false
  }
}

export async function cacheGet(key) {
  if (!redisReady) return null
  try {
    const value = await cacheClient.get(key)
    if (value) logger.info('Cache hit', { key })
    else logger.info('Cache miss', { key })
    return value ? JSON.parse(value) : null
  } catch (error) {
    logger.warn('Falha ao ler cache', { key, error: error.message })
    return null
  }
}

export async function cacheSet(key, value) {
  if (!redisReady) return
  try {
    await cacheClient.set(key, JSON.stringify(value), { EX: config.cacheTtlSeconds })
    logger.info('Cache atualizado', { key, ttlSeconds: config.cacheTtlSeconds })
  } catch (error) {
    logger.warn('Falha ao gravar cache', { key, error: error.message })
  }
}

export async function cacheInvalidateTasks() {
  if (!redisReady) return
  try {
    const keys = []
    for await (const key of cacheClient.scanIterator({ MATCH: 'tasks:list:*', COUNT: 100 })) keys.push(key)
    if (keys.length) await cacheClient.del(keys)
    logger.info('Caches de tarefas invalidados', { count: keys.length })
  } catch (error) {
    logger.warn('Falha ao invalidar caches de tarefas', { error: error.message })
  }
}

export async function publishEvent(event) {
  if (!redisReady) return
  try {
    await publisher.publish('organiza:tasks', JSON.stringify(event))
    logger.info('Evento publicado via Redis Pub/Sub', { eventType: event.type, taskId: event.taskId })
  } catch (error) {
    logger.warn('Falha ao publicar evento', { error: error.message })
  }
}

export function redisStatus() {
  return redisReady ? 'up' : 'disabled-or-unavailable'
}

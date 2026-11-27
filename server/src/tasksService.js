import { z } from 'zod'
import { cacheGet, cacheInvalidateTasks, cacheSet, publishEvent } from './cache.js'
import * as repository from './tasksRepository.js'

const baseSchema = z.object({ title: z.string().trim().min(1, 'O título é obrigatório').max(160), description: z.string().trim().max(2000).default(''), area: z.enum(['daily', 'study']).default('daily'), category: z.string().trim().min(1).max(80).default('Geral'), priority: z.enum(['low', 'medium', 'high']).default('medium'), status: z.enum(['todo', 'doing', 'done']).default('todo'), due_date: z.string().trim().nullable().optional(), estimated_minutes: z.coerce.number().int().min(5).max(1440).default(30) })
const updateSchema = baseSchema.partial()
const listCacheKey = (userId, { status, area, search }) => `tasks:list:${userId}:${status || 'all'}:${area || 'all'}:${search || 'all'}`

export function validateTaskInput(input, partial = false) {
  const result = (partial ? updateSchema : baseSchema).safeParse(input)
  if (!result.success) { const error = new Error(result.error.issues.map((issue) => issue.message).join('; ')); error.statusCode = 400; error.code = 'VALIDATION_ERROR'; throw error }
  return result.data
}

export async function listTasks(userId, filters) {
  const key = listCacheKey(userId, filters)
  const cached = await cacheGet(key)
  if (cached) return { data: cached, source: 'cache' }
  const tasks = await repository.listTasks(userId, filters)
  await cacheSet(key, tasks)
  return { data: tasks, source: 'database' }
}

export async function getTask(userId, id) {
  const task = await repository.getTask(userId, id)
  if (!task) { const error = new Error('Tarefa não encontrada'); error.statusCode = 404; error.code = 'TASK_NOT_FOUND'; throw error }
  return task
}

export async function createTask(userId, input) { const task = await repository.createTask(userId, validateTaskInput(input)); await cacheInvalidateTasks(); await publishEvent({ type: 'task.created', taskId: task.id, userId, occurredAt: new Date().toISOString() }); return task }
export async function updateTask(userId, id, input) { const task = await repository.updateTask(userId, id, validateTaskInput(input, true)); if (!task) { const error = new Error('Tarefa não encontrada'); error.statusCode = 404; error.code = 'TASK_NOT_FOUND'; throw error }; await cacheInvalidateTasks(); await publishEvent({ type: 'task.updated', taskId: task.id, userId, occurredAt: new Date().toISOString() }); return task }
export async function deleteTask(userId, id) { const deleted = await repository.deleteTask(userId, id); if (!deleted) { const error = new Error('Tarefa não encontrada'); error.statusCode = 404; error.code = 'TASK_NOT_FOUND'; throw error }; await cacheInvalidateTasks(); await publishEvent({ type: 'task.deleted', taskId: id, userId, occurredAt: new Date().toISOString() }) }

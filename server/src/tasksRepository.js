import crypto from 'node:crypto'
import { getPool } from './db.js'

const memoryTasks = []
const selectFields = 'id, user_id, title, description, area, category, priority, status, due_date, estimated_minutes, created_at, updated_at'

export async function listTasks(userId, { status, area, search } = {}) {
  const pool = getPool()
  if (!pool) return memoryTasks.filter((task) => String(task.user_id) === String(userId)).filter((task) => !status || task.status === status).filter((task) => !area || task.area === area).filter((task) => !search || task.title.toLowerCase().includes(search.toLowerCase())).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
  const [rows] = await pool.query(`SELECT ${selectFields} FROM tasks WHERE user_id = ? AND (? IS NULL OR status = ?) AND (? IS NULL OR area = ?) AND (? IS NULL OR title LIKE CONCAT('%', ?, '%')) ORDER BY status = 'done', due_date IS NULL, due_date, updated_at DESC`, [userId, status || null, status || null, area || null, area || null, search || null, search || null])
  return rows
}

export async function getTask(userId, id) {
  const pool = getPool()
  if (!pool) return memoryTasks.find((task) => String(task.user_id) === String(userId) && task.id === id) ?? null
  const [rows] = await pool.query(`SELECT ${selectFields} FROM tasks WHERE user_id = ? AND id = ?`, [userId, id])
  return rows[0] ?? null
}

export async function createTask(userId, input) {
  const task = { id: crypto.randomUUID(), user_id: userId, ...input, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  const pool = getPool()
  if (!pool) { memoryTasks.unshift(task); return task }
  const [result] = await pool.query(`INSERT INTO tasks (id, user_id, title, description, area, category, priority, status, due_date, estimated_minutes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [task.id, userId, task.title, task.description, task.area, task.category, task.priority, task.status, task.due_date || null, task.estimated_minutes])
  return getTask(userId, task.id)
}

export async function updateTask(userId, id, input) {
  const current = await getTask(userId, id)
  if (!current) return null
  const task = { ...current, ...input, updated_at: new Date().toISOString() }
  const pool = getPool()
  if (!pool) { const index = memoryTasks.findIndex((item) => item.id === id && String(item.user_id) === String(userId)); memoryTasks[index] = task; return task }
  await pool.query(`UPDATE tasks SET title=?, description=?, area=?, category=?, priority=?, status=?, due_date=?, estimated_minutes=? WHERE id=? AND user_id=?`, [task.title, task.description, task.area, task.category, task.priority, task.status, task.due_date || null, task.estimated_minutes, id, userId])
  return getTask(userId, id)
}

export async function deleteTask(userId, id) {
  const pool = getPool()
  if (!pool) { const index = memoryTasks.findIndex((item) => item.id === id && String(item.user_id) === String(userId)); if (index === -1) return false; memoryTasks.splice(index, 1); return true }
  const [result] = await pool.query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, userId])
  return result.affectedRows > 0
}

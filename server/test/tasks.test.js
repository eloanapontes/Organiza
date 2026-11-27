import test from 'node:test'
import assert from 'node:assert/strict'
import { validateTaskInput } from '../src/tasksService.js'

test('valida uma tarefa válida e aplica defaults', () => {
  const task = validateTaskInput({ title: 'Estudar DDD' })
  assert.equal(task.title, 'Estudar DDD')
  assert.equal(task.area, 'daily')
  assert.equal(task.priority, 'medium')
  assert.equal(task.status, 'todo')
})

test('rejeita tarefa sem título', () => {
  assert.throws(() => validateTaskInput({ title: '' }), /título é obrigatório/i)
})

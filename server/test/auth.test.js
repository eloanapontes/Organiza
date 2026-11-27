import test from 'node:test'
import assert from 'node:assert/strict'
import { authSchemas } from '../src/auth.js'

test('aceita cadastro com nome, e-mail e senha válida', () => {
  const input = authSchemas.register.parse({ name: 'Ana Silva', email: 'ana@example.com', password: 'senha123' })
  assert.equal(input.email, 'ana@example.com')
})

test('rejeita senha curta no cadastro', () => {
  assert.throws(() => authSchemas.register.parse({ name: 'Ana Silva', email: 'ana@example.com', password: '123' }))
})

test('exige e-mail no login', () => {
  assert.throws(() => authSchemas.login.parse({ password: 'senha123' }))
})

# Estratégia de release

- `v0.1.0`: CRUD de tarefas, painel e API REST.
- `v0.2.0`: cadastro, login, logout, isolamento por usuário, MySQL, Redis, Nginx e Compose.
- `v0.3.0`: documentação arquitetural, CI/CD, observabilidade e runbook.
- `v1.0.0`: entrega final com evidências da rubrica, link do GitHub e link publicado.

Cada release deve ter tag Git, resumo das mudanças e smoke test. O pipeline bloqueia a publicação se build, testes, lint ou construção da imagem falharem. O deploy inicial é rolling simples; rollback aponta para a tag anterior.

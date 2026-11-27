# ADR 0005 — Autenticação própria com e-mail e senha

- **Status:** Aceito
- **Contexto:** Cada usuário precisa cadastrar uma conta, entrar, sair e enxergar somente sua própria rotina. O projeto usa MySQL e não depende de um provedor externo de identidade.
- **Decisão:** Implementar cadastro e login no backend, armazenar senha somente como hash bcrypt, emitir JWT em cookie HTTP-only e proteger `/api/tasks` com middleware de sessão.
- **Isolamento:** cada query de tarefa exige `user_id`; a tabela tem foreign key para `users` e exclusão em cascata.
- **Consequências positivas:** fluxo completo e demonstrável offline, conta própria para cada estudante e logout explícito.
- **Consequências negativas:** o projeto precisa cuidar de segredo JWT, expiração, recuperação de senha e proteção contra abuso em uma evolução.
- **Segurança:** em produção usar `JWT_SECRET` longo, HTTPS, cookie Secure/SameSite adequado, rate limiting, validação de e-mail e fluxo de recuperação de senha.

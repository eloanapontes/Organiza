# Arquitetura do Organiza

## Visão

O Organiza é uma solução web com frontend e backend separados, orquestrados por Docker Compose. O Nginx é a entrada única: encaminha `/api` para o backend Express e as demais rotas para o frontend React. O MySQL guarda usuários e tarefas; o Redis acelera consultas e distribui eventos.

## Estilos arquiteturais

- **Monólito modular no backend:** menor complexidade para o escopo atual, com limites internos para autenticação, tarefas e infraestrutura.
- **Frontend separado:** build React independente, entregue por seu próprio container Nginx.
- **REST:** contrato simples, testável e documentado em OpenAPI.
- **Ports and adapters leves:** services não conhecem detalhes de HTTP; repositório e cache encapsulam infraestrutura.
- **Event-driven pontual:** eventos de tarefa via Redis Pub/Sub sem transformar todo o CRUD em arquitetura distribuída.

## Containers

| Container | Responsabilidade | Tecnologia |
|---|---|---|
| Nginx gateway | Entrada HTTP, proxy reverso e cookies | Nginx Alpine |
| Frontend | Interface de login, cadastro e dashboard | React + Vite + Nginx |
| Backend | API, autenticação, regras de tarefas e logs | Node.js + Express |
| MySQL | Usuários, tarefas e relacionamento por `user_id` | MySQL 8.4 |
| Redis | Cache TTL e Redis Pub/Sub | Redis 7 |

## Fluxo de autenticação

O usuário cadastra nome, e-mail e senha. O backend valida os dados, gera um hash bcrypt e persiste em `users`. No login, compara a senha com o hash e cria o cookie HTTP-only `organiza_session` com JWT. `GET /api/auth/me` reidrata a sessão quando a página é recarregada. Logout limpa o cookie.

As rotas de tarefas passam pelo middleware `requireAuth`. O middleware resolve o usuário da sessão; o repositório inclui `user_id` em todas as consultas, updates e deletes. Assim, uma conta nunca lista ou modifica a rotina de outra.

## Bounded Contexts

1. **Identity & Access:** cadastro, login, logout, sessão e usuário atual.
2. **Task Management:** criar, consultar, atualizar, concluir e excluir tarefas do usuário.
3. **Planning View:** filtros, contadores e projeção da lista para a interface.
4. **Infrastructure:** MySQL, Redis, logs, configuração e health check.

## Fluxo de leitura

`GET /api/tasks` exige autenticação, monta a chave Redis com o `user_id` e filtros, tenta cache e, em cache miss, consulta MySQL. A resposta é gravada com TTL. Cache é descartável; MySQL é a fonte de verdade.

## Fluxo de escrita

A requisição passa por sessão, validação Zod, service e repositório. A persistência usa `user_id`; depois o service invalida as listas e publica `task.created`, `task.updated` ou `task.deleted` com usuário e tarefa.

## Deployment

A estratégia inicial é rolling simples em containers, com health check e rollback para a imagem anterior. Blue/green fica como evolução quando houver réplicas e tráfego real.

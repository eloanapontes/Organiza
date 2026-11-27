# TODO / Entregas do Organiza

## Produto funcional

- [x] Exibir painel com contadores, andamento, concluídas e progresso.
- [x] Cadastrar usuário com nome, e-mail e senha validada.
- [x] Fazer login, manter sessão em cookie HTTP-only e permitir logout.
- [x] Isolar a rotina por `user_id`, impedindo acesso cruzado entre contas.
- [x] Criar tarefa com título obrigatório, descrição, área, categoria, prioridade, prazo, status e estimativa.
- [x] Editar, excluir e avançar status de uma tarefa autenticada.
- [x] Filtrar por espaço, status, prazo de hoje e busca textual.
- [x] Interface responsiva para desktop e mobile.

## Arquitetura de Software

- [x] Diagramas C4 de Contexto e Containers.
- [x] ADRs para monólito modular, MySQL, Redis, deploy e autenticação.
- [x] Context Map, Bounded Contexts e inventário DDD.
- [x] OpenAPI com endpoints de auth e tarefas.
- [x] Quality Scenarios, SLOs/SLIs e plano de observabilidade.
- [x] Estratégias de timeout, retry, fallback e invalidação.
- [x] Pipeline CI/CD esqueleto, estratégia de deploy e runbook.

## Backend Avançado

- [x] MySQL com `users`, `tasks`, foreign key e isolamento por usuário.
- [x] Cache-aside com Redis, TTL e invalidação após escrita.
- [x] Redis Pub/Sub com eventos `task.created`, `task.updated` e `task.deleted`.
- [x] Docker Compose com frontend, backend, MySQL, Redis e Nginx.
- [x] Separação de rotas, services, repositório, DTO/validação, auth middleware e erros.
- [x] Logs estruturados de requests, autenticação, cache, eventos e falhas.

## Tech Forge

- [x] Análise Cynefin e escolha de abordagem híbrida com Kanban/Scrum leve.
- [x] Product Backlog priorizado com User Stories e critérios de aceite.
- [x] Estratégia de versões incrementais e papéis sugeridos.
- [ ] Criar issues reais no Jira e registrar evidências.
- [ ] Preencher nome, GitHub e site no documento de entrega.

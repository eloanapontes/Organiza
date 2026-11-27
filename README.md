# Organiza

Aplicativo para organizar tarefas do dia a dia e estudos. Cada pessoa possui uma conta própria: cadastro, login e logout são feitos pela API, as senhas são armazenadas com hash bcrypt e cada tarefa pertence ao usuário autenticado.

## Arquitetura executável

O Docker Compose sobe cinco serviços separados: `frontend` (React compilado), `backend` (Node.js/Express), `mysql` (MySQL 8.4), `redis` (cache e Pub/Sub) e `nginx` (proxy reverso). O frontend e o backend também permanecem separados nos diretórios `client/` e `server/`.

## Rodando com Docker

Pré-requisitos: Docker Desktop (ou Docker Engine + Compose) e Git.

```bash
git clone <url-do-seu-repositorio>
cd organiza
docker compose up --build
```

Acesse **http://localhost:8080**. O cadastro fica disponível na própria tela inicial. O health check fica em `http://localhost:8080/health`.

Para acompanhar logs:

```bash
docker compose logs -f backend
docker compose logs -f mysql
docker compose logs -f redis
```

Para verificar os containers:

```bash
docker compose ps
```

Para parar os containers sem apagar dados:

```bash
docker compose down
```

Para apagar também os dados de usuários e tarefas:

```bash
docker compose down -v
```

Atenção: `down -v` remove o volume `mysql_data` e apaga os dados cadastrados.

## Rodando frontend e backend separados no desenvolvimento

Terminal 1, backend:

```bash
npm install
npm run dev --workspace server
```

Terminal 2, frontend:

```bash
npm run dev --workspace client
```

O backend roda em `http://localhost:3000` e o frontend em `http://localhost:5173`. O Vite encaminha `/api` para a API. Para esse modo, MySQL e Redis precisam estar rodando localmente ou pelo Docker.

## Banco de dados e autenticação

O MySQL cria automaticamente as tabelas `users` e `tasks` na primeira inicialização. `users` guarda nome, e-mail e `password_hash`; `tasks` possui `user_id` com chave estrangeira e `ON DELETE CASCADE`. A API usa um cookie HTTP-only chamado `organiza_session`, assinado com JWT. As rotas de tarefas exigem sessão e filtram sempre por `user_id`.

As rotas principais são `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout` e as rotas CRUD de `tasks`. O Redis continua obrigatório para a rubrica: cache-aside com TTL, invalidação depois de escritas e Redis Pub/Sub para eventos.

## Entregáveis da rubrica

- `docs/architecture.md`: visão arquitetural, containers, autenticação e DDD.
- `docs/diagrams/`: diagramas C4.
- `docs/adr/`: decisões sobre monólito, MySQL, Redis, deploy e autenticação.
- `docs/quality-scenarios.md`, `docs/observability.md` e `docs/resilience.md`: qualidade, SLOs/SLIs e resiliência.
- `docs/context-map.md`: Context Map, Bounded Contexts e elementos DDD.
- `docs/backlog.md`, `docs/cynefin.md` e `docs/runbook.md`: gestão ágil, Cynefin e operação.
- `openapi.yaml`: contrato OpenAPI/Swagger, incluindo autenticação.
- `.github/workflows/ci.yml`: pipeline CI/CD esqueleto.

## Comandos de qualidade

```bash
npm run build
npm test
npm run lint --workspace client
```

## Variáveis importantes

Copie `.env.example` para `.env` no desenvolvimento sem Docker. Em produção, troque `JWT_SECRET` por uma chave longa e aleatória e não coloque credenciais reais no Git.

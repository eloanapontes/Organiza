# Context Map e DDD

## Domínio e subdomínios

- **Domínio principal:** organização pessoal — transformar intenções em tarefas executáveis.
- **Subdomínio de suporte:** planejamento e acompanhamento — filtros, contadores e progresso.
- **Subdomínio de identidade:** cadastro, login, sessão e isolamento da rotina.
- **Subdomínio genérico:** persistência, cache, mensageria e observabilidade.

## Bounded Contexts

### Identity & Access

É o contexto dono da conta e da sessão. Expõe cadastro, login, logout e usuário atual. Guarda `User` no MySQL e emite uma sessão HTTP-only para a aplicação.

### Task Management (core)

É o contexto dono do ciclo de vida de uma tarefa. Cada `Task` pertence a exatamente um usuário por `user_id`. Expõe comandos de criação, edição, mudança de status e exclusão.

### Planning View (supporting)

Projeta a visão de lista para o usuário: filtro por área, status, prazo e texto, além de indicadores agregados. Só recebe tarefas já autorizadas pelo Task Management.

### Platform (generic)

Fornece MySQL, Redis, logs, configurações e health check. Não decide regras de negócio.

## Relações

`Planning View` é cliente do `Task Management` por uma API interna estável. `Task Management` depende de `Identity & Access` para obter o usuário autenticado, mas não acessa senha. `Platform` é um serviço compartilhado técnico. Eventos `task.created`, `task.updated` e `task.deleted` funcionam como linguagem publicada para futuras integrações.

## Entidades, Value Objects e Aggregates

### Aggregate `User`

- **Entity:** `User`, identificada por `id`.
- **Value Objects:** `UserName`, `Email`, `PasswordHash`.
- **Invariantes:** e-mail único; senha nunca é persistida em texto puro.

### Aggregate `Task`

- **Entity:** `Task`, identificada por `id` e vinculada ao `User`.
- **Value Objects:** `TaskTitle`, `TaskArea`, `Priority`, `TaskStatus`, `DueDate`, `EstimatedMinutes`.
- **Invariantes:** título não vazio; enums válidos; estimativa entre 5 e 1440 minutos; comandos sempre verificam o `user_id`.

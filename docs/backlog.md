# Product Backlog

| ID | Prioridade | User Story | Critérios de aceite |
|---|---:|---|---|
| US-01 | P0 | Como pessoa visitante, quero criar uma conta para ter minha própria rotina. | Nome, e-mail e senha são validados; senha é armazenada com bcrypt; e-mail duplicado retorna erro. |
| US-02 | P0 | Como pessoa cadastrada, quero entrar e sair da minha conta. | Login cria cookie HTTP-only; `/me` reidrata a sessão; logout limpa o cookie. |
| US-03 | P0 | Como pessoa usuária, quero criar uma tarefa para registrar um próximo passo. | Título obrigatório; tarefa recebe `user_id`; API retorna 201. |
| US-04 | P0 | Como pessoa usuária, quero ver minhas tarefas em uma lista. | Lista nunca retorna tarefas de outro usuário; contadores refletem apenas minha rotina. |
| US-05 | P0 | Como pessoa usuária, quero editar, concluir e excluir tarefas. | Operações verificam sessão e `user_id`; exclusão exige confirmação. |
| US-06 | P1 | Como pessoa usuária, quero filtrar por espaço, status, prazo e texto. | Filtros Dia a dia, Estudos, Para hoje, Em andamento e busca funcionam combinados. |
| US-07 | P1 | Como equipe, queremos reduzir consultas repetidas ao MySQL. | GET usa cache-aside Redis, TTL e invalidação após escrita. |
| US-08 | P1 | Como equipe, queremos rastrear mudanças de tarefas. | Eventos created/updated/deleted são publicados e logs mostram Pub/Sub. |
| US-09 | P1 | Como avaliador, quero executar tudo com um comando. | Compose inicia frontend, backend, MySQL, Redis e Nginx; localhost:8080 responde. |
| US-10 | P1 | Como equipe, queremos uma entrega confiável. | CI executa install, build, test, lint e build de imagem. |
| US-11 | P1 | Como equipe, queremos explicar as decisões. | C4, Context Map, DDD, ADRs, SLO/SLI, resiliência, runbook e Cynefin estão versionados. |

## Jira

Criar uma issue por história, adicionar labels `frontend`, `backend`, `infra` ou `docs`, atribuir responsável e movimentar por `Backlog → Em andamento → Em revisão → Concluído`. Bugs devem referenciar a User Story afetada e incluir evidência de reprodução.

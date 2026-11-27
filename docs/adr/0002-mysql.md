# ADR 0002 — MySQL como fonte de verdade

- **Status:** Aceito
- **Contexto:** A equipe já utiliza MySQL, e o produto precisa de usuários, tarefas, filtros, status, prazo e relação segura entre conta e rotina.
- **Decisão:** Usar MySQL 8.4 como banco relacional principal, com tabelas `users` e `tasks`, chave estrangeira `tasks.user_id` e acesso pelo driver `mysql2`.
- **Motivos:** familiaridade da equipe, integridade referencial, constraints, índices por usuário/status/prazo, transações e operação simples via Docker.
- **Consequências positivas:** menor curva de aprendizado, dados persistentes e isolamento natural por `user_id`.
- **Consequências negativas:** exige volume e configuração de credenciais; em produção deve receber migrations versionadas e backup.
- **Alternativas rejeitadas:** PostgreSQL porque não é a tecnologia dominada pela equipe; SQLite porque não representa tão bem o cenário multi-container com múltiplas sessões.

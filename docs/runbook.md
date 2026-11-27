# Runbook de Incidentes

## Aplicação não abre

1. Verificar `docker compose ps`.
2. Ver logs: `docker compose logs --tail=100 backend frontend nginx`.
3. Testar `curl http://localhost:8080/health`.
4. Se o serviço estiver parado, executar `docker compose up -d backend frontend`.
5. Se a imagem estiver desatualizada, executar `docker compose up --build -d`.

## MySQL indisponível

1. Verificar `docker compose logs mysql` e `docker compose ps mysql`.
2. Testar health com `docker compose exec mysql mysqladmin ping -h localhost -u root -proot-organiza`.
3. Reiniciar somente o banco: `docker compose restart mysql`.
4. Não usar `docker compose down -v` sem autorização: esse comando apaga usuários e tarefas.

## Redis indisponível

A aplicação deve continuar respondendo usando MySQL, registrando `Redis indisponível`. Reiniciar com `docker compose restart redis`; confirmar `Redis conectado` no log e repetir uma leitura para observar `Cache miss` seguido de `Cache hit`.

## Usuário não consegue entrar

Verificar se o backend está alcançando MySQL, se o e-mail está normalizado e se o cookie `organiza_session` está sendo enviado. Em HTTPS publicado, conferir Secure/SameSite; localmente, o Compose usa HTTP e SameSite=Lax.

## Rollback

1. Identificar a tag anterior saudável.
2. Atualizar a tag da imagem no ambiente de publicação.
3. Executar smoke test em `/health`, cadastro, login e `GET /api/tasks`.
4. Registrar causa, horário, impacto e ação no Jira.

## Comandos úteis

```bash
docker compose ps
docker compose logs -f backend
docker compose exec redis redis-cli ping
docker compose exec mysql mysql -uorganiza -porganiza -Dorganiza -e 'SHOW TABLES;'
```

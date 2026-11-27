# Resiliência

- **Timeout:** Nginx limita requests HTTP; o pool MySQL usa limite de conexões. A evolução deve configurar timeout explícito por query.
- **Retry:** repetir apenas conexão inicial ou leitura idempotente; nunca repetir cadastro ou POST automaticamente sem idempotency key.
- **Circuit breaker:** recomendado para Redis quando externalizado; a API não propaga falha de cache ao usuário.
- **Cache-aside:** Redis é descartável; MySQL é fonte de verdade. TTL de 30 segundos limita obsolescência.
- **Invalidação:** create/update/delete removem todas as listas de tarefas cacheadas, preservando consistência por usuário.
- **Degradação graciosa:** sem Redis, a API segue com MySQL; sem MySQL no ambiente de demonstração, fallback em memória permite validar o fluxo e registra o motivo.
- **Sessão:** JWT tem expiração de 7 dias; cookie é HTTP-only e, quando a requisição chega por HTTPS, usa Secure e SameSite=None para suportar Preview embutido.
- **Health check:** `/health` informa API, MySQL e Redis sem exigir autenticação.
- **Rollback:** manter imagem anterior e reverter a tag se smoke checks falharem.

# SLOs, SLIs e Observabilidade

## SLOs

- **Disponibilidade da API:** 99,0% mensal, medida por `GET /health` retornando 2xx.
- **Latência:** 95% dos `GET /api/tasks` abaixo de 300 ms com cache e abaixo de 800 ms em cache miss.
- **Erros:** menos de 1% de respostas 5xx em janela de 15 minutos.
- **Mensageria:** 99% das escritas publicam um evento ou registram fallback explícito.

## SLIs

- Disponibilidade: `successful_health_checks / total_health_checks`.
- Latência: histograma de `durationMs` emitido no log HTTP.
- Erro: contagem de status 5xx por endpoint.
- Cache: proporção de linhas com `Cache hit` sobre `Cache hit + Cache miss`.
- Pub/Sub: eventos publicados e recebidos por tipo.

## Logs

Todos os logs são JSON com `timestamp`, `service`, `level`, `message` e contexto. Consultar `docker compose logs -f app`. Em produção, enviar stdout para um agregador; não gravar dados sensíveis ou descrições privadas completas.

## Alertas

1. `health` fora do ar por 2 minutos: alerta crítico.
2. 5xx acima de 1% por 15 minutos: alerta alto.
3. p95 acima do SLO por 10 minutos: alerta médio.
4. Redis indisponível por 5 minutos: alerta de degradação.

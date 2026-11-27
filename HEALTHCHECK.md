# Health check

A aplicação responde `GET /health` com `200` quando o processo HTTP está ativo. A resposta inclui o estado observado do PostgreSQL e Redis, por exemplo:

```json
{"status":"ok","service":"organiza-api","dependencies":{"database":"up","redis":"up"}}
```

O endpoint não exige autenticação e é usado pelo Nginx e por smoke tests de deploy.

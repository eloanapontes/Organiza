# ADR 0004 — Deploy rolling simples com rollback

- **Status:** Aceito
- **Contexto:** O escopo pede estratégia de deploy e rollback, mas ainda não há múltiplas réplicas ou tráfego real.
- **Decisão:** usar imagem versionada, health check `/health`, publicação rolling simples e rollback para a tag anterior.
- **Evolução:** quando houver réplicas e necessidade de zero downtime controlado, adotar blue/green.

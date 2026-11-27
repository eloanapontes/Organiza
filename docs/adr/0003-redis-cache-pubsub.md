# ADR 0003 — Redis para cache e Pub/Sub

- **Status:** Aceito
- **Contexto:** A rubrica exige cache distribuído, TTL, invalidação e mensageria; a lista de tarefas por usuário é leitura frequente.
- **Decisão:** Implementar cache-aside com TTL de 30 segundos e publicar eventos no canal `organiza:tasks`.
- **Consequências positivas:** reduz leituras repetidas do MySQL e demonstra integração assíncrona sem introduzir outro broker.
- **Consequências negativas:** Pub/Sub não é fila durável; eventos perdidos não podem ser tratados como fonte de verdade. MySQL continua sendo a autoridade.
- **Segurança:** Redis fica na rede privada do Compose, sem exposição pública. As chaves incluem `user_id` para não misturar rotinas.

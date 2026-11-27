# ADR 0001 — Monólito modular

- **Status:** Aceito
- **Contexto:** O produto é uma primeira versão acadêmica, com uma equipe pequena e domínios ainda próximos.
- **Decisão:** Entregar um único deploy com módulos internos bem definidos para tarefas, planejamento e infraestrutura.
- **Consequências positivas:** menor custo operacional, debug simples, Compose reproduzível e entrega rápida.
- **Consequências negativas:** falha no processo pode afetar mais de um módulo; extração futura exigirá contratos explícitos.
- **Revisitar quando:** módulos tiverem escalas, equipes ou requisitos de disponibilidade diferentes.

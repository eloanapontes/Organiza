# Plano do Organiza

## Objetivo

Entregar um aplicativo web para organizar tarefas pessoais e de estudos, com experiência simples e demonstração acadêmica completa. A primeira versão cobre criação, edição, exclusão, filtros, busca, prazo, prioridade, status, categoria e estimativa de tempo.

## Decisões de implementação

- **Arquitetura:** monólito modular, com módulos de tarefas, infraestrutura e observabilidade. É a menor complexidade que atende ao escopo e deixa limites explícitos para futura extração.
- **Stack:** React/Vite no frontend; Node.js/Express no backend; PostgreSQL como fonte durável; Redis para cache-aside e Pub/Sub; Nginx como proxy reverso.
- **Contrato:** REST com OpenAPI em `openapi.yaml`.
- **Execução:** Docker Compose local com quatro containers: `app`, `postgres`, `redis` e `nginx`.

## Estrutura

- `client/`: interface React, componentes da tela principal, formulário e estilos responsivos.
- `server/src/`: API, controllers/rotas, service de domínio, repositório, PostgreSQL, Redis e logs.
- `docs/`: arquitetura, DDD, C4, ADRs, qualidade, operação e gestão.
- `nginx/`, `Dockerfile`, `docker-compose.yml`: infraestrutura reproduzível.

## Direção visual

Foram consideradas três opções: **Quiet Productivity** (0,06), **Editorial Focus** (0,07) e **Soft Utility** (0,04). A escolha é Quiet Productivity.

- **Movimento:** minimalismo editorial com calor humano, inspirado em papel, cadernos e ferramentas de foco.
- **Princípios:** baixa fricção, hierarquia clara, progresso visível e detalhes com propósito.
- **Cores:** papel quente para reduzir dureza visual; verde sálvia para progresso; coral para ação; tinta escura para contraste.
- **Layout:** navegação lateral persistente, cabeçalho leve e conteúdo em fluxo vertical, evitando um dashboard excessivamente fragmentado.
- **Assinaturas:** marca com canto orgânico, indicadores de prioridade em pílulas e frase de foco em painel escuro.
- **Interação:** criar tarefa exige poucos campos; status avança em um clique; filtros sempre ficam próximos da lista.
- **Animação:** transições curtas de 180–300ms, sem movimento decorativo que distraia.
- **Tipografia:** Syne para títulos, DM Sans para leitura e DM Mono para metadados.
- **Essência:** “um espaço calmo para transformar intenção em próximo passo”; claro, leve, encorajador.
- **Voz:** direta e humana. Exemplos: “Seu dia, no lugar.” e “Um passo de cada vez. Você está indo bem.”
- **Marca:** wordmark em minúsculas com ponto coral e símbolo de brilho em bloco de tinta.
- **Cor proprietária:** verde sálvia `#A8D5B6`.

## Entregas

A implementação preserva critérios de aceite em `TODO.md`, e a evidência arquitetural fica em `docs/` e `openapi.yaml`.

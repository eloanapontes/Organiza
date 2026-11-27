# Quality Scenarios

| Cenário | Estímulo | Resposta esperada | Medição |
|---|---|---|---|
| Cadastro | Pessoa envia nome, e-mail e senha válidos | MySQL cria usuário com hash bcrypt e sessão é criada | 201; nenhum password_hash em resposta/log |
| Login | Pessoa envia credenciais válidas | Cookie HTTP-only é emitido e `/api/auth/me` retorna a conta | 200; sessão válida por até 7 dias |
| Isolamento | Usuário A consulta ou altera uma tarefa de B | Repositório filtra por `user_id` e retorna 404/ausência | 100% das queries de tarefa incluem usuário |
| Consulta frequente | Usuário abre a própria lista repetidamente | Resposta vem do Redis quando a chave individual está válida | p95 abaixo de 300 ms; log `Cache hit` |
| Primeiro acesso | Chave do usuário não existe ou TTL expirou | API consulta MySQL, grava cache e responde | p95 abaixo de 800 ms; log `Cache miss` |
| Dependência Redis fora | Redis não responde | API segue com MySQL e registra warning | Disponibilidade funcional ≥ 99% |
| Criação de tarefa | POST autenticado e válido chega à API | Tarefa com `user_id` é persistida, cache invalidado e evento publicado | 201 em até 800 ms |
| Erro de entrada | Título ausente ou enum inválido | API retorna 400 sem gravar dados | 100% das entradas inválidas rejeitadas |

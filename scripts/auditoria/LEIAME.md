# Scripts da auditoria de 26/11/2026

Reproduzem as varreduras do relatório `Relatórios Atualizações/2026-11-26-auditoria-agente-dev.md`. Os caminhos de saída são `/tmp/claude-0/auditoria/...` e os de entrada `/home/user/vacutainer/...`: ajuste no topo de cada arquivo.

| Script | O que faz |
|---|---|
| `extrair.mjs` | extrai os blocos `data-vac-source` de `Plataforma.html` e lista tamanhos |
| `scripts.mjs` | tira o `<script>` de cada bloco `motor/*` para o ESLint |
| `eslint.cfg.mjs` | regras usadas (`no-undef`, `no-unused-vars`, duplicidades etc.) |
| `estrutura.mjs` | globais por bloco, nomes repetidos entre blocos, funções grandes, `catch` vazios |
| `seg2.mjs` | texto livre interpolado sem `esc()` dentro de `innerHTML`/`insertAdjacentHTML` (AST) |
| `base.cjs` | abre a Produção em demonstração (Playwright) |
| `fuzz.cjs` | testes de propriedade do motor de cálculo (zero, nulo, extremos, meia-noite, hora extra) |
| `casos.cjs` | os casos extremos isolados, com as mensagens do motor |
| `export.cjs` | tela × tabelas do Excel (produção, meta, paradas, OEE) |
| `perf.cjs`, `telas.cjs` | tempo de abertura, nós de DOM, capturas e rolagem horizontal |

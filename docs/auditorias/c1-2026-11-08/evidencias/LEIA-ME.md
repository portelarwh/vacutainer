# Evidências da C1 (08/11/2026)

Todos os dados são fictícios. A pasta é simulada no navegador (OPFS) e servida por HTTP local; nenhuma base real foi usada.

| Arquivo | O que é |
|---|---|
| `tpendencias-main-6347559.txt` | Saída de `testes/tpendencias.js` sobre a `main` antes da C1: **37 falhas** |
| `tpendencias-c1.txt` | A mesma suíte com a C1: **sem erros** (43 checagens) |
| `repro-contra-analise.js` | Script da contra-análise, independente dos scripts do Codex, que reproduz os AT-01 a AT-12 em `8cad6a6`. Uso: `node repro-contra-analise.js <cópia de 8cad6a6>` (git worktree) |
| `repro-contra-analise.json` | Resultado do script sobre `8cad6a6`: os 12 achados reproduzidos ou confirmados no código |

**Como repetir o "antes":**
1. `git worktree add <pasta> 6347559`
2. Copiar `testes/tpendencias.js` para `<pasta>/testes/`.
3. Dentro de `<pasta>`, rodar `node testes/tpendencias.js`.

O teste sabe rodar sobre o código anterior: o que não existe lá conta como falha, em vez de interromper o teste.

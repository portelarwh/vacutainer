# Evidências da estabilização NV-01–NV-05

Base: `81ea71bb82cc62f08360684c7ce1a5df54697202`. Branch de entrega: [`codex/correcoes-nv-01-05`](https://github.com/portelarwh/vacutainer/tree/codex/correcoes-nv-01-05). Publicação do código autorizada explicitamente pelo responsável em 09/11/2026. A entrega contém o commit de implementação, documentação e evidências. Não inclui PR nem merge.

Leia [o relatório da implementação](../../estabilizacao-nv-01-05.md) e [o pedido de contra-análise](CONTRA-ANALISE.md).

## Resultado consolidado

- 32 suítes previstas; **30 aprovadas**, uma parcial, uma não executada e nenhuma falha restante após as repetições.
- `testes/tnv.js`: **18 cenários aprovados** na versão final, incluindo as três páginas com operações, Portal/Waste e os caminhos de recuperação.
- 745 linhas explícitas de `ok` nos logs selecionados. Isso não equivale ao número de casos independentes nem elimina as limitações dos testes antigos que só imprimem resultados.
- `trelatorios`: Excel do Paradas não verificado nos dois temas, pela ausência da SheetJS local; `tmeta` não executado pela ausência do pacote npm `xlsx`.
- `tz`: passou na segunda tentativa, conforme a instabilidade conhecida.
- Três builds sem diferenças em cópia isolada. Guia regenerado com 11 capturas.

`evidencias/resultados-consolidados.json` identifica o log selecionado e a execução de origem de cada suíte. A primeira rodada completa teve quatro suítes com falhas; os logs `*-primeira-rodada.log` conservam esse resultado. As expectativas de formato da reserva e de versões foram atualizadas. A verificação de URLs foi ampliada para o novo helper, mantendo a conferência dinâmica de liberação. As repetições correspondentes passaram. O resultado final é uma consolidação, não uma declaração de primeira rodada integral sem falhas.

## Como repetir

Em cópia da branch, com Playwright e Chromium instalados:

```sh
node testes/tnv.js
node testes/tudo.js
python fontes/kit/aplicar_kit21.py
python fontes/producao/build.py
python fontes/modelo/gerar_paginas.py
git diff --exit-code
```

Os builds devem ser executados sobre a árvore final limpa. Em uma árvore ainda sem commit, compare o conteúdo dos arquivos imediatamente antes/depois; os diffs de implementação em relação à main são esperados.

Nesta execução foi usado um adaptador externo para `/usr/bin/chromium` e para servir por HTTP local os mesmos arquivos que os testes abrem por `file://`. Esse adaptador foi necessário pelo bloqueio de `file://` no executor Linux e não integra a aplicação. Testes que já usam HTTP mantiveram seu próprio servidor.

Todos os dados são fictícios, usando armazenamento privado do navegador/OPFS. O teste de origem por handle força o caminho de persistência do handle e verifica `isSameEntry` após reabrir a aba. Isso não substitui homologar um compartilhamento físico Windows/SMB, o seletor de pasta corporativo e duas estações. Nenhuma base da fábrica foi acessada ou alterada.

As cópias de logs versionadas têm espaços ao final das linhas removidos; o conteúdo e os resultados foram preservados. As saídas originais permaneceram na pasta local de execução.

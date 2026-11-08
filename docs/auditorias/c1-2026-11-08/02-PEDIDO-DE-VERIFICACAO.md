# Pedido de verificação da C1 (para o próximo agente)

> Trabalhe no repositório portelarwh/vacutainer, na branch `claude/bold-feynman-7c69j0`, commit da C1 `11ba650` (sobre a `main` `6347559`). Informe o SHA examinado.
>
> **Nesta etapa, apenas verifique.** Não altere HTMLs, fontes, bases ou documentos, não faça commits nem abra PR. Reproduções só em cópia isolada (git worktree) e com dados fictícios.
>
> **Leia antes:**
> - `CLAUDE.md` (regras 1–10 e a regra 5 ampliada pela C1);
> - `docs/auditorias/registro-decisoes.md` § V;
> - `docs/auditorias/c1-2026-11-08/00-RELATORIO-C1.md`;
> - `01-CONTRA-ANALISE-8cad6a6.md`;
> - a revisão original em `docs/auditorias/revisao-main-8cad6a6/`.
>
> **Objetivo:** confirmar ou refutar que a C1 corrige **AT-01, AT-02, AT-03 e AT-11** e o **R-01 (24 h)** sem quebrar o que já funcionava. Não aceite o relatório automaticamente.
>
> **1. Diff e regras da plataforma.** Confira o diff `6347559..11ba650`.
> - As mudanças estão só em:
>   - `fontes/kit/kit_bases.js` (`vacFila`, `vacFormatoBase`, `vacLinkSeguro`, `vacGuardaAba`);
>   - o `Store` de Iniciativas, Equipamentos e Paradas;
>   - a fila do cadastro e o `commit` do Portal;
>   - o `commit` do Waste;
>   - o `fsPendSave` e a carga das pendências do Gel;
>   - versões, documentação e testes.
> - Os HTMLs gerados batem com as fontes: rode `python fontes/kit/aplicar_kit21.py`, `python fontes/producao/build.py` e `python fontes/modelo/gerar_paginas.py` e confira `git diff` vazio.
> - Nenhuma regra 1–10 foi quebrada: cada página grava só a própria base; `exports` e formato das bases sem mudança (`schemaVersion` 1, campos aditivos); códigos como texto; vigências intocadas; build da Produção só pela regra de versão.
>
> **2. Eficácia.**
> - Rode `node testes/tpendencias.js` na C1 (esperado: sem erros, 43 ok).
> - Rode o mesmo arquivo numa worktree de `6347559` (esperado: 37 falhas). Confira que as checagens que passam nas duas versões são só as de regressão.
> - Rode também o script independente `docs/auditorias/c1-2026-11-08/evidencias/repro-contra-analise.js` contra uma worktree da C1. Os cenários AT-01 (3 páginas), AT-02, AT-03 e AT-11 (2 páginas) devem passar a "NÃO REPRODUZ"; os demais (AT-04 a AT-10 e AT-12) continuam reproduzindo, porque são das etapas C2–C6.
>
> **3. Tente quebrar a C1** (cenários fora do teste, com dados fictícios):
> - **Fila durável:**
>   - 4 abas da mesma página, fechadas aleatoriamente e reabertas várias vezes: nenhuma alteração some ou duplica;
>   - aba que trava (sem `pagehide`) e outra que abre antes e depois dos 20 s;
>   - duas abas novas abrindo no mesmo instante com alterações órfãs (adoção com pausa de 400 ms): alguma alteração é gravada duas vezes? (Portal, cadastro, e Gel não são idempotentes);
>   - aba de versão anterior aberta junto da nova (fila antiga em `localStorage`, importação).
> - **IndexedDB:** bloqueado ou cheio; o aviso "alterações não protegidas" e a reserva funcionam e nada se perde ao reabrir.
> - **Trava da 2ª aba (Portal e Waste):**
>   - a recusa nunca deixa aparecer "gravado";
>   - não fica travada para sempre depois que a 1ª grava ou fecha;
>   - não trava no modo de teste;
>   - nenhum fluxo do Portal ou do Waste quebra por receber o erro `VacAbaBloqueada`: Cadastros, Reunião diária, notas de relatório, Configuração › Módulos, importação KKBC, comentários e ações do Waste.
> - **Base que some:**
>   - pasta trocada com o mesmo nome;
>   - pasta diferente;
>   - base renomeada e depois devolvida;
>   - "Recriar a base" com outra estação gravando em seguida;
>   - "Gravar de novo" com a base sumida.
> - **Formato:** base com `schemaVersion` "1" (texto), `schemaVersion` ausente e `schema` presente, e o inverso; arquivo com JSON válido que não é objeto.
> - **Links:**
>   - `javascript:` com espaços, tabulação e maiúsculas;
>   - `data:`, `blob:`, `//servidor`, `../`;
>   - caminho de rede com espaço;
>   - página irmã com acento;
>   - evidência antiga.
>   Nada executa, e os links legítimos (https, intranet http, `file:`, `\\servidor`) continuam abrindo.
> - **R-01:**
>   - após restaurar um backup de propósito, o que volta a ser gravado está dentro das 24 h e a página avisa;
>   - a auditoria do Paradas passou a ter `id` (campo aditivo) e as leituras antigas não quebram.
>
> **4. Suíte.** Rode as 27 suítes: `tpendencias`, `tfila`, `tequip`, `tplanner`, `tficha`, `tordens`, `tvigencias`, `tnumeros`, `tcontratos`, `tbases`, `tdiag`, `tintegra`, `tpg`, `tseguranca`, `trelatorios`, `tconstrucao`, `tvisual`, `t18`, `t18c`, `t18d`, `t18e`, `tc`, `tdin`, `tg`, `tk`, `tq`, `tr`, `ts1` e `tz`. O `tz` é instável e já está registrado no CLAUDE.md: se falhar, rode de novo uma vez e informe.
>
> **Entregue em Markdown:**
> - para cada item (AT-01, AT-02, AT-03, AT-11, R-01): **corrigido / corrigido em parte / não corrigido**, com arquivo, função e linha, e a reprodução;
> - regressões encontradas;
> - riscos novos introduzidos pela C1 (inclusive limites declarados no relatório que você considere inaceitáveis);
> - se a C1 está pronta para a homologação na pasta real (etapa H).
>
> Depois, **pare e aguarde a aprovação**.

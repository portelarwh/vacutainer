# C1 · Proteção das alterações e da base · relatório

**Data:** 08/11/2026.
**Base:** `main` em `6347559` (= `8cad6a6`, o merge do PR #16, mais os documentos da revisão do Codex).
**Pedido do responsável:** "C1, sua recomendação. Faça as devidas correções, completas, e verifique a eficácia."

A recomendação está em `01-CONTRA-ANALISE-8cad6a6.md`, a contra-análise da revisão do Codex em `docs/auditorias/revisao-main-8cad6a6/`. Na decisão sobre a 2ª aba do Portal e do Waste, o responsável aceitou a recomendação: **bloquear sem descartar**.

## 1. O que a C1 corrige

| ID | Defeito (reproduzido em `8cad6a6`) | Onde ficou a correção |
|---|---|---|
| **AT-01** | Duas abas da mesma página: a fila de alterações pendentes de uma apagava a da outra (a fila era um valor único no navegador). Reproduzido em Iniciativas, Equipamentos e Paradas. Pelo código, a fila do cadastro do Portal e a do Gel tinham a mesma forma | **Fila durável no kit** (`vacFila`, em `kit_bases.js`): um registro por alteração no IndexedDB `vac-fila`, com a aba dona. Cada aba grava e apaga só as dela. As de uma aba fechada são adotadas na abertura seguinte, com conferência depois de uma pausa. Vale para Iniciativas, Equipamentos, Paradas, a fila do cadastro do Portal e as alterações pendentes do Gel. A fila antiga é importada uma vez e a original fica guardada (`*.fila.antiga`, `cadFila.antiga`, `fsPending.antiga`). Se o IndexedDB falhar, a página mostra **"alterações não protegidas"** e guarda uma reserva |
| **AT-01** (Portal e Waste) | As duas páginas guardam a **base inteira** pendente. Duas abas com pendência se sobrescreveriam | **Trava da 2ª aba** (`vacGuardaAba`): se outra aba da mesma página tem alteração não gravada na pasta, esta aba não altera e avisa. Nada é descartado. A recusa interrompe quem chamou, então nenhum "gravado" aparece depois dela |
| **AT-02** | A base já conhecida some da pasta → "Gravar" criava uma base **vazia** (rev 1). Reproduzido em Iniciativas e Paradas. Iniciativas, Equipamentos e Paradas também criavam a base em qualquer pasta, sem perguntar | **Ao conectar** uma pasta sem a base, a página pergunta, como o Portal; "não" não conecta nem cria. **Base que existiu nesta pasta e sumiu:** zero gravações, aviso "base sumiu da pasta" e dois botões, **"Recriar a base"** (com a cópia deste navegador: registros, histórico e alterações pendentes; a rev continua) e **"Escolher outra pasta"**. A última base lida fica marcada por pasta (`*.base.conhecida`). Vale para Iniciativas, Equipamentos e Paradas |
| **AT-03** | Uma base com `schema` de outra página ou `schemaVersion` futura recebia gravação | `vacFormatoBase(base, schema, versãoMáx)` no `ler()` (Iniciativas, Equipamentos) e no `findBase()` (Paradas): **só leitura**, com o motivo. Base antiga sem `schema`/`schemaVersion` continua aceita como versão 1 |
| **AT-11** | O link de origem com `javascript:` era executado ao clicar ("reconsultar", "ver na origem", "abrir na origem"). Reproduzido em Iniciativas e Equipamentos. O script rodaria com a permissão de gravação na pasta | `vacLinkSeguro(url)` aceita só `http(s):`, `file:`, `\\servidor\…`, página da própria pasta (`Nome.html#…`) e `#…`. É aplicado **ao receber** (`#nova=`, `#novaOS=`: o link é descartado, com aviso) e **ao mostrar** (origem e evidências, inclusive registros antigos) |
| **R-01** | Uma alteração confirmada, mas sobrescrita depois por outra estação, só voltava em 30 minutos e ficava no `localStorage` | As confirmadas ficam na fila durável e são **regravadas por 24 h** em Iniciativas e Equipamentos, e também no **Paradas**, que não tinha isso. O Paradas passou a gravar o id da operação na auditoria (campo aditivo). A página avisa quantas regravou. **Não 7 dias, como dizia o parecer:** depois de uma restauração de backup (procedimento manual), as alterações deste computador que não estão no backup voltariam a ser gravadas. 24 h cobre o caso real (fechar a página e voltar no dia seguinte) com menos risco |

## 2. O que não mudou (de propósito)

- Formato das bases (`schemaVersion` 1), `exports`, contratos entre páginas, códigos como texto, vigências e build da Produção (só a regra de versão).
- Cálculos e telas, exceto a barra de estado das páginas tocadas: avisos "base sumiu", "alterações não protegidas" e os botões.
- **Tudo da C2 a C6 ficou para as próximas entregas:** AT-04, AT-05, AT-06, AT-07, AT-08, AT-09, AT-10, AT-12, o teste do Excel e o `tvisual` com as páginas novas.

## 3. Arquivos

| Arquivo | Mudança |
|---|---|
| `fontes/kit/kit_bases.js` | `vacFila`, `vacFormatoBase`, `vacLinkSeguro`, `vacGuardaAba`. Ficam no `<head>` de todas as páginas, antes do código delas, porque o Paradas chama a fila antes do kit v2.1 carregar |
| `paginas/Iniciativas.html`, `Equipamentos.html` (1.0.2) | Store: fila durável, importação da fila antiga, base conhecida, `recriar()`, `usar()` com confirmação, `perdidas()` assíncrona (24 h), formato no `ler()`, links seguros, avisos na barra |
| `paginas/Paradas.html` (1.0.21) | O mesmo; `usar()` novo (o `pick` passa por ele); id da operação na auditoria |
| `paginas/Portal.html` (1.9.1) | Fila do cadastro durável; trava da 2ª aba no `Store.commit`; estado pendente informado a cada 2 s e depois de cada gravação |
| `paginas/Perdas-Ordem.html` (1.8.22) | Trava da 2ª aba no `commit`; estado pendente informado a cada 2 s |
| `paginas/Gestão-Gel-Vacutainer.html` (2.10) | Alterações pendentes (`FS.pending`) na fila durável; importação de `fsPending` |
| `OEE-Vacutainer.html` (2.4.16), `Projetos.html` (0.1.5) | Só o kit |
| `testes/tpendencias.js` | Teste novo (43 checagens) |
| `testes/tplanner.js`, `testes/tequip.js` | Só a versão esperada |

## 4. Eficácia

**Teste novo:** `node testes/tpendencias.js`, com a pasta simulada (OPFS) por HTTP local e dados fictícios. Ele cobre:
- AT-01: 3 abas fechadas fora de ordem; aba viva que não pega as da outra; duas abas com erro de leitura e a gravação depois; importação da fila antiga sem duplicar; IndexedDB com falha. Em Iniciativas, Equipamentos, Paradas, fila do cadastro do Portal e Gel;
- trava da 2ª aba no Portal e no Waste;
- AT-02: base que some, com e sem fila; "Recriar a base"; pasta sem base com "não" e com "sim";
- AT-03: versão futura, schema alheio e base antiga sem schema, nas três páginas;
- AT-11: tabela de links, registro antigo, `#nova=` e `#novaOS=`;
- R-01: com 2 h e com 25 h.

| Código | Resultado | Arquivo |
|---|---|---|
| `main` antes da C1 (`6347559`) | **37 falhas**. Passam só as 5 checagens que valem nas duas versões: base antiga sem schema grava (3) e a 2ª aba volta a alterar depois que a 1ª fecha (2), mais "sem erro de página" | `evidencias/tpendencias-main-6347559.txt` |
| Com a C1 | **43 ok, sem erros** | `evidencias/tpendencias-c1.txt` |

**Suíte inteira (27 testes), sem erros:** `tpendencias`, `tfila`, `tequip`, `tplanner`, `tficha`, `tordens`, `tvigencias`, `tnumeros`, `tcontratos`, `tbases`, `tdiag`, `tintegra`, `tpg`, `tseguranca`, `trelatorios`, `tconstrucao`, `tvisual`, `t18`, `t18c`, `t18d`, `t18e`, `tc`, `tdin`, `tg`, `tk`, `tq`, `tr`, `ts1` e `tz`.

`aplicar_kit21.py`, `build.py` e `gerar_paginas.py` reproduzem os HTMLs.

**Reprodução independente dos 12 AT** (antes da C1): `evidencias/repro-contra-analise.js` e o resultado em `.json`.

## 5. Limites

- **Pasta simulada no navegador.** Duas estações reais na rede, unidade mapeada e Edge corporativo continuam como homologação (etapa H do plano).
- **A trava da 2ª aba e a adoção das alterações de uma aba fechada** dependem do sinal de vida no `localStorage` (a cada 5 s; morta após 20 s). Uma aba que trava sem fechar só libera depois de 20 s.
- **A adoção na abertura usa conferência depois de uma pausa, não uma trava.** Duas abas abrindo no mesmo instante com alterações órfãs: só uma fica com cada alteração, a última que gravou a posse.
- **Uma aba antiga (versão anterior) aberta junto de uma nova** ainda grava a fila no formato antigo. A nova importa na próxima abertura. As operações do Paradas antigo não têm id e poderiam entrar duas vezes, mas são idempotentes.
- **R-01** cobre 24 h, e só o computador que fez a alteração pode regravá-la (sem servidor).

## 6. Regras de uso que podem ser relaxadas depois da homologação

As três regras do piloto (uma aba por página; não usar Iniciativas, Equipamentos e Paradas sem a pasta; conferir a cópia diária) foram escritas para o código antes da C1. Depois da etapa H, as duas primeiras podem cair: a fila durável cobre várias abas e o uso sem pasta. No Portal e no Waste, a 2ª aba é travada enquanto houver pendência.

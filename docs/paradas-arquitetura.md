# Paradas · arquitetura e v1.0

03/11/2026 · aprovada e **v1.0 feita** (§ 8 e § 9). Segue `claude/paginas-novas.md`, o kit do cabeçalho, o contrato do cadastro e o padrão comum. Planilha de revisão: `Paradas-proposta-codigos-e-fonte.xlsx` (catálogo, de-para, matriz por máquina, exemplo da fonte). Modelo de formulário: `Formulario-EQ02-TullipB-exemplo.pdf`.

## 1. Identidade

`Paradas.html` + `paradas-base.json` · `PAGE.id:'paradas'` · `backupDir:'00. Backups/Paradas'` · PARADAS · Análise de falhas e paradas de máquina · v1.0. Núcleo comum, `vac-cabecalho v1`, Ctrl K (evento, equipamento, código nº/letras, componente, OS), TV, relatórios.

## 2. O que mostra o histórico atual (Forms, 807 registros, 12/03–23/09/2026)

- Tempo todo em múltiplos de 5 min (moda 10 min); só 20 registros < 10 min: **microparada não é apontada hoje**.
- Enrosco 206 ocorr. / 4.465 min; Mecânica 197 / 6.678; Elétrica 172 / 5.307.
- Dos 369 Mecânica + Elétrica, só 27 % citam troca/reparo de peça; 24 % citam ajuste/reset (pela regra BD seriam parada operacional, não quebra); 49 % sem informação. **Quebra está inflada e MTBF sairia errado** sem o campo "trocou peça?".
- "Parada de Linha" e "3 hours delay" aparecem como máquina; tipos com grafias repetidas (Ginástica Laboral ×4, Troca de catálogo ×2).

## 3. Decisões propostas (paginas-novas § 4)

**D1 · Fonte e relação com o OEE (sem digitação dupla).** ~~Proposta original abaixo~~ **Decidido em 03/11/2026: a entrada do operador é o Microsoft Forms novo** (§ 9), importado no Paradas pelo Excel de respostas. A direção com o OEE inverte: o Paradas publica `exports.eventos` e o OEE pode sugerir as paradas no hora a hora a partir dele (o OEE confirma, como faz com o MES). O leitor de `exports.paradasEventos` do OEE continua na página (se o OEE publicar, os eventos dele valem nos dias que cobre). Proposta original: um evento de parada é digitado **uma vez, no OEE** (hora a hora / tela do operador), como hoje. O OEE continua dono do tempo por código. O OEE publica um bloco novo `exports.paradasEventos` (aditivo; 120 dias): `{ id estável, dia, turno, inicio, fim, minutos, equipamento, codigo, descricao, catalogo, ordem, lote, trocouPeca }`. O Paradas lê esse bloco e guarda **só a camada técnica** (componente, modo de falha, ação, OS SAP, técnico, causa confirmada, tempos de espera/diagnóstico/reparo, validação), presa ao `id`. Reclassificação (ex.: FME sem peça trocada → AJP) é sugerida no `exports.reclassificacoes` do Paradas e aceita no OEE (Pendências), porque cada página só grava na própria base. Mudança pequena no OEE (feita no chat do OEE): equipamento obrigatório nos códigos 7xx/8xx, campo "trocou peça?", início/fim, código digitável pelo número (801 → FME) e lista filtrada pela matriz.
- Fontes secundárias: **Forms** (importação única do histórico, e na transição até o OEE ter o bloco, com de-para e deduplicação por dia+turno+máquina+min); **servidor MES** (paradas sem caixa > 10 min) só para conferência: "parada sem apontamento".
- Microparadas: contagem por risco no formulário (por causa e hora) lançada no OEE como total por turno (evento `TALLY`).

**D2 · Cadastros novos no Portal** (tipos novos do contrato, compatíveis com schemaVersion 1; editados só no Portal):
- `paradas` ganha campos: `numero` (3 dígitos, único, imutável), `macro` (12 macros BD + Outros), `pilar` (U/D/P/Q), `classe` (`fixa` | `porDuracao` | `calculada` | `emPecas`), `ondeAponta` (máquina | linha | liderança | manutenção), `equipamentos` (null = todos; lista de EQ = matriz), `exigeTrocaPeca`, `exigeComponente`, `temporario`, `guia { descricao, exemplo, naoUsarQuando, regra }`.
- `parametros.limiteMicroMin: 10` (vigente: revisão out/2024 do OEE Definition; o Performance Code de set/2023 diz 5 — confirmar no documento controlado).
- `componentes`: `{ codigo:"EQ02-C07", equipamento, nome, sistema: mecânico|elétrico|pneumático|automação|visão|ferramental, criticidade A|B|C, materialSAP?, ativo }` — base de MTBF por componente e de Máquinas/Manutenção.
- `modosFalha` (lista global curta, ~20): desgaste, ruptura, folga, desalinhamento, desregulagem, queima, curto, vazamento, travamento, contaminação, sujeira, falha de software, falha de comunicação, falha de leitura, quebra por impacto…
- `parametros.acoesPadrao`: trocou peça, reparou, ajustou, limpou, resetou, reapertou, lubrificou, reprogramou.
- Portal ganha: matriz código × equipamento e **Formulários de apontamento** (imprimir por máquina e o formulário da Linha; `Portal.html#formularios/EQ02`).

**D3 · O que aproveitar do HTML atual.** Ideias: KPIs (tempo, ocorrências, média, maior, máquina crítica), filtro cruzado clicando no gráfico, evolução mensal, Pareto de máquinas, tempo por turno, tabela detalhada com busca, "Salvar visão". Dados: os 807 registros viram importação inicial. Não aproveitar: classificação planejada por palavra-chave, SheetJS 0.18.5 do CDN, Chart.js do CDN (usar gráficos SVG do núcleo), visual próprio, export de HTML com dados embutidos. Página nova do zero.

**D4 · Códigos.** Chave = 3 letras (imutável, já usada no OEE e alinhada ao guia BD). Para o operador, **número de 3 dígitos**: centena = grupo. 0 Outros · 1 Utilização · 2 Planejado/engenharia · 3 Partida · 4 Organização · 5 Setup · 6 Consumíveis · 7 Parou sem trocar peça · 8 Quebra (trocou/consertou peça) · 9 Perdas sem parada (velocidade 91x, causa de refugo 95x; liderança, não vai no formulário).
- Microparada × parada operacional **não são códigos diferentes**: o operador escolhe a causa (7xx) e a duração decide (< 10 min = P, ≥ 10 = D). Elimina duplicados do guia (ALM ×2, ENR/DES, LNP/LQR, SNS/DTR, INC/NDI).
- Outros duplicados corrigidos: FCO (falta de componente) × comunicação → FRC; FMA × FMAJ → força maior = FMJ; REF × REFU → causas de refugo com Q (QMT…QVI).
- Saem (inativos com `substituidoPor`, histórico preservado): FQL, LIM, MIC, MPL.

**D5 · Formulário por máquina.** Só os códigos da matriz (rascunho: 22–33 por máquina; os 7xx/8xx em destaque), árvore de 4 perguntas no topo, tabela de paradas ≥ 5 min (início, fim, min, nº, descrição, trocou peça S/N, peça/técnico), contagem de microparadas < 5 min por hora, cabeçalho com data/turno/catálogo/ordem e rodapé "formulário EQ02 · cadastro rev N" para detectar folha desatualizada. Formulário da **Linha** (liderança): 1xx, 3xx, 4xx, TRC/TRL, SAN/ENC.

**D6 · REF e REV (a decidir).** Guia BD: refeição/revezamento com linha parada é perda de Organização e não desconta. Proposta: a pausa padrão do turno continua saindo pelo cadastro de turnos (`pausas.desconta`); REF/REV só para parada fora da pausa padrão, sem desconto. Muda o OEE histórico → decidir junto com o chat do OEE.

**D7 · RTB (a decidir).** Política da empresa: retrabalho fora do OEE (decisão registrada). Guia BD: perda de Qualidade. Proposta: manter RTB como está (107, Utilização por política local) e mostrar a divergência no Guia.

**D8 · 3 hours delay (confirmar).** Aparece como máquina no Forms (racks, descarregamento) e como código 3HD de partida. Proposta: equipamento "3 Hours Delay" no cadastro + código 3HD só para o tempo de partida até a 1ª produção boa.

## 4. Abas da página

- **Operação**: Visão geral (Ação prioritária, Próximas decisões, KPIs: tempo de parada, quebras, MTBF, MTTR, % micro, % OUT/NDI) · Eventos (lista, ficha do evento com camada técnica) · **Fila técnica** (quebras e paradas ≥ 30 min sem componente/modo/ação) · **Validação diária** da liderança (classificação confirmada, sugestões de reclassificação).
- **Análise**: Pareto (código, grupo, equipamento, componente, modo) com filtro cruzado · Equipamentos (MTBF, MTTR, MTBS, disponibilidade, tendência 13 meses) · Recorrência (mesmo equipamento + componente/modo ≥ 3 em 30 dias; crônicas) · Mapa turno × hora · Microparadas · Trocas (setup por catálogo/ordem).
- **Gestão**: Ações (causa raiz, 5 porquês, responsável, prazo; liga a Projetos depois) · Relatórios · **Guia de paradas** (árvore de decisão, todos os códigos por grupo com descrição, exemplo, "não use quando", busca por número ou palavra; texto vem do cadastro, o mesmo do ⓘ do OEE e do formulário) · Importar (Forms, OEE) · Configuração (de-para Forms → código e máquina → EQ, backups).

## 5. Cálculos

- Classe: `porDuracao` → micro (P) se minutos < limite, senão operacional (D). Quebra = 8xx.
- MTBF (equipamento) = tempo de operação ÷ nº de quebras (tempo de operação = minutos programados do turno no OEE − paradas da linha). MTTR = min de quebra ÷ nº de quebras. MTBS = tempo de operação ÷ nº de paradas (todas).
- Regra do 1º motivo: evento paralelo que passa do primeiro conta só o excedente (aviso na validação).
- OUT/NDI abertos > 7 dias = pendência; FME/FEL/… sem "trocou peça = sim" = sugestão de reclassificação.

## 6. `exports` do Paradas (exportsVersion 1)

`kpis`, `pendencias`, `serie` (Portal) · `porEquipamentoMes [{ mes, equipamento, quebras, minQuebra, minOperacional, micro, mtbfMin, mttrMin, disponibilidade }]` · `porComponente [{ equipamento, componente, modo, ocorrencias, minutos, ultima }]` · `eventos` (90 dias, com camada técnica) · `recorrentes` · `reclassificacoes [{ idEvento, de, para, motivo, status }]` (OEE lê). Máquinas lê equipamento/componente/eventos; Manutenção lê recorrentes e porComponente para priorizar.

## 7. Ordem de entrega

1. Portal: novos campos de `paradas`, `componentes`, `modosFalha`, matriz, Formulários (chat do Portal).
2. Paradas v1.0: importação do Forms + leitura do cadastro, Guia, análises, fila técnica, exports.
3. OEE: `exports.paradasEventos`, campo trocou peça, código por número, lista filtrada, aceitar reclassificações (chat do OEE).
4. Paradas v1.1: leitura do OEE como fonte principal, conferência com o MES.

## 8. Paradas v1.0 · feito em 03/11/2026

- `Paradas.html` (arquivo único) + `paradas-base.json`. Núcleo: pasta compartilhada (IndexedDB `vac-sistemas`/`pasta`), cópia no navegador (`paradas.cache`), fila de operações (`paradas.fila`) reaplicada sobre a versão mais nova a cada gravação, `rev`/`revId` com releitura de conferência, backup diário e botão em `00. Backups/Paradas/`, restaurar com `_antes-restaurar_`, base em subpasta aceita como "local antigo". Cabeçalho `vac-cabecalho v1`, Ctrl K (equipamento, código por nº ou letras, parada, ação), TV (`#tv`), tema e usuário comuns. Testado: importação dos 807 registros, reimportação sem duplicar, desfazer importação, limpar base com backup, gravação concorrente reaplicada, 390 px sem rolagem lateral.
- **Base**: `{ schema:'vac-paradas', schemaVersion:1, rev, revBy, revAt, revId, appVersion, eventos[], tecnico{id→{trocouPeca, componente, modo, acao, os, tecnico, esperaMin, reparoMin, codigoValidado, causa, causaConfirmada}}, validacao{dia→{por,em,obs}}, acoes[], importacoes[], config{limiteMicroMin, filaMin, horasDia, deparaMaquina, deparaTipo, matriz, logo, ignorarAntesDe}, auditoria[], exports }`.
- **Evento**: `{ id (FN-<ID do Forms> | FA-<ID antigo> | M-…), origem, importId, dia, turno, inicio, fim, minutos, ocorrencias, equipamento (EQ.. | LINHA | X:<nome> provisório), maquinaOrig, codigo, codigoOrig, trocouPeca, descricao, obs, peca, tecnicoForms, ordem, por, registradoEm }`. Código efetivo = `tecnico.codigoValidado` ou `codigo`.
- **Catálogo**: lê `vacutainer-cadastros.json`; o que o cadastro tem manda (nome, etc.). Os 91 códigos do catálogo proposto ficam embutidos e completam número, grupo, classe, guia e onde se aponta até o Portal ter esses campos (pílula "N códigos a cadastrar"). FQL, LIM, MIC, MPL aparecem inativos com "substituído por". Limite micro: `parametros.limiteMicroMin` do cadastro > Configuração > 10.
- **Matriz código × equipamento**: campo `equipamentos` do código no cadastro > `config.matriz` (provisória, editável em Formulários) > rascunho por nome de máquina.
- **Abas**: Visão geral, Eventos, Fila técnica (inclui sugestões de reclassificação e "aplicar todas"), Validação diária, Pareto (código, grupo, equipamento, classe, componente, modo, turno, equipamento × código, palavras da descrição), Equipamentos (MTBF/MTTR/MTBS/disponibilidade, detalhe por máquina), Recorrência (3+ em 30 dias ou 3 meses seguidos), Ações, Guia, Formulários (Forms campo a campo, copiar listas, Excel de exemplo, impressão A4 por máquina, matriz), Importar, Configuração (de-para, regras, backups, limpar base, exports).
- **Tempo de operação** para MTBF: `exports.porDiaTurno` do OEE quando cobre o período; senão estimado = dias com apontamento × `horasDia` (padrão 17 h).
- **exports (exportsVersion 1)**: `kpis`, `pendencias`, `serie`, `porEquipamentoMes`, `porComponente` (90 d), `eventos` (90 d, com camada técnica), `recorrentes`, `reclassificacoes`, `classificacoesValidadas`, `limiteMicroMin`.
- Links: `#aba=…`, `#equipamento=EQ02`, `#evento=<id>`, `#codigo=FME`, `#formulario=EQ02`, `#tv`, `#teste` (dados fictícios em memória).

## 9. Microsoft Forms novo (entrada do operador)

Uma resposta = uma parada (ou várias microparadas iguais somadas). Configurações: somente pessoas da organização + registrar nome.

| # | Pergunta (título exato) | Tipo | Obrig. | Opções / regra |
|---|---|---|---|---|
| | **Seção 1 · Identificação** | | | |
| 1 | Data da parada | Data | sim | dia em que o turno começou |
| 2 | Turno | Escolha | sim | `T1 · 1º turno`, `T2 · 2º turno`, `T3 · 3º turno` |
| 3 | Máquina | Escolha com ramificação | sim | `EQ02 · Tullip B`… + `LINHA · Linha inteira`; cada opção vai para a seção da máquina |
| | **Seções 2…N · uma por máquina** | | | |
| 4 | Código – <máquina> | Lista suspensa | sim | só os códigos da máquina, `801 FME · Falha mecânica` (copiar em Paradas › Formulários); título começa com "Código"; fim da seção → Detalhes |
| | **Última seção · Detalhes** | | | |
| 5 | Início da parada (hh:mm) | Texto | sim | não usar "Hora de início" (coluna do Forms) |
| 6 | Duração (minutos) | Texto, número 1–720 | sim | total de minutos |
| 7 | Quantas vezes aconteceu? | Texto, número ≥ 1 | não | vazio = 1; microparadas repetidas |
| 8 | O que aconteceu? | Texto curto | sim | sintoma e onde |
| 9 | Trocou ou consertou alguma peça? | Escolha com ramificação | sim | Sim → 10; Não / Não sei → 11 |
| 10 | Qual peça foi trocada ou consertada? | Texto | não | |
| 11 | Técnico que atendeu | Texto | não | |
| 12 | Ordem ou lote | Texto | não | |
| 13 | Observação | Texto longo | não | |

O Excel de respostas (ID, Hora de início, Hora de conclusão, Email, Nome, as perguntas, uma coluna "Código – …" por máquina) é importado inteiro a cada vez; o ID evita duplicar e atualiza respostas editadas. O histórico do Forms antigo e do HTML antigo é opcional (importar, desfazer, "ignorar nas análises antes de" ou limpar a base).

## 9.1 v1.0.1 · 03/11/2026

- `exports.cadastros` para a carga do Portal (catálogo proposto com matriz, inativar FQL/LIM/MIC/MPL, modos de falha, ações padrão, limite, nomes de máquina do histórico). Pedido ao Portal em `claude/portal-pedido-paradas.md`.

## 10. Próximos passos

1. Portal: campos novos dos códigos (número, grupo, classe, guia, `equipamentos`), `componentes`, `modosFalha`, `parametros.limiteMicroMin` e `acoesPadrao`, matriz e impressão de formulários (o Paradas já imprime enquanto isso).
2. Cadastrar os equipamentos com código (EQ..) e ligar o de-para do histórico; criar o Forms novo com as listas copiadas.
3. OEE: ler `exports.eventos` do Paradas como sugestão no hora a hora e aceitar `reclassificacoes`.
4. Decisões ainda abertas: REF/REV (desconto), RTB, 3 hours delay, limite de 10 min no documento vigente.

## 11. Paradas 1.0.6 (06/11/2026)

- Catálogo de sistemas único do kit (`fontes/kit/sistemas.js`). O Portal 1.8.3 passa a desenhar `exports.serie` (`{rotulo, pontos}`) e lê `sev 1` como urgente.

## 12. Paradas 1.0.7 (06/11/2026)

- `eventosTodos`: um evento do OEE (`exports.paradasEventos`, quando o OEE publicar) substitui só o evento que é a mesma parada (D1): mesmo dia e equipamento, turno igual quando os dois têm, início a até 10 min (sem horário: duração a até 1 min); cada evento do OEE substitui no máximo um; contagem de microparadas (tally) nunca é substituída. Antes, qualquer evento do OEE no dia escondia todos os do Forms do dia.

## 13. Paradas 1.0.8 (06/11/2026) · layout (vac-visual v1)

- **Tema e chaves comuns:** `vac.theme`, `vac.user`, `vac.userId`, `vac.perfil` e `vac.logo` são lidos e gravados como texto simples, como nas outras páginas. O formato antigo, com aspas, também é lido. Antes, o Paradas voltava ao claro vindo de uma página escura, gravava o tema com aspas (as outras páginas não reconheciam) e não lia o usuário nem a logo do Portal. As preferências próprias continuam em JSON.
- **Cores:** paleta comum (Portal, Produção, Waste), com `color-scheme: dark` no escuro para os campos de data. O botão principal usa `--accent-ink`. As cores de classe (`--g0`…`--g9`) não mudaram.
- **Status:** "modo de teste" em roxo; "Só neste navegador · conectar pasta" com pílula de atenção, e não mais vermelha cheia.
- **Gráfico por mês:** uma unidade só para a escala inteira (h, se o máximo passar de 600 min). Antes, o eixo misturava "300 min" e "12,5 h". A dica mantém o valor exato.

## 14. Paradas 1.0.9 (06/11/2026) · bases em 00. Bases

- Na primeira leitura da sessão com a pasta, move `paradas-base.json` para `00. Bases` (cópia em `00. Backups/Paradas`). Lê o cadastro e o OEE em `00. Bases` ou na raiz.

## 15. Paradas 1.0.10 (06/11/2026) · revisão c341f8e

- A faixa do modo de teste segue o padrão de exemplo (roxo, "Ambiente de teste · dados fictícios"), com contraste ≥ 4,5.
- "Tempo por mês" e "Tempo de parada por mês e classe" usam `fmtMin`, com uma unidade para a escala inteira. O Pareto (`hbars`) também passou a usar uma unidade só.
- Kit vac-bases v2.

## 16. Paradas 1.0.11 (07/11/2026) · impressão e aba inicial

- **Ctrl+P na análise:** antes saía em branco, porque a regra de impressão do formulário de papel valia sempre. Agora ela só vale enquanto `imprimirForms` imprime (classe `imprimindo-forms`, página nomeada `formulario` em A4 retrato). Fora disso, imprime a aba atual, no tema claro (kit).
- **Aba inicial do perfil:** "Paradas › Visão geral" ou "Paradas › Fila técnica", na 1ª abertura da sessão; `#aba=` tem prioridade.
- **Sem relatório próprio (PDF, Excel, cópia):** continua assim, ver registro § P, limitações.

## Paradas 1.0.13 (07/11/2026)

Só o kit: `vacCsvTexto` (regra comum do CSV) entrou no `kit_v21.js`. O Paradas não exporta CSV; sem mudança de comportamento.

## Paradas 1.0.14 (08/11/2026)

Só o kit da E2 do plano único (`vacHoje`, `vacMetaAreaMes`); sem mudança de comportamento no Paradas.

## Paradas 1.0.15 (08/11/2026) · E3 e E4 do plano único

- **Importação do Forms:** minutos e vezes estritos (`vacNumero`, ponto com 3 dígitos = milhar, como antes). Linha com "12a" ou "15-" vai para os erros, com o motivo; antes virava 12 ou 15.
- **`exports.porOrdem`:** eventos, minutos, equipamentos, primeiro e último dia, por ordem.
- **Leitura da Produção:** o `exports` só é usado se a versão for conhecida.

## Paradas 1.0.17 a 1.0.19 (08/11/2026) · plano único E5, E8, E10d e E11

- **Ficha e rotas:** botão "Ficha" na ordem do evento; rota `#ordem=` (eventos filtrados pela ordem).
- **Planner (Iniciativas):** "+ Ação no Planner" no Pareto selecionado, na recorrência e no evento, com a fotografia (período, minutos, paradas) e o link de reconsulta. As ações locais do Paradas continuam.
- **Relatório:** botão **Relatório**, o mesmo Report do Portal e do Waste (prévia, PDF, Excel, texto, Outlook, impressão), com os filtros da tela.
- **OS (Equipamentos):**
  - o evento mostra as OS ligadas, lidas de `equipamentos-base.json › exports.porEvento` com a versão conferida;
  - tem "+ Abrir OS", que abre Equipamentos com a referência do evento;
  - o Paradas não grava em Equipamentos.

## Paradas 1.0.20 (08/11/2026) · revisão do Codex no PR #15

A recorrência do relatório usa o mesmo recorte da tela (equipamento, turno, classe e data final), mantendo o histórico anterior para os meses seguidos.

## Paradas 1.0.21 (08/11/2026) · C1

- **Fila e base:** fila durável, base que some com "Recriar a base" e confirmação para criar a base. O `pick` passa a usar `usar()`.
- **Formato:** conferido no `findBase`, então vale tanto para ler quanto para gravar.
- **Regravação:** o id da operação entra na auditoria (aditivo), o que permite a regravação em 24 h.

## Paradas 1.0.22 (08/11/2026) · C3 e C6

- **`exports.eventosCobertura`** = `{ de, ate, cortado }` (aditivo, AT-06):
  - é o período em que a lista `eventos` está completa;
  - os eventos ficam em ordem de dia, e o corte de 3000 guarda os mais recentes;
  - fora desse período, o Portal mostra "sem dado de paradas" em vez de 0.
- **Rota do Pareto (AT-09):** `#pareto=de|ate|eq|turno|cls|grupo|dim|k`. A ação aberta do Pareto leva esse link, que reabre o mesmo filtro, a mesma dimensão e a mesma barra. Se o período saiu da base, a página avisa; a fotografia guardada na ação continua valendo.


## 1.0.23 · 08/11/2026

Isolamento por pasta e reserva por operação, com cópia de recuperação. Procedimento, testes e limites em [estabilizacao-nv-01-05.md](estabilizacao-nv-01-05.md).

## 1.0.25 · 10/11/2026 · Fase 3 do briefing

A aba Importar leva ao Portal › Importação › Paradas; a tela do Forms abre direto por `#aba=importar`. `exports.importacoes` com os dias cobertos (`de`/`ate`). Detalhes: `docs/briefing-2026-11-09-fase0-fase1.md` § 7.

## 1.0.33 · Gráficos (11/11/2026)

- **Pareto:** o percentual sai como "% acum.". Em Ocorrências, aparece a linha "Valores em ocorrências".
- **Tempo por mês:** o eixo deixou de repetir rótulos.
- **Subtítulos:** dizem "tempo de parada (h ou min)".
- **Números:** nenhum muda. Padrão em `docs/graficos-padrao.md`.

## Paradas 1.1.0 · Refatoração UX/UI, etapa 1: Visão geral e Pareto (12/11/2026)

A especificação "Refatoração UX/UI — Paradas.html" pede só apresentação, por etapas. Esta é a etapa 1 (Visão geral e Pareto). As próximas são Equipamentos, Recorrência, Eventos/Fila técnica/Validação e o restante da responsividade.

**Não mudou:** `statsEquip`, `programado`, `recorrencias`, `classe`, `codigoEf`, `F.apply`, `Store`, a fila de gravação, os contratos JSON, as permissões, a classificação e os critérios de micro e quebra, as fórmulas de MTBF, MTTR e MTBS, `vbars` e `bindChart`. O kit também não mudou.

### Visão geral (`VIEWS.geral`), em faixas
1. **Filtros:** os campos de antes e os **ativos em pílulas** (`ativosHTML`): equipamento, turno, classe e grupo, cada um com × para tirar, e "Limpar filtros".
2. **Indicadores principais:** Tempo de parada, Quebras, MTBF da linha, MTTR e Máquina crítica (com o atalho "Filtrar" do equipamento).
3. **Secundários:** Microparadas, Código temporário e % do tempo de operação (barra), mais o aviso de microparadas.
4. **Prioridades:** ação prioritária, próximas decisões ("Ver todas") e atalhos das pendências (Validação, Fila técnica, Ações).
5. **Análise visual:** tempo por mês, com o mês de mais e o de menos parada logo abaixo, e o Pareto de equipamentos.
6. **Análises complementares:** grupos que recolhem (B · classe, C · turno) e Explorar dados.

Cada número aparece uma vez:
- **Situação:** o card grande repetia o tempo e as ocorrências do 1º indicador e saiu.
- **"Maior perda":** repetia a máquina crítica e o Pareto e saiu; o atalho "Filtrar" ficou no indicador.
- **"Diagnóstico":** o código temporário já está nos secundários e o pior e o melhor mês foram para baixo do gráfico mensal.

`parSit`, `parTop` e `parDiag` continuam no arquivo, sem uso, para facilitar uma volta.

### Pareto (`VIEWS.pareto`)
- **Seletores:** agrupados em Dimensão, Medida e Referência. As 9 dimensões quebram linha e, no celular, rolam na horizontal.
- **Legenda:** distingue a barra e o "% acumulado". O acumulado vai num `tspan` mais claro; o texto continua "· N% acum.".
- **Linha de 80 %:** opcional e desligada por padrão (`vac.paradas.p80`, neste computador). Marca a barra em que o acumulado passa de 80 %; é só referência, não é meta.
- **Seleção ativa:** a barra fica com contorno e a faixa "Seleção" mostra quantidade, tempo, + Ação, Planner e Limpar seleção. Sem seleção, uma dica diz para clicar numa barra.

### Gráficos (`hbars`)
- **O que entrou:** a classe `pux-on` na barra selecionada, `pux-val`/`pux-acum` nos textos e a opção `ref80` (sem `ref80`, o desenho é o de antes).
- **O que não mudou:** a mesma entrada, o mesmo `data-k` para o clique e a mesma dica (`<title>`).

### CSS
Classes `pux-*` só desta página (no 1º `<style>`), com os tokens do tema (claro e escuro). Larguras:
- **até 1280 px:** 3 colunas de indicadores;
- **até 900 px:** os gráficos empilhados;
- **até 640 px:** 2 colunas, botões com 40 px de altura e o seletor do Pareto rolando.

Na impressão saem os controles.

### Validação (antes × depois, mesmos dados e filtros)
**`testes/tparadas_ux.js` (novo):** referência gravada **antes** em `testes/bases/paradas-ux-referencia.json`. Confere iguais:
- os totais (24.461 min, 1.419 ocorrências) e o tempo programado;
- `statsEquip` dos 13 equipamentos (MTBF, MTTR, MTBS, disponibilidade, quebras…) e as 58 recorrências;
- os 18 Paretos (9 dimensões × minutos/ocorrências: ranking, valores e dicas);
- as dicas dos gráficos da Visão geral e as linhas das tabelas de Equipamentos e Recorrência.

Também confere a tela nova: faixas, pílulas, seleção, Pareto, 80 %, clique, + Ação, 5 larguras × 2 temas e console sem erro.

**`tparadas_vg.js`:** os mesmos números da referência anterior (indicadores, ação, decisões, 4 gráficos, filtros). A estrutura esperada passou a ser a das faixas novas.

## Paradas 1.1.1 · Refatoração UX/UI, etapa 2: Equipamentos e Recorrência (12/11/2026)

Só apresentação. `statsEquip`, `programado`, `recorrencias` e os critérios de recorrência e falha crônica não mudaram.

### Equipamentos (`VIEWS.equip`)
- **Área gráfica:** usa os resultados de `statsEquip`, sem conta nova.
  - **Ranking por tempo parado:** `hbars`, os 14 maiores na mesma ordem.
  - **Quebras por equipamento:** quantidade de quebras do grupo 8.
  - O clique nas barras abre o detalhe (`abrirEquip`), como a linha da tabela.
- **Tabela técnica completa:** as mesmas colunas (MTBF, MTTR, MTBS, disponibilidade, ocorrências, quebras…).
  - **Cabeçalho fixo** na rolagem (a tabela rola dentro, até 70 % da tela) e **1ª coluna fixa**.
  - **Números** à direita e em algarismos tabulares.
  - **Linha sob o cursor** destacada.
  - **Telas pequenas:** rolagem horizontal dentro da tabela, sem rolar a página.

### Recorrência (`VIEWS.recor`)
- **Resumo no topo:** falhas recorrentes, crônicas (3+ meses seguidos), 6 ou mais em 30 dias e sem ação vinculada. Os números saem da própria lista.
- **Destaques na tabela:**
  - equipamento em negrito;
  - código com a cor do grupo e o nome em tom secundário;
  - componente numa pílula;
  - quantidade em 30 dias num selo;
  - total em negrito;
  - data da última ocorrência sem quebra;
  - ação vinculada (status) ou + Ação / Planner.
- **Linha de 6 ou mais em 30 dias:** é a mesma regra `hl3` de antes. Passou de vermelho cheio com texto branco, em que o nome do código ficava apagado, para **vermelho claro com barra à esquerda e texto normal**, legível nos dois temas.

### Validação
**`tparadas_ux.js`:** com a referência gravada antes da etapa 1, continuam iguais:
- `statsEquip`, as 58 recorrências e as linhas das tabelas de Equipamentos e Recorrência.

Etapa 2 nova no teste:
- o ranking na ordem de `statsEquip` e as quebras;
- o cabeçalho e a 1ª coluna fixos, com os números à direita;
- o clique na barra e na linha abrindo o detalhe;
- o resumo da Recorrência igual à lista, os destaques e o + Ação;
- 5 larguras × 2 temas sem rolagem lateral da página.


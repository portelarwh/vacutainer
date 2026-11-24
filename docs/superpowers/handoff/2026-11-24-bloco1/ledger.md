# SDD ledger — plan: docs/superpowers/plans/2026-11-23-administracao-central-bloco1.md
Spec: docs/superpowers/specs/2026-11-23-administracao-central-design.md (aprovado 23/11/2026). Branch: claude/determined-brown-f1jh2g (PR #148 rascunho).

## Pre-flight
| Par / tarefa | Produz × consome | Achado |
|---|---|---|
| T1 | inventário | pede pausa antes de T4 (conferência do responsável) |
| T2→T3 | vacCad() → métodos | ok |
| T3→T5 | vigente/lista/item → vacCad.gel | ok |
| T4→T6 | podeEditarAssunto → tela Gel | perfis sem `assuntos` até T7 |
| T4→T7 | assuntos dados pelo importador | idem |
| T5→T6/T7/T8 | schemaVersion 2 + vacCad.gel | cenário demo ainda v1 entre T5 e T9 |
| T5↔T9 | baseline de números antes da mudança | T9 step 1 tem de rodar antes de T5 |
| T8 | remove S.config.fmts/equips | "lineHeads se for só cadastro" depende do inventário (T1) |
| T6 | remove #parGel e gelEq | ok com T8 (contrato) |

Ruling: T1 entregue ao responsável e T2–T3 seguem; parar antes de T4 se o responsável não tiver conferido — o desenho diz "pronto quando o responsável conferiu" — custo se errado: um dia de espera.
Ruling: perfil sem `assuntos` → `podeEditarAssunto` = `podeEditar()` até o importador; sai na etapa 8 junto do importador — evita bloquear edição entre T4 e T7 — custo: uma linha de transição.
Ruling: T5 já regrava o cenário demo em v2 (gel.formatos do print + 14 locais) para os testes seguirem verdes; T9 regrava o final — custo: duas regravações.
Ruling: o baseline de números do gel (T9 step 1) é capturado no começo de T5, antes de qualquer mudança do Gel — senão a comparação perde sentido.

## Tarefas
Task 1: dispatched (BASE e5d523e, sonnet)
Controller: 234e49c corrige tplanner (CI regras(1) falhou por espera de 8 s engolida) — fora das tarefas; excluir do review de T1 (usar o diff só dos commits do implementador)
Task 1: implementer DONE_WITH_CONCERNS 2eca8d5 (177 linhas; 0,936 é dado da base do responsável, não padrão do código); review dispatched
Task 1: complete (commits 234e49c..2eca8d5, review approved; Important 'versão 1.9.x' não procede — linha 20 é título; 'Calendário/Fuso' fica para o construtor conferir por grep)
Task 2: dispatched (BASE 2eca8d5, sonnet)
Task 2: implementer DONE 31d4575; review dispatched
Task 2: complete (commits 2eca8d5..31d4575, review clean; minor: guardas typeof redundantes → Task 3 limpa)
Task 3: dispatched (BASE 31d4575, sonnet)
Task 3: implementer DONE 36b9341; review dispatched
Task 3: complete (commits 31d4575..36b9341, review clean)
PAUSA: T4 aguarda conferência do inventário pelo responsável (ruling do pre-flight)
Responsável (23/11): inventário conferido; as 14 propostas aceitas; gel Tubo 100 = 0,936 g desde 01/10/2025.
Ruling: datas do plano trocadas para 2025-10-01 (vigência real) e 2025-09-30 (antes dela) — decisão 10 do responsável.
Ruling: T4 perfis iniciais (decisão 13): perfil cujo nome/código contém "Processos" → editar tudo; "PCP" → editar planta e turnos; "Almoxarifado" → editar gel; demais com podeEditar() → editar tudo; resto → ver. Sem `assuntos` gravado, deriva por essa regra (sai na etapa 8).
Task 4: dispatched (BASE 9676f9b, sonnet)
Task 4: implementer DONE 505eb56; review dispatched
Task 4: review Needs fixes — Important: Cad.ops sem trava por assunto (importadores, Trazer, ativar usuário, pgOk só checam podeEditar). Fix round 1 enviado (trava central em Cad.ops por admAssuntoDe(op)).
Task 4: minor (deferred): ADM_ROT flag `1` sem comentário; nivelAssunto fallback depende de sessão (transitório).
Task 4: fix round 1/5 (2 addressed, 0 open; commits 505eb56..b41fca5)
Task 4: complete (commits 9676f9b..b41fca5, review clean após 1 rodada)
Task 4: minor (deferred): isenção login/autocadastro depende só de `origem` — apertar para "sem perfil ativo ou alvo = própria conta".
Ruling: baseline de números do gel é capturado no começo da T8 (código antigo lendo a cópia do Gel) e comparado depois da troca; para isso a T5 grava no cenário o MESMO formato/locais na seção nova `gel` e na cópia do Gel (fifo-base config.fmts/equips) — compara código, não dado. Substitui o ruling anterior.
Ruling: remoção de GEL_FMT_DEF/FMT_DEF sai da T5 e vai para T6 (gelEq/fmtBox do portal) e T8 (fmtList do Gel), onde seus leitores são trocados — tirar antes quebraria o código antigo no meio.
Ruling: T5 só aceita schemaVersion 2 (e continua lendo 1 sem faixa); a faixa "formato antigo" e o bloqueio são da T7.
Task 5: dispatched (BASE b41fca5, sonnet)
Task 5: implementer DONE b662f5b (EQ13 3H Delay criado no cenário; gel-producao/scrap-lado zeram equips do Gel em memória); review dispatched
Task 5: complete (commits b41fca5..b662f5b, review clean)
Task 5: minor (deferred): teste de cadValida por regex no fonte; vacCad.gel.locais ignora `data`; inativo dereferencia c.
Task 6: dispatched (BASE b662f5b, sonnet)
Task 6: implementer DONE_WITH_CONCERNS ad713a0 (cópias antigas não espelhadas até T8 — esperado; vigência nova só >= hoje + motivo — mantido: o histórico vem pelo importador; Novidades na T9)
Task 5: REABERTA — equip-ordem.cjs passa em b41fca5 e falha em b662f5b (EQ13 novo no cenário). Fix enviado ao implementador da T5.
Task 5/6: minor (deferred): cenário desloca a vigência do formato para 15/10/2025 (data relativa ao "hoje" do cenário), não 01/10/2025 real.
Ruling: "embalagem própria" por equipamento (equipamentos[].gel.tara) vira embalagemG por local — é o modelo da página antiga (cada linha "equipamento" era um local de descarte, com sua embalagem); o importador (T7) copia a tara do equipamento para cada local dele — custo se errado: um campo a mais no local.
Task 6: complete (commits b662f5b..ad713a0, review approved; Important tara resolvido por ruling)
Task 6: minor (deferred): reativar local só via Editar; sem filtro de inativos; categoria do barril fixa em B.
Task 5: fix round 1/5 (1 addressed, 0 open; commit b442b23 — teste equip-ordem: rolagem da lista com 13 linhas)
Task 5: complete (reaberta e fechada; commits b41fca5..b662f5b + b442b23)
Task 5: minor (deferred): equip-ordem usa scrollTop fixo 120 px — trocar por cálculo pelo offsetTop das linhas + asserção de visibilidade (levar à T9 ou à revisão final); eqDnd sem autoscroll (UX antiga).
Ruling: T7 não testa o aviso "cadastro do gel não importado" na Produção/Gel — essas páginas só passam a ler vacCad na T8; a asserção vai para a T8. T7 testa a faixa e o bloqueio na Administração.
Task 7: dispatched (BASE b442b23, sonnet)
Task 7: implementer DONE e74e8be; review dispatched
Task 7: review Needs fixes — Critical: perfis só-leitura viram editar (pode ()=>true); Important: n() zera campos ausentes. Fix round 1 enviado (+ admNivelTransicao com o mesmo teste por perfil).
Task 7: fix round 1/5 (3 addressed, 0 open; commit 5bddb87)
Task 7: complete (commits b442b23..5bddb87, review clean após 1 rodada)
Task 7: minor (deferred): Tubo ausente gera aviso por bloco + por campo (ruidoso); v1 lock deixa passar qualquer op 'seguranca'.
Task 8: dispatched (BASE 5bddb87, opus — integração grande em motor/gel e motor/oee; inclui baseline T9 step 1 primeiro)
Task 8: agente opus parou por limite semanal antes de alterar algo (árvore limpa em 5bddb87). Ruling: redisparar com sonnet — mesma instrução; custo: modelo menos forte numa tarefa grande, compensado pela revisão.
PASSAGEM (24/11): sessão parou por falta de tokens; T8 não começada (árvore limpa em 5bddb87). Ver docs/superpowers/handoff/2026-11-24-bloco1/LEIA-PRIMEIRO.md

## Retomada da Task 8
- Referência (`4b814c7`): cenário fixado em 09/11/2026. Cinco pesagens fictícias, em dois dias, nas composições Tubo + gel, Gel puro, Tubo completo, Spray e Barril. Exporta g/kg por local e categoria, gel nos tubos bons, teórico, baixado, real e scrap do mês. Primeiro ensaio sem o arquivo falhou com ENOENT. A criação é exclusiva e a comparação passou com o código anterior.
- Gel: `vacCad.gel` fornece formato vigente e locais para cálculo, registro, filtros e consulta. O histórico resolve locais inativos e usa o nome gravado se o local foi excluído. O vínculo de catálogos, a programação e o estoque continuam com os contratos atuais. A Produção ainda usa os leitores antigos até a próxima etapa.
- O contrato novo falhou em `S.config.fmts` e o teste de fonte única falhou ao procurar um ID v2 no código anterior. Após a troca no Gel, a fonte única (somente Gel), o relatório e a referência dos dois motores passaram.
- Produção: leitura da mesma vigência, composição e locais do Gel. O formulário guarda ID e nome de reserva. Export histórico sem cálculo publicável mantém pesagens e deixa os totais ausentes. Consultas mostram o nome atual ou o gravado, inclusive quando um local deixa de aparecer no formulário.
- Verificação da Produção: o teste de fonte única falhou no ID v2 antigo e, depois, no nome histórico do equipamento inativo. Os dois casos passaram. `scrap-lado`, `gel-producao` e `gel-numeros` também passaram.
- Remoções: formatos e descartes saíram de Trazer configurações. A importação v1 mantém as referências históricas quando consegue ligar o código e o ID original do descarte. Ela também traz os parâmetros operacionais do Gel que faltarem no cadastro. Os testes de migração e a matriz de 1.440 pesagens passaram.
- Ruling: cabeçotes e barris por cabeçote são regras de estoque no inventário. A edição agora está em Administração › Gel e o importador conserva os valores existentes. Quando esses campos não foram preenchidos, o painel de estoque preserva a disposição operacional de dois por dois. Os pesos e a composição do scrap exigem cadastro.
- Contrato: os nove motores foram verificados. `adm-importar`, `tgel`, `tportalfonte` e a paridade do cenário passaram após as remoções.

## Task 9
- Cenário regravado pelo gerador, com 14 locais e 0,936 g no Tubo 100. As cópias antigas de formatos e descartes saíram após a primeira comparação. A referência ficou intacta e voltou a passar após a regravação.
- Versões: plataforma 1.8.63, Administração 1.9.82, Gel 2.49, Produção 2.6.44. Novidades, manifesto, verificador de pasta, contrato dos motores e pendência para o responsável atualizados.
- Ordenação de equipamentos: a rolagem usa os offsets das linhas e o teste confere os pontos de arraste e soltura antes de mover o ponteiro. A fixture v1 é montada no teste de importação, sem guardar cópias no cenário.
- Revisão contra `main` (`d78275a`): conferidos os 14 pontos do inventário, o cadastro v2, os oito assuntos e as permissões, a edição por vigência, a importação, a leitura dos motores e a entrega. Conferidos a ausência de cálculo no cadastro v1, o nome de reserva nas pesagens e o corte do scrap entre os motores. A importação da pasta real permanece sob responsabilidade de quem opera a base.
- Verificação local: build, lint, unitários, contrato e os nove testes focados. As suítes completas e o CI do PR #148 registram os resultados da entrega.

## Ajustes após a conferência do responsável (24/11/2026)
- SQDCP: faixa de resumo executivo removida (repetia a posição 1 de cada pilar); `tsqdcp_layout` confere 5 posições 1 e nenhum resumo.
- Gel: `parametros.gel.processo[]` aceita `fmt` ('100' ou '75'; sem `fmt` vale para todos). `vacGel.procAt(data, fmt)`; `vacGel.teorico` e `prodCalc` do Gel somam o teórico por grupo de perdas do formato de cada catálogo (um só formato = conta de sempre). Teste `gel-perdas-formato`. Versões: plataforma 1.8.64, Administração 1.9.83, Gel 2.50, Produção 2.6.45.
- Verificação: lint, test:unit, test:plataforma e npm test (71 suítes) verdes; gel-numeros igual à referência.
- Pendente do responsável: os locais de descarte não vieram na importação da pasta real (cadastrados à mão); a causa não foi investigada.

## Revisão do bloco 1 (bloco 2, Task 1)

Revisão de `git diff d78275a..HEAD -- Plataforma.html` contra a regra nova (base limpa, sem compatibilidade) e contra o desenho. O inventário completo está em `docs/BASE-LIMPA.md`.

### (a) Existe só para cadastro v1 ou base antiga (sai no bloco 2)
- `ImportarV1`, `cadImportarV1`, faixa `#cadV1` e o botão `cadV1Abrir`, caso `'importação v1'` em `aplicarOp`, item `importarV1` em `CAD_SECS`, no menu Sistema, em `ADM_ROT` e no mapa de telas (Task 3).
- Trava v1 em `Cad.ops` (linha com `ImportarV1.permitida`) (Task 3).
- `admNivelTransicao` e a transição em `Cad.nivelAssunto`; `admPerfilEdita` se ficar sem uso (Task 3).
- `legado` em `vacGel.localGel` (dois `find` com `l.legado?.some`) e o campo `legado` gravado por `ImportarV1` (Tasks 2 e 3).
- `vigList` com `gTubo`/`bomG`/`bomKg`/`bomPct` soltos no catálogo, em `vacGel` (comum/bases) e na cópia local `catVigList`/`bomVals` (motor/gel); ramo `bomG × bomPct` de `bomVals` (Tasks 2 e 5).
- `vacGel.cadastroOk` com `+cad.schemaVersion >= 2`, `avisoImportacao` ("Importar das bases atuais") e a tela Gel "cadastro no formato 1" (Tasks 2 e 3).
- `cadFix` com `+d.schemaVersion>=2` e `novo.schemaVersion=Math.max(1,...)` na gravação (Task 3).
- `vacGel.ctx().cat` deduz o formato 100/75 do texto do catálogo (Task 2).
- `PROC_DEF` (comum/bases) e `GEL_PROC_DEF` (motor/portal) (Tasks 2 e 3).
- Fora do bloco 1, mas na mesma regra: `TrazCfg`, `Carga` (carga inicial), `parCarga*`, mudança da base da raiz para `00. Bases`, importação de fila antiga, log `registro-backup.log` legado, `vacPessoa` por nome, `vacExportsOk` e `exV1` aceitando export sem número, `acoesLegado`/"Trazer ações do Waste", busca de base em local antigo.

### (b) Defeitos de correção
1. **Restauração de backup não restaura o bloco `gel` (Task 3, `motor/portal`).** `aplicarOp` caso `'restauração'` copia só os tipos de `CAD_ORD` e `parametros`; `D.gel` (`formatos` e `locais`) fica como está, e a operação a monta com `doc` só desses tipos (`Cad` restaurar, `{parametros, ...CAD_ORD}`). Caso: gravar um novo formato do gel (vigência 01/12) depois do backup, restaurar o backup. Turnos, metas e `parametros.gel.processo` voltam ao estado antigo, e o formato do gel continua o novo, então o teórico e o scrap passam a misturar perdas antigas com pesos novos. A auditoria diz "conteúdo do backup".
2. **Perfil não encontrado libera a edição de todos os assuntos (Task 3, `motor/portal`).** `Cad.podeEditarAssunto` faz `if(!p) return true` e `Cad.ops` só nega quando `p` existe (`const p=perfilAtual(...), neg=p?...:null`). `perfilAtual` devolve `null` para usuário logado cujo `perfil` não está em `perfis` do cadastro nem em `DEFAULT_PERFIS` (perfil renomeado ou excluído). Caso: usuário "1001" com `perfil:'LIDER_ANTIGO'`, desbloqueio de edição feito: `Cad.podeEditarAssunto('turnos')` dá `true` e a operação grava. A regra do desenho é "sem `assuntos` só vê". Sem sessão (`usuarioAtual` nulo) continua valendo só `podeEditar`, por contrato 4.
3. **Índice do dia calculado com scrap parcial (Task 2, `GelDia.calc` em `motor/oee`; a Task 2 já edita essa função).** `pesou` vira `true` se algum turno está completo, mas `sc` soma também as pesagens válidas de um turno que tem pesagem pendente (`k.pendentes.length`). Caso: turno 1 com todas as pesagens válidas e turno 2 com 3 pesagens, uma delas de local sem composição vigente. `pesou = true`, `real = teo.gelBons + scrap` sem os kg da pesagem pendente, e `idx`/`saving` aparecem como número. Contrato 1: ausência não vira zero. O correto é `pesou = false` (índice e ganho `null`) enquanto algum turno tiver pendente.

Não encontrei outros defeitos de correção. Itens de revisão anteriores já resolvidos (Task 7: `pode ()=>true`, `n()`), e as duas observações "minor" do ledger (aviso de Tubo ausente duplicado e a trava v1 que deixa passar qualquer op `seguranca`) somem com a remoção do importador e da trava.

### Repasse para o bloco 2
- Defeito 1 e 2 viram itens da Task 3; defeito 3, da Task 2.
- Ponto aberto: `portal-base`, `perdas-base` e `fifo-base` não gravam `schemaVersion`; a Task 3 e a Task 5 acrescentam `schemaVersion: 1` antes de ligar o bloqueio (ver "Pontos de atenção" em `docs/BASE-LIMPA.md`).

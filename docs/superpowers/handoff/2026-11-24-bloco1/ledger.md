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

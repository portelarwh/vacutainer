# Base limpa (24/11/2026): inventário do que sai do código

Bloco 2 do desenho `docs/superpowers/specs/2026-11-24-base-limpa-e-paginas-sem-copia-design.md`. A plataforma recomeça com a base vazia. Não se escreve compatibilidade com base, cadastro ou export de versão anterior: versão diferente bloqueia a gravação ("Base de versão anterior. Comece uma base nova nesta pasta.") e o export de versão anterior de outro motor não é usado ("Dados de <página> em versão anterior").

Este documento é a lista de trabalho das Tasks 2 a 5 do plano `docs/superpowers/plans/2026-11-24-bloco2-base-limpa.md`. Cada task remove exatamente o que está marcado "sai" para ela. O código foi lido com `node scripts/bloco.mjs <id>` no HEAD `ed2e313`; os números entre parênteses são a linha dentro do bloco naquele HEAD (servem só para achar o trecho, procure pelo nome).

**Tasks:** 2 = `comum/bases`, `comum/interface` e os chamadores do teórico de gel. 3 = `motor/portal`. 4 = `motor/oee` (sem `CadSync`). 5 = `motor/gel`, `motor/perdas`, `motor/paradas`, `motor/equip`, `motor/inic`, `motor/linha`, `motor/projetos`, `modulo/*`, `ferramenta/*`, `celular/*`.

**Convenção das colunas "testes":** são os arquivos de `testes/` que exercitam o trecho (por busca no texto). "remover" = o teste só provava o código que sai; "ajustar" = o teste continua, mas muda a expectativa ou a fixture.

## Pontos de atenção para quem executa

1. **Ordem Task 2 antes dos motores.** `vacMoverBases` e `vacAvisoBases` (Task 2) têm um chamador em cada motor (`motor/portal` 620, `motor/oee` 1988, `motor/gel` 1342, `motor/perdas` 765, `motor/paradas` 419, `motor/equip` 281, `motor/inic` 300, `motor/linha` 449). A Task 2 deve tirar também essa linha de cada chamador (é mecânica) para o commit ficar verde; as Tasks 3 a 5 só conferem o `PROIBIDO`. O mesmo vale para `vacFila(...).importar` (chamadores `migrarFila` em paradas/equip/inic/linha, `motor/gel` 1345, `motor/portal` 1998) e para `acoesLegado` (leitor em `comum/interface` `vacFicha.FONTES`, escritor em `motor/perdas`, leitor em `motor/inic`).
2. **Bases sem `schemaVersion` hoje.** `portal-base.json` (`schema:'portal-base'`), `perdas-base.json` (`schema:'perdas-base'`) e `fifo-base.json` (`snapshotData` com `version:1`) não gravam `schemaVersion`. Se a validação passar a exigir `schemaVersion` igual à do motor, a base nova delas seria bloqueada. As Tasks 3 e 5 têm de acrescentar `schemaVersion: 1` ao `emptyBase`/`vazio` desses três antes de ligar o bloqueio (e o teste `base-limpa-formato` cobrir os três). Todos os outros motores já gravam `schemaVersion: 1` (oee, ordens, paradas, equipamentos, iniciativas, linha 360°); o cadastro é 2.
3. **Todas as versões atuais são 1** (bases) e `exportsVersion: 1` (exports). "Versão anterior" na prática é "sem número" ou menor que a atual. O teste do export em versão anterior (Task 2, item d) precisa alterar o número para `0` ou remover o campo, não para 1.
4. **`vacGel.procAt(null)`** é chamado em `motor/gel` (6898, `lossFrac(vacGel.procAt(null))`). Com `procAt` devolvendo `null` sem vigência isso quebra; a Task 2 trata junto com os outros chamadores (lista abaixo).
5. **Leitura "dados brutos" do Portal** (`adaptOEE`, `adaptGel`, `adaptPerdas`, com `bruto:true`) é a única via da demonstração do Portal (`MOD.data.* = adapt(...)`, `motor/portal` 4205-4211). Está marcada "fica" abaixo; só sai se a demonstração passar a gerar exports.
6. **Fora da lista do desenho, marcado "fica":** preferências do navegador (nomes antigos de tema em português, lista `vac.sistemas` com nome antigo, aspas em chaves comuns do Paradas), aliases de navegação (`#aba=piloto`, `#aba=panel`) e caminhos de arquivos de marca. Não são base, cadastro nem export. Se o responsável quiser tirá-los também, mudam para "sai" sem outro efeito.

---

## comum/bases

| trecho (função ou id) | o que faz | decisão | motivo | task |
|---|---|---|---|---|
| `VAC_BASES_DIR`, `vacRaiz` ramo "arquivo vazio na pasta de bases: usa a raiz" e `return raiz.getFileHandle(nome)` quando a base não está em `00. Bases` (391-423) | lê a base na raiz da pasta quando ainda não foi movida para `00. Bases` | sai (só o ramo de leitura na raiz; `vacRaiz` continua levando as bases para `00. Bases` na gravação e na leitura) | layout antigo de pasta | 2 |
| `vacMoverBases`, `vacMoverUma`, `decidir`, `tirarDaRaiz`, trava `.<base>.migrando`, backup tipo `raiz-antiga` e `antes-de-mover-para-00-Bases` (424-496) | move a base da raiz para `00. Bases` e guarda a raiz antiga em `00. Backups` | sai | mudança de layout de pasta; pasta nova nasce em `00. Bases` | 2 |
| `vacAvisoBases` (498-510) | mensagem do resultado de `vacMoverBases` | sai | só serve a `vacMoverBases` | 2 |
| comentário do cabeçalho "vac-bases v2" (102-116) | explica a mudança da raiz | sai | só sai junto com o código que explica | 2 |
| `vacPessoa.achar` por nome, `id(nome, idGuardado)` pelo nome, `nome()` com `achar(nomeGuardado)`, `mesma`, `deTexto` quando o texto é um nome, `opcoes` (278-297) | reconhece registro antigo que só tem nome, achando o ID pelo nome se único | sai (fica `porId`; `id(nome, idGuardado)` devolve só o `idGuardado`; `mesma` compara só IDs; `nome(id, nomeGuardado)` mostra o nome do ID e, se o ID não existir, o `nomeGuardado`) | contrato 8 perde "registro antigo só com nome" | 2 |
| comentário `vacPessoa` "Registro antigo só com nome…" (122-124) | explica a regra acima | sai | acompanha o código | 2 |
| `vacBackupRegistro.ARQ = 'registro-backup.log'` e a leitura do arquivo legado em `ler` (301, 362-388), export `ARQ` | lê o `registro-backup.log` único de antes dos logs por estação | sai (fica só `registro-backup-<id>.log`) | contrato 9 perde o log legado | 2 |
| `vacFila(...).importar` (665-668) | importa fila antiga de localStorage para a fila durável | sai | fila de versão anterior | 2 |
| `vacFila.saude` partes de "reservas antigas" (`vac.reserva.*`) | mostra reservas locais | fica | reserva atual por pasta, contrato 3 | 2 |
| IndexedDB `vac-origens` e `vac-fila` com `onupgradeneeded` (574, 622, 677) | cria os stores na primeira abertura | fica | entrada de dado novo (regra do desenho) | 2 |
| `vacFormatoBase(base, schema, versaoMax)` (684-692) | valida a base: aceita sem `schemaVersion` como versão 1 e `schemaVersion` até a conhecida | sai o ramo "sem schema é aceita"; passa a exigir versão exata e devolver `'Base de versão anterior. Comece uma base nova nesta pasta.'` quando falta ou é menor, e o texto atual para a mais nova | Task 2 define; usado por paradas, equip, inic, linha | 2 |
| `vacGel` `PROC_DEF` (160) | valor de fábrica do teórico (g 0,98; pT 2,2406; pB 0,7352; pP 0,5252) | sai | valor de fábrica do gel (seção 5, bloco 2) | 2 |
| `vacGel.procAt` (166-170) | devolve perdas vigentes mesclando `PROC_DEF` | sai o mesclar; devolve `null` sem vigência | idem | 2 |
| `vacGel.teorico` `grupos.set('', { P: procAt(date) })` e `perdas: …[0].P` (249-268) | teórico com perdas de fábrica | sai o uso de padrão; devolve `null` quando algum formato usado não tem vigência | idem | 2 |
| `vacGel.vigList`, `vigAt` com `cg.gTubo`/`bomG`/`bomKg`/`bomPct` soltos no catálogo (172-174) | lê cadastro antigo de catálogo | sai (só `cg.vig`) | cadastro antigo | 2 |
| `vacGel.bomVals` ramo `bomG` × `bomPct` (179) | converte BOM no formato antigo | sai o ramo (fica `bomKg`) | cadastro antigo | 2 |
| `vacGel.avisoImportacao` e `cadastroOk` com `+cad.schemaVersion >= 2` (186-192) | avisa "importe das bases atuais" e aceita v2 em diante | sai o aviso; `cadastroOk` exige `schemaVersion === VAC_CAD_VERSAO` (constante nova, 2) e bloco `gel` | importação v1 deixa de existir | 2 |
| `vacGel.localGel` ramos `l.legado?.some(...)` (213-214) | acha o local pelo ID antigo do Gel | sai (fica a busca por `id` + equipamento) | campo `legado` sai | 2 |
| `vacGel.ctx().cat`: `g.fmt \|\| (/75/.test(k.formato) …)` (270) | deduz o formato (100/75) do texto do catálogo antigo | sai (usa `gel.fmt`; sem formato, o catálogo não usa gel) | cadastro antigo | 2 |
| nome de reserva do local no registro de scrap (`en.local`, em `GelTurno.exp/salvar`) | guarda o nome ao lado do ID | fica | regra "quem grava guarda o nome ao lado do ID" (chamada 7 do desenho) | 2 |
| `vacGel.avisoCadastro`: acrescentar o aviso "Sem perdas teóricas do gel vigentes em dd/mm/aaaa. Confira Administração › Gel." | aviso novo | entra | Task 2 passo 5 | 2 |
| `vacCad.gel.formato/composicao/locais` | leitura do cadastro v2 | fica | formato atual | 2 |

Testes de `comum/bases`: `tbases.js` (remover `raiz-antiga`, trava, B01 a B07 de `vacMoverBases`, linhas 85-120); `fila-backup.test.mjs` (ajustar: tirar o caso do log legado, linhas 78-83); `backup-concorrencia.cjs` (ajustar: tirar o log legado, linhas 31-37); `tid_backup.js` (ajustar: casos de nome sem ID); `vaccad.test.mjs` e `vaccad-gel.test.mjs` (ajustar: `vigList`, `schemaVersion`, teste do cadastro v2 já tem `schemaVersion:2`); `tgel.js` e `gel-perdas-formato.cjs` (ajustar: fixtures com `gTubo` solto e `vacGel.teorico` sem vigência, `tgel.js` 91); `gel-fonte-unica.cjs` (ajustar: o texto do aviso, linha 7, e o caso `schemaVersion = 1`, linha 76).

### Chamadores do teórico de gel (Task 2, passo 5) — tratar `null` e mostrar o aviso

| trecho | bloco | o que faz | decisão | task |
|---|---|---|---|---|
| `GelDia.calc` (oee 9974-9990) | `motor/oee` | teórico × real do dia; já devolve `null` quando `teorico` é `null`, mas `avisoCadastro` só olha o formato: sem perdas vigentes o cartão ficaria vazio sem aviso | ajustar `GelDia.card/texto/linhas` (e o texto do relatório) para mostrar "Sem perdas teóricas do gel vigentes em dd/mm/aaaa. Confira Administração › Gel." | 2 |
| `paramsAt` (gel 1834), `gelKg` (1840), `lossFrac` (1839) | `motor/gel` | perdas por data e formato | ajustar: `paramsAt` devolve `null`; `gelKg` devolve `null` sem vigência | 2 |
| `prodCalc` (gel 4912-4925), `dayPlan`/`dayPlanSim` (1894-1931), `teoDayEst`, `dayGelKg`, `avgDayGel`, `lineKgH` (2233-2239, 4388), `rgScrapProd` e telas do registro de produção | `motor/gel` | usam `paramsAt`/`gelKg` | ajustar: aviso, sem número | 2 |
| `paramsAt(todayISO())` (gel 4224) e `lossFrac(pa)` (4236) | `motor/gel` | painel de plano | ajustar | 2 |
| `lossFrac(vacGel.procAt(null))` (gel 6898) | `motor/gel` | resumo na tela de auditoria | ajustar | 2 |
| `GelDia`/`GelTurno` (oee) usam `vacGel.avisoCadastro` | `motor/oee` | o scrap pesado não depende das perdas e continua aparecendo | conferir | 2 |

---

## comum/interface

| trecho | o que faz | decisão | motivo | task |
|---|---|---|---|---|
| `vacExportsOk(ex, conhecida)` (365-369) | aceita export sem número ou até a versão conhecida | sai o "sem número usa"; passa a exigir `exportsVersion === conhecida`; versão menor ou ausente devolve `{ok:false, motivo:'Dados de <página> em versão anterior'}` | contrato do export em versão anterior | 2 |
| `vacFicha.FONTES` perdas `acoesLegado: ex.acoesLegado` (396) | repassa as ações antigas do Waste para o Iniciativas | sai | migração de ações antigas | 2 |
| `vacFicha` leitura com `typeof vacExportsOk === 'function' ? … : {ok: !!ex}` (435) | leitor da ficha | ajustar para o aviso "Dados de <página> em versão anterior" | idem | 2 |
| IIFE "kit v2.1 · 10/11/2026" que corrige `vac.sistemas` com nome antigo ou marca "futuro" (8-30) | conserta lista local de páginas | fica | preferência do navegador, não base (ponto de atenção 6) | 2 |
| `vacPrefs` `schemaVersion: 1` (1450, 1464) | escreve o arquivo de preferências | fica | formato atual | 2 |
| `DEFAULT_PERFIS.find(p => p.codigo === 'CONSULTA')` em `filaSoContaPropria` (1639) | compara o perfil criado no autocadastro com o padrão | fica, mas acompanhar a mudança de `DEFAULT_PERFIS` (Task 3 acrescenta `assuntos`; a comparação `canon(op.item) === canon(padrao)` continua igual porque o autocadastro grava o próprio `DEFAULT_PERFIS`) | semente | 2 |
| `vacLogin`, `vacTravas`, `vacQR` | sessão e travas | fica | contrato 4 | 2 |
| `DEFAULT_SYSTEMS` em `vacEstadoDe` (282-288) | estado das páginas | fica | configuração atual, não compatibilidade | 2 |
| `#mwTrazer` na lista de seletores `importar` (1354) | seletor do botão "Trazer ações do Waste" | sai | o botão sai na Task 5 (nesta task só o seletor) | 2 |
| `indexedDB.open('vac-ficha', 1)` com `onupgradeneeded` (414) | cria o store | fica | entrada de dado novo | 2 |

Testes: `tcontratos.js` 104-105 (ajustar: `vacExportsOk({})` e `vacExportsOk({exportsVersion:1})` deixam de dar o mesmo resultado; o teste espera `[true,true,false,false,true]`), `tiniciativas.js` (ajustar o trecho de `acoesLegado`).

---

## motor/portal

Locadores: tudo em `Plataforma.html` bloco `motor/portal`.

| trecho | o que faz | decisão | motivo | task |
|---|---|---|---|---|
| `ImportarV1` (2245-2347), `cadImportarV1` (2348-2351), caso `'importação v1'` em `aplicarOp` (1932) | importador de uso único do formato 1 | sai | desenho, "Do bloco 1" | 3 |
| faixa `#cadV1` com o botão `#cadV1Abrir` (2171) e o handler `cadV1Abrir` (2176) | aviso "Cadastro no formato antigo" | sai | idem | 3 |
| trava v1 em `Cad.ops`: `if(this.D&&!(+this.D.schemaVersion>=2)){const x=list.find(o=>!ImportarV1.permitida(o))…` (2033) | só deixa gravar a importação enquanto o cadastro é v1 | sai | idem | 3 |
| item `importarV1` em `CAD_SECS` (1736), no menu Sistema (2362), em `ADM_ROT` (2369), no seletor de menu (2373), no mapa de telas (2181) | rota e botão "Importar das bases atuais" | sai | idem | 3 |
| `admNivelTransicao` (2241-2243) e a chamada em `Cad.nivelAssunto` (2028-2029) | decide o nível do perfil sem `assuntos` pelo nome do perfil | sai; `Cad.nivelAssunto` lê só `perfil.assuntos[assunto]` e sem `assuntos` devolve `'ver'` | contrato do desenho | 3 |
| `admPerfilEdita` (usado só pela transição) | fecha o nível por `permissoes` | sai se ficar sem uso; conferir | idem | 3 |
| `DEFAULT_PERFIS` (1537) | semente do botão "Criar os perfis padrão" e do autocadastro | fica, acrescentando `assuntos`: Processos edita tudo; PCP edita planta e turnos; Almoxarifado edita gel; ADMIN edita tudo; os outros só veem | decisão do responsável (semente) | 3 |
| `TrazCfg` (3678-3790) e o botão `#cadTrazerCfg` (2394, 2397), sua ajuda `CAT_AJUDA.trazerCfg` (1709) e as ajudas `AJUDA_CAMPO['trazer.*']` (1673-1694), item de guia `#cadTrazerCfg` (4296) | "Trazer configurações das páginas" | sai | desenho | 3 |
| `Carga` (3172-3290), botões `#cadCarga` (2385) e `#cadCompletar` (2392-2397), "Criar cadastro a partir das páginas" | carga inicial a partir das bases dos motores | sai | migração de base antiga | 3 |
| `parCargaLinhas`, `parCargaHtml`, `parCargaWire`, `parCargaOps`, `PAR_NOVOS`, `PAR_TXT` (3108-3170) | carga do catálogo proposto do Paradas (`exports.cadastros`) | sai | só é chamado de `Carga.completar` (3251, 3261-3272); ficaria órfão | 3 |
| aviso `MOD.data.paradas.cadProp` em `allPend` (2100) | pendência "N códigos do catálogo proposto do Paradas" | sai | depende do item acima | 3 |
| `GEL_PROC_DEF` (3866) e seu uso em "+ Vigência" (3986) | valor de fábrica do gel | sai; "+ Vigência" sem anterior abre com campos vazios | desenho | 3 |
| `cadVazio` com `schemaVersion:2` (1836) | cadastro novo | fica | formato atual | 3 |
| `cadFix` `if(+d.schemaVersion>=2){…gel…}` (1838) | completa o bloco `gel` só em v2 | sai a condição (o bloco `gel` é sempre criado) | só existe v2 | 3 |
| validação `+d.schemaVersion>2` (1856) | só recusa versão mais nova | passa a exigir `=== VAC_CAD_VERSAO`; versão menor ou ausente: "Base de versão anterior. Comece uma base nova nesta pasta.", só consulta | desenho | 3 |
| gravação `novo.schemaVersion=Math.max(1,+novo.schemaVersion\|\|1)` (2063) | preserva v1 ao gravar | sai (grava `VAC_CAD_VERSAO`) | idem | 3 |
| tela Gel `if(!(+D.schemaVersion>=2)\|\|!D.gel){… formato 1 …}` (3885) | aviso de cadastro v1 na tela Gel | sai | idem | 3 |
| `acao==='carga'` com `cadFix(clone(o.doc))` (1996-2076) e botão `#cadRecriar` (2177) | cria ou recria o cadastro inteiro | fica | é a criação da base vazia e a restauração de backup, não migração | 3 |
| `Cad` leitura da fila antiga: `if(Array.isArray(f)){… this.fq.importar(f, …'cadFila.antiga')` (1997-1998) | importa fila de uma versão sem fila durável | sai | fila de versão anterior | 3 |
| `migrarSistemas`, `NOMES_ANTIGOS`, `IDS_SAIRAM` (489-492) e a chamada em 4220 | converte lista local `vac.sistemas` | fica | preferência do navegador (ponto de atenção 6) | 3 |
| busca da base e do HTML em subpastas e nomes antigos: `loc` com `antigo`, `def.alt`, `MOD.files[...].antigo`, `cardPastaUnica`, `Store` "local antigo" (877-888, 907-908, 1081, 1338-1342, 1359-1363, 1373, 1393-1410, 2101) | acha módulo em local antigo e avisa para mover | sai | layout antigo de pasta; pasta nova nasce certa | 3 |
| aviso "cabeçalho antigo (sem o vac-cabecalho)" e "cabeçalho vN" em `Versões` (1408) | confere o cabeçalho dos HTML | fica | é verificação do HTML atual | 3 |
| `exV1` (920) e seus usos (910, 914, 924, 942, 954, 975, 998) | aceita export sem `exportsVersion` ou versão 1 | ajustar: exige `exportsVersion === 1`; sem número ou menor: aviso "Dados de <página> em versão anterior" e não usa | contrato | 3 |
| `adaptOEE`, `adaptGel`, `adaptPerdas` ramos "dados brutos" (922-972, 984-994, `bruto:true`) | calculam números a partir da base crua quando não há exports | fica (decisão da Task 3) | usado pela demonstração do Portal (4205-4211); a casca "não recalcula" por contrato, mas remover exige trocar a demo para exports | 3 |
| `adaptPerdas` `wv=x=>…x.muv!=null?x.muv:x.liquido` (987) | exports sem MUV (Waste antigo) usa o desvio líquido | sai o caso sem `muv` | export anterior | 3 |
| `NOVIDADES` com textos "Trazer" (1752-1776) | histórico | fica | é registro; só acrescentar a entrada nova | 3 |
| `indexedDB.open(name,1)` com `onupgradeneeded` (599) | cria o store `kv` | fica | entrada de dado novo | 3 |
| `DEFAULT_SYSTEMS` (477) | páginas padrão | fica | configuração atual | 3 |
| `exports` do Portal (866) `exportsVersion:1` | publica o próprio export | fica | formato atual | 3 |
| `portal-base` sem `schemaVersion` (861) | base do Portal | acrescentar `schemaVersion: 1` e bloquear a anterior | ponto de atenção 2 | 3 |

Testes de `motor/portal`: `adm-importar.cjs` (remover, e tirar da linha 13 de `scripts/testar-plataforma.mjs`); `tportalfonte.js` (remover as partes de "Trazer configurações": linhas 18-19 `ARQ-06`, 86-95 `ARQ-01/02/04`, 137+ "Trazer … Gel"; ajustar linha 111, fixture com `schemaVersion: 2`); `tgel.js` (remover o trecho do `ImportarV1`/`TrazCfg`, linhas 19, 132-138; ajustar o resto); `t18c.js` (remover: só exercita `#cadTrazerCfg`); `adm-assuntos.cjs` (ajustar: linhas 5, 33, 52-53; acrescentar os casos da Task 3); `conta.cjs` (ajustar: `DEFAULT_PERFIS` ganha `assuntos`); `permissoes-paridade.cjs`, `cfg-adm.cjs`, `adm-gel.cjs`, `cad-consulta.cjs` (conferir); `tpendencias.js` (ajustar: fila antiga, linhas 67-73, e `schemaVersion: 1` da fixture).

---

## motor/oee

Não mexe no `CadSync` (bloco 3).

| trecho | o que faz | decisão | motivo | task |
|---|---|---|---|---|
| `Schema.ensure(db)` (868-897) completando listas, `db.server`, `db.timeline`, `settings` com `DEFAULT_SETTINGS` | completa campos que faltam em "bases antigas ou importadas" | sai o que só existe para base antiga (`db.timeline` "base antiga sem ele continua válida", conversão do calendário do plano de "versões antigas" 887-893, `ServerData.semCaixaRepetida` "base com dias importados antes da correção" 879), desde que `emptyBase` já crie os blocos; conferir `emptyBase` antes | desenho | 4 |
| `parseBaseText`: `missing`, `_migrated` e comentário "bases antigas é completado e listado" (935-938) e o consumo em `Store` (2007-2010: auditoria "migração da base", `_needBackup=['migração']`) | grava a migração com backup ao abrir base antiga | sai | desenho | 4 |
| `validateStructure`: `schemaVersion inválido`; `parseBaseText`: `db.schemaVersion > SCHEMA_VERSION` (910, 932) | só recusa a mais nova | passa a exigir `schemaVersion === SCHEMA_VERSION` (1); ausente ou menor: "Base de versão anterior. Comece uma base nova nesta pasta." (somente leitura) | desenho | 4 |
| `if (!db.schemaVersion) db.schemaVersion = SCHEMA_VERSION` (886) e `if (db.databaseVersion == null) db.databaseVersion = 0` (885) | preenche versão ausente | sai | idem | 4 |
| `DEFAULT_SETTINGS` (771) | configuração inicial da base nova | fica | semente da base nova, tela de configuração existe | 4 |
| `emptyBase`/`seed` (790-866) | base nova | fica | é a base vazia | 4 |
| `Cfg.demo.render`: `legacy = !ex && Demo.present()` e o cartão "Restos da demonstração antiga" (6403-6406) | limpa restos da demonstração gravada nas bases de versões anteriores | sai (`Demo.present` e o botão de limpeza, se só servirem a isso) | demonstração só existe na memória | 4 |
| `Store` `backupRoot`/`listBackups`/`readBackup(name, legacy)` e o cartão "Os backups antigos soltos em 00. Backups" (1783-1793, 1811-1812, 6277, 6298) | lista backups em `00. Backups` solto, "local antigo" | sai | layout antigo de pasta | 4 |
| `OrdensSAP` `vazio()` com `schemaVersion: 1` (14110) e leitura da base de ordens | base de ordens | fica; conferir leitor de `ordens-base.json` | formato atual | 4 |
| `vacExportsOk(ex).ok` com "Fonte sem exports compatível." (13448) | lê exports de outro motor | ajustar para o aviso "Dados de <página> em versão anterior" | contrato | 4 |
| leitor do Waste: `vk = vacExportsOk(...)` (14211) | idem | ajustar | idem | 4 |
| `GelTurno.estado/ensure` mensagem "Portal › Cadastros › Início › Trazer configurações" (14814) | texto que aponta para a função removida | sai o texto | acompanha a Task 3 | 4 |
| `sqdcpTurnos` "registro SQDCP preservado da importação" (13156) | mostra SQDCP de turno que não existe mais no dia | fica | regra de importação atual, não compatibilidade (contrato 6 e 7) | 4 |
| `GelDia.calc` (9974-9990) | ver "Chamadores do teórico de gel" | ajustar | Task 2 faz; Task 4 só confere | 2 |
| `GelTurno` `vacGel.localGel`, `antigas`, `antiga?.local` (9802-9921) | nome de reserva do local | fica | chamada 7 do desenho | 4 |
| `TUR-05` "horário antigo do turno" (2314-2364, 5375-5376, 6414-6449, 8060-8066) | recalcula dias com horário de turno mudado no cadastro | fica | regra de negócio, não compatibilidade de formato | 4 |
| `indexedDB onupgradeneeded` (1727) | cria o store | fica | entrada de dado novo | 4 |
| `CadSync` (1977-1990, 6198, 14700-14900) | lê o cadastro do Portal e aplica na base | fica | sai só no bloco 3 | 4 |
| `Cfg` redireciona seção antiga de cadastro (`cfgAdmRota`, 6198-6205), `#aba=panel` (10041) | navegação | fica | alias de navegação (ponto de atenção 6) | 4 |
| `Cfg` importação de planilha antiga RELATÓRIO/PARADAS (6462-6473) | lê arquivos externos | fica | dado que entra (planilha de origem) | 4 |
| `DEFAULT_SYSTEMS` (5002) | páginas padrão | fica | configuração atual | 4 |
| `TAGS_PADRAO` | tags da Timeline | fica | sai no bloco 3 | 4 |

Testes de `motor/oee`: `tbases.js`, `tcorrecoes.js`, `tordens.js`, `tprefs.js`, `trelatorios.js`, `tgel_vg.js`, `tpermissoes.js` (conferir os que gravam bases sem `schemaVersion` ou com versão diferente; ajustar a fixture); testes de `testes/plataforma/` `turno-*`, `tur05-fechado`, `lancamento-modos` ficam (TUR-05); `tconstrucao.js`, `tordens.js` (os "local antigo" listados na busca são de backup, ajustar se tocarem em `listBackups`).

---

## motor/gel

| trecho | o que faz | decisão | motivo | task |
|---|---|---|---|---|
| `Store.load()` `LS.get('fifo.data.v1')` (932) | carrega dados de um formato de localStorage anterior | sai | versão anterior | 5 |
| `snapshotData` `version:1` e backup `version:2` (969, 3817) | formato do snapshot | conferir; acrescentar `schemaVersion: 1` no `fifo-base.json` e bloquear a anterior | ponto de atenção 2 | 5 |
| `F.importar(velha, …'fsPending.antiga')` (1345) | importa fila antiga `fsPending` | sai | fila anterior | 5 |
| `vacGel.vigList/vigAt` locais: `catVigList` (4414) e `bomVals` com `bomG × bomPct` (4418-4419) | cópia local do cadastro antigo de catálogo | sai (só `vig`, `bomKg`) | cadastro antigo (a cópia comum sai na Task 2) | 5 |
| programação "formato antigo: número de barris" (1832) | lê dia com número em vez de `{orders}` | conferir o código; sai se existir ramo de leitura | formato anterior | 5 |
| "cadastros antigos só em R$" (1844) | converte preço antigo | sai o ramo | formato anterior | 5 |
| "baixas antigas, sem o dado, contam inteiras" (2003-2004) `bxNet` | cálculo da baixa sem o campo `rem` | fica | `rem` é opcional no formato atual | 5 |
| `pcpOldBaseDel`, "Congelamentos antigos, sem plano" (4101, 4844) | trata congelamentos de antes do plano | sai (função e alerta) | versão anterior | 5 |
| "projeção anual antiga (antes do FY)" (6394) | converte projeção | sai | versão anterior | 5 |
| listagem de backups "local antigo" (1315, 1330-1331) | backups soltos em `00. Backups` | sai | layout antigo | 5 |
| `vacThemeGet` aceita `claro/escuro/automatico` (1035-1038) | aliases de tema | fica | preferência do navegador (ponto de atenção 6) | 5 |
| `DEFAULT_CFG` (699), `DEFAULT_NAME`, `DBK_DEF`, `DBB_DEF`, `REP_DEF` | padrões do estoque, do painel e do relatório | fica | padrões de estoque saem no bloco 4; os de painel são modelos de tela | 5 |
| vínculo de rotas antigas `cfgAdmGel(sec)` → consulta (3708-3712) | navegação | fica | alias | 5 |
| `indexedDB.open('fifo-fs',1)` com `onupgradeneeded` (959) | cria o store | fica | entrada de dado nova | 5 |
| `GelCad`, `GelProd`, `lerExports` e `exports` `exportsVersion:1` (1090) | leituras entre motores | ajustar para "Dados de <página> em versão anterior" onde lê export de outro motor | contrato | 5 |
| `PROC_DEF` / chamadores do teórico | ver "Chamadores do teórico de gel" | ajustar | Task 2 | 2 |

Testes de `motor/gel`: `tgel.js` (ajustar: `gTubo` solto; remover o que usa `ImportarV1`), `tgel_vg.js`, `gel-numeros.cjs`, `gel-perdas-formato.cjs`, `gel-producao.cjs`, `gel-relatorio.cjs`, `gel-fonte-unica.cjs`, `scrap-lado.cjs` (conferir; os números têm de ficar iguais), `tpendencias.js` (fila antiga do Gel).

---

## motor/perdas (Waste)

| trecho | o que faz | decisão | motivo | task |
|---|---|---|---|---|
| `WAc.legado()`, `migradas()`, `todas()`, `desvia()` com o ramo "antiga já trazida", e o aviso/ajuda das "ações antigas" (1256-1302, 448, 2588) | mantém as ações do Waste anteriores à Iniciativas | sai; a ação só tem `origem` | desenho (Iniciativas) | 5 |
| `exports.acoesLegado` (1315-1316) | publica as ações antigas para a Iniciativas | sai | idem | 5 |
| comentário "As antigas vêm UMA vez…" (1256-1258) | acompanha | sai | acompanha | 5 |
| ordens no "formato antigo (sem Desv. empregado)": `o.aprox`, `nAprox`, o aviso em 1397 e 1856, a faixa "N de M ordens no formato antigo" (2425-2432) e `dEmpOf` ramo `null` (1210, 1397, 1856, 2425-2432) | aproxima o MUV de linha antiga até reimportar | sai o rótulo e a faixa; a ordem sem Desv. empregado é tratada como dado ausente (nunca vira zero, contrato 1) | formato de importação anterior | 5 |
| `DEFAULT_ALIAS`, `DEFAULT_CAUSAS`, `DEFAULT_TIPOS` (623-665, 688, 1984, 2351, 2499) | nomes de cabeçalho e listas de causas e tipos | fica | `DEFAULT_CAUSAS` e `DEFAULT_TIPOS` saem no bloco 4; os nomes de cabeçalho são do leitor SAP (entrada de dado novo) | 5 |
| `1.9.0: nomes novos do padrão valem também em base antiga` (866) | acrescenta aliases novos a bases com alias antigo | sai o comentário; conferir o laço (é mescla do padrão com o salvo) | desenho | 5 |
| `emptyBase()`/`fixBase()` sem `schemaVersion` (685-690) | base do Waste | acrescentar `schemaVersion: 1` e bloquear a anterior | ponto de atenção 2 | 5 |
| `OEE.incompat`/`vk = vacExportsOk(...)` (1609-1620) e `GEL.src.exports.exportsVersion` (1813, 1821, 1831) | lê exports do OEE e do Gel | ajustar para o aviso "Dados de <página> em versão anterior" e tirar `exportsVersion==null` | contrato | 5 |
| listagem de backups com `antigo` (2512-2522) | backups soltos em `00. Backups` | sai | layout antigo | 5 |
| `indexedDB.open('perdas-ordem',1)` com `onupgradeneeded` (741) | cria o store | fica | entrada de dado nova | 5 |
| `restoreBase` (2507) | restaura backup | fica | recuperação do formato atual | 5 |
| `systems()` com `ren` do nome "Perdas"→"Waste" (1711) | renomeia entrada da lista local | fica | preferência do navegador | 5 |

Testes de `motor/perdas`: `twaste_*.js`, `tordens.js` (conferir; ajustar o que usa "formato antigo"/`aprox`), `tiniciativas.js` (ajustar: `acoesLegado`, `WAc.desvia`, linhas 62-91).

---

## motor/paradas

| trecho | o que faz | decisão | motivo | task |
|---|---|---|---|---|
| `LS.get` com `LS_TEXTO` e aspas "formato antigo" (286-290) | lê chaves comuns gravadas com aspas até a 1.0.7 | fica | preferência do navegador (ponto de atenção 6); decisão do responsável | 5 |
| `migrarFila` e o ramo `leg`/`_leg` em `abrirFila`/`espelhar` (390, 393-394, 426) | importa fila de localStorage anterior | sai | fila anterior | 5 |
| `findBase` com busca em subpasta (413-420), `Store.legacy`, `legacy` (912, 993) | acha a base em local antigo e avisa | sai | layout antigo | 5 |
| `listBackups` `antigo:true` (456-457, 1563) | backups soltos em `00. Backups` | sai | layout antigo | 5 |
| `vacFormatoBase(x.obj,'vac-paradas',1)` (414) | valida o formato | ajustar (versão exata, Task 2) | desenho | 5 |
| `vazio()` `schemaVersion:1` (326) | base nova | fica | formato atual | 5 |
| importação "Forms antigo" e "HTML antigo" (`html-antigo`, `sugerirAntigo`, `layout==='antigo'`, 637-716, 1491-1512) | lê planilhas e HTML de origem externa | fica | dado novo que entra (arquivo de origem), não base da plataforma | 5 |
| `exports` e leitores de OEE/Equip/Inic com `vacExportsOk` (470-475) | lê exports de outros motores | ajustar para o aviso | contrato | 5 |
| exports do Paradas `cadastros` ("catálogo proposto", 943) | publica o catálogo proposto para o Portal | sai | só o item `parCarga*` do Portal o lia | 5 |
| "Exportações antigas usam a vigência da data como estimativa" (739) | tempo planejado do turno sem o dado do OEE | conferir; sai o ramo de estimativa se a Produção sempre publica | export anterior | 5 |
| `indexedDB.open('vac-sistemas',1)` com `onupgradeneeded` (321) | cria o store | fica | entrada de dado nova | 5 |
| `DEFAULT_SYSTEMS` (1012) | páginas padrão | fica | configuração atual | 5 |

Testes de `motor/paradas`: `tparadas_*.js`, `tpendencias.js` (ajustar: fila antiga, linhas 67-73), `tintegra.js` (conferir).

---

## motor/equip

| trecho | o que faz | decisão | motivo | task |
|---|---|---|---|---|
| `migrarFila` e `_leg` (254, 257-259, 293) | importa fila antiga | sai | fila anterior | 5 |
| `vacFormatoBase(o,'vac-equipamentos',1)` (276) | valida o formato | ajustar (versão exata) | desenho | 5 |
| leitores `lerParadas`, `lerInic` com `vacExportsOk` (278, 286) | exports de outros motores | ajustar para o aviso | contrato | 5 |
| `vazio()` `schemaVersion:1` (227) | base nova | fica | formato atual | 5 |
| `indexedDB onupgradeneeded` (222) | cria o store | fica | entrada de dado nova | 5 |
| `DEFAULT_SYSTEMS` (83) | páginas padrão | fica | configuração atual | 5 |
| `vigencias` de TAG (419) | mudança de TAG gera vigência | fica | regra de vigência | 5 |

Testes: `tequip.js`, `equip-ordem.cjs`, `tpendencias.js` (fila antiga).

---

## motor/inic

| trecho | o que faz | decisão | motivo | task |
|---|---|---|---|---|
| `MigWaste` (556-587), botão `#mwTrazer` (579, 632), cartão "Ações do Waste", ajuda `config.campos` (696), `legadoHtml` (444, 576), campo `legado` das ações (574), importação `MIGW-` | "Trazer ações do Waste" | sai | desenho (uma ação só tem `origem`) | 5 |
| `migrarFila` e `_leg` (274, 277-279, 308) | importa fila antiga | sai | fila anterior | 5 |
| `vacFormatoBase(o,'vac-iniciativas',1)` (297) | valida o formato | ajustar (versão exata) | desenho | 5 |
| `vazio()` `schemaVersion:1` (242) | base nova | fica | formato atual | 5 |
| `indexedDB onupgradeneeded` (237) | cria o store | fica | entrada de dado nova | 5 |
| `DEFAULT_SYSTEMS` (86) | páginas padrão | fica | configuração atual | 5 |

Testes: `tiniciativas.js` (remover as partes de `MigWaste`; ajustar o resto), `tplanner.js`, `tl03-acoes.cjs` (conferir).

---

## motor/linha

| trecho | o que faz | decisão | motivo | task |
|---|---|---|---|---|
| `migrarFila` e `_leg` (424, 427-429, 458) | importa fila antiga | sai | fila anterior | 5 |
| `vacFormatoBase(o,'vac-linha360',1)` (446) | valida o formato | ajustar (versão exata) | desenho | 5 |
| `vazio()` `schemaVersion:1` (553) e a nota "formularios nasce no 1º formulário para não mudar uma base antiga" (554) | base nova | fica o `vazio`; a nota sai (bloco aditivo `formularios` fica opcional por design) | formato atual | 5 |
| `FM_LOGO_ANTIGA` (940, 1007) | logo em caminho antigo | fica | caminho de arquivo de marca (ponto de atenção 6) | 5 |
| aba `piloto` antiga abre a Visão da linha (1269-1272) | navegação | fica | alias | 5 |
| `indexedDB onupgradeneeded` (416) | cria o store | fica | entrada de dado nova | 5 |
| `DEFAULT_SYSTEMS` (297) | páginas padrão | fica | configuração atual | 5 |
| leitor `lerExt` (812) com `exportsVersion` | exports de outros motores | ajustar para o aviso | contrato | 5 |

Testes: `linha-pontos.cjs`, `linha-fotos.cjs`, `linha-ficha.cjs`, `formularios.cjs`, `form-*.cjs`, `tpendencias.js` (fila antiga).

---

## motor/projetos

| trecho | o que faz | decisão | motivo | task |
|---|---|---|---|---|
| `DEFAULT_SYSTEMS` (45) | páginas padrão | fica | configuração atual; o módulo está em construção e não tem base | 5 |

Nada sai.

---

## modulo/*

| trecho | o que faz | decisão | motivo | task |
|---|---|---|---|---|
| `modulo/core/data` `v.data.exportsVersion != null && v.data.exportsVersion !== 1` (8) | aceita export sem versão | sai o "sem versão usa"; exige `exportsVersion === 1`; devolve o aviso "Dados de <página> em versão anterior" | contrato | 5 |
| `modulo/core/data` estado `incompativel` e textos "compatível" (7-15), `modulo/App` `s.state === 'incompativel'` (425, 671, 693) | estado de fonte não usável | fica (o nome do estado não é compatibilidade com base antiga) | semântica atual | 5 |
| `modulo/App` `MARCA_DIR_ANTIGA` (3, 884) | procura fotos de login também na pasta `Marca/` antiga | fica | caminho de arquivo de marca (ponto de atenção 6); `docs/MARCA.md` | 5 |
| `modulo/App` rota antiga do Portal (25, 197) | redireciona `#portal` | fica | alias de navegação | 5 |
| `modulo/core/compatibility` (`protectFolder`) | proteção da pasta | fica | nome enganoso; não trata versão de base | 5 |
| `modulo/core/data` `onupgradeneeded` (140) e `modulo/core/scopes` (26, 90) | cria/aborta store | fica | entrada de dado nova | 5 |
| demais `modulo/*` (components, auth, modules, permissoes, text, main, runtime) | casca | fica | sem compatibilidade | 5 |

Testes: `compatibility.test.mjs` (conferir; testa `protectFolder`), `core.test.mjs`, `scopes.test.mjs`, `contrato-cadastro.test.mjs` (conferir leitura de export sem versão).

---

## ferramenta/*

| trecho | o que faz | decisão | motivo | task |
|---|---|---|---|---|
| `ferramenta/verificar` `PAGINAS_ANTIGAS` e o aviso "Páginas individuais" (77, 150-152) | avisa HTML individuais antigos na raiz da pasta | sai | layout antigo de pasta | 5 |
| `ferramenta/verificar` `versão anterior à esperada; atualiza ao gravar` (177) | trata a base anterior como atualizável | sai; passa a dizer "Base de versão anterior. Comece uma base nova nesta pasta." | desenho | 5 |
| `ferramenta/verificar` aviso de arquivo temporário "se for antigo" (191) | diagnóstico | fica | não é compatibilidade | 5 |
| `ferramenta/comparar` `v1.2` e `RELATORIO`/`PARADAS_XLSM` "planilha antiga" (6, 44, 134, 138) | versão da ferramenta e importadores de planilha externa | fica | dado que entra | 5 |

Testes: `ferramenta-verificar.test.mjs` (ajustar: página individual na raiz e base anterior), `tcomparar.js` (conferir).

---

## celular/*

| trecho | o que faz | decisão | motivo | task |
|---|---|---|---|---|
| `celular/meu-turno` "Turno antigo sem catSnap usa a configuração atual" (2442) | lê turno gravado no próprio celular sem o instantâneo do catálogo | fica | dado local do app, sem base da plataforma; não há leitura de versão anterior da base | 5 |
| `celular/meu-turno` `indexedDB.open('meuturno',1)` com `onupgradeneeded` (2457) | cria o store | fica | entrada de dado nova | 5 |
| `celular/manutencao` `LS` (2401) "atendimentos antigos" | mensagem de memória cheia | fica | texto | 5 |

Nada sai. Se `CELULAR/*.html` mudar, regerar os blocos com `node scripts/bloco.mjs celular/meu-turno CELULAR/index.html` e `celular/manutencao CELULAR/manutencao.html`.

---

## Conferência contra a lista "Sai do código" da seção 5, bloco 2, do desenho

| item do desenho | onde está marcado "sai" | task |
|---|---|---|
| `ImportarV1`, `#cadV1`, tela `importarV1`, trava v1 em `Cad.ops` | motor/portal | 3 |
| `admNivelTransicao` e a transição de perfis sem `assuntos` | motor/portal (`Cad.nivelAssunto`) | 3 |
| `legado` dos locais de gel | comum/bases `localGel`; motor/portal `ImportarV1` (somem juntos) | 2, 3 |
| nome de reserva quando serve só a registro antigo | fica (chamada 7: é a regra "quem grava guarda o nome") | 2 |
| `TrazCfg` e a tela | motor/portal | 3 |
| `vigList` do gel com `gTubo` solto | comum/bases e motor/gel `catVigList` | 2, 5 |
| `bomPct` antigo | comum/bases `bomVals`; motor/gel `bomVals` | 2, 5 |
| versões antigas de base aceitas com conversão e todo `schemaVersion` só a atual | comum/bases `vacFormatoBase`; motor/portal `cadFix`/validação; motor/oee `parseBaseText`/`ensure` | 2, 3, 4 |
| `PROC_DEF` e `GEL_PROC_DEF` | comum/bases; motor/portal | 2, 3 |
| `TAGS_PADRAO` (bloco 3), `DEFAULT_CAUSAS`/`DEFAULT_TIPOS` e padrões do estoque do Gel (bloco 4), `CadSync` (bloco 3) | fica | — |
| `DEFAULT_PERFIS` | fica como semente, com `assuntos` | 3 |
| testes de migração e de importação v1 | `adm-importar.cjs`, partes de `tportalfonte.js`, `tgel.js`, `t18c.js`, `tbases.js`, `tiniciativas.js` | 3, 2, 5 |
| contratos 8 e 9 do `CLAUDE.md`/`AGENTS.md` | Task 2, passo 6 | 2 |

Itens acrescentados por esta revisão e que o desenho não cita: mudança da base da raiz para `00. Bases` (Task 2), `vacExportsOk` aceitando export sem número (Task 2), leitura do `registro-backup.log` legado (Task 2, já no contrato 9), importação da fila antiga (Task 2 e motores), busca da base em local antigo (Tasks 3 a 5), ações antigas do Waste (Task 5), conversões de `schemaVersion` do OEE (Task 4), ordens do Waste "no formato antigo" (Task 5).

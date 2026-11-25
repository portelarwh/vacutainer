# Bloco 2 · Base limpa e carga por tabela · Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tirar do código todo caminho de compatibilidade com base, cadastro ou export de versão anterior (incluindo o que o bloco 1 deixou) e dar à Administração carga por tabela (arquivo ou colagem do Excel) para cada cadastro.

**Architecture:** Tudo fica em `Plataforma.html`, em blocos `data-vac-source`. O trabalho tem quatro partes:
1. Revisão do bloco 1 e inventário do que sai (`docs/BASE-LIMPA.md`).
2. Remoções por área, cada uma com o seu padrão proibido no teste de contrato `testes/plataforma/base-limpa.test.mjs`.
3. Um importador genérico `CargaTab` (motor/portal), guiado pelas definições `CAD_T` e pelas do Gel. Ele substitui a importação do `ParLote` e o "Criar cadastro a partir das páginas".
4. A entrega.

**Tech Stack:** JavaScript ES2022 no HTML único, SheetJS incorporado (`biblioteca/*`) para .xlsx e Playwright 1.63 para os testes `testes/plataforma/*.cjs`, `node --test` para `*.test.mjs` e a suíte `testes/tudo.js`.

**Spec:** `docs/superpowers/specs/2026-11-24-base-limpa-e-paginas-sem-copia-design.md` (bloco 2, seções 5 e 7).

## Global Constraints

- **Edição do HTML:**
  - Leia um bloco com `node scripts/bloco.mjs <id>`.
  - Edite por script que troca textos exatos e confere quantas vezes cada um aparece.
  - No texto novo, `&` vira `&amp;` e `</textarea` vira `&lt;/textarea`.
  - Depois de cada edição, `npm run -s atualizar:metadados` tem de dizer "HTML único verificado".
- **Testes:** todo teste novo de navegador entra na lista da linha 13 de `scripts/testar-plataforma.mjs`. Os testes rodam sem internet: `NODE_OPTIONS="--require $PWD/testes/http-local.cjs"`.
- **Nenhuma compatibilidade:** base, cadastro ou export de versão anterior não é convertido nem lido como se fosse atual.
- **Texto exato do bloqueio de base:** "Base de versão anterior. Comece uma base nova nesta pasta." A base fica só para consulta, sem gravar. Base mais nova que o código continua bloqueada como hoje.
- **Export de outro motor em versão anterior:** a página avisa "Dados de <página> em versão anterior" e não usa o dado. Nunca vira zero.
- **Valor de fábrica:** neste bloco saem só os do gel (`PROC_DEF` em `comum/bases` e `GEL_PROC_DEF` em `motor/portal`). Sem vigência de perdas, o teórico de gel não é calculado e aparece o aviso. `TAGS_PADRAO`, `DEFAULT_CAUSAS`, `DEFAULT_TIPOS` e os padrões do estoque do Gel **ficam** até os blocos 3 e 4.
- **`DEFAULT_PERFIS` fica**, só como semente pelo botão "Criar os perfis padrão". Cada perfil-semente traz `assuntos` explícitos: Processos edita tudo; PCP edita planta e turnos; Almoxarifado edita gel; ADMIN edita tudo; os outros só veem.
- **Permissão por assunto:** perfil sem `assuntos` gravado vê tudo e não edita nada. A regra de transição sai.
- **Carga por tabela:**
  - nunca apaga;
  - item fora da tabela não muda;
  - inativar só pela coluna `ativo`;
  - vigência já gravada (`de` existente) com valor diferente vira erro "Vigência já gravada não muda: crie uma vigência nova";
  - código não muda depois de criado; código aceito: `/^[A-Za-z0-9._-]+$/`;
  - a carga nunca grava senha;
  - grava pelo `Cad.ops`, com o motivo "carga por tabela".
- **Colagem:** texto separado por tabulação, e a primeira linha são os títulos. O título pode ser técnico (`codigo`) ou o rótulo da tela ("Código"), sem diferença de maiúsculas e acentos.
- **Contratos:** fórmulas, turnos e classificação de paradas não mudam (contrato 7). Os contratos 1 a 6 continuam. O contrato 8 perde o "registro antigo só com nome". O contrato 9 perde o `registro-backup.log` legado.
- **Remoção de testes:** um teste que só testava código removido sai no mesmo commit, e o PR lista cada um com o motivo. O número de suítes em `testes/tudo.js` citado no `CLAUDE.md` é atualizado.
- **Commits:** terminam com o rodapé de atribuição da ferramenta. Nunca com o identificador do modelo.

## Review Focus

1. **Base de uma versão anterior aberta por engano:** a página tem de mostrar o bloqueio e consultar sem gravar, sem quebrar nem converter. → teste em Task 2 (`base-limpa-formato`).
2. **Tabela colada do Excel com sujeira:** linhas vazias no fim, coluna extra desconhecida, número com vírgula ("0,936"), data `dd/mm/aaaa` e célula com espaços. Tudo isso tem de ser aceito ou aparecer como erro explicado, nunca gravado errado. → Task 6.
3. **Carga que referencia item criado na mesma carga** (catálogo da família nova, ou local de gel do equipamento novo): deve passar se o item referenciado também for marcado, e dar erro se não for. → Task 7.
4. **Perfil sem `assuntos`** depois da remoção da transição: só vê. Ninguém ganha edição por acaso. → Task 3.
5. **Gel sem vigência de perdas** depois de tirar o `PROC_DEF`: aparece o aviso no teórico e o scrap pesado continua aparecendo (o scrap não depende das perdas). → Task 2.

---

### Task 1: Revisão do bloco 1 e inventário do que sai

**Files:**
- Create: `docs/BASE-LIMPA.md`
- Modify: `docs/superpowers/handoff/2026-11-24-bloco1/ledger.md` (achados da revisão)

**Interfaces:**
- Produces: `docs/BASE-LIMPA.md`, uma tabela por bloco do HTML (`comum/bases`, `comum/interface`, `motor/*`, `modulo/*`, `ferramenta/*`, `celular/*`) com as colunas `trecho (função ou id)` · `o que faz` · `decisão (sai / fica)` · `motivo` · `task`. As Tasks 2 a 5 removem exatamente o que está marcado "sai" para elas.

- [ ] **Step 1: Revisar o bloco 1 contra a regra nova e contra o desenho anterior.** Leia `git diff d78275a..HEAD -- Plataforma.html` e liste:
  - (a) tudo que existe só para cadastro v1 ou base antiga: `ImportarV1`, `cadImportarV1`, `#cadV1`, a trava v1 em `Cad.ops` (linha com `ImportarV1.permitida`), `admNivelTransicao`, `admPerfilEdita` na transição, `legado` em `vacGel.localGel`, `vigList` com `gTubo` solto, `cadastroOk` com `schemaVersion >= 2`;
  - (b) defeitos de correção (o comportamento errado, com o caso que o mostra).
  
  Anote a lista no `ledger.md`, numa seção "Revisão do bloco 1 (bloco 2, Task 1)".
- [ ] **Step 2: Fazer o inventário.** Para cada bloco, busque `migra|legad|antig|compat|schemaVersion|formato 1|\bv1\b|Trazer|_DEF\b|DEFAULT_|upgrade` e classifique cada trecho de **código** (comentário histórico só sai junto com o código que explica). Ficam:
  - tudo que trata dado novo que **entra** (normalizações SAP, `onupgradeneeded` do IndexedDB);
  - o que o desenho manda deixar para os blocos 3 e 4;
  - o `CadSync`, que sai no bloco 3.
  
  Para cada "fica", o motivo.
- [ ] **Step 3: Conferir o inventário contra o desenho.** Tudo da lista "Sai do código" da seção 5, bloco 2, do desenho tem de aparecer marcado "sai". Os defeitos do Step 1 (b) viram itens da task dona do bloco.
- [ ] **Step 4: Commit.** `git add docs/BASE-LIMPA.md docs/superpowers/handoff/2026-11-24-bloco1/ledger.md && git commit -m "Base limpa: revisão do bloco 1 e inventário do que sai"`

### Task 2: Formato único e leitores comuns sem compatibilidade (comum/bases, comum/interface)

**Files:**
- Modify: `Plataforma.html` (blocos `comum/bases`, `comum/interface`)
- Create: `testes/plataforma/base-limpa.test.mjs`, `testes/plataforma/base-limpa-formato.cjs`
- Modify: `scripts/testar-plataforma.mjs:13`, `CLAUDE.md` (contratos 8 e 9), `AGENTS.md`

**Interfaces:**
- Consumes: `docs/BASE-LIMPA.md` (itens "Task 2").
- Produces:
  - `base-limpa.test.mjs` exporta a lista `PROIBIDO` (por bloco), à qual as Tasks 3 a 5 acrescentam padrões.
  - A validação de formato da base (hoje `AT-03`, perto de "base antiga sem schema é aceita como versão 1") passa a devolver o erro `'Base de versão anterior. Comece uma base nova nesta pasta.'` quando `schemaVersion` falta ou é menor que a versão do motor.
  - `vacGel.procAt(date, fmt)` devolve `null` sem vigência.
  - `vacGel.teorico(...)` devolve `null` quando algum formato usado não tem vigência.
  - `vacGel.cadastroOk()` exige `schemaVersion === VAC_CAD_VERSAO`, uma constante nova em `comum/bases` com valor 2.

- [ ] **Step 1: Escrever o teste de contrato (falha).** Em `base-limpa.test.mjs`, com `node:test`, leia cada bloco por `scripts/html.cjs` e confira que nenhum padrão de `PROIBIDO[bloco]` aparece. Para `comum/bases` e `comum/interface`:
  - `/PROC_DEF/`
  - `/\.legado\b/`
  - `/aceita o cadastro antigo/`
  - `/base antiga sem schema/`
  - `/raiz-antiga/`
  - `/importa uma fila antiga/`
  - `/Registro antigo só com nome/`
  - `/schemaVersion\s*>=\s*2/`
- [ ] **Step 2: Escrever `base-limpa-formato.cjs` (falha).** No cenário (`/?demo=1`):
  - (a) com a base da Produção alterada na memória para `schemaVersion: 1` ou sem `schemaVersion`, a página mostra o texto exato do bloqueio e o botão de gravar fica indisponível;
  - (b) com `parametros.gel.processo` vazio na memória, `vacGel.teorico({...})` devolve `null`, o Teórico × Real mostra o aviso e as pesagens de scrap continuam listadas;
  - (c) `vacPessoa` com registro que só tem nome (sem ID) **não** resolve o ID;
  - (d) o export do Gel com versão anterior à esperada (alterado na memória) faz a Produção mostrar "Dados de Gestão de Gel em versão anterior" e não usar o dado (a função que hoje compara a versão do export, em `comum/bases` ou `modulo/core/data`);
  - (e) nenhum erro de JavaScript.
- [ ] **Step 3: Rodar e ver falhar.** `node --test testes/plataforma/base-limpa.test.mjs` → FAIL listando os padrões. `node testes/plataforma/base-limpa-formato.cjs` → FAIL em (a).
- [ ] **Step 4: Remover os itens "Task 2" do inventário.**
  - mudança da base da raiz para `00. Bases` (trava `.migrando` e `raiz-antiga`);
  - importação da fila antiga;
  - resolução de nome sem ID no `vacPessoa`;
  - leitura do `registro-backup.log` legado;
  - `vigList`/`vigAt` com cadastro antigo (só `cg.vig`);
  - `legado` em `localGel`;
  - `PROC_DEF`.
  
  Aplicar a validação de formato com versão exata.
- [ ] **Step 5: Atualizar os chamadores do teórico de gel** para tratar `null`, mostrando o aviso "Sem perdas teóricas do gel vigentes em dd/mm/aaaa. Confira Administração › Gel." Os chamadores são: `GelDia.calc` (motor/oee), `prodCalc`, `gelKg` e os painéis que usam `paramsAt` (motor/gel). A mensagem segue o modelo de `vacGel.avisoCadastro`.
- [ ] **Step 6: Atualizar o `CLAUDE.md` e o `AGENTS.md`.** No contrato 8, sai "Registro antigo só com nome…". No contrato 9, sai "e o registro-backup.log legado". Entra uma regra nova: "Base limpa (24/11/2026): não se escreve compatibilidade com base, cadastro ou export de versão anterior; versão diferente bloqueia a gravação."
- [ ] **Step 7: Rodar os testes.** `npm run -s atualizar:metadados`, depois `node --test testes/plataforma/base-limpa.test.mjs`, `node testes/plataforma/base-limpa-formato.cjs`, `gel-numeros`, `gel-perdas-formato`, `gel-producao`, `scrap-lado`, `backup-concorrencia.cjs` e `node --test testes/plataforma/fila-backup.test.mjs`. Tudo PASS. O cenário tem vigência de perdas, então o `gel-numeros` fica igual; se não tiver, acrescente a vigência no gerador do cenário e regrave antes da referência.
- [ ] **Step 8: Commit** "Base limpa: formato único e leitores comuns sem compatibilidade".

### Task 3: Administração sem importadores nem transição

**Files:**
- Modify: `Plataforma.html` (bloco `motor/portal`)
- Delete: `testes/plataforma/adm-importar.cjs`
- Modify: `scripts/testar-plataforma.mjs:13`, `testes/plataforma/adm-assuntos.cjs`, `testes/plataforma/base-limpa.test.mjs`, `testes/tportalfonte.js` (só as partes de "Trazer")

**Interfaces:**
- Consumes: `PROIBIDO` (Task 2) e o inventário.
- Produces: `Cad.nivelAssunto(perfil, assunto)` lê só `perfil.assuntos[assunto]`. Sem `assuntos`, devolve `'ver'`.

- [ ] **Step 1: Acrescentar a `PROIBIDO['motor/portal']`:**
  - `/ImportarV1/`
  - `/importação v1/`
  - `/cadV1/`
  - `/admNivelTransicao/`
  - `/TrazCfg/`
  - `/cadTrazerCfg/`
  - `/Carga\.abrir/`
  - `/Carga\.completar/`
  - `/Criar cadastro a partir das páginas/`
  - `/GEL_PROC_DEF/`
  - `/schemaVersion\s*<\s*2/`
  - `/formato antigo/`
- [ ] **Step 2: Em `adm-assuntos.cjs`, acrescentar (falha):**
  - (a) perfil sem `assuntos` só vê;
  - (b) "Criar os perfis padrão" cria Processos, PCP, Almoxarifado e ADMIN com os `assuntos` da Global Constraints;
  - (c) o menu Sistema não tem "Importar das bases atuais" nem "Trazer configurações".
- [ ] **Step 3: Rodar e ver falhar.** `node --test testes/plataforma/base-limpa.test.mjs` e `node testes/plataforma/adm-assuntos.cjs` → FAIL.
- [ ] **Step 4: Remover.**
  - `ImportarV1`, `cadImportarV1` e o caso `'importação v1'` em `aplicarOp`;
  - a trava v1 em `Cad.ops` e a faixa `#cadV1`;
  - `admNivelTransicao` e a transição em `Cad.nivelAssunto`;
  - `TrazCfg` e `Carga` (com os botões `#cadCarga`, `#cadCompletar` e `#cadTrazerCfg`);
  - `GEL_PROC_DEF`. O botão "+ Vigência" sem vigência anterior abre com os campos vazios;
  - as migrações e os ramos `schemaVersion < 2` marcados "Task 3" no inventário.
  
  Acrescentar `assuntos` ao `DEFAULT_PERFIS`.
- [ ] **Step 5: Tirar os testes que só testavam código removido.** Saem `adm-importar.cjs` (da linha 13 também) e as partes de "Trazer configurações" do `tportalfonte.js`. Cada remoção é anotada no `ledger.md`.
- [ ] **Step 6: Rodar os testes.** `npm run -s atualizar:metadados`, depois `base-limpa.test.mjs`, `adm-assuntos`, `adm-gel`, `cfg-adm`, `cad-consulta`, `permissoes-paridade` e `node testes/tportalfonte.js` → PASS.
- [ ] **Step 7: Commit** "Base limpa: Administração sem importadores nem transição de perfis".

### Task 4: Produção sem migrações

**Files:**
- Modify: `Plataforma.html` (bloco `motor/oee`), `testes/plataforma/base-limpa.test.mjs`; os testes de `testes/*.js` que só testavam migração da Produção (lista no inventário).

**Interfaces:**
- Consumes: inventário (itens "Task 4"). **Não** mexe no `CadSync` (bloco 3).

- [ ] **Step 1: Acrescentar a `PROIBIDO['motor/oee']`** os nomes das funções de migração e de leitura antiga marcadas "sai" no inventário. Exemplo: as conversões de `settings` antigas e o `schemaVersion` "até a conhecida".
- [ ] **Step 2: Rodar e ver falhar.** `node --test testes/plataforma/base-limpa.test.mjs` → FAIL em `motor/oee`.
- [ ] **Step 3: Remover os itens.** A leitura da base usa a validação de versão exata da Task 2.
- [ ] **Step 4: Rodar os testes.** `base-limpa.test.mjs`, `gel-numeros` e as suítes de `testes/tudo.js` que tocam a Produção: `node testes/tudo.js` com `NODE_OPTIONS` sem internet → todas passam, menos as removidas, que são anotadas.
- [ ] **Step 5: Commit** "Base limpa: Produção sem migrações".

### Task 5: Demais motores, casca e ferramentas sem migrações

**Files:**
- Modify: `Plataforma.html` (blocos `motor/gel`, `motor/perdas`, `motor/paradas`, `motor/equip`, `motor/inic`, `motor/linha`, `motor/projetos`, `modulo/*`, `ferramenta/comparar`, `ferramenta/verificar`, `celular/*`) e `testes/plataforma/base-limpa.test.mjs`
- Modify: `CELULAR/index.html` e `CELULAR/manutencao.html`, se mudarem. Depois, `node scripts/bloco.mjs celular/meu-turno CELULAR/index.html` e `node scripts/bloco.mjs celular/manutencao CELULAR/manutencao.html`.

**Interfaces:**
- Consumes: inventário (itens "Task 5"). Exemplos esperados:
  - "Trazer ações do Waste" e `legado` em Iniciativas (`motor/inic`, `ImpAcoes`/`WAc.legado`);
  - conversões de `config` antigas no Waste e no Paradas;
  - `v1` no comparar de importação.

- [ ] **Step 1: Acrescentar a `PROIBIDO` os padrões por bloco** (os nomes marcados "sai"). Rodar → FAIL.
- [ ] **Step 2: Remover os itens.** Na Iniciativas, uma ação só tem `origem`. O botão "Trazer ações do Waste" e `legadoHtml` saem.
- [ ] **Step 3: Rodar os testes.** `base-limpa.test.mjs`, `node testes/tudo.js` (sem internet), `npm run test:celular`, `mt-celular` e `man-celular` → PASS, menos os testes removidos, que são anotados.
- [ ] **Step 4: Commit** "Base limpa: demais motores, casca e ferramentas sem migrações".

### Task 6: Carga por tabela · núcleo (leitura, prévia, gravação) para tipos sem vigência

**Files:**
- Modify: `Plataforma.html` (bloco `motor/portal`)
- Create: `testes/plataforma/carga-tabela.cjs`
- Modify: `scripts/testar-plataforma.mjs:13`; `testes/plataforma/*` que usavam a importação do `ParLote` (o "⇧ Importar planilha" dos códigos de parada)

**Interfaces:**
- Produces, em `motor/portal`, o objeto `CargaTab`:
  - `CargaTab.tabelas()` → `[{id, nome, tipo, sub, colunas:[{k, rotulo, cod, obrig, valores}], vig:boolean}]`. Uma tabela por tipo de `CAD_T`, mais as sub-tabelas da Task 7. `cod` é o codec da coluna, tirado do tipo do campo em `CAD_T`: `cod`, `txt`, `int`, `num`, `num3`, `bool`, `sel`, `cor`, `hora`, `dias`, `ref` e `refcod`.
  - `CargaTab.ler(fonte)`, com `fonte` = `{arquivo: File}` ou `{texto: string}` → `{titulos:[string], linhas:[[string]]}`. O .xlsx é lido pelo SheetJS incorporado; .csv e texto colado são separados por `;`, `,` ou tabulação, detectados pela primeira linha. Linhas totalmente vazias são ignoradas.
  - `CargaTab.previa(tabelaId, {titulos, linhas}, D)` → `{colunasDesconhecidas:[string], itens:[{n, codigo, estado:'novo'|'alterado'|'igual'|'erro', mudancas:[{k, antes, depois}], erros:[string], op}]}`.
  - `CargaTab.gravar(previa, marcados:Set<n>)` → `boolean`, pelo `Cad.ops(ops)`.
  - `CargaTab.modelo(tabelaId, D)` → planilha .xlsx com uma aba de dados (títulos técnicos na 1ª linha, rótulos na 2ª, depois os itens atuais) e uma aba "Campos" (coluna, rótulo, tipo, obrigatório, valores aceitos).
- Codecs:
  - `bool`: SIM/NÃO/S/N/1/0/verdadeiro/falso;
  - `num`/`int`: aceitam vírgula decimal e espaços;
  - data: `aaaa-mm-dd` ou `dd/mm/aaaa`;
  - `dias`: "seg,ter,qua,qui,sex,sab,dom" ou números de 0 a 6;
  - `ref`: código do item referenciado;
  - célula vazia = campo ausente, nunca zero.

- [ ] **Step 1: Escrever `carga-tabela.cjs` (falha)** em Administração › Sistema › Carga por tabela, no cenário:
  1. Colar em `#cargaColar`: `"codigo\tnome\tcor\nFX1\tFamília X\t#123456\nFX2\tFamília Y\t\n\n"` na tabela Famílias. A prévia mostra 2 "novo" e a linha vazia é ignorada.
  2. Colar uma linha com o código de uma família que existe e outro nome: aparece como "alterado", com antes → depois do nome.
  3. Colar `"Código\tNome\tColuna X\nFX3\tZ\tq"` (rótulos e uma coluna desconhecida): a coluna X aparece em `colunasDesconhecidas` e a linha vira "novo".
  4. Código `"F X"` vira erro "Código aceita letras, números, ., - e _".
  5. Equipamento com `linha` inexistente vira erro "Linha não cadastrada: …".
  6. Gravar só os marcados: o cadastro ganha FX1 e não ganha FX2, e a auditoria tem o motivo "carga por tabela".
  7. Item que não está na tabela não muda.
  8. Perfil sem edição do assunto "produto" não vê o botão Gravar.
  9. "⇩ Baixar modelo" de Famílias gera um .xlsx com as abas dados e "Campos". O download é capturado pelo Playwright e lido com SheetJS.
  10. Códigos de parada pela carga dão o mesmo resultado do antigo "⇧ Importar planilha" do `ParLote`, que sai.
  11. Nenhum erro de JavaScript.
- [ ] **Step 2: Rodar e ver falhar.** `node testes/plataforma/carga-tabela.cjs` → FAIL (`#cargaColar` não existe).
- [ ] **Step 3: Implementar `CargaTab`**, para tipos sem vigência (linhas, famílias, materiais, equipamentos, componentes, modos de falha, códigos de parada, calendário, programas, perfis, usuários).
  - Telas: `#cadastros/carga`, no menu Sistema, com:
    - a lista das tabelas na ordem planta → produto → equipamentos → gel → turnos e metas → paradas e perdas → pessoas, com o número de itens de cada uma;
    - "⇩ Baixar modelo";
    - "⇧ Arquivo";
    - a área "Colar do Excel" (`#cargaColar`, textarea; o evento `paste` lê `text/plain`);
    - a prévia com marcar/desmarcar e o botão "Gravar marcados".
  - Na tela de cada cadastro, os botões "⇩ Exportar para editar" e "⇧ Carga por tabela" levam à mesma tela com a tabela escolhida.
  - O `ParLote` perde a importação e o modelo, que passam a ser do `CargaTab`. Fica só o "Alterar em lote".
  - Usuários: as colunas de senha não existem, e um título "senha" vira coluna desconhecida.
- [ ] **Step 4: Rodar os testes.** `carga-tabela`, `adm-assuntos`, `cad-consulta` e os testes de códigos de parada em lote (ajustados para a carga) → PASS.
- [ ] **Step 5: Commit** "Administração: carga por tabela (arquivo ou colagem do Excel)".

### Task 7: Carga por tabela · vigências, sub-tabelas e Gel

**Files:**
- Modify: `Plataforma.html` (bloco `motor/portal`), `testes/plataforma/carga-tabela.cjs`

**Interfaces:**
- Consumes: `CargaTab` (Task 6).
- Produces:
  - **Tabelas com vigência** (`vig:true`): catálogos, BOM, turnos, preços, câmbio, metas de OEE, metas da área e metas de OSM. Cada linha é uma vigência: colunas do item, `de`, `ate`, colunas da vigência (`vcampos`) e `motivo`. As colunas do item repetidas em várias linhas do mesmo código têm de ser iguais; senão, erro "Linhas do mesmo código com <campo> diferente".
  - **Sub-tabelas** (`sub`), ligadas por `codigo` + `de` da vigência:
    - `turnos.pausas`: `nome`, `inicio`, `fim`, `duracaoMin`, `dias`, `desconta`;
    - `turnos.intervalos`: `inicio`, `fim`;
    - `bom.itens`: `material`, `quantidade` e os campos de item de `CAD_T.bom`.
    
    Uma sub-tabela substitui a lista daquela vigência **só se a vigência ainda não está gravada** (vigência nova da mesma carga ou ainda não existente); senão é o erro de vigência imutável.
  - **Gel:**
    - `gel.formatos` (`de`, `embalagemG`, `folhaPurgaG`, `sobraBarrilKg`, e para 100 e 75 `tuboG`, `gelG`, `aditivoG`, `tampaRolhaG`, com títulos `t100.tuboG` etc.);
    - `gel.locais` (`id` opcional; sem `id`, a linha cria um local com o próximo `L-nnnn`, e com `id`, atualiza aquele local; mais `equipamento`, `local`, `comp`, `categoria`, `motivos` com nomes separados por `;`, `embalagemG`, `ordem`, `ativo`);
    - `gel.processo` (`de`, `fmt`, `g`, `pT`, `pB`, `pP`).
  - **Referência a item novo da mesma carga:** vale quando a linha do item referenciado está marcada na mesma gravação (por exemplo, catálogo com família nova da tabela Famílias colada antes, ainda não gravada). A prévia mostra "depende de <tipo> <código> desta carga".

- [ ] **Step 1: Acrescentar a `carga-tabela.cjs` (falha):**
  1. Catálogo novo com duas vigências (`2025-01-01` e `2026-01-01`, PPH diferentes) vira um item "novo" com 2 vigências.
  2. Vigência já gravada com outro PPH vira erro com o texto exato da Global Constraints.
  3. Turno novo com pausas em `turnos.pausas` grava as pausas na vigência certa.
  4. `gel.formatos` com `t100.gelG = "0,936"` grava 0.936.
  5. `gel.locais` sem `id` cria `L-nnnn`, e com equipamento inexistente dá erro.
  6. `gel.processo` com `fmt = 75` grava a vigência do Tubo 75 e `vacGel.procAt(d, '75')` a lê.
  7. Catálogo com família nova não gravada: erro se a família não está marcada; grava se a família e o catálogo são marcados juntos.
- [ ] **Step 2: Rodar e ver falhar.**
- [ ] **Step 3: Implementar** as vigências, as sub-tabelas, o Gel e as referências da mesma carga no `CargaTab`.
- [ ] **Step 4: Rodar os testes.** `carga-tabela`, `adm-gel`, `gel-perdas-formato`, `tvigencias.js` e `tturnos.js` → PASS.
- [ ] **Step 5: Commit** "Carga por tabela: vigências, pausas, BOM e Gel".

### Task 8: Entrega do bloco 2

**Files:**
- Modify: `Plataforma.html`:
  - `VERSION` em `modulo/App`;
  - `NOVIDADES` e `PAGE.versao` em `motor/portal`;
  - `APP_VERSION` de cada motor alterado;
  - manifesto e `VERSOES`;
  - `dados/cenario`, regravado com `node scripts/cenario-demo.cjs --gravar`.
- Modify: `scripts/cenario-demo.cjs` (sem cópias, versão única), `PENDENCIAS.md`, `docs/CONTRATO-MOTORES.md`, `CLAUDE.md` (número de suítes de `testes/tudo.js` e menção à carga por tabela), `docs/superpowers/handoff/2026-11-24-bloco1/ledger.md`.

- [ ] **Step 1: Regravar o cenário.** `node scripts/cenario-demo.cjs --gravar`, depois `npm run -s atualizar:metadados` → "HTML único verificado".
- [ ] **Step 2: Subir as versões.**
  - A plataforma sobe uma versão; a primeira entrada de Novidades é igual a ela, com frases curtas ("novo: carga por tabela…", "melhoria: base de versão anterior bloqueia a gravação…").
  - Administração e cada motor alterado sobem `APP_VERSION`, com os valores iguais no manifesto e em `VERSOES`.
- [ ] **Step 3: Documentação.**
  - `PENDENCIAS.md`: linha "BASE-LIMPA bloco 2" (feito; o recadastro fica para depois do bloco 5).
  - `docs/CONTRATO-MOTORES.md`: só a versão atual é lida.
  - `CLAUDE.md`: o número novo de suítes.
- [ ] **Step 4: Verificação completa.** `npm run lint`, `npm run test:unit`, `npm run test:plataforma`, `NODE_OPTIONS="--require $PWD/testes/http-local.cjs" npm test` e `npm run test:celular`. Todas passam, e a saída de cada uma é mostrada.
- [ ] **Step 5: Revisão do branch inteiro** contra o desenho (seção 5, bloco 2, e seção 7), com busca final dos padrões do inventário.
- [ ] **Step 6: Commit e PR.** Commit "Bloco 2: base limpa e carga por tabela (versões e entrega)". Push e PR com a lista de testes removidos e o motivo de cada um.

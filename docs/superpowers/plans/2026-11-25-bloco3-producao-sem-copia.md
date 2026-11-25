# Bloco 3 · Produção sem cópia dos cadastros · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** a base da Produção deixa de guardar linhas, equipamentos, famílias, catálogos, turnos, metas e códigos de parada; o motor passa a ler tudo do cadastro da Administração, **sem mudar nenhuma fórmula nem número**.

**Architecture:** um montador `ProdCad` (em `motor/oee`) gera, em memória e a cada leitura do cadastro, as mesmas tabelas que o motor já usa; elas ficam fora do arquivo gravado. O motor e suas ~900 leituras (`db.catalogs`, `db.shifts`…) não mudam. Sai o `CadSync`. A prova é `prod-numeros` (e `tsqdcp_layout`, `gel-numeros`) iguais antes e depois.

**Tech Stack:** JavaScript nativo dentro de `Plataforma.html` (blocos `data-vac-source`), testes Playwright (`.cjs`) e `node:test` (`.mjs`).

**Spec:** `docs/superpowers/specs/2026-11-24-base-limpa-e-paginas-sem-copia-design.md` (seção "Bloco 3"), `docs/CONFIGURACOES.md` (14 decisões) e `docs/BASE-LIMPA.md`.

## Global Constraints

- Fórmulas, cálculo, interpretação de madrugada/turnos e classificação de paradas **não mudam** (contrato 7). Layout não altera números (contrato 6).
- Ausência ou erro de leitura do cadastro **nunca vira zero** (contrato 1). Vigências gravadas são imutáveis e lidas pela data do fato (contrato 2).
- IDs derivados do código, como o `CadSync` já faz: `line_<slug>`, `fam_<slug>`, `mac_<slug>`, `cat_<código>` (e `cat_<código>_<de>` para a 2ª vigência em diante), `sh_<slug>`, `dc_<slug>`, `tg_<escopo>_<de>`. Nenhum índice é guardado.
- Nenhuma compatibilidade com base anterior (contrato 10): a base da Produção sobe para `schemaVersion: 2`; a de versão 1 abre só para consulta.
- **Testes:** a cada mudança rode só lint, `test:unit`, as suítes da área e `prod-numeros`; a regressão completa roda no CI a cada push (não esperar a rodada local de ~40 min).
- Edição do HTML: `node scripts/bloco.mjs <id>` para ler/gravar bloco; `&` vira `&amp;` no texto novo; depois `npm run -s atualizar:metadados` deve dizer "HTML único verificado".
- Commits terminam com o rodapé de atribuição da ferramenta; nunca com o identificador do modelo. Commits pequenos, um por etapa.

## Review Focus

1. **Cadastro ausente ou ilegível** na Produção: a página mostra o aviso e **não calcula** nem trata como zero. → teste na Task 3.
2. **Turno ou catálogo usado num lançamento e depois desativado ou com vigência encerrada:** o dia antigo continua calculando pelas vigências da data do fato. → teste na Task 2.
3. **Catálogo com duas vigências** (PPH diferente) e dia antes/depois da virada: usa a vigência certa. → teste na Task 2.
4. **Cadastro muda com a Produção aberta** (nova vigência): as tabelas são remontadas e o dia aberto recalcula coerente, sem gravar nada dentro da base da Produção. → teste na Task 3.
5. **Base da Produção de versão 1** (com as tabelas gravadas): bloqueada e não convertida. → teste na Task 3.

---

## File Structure

- `Plataforma.html`, bloco `motor/oee`: entra `ProdCad`; saem `CadSync` e a gravação das tabelas; `SCHEMA_VERSION` 2; `Demo.enterExample` usa o cadastro do cenário.
- `scripts/cenario-demo.cjs` e `dados/cenario` (regravado): a base `oee` do cenário sem as tabelas.
- `testes/plataforma/prod-numeros.cjs` (já existe; ganha normalização de IDs), `testes/plataforma/prodcad-equivalencia.cjs` (novo), `testes/plataforma/prodcad-casos.cjs` (novo), `testes/plataforma/base-limpa.test.mjs` (lista `PROIBIDO`).

---

### Task 1: Prova de números independente de ID

**Files:**
- Modify: `testes/plataforma/prod-numeros.cjs`, `testes/amostras/prod-numeros-antes.json` (regravado)

**Interfaces:**
- Produces: `prod-numeros.cjs` compara números com os IDs de linha, turno, catálogo, equipamento, família e parada **trocados pelo código**; assim a prova sobrevive à troca de IDs do cenário na Task 6.

- [ ] **Step 1:** em `capturar()`, antes de serializar, trocar cada id das tabelas `lines`, `machines`, `families`, `catalogs`, `shifts` e `downtimeCodes` pelo `code` correspondente (mapa id→code montado de `db()`), em todo o resultado (`agg`, `r`, `shifts`, `flat`, `comp`).
- [ ] **Step 2:** apagar `testes/amostras/prod-numeros-antes.json` e regravar com `node testes/plataforma/prod-numeros.cjs --gravar` **na main atual** (antes da troca).
- [ ] **Step 3:** `node testes/plataforma/prod-numeros.cjs` duas vezes seguidas. Expected: `ok` nas duas.
- [ ] **Step 4:** commit "Bloco 3: prod-numeros compara por código".

### Task 2: `ProdCad.montar` equivalente ao `CadSync`

**Files:**
- Modify: `Plataforma.html` (`motor/oee`, ao lado do `CadSync`)
- Create: `testes/plataforma/prodcad-equivalencia.cjs`, `testes/plataforma/prodcad-casos.cjs`
- Modify: `scripts/testar-plataforma.mjs:13` (registrar os dois)

**Interfaces:**
- Produces: `ProdCad.montar(cad: CadastroDoc) → {lines, machines, families, catalogs, shifts, targets, downtimeCodes}`, função pura (não toca `Store`). Cada tabela tem o mesmo formato que o `CadSync.aplicar` produz hoje, **sem** `createdAt/By`, `updatedAt/By`, `revision`. Vigências do catálogo viram uma linha por vigência (`validFrom`/`validTo`); as de turno viram `versions`.

- [ ] **Step 1:** `prodcad-equivalencia.cjs`, no cenário (`?demo=1`, frame da Produção): monta uma base vazia, aplica `CadSync.aplicar(base, vacCad(), () => {})`, chama `ProdCad.montar(vacCad())` e compara, tabela a tabela, ignorando só `createdAt, createdBy, updatedAt, updatedBy, revision`. Assertions: igualdade profunda das 7 tabelas, mesmos IDs.
- [ ] **Step 2:** `prodcad-casos.cjs` (Review Focus 2 e 3): cadastro fictício com (a) catálogo `360060` com vigências `2025-01-01` (PPH 100) e `2026-01-01` (PPH 120): duas linhas `cat_360060` e `cat_360060_2026-01-01`; (b) turno desativado em 2026-06-01: a versão antiga continua em `versions`, a nova vem com `validTo`; (c) `Engine.shiftVersionAt` e `catalogValid` devolvem a vigência correta para um dia de 2025 e um de 2026.
- [ ] **Step 3:** rodar os dois: Expected FAIL (`ProdCad is not defined`).
- [ ] **Step 4:** implementar `ProdCad.montar`, reaproveitando a lógica de montagem que hoje está dentro de `CadSync.aplicar` (linhas 22123 a 22317 do arquivo) sem as partes de auditoria, `stamp` e persistência.
- [ ] **Step 5:** rodar os dois: Expected PASS. `node testes/plataforma/prod-numeros.cjs`: Expected `ok` (nada mudou ainda).
- [ ] **Step 6:** commit "Bloco 3: ProdCad.montar equivale ao CadSync".

### Task 3: Tabelas só em memória e base 2

**Files:**
- Modify: `Plataforma.html` (`motor/oee`: `Model.emptyBase`, `Model.REQUIRED/LISTAS`, `SCHEMA_VERSION`, `Store` leitura/gravação, `Store.readCadastro`)
- Create: `testes/plataforma/prodcad-memoria.cjs`

**Interfaces:**
- Consumes: `ProdCad.montar` (Task 2).
- Produces: `Store.S.db` continua com `lines`, `machines`, `families`, `catalogs`, `shifts`, `targets`, `downtimeCodes` **em memória**, repovoadas por `ProdCad.montar(cadDoc)` quando o cadastro é lido ou muda; `Store.flush` grava a base **sem** essas 7 tabelas; `SCHEMA_VERSION = 2`. Sem `cadDoc` legível, `Store.S.cadastroEstado` é `'ausente'` ou `'erro'` e a página mostra o aviso, sem calcular.

- [ ] **Step 1:** `prodcad-memoria.cjs` com: (a) arquivo gravado não contém as 7 tabelas e traz `schemaVersion: 2`; (b) cadastro ausente: aviso visível e nenhum KPI numérico; erro de leitura (JSON inválido): idem, e diferente de ausente; (c) trocar o cadastro (nova vigência) com a página aberta: `db().catalogs` refeito e nada novo em `auditLog` por isso; (d) base de versão 1 com as tabelas: abre só para consulta com "Base de versão anterior. Comece uma base nova nesta pasta.".
- [ ] **Step 2:** rodar: Expected FAIL.
- [ ] **Step 3:** implementar. `Model.emptyBase` perde as 7 listas; `validateStructure` deixa de exigi-las; `Store.flush` remove-as da cópia gravada; `readCadastro` chama `ProdCad.montar` e atribui as tabelas ao `db` em memória; estado `ausente/erro` mostrado pelo cabeçalho comum.
- [ ] **Step 4:** rodar `prodcad-memoria`, `base-limpa-formato`, `prod-numeros`. Expected PASS (os números iguais ainda valem porque o cenário carrega as tabelas pelo `ProdCad`).
- [ ] **Step 5:** commit "Bloco 3: tabelas da Produção só em memória (base 2)".

### Task 4: Sai o `CadSync`

**Files:**
- Modify: `Plataforma.html` (`motor/oee`: remover `CadSync`, `settings.cadSync`, `Model.seed`, a chamada em `Store`, a sincronização na abertura; `testes/plataforma/base-limpa.test.mjs`)

**Interfaces:**
- Consumes: Task 3. Produces: nenhum `CadSync` no código.

- [ ] **Step 1:** acrescentar a `PROIBIDO['motor/oee']` em `base-limpa.test.mjs`: `/CadSync/`, `/Model\.seed/`, `/function seed\(db, by\)/`, `/cadSync/`. Rodar `node --test testes/plataforma/base-limpa.test.mjs`: Expected FAIL.
- [ ] **Step 2:** remover `CadSync` e seus chamadores; remover `seed` (o `emptyBase` já nasce vazio). Os testes `tdiag`, `tvigencias`, `tturnos` e `tcontratos` que chamam `CadSync.aplicar` passam a chamar `ProdCad.montar` (ajuste de uma linha por chamada) ou saem se só testavam a sincronização.
- [ ] **Step 3:** rodar `base-limpa.test.mjs`, `test:unit`, `prod-numeros`. Expected PASS.
- [ ] **Step 4:** commit "Bloco 3: sai o CadSync e a semente".

### Task 5: Modo exemplo e suítes antigas por um único ponto

**Files:**
- Modify: `Plataforma.html` (`motor/oee`: `Demo.enterExample` e `Actions.loadDemo`), as suítes `testes/t*.js` que quebrarem

**Interfaces:**
- Consumes: Tasks 3 e 4. Produces: `Demo.enterExample` usa o **cadastro do cenário** (`dados/cenario`, o mesmo do `?demo=1`) como `cadDoc` durante o exemplo, e `Actions.loadDemo(lineId)` gera os dias de exemplo sobre a estrutura que o `ProdCad` montou, sem depender de `line_vac`/`cat_360060` fixos.

- [ ] **Step 1:** rodar, em grupos de 6 a 8 suítes (não a rodada inteira), as 12 que falharam no atalho: `tid_backup ttimeline tlote_origem tpermissoes tcalendario temail tgrade tfechar thh24 thh_todos tsqdcp_layout tvisaogeral`; anotar quais ainda falham depois de `enterExample` mudar.
- [ ] **Step 2:** implementar o `enterExample` com o cadastro do cenário e ajustar `loadDemo`. Expected: a maior parte das 12 passa.
- [ ] **Step 3:** para cada suíte que ainda falhar, ajustar **o teste** só quando ele assumia um dado de fábrica (por exemplo um catálogo `360051` que não existe no cenário); registrar cada ajuste e o motivo na descrição do PR. Nunca afrouxar assertion de número.
- [ ] **Step 4:** push e deixar o CI rodar as 70 suítes e `test:plataforma`; corrigir o que o CI apontar.
- [ ] **Step 5:** commit "Bloco 3: modo exemplo pelo cadastro do cenário".

### Task 6: Cenário regravado, provas e entrega

**Files:**
- Modify: `scripts/cenario-demo.cjs`, `dados/cenario` (via `--gravar`), `Plataforma.html` (versões e `NOVIDADES`), `PENDENCIAS.md`, `docs/CONTRATO-MOTORES.md`, `CLAUDE.md` (número de suítes), `Relatórios Atualizações/…`

- [ ] **Step 1:** `node scripts/cenario-demo.cjs --gravar`; a base `oee` do cenário sai sem as 7 tabelas e com `schemaVersion: 2`. Depois `npm run -s atualizar:metadados`.
- [ ] **Step 2:** provas: `prod-numeros`, `tsqdcp_layout`, `gel-numeros`: Expected os três `ok`, sem regravar nenhuma referência.
- [ ] **Step 3:** subir a versão da plataforma e a da Produção; primeira entrada de `NOVIDADES` igual à da plataforma ("novo: a Produção lê só o cadastro da Administração…"); `node testes/plataforma/novidades.cjs`: Expected `ok`.
- [ ] **Step 4:** atualizar `PENDENCIAS.md` (linha do bloco 3), `docs/CONTRATO-MOTORES.md` (Produção não guarda estrutura) e o número de suítes no `CLAUDE.md`.
- [ ] **Step 5:** push; CI 5/5; abrir PR do bloco 3 com a lista de testes ajustados e o motivo de cada um; **sem merge** sem pedido do responsável.

### Task 7: Levantamento das configurações que ainda moram na Produção

**Files:**
- Create: `docs/superpowers/plans/2026-11-25-bloco3-configuracoes.md` (plano próprio)

- [ ] **Step 1:** listar, por busca em `motor/oee` (`settings.`), cada configuração que a Produção ainda guarda e classificá-la como as decisões 1 a 14 de `docs/CONFIGURACOES.md`: vai para a Administração (planta e linha, parâmetros de cálculo, mapa de tags, problemas de QN, hora extra), fica como preferência (abas, aparência, TV) ou é infraestrutura.
- [ ] **Step 2:** para cada item que "vai para a Administração", dizer se a tela já existe lá (CFG-ADM) ou falta construir. Entregar só o levantamento e o plano; não implementar nesta rodada.

---

## Self-Review

- **Cobertura do desenho:** `ProdCad` e IDs (Task 2), tabelas fora da base (Task 3), sai o `CadSync` (Task 4), prova de números (Tasks 1 e 6), configurações (Task 7 como plano próprio). A decisão 11 (Plano do mês só lê o calendário) e a marca de calendário **não** estão em tarefa: entram no levantamento da Task 7.
- **Tipos:** `ProdCad.montar` definido na Task 2 e usado nas Tasks 3 a 5; `Store.S.cadastroEstado` definido na Task 3.
- **Proporção:** o plano descreve decisões, assinaturas e testes; o código da montagem já existe no `CadSync` e é reaproveitado.
- **Risco principal:** a Task 5 depende de quantas suítes assumiam dado de fábrica; só se sabe ao rodá-las (12 falhas conhecidas em 24 suítes rodadas, 46 ainda não medidas).

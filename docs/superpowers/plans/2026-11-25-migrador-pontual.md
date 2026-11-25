# Migrador pontual da base limpa — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ferramenta de uso único que leva os dados da main (`91744b5`) ao formato da base limpa (#149), com prévia, exceções, backup verificado, retomada e reversão, usando só dados fictícios nos testes.

**Architecture:**
- O bloco novo `ferramenta/migracao` dentro do `Plataforma.html` tem duas partes:
  - um núcleo puro `vacMigracao`, que planeja e confere sem tocar a pasta;
  - uma camada de aplicação, que grava arquivo por arquivo com diário (registro) e backups.
- A tela só é aberta por Saúde dos dados. Nenhum motor chama o migrador. Ele sai depois do corte.

**Tech Stack:** JavaScript ES2022 dentro do HTML único; Node 22 (`node --test`); Playwright 1.63 com OPFS.

**Spec:** `docs/superpowers/specs/2026-11-25-migrador-pontual-design.md`

## Global Constraints

- Branch `feat/migrador-pontual`, a partir de `941b30e`. A Task 4 do bloco 2 continua pausada, e este plano não mexe no `motor/oee` além do necessário para o M4.
- Testes só com dados fictícios. Os testes rodam sem internet (`NODE_OPTIONS="--require $PWD/testes/http-local.cjs"`).
- **Edição do HTML:**
  - extrair o bloco com `node scripts/bloco.mjs <id> > arq`, editar e gravar de volta com `node scripts/bloco.mjs <id> arq`;
  - depois rodar `npm run -s atualizar:metadados`, que deve imprimir "HTML único verificado".
- Contratos 1, 3, 7, 8 e 10 do CLAUDE.md:
  - cada arquivo é gravado pelo seu dono;
  - nenhuma fórmula nova;
  - só preenche ID vazio e nunca troca ID gravado;
  - nome ambíguo ou ausente vira exceção.
- **Proibido:**
  - descartar registro;
  - duplicar registro;
  - apagar as ações originais do Waste;
  - gravar sem a sessão de quem pode editar a Administração e sem confirmação digitada.
- Nenhum identificador de modelo em código, comentários ou commits. Trailer dos commits:
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01VS5pDF48NrSKFiGVkaovtT
  ```
- Mensagens e textos de tela em português, frases curtas.

## Review Focus

1. Arquivo mudado entre a prévia e a gravação, por outra estação, é pulado e a prévia precisa ser refeita, nunca sobrescrito.
2. Interrupção depois do 1º arquivo gravado: a execução seguinte conclui sem duplicar (ações `AC-W-*`, vigências e IDs) ou restaura os arquivos afetados.
3. Backup ilegível ou ausente impede a gravação daquele lote, e nenhum arquivo é gravado.
4. `portal-base.json` com estrutura inesperada (`config` não objeto, `reunioes` lista) não ganha `schemaVersion` e vira exceção.
5. A M3 com vigência de data indeterminada (`2000-01-01` herdado, ou sem `from`) vai para o relatório de exceções e não é gravada sem a escolha do responsável.

---

### Task 1: Núcleo, fixtures da main e itens M1 e M3

**Files:**
- Create:
  - bloco `ferramenta/migracao`, inserido no HTML como os blocos `ferramenta/verificar` e `ferramenta/comparar`, com a mesma forma de registro no manifesto;
  - `testes/plataforma/migracao-fixtures.mjs`;
  - `testes/plataforma/migracao.test.mjs`.
- Modify:
  - `scripts/testar-plataforma.mjs`, se o `--unit` não pegar `*.test.mjs` sozinho;
  - `testes/plataforma/base-limpa.test.mjs`, que passa a isentar só `ferramenta/migracao` das proibições de leitura antiga.

**Interfaces (produz):**
- `vacMigracao.planejar(arqs, escolhas) → { itens: {M1:[…], M3:[…], …}, alteracoes: { [arquivo]: { hashAntes, depois, itens:[{item, caminho, de, para}] } }, excecoes: [{id, item, arquivo, caminho, valor, motivo, candidatos:[{id, nome}], opcoes:[…]}] }`.
  - `arqs` é `{ 'portal-base.json': obj, 'vacutainer-cadastros.json': obj, … }`.
  - O cadastro é lido de `arqs['vacutainer-cadastros.json']`.
  - É assíncrona (o `hashAntes` usa `crypto.subtle`) e pura. As escolhas entram por `escolhas = { [excecao.id]: valor }`. Cada exceção traz também `tipo` (ex.: `M3-data`) e, se decidida, `escolha`.
- `vacMigracao.hash(obj)` devolve SHA-256 do JSON canônico (chaves em ordem). É assíncrono, via `crypto.subtle`.
- `migracao-fixtures.mjs` exporta `pastaMain()`: um objeto `{arquivo: conteúdo}` fictício no formato da main. Inclui portal-base sem versão, com `reunioes` e `config`; cadastro v2 com catálogos de gel solto; Iniciativas, Equipamentos, Linha, Paradas e Waste com pessoas só com nome (únicas, repetidas e ausentes); prodlog e gelScrap com `{e,d}` antigos e `legado` no cadastro; Waste com `actions[]`.

- [ ] **Step 1: Testes que falham em `migracao.test.mjs`:**
  - (a) M1: portal-base válida ganha `schemaVersion:1` e o resto fica igual (deepEqual, menos esse campo). Com `config` lista ou `reunioes` lista: sem alteração e uma exceção `M1-estrutura`. Com `schemaVersion: 1` já gravado: nada a fazer.
  - (b) M3:
    - `gel:{gTubo:0.85, bomG:9, bomPct:106}` com `vig` vazio gera exatamente uma exceção `M3-data`, porque a data `2000-01-01` é indeterminada, e não gera alteração sem escolha;
    - com a escolha `{from:'2025-01-01'}` vira `vig:[{from:'2025-01-01', gTubo:0.85, bomKg:9*106/100*10, bomBase:10000, tol:6}]` e os campos soltos saem;
    - `vig` com `bomG` sem `bomKg` é convertido pela mesma conta;
    - valor não numérico gera a exceção `M3-valor`.
  - (c) Idempotência: `planejar(aplicado)` sem alterações.
- [ ] **Step 2:** `node --test testes/plataforma/migracao.test.mjs` → FAIL.
- [ ] **Step 3:** Implementar o bloco e o núcleo M1 e M3. As regras são as do desenho, tabela "Itens", que repete a main em `comum/bases` (`vigList` e `bomVals`, main `91744b5`).
- [ ] **Step 4:** O teste PASS e o `base-limpa.test.mjs` PASS.
- [ ] **Step 5:** Commit "Migrador: núcleo, fixtures da main, M1 e M3".

### Task 2: M2 e M2b (pessoas) e M4 (locais do Gel)

**Interfaces:** acrescenta ao `planejar` os itens `M2` e `M4`. Exporta `vacMigracao.pessoa(texto, usuarios) → {id} | {ambiguo:[…]} | {nenhum:true}`: ID exato, ou nome normalizado único, com inativos contando, como `achar` da main.

- [ ] **Step 1: Testes que falham:**
  - para cada caminho da tabela M2 do desenho, um nome único preenche o ID vazio;
  - um ID já gravado não muda, mesmo com nome de outra pessoa;
  - nome repetido gera a exceção `M2-ambiguo`, com os 2 candidatos; nome ausente gera `M2-nenhum`;
  - a escolha "Sem responsável" deixa o ID vazio e registra a decisão;
  - M2b: `tecnicoForms` sem `tecnico{}` cria a entrada com `tecnicoId`;
  - M4: os três passos de busca da main (`id`, `legado {e,d}` e `legado.d` + equipamento) reescrevem `{e,d}` no `fifo-base` (`prodlog`) e no `oee` (`gelScrap.eq`); sem local, gera a exceção `M4-sem-local` e o registro fica intacto;
  - contagem de registros igual antes e depois;
  - idempotência.
- [ ] **Step 2:** FAIL → **Step 3:** implementar → **Step 4:** PASS.
- [ ] **Step 5:** Commit "Migrador: pessoas (M2) e locais antigos do Gel (M4)".

### Task 3: M5 (ações do Waste para as Iniciativas)

- [ ] **Step 1: Testes que falham:**
  - cada `perdas-base.actions[]` gera `acoes[]` em `iniciativas-base.json` igual ao `MigWaste.converter` da main: `id 'AC-W-'+id`, mapas de status e eficácia, `origem.ref`, `legado`, um evento `criação` e uma única entrada em `importacoes`;
  - responsável pela regra do M2, e ambíguo gera exceção;
  - ação já presente (`MigWaste.ja`) é pulada;
  - **o `perdas-base.json` não aparece em `alteracoes`**: as ações originais ficam no Waste;
  - `vacMigracao.conferirM5(perdas, inic) → {ok, faltam:[…], divergentes:[…]}` compara cada ação original com a sua cópia (título, status mapeado, prazo e responsável);
  - idempotência.
- [ ] **Step 2–4:** FAIL → implementar → PASS.
- [ ] **Step 5:** Commit "Migrador: ações antigas do Waste nas Iniciativas (M5), originais preservados".

### Task 4: Aplicação, diário, retomada e reversão

**Interfaces:**
- `vacMigracao.aplicar(pasta, plano, {escolhas, sessao, confirmacao, aoGravar}) → {resultado: {[arquivo]: 'gravado'|'pulado-mudou'|'ja-concluido'|'erro'}, registro}`.
- `vacMigracao.retomar(pasta) → {pendentes, concluidos, registro}`.
- `vacMigracao.restaurar(pasta, registro, arquivos)`.
- `aoGravar` é um gancho de teste, chamado depois de cada arquivo; lançar dentro dele simula a interrupção.

- [ ] **Step 1: Testes que falham (Node, com uma pasta em memória que imita a API do File System Access do `vacRaiz`):**
  - (a) Pré-voo, **antes do 1º write**:
    - relê todos os arquivos do plano e compara cada `hashAntes`; se algum mudou, nada é gravado e o resultado diz qual arquivo mudou;
    - grava todos os backups `00. Backups/<módulo>/antes-da-migracao-<data>.json`, relê cada um e confere o hash; um backup ilegível faz nada ser gravado.
  - (b) Diário: `00. Backups/Migracao/registro-<id>.json` gravado **antes** do 1º arquivo, com plano, escolhas e `hashAntes`/`hashDepois` de cada arquivo, e atualizado depois de cada arquivo (`pendente` → `gravado` → `verificado`).
  - (c) Interrupção depois do 1º arquivo: `aoGravar` lança no 1º arquivo.
    - `retomar` acha o registro;
    - o arquivo cujo hash atual é igual a `hashDepois` fica `ja-concluido`;
    - os outros continuam, cada um ainda conferido contra `hashAntes`;
    - resultado final igual ao de uma execução sem interrupção;
    - zero `AC-W-*` duplicadas, zero vigências duplicadas.
  - (d) Reversão: depois da interrupção, `restaurar` devolve os arquivos afetados ao conteúdo do backup (hash igual a `hashAntes`).
  - (e) Ordem de gravação: cadastro → Iniciativas → Equipamentos → Linha → Paradas → Gel → Produção → Administração.
  - (f) Sem sessão de edição da Administração, ou com confirmação errada: recusa, sem gravar.
  - (g) Cada base alterada recebe uma entrada na própria auditoria.
- [ ] **Step 2–4:** FAIL → implementar sobre `vacRaiz` e o backup existente (sem protocolo paralelo) → PASS.
- [ ] **Step 5:** Commit "Migrador: aplicação com pré-voo, diário, retomada e reversão".

### Task 5: Tela, Saúde dos dados e M6 (filas antigas por estação)

**Files:** bloco `ferramenta/migracao` (a tela); o ponto de entrada em Saúde dos dados, no mesmo lugar onde `ferramenta/verificar` é aberta; `testes/plataforma/migracao.cjs`, registrado em `scripts/testar-plataforma.mjs`.

- [ ] **Step 1: Teste Playwright que falha, com uma pasta OPFS montada a partir de `pastaMain()`:**
  - abrir Saúde dos dados › "Migração pontual (uso único)";
  - a prévia mostra contagens por item e por arquivo e a tabela de exceções, e "Baixar relatório" gera um CSV com uma linha por exceção;
  - sem sessão: só a prévia, sem o botão Aplicar;
  - com sessão ADMIN: escolher as exceções e aplicar com a confirmação digitada; os backups aparecem na pasta;
  - depois disso, Administração, Iniciativas, Equipamentos, Linha 360° e Paradas abrem sem "Base de versão anterior";
  - a Reunião diária mostra a mesma pauta;
  - a Minha fila da pessoa mostra os itens dela;
  - o teórico de gel do catálogo migrado é igual ao da main para a mesma data;
  - uma segunda execução diz "Nada a migrar";
  - M6: com `inic.fila` e `vac-portal › cadFila` não vazios no navegador, a tela "Esta estação" lista as duas filas e orienta enviá-las antes do corte; com tudo vazio, diz "Sem fila antiga nesta estação". O texto deixa claro que o diagnóstico vale só para a estação em que foi feito.
- [ ] **Step 2–4:** FAIL → implementar (padrão visual da plataforma, skill padrao-visual) → PASS.
- [ ] **Step 5:** Commit "Migrador: tela em Saúde dos dados e diagnóstico das filas por estação".

### Task 6: Documentação, pendências e regressão

- [ ] **Step 1:** `PENDENCIAS.md` ganha duas pendências antes do merge da #149: o botão "Trazer ações do Waste" (`#mwTrazer`, `MigWaste`) aparece e falha (sai na Task 5 do bloco 2, substituído pelo M5); e o M6 confirmado em cada estação.
- [ ] **Step 2:** `docs/MIGRACAO-BASE-LIMPA.md` é o roteiro do corte:
  - janela com os demais gravadores parados;
  - backup integral verificado;
  - M6 em cada estação, com uma linha de evidência por estação;
  - prévia revisada e exceções decididas pelo responsável;
  - aplicar;
  - conferir M5 (`conferirM5`) antes de qualquer limpeza no Waste;
  - reversão por `restaurar`;
  - gravações feitas depois do corte exigem conciliação;
  - H01/H02.
- [ ] **Step 3:** `CLAUDE.md`, linha `ferramenta/*` do mapa: acrescentar "migração pontual (uso único; sai depois do corte)". `docs/BASE-LIMPA.md`: apontar o migrador.
- [ ] **Step 4:** Regressão: `npm run -s lint`, `npm run -s build`, `npm run -s test:unit`, `node testes/tudo.js`, `npm run -s test:plataforma`, `npm run -s test:reprodutibilidade` → todos passam.
- [ ] **Step 5:** Commit "Migrador: roteiro do corte, pendências da #149 e documentação".

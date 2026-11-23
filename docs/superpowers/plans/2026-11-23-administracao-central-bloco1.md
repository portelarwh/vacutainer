# Administração central · Bloco 1 (inventário, fundação e Gel) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Levantar todas as configurações da plataforma contra as nove páginas antigas, criar a porta única de leitura do cadastro (`vacCad`) e a Administração por assunto, e entregar o assunto **Gel** completo (formato → composições → locais de descarte), com Gel e Produção lendo só da Administração.

**Architecture:** O cadastro `vacutainer-cadastros.json` (dono: Administração, bloco `motor/portal`) passa a `schemaVersion: 2`, com uma seção `gel` nova. Um único `vacCad` em `comum/bases` substitui as nove cópias por motor e ganha métodos de leitura por vigência. As páginas deixam de copiar o cadastro para as próprias bases. Cada tarefa remove o caminho antigo na mesma entrega.

**Tech Stack:** JavaScript ES2022 dentro de `Plataforma.html` (blocos `<textarea data-vac-source>`), testes `node --test` (`testes/plataforma/*.test.mjs`, com `vm` sobre o texto do bloco) e Playwright 1.63 (`testes/plataforma/*.cjs`).

**Spec:** `docs/superpowers/specs/2026-11-23-administracao-central-design.md`

## Global Constraints

- Arquivo único `Plataforma.html`. Editar blocos com scripts que codificam `&` → `&amp;` e `</textarea` → `&lt;/textarea`; nenhum outro `&lt;` no bloco. Depois de cada mudança: `npm run -s atualizar:metadados`.
- "Ausência ou erro nunca vira zero": leitura sem cadastro ou sem vigência na data devolve `null` e a tela mostra o aviso, nunca 0.
- Vigências gravadas são imutáveis: só a vigência futura pode ser excluída; para mudar uma passada, cria-se nova vigência. Leitura pela data do fato.
- Códigos de catálogo, equipamento, turno e parada não mudam. Códigos são texto.
- Só a Administração grava `vacutainer-cadastros.json`, por `Cad.ops([...])` com auditoria.
- Fórmulas e a interpretação de turnos e madrugada não mudam. Os números do scrap de gel do cenário são os mesmos antes e depois (Task 9).
- Cada tarefa remove o caminho antigo que ela substitui. Não fica leitor duplo nem campo com dois nomes.
- Toda entrega: versão da plataforma (`const VERSION` em `modulo/App`), primeira entrada de `NOVIDADES` (motor/portal) igual a ela, versões dos módulos tocados (`VERSOES`, `PAGE.versao`/`APP_VERSION`), linha em `PENDENCIAS.md`, teste novo registrado em `scripts/testar-plataforma.mjs` (lista da linha 13) quando for `.cjs`, cenário refeito (`node scripts/cenario-demo.cjs --gravar`) quando o formato mudar.
- Testes sem internet (`testes/http-local.cjs`).

## Review Focus

1. **Fato antes da primeira vigência do formato** (scrap lançado numa data anterior a qualquer vigência): `vacCad.gel.formato` devolve `null` e o registro de scrap mostra "sem formato do gel vigente em dd/mm/aaaa", sem gramas zerados. Teste na Task 5.
2. **Vigência futura cadastrada:** scrap de hoje usa a vigência de hoje, não a futura. Teste na Task 5.
3. **Pasta real ainda no formato 1 depois da atualização:** a Administração mostra "Cadastro no formato antigo · Importar das bases atuais", não grava nada sozinha; Gel e Produção mostram "cadastro do gel não importado" e não lançam com zero. Testes nas Tasks 7 e 8.
4. **Equipamento desativado que tem locais de descarte:** os locais somem do registro de scrap, mas o scrap já lançado continua mostrando o nome do local. Teste na Task 8.
5. **Tentar mudar uma vigência passada do formato:** a tela não oferece Editar/Excluir na vigência vigente ou passada; só "Nova vigência". Teste na Task 6.

---

## Etapa 0 · Inventário

### Task 1: `docs/CONFIGURACOES.md` comparado com as nove páginas antigas

**Files:**
- Create: `scripts/inventario-paginas-antigas.mjs` (uso local; extrai as páginas antigas do Git para a pasta de rascunho)
- Create: `docs/CONFIGURACOES.md`

**Interfaces:**
- Produces: a tabela que as Tasks 4–9 seguem para o Gel e que os planos das etapas 3–7 seguem para os outros assuntos.

- [ ] **Step 1:** `scripts/inventario-paginas-antigas.mjs <pasta>` grava em `<pasta>` cada página de `git show a2214fd^:paginas/<arquivo>` para os nove arquivos (`OEE-Vacutainer.html`, `Gestão-Gel-Vacutainer.html`, `Perdas-Ordem.html`, `Paradas.html`, `Equipamentos.html`, `Iniciativas.html`, `Linha-360.html`, `Projetos.html`, `Portal.html`) e também `git show 2161e02:paginas/Gestão-Gel-Vacutainer.html` como `Gel-2026-11-13.html`. Falha com mensagem clara se o repositório for raso (`git rev-parse --is-shallow-repository` = true).
- [ ] **Step 2:** Rodar `node scripts/inventario-paginas-antigas.mjs $SCRATCH/antigas`. Esperado: 10 arquivos, cada um com mais de 100 kB.
- [ ] **Step 3:** Escrever `docs/CONFIGURACOES.md`, uma seção por assunto do desenho (os 8). Cada linha de tabela tem estas colunas: `Configuração | Página antiga (tela) | Onde está hoje (bloco · tela · campo) | Cópias hoje | Quem lê | Perdido ou resumido? | Destino v2`. Cobrir todas as telas de configuração de cada uma das nove páginas antigas e os campos de `CAD_T`, `parametros.*`, `settings.*` (motor/oee) e `S.config.*` (motor/gel). Exemplos que **têm** de aparecer: gel do Tubo 100 = 0,936 g na página antiga contra `GEL_FMT_DEF` 0,834 g hoje; `S.config.fmts` e `S.config.equips` copiados no Gel; `vacCad()` definido nove vezes.
- [ ] **Step 4:** Ao fim, uma seção "Decisões para o responsável" com o que o inventário não resolve (ex.: Linha 360 é configuração ou desenho do mapa).
- [ ] **Step 5:** Commit: `docs: inventário de configurações contra as nove páginas antigas (etapa 0)`. Pausar e pedir a conferência do responsável antes da Task 4.

---

## Etapa 1 · Fundação

### Task 2: um só `vacCad` em `comum/bases`

**Files:**
- Modify: `Plataforma.html` › `comum/bases` (adicionar `vacCad`); motores com a definição repetida `vacCad(){if(typeof Cad!=='undefined'&&Cad&&Cad.D)return Cad.D;try{return JSON.parse(localStorage.getItem('vac.cadastros')...` (hoje 9 cópias, ex.: linhas 4087, 12680, 24434…): remover todas.
- Test: `testes/plataforma/vaccad.test.mjs`

**Interfaces:**
- Produces: `vacCad(): object|null`, o documento do cadastro (`Cad.D` na Administração, senão a cópia `localStorage['vac.cadastros']`, senão `null`). Um único lugar.

- [ ] **Step 1: teste que falha**

```js
test('vacCad existe uma vez só, em comum/bases', () => {
  const html = helpers.current();
  assert.match(html.text('comum/bases'), /function vacCad\(\)/);
  const fora = ['motor/portal','motor/oee','motor/perdas','motor/gel','motor/paradas','motor/equip','motor/inic','motor/linha','motor/projetos']
    .filter(b => /vacCad\(\)\s*\{/.test(html.text(b)));
  assert.deepEqual(fora, []);
});
test('vacCad lê Cad.D, senão vac.cadastros, senão null', () => { /* vm com {Cad:{D:{rev:7}}} → rev 7; sem Cad e com localStorage → doc; vazio → null; JSON inválido → null */ });
```

- [ ] **Step 2:** `node --test testes/plataforma/vaccad.test.mjs`. Esperado: FAIL (`vacCad` não está em comum/bases).
- [ ] **Step 3:** Mover a definição para `comum/bases` (o mesmo comportamento) e apagar as nove cópias. As chamadas `typeof vacCad === 'function' ? vacCad() : null` continuam funcionando; trocar por `vacCad()` direto onde `comum/bases` já está carregado.
- [ ] **Step 4:** Rodar o teste (PASS), `npm run -s atualizar:metadados`, `node testes/plataforma/cad-consulta.cjs`, `node testes/plataforma/turno-vigente.cjs` (PASS).
- [ ] **Step 5:** Commit `vacCad único em comum/bases (sem cópia por motor)`.

### Task 3: métodos de leitura `vacCad.lista / item / vigente / param`

**Files:**
- Modify: `comum/bases` (métodos no próprio `vacCad`); remover `vacVig` e `vacParam` de `comum/interface`, trocando as chamadas por `vacCad.vigente`/`vacCad.param`.
- Test: `testes/plataforma/vaccad.test.mjs`

**Interfaces:**
- Consumes: `vacCad()` (Task 2).
- Produces:
  - `vacCad.lista(tipo: string, {ativos = true, data} = {}): object[]`: itens do tipo; com `data`, só os que têm vigência nessa data (tipos com `vigencias`).
  - `vacCad.item(tipo: string, codigo: string): object|null`: compara `String(codigo)`.
  - `vacCad.vigente(vigencias: object[], data?: 'AAAA-MM-DD'): object|null`: maior `de` com `de <= data` e (`!ate` ou `ate >= data`); `data` padrão `vacHoje()`.
  - `vacCad.param(caminho: string, data?): any|null`: `'producao.semaforoVerdePct'` lê `parametros.producao.semaforoVerdePct`; valor com `vigencias` devolve o vigente; ausente → `null`.

- [ ] **Step 1: testes que falham** (cadastro fictício no `vm`):

```js
vigente([{de:'2026-10-01',v:1},{de:'2026-12-01',v:2}], '2026-11-23') → {de:'2026-10-01',v:1}
vigente([{de:'2026-10-01',v:1}], '2026-09-30') → null
vigente([{de:'2026-10-01',ate:'2026-10-31',v:1}], '2026-11-01') → null
item('catalogos', 1001) encontra codigo '1001'
param('producao.inexistente') → null   // nunca 0
lista('turnos') não traz ativo:false; lista('turnos',{ativos:false}) traz
```

- [ ] **Step 2:** Rodar: FAIL. **Step 3:** Implementar. **Step 4:** PASS + `node testes/tudo.js tcalendario` + `npm run test:unit`. **Step 5:** Commit.

### Task 4: Administração por assunto + permissão por assunto

**Files:**
- Modify: `motor/portal`: `cadSide(sec)` (menu), `CAD_SECS`, perfis (`CAD_T.perfis` ou equivalente) e `Cad.podeEditar`.
- Test: `testes/plataforma/adm-assuntos.cjs` (registrar em `scripts/testar-plataforma.mjs`)

**Interfaces:**
- Produces:
  - `ADM_ASSUNTOS: {id, nome, itens:[sec]}[]`, nesta ordem e com estes ids: `planta` "Planta e linha", `produto` "Produto", `gel` "Gel", `equipamentos` "Equipamentos", `turnos` "Turnos e metas", `paradas` "Paradas e perdas", `pessoas` "Pessoas e acesso", `sistema` "Sistema". Cada `sec` atual (linhas, familias, catalogos, materiais, bom, equipamentos, componentes, modosFalha, turnos, calendario, metas, paradas, matriz, usuarios, perfis, parametros, programas, importar, apps, auditoria, backups, versoes, config, novidades, seguranca) aparece em exatamente um assunto.
  - Perfil ganha `assuntos: {[id]: 'editar'|'ver'}`. `Cad.podeEditarAssunto(id: string): boolean`. Os perfis que hoje passam em `Cad.podeEditar()` recebem `'editar'` em todos os assuntos (feito no importador da Task 7 e no cenário).
  - `Cad.podeEditar()` continua para Segurança/Configuração; as telas de cadastro passam a usar `podeEditarAssunto` do assunto delas.

- [ ] **Step 1: teste que falha:** o menu lateral mostra os 8 títulos nessa ordem; cada botão atual continua abrindo a mesma tela (mesmos `data-sec`); um perfil com `assuntos:{gel:'editar'}` e o resto `'ver'` vê "+ Novo" em Gel e não em Turnos.
- [ ] **Step 2:** Rodar `node testes/plataforma/adm-assuntos.cjs`: FAIL. **Step 3:** Implementar. **Step 4:** PASS + `node testes/plataforma/cfg-adm.cjs` + `node testes/plataforma/permissoes-paridade.cjs`. **Step 5:** Commit.

---

## Etapa 2 · Gel

### Task 5: formato v2 do Gel e `vacCad.gel`

**Files:**
- Modify: `motor/portal`: `cadVazio()` (`schemaVersion: 2`, `gel: {formatos: [], locais: []}`), validação `schemaVersion > 2` → "mais nova", `schemaVersion < 2` → modo "formato antigo" (Task 7).
- Modify: `comum/bases`: `vacCad.gel`.
- Test: `testes/plataforma/vaccad-gel.test.mjs`

**Interfaces:**
- Consumes: `vacCad.vigente`, `vacCad.lista`, `vacCad.item`.
- Produces (formato no cadastro):

```js
gel: {
  formatos: [{ de:'2026-10-01', ate:null, embalagemG:75, folhaPurgaG:5, sobraBarrilKg:1.6,
    tubos: { '100': {tuboG:4.779, gelG:0.936, aditivoG:0.02, tampaRolhaG:2.3},
             '75':  {tuboG:3.56,  gelG:0.834, aditivoG:0.015, tampaRolhaG:2.3} },
    motivo:'', por:'<id>', em:'<iso>' }],
  locais: [{ id:'L-0001', equipamento:'<codigo EQ>', local:'Caixa rejeição', comp:'completo'|'tubogel'|'spray'|'gel'|'barril',
             categoria:'T'|'P'|'B', motivos:['<id>'], embalagemG:null, ordem:1, ativo:true }]
}
```

  - `vacCad.gel.formato(data): object|null`: o formato vigente.
  - `vacCad.gel.composicao(tubo: '100'|'75', comp, data): {gPorTubo:number, partes:string[], etiqueta:boolean}|null`. Partes: `completo` = tubo + tampaRolha + gel + aditivo (+ etiqueta contada em unidades, `etiqueta:true`); `tubogel` = tubo + gel; `spray` = tubo + gel + aditivo; `gel` = gel puro (pesado); `barril` = sobra (`gPorTubo` null, usa `sobraBarrilKg`).
  - `vacCad.gel.locais({data, equipamento, ativos = true} = {}): object[]`: ordenado por `ordem`; exclui locais cujo equipamento está inativo.
  - Remover `GEL_FMT_DEF` (motor/portal) e o `FMT_DEF` do Gel: sem formato não há padrão de fábrica, há `null`.

- [ ] **Step 1: testes que falham**, com os valores do print do responsável (formato de 01/10/2026):

```js
composicao('100','completo','2026-11-23').gPorTubo === 8.035
composicao('100','tubogel','2026-11-23').gPorTubo === 5.715
composicao('100','spray','2026-11-23').gPorTubo === 5.735
composicao('75','completo','2026-11-23').gPorTubo === 6.709
composicao('75','tubogel','2026-11-23').gPorTubo === 4.394
composicao('75','spray','2026-11-23').gPorTubo === 4.409
formato('2026-09-30') === null && composicao('100','completo','2026-09-30') === null   // Review Focus 1
// com uma vigência futura de 2026-12-01 (gelG 1.0): formato('2026-11-23').tubos['100'].gelG === 0.936   // Review Focus 2
locais({equipamento:'EQ-INATIVO'}) → []
```

  Arredondar a soma a 3 casas (`Math.round(x*1000)/1000`).
- [ ] **Step 2:** FAIL. **Step 3:** Implementar. **Step 4:** PASS. **Step 5:** Commit.

### Task 6: tela Administração › Gel

**Files:**
- Modify: `motor/portal`: nova seção `gel` (rota `#cadastros/gel`, assunto `gel`) com três partes na mesma página, no padrão visual (skill `padrao-visual`) e com o detalhe da página antiga de 13/11 (`Gel-2026-11-13.html` da Task 1):
  1. **Formato do tubo:** formulário "Nova vigência" (Vale a partir de, Peso da embalagem de pesagem (g), Folha plástica da purga (g), Sobra padrão de gel por barril (kg), tabela Componente × Tubo 100 / Tubo 75: Tubo vazio, Gel, Aditivo / spray, Tampa + rolha (conjunto), Etiqueta "contada em unidades") e a tabela de vigências (Vigente desde, Tubo 100, Tubo 75, Embalagem, Folha purga, Sobra/barril). Excluir só na vigência futura.
  2. **Composições:** tabela calculada por `vacCad.gel.composicao` para a vigência escolhida (Composição | Componentes | Tubo 100 | Tubo 75), só leitura.
  3. **Locais de descarte:** lista com arrastar ⠿ / ↑ ↓ para a ordem do registro de scrap; colunas Equipamento · Local, Descarte (categoria: composição), Embalagem (padrão ou g), Situação; "+ Local" e Editar (equipamento do cadastro, local, composição, categoria Tubos/Purga/Barril, motivos aceitos, embalagem própria). Excluir = inativar.
  Grava por `Cad.ops` com `tipo:'gel'` (auditoria com motivo).
- Remove: Parâmetros › Gestão de Gel (`#cadastros/parametros/gel`, `#parGel`) e a parte "Gel: embalagem e descartes" da ficha do equipamento (`gelEq()`); na ficha fica um link "Locais de descarte deste equipamento › Gel".
- Test: `testes/plataforma/adm-gel.cjs`

**Interfaces:**
- Consumes: `vacCad.gel.*` (Task 5), `Cad.podeEditarAssunto('gel')` (Task 4).

- [ ] **Step 1: teste que falha** (cenário de demonstração): salvar nova vigência 01/12/2026 com Gel 100 = 1,000 → a tabela de vigências tem 2 linhas, Excluir só na de 01/12 (Review Focus 5); a tabela de composições na vigência de 01/10 mostra 8,035 / 5,715 / 5,735 e 6,709 / 4,394 / 4,409; arrastar o 3º local para 1º e reabrir mantém a ordem; `#parGel` não existe; a ficha do equipamento não tem a tabela de descartes; a auditoria registra as três gravações.
- [ ] **Step 2:** FAIL. **Step 3:** Implementar. **Step 4:** PASS + `node testes/plataforma/cad-consulta.cjs` + `node testes/plataforma/linha-ficha.cjs`. **Step 5:** Commit.

### Task 7: "Importar das bases atuais" (uso único)

**Files:**
- Modify: `motor/portal`: assunto Sistema › "Importar das bases atuais"; faixa no topo da Administração quando `schemaVersion < 2`.
- Test: `testes/plataforma/adm-importar.cjs`

**Interfaces:**
- Produces: `ImportarV1.plano(cad: object, gelBase: object|null): {gel:{formatos,locais}, perfis, avisos:string[]}`.
  - Fontes, nesta ordem de preferência: `cad.parametros.gel.formatos` (`{from,tara,taraP,sobra,f:{'100':{tubo,gel,adit,tr}}}` → `{de,embalagemG,folhaPurgaG,sobraBarrilKg,tubos:{'100':{tuboG,gelG,aditivoG,tampaRolhaG}}}`); senão `fifo-base.json` `config.fmts`. Locais: `cad.equipamentos[].gel.descs` (`{id,local,comp,cat,mots}` + `gel.tara`) → `gel.locais`; senão `config.equips` do Gel.
  - Remove de `cad`: `parametros.gel.formatos`, `equipamentos[].gel.descs`, `equipamentos[].gel.tara`.
  - Perfis: quem passa em `podeEditar` hoje recebe `'editar'` em todos os assuntos.
  - Sobe `schemaVersion` para 2.
- Prévia em modal: contagens por assunto, cada formato (antes → depois) e avisos (ex.: "local sem equipamento correspondente: SALA GEL"). Botão "Importar"; grava com auditoria `importação do formato 1`.
- Enquanto `schemaVersion < 2`: a Administração não grava nada além da importação; Gel e Produção mostram "cadastro do gel não importado" (Review Focus 3).

- [ ] **Step 1: teste que falha:** cadastro v1 fictício com 1 formato e 14 descartes (os nomes da página antiga: MAQUINA GEL - VADG01 … MAQUINA GEL - BARRIL) → faixa "Cadastro no formato antigo"; prévia mostra 1 formato e 14 locais; depois de Importar, `schemaVersion === 2`, `vacCad.gel.locais().length === 14`, `parametros.gel.formatos` some; a Produção aberta antes da importação mostra o aviso e não grava scrap com 0.
- [ ] **Step 2:** FAIL. **Step 3:** Implementar. **Step 4:** PASS. **Step 5:** Commit.

### Task 8: Gel e Produção leem só de `vacCad.gel`

**Files:**
- Modify: `motor/gel`: remover a cópia do cadastro (`S.config.fmts`, `S.config.equips`, `FMT_DEF`, a sincronização em torno da linha 3917 `pg()`/`eq()`/`eqLivres()`, `S.config.lineHeads` se for só cadastro conforme o inventário); `fmtList()` e `equipList()` passam a `vacCad.gel.formato(data)` / `vacCad.gel.locais({data})`. O registro de scrap guarda o `id` do local, a data e os pesos; o nome mostrado vem do cadastro, com o nome gravado no lançamento como reserva (Review Focus 4).
- Modify: `motor/oee`: scrap de gel da Produção (`COMPS` perto da linha 1848, e popup Lançar/Editar scrap) usa `vacCad.gel.composicao` e `vacCad.gel.locais`; remover a tabela `COMPS` local e qualquer cópia de formato.
- Modify: `motor/portal`: remover a parte de gel do "Trazer configurações" (`trazer.Só no Gel · parâmetros do gel`, `· equipamentos`).
- Test: `testes/plataforma/gel-fonte-unica.cjs` + o teste de contrato `testes/plataforma/contrato-cadastro.test.mjs`

**Interfaces:**
- Consumes: `vacCad.gel.formato/composicao/locais` (Task 5).
- Produces: `contrato-cadastro.test.mjs` com a lista `PROIBIDO_FORA_DA_ADM = [/S\.config\.fmts/, /S\.config\.equips/, /FMT_DEF/, /GEL_FMT_DEF/, /vacCad\(\)\s*\{/]` verificada em todos os blocos `motor/*` exceto `motor/portal` (e `GEL_FMT_DEF`, `vacCad(){` também no portal). As próximas etapas só acrescentam padrões a essa lista.

- [ ] **Step 1: testes que falham:** (a) contrato: os padrões aparecem → FAIL; (b) `gel-fonte-unica.cjs`: no cenário, mudar na Administração o Gel 100 de uma vigência futura e avançar o relógio para depois dela → Gel e Produção mostram a composição nova sem "Sincronizar"; inativar o equipamento de um local → o local some do registro, o scrap antigo daquele local continua com o nome; cadastro v1 → aviso "cadastro do gel não importado".
- [ ] **Step 2:** FAIL. **Step 3:** Implementar. **Step 4:** PASS + `node testes/plataforma/scrap-lado.cjs` + `node testes/plataforma/gel-producao.cjs` + `node testes/plataforma/gel-relatorio.cjs` + `node testes/tudo.js` (suítes do Gel). **Step 5:** Commit.

### Task 9: números iguais, cenário e entrega

**Files:**
- Create: `testes/plataforma/gel-numeros.cjs`
- Modify: `scripts/cenario-demo.cjs` (cenário em `schemaVersion: 2` com `gel.formatos` = o formato de 01/10/2026 do print e os 14 locais da página antiga), `dados/cenario` (regravado), versões, `NOVIDADES`, `PENDENCIAS.md` (linha ADM-CENTRAL bloco 1), `docs/CONTRATO-MOTORES.md` (Gel lê o cadastro por `vacCad.gel`).

- [ ] **Step 1:** **Antes** de qualquer mudança do Gel (rodar no `main`, ou guardar a saída já no começo da Task 5): `gel-numeros.cjs` grava em `testes/amostras/gel-numeros-antes.json` os totais de scrap de gel do cenário por dia, local e categoria (g e kg) e o consumo do mês.
- [ ] **Step 2:** Depois das Tasks 5–8, o mesmo teste compara com o arquivo. Esperado: iguais. Diferença só onde o cenário antigo usava o padrão de fábrica 0,834 g e o novo usa o formato cadastrado; nesse caso, o teste lista a diferença e o arquivo de referência é refeito com o cenário v2 **antes** da troca do código, para que a comparação seja de código, não de dado.
- [ ] **Step 3:** `node scripts/cenario-demo.cjs --gravar`, `npm run -s atualizar:metadados`, versões, Novidades, PENDENCIAS.
- [ ] **Step 4:** Suíte completa: `npm run lint`, `npm run test:plataforma`, `npm test`. Esperado: tudo passa.
- [ ] **Step 5:** Commit, push, PR rascunho, CI verde, merge. Avisar o responsável: rodar "Importar das bases atuais" na pasta real e conferir a tela Gel.

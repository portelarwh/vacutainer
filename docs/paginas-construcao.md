# Páginas em construção e em atualização

06/11/2026 · especificação. **Feito em 07/11/2026** (Portal 1.8.12, Produção 2.4.9, Waste 1.8.15, Gestão de Gel 2.03, Paradas 1.0.12, Equipamentos/Iniciativas/Projetos 0.1); o que ficou diferente do texto abaixo está no § 8. Divisão final das páginas (Portal 1.7, confirmada em 06/11/2026):

**Portal · Produção · Waste · Gestão de Gel · Paradas · Equipamentos (com manutenção) · Iniciativas (5S · OSM · KAS) · Projetos · Outros ▾ · ⚙ Administração**

Objetivo desta entrega: as três páginas novas passam a existir na pasta (aparecem na barra, no Portal e na busca) como **em construção**, e as páginas que ainda vão mudar bastante aparecem como **em atualização**. Ninguém perde o acesso ao que já funciona.

## 1. Situação de cada página

| Página | Arquivo | id | Situação inicial | Versão |
|---|---|---|---|---|
| Portal | `Portal.html` | `portal` | estável | próxima (Situação em Módulos, cartões) |
| Produção | `OEE-Vacutainer.html` | `oee` | estável | próxima (só o kit) |
| Waste | `Perdas-Ordem.html` | `perdas` | estável | próxima (só o kit) |
| Gestão de Gel | `Gestão-Gel-Vacutainer.html` | `gel` | **em atualização** | próxima (só o kit + `PAGE.estado`) |
| Paradas | `Paradas.html` | `paradas` | **em atualização** | próxima (só o kit + `PAGE.estado`) |
| Equipamentos | `Equipamentos.html` | `equip` | **em construção** | **0.1** (nova) |
| Iniciativas | `Iniciativas.html` | `inic` | **em construção** | **0.1** (nova) |
| Projetos | `Projetos.html` | `projetos` | **em construção** | **0.1** (nova) |

"Próxima" = a versão seguinte à que estiver no CLAUDE.md na hora de implementar (regra 8).

- **estável**: sem selo.
- **em atualização** (`atualizacao`): a página funciona e grava normalmente; algumas telas ainda usam configurações próprias e vão mudar (Gel: ler catálogos/turnos/equipamentos do Portal, Programação × Simulador; Paradas: ler a matriz e os limites só do Portal, eventos da Produção).
- **em construção** (`construcao`): a página existe só como esqueleto: mostra o que vai ter, não grava nada e não cria base.
- Quem decide é o administrador: a situação inicial vem do código, mas pode ser trocada no Portal (§ 4).

## 2. Campo `estado` (contrato)

Valores: `'construcao' | 'atualizacao' | null` (null ou ausente = estável). Opcional; quem não conhece ignora.

Ordem de prioridade (a primeira que existir vale):
1. **Portal › Configuração do Portal › Módulos** (escolha do administrador), gravada em `vac.sistemas[].estado` e em `portal-base.json › config.modulos[id].estado` (o mesmo lugar onde hoje fica "ocultar" e "menu Outros").
2. `PAGE.estado` declarado no HTML da página (situação inicial do código).
3. `DEFAULT_SYSTEMS[].estado` (reserva, para navegador que nunca abriu o Portal).

Texto opcional: `PAGE.estadoNota` (uma frase do que está mudando, ex.: "Catálogos e turnos passam a vir do Portal") e `vac.sistemas[].estadoNota` (o Portal sobrepõe, como acima).

`DEFAULT_SYSTEMS` fica no catálogo comum **`fontes/kit/sistemas.js`** (o `aplicar_kit21.py` copia para todas as páginas); passa a ter:
```js
{id:'gel',…,estado:'atualizacao'}, {id:'paradas',…,estado:'atualizacao'},
{id:'equip',…,futuro:true,estado:'construcao'}, {id:'inic',…,futuro:true,sub:'5S · OSM · KAS',estado:'construcao'}, {id:'projetos',…,futuro:true,estado:'construcao'}
```
`futuro:true` continua significando "o HTML ainda não está na pasta" (some da barra). Quando o Portal acha o HTML, grava `futuro:false` como hoje e a página aparece com o selo do `estado`. A migração do `vac.sistemas` (`migrarSistemas`) completa `estado` a partir do `DEFAULT_SYSTEMS` **só quando o item ainda não tem** (não apaga escolha do administrador).

## 3. Kit (igual em todas as páginas) · `kit_v21.js` ganha o bloco "situação"

Acrescentar em `fontes/kit/kit_v21.js` (e aplicar com `python fontes/kit/aplicar_kit21.py` + `python fontes/producao/build.py`):

```js
/* kit v2.1 · situação da página: 'construcao' | 'atualizacao' | null (Portal › Configuração › Módulos > PAGE.estado > DEFAULT_SYSTEMS) */
const VAC_ESTADO = { construcao: { rot: 'em construção', cls: 'none' }, atualizacao: { rot: 'em atualização', cls: 'info' } };
function vacEstadoDe(id) { const L = typeof systems === 'function' ? systems() : []; const s = L.find(x => x.id === id) || {};
  const pg = typeof PAGE !== 'undefined' && PAGE.id === id ? PAGE : {};
  const e = s.estado !== undefined ? s.estado : pg.estado !== undefined ? pg.estado : null;
  return VAC_ESTADO[e] ? { estado: e, ...VAC_ESTADO[e], nota: s.estadoNota || pg.estadoNota || '' } : null; }
function vacEstadoRender() { … }   // ver abaixo
```

`vacEstadoRender()` (chamado no carregamento e depois de cada `renderSysNav`):
- **Barra do sistema**: em cada link de página com estado, um selo pequeno depois do nome: `<span class="vest" data-e="construcao">em construção</span>` (texto em caixa alta pequena, fundo suave pelos tokens `--none`/`--info`; no celular vira só um ponto colorido com `title`).
- **Faixa branca da página atual**: pílula ao lado da versão (`.pill none` ou `.pill info`) com o rótulo; `title` = `nota`.
- **Faixa logo abaixo das abas** (só na página atual com estado):
  - em atualização: "**Página em atualização.** Ela funciona normalmente; algumas telas ainda vão mudar. <nota> · Ver o que muda ↗" (link `vacPortalHref('versoes')`); botão ✕ esconde por 7 dias (`localStorage['vac.estadoOculto.<id>'] = data`).
  - em construção: "**Página em construção.** Ainda não grava dados; mostra o que vai ter." (sem ✕).
- Ctrl K ("Ir para"): o item da página mostra o selo no `sub`.
- CSS do selo e da faixa em **`fontes/kit/kit_visual.css`** (padrão visual comum; usa só os tokens comuns; tema escuro sem cor nova).

Páginas existentes: **só o kit muda** (nenhuma outra linha). Declarar `PAGE.estado`:
- Gel: `PAGE.estado = 'atualizacao'`, `estadoNota: 'Catálogos, turnos e equipamentos passam a vir do Portal; Programação e Simulador viram duas abas.'`
- Paradas: `PAGE.estado = 'atualizacao'`, `estadoNota: 'Matriz, componentes e limite de microparada passam a vir só do Portal; eventos da Produção entram como sugestão.'`
- Produção: o `PAGE` vem do build (acrescentar `estado:null` não é preciso).

## 4. Portal (versão seguinte)

1. `DEFAULT_SYSTEMS` com `estado` (§ 2) e `migrarSistemas` completando `estado` sem sobrescrever.
2. **Configuração do Portal › Módulos** (tabela que já tem "Arquivo", "ocultar", "menu Outros"): coluna nova **Situação** (`<select>`: Estável · Em atualização · Em construção) + campo **Nota** (uma linha). ⓘ: "Mostra um selo na barra, no Portal e na própria página. Em construção = só o esqueleto, não grava dados. Em atualização = funciona, mas algumas telas vão mudar. Ex.: Gestão de Gel · Em atualização · 'Catálogos passam a vir do Portal'." Salvar grava em `vac.sistemas` e em `portal-base.json › config.modulos` (com auditoria do Portal como as demais mudanças de Configuração).
3. **Visão geral**:
   - Página em construção **com** o HTML na pasta: cartão cinza "em construção" com a lista do que vai ter (lida de `PAGE.planejado` do HTML, § 5.2, pelo mesmo leitor de texto do quadro de Versões; sem base, sem erro "não encontrei a base").
   - Página em construção **sem** o HTML: continua na linha "Em construção: …" (como hoje).
   - Página em atualização: cartão normal (números do `exports`) com pílula "em atualização" no cabeçalho do cartão.
4. **Versões das páginas**: coluna **Situação** (selo) e a nota; o leitor `versaoHtml` também extrai `estado:'…'` e `estadoNota:'…'` do `PAGE` do HTML.
5. **Pendências**: página em construção não gera pendência "base não encontrada".
6. Base ausente de página em construção não é erro em lugar nenhum (cartão, Versões, Backups, TV: TV pula páginas em construção).
7. Kit aplicado (§ 3). Versão nova e linha no histórico de versões.

## 5. Páginas novas (esqueleto, versão 0.1)

### 5.1 Como gerar (para o kit ficar igual em todas)

- Criar `fontes/modelo/pagina-em-construcao.html`: um HTML único com **os mesmos blocos do kit** copiados do `Paradas.html` (CSS do kit + `kit_visual.css`, `vac-cabecalho v2` HTML, JS do kit v1+v2 com `systems/sysHref/renderSysNav/Busca/VacEntrar/vacPode/cycleTheme/Logo`, o catálogo `sistemas.js` e o bloco `kit_v21.js`), tokens de cor/fonte comuns, tema claro/escuro, e **nenhum** núcleo de gravação: sem pasta, sem base, sem backup e **sem `kit_bases.js`** (`vacRaiz`/`vacMoverBases` não são chamados; a página não toca em `00. Bases`).
- Criar `fontes/modelo/gerar_paginas.py`: lê uma lista de páginas (§ 5.3–5.5) e gera `paginas/Equipamentos.html`, `paginas/Iniciativas.html`, `paginas/Projetos.html` a partir do modelo, preenchendo `PAGE` e as abas. Rodar de novo regera as três (são geradas: **não editar à mão** enquanto estiverem em construção).
- Incluir as três em `fontes/kit/aplicar_kit21.py` (lista de páginas; só os blocos que elas têm: kit_v21, sistemas.js, kit_visual.css) para que mudanças futuras do kit cheguem nelas. Incluir também em `testes/tvisual.js` (layout nos 2 temas e 5 larguras).
- Quando uma página começar de verdade (v1.0), ela sai do gerador e passa a ser editada direto (registrar no CLAUDE.md).

### 5.2 O que toda página em construção tem

```js
const PAGE = { id, titulo, tituloCurto, subtitulo, versao:'0.1', baseFile, backupDir,
  estado:'construcao', estadoNota:'…',
  planejado:[ { aba:'…', grupo:'Operação|Análise|Gestão', itens:['…','…'] }, … ],   // lido também pelo Portal (Visão geral)
  busca(q){ /* abas da página */ } };
```
- Cabeçalho v2 completo (barra igual, Entrar pelo ID, ⚙, tema, Ctrl K), título e subtítulo da página, versão `v0.1` clicável → `Portal.html#versoes`, pílula **em construção**, botões Sincronizar/Backup/TV **escondidos** (não há base).
- **Abas** com os nomes definitivos, agrupadas (rótulo de grupo como no Paradas). Clicar numa aba mostra um cartão "**Em construção**" com: o que a aba vai fazer (lista `itens`), de onde vêm os dados (ex.: "Equipamentos e componentes: cadastro do Portal") e o link para os documentos de referência no repositório (texto, não link de arquivo). As abas entram no histórico (← Voltar) pelo kit.
- **Primeira aba** = "Visão geral" com: "Esta página está em construção", a lista de todas as abas planejadas (cartões por grupo), "O que já dá para usar hoje" (links para onde a informação está agora, § 5.3–5.5) e a ordem de entrega do plano.
- Endereço: `#aba=<id>` abre a aba; `#tv` mostra só um slide "em construção".
- **Não grava nada**: sem pedir pasta, sem base, sem backup, sem `exports`. Lê só `localStorage['vac.cadastros']` (via `vacCad()`) para mostrar contagens reais onde fizer sentido (ex.: "13 equipamentos cadastrados no Portal"), com "Editar no Portal".
- Celular 390 px sem rolagem lateral; tema escuro; nomes de arquivo sem acento.

### 5.3 Equipamentos (`Equipamentos.html`, id `equip`)

`baseFile:'equipamentos-base.json'`, `backupDir:'00. Backups/Equipamentos'`, título **EQUIPAMENTOS** · "Máquinas da linha e manutenção". Nota: "Ficha e indicadores por máquina, relatórios das máquinas e manutenção."

| Grupo | Aba (`id`) | Vai ter |
|---|---|---|
| Operação | Visão geral (`geral`) | cartões por máquina: OEE/D/P próprios, tempo parado, semáforo; gargalo do dia |
| Operação | Máquina (`maquina`) | ficha do cadastro (fotos, documentos, componentes), indicadores, eventos de parada da máquina |
| Análise | Relatórios de máquina (`relatorios`) | importação dos relatórios de cada máquina (4 estados: Produzindo · Parada · Ociosa · Bloqueada) |
| Análise | Intervalos anormais (`intervalos`) | sugestões de parada a partir dos relatórios (`EQ-…` no `exports.eventosParada`) |
| Análise | Comparativo (`comparativo`) | máquinas lado a lado, tendência |
| Manutenção | Plano preventivo (`preventiva`) | plano preventivo e preditivo por máquina/componente |
| Manutenção | Ordens de serviço (`os`) | OS abertas/fechadas, ligação com eventos do Paradas |
| Manutenção | TPM (`tpm`) | pilares, etiquetas, priorização pelas falhas recorrentes do Paradas |

"O que já dá para usar hoje": ficha do equipamento no Portal (`Portal.html#cadastros/equipamentos`), MTBF/MTTR em Paradas › Equipamentos (`Paradas.html#aba=equip`). Referência: plano § 6.4.

### 5.4 Iniciativas (`Iniciativas.html`, id `inic`)

`baseFile:'iniciativas-base.json'`, `backupDir:'00. Backups/Iniciativas'`, título **INICIATIVAS** · "5S · OSM · KAS". Nota: "Observações de segurança, auditorias 5S e kaizens numa página só."

Abas principais = as 3 iniciativas + uma geral; cada uma tem subabas (`#aba=osm/planner`):

| Aba (`id`) | Subabas | Vai ter |
|---|---|---|
| Visão geral (`geral`) | — | resumo das 3: OSM do mês × meta, % de operadores na meta, ações vencidas; 5S e KAS quando existirem |
| **OSM** (`osm`) · *próxima a ser construída* | Nova OSM · Observações · Ações (Planner: Quadro, Lista, Calendário, Por responsável) · Meta por operador · Painel · Temas e recorrência · Cobrança · Relatórios · Importar · Configuração | arquitetura completa em `docs/osm-arquitetura.md` |
| **5S** (`s5`) · *a desenhar* | Auditorias · Plano de ação · Painel | auditorias 5S por área, notas e ações |
| **KAS** (`kas`) · *a desenhar* | Ideias · Quadro · Painel | ideias e kaizens (campos do documento consolidado § 13) |

- As ações das três abas vão usar o mesmo quadro estilo planner (decisão a confirmar na fase OSM).
- Metas: `metasOsm` do cadastro (Portal › Metas de OSM) e metas da área com página "Iniciativas". A Visão geral já mostra a meta vigente lida do cadastro, se existir.
- Base futura (não criar agora; vai para `00. Bases/iniciativas-base.json`): `{ schema:'vac-iniciativas', schemaVersion:1, rev, …, osm:{…}, s5:{…}, kas:{…}, auditoria, exports }`.

"O que já dá para usar hoje": Portal › Metas de OSM (`Portal.html#cadastros/metasOsm`). Referência: plano § 6.5–6.6, `docs/osm-arquitetura.md`.

### 5.5 Projetos (`Projetos.html`, id `projetos`)

`baseFile:'projetos-base.json'`, `backupDir:'00. Backups/Projetos'`, título **PROJETOS** · "Projetos de melhoria e investimentos". Nota: "Escopo a desenhar: projetos de melhoria, projetos grandes e compra de máquina."

| Grupo | Aba (`id`) | Vai ter |
|---|---|---|
| Operação | Visão geral (`geral`) | carteira de projetos por situação |
| Operação | Projetos (`lista`) | lista e ficha do projeto (tipo, dono, ganho esperado, prazo) |
| Gestão | Cronograma (`cronograma`) | marcos e prazos |
| Gestão | Ações (`acoes`) | ações dos projetos (ligadas a Waste, Paradas, OEE) |
| Gestão | Relatórios (`relatorios`) | resumo para a diretoria |

Marcar na Visão geral: "Escopo ainda não definido; esta lista é provisória."

## 6. Testes (`testes/tconstrucao.js`)

- Portal em modo teste com `vac.sistemas` antigo (sem `estado`): a migração completa `estado` de Gel/Paradas/Equipamentos/Iniciativas/Projetos.
- Trocar a Situação do Gel para Estável em Configuração › Módulos: o selo some da barra no Portal e no Gel; voltar para Em atualização: aparece.
- Abrir `Equipamentos.html`, `Iniciativas.html`, `Projetos.html` direto: barra igual às outras, pílula "em construção", abas clicáveis com o cartão de construção, ← Voltar funcionando, `#aba=osm/planner` abre a subaba, nenhum pedido de pasta, nenhum erro no console, 390 px sem rolagem lateral, tema escuro.
- Gel e Paradas: faixa "em atualização" com ✕ (some por 7 dias); a página continua funcionando (testes `tg.js`, `tpg.js` sem erro).
- Produção e Waste: sem selo; `tz.js`, `tq.js`, `tr.js`, `tintegra.js`, `tdiag.js`, `tvisual.js`, `tbases.js` sem erro.
- `python fontes/producao/build.py` e `aplicar_kit21.py` depois do kit novo; `gerar_paginas.py` regera as 3 iguais (sem diferença no git).

## 7. Pronto quando

- [x] As 3 páginas novas na pasta aparecem na barra com selo "em construção", com as abas definitivas e sem gravar nada.
- [x] Gel e Paradas mostram "em atualização" (barra, pílula e faixa) e continuam funcionando igual.
- [x] Portal: Situação editável em Configuração › Módulos, cartões e Versões com o selo, nada de "base não encontrada" para página em construção.
- [x] Kit igual nas 8 páginas (`aplicar_kit21.py`), versões novas (§ 1) e docs: este arquivo marcado como feito, `portal-1-7.md` (seção da versão nova), CLAUDE.md (tabela de páginas com Situação, gerador das páginas em construção).

## 8. Como ficou (07/11/2026)

- **Kit** (`fontes/kit/kit_v21.js`): `vacEstadoDe(id)` e `vacEstadoRender()`; o selo da barra é um **ponto colorido** (cinza = em construção, azul = em atualização) com o texto no `title`/`aria-label` (com texto, a barra de 8 páginas quebrava em 2 linhas e a checagem de contraste do `tvisual` media o texto escondido); no menu Outros o texto aparece. Pílula ao lado da versão, faixa abaixo das abas (em atualização: ✕ esconde por 7 dias, `vac.estadoOculto.<id>`), selo no Ctrl K. CSS em `kit_visual.css`.
- **Prioridade** igual à do § 2, mas a migração **não copia** `estado` para o `vac.sistemas`: o kit cai no `PAGE.estado` e depois no `DEFAULT_SYSTEMS` quando o item não tem a chave. Assim, mudar a situação no código chega a todos; a escolha do administrador grava a chave (inclusive `null` = estável) e passa a mandar.
- **Portal 1.8.12**: Configuração › Módulos, em cada página: "Situação da página" + "Nota" (com ⓘ), gravadas em `vac.sistemas` e em `portal-base.json › config.sistemas`; ao abrir, o Portal aplica `estado`/`estadoNota` do portal-base no `vac.sistemas` do navegador (vale para todos os computadores). Página em construção com o HTML na pasta e sem base: cartão "em construção" com as abas lidas do bloco `<script type="application/json" id="vac-planejado">` do HTML (mais simples e seguro do que ler `PAGE.planejado` de dentro do JS); sem erro "base não encontrada" em cartões, Versões, Pendências; fora da TV, dos relatórios e das pílulas do topo. Página em atualização: pílula "em atualização" abaixo do título do cartão. Versões: selo na coluna Página e `estado` lido do `PAGE` do HTML.
- **Páginas novas**: `fontes/modelo/pagina-em-construcao.html` (CSS e JS do cabeçalho v2 copiados do Paradas, com o `systems()` marcando a própria página como existente) e `fontes/modelo/gerar_paginas.py` (lista das 3 páginas com `PAGE` e o plano de abas; gera e roda o `aplicar_kit21.py`). O `aplicar_kit21.py` também leva o `kit_bases.js` a elas (só definições; a página não chama `vacRaiz`/`vacMoverBases`). Iniciativas sem rótulo de grupo nas abas (Visão geral · OSM · 5S · KAS); subabas por `#aba=osm/planner`.
- **Testes**: `testes/tconstrucao.js` (48 checagens); `testes/tvisual.js` passou a incluir as 3 páginas (sem as checagens de dados/ações/gráficos, que não se aplicam).
- **Barra com 8 páginas** (`kit_visual.css`): com as páginas novas na pasta a barra quebrava em duas linhas até em 1920 px. A busca passou a ser só "⌕ Ctrl K", os links ficaram mais compactos e, abaixo de 1500 px, sai o texto "Sistemas · Linha Vacutainer" (o Portal continua como 1º link). Cabe numa linha de 1280 a 1920 px; em 1024 px usa duas.

## 9. 0.1.1 (07/11/2026)

O modelo `fontes/modelo/pagina-em-construcao.html` declarava `toast` duas vezes (idênticas, sem efeito). A linha duplicada foi tirada e as 3 páginas, geradas de novo. O `gerar_paginas.py` agora devolve as páginas ao que eram se o `aplicar_kit21.py` falhar.

## Iniciativas saiu da construção (08/11/2026)

Iniciativas virou página de verdade na **1.0.0** (E6 do plano único). Ela saiu da lista do `gerar_paginas.py` e agora se edita direto no HTML. Detalhes em `docs/iniciativas-planner.md`. Continuam em construção (geradas): Equipamentos e Projetos.


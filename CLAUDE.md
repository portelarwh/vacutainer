# Sistemas · Linha Vacutainer (BD Curitiba)

Plataforma de páginas HTML de arquivo único que trabalham juntas numa **pasta única da rede** (File System Access API). Na raiz da pasta ficam só os HTML, `lib/`, `Logo.png` e as pastas; **as bases `.json` ficam em `00. Bases/`** (kit vac-bases), os backups em `00. Backups/<módulo>/`. Instalação e atualização: **`Guia de instalação.html`** (raiz; prints de onde clicar), resumo em `paginas/LEIA-ME.txt`. Cada página tem a sua base JSON; o **Portal** é dono do cadastro geral. Interface e mensagens sempre em **português do Brasil**.

## Páginas (em `paginas/`, com `paginas/lib/`, é o que vai para a pasta da rede)

| Página | Arquivo | Base | Versão | Como editar |
|---|---|---|---|---|
| Portal (cadastro geral, Administração) | `Portal.html` | `portal-base.json` + `vacutainer-cadastros.json` | 1.9.4 | direto no HTML |
| Produção (OEE, plano, ordens SAP) | `OEE-Vacutainer.html` | `oee-vacutainer-base.json` (+ `ordens-base.json`) | 2.4.21 | **NÃO editar o HTML**: editar `fontes/producao/` e rodar o build |
| Waste (perdas por ordem, KKBC) | `Perdas-Ordem.html` | `perdas-base.json` | 1.8.25 | direto no HTML |
| Gestão de Gel | `Gestão-Gel-Vacutainer.html` | `fifo-base.json` | 2.13 · **em atualização** | direto no HTML |
| Paradas | `Paradas.html` | `paradas-base.json` | 1.0.24 · **em atualização** | direto no HTML |
| Equipamentos (com manutenção) | `Equipamentos.html` | `equipamentos-base.json` | 1.0.5 · **em atualização** | direto no HTML (saiu do gerador na 1.0.0; `docs/equipamentos-v1.md`) |
| Iniciativas (Ações/Planner · KAS · OSM · 5S) | `Iniciativas.html` | `iniciativas-base.json` | 1.0.5 · **em atualização** | direto no HTML (saiu do gerador na 1.0.0; `docs/iniciativas-planner.md`) |
| Projetos | `Projetos.html` | (`projetos-base.json`, ainda não existe) | 0.1.8 · **em construção** | **gerada**: `fontes/modelo/gerar_paginas.py` |

Divisão final (Portal 1.7): Portal · Produção · Waste · Gestão de Gel · Paradas · **Equipamentos** (inclui manutenção; não há página Manutenção) · **Iniciativas** (uma página: Ações/Planner · KAS · OSM · 5S; não há OSM.html) · **Projetos** · Outros ▾ · ⚙ Administração.
Situação de cada página (em construção / em atualização / estável): `PAGE.estado` + `sistemas.js`, trocável no Portal › Configuração › Módulos; ver `docs/paginas-construcao.md`. Páginas em construção são **geradas** (não editar o HTML; editar `fontes/modelo/` e rodar o gerador). Quando uma delas começar de verdade (v1.0), tirar da lista do gerador e passar a editar direto. Arquitetura: `docs/plano-evolucao-plataforma.md`, `docs/osm-arquitetura.md` (aba OSM de Iniciativas). `docs/paginas-novas.md` é histórico (lista antiga Máquinas/Manutenção).

Demonstração integrada: botão comum nas oito páginas; `paginas/Demonstracao.html` reúne as páginas reais e mantém os exemplos na memória durante a navegação, sem bases reais. Fontes e limites em `docs/demonstracao-integrada.md`. **Depois de qualquer build/alteração das páginas, rodar `python fontes/demo/gerar_demo.py` por último e copiar o pacote junto com os HTML.**

SQDCP (Produção 2.4.20): quadro de 25 posições, acidente/QN por turno e impressão de uma A4 paisagem. Fontes em `fontes/producao/sqdcp*`; uso, contratos e pendências em `docs/producao-sqdcp.md`. Campos opcionais; ausência de resposta nunca é zero.

## Comandos

```bash
python fontes/producao/build.py        # monta paginas/OEE-Vacutainer.html a partir de OEE-base-2.0.html + ordens_servico.js + ordens_tela.js + cad_sync.js + kit_v21.js
python fontes/kit/aplicar_kit21.py     # recopia fontes/kit/kit_v21.js, o catálogo fontes/kit/sistemas.js, o padrão visual fontes/kit/kit_visual.css e as bases em 00. Bases fontes/kit/kit_bases.js nas outras páginas (Portal, Waste, Paradas, Gel e as 3 em construção)
python fontes/modelo/gerar_paginas.py  # gera Projetos.html (em construção) a partir de fontes/modelo/pagina-em-construcao.html e roda o aplicar_kit21.py
python fontes/demo/gerar_demo.py       # pacote offline da demonstração; SEMPRE depois dos outros builds
node testes/tparada_tempo.js           # duração visível, regras do Portal, troca de código, gravação e abono
node testes/tsqdcp.js                 # formulário S/Q, QN única, relatórios, reimportação, persistência e A4
node testes/tdemo.js                  # navegação nas oito páginas, ação Paradas → Planner → Portal/ficha, reinício/saída e isolamento
node testes/tpg.js                     # testes Playwright (abrem paginas/ em modo teste/exemplo; imprimem "sem erros")
node testes/tintegra.js                # Portal × exports: números iguais aos das páginas, urgência, gravação pendente com conflito
node testes/tdiag.js                   # cenários das auditorias de 06/11/2026 (F01–F08, M01–M04: colisão e falha de leitura na gravação, CadSync, SAP, Gel, Paradas, versões); tintegra e tdiag saem com código 1 se falhar
node testes/tvisual.js                 # layout: 8 páginas (as 3 em construção sem as checagens de dados) × 2 temas × 5 larguras (geometria, abas, contraste, tema entre páginas); prints em testes/saida/visual/; código 1 se falhar
node testes/tbases.js                  # bases em 00. Bases: mover da raiz, ler antes/depois, gravar, cópia mais nova/velha na raiz, B01–B07 com falhas injetadas, concorrência, volta de versão (OPFS + HTTP local); código 1 se falhar
node testes/trelatorios.js            # relatórios: PDF (pdfinfo/pdftotext), texto, Outlook, impressão (2 temas), ordem das abas, aba inicial por perfil; código 1 se falhar
node fontes/guia/gerar_guia.js         # gera "Guia de instalação.html" (raiz) a partir de fontes/guia/guia_modelo.html, com prints reais das páginas embutidos; rodar quando mudar tela de conexão/entrada ou versão
node testes/tmeta.js                   # importação da Meta OEE FY27 no Portal (precisa também do pacote npm xlsx)
node testes/tconstrucao.js             # situação das páginas: selos, faixa, Portal › Módulos, cartão em construção, as 3 páginas geradas (2 temas, 390 px); código 1 se falhar
node testes/tseguranca.js             # revisão 065fe6f: botões do Waste com valores importados, restauração sem cópia (Portal/Gel), CSV sem fórmulas, URLs de download, TV da Produção, índice do Gel, scripts em duas fases; código 1 se falhar
node testes/tordens.js                # E1 do plano único: Produção › Ordens com leitura estrita, pendência recuperável (Gravar de novo), releitura por revId, backup obrigatório antes de substituir, backups do local antigo (OPFS + HTTP local); código 1 se falhar
node testes/tvigencias.js             # E2 do plano único: versão igual em tela/código/base/Portal nas 8 páginas, "hoje" no dia local (22h30 de Brasília), meta WASTE-MES por mês ponderada pelos dias; código 1 se falhar
node testes/tnumeros.js               # E3: vacNumero (decimal, milhar, SAP) nas páginas, preço do Gel com "12a" não grava, minutos/vezes do Forms no Paradas; código 1 se falhar
node testes/tficha.js                 # E5: ficha da ordem/lote/LP (mesmos números dos exports nas 5 páginas), Ctrl K por índice (LX1 antes de LX10), cópia sem pasta, versão 2 recusada, #ficha=, ← Voltar; código 1 se falhar
node testes/tplanner.js               # E6/E8: Iniciativas › Ações (base em 00. Bases, operações, duas estações, erro de leitura, tempos com transferência/espera/reabertura, exports, #nova= com aviso de ação parecida, KAS, links das outras páginas); código 1 se falhar
node testes/tfila.js                  # E10: Portal › Minha fila (Minhas, Minha equipe pela área do cadastro, Sem responsável) e Reunião diária (dia/turno, granularidade, pauta, decisão, fotografia, encaminhar); código 1 se falhar
node testes/tequip.js                 # E11: Equipamentos (ficha, OS do evento do Paradas sem cópia, TAG com vigência, anomalia → OS, Paradas mostra a OS); código 1 se falhar
node testes/tpendencias.js            # C1: alterações pendentes sem perda entre abas (fila durável; trava da 2ª aba no Portal/Waste), base que some não vira vazia, formato desconhecido não grava, link de origem seguro, regravação em 24 h; código 1 se falhar
node testes/tcorrecoes.js             # C2–C6: resumo do dia ao voltar à aba, link da anomalia, troca de usuário, ordem com zeros, sem dado de paradas ≠ 0, ação do grupo com todas as ordens, links da Reunião e do Pareto, saúde dos dados no Portal › Versões, ficha por pasta; código 1 se falhar
node testes/tnv.js                    # NV-01–NV-05: isolamento por pasta, duas abas, cache homônimo, reserva em falha e saúde dos dados; dados fictícios
node testes/tudo.js                   # a suíte inteira, uma por vez: passou / falhou / NÃO VERIFICADO (falta biblioteca ou pacote; não conta como aprovado); tz roda de novo uma vez; código 1 se alguma falhar
node testes/tcontratos.js             # E4: exports por ordem (Produção 24 meses e dias do lote, Paradas, Gel), versão conferida pelos leitores, Waste com ordem em várias competências e dias do lote; código 1 se falhar
```

- O build usa substituições exatas (`R(antes, depois)`) sobre a base 2.0: se um trecho não for achado exatamente 1 vez, para com `ERRO`. Mudança na Produção = nova regra `R(...)` no `build.py` ou mudança nos `.js` de `fontes/producao/`.
- Playwright e Chromium: `require('playwright')`; os testes usam `enterTest()` (Portal, Waste, Paradas) ou `Demo.enterExample()` (Produção) e bases sintéticas em `testes/bases/`. Amostras do SAP (descaracterizadas) em `testes/amostras/`. Prints vão para `testes/saida/` (fora do git).
- `testes/t181.js` tem um passo da matriz que expira (timeout) no fim: problema do teste, não da página; ajustar quando mexer na matriz.

## Regras da plataforma (não quebrar)

1. **Cada página só grava na própria base.** As outras leem só o bloco `exports` (com `exportsVersion`) — nunca a estrutura interna de outra página. O Portal mostra os números do `exports` (sem recalcular); dados brutos só sem `exports`, com a pílula "dados brutos". Pendências: `sev 1` = urgente, `sev 2` = atenção; `aPartirDe` opcional (só vale a partir do dia).
2. **O Portal é o único que grava `vacutainer-cadastros.json`.** Edição por operações (`criação`/`edição` com `mudancas {campo:{antes,depois}}`), fila, releitura, reaplicação, backup em `00. Backups/Cadastros/`, `rev`/`revId`. As outras páginas leem a cópia `localStorage['vac.cadastros']` (via `vacCad()`) em modo consulta, com "Editar no Portal" (`vacPortalHref('cadastros/<tipo>/<código>')`).
3. **Vigências gravadas são imutáveis**: só se desativa (vai para `vigenciasDesativadas`) e cria outra. Quem lê usa a vigência da **data do fato** (`vacVig`).
4. **Chave = código** (catálogo de 6 dígitos, `EQ01`, `FME`, `T1`). Códigos sempre guardados como **texto**, nunca convertidos em número. Material SAP **numérico** é normalizado do mesmo jeito em todas as páginas: sem os zeros à esquerda que o SAP põe até 18 dígitos (`normMat` no Portal/CS12, `cod` no importador MB51/COOIS) — é isso que faz a ordem bater com o cadastro; código não numérico fica como veio. Nada se apaga: `ativo:false`.
5. **Kit do cabeçalho igual em todas** (`vac-cabecalho v1/v2` + `kit_v21.js` + catálogo `sistemas.js` + padrão visual `kit_visual.css`): não editar só numa página. Mudou o kit → `aplicar_kit21.py` + build da Produção. Estilo comum (contêiner, cabeçalho, abas, contadores, cores de estado, modo exemplo) vai no `kit_visual.css`; a página só define o que é dela. Chaves comuns do `localStorage` (`vac.theme`, `vac.user`, `vac.logo`…) em texto simples. Pasta conectada sempre por `vacRaiz(pasta)` (as bases da lista `VAC_BASES` em `00. Bases`: as 7 de antes + `iniciativas-base.json` e `equipamentos-base.json`); cada página move só as próprias bases (`vacMoverBases`) ao conectar, com trava entre computadores, cópia por temporário e a base da raiz movida (nunca apagada) para o backup; no IndexedDB vai a pasta original. Erro de leitura nunca é "base ausente" (`vacNaoAchou`): não oferecer criar base por cima. **C1 (08/11/2026), em `kit_bases.js`:**
   - alteração pendente vai para a fila durável `vacFila(pagina)`, um registro por alteração no IndexedDB, cada aba com as dela; nunca "a fila inteira" num valor só;
   - página que guarda a base inteira pendente (Portal, Waste) usa `vacEditarBase` (Web Locks) durante edição/conexão/sincronização e revalida `vacGuardaAba` dentro da trava; o snapshot identifica a aba dona;
   - operações de Iniciativas, Equipamentos e Paradas têm origem local verificada (`vacOrigemPasta`), inclusive confirmadas; pendências sem origem exigem confirmação e nunca migram silenciosamente; reserva por operação em localStorage, sem sobrescrever outra aba;
   - base que já existiu e sumiu não é recriada vazia ("Recriar a base" com a cópia local);
   - base nova só com a confirmação;
   - `vacFormatoBase` antes de gravar;
   - link de origem por `vacLinkSeguro`.
6. **Mudanças cirúrgicas e aditivas**: não reescrever o que funciona; campos novos são opcionais e ignorados por quem não usa (compatível com `schemaVersion 1`). Mudar significado de campo = schemaVersion 2.
7. **ⓘ em todos os campos e categorias** de configuração, com o que é e um exemplo (`AJUDA_CAMPO`, `CAT_AJUDA` no Portal; `HELP` na Produção).
8. **Versão**: subir a versão da página a cada entrega (`PAGE.versao`, `APP_VERSION` ou `V1.xx` no `<title>`) e gravar `appVersion` na base. O Portal › Versões lê isso.
9. Importações do SAP: ficar na tela com "Importar a próxima" depois de gravar. Valores da KKBC importados em **BRL** (a prévia confere a moeda); câmbio vem do Portal (`vacCambio(data,'USD')`).
10. Uma alteração feita durante uma gravação nunca é dada como salva (grava de novo). Alteração pendente (gravação que falhou) só vai para a pasta se a base de lá não mudou; se mudou, baixa `_NAO-GRAVADO` e usa a da pasta. Sem ler a base antes, não grava; sem releitura que confirme a gravação, não dá como gravado.

## Leitores comuns do kit v2.1 (`fontes/kit/kit_v21.js`)

`vacCambio(data, moeda)` · `vacVig(vigencias, data)` · `vacParam(chave)` · `vacTurnosEm(data)` · `vacPrecoEm(material, data)` · `vacMetaArea(codigo, data)` · `vacMetaAreaMes(codigo, 'AAAA-MM')` (meta do mês pela vigência de cada dia; duas vigências no mês = ponderada pelos dias) · `vacHoje()` (dia local; padrão dos leitores sem data) · `vacPortalHref(hash)` · botão ← Voltar (abas entram no histórico; `vacNavAtual()` opcional) · `vacAoVoltar()` chamado ao voltar para a página (reler sem F5) · `vacCsvTexto(v)` (texto seguro para CSV) · `vacNumero(texto, {ponto, sap})` (número estrito por regra de campo: vazio null, inválido NaN) · `vacExportsOk(exports)` (confere a versão antes de usar o exports de outra página) · `vacTemaClaro(on)` (impressão e PDF sempre claros; `beforeprint`/`afterprint`) · `vacAbaInicial(pagina)` (aba inicial do perfil; lista `VAC_INICIAL_ALVO` em `kit_bases.js`) · `vacFicha.abrir('ordem'|'lote'|'lp', código)` (ficha comum, só com o `exports`; a página informa a pasta em `vacPastaAtual()`; botão `vacFichaBotao(ordem)`; link `#ficha=ordem/<n>`; Ctrl K com índice de ordem, lote, LP, catálogo e equipamento) · em `kit_bases.js` (C1): `vacFila(pagina)` (`espelhar`, `minhas`, `importar`, `confirmar`/`confirmadas`/`esquecer`, `marcarPendente`, `outraComPendencia`, `erro`) · `vacFormatoBase(base, schema, versãoMáx)` · `vacLinkSeguro(url)` · `vacGuardaAba(pagina, minhaPendente)` · `vacNovaAcaoHref(d)` / `vacNovaAcaoBotao(d)` (abre Iniciativas com a ação preenchida: origem, fotografia, link de reconsulta, vínculos; nada é gravado na página de origem) · `vacAquiHref(hash)`.

## Centralização no Portal (Portal 1.8/1.8.1)

Tipos no cadastro: `linhas, familias, catalogos, materiais (tipo, tipoSAP), bom (CS12; itens = nível 1, estrutura = níveis 2+), equipamentos (apelidos), componentes, turnos (vigências com pausas {codigo,…,desconta}, intervalos[], regraPedacoFinal), paradas (numero, pilar, classe, ondeAponta, equipamentos = matriz, guia, duracaoManual, relatorio), modosFalha, precos, metasOee, metasArea, metasOsm, cambio, parametros (paradaLongaMin, limiteMicroMin, motivosAbono, motivosSemProducaoProg/NP, acoesPadrao…)`.
Produção aplica o cadastro na base do OEE pelo `CadSync` (`fontes/producao/cad_sync.js`) quando muda a `rev`, e trava as abas de configuração com o aviso "vem do Portal". Detalhes: `docs/centralizacao-configuracoes.md`.

## Documentação (`docs/`)

- Plataforma: `arquitetura-integracao-sistemas.md`, `portal-e-padrao-comum.md`, `plano-evolucao-plataforma.md`, `centralizacao-configuracoes.md`
- Cadastro: `cadastro-base-contrato.md`, `cs12-importacao-bom.md`
- Kit: `kit-cabecalho-e-backups.md` (v1), `kit-cabecalho-v2.md` (v2/v2.1)
- Páginas novas: `paginas-construcao.md` (construção/atualização)
- Páginas: `portal-1-7.md` (Portal 1.7–1.8.12), `producao-ordens-sap.md`, `waste-v1-8.md`, `perdas-ordem-v1.md`, `paradas-arquitetura.md`, `portal-pedido-paradas.md`, `paginas-novas.md`, `osm-arquitetura.md`

Ao terminar uma entrega, atualizar o doc da página (seção nova com a versão e a data) e o `CLAUDE.md` se mudar regra, versão ou comando. Se mudar a instalação, a estrutura da pasta ou as telas de entrar/conectar, editar `fontes/guia/guia_modelo.html` e rodar `node fontes/guia/gerar_guia.js` (nunca editar o `Guia de instalação.html` gerado).

## Auditorias externas

`docs/auditorias/registro-decisoes.md` registra cada apontamento das auditorias (05/11, 06/11, pós-merge, layout e revisão c341f8e de 06/11/2026; relatórios e painéis de 07/11/2026; achados do Codex sobre 065fe6f, § C; plano único de 08/11/2026 e suas etapas, § U em `docs/auditorias/plano-unico-2026-11-08/`), o que foi corrigido, o que foi recusado e por quê. **Antes de uma nova análise, ler o registro**: item recusado lá só volta com fato novo.

## Pendências conhecidas

Lista única do que ficou para depois. O motivo e o gatilho de cada item estão no `docs/auditorias/registro-decisoes.md` (seção indicada). Ao resolver um item, tirar daqui e marcar no registro.

**Funcionalidade e integração**
- Calendário de produção no Portal.
- Telas por perfil (E10c): Resumo/Detalhado, o que fica em "Mais", passagem de turno e alerta de ritmo; espera a lista de jornadas por perfil validada com operador e liderança (registro § U).
- OSM (E7, falta a amostra da planilha), importação por pasta (E9, falta decidir a estação coletora), MES (E12, faltam amostras e regras), conteúdo AM/TPM e 5S (E13, faltam os padrões), Projetos (E15, falta o escopo) e XLSX local (E3b, falta o arquivo): registro § U.
- Gel lendo catálogos e equipamentos do Portal; produção OEE → Gel (registro § 1).
- `eventoId` comum OEE × Paradas, que evita contagem dupla, quando o OEE publicar `paradasEventos` (ver `docs/paradas-arquitetura.md`; registro F07/A10).
- Homologação da C1 na pasta real (etapa H): duas abas, base renomeada, duas estações (registro § V).
- R-02, identificador estável da pessoa (responsável guardado pelo nome): falta decidir o que fazer com nomes digitados à mão (registro § V).
- Última falha do backup diário em Portal › Versões: as páginas não registram a falha na pasta (registro § V, C5).
- Waste ainda cai na base da Produção (`monthPlans`, `server.lotClass/lotNotes`) para ordens fora dos 24 meses do `exports.porOrdem` e lotes fora dos 150 dias do `exports.lotes` (registro § U, E4).

**Layout (auditoria visual; registro § L)**
- Juntar Resumo e indicadores do Waste (hoje há totais repetidos).
- Mesma posição de Ação prioritária, filtros e resumo nas telas equivalentes das páginas.
- Revisar títulos, unidades e legendas dos gráficos internos de cada página. Já feito: cards do Portal e gráfico mensal do Paradas.
- Exemplos visuais dos componentes (cards, pílulas, abas) nos dois temas.

**Homologação e testes**
- Conferência com a pasta real: primeira abertura (aviso do CadSync na Produção), duas estações gravando ao mesmo tempo (os testes de gravação usam pasta simulada), uso sem internet, Chrome/Edge, acentos nos caminhos (registro A09), densidade observada com operador e liderança (registro § L).
- `paginas/lib/xlsx.full.min.js` (SheetJS 0.20.3) ainda não está no repositório (o `trelatorios.js` marca o Excel como NÃO VERIFICADO): o ambiente de desenvolvimento não alcança cdn.sheetjs.com e o npm só tem até 0.18.5. Subir o arquivo que está na pasta da linha. jsPDF e AutoTable já estão em `paginas/lib/`.
- Volta para versão anterior a `00. Bases`: procedimento manual no guia (item 9), validado no `tbases.js` › B06; não automatizado de propósito (registro § R).
- `package.json`/CI (registro § 1).
- `testes/tz.js` falha às vezes e passa ao rodar de novo (instabilidade do teste).
- `testes/tintegra.js` › "ação que vence amanhã" falha quando roda entre 21h e 0h de Brasília (já em outro dia em UTC); problema de fuso do teste, não da página (visto em 07/11/2026).
- `testes/t181.js` expira no fim (passo da matriz; problema do teste).
- Cópia para o Outlook com imagens: conferir no Outlook da empresa (desktop e web) se os gráficos chegam (registro § P).

**Manutenção e escala (registro § C)**
- Waste: comentários e ações varridos por ordem (índice por ordem quando o Painel passar de 300 ms ou de 2 mil comentários).
- Funções grandes (`computeDayRaw`, `CadSync.aplicar`, `openConfig` do Gel, `parseMetaFY27`, `cadValidarItem`): começar a próxima mudança por um teste que fixe o comportamento; leitura da Meta FY27 duplicada (Produção e Portal).
- Backup diário automático do Portal ignora falha (aviso no status depende de decisão).
- URLs de download sem revogação no Paradas, Produção e Portal (revisar caso a caso).

**Relatórios (registro § P)**
- Três geradores de PDF (Portal/Waste, Produção, Gel): unificar no kit se for preciso.

## Estabilização NV-01–NV-05 (08/11/2026)

Implementação e limites: `docs/estabilizacao-nv-01-05.md`. Teste novo `testes/tnv.js`, incluído em `testes/tudo.js`. Nenhum schema de negócio, código ou vigência foi alterado. Identidade de pasta e reservas são locais ao navegador; a homologação com pasta real e duas estações continua pendente.

# Kit · cabeçalho comum v2 (`vac-cabecalho v2`)

05/11/2026 · feito e aplicado em **Portal 1.7.1, Produção (OEE) 2.0.1, Waste 1.8.1, Gestão de Gel V1.92 e Paradas 1.0.2**. Substitui o v1 de `claude/kit-cabecalho-e-backups.md` (backups por módulo continuam iguais). O quadro de Versões do Portal passa a esperar v2.

## O que o v2 acrescenta (igual em todas as páginas)

- **Barra**: nomes novos mesmo com `vac.sistemas` antigo (OEE → Produção, Perdas → Waste, Gel → Gestão de Gel; `vacNomeSis`); páginas com `grupo:'outros'` e os ids antigos `maquinas`/`manut` vão para **Outros ▾**, junto com os links de `localStorage['vac.links']` (editados no Portal › Administração › Configuração do Portal); a barra **esconde as páginas sem "ver"** no perfil de quem entrou (a página atual sempre aparece).
- **⚙** ao lado do tema: nas páginas é um link para `Portal.html#admin`; no Portal abre a Administração. O link "Cadastros" saiu da barra.
- **Título da página** = nome exibido na barra (ex.: o OEE mostra PRODUÇÃO). TV e relatórios de cada página mudam na fase de cada uma.
- **Entrar pelo ID** (`VacEntrar`): lê os usuários da cópia do cadastro (`localStorage['vac.cadastros']`, que o Portal grava); grava `vac.user`, `vac.userId`, `vac.perfil`; mostra "nome · perfil" no topo. ID desconhecido → "Fazer o 1º acesso no Portal" (`Portal.html#entrar`) ou usar só um nome neste navegador. "Sair" esquece no navegador. No Portal, usa o Entrar completo (com autocadastro).
- Gancho opcional `vacAoTrocarUsuario(nome)`: o OEE grava em `Store.S.user` e IDB; o Gel em `fifo.resp`. Evento `vac:usuario` no `window`.
- **Funções para as páginas usarem** nas próximas fases: `vacCad()`, `vacUsuario()`, `vacPerfil()`, `vacPode(modulo, funcao='ver')` (ver, lancar, fechar, importar, exportar, excluir, configurar; sem perfil = pode) e `vacSemaforo(valor, meta, {inverso})` → `'ok'|'warn'|'crit'|'none'` com os limites do cadastro (`parametros.semaforoVerdePct/AmareloPct`, padrão 100/90).
- Como foi aplicado: a função v1 `renderSysNav` foi renomeada para `renderSysNav_v1` (sem uso) e o bloco v2 entra antes do fim do bloco JS do kit; o CSS v2 (menu Outros, ⚙ como link, janela Entrar) antes do fim do bloco CSS; HTML: `<span id="sysOutros">` depois da barra e o ⚙ antes do tema; o `#stUser` de cada página passa a ser desenhado por `vacUserRender()`.

## Ainda não está no v2 (fica para a fase de cada página)

- Permissões além de "ver" (lançar, fechar, importar…) dentro das páginas.
- Busca global entre páginas (depende do `exports.indice`, plano § 3.4).
- Modo demonstração padronizado (hoje cada página tem o seu, todas com saída).
- Ler o cadastro em modo travado (OEE, Gel, Waste).

## Waste 1.8.1 (junto com o kit)

- **Busca livre na tabela** (ao lado de Ordens · Componentes · Prioridades · Excluídas): filtra só a tabela, em todos os campos da linha (para ordens, também componentes, causa, comentários e ações); não muda os totais do painel.
- Pílula de competência **Atual** (mês corrente; avisa quando ainda não há dados e sugere "Última").

## Kit v2.1 (05/11/2026) · Voltar e atualização ao voltar

Bloco `vac-cabecalho v2.1` (arquivo-fonte `kit/kit_v21.js`, igual em Portal 1.7.6, Produção 2.2.2, Waste 1.8.2, Gestão de Gel 1.93, Paradas 1.0.3):
- **← Voltar** ao lado do título (aparece quando há para onde voltar): `history.back()`. Clicar numa aba (`#nav [data-route|data-t|data-tab]`, `[role=tab][data-tab]`) cria uma entrada no histórico do navegador; voltar clica de novo na aba anterior. Também funciona o voltar do navegador/mouse e Alt+←. Entre páginas, o voltar é o do navegador (a navegação é na mesma aba).
- Página com aba "virtual" define `vacNavAtual()` → `{attr,val,sub}` (Produção: rota + sub-aba de Ordens).
- `history.replaceState(null…)` da página não apaga a posição gravada (o kit preserva `vacNav`).
- **Ao voltar para a página** (visibilitychange, focus, pageshow restaurada) chama `vacAoVoltar()` se a página definir. Produção: relê `perdas-base.json` (KKBC) e `ordens-base.json` sem F5 e redesenha se mudou (não redesenha com modal aberto, campo em foco ou texto colado). Portal: relê as bases das páginas (readModules) e o cadastro. Waste, Gel e Paradas já reliam a própria base ao voltar.

## Catálogo de sistemas único (06/11/2026)

`fontes/kit/sistemas.js` = `const DEFAULT_SYSTEMS=[…]` (ids, nomes, HTML, base, `futuro`). `aplicar_kit21.py` troca o bloco nas 4 páginas e o `build.py` na Produção (param com `ERRO` se não acharem exatamente 1 vez). O Portal continua podendo sobrescrever pelo `localStorage['vac.sistemas']`. Versões: Portal 1.8.3, Produção 2.4.2, Waste 1.8.7, Gestão de Gel 1.96, Paradas 1.0.6.

Gestão de Gel 1.97 (06/11/2026): na gravação, depois de 3 colisões seguidas as alterações continuam na fila (nova tentativa a cada 30 s) em vez de serem dadas como gravadas.

Gestão de Gel 1.98 (06/11/2026): gravação sem releitura válida (arquivo ilegível ou sem `rev` no início) não é confirmada; a fila fica.

## vac-visual v1 (06/11/2026) · padrão visual comum

Resposta à auditoria de layout (`docs/auditorias/layout-2026-11-06/`). Decisões em `docs/auditorias/registro-decisoes.md` § L.

- **Arquivo-fonte:** `fontes/kit/kit_visual.css`. O `aplicar_kit21.py` grava em Portal, Waste, Gel e Paradas, e o `build.py` grava na Produção, como `<style id="vac-visual">`, o **último** estilo da página: no fim do `<head>` ou, no Gel, que não tem `</head>`, logo antes do `vac-cabecalho`. Rodar de novo substitui o bloco, sem duplicar.
- **O que padroniza:**
  - corpo sem margem e contêiner de 1560 px com 16 px nas laterais;
  - cabeçalho da página com 52 px em uma linha, botões de 30 px e 13 px, e ordem: ação principal do módulo, depois Sincronizar, Backup, TV e Mais;
  - abas de 15 px com marca ativa de 3 px, sempre em uma linha. Quando não cabem, a faixa rola, com sombra e seta ‹ › na borda. A Produção, com grupos e menus, não rola;
  - contadores das abas (`--cnt-bg`/`--cnt-ink`) e texto sobre preenchimento (`--on-fill`), com contraste ≥ 4,5:1 nos dois temas;
  - cores de estado iguais em todas as páginas: `--ok`, `--warn`, `--crit`, `--info` e `--none`, um pouco mais escuras no claro;
  - "Modo de exemplo" em roxo (`.vex`, `--ex-*`);
  - menu de ações secundárias (`details.vmais` + `.vmais-l`).
- **JS no `kit_v21.js`:**
  - setas e sombras de rolagem das abas, com a aba ativa sempre visível (`vacAbasRolagem`);
  - menu Mais sempre dentro da tela.
- **Não muda:** cálculo, meta, limiar, `sev` nem contrato de dados. As cores de domínio (classes de parada, turnos, barris, catálogos) continuam nas páginas.
- **Verificação:** `node testes/tvisual.js`, com 112 checagens. Cobre as cinco páginas × 2 temas × 1920/1440/1024/768/390 px: geometria, abas, contraste, campos de data, tema na navegação, gráficos do Portal e menu Mais. Os prints ficam em `testes/saida/visual/`.

Gestão de Gel 1.99: cabeçalho com Importar relatório, Sincronizar, Backup e TV; Enviar relatório, Fichas e relatórios, Configuração e Guia passam para o menu **Mais**, com os mesmos botões e ids. Pílulas suaves por padrão; ficam cheias só no cabeçalho do barril e nas pílulas de cor do catálogo. "Dados de exemplo" e o aviso do exemplo em roxo. Indicador principal em 28 px. Título "Período selecionado · datas" no Painel.

## vac-bases v1 (06/11/2026) · bases na subpasta 00. Bases

- **Arquivo-fonte:** `fontes/kit/kit_bases.js`, num `<script id="vac-bases">` logo depois do `vac-visual`, antes do código da página. É distribuído pelo `aplicar_kit21.py` e pelo `build.py`.
- **`vacRaiz(pasta)`:** devolve a pasta principal "com bases", que é o que a página guarda como pasta conectada.
  - As 7 bases (`VAC_BASES`) são gravadas em `00. Bases`. Na leitura, procura em `00. Bases` e, se a base ainda não foi movida, na raiz.
  - Logo, backups, `lib`, relatórios e anexos continuam na raiz, como antes.
  - No IndexedDB vai sempre a pasta original; o `vacRaiz` só envolve, nunca é gravado.
- **`vacMoverBases(pasta, [[nome, pastaBackup], …])`:** cada página move **só as próprias bases** ao conectar.
  - Portal: portal-base e vacutainer-cadastros. Produção: oee-vacutainer-base e ordens-base. Waste: perdas-base. Gel: fifo-base. Paradas: paradas-base.
  - Passos: copia, confere a cópia, guarda uma cópia em `00. Backups/<módulo>/<base>_antes-de-mover-para-00-Bases_<data>_<hora>.json` e apaga da raiz.
  - Se a mesma base existir nos dois lugares: com conteúdo igual, tira a da raiz. Se a da raiz for mais velha, guarda em backup (`raiz-antiga`) e tira. Se a da raiz for **mais nova** (página antiga ainda aberta gravando lá), não apaga nada: avisa (`vacAvisoBases`), e o Portal › Versões das páginas mostra as duas cópias.
- **Portal › Versões das páginas:** procura as bases também em `00. Bases`, que é o lugar certo, e avisa "base ainda na raiz" até a página dona ser aberta.
- **Teste:** `node testes/tbases.js`. Usa o sistema de arquivos do próprio navegador (OPFS), com as mesmas operações da pasta da rede, e cobre: mover, ler antes e depois, gravar sem recriar na raiz, cópia mais nova e cópia mais velha na raiz.

Gestão de Gel 2.00 (06/11/2026): a pasta da base passa por `vacRaiz`, e `fifo-base.json` vai para `00. Bases` ao usar a pasta (cópia em `00. Backups/Gel`). A ajuda cita a subpasta do relatório SAP como `01. Relatórios MES-SAP`, nome usado na pasta da linha; o nome real é o da configuração (Pasta da rede).

## Guia de instalação (06/11/2026)

- **`Guia de instalação.html`:** fica na raiz do repositório, e por isso na raiz do ZIP. Tem um passo a passo para baixar e extrair o ZIP, fazer a primeira instalação na rede, atualizar, acompanhar a mudança das bases para `00. Bases`, liberar o sistema no computador de outra pessoa (mapear unidade, atalho, entrar, conectar cada página), conferir em Versões das páginas, voltar de versão e resolver problemas comuns.
- **Imagens:** prints reais das páginas, com moldura vermelha numerada onde clicar ou preencher, mais ilustrações (marcadas como tal) das telas do Windows, do navegador e do GitHub. As imagens vão embutidas, então o arquivo é único.
- **Como gerar:** `node fontes/guia/gerar_guia.js`, a partir de `fontes/guia/guia_modelo.html`; os marcadores `{{IMG:nome}}` e `{{VERSOES}}` são preenchidos pelo gerador. O gerador abre as páginas por HTTP local. O print de Versões usa uma pasta de teste no armazenamento do navegador, que recusa "ã" no nome, então ali o Gel aparece com o nome alternativo `Gestao-Gel-Vacutainer.html`.
- **Quando gerar de novo:** quando mudar a instalação, a estrutura da pasta, as telas de entrar/conectar ou as versões. O `Guia de instalação.html` nunca deve ser editado à mão.

## vac-bases v2 (06/11/2026) · migração segura (revisão c341f8e)

- **Trava entre computadores:** arquivo `00. Bases/.<base>.migrando` (`{id, em}`). Quem chega com a trava de outra sessão ativa (menos de 2 min) espera (`aguardando`). A trava só é pega quando a base ainda está na raiz: depois da mudança, conectar não grava arquivo de trava, não espera e não dá aviso de `aguardando` (`tbases.js` › conexão normal).
- **Leitura:** só `NotFoundError`/`TypeMismatchError` é ausência (`vacNaoAchou`). Qualquer outro erro é "estado desconhecido" e não muda nada.
- **Cópia:** por temporário `.<base>.copiando-<sessão>`, conferido. Antes de entrar no lugar, confere de novo o destino. Depois de entrar, confere outra vez; se divergir, não apaga nada.
- **Saída da raiz:** confere se a raiz mudou desde a leitura e então **move** (`FileSystemHandle.move`) a base para `00. Backups/<módulo>/<base>_<tipo>_<data>_<hora>.json`. Sem `move()`, grava o backup e apaga.
- **`vacRaiz`:** não troca `00. Bases` pela raiz quando a pasta dá erro, e não prefere um arquivo vazio em `00. Bases`.
- **`vac-prefs`:** normaliza `vac.theme`/`vac.user`/`vac.userId`/`vac.perfil`/`vac.logo` gravados com aspas.
- **`opts.ganchos`:** existe só para os testes simularem falhas no meio da migração.

vac-visual v1.1 (mesma data):
- marca da aba ativa devolvida (`.on`/`aria-selected`);
- contadores do submenu (`.nmenu .cnt`) com `--cnt-*`;
- pílula de estado `.rule` visível no cabeçalho em telas pequenas;
- no redimensionamento, a aba ativa continua à vista.

Gestão de Gel 2.01 (06/11/2026): um erro ao ler a base, ao escolher a pasta, não abre "Criar a base na pasta". Aba ativa com a marca de volta e à vista ao redimensionar.

## Relatórios e página inicial (07/11/2026)

- **`vac-inicial`** (`kit_bases.js`, no topo de cada página, porque o Portal monta a lista de opções na carga):
  - `VAC_INICIAL_ALVO` dá, para cada opção de "Página inicial", o par página + hash (`aba=<id>` ou `turno`);
  - `vacPaginaInicial()` lê a do usuário ou a do perfil na cópia `vac.cadastros`;
  - `vacAbaInicial(pagina)` devolve o hash só na 1ª abertura da página na sessão e sem `#` no endereço.

  Ordem ao abrir: link direto > perfil > preferência da pessoa > padrão.
- **`vacTemaClaro(on)`** (`kit_v21.js`): põe e devolve o tema claro. É chamado no `beforeprint`/`afterprint`, então Ctrl+P e `window.print()` saem sempre claros nas cinco páginas. O Gel não desfaz enquanto `data-vac-claro` estiver marcado.

Gestão de Gel 2.02 (07/11/2026):
- relatório montado com todas as linhas no PDF (antes 40), comentário (rascunho neste navegador), aviso de corte no texto e tema claro garantido na montagem;
- "40 primeiros de N" no risco de vencimento;
- Painel em 1º na ordem padrão das abas;
- `#aba=<id>` e aba inicial do perfil, que vale sobre a página inicial pessoal só na 1ª abertura da sessão.

## Kit v2.1 · situação da página (07/11/2026)

`vacEstadoDe(id)` → `{estado:'construcao'|'atualizacao', rot, cls, nota}` ou `null` (estável). Ordem: `vac.sistemas[].estado` (Portal › Módulos) > `PAGE.estado` > `DEFAULT_SYSTEMS[].estado` (`fontes/kit/sistemas.js`). `vacEstadoRender()` desenha o ponto na barra (e o texto no menu Outros), a pílula `#vacEstPill` ao lado da versão, a faixa `#vacEstFaixa` abaixo das abas e o selo no Ctrl K; roda sozinho no carregamento, quando a barra é redesenhada e quando `vac.sistemas` muda em outra aba. Página declara `PAGE.estado` e `PAGE.estadoNota`. Especificação: `paginas-construcao.md`.

## Revisão `065fe6f` (07/11/2026)

- **`vacCsvTexto(v)`** (`kit_v21.js`): texto que começa com `= + - @`, tabulação ou retorno ganha o prefixo `'` no CSV. Não mexe em número escrito como texto (`-1.234`, `-12,5`, `-3%`) nem em códigos. Usado por Waste, Gel e Produção; cada página mantém o próprio formato de número e aspas.
- **Scripts:**
  - `aplicar_kit21.py` monta e confere todas as páginas antes de gravar;
  - `gerar_paginas.py` devolve as páginas geradas se o kit falhar;
  - os três gravam com `\n`.
- **Gestão de Gel 2.04:**
  - a restauração por arquivo confirma antes e não segue sem a cópia anterior sem decisão explícita;
  - CSV pela regra comum;
  - o Painel usa um índice das baixas por dia durante o `dbCtx`, com os mesmos números e cerca de 20 vezes mais rápido com 7 mil movimentações.

## E2 do plano único (08/11/2026)

- **`vacHoje()`:** dia local do computador. É o padrão de `vacVig`/`vacCambio` quando não recebem data (antes, o dia em UTC; às 22h de Brasília já era amanhã).
- **`vacMetaAreaMes(codigo, 'AAAA-MM')`:** meta da área no mês pela vigência de cada dia; duas vigências no mesmo mês = média ponderada pelos dias cobertos. Volta `{valor, ponderada, partes:[{de, valor, dias}], diasCobertos, diasMes}`.

Gestão de Gel 2.05 (08/11/2026): o rótulo de versão do cabeçalho vem de `APP_VERSION` (estava fixo em v2.01); título sem número.

## E3 e E4 do plano único (08/11/2026)

- **`vacNumero(texto, {ponto = 'decimal' | 'milhar', sap})`:** número estrito ("12a" é NaN; vazio é null).
  - vírgula sozinha = decimal;
  - com vírgula e ponto, o último é o decimal;
  - ponto sozinho segue a regra do campo;
  - sinal no fim só com `sap:true`.
- **`vacExportsOk(exports, conhecida = 1)`:** quem lê o `exports` de outra página confere a versão. Sem número ou até a conhecida: usa. Mais nova: não usa e devolve o motivo.

Gestão de Gel 2.06 (08/11/2026):
- campos numéricos digitados validados: marcação em vermelho, prévia "valor inválido" e ações do cartão bloqueadas;
- `exports.ordensCobertura`.

## E5 do plano único (08/11/2026) · ficha comum e busca por índice

- **`vacFicha.abrir(tipo, código)`** (`'ordem'`, `'lote'` ou `'lp'`) abre o painel lateral comum; `vacFicha.fechar()`, `vacFicha.carregar(forçar)` (relê as bases que mudaram), `vacFicha.buscar(q)` (itens do índice) e `vacFicha.indice()`.
- **Abre também por:** clique em elemento com `data-vac-ordem`, `data-vac-lote` ou `data-vac-lp`; `vacFichaBotao(ordem)` (botão "Ficha" pronto); o link `<página>#ficha=ordem/<n>`; Enter num resultado da busca (Ctrl K).
- **A página informa** a pasta conectada em `vacPastaAtual()` (pasta ou `null`). Sem isso, a ficha usa só a cópia deste computador.
- **Fontes:** `exports` de Produção (`porOrdem`, `porOrdemCobertura`, `lotes`), Produção › Ordens (`porOrdem`), Waste (`porOrdem`), Gel (`ordens`, `ordensCobertura`), Paradas (`porOrdem`, `eventos` com ordem) e Iniciativas (`acoes`). Versão conferida com `vacExportsOk`. Cópia de cada base no IndexedDB `vac-ficha`, com a hora da leitura.
- **Busca:** a ficha estende o `Busca` do cabeçalho (sem editar o bloco v2 de cada página): ordem, lote, LP, catálogo e equipamento entram antes das abas e páginas. Comparação de códigos sem zeros à esquerda (só para comparar).
- CSS em `kit_visual.css` (`.vficha*`). Teste: `node testes/tficha.js`.

## E6 e E8 do plano único (08/11/2026)

- **`VAC_BASES`** (kit vac-bases) passou a ter 9 bases: + `iniciativas-base.json` e `equipamentos-base.json`. Página nova que grava base precisa entrar nessa lista, senão `vacRaiz` grava na raiz da pasta.
- **`vacNovaAcaoHref(d)` / `vacNovaAcaoBotao(d, rótulo, classe)`:** link para Iniciativas com a ação preenchida (`#nova=<JSON>`). `d = {titulo, descricao, origem:{tipo, ref, resumo, link, foto}, vinculos:[{tipo, cod}]}`. A página de origem não grava nada. Iniciativas mostra as ações abertas parecidas e só cria depois da confirmação. Mande referências, não listas.
- **`vacAquiHref(hash)`:** endereço desta página com uma rota (link de reconsulta).
- A ficha da ordem ganhou "+ Abrir ação" (origem `ficha`, vínculo da ordem) e o bloco "Ações ligadas", que lê `iniciativas-base.json`.

## C1 (08/11/2026) · alterações pendentes, base que some, formato e links (`kit_bases.js`)

Ficam no `<head>` de todas as páginas, antes do código delas: o Paradas chama a fila antes do kit v2.1 carregar.

**`vacFila(pagina)`:** fila durável no IndexedDB `vac-fila`, um registro por alteração (`pagina|qid`), com a aba dona. A aba fica viva em `localStorage['vac.aba.<pagina>.<id>'] = {t, pend}`, renovado a cada 5 s e considerado morto após 20 s.

| Função | O que faz |
|---|---|
| `espelhar(lista)` | grava as da lista e apaga as desta aba que saíram dela |
| `minhas()` | as desta aba mais as órfãs de abas fechadas, adotadas com conferência depois de 400 ms; `null` se o IndexedDB falhar |
| `importar(ops, renomear)` | fila antiga, uma vez |
| `confirmar` / `confirmadas(idade)` / `esquecer` | operações confirmadas, para a regravação em 24 h |
| `marcarPendente(bool)` / `outraComPendencia()` | trava da 2ª aba |
| `erro` | texto do problema; a página avisa "alterações não protegidas" |

Cada aba só grava e apaga as próprias alterações, porque reaplicar operações do cadastro e do Gel duas vezes não é seguro.

**Outras funções:**
- **`vacFormatoBase(base, schema, versaoMax)`:** `''` = pode gravar; senão, o motivo (schema de outra página, versão futura ou inválida). Base sem `schema` é aceita como versão 1.
- **`vacLinkSeguro(url)`:** `http(s):`, `file:`, `\\servidor\…`, `Nome.html#…` e `#…`; qualquer outro vira `''`.
- **`vacGuardaAba(pagina, minhaPendente)`:** lança `VacAbaBloqueada` (sem erro no console) e avisa, se outra aba viva da página tem pendência. Usado pelo Portal (`Store.commit`) e pelo Waste (`commit`).


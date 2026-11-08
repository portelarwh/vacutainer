# Auditorias externas · registro de decisões

Este arquivo responde às auditorias externas da plataforma e registra, para cada apontamento, **o que foi feito, o que não foi feito e por quê**.

**Para quem for fazer a próxima análise:**
- Um item **recusado** aqui só volta com fato novo: código diferente, dado real ou decisão nova do responsável.
- Um item **corrigido** traz o teste que o reproduz. Se o teste passa, o problema não existe mais naquele ponto.
- Um item **adiado** tem o motivo e o gatilho que o traz de volta.

| Auditoria | Data | Commit analisado | Resposta |
|---|---|---|---|
| Auditoria de integração (A01–A10) | 05/11/2026 | anterior a `ca46d0c` | Portal 1.8.3 e 1.8.4 (PRs portelarwh/vacutainer#1 e #2) |
| Diagnóstico técnico (F01–F08, § 5) | 06/11/2026 | `9cc1dc4` | Portal 1.8.5, Produção 2.4.3, Waste 1.8.9, Gel 1.97, Paradas 1.0.7 (PR portelarwh/vacutainer#4) |
| Diagnóstico pós-merge (M01–M04, ressalvas) | 06/11/2026 | `c2ca6af` | Portal 1.8.6, Produção 2.4.4, Waste 1.8.10, Gel 1.98 (§ 0, PR portelarwh/vacutainer#5) |
| Revisão do PR #5 (base que some) | 06/11/2026 | `142b9c2` | Portal 1.8.7 (§ 0.1) |
| Auditoria visual (V01–V08) | 06/11/2026 | `142b9c2` (registrada em `ce1d971`) | Portal 1.8.8, Produção 2.4.5, Waste 1.8.11, Gel 1.99, Paradas 1.0.8 (§ L) |
| Revisão da migração, do layout e do guia (B01–B07 e visuais) | 06/11/2026 | `c341f8e` | Portal 1.8.10, Produção 2.4.7, Waste 1.8.13, Gel 2.01, Paradas 1.0.10 (§ R) |
| Relatórios, saídas e aba Painel | 07/11/2026 | `c341f8e` | Portal 1.8.11, Produção 2.4.8, Waste 1.8.14, Gel 2.02, Paradas 1.0.11 (§ P) |
| Achados do Codex (segurança, dados, TV, scripts, desempenho) com revisão independente | 07/11/2026 | `065fe6f` | Portal 1.8.13, Produção 2.4.10, Waste 1.8.16, Gel 2.04, Paradas 1.0.13, páginas em construção 0.1.1 (§ C) |

Status usados: **corrigido** · **corrigido em parte** · **recusado** · **adiado** · **já existia**.

---

## C. Achados do Codex sobre `065fe6f`, com revisão independente (07/11/2026)

O Codex analisou `065fe6f`. Antes de implementar, uma revisão independente conferiu cada achado no código, reproduziu os de comportamento e mediu os de escala. O responsável aprovou o diagnóstico e o plano.

O teste novo **`testes/tseguranca.js`** cobre todos os itens. Rodado sobre `065fe6f`, dá **24 falhas**; depois das correções, nenhuma.

| # | Achado | Status | O que foi feito |
|---|---|---|---|
| 1 | Waste: identificador importado executava código no clique | **corrigido** (Waste 1.8.16) | **Reproduzido:** componente `MAT');…` e ordem `OS'+(…)+'` executaram código em "Copiar link". **Causa:** `esc()` entre aspas simples dentro de `onclick` (o navegador desfaz o `&#39;` antes de rodar). **Correção:** `jsArg(v)=esc(JSON.stringify(…))` nos 21 pontos (12 com identificadores e 9 com ids internos). O dado continua como veio (regra 4). Um código com apóstrofo legítimo (`D'AGUA`) agora funciona; antes quebrava o botão. Só o Waste tinha o padrão |
| 2 | Portal: restaurava sem a cópia anterior | **corrigido** (Portal 1.8.13), **e no Gel** (2.04) | Se a cópia `_antes-restaurar_` falhar, a página avisa o motivo e só continua com "Restaurar mesmo assim?" (o padrão é não), como o Waste já fazia. O Gel por arquivo também ignorava a falha e nem confirmava antes de restaurar: agora confirma. O cadastro do Portal, o Paradas e a Produção já paravam na falha |
| 3 | CSV com fórmulas (Waste, Gel) | **corrigido**; vale nas três páginas que exportam CSV | Regra comum no kit, `vacCsvTexto`: texto que começa com `= + - @`, tabulação ou retorno ganha o prefixo `'`, mas número escrito como texto (`-1.234`, `-12,5`, `-3%`) e códigos (`0123`, `EQ01`) ficam iguais. A Produção (2.4.10), que já protegia, passou à mesma regra: antes ela também prefixava número escrito como texto que começa com `-`. O `.xlsx` do Waste já era seguro |
| 4 | Produção: gráficos paravam depois de sair da TV | **corrigido** (Produção 2.4.10) | **Reproduzido:** a dica sumia depois da TV. **Causa:** a TV limpava o registro de todos os gráficos (`Charts.reset`). **Correção:** `TV.close()` redesenha a tela, mantendo a rolagem (regra `R` no `build.py`). Testado na Visão geral e no Painel (TV pela visão) |
| 5 | Scripts deixavam páginas pela metade | **corrigido** | `aplicar_kit21.py` monta e confere tudo antes de gravar. `gerar_paginas.py` devolve as páginas se o kit falhar. Os 3 scripts gravam com `\n` (no Windows o padrão gravaria CRLF). Rodar de novo dá os mesmos arquivos, byte a byte |
| 6 | Waste: varreduras de comentários e ações por ordem | **adiado** | Medido: +~50 ms com 10 mil comentários; nos volumes reais o efeito é pequeno. **Gatilho:** Painel do Waste acima de 300 ms, ou mais de 2 mil comentários na base. A solução já está desenhada: índices por ordem montados uma vez por tela, mantendo a precedência do `causeOf` |
| 7 | Gel: varredura por dia no Painel | **corrigido** (Gel 2.04) | Índice das baixas por dia, válido só durante o `dbCtx`, que não altera movimentações; fora dele, tudo lê `S.events` como antes. Com 7.200 movimentações e 12 meses: 6 ms, contra 144 ms antes. Números e indicadores idênticos com e sem índice (período, comparação e todos os KPIs) |
| 8 | Complexidade concentrada | **adiado** (manutenção) | `computeDayRaw` (204 linhas), `CadSync.aplicar` (101), `openConfig` do Gel (236 linhas, 44 KB), `parseMetaFY27` (~114) e `cadValidarItem`. Não são defeitos, e não houve refatoração. O risco mais concreto é a leitura da Meta FY27 duplicada (Produção `parseMetaFY27` e Portal `mof*`). **Gatilho:** a próxima mudança numa dessas funções começa por um teste que fixe o comportamento atual |
| 9 | Waste: URLs de download sem revogação | **corrigido** (Waste 1.8.16) | `downloadJSON`, `exportCsv` e o download de backup usam o `downloadBlob`, que libera a URL. Paradas, Produção e Portal têm contagens parecidas e ficam para a próxima revisão dessas páginas |
| 10 | `toast` declarado duas vezes no modelo | **corrigido** (páginas em construção 0.1.1) | Linha duplicada (idêntica, sem efeito) tirada do modelo; páginas geradas de novo |

**Não corrigido de propósito:** o backup diário automático do Portal (`writeRemote`) continua ignorando a falha. Não é o mesmo defeito, e o tratamento (aviso no status) depende de decisão do responsável.

---

## P. Relatórios, saídas e aba Painel (auditoria de `c341f8e`, 07/11/2026)

**Limite:** o relatório `auditoria-relatorios-paineis-c341f8e.md` e o zip de evidências **não chegaram** nesta sessão. Os seis achados citados no pedido foram reproduzidos nos arquivos gerados, não só no código: PDF conferido com `pdfinfo`/`pdftotext`, impressão em mídia print A4, texto e HTML copiados. Antes de implementar, o diagnóstico e o plano foram entregues e aprovados pelo responsável.

**Decisões do responsável (07/11/2026):**
- Visão geral em 1º e Painel em 2º. Na Produção, os dois viram os primeiros grupos do menu. Portal e Paradas mantêm "Visão geral" em 1º, sem renomear. No Gel, o Painel passa a ser a 1ª aba na ordem padrão. O Waste já estava certo.
- A aba que abre é definida pelo **perfil** do usuário.
- O relatório montado do Gel ganha campo de comentário.
- A cópia para o Outlook do Portal e do Waste fica igual à da Produção, com os gráficos como imagem.

### Achados

| Item | Status | O que mudou · teste (`testes/trelatorios.js`) |
|---|---|---|
| Comentário cortado no PDF (Portal, Waste, Produção) | **corrigido** | O comentário e o bloco de texto continuam na página seguinte. Antes, um comentário de 70 linhas parava na linha 44 (Portal/Waste) ou 40 (Produção) |
| Gel: PDF montado com 40 linhas, sem aviso | **corrigido** | Todas as linhas (64 no teste), e o `pdfTable` quebra a página. O texto do bloco sem tabela também sai inteiro (antes, 180 caracteres) |
| Cores escuras nas exportações | **corrigido** | Portal e Waste: o gráfico do PDF usa sempre as cores do tema claro (imagem igual nos dois temas). Impressão: o kit põe o tema claro no `beforeprint` e devolve no `afterprint` (`vacTemaClaro`), nas cinco páginas. Gel: o vigia de tema não desfaz mais o tema claro do PDF |
| Paradas: impressão da análise vazia | **corrigido** | A regra do formulário só vale enquanto imprime formulários (classe `imprimindo-forms`, página nomeada em retrato). Ctrl+P no Pareto: 930 caracteres (antes 0) |
| Encaixe em retrato / orientação diferente do PDF | **corrigido** | A impressão do relatório (Portal, Waste, Produção) sai em A4 paisagem, como o PDF. A tabela larga quebra o texto nas células: 14 colunas cabem |
| Diferenças na cópia para o Outlook | **corrigido** | Portal e Waste copiam os gráficos como imagem, como a Produção, com a opção "gráficos como imagem no Outlook" (desmarcada, o lugar diz "gráfico no PDF"). O aviso informa o tamanho |
| Copiar texto cortava a tabela em 15 linhas sem aviso (Portal, Waste; Gel em 5) | **corrigido** | O corte continua, por ser resumo de WhatsApp, mas agora vem com "… e mais N linha(s): veja o PDF ou o Excel" |
| Impressão do relatório da Produção com cabeçalho e faixa de exemplo | **corrigido** | Só o relatório é impresso |
| Rótulo do cartão cortado no PDF ("ATENDIMENTO AO PLANO") | **corrigido** | O rótulo sai em até 2 linhas na Produção; rótulo e detalhe também no Portal e no Waste |
| Recortes sem aviso | **corrigido** | Waste: "20 maiores de N (todos no Excel)" no Pareto mensal. Gel: "Mostrando os 40 primeiros de N barris" no risco de vencimento |
| Aba Painel em 1º, Visão geral ao lado | **corrigido** (conforme a decisão) | Produção: grupos "Visão geral" e "Painel" no início do menu. Gel: `TABS` com Painel em 1º; quem já ordenou as abas mantém a sua ordem |
| Aba inicial por perfil | **novo** | O campo "Página inicial" de Perfis e Usuários no Portal passa a oferecer página e aba (ex.: "Produção › Painel"). Lista comum no kit (`VAC_INICIAL_ALVO` em `kit_bases.js`) |

**Ordem ao abrir uma página:**
1. link direto (`#aba=…`, `#dia=`, `#turno`, `#tv`…);
2. aba do perfil, só na 1ª abertura da página na sessão;
3. preferência da pessoa (última rota da Produção, página inicial do Gel);
4. padrão da página.

Sem perfil cadastrado, nada muda. O Gel continua abrindo na Operação, salvo se o perfil ou a pessoa escolherem outra aba.

### Limitações (não corrigidas, registradas)
- **Paradas sem relatório próprio:** não tem PDF, Excel nem cópia da análise; só Ctrl+P na aba. Entra se a liderança pedir.
- **Relatório do Waste por período:** usa o mês escolhido em Relatórios, não os filtros do Painel. É de propósito: o selo mostra os critérios.
- **Imagens no Outlook:** cada gráfico vira um PNG `data:` (cerca de 40 KB). O Outlook desktop aceita; o Outlook web e algumas políticas de e-mail removem as imagens. Validar com o Outlook da empresa (homologação). Desmarcar a opção deixa o aviso no lugar.
- **"Salvar como PDF" do navegador × PDF próprio:** nunca saem idênticos (margens e "Gráficos de fundo" são da janela de impressão). Agora têm a mesma orientação e o mesmo tema.
- **Três geradores de PDF** (`Report` do Portal/Waste, `rpPdf` da Produção, funções do Gel): unificar no kit fica para depois, se estas correções não bastarem.
- **Formulário de papel da LINHA no Paradas:** ocupa 2 páginas A4 com os dados de teste, igual em `c341f8e`. Não mudou com esta entrega.

---

## R. Revisão `c341f8e`: migração para 00. Bases, fechamento do layout e guia

**Limite desta resposta:** o relatório `revisao-vacutainer-c341f8e.md` e o zip de evidências **não chegaram** nesta sessão. Cada item foi reproduzido a partir da descrição recebida, com testes próprios. Todos os cenários novos **falham no código de `c341f8e` e passam agora**, menos o B06, que é um procedimento e passa nos dois.

### Prioridade 1 · migração segura (kit `vac-bases v2`, `fontes/kit/kit_bases.js`)
| Item | Decisão | O que mudou · teste |
|---|---|---|
| B01 Gravação recente na raiz apagada depois da cópia | **corrigido** | Antes de tirar a base da raiz, o código confere de novo se ela mudou desde a leitura; se mudou, não apaga nada. A base também não é mais apagada: é **movida** para `00. Backups/<módulo>`, então uma gravação de último instante fica guardada lá, e a página avisa. Teste: `tbases.js` › B01 |
| B02 Migração atrasada sobrescrevendo gravação confirmada no destino | **corrigido** | Trava entre computadores (arquivo `.<base>.migrando` em `00. Bases`, com prazo de 2 min; só é pega quando a base ainda está na raiz, então a conexão normal não grava nada nem espera) e nova conferência do destino antes de pôr a cópia no lugar. Se o destino já tiver base, não sobrescreve: decide pela data, e a raiz mais velha vai para o backup. Teste: `tbases.js` › B02 (dois momentos) e concorrência |
| B03 Conferência divergente apagando o arquivo de outra sessão | **corrigido** | Quando a conferência diverge, não apaga nada (nem destino nem raiz) e avisa o conflito. Teste: `tbases.js` › B03 |
| B04 Erro de leitura interpretado como ausência | **corrigido** | Só `NotFoundError`/`TypeMismatchError` contam como "não existe" (`vacNaoAchou`). Qualquer outro erro é "estado desconhecido", e nada é mudado. Valeu também para `vacRaiz` (não troca `00. Bases` pela raiz se a pasta der erro) e para a conexão de Portal, Waste, Gel e Produção, que não oferecem mais "Criar a base" quando a base existe mas não pode ser lida. Teste: `tbases.js` › B04 e "página: base ilegível" |
| B05 Cópia interrompida deixando arquivo vazio como base preferida | **corrigido** | A cópia vai para um arquivo temporário (`.<base>.copiando-<sessão>`), é conferida e só então entra no lugar. Na leitura, um arquivo vazio em `00. Bases` não é preferido. Temporários com mais de 10 min são limpos. Teste: `tbases.js` › B05 (interrupção e sobra vazia) |
| Procedimento "F5 depois da troca" / "nada se perde" | **corrigido** | Guia (itens 5, 6, 9 e 10) e `LEIA-ME.txt`: é **obrigatório** que nenhuma página esteja aberta em nenhum computador durante a troca e a primeira abertura. A primeira abertura é feita num único computador. Os dados de uma página antiga **não se juntam sozinhos**. O guia lista as condições de uma migração segura e como saber que ela terminou |

### Prioridade 2 · recuperação e compatibilidade
| Item | Decisão | O que mudou · teste |
|---|---|---|
| B07 Backup na retomada depois de interrupção | **corrigido** | Toda saída da raiz passa por `tirarDaRaiz`, que move a base para o backup, inclusive quando a cópia já estava em `00. Bases`. Teste: `tbases.js` › B07 |
| B06 Volta para a versão anterior depois da migração | **definido e validado** | **Reproduzido:** a Produção antiga (2.4.5, commit `38542d0`), ao reconectar, cria uma base nova vazia na raiz. **Procedimento** (guia, item 9): fechar tudo; mover os 7 `.json` de `00. Bases` para a raiz (sem substituir, guardando antes a que uma página antiga tenha criado); só então copiar os HTML antigos. Teste `tbases.js` › B06: com o procedimento, a Produção antiga abre a base real, e numa nova atualização a base volta para `00. Bases`. **Não automatizado de propósito:** um botão "devolver as bases" com páginas novas abertas causaria a mesma divisão de dados |
| Pasta original no IndexedDB, `vacRaiz` só no acesso | **mantido** | Sem mudança: as páginas continuam guardando a pasta do seletor |

### Prioridade 2 · fechamento do layout
| Item | Decisão | O que mudou · teste |
|---|---|---|
| Marca colorida da aba ativa (Portal, Waste, Gel, Paradas) | **corrigido** | O `kit_visual.css` zerava a borda de todas as abas, inclusive da ativa; a regra da aba ativa (`.on`/`aria-selected`) foi devolvida. Teste: `tvisual.js` mede a borda da aba ativa nas 5 páginas e nos 2 temas |
| Aba ativa à vista ao redimensionar o Gel | **corrigido** | O redimensionamento chama a mesma função que leva a aba ativa à área visível. Teste: troca de aba e redimensiona para 1024/768/390 px sem recarregar |
| Contraste dos contadores no submenu da Produção | **corrigido** | `.nmenu .cnt` passa a usar `--cnt-bg`/`--cnt-ink` (antes 2,19:1 no escuro). Teste: mede com o submenu aberto, nos 2 temas |
| Faixa de teste do Paradas | **corrigido** | Antes âmbar com texto preto (ficou pior com o `--warn` mais escuro da entrega anterior). Agora usa o roxo de exemplo, igual ao Portal e ao Waste, com o texto "Ambiente de teste · dados fictícios". Teste: contraste da faixa ≥ 4,5 (7,7 no claro, 8,1 no escuro) e entrada de fato no modo de teste (`modoTeste()`; antes o teste chamava uma função que não existe) |
| Unidade da escala mensal do Paradas | **corrigido** | A chamada real usava um formatador próprio (`h` acima de 6000, número puro abaixo); passou a usar `fmtMin`, com uma unidade para a escala inteira. O Pareto (`hbars`) tinha o mesmo problema (h e min misturados) e foi corrigido junto. Teste: cada gráfico de barras da Visão geral e do Pareto com uma unidade só |
| Preferências antigas de tema | **corrigido** | Seção `vac-prefs` do kit, que roda antes de qualquer página: converte `vac.theme`, `vac.user` etc. gravados com aspas (`"dark"`) para texto simples. Teste: as 5 páginas aplicam o tema com o valor antigo |
| Cabeçalhos em telas menores | **avaliado e corrigido em parte** | Status e ações continuam visíveis e dentro da tela nas 5 páginas, em 768 e 390 px. **Achado:** a regra comum que esconde o subtítulo (`.vpage .rule`) também escondia a pílula roxa de estado ("Modo de teste"), que usa a classe `rule`, no Portal e no Waste em telas pequenas; corrigido no kit. A altura da faixa (52 a 180 px) continua variando conforme a quantidade de status e ações de cada página; reduzir isso tiraria informação e fica para a validação com o uso (§ L) |

### Guia de instalação
- **Incorporado:** o guia e o gerador (`fontes/guia/`) estavam no branch, sem merge no `main` auditado. Entram neste PR.
- **Revisado contra as telas atuais:**
  - conexão de cada módulo, com um print novo da janela "Base encontrada" do Gel;
  - as perguntas de confirmação ("Criar a base nesta pasta?" = Cancelar);
  - a migração das 7 bases, com condições de segurança, critérios de "terminou" e as mensagens possíveis;
  - recuperação (volta de versão e duas cópias da base).

### Testes reforçados
- **`tbases.js` (36 checagens):**
  - B01 a B07 com falhas injetadas no meio da migração;
  - duas sessões migrando ao mesmo tempo e trava expirada;
  - conexão normal (nada na raiz): sem trava, sem espera e sem aviso falso de "aguardando";
  - base ilegível na conexão;
  - volta de versão com a Produção antiga real;
  - conferência do conteúdo final e dos backups.
- **`tvisual.js` (170 checagens):**
  - entrada real no modo de teste do Paradas, sem `try/catch` que esconda falha;
  - telas do exemplo preenchidas (indicadores e gráficos);
  - marca da aba ativa e troca de aba;
  - redimensionamento sem recarregar;
  - contraste com o submenu da Produção e o menu Mais do Gel abertos;
  - unidade única por gráfico do Paradas;
  - faixa de teste;
  - tema antigo com aspas;
  - status e ações do cabeçalho em telas menores.
- **Na versão auditada**, o novo `tvisual.js` acusa 18 falhas e o novo `tbases.js`, 12.

**Limites:**
- Os cenários de pasta usam o sistema de arquivos do navegador (OPFS), com falhas e concorrência simuladas. Não substituem duas estações reais na pasta da rede.
- O `move()` de arquivos foi validado no OPFS. Na pasta da rede, se o navegador não oferecer `move()`, o código grava o backup e confere a raiz antes de apagar. Nesse caminho alternativo ainda existe uma janela de milissegundos entre a conferência e a remoção.

---

## L. Resposta à auditoria visual (`docs/auditorias/layout-2026-11-06/`)

### Parecer
A auditoria foi conferida contra o código atual, que inclui as entregas posteriores ao `142b9c2` (PRs #5 e #6). Nenhuma delas tinha mexido em layout, então **todos os achados ainda valiam**. O novo `testes/tvisual.js` reproduziu os números da auditoria: Gel com 8 px de margem e deslocado 30 px, Paradas 20 px à esquerda, abas do Gel com 84 px em 1024 px e 169 px em 390 px, e contadores com 2,19:1 e 2,89:1. São 48 checagens que falhavam antes e 112 que passam agora.

**Divergências encontradas:**
- **V08 era mais amplo.** O Paradas também lia `vac.user` e `vac.logo` com `JSON.parse`. Por isso não reconhecia o usuário nem a logo gravados pelo Portal, e o nome que gravava aparecia com aspas nas outras páginas. Corrigido junto.
- **Contraste no tema claro.** Também havia pares abaixo de 4,5:1 que a auditoria não listou: pílula "Adiantado" do Gel (4,29), contador do Waste (4,45) e texto de pílulas de estado (3,4 a 4,3). Corrigidos.
- **Botão "Resolver" do Paradas (2,58:1).** Não aparece no estado vazio. A causa, texto branco sobre o `--accent` claro do escuro, foi corrigida com `--accent-ink`, e o `.b.pri` passa no `tvisual.js`.

### Prioridade 1 · **corrigida**
| Item | O que mudou | Conferência |
|---|---|---|
| V08 Tema entre páginas | Paradas lê e grava as chaves comuns em texto simples, lendo também o formato antigo | Portal escuro → Paradas escuro → troca no Paradas → as cinco páginas iguais na volta |
| V01 Estrutura e cabeçalho | `kit_visual.css`: corpo sem margem, 1560 px + 16 px, faixa de 52 px, botões de 30 px. Gel: Importar, Sincronizar, Backup, TV e **Mais** | Barra, título e conteúdo no mesmo x nas cinco páginas, nas 5 larguras e nos 2 temas |
| V02 Abas | 15 px, marca de 3 px, uma linha com rolagem e setas ‹ ›; aba ativa à vista | Abas do Gel com 44,8 px em todas as larguras (antes 84 px a 169 px) |
| V05 Contraste no escuro | `--cnt-bg`/`--cnt-ink` e `--on-fill`; Paradas com `color-scheme: dark` | Nenhum contador, badge ou botão abaixo de 4,5:1; campos de data no esquema escuro |
| V06 Gráficos compactos do Portal | `miniChart` na largura do card; menos rótulos; título com unidade | Texto renderizado de 11,7 px em 1440 px (antes ~5,3 px) |

### Prioridade 2 · **corrigida em parte**
| Item | Decisão |
|---|---|
| V04 Cores de estado | **Corrigido.** Mesmos `--ok`, `--warn`, `--crit`, `--info` e `--none` nas cinco páginas; Paradas com a paleta comum; modo exemplo em roxo no Gel e no Paradas, que antes usavam vermelho e âmbar |
| V04 Sinais contraditórios no indicador | **Corrigido.** Na Produção, o valor segue o estado do card (antes: borda âmbar e número vermelho). No Waste, a borda segue o âmbar do valor. Nenhum limiar mudou |
| V04 Pílulas | **Corrigido.** Gel com pílula suave por padrão; ficam cheias só onde precisam destacar (cabeçalho do barril, cor do catálogo). No Paradas, "Conectar pasta" deixou de ser vermelha cheia |
| V03 Cards | **Corrigido em parte.** Indicador principal com valor de 28 px nas cinco páginas (Waste 24 → 28, Gel 30 → 28); resumo do Portal como variante compacta. **Mantida a diferença** entre o topo do Gel (borda lateral) e o Painel analítico (borda superior, com minigráfico): é a variante analítica. Agora há um título para cada faixa, em vez de unificar a borda |
| V06 Unidades dos gráficos | **Corrigido** no Paradas (uma unidade por escala) e nos cards do Portal (título com unidade). **Adiado:** revisão de títulos e legendas de todos os gráficos de cada página. Gatilho: a próxima mudança em cada gráfico |
| V07 Densidade | **Corrigido em parte.** Produção: um aviso de demonstração a menos no modo exemplo. Gel: título "Período selecionado · datas" separa as faixas do Painel. **Adiado:** juntar Resumo e indicadores do Waste e uniformizar a posição de Ação prioritária e filtros. A própria auditoria pede validar isso com o uso; vai com a conferência na pasta real |

### Prioridade 3
- **Feito:** o CSS comum passou a ser distribuído pelo kit e pelo build (`kit_visual.css`), e há uma verificação visual curta (`testes/tvisual.js`), que também roda com `--sem-print`.
- **Adiado:** exemplos visuais de componentes; conferência na pasta real com a equipe, observando tarefas de operador e liderança.

### Diferença que continua de propósito
- **Abas da Produção:** 49,8 px de altura, contra 44,8 px nas demais. As abas agrupadas mostram o subtítulo da seção aberta (ex.: "Análise · Visão geral"). Elas não rolam, porque os menus dos grupos seriam cortados pela faixa rolável.

---

## 0. Resposta ao diagnóstico pós-merge (`c2ca6af`, 06/11/2026)

### Parecer sobre o relatório

Os quatro achados (M01 a M04) e as duas ressalvas sobre este registro foram **todos confirmados no código e corrigidos**. O relatório leu o registro antes, não reabriu decisões recusadas e marcou com precisão o limite de cada achado (o M01 não é perda permanente, porque havia backup; o M04 não demonstrou perda). Os cenários viraram testes em `testes/tdiag.js`. **Todos falham no código de `c2ca6af` e passam no código corrigido**, menos o caso do catálogo local legado, que é um teste de não-regressão e passa nos dois.

Ao reproduzir o M02, achamos **um defeito a mais no mesmo trecho**: ao criar a nova vigência, o CadSync marcava como "usado" o id calculado (`cat_<código>`), e não o id que o registro recebia de fato. Com isso, a vigência antiga escapava da desativação do F04. Corrigido junto.

### M01 · P1 · Portal e Waste gravavam depois de falhar a leitura prévia · **corrigido** (Portal 1.8.6, Waste 1.8.10)
- **Confirmado:** em `Store._commit` (Portal) e em `commit` (Waste), a exceção da leitura era ignorada e a gravação seguia. Isso também acontecia **sem** alteração pendente: bastava outra pessoa ter gravado e a leitura falhar.
- **Feito:** sem leitura da base, a página **não grava**. A alteração é aplicada na cópia local e fica pendente (`pendFrom` = revisão conhecida), com o aviso "Não consegui ler a base da pasta…". A sincronização, que já existia, confere a base antes de gravar: se ela não mudou, grava; se mudou, preserva a da pasta e baixa a cópia local como `_NAO-GRAVADO`.
- **Teste:** `tdiag.js` › M01 Portal e M01 Waste, com a sequência do relatório (rev 10, A1 falha, B grava rev 11, leitura de A2 falha). O resultado é B na pasta, A1 e A2 pendentes e, depois da sincronização, B preservado e A1/A2 no `_NAO-GRAVADO`.

### M02 · P1 · CadSync reaproveitava a vigência antiga como a nova · **corrigido** (Produção 2.4.4)
- **Confirmado:** a segunda busca (`ex.find(x => !usados.has(x.id) && !vs.some(…))`) reaproveitava qualquer registro com data fora da lista nova.
- **Feito:**
  - O reaproveitamento com outra data só vale no **mapeamento inicial de um catálogo local nunca sincronizado**: sem `portalDe`, não criado pelo Portal (`createdBy !== 'Portal'`) e com data que não é de vigência desativada.
  - Cada registro sincronizado passa a guardar `portalDe`, a data da vigência do Portal que ele representa.
  - O defeito do id "usado" foi corrigido junto.
- **Resultado:** a vigência antiga mantém id, data e PPH, e fica inativa (F04); a nova recebe outro registro.
- **Teste:** `tdiag.js` › M02, com duas sincronizações. Também confere que o catálogo local legado continua sendo aproveitado.
- **Efeito colateral conhecido:** na primeira sincronização depois da atualização, os registros já sincronizados ganham `portalDe`. Isso gera uma linha de auditoria "sincronização do Portal" por registro, uma única vez.

### M03 · P1 · A volta para o Portal no dia seguinte não redesenhava a tela · **corrigido** (Portal 1.8.6)
- **Confirmado:** o `visibilitychange` comparava só `f.mod`.
- **Feito:** `readModules` conta as mudanças nos dados adaptados (`MOD.versao`, que só muda quando uma base é reprocessada ou quando aparece ou muda um erro de leitura). A volta para a página e a rotina de 1 minuto redesenham pelo mesmo critério.
- **Teste:** `tdiag.js` › M03, que confere o **DOM**, como o relatório pediu. Com o relógio simulado, a pendência está ausente em 06/11 e presente em 07/11 depois do evento de retorno, sem trocar de aba.

### M04 · P2 · Gel limpava a fila sem uma releitura válida · **corrigido** (Gel 1.98)
- **Confirmado:** com `fsReadHead` retornando `null`, ou sem `rev`, o código seguia para `FS.pending.splice`.
- **Feito:** releitura ausente, ilegível ou sem `rev` no início significa gravação **não confirmada**. A fila fica, com o aviso "Não consegui conferir a gravação…", e a nova tentativa a cada 30 s continua valendo. O próprio `fsWriteBase` sempre grava `{"rev":N,"revBy":…}` no início, então uma releitura válida sempre tem `rev`.
- **Teste:** `tdiag.js` › M04.

### Ressalvas sobre a precisão deste registro · **corrigidas**
- **Waste lê estruturas internas da Produção:** a descrição antiga estava **incompleta** e foi corrigida na tabela do § 1. A correção de código continua adiada, com o motivo e o gatilho lá.
- **Leitor do Gel no Waste com `exports` de versão desconhecida:** **corrigido no código** (Waste 1.8.10). `gelFind` não lê nada desse `exports`, nem pela busca genérica, e a tela pede para atualizar o Waste. Teste: `tdiag.js` › Ressalva.
- **"Teste aprovado não prova ausência de outras falhas":** concordamos. Neste registro, um teste aprovado vale **só para o cenário que ele reproduz**.

### 0.1 · P2 · Base que some da pasta deixava números antigos na tela · **corrigido** (Portal 1.8.7)
- **Apontado na revisão do PR #5 e confirmado:** quando `findModule` não achava mais a base, o Portal trocava os dados pelo erro, mas **não subia `MOD.versao`**. A tela não redesenhava e o cartão continuava com os números antigos. Era uma lacuna da correção do M03: só o erro de leitura subia o contador.
- **Feito:** as duas transições para erro (base não encontrada e erro de leitura) passam por `modErro`. Ele sobe o contador quando o erro é novo e esquece o arquivo lido. A recuperação já funcionava (a base que volta é reprocessada) e foi mantida.
- **Teste:** `tdiag.js` › "Base some", que confere o DOM em três momentos: com os dados, depois do sumiço (aviso no lugar dos números) e depois da volta da base (dados de novo). No código de `142b9c2`, só o cenário do sumiço falha.

---

## 1. Resposta ao diagnóstico de 06/11/2026

### Parecer sobre o relatório

O relatório é bom. Os oito problemas foram conferidos no código, e **sete se confirmaram como descritos**. As reproduções isoladas foram o ponto forte: cada uma virou um teste em `testes/tdiag.js`. Os 15 cenários desse teste **falham no código de `9cc1dc4` e passam no código corrigido**.

Três ressalvas para as próximas análises:
1. **F05:** a correção proposta para os zeros à esquerda contradiz uma regra documentada em `docs/cadastro-base-contrato.md`, que vale também no Portal. Aplicada, ela quebraria a ligação entre ordem e cadastro. Antes de propor mudar uma normalização, vale procurar a mesma regra nas outras páginas e na documentação.
2. **F07:** é um defeito real, mas **latente**. O OEE ainda não publica `paradasEventos`, então hoje nenhum evento é escondido. O relatório marca P1 sem citar isso. Corrigimos mesmo assim, porque a regra estava errada.
3. **`S.cadDoc` (dentro do F04):** a correção sugerida ("limpar o documento") seria pior que o problema. Detalhe abaixo.

### F01 · P0 · Produção dava "salvo" sem ter salvo · **corrigido** (Produção 2.4.3)
- **Confirmado:** a releitura depois da gravação comparava só `databaseVersion`. Duas gravações simultâneas geram a mesma versão.
- **Feito:** cada gravação leva um `saveId` (identificador único), e a releitura confere esse campo. Se não bater, a alteração continua pendente, com o aviso "Outra pessoa gravou ao mesmo tempo…", e a próxima tentativa entra no caminho de conflito que já existia. Esse caminho é o `reapply`, que reaplica as operações da sessão sobre a versão da outra pessoa.
- **Onde:** `fontes/producao/build.py` (regras `R(...)` sobre `OEE-base-2.0.html`).
- **Teste:** `tdiag.js` › F01. O primeiro resultado fica "pendente" e o arquivo final tem as duas alterações (A e B), na versão 12.
- **Alteração feita durante a gravação:** já era tratada antes (`rev0`, "continua pendente e grava de novo"). Não mudou.

### F02 · P0 · Gel limpava a fila depois de 3 colisões · **corrigido** (Gel 1.97)
- **Confirmado:** em `fsFlush`, quando `++tries<3` dava falso, o código seguia para `FS.pending.splice`.
- **Feito:** ao esgotar as tentativas, o código lança "Gravação simultânea com outra pessoa…". A fila continua no IndexedDB, e a nova tentativa automática a cada 30 s, que já existia, grava de novo.
- **Teste:** `tdiag.js` › F02, com colisão em todas as tentativas: 1 pendência mantida e o aviso exibido.

### F03 · P1 · Pendência do Waste não aparecia na virada do dia · **corrigido** (Portal 1.8.5)
- **Confirmado:** o defeito foi introduzido pela nossa entrega anterior (`aPartirDe`, Portal 1.8.4). O cache de `readModules` só reprocessava quando o arquivo mudava.
- **Feito:** a chave do cache inclui o dia (`MOD.files[id].dia`), e a comparação que decide redesenhar também. A sincronização automática, a cada minuto, reprocessa na virada do dia.
- **Teste:** `tdiag.js` › F03, com o relógio do navegador simulado: 0 pendências em 06/11 e 1 pendência em 07/11, sem nova gravação no Waste.

### F04 · P1 · CadSync não levava desativações · **corrigido em parte** (Produção 2.4.3)
- **Vigência de catálogo desativada:** **corrigido.** Fica `active:false` na Produção. **Não** é marcada `deleted`, de propósito: os registros antigos acham o catálogo pelo id (`catalogs.find(x => x.id === …)`), e a vigência inativa preserva o histórico (regra 3). Só se aplica quando o catálogo tem vigências no Portal, válidas ou desativadas.
- **Última meta desativada:** **corrigido.** O Portal passa a mandar quando tem metas cadastradas, mesmo que estejam todas inativas. Antes, mandava só com pelo menos uma ativa.
- **Turno inativo:** **corrigido.** As vigências ficam inativas (`active: v.ativo !== false && t.ativo !== false`).
- **`S.cadDoc` mantido quando o arquivo some:** **recusado como proposto ("limpar").**
  - Se o documento for limpo, a Produção entende que não há cadastro do Portal e **destrava** as abas de configuração.
  - Uma falha momentânea da pasta deixaria editar localmente o que a próxima sincronização apagaria.
  - **Feito no lugar:** mantém a última cópia, com as travas, e a faixa "Vem do cadastro do Portal" avisa que o arquivo não foi achado na última leitura (`S.cadDocAusente`).
- **Teste:** `tdiag.js` › F04, com os três casos.

### F05 · P1 · Importador SAP · **corrigido em parte** (Produção 2.4.3)
- **Data impossível (31.02.2026):** **corrigido.** É recusada; 29.02.2028 continua aceita.
- **Número parcial ("123abc" virava 123):** **corrigido.** Só é aceito se o texto inteiro for número. Os formatos válidos continuam: `1.234,56`, `1,234.56`, `15-` (negativo do SAP) e `4 500,0`.
- **Zeros à esquerda do material (`0000456` vira `456`):** **recusado.**
  - É uma normalização **intencional e documentada** (`docs/cadastro-base-contrato.md`: "códigos numéricos perdem os zeros à esquerda").
  - Ela é igual nos dois lados: `normMat` no Portal (importação da CS12) e `cod` na Produção. O SAP completa materiais numéricos com zeros até 18 dígitos, e essa limpeza é o que faz o material da ordem bater com o cadastro.
  - Mudar só o importador quebraria a ligação.
  - A regra 4 do `CLAUDE.md` dizia "nunca perder zero à esquerda", e isso causou a confusão. Foi reescrita: códigos sempre como **texto**, e material SAP numérico normalizado **do mesmo jeito em todas as páginas**.
- **Verificação:** as amostras de `testes/amostras/` (MB51 e COOIS) produzem resultado idêntico antes e depois (hash do resultado). Teste: `tdiag.js` › F05.

### F06 · P1 · Waste somava o scrap ao consumo de gel · **corrigido** (Waste 1.8.9)
- **Confirmado:** a expressão `/consumo|kg|gel/` também pegava `scrapKg`.
- **Feito:**
  - Com `exports` do Gel (v1), o consumo e o scrap são lidos pelos nomes do contrato: `ordens[].consumoKg` e `ordens[].scrapKg`.
  - A busca por nome de campo fica só para base sem `exports` e não soma mais nenhum campo de scrap, purga ou descarte no consumo.
- **Teste:** `tdiag.js` › F06. Dá 100 kg e 5 kg pelo contrato e também pela base sem `exports`.

### F07 · P1 · Evento do OEE escondia o Forms do dia inteiro · **corrigido** (Paradas 1.0.7)
- **Confirmado no código, mas latente:** o OEE ainda não publica `exports.paradasEventos` (o campo não existe em `OEE-Vacutainer.html`). Hoje nenhum evento é escondido.
- **Feito:** troca pelo critério já decidido em `docs/paradas-arquitetura.md` (D1): mesma parada é mesmo dia e equipamento, mesmo turno quando os dois têm, e início a até 10 min (sem horário, duração a até 1 min).
  - Cada evento do OEE substitui no máximo um evento.
  - Contagem de microparadas (`tally`) nunca é substituída.
  - Evento sem equipamento nunca é considerado duplicado.
- **Teste:** `tdiag.js` › F07. O Forms do EQ02 continua, o do EQ01 (a mesma parada) sai e a microparada fica.
- **Ainda falta:** um `eventoId` comum entre OEE e Paradas. Entra quando o OEE publicar os eventos (etapa 3 do roteiro em `paradas-arquitetura.md`).

### F08 · P1 · Versão desconhecida do `exports` ainda alimentava números · **corrigido** (Portal 1.8.5)
- **Confirmado:** `adaptOEEBruto` e `adaptPerdas` liam `exports.porMes` sem testar a versão.
- **Feito:** os dois caminhos ignoram o `exports` inteiro quando `exportsVersion` não é 1. Com versão desconhecida, o Waste mostra "–" nos cartões financeiros. `r.ex` e `cadProp` do Paradas também passam pelo teste de versão.
- **Teste:** `tdiag.js` › F08, para o OEE e para o Waste.

### § 5 · Pendências adicionais

| Item | Decisão | Motivo |
|---|---|---|
| 5.2 Versões não reconhece os campos da Produção | **corrigido** (Portal 1.8.5) | `baseInfo` e o cartão leem `databaseVersion`, `lastModifiedAt`, `lastModifiedBy` e `applicationVersion`. Teste: `tdiag.js` › 5.2 |
| 6.2 `tintegra.js` não falhava com código de erro | **corrigido** | `tintegra.js` e o novo `tdiag.js` saem com código 1 quando algo falha |
| Meta `WASTE-MES` lida pela data de hoje | **adiado** (P2) | Viola a regra 3 (vigência da data do fato), mas só afeta a consulta de meses antigos, e a meta raramente muda. Gatilho: primeira mudança de valor da meta no Portal |
| `Ord.gravar` sem releitura depois de gravar | **adiado** (P2) | A gravação já relê antes e aplica só a competência importada sobre a versão nova; importar uma competência substitui os dados do SAP dela por inteiro. Falta a confirmação depois de gravar (mesmo padrão do F01). Gatilho: próxima mudança em Ordens |
| Waste lê estruturas internas da Produção | **adiado** (P2) · *descrição corrigida após o diagnóstico pós-merge* | O detalhe da ordem no Waste lê da base da Produção, **mesmo com `exports`**: `monthPlans`, para ordens fora da janela de `exports.ordens` (só o mês atual e o anterior), e `server.lotClass` / `lotNotes` / `dayLot` (classificação, observação e dias do lote). `exports.lotes` já cobre classificação e observação por 150 dias, mas não `dayLot` nem ordens antigas. Para sair, a Produção precisa publicar ordens de todos os meses e os dias do lote no `exports`. Gatilho: a próxima mudança no `exports` da Produção |
| Gel e Waste dependem da cópia do cadastro no navegador | **já existia, por decisão** | Regra 2: as páginas leem `localStorage['vac.cadastros']` em modo consulta. É o desenho da plataforma, não um defeito |
| Catálogos e equipamentos no Gel, produção OEE → Gel, calendário comum | **adiado** (P3) | Já estão nas pendências conhecidas do `CLAUDE.md` |
| Recortes temporais dos `exports` (120 dias, 13 meses…) | **já existia** | As janelas estão documentadas em `docs/portal-e-padrao-comum.md` § 4 |
| Persistência, permissões e cabeçalho duplicados | **recusado** (extração em bibliotecas) | Ver A05 abaixo. O que precisava ser igual já é copiado por script (`aplicar_kit21.py`, `sistemas.js`) |
| Mecanismos de gravação diferentes por página | **recusado** (unificar agora) | Cada página tem o modelo que cabe na base dela (operações reaplicadas na Produção, fila de mudanças no Gel, `rev` no Portal e no Waste). Os defeitos reais foram corrigidos em cada um (A06, F01, F02). Unificar seria reescrever o que funciona (regra 6) |
| Build por substituições exatas | **já existia, por decisão** | O build para com `ERRO` se o trecho não for achado exatamente uma vez. A fragilidade é proposital: obriga a revisar a regra |
| Sem `package.json`, CI ou `lib/` no repositório | **adiado** (P2) | A pasta `lib/` fica na pasta da rede, e a tela "Versões das páginas" do Portal confere as versões. CI precisa de decisão do responsável |
| Documento de centralização com pendências já entregues | **adiado** | Os registros históricos ficam como estão (com data); o estado atual está no `CLAUDE.md` e neste registro |
| 5.4 Perfis não são autenticação | **recusado** | O próprio relatório reconhece que é característica da arquitetura (HTML na pasta da rede). A proteção real são as permissões de pasta do Windows |

---

## 2. Resposta à auditoria de integração de 05/11/2026

| Item | Decisão | Motivo e onde |
|---|---|---|
| A01 Estoque do Gel no Portal sem as retiradas parciais | **corrigido** (Portal 1.8.3, Gel 1.96) | O Portal lê `exports.estoque` (saldo); o Gel publica `estoque.porLocal`. Teste: `tintegra.js` |
| A02 OEE recalculado no Portal | **corrigido** (Portal 1.8.3) | Cartões, pendências, série e ordens vêm do `exports` do OEE; o cálculo bruto ficou só para base sem `exports` (pílula "dados brutos") |
| A03 Série do Paradas não aparecia | **corrigido** (Portal 1.8.3) | `adaptParadas` lê `{rotulo, pontos}`; o formato do Paradas não mudou |
| A04 Urgência invertida | **corrigido** (Portal 1.8.3) | Contrato registrado: `sev 1` = urgente e `sev 2` = atenção, como OEE, Gel e Paradas já publicavam. **A numeração proposta (0/1/2, com 2 = crítica) foi recusada:** inverteria o significado de um campo em três páginas e exigiria `exportsVersion 2` |
| A05 Extrair código comum para `shared/*.js` | **recusado** | Quebraria o arquivo único na pasta da rede. O comum é copiado por script (`aplicar_kit21.py`). O problema real encontrado (`DEFAULT_SYSTEMS` diferente por página) foi corrigido com `fontes/kit/sistemas.js` |
| A06 Gravação pendente por cima de outra pessoa | **corrigido** (Portal 1.8.3, Waste 1.8.7) | A pendência só vai para a pasta se a base de lá não mudou; se mudou, a cópia local é baixada como `_NAO-GRAVADO` |
| A07 Segurança no navegador | **recusado** | Mesmo motivo do 5.4 |
| A08 Tela "Saúde do sistema" | **corrigido em parte** | Em vez de uma tela nova, a tela "Versões das páginas", que já existia, passou a avisar sobre `exports` em versão desconhecida ou mais antigo que a gravação |
| A09 Funcionar sem internet, navegadores, acentos | **adiado** | Fica para a lista de conferência da homologação na pasta real |
| A10 Contagem dupla OEE × Paradas | **corrigido em parte** | A regra de deduplicação foi corrigida no F07. O `eventoId` comum entra quando o OEE publicar os eventos |
| Contrato `schemaVersion 2` (`series`, `status`) | **recusado** | Renomearia campos que funcionam (`serie` → `series`), contra a regra 6 |
| Painéis por papel, BI e etapas 0–6 | **recusado** (escopo) | Não corrigem dado. A etapa 0 (versionamento) já existe no git |
| Waste: mês aberto como provisório | **corrigido** (Portal 1.8.3) | Usa `porMes[].fechado`, que o Waste já publicava |
| Waste: pendências pelo `exports` | **corrigido** (Waste 1.8.8, Portal 1.8.4) | `exports.pendencias` com `aPartirDe` para ação que vence sem nova gravação; a virada do dia foi corrigida no F03 |

---

## 3. Como verificar

```bash
python fontes/producao/build.py   # a Produção precisa sair idêntica ao paginas/OEE-Vacutainer.html versionado
node testes/tdiag.js              # cenários deste registro (diagnóstico de 06/11/2026); código 1 se algo falhar
node testes/tintegra.js           # Portal × exports (auditoria de 05/11/2026); código 1 se algo falhar
node testes/tpg.js
```

**Limites:** os testes de gravação usam pastas simuladas em memória. Eles reproduzem a ordem dos acontecimentos, mas **não** substituem um teste com duas estações gravando na pasta de rede real. A conferência na pasta real continua pendente (`CLAUDE.md` › Pendências conhecidas).

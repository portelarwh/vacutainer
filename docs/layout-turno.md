# Layout do turno no Lançamento (Produção 2.4.46 · 11/11/2026)

Primeira tela da revisão de layout das páginas. Mockup aprovado: https://claude.ai/artifact/RUbST7KvHbuP5fG5KVqDN5 (tema segue o sistema).

Fonte: `fontes/producao/turno_layout.js` (`TurnoUI.bloco`), entra pelo `build.py`. Cada turno vira um painel de largura total, um abaixo do outro, com sete faixas:

1. **Cabeçalho**: ícone (sol ou lua pelo horário), nome, horário, situação (em lançamento · pendente · fechado), **Fechar turno** (ação principal) ou Reabrir, **Hora a hora n/m**.
2. **Catálogo em produção** (catálogo inicial, editável, e "Produzindo:" com os catálogos dos intervalos) · **Responsável do turno** (campo) · **Tempo planejado** · **Meta de produção (dentro do turno)**.
3. **Produção dentro do turno** com barra e % da meta; produção total considerada e a meta (✓ quando atinge); painel de retorno: verde "Meta do turno atingida!", azul "Faltam N" com o ritmo necessário nas horas que restam (turno em andamento hoje) ou "Faltaram N" (fechado), cinza sem meta.
4. **Produção fora do turno** · **Caixas do MES** (1ª e última caixa, trocas de lote/catálogo e total de troca) · **Minutos de parada** · **Scrap** ("Não informado" em âmbar, botão Lançar/Editar/Ver scrap).
5. **Capacidade planejada** · **OEE reportado** (✓ meta) · **OEE real** · **D · P · Q** (2 casas).
6. **Abonos** e **Turno sem produção**.
7. **Segurança e Qualidade do Turno** (formulário do SQDCP, com o botão salvar à direita).
Observações do turno ficam recolhidas no fim (abertas quando há texto).

Regras:
- Só a tela mudou: mesmos números (`Engine.computeDay`, `TurnoCard.real`, `OeeReal.mes`), mesmos campos e `data-*` (`data-psf`, `data-closeps`, `data-reopenps`, `data-scrapturno`, `data-shoff`, `data-hhps`, `data-sq-*`); OEE, bases e `exports` iguais.
- Turno importado como resumo (`ps.summary`) e turno não produtivo continuam com o cartão anterior.
- Grid de 4 colunas → 2 (≤ 1180 px) → 1 (≤ 620 px); botões com 44 px de altura; cores de estado iguais nos dois temas (verde = meta atingida, âmbar = pendência, laranja = parada, roxo = catálogo/caixas, azul-escuro = ação principal).
- Correções do texto da proposta: "Caixas do MES" (não "do mês"), "D · P · Q" (não "D - P - O"), a meta com a janela fora do turno nunca é menor que a do turno.

Testes: `toeereal` e `tfase7` (cartão do turno), `tturnos`, `tgel`, `tsqdcp`, `tperiodo`.

## Servidor, lotes, turno não produtivo e produção fora do turno (Produção 2.4.47 · 11/11/2026)

Fonte: `fontes/producao/lanc_layout.js` (`LancUI.bloco`, no lugar de `SrvUI.dayCard` + `ForaTurnoUI.card` no Lançamento).

- **Produção registrada no servidor**: cabeçalho com Produção do dia (caixas · unidades; retrabalho e a confirmar abaixo), Trocas (de catálogo e de lote) e Validação (verde "Dados conferidos" ou âmbar "N sugestões para revisar" com o botão Revisar). Lotes sem ordem no plano aparecem em faixa âmbar com "Confirmar lotes". Linha do tempo com barras por lote na cor do catálogo ("Lote X · N caixas" dentro), marcador amarelo de troca de catálogo e marrom de troca de lote com dica (horário, catálogo e lote anterior e novo, última e 1ª caixa), hachura para "sem caixa" e retrabalho; legenda em "Entenda as marcações".
- **Lotes do dia**: cartão por lote (catálogo, família, produto, lote, caixas, Marcar como retrabalho, Descontar o tempo do retrabalho) e "Ver histórico de lotes".
- **Turno não produtivo** (ex.: 3º turno): seção própria ao lado dos lotes, com switch "Habilitar … neste dia", horário e o que muda (tempo planejado, produção da janela, indicadores; só neste dia).
- **Produção fora do turno**: resumo (caixas · produção, período, OEE do período ponderado pela duração dos trechos), tabela (Período registrado, Horário das caixas, Caixas, Produção, OEE do período, Contabilizado em) e "Como a produção fora do turno é contabilizada?" (continuidade sem parada maior que o limite, regra vigente desde a data do parâmetro).
- O resto do Lançamento segue a mesma lógica (`#main[data-rota="launch"]`): cartões com cantos de 12 px, títulos e rótulos em texto normal (sem caixa alta).
- Mesmos dados e `data-*` (`#srvRev`, `#srvCls`, `data-rw`, `data-rwapply`, `data-turnonp`, `data-route="lots"`); `SrvUI.bindDay` e `ForaTurnoUI.mount` continuam ligando os botões.
- **Cabeçalho do dia recolhível** (2.4.48): botão ▾ Recolher / ▸ Mostrar no título; a escolha fica neste computador (`App.prefs.cabFold`). Recolhido, mostra só o título com a situação do dia.

## 2.4.52 · Hora a hora com as 24 h e Ordens sem MB51 (11/11/2026)

Pedido do usuário: "mesmo com 3 turnos eu reporto o dia de produção (24 h); no hora a hora preciso ver as 24 h, por turno ou por dia". Exemplo dado: a produção começou às 04:00 e só o 1º e o 2º turnos são produtivos. A produção das 04:00 às 06:00 já contava no 1º turno (`ForaTurno`, OEE reportado), mas não aparecia no hora a hora. As três mudanças estão em `fontes/producao/hh24.js`; nenhum cálculo mudou.

- **Linhas "fora do turno" (só leitura):** cada turno mostra as horas do MES fora do horário dele que contam nele (`res.foraTurno.recebe`), antes ou depois das próprias linhas. Cada linha traz horário, catálogo, lote, caixas, produção e a regra de continuidade.
- **Dia (24 h):** novo botão no seletor de turno. Mostra o dia de produção inteiro, do início do 1º turno até o mesmo horário do dia seguinte, hora por hora:
  - o turno da hora, ou "não produtivo" / "sem turno";
  - a meta e o apontado, repartidos pelos minutos de cada intervalo; a soma é igual à da grade;
  - caixas e produção do MES;
  - em qual turno conta a produção das horas sem turno.

  A produção recebida de antes do início do dia aparece no topo. A tela tem gráfico e é só leitura: a produção continua sendo lançada na grade de cada turno.
- **Ordens › Ordens produzidas:**
  - **Sem MB51 no período:** em vez de só "Nenhum MB51 importado", aparece a tabela de lotes produzidos (MES, via `App.views.lots.rows()`). Cada lote traz a ordem do plano do mês e a situação "não conciliado · sem MB51" ou "não conciliado · sem ordem no plano".
  - **Com MB51:** a lista continua igual, e embaixo aparecem os lotes do MES ainda não conciliados.
  - **Ficha:** o botão Ficha abre a ficha comum do lote.
- **Teste:** `testes/thh24.js` (caso das 04:00, Dia 24 h, Ordens sem MB51). O `tfase7` passou a ignorar o botão "Dia (24 h)" na contagem de turnos.

## 2.4.53 · Caixas do MES e Lotes do dia pelo dia de trabalho (11/11/2026)

Correção pedida pelo usuário, conferida com o CSV real da semana de 08 a 11/11. Antes, cada cartão contava as caixas de um jeito:
- "Caixas do MES" usava a janela 06:00→06:00. Em 09/11 deu 1.062 caixas: entravam as 23 de 10/11 (04:59–05:29), que contam no A do dia 10, e ficavam de fora as 19 de 09/11 (04:53–05:35), que contam no A do dia 09.
- "Lotes do dia" só olhava o horário dos turnos. Deu 1.039: as 19 da madrugada ficavam de fora.

Agora os dois usam o **dia de trabalho** (`CaixasDia` em `fontes/producao/hh24.js`): as caixas nos intervalos dos turnos do dia mais as caixas fora do turno que contam neste dia (`ForaTurno`, o mesmo conjunto do OEE reportado). Com o CSV real:

| Dia | Caixas do dia de trabalho | Caixas fora do turno |
|---|---|---|
| 09/11 | 1.058 | 19 |
| 10/11 | 1.131 | 23 |
| 11/11 (até 12:07) | 379 | 20 |

Lote 6299948 em 09/11: 950 caixas (19 fora do turno).

- **Cartão "Caixas do MES" (Lançamento, Visão Geral e Painel):** 1ª e última caixa do dia de trabalho, total de caixas, quantas fora do turno e trocas entre a 1ª e a última.
- **"Lotes do dia" e "Produção do dia":** caixas de cada lote que contam no dia, com a linha "N caixas fora do turno". A linha do tempo se estende até as caixas fora do turno.
- **Várias caixas no mesmo minuto:** o MES registra assim e todas contam. Isso foi corrigido durante o desenvolvimento.
- **Testes:**
  - `thh24.js` confere o dia de trabalho com duas caixas no mesmo minuto;
  - `toeereal.js` foi atualizado: o cartão termina às 23:40, porque o trecho das 02:00–02:30 conta no A do dia seguinte.

## 2.4.54 · Hora a hora em ordem de horário, Dia 00–24 h, tempo de troca e blocos recolhíveis (11/11/2026)

Pedidos do usuário na homologação com o CSV real da semana.

- **Gráfico "Atendimento hora a hora":** as horas do MES fora do turno que contam neste dia entram na ordem do relógio. Ex.: 04:00 e 05:00 antes das 06:00 (`HHPs.chart` em `hh24.js`).
  - Antes, as horas da janela do turno não produtivo entravam no fim, mesmo as que contam no dia seguinte.
  - Com um turno escolhido, só entra o que conta nele.
- **Dia (24 h):**
  - Com 1 ou 2 turnos (nenhum passa da meia-noite), a janela vai das **00:00 às 24:00**: "são as 24 h das 00 às 24 h".
  - Com o 3º turno produtivo atravessando a meia-noite, a janela continua sendo o início do 1º turno → o mesmo horário do dia seguinte.
  - Nas horas sem turno aparece em qual turno a produção conta, inclusive do dia anterior ou seguinte (`ForaTurno.doDia` de D−1, D e D+1).
- **Aviso retirado:** "O servidor tem dados deste dia (o valor "srv"…). O lançamento confere com o servidor." saiu do Hora a hora. Só aparece quando há sugestão para revisar ("N sugestão(ões) do servidor para conferir").
- **Cartão "Trocas"** (Produção registrada no servidor): passa a mostrar o **tempo de troca**, somado da última caixa do lote anterior até a 1ª caixa do lote novo. Com o CSV real, 09/11 deu 11 min.
- **Blocos recolhíveis no Lançamento:** "Produção registrada no servidor", "Lotes do dia", "Produção fora do turno" e o turno não produtivo recolhem pelo título (▾ Recolher / ▸ Mostrar), com o mouse ou o teclado. A escolha fica neste computador (`App.prefs.lcFold`, `LcFold` em `lanc_layout.js`). Na impressão, tudo sai aberto.
- **Teste:** `thh24.js` confere:
  - a ordem do gráfico;
  - o Dia das 00:00 às 24:00 com 04:00 e 05:00 antes das 06:00;
  - a ausência do aviso;
  - os blocos recolhíveis e lembrados.
- **Botão do scrap:** "Lançar scrap" / "Editar scrap" com fundo vermelho pastel (#e06c6c) e texto branco em negrito, nos dois temas (pedido do usuário). O hover fica um pouco mais escuro.

## 2.4.55 · Hora a hora por turno, Dia 00–24 h com barras e setas Mostrar/Recolher (11/11/2026)

- **Gráfico do Hora a hora com o turno escolhido** (`HHPs.chart` em `hh24.js`):
  - **1º turno:** mostra as horas dele e as horas fora do turno que contam nele (ex.: 04:00 e 05:00);
  - **2º turno:** mostra só as horas dele;
  - **3º turno não produtivo:** mostra as horas da janela dele que tiveram caixas, cada uma dizendo em qual turno conta;
  - **Todos:** mostra tudo o que conta no dia, em ordem de horário.
- **Turno não produtivo pelo dia do calendário:** a grade, a contagem no seletor e o gráfico usam as horas deste dia que caem na janela do turno (00:00–06:00 e 22:47–24:00), não mais a janela que entra no dia seguinte (`HHPs.npGrade`, `trechosNP`).
  - A grade ganhou a coluna **"Conta no"**.
  - O cabeçalho da grade diz em que turno a produção conta.
- **Dia (24 h):** as horas fora do turno que contam neste dia agora têm **barra** (produção do MES), não só a linha.
- **Seta "▾ Recolher / ▸ Mostrar" ao lado do ícone** (`LcFold` em `lanc_layout.js`, `App.prefs.lcFold`):
  - aparece em todos os blocos do Lançamento (servidor, lotes, fora do turno, turno não produtivo), em **cada turno** e nos cartões com título (Validação, Cascata, Disponibilidade…);
  - os cartões sem ícone ganharam um, escolhido pelo título;
  - o clique na seta ou no título recolhe e abre, e a escolha fica lembrada neste computador;
  - na impressão, tudo sai aberto;
  - no celular, aparece só a seta;
  - o Cabeçalho do dia mantém o botão próprio.
- **Teste:** `thh24.js` confere:
  - o gráfico por turno (A, B e o não produtivo);
  - a coluna "Conta no";
  - setas e ícones em todos os blocos;
  - o turno recolhido e lembrado.

## 2.4.56 · Lançamento no layout novo (proposta visual do usuário, 11/11/2026)

Reproduz a proposta "painel de gestão industrial" (`fontes/producao/lanc_v2.js`, chamado no mount do Lançamento). É **só apresentação**:
- os nós, ids, `data-*` e números continuam os de antes;
- nenhum indicador ou função saiu;
- nenhuma fórmula mudou.

**Cabeçalho do dia**
- Recolhe por uma **seta em círculo**.
- Data, Linha·máquina, Calendário e Scrap aparecem com ícone e separador.
- A observação ganhou o texto de exemplo "Digite uma observação para o dia..." e um contador de caracteres. O limite continua 2000.
- **Ações principais:** Hora a hora (em destaque), Fechar dia e Marcar como pendente de conferência (com contorno).
- **Ações secundárias com ícone:** Restaurar intervalos, Reaplicar metas, Marcar dia sem produção e Mover para outro dia. O ⓘ de cada uma continua.
- **Linha de baixo:** Histórico de alterações e **Excluir lançamento**, este com contorno vermelho por ser ação crítica.

**Cartões**
- Grade de 7 colunas; 4 colunas até 1280 px e 2 no celular.
- Ícone ao lado do título, que fica **numa linha só** (o número de colunas diminui em telas menores: 7 a partir de 1600 px, 5, 4, 3 e 2 no celular, onde o título pode ir para a 2ª linha).
- **Sem ⓘ, explicação no próprio título do cartão** (Produção inteira, todas as abas, `palavras()` em `lanc_v2.js` com MutationObserver no `#main`):
  - o título com explicação tem sublinhado pontilhado; clicar nele (ou Enter/Espaço) abre a mesma ajuda de antes;
  - o ⓘ que existia vira o próprio título; cartão que não tinha ⓘ ganha a explicação pelo título (`KPI_HELP` da página + `AJUDA_NOVA`: OEE do dia por hora, Paradas apontadas, Sem explicação, Consistência da cascata, Validação, Segurança e qualidade, Observação geral, Diferença contra a meta, Scrap %, PPH real e nominal);
  - título de gráfico: a explicação é a pergunta que ele responde e a linha "Valores em …";
  - cabeçalho de tabela: só o texto abre a explicação, o resto continua ordenando;
  - num bloco recolhível, o título abre a explicação e a seta (ou o resto do cabeçalho) recolhe.
- Nos botões de ação (Restaurar intervalos, Reaplicar metas, Marcar dia sem produção, Mover para outro dia) o clique continua sendo a ação: a explicação aparece como dica ao passar o mouse.
- A borda e o fundo mostram a situação: na meta (verde), atenção (amarelo) ou abaixo da meta (vermelho, com fundo claro).
- **Disponibilidade, Performance e Qualidade** com medidor em meia-lua. O número continua no cartão, visualmente escondido, para leitura de tela e testes.
- **"OEE do dia (evolução por hora)"**, novo e com largura de 2 colunas.
  - O OEE de cada intervalo é produção boa ÷ (PPH × minutos ÷ 60), a mesma conta do OEE oficial.
  - A linha tracejada é a OEE meta do dia.
  - Sem produção lançada, aparece um aviso.

**Setas Mostrar/Recolher**
- Em todos os blocos e turnos, a seta é um **círculo**, como na proposta.
- O texto "Recolher"/"Mostrar" continua para leitor de tela e aparece como dica ao passar o mouse.

**Não mudou nesta versão**
- **Cabeçalho geral do kit** (navegação entre páginas, título e abas): é comum às 8 páginas e não foi alterado. O título da página com ícone e as abas sem caixa alta, como na proposta, entram numa mudança do kit, em todas as páginas juntas.
- **"Editar cards"** continua por computador. Salvar a escolha **por perfil** ou para todos depende de guardar a escolha no Portal; é a próxima etapa sugerida.

## 2.4.57 · Nenhum ⓘ na Produção (11/11/2026)

- **Os dois ⓘ soltos** (canto da barra do Plano do mês e dos Relatórios) explicavam a tela inteira. A explicação foi para o **título da tela**, que fica sublinhado e abre a ajuda ao clicar.
- **Os ⓘ que só tinham dica do mouse** (ex.: "Ano fiscal" nas Ordens) viraram uma explicação comum, aberta pela palavra ao lado.
- **Resultado:** nenhum ⓘ visível nas 14 abas (conferido aba por aba).
- **Onde está:** `palavras()` em `lanc_v2.js`. Nada mudou nos números.
- **Testes:** as comparações de versão em `tfase7`, `tiniciativas` e `tplanner` passaram a ser numéricas (`verN`). Como texto, `'1.10.0' >= '1.9.15'` dá falso.


/* ===== Produção 2.4.36 (2.4.37: cards novos) · UX-02 (briefing 09/11/2026): guia por aba (componente vacGuia do kit) =====
   Etapa 1: Lançamento, Hora a hora, Plano do mês, Ordens (produzidas, conciliação, importar) e Visão Geral.
   Cada item com "sel" ganha o número na tela em "Mostrar na tela". Entra no script principal pelo build.py (antes do boot). */
function vacGuiaAba() {
  if (App.route === 'ordens') return typeof Ord !== 'undefined' ? ({ mb51: 'ordens-imp', coois: 'ordens-imp', conc: 'ordens-conc', hist: 'ordens-hist' }[Ord.sub] || 'ordens') : 'ordens';
  if (App.route === 'panel') return 'overview';
  return App.route;
}
window.VAC_GUIA = window.VAC_GUIA || {};
window.VAC_GUIA.oee = {
  launch: {
    titulo: 'Lançamento do dia',
    para: 'Onde o dia de produção é apontado e fechado: cabeçalho do dia, um cartão por turno (catálogo, responsável, scrap, abonos, gel) e a validação. Os números de produção vêm do <b>Hora a hora</b> (digitado ou sugerido pelo MES); aqui você confere, completa e fecha.',
    campos: [
      { sel: '#selDate', nome: 'Data do dia', o: 'Dia operacional. O turno da madrugada pertence ao dia em que começou (o C de 31/10 vai até 06:00 de 01/11).', como: 'Escolha no calendário ou use ‹ › para andar um dia.', ex: 'Para lançar o C que terminou hoje às 06:00, abra a data de ontem.' },
      { sel: '#kcEdit', nome: 'Editar cards', o: 'Liga e desliga os indicadores da faixa de cima (vale só neste computador; os números não mudam).', ex: 'Esconder "OEE reportado" quando já olha o "OEE realizado", que é o mesmo número oficial.' },
      { sel: '.section.kpis [data-help="oeeReal"]', nome: 'OEE reportado · OEE real · Fora de turno', o: '<b>Reportado</b>: o oficial, com a produção fora de turno somada ao turno que a recebe. <b>Real</b>: a mesma produção, com o tempo fora do turno em que a linha produziu somado ao planejado (início = menor entre o 1º turno e a 1ª caixa; fim = maior entre o fim do último turno e a última caixa). <b>Fora de turno</b>: quanto foi produzido fora dos turnos.', ex: 'B passou até 23:40: reportado 71,1%, real 67,5%, fora de turno 54 mil.' },
      { sel: '[data-scrapmode]', nome: 'Scrap: Por turno ou Total diário', o: 'Como o scrap do dia é informado. Por turno: cada turno informa o seu. Total diário: um único número para o dia, rateado entre os turnos.', como: 'Use Total diário só quando a contagem de refugo é feita uma vez por dia.', ex: 'A Qualidade conta o refugo de todos os turnos às 07:00 → Total diário.' },
      { sel: '[data-dayf="responsible"]', nome: 'Responsável pelo reporte', o: 'Aparece só no Total diário: quem responde pelo número único do dia. Nos outros casos o responsável é de cada turno.', como: 'Nome de quem fechou o total.', ex: 'J. Lima.' },
      { sel: '[data-dayf="note"]', nome: 'Observação geral', o: 'Fatos do dia que valem para todos os turnos e entram no relatório.', como: 'Texto curto, com o que aconteceu e o efeito.', ex: '"Falta de rolha das 10h às 11h; linha parada para limpeza no fim do dia".' },
      { sel: '[data-hhps=""]', nome: 'Hora a hora (todos os turnos)', o: 'Abre a grade de produção por intervalo de todos os turnos do dia.' },
      { sel: 'section.tl [data-psf$="|initialCatalogId"]', nome: 'Catálogo inicial do turno', o: 'Catálogo que a linha estava rodando no início do turno. As trocas durante o turno são feitas no Hora a hora.', como: 'Deixe "segue o turno anterior" quando não houve troca na passagem.', ex: '360057 no A, segue no B.' },
      { sel: 'section.tl [data-psf$="|responsible"]', nome: 'Responsável do turno', o: 'Líder ou operador que responde pelo lançamento do turno. Pode ser corrigido mesmo com o turno fechado.', como: 'Nome. Vazio mostra em cinza quem fechou o turno.', ex: 'P. Costa.' },
      { sel: 'section.tl [data-help="mesTurno"]', nome: 'Caixas do MES no turno', o: '1ª e última caixa do servidor no turno e cada troca de lote ou catálogo: quando terminou o lote anterior, quando começou o novo e quanto durou, com o total de troca do turno.', ex: 'L-1 terminou 20:10 → L-2 começou 22:30 · 2h20.' },
      { sel: 'section.shift.np', nome: 'Cartão do turno não produtivo', o: 'Aparece quando passaram caixas na janela de um turno não produtivo (ex.: C): mostra as caixas, para qual turno a produção foi e o OEE do trecho. Só leitura.' },
      { sel: '[data-scrapturno]', nome: 'Scrap do turno (botão Lançar scrap)', o: 'Abre o popup do scrap: por máquina ou "Reportar só o total" (desabilita as máquinas). Com catálogo de gel, o popup também leva à pesagem do gel. O total entra na Qualidade (Q) do OEE.', como: 'Peças inteiras, não caixas. Sem informar fica "não informado" (não é zero).', ex: 'Só o total: 1.250 peças. Por máquina: Cap Placer 400 + Etiquetagem 850.' },
      { sel: 'section.tl [data-help="prodDentro"]', nome: 'Produção dentro do turno · fora do turno · total considerada', o: '<b>Dentro</b>: lançada nos intervalos do turno. <b>Fora</b>: caixas da janela do turno não produtivo somadas a este turno (com horário). <b>Total considerada</b>: dentro + fora, é a que entra no OEE reportado.' },
      { sel: 'section.tl [data-help="oeeReal"]', nome: 'OEE reportado e OEE real do turno', o: '<b>Reportado</b>: o oficial do turno. <b>Real</b>: soma ao planejado o tempo fora do turno em que a linha produziu para este turno.' },
      { sel: 'section.tl [data-hhps]:not([data-hhps=""])', nome: 'Hora a hora do turno', o: 'Abre o Hora a hora só deste turno. O número (ex.: 6/9) é quantos intervalos já têm produção lançada.' },
      { sel: '[data-abonoadd]', nome: 'Abonos', o: 'Tempo que não conta como perda (treinamento, reunião, ginástica laboral…), com os motivos do Portal.', como: 'Clique em + abono, escolha o motivo e os minutos.', ex: 'Reunião de segurança, 15 min.' },
      { sel: '[data-shoff]', nome: 'Turno sem produção', o: 'O turno estava previsto mas a linha não rodou por decisão (programado) ou por problema (não programado), com o motivo.', como: 'Marque e escolha o tipo e o motivo.', ex: 'Sem programação do PCP → programado: sai do tempo do OEE. Falta de material → não programado: conta como perda.' },
      { sel: '[data-turnonp]', nome: 'Habilitar turno não produtivo', o: 'Inclui neste dia um turno que o Portal marca como não produtivo (ex.: C em escala reduzida), quando ele rodou.', como: 'Use só no dia em que o turno trabalhou; o tempo inteiro dele vira planejado.' },
      { sel: '[data-closeps]', nome: 'Fechar turno', o: 'Confere o turno (produção, paradas, scrap) e congela as metas. Fechado, só reabre com motivo, que fica no histórico.' },
      { sel: '#dClose', nome: 'Fechar dia', o: 'Fecha todos os turnos e o dia. Erros da Validação impedem o fechamento.' }
    ],
    passos: [
      ['Fechar um turno', ['Confira o catálogo inicial e o responsável.', 'Abra o <b>Hora a hora</b> do turno e complete os intervalos sem produção (ou aceite a sugestão do MES).', 'Aponte as paradas que faltam (ícone + na linha do intervalo).', 'Informe o scrap do turno (ou o total diário) e o scrap de gel, se houver.', 'Veja a <b>Validação</b> no fim da tela: erros em vermelho precisam ser corrigidos.', 'Clique em <b>Fechar turno</b>.']],
      ['Lançou no dia errado', ['Clique em <b>Mover para outro dia</b> (ⓘ ao lado explica o que acontece com os dados).', 'Escolha a data certa e confirme: tudo vai para lá e este dia fica vazio.']],
      ['A linha não rodou o dia todo', ['Por decisão (feriado, inventário): <b>Marcar dia sem produção</b>.', 'Por problema (falta de material, quebra): marque os turnos como sem produção <b>não programado</b>, porque é perda de OEE.']]
    ],
    duvidas: [
      ['O "Cadastro rev" no topo ficou "desatualizada"', 'Outra página já leu uma versão mais nova do cadastro do Portal. Clique em ↻ Sincronizar ou recarregue (F5).'],
      ['Por que não consigo mudar turnos, catálogos e metas aqui?', 'Eles vêm do Portal (fonte única). Use "Editar no Portal".'],
      ['Restaurar intervalos ou Reaplicar metas apaga algo?', 'Não. Restaurar só funciona sem produção lançada; Reaplicar troca a meta, não a produção. O ⓘ de cada botão detalha.']
    ]
  },
  hourly: {
    titulo: 'Hora a hora',
    para: 'A grade de produção por intervalo de cada turno: meta, produção boa, diferença, catálogo e paradas. É a fonte dos números do dia. Com o CSV do servidor (MES) importado, a produção vem sugerida pelas caixas.',
    campos: [
      { sel: '[data-hhsel]', nome: 'Turno', o: 'Mostra só um turno ou todos. O número é quantos intervalos já têm produção lançada. O turno não produtivo (ex.: C) aparece com as caixas do MES.', ex: 'A 8/8 · B 3/9: faltam 6 intervalos do B.' },
      { sel: '[data-hhsel="dia"]', nome: 'Dia (24 h)', o: 'O dia de produção inteiro, hora por hora (do início do 1º turno até o mesmo horário do dia seguinte): turno, meta, apontado e caixas do MES. Horas sem turno mostram em qual turno a produção conta; a recebida de antes do início do dia aparece no topo. Só leitura.', ex: 'A linha começou às 04:00: 04:00–06:00 no topo, "conta no Turno A".' },
      { sel: 'tr.hh-fora', nome: 'Fora do turno (só leitura)', o: 'Horas do MES fora do horário do turno que contam nele (OEE reportado), antes ou depois das linhas do turno: catálogo, lote, caixas e produção.', ex: '04:00–05:00 fora do turno · 60 cx no Turno A (06:00–14:30).' },
      { sel: 'tr[data-hhgrp]', nome: 'Linha do turno', o: 'Clique para recolher ou expandir os intervalos do turno (fica lembrado neste computador).' },
      { sel: 'section.hh-np', nome: 'Turno não produtivo (só leitura)', o: 'As caixas do MES por hora na janela do turno não produtivo: catálogo, lote, caixas, produção e 1ª–última caixa. A produção conta no turno indicado em "contou em". Para lançar nele, use "Habilitar turno" no Lançamento.' },
      { sel: '[data-good]', nome: 'Produção boa do intervalo', o: 'Peças boas no intervalo, na unidade indicada no topo (mil ou número completo).', como: 'Digite e Enter (grava e desce). ↑↓ navegam, Esc desfaz.', ex: '61 (= 61.000 peças em "mil").' },
      { sel: '[data-ivcat]', nome: 'Catálogo do intervalo', o: 'Troca de catálogo a partir deste intervalo. A meta muda junto (PPH do catálogo).', como: 'Escolha só no intervalo em que a troca aconteceu; os seguintes herdam.' },
      { sel: '[data-addev]', nome: 'Apontar parada', o: 'Abre o formulário de parada do intervalo (código, duração, equipamento, observação).', como: 'Atalho Alt+P na linha selecionada.', ex: 'FME · 25 min · Tampadora · "troca de rolamento".' },
      { sel: '[data-note]', nome: 'Observação do intervalo', o: 'Texto curto sobre o intervalo (atalho Alt+O).' },
      { sel: '#hhExtra', nome: 'Hora extra / intervalo', o: 'Inclui tempo além do turno (hora extra) ou divide um intervalo.', ex: 'Hora extra das 22:47 às 23:30 no B.' },
      { sel: '#hhPause', nome: 'Pausa neste dia', o: 'Pausa planejada só neste dia (desconta do tempo planejado).', ex: 'Ginástica laboral extra de 10 min.' },
      { sel: '#hhMeta', nome: 'Detalhes da meta', o: 'Mostra as colunas de PPH, OEE meta, meta original e minutos descontados de cada intervalo.' }
    ],
    passos: [
      ['Lançar a produção do turno', ['Escolha o turno no seletor do topo.', 'Em cada intervalo, digite a produção boa e Enter.', 'Se a linha trocou de catálogo, escolha o catálogo no intervalo da troca.', 'Intervalo abaixo da meta: aponte a parada (Alt+P) com a duração.', 'Volte ao Lançamento para scrap e fechamento.']],
      ['Usar a sugestão do MES', ['Importe o CSV do servidor (Portal › Importação › Produção).', 'Os intervalos sem valor mostram a produção sugerida pelas caixas.', 'Confira e aceite; diferenças grandes aparecem na Validação.']]
    ],
    duvidas: [
      ['A primeira caixa do lote aparece antes do horário certo', 'Desde a 2.4.35, o catálogo e o lote registrados na preparação valem a partir da 1ª caixa. Dias importados antes: importe o período de novo.'],
      ['Performance acima de 100%', 'Pode acontecer quando o turno recebe a produção de um turno não produtivo (regra de continuidade). O alerta aparece no KPI.'],
      ['A linha produziu antes do 1º turno e não aparece', 'Desde a 2.4.52, essas horas aparecem no turno que recebe a produção (linhas "fora do turno") e no Dia (24 h). A regra de qual turno recebe vem de Configurações › Fora de turno (continuidade).']
    ]
  },
  plan: {
    titulo: 'Plano do mês',
    para: 'Quanto deve ser produzido no mês (por catálogo ou por família), e como a produção está acompanhando: ritmo, saldo, necessidade por dia e projeção. As ordens do PCP do mês ficam aqui ("Ordens (plano do mês)").',
    campos: [
      { sel: '#pmK', nome: 'Mês', o: 'Mês do plano. ‹ › andam um mês.' },
      { sel: '#plEdit', nome: 'Editar / Revisar plano', o: 'Muda as quantidades. Depois de o mês começar, cada mudança vira uma revisão (v2, v3…) e o plano inicial fica guardado.', ex: 'PCP aumentou 360057 em 500 mil no dia 15 → revisão v2.' },
      { sel: '#plNew', nome: 'Cadastrar plano', o: 'Cria o plano do mês (quando ainda não existe).', como: 'Quantidade por catálogo, ou só por família quando o PCP planeja assim.' },
      { sel: '#plCopy', nome: 'Copiar do mês anterior', o: 'Começa o plano com as quantidades do mês anterior, para ajustar.' },
      { sel: '.ordf', nome: 'Filtros das ordens', o: 'Busca (ordem, lote, catálogo), situação e período (hoje, ontem, semana, um dia). Clique no título de uma coluna para ordenar.' },
      { sel: '.kpis', nome: 'Indicadores do plano', o: '<b>Ritmo</b>: realizado ÷ o que o plano previa até hoje. <b>Necessidade por dia</b>: quanto falta ÷ dias restantes. <b>Projeção</b>: realizado + média recente × dias restantes.', ex: 'Ritmo 96% e necessidade 1,9 mi/dia → é preciso acelerar.' }
    ],
    passos: [['Começar o mês', ['Importe a planilha do PCP (aba CALC) em Portal › Importação, ou clique em Cadastrar plano.', 'Confira a tabela por família e catálogo.', 'Dias sem produção prevista (feriados) ficam no calendário do plano.']]],
    duvidas: [['Por que o realizado aqui difere do SAP?', 'Aqui é a produção apontada na Produção (hora a hora). O oficial do SAP está em Ordens › Ordens produzidas (MB51), com a Conciliação entre os dois.']]
  },
  ordens: {
    titulo: 'Ordens produzidas (SAP)',
    para: 'Produção oficial de cada ordem pelo SAP (MB51, movimentos 101/102), com a situação e as datas do COOIS. É o que o Waste usa para as perdas por ordem.',
    campos: [
      { sel: '.ord-sub', nome: 'Sub-abas', o: 'Ordens produzidas · Ordens (plano do mês) · Conciliação (SAP × apontado) · Histórico de competências · Importar (leva ao Portal › Importação).' },
      { sel: '#oQ', nome: 'Buscar', o: 'Filtra por ordem, catálogo, lote ou material.', ex: '100234567 ou 360057.' },
      { sel: '#oXls', nome: 'Excel', o: 'Exporta a lista filtrada.' }
    ],
    duvidas: [['A ordem não aparece', 'A lista do MB51 só tem as ordens do MB51 importado. Desde a 2.4.52, os lotes produzidos (MES) aparecem embaixo, com a ordem do plano e "não conciliado" até o MB51 da competência ser importado. Reimportar a mesma competência substitui (nunca soma).'], ['Ficha da ordem', 'O botão de ficha (ou Ctrl K) mostra a ordem em todas as páginas: Produção, Waste, Gel, Paradas e ações.']]
  },
  'ordens-conc': {
    titulo: 'Conciliação SAP × apontado',
    para: 'Compara, por ordem, o que o SAP diz que foi produzido (MB51) com o que foi apontado na Produção, e mostra a diferença e a situação. Serve para achar ordem sem apontamento ou apontamento sem ordem.',
    campos: [{ sel: '#ocQ', nome: 'Buscar', o: 'Filtra a conciliação.' }, { sel: '#ocSit', nome: 'Situação', o: 'Mostra só as divergentes, as aceitas ou todas.' }],
    passos: [['Tratar uma divergência', ['Abra a ordem e compare as quantidades.', 'Se o apontamento estiver certo e o SAP também (ex.: arredondamento), clique em <b>✓ Aceitar apurado</b>.', 'Se faltar apontamento, corrija o Hora a hora do dia; se o SAP estiver errado, avise o PCP.']]]
  },
  'ordens-imp': {
    titulo: 'Importar MB51 e COOIS',
    para: 'Importação do SAP em dois passos: 1 · MB51 (movimentos, oficial) e 2 · COOIS (situação e datas das ordens que o MB51 trouxe). A tela fica aberta com "Importar a próxima" depois de gravar.',
    campos: [
      { sel: '#oComp', nome: 'Competência', o: 'Mês civil da data de lançamento do MB51. Reimportar a mesma competência substitui.' },
      { sel: '#oPlanta', nome: 'Planta', o: 'Planta esperada (4017). Linhas de outra planta ficam fora e são contadas.' },
      { sel: '[data-osub="mb51"]', nome: '1 · MB51', o: 'Movimentos 101/102 da planta, com o layout salvo.' },
      { sel: '[data-osub="coois"]', nome: '2 · COOIS', o: 'Cabeçalhos das ordens que o MB51 trouxe.' },
      { sel: '#oTxt', nome: 'Colar', o: 'Cole a grade inteira com o cabeçalho, copiada do SAP.', como: 'No SAP: executar → selecionar tudo → copiar.' },
      { sel: '#oLer', nome: 'Ler colagem', o: 'Mostra a prévia (linhas, movimentos, ordens) antes de gravar.' },
      { sel: '#oGrava', nome: 'Gravar', o: 'Grava a competência. Antes de substituir, a anterior vai para o backup.' }
    ],
    passos: [['Importação do mês', ['MB51: escolha a competência, cole e clique em Ler colagem.', 'Confira a prévia e grave.', 'COOIS: cole as ordens listadas e grave.', 'Use "Importar a próxima" para outra competência.']]]
  },
  'ordens-hist': { titulo: 'Histórico de competências', para: 'Cada competência importada, com quem, quando, o arquivo e as versões substituídas.' },
  reports: {
    titulo: 'Relatórios',
    para: 'Relatórios prontos (passagem de turno, dia, semana, mês, paradas, plano, montado) e o tipo <b>Tabelas</b>, só com tabela e filtros. O que aparece na prévia é o que sai no PDF, no Excel, no texto e no Outlook.',
    campos: [
      { sel: '[data-rpt="tables"]', nome: 'Tabelas', o: 'Relatório só de tabela: por turno, dia, semana, mês, dia da semana, catálogo, família, hora a hora, paradas ou lotes do MES.', ex: 'Todos os sábados de outubro do catálogo 360057.' },
      { sel: '#rtMod', nome: 'Modelo', o: 'Escolhe o que cada linha da tabela é (um turno, um dia, um catálogo…).' },
      { sel: '[data-rtwd]', nome: 'Dias da semana', o: 'Marque só os dias que quer (nenhum marcado = todos).', ex: 'Só Sáb para a produção dos sábados.' },
      { sel: '#rtTurno', nome: 'Turno · Família · Catálogo', o: 'Filtros da tabela. O OEE do recorte é Σ produção boa ÷ Σ capacidade.' },
      { sel: '#rpXls', nome: 'Excel', o: 'Todas as linhas da tabela, prontas para filtrar no Excel.' }
    ]
  },
  overview: {
    titulo: 'Visão Geral',
    para: 'Resumo da produção no período: OEE, produção, paradas e tendências. "Visão Geral · padrão" é a montagem fixa; as outras visões (Meu painel, compartilhadas, Diretoria mensal) são montadas por você.',
    campos: [
      { sel: '#vgView', nome: 'Visão', o: 'Escolhe a montagem da tela.', ex: 'Diretoria mensal para a reunião do mês.' },
      { sel: 'section.vg-ind', nome: 'Indicadores do período', o: 'Os mesmos cartões do Lançamento somados no período (produção, OEE, D·P·Q, capacidade, meta, OEE reportado e real, fora de turno, caixas do MES), com a comparação com o período anterior.' },
      { sel: '#kcEditVg', nome: 'Editar cards', o: 'Liga e desliga os indicadores; a mesma escolha vale no Lançamento (neste computador).' },
      { sel: 'section.card > header .dobra', nome: 'Recolher / expandir', o: 'O ▾ no título de cada bloco recolhe o bloco (fica lembrado neste computador).' },
      { sel: '.filters .seg', nome: 'Período', o: 'Hoje, Ontem, Semana, Mês e os outros períodos rápidos, ou datas livres.' },
      { sel: '#vgPers', nome: 'Personalizar', o: 'Abre Meu painel em edição: indicadores do topo, blocos, ordem e largura. Para todos verem, salve como visão compartilhada.' },
      { sel: '#vgPrint', nome: 'Imprimir', o: 'Imprime a visão atual (sempre no tema claro, com todos os grupos abertos).' },
      { sel: '#vgTv', nome: 'Apresentar', o: 'Modo TV, para a tela da linha.' },
      { sel: '#vglLimpar', nome: 'Limpar', o: 'Volta o período para o mês atual e Máquina, Catálogo, Turno e Status para Todos. A Linha continua.' },
      { sel: '.vgl-oee', nome: 'Situação do período', o: 'OEE do período, meta vigente, desvio em pontos percentuais, estado em texto (Na meta, Abaixo da meta) e comparação com o período anterior.', ex: '61,50% · meta 70,00% · −8,50 p.p. · Abaixo da meta.' },
      { sel: '.vgl-perda', nome: 'Maior perda do período', o: 'A maior etapa da cascata de perdas e a parada que mais tirou tempo no Pareto, com atalho para investigar. Não deduz causa: a causa é confirmada nos eventos.' },
      { sel: '.vgl-dg', nome: 'Diagnóstico rápido', o: 'Melhor e pior dia pelo OEE (clique abre o dia) e a confiabilidade do apontamento (clique abre as pendências).' },
      { sel: '.vgl-grp .vgl-gh', nome: 'Grupos de análise', o: 'Os 13 gráficos agrupados por assunto (A a F). Clique no título do grupo para recolher ou abrir; fica lembrado neste computador. Na impressão saem todos abertos.' },
      { sel: '.vgl-exp', nome: 'Explorar dados', o: 'Atalhos para o último dia, Paradas, Pendências, Plano e ordens, Histórico e Relatórios.' }
    ],
    duvidas: [['O OEE do período é a média dos dias?', 'Não: é a soma dos tempos e das peças do período (sem média de médias).'],
      ['Por que aparece "1 dia no período" num gráfico?', 'Com um dia só não há tendência: o gráfico mostra o valor do dia contra a meta. Escolha um período maior para ver a evolução.'],
      ['Sumiu Produção boa de "Mais indicadores"?', 'Ela já está na grade de cima. Se você desligar o cartão em Editar cards, ela volta a aparecer em "Mais indicadores".']]
  },
  sqdcp: {
    titulo: 'SQDCP – Gestão Diária',
    para: 'Quadro da reunião diária: Segurança, Qualidade, Entrega, Custo e Pessoas (ou Produtividade), 5 posições por pilar. Cada posição vira uma folha A4 em paisagem. Os números vêm da Produção e dos exports do Waste, do Gel e de Iniciativas; nada é calculado à parte.',
    campos: [
      { sel: '#sqConfigurar', nome: 'Configurar SQDCP', o: 'Lista as 25 posições da linha; a engrenagem de cada uma abre a configuração (indicador, período, meta, sentido, modelo da folha).' },
      { sel: '#sqDia', nome: 'Data de referência', o: 'Dia dos indicadores. Período de cada posição (dia, 7 dias, mês) conta até esta data.', ex: 'Ontem, para a reunião da manhã.' },
      { sel: '#sqTurno', nome: 'Turno', o: 'Todos ou um turno. Fontes mensais (Waste) e posições atuais (Gel, ações) não mudam por turno.' },
      { sel: '#sqP', nome: 'Coluna P', o: 'Pessoas ou Produtividade (nome da 5ª coluna).' },
      { sel: '#sqFontes', nome: 'Atualizar fontes', o: 'Lê de novo o Waste, o Gel e Iniciativas. Os filtros escolhidos ficam como estão.' },
      { sel: '#sqCsv', nome: 'Exportar CSV', o: 'Segurança e QN por turno no mês da referência.' },
      { sel: '#sqReuniao', nome: 'Modo Reunião', o: 'Só o quadro, em tela cheia, com data, linha, turno e horário; botões S Q D C P ampliam um pilar. Esc ou Sair volta. Nada é gravado.' },
      { sel: '.sqdcp-resumo', nome: 'Resumo executivo', o: 'Um cartão por pilar com a 1ª posição configurada dele (o mesmo resultado do card). Sem dado: — e Não informado (nunca zero).' },
      { sel: '.sq-quadro', nome: 'Posições', o: 'Valor, meta e situação pelo sentido do indicador (verde dentro, vermelho fora, âmbar parcial, cinza não informado). Prévia / Imprimir abre a folha A4; a engrenagem configura.' }
    ],
    duvidas: [['Por que "Não informado" e não 0?', 'Ausência de resposta nunca é zero: o turno sem a pergunta de acidente/QN respondida ou o dia sem lançamento ficam como não informado.'],
      ['"Erro na fonte"?', 'A base do Waste, do Gel ou de Iniciativas não pôde ser lida (arquivo com problema ou sem exports). Use Tentar novamente; sem pasta conectada aparece só Não informado.']]
  }
};

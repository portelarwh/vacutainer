/* ===== UX-02 · guia por aba (vacGuia): editar aqui quando a tela mudar ===== */
'use strict';
window.VAC_GUIA = window.VAC_GUIA || {};
window.VAC_GUIA.linha = {
  mapa: { titulo: 'Visão da linha', para: 'Ver na planta onde a linha está perdendo tempo e o que está aberto em cada ponto (paradas, ordens de serviço e ações).',
    campos: [{ sel: '#fPer', nome: 'Período', o: 'Dias somados na planta e nos gráficos.' }, { sel: '#fOrdem', nome: 'Ordem · lote', o: 'Mostra só as paradas de uma ordem de produção (cada ordem tem um lote).' }, { sel: '.l3-cam', nome: 'Camada', o: 'O que o número e a cor de cada ponto mostram.', ex: 'Tempo parado' }, { sel: '#cZonas', nome: 'Áreas', o: 'Soma os pontos por área da linha.' }, { sel: '#ficha', nome: 'Ficha do ponto', o: 'Números do ponto clicado e atalhos para Paradas, Equipamentos e Iniciativas.' }],
    passos: ['Escolha o período e a camada.', 'Clique no ponto com o maior número.', 'Na ficha, abra as paradas do equipamento ou crie a ação.'],
    duvidas: [{ p: 'Por que um ponto está cinza?', r: 'Não houve registro no período, ou o ponto não tem equipamento do cadastro vinculado (Configuração).' }] },
  pessoas: { titulo: 'Pessoas e postos', para: 'Registrar quem ocupa cada posto (OP1, OP2, OP3) em cada turno.', campos: [{ sel: '#fPosto', nome: 'Posto', o: 'Pessoa por turno, área e ponto da planta.' }] },
  checklists: { titulo: 'Checklists', para: 'Verificações de rotina por ponto da planta; marcar o que foi feito no turno.', campos: [{ sel: '#ckTurno', nome: 'Turno', o: 'Turno em que a verificação é marcada.' }, { sel: '#fChk', nome: 'Cadastrar checklist', o: 'Com o padrão da área em mãos.' }] },
  config: { titulo: 'Configuração', para: 'Posição dos pontos e postos, equipamentos de cada ponto, áreas, pasta e base.', campos: [{ sel: '#cfEdit', nome: 'Editar posições', o: 'Arrastar pontos e postos na planta.' }, { sel: '#cfDes', nome: 'Redesenhar área', o: 'Clicar nos cantos da área na planta.' }] }
};

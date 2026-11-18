// Regressões de Paradas com dados fictícios, nas entradas normais de importação, validação e relatório.
const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const erros = [];
    page.on('pageerror', error => erros.push(error.message));
    page.on('dialog', dialog => dialog.accept());
    await page.clock.setFixedTime(new Date('2026-11-18T12:00:00'));
    await page.goto('file://' + path.resolve(__dirname, '../__modulos__/Paradas.html'));
    await page.waitForFunction(() => document.querySelector('#main')?.childElementCount > 0);

    await page.evaluate(() => {
      modoTeste();
      Store.data = vazio();
      Cad.build();
      document.querySelectorAll('.overlay').forEach(el => el.remove());
      localStorage.setItem('vac.user', 'Liderança fictícia');
      F.init();
      App.go('importar');
    });
    async function importar(nome, minutos) {
      const csv = `ID;Data da parada;Turno;Máquina;Código;Duração;Início;O que aconteceu\n10;2026-10-05;T1;EQ01 · Máquina fictícia;801 FME;${minutos};08:10;Falha fictícia\n`;
      await page.locator('#impF').setInputFiles({ name: nome, mimeType: 'text/csv', buffer: Buffer.from(csv) });
      await page.getByRole('button', { name: 'Importar 1 parada(s)', exact: true }).click();
      await page.waitForFunction(() => App.tab === 'geral');
      await page.evaluate(() => App.go('importar'));
    }

    await importar('original.csv', 30);
    await importar('correcao.csv', 45);
    assert.equal(await page.evaluate(() => Store.data.eventos[0].minutos), 45);
    await page.locator('[data-undo]').first().click();
    assert.equal(await page.evaluate(() => Store.data.eventos[0].minutos), 30);
    await importar('correcao.csv', 45);
    await importar('posterior.csv', 50);
    await page.locator('[data-undo]').nth(1).click();
    assert.equal(await page.evaluate(() => Store.data.eventos[0].minutos), 50);
    await page.locator('[data-undo]').first().click();
    assert.equal(await page.evaluate(() => Store.data.eventos[0].minutos), 30);
    console.log('ok · desfazer restaura a revisão anterior e preserva importações posteriores');

    await page.evaluate(() => {
      const primeiro = Store.data.eventos[0];
      Store.data.eventos.push({ ...primeiro, id: 't2', turno: 'T2' });
      F.turno = 'T1';
      App.go('valid');
    });
    await page.locator('#vaTab tbody tr').first().click();
    assert.equal(await page.locator('#vdTab tbody tr').count(), 2);
    await page.getByRole('button', { name: 'Validar dia', exact: true }).click();
    assert.equal(await page.evaluate(() => Store.data.validacao['2026-10-05'].n), 2);
    const estadoAlterado = await page.evaluate(() => {
      const evento = Store.data.eventos[1];
      Store.commit({k: 'list', c: 'eventos', items: [{ ...evento, minutos: 60 }]});
      return { estado: VIEWS.valid.dias[0].estado, exportados: calcExports(Store.data).eventos.map(e => e.validado) };
    });
    assert.deepEqual(estadoAlterado, { estado: 'revisao', exportados: [false, false] });
    console.log('ok · validação confere o dia inteiro e a alteração marca revisão necessária');

    const resultados = await page.evaluate(() => {
      const a = { id:'a', dia:'2026-10-05', turno:'T1', equipamento:'EQ01', codigo:'FME', minutos:90, ocorrencias:3, inicio:'08:09', origem:'forms' };
      Store.data = vazio();
      Store.data.eventos = [a];
      Store.data.tecnico.a = { esperaMin:70, reparoMin:20 };
      Ext.cad = { turnos: [
        { codigo:'T1', vigencias:[{ de:'2026-01-01', ate:'2026-10-31', inicio:'06:00', fim:'14:30', dias:[1,2,3,4,5] },{ de:'2026-11-01', inicio:'06:00', fim:'14:00', dias:[1,2,3,4,5] }] },
        { codigo:'T2', vigencias:[{ de:'2026-01-01', inicio:'14:30', fim:'22:30', dias:[1,2,3,4,5] }] }
      ] };
      const linhas = [
        { dia:a.dia, turno:'T1', minutosProgramados:500, fechado:true },
        { dia:a.dia, turno:'T2', minutosProgramados:480, fechado:true, semProducao:'não programado' }
      ];
      Ext.oee = { tempoProgramadoTurnos:linhas };
      const p = programado([a], a.dia, '2026-10-06', 'T1');
      const todos = programado([a], a.dia, a.dia);
      const s = statsEquip([a], a.dia, a.dia, 'T1')[0];
      Ext.oee = { porDiaTurno:[{dia:a.dia,turno:'T1'}] };
      const historico = programado([a], a.dia, a.dia, 'T1');
      const fora = { ...a, id:'depois', dia:'2026-10-06', ocorrencias:5 };
      Store.data.eventos.push(fora);
      Object.assign(F,{de:'2026-10-01',ate:a.dia,eq:'',turno:'T1',cls:'',grupo:''});
      App.go('recor');
      const rec = VIEWS.recor.R[0];
      const relRec = relParadas().blocos.at(-1).linhas;
      const c0 = {id:'primeira',dia:a.dia,turno:'T1',equipamento:a.equipamento,codigo:a.codigo,minutos:90,inicio:'08:00'};
      Ext.oee.paradasEventos = [c0,{ ...c0,id:'exata',inicio:'08:09' }];
      eventosTodos();
      const exata = EVENTO_OEE.get(a.id);
      Ext.oee.paradasEventos.push({ ...c0,id:'empate',inicio:'08:09' });
      eventosTodos();
      const empate = [EVENTO_OEE.has(a.id), EVENTO_OEE.pendentes.get(a.id).length];
      Cad.build();
      const codigos = Cad.codes.filter(c => classe({ id:'p', codigo:c.codigo, minutos:10 }) !== 'utilizacao'
        && !NAO_PERDA.has(classe({ id:'p', codigo:c.codigo, minutos:10 }))).slice(0,40);
      Store.data.eventos = codigos.map((c,i)=>({ ...a,id:'p'+i,minutos:10,ocorrencias:1,codigo:c.codigo }));
      const rel = relParadas();
      const svg = document.createElement('div');
      svg.innerHTML=rel.blocos[1].svg;
      App.go('pareto');
      const fimPareto = [...document.querySelectorAll('#pCh .pux-acum')].at(-1)?.textContent;
      return {
        cobertura:[p.min,p.cobertos,p.esperados,p.completa],
        tempoTodos:todos.min,
        historico:[historico.min,historico.fonte,historico.completa],
        indicadores:[s.n,s.nQ,s.mttr,s.espera.media,s.reparo.media],
        rec:[rec.n30,rec.min30,rec.ult,relRec[0][3]],
        exata,empate,acumulado:svg.querySelector('g:last-of-type .pux-acum')?.textContent,fimPareto,
      };
    });
    assert.deepEqual(resultados.cobertura, [1010,1,2,false]);
    assert.equal(resultados.tempoTodos, 980);
    assert.deepEqual(resultados.historico, [510,'estimado',false]);
    assert.deepEqual(resultados.indicadores, [3,1,90,70,20]);
    assert.deepEqual(resultados.rec, [3,90,'2026-10-05','3 · 90 min']);
    assert.equal(resultados.exata, 'exata');
    assert.deepEqual(resultados.empate, [false,3]);
    assert.match(resultados.acumulado, /30% acum/);
    assert.match(resultados.fimPareto, /63% acum/);
    console.log('ok · turno, vigência, cobertura, tempos técnicos, recorrência, Pareto e conciliação');

    const acompanhamento = await page.evaluate(() => {
      Store.data = vazio();
      const dia = '2026-10-10', de = addDays(dia,-30), ate = addDays(dia,30);
      const a = { id:'a', dia:addDays(dia,-2), turno:'T1', equipamento:'EQ01', codigo:'FME', minutos:20, ocorrencias:3 };
      Store.data.eventos = [a];
      Ext.cad = { turnos:[{codigo:'T1',vigencias:[{de:'2026-01-01',inicio:'06:00',fim:'07:00',dias:[0,1,2,3,4,5,6]}]}] };
      Store.data.importacoes = [{de,ate,erros:0}];
      Ext.oee = { tempoProgramadoTurnos:Array.from({length:61},(_,i)=>({dia:addDays(de,i),turno:'T1',minutosProgramados:60,fechado:true})) };
      Ext.inic = { acoes:[{id:'AC-TESTE',titulo:'Melhoria da máquina',origem:{tipo:'paradas',ref:'recor|EQ01|FME'},responsavel:'Pessoa teste',status:'concluída',prazo:dia,concluidaEm:dia,eficacia:'eficaz'}] };
      Object.assign(F,{de:addDays(dia,1),ate,eq:'',turno:'',cls:'',grupo:''});
      Cad.build();
      App.go('recor');
      const r=VIEWS.recor.A[0],html=document.querySelector('#rcT').textContent;
      const antes=r.comparacao.antes,depois=r.comparacao.depois;
      Ext.oee.tempoProgramadoTurnos.at(-1).fechado=false;
      const parcial=comparacaoEficacia(r,r.planner,Store.data.eventos,ate).depois;
      return { atual:r.n30,antes:antes.taxa,depois:depois.taxa,parcial:parcial.taxa,fechados:parcial.turnos,html };
    });
    assert.equal(acompanhamento.atual, 0);
    assert.equal(acompanhamento.antes, 18000/1780);
    assert.equal(acompanhamento.depois, 0);
    assert.equal(acompanhamento.parcial, null);
    assert.equal(acompanhamento.fechados, 29);
    assert.match(acompanhamento.html, /Melhoria da máquina.*Pessoa teste.*Eficaz/s);
    assert.deepEqual(erros, []);
    console.log('ok · ação continua visível sem novas falhas e a taxa exige cobertura das janelas');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error('FALHA ' + error.stack);
  process.exitCode = 1;
});

// Bloco 3b · G1: parâmetros que a Administração define (parada longa, semáforo, unidade, rótulo, arredondamento, motivos) são só leitura
// na Produção: não aparecem como campo editável, setSettings os recusa e o arquivo gravado não leva cópia deles. Dados fictícios.
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { server } = require('../../scripts/servidor-testes.cjs');
const { CADASTRO } = require('./prodcad-fixture.cjs');
const DERIV = ['abDefault', 'longStopMin', 'semaphore', 'abMotivos', 'offMotivosProg', 'offMotivosNP', 'entryUnit', 'unitLabel', 'roundingUnit', 'roundingVig', 'continuityMin', 'foraTurnoDesde'];

(async () => {
  const srv = server(); await new Promise((resolve, reject) => { srv.once('error', reject); srv.listen(0, '127.0.0.1', resolve); });
  const browser = await chromium.launch(require('./chromium.cjs')()), erros = [];
  try {
    const p = await (await browser.newContext({ timezoneId: 'America/Sao_Paulo' })).newPage();
    p.on('pageerror', e => erros.push(e.message)); p.on('dialog', d => d.accept());
    await p.goto('http://127.0.0.1:' + srv.address().port + '/__modulos__/OEE-Vacutainer.html');
    await p.waitForFunction(() => typeof Store !== 'undefined' && Store.S && Store.S.db && typeof ProdCad !== 'undefined', null, { timeout: 60000 });
    const r = await p.evaluate(async ([C, DERIV]) => {
      const out = {}, be = MemoryBackend(JSON.stringify(Model.emptyBase('t')));
      be.files.siblings = { 'vacutainer-cadastros.json': JSON.stringify(C) };
      await Store.connect(be); await Store.readCadastro();
      out.campos = Cfg.parametros.fields.map(f => f.k).filter(k => ['entryUnit', 'unitLabel', 'roundingUnit', 'semGreen', 'semYellow', 'longStopMin'].includes(k));
      out.recusa = DERIV.map(k => { try { Actions.setSettings({ [k]: db().settings[k] }); return null; } catch (e) { return /Administração/.test(e.message) ? 'recusou' : e.message; } }).every(x => x === 'recusou');
      Store.mutate(d => { d.settings.note = 'x'; }); await Store.flush();
      const g = JSON.parse(be.files.base); out.copia = DERIV.filter(k => k in (g.settings || {}));
      out.tagNoArquivo = !!(g.timeline && 'tagMap' in g.timeline);
      out.painel = Cfg.parametros.render().includes('data-vac-via-adm');
      /* G2–G5: unidade/setor/fuso e parâmetros de cálculo vêm de parametros.producao do cadastro; sem eles, nada é inventado */
      const C2 = JSON.parse(JSON.stringify(C)); C2.parametros = Object.assign({}, C2.parametros, { unidade: 'Unidade X', setor: 'Setor Y', fusoHorario: 'America/Manaus',
        producao: Object.assign({}, (C2.parametros || {}).producao, { perfModo: 1, perdaVelocidadePct: 7, coberturaMinPct: 85, divergenciaMaxPct: 4, fimTurnoMaxMin: 20, pendDias: 10, pendHoras: 12,
          servCaixaQtd: 500, servLacunaMin: 15, servTolHora: 3, servTrocaMaxMin: 120, horaExtraMaxMin: 45, diasPlano: [1, 2, 3, 4, 5], abonoPadrao: { 6: { min: 60, motivo: 'Almoço' }, 3: { min: 0 } }, qnProblemas: ['Tampa solta', ' ', 'Rótulo'] }) });
      C2.tagsMapa = [{ codigo: 'TG1', nome: 'Alarme', tag: 'alarme', equipamento: 'EQ01', ativo: true, vigencias: [{ de: '2026-01-01', ate: '2026-06-30', estado: 'parada', categoria: 'Falha', prioridade: 2 }, { de: '2026-07-01', ate: null, estado: 'bloq', categoria: 'Fluxo', prioridade: 3 }] }];
      out.tagMap = ProdCad.montar(C2).tagMap.map(x => [x.id, x.code, x.machineId, x.state, x.validTo, x.priority].join('|'));
      C2.paradas = (C2.paradas || []).concat([{ codigo: 'PVG', nome: 'Parada com vigência', descricao: 'Descrição do código', vigenciaDe: '2026-03-01', vigenciaAte: '2026-09-30', ativo: true }, { codigo: 'PSV', nome: 'Parada sem vigência', ativo: true }]);
      out.paradas = ProdCad.montar(C2).downtimeCodes.filter(x => /^(PVG|PSV)$/.test(x.code)).map(x => [x.code, x.description, x.validFrom, x.validTo].join('|'));
      const S2 = ProdCad.montar(C2).settings, S0 = ProdCad.montar(JSON.parse(JSON.stringify(C))).settings;
      out.derivados = [S2.unitName, S2.sector, S2.timezone, S2.perfMode, S2.speedLossPremise, S2.coverageMin, S2.divergenceMax, S2.tailMergeMax, S2.pendDaysBack, S2.openHoursAlert,
        S2.serverBoxQty, S2.serverGapMin, S2.serverHourTol, S2.serverSetupMax, S2.horaExtraMax, S2.planWorkdays.join(), S2.qnProblemas.join('|'), JSON.stringify(S2.abDefault)];
      out.semParam = ['perfMode', 'coverageMin', 'serverBoxQty', 'horaExtraMax', 'planWorkdays', 'qnProblemas', 'abDefault'].filter(k => k in S0);
      return out;
    }, [CADASTRO, DERIV]);
    assert.deepEqual(r.derivados, ['Unidade X', 'Setor Y', 'America/Manaus', 1, 0.07, 0.85, 0.04, 20, 10, 12, 500, 15, 3, 120, 45, '1,2,3,4,5', 'Tampa solta|Rótulo', '{"6":{"min":60,"motivo":"Almoço"}}'], 'ProdCad deriva os parâmetros do cadastro');
    assert.deepEqual(r.tagMap, ['tm_tg1_2026-01-01|ALARME|mac_eq01|parada|2026-06-30|2', 'tm_tg1_2026-07-01|ALARME|mac_eq01|bloq||3'], 'mapa de tags derivado do cadastro, uma linha por vigência');
    assert.deepEqual(r.paradas, ['PVG|Descrição do código|2026-03-01|2026-09-30', 'PSV||2025-01-01|null'.replace('|null', '|')], 'descrição e vigência do código de parada vêm do cadastro; sem elas, vale o que valia antes');
    assert.deepEqual(r.semParam, [], 'cadastro sem o parâmetro: o ProdCad não inventa valor');
    assert.deepEqual(r.campos, [], 'campos do cadastro não são editáveis na Produção');
    assert.equal(r.recusa, true, 'setSettings recusa chave definida na Administração');
    assert.deepEqual(r.copia, [], 'arquivo gravado sem cópia dos parâmetros do cadastro');
    assert.equal(r.tagNoArquivo, false, 'o arquivo gravado não leva o mapa de tags');
    assert.equal(r.painel, true, 'tela mostra os valores em somente leitura');
    assert.deepEqual(erros, []);
    console.log('ok parâmetros do cadastro só leitura na Produção; sem cópia no arquivo');
  } finally { await browser.close(); srv.close(); }
})().catch(e => { console.error(e.message || e); process.exitCode = 1; });

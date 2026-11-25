// Bloco 3b · G1: parâmetros que a Administração define (parada longa, semáforo, unidade, rótulo, arredondamento, motivos) são só leitura
// na Produção: não aparecem como campo editável, setSettings os recusa e o arquivo gravado não leva cópia deles. Dados fictícios.
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { server } = require('../../scripts/servidor-testes.cjs');
const { CADASTRO } = require('./prodcad-fixture.cjs');
const DERIV = ['longStopMin', 'semaphore', 'abMotivos', 'offMotivosProg', 'offMotivosNP', 'entryUnit', 'unitLabel', 'roundingUnit', 'roundingVig', 'continuityMin', 'foraTurnoDesde'];

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
      out.painel = Cfg.parametros.render().includes('data-vac-via-adm');
      /* G2–G5: unidade/setor/fuso e parâmetros de cálculo vêm de parametros.producao do cadastro; sem eles, nada é inventado */
      const C2 = JSON.parse(JSON.stringify(C)); C2.parametros = Object.assign({}, C2.parametros, { unidade: 'Unidade X', setor: 'Setor Y', fusoHorario: 'America/Manaus',
        producao: Object.assign({}, (C2.parametros || {}).producao, { perfModo: 1, perdaVelocidadePct: 7, coberturaMinPct: 85, divergenciaMaxPct: 4, fimTurnoMaxMin: 20, pendDias: 10, pendHoras: 12,
          servCaixaQtd: 500, servLacunaMin: 15, servTolHora: 3, servTrocaMaxMin: 120, horaExtraMaxMin: 45, diasPlano: [1, 2, 3, 4, 5], qnProblemas: ['Tampa solta', ' ', 'Rótulo'] }) });
      const S2 = ProdCad.montar(C2).settings, S0 = ProdCad.montar(JSON.parse(JSON.stringify(C))).settings;
      out.derivados = [S2.unitName, S2.sector, S2.timezone, S2.perfMode, S2.speedLossPremise, S2.coverageMin, S2.divergenceMax, S2.tailMergeMax, S2.pendDaysBack, S2.openHoursAlert,
        S2.serverBoxQty, S2.serverGapMin, S2.serverHourTol, S2.serverSetupMax, S2.horaExtraMax, S2.planWorkdays.join(), S2.qnProblemas.join('|')];
      out.semParam = ['perfMode', 'coverageMin', 'serverBoxQty', 'horaExtraMax', 'planWorkdays', 'qnProblemas'].filter(k => k in S0);
      return out;
    }, [CADASTRO, DERIV]);
    assert.deepEqual(r.derivados, ['Unidade X', 'Setor Y', 'America/Manaus', 1, 0.07, 0.85, 0.04, 20, 10, 12, 500, 15, 3, 120, 45, '1,2,3,4,5', 'Tampa solta|Rótulo'], 'ProdCad deriva os parâmetros do cadastro');
    assert.deepEqual(r.semParam, [], 'cadastro sem o parâmetro: o ProdCad não inventa valor');
    assert.deepEqual(r.campos, [], 'campos do cadastro não são editáveis na Produção');
    assert.equal(r.recusa, true, 'setSettings recusa chave definida na Administração');
    assert.deepEqual(r.copia, [], 'arquivo gravado sem cópia dos parâmetros do cadastro');
    assert.equal(r.painel, true, 'tela mostra os valores em somente leitura');
    assert.deepEqual(erros, []);
    console.log('ok parâmetros do cadastro só leitura na Produção; sem cópia no arquivo');
  } finally { await browser.close(); srv.close(); }
})().catch(e => { console.error(e.message || e); process.exitCode = 1; });

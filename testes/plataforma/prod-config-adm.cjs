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
      return out;
    }, [CADASTRO, DERIV]);
    assert.deepEqual(r.campos, [], 'campos do cadastro não são editáveis na Produção');
    assert.equal(r.recusa, true, 'setSettings recusa chave definida na Administração');
    assert.deepEqual(r.copia, [], 'arquivo gravado sem cópia dos parâmetros do cadastro');
    assert.equal(r.painel, true, 'tela mostra os valores em somente leitura');
    assert.deepEqual(erros, []);
    console.log('ok parâmetros do cadastro só leitura na Produção; sem cópia no arquivo');
  } finally { await browser.close(); srv.close(); }
})().catch(e => { console.error(e.message || e); process.exitCode = 1; });

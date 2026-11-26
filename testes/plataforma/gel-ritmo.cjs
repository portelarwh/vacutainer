// Gel: ritmo e indicador de scrap vêm da Administração (Parâmetros › Gel), sem padrão escondido no Gel (26/11/2026). Demonstração, dados fictícios.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const page = await browser.newPage({ viewport: { width: 1500, height: 950 } }), erros = [];
    page.on('pageerror', e => erros.push(e.message)); page.on('dialog', d => d.accept());
    await page.clock.setFixedTime(new Date('2026-11-19T10:00:00'));
    await page.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1#/portal');
    const f = await (await page.locator('iframe[title="Módulo Administração"]').elementHandle({ timeout: 60000 })).contentFrame();
    await f.waitForFunction(() => typeof Cad !== 'undefined' && Cad.D && typeof gelParHtml === 'function');
    // tela: campos de ritmo e indicador no formulário do gel; valor inválido recusado; válido grava em parametros.gel
    const r = await f.evaluate(async () => {
      ParGel.W = null; const P = Cad.D.parametros, box = document.createElement('div'); box.id = 'tmp'; document.body.appendChild(box);
      box.innerHTML = gelParHtml(P, true); wireGelPar(P, true);
      const campos = ['ritmo.meta', 'ritmo.nominal', 'ritmo.avgDays', 'ritmo.maxRate', 'ritmo.oeeMeta', 'scrapBase'].map(k => !!box.querySelector('[data-pg="' + k + '"]'));
      const set = (k, v) => { const el = box.querySelector('[data-pg="' + k + '"]'); el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); };
      set('ritmo.avgDays', '2,5'); document.querySelector('#gpOk').click(); await new Promise(r => setTimeout(r, 200));
      const recusou = !(Cad.D.parametros.gel || {}).ritmo;
      set('ritmo.avgDays', '7'); set('ritmo.meta', '850000'); set('ritmo.maxRate', '60000'); set('scrapBase', '50'); document.querySelector('#gpOk').click();
      for (let i = 0; i < 30 && !((Cad.D.parametros.gel || {}).ritmo); i++) await new Promise(r => setTimeout(r, 200));
      return { campos, recusou, ritmo: (Cad.D.parametros.gel || {}).ritmo, scrapBase: (Cad.D.parametros.gel || {}).scrapBase };
    });
    assert.deepEqual(r.campos, [true, true, true, true, true, true]); assert.equal(r.recusou, true, 'dias na média fracionário é recusado');
    assert.deepEqual(r.ritmo, { meta: 850000, avgDays: 7, maxRate: 60000 }); assert.equal(r.scrapBase, 50);
    console.log('ok Administração › Parâmetros › Gel: ritmo e indicador de scrap gravam em parametros.gel (inválido recusado)');
    // a Gestão de Gel lê do cadastro
    await page.evaluate(() => { location.hash = '#/gel'; });
    const g = await (await page.locator('iframe[title="Módulo Gestão de Gel"]').elementHandle({ timeout: 60000 })).contentFrame();
    await g.waitForFunction(() => typeof pcpPar === 'function' && typeof relK === 'function');
    let lido = null;
    for (let i = 0; i < 40; i++) { lido = await g.evaluate(() => ({ p: pcpPar(), k: relK(), cad: !!vacCad() })); if (lido.p.meta === 850000) break; await page.waitForTimeout(250); }
    assert.deepEqual([lido.p.meta, lido.p.nominal, lido.p.avgDays, lido.p.maxRate, lido.k], [850000, 1200000, 7, 60000, 50], 'o Gel usa o cadastro e, no que falta, o padrão do cálculo: ' + JSON.stringify(lido));
    console.log('ok Gestão de Gel lê o ritmo e o indicador de scrap da Administração (o que não foi cadastrado usa o padrão do cálculo)');
    assert.deepEqual(erros, [], 'sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });

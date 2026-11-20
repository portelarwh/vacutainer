// Plataforma 1.8.6 (Linha 360° 1.3.0) · o Piloto de consulta foi incorporado à ficha do ponto da Visão da linha e retirado.
// A ficha ganha, do piloto: checklists previstos agora, pessoas do posto por turno, fontes de cada número e a etiqueta do
// recorte de tempo de cada bloco (no período · agora · cadastro). O link antigo do piloto abre a Visão da linha. Dados fictícios.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }), erros = [];
    page.on('pageerror', e => erros.push(e.message));
    const base = 'http://127.0.0.1:' + srv.address().port + '/?demo=1';
    const frame = async () => { const el = page.locator('iframe[title="Módulo Linha 360°"]'); await el.waitFor(); const f = await (await el.elementHandle()).contentFrame(); await f.waitForSelector('#ficha'); return f; };

    // 1) a ficha do ponto traz os blocos do piloto, cada um com o seu recorte
    await page.goto(base + '#/linha'); let f = await frame();
    await f.locator('[data-pin="2"]').first().click(); await f.waitForTimeout(400);
    const t = await f.evaluate(() => ({ abas: [...document.querySelectorAll('#nav [data-t]')].map(b => b.dataset.t), ck: document.querySelector('#fCk h4')?.textContent || '', pes: document.querySelector('#fPes h4')?.textContent || '',
      fontes: [...document.querySelectorAll('#fFontes [data-fonte]')].map(li => li.dataset.fonte), rc: [...document.querySelectorAll('#ficha h4 .l3-rc')].map(x => x.textContent) }));
    assert.deepEqual(t.abas, ['mapa', 'pessoas', 'checklists', 'form', 'config'], 'abas da página sem o piloto (1.4.0: com Formulários)');
    assert.match(t.ck, /previstos agora/); assert.match(t.pes, /cadastro · por turno/);
    assert.deepEqual(t.fontes, ['par', 'equip', 'inic', 'oee'], 'fontes de cada número');
    assert.ok(t.rc.some(x => /^no período/.test(x)) && t.rc.some(x => /^agora/.test(x)), 'recorte de tempo nos blocos: ' + JSON.stringify(t.rc));
    console.log('ok ficha do ponto: checklists de agora, pessoas do posto, fontes e recorte de cada bloco');

    // 2) checklists e pessoas de um ponto que tem posto e checklist
    const comDados = await f.evaluate(() => { const p = pontos().find(x => chkAtivos().some(c => c.ponto === x.id) || postos().some(y => y.ponto === x.id)); return p ? p.id : null; });
    if (comDados) {
      await f.evaluate(id => { App.sel = id; render(); }, comDados);
      const d = await f.evaluate(() => ({ ck: document.querySelectorAll('#fCk li').length, pes: document.querySelectorAll('#fPes li').length, nT: turnos().length }));
      assert.ok(d.ck > 0 || d.pes > 0, 'ponto ' + comDados + ' mostra checklist ou posto');
      if (d.pes) assert.equal(d.pes % d.nT, 0, 'uma linha por turno em cada posto');
      console.log('ok ponto ' + comDados + ': ' + d.ck + ' checklist(s) e ' + d.pes + ' linha(s) de pessoas por turno');
    }

    // 3) página de origem não lida: a fonte diz "sem dados", nunca zero
    const sd = await f.evaluate(() => { const g = Ext.par; Ext.par = null; render(); const s = document.querySelector('#fFontes [data-fonte="par"]').textContent; Ext.par = g; render(); return s; });
    assert.match(sd, /sem dados/); console.log('ok fonte não lida aparece como "sem dados"');

    // 4) o link antigo do piloto abre a Visão da linha
    await page.goto(base + '#/linha?tab=piloto'); f = await frame();
    assert.equal(await f.evaluate(() => App.tab), 'mapa'); assert.equal(await f.locator('#piloto').count(), 0);
    assert.equal(await f.locator('#nav [data-t="mapa"].on').count(), 1, 'aba Visão da linha marcada');
    console.log('ok link antigo do piloto abre a Visão da linha');

    assert.deepEqual(erros, [], 'sem erro de JavaScript'); console.log('ok linha 1.3.0: sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

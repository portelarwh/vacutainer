// Plataforma 1.8.24 (Produção 2.6.17) · SRV-DIA: dia sem lançamento que tem produção nos dados importados do servidor (MES) mostra o aviso
// (peças, caixas, horário e lotes) e "Abrir o dia com os dados do servidor", que cria o lançamento e leva ao cartão "Produção registrada no
// servidor". Dia sem dados do servidor não mostra aviso. Dados fictícios (demonstração; o lançamento do dia é apagado só na memória da página).
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }), erros = [];
    page.on('pageerror', e => erros.push(e.message)); page.on('dialog', d => d.accept('teste'));
    await page.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1');
    await page.getByRole('heading', { name: 'Visão da linha' }).waitFor();
    await page.evaluate(() => { location.hash = '#/oee?tab=launch'; });
    const o = await (await page.locator('iframe[title="Módulo Produção"]').elementHandle()).contentFrame(); await o.waitForFunction(() => window.vacPagina?.pronto());

    // 1) o dia da demonstração tem caixas do servidor; sem o lançamento, o Lançamento mostra o aviso com peças, caixas, horário e lote
    const r1 = await o.evaluate(async () => { const d = db().productionDays.find(x => !x.deleted && (db().server.segments || []).some(s => s.t0.slice(0, 10) === x.date)); if (!d) return { semDia: true };
      Actions.deleteDay(d.id, 'teste'); App.sel.date = d.date; go('launch'); render(); await new Promise(r => setTimeout(r, 400));
      const b = document.querySelector('#srvTem'); return { data: d.date, aviso: b ? b.textContent.replace(/\s+/g, ' ') : '', botao: !!document.querySelector('#srvAbrir'), criar: !!document.querySelector('#mkDay') }; });
    assert.ok(!r1.semDia, 'dia com dados do servidor na demonstração');
    assert.match(r1.aviso, /Há produção no servidor para \d\d\/\d\d\/\d{4}: [\d.,]+ \S+ \(881 caixas\) entre \d\d:\d\d e \d\d:\d\d · lote 6275187/, r1.aviso);
    assert.ok(r1.botao && r1.criar, 'botão do aviso e o Criar lançamento de sempre');
    console.log('ok dia sem lançamento com produção do servidor: aviso com caixas, horário e lote');

    // 2) "Abrir o dia com os dados do servidor": cria o lançamento e mostra o cartão do servidor
    await o.click('#srvAbrir'); await page.waitForTimeout(1200);
    const r2 = await o.evaluate(dt => ({ dia: !!db().productionDays.find(x => !x.deleted && x.date === dt), cartao: !!document.querySelector('#srvCard'), aviso: !!document.querySelector('#srvTem') }), r1.data);
    assert.deepEqual(r2, { dia: true, cartao: true, aviso: false });
    console.log('ok "Abrir o dia com os dados do servidor" cria o lançamento e leva ao cartão "Produção registrada no servidor"');

    // 3) dia sem dados do servidor: sem aviso
    const r3 = await o.evaluate(async dt => { const d = new Date(dt + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + 30); App.sel.date = d.toISOString().slice(0, 10); render(); await new Promise(r => setTimeout(r, 300));
      return { aviso: !!document.querySelector('#srvTem') }; }, r1.data);
    assert.deepEqual(r3, { aviso: false });
    console.log('ok dia sem dados do servidor: sem aviso');

    assert.deepEqual(erros, [], 'sem erro de JavaScript'); console.log('ok aviso de dados do servidor: sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

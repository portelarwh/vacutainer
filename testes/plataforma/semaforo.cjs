// Plataforma 1.8.2 · indicadores com meta seguem o semáforo de três cores da Administração (verde, atenção, vermelho).
// Demonstração: dados fictícios. SQDCP fica fora (verde/vermelho por contrato) e o Gel mantém a regra própria de dosagem × BOM.
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
    await page.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1');
    await page.getByRole('heading', { name: 'Visão da linha' }).waitFor(); await page.waitForTimeout(800);

    // Visão da linha: cartão de OEE e gráfico por turno
    const vl = await page.evaluate(() => ({
      oee: [...document.querySelectorAll('.metric')].find(m => /OEE publicado/.test(m.textContent))?.className || '',
      legenda: [...document.querySelectorAll('.chart-legend span')].map(s => s.textContent),
      fills: [...document.querySelectorAll('svg.bar-chart rect')].map(r => r.getAttribute('fill')).filter(f => f && f !== 'transparent'),
    }));
    assert.match(vl.oee, /\b(positive|attention|negative)\b/, 'cartão de OEE com tom do semáforo');
    assert.deepEqual(vl.legenda.slice(0, 3), ['Na meta', 'Atenção', 'Abaixo da meta'], 'legenda com as três cores');
    assert.ok(vl.fills.every(f => /green|amber|red|chart-primary/.test(f)), 'barras pintadas pelo semáforo ' + JSON.stringify(vl.fills));
    console.log('ok semáforo Visão da linha: cartão ' + vl.oee.replace('metric ', '') + ', legenda verde/atenção/vermelho');

    // Produção: motor de gráficos e números dos cartões
    await page.evaluate(() => { location.hash = '#/oee?tab=hourly'; });
    const el = page.locator('iframe[title="Módulo Produção"]'); await el.waitFor();
    const f = await (await el.elementHandle()).contentFrame(); await f.waitForFunction(() => window.vacPagina?.pronto());
    const g = await f.evaluate(() => {
      const st = db().settings.semaphore || { green: 1, yellow: 0.9 };
      const svg = Charts.combo({ x: ['a', 'b', 'c', 'd'], bars: [{ name: 'Produção', values: [100, 95, 80, 110], meta: [100, 100, 100, 100], color: 'var(--s1)' }], height: 200 });
      const lower = Charts.combo({ x: ['a', 'b', 'c'], bars: [{ name: 'Custo', lowerBetter: true, values: [90, 105, 150], meta: [100, 100, 100], color: 'var(--s1)' }], height: 200 });
      const cores = h => { const d = document.createElement('div'); d.innerHTML = h; return [...d.querySelectorAll('[fill^="var(--ok"],[fill^="var(--warn"],[fill^="var(--crit"]')].map(r => r.getAttribute('fill').replace(/var\(--([a-z]+).*/, '$1')); };
      return { st, maior: cores(svg), menor: cores(lower), legenda: /atenção/.test(svg), belowCls: [belowCls('<span class="sem warn">'), belowCls('<span class="sem crit">'), belowCls('<span class="sem ok">')] };
    });
    assert.equal(g.st.yellow, 0.9);
    assert.deepEqual(g.maior, ['ok', 'warn', 'crit', 'ok'], 'maior é melhor: 100% verde, 95% atenção, 80% vermelho, 110% verde');
    assert.deepEqual(g.menor, ['ok', 'warn', 'crit'], 'menor é melhor: 90 verde, 105 atenção, 150 vermelho (meta 100)');
    assert.ok(g.legenda, 'legenda do gráfico com atenção');
    assert.deepEqual(g.belowCls, [' below bw', ' below', ''], 'número do cartão: amarelo na atenção, vermelho abaixo');
    const telaHH = await f.evaluate(() => [...document.querySelectorAll('svg [fill]')].map(r => r.getAttribute('fill') || '').filter(x => /var\(--(ok|warn|crit)/.test(x)).length);
    assert.ok(telaHH > 0, 'gráfico do hora a hora pinta pelo semáforo');
    console.log('ok semáforo Produção: gráficos (maior e menor é melhor), legenda e número dos cartões');

    assert.deepEqual(erros, [], 'sem erro de JavaScript');
    console.log('ok semáforo: sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

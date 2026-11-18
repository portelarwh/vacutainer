// Plataforma 1.8.16 (Waste 1.12.17) · KKBC-02: a lista da KKBC_ORD não traz data; a competência de cada ordem é amarrada à Produção
// (MB51 › Plano do mês › mês da tela). Com o mês da tela errado, a ordem que a Produção conhece entra na competência certa e a
// prévia avisa; a ordem sem MB51 nem plano fica no mês da tela; "Usar o mês da tela" força o mês da tela. Dados fictícios
// (demonstração: ordem 100234567 em 11/2026 no MB51; a amostra de lista é fictícia).
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
const amostra = fs.readFileSync(path.resolve(__dirname, '../amostras/kkbc_lista_grupos.txt'), 'utf8');
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }), erros = [];
    page.on('pageerror', e => erros.push(e.message)); page.on('dialog', d => d.accept('Pessoa de teste'));
    await page.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1');
    await page.getByRole('heading', { name: 'Visão da linha' }).waitFor();
    await page.evaluate(() => { location.hash = '#/perdas'; });
    const f = await (await page.locator('iframe[title="Módulo Waste"]').elementHandle()).contentFrame(); await f.waitForFunction(() => typeof B !== 'undefined' && B);
    await f.waitForFunction(() => ORDX.idx && OEE.src, null, { timeout: 15000 });
    const comp = await f.evaluate(() => [...ORDX.idx.get('100234567').comps]);
    assert.deepEqual(comp, ['2026-11'], 'demonstração: ordem 100234567 em 11/2026 no MB51');

    // 1) regra pura
    const r = await f.evaluate(() => ({ certo: compDaOrdem('100234567', '2026-11'), errado: compDaOrdem('100234567', '2026-12'), sem: compDaOrdem('999999999', '2026-12') }));
    assert.equal(r.certo.per, '2026-11'); assert.equal(r.certo.ok, true);
    assert.equal(r.errado.per, '2026-11'); assert.equal(r.errado.ok, false); assert.equal(r.errado.fonte, 'MB51');
    assert.equal(r.sem.per, '2026-12'); assert.equal(r.sem.sem, true);
    console.log('ok regra: tela certa mantém; tela errada vira 11/2026 pelo MB51; sem MB51/plano fica a tela');

    // 2) prévia da lista colada com o mês da tela errado (12/2026)
    const lista = amostra.replace(/114562781/g, '100234567');
    await f.evaluate(() => { const b = [...document.querySelectorAll('[data-tab],button')].find(x => /Importar/.test(x.textContent) && x.offsetParent); if (b) b.click(); });
    await page.waitForTimeout(500);
    await f.evaluate(([t, p]) => { document.querySelector('#impPer').value = p; document.querySelector('#impTxt').value = t; interpretPaste(); }, [lista, '2026-12']);
    await page.waitForTimeout(500);
    const pv = await f.evaluate(() => ({ per: [...new Set(IMP.R.recs.map(x => x.per))], txt: document.querySelector('#impPrev').textContent.replace(/\s+/g, ' ') }));
    assert.deepEqual(pv.per, ['2026-11'], 'itens na competência do MB51');
    assert.match(pv.txt, /competência ajustada pela Produção/); assert.match(pv.txt, /a tela dizia dez\/2026|a tela dizia 12\/2026|a tela dizia/);
    console.log('ok prévia: mês da tela errado (12/2026) → itens em 11/2026, com o aviso de competência ajustada');

    // 3) "Usar o mês da tela" força o mês da tela
    await f.evaluate(() => { const c = document.querySelector('#compTela'); c.checked = true; c.dispatchEvent(new Event('change')); }); await page.waitForTimeout(400);
    assert.deepEqual(await f.evaluate(() => [...new Set(IMP.R.recs.map(x => x.per))]), ['2026-12'], 'forçado: mês da tela');
    await f.evaluate(() => { const c = document.querySelector('#compTela'); c.checked = false; c.dispatchEvent(new Event('change')); }); await page.waitForTimeout(400);
    assert.deepEqual(await f.evaluate(() => [...new Set(IMP.R.recs.map(x => x.per))]), ['2026-11']);
    console.log('ok "Usar o mês da tela para todas as ordens" força 12/2026; desmarcado volta a 11/2026');

    // 4) ordem que a Produção não conhece: entra no mês da tela, com o aviso
    await f.evaluate(([t, p]) => { document.querySelector('#impPer').value = p; document.querySelector('#impTxt').value = t; interpretPaste(); }, [amostra, '2026-12']);
    await page.waitForTimeout(500);
    const pv2 = await f.evaluate(() => ({ per: [...new Set(IMP.R.recs.map(x => x.per))], txt: document.querySelector('#impPrev').textContent.replace(/\s+/g, ' ') }));
    assert.deepEqual(pv2.per, ['2026-12']); assert.match(pv2.txt, /sem MB51 e sem Plano do mês/);
    console.log('ok ordem sem MB51 nem plano: mês da tela, com o aviso');

    assert.deepEqual(erros, [], 'sem erro de JavaScript'); console.log('ok competência do KKBC: sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

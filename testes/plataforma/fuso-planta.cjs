// A04 (auditoria de 26/11/2026, autorizado pelo responsável): "hoje" e o relógio dos turnos seguem o fuso da planta (parametros.fusoHorario);
// sem ele, ou com fuso inválido, o fuso do navegador. Navegador em America/Sao_Paulo, relógio fixo em 09/11/2026 02:30 UTC
// (= 08/11 23:30 em São Paulo e 09/11 11:30 em Tóquio). Demonstração, dados fictícios.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const ctx = await browser.newContext({ timezoneId: 'America/Sao_Paulo', viewport: { width: 1440, height: 900 } }), p = await ctx.newPage(), erros = [];
    p.on('pageerror', e => erros.push(e.message)); await p.clock.setFixedTime(new Date('2026-11-09T02:30:00Z'));
    await p.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1#/oee?tab=launch');
    const q = p.locator('iframe[title="Módulo Produção"]'); await q.contentFrame().locator('body').waitFor({ state: 'attached', timeout: 30000 });
    const f = await (await q.elementHandle()).contentFrame(); await f.waitForFunction(() => window.vacPagina?.pronto() && typeof U !== 'undefined' && typeof vacAgora === 'function', null, { timeout: 30000 });
    const r = await f.evaluate(() => { const orig = vacCad.param, pega = tz => { vacCad.param = k => k === 'fusoHorario' ? tz : orig(k); return { hoje: U.today(), vacHoje: vacHoje(), h: U.agora().getHours(), m: U.agora().getMinutes(), min: opNowMin(U.today()) }; };
      const out = { navegador: (vacCad.param = k => k === 'fusoHorario' ? '' : orig(k), U.today()), toquio: pega('Asia/Tokyo'), saoPaulo: pega('America/Sao_Paulo'), invalido: pega('Marte/Fobos'), honolulu: pega('Pacific/Honolulu') }; vacCad.param = orig; return out; });
    assert.equal(r.navegador, '2026-11-08', 'sem fuso cadastrado vale o do navegador (São Paulo: 08/11 23:30)');
    assert.deepEqual([r.toquio.hoje, r.toquio.vacHoje, r.toquio.h, r.toquio.m, r.toquio.min], ['2026-11-09', '2026-11-09', 11, 30, 690], 'Tóquio: 09/11 11:30');
    assert.deepEqual([r.saoPaulo.hoje, r.saoPaulo.h, r.saoPaulo.m], ['2026-11-08', 23, 30], 'São Paulo: 08/11 23:30');
    assert.deepEqual([r.invalido.hoje, r.invalido.h], ['2026-11-08', 23], 'fuso inválido cai no do navegador');
    assert.deepEqual([r.honolulu.hoje, r.honolulu.h], ['2026-11-08', 16], 'Honolulu: 08/11 16:30');
    // as outras páginas leem o mesmo "hoje"
    await p.evaluate(() => { location.hash = '#/gel'; });
    const g = await (await p.locator('iframe[title="Módulo Gestão de Gel"]').elementHandle({ timeout: 60000 })).contentFrame();
    await g.waitForFunction(() => typeof todayISO === 'function' && typeof vacHoje === 'function', null, { timeout: 30000 });
    const gl = await g.evaluate(() => { const orig = vacCad.param; vacCad.param = k => k === 'fusoHorario' ? 'Asia/Tokyo' : orig(k); const x = { gel: todayISO(), vacHoje: vacHoje() }; vacCad.param = orig; return x; });
    assert.deepEqual(gl, { gel: '2026-11-09', vacHoje: '2026-11-09' }, 'o Gel usa o mesmo hoje da planta');
    // P2 do Codex: lacuna de horário de verão do navegador não desloca a hora da planta (navegador New_York, planta UTC, 08/03/2026 02:30 UTC)
    const ctx2 = await browser.newContext({ timezoneId: 'America/New_York', viewport: { width: 1440, height: 900 } }), p2 = await ctx2.newPage();
    await p2.clock.setFixedTime(new Date('2026-03-08T02:30:00Z')); await p2.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1#/oee?tab=launch');
    const q2 = p2.locator('iframe[title="Módulo Produção"]'); await q2.contentFrame().locator('body').waitFor({ state: 'attached', timeout: 30000 });
    const f2 = await (await q2.elementHandle()).contentFrame(); await f2.waitForFunction(() => window.vacPagina?.pronto() && typeof U !== 'undefined' && typeof vacAgora === 'function', null, { timeout: 30000 });
    const dst = await f2.evaluate(() => { const orig = vacCad.param; vacCad.param = k => k === 'fusoHorario' ? 'UTC' : orig(k); const n = U.agora(); const x = { h: n.getHours(), m: n.getMinutes(), hoje: U.today() }; vacCad.param = orig; return x; });
    assert.deepEqual(dst, { h: 2, m: 30, hoje: '2026-03-08' }, 'planta UTC 02:30 não vira 03:30 pela lacuna do navegador');
    assert.deepEqual(erros, [], 'sem erro de JavaScript');
    console.log('ok fuso da planta: hoje e relógio seguem parametros.fusoHorario; sem ele ou inválido, o do navegador; o Gel acompanha');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });

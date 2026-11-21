// LANC-03 (itens 3, 5 e 6, etapa d) · pílulas de Lançamento (Hora a hora / Por turno) e de Scrap (Por turno / Diário), hora extra por turno.
// Trocar de modo pede confirmação e não apaga nada: o que é do outro modo fica guardado e só deixa de contar. Nenhuma fórmula nova: a
// conta do dia é a mesma (Engine). Dados fictícios (demonstração), data fixa num dia útil.
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
    await page.clock.setFixedTime(new Date('2026-11-19T10:00:00'));
    await page.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1'); await page.getByRole('heading', { name: 'Visão da linha' }).waitFor();
    await page.evaluate(() => { location.hash = '#/oee?tab=launch'; });
    const f = await (await page.locator('iframe[title="Módulo Produção"]').elementHandle()).contentFrame(); await f.waitForFunction(() => window.vacPagina?.pronto());
    await f.waitForSelector('#cabDia [data-modolanc]');
    const confirmar = async (sim = true) => { const d = f.locator('.modal.on, .overlay, dialog[open]').last(); await d.waitFor(); const txt = await d.innerText(); await d.locator(sim ? 'button.primary' : 'button:not(.primary)').last().click(); return txt; };
    const estado = () => f.evaluate(() => { const d = curDay(), r = Engine.computeDay(db(), d); return { modo: d.modoLanc || 'hh', scrapMode: d.scrapMode, scrapDay: d.scrapDay, ps: d.shifts.map(p => p.scrap), good: r.r.good, scrap: r.r.scrap, oee: r.r.oee, horas: d.shifts.map(p => p.intervals.filter(i => !i.deleted && i.good != null).length) }; });
    const e0 = await estado();
    /* 1) pílulas no cabeçalho do dia */
    const pil = await f.evaluate(() => ({ lanc: [...document.querySelectorAll('[data-modolanc]')].map(b => b.textContent + ':' + b.getAttribute('aria-pressed')), scrap: [...document.querySelectorAll('[data-scrapmode]')].map(b => b.textContent + ':' + b.getAttribute('aria-pressed')) }));
    assert.deepEqual(pil, { lanc: ['Hora a hora:true', 'Por turno:false'], scrap: ['Por turno:true', 'Diário:false'] });
    /* 2) Por turno: confirmação, nada apagado, os números do dia iguais; o turno mostra o total e as paradas, sem o hora a hora */
    await f.click('[data-modolanc="turno"]'); const t1 = await confirmar(false); assert.match(t1, /Nada é apagado/); assert.equal((await estado()).modo, 'hh', 'cancelar não muda');
    await f.click('[data-modolanc="turno"]'); await confirmar(true); await f.waitForFunction(() => curDay().modoLanc === 'turno');
    const e1 = await estado(); assert.deepEqual([e1.good, e1.scrap, e1.oee, e1.horas], [e0.good, e0.scrap, e0.oee, e0.horas], 'trocar o modo não muda dados nem contas');
    await f.click('[data-trturno]');
    const t = await f.evaluate(() => { const s = [...document.querySelectorAll('section.tl')].find(x => !x.classList.contains('tr-oculto')); const vis = q => { const el = s.querySelector(q); return !!(el && el.offsetParent); };
      return { mt: vis('.tl-mt'), total: vis('.tl-mt [data-tttot], .tl-mt .tt-in, .tl-mt .tt-per'), parada: vis('[data-addevps]'), tabela: vis('table.hh'), graf: vis('.tl-graf'), rodape: !!document.querySelector('.lc-rodape [data-hhps=""]'),
        audit: (db().audit || db().auditLog || []).some(a => a.field === 'modoLanc') }; });
    assert.deepEqual(t, { mt: true, total: true, parada: true, tabela: false, graf: false, rodape: false, audit: true });
    await f.click('[data-addevps]'); await f.locator('.modal.on, .overlay, dialog[open]').last().waitFor(); await page.keyboard.press('Escape'); await f.evaluate(() => document.querySelectorAll('.overlay,.modal.on').forEach(x => x.remove()));
    await f.click('[data-modolanc="hh"]'); await confirmar(true); await f.waitForFunction(() => !curDay().modoLanc);
    await f.waitForSelector('.lc-rodape [data-hhps=""]', { timeout: 5000 });   /* Abrir hora a hora volta no modo Hora a hora */
    console.log('ok Lançamento: Hora a hora / Por turno com confirmação; nada apagado; total e paradas do turno; auditoria');
    /* 3) Scrap: Diário sugere a soma dos turnos e guarda os valores por turno; voltar traz tudo; a conta usa só o modo atual */
    await f.click('[data-scrapmode="day"]'); const s1 = await confirmar(true); assert.match(s1, /soma dos turnos/); assert.match(s1, /ficam guardados e deixam de contar/);
    await f.waitForFunction(() => curDay().scrapMode === 'day');
    const e2 = await estado(); const soma = e0.ps.reduce((a, b) => a + (b || 0), 0);
    assert.equal(e2.scrapDay, soma, 'Diário com a soma dos turnos'); assert.deepEqual(e2.ps, e0.ps, 'valores por turno guardados'); assert.equal(Math.round(e2.scrap), soma);
    await f.fill('[data-dayscrap]', String(soma + 100)); await f.press('[data-dayscrap]', 'Tab'); await f.waitForFunction(v => curDay().scrapDay === v, soma + 100);
    assert.equal(Math.round((await estado()).scrap), soma + 100, 'conta só o diário');
    await f.click('[data-scrapmode="shift"]'); const s2 = await confirmar(true); assert.match(s2, /fica guardado e deixa de contar/);
    await f.waitForFunction(() => curDay().scrapMode === 'shift');
    const e3 = await estado(); assert.deepEqual([e3.ps, e3.scrapDay], [e0.ps, soma + 100], 'voltar a Por turno: os dois valores guardados'); assert.equal(Math.round(e3.scrap), soma, 'conta só os turnos');
    await f.click('[data-scrapmode="day"]'); await confirmar(true); await f.waitForFunction(() => curDay().scrapMode === 'day');
    assert.equal((await estado()).scrapDay, soma + 100, 'voltar a Diário traz o valor guardado (sem somar de novo)');
    console.log('ok Scrap: Por turno / Diário sem apagar nada; a conta usa só o modo atual');
    /* 4) hora extra num turno só: selo no topo do turno e tempo do turno ajustado */
    const hx = await f.evaluate(async () => { const d = curDay(), ps = d.shifts[0], L = HoraExtra.limites(ps), antes = Engine.computeDay(db(), d).shifts[0].r.netMin;
      Actions.addInterval(d.id, ps.id, L.s - 60, L.s, 'extra'); render(); await new Promise(r => setTimeout(r, 200));
      const R = Engine.computeDay(db(), curDay()); return { antes, depois: R.shifts[0].r.netMin, outro: R.shifts[1].r.netMin, selos: [...document.querySelectorAll('section.tl')].map(s => [s.dataset.tl === ps.id, s.querySelectorAll('.tl-hxselo').length]) }; });
    assert.equal(hx.depois - hx.antes, 60, 'turno com hora extra: +60 min'); assert.deepEqual(hx.selos.filter(x => x[1]).map(x => x[0]), [true], 'selo só no turno com hora extra');
    console.log('ok hora extra só no 1º turno: selo e +60 min no tempo do turno');
    assert.deepEqual(erros, [], 'sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

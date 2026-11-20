// CELULAR/index.html · app "Meu Turno" (independente da plataforma). Celular simulado (Pixel 7), relógio fixo no 2º turno de
// 20/11/2026, dados fictícios. Confere: turno da hora, intervalos e plano (hora cheia; sobra de até 30 min junta), parada, scrap em
// tubos sobre produção em mil, gel teórico e "gel na ordem", fechamento sem transformar hora vazia em zero, texto do WhatsApp,
// histórico por período e nenhum pedido à internet.
const { chromium, devices } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../CELULAR/index.html'));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html; charset=utf-8'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('../plataforma/chromium.cjs')());
    const ctx = await browser.newContext({ ...devices['Pixel 7'], timezoneId: 'America/Sao_Paulo', locale: 'pt-BR' }), externos = [], erros = [];
    await ctx.route(/^https?:\/\/(?!127\.0\.0\.1[:/])/, r => { externos.push(r.request().url()); r.abort(); });
    await ctx.clock.install({ time: new Date('2026-11-20T17:20:00-03:00') });
    const p = await ctx.newPage(); p.on('pageerror', e => erros.push(e.message)); p.on('dialog', d => d.accept());
    await p.goto('http://127.0.0.1:' + srv.address().port + '/#inicio');

    // 1) início: turno pela hora; lançar abre o turno do dia
    assert.match(await p.textContent('#lancar'), /2º Turno · 14:30–22:45 · 20\/11\/2026[\s\S]*Lançar meu turno/);
    await p.click('#lancar'); await p.waitForSelector('[data-real]');
    const sl = await p.evaluate(() => atual().slots.map(s => `${s.de}-${s.ate}:${planoSlot(atual(), s)}`));
    assert.deepEqual(sl, ['14:30-15:00:28', '15:00-16:00:56', '16:00-17:00:56', '17:00-18:00:56', '18:00-19:00:56', '19:00-20:00:56', '20:00-21:00:56', '21:00-22:45:98'], 'hora cheia; os 45 min finais juntam-se à hora anterior, como no quadro (21:00–22:45 = 98)');
    console.log('ok turno da hora (2º) e intervalos com plano = meta/h × minutos');

    // 2) lançamento: operador, lote, horas, parada, scrap por máquina e gel
    await p.fill('#op', 'Operador (TESTE)'); await p.fill('#lote', '6275188');
    for (const [i, v] of [[0, '14'], [1, '61'], [2, '61'], [3, '28']]) { await p.fill(`[data-real="${i}"]`, v); await p.locator(`[data-real="${i}"]`).dispatchEvent('change'); }
    await p.click('[data-addp="3"]'); await p.fill('#pmin', '25'); await p.click('[data-mot="Falta de material"]'); await p.fill('#pobs', 'rack vazio'); await p.click('#pok');
    await p.click('[data-sm="maq"]'); await p.fill('[data-scm="Tullip B"]', '1150'); await p.locator('[data-scm="Tullip B"]').dispatchEvent('change');
    await p.fill('#gA', '137'); await p.locator('#gA').dispatchEvent('change');
    const r1 = await p.evaluate(() => { const r = resumo(atual()); return { re: r.re, pl: r.pl, pm: r.pm, scrap: r.scrap, pct: +(r.scrapPct * 100).toFixed(3), gT: +r.gT.toFixed(3), falta: r.falta }; });
    assert.deepEqual(r1, { re: 164, pl: 462, pm: 25, scrap: 1150, pct: 0.696, gT: 136.776, falta: 4 }, 'scrap (tubos) sobre produção em mil; gel teórico = 164 mil × 0,834 g');
    console.log('ok lançamento: horas, parada, scrap por máquina (0,70%) e gel teórico 136,8 kg');

    // 3) fechar: horas vazias ficam "não informado" (não zero); texto do WhatsApp
    await p.click('#fechar'); assert.match(await p.textContent('.sheet'), /4 hora\(s\) sem produção informada[\s\S]*não como zero/); await p.click('#fok'); await p.waitForSelector('#waTxt');
    const wa = await p.evaluate(() => txtWA(TURNOS[0]));
    for (const re of [/\*Linha Vacutainer · 2º Turno · 20\/11\/2026\*/, /Produção: 164 de 462 mil\* \(35%\)/, /Paradas: \*25 min\* · Falta de material 25'/, /Scrap: 1\.150 tubos \(0,70%\)/, /Tullip B 1\.150/, /Gel: real 137,0 kg · teórico 136,8 kg/, /18:00  —\/56/, /17:00  28\/56  ⏱25' Falta de material – rack vazio/]) assert.match(wa, re);
    assert.ok(await p.evaluate(() => document.querySelector('#cv').getContext('2d').getImageData(80, 120, 1, 1).data[3] > 0), 'imagem do WhatsApp desenhada');
    console.log('ok fechamento e texto do WhatsApp (hora vazia como "—", não zero); imagem desenhada');

    // 4) gel na ordem: 800 tubos × 0,834 g = 667,2 g
    await p.goto(p.url().split('#')[0] + '#gel'); await p.fill('#gq', '800');
    assert.equal(await p.textContent('#gres'), '667,2 g'); await p.fill('#gj', '0,5'); assert.match(await p.textContent('main'), /Falta apontar: 167,2 g/);
    console.log('ok gel na ordem: 667,2 g; falta apontar 167,2 g');

    // 5) histórico por período e sem internet nem erro
    await p.goto(p.url().split('#')[0] + '#historico'); await p.click('[data-hm="periodo"]');
    assert.match(await p.textContent('main'), /Resumo do período · 1 turno\(s\)[\s\S]*164 mil[\s\S]*Falta de material/);
    assert.deepEqual(externos, [], 'nenhum pedido à internet'); assert.deepEqual(erros, [], 'sem erro de JavaScript');
    console.log('ok histórico por período; sem internet e sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

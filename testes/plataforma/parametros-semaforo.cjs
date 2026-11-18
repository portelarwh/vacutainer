// Plataforma 1.8.10 (Administração 1.9.49, Produção 2.6.8) · semáforo sem amarelo, Parâmetros com Salvar no topo de cada
// cartão e mensagem visível, e avisos flutuantes na parte visível da tela dentro da plataforma. Dados fictícios (demonstração).
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const page = await browser.newPage({ viewport: { width: 1440, height: 800 } }), erros = [];
    page.on('pageerror', e => erros.push(e.message));
    await page.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1');
    await page.getByRole('heading', { name: 'Visão da linha' }).waitFor();
    await page.evaluate(() => { location.hash = '#/portal'; });
    const el = page.locator('iframe[title="Módulo Administração"]'); await el.waitFor();
    const f = await (await el.elementHandle()).contentFrame(); await f.waitForFunction(() => typeof Cad !== 'undefined' && Cad.D);
    await f.evaluate(() => { location.hash = '#cadastros/parametros'; }); await f.waitForSelector('#sSemOk');

    // 1) cada cartão com o próprio Salvar no topo (gerais, semáforo, Produção, Gel)
    const topo = await f.evaluate(() => ['#parGer #sGerOk', '#parSem #sSemOk', '#parProd #ppOk', '#parGel #pgOk'].map(s => { const b = document.querySelector(s); return !!b && !!b.closest('.par-hd') && b.closest('.card').firstElementChild === b.closest('.par-hd'); }));
    assert.deepEqual(topo, [true, true, true, true], 'Salvar no topo de cada cartão');
    assert.equal(await f.locator('#sParOk').count(), 0, 'sem o botão único do fim');
    console.log('ok Parâmetros: Salvar no topo dos cartões gerais, semáforo, Produção e Gel');

    // 2) com amarelo, amarelo >= verde é recusado e a mensagem aparece logo abaixo do botão
    await f.fill('[data-par="semaforoVerdePct"]', '100'); await f.fill('[data-par="semaforoAmareloPct"]', '100'); await f.click('#sSemOk');
    const m1 = await f.evaluate(() => { const m = document.querySelector('#sSemOkMsg'), b = document.querySelector('#sSemOk'); return { txt: m.textContent, perto: m.getBoundingClientRect().top - b.getBoundingClientRect().bottom }; });
    assert.match(m1.txt, /desmarque "Usar amarelo"/); assert.ok(m1.perto < 40, 'mensagem logo abaixo do botão (' + m1.perto + ' px)');
    console.log('ok com amarelo: amarelo igual ao verde é recusado, com a mensagem abaixo do Salvar');

    // 3) sem amarelo: salva só verde e vermelho; a régua comum deixa de dar "atenção"
    await f.locator('#sUsaAm').uncheck();
    assert.equal(await f.locator('#sAmLab').isHidden(), true, 'campo do amarelo some');
    assert.match(await f.locator('#sPrev').innerText(), /sem amarelo/);
    await f.click('#sSemOk'); await f.waitForFunction(() => Cad.D.parametros.semaforoAmarelo === false);
    const r = await f.evaluate(() => ({ msg: document.querySelector('#sSemOkMsg').textContent, s95: vacSemaforo(95, 100), s100: vacSemaforo(100, 100), inv: vacSemaforo(105, 100, { inverso: true }) }));
    assert.match(r.msg, /só verde e vermelho/); assert.equal(r.s95, 'crit', '95% sem amarelo = vermelho'); assert.equal(r.s100, 'ok'); assert.equal(r.inv, 'crit', 'menor é melhor também sem amarelo');
    console.log('ok sem amarelo: salvo; 95% da meta = vermelho, 100% = verde (também em "menor é melhor")');

    // 4) a Produção recebe a régua sem amarelo: amarelo igual ao verde, sem legenda de atenção
    const pr = await f.evaluate(() => { const P = Cad.D.parametros; return { green: +P.semaforoVerdePct / 100, yellow: (P.semaforoAmarelo === false ? +P.semaforoVerdePct : +P.semaforoAmareloPct) / 100 }; });
    assert.equal(pr.yellow, pr.green);
    await page.evaluate(() => { location.hash = '#/oee?tab=hourly'; });
    const pf = await (await page.locator('iframe[title="Módulo Produção"]').elementHandle()).contentFrame(); await pf.waitForFunction(() => window.vacPagina?.pronto());
    const leg = await pf.evaluate(s => { const S = db().settings, a = S.semaphore; S.semaphore = s; try { const h = Charts.combo({ x: ['a'], bars: [{ name: 'P', values: [95], meta: [100], color: 'var(--s1)' }], height: 120 }); return { atencao: /atenção/.test(h), cor: (h.match(/fill="var\(--(ok|warn|crit)/) || [])[1] }; } finally { S.semaphore = a; } }, pr);
    assert.equal(leg.atencao, false, 'sem legenda de atenção'); assert.equal(leg.cor, 'crit');
    console.log('ok Produção sem amarelo: barra a 95% vermelha e sem legenda de atenção');

    // 5) volta o amarelo (estado da demonstração)
    await page.evaluate(() => { location.hash = '#/portal'; }); await f.waitForSelector('#sUsaAm');
    await f.locator('#sUsaAm').check(); await f.fill('[data-par="semaforoAmareloPct"]', '90'); await f.click('#sSemOk');
    await f.waitForFunction(() => Cad.D.parametros.semaforoAmarelo !== false);
    assert.equal(await f.evaluate(() => vacSemaforo(95, 100)), 'warn'); console.log('ok com amarelo de novo: 95% = atenção');

    // 6) aviso flutuante dentro da área visível, mesmo com a página rolada
    await page.evaluate(() => scrollTo(0, 99999)); await page.waitForTimeout(300);
    await f.evaluate(() => toast('Aviso de teste'));
    await page.waitForTimeout(400);
    const vis = await page.evaluate(() => { const fr = document.querySelector('iframe[title="Módulo Administração"]'), d = fr.contentDocument, t = [...d.querySelectorAll('#toasts .toast,#toast,.toasts > *')].find(x => /Aviso de teste/.test(x.textContent));
      if (!t) return null; const r = t.getBoundingClientRect(), fr0 = fr.getBoundingClientRect(); return { top: fr0.top + r.top, bottom: fr0.top + r.bottom, vh: innerHeight }; });
    assert.ok(vis && vis.top >= 0 && vis.bottom <= vis.vh, 'aviso dentro da tela: ' + JSON.stringify(vis));
    console.log('ok aviso flutuante na parte visível da tela');

    assert.deepEqual(erros, [], 'sem erro de JavaScript'); console.log('ok parâmetros do semáforo: sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

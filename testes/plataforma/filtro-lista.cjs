// Plataforma 1.8.57 (pedido do responsável, 23/11/2026): o tipo de parada se busca DENTRO da lista, como o filtro do Excel.
// Demonstração: Produção › Registrar parada (dados fictícios). O que este teste prova:
//  1. o campo é um botão com a setinha; ao abrir aparece a caixa de texto com a lista logo abaixo, sem campo de busca separado;
//  2. digitar filtra a lista; dois cliques escolhem e fecham;
//  3. um clique marca a opção (a lista continua aberta) e clicar fora fecha confirmando a escolha;
//  4. Esc fecha e volta ao que estava; Enter escolhe a primeira opção filtrada e fecha;
//  5. o select original continua com o valor (os mesmos IDs e eventos) e nenhum erro de JavaScript.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
const OUT = process.env.FILTRO_PRINT || '';
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const page = await browser.newPage({ viewport: { width: 1440, height: 950 }, deviceScaleFactor: OUT ? 2 : 1 }), erros = [];
    page.on('pageerror', e => erros.push(e.message)); page.on('dialog', d => d.accept());
    await page.clock.setFixedTime(new Date('2026-11-19T10:00:00'));
    await page.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1#/oee?tab=launch');
    const o = await (await page.locator('iframe[title="Módulo Produção"]').elementHandle({ timeout: 60000 })).contentFrame();
    await o.waitForFunction(() => window.vacPagina?.pronto());
    await o.evaluate(() => { eventModal(curDay(), null, null); });
    await o.waitForSelector('#eCode');
    const bt = o.locator('.vac-fs-bt').first(), pan = o.locator('.vac-fs-pan').first();
    const est = () => o.evaluate(() => { const s = document.querySelector('#eCode'), w = s.closest('.vac-fs'), p = w.querySelector('.vac-fs-pan');
      return { aberto: !p.hidden, valor: s.value, rotulo: w.querySelector('.vac-fs-v').textContent, itens: [...p.querySelectorAll('li[role=option]')].map(l => l.textContent), foco: document.activeElement && document.activeElement.className }; });

    // 1) botão com setinha; abre com a caixa de texto e a lista; sem campo de busca separado fora da lista
    const r0 = await o.evaluate(() => { const s = document.querySelector('#eCode'), w = s.closest('.vac-fs'); return { fora: !!w.parentElement.querySelector(':scope > .vac-filtro'), seta: !!w.querySelector('.vac-fs-bt svg') }; });
    assert.deepEqual(r0, { fora: false, seta: true });
    await bt.click(); let e = await est();
    assert.ok(e.aberto && e.foco.includes('vac-filtro') && e.itens.length > 5, 'abre com o texto em foco e a lista ' + JSON.stringify(e).slice(0, 200));
    console.log('ok o campo é um botão com a setinha; ao abrir, a caixa de texto (com foco) e a lista ficam juntas');

    // 2) digitar filtra; dois cliques escolhem e fecham
    await o.locator('.vac-fs-pan .vac-filtro').first().fill('set');
    const total = (await o.evaluate(() => [...document.querySelector('#eCode').options].filter(x => x.value).length));
    e = await est(); assert.ok(e.itens.length >= 1 && e.itens.length < total && e.itens.some(t => /set/i.test(t)), 'filtra (nome, código ou categoria) ' + JSON.stringify(e.itens));
    if (OUT) await page.screenshot({ path: OUT });
    const alvo = e.itens[0];
    await pan.locator('li[role=option]').first().dblclick();
    e = await est(); assert.ok(!e.aberto && e.rotulo === alvo && e.valor, 'dois cliques escolhem e fecham ' + JSON.stringify(e).slice(0, 200));
    console.log('ok digitar "set" filtra a lista; dois cliques escolhem "' + alvo + '" e fecham');

    // 3) um clique escolhe; clicar fora fecha com a escolha
    await bt.click(); await o.locator('.vac-fs-pan .vac-filtro').first().fill('');
    const segundo = await pan.locator('li[role=option]').nth(3).textContent();
    await pan.locator('li[role=option]').nth(3).click();
    e = await est(); const marcadas = await o.evaluate(() => [...document.querySelectorAll('.vac-fs-pan li[aria-selected="true"]')].map(l => l.textContent));
    assert.ok(e.aberto && marcadas.includes(segundo), 'um clique marca e a lista continua aberta ' + JSON.stringify({ aberto: e.aberto, marcadas, segundo }));
    await o.evaluate(() => document.querySelector('.overlay h2, .modal h2, .modal h3, .overlay h3').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })));
    e = await est(); assert.ok(!e.aberto && e.rotulo === segundo, 'clicar fora fecha com a escolha');
    console.log('ok um clique marca; clicar fora fecha confirmando "' + segundo + '"');

    // 4) Esc volta ao que estava; Enter escolhe a primeira filtrada
    await bt.click(); await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowDown'); await page.keyboard.press('Escape');
    e = await est(); assert.ok(!e.aberto && e.rotulo === segundo, 'Esc volta ao que estava');
    await bt.click(); await o.locator('.vac-fs-pan .vac-filtro').first().fill('set'); const pri = (await est()).itens[0]; await page.keyboard.press('Enter');
    e = await est(); assert.ok(!e.aberto && e.rotulo === pri, 'Enter escolhe a primeira filtrada');
    console.log('ok Esc fecha e volta ao que estava; Enter escolhe a primeira opção filtrada');

    // 5) o select original guarda o valor
    const v = await o.evaluate(() => { const s = document.querySelector('#eCode'); return s.options[s.selectedIndex].textContent; });
    assert.equal(v, pri);
    assert.deepEqual(erros, [], 'sem erro de JavaScript'); console.log('ok o select original (#eCode) guarda o valor; sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });

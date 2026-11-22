// Linha 360° 1.4.1 (pedido do responsável, 22/11/2026): em Configuração › Pontos e equipamentos, os pontos se editam todos e gravam de uma
// vez em "Salvar alterações". Antes, cada linha tinha o seu "Salvar" e salvar uma apagava o que estava digitado nas outras.
// Demonstração: dados fictícios. O que este teste prova:
//  1. alterar o nome de três pontos marca as três linhas e o botão mostra "(3)";
//  2. um redesenho da tela no meio (sincronização, outra gravação) não perde o que foi digitado;
//  3. "Salvar alterações" grava os três de uma vez; "Descartar alterações" volta ao que estava gravado;
//  4. nenhum erro de JavaScript.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }), erros = [];
    page.on('pageerror', e => erros.push(e.message)); page.on('dialog', d => d.accept());
    await page.clock.setFixedTime(new Date('2026-11-19T10:00:00'));
    await page.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1#/linha');
    const f = await (await page.locator('iframe[title="Módulo Linha 360°"]').elementHandle({ timeout: 60000 })).contentFrame();
    await f.waitForSelector('#ficha'); await f.evaluate(() => { App.tab = 'config'; render(); }); await f.waitForSelector('tr[data-pt]');
    const ids = await f.evaluate(() => [...document.querySelectorAll('tr[data-pt]')].slice(0, 3).map(tr => tr.dataset.pt));
    assert.equal(ids.length, 3); assert.equal(await f.locator('[data-ptsalvar]').count(), 0, 'sem botão Salvar por linha');
    for (const id of ids) { await f.fill(`tr[data-pt="${id}"] [data-c=nome]`, 'Ponto teste ' + id); }
    const st = await f.evaluate(() => ({ sujas: document.querySelectorAll('tr.l3-sujo').length, bt: document.querySelector('[data-ptgravar]').textContent, on: !document.querySelector('[data-ptgravar]').disabled }));
    assert.deepEqual(st, { sujas: 3, bt: 'Salvar alterações (3)', on: true }, 'três linhas marcadas e o botão com (3)');
    console.log('ok três pontos alterados: linhas marcadas e "Salvar alterações (3)"');
    await f.evaluate(() => render());
    const depois = await f.evaluate(ids => ids.map(id => document.querySelector(`tr[data-pt="${id}"] [data-c=nome]`).value), ids);
    assert.deepEqual(depois, ids.map(id => 'Ponto teste ' + id), 'o texto digitado continua depois de redesenhar a tela');
    console.log('ok a tela redesenhada mantém o que foi digitado');
    await f.click('[data-ptgravar]');
    const salvos = await f.evaluate(ids => ({ nomes: ids.map(id => pontos().find(p => p.id === id).nome), rasc: Object.keys(App.ptRasc || {}).length, sujas: document.querySelectorAll('tr.l3-sujo').length }), ids);
    assert.deepEqual(salvos, { nomes: ids.map(id => 'Ponto teste ' + id), rasc: 0, sujas: 0 }, 'os três gravados de uma vez');
    console.log('ok "Salvar alterações" grava os três pontos de uma vez');
    await f.fill(`tr[data-pt="${ids[0]}"] [data-c=nome]`, 'Não vai ficar'); await f.click('[data-ptdesc]');
    assert.equal(await f.evaluate(id => document.querySelector(`tr[data-pt="${id}"] [data-c=nome]`).value, ids[0]), 'Ponto teste ' + ids[0], 'descartar volta ao gravado');
    console.log('ok "Descartar alterações" volta ao que estava gravado');
    assert.deepEqual(erros, [], 'sem erro de JavaScript'); console.log('ok sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });

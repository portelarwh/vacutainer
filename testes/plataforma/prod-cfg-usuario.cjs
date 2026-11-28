// Plataforma 1.8.106 · BUG-01 (varredura de defeitos, 28/11/2026): Produção › Config. › Usuário quebrava com "u is not defined".
// Causa: o Bloco 3b (#158, 1.8.67) tirou da base da Produção a lista de nomes (settings.users) e a linha que a lia, mas a seção ainda
// mostrava "Nomes já usados" com essa variável; o mount, sem o botão #uChange, também falhava. Prova, com a demonstração fictícia:
//  1. a seção Usuário abre sem erro de JavaScript (nem no console) e sem o aviso vermelho de erro;
//  2. mostra o usuário atual, o botão Trocar usuário e a exibição das quantidades; não mostra mais a lista "Nomes já usados".
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(process.env.PLATAFORMA_HTML || path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html; charset=utf-8'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }), erros = [];
    page.on('pageerror', e => erros.push(e.message));
    page.on('console', m => { if (m.type() === 'error') erros.push(m.text().split('\n')[0]); });
    await page.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1#/oee?tab=config');
    const f = await (await page.locator('iframe[title="Módulo Produção"]').elementHandle({ timeout: 60000 })).contentFrame();
    await f.waitForFunction(() => window.vacPagina && vacPagina.pronto() && App.route === 'config', null, { timeout: 60000 });
    await f.click('.cfg nav [data-sec="usuario"]');
    await f.waitForSelector('.cfg #uChange', { timeout: 10000 });
    const tela = await f.evaluate(() => ({ t: document.querySelector('.cfg nav + div').innerText, crit: document.querySelectorAll('.cfg .banner.crit').length, qd: document.querySelectorAll('.cfg [data-qd]').length }));
    assert.equal(tela.crit, 0, 'sem aviso de erro na seção');
    assert.match(tela.t, /Usuário atual/); assert.match(tela.t, /Trocar usuário/); assert.equal(tela.qd, 2, 'os dois modos de exibição das quantidades');
    assert.doesNotMatch(tela.t, /Nomes já usados/, 'a lista de nomes saiu da base da Produção (Bloco 3b)');
    assert.deepEqual(erros, [], 'sem erro de JavaScript');
    console.log('ok Produção › Config. › Usuário abre sem erro: usuário atual, Trocar usuário e exibição das quantidades');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });

// Plataforma 1.8.48 · CAD-CONS (pedido do responsável, 22/11/2026): "Consulta de cadastros" em Produção, Gestão de Gel, Paradas e Waste.
// Demonstração: dados fictícios. O que este teste prova:
//  1. cada página mostra os cadastros da Administração que usa, agrupados, com busca por código ou nome;
//  2. o clique num item abre a ficha lateral (a mesma da ordem) com os dados do cadastro e as vigências, e "Editar na Administração"
//     aponta para a seção certa; clicar fora fecha a ficha e a página continua onde estava (no Gel, a Configuração continua aberta);
//  3. "Editar na Administração" leva à Administração › Cadastros na seção do item;
//  4. nenhum erro de JavaScript.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
const SAI = path.resolve(__dirname, '../saida'); fs.mkdirSync(SAI, { recursive: true });
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }), erros = [];
    page.on('pageerror', e => erros.push(e.message));
    await page.clock.setFixedTime(new Date('2026-11-19T10:00:00'));
    const base = 'http://127.0.0.1:' + srv.address().port + '/?demo=1';
    const frame = async (rota, nome) => { await page.goto(base + rota); const f = await (await page.locator(`iframe[title="Módulo ${nome}"]`).elementHandle({ timeout: 60000 })).contentFrame(); await f.waitForFunction(() => document.readyState === 'complete' && typeof vacConsultaCad === 'object'); await page.waitForTimeout(1500); return f; };
    const lista = f => f.evaluate(() => [...document.querySelectorAll('[data-vcc-g] h4')].map(h => h.textContent.replace(/\s+/g, ' ').trim()));

    // 1-2. Gestão de Gel › Configuração › Consulta de cadastros
    let f = await frame('#/gel', 'Gestão de Gel');
    await f.evaluate(() => openConfig('consulta')); await f.waitForSelector('[data-vac-cad]');
    const gG = await lista(f); assert.ok(gG.some(x => /^Turnos 3/.test(x)) && gG.some(x => /^Catálogos/.test(x)), 'Gel: grupos ' + gG.join(' · '));
    console.log('ok Gel › Consulta de cadastros: ' + gG.join(' · '));
    await f.fill('[data-vcc-busca]', 'T2'); const vis = await f.evaluate(() => [...document.querySelectorAll('.vcc-it')].filter(b => !b.hidden).map(b => b.dataset.vacCad));
    assert.deepEqual(vis, ['turnos|T2'], 'busca "T2" deixa só o turno T2'); console.log('ok busca por código: ' + vis.join(', '));
    await f.click('[data-vac-cad="turnos|T2"]'); await f.waitForSelector('#vacFicha .vficha h2');
    const fi = await f.evaluate(() => { const a = document.querySelector('#vacFicha .vficha'); return { t: a.innerText, href: (a.querySelector('.vcc-adm') || {}).getAttribute ? a.querySelector('.vcc-adm').getAttribute('href') : '' }; });
    assert.match(fi.t, /2º Turno/); assert.match(fi.t, /Vigências/); assert.match(fi.t, /14:30/); assert.match(fi.href, /cadastros(%2F|\/)turnos/);
    await page.waitForTimeout(700); await page.screenshot({ path: path.join(SAI, 'cad-consulta-gel.png') });
    console.log('ok ficha lateral do turno T2: nome, vigências e horário; "Editar na Administração" → ' + fi.href);
    await page.mouse.click(420, 500); await f.waitForFunction(() => !document.querySelector('#vacFicha'));
    assert.ok(await f.evaluate(() => !!document.querySelector('#ov .cfgbody [data-vcc]')), 'fechou a ficha e a Configuração do Gel continua aberta');
    console.log('ok clique fora fecha a ficha; a Configuração do Gel continua aberta na consulta');
    // 3. Editar na Administração
    await f.fill('[data-vcc-busca]', ''); await f.click('[data-vac-cad="turnos|T1"]'); await f.waitForSelector('#vacFicha .vcc-adm'); await f.click('#vacFicha .vcc-adm');
    await page.waitForFunction(() => /#\/portal.*cadastros.*turnos/.test(decodeURIComponent(location.hash)), null, { timeout: 15000 });
    console.log('ok "Editar na Administração" abre ' + decodeURIComponent(await page.evaluate(() => location.hash)));

    // Produção › Configurações › Consulta de cadastros
    f = await frame('#/oee?tab=config', 'Produção');
    await f.evaluate(() => { App.cfgSec = 'consulta'; render(); }); await f.waitForSelector('[data-vac-cad]');
    const gP = await lista(f); assert.ok(['Linhas', 'Famílias', 'Catálogos', 'Turnos', 'Tipos de parada', 'Metas de OEE'].every(n => gP.some(x => x.startsWith(n))), 'Produção: grupos ' + gP.join(' · '));
    const menu = await f.evaluate(() => ({ k: [...document.querySelectorAll('.cfg nav [data-sec]')].map(b => b.dataset.sec), adm: !!document.querySelector('[data-sec-adm]') }));
    assert.ok(menu.k.includes('consulta') && !menu.k.some(k => ['estrutura', 'turnos', 'catalogos', 'metas', 'paradas'].includes(k)) && !menu.adm, 'Produção: menu com "Consulta de cadastros" no lugar dos cinco itens');
    await f.click('[data-vac-cad^="catalogos|"]'); await f.waitForSelector('#vacFicha .vficha h2');
    const fp = await f.evaluate(() => document.querySelector('#vacFicha .vficha').innerText);
    assert.match(fp, /PPH nominal/); await page.waitForTimeout(700); await page.screenshot({ path: path.join(SAI, 'cad-consulta-producao.png') });
    await page.keyboard.press("Escape"); await f.waitForFunction(() => !document.querySelector('#vacFicha'));
    assert.equal(await f.evaluate(() => App.route + '/' + App.cfgSec), 'config/consulta', 'Esc fecha a ficha e a Produção continua na consulta');
    console.log('ok Produção: ' + gP.join(' · ') + '; ficha do catálogo com PPH nominal; Esc fecha e continua na consulta');
    await f.evaluate(() => { App.cfgSec = 'turnos'; render(); }); assert.ok(await f.evaluate(() => !!document.querySelector('.cfg [data-vcc]')), 'seção antiga (turnos) pedida direto abre a consulta');

    // Paradas e Waste
    f = await frame('#/paradas?aba=config', 'Paradas'); await f.evaluate(() => { App.tab = 'config'; App.render(); });
    await f.waitForSelector('[data-vac-cad]', { timeout: 20000 }).catch(() => null);
    const gPa = await lista(f); assert.ok(gPa.some(x => x.startsWith('Equipamentos')) && gPa.some(x => x.startsWith('Tipos de parada')), 'Paradas: grupos ' + gPa.join(' · '));
    console.log('ok Paradas: ' + gPa.join(' · '));
    f = await frame('#/perdas', 'Waste');
    const gW = await f.evaluate(() => [...document.querySelectorAll('#cfgCadCons [data-vcc-g] h4')].map(h => h.textContent.replace(/\s+/g, ' ').trim()));
    assert.ok(gW.some(x => x.startsWith('Catálogos')) && gW.some(x => x.startsWith('Materiais')), 'Waste: grupos ' + gW.join(' · '));
    console.log('ok Waste: ' + gW.join(' · '));

    assert.deepEqual(erros, [], 'sem erro de JavaScript'); console.log('ok sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });

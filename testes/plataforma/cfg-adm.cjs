// Plataforma 1.8.46/1.8.47 · CFG-ADM etapas 1 e 2 (pedido do responsável, 22/11/2026): nas Configurações da Produção e da Gestão de Gel, o que é cadastro
// da Administração abre direto lá, na mesma seção, sem uma segunda tela do mesmo cadastro. Demonstração: dados fictícios. O que este teste prova:
//  1. Produção: Estrutura, Turnos, Catálogos, Metas e Tipos de parada aparecem no menu com ↗ e levam à Administração › Cadastros na seção certa;
//     as seções da própria Produção (QN, Mapa de tags, Parâmetros, Importação…) continuam na Produção;
//  2. os atalhos de outras abas (pausas do Hora a Hora, metas faltando) também levam à Administração;
//  3. Gestão de Gel: as seções com cadastro na Administração (turnos, preço, processo, formatos, motivos, equipamentos) abrem lá;
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
    page.on('pageerror', e => erros.push(e.message));
    await page.clock.setFixedTime(new Date('2026-11-19T10:00:00'));
    const base = 'http://127.0.0.1:' + srv.address().port + '/?demo=1';
    const frame = async nome => { const f = await (await page.locator(`iframe[title="Módulo ${nome}"]`).elementHandle({ timeout: 60000 })).contentFrame(); await f.waitForFunction(() => document.readyState === 'complete'); await page.waitForTimeout(1500); return f; };
    const naAdm = async rota => { await page.waitForFunction(r => decodeURIComponent(location.hash).includes('#/portal') && decodeURIComponent(location.hash).includes(r), rota, { timeout: 20000 }); return decodeURIComponent(await page.evaluate(() => location.hash)); };

    // 1. Produção › Configurações
    await page.goto(base + '#/oee?tab=config');
    let f = await frame('Produção'); await f.waitForSelector('[data-sec-adm]');
    const M = await f.evaluate(() => ({ adm: [...document.querySelectorAll('[data-sec-adm]')].map(b => b.dataset.secAdm), local: [...document.querySelectorAll('[data-sec]')].map(b => b.dataset.sec) }));
    assert.deepEqual(M.adm.sort(), ['catalogos', 'estrutura', 'metas', 'paradas', 'turnos'], 'Produção: os cinco cadastros da Administração no menu com ↗');
    for (const k of ['qn', 'tags', 'parametros', 'importacao', 'base']) assert.ok(M.local.includes(k), 'Produção: ' + k + ' continua na Produção');
    console.log('ok Produção: menu com ' + M.adm.length + ' itens que abrem na Administração; ' + M.local.length + ' seções próprias continuam');
    for (const [k, rota] of [['turnos', 'cadastros/turnos'], ['catalogos', 'cadastros/catalogos'], ['metas', 'cadastros/metasOee'], ['paradas', 'cadastros/paradas'], ['estrutura', 'cadastros/linhas']]) {
      await page.goto(base + '#/oee?tab=config'); f = await frame('Produção'); await f.waitForSelector(`[data-sec-adm="${k}"]`);
      await f.click(`[data-sec-adm="${k}"]`); const h = await naAdm(rota);
      console.log('ok Produção › ' + k + ' → ' + h);
    }
    // 2. atalho de outra aba: "Metas" da lista de pendências usa o mesmo caminho
    await page.goto(base + '#/oee?tab=config'); f = await frame('Produção');
    await f.evaluate(() => cfgAbrir('metas')); console.log('ok atalho para Metas → ' + await naAdm('cadastros/metasOee'));
    await page.goto(base + '#/oee?tab=config'); f = await frame('Produção');
    await f.evaluate(() => cfgAbrir('catalogos', '1001')); console.log('ok busca de catálogo → ' + await naAdm('cadastros/catalogos/1001'));

    // 3. Gestão de Gel › Configuração
    await page.goto(base + '#/gel'); f = await frame('Gestão de Gel');
    await f.evaluate(() => openConfig('geral')); await f.waitForSelector('.cfgnav');
    const G = await f.evaluate(() => [...document.querySelectorAll('[data-cfgadm]')].map(b => [b.dataset.cfgadm, cfgAdmGel(b.dataset.cfgadm)]));
    assert.ok(G.length >= 1, 'Gel: ao menos uma seção com cadastro na Administração no cenário');
    for (const [k, r] of G) assert.ok(/^cadastros\//.test(r), 'Gel: ' + k + ' aponta para ' + r);
    console.log('ok Gel: ' + G.map(x => x[0] + ' → ' + x[1]).join(' · '));
    const [k0, r0] = G[0]; await f.click(`[data-cfgadm="${k0}"]`); console.log('ok Gel › ' + k0 + ' → ' + await naAdm(r0));

    // etapa 2 (1.8.47): Gel com as sete seções de cadastro na Administração, sempre
    await page.goto(base + '#/gel'); f = await frame('Gestão de Gel'); await f.evaluate(() => openConfig('geral')); await f.waitForSelector('.cfgnav');
    const G2 = await f.evaluate(() => [...document.querySelectorAll('[data-cfgadm]')].map(b => b.dataset.cfgadm).sort().join(','));
    assert.equal(G2, 'cat,equip,fmts,motivos,preco,proc,turnos', 'Gel: as sete seções de cadastro abrem na Administração');
    console.log('ok Gel: ' + G2 + ' abrem na Administração');
    // etapa 2: Produção sem as telas; abono e motivos em Parâmetros; meta dia-padrão no Plano do mês
    await page.goto(base + '#/oee?tab=config'); f = await frame('Produção');
    const P2 = await f.evaluate(async () => { App.cfgSec = 'parametros'; render(); await new Promise(r => setTimeout(r, 300)); const t = document.querySelector('.cfg > div').innerText;
      App.cfgSec = 'turnos'; render(); await new Promise(r => setTimeout(r, 200)); const card = document.querySelector('.cfg > div').innerText;
      App.planMonth = '2026-11'; go('plan'); await new Promise(r => setTimeout(r, 500)); const m = document.querySelector('#plMetas'); if (m) m.querySelector('details').open = true;
      return { abono: /Abonos/.test(t) && !!document && /Motivos de "sem produção"/.test(t), card, metas: m ? m.innerText : '' }; });
    assert.ok(P2.abono, 'Parâmetros de cálculo tem os abonos e os motivos de "sem produção"');
    assert.match(P2.card, /Turnos é cadastrado só na Administração/, 'Turnos pedido direto: aviso com o botão para a Administração');
    assert.match(P2.metas, /Meta dia-padrão/, 'Plano do mês: metas com a meta dia-padrão');
    assert.match(P2.metas, /\d/, 'Plano do mês: metas com números');
    console.log('ok Produção: abonos e motivos em Parâmetros; Turnos abre na Administração; Plano do mês mostra as metas com a meta dia-padrão');
    assert.deepEqual(erros, [], 'sem erro de JavaScript'); console.log('ok sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });

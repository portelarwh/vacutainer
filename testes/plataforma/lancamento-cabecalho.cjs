// LANC-03 (itens 1, 2 e 7, etapa b) · cabeçalho do dia numa linha (data por extenso, chip de situação, semana · calendário · linha; Fechar dia
// e ⋮ Mais ações), menu com grupos, teclado, clique fora e travas por perfil (mesmos IDs), barra do dia sem repetição e rodapé com a
// situação da gravação e Abrir hora a hora. Dados fictícios (demonstração), data fixa num dia útil.
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
    await f.waitForSelector('#cabDia #dMais');
    /* 1) cabeçalho numa linha */
    const c = await f.evaluate(() => { const c = document.querySelector('#cabDia'), t = s => (c.querySelector(s) || {}).textContent?.trim();
      return { h3: t('.cab2-tit h3'), sit: t('.cab2-sit'), sub: t('.cab2-sub'), velhos: [...c.querySelectorAll('.kv .l')].map(x => x.textContent.trim()),
        fechar: !!c.querySelector('header #dClose.primary'), linha1: new Set([...c.querySelectorAll('.cab2-tit h3, #dClose, #dMais')].map(x => Math.round(x.getBoundingClientRect().top / 20))).size }; });
    assert.equal(c.h3, 'Quinta-feira, 19/11/2026'); assert.equal(c.sit, 'Em produção'); assert.match(c.sub, /^Semana \d+ · seg–sáb · Vacutainer$/);
    assert.deepEqual(c.velhos.filter(x => /Linha|Calendário|^Data$/.test(x)), [], 'saem Data, Linha · máquina e Calendário'); assert.ok(c.fechar, 'Fechar dia no cabeçalho'); assert.equal(c.linha1, 1, 'data, Fechar dia e Mais ações na mesma linha');
    const barra = await f.evaluate(() => document.querySelector('#main .filters').textContent);
    assert.doesNotMatch(barra, /semana/i, 'a barra do dia não repete semana e situação');
    console.log('ok cabeçalho: ' + c.h3 + ' · ' + c.sit + ' · ' + c.sub + '; Fechar dia e Mais ações na mesma linha; sem repetição na barra');
    /* 2) menu: botão, grupos, mesmos IDs, fechado no DOM */
    const m = await f.evaluate(() => { const b = document.querySelector('#dMais'), mm = document.querySelector('#dMaisMenu');
      return { pop: b.getAttribute('aria-haspopup'), exp: b.getAttribute('aria-expanded'), ctl: b.getAttribute('aria-controls'), oculto: mm.hidden, role: mm.getAttribute('role'),
        grupos: [...mm.querySelectorAll('.cab2-mg > p')].map(p => p.textContent), ids: [...mm.querySelectorAll('[role="menuitem"]')].map(x => x.id), risco: mm.querySelector('.cab2-mg.risco #dDel')?.textContent.trim() }; });
    assert.deepEqual([m.pop, m.exp, m.ctl, m.oculto, m.role], ['menu', 'false', 'dMaisMenu', true, 'menu']);
    assert.deepEqual(m.grupos, ['Ações do dia', 'Correções', 'Consulta', 'Zona de risco']);
    assert.deepEqual(m.ids, ['dPend', 'dOff', 'dMove', 'dEnviar', 'dRestore', 'dReapply', 'kcEdit', 'dayMetas', 'dHist', 'dDel']); assert.equal(m.risco, 'Excluir dia');
    /* teclado: abre com clique (foco no primeiro), ↓ e ↑ circulam, End vai ao último, Esc fecha e devolve o foco */
    await f.click('#dMais'); assert.equal(await f.evaluate(() => [document.querySelector('#dMaisMenu').hidden, document.activeElement.id].join()), 'false,dPend');
    await page.keyboard.press('ArrowDown'); assert.equal(await f.evaluate(() => document.activeElement.id), 'dOff');
    await page.keyboard.press('ArrowUp'); await page.keyboard.press('ArrowUp'); assert.equal(await f.evaluate(() => document.activeElement.id), 'dDel', '↑ no primeiro vai ao último');
    await page.keyboard.press('Home'); assert.equal(await f.evaluate(() => document.activeElement.id), 'dPend');
    await page.keyboard.press('Escape'); assert.equal(await f.evaluate(() => [document.querySelector('#dMaisMenu').hidden, document.querySelector('#dMais').getAttribute('aria-expanded'), document.activeElement.id].join()), 'true,false,dMais');
    await f.focus('#dMais'); await page.keyboard.press('ArrowUp'); assert.equal(await f.evaluate(() => document.activeElement.id), 'dDel', '↑ no botão abre no último');
    await page.keyboard.press('Escape');
    /* clique fora fecha; escolher um item roda a ação e fecha */
    await f.click('#dMais'); await f.click('.cab2-tit h3'); assert.equal(await f.evaluate(() => document.querySelector('#dMaisMenu').hidden), true, 'clique fora fecha');
    await f.click('#dMais'); await f.click('#dHist'); await f.waitForSelector('.modal.on, .overlay, dialog[open]');
    assert.equal(await f.evaluate(() => document.querySelector('#dMaisMenu').hidden), true, 'escolher fecha o menu');
    await page.keyboard.press('Escape'); await f.evaluate(() => document.querySelectorAll('.overlay,.modal.on').forEach(x => x.remove()));
    console.log('ok menu ⋮ Mais ações: grupos, mesmos IDs, ↑/↓/Home/End, Esc, clique fora e fecha depois de escolher');
    /* 3) travas por perfil continuam pelos mesmos IDs, e o teclado pula o que está travado */
    const tr = await f.evaluate(async () => { const orig = vacPodeAqui; vacPodeAqui = fn => !['excluir', 'lancar'].includes(fn) && orig(fn); vacTravas.aplicar(); await new Promise(r => setTimeout(r, 50));
      const out = ['dDel', 'dMove', 'dOff', 'dRestore', 'dEnviar', 'dHist'].map(id => id + ':' + document.getElementById(id).disabled);
      vacPodeAqui = orig; return out; });
    assert.deepEqual(tr, ['dDel:true', 'dMove:true', 'dOff:true', 'dRestore:true', 'dEnviar:false', 'dHist:false']);
    await f.click('#dMais'); await page.keyboard.press('ArrowDown'); assert.equal(await f.evaluate(() => document.activeElement.id), 'dEnviar', 'pula Dia sem produção e Mover, travados');
    await page.keyboard.press('Escape'); await f.evaluate(() => render()); await f.waitForSelector('#cabDia #dMais');
    console.log('ok travas por perfil nos itens do menu (mesmos IDs); o teclado pula os travados');
    /* 4) fechado: Reabrir no lugar de Fechar dia; o menu mostra só o que vale */
    const fe = await f.evaluate(async () => { const d = curDay(); const st = d.status; d.status = 'fechado'; render(); await new Promise(r => setTimeout(r, 100));
      const o = { reabrir: !!document.querySelector('#cabDia header #dReopen'), fechar: !!document.querySelector('#dClose'), sit: document.querySelector('.cab2-sit').textContent.trim(), ids: [...document.querySelectorAll('#dMaisMenu [role="menuitem"]')].map(x => x.id) };
      d.status = st; render(); return o; });
    assert.deepEqual([fe.reabrir, fe.fechar, fe.sit], [true, false, 'Fechado']); assert.deepEqual(fe.ids, ['dEnviar', 'kcEdit', 'dayMetas', 'dHist'], 'dia fechado: sem ações de edição nem Excluir');
    console.log('ok dia fechado: Reabrir e só Enviar relatório, Editar cards, Metas e Histórico');
    /* 5) rodapé: situação da gravação à esquerda e Abrir hora a hora à direita; o botão do hora a hora do dia aparece uma vez só */
    await f.waitForSelector('.lc-rodape');
    const ro = await f.evaluate(() => ({ salvo: document.querySelector('.lc-rodape #lcSalvo').textContent, hh: document.querySelectorAll('[data-hhps=""]').length, noRodape: !!document.querySelector('.lc-rodape [data-hhps=""]'), enviar: document.querySelectorAll('#dEnviar').length }));
    assert.deepEqual(ro, { salvo: 'Alterações salvas', hh: 1, noRodape: true, enviar: 1 });
    await f.click('.lc-rodape [data-hhps=""]'); await f.waitForFunction(() => App.route === 'hourly' || document.querySelector('.hh-grid, #hhGrid, [data-hh]'), null, { timeout: 5000 });
    console.log('ok rodapé: "Alterações salvas" e Abrir hora a hora (um botão só)');
    assert.deepEqual(erros, [], 'sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

// LANC-03 (itens 0 e 1.1) · topo da página Produção: ordem e rótulos das abas, chip de situação, Trocar pasta oculto na Demonstração,
// barra de ações (Voltar e Lançar meu turno à esquerda; Sincronizar, Backup e Modo TV à direita, com ícone e mesma altura; no celular,
// Lançar meu turno primeiro) e o bloco "Resumo do dia" recolhível (expandido por padrão, OEE visível recolhido, só neste navegador).
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const url = 'http://127.0.0.1:' + srv.address().port + '/?demo=1';
    const abrir = async (opts = {}) => {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } }), page = await ctx.newPage(), erros = [];
      page.on('pageerror', e => erros.push(e.message));
      if (opts.semArmazenamento) await page.addInitScript(() => { const g = Storage.prototype.getItem, st = Storage.prototype.setItem, nega = () => { throw new DOMException('bloqueado', 'SecurityError'); };
        Storage.prototype.getItem = function (k) { if (String(k).includes('resumoAberto')) nega(); return g.call(this, k); };
        Storage.prototype.setItem = function (k, v) { if (String(k).includes('resumoAberto')) nega(); return st.call(this, k, v); }; });
      await page.clock.setFixedTime(new Date('2026-11-19T10:00:00'));
      await page.goto(url); await page.getByRole('heading', { name: 'Visão da linha' }).waitFor();
      await page.locator('.sidebar').getByRole('button', { name: 'Produção' }).click();
      await page.waitForSelector('.module-tabs button[data-tab-id="launch"]');
      const f = await (await page.locator('iframe[title="Módulo Produção"]').elementHandle()).contentFrame(); await f.waitForFunction(() => window.vacPagina?.pronto());
      return { ctx, page, f, erros };
    };
    const { ctx, page, f, erros } = await abrir();
    /* abas: ordem e rótulos da imagem; a primeira (Visão geral) abre por padrão */
    const abas = await page.evaluate(() => [...document.querySelectorAll('.module-tabs button')].map(b => { const c = b.cloneNode(true); c.querySelectorAll('.tab-selo').forEach(x => x.remove()); return [b.dataset.tabId, c.textContent.trim()]; }));
    assert.deepEqual(abas.map(a => a[1]), ['Visão geral', 'Lançamento', 'Pendências', 'Paradas', 'Resultados', 'Plano do mês', 'Relatórios', 'Equipamentos', 'Config.', 'Ordens e lotes', 'SQDCP']);
    assert.deepEqual(abas.map(a => a[0]), ['overview', 'launch', 'pend', 'stops', 'history', 'plan', 'reports', 'equip', 'config', 'ordens', 'sqdcp'], 'as rotas não mudam');
    await page.waitForFunction(() => document.querySelector('.module-tabs button.active')?.dataset.tabId === 'overview', null, { timeout: 6000 });
    console.log('ok abas: ordem e rótulos da imagem, rotas iguais; abre em Visão geral');
    /* cabeçalho: chip de situação (Demonstração) que abre o mesmo painel; Trocar pasta fora da Demonstração; ? e Atualizar */
    const chip = page.locator('.heading-actions .status-chip');
    assert.equal((await chip.innerText()).trim(), 'Demonstração'); assert.equal(await chip.getAttribute('aria-label'), 'Status: Demonstração');
    assert.equal(await page.locator('.heading-actions .status-chip .status-dot').count(), 1);
    await chip.click(); await page.getByRole('dialog', { name: 'Status da página' }).waitFor(); await page.keyboard.press('Escape');
    assert.equal(await page.locator('.heading-actions [data-act="connect"]').count(), 0, 'Demonstração: sem Trocar pasta');
    assert.equal(await page.locator('.heading-actions').getByRole('button', { name: 'Atualizar' }).count(), 1);
    console.log('ok cabeçalho: chip de situação abre o Status; Trocar pasta oculto na Demonstração');
    /* barra de ações: esquerda × direita, ícones e altura iguais; os comandos são os do módulo (mesmos IDs) */
    const barra = await page.evaluate(() => {
      const g = s => [...document.querySelectorAll('.engine-commands ' + s + ' > button')].map(b => ({ id: b.dataset.cmd, t: b.textContent.trim(), svg: !!b.querySelector('svg'), h: Math.round(b.getBoundingClientRect().height), x: b.getBoundingClientRect().left }));
      const tb = document.querySelector('.engine-commands').getBoundingClientRect();
      return { esq: g('.engine-commands-esq'), dir: g('.engine-commands-dir'), meio: tb.left + tb.width / 2 };
    });
    assert.deepEqual(barra.esq.map(b => b.id), ['vacVoltar', 'opBtn']); assert.deepEqual(barra.esq.map(b => b.t), ['Voltar', 'Lançar meu turno']);
    assert.deepEqual(barra.dir.map(b => b.id), ['btnSync', 'btnBackup', 'btnTV']); assert.deepEqual(barra.dir.map(b => b.t), ['Sincronizar', 'Backup', 'Modo TV']);
    const todos = barra.esq.concat(barra.dir); assert.ok(todos.every(b => b.svg), 'todos com ícone'); assert.equal(new Set(todos.map(b => b.h)).size, 1, 'mesma altura');
    assert.ok(barra.esq.every(b => b.x < barra.meio) && barra.dir.every(b => b.x > barra.meio), 'esquerda e direita');
    assert.match(await page.locator('.engine-commands [data-cmd="opBtn"]').getAttribute('class'), /dest-laranja/, 'Lançar meu turno em laranja');
    console.log('ok barra de ações: Voltar e Lançar meu turno à esquerda; Sincronizar, Backup e Modo TV à direita, com ícone e mesma altura');
    /* celular: duas linhas, Lançar meu turno primeiro */
    await page.setViewportSize({ width: 420, height: 1000 }); await page.waitForTimeout(400);
    const cel = await page.evaluate(() => [...document.querySelectorAll('.engine-commands button')].map(b => ({ id: b.dataset.cmd, r: b.getBoundingClientRect() })).sort((a, b) => a.r.top - b.r.top || a.r.left - b.r.left).map(b => [b.id, Math.round(b.r.top)]));
    assert.equal(cel[0][0], 'opBtn', 'celular: Lançar meu turno primeiro'); assert.ok(new Set(cel.map(c => c[1])).size >= 2, 'celular: duas linhas');
    await page.setViewportSize({ width: 1440, height: 1000 });
    console.log('ok celular: a barra quebra em duas linhas, com Lançar meu turno primeiro');
    /* Resumo do dia: expandido por padrão; recolher mantém o OEE do dia com o semáforo; o estado fica neste navegador */
    await page.locator('.module-tabs button[data-tab-id="launch"]').click(); await f.waitForSelector('#lcResumo');
    const r0 = await f.evaluate(() => ({ exp: document.querySelector('#lcResTg').getAttribute('aria-expanded'), ctl: document.querySelector('#lcResTg').getAttribute('aria-controls'), cards: document.querySelectorAll('#lcResCorpo .kpis > .kpi').length, linha: document.querySelector('#lcResLinha').hidden }));
    assert.deepEqual([r0.exp, r0.ctl, r0.linha], ['true', 'lcResCorpo', true]); assert.ok(r0.cards >= 6, 'cards dentro do bloco');
    const oee = await f.evaluate(() => { const k = [...document.querySelectorAll('#lcResCorpo .kpis > .kpi')].find(x => /OEE realizado/.test(x.textContent)); return k.querySelector('.v').textContent.trim(); });
    await f.click('#lcResTg');
    const r1 = await f.evaluate(() => ({ exp: document.querySelector('#lcResTg').getAttribute('aria-expanded'), corpo: document.querySelector('#lcResCorpo').hidden, linha: document.querySelector('#lcResLinha').textContent, sem: !!document.querySelector('#lcResLinha .sem'), guardado: localStorage.getItem('vac.oee.resumoAberto') }));
    assert.deepEqual([r1.exp, r1.corpo, r1.guardado], ['false', true, '0']); assert.ok(r1.linha.includes('OEE do dia') && r1.linha.includes(oee), 'OEE do dia visível recolhido: ' + r1.linha); assert.ok(r1.sem, 'semáforo');
    await f.evaluate(() => render()); await f.waitForSelector('#lcResumo');
    assert.equal(await f.evaluate(() => document.querySelector('#lcResCorpo').hidden), true, 'recolhido continua recolhido depois de redesenhar');
    await f.click('#lcResTg'); assert.equal(await f.evaluate(() => localStorage.getItem('vac.oee.resumoAberto')), '1');
    const base = await f.evaluate(() => JSON.stringify(db().settings).includes('resumoAberto') || JSON.stringify(App.prefs).includes('resumoAberto'));
    assert.equal(base, false, 'o estado não vai para a base nem para as preferências');
    assert.deepEqual(erros, [], 'sem erro de JavaScript'); await ctx.close();
    /* sem armazenamento: volta expandido e recolher continua funcionando */
    const s = await abrir({ semArmazenamento: true });
    await s.page.locator('.module-tabs button[data-tab-id="launch"]').click(); await s.f.waitForSelector('#lcResumo');
    assert.equal(await s.f.evaluate(() => document.querySelector('#lcResTg').getAttribute('aria-expanded')), 'true');
    await s.f.click('#lcResTg'); assert.equal(await s.f.evaluate(() => document.querySelector('#lcResCorpo').hidden), true);
    assert.deepEqual(s.erros, [], 'sem armazenamento: sem erro de JavaScript'); await s.ctx.close();
    console.log('ok Resumo do dia: expandido por padrão, recolhe com o OEE do dia e o semáforo, só neste navegador, e sem armazenamento abre expandido');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

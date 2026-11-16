// Rolagem e gráficos (plataforma 1.6.0, Waste 1.12.13). Demonstração, dados fictícios.
// Confere: (1) a tela não pula para o topo quando a página encolhe por um instante (redesenho, sincronização) nem ao fechar uma janela,
// em seis páginas; (2) Waste: gráfico arrastado para outro grupo fica lá (e continua se atualizando), 1/2 lado a lado, 1/3 sem rolagem
// lateral, pílula Exibição oculta e mostra; Pareto por componente e por catálogo são cartões soltos; (3) Comparativos não repete a lista
// de todas as ordens da Visão geral.
const http = require('node:http'), fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { chromium } = require('playwright');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html; charset=utf-8'); r.end(html); });
  await new Promise(r => srv.listen(0, '127.0.0.1', r)); const b = await chromium.launch(require('./chromium.cjs')()); const erros = [];
  const U = 'http://127.0.0.1:' + srv.address().port + '/?demo=1';
  const abre = async (hash, h = 900) => { const p = await b.newPage({ viewport: { width: 1440, height: h } }); p.on('pageerror', e => erros.push(hash + ': ' + e.message)); p.on('dialog', d => d.dismiss());
    await p.goto(U + hash); await p.waitForFunction(() => [...document.querySelectorAll('iframe')].some(f => f.offsetParent && f.contentWindow.vacPagina?.pronto?.()), null, { timeout: 30000 });
    let f; for (const x of p.frames()) if (x.parentFrame() && await x.evaluate(() => !!(window.frameElement && window.frameElement.offsetParent)).catch(() => false)) f = x;
    await p.waitForTimeout(900); return { p, f }; };
  try {
    // 1. a tela fica onde estava
    for (const hash of ['#/perdas', '#/gel', '#/paradas', '#/oee?tab=overview', '#/linha', '#/inicio?tab=situacao']) {
      const { p, f } = await abre(hash); await p.evaluate(() => scrollTo(0, 1500)); const y0 = await p.evaluate(() => scrollY);
      await f.evaluate(async () => { const m = document.querySelector('main') || document.body.firstElementChild, d = m.style.display; m.style.display = 'none'; await new Promise(r => setTimeout(r, 250)); m.style.display = d; });
      await p.waitForTimeout(1000); assert.equal(await p.evaluate(() => scrollY), y0, hash + ': a página encolheu por um instante e a tela pulou');
      await f.evaluate(async () => { const o = document.createElement('div'); o.className = 'overlay'; o.style.cssText = 'position:fixed;inset:0'; document.body.appendChild(o); await new Promise(r => setTimeout(r, 400)); o.remove(); });
      await p.waitForTimeout(1000); assert.equal(await p.evaluate(() => scrollY), y0, hash + ': ao fechar a janela a tela não voltou para onde estava');
      console.log('ok rolagem ' + hash); await p.close();
    }
    // 2. Waste: grade de gráficos
    { const { p, f } = await abre('#/perdas');
      const r = await f.evaluate(async () => { const espera = ms => new Promise(r => setTimeout(r, ms)), it = id => [...document.getElementById(id).children].filter(c => c.dataset.vgKey && c.offsetParent);
        const soltos = ['pareto-por-componente-i', 'pareto-por-catalogo-i'].every(k => document.querySelector('#vkg-perdas-B > [data-vg-key="' + k + '"] > .vg-barra'));
        // arrastar o Pareto do MUV (grupo B) para o grupo A, à direita da Tendência
        const dt = new DataTransfer(), ev = (t, el, x, y) => el.dispatchEvent(new DragEvent(t, { bubbles: true, cancelable: true, dataTransfer: dt, clientX: x, clientY: y }));
        const src = document.querySelector('[data-vg-key="pareto-do-muv-i"]'), dst = document.querySelector('[data-vg-key="tendencia-mensal-do-muv-i"]'), q = dst.getBoundingClientRect();
        ev('dragstart', src.querySelector('.vg-pega'), 5, 5); ev('dragover', dst, q.right - 40, q.top + 40); ev('drop', dst, q.right - 40, q.top + 40); ev('dragend', src, 0, 0); await espera(400);
        const ordemA = it('vkg-perdas-A').sort((a, b) => a.style.order - b.style.order).map(c => c.dataset.vgKey);
        renderAll(); await espera(500); const depois = document.querySelectorAll('[data-vg-key="pareto-do-muv-i"]'), noA = depois.length === 1 && depois[0].parentElement.id === 'vkg-perdas-A' && !!depois[0].querySelector('svg');
        // metade lado a lado; um terço sem rolagem lateral
        const [a1, a2] = it('vkg-perdas-A').sort((a, b) => a.style.order - b.style.order); for (const c of [a1, a2]) c.querySelector(':scope > .vg-barra [data-vg="l3"]').click();
        document.querySelectorAll('#pvBox > [data-vg-key]').forEach(c => c.querySelector(':scope > .vg-barra [data-vg="l2"]').click()); await espera(500);
        const r1 = a1.getBoundingClientRect(), r2 = a2.getBoundingClientRect(), lado = Math.abs(r1.top - r2.top) < 2 && r2.left > r1.right;
        const terco = it('pvBox').map(c => c.getBoundingClientRect().width), rola = [...document.querySelectorAll('#t-painel .vg-it')].filter(c => c.offsetParent && (c.scrollWidth > c.clientWidth + 2 || [...c.querySelectorAll('svg')].some(s => s.getBoundingClientRect().width > c.clientWidth + 2))).map(c => c.dataset.vgKey);
        // Exibição
        const ex = document.querySelector('[data-vg-exibir] .vg-exib'); ex.open = true; const n0 = ex.querySelectorAll('[data-vg-exk]').length;
        ex.querySelector('[data-vg-exk="tendencia-mensal-do-muv-i"]').click(); await espera(300); const oculto = !document.querySelector('[data-vg-key="tendencia-mensal-do-muv-i"]').offsetParent;
        document.querySelector('[data-vg-exibir] [data-vg-exall="1"]').click(); await espera(300); const volta = !!document.querySelector('[data-vg-key="tendencia-mensal-do-muv-i"]').offsetParent;
        return { soltos, ordemA, noA, lado, terco, rola, n0, oculto, volta, txt: document.querySelector('[data-vg-exibir] summary').textContent }; });
      assert.ok(r.soltos, 'Pareto por componente e por catálogo são cartões do grupo, com barra própria');
      assert.deepEqual(r.ordemA.slice(0, 2), ['tendencia-mensal-do-muv-i', 'pareto-do-muv-i'], 'arrastar para outro grupo põe o gráfico ao lado do alvo ' + r.ordemA);
      assert.ok(r.noA, 'depois de redesenhar, o gráfico continua no grupo para onde foi, sem cópia, e desenhado');
      assert.ok(r.lado, 'dois cartões em 1/2 ficam lado a lado');
      assert.ok(r.terco.length === 9 && r.terco.every(w => w < 420), 'três por linha em 1/3 ' + r.terco);
      assert.deepEqual(r.rola, [], 'gráfico em 1/3 cabe no cartão, sem rolagem lateral');
      assert.ok(r.n0 >= 12 && r.oculto && r.volta && /Exibição · \d+ de \d+/.test(r.txt), 'Exibição oculta e mostra os gráficos ' + JSON.stringify(r));
      console.log('ok Waste: arrastar entre grupos, 1/2, 1/3 sem rolagem lateral e Exibição');
      // 3. Comparativos: sem a lista de todas as ordens
      await p.locator('.module-tabs button[data-tab-id="comp"]').click(); await p.waitForTimeout(1200);
      const c = await f.evaluate(async () => { const t0 = document.querySelector('#cOrdTit').textContent, l0 = document.querySelectorAll('#cOrd tr').length;
        document.querySelector('#cRank tr.click').click(); await new Promise(r => setTimeout(r, 300)); return { t0, l0, l1: document.querySelectorAll('#cOrd tr').length, t1: document.querySelector('#cOrdTit').textContent }; });
      assert.ok(/grupo escolhido/.test(c.t0) && c.l0 === 0, 'sem grupo escolhido, Comparativos não repete a lista de todas as ordens ' + JSON.stringify(c));
      assert.ok(c.l1 > 1, 'clicar no Ranking mostra as ordens do grupo');
      console.log('ok Waste › Comparativos: só as ordens do grupo escolhido'); await p.close(); }
    assert.deepEqual(erros, [], 'erro de página');
    console.log('ok rolagem e gráficos');
  } finally { await b.close(); srv.close(); }
})().catch(e => { console.error(e.message || e); process.exitCode = 1; });

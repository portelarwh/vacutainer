// Plataforma 1.8.18 (Produção 2.6.14, Gestão de Gel 2.42) · GEL-07: a Gestão de Gel usa a Produção para tubos bons e OEE em todo dia que ela
// tem; o relatório do Gel mostra OP e lote e ganha Copiar para o Outlook, Texto, Excel e Imprimir; a Produção abre o relatório da Gestão de
// Gel (Relatório do Gel e Perdas de gel) no turno com catálogo de gel e na aba Relatórios, no período escolhido. Dados fictícios (demonstração).
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, permissions: ['clipboard-read', 'clipboard-write'] });
    const page = await ctx.newPage(), erros = [];
    page.on('pageerror', e => erros.push(e.message));
    await page.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1');
    await page.getByRole('heading', { name: 'Visão da linha' }).waitFor();
    const rota = h => { const m = String(h).match(/[?&]rota=([^&]+)/); return m ? decodeURIComponent(m[1]).replace(/^#/, '') : String(h).split('#')[1]; };   // a casca adapta o link ao seu endereço
    const quadro = async t => { const f = await (await page.locator(`iframe[title="${t}"]`).elementHandle()).contentFrame(); return f; };

    // 1) Produção › Relatórios: grupo Gestão de Gel com o período do tipo escolhido
    await page.evaluate(() => { location.hash = '#/oee?tab=reports'; });
    const o = await quadro('Módulo Produção'); await o.waitForFunction(() => window.vacPagina?.pronto());
    const r1 = await o.evaluate(async () => { go('reports'); const R = rpState(); R.type = 'week'; render(); await new Promise(r => setTimeout(r, 400));
      const L = [...document.querySelectorAll('.rp-gel a[data-relgel]')].map(a => ({ k: a.dataset.relgel, h: a.getAttribute('href') })); return { L, week: R.week, fim: U.addDays(R.week, 6) }; });
    assert.equal(r1.L.length, 2, 'Relatório do Gel e Perdas de gel na aba Relatórios');
    assert.equal(rota(r1.L[0].h), 'relgel&de=' + r1.week + '&ate=' + r1.fim, 'período da semana');
    assert.equal(rota(r1.L[1].h), 'relgel&de=' + r1.week + '&ate=' + r1.fim + '&foco=perdas', 'perdas');
    console.log('ok Produção › Relatórios: "Relatório do Gel" e "Perdas de gel" no período escolhido');

    // 2) turno com catálogo de gel: os mesmos atalhos no dia do turno, ao lado do "Scrap gel"
    const r2 = await o.evaluate(async () => { go('launch'); await new Promise(r => setTimeout(r, 300)); const day = curDay(), ps = day.shifts[1]; TurnoResumo.escolher(day, ps.id); render(); await new Promise(r => setTimeout(r, 400));
      const cel = document.querySelector(`section.tl[data-tl="${ps.id}"] .tl-s-scrap`); return { dia: day.date, id: ps.id, L: cel ? [...cel.querySelectorAll('a[data-relgel]')].map(a => a.getAttribute('href')) : [] }; });
    assert.deepEqual(r2.L.map(rota), ['relgel&de=' + r2.dia + '&ate=' + r2.dia, 'relgel&de=' + r2.dia + '&ate=' + r2.dia + '&foco=perdas'], 'atalhos no turno');
    console.log('ok Lançamento: turno com catálogo de gel tem "Relatório do Gel" e "Perdas de gel" do dia');

    // 3) clique em "Perdas de gel": abre a Gestão de Gel com o relatório no dia, seções de perdas
    await o.locator(`section.tl[data-tl="${r2.id}"] .tl-s-scrap a[data-relgel="perdas"]`).click();
    const g = await quadro("Módulo Gestão de Gel"); await g.waitForFunction(() => typeof S !== 'undefined' && S && typeof GelProd !== 'undefined');
    await g.waitForFunction(() => !!document.querySelector('#ov #grOut'), null, { timeout: 15000 });
    const r3 = await g.evaluate(() => ({ de: $('#grF').value, ate: $('#grT').value, modo: $('#grMode').value, secs: ui._gelR.secs, btns: [...document.querySelectorAll('#ov button[id^="gr"]')].map(b => b.textContent.trim()) }));
    assert.equal(r3.de, r2.dia); assert.equal(r3.ate, r2.dia); assert.equal(r3.modo, 'cus');
    assert.deepEqual(r3.secs, ['kpi', 'pareq', 'parmot', 'comp', 'eqd', 'eqmot', 'pes'], 'seções de perdas');
    for (const b of ['Texto', 'Copiar para o Outlook', 'Imprimir', 'Excel', 'Gerar PDF']) assert.ok(r3.btns.includes(b), 'botão ' + b);
    console.log('ok "Perdas de gel" abre o relatório da Gestão de Gel no dia, com as seções de perdas e os botões comuns');

    await g.waitForFunction(() => ui._gelR && ui._gelR.T.oee != null, null, { timeout: 15000 });   // a Produção chega e o relatório se redesenha
    // 4) números da Produção: tubos bons e OEE iguais aos do exports da Produção; OP e lote no relatório, no e-mail e no Excel
    const r4 = await g.evaluate(async dia => {
      const G = ui._gelR, D = GelProd.oee.d, dt = (D.porDiaTurno || []).filter(x => x.dia === dia), boa = dt.reduce((s, x) => s + (+x.boa || 0), 0), cap = dt.reduce((s, x) => s + (+x.cap || 0), 0);
      document.querySelector('#grCom').value = 'Comentário fictício'; document.querySelector('#grCom').dispatchEvent(new Event('input'));
      const d = gelEmail(G, 'Comentário fictício'), txt = vacEmail.texto(d);
      document.querySelector('#grMail').click(); await new Promise(r => setTimeout(r, 300));
      let xl = null; const o = URL.createObjectURL; URL.createObjectURL = b => { xl = b; return o(b); }; await gelXlsx(G); URL.createObjectURL = o;
      const wb = XLSX.read(new Uint8Array(await xl.arrayBuffer()), { type: 'array' }), pd = XLSX.utils.sheet_to_json(wb.Sheets['Por dia'], { header: 1 });
      document.querySelector('#grMode').value = 'det'; document.querySelector('#grMode').dispatchEvent(new Event('change'));
      return { tubes: G.T.tubes, boa, oee: G.T.oee, oeeProd: cap ? boa / cap : null, txt, abas: wb.SheetNames, pd1: pd[1], tela: document.querySelector('#grOut').innerHTML.includes('OP ') };
    }, r2.dia);
    assert.ok(r4.boa > 0, 'dia com produção'); assert.equal(r4.tubes, r4.boa, 'tubos bons da Produção');
    assert.ok(Math.abs(r4.oee - r4.oeeProd) < 1e-9, `OEE da Produção (Σboa/Σcap) ${r4.oee} × ${r4.oeeProd}`);
    assert.match(r4.txt, /Comentário: Comentário fictício/); assert.match(r4.txt, /OP \d+ · lote \S+/); assert.match(r4.txt, /lançados na Produção/);
    assert.deepEqual(r4.abas, ['Resumo', 'Por dia', 'Por turno', 'Pesagens', 'Ordens e lotes']); assert.match(String(r4.pd1[1]), /OP \d+/);
    assert.ok(r4.tela, 'OP e lote na prévia');
    console.log('ok Gestão de Gel: tubos e OEE da Produção; OP e lote na prévia, no e-mail/texto e no Excel');

    // 5) o link já adaptado pela casca navega na casca (antes abria outra plataforma dentro do quadro): "Editar na Produção" do Gel
    await g.evaluate(dia => { document.querySelectorAll('.overlay,#ov').forEach(x => x.remove()); const a = document.createElement('a'); a.id = 'tEditar'; a.textContent = 'Editar na Produção ↗';
      a.href = prodHref('dia=' + dia + '&turno=T1'); document.body.appendChild(a); if (typeof vacDemo !== 'undefined' && vacDemo.href) a.setAttribute('href', vacDemo.href(a.getAttribute('href'))); }, r2.dia);
    await g.locator('#tEditar').click();
    await page.waitForFunction(() => /^#\/oee/.test(location.hash), null, { timeout: 15000 });
    assert.equal(page.frames().filter(x => /\?demo=1#\//.test(x.url()) && x !== page.mainFrame()).length, 0, 'nenhuma plataforma dentro de um quadro');
    console.log('ok link entre módulos já adaptado pela casca navega na casca (Editar na Produção ↗)');

    assert.deepEqual(erros, [], 'sem erro de JavaScript'); console.log('ok relatório do Gel: sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

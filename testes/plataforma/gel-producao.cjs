// Plataforma 1.8.17 (Produção 2.6.13, Gestão de Gel 2.41) · GEL-06: o scrap de gel é lançado na Produção (Lançamento › turno ›
// "Scrap gel", abaixo do "Editar scrap") e a Gestão de Gel mostra para consulta: tubos bons por catálogo com ordem e lote,
// aviso de catálogo que o Gel não reconhece, pesagens do turno e "Editar na Produção" (abre o dia com o turno aberto).
// Dados fictícios (demonstração); equipamento de gel e data de corte simulados só na memória da página.
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
    await page.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1');
    await page.getByRole('heading', { name: 'Visão da linha' }).waitFor();
    await page.evaluate(() => { location.hash = '#/oee?tab=launch'; });
    const o = await (await page.locator('iframe[title="Módulo Produção"]').elementHandle()).contentFrame(); await o.waitForFunction(() => window.vacPagina?.pronto());
    const w = ms => page.waitForTimeout(ms || 500);

    // 1) catálogo com gel e sem equipamento de gel na Administração: o botão aparece, desabilitado, com o motivo
    // (o cenário agora traz equipamentos de gel; aqui eles são tirados só na memória da página)
    const ps2 = await o.evaluate(async () => { const C00 = GelTurno.ctx() || {}; GelTurno.ctx = () => ({ ...C00, equips: () => [], eq: () => null }); const day = curDay(), ps = day.shifts[1]; TurnoResumo.escolher(day, ps.id); render(); await new Promise(r => setTimeout(r, 400)); return ps.id; });
    const b1 = await o.evaluate(id => { const b = document.querySelector(`section.tl[data-tl="${id}"] .tl-s-scrap [data-gelscrap]`); const cel = b && b.closest('.tl-s-scrap');
      return b && { txt: b.textContent.trim(), dis: b.disabled, depoisDoScrap: !!cel.querySelector('[data-scrapturno]') && cel.querySelector('[data-scrapturno]').compareDocumentPosition(b) === 4, motivo: cel.textContent }; }, ps2);
    assert.ok(b1 && b1.txt === 'Scrap gel' && b1.dis && b1.depoisDoScrap, 'botão Scrap gel abaixo do Editar scrap ' + JSON.stringify(b1));
    assert.match(b1.motivo, /Cadastre os equipamentos de pesagem de gel na Administração/);
    console.log('ok Produção: "Scrap gel" abaixo do "Editar scrap", desabilitado sem equipamento de gel na Administração (com o motivo)');

    // 2) com equipamento e data de corte (simulados): habilita e abre o formulário de sempre; antes do corte, desabilita
    const r2 = await o.evaluate(async id => {
      const C0 = GelTurno.ctx(); const eq = { codigo: 'EQ-GEL-T', nome: 'Balança fictícia', tara: 0.5, descs: [{ id: 'd1', comp: 'completo', cat: 'T' }] };
      const fake = { ...C0, equips: () => [eq], eq: c => c === eq.codigo ? eq : null, corte: '2026-11-01' };
      GelTurno.ctx = () => fake; render(); await new Promise(r => setTimeout(r, 400));
      const b = document.querySelector(`section.tl[data-tl="${id}"] .tl-s-scrap [data-gelscrap]`), hab = !b.disabled; b.click(); await new Promise(r => setTimeout(r, 300));
      const modal = !!document.querySelector('.overlay'); document.querySelectorAll('.overlay').forEach(x => x.remove());
      fake.corte = '2026-12-01'; render(); await new Promise(r => setTimeout(r, 400));
      const b2 = document.querySelector(`section.tl[data-tl="${id}"] .tl-s-scrap [data-gelscrap]`);
      return { hab, modal, antes: b2.disabled, motivo: b2.closest('.tl-s-scrap').textContent };
    }, ps2);
    assert.ok(r2.hab && r2.modal, 'habilitado abre o formulário'); assert.ok(r2.antes && /Antes de 01\/12\/2026/.test(r2.motivo), 'antes do corte: Gestão de Gel');
    console.log('ok Produção: com equipamento e a partir do corte abre o formulário; antes do corte fica com a Gestão de Gel');

    // 3) atalho #dia=…&turno=… abre o Lançamento do dia com o turno aberto
    const r3 = await o.evaluate(async () => { const day = curDay(), ps = day.shifts[0]; TurnoResumo.escolher(day, null); go('ordens'); await new Promise(r => setTimeout(r, 300));
      location.hash = '#dia=' + day.date + '&turno=' + encodeURIComponent(ps.snap.code); await new Promise(r => setTimeout(r, 800));
      return { route: App.route, aberto: TurnoResumo.sel && TurnoResumo.sel.id === ps.id }; });
    assert.deepEqual(r3, { route: 'launch', aberto: true }, 'link direto');
    console.log('ok #dia=…&turno=… abre o Lançamento com o turno aberto');

    // 4) Gestão de Gel no dia da Produção (corte simulado): catálogos com ordem e lote, catálogo fora do cadastro e o atalho
    await page.evaluate(() => { location.hash = '#/gel'; });
    const g = await (await page.locator('iframe[title="Módulo Gestão de Gel"]').elementHandle()).contentFrame(); await g.waitForFunction(() => typeof S !== 'undefined' && S && typeof GelProd !== 'undefined');
    await w(1500);
    const r4 = await g.evaluate(async () => {
      await GelProd.ler(); const dia = (GelProd.oee && GelProd.oee.d && (GelProd.oee.d.porDiaCatalogo || []).map(k => k.dia).sort().pop()) || null; if (!dia) return { dia: null };
      GelProd.corte = () => '2026-01-01';
      const L = GelProd.catsDia(dia), h = GelProd.catsHtml(dia);
      const d = { date: dia, turns: { T1: { eq: [] } }, orders: [] }, sc = rgScrapHtml(d, 'T1');
      const L2 = (() => { const cats = S.catalogs; S.catalogs = []; try { return GelProd.catsHtml(dia); } finally { S.catalogs = cats; } })();
      /* revisão do PR #107: ordem que rodou nos dias 17 e 19 não aparece no 18; ordem sem fim real não fica para sempre */
      const D0 = GelProd.oee.d, salvo = D0.porOrdem;
      D0.porOrdem = salvo.concat([{ ordem: '900000001', lote: 'L-A', catalogo: L[0].cat, diasLote: [U2(dia, -1), U2(dia, 1)], inicioReal: U2(dia, -1), fimReal: U2(dia, 1) },
        { ordem: '900000002', lote: 'L-B', catalogo: L[0].cat, diasLote: [], inicioReal: U2(dia, -5), fimReal: null }]);
      function U2(d, k) { const x = new Date(d + 'T12:00:00Z'); x.setUTCDate(x.getUTCDate() + k); return x.toISOString().slice(0, 10); }
      const intruso = GelProd.catsDia(dia)[0].ords.map(o => o.ordem).filter(o => o.startsWith('9000000'));
      D0.porOrdem = salvo;
      return { dia, L, intruso, ordem: /OP 100234567 · lote 6275187/.test(h), editar: /Editar na Produção ↗/.test(sc) && /dia=\d{4}-\d{2}-\d{2}&amp;turno=T1|dia=\d{4}-\d{2}-\d{2}&turno=T1/.test(sc), semCad: /não está no cadastro do Gel/.test(L2) };
    });
    assert.ok(r4.dia, 'dia com produção no exports'); assert.ok(r4.L.length && r4.ordem, 'catálogo com ordem e lote ' + JSON.stringify(r4.L));
    assert.deepEqual(r4.intruso, [], 'só a ordem que rodou no dia (dias do lote)');
    assert.ok(r4.editar, 'Editar na Produção com o dia e o turno'); assert.ok(r4.semCad, 'aviso do catálogo fora do cadastro do Gel');
    console.log('ok Gestão de Gel: tubos por catálogo com OP e lote, aviso de catálogo fora do cadastro e "Editar na Produção" no turno');

    assert.deepEqual(erros, [], 'sem erro de JavaScript'); console.log('ok scrap de gel na Produção: sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

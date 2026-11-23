// Administração 1.9.81 · PAR-LOTE (pedido do responsável, 23/11/2026): códigos de parada em lote, exportar e importar com todos os dados.
// Demonstração: cadastro fictício. O que este teste prova:
//  1. "⇩ Exportar para editar" baixa a planilha com todos os campos; lida de volta sem mudança, nada a gravar;
//  2. "⇧ Importar planilha": a prévia mostra o código novo e as mudanças campo a campo (antes → depois), recusa valor inválido e grava só o marcado;
//  3. "Alterar em lote" › atalho "hora exata ou duração": todos os códigos ficam com Permite duração manual = SIM e Exige horário = NÃO;
//  4. as gravações entram na auditoria; nenhum erro de JavaScript.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const page = await browser.newPage({ viewport: { width: 1500, height: 950 }, acceptDownloads: true }), erros = [];
    page.on('pageerror', e => erros.push(e.message)); page.on('dialog', d => d.accept());
    await page.clock.setFixedTime(new Date('2026-11-19T10:00:00'));
    await page.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1#/portal');
    const f = await (await page.locator('iframe[title="Módulo Administração"]').elementHandle({ timeout: 60000 })).contentFrame();
    await f.waitForFunction(() => typeof Cad !== 'undefined' && Cad.D && typeof ParLote === 'object');
    await f.evaluate(() => { location.hash = '#cadastros/paradas'; }); await f.waitForSelector('#parExp');
    const pode = await f.evaluate(() => Cad.podeEditar(true));
    assert.ok(pode && await f.locator('#parLote').count() && await f.locator('#parImp').count(), 'botões de exportar, importar e alterar em lote');

    // 1) exportar e ler de volta sem mudança
    const [dl] = await Promise.all([page.waitForEvent('download'), f.click('#parExp')]);
    assert.match(dl.suggestedFilename(), /^Codigos_de_parada_\d{4}-\d{2}-\d{2}\.xlsx$/);
    const rt = await f.evaluate(async () => { const D = Cad.D, C = ParLote.colunas(D), rows = [C].concat(D.paradas.map(it => C.map(k => ParLote.celula(k, it[k]))));
      const P = ParLote.plano(D, rows, 'ida-e-volta.xlsx'); return { cols: C.length, campos: ['codigo', 'nome', 'pilar', 'exigeHorario', 'duracaoManual', 'ativo'].every(k => C.includes(k)), n: P.L.length, mudam: P.L.filter(x => !x.igual).length }; });
    assert.ok(rt.campos && rt.n > 0 && rt.mudam === 0, 'exportar e importar sem mudança: nada muda ' + JSON.stringify(rt));
    console.log('ok ⇩ Exportar para editar: planilha com ' + rt.cols + ' colunas (todos os campos); importada de volta sem mudança, nada a gravar');

    // 2) importar com mudanças, um novo e um inválido
    const P2 = await f.evaluate(() => { const D = Cad.D, C = ParLote.colunas(D), it0 = D.paradas[0], it1 = D.paradas[1];
      const linha = (it, mud) => C.map(k => k in mud ? mud[k] : ParLote.celula(k, it[k]));
      const rows = [C, linha(it0, { nome: it0.nome + ' (teste)', exigeHorario: 'NÃO', duracaoManual: 'SIM' }), linha(it1, { pilar: 'X' }), C.map(k => ({ codigo: 'ZZT', nome: 'Parada de teste (fictícia)', pilar: 'D', afetaD: 'SIM' })[k] ?? '')];
      window.__P = ParLote.plano(D, rows, 'teste.xlsx'); ParLote.prevImportar(D, window.__P, () => {});
      return window.__P.L.map(x => ({ cod: x.cod, novo: !!x.novo, erros: x.erros.length, mud: x.mud ? Object.keys(x.mud).sort() : null, marcado: x.marcado })); });
    assert.equal(P2.length, 3); assert.ok(P2[0].mud.includes('nome') && P2[0].mud.includes('duracaoManual'), 'mudanças do alterado ' + JSON.stringify(P2[0]));
    assert.ok(P2[0].marcado && P2[1].erros === 1 && !P2[1].marcado && P2[2].novo && P2[2].marcado, 'alterado, inválido e novo ' + JSON.stringify(P2));
    const prev = await f.evaluate(() => ({ txt: document.querySelector('#plBox').textContent, ok: document.querySelector('#plOk').textContent }));
    assert.match(prev.txt, /novo/); assert.match(prev.txt, /→/); assert.match(prev.txt, /não é um valor aceito/); assert.equal(prev.ok.trim(), 'Gravar 2 código(s)');
    await f.click('#plOk'); await page.waitForTimeout(500);
    const g = await f.evaluate(cod0 => { const D = Cad.D, a = D.paradas.find(x => x.codigo === cod0), z = D.paradas.find(x => x.codigo === 'ZZT');
      return { nome: a.nome, dm: a.duracaoManual, eh: !!a.exigeHorario, z: z && [z.nome, z.pilar, z.afetaD, z.ativo], aud: (D.auditoria || []).filter(x => /importação em lote/.test(x.motivo || '')).length }; }, P2[0].cod);
    assert.ok(/\(teste\)$/.test(g.nome) && g.dm === true && g.eh === false && JSON.stringify(g.z) === JSON.stringify(['Parada de teste (fictícia)', 'D', true, true]) && g.aud >= 2, 'gravou o alterado e o novo, com auditoria ' + JSON.stringify(g));
    console.log('ok ⇧ Importar planilha: prévia com o novo, as mudanças (antes → depois) e o erro; grava só o marcado, com auditoria');

    // 3) alterar em lote: atalho hora exata ou duração para todos
    await f.evaluate(() => { location.hash = '#cadastros/paradas'; App.render(); }); await f.waitForSelector('#parLote'); await f.click('#parLote');
    await f.click('#plAt'); const btn = await f.textContent('#plOk'); await f.click('#plOk'); await page.waitForTimeout(500);
    const todos = await f.evaluate(() => Cad.D.paradas.filter(x => x.ativo !== false).every(x => x.duracaoManual === true && !x.exigeHorario));
    assert.ok(todos, 'todos com duração manual e sem exigir horário (' + btn.trim() + ')');
    console.log('ok Alterar em lote › atalho: todos os códigos permitem hora exata ou só a duração (' + btn.trim() + ')');

    assert.deepEqual(erros, [], 'sem erro de JavaScript'); console.log('ok sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });

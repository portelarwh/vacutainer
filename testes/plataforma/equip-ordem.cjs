// Portal 1.9.51 (plataforma 1.8.20) · EQ-ORD: Administração › Cadastros › Equipamentos. Reorganizar do primeiro ao último (a Linha é a
// posição 0, sempre no topo): arrastar pela alça (ponteiro: mouse e toque) renumera os ativos 1..N; digitar na ficha uma posição ocupada
// empurra quem está nela e os seguintes +1. Tabela sem Fabricante/modelo, Comp. e Docs, com a foto ao lado do Código MES. Equipamento de
// gel mostra os dados do formato (Parâmetros › Gestão de Gel) com o link para alterar. Dados fictícios (demonstração).
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }), erros = [], dialogos = [];
    page.on('pageerror', e => erros.push(e.message)); page.on('dialog', d => { dialogos.push(d.message()); d.accept(); });
    await page.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1');
    await page.getByRole('heading', { name: 'Visão da linha' }).waitFor();
    await page.evaluate(() => { location.hash = '#/portal'; });
    const f = await (await page.locator('iframe[title="Módulo Administração"]').elementHandle()).contentFrame(); await f.waitForFunction(() => typeof Cad !== 'undefined' && Cad.D);
    const w = ms => page.waitForTimeout(ms || 500);
    const pos = () => f.evaluate(() => Object.fromEntries(Cad.D.equipamentos.map(q => [q.codigo, q.posicao ?? null])));
    const ordemTela = () => f.evaluate(() => [...document.querySelectorAll('tr[data-cod]')].map(r => r.dataset.cod));

    // 0) a Linha (posição 0) no cadastro fictício e uma foto simulada (sem pasta, a foto vem da memória da página)
    await f.evaluate(async () => { await Cad.ops([{ acao: 'criação', tipo: 'equipamentos', codigo: 'LINHA', item: { codigo: 'LINHA', nome: 'Linha inteira', linha: (Cad.D.equipamentos[0] || {}).linha || null, posicao: 0, tipo: 'linha', papel: 'linha', ativo: true, dados: {} }, motivo: 'teste' }]);
      const q = Cad.D.equipamentos.find(x => x.codigo === 'EQ02'); await Cad.ops([{ acao: 'edição', tipo: 'equipamentos', codigo: 'EQ02', mudancas: { foto: { antes: q.foto ?? null, depois: 'Equipamentos/EQ02/foto.png' } }, motivo: 'teste' }]);
      EqFiles.url = async () => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='; });
    await f.evaluate(() => { location.hash = '#cadastros/equipamentos'; }); await w(1200);

    // 1) tabela: colunas e foto ao lado do Código MES; a Linha (0) no topo, fixa
    const t1 = await f.evaluate(() => ({ th: [...document.querySelectorAll('table.eq-dnd tr:first-child th')].map(x => x.textContent.trim()), img: !!document.querySelector('tr[data-cod="EQ02"] img.eq-mini'), linha: document.querySelector('tr[data-cod]').dataset.cod, fixo: !!document.querySelector('tr[data-cod="LINHA"] td.eq-h:not([data-arrasta])') }));
    assert.deepEqual(t1.th.slice(1, 8), ['Pos.', 'Código', 'Código MES', 'Foto', 'Nome', 'Tipo', 'Papel'], 'colunas ' + JSON.stringify(t1.th));
    assert.ok(!t1.th.some(x => /Fabricante|Comp\.|Docs/.test(x)), 'sem Fabricante/modelo, Comp. e Docs');
    assert.ok(t1.img, 'miniatura da foto'); assert.equal(t1.linha, 'LINHA', 'Linha (posição 0) no topo'); assert.ok(t1.fixo, 'Linha sem alça');
    console.log('ok tabela: Pos., Código, Código MES, Foto (miniatura), Nome, Tipo, Papel; a Linha (0) no topo e fixa');

    // 2) arrastar EQ12 para antes do EQ03 com o ponteiro: os ativos ficam 1..N e a Linha 0
    const h = f.locator('tr[data-cod="EQ12"] td.eq-h'); await h.scrollIntoViewIfNeeded(); const a = await h.boundingBox(), d = await f.locator('tr[data-cod="EQ03"]').boundingBox();
    await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down(); await page.mouse.move(a.x + 8, a.y - 10, { steps: 4 }); await page.mouse.move(d.x + 300, d.y + 4, { steps: 12 }); await page.mouse.up(); await w(900);
    assert.match(dialogos.pop() || '', /Reorganizar a linha: \d+ equipamento\(s\) mudam de posição/);
    const p2 = await pos();
    assert.equal(p2.LINHA, 0); assert.deepEqual([p2.EQ01, p2.EQ02, p2.EQ12, p2.EQ03, p2.EQ11], [1, 2, 3, 4, 12], JSON.stringify(p2));
    assert.deepEqual((await ordemTela()).slice(0, 5), ['LINHA', 'EQ01', 'EQ02', 'EQ12', 'EQ03']);
    console.log('ok arrastar e soltar: EQ12 antes do EQ03; ativos renumerados 1..12, Linha 0');

    // 3) ficha: EQ11 na posição 3 (ocupada pelo EQ12): EQ12 e os seguintes em sequência andam +1; a posição 0 é recusada
    await f.evaluate(() => Ficha.abrir('equipamentos', 'EQ11')); await w(400);
    await f.fill('#fBox [data-p="posicao"]', '0'); await f.locator('#fBox [data-p="posicao"]').dispatchEvent('change'); await f.click('#fSalvar'); await w(300);
    assert.match(await f.locator('#fErr').textContent(), /posição 0 é da linha inteira/);
    await f.fill('#fBox [data-p="posicao"]', '3'); await f.locator('#fBox [data-p="posicao"]').dispatchEvent('change'); await f.click('#fSalvar'); await w(700);
    assert.match(dialogos.pop() || '', /A posição 3 já é de EQ12[\s\S]*andam \+1/);
    const p3 = await pos();
    assert.deepEqual([p3.EQ01, p3.EQ02, p3.EQ11, p3.EQ12, p3.EQ03, p3.EQ10], [1, 2, 3, 4, 5, 12], JSON.stringify(p3));
    const aud = await f.evaluate(() => ((Cad.D.auditoria || []).concat(Cad.fila || [])).filter(a => a.tipo === 'equipamentos' && (a.campo === 'posicao' || (a.mudancas && a.mudancas.posicao))).length);
    assert.ok(aud >= 12 + 10, 'cada mudança de posição fica na auditoria do cadastro ' + aud);
    console.log('ok ficha: posição 3 ocupada → EQ12 e os seguintes +1 (EQ10 vai a 12); posição 0 recusada; tudo na fila/auditoria');
    await f.evaluate(() => Modal.close(true));

    // 4) gel: ficha do equipamento de gel mostra os dados do formato e o link leva aos Parâmetros › Gestão de Gel
    const g = await f.evaluate(async () => { let q = Cad.D.equipamentos.find(x => x.categoria === 'gel'); if (q) return q.codigo;   /* a demonstração não tem: o EQ03 (dispensor de gel) vira categoria Gel só nesta página */
      q = Cad.D.equipamentos.find(x => x.codigo === 'EQ03'); await Cad.ops([{ acao: 'edição', tipo: 'equipamentos', codigo: 'EQ03', mudancas: { categoria: { antes: q.categoria ?? null, depois: 'gel' } }, motivo: 'teste' }]); return 'EQ03'; });
    assert.ok(g, 'equipamento de gel na demonstração');
    await f.evaluate(c => Ficha.abrir('equipamentos', c), g); await w(400);
    const t4 = await f.evaluate(() => { const n = document.querySelector('#fBox [data-irpar="gel"]'); const box = n && n.closest('.note'); return { link: !!n, txt: box ? box.textContent.replace(/\s+/g, ' ') : '' }; });
    assert.ok(t4.link, 'link para alterar'); assert.match(t4.txt, /Saco da pesagem\s*75 g/); assert.match(t4.txt, /Folha da purga\s*5 g/); assert.match(t4.txt, /Sobra no barril\s*–\s*descarte/); assert.match(t4.txt, /Tubo 100\s*4,779/);
    await f.click('#fBox [data-irpar="gel"]'); await w(900);
    const t5 = await f.evaluate(() => ({ hash: location.hash, sec: Cad.ui.sec, gel: !!document.querySelector('#parGel'), ficha: Ficha.aberta() }));
    assert.deepEqual(t5, { hash: '#cadastros/parametros/gel', sec: 'parametros', gel: true, ficha: false });
    console.log('ok gel: dados do formato (saco, folha, sobra e composição) na ficha; o link abre Parâmetros › Gestão de Gel');

    assert.deepEqual(erros, [], 'sem erro de JavaScript'); console.log('ok equipamentos: sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

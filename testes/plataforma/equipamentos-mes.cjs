// Plataforma 1.8.5 (Administração 1.9.46) · EQP-02 e ADM-01 com dados fictícios da demonstração.
// - importação da planilha do MES: liga por Código MES / outro nome / nome igual; parecido só sugere; empate fica para escolher;
//   grava Código MES, Departamento e Work Center; nome trocado guarda o anterior em Outros nomes; novo recebe o próximo EQ; nada é apagado;
// - Editar visível na lista e motivo quando a edição está bloqueada;
// - conexão da Administração que falha diz o motivo (a casca mostra "Tentar conexão novamente").
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
const TSV = ['Resource Name\tDescription\tDepartment\tWork Center\tResource Type',
  'VACUTAINER_MONT_EMB\tMONTAGEM E EMBALAGEM VACUTAINER\tPAS_TUBOS_VACUTAINER\tP3050503\t1 - Collection',
  'VATU01\tTULLIP A\tPAS_TUBOS_VACUTAINER\tP3050503\t2 - Singular',
  'VASS01\tSPRAY SILICA\tPAS_TUBOS_VACUTAINER\tP3050503\t2 - Singular',
  'VAEC06\tELEVADOR #6 - CAP PLACER\tPAS_TUBOS_VACUTAINER\tP3050503\t2 - Singular',
  'VATP01\tCAP PLACER - CARREGADOR TAMPAS\tPAS_TUBOS_VACUTAINER\tP3050503\t2 - Singular',
  'VAMR01\tMETRO - MONTADORA ROLHA - LADO 1\tPAS_TUBOS_VACUTAINER\tP3050503\t2 - Singular',
  'VALR01\tLAVADORA ROLHA - STOPPER WASHER\tPAS_TUBOS_VACUTAINER\tP3050503\t2 - Singular'].join('\n');
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
    await page.evaluate(() => { location.hash = '#/portal'; });
    const el = page.locator('iframe[title="Módulo Administração"]'); await el.waitFor();
    const f = await (await el.elementHandle()).contentFrame(); await f.waitForFunction(() => typeof EqMes !== 'undefined' && typeof Cad !== 'undefined' && Cad.D);

    // 1) correspondência
    const S = await f.evaluate(t => Object.fromEntries(EqMes.sugerir(EqMes.ler(t), Cad.D).linhas.map(r => [r.mes, { cod: r.cod, por: r.por, aviso: r.aviso || '' }])), TSV);
    assert.equal(S.VATU01.cod, 'EQ01'); assert.equal(S.VATU01.por, 'nome igual');
    assert.equal(S.VASS01.cod, 'EQ08'); assert.match(S.VASS01.por, /sugestão/, 'parecido vira sugestão para conferir');
    assert.equal(S.VAEC06.cod, '', 'empate (Cap Placer) fica para escolher'); assert.equal(S.VATP01.cod, '');
    assert.equal(S.VAMR01.cod, '', 'pouco parecido não é ligado');
    assert.match(S.VACUTAINER_MONT_EMB.aviso, /LINHA/, 'Collection procura a LINHA');
    console.log('ok importação MES: nome igual liga, parecido sugere, empate e pouco parecido ficam para escolher, Collection = LINHA');

    // 2) aplicar: atualiza, troca nome guardando o anterior, cria novo com próximo EQ, ignora sem escolha; nada apagado
    const R = await f.evaluate(async t => {
      const n0 = Cad.D.equipamentos.length, P = EqMes.sugerir(EqMes.ler(t), Cad.D);
      Object.assign(P.linhas.find(r => r.mes === 'VATP01'), { cod: 'EQ06', troca: true }); P.linhas.find(r => r.mes === 'VALR01').cod = '+';
      const O = EqMes.ops(P, Cad.D); await Cad.ops(O);
      const q = c => Cad.D.equipamentos.find(x => x.codigo === c), novo = Cad.D.equipamentos.find(x => x.codigoMes === 'VALR01');
      return { n0, n1: Cad.D.equipamentos.length, eq01: q('EQ01'), eq08: q('EQ08'), eq06: q('EQ06'), novo, sem: Cad.D.equipamentos.some(x => x.codigoMes === 'VAMR01') };
    }, TSV);
    assert.equal(R.eq01.codigoMes, 'VATU01'); assert.equal(R.eq01.departamento, 'PAS_TUBOS_VACUTAINER'); assert.equal(R.eq01.centroTrabalho, 'P3050503');
    assert.equal(R.eq08.nome, 'SPRAY SILICA'); assert.match(R.eq08.apelidos, /Silica spray coater/, 'nome anterior em Outros nomes');
    assert.equal(R.eq06.codigoMes, 'VATP01'); assert.equal(R.eq06.nome, 'CAP PLACER - CARREGADOR TAMPAS');
    assert.ok(R.novo && /^EQ\d+$/.test(R.novo.codigo) && R.novo.nome === 'LAVADORA ROLHA - STOPPER WASHER', 'novo com o próximo EQ');
    assert.equal(R.n1, R.n0 + 1, 'só o novo entra; nada é apagado'); assert.ok(!R.sem, 'linha sem escolha não entra');
    console.log('ok importação MES: grava Código MES, Departamento e Work Center; nome anterior em Outros nomes; novo ' + R.novo.codigo + '; nada apagado');

    // 3) Código MES não repete
    const dup = await f.evaluate(() => cadValidarItem('equipamentos', { ...Cad.D.equipamentos.find(x => x.codigo === 'EQ02'), codigoMes: 'vatu01' }, Cad.D));
    assert.ok(dup.some(e => /já é de outro equipamento/.test(e)), 'Código MES repetido é recusado');
    console.log('ok Código MES repetido é recusado');

    // 4) Editar visível na lista; bloqueada, a lista e a ficha dizem o motivo
    await f.evaluate(() => { location.hash = '#cadastros/equipamentos'; }); await f.waitForSelector('[data-abrir]');
    assert.equal(await f.locator('[data-abrir]').first().textContent(), 'Editar', 'botão Editar em cada linha');
    const bl = await f.evaluate(async () => { const o = Store.mode; Store.mode = 'local'; App.render(); await new Promise(r => setTimeout(r, 300));
      const nota = (document.querySelector('.note.w') || {}).textContent || '', bt = (document.querySelector('[data-abrir]') || {}).textContent;
      Ficha.abrir('equipamentos', 'EQ01'); await new Promise(r => setTimeout(r, 300)); const ficha = (document.querySelector('#fBox .note.w') || {}).textContent || '';
      Store.mode = o; App.render(); return { nota, bt, ficha }; });
    assert.match(bl.nota, /Somente leitura: Conecte a pasta/); assert.equal(bl.bt, 'Ver'); assert.match(bl.ficha, /Somente leitura: Conecte a pasta/);
    console.log('ok edição bloqueada: lista e ficha dizem o motivo ("' + bl.nota.trim().slice(0, 60) + '…")');

    // 5) ADM-01: conexão que falha guarda o motivo e conectar avisa a casca
    const cx = await f.evaluate(async () => { const o = { dir: Store.dir, mode: Store.mode };
      const ok = await Store._connect({ queryPermission: async () => 'denied', requestPermission: async () => 'denied' }, {});
      const motivo = Store.motivo; Object.assign(Store, o); return { ok, motivo }; });
    assert.equal(cx.ok, false); assert.match(cx.motivo, /permissão/);
    console.log('ok ADM-01: falha de conexão com motivo (' + cx.motivo + ')');

    assert.deepEqual(erros, [], 'sem erro de JavaScript'); console.log('ok equipamentos MES: sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

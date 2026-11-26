// Carga por tabela (26/11/2026): cada tabela de cadastro tem ⇩ Modelo e ⇧ Importar planilha. Demonstração, dados fictícios. Prova:
//  1. ⇩ Modelo baixa a planilha; o que ela traz, lido de volta, não muda nada em nenhuma das 10 tabelas;
//  2. importar em ordem (linha, família, equipamento, catálogo, material, componente, turno, calendário): a prévia mostra novos e erros,
//     grava só o marcado, com auditoria, e o item novo nasce com UMA vigência (catálogo e turno);
//  3. item existente: só o cabeçalho muda; a vigência gravada não muda (aviso para usar a ficha); célula vazia não apaga;
//  4. valor inválido, referência inexistente e código repetido ficam como erro e não gravam; nenhum erro de JavaScript.
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
    await f.waitForFunction(() => typeof Cad !== 'undefined' && Cad.D && typeof CargaTab === 'object');
    await f.evaluate(() => { location.hash = '#cadastros/linhas'; }); await f.waitForSelector('#cgMod');
    assert.ok(await f.evaluate(() => Cad.podeEditar(true)) && await f.locator('#cgImp').count(), 'botões Modelo e Importar');

    // 1) modelo e ida e volta sem mudança em todas as tabelas
    const [dl] = await Promise.all([page.waitForEvent('download'), f.click('#cgMod')]);
    assert.match(dl.suggestedFilename(), /^Carga_linhas_\d{4}-\d{2}-\d{2}\.xlsx$/);
    const rt = await f.evaluate(() => CARGA_T.map(t => { const D = Cad.D, C = CargaTab.colsT(t), hoje = todayISO(), T = CAD_T[t];
      const rows = [C.map(c => c.k)].concat((D[t] || []).map(it => { const v = T.vig ? vigEm(it.vigencias, hoje) || (it.vigencias || []).slice(-1)[0] || {} : {}; return C.map(c => c.k === 'vigDe' ? (v.de || '') : c.v ? CargaTab.celula(c, v[c.k]) : CargaTab.celula(c, it[c.k])); }));
      const P = CargaTab.plano(t, D, rows, 'volta.xlsx'); return [t, (D[t] || []).length, P.erro || P.L.filter(x => x.erros.length || (x.mud && Object.keys(x.mud).length) || x.novo).map(x => x.cod + ':' + (x.erros[0] || Object.keys(x.mud || {}).join(','))).join(' | ')]; }));
    for (const [t, n, dif] of rt) assert.equal(dif, '', `${t} (${n}): ida e volta sem mudança — ${dif}`);
    console.log('ok ⇩ Modelo: 10 tabelas lidas de volta sem mudança (' + rt.map(x => x[0] + '=' + x[1]).join(' ') + ')');

    // 2) importar em ordem
    const nov = await f.evaluate(() => {
      const D = Cad.D, ln = D.linhas[0].codigo, run = (t, header, linhas) => { const P = CargaTab.plano(t, Cad.D, [header].concat(linhas), 'carga.xlsx'); if (P.erro) return { erro: P.erro }; const ops = CargaTab.ops(P); const res = { novos: P.L.filter(x => x.novo && !x.erros.length).length, erros: P.L.filter(x => x.erros.length).map(x => x.erros[0]) }; if (ops.length) Cad.ops(ops); return res; };
      const out = {};
      out.linha = run('linhas', ['codigo', 'nome', 'unidade', 'setor'], [['LCARGA', 'Linha de carga (fictícia)', 'Unidade X', 'Setor Y']]);
      out.familia = run('familias', ['codigo', 'nome', 'cor'], [['FCARGA', 'Família de carga', '#112233'], ['FRUIM', 'Família ruim', 'azul']]);
      out.equip = run('equipamentos', ['codigo', 'nome', 'linha', 'tipo'], [['ECARGA1', 'Equipamento 1', 'LCARGA', 'equipamento'], ['ECARGA2', 'Equipamento 2', 'LCARGA', 'equipamento'], ['EREF', 'Sem linha', 'NAOEXISTE', 'equipamento']]);
      out.cat = run('catalogos', ['codigo', 'nome', 'tipoItem', 'familia', 'linha', 'vigDe', 'pphNominal', 'tubosPorCaixa'], [['999001', 'Catálogo de carga', 'tubo', 'FCARGA', 'LCARGA', '2026-11-01', '60.000', '1000'], ['12', 'Catálogo curto', 'tubo', '', ln, '', '', '']]);
      out.mat = run('materiais', ['codigo', 'nome', 'unidade', 'tipo'], [['MCARGA', 'Material de carga', 'un', 'rolha']]);
      out.turno = run('turnos', ['codigo', 'nome', 'linha', 'vigDe', 'inicio', 'fim', 'dias'], [['TCARGA', 'Turno de carga', 'LCARGA', '2026-11-01', '06:00', '14:30', '1,2,3,4,5,6']]);
      out.tag = run('tagsMapa', ['codigo', 'nome', 'tag', 'vigDe', 'estado', 'categoria', 'prioridade'], [['TGC1', 'Falha de carga', 'FAULT', '2026-11-01', 'parada', 'Falha', '1'], ['TGC2', 'Estado ruim', '', '2026-11-01', 'voando', '', '']]);
      out.cal = run('calendario', ['codigo', 'tipo', 'nome'], [['26/12/2026', 'sem produção', 'Carga de calendário']]);
      return out;
    });
    await page.waitForTimeout(600);
    assert.equal(nov.linha.novos, 1); assert.equal(nov.familia.novos, 1); assert.match(nov.familia.erros[0], /cor/i);
    assert.equal(nov.equip.novos, 2); assert.match(nov.equip.erros[0], /não existe em Linhas/);
    assert.equal(nov.cat.novos, 1); assert.match(nov.cat.erros[0], /6 dígitos/);
    assert.equal(nov.tag.novos, 1); assert.match(nov.tag.erros[0], /Estado macro/);
    assert.equal(nov.mat.novos, 1); assert.equal(nov.turno.novos, 1); assert.equal(nov.cal.novos, 1);
    const g = await f.evaluate(() => { const D = Cad.D, c = D.catalogos.find(x => x.codigo === '999001'), t = D.turnos.find(x => x.codigo === 'TCARGA'), q = D.equipamentos.filter(x => /^ECARGA/.test(x.codigo));
      return { c: c && [c.vigencias.length, c.vigencias[0].de, c.vigencias[0].pphNominal, c.vigencias[0].tubosPorCaixa], t: t && [t.vigencias.length, t.vigencias[0].inicio, t.vigencias[0].fim, t.vigencias[0].dias.join('')], pos: q.map(x => x.posicao).sort(), cal: !!D.calendario.find(x => x.codigo === '2026-12-26'), l: !!D.linhas.find(x => x.codigo === 'LCARGA'), aud: (D.auditoria || []).filter(x => /carga por tabela/.test(x.motivo || '')).length }; });
    assert.deepEqual(await f.evaluate(() => { const t = Cad.D.tagsMapa.find(x => x.codigo === 'TGC1'); return t && [t.tag, t.vigencias.length, t.vigencias[0].estado, t.vigencias[0].prioridade]; }), ['FAULT', 1, 'parada', 1], 'tag da linha do tempo com uma vigência');
    assert.deepEqual(g.c, [1, '2026-11-01', 60000, 1000], 'catálogo com uma vigência'); assert.deepEqual(g.t, [1, '06:00', '14:30', '123456'], 'turno com uma vigência');
    assert.equal(new Set(g.pos).size, 2, 'posições dos equipamentos novos diferentes'); assert.ok(g.cal && g.l && g.aud >= 7, 'calendário, linha e auditoria ' + JSON.stringify(g));
    console.log('ok ⇧ Importar: linha, família, equipamentos, catálogo, material, turno e calendário gravados; inválidos recusados; uma vigência; auditoria');

    // 3) existente: só o cabeçalho; vigência não muda; vazio não apaga; prévia pela tela
    await f.evaluate(() => { location.hash = '#cadastros/catalogos'; App.render(); }); await f.waitForSelector('#cgImp', { state: 'attached' });
    const e = await f.evaluate(() => { const P = CargaTab.plano('catalogos', Cad.D, [['codigo', 'nome', 'familia', 'pphNominal', 'vigDe'], ['999001', 'Catálogo de carga (renomeado)', '', '99.000', '2026-11-01']], 'edita.xlsx'); window.__P = P; CargaTab.prev(P, () => {});
      return { mud: Object.keys(P.L[0].mud), avisos: P.L[0].avisos, txt: document.querySelector('#cgBox').textContent }; });
    assert.deepEqual(e.mud, ['nome'], 'só o nome muda; família vazia não apaga'); assert.deepEqual(e.avisos, ['pphNominal']); assert.match(e.txt, /→/); assert.match(e.txt, /use a ficha/);
    await f.click('#cgOk'); await page.waitForTimeout(500);
    const h = await f.evaluate(() => { const c = Cad.D.catalogos.find(x => x.codigo === '999001'); return [c.nome, c.familia, c.vigencias.length, c.vigencias[0].pphNominal]; });
    assert.deepEqual(h, ['Catálogo de carga (renomeado)', 'FCARGA', 1, 60000], 'nome mudou; família e vigência intactas');
    console.log('ok item existente: só o cabeçalho muda; vigência gravada intacta (aviso); célula vazia não apaga');

    // 3b) só o período difere: a linha continua na prévia (aviso), sem caixa para gravar; MES repetido dentro do lote é erro
    const pv = await f.evaluate(() => { const P = CargaTab.plano('catalogos', Cad.D, [['codigo', 'pphNominal'], ['999001', '99.000']], 'periodo.xlsx'); CargaTab.prev(P, () => {});
      const txt = document.querySelector('#cgBox').textContent, caixa = !!document.querySelector('[data-cg]'); document.querySelector('#cgCanc').click();
      const Q = CargaTab.plano('equipamentos', Cad.D, [['codigo', 'nome', 'linha', 'codigoMes'], ['EMES1', 'A', 'LCARGA', 'RES-9'], ['EMES2', 'B', 'LCARGA', 'res-9']], 'mes.xlsx');
      return { txt, caixa, igual: P.L[0].igual, mes: Q.L.map(x => x.erros[0] || 'ok') }; });
    assert.ok(pv.igual && !pv.caixa && /use a ficha/.test(pv.txt) && !/Nada muda/.test(pv.txt), 'linha só com período aparece na prévia: ' + pv.txt.slice(0, 200));
    assert.match(pv.mes[0], /RES-9 ficaria em mais de um equipamento/); assert.match(pv.mes[1], /RES-9 ficaria em mais de um equipamento/);   /* as duas linhas ficam sem gravar: o conflito é das duas */
    // o lote que libera um MES e o entrega a outro equipamento passa; o que toma um MES de quem continua com ele é erro
    const tr = await f.evaluate(() => { const D = Cad.D, E = D.equipamentos.filter(e => e.codigo !== 'LINHA').slice(0, 3); if (E.length < 3) return null;
      const a = E[0], b = E[1], c = E[2]; a.codigoMes = 'MES-A'; b.codigoMes = null; c.codigoMes = null;
      const troca = CargaTab.plano('equipamentos', D, [['codigo', 'codigoMes'], [a.codigo, 'MES-Z'], [b.codigo, 'MES-A']], 't.xlsx').L.map(x => x.erros[0] || 'ok');
      const toma = CargaTab.plano('equipamentos', D, [['codigo', 'codigoMes'], [c.codigo, 'MES-A']], 't.xlsx').L.map(x => x.erros[0] || 'ok'); return { troca, toma }; });
    // achado do Codex: a linha que libera o MES é recusada e a que o recebe seria aceita; ou o usuário desmarca a que libera
    const cx = await f.evaluate(async () => { const D = Cad.D, E = D.equipamentos.filter(e => e.codigo !== 'LINHA').slice(0, 3); if (E.length < 3) return null;
      const [a, b, c] = E; a.codigoMes = 'MES-A'; b.codigoMes = null; c.codigoMes = 'MES-C';
      const P = CargaTab.plano('equipamentos', D, [['codigo', 'codigoMes'], [a.codigo, 'MES-C'], [b.codigo, 'MES-A']], 'x.xlsx');
      const recusadas = P.L.map(x => x.erros.length > 0);
      const Q = CargaTab.plano('equipamentos', D, [['codigo', 'codigoMes'], [a.codigo, 'MES-Z'], [b.codigo, 'MES-A']], 'y.xlsx'); const ok0 = Q.L.map(x => x.erros.length === 0);
      Q.L[0].marcado = false; CargaTab.prev(Q, () => {}); document.querySelector('#cgOk').click(); await new Promise(r => setTimeout(r, 300));
      const gravou = Cad.D.equipamentos.find(e => e.codigo === b.codigo).codigoMes === 'MES-A'; document.querySelector('#cgCanc') && document.querySelector('#cgCanc').click();
      return { recusadas, ok0, gravou }; });
    assert.ok(cx, 'três equipamentos'); assert.deepEqual(cx.recusadas, [true, true], 'as duas linhas ficam recusadas: o resultado é refeito sem a linha recusada'); assert.deepEqual(cx.ok0, [true, true]);
    assert.equal(cx.gravou, false, 'desmarcar a linha que libera impede gravar a que recebe');
    assert.ok(tr, 'ao menos três equipamentos no cenário'); assert.deepEqual(tr.troca, ['ok', 'ok']); assert.match(tr.toma[0], /MES-A ficaria em mais de um equipamento/);
    console.log('ok prévia mostra o item só com período diferente; código MES repetido no lote é erro');

    // 3b2) tag e máquina do mapa não mudam depois de gravados (o histórico usa o valor gravado)
    const tv = await f.evaluate(() => { const P = CargaTab.plano('tagsMapa', Cad.D, [['codigo', 'tag', 'nome'], ['TGC1', 'OUTRA', 'Falha de carga (renomeada)']], 'trava.xlsx');
      return { erro: P.L[0].erros[0] || '', marcado: P.L[0].marcado }; });
    assert.match(tv.erro, /não muda depois de gravado/); assert.equal(tv.marcado, false);
    await f.evaluate(() => { location.hash = '#cadastros/tagsMapa'; App.render(); }); await page.waitForTimeout(400);
    await f.evaluate(() => Ficha.abrir('tagsMapa', 'TGC1')); await f.waitForSelector('[data-p="tag"]');
    assert.equal(await f.locator('[data-p="tag"]').isDisabled(), true, 'campo Tag travado na ficha de item gravado');
    assert.equal(await f.locator('[data-p="equipamento"]').isDisabled(), true, 'campo Máquina travado na ficha de item gravado');
    await f.evaluate(() => Modal.close(true));
    console.log('ok tag e máquina do mapa de tags travadas depois de gravadas (ficha e carga)');

    // 3c) código de parada: descrição e vigência (decisão 7), validadas
    const pv2 = await f.evaluate(() => { const base = { codigo: 'PVX', nome: 'X', classe: 'fixa', ondeAponta: 'Máquina' }, v = it => cadValidarItem('paradas', { ...base, ...it }, Cad.D, { novo: true });
      return { ok: v({ descricao: 'texto', vigenciaDe: '2026-01-01', vigenciaAte: '2026-12-31' }).filter(x => /vigência/.test(x)), data: v({ vigenciaDe: '01/01/2026' }), ordem: v({ vigenciaDe: '2026-05-01', vigenciaAte: '2026-04-01' }), cols: ParLote.colunas(Cad.D).filter(k => /^(descricao|vigenciaDe|vigenciaAte)$/.test(k)) }; });
    assert.deepEqual(pv2.ok, []); assert.ok(pv2.data.some(x => /vigência inicial/.test(x)) && pv2.ordem.some(x => /final é antes/.test(x)) && pv2.cols.length === 3, JSON.stringify(pv2));
    console.log('ok código de parada: descrição e vigência inicial/final no cadastro, validadas e no lote');

    // 4) código repetido e sem código
    const r = await f.evaluate(() => { const P = CargaTab.plano('linhas', Cad.D, [['codigo', 'nome'], ['LREP', 'A'], ['LREP', 'B'], ['', 'C']], 'x.xlsx'); return P.L.map(x => x.erros[0] || 'ok'); });
    assert.deepEqual(r, ['ok', 'código repetido na planilha', 'linha sem código']);
    assert.deepEqual(erros, [], 'sem erro de JavaScript'); console.log('ok sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });

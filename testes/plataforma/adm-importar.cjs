// Administração central · bloco 1 · tarefa 7 (23/11/2026): Sistema › "Importar das bases atuais" (uso único).
// Demonstração: cadastro fictício, relógio fixo em 23/11/2026. O cadastro v1 é montado na memória a partir do cenário
// (sem o bloco gel, com o formato em parametros.gel.formatos e os 14 descartes em equipamentos[].gel.descs).
// O que este teste prova:
//  1. cadastro v1: faixa "Cadastro no formato antigo"; a Administração não grava nada além da importação (nem uma edição comum);
//  2. a tela Sistema › Importar das bases atuais abre a prévia: 1 formato (antes → depois), 14 locais, perfis e avisos;
//  3. Importar: schemaVersion 2, vacCad.gel.locais() com 14 locais (tara do equipamento em cada local), formato no mapeamento novo,
//     cópias antigas removidas, perfis com assuntos pela regra de transição, auditoria "importação do formato 1";
//  4. depois da importação a faixa e o botão somem e a Administração grava normalmente;
//  5. sem as cópias no cadastro, o plano lê o Gel (config.fmts / config.equips) e avisa de local sem equipamento correspondente;
//  6. nenhum erro de JavaScript.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
const w = (f, ms = 300) => f.waitForTimeout ? f.waitForTimeout(ms) : new Promise(r => setTimeout(r, ms));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const page = await browser.newPage({ viewport: { width: 1500, height: 950 } }), erros = [];
    page.on('pageerror', e => erros.push(e.message)); page.on('dialog', d => d.accept());
    await page.clock.setFixedTime(new Date('2026-11-23T10:00:00'));
    await page.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1#/portal');
    const f = await (await page.locator('iframe[title="Módulo Administração"]').elementHandle({ timeout: 60000 })).contentFrame();
    await f.waitForFunction(() => typeof Cad !== 'undefined' && Cad.D && typeof ADM_ASSUNTOS !== 'undefined', null, { timeout: 30000 });

    // o cadastro v1: sem o bloco gel; a tara do equipamento (uma por equipamento) como na página antiga
    await f.evaluate(() => {
      const d = JSON.parse(JSON.stringify(Cad.base));
      d.schemaVersion = 1; delete d.gel;
      d.equipamentos.find(e => e.codigo === 'EQ03').gel.tara = '75';
      d.equipamentos.find(e => e.codigo === 'EQ01').gel.tara = '80,5';
      d.perfis.forEach(p => delete p.assuntos);
      Cad.base = cadFix(d); Cad.recompute(); Cad.ui.sec = 'inicio'; location.hash = '#cadastros'; App.render();
    });
    await f.waitForSelector('.cadside');

    // 1) faixa e trava
    assert.equal(await f.evaluate(() => Cad.D.schemaVersion), 1, 'cadastro de teste no formato 1');
    assert.match(await f.locator('#cadV1').innerText(), /Cadastro no formato antigo/, 'faixa no topo');
    assert.ok(await f.evaluate(() => Cad.podeEditar(true)), 'a edição está liberada (modo de teste)');
    const l0 = await f.evaluate(() => Cad.D.linhas[0]);
    const neg = await f.evaluate(l => Cad.ops([{ acao: 'edição', tipo: 'linhas', codigo: l.codigo, mudancas: { nome: { antes: l.nome, depois: l.nome + ' X' } }, motivo: 'teste' }]), l0);
    assert.equal(neg, false, 'edição comum recusada enquanto o cadastro é v1');
    assert.equal(await f.evaluate(() => Cad.D.linhas[0].nome), l0.nome, 'nada foi gravado');
    assert.equal(await f.evaluate(() => Cad.fila.length), 0, 'e nada ficou na fila');
    assert.equal(await f.evaluate(() => Cad.D.schemaVersion), 1);
    console.log('ok formato 1: faixa no topo e a Administração não grava nada além da importação');

    // 2) a tela e a prévia
    assert.ok((await f.evaluate(() => ADM_ASSUNTOS.find(a => a.id === 'sistema').itens)).includes('importarV1'), 'tela no assunto Sistema');
    await f.click('.cadside [data-sec="importarV1"]'); await f.waitForSelector('#v1Abrir');
    assert.equal(await f.evaluate(() => location.hash), '#cadastros/importarV1');
    assert.match(await f.locator('#cadMain').innerText(), /Importar das bases atuais/);
    await f.click('#v1Abrir'); await f.waitForSelector('#v1Box');
    const cont = await f.evaluate(() => Object.fromEntries([...document.querySelectorAll('#v1Box [data-v1]')].map(x => [x.dataset.v1, x.textContent.trim()])));
    assert.match(cont.formatos, /^1\b/, 'prévia: 1 formato ' + JSON.stringify(cont)); assert.match(cont.locais, /^14\b/, 'prévia: 14 locais');
    assert.match(cont.perfis, /^10\b/, 'prévia: 10 perfis');
    const txt = await f.locator('#v1Box').innerText();
    for (const t of ['Formato desde', 'tara', 'embalagemG', 'folhaPurgaG', 'sobraBarrilKg', 'tuboG', 'gelG', 'aditivoG', 'tampaRolhaG', 'schemaVersion 1 → 2', 'MAQUINA GEL - VADG01', 'MAQUINA GEL - BARRIL']) assert.ok(txt.includes(t), 'prévia mostra: ' + t);
    console.log('ok prévia: ' + JSON.stringify(cont));

    // 3) importar
    await f.click('#v1Ok'); await w(page, 800);
    const r = await f.evaluate(() => ({ sv: Cad.D.schemaVersion, n: vacCad.gel.locais().length, fm: Cad.D.gel.formatos, pf: Cad.D.parametros.gel && Cad.D.parametros.gel.formatos,
      desc: Cad.D.equipamentos.filter(e => e.gel && (e.gel.descs || 'tara' in e.gel)).length, locais: Cad.D.gel.locais, status: Cad.status, fila: Cad.fila.length }));
    assert.equal(r.sv, 2, 'schemaVersion 2'); assert.equal(r.n, 14, '14 locais em vacCad.gel.locais()'); assert.equal(r.pf, undefined, 'parametros.gel.formatos some');
    assert.equal(r.desc, 0, 'equipamentos[].gel.descs e .tara somem'); assert.equal(r.fila, 0, 'fila gravada');
    assert.equal(r.fm.length, 1);
    assert.deepEqual({ ...r.fm[0], em: undefined }, { de: r.fm[0].de, ate: null, embalagemG: 75, folhaPurgaG: 5, sobraBarrilKg: 1.6,
      tubos: { '100': { tuboG: 4.779, gelG: 0.936, aditivoG: 0.02, tampaRolhaG: 2.3 }, '75': { tuboG: 3.56, gelG: 0.834, aditivoG: 0.015, tampaRolhaG: 2.3 } },
      motivo: 'importação do formato 1', por: r.fm[0].por, em: undefined }, 'formato no mapeamento novo');
    assert.equal(r.fm[0].de.length, 10);
    const por = c => r.locais.filter(l => l.equipamento === c);
    assert.ok(por('EQ03').length === 7 && por('EQ03').every(l => l.embalagemG === 75), 'tara do EQ03 em cada um dos locais dele');
    assert.ok(por('EQ01').length === 2 && por('EQ01').every(l => l.embalagemG === 80.5), 'tara "80,5" do EQ01 vira 80,5');
    assert.ok(por('EQ02').every(l => l.embalagemG === null), 'tara vazia vira null, nunca 0');
    const v = r.locais.find(l => l.local === 'MAQUINA GEL - BARRIL');
    assert.deepEqual([v.equipamento, v.comp, v.categoria, v.motivos, v.ativo], ['EQ03', 'barril', 'B', [], true]);
    assert.deepEqual(r.locais.map(l => l.ordem), r.locais.map((_, i) => i + 1), 'ordem 1..14'); assert.equal(new Set(r.locais.map(l => l.id)).size, 14, 'ids únicos');
    assert.ok(r.locais.every(l => /^L-\d{4}$/.test(l.id)));
    // perfis: a regra de transição gravada em cada perfil
    const pf = await f.evaluate(() => Object.fromEntries(Cad.D.perfis.map(p => [p.codigo, p.assuntos])));
    const ids = await f.evaluate(() => ADM_ASSUNTOS.map(a => a.id));
    assert.ok(Object.values(pf).every(a => a && ids.every(i => a[i] === 'editar' || a[i] === 'ver')), 'todo perfil ficou com assuntos gravados');
    assert.ok(ids.every(i => pf.PROC[i] === 'editar'), 'Processos edita tudo');
    assert.deepEqual(ids.filter(i => pf.PCP[i] === 'editar'), ['planta', 'turnos'], 'PCP edita planta e turnos');
    assert.deepEqual(ids.filter(i => pf.ALMOX[i] === 'editar'), ['gel'], 'Almoxarifado edita o gel');
    for (const c of ['CONSULTA', 'TV', 'OPER', 'LIDER', 'QUAL', 'TEC']) assert.ok(ids.every(i => pf[c][i] === 'ver'), c + ' só consulta em todos os assuntos');
    assert.ok(ids.every(i => pf.ADMIN[i] === 'editar'), 'ADMIN (edita sem senha) edita tudo');
    // auditoria
    const aud = await f.evaluate(() => Cad.D.auditoria.filter(a => a.motivo === 'importação do formato 1').map(a => [a.acao, a.tipo, a.campo]));
    assert.ok(aud.length >= 4 && aud.some(a => a[1] === 'gel' && a[2] === 'formatos') && aud.some(a => a[1] === 'gel' && a[2] === 'locais') && aud.some(a => a[1] === 'perfis') && aud.some(a => a[2] === 'schemaVersion'), 'auditoria da importação ' + JSON.stringify(aud));
    console.log('ok importação: schemaVersion 2, 14 locais com tara, formato mapeado, cópias antigas removidas, perfis com assuntos, auditoria (' + aud.length + ' registros)');

    // 4) depois: sem faixa, sem botão, grava normalmente
    assert.equal(await f.locator('#cadV1').count(), 0, 'faixa some'); assert.equal(await f.locator('.cadside [data-sec="importarV1"]').count(), 0, 'botão some');
    const ok2 = await f.evaluate(l => Cad.ops([{ acao: 'edição', tipo: 'linhas', codigo: l.codigo, mudancas: { nome: { antes: l.nome, depois: l.nome + ' X' } }, motivo: 'teste' }]), l0);
    assert.notEqual(ok2, false, 'edição comum volta a gravar'); assert.equal(await f.evaluate(() => Cad.D.linhas[0].nome), l0.nome + ' X');
    await f.evaluate(() => { Cad.ui.sec = 'gel'; location.hash = '#cadastros/gel'; App.render(); }); await f.waitForSelector('#gelFmt');
    assert.ok(await f.locator('#gelLocs tr[data-gid]').count() === 14, 'a tela Gel mostra os 14 locais importados');
    // importar de novo (op repetida) não muda nada
    const antes = await f.evaluate(() => JSON.stringify(Cad.D.gel));
    await f.evaluate(() => Cad.ops([{ acao: 'importação v1', tipo: '*', codigo: null, plano: { gel: { formatos: [], locais: [] }, perfis: [] }, motivo: 'importação do formato 1' }]));
    assert.equal(await f.evaluate(() => JSON.stringify(Cad.D.gel)), antes, 'repetir a importação não altera o cadastro v2');
    console.log('ok depois da importação: sem faixa nem botão, grava normalmente e repetir não muda nada');

    // 5) fonte alternativa: base do Gel
    const P = await f.evaluate(() => {
      const cad = JSON.parse(JSON.stringify(Cad.D)); cad.schemaVersion = 1; delete cad.gel; cad.perfis.forEach(p => delete p.assuntos); delete (cad.parametros.gel || {}).formatos; cad.equipamentos.forEach(e => { if (e.gel) { delete e.gel.descs; delete e.gel.tara; } });
      const gel = { config: { lineHeads: 3, barrelsPerHead: 4, params: [{ from: '2025-10-15', pT: 2.24 }], fmts: [{ from: '2025-10-15', tara: 75, taraP: 5, sobra: 1.6, f: { '100': { tubo: 4.779, gel: 0.936, adit: 0.02, tr: 2.3 }, '75': { tubo: 3.56, gel: 0.834, adit: 0.015, tr: 2.3 } } }],
        equips: [{ id: 'e1', name: 'Gel dispensor', portal: 'EQ03', tara: 70, descs: [{ id: 'd1', local: 'MAQUINA GEL - VADG01', comp: 'tubogel', cat: 'T', mots: [] }] },
          { id: 'e2', name: 'SALA GEL', portal: null, descs: [{ id: 'd2', local: 'SALA GEL', comp: 'gel', cat: 'P', mots: [] }] }] } };
      const p = ImportarV1.plano(cad, gel); return { f: p.gel.formatos.length, de: p.gel.formatos[0].de, l: p.gel.locais.map(l => [l.equipamento, l.local, l.embalagemG, l.legado]), parametros: p.parametros, av: p.avisos, perfis: p.perfis.length };
    });
    assert.equal(P.f, 1); assert.equal(P.de, '2025-10-15'); assert.deepEqual(P.l, [['EQ03', 'MAQUINA GEL - VADG01', 70, [{ e: 'e1', d: 'd1' }]]], 'só o local com equipamento correspondente entra');
    assert.ok(P.av.some(a => a === 'local sem equipamento correspondente: SALA GEL'), 'aviso ' + JSON.stringify(P.av)); assert.equal(P.perfis, 10);
    assert.deepEqual(P.parametros, { cabecotes: 3, barrisPorCabecote: 4, processo: [{ from: '2025-10-15', pT: 2.24 }] });
    const PN = await f.evaluate(() => { const cad = { schemaVersion: 1, equipamentos: [], perfis: [], parametros: { gel: { formatos: [{ from: '2025-10-15', tara: '', taraP: 5, sobra: '', f: { '100': { tubo: 4.779, gel: 0.936, adit: '', tr: 2.3 } } }] } } };
      const x = ImportarV1.plano(cad, null).gel.formatos[0]; return { e: x.embalagemG, fp: x.folhaPurgaG, s: x.sobraBarrilKg, t100: x.tubos['100'], t75: x.tubos['75'] }; });
    assert.deepEqual(PN, { e: null, fp: 5, s: null, t100: { tuboG: 4.779, gelG: 0.936, aditivoG: null, tampaRolhaG: 2.3 }, t75: { tuboG: null, gelG: null, aditivoG: null, tampaRolhaG: null } }, 'ausência vira null, nunca 0 ' + JSON.stringify(PN));
    const P0 = await f.evaluate(() => { const p = ImportarV1.plano({ schemaVersion: 1, equipamentos: [], perfis: [], parametros: {} }, null); return [p.gel.formatos.length, p.gel.locais.length, p.avisos.length]; });
    assert.equal(P0[0], 0); assert.equal(P0[1], 0); assert.ok(P0[2] >= 1, 'sem fonte nenhuma: avisa que não há nada para importar');
    console.log('ok sem cópias no cadastro: lê o Gel (config.fmts/equips) e avisa "local sem equipamento correspondente: SALA GEL"');

    assert.deepEqual(erros, [], 'sem erro de JavaScript'); console.log('ok sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });

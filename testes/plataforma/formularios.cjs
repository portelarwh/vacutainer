// Plataforma 1.8.25 (Linha 360° 1.4.0) · FORM-01: página "Relatórios e formulários" com a aba Formulários (aba "form" da Linha 360°).
// Formulário A4 (checklist, limpeza, confirmação de processo, manutenção, AM, 5S): título, cabeçalho repetido com "Página x de N", observação,
// tarefas e fotos com marcações numeradas (seta, círculo, retângulo, número) que viram itens com caixa de seleção; pílula na foto de
// outro local; situação aberto → executado → confirmado; nova emissão; resumo no exports. Fotos fictícias desenhadas no próprio
// navegador (demonstração: nada vai para pasta nem para o repositório).
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const page = await browser.newPage({ viewport: { width: 1500, height: 950 } }), erros = [];
    page.on('pageerror', e => erros.push(e.message)); page.on('dialog', d => d.accept('teste'));
    await page.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1');
    await page.getByRole('heading', { name: 'Visão da linha' }).waitFor();

    // 1) navegação: "Relatórios e formulários" com a aba Formulários (a tela vem da Linha 360°)
    await page.getByRole('button', { name: 'Relatórios e formulários' }).first().click();
    await page.getByRole('heading', { name: /Relatórios e formulários/ }).waitFor();
    await page.getByRole('tab', { name: 'Formulários' }).or(page.getByRole('button', { name: 'Formulários', exact: true })).first().click();
    const fr = await (await page.locator('iframe[title="Módulo Linha 360°"]').elementHandle()).contentFrame();
    await fr.waitForSelector('#fmNovo');
    assert.match(page.url(), /#\/relatorios\?tab=formularios/);
    console.log('ok "Relatórios e formulários" › Formulários abre a aba Formulários da Linha 360°');

    // 2) novo formulário: título obrigatório; ponto da planta preenche a área; tarefas
    await fr.click('#fmNovo'); await fr.click('#fmSalvar');
    assert.equal(await fr.evaluate(() => Store.data.formularios.length), 0, 'sem título não grava');
    await fr.fill('#fmTitulo', 'Limpeza do Tray Loader (teste)'); await fr.selectOption('#fmTipo', 'limpeza');
    await fr.selectOption('#fmRec', 'recorrente'); await fr.selectOption('#fmFreq', 'semana');
    await fr.selectOption('#fmPonto', '1'); await fr.fill('#fmEmissao', '2025-12-20'); await fr.fill('#fmPrazo', '2026-01-01');
    assert.equal(await fr.inputValue('#fmArea'), 'preparo', 'área vem do ponto (Linha 360°)');
    await fr.fill('#fmResp', '1001'); await fr.click('#fmConf'); await fr.fill('#fmConf', '9001');   // ir de um campo ao outro não pode perder o segundo
    assert.deepEqual(await fr.evaluate(() => [App.fm.d.respId, App.fm.d.confId]), ['1001', '9001'], 'responsável e quem confirma por ID');
    await fr.fill('#fmObs', 'Usar luvas e óculos (teste).');
    for (const t of ['Bloquear a energia (teste)', 'Retirar resíduos do piso (teste)']) { await fr.click('#fmTarNova'); await fr.locator('[data-tar]').last().fill(t); }

    // 3) fotos fictícias: o editor abre na primeira; seta, círculo e número; as fotos são numeradas primeiro (1, 2, 3), as tarefas depois
    const fotos = await fr.evaluate(() => ['#5d6d7e', '#7b6d5d', '#4d7d6d'].map(c => { const cv = document.createElement('canvas'); cv.width = 800; cv.height = 600; const x = cv.getContext('2d'); x.fillStyle = c; x.fillRect(0, 0, 800, 600); return cv.toDataURL('image/png').split(',')[1]; }));
    await fr.setInputFiles('#fmArq', fotos.map((b, i) => ({ name: 'teste' + i + '.png', mimeType: 'image/png', buffer: Buffer.from(b, 'base64') })));
    await fr.waitForSelector('#fmEdModal #edSvg');
    const arrasta = async (x1, y1, x2, y2) => { const bb = await fr.locator('#edSvg').boundingBox(), X = v => bb.x + bb.width * v, Y = v => bb.y + bb.height * v;
      await page.mouse.move(X(x1), Y(y1)); await page.mouse.down(); await page.mouse.move(X(x2), Y(y2), { steps: 5 }); await page.mouse.up(); await page.waitForTimeout(120); };
    await arrasta(.2, .2, .5, .3); await fr.locator('[data-mtxt]').last().fill('Limpar a lente do sensor');
    await fr.click('[data-ferr="circulo"]'); await fr.click('[data-cor="#F2B705"]'); await arrasta(.3, .5, .6, .8); await fr.locator('[data-mtxt]').last().fill('Ver desgaste da correia');
    await fr.click('[data-ferr="numero"]'); const bb = await fr.locator('#edSvg').boundingBox(); await page.mouse.click(bb.x + bb.width * .9, bb.y + bb.height * .9); await fr.locator('[data-mtxt]').last().fill('Conferir parafusos');
    const ed = await fr.evaluate(() => ({ marcas: App.fm.ed.f.marcas.map(m => [m.t, m.c]), nums: [...document.querySelectorAll('#edSvg .fm-nbg text')].map(t => +t.textContent), lista: [...document.querySelectorAll('.fm-lst .fm-nb')].map(s => +s.textContent) }));
    assert.deepEqual(ed.marcas, [['seta', '#E5322D'], ['circulo', '#F2B705'], ['numero', '#F2B705']], 'ferramenta e cor de cada marcação; trocar a ferramenta não recolore a anterior');
    assert.deepEqual(ed.nums, [1, 2, 3]); assert.deepEqual(ed.lista, [1, 2, 3]);
    await fr.click('#edDesf'); assert.equal(await fr.evaluate(() => App.fm.ed.f.marcas.length), 2, 'desfazer a última');
    await fr.click('[data-ferr="numero"]'); await page.mouse.click(bb.x + bb.width * .9, bb.y + bb.height * .9); await fr.locator('[data-mtxt]').last().fill('Conferir parafusos');
    await fr.click('#edOk');
    // 2ª foto em outro ponto (Aplicação de gel): faixa do local acima da foto
    await fr.click('[data-fted] >> nth=1'); await fr.waitForSelector('#fmEdModal #edSvg'); await fr.selectOption('#edPonto', '2');
    await fr.click('[data-ferr="retangulo"]'); await arrasta(.1, .1, .4, .4); await fr.locator('[data-mtxt]').last().fill('Nível de gel');
    await fr.click('#edOk'); await fr.selectOption('#fmPorPag', '1'); await fr.click('#fmSalvar'); await page.waitForTimeout(400);
    const g = await fr.evaluate(() => { const f = Store.data.formularios[0]; return { n: Store.data.formularios.length, tipo: f.tipo, rec: f.rec, freq: f.freq, area: f.area, ponto: f.ponto, emissorId: f.emissorId, fotos: f.fotos.length, marcas: f.fotos.map(x => x.marcas.length), outro: f.fotos[1].ponto, st: f.status, temDados: JSON.stringify(Store.data.formularios).includes('data:image') }; });
    assert.deepEqual(g, { n: 1, tipo: 'limpeza', rec: 'recorrente', freq: 'semana', area: 'preparo', ponto: '1', emissorId: '9001', fotos: 3, marcas: [3, 1, 0], outro: '2', st: 'aberto', temDados: false });
    const wp = await fr.evaluate(async () => { const cv = document.createElement('canvas'); cv.width = 3200; cv.height = 2400; cv.getContext('2d').fillRect(0, 0, 50, 50); const b = await new Promise(r => cv.toBlob(r, 'image/png'));
      const r = await fmReduzir(new File([b], 'x.png', { type: 'image/png' })); return { ext: r.ext, tipo: r.blob.type, w: r.w, h: r.h }; });
    assert.deepEqual(wp, { ext: 'webp', tipo: 'image/webp', w: 1600, h: 1200 }, 'foto convertida para WebP e reduzida (lado maior 1.600 px)');
    console.log('ok formulário salvo na base da Linha 360° (tipo, recorrência, local, emissor por ID); fotos em WebP (até 1.600 px) fora da base; marcações numeradas 1, 2, 3');

    // 4) folha A4 no layout corporativo: marca, título, código e "Página x / N" em todas; dados completos na 1ª e "Continuação do registro"
    //    nas seguintes; orientação geral; seções numeradas; faixa do local de cada foto; itens com OK / NC / N/A
    const A4 = await fr.evaluate(() => { const P = [...document.querySelectorAll('#fmPrev .fm-pg')], r = P[0].getBoundingClientRect(), z = parseFloat(getComputedStyle(P[0]).zoom) || 1;
      return { n: P.length, pn: P.map(p => p.querySelector('.fm-pn').textContent), cab: P.every(p => p.querySelector('.fm-marca') && p.querySelector('.fm-cod') && /Limpeza do Tray Loader/.test(p.querySelector('.fm-tt h1').textContent)),
        dados: P.map(p => p.querySelector('.fm-dados') ? 'dados' : p.querySelector('.fm-cont') ? 'cont' : '?'), mm: [Math.round(r.width / z / 96 * 25.4), Math.round(r.height / z / 96 * 25.4)], orient: P.map(p => !!p.querySelector('.fm-orient')),
        rotulos: [...P[0].querySelectorAll('.fm-c small')].map(s => s.textContent), faixas: [...document.querySelectorAll('#fmPrev .fm-faixa')].map(s => s.textContent),
        secoes: [...document.querySelectorAll('#fmPrev .fm-sec')].map(s => s.querySelector('b').textContent + ' ' + s.querySelector('h2').textContent),
        itens: [...document.querySelectorAll('#fmPrev .fm-it li, #fmPrev .fm-tl2 li')].map(li => li.querySelector('.fm-nb').textContent + ' ' + li.querySelector('.fm-tx').textContent),
        caixas: [...document.querySelectorAll('#fmPrev .fm-it li, #fmPrev .fm-tl2 li')].map(li => [...li.querySelectorAll('.fm-av')].map(a => a.textContent).join('/')), planta: !!P[0].querySelector('.fm-loc svg image'), vencida: !!P[0].querySelector('.fm-c.atr'), leg: !!document.querySelector('#fmPrev .fm-leg') }; });
    assert.ok(A4.n >= 3, 'uma foto por página'); assert.deepEqual(A4.pn, A4.pn.map((_, i) => `Página ${i + 1} / ${A4.n}`)); assert.ok(A4.cab, 'marca, título e código em todas');
    assert.deepEqual(A4.dados, A4.pn.map((_, i) => i ? 'cont' : 'dados')); assert.deepEqual(A4.mm, [210, 297]); assert.deepEqual(A4.orient, A4.pn.map((_, i) => !i));
    assert.deepEqual(A4.rotulos, ['Área principal', 'Máquina / local', 'Tipo / programação', 'Emitido por', 'Data de emissão', 'Conclusão prevista', 'Turno responsável', 'Responsável pela execução', 'Responsável pela confirmação']);
    assert.equal(A4.faixas.length, 3); assert.match(A4.faixas[0], /^Ponto 1 \/ Linha 360° \/ /); assert.match(A4.faixas[1], /^Ponto 2 \/ Linha 360° \/ Aplicação de gel/);
    assert.deepEqual(A4.secoes, ['01 Atividades com referência visual', '02 Atividades complementares', '03 Execução, desvios e confirmação']);
    const fech = await fr.evaluate(() => { const q = document.querySelector('#fmPrev .fm-fech'), z = parseFloat(getComputedStyle(q.closest('.fm-pg')).zoom) || 1, mm = el => +(el.getBoundingClientRect().height / z / 96 * 25.4).toFixed(1);
      return { quadros: [...q.querySelectorAll('.fm-f3 h3')].map(h => h.textContent.trim()), linha: mm(q.querySelector('.fm-cp:not(.alto) .fm-cv2')), texto: mm(q.querySelector('.fm-cp.alto .fm-cv2')), pautas: q.querySelectorAll('.fm-cv2.pauta').length, caixa: mm(document.querySelector('#fmPrev .fm-it .fm-cx')) }; });
    assert.deepEqual(fech.quadros, ['A Registro da execução', 'B Desvios (NC)', 'C Confirmação']); assert.equal(fech.pautas, 3, '3 campos de texto livre pautados (em branco)');
    assert.ok(fech.linha >= 8.8 && fech.texto >= 24 && fech.caixa >= 4.4, 'tamanhos para caneta ' + JSON.stringify(fech));
    assert.ok(A4.planta, 'local na planta da Linha 360°'); assert.ok(A4.vencida, 'conclusão vencida em destaque'); assert.ok(A4.leg, 'legenda OK / NC / N/A');
    assert.deepEqual(A4.itens, ['1 Limpar a lente do sensor', '2 Ver desgaste da correia', '3 Conferir parafusos', '4 Nível de gel', '5 Bloquear a energia (teste)', '6 Retirar resíduos do piso (teste)']);
    assert.deepEqual(A4.caixas, Array(6).fill('OK/NC/N/A'));
    await fr.selectOption('#fmPorPag', '4'); assert.ok(await fr.locator('#fmPrev .fm-pg').count() < A4.n, '4 por página: menos folhas'); await fr.selectOption('#fmPorPag', '1');
    console.log('ok folha A4 (210 × 297 mm) no layout corporativo: marca, título, código e "Página x / N" em todas; dados na 1ª e continuação nas demais; seções 01–03 (execução, desvios e confirmação num quadro A·B·C com campos para caneta); faixa do local; itens 1–6 com OK / NC / N/A');

    // 5) imprimir: só as folhas (window.print simulado)
    const imp = await fr.evaluate(async () => { let n = -1, cls = false; window.print = () => { n = document.querySelectorAll('#fmPrint .fm-pg').length; cls = document.body.classList.contains('fm-imprimindo'); };
      fmImprimir(); await new Promise(r => setTimeout(r, 600)); return { n, cls }; });
    assert.deepEqual(imp, { n: A4.n, cls: true });
    console.log('ok Imprimir / PDF: a impressão leva só as folhas A4');

    // 6) execução item a item: tudo avaliado; NC exige tratativa; executado → devolvido para ajuste → executado → confirmado
    await fr.click('#fmSalvar'); await page.waitForTimeout(200);
    const ex1 = await fr.evaluate(() => { const e = calcExports(Store.data); return { r: e.formularios, p: e.pendencias.filter(x => x.tipo === 'formularioVencido').map(x => x.sev) }; });
    assert.deepEqual(ex1, { r: { abertos: 1, vencidos: 1, aguardandoConfirmacao: 0, confirmados: 0, comNaoConformidade: 0 }, p: [2] });
    const st = () => fr.evaluate(() => Store.data.formularios[0].status);
    await fr.click('#fmConcluir'); await page.waitForTimeout(200); assert.equal(await st(), 'aberto', 'sem avaliar todos os itens não conclui');
    const chaves = await fr.evaluate(() => fmItensTodos(App.fm.d).map(i => i.k));
    for (const [i, k] of chaves.entries()) { await fr.click(`[data-av="${k}"][data-v="${i === 1 ? 'nc' : i === 5 ? 'na' : 'ok'}"]`); }
    await fr.click('#fmConcluir'); await page.waitForTimeout(200); assert.equal(await st(), 'aberto', 'NC sem tratativa não conclui');
    assert.match(await fr.getAttribute('#fxNovaAc', 'href'), /nova(=|%3D|%253D)/i, 'atalho para criar a ação corretiva em Iniciativas');
    await fr.fill('#fxPlano', 'AC-T-0201'); await fr.fill('#fxResp', '1001'); await fr.fill('#fxAcao', 'Trocar a correia na parada programada (teste)'); await fr.fill('#fxPend', 'Correia com trinca (teste)');
    await fr.click('#fmConcluir'); await page.waitForTimeout(300);
    const c1 = await fr.evaluate(() => { const f = Store.data.formularios[0]; return { st: f.status, por: f.exec.porId, aval: Object.values(f.exec.aval).sort().join(','), desv: [f.desvio.plano, f.desvio.respId, f.desvio.acao], pend: f.exec.pend }; });
    assert.deepEqual(c1, { st: 'concluido', por: '9001', aval: 'na,nc,ok,ok,ok,ok', desv: ['AC-T-0201', '1001', 'Trocar a correia na parada programada (teste)'], pend: 'Correia com trinca (teste)' });
    await fr.click('#fmDevolver'); await page.waitForTimeout(200); assert.equal(await st(), 'concluido', 'devolver exige comentário');
    await fr.fill('#fxCom', 'Anexar a foto da correia trocada (teste)'); await fr.click('#fmDevolver'); await page.waitForTimeout(300);
    const d1 = await fr.evaluate(() => { const f = Store.data.formularios[0]; return { st: f.status, dev: f.devolucoes.map(x => [x.porId, x.comentario]), aval: Object.keys(f.exec.aval).length }; });
    assert.deepEqual(d1, { st: 'aberto', dev: [['9001', 'Anexar a foto da correia trocada (teste)']], aval: 6 });
    await fr.click('#fmConcluir'); await page.waitForTimeout(300); assert.equal(await st(), 'concluido');
    await fr.fill('#fxCom', 'Conferido (teste)'); await fr.click('#fmConfirmar'); await page.waitForTimeout(300);
    const cf = await fr.evaluate(() => { const f = Store.data.formularios[0], pv = document.querySelector('#fmPrev'); return { st: f.status, por: f.confirmadoPorId, com: f.confComentario, ro: document.querySelector('#fmForm fieldset').disabled, salvar: !!document.querySelector('#fmSalvar'), e: calcExports(Store.data).formularios,
      ok: pv.querySelectorAll('.fm-it .fm-av.on.ok, .fm-tl2 .fm-av.on.ok').length, nc: pv.querySelectorAll('.fm-av.on.nc').length, conf: pv.querySelectorAll('.fm-cks .fm-av.on.ok').length, acao: [...pv.querySelectorAll('.fm-cv2')].some(x => /Trocar a correia/.test(x.textContent)) }; });
    assert.deepEqual(cf, { st: 'confirmado', por: '9001', com: 'Conferido (teste)', ro: true, salvar: false, e: { abertos: 0, vencidos: 0, aguardandoConfirmacao: 0, confirmados: 1, comNaoConformidade: 1 }, ok: 4, nc: 1, conf: 1, acao: true });
    await fr.click('#fmDup'); await fr.click('#fmSalvar'); await page.waitForTimeout(300);
    const dp = await fr.evaluate(() => { const L = Store.data.formularios; return { n: L.length, st: L.map(f => f.status), origem: L[1].origem === L[0].id, prazo: L[1].prazo > L[1].emissao, marcas: L[1].fotos.map(f => f.marcas.length), exec: L[1].exec, dev: L[1].devolucoes.length }; });
    assert.deepEqual(dp, { n: 2, st: ['confirmado', 'aberto'], origem: true, prazo: true, marcas: [3, 1, 0], exec: null, dev: 0 });
    console.log('ok OK / NC / N/A item a item; NC exige ação corretiva e responsável (atalho para Iniciativas); devolver exige comentário e volta para aberto; confirmado por ID; nova emissão limpa; exports');

    // 7) lista
    await fr.click('#fmVolta'); await fr.selectOption('#fmFiltro', 'todos');
    assert.equal(await fr.locator('#fmTab tbody tr').count(), 2);
    assert.deepEqual(erros, [], 'sem erro de JavaScript'); console.log('ok formulários: lista e sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

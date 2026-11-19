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

    // 3) fotos fictícias: o editor abre na primeira; seta, círculo e número; numeração continua depois das tarefas (3, 4, 5)
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
    assert.deepEqual(ed.nums, [3, 4, 5]); assert.deepEqual(ed.lista, [3, 4, 5]);
    await fr.click('#edDesf'); assert.equal(await fr.evaluate(() => App.fm.ed.f.marcas.length), 2, 'desfazer a última');
    await fr.click('[data-ferr="numero"]'); await page.mouse.click(bb.x + bb.width * .9, bb.y + bb.height * .9); await fr.locator('[data-mtxt]').last().fill('Conferir parafusos');
    await fr.click('#edOk');
    // 2ª foto em outro ponto (Aplicação de gel): pílula na foto
    await fr.click('[data-fted] >> nth=1'); await fr.waitForSelector('#fmEdModal #edSvg'); await fr.selectOption('#edPonto', '2');
    await fr.click('[data-ferr="retangulo"]'); await arrasta(.1, .1, .4, .4); await fr.locator('[data-mtxt]').last().fill('Nível de gel');
    await fr.click('#edOk'); await fr.selectOption('#fmPorPag', '1'); await fr.click('#fmSalvar'); await page.waitForTimeout(400);
    const g = await fr.evaluate(() => { const f = Store.data.formularios[0]; return { n: Store.data.formularios.length, tipo: f.tipo, rec: f.rec, freq: f.freq, area: f.area, ponto: f.ponto, emissorId: f.emissorId, emissao: f.emissao, fotos: f.fotos.length, marcas: f.fotos.map(x => x.marcas.length), outro: f.fotos[1].ponto, st: f.status, base: JSON.stringify(Store.data).length, temDados: JSON.stringify(Store.data.formularios).includes('data:image') }; });
    assert.deepEqual({ ...g, base: undefined, emissao: undefined }, { n: 1, tipo: 'limpeza', rec: 'recorrente', freq: 'semana', area: 'preparo', ponto: '1', emissorId: '9001', fotos: 3, marcas: [3, 1, 0], outro: '2', st: 'aberto', base: undefined, emissao: undefined, temDados: false });
    const wp = await fr.evaluate(async () => { const cv = document.createElement('canvas'); cv.width = 3200; cv.height = 2400; cv.getContext('2d').fillRect(0, 0, 50, 50); const b = await new Promise(r => cv.toBlob(r, 'image/png'));
      const r = await fmReduzir(new File([b], 'x.png', { type: 'image/png' })); return { ext: r.ext, tipo: r.blob.type, w: r.w, h: r.h }; });
    assert.deepEqual(wp, { ext: 'webp', tipo: 'image/webp', w: 1600, h: 1200 }, 'foto convertida para WebP e reduzida (lado maior 1.600 px)');
    console.log('ok formulário salvo na base da Linha 360° (tipo, recorrência, local, emissor por ID); fotos em WebP (até 1.600 px) fora da base; marcações numeradas 3, 4, 5 depois das 2 tarefas');

    // 4) folha A4: cabeçalho em todas as páginas com "Página x de N", observação na 1ª, pílula na foto de outro local, itens com caixa
    const A4 = await fr.evaluate(() => { const P = [...document.querySelectorAll('#fmPrev .fm-pg')], r = P[0].getBoundingClientRect(), z = parseFloat(getComputedStyle(P[0]).zoom) || 1;
      return { n: P.length, pn: P.map(p => p.querySelector('.fm-pn').textContent), cab: P.every(p => p.querySelector('.fm-cab') && /Limpeza do Tray Loader/.test(p.querySelector('.fm-tt h1').textContent)),
        mm: [Math.round(r.width / z / 96 * 25.4), Math.round(r.height / z / 96 * 25.4)], obs: P.map(p => !!p.querySelector('.fm-obs')),
        rotulos: [...P[0].querySelectorAll('.fm-c small')].map(s => s.textContent), pilula: [...document.querySelectorAll('#fmPrev .fm-pill')].map(s => s.textContent),
        itens: [...document.querySelectorAll('#fmPrev .fm-it li')].map(li => li.querySelector('.fm-nb').textContent + ' ' + li.lastElementChild.textContent), caixas: document.querySelectorAll('#fmPrev .fm-it .fm-cx').length, planta: !!P[0].querySelector('.fm-loc svg image'), vencida: !!P[0].querySelector('.fm-c.atr') }; });
    assert.equal(A4.n, 4, '1 foto por página: tarefas + 1ª foto, 2ª e 3ª fotos'); assert.deepEqual(A4.pn, ['Página 1 de 4', 'Página 2 de 4', 'Página 3 de 4', 'Página 4 de 4']); assert.ok(A4.cab, 'título e cabeçalho em todas');
    assert.deepEqual(A4.mm, [210, 297]); assert.deepEqual(A4.obs, [true, false, false, false]);
    for (const r of ['Área', 'Máquina / local', 'Turno responsável', 'Pessoa responsável', 'Aberto por', 'Data de abertura', 'Conclusão esperada', 'Confirmação de execução']) assert.ok(A4.rotulos.includes(r), r);
    assert.equal(A4.pilula.length, 1); assert.match(A4.pilula[0], /^2 · Aplicação de gel/); assert.ok(A4.planta, 'local na planta da Linha 360°'); assert.ok(A4.vencida, 'conclusão vencida em destaque');
    assert.deepEqual(A4.itens, ['1 Bloquear a energia (teste)', '2 Retirar resíduos do piso (teste)', '3 Limpar a lente do sensor', '4 Ver desgaste da correia', '5 Conferir parafusos', '6 Nível de gel']); assert.equal(A4.caixas, 6);
    await fr.selectOption('#fmPorPag', '4'); assert.equal(await fr.locator('#fmPrev .fm-pg').count(), 2, '4 por página: tarefas + 2 fotos na 1ª folha, a 3ª foto na 2ª'); await fr.selectOption('#fmPorPag', '1');
    console.log('ok folha A4 (210 × 297 mm): título e cabeçalho em cada página com "Página x de 4", observação, pílula da foto de outro local, itens 1–6 com caixa; 4 por página: 2 folhas');

    // 5) imprimir: só as folhas (window.print simulado)
    const imp = await fr.evaluate(async () => { let n = -1, cls = false; window.print = () => { n = document.querySelectorAll('#fmPrint .fm-pg').length; cls = document.body.classList.contains('fm-imprimindo'); };
      fmImprimir(); await new Promise(r => setTimeout(r, 600)); return { n, cls }; });
    assert.deepEqual(imp, { n: 4, cls: true });
    console.log('ok Imprimir / PDF: a impressão leva só as 4 folhas A4');

    // 6) situação: executado → confirmado (só consulta) → nova emissão; exports e pendência de conclusão vencida
    await fr.click('#fmSalvar'); await page.waitForTimeout(200);
    const ex1 = await fr.evaluate(() => { const e = calcExports(Store.data); return { r: e.formularios, p: e.pendencias.filter(x => x.tipo === 'formularioVencido').map(x => x.sev) }; });
    assert.deepEqual(ex1, { r: { abertos: 1, vencidos: 1, aguardandoConfirmacao: 0, confirmados: 0 }, p: [2] });
    await fr.click('#fmConcluir'); await page.waitForTimeout(300); assert.equal(await fr.evaluate(() => Store.data.formularios[0].status), 'concluido');
    await fr.click('#fmConfirmar'); await page.waitForTimeout(300);
    const cf = await fr.evaluate(() => ({ st: Store.data.formularios[0].status, por: Store.data.formularios[0].confirmadoPorId, ro: document.querySelector('#fmForm fieldset').disabled, salvar: !!document.querySelector('#fmSalvar'), e: calcExports(Store.data).formularios }));
    assert.deepEqual(cf, { st: 'confirmado', por: '9001', ro: true, salvar: false, e: { abertos: 0, vencidos: 0, aguardandoConfirmacao: 0, confirmados: 1 } });
    await fr.click('#fmDup'); await fr.click('#fmSalvar'); await page.waitForTimeout(300);
    const dp = await fr.evaluate(() => { const L = Store.data.formularios; return { n: L.length, st: L.map(f => f.status), origem: L[1].origem === L[0].id, prazo: L[1].prazo > L[1].emissao, marcas: L[1].fotos.map(f => f.marcas.length) }; });
    assert.deepEqual(dp, { n: 2, st: ['confirmado', 'aberto'], origem: true, prazo: true, marcas: [3, 1, 0] });
    console.log('ok executado → confirmado (só consulta, por ID); nova emissão aberta com as mesmas fotos e o prazo da frequência; exports e pendência sev 2');

    // 7) lista
    await fr.click('#fmVolta'); await fr.selectOption('#fmFiltro', 'todos');
    assert.equal(await fr.locator('#fmTab tbody tr').count(), 2);
    assert.deepEqual(erros, [], 'sem erro de JavaScript'); console.log('ok formulários: lista e sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

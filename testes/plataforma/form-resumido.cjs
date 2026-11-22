// Linha 360° 1.5.1 (pedido do responsável, 22/11/2026): o formulário A4 montado imprime ou salva em duas versões.
// Detalhada = completa (fotos, marcações e itens). Resumida = lista sem fotos: cada item diz a máquina / local e o que verificar.
// Demonstração: formulário fictício montado no próprio navegador. O que este teste prova:
//  1. a prévia começa na versão detalhada, com os blocos de foto;
//  2. "Resumida" troca a prévia: nenhuma foto, os itens com o ponto/máquina da foto em que foram marcados, a mesma numeração
//     da detalhada (marcações primeiro, tarefas depois) e o cabeçalho "versão resumida";
//  3. "Imprimir / PDF" imprime a versão escolhida e sugere o nome do PDF com a versão;
//  4. o formulário gravado não muda (é só a forma de imprimir) e nenhum erro de JavaScript.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }), erros = [];
    page.on('pageerror', e => erros.push(e.message)); page.on('dialog', d => d.accept());
    await page.clock.setFixedTime(new Date('2026-11-19T10:00:00'));
    await page.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1#/linha');
    const f = await (await page.locator('iframe[title="Módulo Linha 360°"]').elementHandle({ timeout: 60000 })).contentFrame();
    await f.waitForSelector('#cv');
    await f.evaluate(() => {
      const m = (id, txt, c) => ({ id, t: 'seta', c, x1: 20, y1: 20, x2: 40, y2: 40, txt });
      const d = { id: 'FM-TESTE-1', titulo: 'Checklist do envase (teste)', tipo: 'checklist', rec: 'unico', status: 'aberto', ponto: '1', porPag: 2, emissao: '2026-11-19', obs: 'Teste.',
        fotos: [{ id: 'ft1', w: 800, h: 600, arq: '', ponto: '1', eq: '', marcas: [m('m1', 'Limpar a lente do sensor', '#E5322D'), m('m2', 'Ver desgaste da correia', '#F2B705')] },
                { id: 'ft2', w: 800, h: 600, arq: '', ponto: '2', eq: '', marcas: [m('m3', 'Nível de gel', '#1F6FE5')] }],
        tarefas: [{ id: 't1', txt: 'Registrar no quadro do turno' }] };
      Store.commit({ k: 'form', it: JSON.parse(JSON.stringify(d)) }, { silencio: true });
      App.tab = 'form'; App.fm = { sel: null, filtro: 'abertos', d: JSON.parse(JSON.stringify(d)), sujo: false }; render();
    });
    await f.waitForSelector('#fmPrev .fm-pg');
    const det = await f.evaluate(() => ({ fotos: document.querySelectorAll('#fmPrev .fm-fb').length, res: document.querySelectorAll('#fmPrev .fm-rl').length, t: document.querySelector('.fm-prev-t').textContent, on: document.querySelector('[data-fmver="det"]').getAttribute('aria-pressed') }));
    assert.ok(det.fotos === 2 && det.res === 0 && /versão detalhada/.test(det.t) && det.on === 'true', 'prévia detalhada com as fotos ' + JSON.stringify(det));
    console.log('ok a prévia começa na versão detalhada, com as 2 fotos');

    await f.click('[data-fmver="res"]');
    const res = await f.evaluate(() => ({
      fotos: document.querySelectorAll('#fmPrev .fm-fb, #fmPrev .fm-fi').length,
      itens: [...document.querySelectorAll('#fmPrev .fm-rl li')].filter(li => li.querySelector('.fm-qm')).map(li => [+li.querySelector('.fm-nb').textContent, li.querySelector('.fm-qm').textContent.split(' · ').slice(0, 1)[0], li.querySelector('.fm-qm').nextSibling.textContent]),
      tarefas: [...document.querySelectorAll('#fmPrev .fm-rl li')].filter(li => !li.querySelector('.fm-qm')).map(li => [+li.querySelector('.fm-nb').textContent, li.querySelector('.fm-tx').textContent]),
      cab: document.querySelector('#fmPrev .fm-tit span').textContent, t: document.querySelector('.fm-prev-t').textContent }));
    assert.equal(res.fotos, 0, 'resumida sem fotos');
    assert.deepEqual(res.itens, [[1, 'Ponto 1', 'Limpar a lente do sensor'], [2, 'Ponto 1', 'Ver desgaste da correia'], [3, 'Ponto 2', 'Nível de gel']], 'itens com a máquina/local e o que verificar');
    assert.deepEqual(res.tarefas, [[4, 'Registrar no quadro do turno']], 'tarefas depois, com a mesma numeração');
    assert.match(res.cab, /versão resumida/); assert.match(res.t, /versão resumida/);
    console.log('ok "Resumida": lista sem fotos, cada item com o ponto/máquina e o que verificar, numeração igual à detalhada');

    const imp = await f.evaluate(async () => { let titulo = ''; const p0 = window.print; window.print = () => { titulo = document.title; }; try { fmImprimir(); await new Promise(r => setTimeout(r, 800)); } finally { window.print = p0; }
      const pr = document.querySelector('#fmPrint'); return { titulo, fotos: pr.querySelectorAll('.fm-fb').length, res: pr.querySelectorAll('.fm-rl .fm-qm').length }; });
    assert.deepEqual(imp, { titulo: 'FM-TESTE-1 - Checklist do envase (teste) - resumido', fotos: 0, res: 3 }, 'imprime a resumida com o nome do PDF');
    await f.click('[data-fmver="det"]');
    const imp2 = await f.evaluate(async () => { let titulo = ''; const p0 = window.print; window.print = () => { titulo = document.title; }; try { fmImprimir(); await new Promise(r => setTimeout(r, 800)); } finally { window.print = p0; }
      return { titulo, fotos: document.querySelectorAll('#fmPrint .fm-fb').length }; });
    assert.deepEqual(imp2, { titulo: 'FM-TESTE-1 - Checklist do envase (teste) - detalhado', fotos: 2 }, 'imprime a detalhada');
    console.log('ok "Imprimir / PDF" imprime a versão escolhida e sugere o nome do PDF com a versão');

    const gravado = await f.evaluate(() => { const x = Store.data.formularios.find(z => z.id === 'FM-TESTE-1'); return { versao: 'versao' in x, fotos: x.fotos.length }; });
    assert.deepEqual(gravado, { versao: false, fotos: 2 }, 'o formulário gravado não muda');
    assert.deepEqual(erros, [], 'sem erro de JavaScript'); console.log('ok o formulário gravado não muda; sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });

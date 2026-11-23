// Linha 360° 1.5.0 · IMG-01 (pedido do responsável, 22/11/2026): banco de imagens da pasta IMAGENS e fotos na planta.
// Demonstração: dados e fotos fictícios (vacImagens.demo). O servidor do teste entrega uma planta fictícia em IMAGENS/PLANTA_BAIXA.SVG. O que prova:
//  1. a planta vem de IMAGENS/PLANTA_BAIXA.SVG (proporção do arquivo; zoom até 800% por ser vetor);
//  2. a camada Fotos mostra o banco ao lado da planta, com o filtro Todas / Não colocadas;
//  3. arrastar uma foto do banco até a planta grava o caminho e a posição; ela sai de "Não colocadas";
//  4. duas fotos próximas viram um pino com o número; clicar aproxima e cada foto aparece com a miniatura;
//  5. clicar na foto abre a foto grande, na parte visível da tela; "Tirar do mapa" a devolve para "Não colocadas" (ativo:false, nada se apaga);
//  6. Formulários: "Escolher do banco" entrega os arquivos escolhidos ao mesmo caminho de "Adicionar fotos";
//  7. nenhum erro de JavaScript.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
const PLANTA = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4000 2000" width="4000" height="2000"><rect width="4000" height="2000" fill="#fff"/><rect x="200" y="200" width="3600" height="1600" fill="none" stroke="#123" stroke-width="6"/></svg>';
(async () => {
  const srv = http.createServer((q, r) => {
    const u = decodeURIComponent(q.url.split('?')[0]);
    if (u === '/IMAGENS/PLANTA_BAIXA.SVG') { r.setHeader('Content-Type', 'image/svg+xml'); return r.end(PLANTA); }
    if (u.startsWith('/IMAGENS/') || u.startsWith('/Marca/')) { r.statusCode = 404; return r.end(); }
    r.setHeader('Content-Type', 'text/html'); r.end(html);
  });
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
    await f.waitForFunction(() => document.querySelector('#cv').dataset.planta === 'IMAGENS/PLANTA_BAIXA.SVG', null, { timeout: 20000 });
    const pl = await f.evaluate(() => ({ ar: document.querySelector('#cv').style.aspectRatio.replace(/\s/g, ''), src: document.querySelector('#cv img').getAttribute('src'), max: zMax() }));
    assert.deepEqual(pl, { ar: '4000/2000', src: 'IMAGENS/PLANTA_BAIXA.SVG', max: 8 }, 'planta lida de IMAGENS/PLANTA_BAIXA.SVG');
    console.log('ok planta de IMAGENS/PLANTA_BAIXA.SVG: proporção do arquivo e zoom até 800%');

    await f.click('[data-cam="fotos"]'); await f.waitForSelector('#fGrid [data-fimg]');
    const b0 = await f.evaluate(() => ({ n: document.querySelectorAll('#fGrid [data-fimg]').length, fil: [...document.querySelectorAll('[data-ffil]')].map(b => b.textContent) }));
    assert.equal(b0.n, 8, 'banco fictício com 8 fotos'); assert.deepEqual(b0.fil, ['Todas (8)', 'Não colocadas (8)']);
    await f.waitForFunction(() => [...document.querySelectorAll('#fGrid img')].every(i => i.getAttribute('src')), null, { timeout: 15000 });
    console.log('ok camada Fotos: banco ao lado da planta, com Todas e Não colocadas');

    const arq = await f.getAttribute('#fGrid [data-fimg]', 'data-fimg');
    /* arrastar: os mesmos eventos do navegador (dragstart na foto, dragover e drop na planta, com o DataTransfer); o arrastar nativo do
       Playwright não chega a iframes aninhados */
    await f.evaluate(a => { const src = document.querySelector(`#fGrid [data-fimg="${a}"]`), cv = document.querySelector('#cv'), r = cv.getBoundingClientRect(), dt = new DataTransfer(), x = r.left + r.width * .4, y = r.top + r.height * .5;
      src.dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer: dt }));
      const ov = new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: dt, clientX: x, clientY: y }); cv.dispatchEvent(ov);
      if (!ov.defaultPrevented) throw new Error('a planta não aceitou a foto arrastada');
      cv.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt, clientX: x, clientY: y })); }, arq);
    await f.waitForSelector('.l3-ft');
    const d1 = await f.evaluate(a => ({ fotos: Store.data.fotos.filter(x => x.ativo !== false).map(x => [x.arq, Math.round(x.x), Math.round(x.y)]), nao: document.querySelector('[data-ffil="nao"]').textContent }), arq);
    assert.deepEqual(d1, { fotos: [[arq, 40, 50]], nao: 'Não colocadas (7)' }, 'foto arrastada para a planta');
    await f.click('[data-ffil="nao"]');
    assert.equal(await f.locator(`#fGrid [data-fimg="${arq}"]`).count(), 0, 'a foto colocada sai de Não colocadas');
    await f.click('[data-ffil="todas"]');
    console.log('ok arrastar do banco para a planta grava caminho e posição; a foto sai de Não colocadas');

    const arq2 = await f.evaluate(() => document.querySelectorAll('#fGrid [data-fimg]')[1].dataset.fimg);
    await f.evaluate(a => colocarFoto(a, [41.5, 51]), arq2);
    await f.waitForSelector('.l3-fg');
    assert.equal(await f.textContent('.l3-fg b'), '2', 'duas fotos próximas: um pino com o número 2');
    await f.click('.l3-fg');
    await f.waitForFunction(() => document.querySelectorAll('.l3-ft').length === 2 && !document.querySelector('.l3-fg'));
    const z = await f.evaluate(() => ({ zoom: App.zoom, mini: document.querySelectorAll('.l3-ft.mini img').length }));
    assert.ok(z.zoom >= 2 && z.mini === 2, 'aproximado, cada foto com a miniatura ' + JSON.stringify(z));
    console.log('ok afastado as fotos próximas viram "2"; clicando, aproxima e cada uma aparece com a miniatura');

    await f.evaluate(a => document.querySelector(`[data-foto="${a}"]`).click(), arq);
    await f.waitForSelector('#l3FotoModal .l3-fvi img[src]');
    assert.match(await f.textContent('#l3FotoModal h3'), /\.svg$/);
    const bb = await f.locator('#l3FotoModal .l3-fver').boundingBox();
    assert.ok(bb && bb.y >= 0 && bb.y + bb.height <= 1001, 'a janela da foto aparece na parte visível da tela ' + JSON.stringify(bb));
    await f.click('#l3FotoModal [data-ftirar]');
    await f.waitForFunction(() => !document.querySelector('#l3FotoModal'));
    const d2 = await f.evaluate(a => ({ ativo: Store.data.fotos.find(x => x.id === a).ativo, nao: document.querySelector('[data-ffil="nao"]').textContent }), arq);
    assert.deepEqual(d2, { ativo: false, nao: 'Não colocadas (7)' }, 'tirar do mapa: ativo:false e volta para Não colocadas');
    console.log('ok a foto abre grande; "Tirar do mapa" grava ativo:false e ela volta para Não colocadas');

    await f.evaluate(() => { window.__F = null; fmBanco(async F => { window.__F = F.map(x => [x.name, x.size > 0]); }); });
    await f.waitForSelector('#fmBancoModal [data-fbsel]');
    const cks = f.locator('#fmBancoModal [data-fbsel]'); await cks.nth(0).check(); await cks.nth(3).check();
    assert.equal(await f.textContent('#fbOk'), 'Adicionar (2)');
    await f.click('#fbOk'); await f.waitForFunction(() => window.__F);
    const F = await f.evaluate(() => window.__F);
    assert.equal(F.length, 2); assert.ok(F.every(x => x[1] && /\.svg$/.test(x[0])), 'arquivos entregues ' + JSON.stringify(F));
    console.log('ok Formulários: "Escolher do banco" entrega as fotos escolhidas');

    // WebP lido de uma pasta real de teste, incluindo a reserva quando o decodificador de miniaturas falha.
    const imagem = await f.evaluate(async () => {
      const raiz = await navigator.storage.getDirectory();
      const pasta = await (await raiz.getDirectoryHandle('IMAGENS', { create: true })).getDirectoryHandle('Linha', { create: true });
      const h = await pasta.getFileHandle('Foto de inspeção.WEBP', { create: true });
      const c = document.createElement('canvas'); c.width = 96; c.height = 48;
      c.getContext('2d').fillRect(0, 0, 96, 48);
      const blob = await new Promise(resolve => c.toBlob(resolve, 'image/webp'));
      const w = await h.createWritable(); await w.write(blob); await w.close();
      Fotos.r = await vacImagens.listar(raiz, 'Linha');
      const bitmap = window.createImageBitmap;
      try {
        window.createImageBitmap = async () => { throw new Error('miniatura indisponível'); };
        render();
        const mini = document.querySelector('#fGrid img');
        await vacImagens.preencher(raiz, mini.parentElement); await mini.decode();
        mini.parentElement.click();
        const grande = document.querySelector('#l3FotoModal img');
        await vacImagens.preencher(raiz, grande.parentElement); await grande.decode();
        return [blob.type, mini.naturalWidth, grande.naturalWidth, grande.naturalHeight, !!document.querySelector('[data-ftirar]')];
      } finally { window.createImageBitmap = bitmap; }
    });
    assert.deepEqual(imagem, ['image/webp', 96, 96, 48, false]);
    console.log('ok WebP da pasta com miniatura indisponível abre no banco antes de colocar na planta');

    assert.deepEqual(erros, [], 'sem erro de JavaScript'); console.log('ok sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });

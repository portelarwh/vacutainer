// Timeline Operacional dentro da plataforma (Produção 2.5.0, plataforma 1.7.0). Demonstração, dados fictícios.
// Confere: a aba "Linha do tempo" existe na Produção; quatro estados na legenda; KPIs somam o período; tooltip e Detalhes da Ocorrência
// funcionam dentro do quadro; legenda visível ao rolar a linha do tempo; notebook, Full HD e ultrawide sem rolagem lateral da página.
// As regras e os critérios CA-01 a CA-20 estão em testes/ttimeline.js.
const http = require('node:http'), fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { chromium } = require('playwright');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html; charset=utf-8'); r.end(html); });
  await new Promise(r => srv.listen(0, '127.0.0.1', r)); const b = await chromium.launch(require('./chromium.cjs')()); const erros = [];
  const U = 'http://127.0.0.1:' + srv.address().port + '/?demo=1#/oee?tab=timeline';
  try {
    for (const [w, h, nome] of [[1366, 768, 'notebook'], [1920, 1080, 'Full HD'], [3440, 1440, 'ultrawide']]) {
      const p = await b.newPage({ viewport: { width: w, height: h } }); p.on('pageerror', e => erros.push(nome + ': ' + e.message)); p.on('dialog', d => d.dismiss());
      await p.goto(U); await p.waitForFunction(() => [...document.querySelectorAll('iframe')].some(f => f.offsetParent && f.contentWindow.vacPagina?.pronto?.() && f.contentDocument.querySelector('#tloCv')), null, { timeout: 30000 });
      let f; for (const x of p.frames()) if (x.parentFrame() && await x.evaluate(() => !!(window.frameElement && window.frameElement.offsetParent)).catch(() => false)) f = x; await p.waitForTimeout(600);
      /* 2.6.11 · a Linha do tempo fica dentro da aba Paradas (Análise · Linha do tempo); ?tab=timeline abre direto nela */
      assert.ok(await p.locator('.module-tabs button[data-tab-id="stops"]').count() && await f.evaluate(() => !!document.querySelector('.grp-sub [data-grpsub="stops|timeline"][aria-selected="true"]')), 'Linha do tempo na aba Paradas da Produção');
      const r = await f.evaluate(() => { const M = TLV.modelo(), box = document.querySelector('#tloBox').getBoundingClientRect(); return { leg: [...document.querySelectorAll('.tlo-leg span')].slice(0, 4).map(s => s.textContent.trim()).join(), soma: Math.abs(M.soma - M.total) < 1e-9, total: M.total, kpis: document.querySelectorAll('[data-tlk]').length, maqs: document.querySelectorAll('.tlo-lab .r').length, larg: box.width, iw: innerWidth, alto: box.height }; });
      assert.equal(r.leg, 'Produzindo,Parada,Bloqueada,Ociosa', nome + ': legenda dos quatro estados');
      assert.ok(r.soma && r.total === 1440 && r.kpis === 8 && r.maqs >= 3, nome + ': KPIs e faixas ' + JSON.stringify(r));
      assert.ok(r.larg > r.iw - 80, nome + ': a linha do tempo usa a largura da página (' + Math.round(r.larg) + ' de ' + r.iw + ' px)');
      assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), nome + ': sem rolagem lateral da página');
      assert.ok(r.alto <= h, nome + ': a linha do tempo cabe na altura da tela (rola por dentro)');
      if (w === 1920) {
        await f.locator('#tloCv').boundingBox(); await f.locator('#tloCv').scrollIntoViewIfNeeded(); const c2 = await f.locator('#tloCv').boundingBox();
        await p.mouse.move(c2.x + c2.width * 0.3, c2.y + 50); await p.waitForTimeout(250);
        const tip = await f.evaluate(() => { const e = document.querySelector('#tloTip'); return e && !e.hidden ? e.innerText : ''; });
        assert.match(tip, /Produzindo|Parada|Bloqueada|Ociosa/, 'tooltip dentro da plataforma'); assert.match(tip, /Duração/, 'tooltip com a duração');
        await f.evaluate(() => { const z = document.querySelector('[data-tlzoom="hora"]'); z.click(); const bx = document.querySelector('#tloBox'); bx.scrollLeft = 5000; bx.scrollTop = 500; }); await p.waitForTimeout(300);
        const leg = await f.evaluate(() => { const l = document.querySelector('.tlo-leg').getBoundingClientRect(), fe = frameElement.getBoundingClientRect(); return { top: fe.top + l.top, bottom: fe.top + l.bottom, vh: parent.innerHeight }; });
        assert.ok(leg.top >= 0 && leg.bottom <= leg.vh, 'legenda visível na tela enquanto a linha do tempo é rolada ' + JSON.stringify(leg));
        await p.mouse.click(c2.x + c2.width * 0.3, c2.y + 50); await f.waitForSelector('.modal', { timeout: 5000 });
        assert.equal(await f.evaluate(() => document.querySelector('.modal h2').textContent), 'Detalhes da Ocorrência');
        for (const k of ['maquina', 'estado', 'motivo', 'inicio', 'fim', 'duracao', 'origem', 'responsavel', 'criado', 'alterado']) assert.ok(await f.locator(`.modal [data-tld="${k}"]`).count(), 'detalhes: campo ' + k);
        await f.evaluate(() => document.querySelector('.modal [data-close]').click());
      }
      console.log('ok timeline ' + nome + ': ' + Math.round(r.larg) + ' px, ' + r.maqs + ' máquinas'); await p.close();
    }
    assert.deepEqual(erros, [], 'erro de página');
    console.log('ok timeline operacional na plataforma');
  } finally { await b.close(); srv.close(); }
})().catch(e => { console.error(e.message || e); process.exitCode = 1; });

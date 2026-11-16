// Ajustes de usabilidade (17/11/2026; plataforma 1.5.0, Produção 2.4.82, Administração 1.9.44 · atualizado em 1.6.0). Demonstração, dados fictícios.
// Confere: Recolher tudo / Expandir tudo e a seta de cada seção (01, 02…) em seis telas; seta do Cabeçalho do dia da Produção;
// aba Equipamentos da Produção abre a página Equipamentos (Voltar volta); "?" abre o guia da aba do módulo; faixa "Onde lançar"
// com atalho para o turno; "Lançar meu turno" em destaque laranja (padrão); previsão do catálogo no "Agora na linha";
// filtros das Ordens numa faixa; dados da base nas Configurações da Produção em texto normal.
const http = require('node:http'), fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { chromium } = require('playwright');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html; charset=utf-8'); r.end(html); });
  await new Promise(r => srv.listen(0, '127.0.0.1', r)); const b = await chromium.launch(require('./chromium.cjs')()); const erros = [];
  const U = 'http://127.0.0.1:' + srv.address().port + '/?demo=1';
  const abre = async (hash, w = 1440) => { const p = await b.newPage({ viewport: { width: w, height: 1000 } }); p.on('pageerror', e => erros.push(hash + ': ' + e.message)); p.on('dialog', d => d.dismiss());
    await p.goto(U + hash); const fr = async () => { await p.waitForFunction(() => [...document.querySelectorAll('iframe')].some(f => f.offsetParent && f.contentWindow.vacPagina?.pronto?.()), null, { timeout: 30000 });
      for (const f of p.frames()) if (f.parentFrame() && await f.evaluate(() => !!(window.frameElement && window.frameElement.offsetParent)).catch(() => false)) return f; };
    const f = await fr(); await p.waitForTimeout(700); return { p, f }; };
  try {
    // 1. Recolher tudo / seção a seção
    for (const [hash, todos] of [['#/gel', '[data-colall="0"]'], ['#/paradas', '[data-vk-todos="0"]'], ['#/inicio?tab=situacao', '[data-vk-todos="0"]'], ['#/linha', '[data-vk-todos="0"]'], ['#/perdas', '[data-vk-todos="0"]'], ['#/oee?tab=overview', '[data-vk-todos="0"]']]) {
      const { p, f } = await abre(hash);
      const r = await f.evaluate(async sel => { const S = '.vk-sec,.vgl-sec', vis = () => [...document.querySelectorAll(S)].filter(x => x.offsetParent).map(s => { let n = 0; for (let x = s.nextElementSibling; x && !x.matches(S); x = x.nextElementSibling) if (x.offsetParent && !x.classList.contains('vk-todos')) n++; return n; });
        const antes = vis(), tg = document.querySelectorAll('.vk-sec-tg').length; document.querySelector(sel).click(); await new Promise(r => setTimeout(r, 300)); const depois = vis();
        document.querySelector(sel.replace('"0"', '"1"')).click(); await new Promise(r => setTimeout(r, 300)); const volta = vis();
        const s1 = document.querySelector('.vk-sec-tg'); s1.click(); await new Promise(r => setTimeout(r, 200)); const uma = vis(); s1.click(); return { antes, depois, volta, uma, tg }; }, todos);
      assert.ok(r.tg >= 3 && r.antes.reduce((a, x) => a + x, 0) > 0, hash + ': seções com seta');
      assert.equal(r.depois.reduce((a, x) => a + x, 0), 0, hash + ': Recolher tudo recolhe todas as seções ' + JSON.stringify(r));
      assert.deepEqual(r.volta, r.antes, hash + ': Expandir tudo volta como estava');
      assert.ok(r.uma[0] === 0 && r.uma.slice(1).join() === r.antes.slice(1).join(), hash + ': a seta recolhe só a própria seção');
      console.log('ok recolher ' + hash + ': ' + r.tg + ' seções'); await p.close();
    }
    // 2. Produção: cabeçalho, onde lançar, guia, destaque, Ordens, Configurações, aba Equipamentos
    { const { p, f } = await abre('#/oee');
      const cab = await f.evaluate(async () => { document.querySelector('#cabTg').click(); await new Promise(r => setTimeout(r, 500)); const c = document.querySelector('#cabDia'); return [...c.children].filter(e => e.tagName !== 'HEADER').every(e => getComputedStyle(e).display === 'none'); });
      assert.ok(cab, 'seta do Cabeçalho do dia recolhe o conteúdo'); await f.evaluate(() => document.querySelector('#cabTg').click());
      const onde = await f.evaluate(() => { const b = document.querySelector('.onde-lancar'); return b && { txt: /por hora/.test(b.textContent), turnos: b.querySelectorAll('[data-ir-turno]').length, hh: b.querySelectorAll('[data-hhps]').length }; });
      assert.ok(onde && onde.txt && onde.turnos >= 1 && onde.turnos === onde.hh, 'faixa "Onde lançar" com cartão e Hora a hora de cada turno');
      await f.click('[data-ir-turno]'); await p.waitForTimeout(900); assert.ok(await p.evaluate(() => scrollY) > 600, 'o atalho rola a página até o cartão do turno');
      await p.evaluate(() => scrollTo(0, 0)); await p.locator('button[aria-label="Guia desta aba"]').click(); await p.waitForTimeout(600);
      assert.ok(await f.evaluate(() => /Lançamento do dia/i.test(document.body.innerText)), '"?" abre o guia da aba Lançamento');
      const dest = await p.evaluate(() => { const b = [...document.querySelectorAll('.engine-command')].find(x => /Lançar meu turno/.test(x.textContent)); return b && b.className; });
      assert.match(dest || '', /dest-laranja/, '"Lançar meu turno" em destaque laranja (padrão)');
      console.log('ok Produção: cabeçalho recolhe, onde lançar, guia da aba e destaque');
      await p.locator('.module-tabs button[data-tab-id="ordens"]').click(); await p.waitForTimeout(1500);
      const ord = await f.evaluate(() => { const g = document.querySelector('.ord-filtros'); if (!g) return null; const el = [...g.querySelectorAll('select,.ord-q-b .btn,.ord-limpar')].map(e => Math.round(e.getBoundingClientRect().height)); const tops = new Set([...g.querySelectorAll('select,.ord-q-b .btn,.ord-limpar')].map(e => Math.round(e.getBoundingClientRect().top))); return { alturas: [...new Set(el)], linhas: tops.size }; });
      assert.ok(ord && ord.alturas.every(h => h >= 38 && h <= 44) && ord.linhas === 1, 'filtros das Ordens numa faixa, mesma altura ' + JSON.stringify(ord));
      await p.locator('.module-tabs button[data-tab-id="config"]').click(); await p.waitForTimeout(1500);
      const fs = await f.evaluate(() => parseFloat(getComputedStyle(document.querySelector('.kv .v')).fontSize)); assert.ok(fs <= 18, 'dados da base em texto normal (' + fs + ' px)');
      await p.locator('.module-tabs button[data-tab-id="equip"]').click(); await p.waitForTimeout(2000);
      assert.equal(await p.evaluate(() => location.hash), '#/equip', 'aba Equipamentos da Produção abre a página Equipamentos');
      await p.goBack(); await p.waitForTimeout(800); assert.match(await p.evaluate(() => location.hash), /^#\/oee/, 'Voltar retorna à Produção');
      console.log('ok Produção: Ordens em uma faixa, Configurações em texto normal, Equipamentos'); await p.close(); }
    // 3. Agora na linha: previsão do catálogo
    { const { p, f } = await abre('#/inicio?tab=situacao'); const t = await f.evaluate(() => (document.querySelector('[data-agora]') || {}).innerText || '');
      assert.match(t, /Catálogo \d+ no plano do mês: .* falta .* término no ritmo atual/, 'Agora na linha mostra a previsão do catálogo');
      console.log('ok Agora na linha com a previsão do catálogo'); await p.close(); }
    assert.deepEqual(erros, [], 'erro de página');
    console.log('ok ajustes de usabilidade');
  } finally { await b.close(); srv.close(); }
})().catch(e => { console.error(e.message || e); process.exitCode = 1; });

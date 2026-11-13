// E3 do plano único (08/11/2026): número digitado e importado só é aceito inteiro ("12a" não vira 12), com a regra de cada campo/fonte.
// node testes/tnumeros.js → "sem erros"; código 1 se falhar
const path = require('path'); const RAIZ = path.resolve(__dirname, '..') + '/'; const PG = 'file://' + RAIZ + 'paginas/';
const { chromium } = require('playwright');
const errs = []; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA ') + m); if (!c) errs.push(m); };
// [entrada, ponto decimal (Gel), ponto milhar (Paradas), sap (decimal + sinal no fim)]
const CASOS = [
  ['12', 12, 12, 12], ['12,5', 12.5, 12.5, 12.5], ['1.234,5', 1234.5, 1234.5, 1234.5], ['1,234.5', 1234.5, 1234.5, 1234.5],
  ['1.234', 1.234, 1234, 1.234], ['1.5', 1.5, 1.5, 1.5], ['12.345.678', 12345678, 12345678, 12345678], ['4 500,0', 4500, 4500, 4500],
  ['-3', -3, -3, -3], ['−3', -3, -3, -3], ['15-', 'NaN', 'NaN', -15], ['', null, null, null],
  ['12a', 'NaN', 'NaN', 'NaN'], ['123abc', 'NaN', 'NaN', 'NaN'], ['R$ 1.234,56', 'NaN', 'NaN', 'NaN'], ['1,2,3', 'NaN', 'NaN', 'NaN'], ['12.34,5', 'NaN', 'NaN', 'NaN'], ['abc', 'NaN', 'NaN', 'NaN']];
(async () => {
  const b = await chromium.launch();
  // ---------- regra comum (kit) nas 8 páginas
  for (const a of ['Portal.html', 'OEE-Vacutainer.html', 'Perdas-Ordem.html', 'Gestão-Gel-Vacutainer.html', 'Paradas.html', 'Equipamentos.html']) {
    const p = await b.newPage(); await p.goto(PG + encodeURI(a)); await p.waitForTimeout(800);
    const r = await p.evaluate(C => { const f = x => x === null ? null : Number.isNaN(x) ? 'NaN' : +x.toFixed(6); return C.filter(([t, d, m, s]) => f(vacNumero(t, { ponto: 'decimal' })) !== d || f(vacNumero(t, { ponto: 'milhar' })) !== m || f(vacNumero(t, { sap: true })) !== s).map(([t]) => t + ' → ' + [f(vacNumero(t)), f(vacNumero(t, { ponto: 'milhar' })), f(vacNumero(t, { sap: true }))].join('/')); }, CASOS);
    ok(!r.length, `${a}: vacNumero com a tabela de ${CASOS.length} casos por regra (decimal, milhar, SAP)${r.length ? ': ' + r.join('; ') : ''}`);
    await p.close();
  }
  // ---------- Gel: campo de preço com "12a" não grava; com valor válido, grava igual a antes
  {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } }); const pe = []; p.on('pageerror', e => pe.push(e.message)); p.on('dialog', d => d.accept());
    await p.goto(PG + encodeURI('Gestão-Gel-Vacutainer.html')); await p.waitForTimeout(1200); await p.evaluate(() => { document.querySelectorAll('.overlay').forEach(o => o.remove()); enterDemo(); render(); openConfig('preco'); }); await p.waitForTimeout(600);
    const r = await p.evaluate(async () => {
      const commits = []; const orig = backend.commit; backend.commit = async ch => { commits.push(JSON.parse(JSON.stringify(ch))); };
      const u = document.querySelector('#pcUsd'), fx = document.querySelector('#pcFx'); fx.disabled = false; fx.value = '5'; fx.dispatchEvent(new Event('input', { bubbles: true }));
      u.value = '12a'; u.dispatchEvent(new Event('input', { bubbles: true })); const marcado = u.classList.contains('num-inval'), previa = document.querySelector('#pcBrl').textContent;
      document.querySelector('#pcSave').click(); await new Promise(r => setTimeout(r, 200)); const n1 = commits.length;
      u.value = '12,5'; u.dispatchEvent(new Event('input', { bubbles: true })); const limpo = !u.classList.contains('num-inval'), previa2 = document.querySelector('#pcBrl').textContent;
      document.querySelector('#pcSave').click(); await new Promise(r => setTimeout(r, 300)); backend.commit = orig;
      const ult = commits[commits.length - 1]; const pr = ult && ult.config && ult.config.prices && ult.config.prices[ult.config.prices.length - 1];
      return { marcado, previa, n1, limpo, previa2, n2: commits.length, usd: pr && pr.usd, price: pr && pr.price };
    });
    ok(r.marcado && r.previa === 'valor inválido', `Gel › preço "12a": campo marcado e prévia "${r.previa}" (antes: R$ 60,00 por kg)`);
    ok(r.n1 === 0, `Gel › preço "12a": Salvar não grava nada (${r.n1} gravações; antes gravava 12)`);
    ok(r.limpo && /62,50/.test(r.previa2) && r.n2 === 1 && r.usd === 12.5 && r.price === 62.5, `Gel › preço "12,5": grava como antes (US$ ${r.usd}, R$ ${r.price}/kg)`);
    ok(!pe.length, `Gel sem erro de página${pe.length ? ' (' + pe[0] + ')' : ''}`);
    await p.close();
  }
  // ---------- Paradas: importação do Forms recusa a linha com número inválido, com o motivo
  {
    const p = await b.newPage(); p.on('dialog', d => d.accept()); await p.goto(PG + 'Paradas.html'); await p.waitForTimeout(900); await p.evaluate(() => { document.querySelectorAll('.overlay').forEach(o => o.remove()); modoTeste(); }); await p.waitForTimeout(600);
    const r = await p.evaluate(() => ({ min: [parseNum('15'), parseNum('15 min'), parseNum('1,5'), parseNum('1.234'), parseNum('12a'), parseNum('15-'), parseNum('')].map(x => x === null ? null : Number.isNaN(x) ? 'NaN' : x) }));
    ok(JSON.stringify(r.min) === JSON.stringify([15, 15, 1.5, 1234, 'NaN', 'NaN', null]), `Paradas › minutos do Forms: ${JSON.stringify(r.min)} ("12a" e "15-" recusados; antes 12 e 15)`);
    const src = require('fs').readFileSync(RAIZ + 'paginas/Paradas.html', 'utf8');
    ok(/duração inválida/.test(src) && /quantidade de vezes inválida/.test(src), 'Paradas › linha com minutos ou vezes inválidos vai para os erros da importação, com o motivo');
    // Paradas 1.2.4 · coluna "Lote" do Forms vai para o lote (antes caía na ordem); "Ordem" e "Ordem ou lote" continuam na ordem
    const lt = await p.evaluate(() => { const C1 = mapCols(['Data da parada', 'Código – Linha', 'Lote']), C2 = mapCols(['Data da parada', 'Código – Linha', 'Ordem ou lote']), C3 = mapCols(['Data da parada', 'Código – Linha', 'Ordem', 'Lote']);
      const linha = { 'Data da parada': '03/11/2026', 'Turno': 'T1', 'Máquina': 'LINHA', 'Código – Linha': '801', 'Duração (minutos)': '10', 'Lote': '0006299937', 'Ordem': '' };
      const m = montarImport([linha], 'forms'), e = m.ev[0] || {};
      return { c1: [C1.lote, C1.ordem], c2: [C2.lote, C2.ordem], c3: [C3.lote, C3.ordem], ev: [e.lote, e.ordem], erros: m.erros.map(x => x.t) }; });
    ok(lt.c1[0] === 'Lote' && !lt.c1[1] && !lt.c2[0] && lt.c2[1] === 'Ordem ou lote' && lt.c3[0] === 'Lote' && lt.c3[1] === 'Ordem' && lt.ev[0] === '0006299937' && lt.ev[1] === '',
      `Paradas › coluna Lote do Forms: vai para o lote, como texto (${JSON.stringify(lt.ev)}); "Ordem ou lote" segue na ordem; erros ${JSON.stringify(lt.erros)}`);
    await p.close();
  }
  await b.close();
  console.log(errs.length ? `\n${errs.length} falha(s)` : '\nsem erros'); process.exit(errs.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });

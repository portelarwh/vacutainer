// Fase 1 do briefing de 09/11/2026: o Portal como fonte única (ARQ-01 a ARQ-07).
// node testes/tportalfonte.js → imprime as conferências; sai com código 1 se alguma falhar
const SP = require('path').resolve(__dirname, '..') + '/'; const S = 'file://' + SP + 'paginas/';
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } }); const errs = [];
  const ok = (c, msg) => { console.log((c ? 'ok   ' : 'FALHA ') + msg); if (!c) errs.push('falhou: ' + msg); };
  const nova = async (arq, tag, hash = '') => { const p = await ctx.newPage(); p.on('pageerror', e => errs.push(tag + ' ' + e.message)); p.on('dialog', d => d.accept()); await p.goto(S + encodeURI(arq) + hash); await p.waitForTimeout(1500); return p; };

  /* ================= ARQ-06 · Parâmetros ================= */
  // Portal: grupo Produção e "Neste computador"
  const po = await nova('Portal.html', 'Portal', '#geral');
  await po.evaluate(() => enterTest()); await po.waitForTimeout(400);
  await po.evaluate(() => { location.hash = '#cadastros/parametros'; }); await po.waitForTimeout(600);
  ok(await po.evaluate(() => !!document.querySelector('#parProd') && !!document.querySelector('#parPc')), 'ARQ-06 Portal: Parâmetros tem os grupos Produção e Neste computador');
  ok(await po.evaluate(() => [...document.querySelectorAll('.cadside [data-sec="parametros"]')].some(x => /^Parâmetros/.test(x.textContent.trim()))), 'ARQ-06 Portal: menu "Parâmetros"');
  ok(await po.evaluate(() => !document.querySelector('#ppOk')), 'ARQ-06 Portal: sem a senha, o grupo Produção é só consulta');
  const mig6 = await po.evaluate(() => { TrazCfg.B = { oee: { shifts: [], downtimeCodes: [], targets: [], settings: { entryUnit: 1000, unitLabel: 'mil', roundingUnit: 1000 }, productionDays: [{ date: '2025-03-10' }] } }; TrazCfg.P = []; TrazCfg.avisos = []; TrazCfg.montar(); const x = (TrazCfg.P || []).find(i => i.grupo === 'Parâmetros' && /lançamento em/.test(i.titulo)); if (!x) return null; const W2 = { parametros: {} }; x.fn(W2); return W2.parametros.producao; });
  ok(mig6 && mig6.unidadeLancamento === 1000 && mig6.arredondamentoMeta[0].de === '2025-03-10' && mig6.arredondamentoMeta[0].valor === 1000, 'ARQ-06 migração: "Trazer das páginas" leva unidade, rótulo e arredondamento da Produção (vigência desde o 1º dia lançado)');
  await po.click('[data-pcq="abs"]'); await po.waitForTimeout(300);
  ok(await po.evaluate(() => localStorage.getItem('vac.qtd') === 'abs'), 'ARQ-06 Portal: exibição das quantidades grava vac.qtd (neste computador)');
  await po.evaluate(() => Lock.on(Cad.D.seguranca.senhaHash)); await po.evaluate(() => App.render()); await po.waitForTimeout(400);
  await po.fill('[data-pprod="unidadeLancamento"]', '1000'); await po.fill('[data-pprod="rotuloUnidade"]', 'mil');
  const amanha = await po.evaluate(() => addDays(todayISO(), 1));
  await po.fill('#ppArDe', amanha); await po.fill('#ppArV', '500'); await po.click('#ppOk'); await po.waitForTimeout(800);
  const pp = await po.evaluate(() => (Cad.D.parametros || {}).producao || null);
  ok(pp && pp.unidadeLancamento === 1000 && pp.rotuloUnidade === 'mil' && (pp.arredondamentoMeta || []).some(v => v.de === amanha && v.valor === 500), 'ARQ-06 Portal: grava parametros.producao com a vigência nova do arredondamento');
  await po.evaluate(() => App.render()); await po.waitForTimeout(300);
  await po.fill('#ppArDe', '2020-01-01'); await po.fill('#ppArV', '700'); await po.click('#ppOk'); await po.waitForTimeout(500);
  ok(await po.evaluate(() => !((Cad.D.parametros || {}).producao.arredondamentoMeta || []).some(v => v.de === '2020-01-01')), 'ARQ-06 Portal: vigência no passado é recusada (vigências gravadas não mudam)');

  // Produção: aplica o grupo, arredondamento pela data do dia, exibição do computador
  const o = await nova('OEE-Vacutainer.html', 'Produção');
  await o.evaluate(() => { document.querySelectorAll('.overlay').forEach(x => x.remove()); Demo.enterExample(); }); await o.waitForTimeout(1200);
  const r6 = await o.evaluate(() => {
    const d = JSON.parse(Store.serialize(Store.S.db));
    CadSync.aplicar(d, { rev: 1, parametros: { producao: { unidadeLancamento: 1000, rotuloUnidade: 'mil', arredondamentoMeta: [{ de: '2000-01-01', valor: 7000 }, { de: '2099-01-01', valor: 500 }] } } }, () => { });
    const st = d.settings, dia = d.productionDays.find(x => !x.deleted && x.shifts && x.shifts.length);
    const res = Engine.computeDayRaw(d, dia), metas = res.flat.map(f => f.metaOp).filter(v => v != null && v > 0);
    return { vig: (st.roundingVig || []).length, ru: st.roundingUnit, a: roundAt(st, '2026-01-01'), b: roundAt(st, '2099-06-01'), semVig: roundAt({ roundingUnit: 1000 }, '2026-01-01'), metas: metas.length, mult: metas.slice(0, -1).every(v => v % 7000 === 0) };
  });
  ok(r6.vig === 2 && r6.ru === 7000, 'ARQ-06 Produção: CadSync guarda as vigências do arredondamento e o vigente hoje');
  ok(r6.a === 7000 && r6.b === 500 && r6.semVig === 1000, 'ARQ-06 Produção: roundAt usa a vigência da data (sem vigência, o valor da base)');
  ok(r6.metas > 1 && r6.mult, 'ARQ-06 Produção: a meta de cada intervalo sai no múltiplo da vigência do dia');
  const q = await o.evaluate(() => { localStorage.setItem('vac.qtd', 'abs'); const a = [DISP(), unitLbl()]; localStorage.setItem('vac.qtd', 'unit'); const u = [DISP(), unitLbl()]; return { a, u }; });
  ok(q.a[0] === 1 && q.a[1] === 'un' && q.u[0] > 1, 'ARQ-06 Produção: exibição das quantidades segue vac.qtd do computador');
  await o.evaluate(() => localStorage.removeItem('vac.qtd'));

  await b.close();
  if (errs.length) { console.log('\n' + errs.join('\n')); process.exit(1); } else console.log('\nsem erros');
})();

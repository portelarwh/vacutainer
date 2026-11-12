// Produção 2.4.64 (12/11/2026): fechar turno e dia com turno desabilitado no dia (turno não produtivo habilitado e depois
// desabilitado fica com deleted:true) e botões acesos quando o turno fecha ou o hora a hora fica completo.
// Modo exemplo (dados fictícios). node testes/tfechar.js → "sem erros"; código 1 se falhar
const { chromium } = require('playwright'); const path = require('path');
const PG = 'file://' + path.resolve(__dirname, '..') + '/paginas/OEE-Vacutainer.html';
const errs = []; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA ') + m); if (!c) errs.push(m); };
(async () => {
  const b = await chromium.launch(); const pe = [];
  const novo = async (tema = 'light') => { const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); await ctx.addInitScript(t => localStorage.setItem('vac.theme', t), tema);
    const p = await ctx.newPage(); p.on('pageerror', e => pe.push(e.message)); p.on('dialog', d => d.accept('teste')); await p.goto(PG); await p.waitForTimeout(1300);
    await p.evaluate(() => { document.querySelectorAll('.overlay').forEach(o => o.remove()); Demo.enterExample(); document.querySelectorAll('.overlay').forEach(o => o.remove()); }); await p.waitForTimeout(500); return p; };
  // dia em aberto com um turno desabilitado no dia (deleted)
  const PREP = () => { const d = db().productionDays.filter(x => x.status !== 'fechado').pop();
    Store.mutate(D => { const x = D.productionDays.find(y => y.id === d.id); const c = JSON.parse(JSON.stringify(x.shifts[1])); c.id = 'ps_np_del'; c.deleted = true; c.enabledNP = true; c.status = 'em lançamento'; c.snap.name = 'Turno NP'; x.shifts.push(c); });
    return d.id; };
  const T = (p, fn, id) => p.evaluate(([f, id]) => { try { eval(f)(id); return 'ok'; } catch (e) { return 'ERRO: ' + e.message; } }, [fn, id]);
  const st = (p, id) => p.evaluate(id => { const x = db().productionDays.find(y => y.id === id); return { dia: x.status, turnos: x.shifts.filter(s => !s.deleted).map(s => s.status), del: x.shifts.filter(s => s.deleted).map(s => s.status) }; }, id);
  {
    const p = await novo(); const id = await p.evaluate(PREP);
    const r = await T(p, 'id => Actions.closeDay(id)', id), s = await st(p, id);
    ok(r === 'ok' && s.dia === 'fechado' && s.turnos.every(x => x === 'fechado') && s.del[0] === 'em lançamento', `fechar o dia com turno desabilitado no dia: ${r} · dia ${s.dia} · turnos ${s.turnos} · o desabilitado fica como estava (${s.del})`);
    await p.context().close();
  }
  {
    const p = await novo(); const id = await p.evaluate(PREP);
    const ids = await p.evaluate(id => db().productionDays.find(y => y.id === id).shifts.filter(s => !s.deleted).map(s => s.id), id); const r = [];
    for (const ps of ids) r.push(await p.evaluate(([id, ps]) => { try { Actions.closeShift(id, ps); return 'ok'; } catch (e) { return 'ERRO: ' + e.message; } }, [id, ps]));
    const s = await st(p, id);
    ok(r.every(x => x === 'ok') && s.dia === 'fechado', `fechar os turnos um a um fecha o dia, mesmo com turno desabilitado (${r.join(', ')} · dia ${s.dia})`);
    const rv = await p.evaluate(id => { try { Actions.reopen(id, null, 'teste'); } catch (e) { return 'ERRO: ' + e.message; } const x = db().productionDays.find(y => y.id === id); return x.status + ' / ' + x.shifts.map(s => s.status + (s.deleted ? '(desab.)' : '')).join(','); }, id);
    ok(/^reaberto \/ reaberto,reaberto,em lançamento\(desab\.\)$/.test(rv), `reabrir o dia não mexe no turno desabilitado (${rv})`);
    await p.context().close();
  }
  for (const tema of ['light', 'dark']) {
    const p = await novo(tema);
    await p.evaluate(() => { const d = db().productionDays.filter(x => x.status !== 'fechado').pop(); Actions.closeShift(d.id, d.shifts[0].id); App.sel.date = d.date; go('launch'); }); await p.waitForTimeout(800);
    const r = await p.evaluate(() => { const c = b => b ? getComputedStyle(b) : null, re = document.querySelector('[data-reopenps]'), fe = document.querySelector('[data-closeps]'), hh = [...document.querySelectorAll('[data-hhps]')].filter(b => /\d+\/\d+/.test(b.innerText));
      return { re: re && re.classList.contains('lit') && /Fechado/.test(re.innerText), reCor: c(re) && c(re).color, fe: fe && !fe.classList.contains('lit'), hh: hh.map(b => b.classList.contains('lit')) }; });
    await p.evaluate(() => go('hourly')); await p.waitForTimeout(500);
    const s = await p.evaluate(() => [...document.querySelectorAll('[data-hhsel]')].map(b => b.innerText.trim().replace(/\s+/g, ' ') + (b.classList.contains('lit') ? ' [aceso]' : '')));
    ok(r.re && r.fe && r.hh.length >= 2 && r.hh.every(Boolean), `${tema}: turno fechado com "Fechado · Reabrir" aceso (${r.reCor}); "Fechar turno" do outro normal; "Hora a hora" completo aceso (${r.hh})`);
    ok(s.some(x => /fechado \[aceso\]/.test(x)) && s.some(x => /\d+\/\d+ \[aceso\]/.test(x)) && s.some(x => /^Todos$/.test(x)), `${tema}: seletor do Hora a hora acende o turno fechado e o completo (${s.join(' · ')})`);
    await p.context().close();
  }
  ok(!pe.length, 'sem erro de página' + (pe.length ? ': ' + [...new Set(pe)].slice(0, 3).join(' | ') : ''));
  await b.close(); if (errs.length) { console.log(`\n${errs.length} falha(s)`); process.exit(1); } console.log('\nsem erros');
})().catch(e => { console.error(e); process.exit(1); });

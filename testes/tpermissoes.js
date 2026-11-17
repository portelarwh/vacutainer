// D6 (13/11/2026) · permissão por ação na tela (vacTravas, kit_v21.js): o perfil Consulta não lança, não fecha, não importa, não exclui
// nem configura em nenhuma página; o Líder lança e fecha; sem usuário identificado nada muda. Dados fictícios.
// node testes/tpermissoes.js → "sem erros"; código 1 se falhar
const path = require('path'); const RAIZ = path.resolve(__dirname, '..') + '/', PG = 'file://' + RAIZ + '__modulos__/';
const { chromium } = require(process.env.VAC_PLATAFORMA ? './plataforma/engine-browser.cjs' : 'playwright');
const errs = []; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA ') + m); if (!c) errs.push(m); };
const MODS = ['portal', 'oee', 'perdas', 'gel', 'paradas', 'equip', 'inic', 'projetos'], FN = ['ver', 'lancar', 'fechar', 'importar', 'exportar', 'excluir', 'configurar'];
const perm = f => Object.fromEntries(MODS.map(m => [m, Object.fromEntries(FN.map(x => [x, f(m, x)]))]));
const CAD = { schema: 'vac-cadastros', schemaVersion: 1, rev: 1, perfis: [
  { codigo: 'CONSULTA', nome: 'Consulta', permissoes: perm((m, x) => x === 'ver' || x === 'exportar'), ativo: true },
  { codigo: 'LIDER', nome: 'Liderança', permissoes: perm((m, x) => x !== 'configurar' && x !== 'excluir'), ativo: true }],
  usuarios: [{ codigo: 'u1', nome: 'Pessoa Consulta', perfil: 'CONSULTA', ativo: true }, { codigo: 'u2', nome: 'Pessoa Líder', perfil: 'LIDER', ativo: true }] };
// página → como chegar numa tela com botões de gravação
const PAGINAS = [
  ['OEE-Vacutainer.html', async p => { await p.evaluate(() => { document.querySelectorAll('.overlay').forEach(o => o.remove()); Demo.enterExample(); document.querySelectorAll('.overlay').forEach(o => o.remove()); const d = db().productionDays.filter(x => !x.deleted).map(x => x.date).sort().pop(); App.sel.date = d; go('launch'); }); }],
  ['Paradas.html', async p => { await p.evaluate(() => { document.querySelectorAll('.overlay').forEach(o => o.remove()); modoTeste(); App.go ? App.go('eventos') : 0; }); }],
  ['Perdas-Ordem.html', async p => { await p.evaluate(() => { enterTest(); App.show ? App.show('config') : 0; }); }],
  ['Equipamentos.html', async p => { await p.evaluate(() => { Store.test = true; App.tab = 'os'; render(); }); }],
  ['Gestão-Gel-Vacutainer.html', async p => { await p.evaluate(() => { document.querySelectorAll('.overlay').forEach(x => x.remove()); enterDemo(); document.querySelectorAll('.overlay').forEach(x => x.remove()); ui.tab = 'op'; render(); }); }],
  ['Iniciativas.html', async p => { await p.evaluate(() => { Store.test = true; render(); }); }],
  // Linha 360° (plataforma 1.7.1, opção A): lançar = checklist e posto; configurar = planta, áreas, pontos e cadastro de checklist
  ['Linha-360.html', async p => { await p.evaluate(() => { enterTest(); ir('checklists'); }); }, 'checklists'],
  ['Linha-360.html', async p => { await p.evaluate(() => { enterTest(); ir('pessoas'); }); }, 'pessoas'],
  ['Linha-360.html', async p => { await p.evaluate(() => { enterTest(); ir('config'); }); }, 'configuração'],
  ['Linha-360.html', async p => { await p.evaluate(() => { enterTest(); ir('piloto'); }); }, 'piloto']];
(async () => {
  const b = await chromium.launch(); const pe = [];
  for (const [arq0, prep, aba] of PAGINAS) {
    const arq = aba ? arq0 + ' › ' + aba : arq0;
    const R = {};
    for (const quem of ['', 'u1', 'u2']) {
      const c = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await c.newPage(); p.on('pageerror', e => pe.push(arq + ': ' + e.message)); p.on('dialog', d => d.dismiss());
      await p.addInitScript(([cad, u]) => { try { localStorage.setItem('vac.cadastros', JSON.stringify(cad)); if (u) { localStorage.setItem('vac.userId', u); if (navigator.webdriver) localStorage.setItem('vac.sessao', JSON.stringify({id:u,ate:Date.now()+3600000})); } } catch (e) { } }, [CAD, quem]);
      await p.goto(PG + arq0); await p.waitForTimeout(1000);
      try { await prep(p); } catch (e) { pe.push(arq + ' prep: ' + e.message); }
      await p.waitForTimeout(500);
      R[quem || 'ninguém'] = await p.evaluate(() => { const M = VAC_PODE_MAPA[PAGE.id] || {}, o = {};
        for (const [fn, sel] of Object.entries(M)) { const L = [...document.querySelectorAll(sel)]; o[fn] = { n: L.length, trava: L.filter(e => e.classList.contains('vac-trava') && e.disabled).length, tit: (L.find(e => e.classList.contains('vac-trava')) || {}).title || '' }; }
        return o; });
      await c.close();
    }
    const tot = (r, f) => Object.entries(r).filter(([fn]) => f(fn)).reduce((s, [, x]) => s + x.n, 0), trav = (r, f) => Object.entries(r).filter(([fn]) => f(fn)).reduce((s, [, x]) => s + x.trava, 0), todos = () => true;
    const n = tot(R.u1, todos);
    if (aba === 'piloto') { ok(n === 0 && tot(R.u2, todos) === 0 && tot(R['ninguém'], todos) === 0, `${arq}: nenhum botão de gravação na tela (somente leitura)`); continue; }
    ok(n > 0 && trav(R.u1, todos) === n && /Consulta/.test(Object.values(R.u1).map(x => x.tit).join(' ')), `${arq}: Consulta com os ${n} botão(ões) de gravação da tela desligados e o motivo no título`);
    ok(process.env.VAC_PLATAFORMA ? trav(R['ninguém'], todos) === tot(R['ninguém'], todos) : trav(R['ninguém'], todos) === 0, `${arq}: sem usuário identificado: consulta na plataforma, comportamento histórico fora dela`);
    const lf = fn => fn === 'lancar' || fn === 'fechar' || fn === 'importar', cf = fn => fn === 'configurar' || fn === 'excluir';
    ok(trav(R.u2, lf) === 0 && trav(R.u2, cf) === tot(R.u2, cf), `${arq}: Liderança lança/fecha/importa (${tot(R.u2, lf)} livres) e não configura nem exclui (${tot(R.u2, cf)} travados)`);
  }
  ok(!pe.length, 'sem erro de página' + (pe.length ? ': ' + [...new Set(pe)].slice(0, 4).join(' | ') : ''));
  await b.close(); if (errs.length) { console.log(`\n${errs.length} falha(s)`); process.exit(1); } console.log('\nsem erros');
})().catch(e => { console.error(e); process.exit(1); });

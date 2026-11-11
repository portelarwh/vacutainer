// Waste 1.11.0 · etapa 3 do alinhamento com a controladoria: target MUV da linha no Portal (Metas da área WASTE-MUV-<linha>),
// vigência, período (mês/ano), moeda R$/US$ pelo câmbio do Portal, filtro de linha, semana ISO, MUV × target acumulado no FY e exports.
// Dados fictícios (modo de teste) e cadastro sintético na cópia local (vac.cadastros). Código 1 se falhar.
const path = require('path'); const RAIZ = path.resolve(__dirname, '..') + '/';
const { chromium } = require('playwright');
const errs = []; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA ') + m); if (!c) errs.push(m); };
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: 1440, height: 1000 } }); await c.clock.setFixedTime(new Date('2026-11-11T12:00:00'));
  const o = await c.newPage(); const pe = []; o.on('pageerror', e => pe.push(e.message)); o.on('dialog', d => d.accept());
  await o.goto('file://' + RAIZ + 'paginas/Perdas-Ordem.html'); await o.waitForTimeout(900);
  await o.evaluate(() => { document.querySelectorAll('.overlay').forEach(x => x.remove()); try { localStorage.removeItem('perdas.moeda'); } catch (e) { } enterTest(); }); await o.waitForTimeout(1200);
  const R = await o.evaluate(async () => {
    const w = t => new Promise(r => setTimeout(r, t)), out = {};
    const cad = metas => { localStorage.setItem('vac.cadastros', JSON.stringify({ schema: 'vac-cadastros', rev: 3,
      linhas: [{ codigo: 'VAC', nome: 'Linha Vacutainer', ativo: true }, { codigo: 'L2', nome: 'Linha 2', ativo: true }],
      catalogos: [['360060', 'VAC'], ['360051', 'VAC'], ['367986', 'L2'], ['367955', 'L2']].map(([codigo, linha]) => ({ codigo, linha, nome: codigo, ativo: true })),
      cambio: [{ codigo: 'USD', ativo: true, vigencias: [{ de: '2020-01-01', ate: null, cotacao: 5 }] }], metasArea: metas }));
      _pc.t = 0; _metaMes.clear(); _lnC.m = null; };
    cad([{ codigo: 'WASTE-MUV-VAC', nome: 'MUV Vacutainer', pagina: 'Waste', unidade: 'R$', periodo: 'mês', linha: 'VAC', ativo: true, vigencias: [{ de: '2020-01-01', ate: null, valor: 20000 }] },
      { codigo: 'WASTE-MUV-L2', nome: 'MUV Linha 2', pagina: 'Waste', unidade: 'US$', periodo: 'ano', linha: 'L2', ativo: true, vigencias: [{ de: '2020-01-01', ate: null, valor: 120000 }] },
      { codigo: 'WASTE-MES', nome: 'antiga', pagina: 'Waste', unidade: 'R$', ativo: true, vigencias: [{ de: '2020-01-01', ate: null, valor: 999 }] }]);
    const per = allPers().slice(-1)[0]; out.per = per;
    out.total = metaPer(per); out.nota = metaNota(per);
    F.linha = 'VAC'; _metaMes.clear(); out.vac = metaPer(per); F.linha = 'L2'; _metaMes.clear(); out.l2 = metaPer(per);
    // filtro de linha: as ordens das duas linhas somam o total
    F.linha = ''; _metaMes.clear(); renderPainel(); await w(100); const nT = F._ords.length, muvT = F._ords.reduce((a, x) => a + x.muv, 0);
    F.linha = 'VAC'; _metaMes.clear(); renderPainel(); await w(100); const nV = F._ords.length, catsV = [...new Set(F._ords.map(x => x.cat))].sort().join(), muvV = F._ords.reduce((a, x) => a + x.muv, 0);
    out.chip = document.getElementById('chips').textContent; out.sit = (document.querySelector('.vk-sit') || {}).textContent || '';
    F.linha = 'L2'; _metaMes.clear(); renderPainel(); await w(100); const nL = F._ords.length, muvL = F._ords.reduce((a, x) => a + x.muv, 0);
    out.linhas = { nT, nV, nL, catsV, soma: Math.abs(muvT - muvV - muvL) < 0.01, opc: [...document.querySelectorAll('#fLinha option')].map(x => x.textContent).join('|') };
    // MUV × target acumulado (tela com todas as linhas)
    F.linha = ''; _metaMes.clear(); renderPainel(); await w(100);
    const ac = document.getElementById('chAcum'); out.acum = { bars: ac.querySelectorAll('svg rect').length, metas: (ac.innerHTML.match(/<title>meta /g) || []).length, linha: /stroke-dasharray/.test(ac.innerHTML), txt: ac.textContent.slice(-80) };
    const tr = trendSerie(), A = acumFY(tr); out.acumOk = A.length > 0 && Math.abs(A[A.length - 1].value - tr.filter(x => fyOf(x.key) === A[0].fy).reduce((a, x) => a + x.value, 0)) < 0.01 && Math.abs(A[A.length - 1].meta - A.length * 70000) < 0.01;
    // moeda de exibição USD: R$ ÷ 5; US$ direto
    localStorage.setItem('perdas.moeda', 'USD'); _metaMes.clear(); out.usd = metaPer(per); localStorage.removeItem('perdas.moeda'); _metaMes.clear();
    // exports: meta total em R$, mesmo com a linha escolhida na tela
    F.linha = 'VAC'; const e = buildExports(); out.ex = e.porMes.find(x => x.per === per); out.linhaDepois = F.linha; F.linha = ''; _metaMes.clear();
    // sem target MUV: volta a WASTE-MES; com uma linha escolhida, sem meta
    cad([{ codigo: 'WASTE-MES', nome: 'antiga', pagina: 'Waste', unidade: 'R$', ativo: true, vigencias: [{ de: '2020-01-01', ate: null, valor: 45000 }] }]);
    out.mes = metaPer(per); F.linha = 'VAC'; _metaMes.clear(); out.mesLinha = metaPer(per); F.linha = ''; _metaMes.clear();
    // semana ISO pela data da Produção
    const q0 = oeeQuick; oeeQuick = () => ({ ini: '2026-11-09T06:10:00' }); out.sem = semanaDe('1'); oeeQuick = () => ({ ini: '2027-01-01' }); out.sem2 = semanaDe('1'); oeeQuick = () => null; out.sem3 = semanaDe('1');
    oeeQuick = () => ({ ini: '2026-11-09' }); out.semOpc = semanasOpc().join(); F.sem = '2026-S46'; renderPainel(); await w(100); out.semN = F._ords.length; out.semChip = document.getElementById('chips').textContent;
    F.sem = ''; oeeQuick = q0; renderPainel();
    return out; });
  ok(R.total === 70000, `meta do mês ${R.per} = soma dos targets das linhas: VAC R$ 20.000 + L2 US$ 120.000/ano ÷ 12 × 5 = R$ 50.000 → ${R.total}`);
  ok(/target MUV das linhas/.test(R.nota) && /Linha Vacutainer/.test(R.nota) && /Linha 2/.test(R.nota), `nota da meta com as linhas (${R.nota})`);
  ok(R.vac === 20000 && R.l2 === 50000, `com uma linha no filtro, só o target dela (VAC ${R.vac}, L2 ${R.l2})`);
  ok(R.linhas.nV + R.linhas.nL === R.linhas.nT && R.linhas.nV > 0 && R.linhas.catsV === '360051,360060' && R.linhas.soma, `filtro de linha: ${R.linhas.nV} + ${R.linhas.nL} = ${R.linhas.nT} ordens, VAC só com 360051/360060, MUV soma`);
  ok(/Linha Vacutainer/.test(R.linhas.opc) && /Linha 2/.test(R.linhas.opc) && /Linha: Linha Vacutainer/.test(R.chip), `seletor e pílula da linha (${R.linhas.opc})`);
  ok(/Meta do período\s*R\$\s*[\d.]+/.test(R.sit) && !/Sem meta/.test(R.sit), 'Situação com a meta da linha');
  ok(R.acum.bars > 0 && (R.acum.metas === R.acum.bars || R.acum.linha) && R.acumOk && /target pelo Portal/.test(R.acum.txt), `MUV × target acumulado no FY: ${R.acum.bars} barras com o target acumulado (${R.acum.metas || (R.acum.linha ? 'linha' : 0)} traço(s)), último = soma do FY`);
  ok(Math.abs(R.usd - 14000) < 0.01, `vendo em US$: R$ 20.000 ÷ 5 + US$ 10.000 = ${R.usd}`);
  ok(R.ex && R.ex.meta === 70000 && R.ex.metaFonte === 'portal-muv' && R.linhaDepois === 'VAC', `exports.porMes: meta total em R$ (${R.ex && R.ex.meta}, ${R.ex && R.ex.metaFonte}) sem o filtro da tela, que fica como estava`);
  ok(R.mes === 45000 && R.mesLinha == null, `sem WASTE-MUV: meta WASTE-MES (${R.mes}); com linha escolhida, sem meta (${R.mesLinha})`);
  ok(R.sem === '2026-S46' && R.sem2 === '2026-S53' && R.sem3 === '', `semana ISO pela data da Produção (09/11/2026 → ${R.sem}; 01/01/2027 → ${R.sem2}; sem data → vazio)`);
  ok(R.semOpc === '2026-S46' && R.semN > 0 && /Semana: semana 46\/2026/.test(R.semChip), `filtro de semana (${R.semN} ordens, pílula)`);
  ok(!pe.length, 'sem erro de página' + (pe.length ? ': ' + pe.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(errs.length ? `\n${errs.length} falha(s)` : '\nsem erros'); process.exit(errs.length ? 1 : 0);
})();

// E2 do plano único (08/11/2026): versão única por página (F10), "hoje" no dia local (F12) e meta do Waste pela vigência do mês,
// ponderada pelos dias quando há duas vigências no mesmo mês (F05). node testes/tvigencias.js → "sem erros"; código 1 se falhar
const path = require('path'), fs = require('fs'); const RAIZ = path.resolve(__dirname, '..') + '/'; const PG = 'file://' + RAIZ + 'paginas/';
const { chromium } = require('playwright');
const errs = []; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA ') + m); if (!c) errs.push(m); };
const PAGS = ['Portal.html', 'OEE-Vacutainer.html', 'Perdas-Ordem.html', 'Gestão-Gel-Vacutainer.html', 'Paradas.html', 'Equipamentos.html', 'Iniciativas.html', 'Projetos.html'];

(async () => {
  const b = await chromium.launch();
  // ---------- F10 · versão: tela = constante da página = o que o Portal › Versões lê no HTML = o que vai para a base/exports
  {
    const portal = await b.newPage(); await portal.goto(PG + 'Portal.html'); await portal.waitForTimeout(900);
    for (const a of PAGS) {
      const p = await b.newPage(); p.on('dialog', d => d.accept()); await p.goto(PG + encodeURI(a)); await p.waitForTimeout(1300);
      const v = await p.evaluate(() => ({ tela: ((document.getElementById('appVer') || {}).textContent || '').trim().replace(/^v/, ''), page: typeof PAGE !== 'undefined' ? String(PAGE.versao) : null,
        app: typeof APP_VER !== 'undefined' ? APP_VER : typeof APP_VERSION !== 'undefined' ? APP_VERSION : null }));
      const det = await portal.evaluate(t => versaoHtml(t).v, fs.readFileSync(RAIZ + 'paginas/' + a, 'utf8'));
      const base = a === 'Perdas-Ordem.html' ? await p.evaluate(() => ({ e: emptyBase().appVersion })) : null;
      const vs = [v.tela, v.page, det].concat(v.app ? [v.app] : []).concat(base ? [base.e] : []);
      ok(v.tela && vs.every(x => x === v.tela), `${a}: versão igual na tela, no código${v.app ? ', na constante' : ''}${base ? ', na base' : ''} e no Portal › Versões (${vs.join(' / ')})`);
      await p.close();
    }
    await portal.close();
  }
  // ---------- F12 · "hoje" no dia local: 30/11 às 22h30 em Brasília continua 30/11
  {
    const ctx = await b.newContext({ timezoneId: 'America/Sao_Paulo' }); const p = await ctx.newPage();
    await p.clock.setFixedTime(new Date('2026-11-30T22:30:00-03:00')); await p.goto(PG + 'Paradas.html'); await p.waitForTimeout(900);
    const r = await p.evaluate(() => {
      localStorage.setItem('vac.cadastros', JSON.stringify({ schema: 'vac-cadastros', rev: 1, cambio: [{ codigo: 'USD', ativo: true, vigencias: [{ de: '2026-11-01', ate: '2026-11-30', cotacao: 5 }, { de: '2026-12-01', cotacao: 6 }] }] }));
      const vs = [{ de: '2026-11-01', ate: '2026-11-30', v: 'nov' }, { de: '2026-12-01', v: 'dez' }];
      return { hoje: vacHoje(), vig: (vacVig(vs) || {}).v, vigData: (vacVig(vs, '2026-12-01') || {}).v, cambio: (vacCambio(undefined, 'USD') || {}).cotacao, cambioData: (vacCambio('2026-12-02', 'USD') || {}).cotacao };
    });
    ok(r.hoje === '2026-11-30' && r.vig === 'nov' && r.cambio === 5, `22h30 de 30/11 (Brasília), sem data: dia ${r.hoje}, vigência ${r.vig}, câmbio ${r.cambio} (antes: dezembro e 6)`);
    ok(r.vigData === 'dez' && r.cambioData === 6, 'com data explícita: a data do fato continua valendo');
    await ctx.close();
  }
  // ---------- F05 · meta WASTE-MES pela vigência de cada mês, ponderada pelos dias
  {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } }); const pe = []; p.on('pageerror', e => pe.push(e.message)); p.on('dialog', d => d.accept());
    await p.goto(PG + 'Perdas-Ordem.html'); await p.waitForTimeout(900); await p.evaluate(() => { document.querySelectorAll('.overlay').forEach(o => o.remove()); enterTest(); }); await p.waitForTimeout(800);
    const r = await p.evaluate(() => {
      const pers = allPers(); const L = pers[pers.length - 1], A = pers[pers.length - 2], [y, m] = L.split('-').map(Number), n = new Date(y, m, 0).getDate();
      const cad = metas => { localStorage.setItem('vac.cadastros', JSON.stringify({ schema: 'vac-cadastros', rev: 2, metasArea: [{ codigo: 'WASTE-MES', ativo: true, unidade: 'R$', vigencias: metas }] })); _pc.t = 0; _metaMes.clear(); };
      // duas vigências no último mês: 10 mil até o dia 14, 20 mil a partir do dia 15
      cad([{ de: '2020-01-01', ate: L + '-14', valor: 10000 }, { de: L + '-15', valor: 20000 }]);
      const esperado = (10000 * 14 + 20000 * (n - 14)) / n;
      const mL = metaPer(L), mA = metaPer(A), nota = metaNota(L);
      const d = docMensal(L); const total = d.blocos[0].itens.find(k => k[0] === 'MUV');
      const serie = trendSerie(L); const svg = barChart(serie); const tracos = (svg.match(/<title>meta /g) || []).length;
      F.de = A; F.ate = L; renderPainel(); const kpi = [...document.querySelectorAll('#kpis .kpi, #kpis > div')].map(e => e.textContent).find(t => /^\s*MUV/.test(t)) || '';
      // mês sem vigência no Portal: vale a meta local da página
      cad([{ de: L + '-01', valor: 30000 }]); B.config.meta = 5000; const semVig = metaPer(A), comVig = metaPer(L);
      // uma vigência só para todos os meses: comportamento de antes (uma linha de meta)
      cad([{ de: '2020-01-01', valor: 40000 }]); const unica = barChart(trendSerie(L)); B.config.meta = null;
      return { L, A, n, mL, esperado, mA, nota, totalSub: total && total[2], tracos, pontos: serie.length, kpi, semVig, comVig, linhaUnica: (unica.match(/stroke-dasharray="5 4"/g) || []).length, tracosUnica: (unica.match(/<title>meta /g) || []).length };
    });
    ok(Math.abs(r.mL - r.esperado) < 0.01, `${r.L}: duas vigências no mês → ponderada pelos dias (${r.mL.toFixed(2)}; esperado ${r.esperado.toFixed(2)} = 10 mil × 14 d + 20 mil × ${r.n - 14} d)`);
    ok(r.mA === 10000, `${r.A}: só a vigência de 10 mil cobre o mês → ${r.mA} (antes: a meta de hoje)`);
    ok(/ponderada pelos dias/.test(r.totalSub || '') && /14 d/.test(r.totalSub || ''), `relatório mensal mostra a meta ponderada (${(r.totalSub || '').slice(0, 80)})`);
    ok(r.tracos === r.pontos, `tendência: metas diferentes por mês → um traço de meta por barra (${r.tracos} de ${r.pontos})`);
    ok(r.semVig === 5000 && r.comVig === 30000, `mês sem vigência no Portal usa a meta local (${r.semVig}); com vigência, a do Portal (${r.comVig})`);
    ok(r.linhaUnica === 1 && r.tracosUnica === 0, 'uma vigência só: continua uma linha de meta, como antes');
    ok(/acima|dentro/.test(r.kpi) && /meta/.test(r.kpi), `painel: meta do período = soma das metas dos meses (${r.kpi.replace(/\s+/g, ' ').slice(0, 90)})`);
    ok(!pe.length, `Waste sem erro de página${pe.length ? ' (' + pe[0] + ')' : ''}`);
    await p.close();
  }
  await b.close();
  console.log(errs.length ? `\n${errs.length} falha(s)` : '\nsem erros'); process.exit(errs.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });

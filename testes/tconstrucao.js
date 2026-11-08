/* Páginas em construção e em atualização (docs/paginas-construcao.md). Iniciativas e Equipamentos saíram da construção na 1.0.0 (E6 e E11, 08/11/2026): testes/tplanner.js e testes/tequip.js
   node testes/tconstrucao.js  → sai com código 1 se alguma checagem falhar. Prints em testes/saida/construcao/. */
const RAIZ = require('path').resolve(__dirname, '..') + '/', fs = require('fs');
const { chromium } = require('playwright');
const S = 'file://' + RAIZ + 'paginas/', OUT = RAIZ + 'testes/saida/construcao/'; fs.mkdirSync(OUT, { recursive: true });
const errs = []; const ok = (c, m) => { console.log((c ? 'ok    ' : 'FALHA ') + m); if (!c) errs.push(m); };
const NOVAS = [['Projetos', 'Projetos.html', 'projetos', ['lista', 'cronograma']]];
(async () => {
  const b = await chromium.launch();
  const nova = async (vp = { width: 1440, height: 950 }) => { const ctx = await b.newContext({ viewport: vp }); const p = await ctx.newPage(); const E = [];
    p.on('pageerror', e => E.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) E.push('console: ' + m.text()); });
    p.on('dialog', d => d.accept()); return { ctx, p, E }; };

  /* 1) Portal: vac.sistemas antigo (sem estado) → estado vem do catálogo; Configuração › Módulos troca a situação */
  { const { ctx, p, E } = await nova();
    await p.goto(S + 'Portal.html#geral'); await p.evaluate(() => { localStorage.setItem('vac.sistemas', JSON.stringify([{ id: 'portal', nome: 'Portal', html: 'Portal.html' }, { id: 'gel', nome: 'Gel', html: 'Gestão-Gel-Vacutainer.html', base: 'fifo-base.json' }, { id: 'paradas', nome: 'Paradas', html: 'Paradas.html', base: 'paradas-base.json' }])); });
    await p.reload(); await p.waitForTimeout(700); await p.evaluate(() => enterTest()); await p.waitForTimeout(500);
    const st = await p.evaluate(() => ['gel', 'paradas', 'equip', 'inic', 'projetos', 'oee', 'perdas'].map(id => id + ':' + ((vacEstadoDe(id) || {}).estado || 'estável')).join(' '));
    ok(st === 'gel:atualizacao paradas:atualizacao equip:atualizacao inic:atualizacao projetos:construcao oee:estável perdas:estável', 'Portal · situação vinda do catálogo com vac.sistemas antigo: ' + st);
    ok(await p.evaluate(() => !!document.querySelector('#sysNav a .vest[data-e="atualizacao"]')), 'Portal · selo "em atualização" na barra');
    /* cartão de página em construção e Versões sem "base não encontrada" */
    const card = await p.evaluate(() => { const s = { id: 'inic', nome: 'Iniciativas', html: 'Iniciativas.html' }; MOD.data.inic = { sys: s, construcao: true, planejado: JSON.parse('{"nota":"x","abas":[{"aba":"OSM","subabas":[{"nome":"Planner"}]},{"aba":"5S"}]}'), versaoHtml: '0.1', pend: [], kpis: [] }; const h = card(s); delete MOD.data.inic; return h; });
    ok(/em construção/.test(card) && /Vai ter:/.test(card) && /OSM.*Planner/.test(card) && !/sem dados/.test(card), 'Portal · cartão "em construção" com as abas planejadas');
    const av = await p.evaluate(() => Vers.avisos({ id: 'projetos', nome: 'Projetos', html: { v: '0.1', cab: String(VAC_CAB_VERSAO), arq: 'Projetos.html' }, htmls: [1], bases: [], base: null }).map(a => a[1]).join(' | '));
    ok(!/base não encontrada/.test(av), 'Portal · Versões: página em construção sem aviso de base ausente (' + (av || 'nenhum aviso') + ')');
    const av2 = await p.evaluate(() => Vers.avisos({ id: 'gel', nome: 'Gestão de Gel', html: { v: '2.03', cab: String(VAC_CAB_VERSAO), arq: 'x' }, htmls: [1], bases: [], base: null }).map(a => a[1]).join(' | '));
    ok(/base não encontrada/.test(av2), 'Portal · Versões: página estável/atualização sem base continua com aviso');
    /* Configuração › Módulos: Gel → Estável, salvar; selo some; volta para Em atualização com nota */
    await p.evaluate(() => App.show('config')); await p.waitForTimeout(400);
    ok(await p.$('[data-estado="gel"]') != null, 'Portal · Configuração › Módulos tem "Situação da página"');
    await p.selectOption('[data-estado="gel"]', ''); await p.click('#mSave'); await p.waitForTimeout(600);
    const g1 = await p.evaluate(() => { const x = JSON.parse(localStorage.getItem('vac.sistemas')).find(s => s.id === 'gel'); return [x.estado, (vacEstadoDe('gel') || {}).estado || 'estável', (Store.B.config.sistemas || []).find(s => s.id === 'gel').estado]; });
    ok(g1[0] === null && g1[1] === 'estável' && g1[2] === null, 'Portal · Gel marcado Estável (vac.sistemas e portal-base): ' + JSON.stringify(g1));
    await p.waitForTimeout(300); ok(await p.evaluate(() => !document.querySelector('#sysNav a[href*="Gel"] .vest')), 'Portal · selo do Gel some da barra');
    await p.evaluate(() => App.show('config')); await p.waitForTimeout(300);
    await p.selectOption('[data-estado="gel"]', 'atualizacao'); await p.fill('[data-estnota="gel"]', 'Teste de nota'); await p.click('#mSave'); await p.waitForTimeout(600);
    ok(await p.evaluate(() => { const e = vacEstadoDe('gel'); return e && e.estado === 'atualizacao' && e.nota === 'Teste de nota'; }), 'Portal · Gel de volta para Em atualização, com nota');
    ok(!E.length, 'Portal · sem erros' + (E.length ? ': ' + E.join(' | ') : '')); await ctx.close(); }

  /* 2) páginas em construção */
  for (const [nome, arq, id, abas] of NOVAS) {
    for (const tema of ['light', 'dark']) {
      const { ctx, p, E } = await nova(); await p.goto(S + arq); await p.evaluate(t => localStorage.setItem('vac.theme', t), tema); await p.reload(); await p.waitForTimeout(700);
      const r = await p.evaluate(() => ({ titulo: document.getElementById('vacTitulo').textContent, pill: (document.getElementById('vacEstPill') || {}).textContent, faixa: !!document.querySelector('#vacEstFaixa.construcao'),
        cur: (document.querySelector('#sysNav a.cur') || {}).textContent, nav: [...document.querySelectorAll('#nav [data-t]')].map(x => x.dataset.t), ver: document.getElementById('appVer').textContent,
        sync: !!document.getElementById('btnSync'), pasta: typeof showDirectoryPicker, ls: Object.keys(localStorage).filter(k => !/^vac\.(theme|sistemas|estadoOculto)/.test(k)) }));
      if (tema === 'light') {
        ok(r.pill === 'em construção' && r.faixa, `${nome} · pílula e faixa "em construção"`);
        ok(await p.evaluate(() => !!document.querySelector('#sysNav a.cur .vest[data-e="construcao"]')), `${nome} · página atual na barra com selo`);
        ok(abas.every(a => r.nav.includes(a)) && r.nav[0] === 'geral', `${nome} · abas planejadas: ${r.nav.join(', ')}`);
        const vg = (fs.readFileSync(RAIZ + 'fontes/modelo/gerar_paginas.py', 'utf8').match(/'versao': '([\d.]+)'/) || [])[1];   // versão do gerador (0.1, 0.1.1…)
        ok(r.ver === 'v' + vg && !r.sync, `${nome} · versão v${vg} (do gerador) e sem Sincronizar/Backup/TV`);
        ok(!r.ls.length, `${nome} · não grava nada no navegador além de tema/sistemas (${r.ls.join(',') || 'nada'})`);
        await p.click(`#nav [data-t="${abas[0]}"]`); await p.waitForTimeout(250);
        ok(await p.evaluate(a => location.hash === '#aba=' + a && /em construção/.test(document.querySelector('#main').textContent), abas[0]), `${nome} · aba ${abas[0]} abre o cartão de construção (#aba=…)`);
        await p.click('#vacVoltar'); await p.waitForTimeout(350);
        ok(await p.evaluate(() => document.querySelector('#nav [data-t="geral"]').classList.contains('on')), `${nome} · ← Voltar volta para a Visão geral`);
        if (id === 'inic') { await p.goto(S + arq + '#aba=osm/planner'); await p.waitForTimeout(500);
          ok(await p.evaluate(() => document.querySelector('.subtabs [aria-selected="true"]').textContent === 'Ações (Planner)'), 'Iniciativas · #aba=osm/planner abre a subaba'); }
        await p.screenshot({ path: OUT + id + '-claro.png', fullPage: true });
      } else await p.screenshot({ path: OUT + id + '-escuro.png', fullPage: true });
      ok(!E.length, `${nome} (${tema}) · sem erros` + (E.length ? ': ' + E.join(' | ') : '')); await ctx.close();
    }
    const { ctx, p } = await nova({ width: 390, height: 844 }); await p.goto(S + arq); await p.waitForTimeout(600);
    ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${nome} · 390 px sem rolagem lateral`); await p.screenshot({ path: OUT + id + '-390.png', fullPage: true }); await ctx.close();
  }

  /* 3) Gel e Paradas: em atualização (faixa com ✕ que esconde por 7 dias); Produção e Waste sem selo */
  for (const [nome, arq, id, entrar] of [['Paradas', 'Paradas.html', 'paradas', () => modoTeste()], ['Gestão de Gel', 'Gestão-Gel-Vacutainer.html', 'gel', () => { enterDemo(); render(); }]]) {
    const { ctx, p, E } = await nova(); await p.goto(S + arq); await p.waitForTimeout(900); await p.evaluate(entrar); await p.waitForTimeout(700);
    const r = await p.evaluate(() => ({ pill: (document.getElementById('vacEstPill') || {}).textContent, faixa: (document.getElementById('vacEstFaixa') || {}).textContent || '' }));
    ok(r.pill === 'em atualização' && /Página em atualização/.test(r.faixa) && /Ver o que muda/.test(r.faixa), `${nome} · pílula e faixa "em atualização" (${r.pill})`);
    await p.screenshot({ path: OUT + id + '-atualizacao.png' });
    await p.click('#vacEstFaixa .vestx'); await p.waitForTimeout(200); await p.reload(); await p.waitForTimeout(900);
    ok(await p.evaluate(() => !document.getElementById('vacEstFaixa') && !!document.getElementById('vacEstPill')), `${nome} · ✕ esconde a faixa (continua escondida ao reabrir; pílula fica)`);
    ok(!E.length, `${nome} · sem erros` + (E.length ? ': ' + E.join(' | ') : '')); await ctx.close();
  }
  for (const [nome, arq] of [['Produção', 'OEE-Vacutainer.html'], ['Waste', 'Perdas-Ordem.html']]) {
    const { ctx, p, E } = await nova(); await p.goto(S + arq); await p.waitForTimeout(1500);
    ok(await p.evaluate(() => !document.getElementById('vacEstPill') && !document.getElementById('vacEstFaixa') && !!document.querySelector('#sysNav a .vest')), `${nome} · estável (sem pílula nem faixa; selos das outras na barra)`);
    ok(!E.length, `${nome} · sem erros` + (E.length ? ': ' + E.join(' | ') : '')); await ctx.close();
  }
  await b.close(); console.log(errs.length ? `\n${errs.length} FALHA(S)` : '\nsem erros'); process.exit(errs.length ? 1 : 0);
})();

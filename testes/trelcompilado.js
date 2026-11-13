// Portal › Relatórios como compilado de todos os relatórios (13/11/2026; Portal 1.9.36, Produção 2.4.74, Gel 2.35, Paradas 1.2.11).
// Confere a lista por página (Portal, Produção, Waste, Gestão de Gel, Paradas, Outros), o endereço de cada botão e que cada endereço
// abre a tela do relatório na página dona; Relatórios da barra lateral leva a esta tela. Dados fictícios. node testes/trelcompilado.js → "sem erros"
const path = require('path'); const RAIZ = 'file://' + path.resolve(__dirname, '..') + '/paginas/';
const { chromium } = require('playwright');
const errs = []; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA ') + m); if (!c) errs.push(m); };
(async () => {
  const b = await chromium.launch(), c = await b.newContext({ viewport: { width: 1440, height: 1000 } }), pe = [];
  const abre = async (arq) => { const p = await c.newPage(); p.on('pageerror', e => pe.push(arq + ': ' + e.message)); p.on('dialog', d => d.accept()); await p.goto(RAIZ + arq); await p.waitForTimeout(1500); await p.evaluate(() => document.querySelectorAll('.overlay').forEach(o => o.remove())); return p; };

  // ---------- Portal › Relatórios
  const p = await abre('Paradas.html'); await p.evaluate(() => document.getElementById('vdsRel').click()); await p.waitForTimeout(1500);
  const P = await p.evaluate(() => { const ir = []; vacDemo.ir = h => ir.push(h);
    const blocos = [...document.querySelectorAll('#main .card h3')].map(h => h.firstChild.textContent.trim());
    document.querySelectorAll('[data-rel-ir]').forEach(x => x.click());
    return { url: location.pathname.split('/').pop(), aba: App.tab, ver: PAGE.versao, blocos, ir, resumo: !!document.getElementById('rResumo'), pend: !!document.getElementById('rPend') }; });
  ok(P.url === 'Portal.html' && P.aba === 'rel', 'Relatórios da barra lateral (no Paradas) abre Portal › Relatórios');
  ok(P.ver === '1.9.36' && ['Portal', 'Produção', 'Waste', 'Gestão de Gel', 'Paradas', 'Outros'].every(n => P.blocos.includes(n)) && P.resumo && P.pend, 'Portal 1.9.36: um bloco por página (Portal, Produção, Waste, Gestão de Gel, Paradas) e Outros; Resumo e Pendências da linha continuam');
  const tem = h => P.ir.includes(h);
  ok(['shift', 'day', 'week', 'month', 'stops', 'plan', 'view', 'tables'].every(k => tem('OEE-Vacutainer.html#aba=reports&rel=' + k)), 'Produção: os 8 relatórios com link direto (aba=reports&rel=…)');
  ok(tem('Perdas-Ordem.html#aba=relatorios') && tem('Gestão-Gel-Vacutainer.html#aba=relatorios') && tem('Paradas.html#relatorio'), 'Waste, Gel e Paradas: link para a tela de relatórios');
  ok(tem('OEE-Vacutainer.html#aba=sqdcp') && tem('Projetos.html') && tem('Iniciativas.html'), 'Outros: SQDCP, Projetos e Iniciativas');
  await p.close();

  // ---------- destinos
  const o = await abre('OEE-Vacutainer.html#aba=reports&rel=day');
  const O = await o.evaluate(() => ({ r: App.route, t: rpState().type, sel: (document.querySelector('[data-rpt][aria-selected="true"]') || {}).dataset, v: APP_VERSION }));
  ok(O.v === '2.4.74' && O.r === 'reports' && O.t === 'day' && O.sel && O.sel.rpt === 'day', 'Produção 2.4.74: #aba=reports&rel=day abre Relatórios com o Relatório do dia escolhido');
  await o.goto(RAIZ + 'OEE-Vacutainer.html#aba=reports&rel=tables'); await o.waitForTimeout(1500);
  ok(await o.evaluate(() => App.route === 'reports' && rpState().type === 'tables'), 'Produção: #aba=reports&rel=tables abre as Tabelas');
  await o.goto(RAIZ + 'OEE-Vacutainer.html#aba=sqdcp'); await o.waitForTimeout(1500);
  ok(await o.evaluate(() => App.route === 'sqdcp'), 'Produção: #aba=sqdcp abre o SQDCP');
  await o.close();
  const w = await abre('Perdas-Ordem.html#aba=relatorios');
  ok(await w.evaluate(() => !!document.querySelector('#t-relatorios.on #rMensal')), 'Waste: #aba=relatorios abre a aba Relatórios'); await w.close();
  const g = await abre('Gestão-Gel-Vacutainer.html#aba=relatorios');
  ok(await g.evaluate(() => /Fichas e relatórios em PDF/i.test((document.querySelector('#ov') || {}).innerText || '') && APP_VERSION === '2.35'), 'Gel 2.35: #aba=relatorios abre "Fichas e relatórios em PDF"'); await g.close();
  // revisão Codex (PR #75): com a janela "Abrir a base da pasta" aberta, o link espera ela fechar (não a esconde)
  const g2 = await c.newPage(); g2.on('pageerror', e => pe.push('Gel: ' + e.message));
  await g2.addInitScript(() => { window.addEventListener('DOMContentLoaded', () => setTimeout(() => { if (typeof modal === 'function') modal('Abrir a base da pasta', '<p>conexão</p>', '<button class="btn" data-close>Agora não</button>'); }, 300)); });
  await g2.goto(RAIZ + 'Gestão-Gel-Vacutainer.html#aba=relatorios'); await g2.waitForTimeout(2500);
  const c1 = await g2.evaluate(() => /Abrir a base da pasta/i.test((document.querySelector('#ov') || {}).innerText || '')); await g2.evaluate(() => closeModal()); await g2.waitForTimeout(1200);
  const c2 = await g2.evaluate(() => /Fichas e relatórios em PDF/i.test((document.querySelector('#ov') || {}).innerText || ''));
  ok(c1 && c2, 'Gel: com a janela de conexão aberta, os relatórios esperam ela fechar (a conexão não some)'); await g2.close();
  const r = await abre('Paradas.html#relatorio');
  ok(await r.evaluate(() => { const m = document.querySelector('.modal.on, #repModal, .rep'); return !!m && PAGE.versao === '1.2.11'; }), 'Paradas 1.2.11: #relatorio abre o relatório de paradas'); await r.close();

  ok(!pe.length, 'sem erro de página' + (pe.length ? ': ' + [...new Set(pe)].slice(0, 3).join(' | ') : ''));
  await b.close(); if (errs.length) { console.log(`\n${errs.length} falha(s)`); process.exit(1); } console.log('\nsem erros');
})().catch(e => { console.error(e); process.exit(1); });

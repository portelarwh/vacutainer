// Autoria na Produção (2.4.75, revisão da PR #76): o nome de quem grava vem da sessão do login, não de um nome antigo guardado no
// IndexedDB; a troca de pessoa feita em outra página (evento storage) também atualiza o nome guardado. Dados fictícios.
// node testes/tautor.js → "sem erros"; código 1 se falhar
const path = require('path'); const PG = 'file://' + path.resolve(__dirname, '..') + '/paginas/OEE-Vacutainer.html';
const { chromium } = require('playwright');
const errs = []; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA ') + m); if (!c) errs.push(m); };
(async () => {
  const b = await chromium.launch(), c = await b.newContext(), p = await c.newPage(), pe = []; p.on('pageerror', e => pe.push(e.message)); p.on('dialog', d => d.dismiss());
  const abre = async () => { await p.goto(PG); await p.waitForFunction(() => typeof Store !== 'undefined' && Store.S && Store.S.user !== undefined && typeof IDB !== 'undefined', null, { timeout: 20000 }); await p.waitForTimeout(600); };
  const estado = () => p.evaluate(async () => ({ tela: Store.S.user, guardado: await IDB.get('user') }));
  // 1) Ana usou este computador: o nome dela ficou guardado no IndexedDB da Produção
  await abre(); await p.evaluate(async () => { vacAoTrocarUsuario('Ana Fictícia'); await new Promise(r => setTimeout(r, 200)); });
  // 2) Bia entra pelo login em outra página (sessão válida); a Produção estava fechada
  await p.evaluate(() => { localStorage.setItem('vac.user', 'Bia Fictícia'); localStorage.setItem('vac.userId', '9002'); localStorage.setItem('vac.sessao', JSON.stringify({ id: '9002', nome: 'Bia Fictícia', em: new Date().toISOString(), ate: Date.now() + 3600e3 })); });
  await abre(); let e = await estado();
  ok(e.tela === 'Bia Fictícia', `ao abrir, a Produção usa a pessoa da sessão (Bia), não o nome guardado de antes (${e.tela})`);
  ok(e.guardado === 'Bia Fictícia', `o nome guardado passa a ser o da sessão (${e.guardado})`);
  // 3) Carla entra em outra página com a Produção aberta: o evento storage troca a tela e o guardado
  await p.evaluate(() => window.dispatchEvent(new StorageEvent('storage', { key: 'vac.user', newValue: 'Carla Fictícia', oldValue: 'Bia Fictícia' }))); await p.waitForTimeout(300); e = await estado();
  ok(e.tela === 'Carla Fictícia' && e.guardado === 'Carla Fictícia', `troca em outra página atualiza a tela e o nome guardado (${e.tela} / ${e.guardado})`);
  // 4) Sessão vencida e sem vac.user: sem sessão não se inventa autor a partir da sessão vencida
  await p.evaluate(() => { localStorage.setItem('vac.sessao', JSON.stringify({ id: '9002', nome: 'Bia Fictícia', ate: Date.now() - 1000 })); localStorage.setItem('vac.user', 'Dani Fictícia'); });
  await abre(); e = await estado(); ok(e.tela === 'Dani Fictícia', `sessão vencida: vale o vac.user atual, não o nome da sessão vencida (${e.tela})`);
  ok(!pe.length, 'sem erro de página' + (pe.length ? ': ' + pe.slice(0, 2).join(' | ') : ''));
  await b.close(); if (errs.length) { console.log(`\n${errs.length} falha(s)`); process.exit(1); } console.log('\nsem erros');
})().catch(e => { console.error(e); process.exit(1); });

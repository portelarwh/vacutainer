// Login com ID e senha de 6 números (kit vacLogin, Portal 1.9.22, 11/11/2026): pop-up em todas as páginas, 1º acesso, senha errada e bloqueio,
// provisória, autocadastro, sessão compartilhada e até o fim do turno, TV e testes sem pop-up. Dados fictícios. Código 1 se falhar.
const path = require('path'), fs = require('fs'); const RAIZ = path.resolve(__dirname, '..') + '/'; const PG = 'file://' + RAIZ + 'paginas/';
const { chromium } = require('playwright');
const errs = []; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA ') + m); if (!c) errs.push(m); };
const SAI = RAIZ + 'testes/saida/login/'; fs.mkdirSync(SAI, { recursive: true });
const USERS = [{ codigo: '104233', nome: 'Pedro Teste', perfil: 'ADMIN', especialidade: 'Engenharia de Processos', ativo: true },
  { codigo: '208114', nome: 'J. Lima', perfil: 'CONSULTA', area: 'Manutenção', ativo: true }, { codigo: '9', nome: 'Inativo', perfil: 'CONSULTA', ativo: false }];
const digita = async (p, sel, pin) => { const L = await p.$$(sel + ' input'); for (let i = 0; i < 6; i++) await L[i].fill(pin[i]); };
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1280, height: 860 } }); const pe = [];
  const p = await ctx.newPage(); p.on('pageerror', e => pe.push('portal: ' + e.message)); p.on('dialog', d => d.accept());
  // sem vac.login.forcar (teste automático): nenhuma página abre o pop-up
  await p.goto(PG + 'Portal.html'); await p.waitForTimeout(900);
  ok(!(await p.evaluate(() => vacLogin.aberto)), 'teste automático sem vac.login.forcar: pop-up não aparece (outras suítes seguem iguais)');
  await p.evaluate(() => { localStorage.setItem('vac.login.forcar', '1'); for (const k of ['vac.sessao', 'vac.user', 'vac.userId', 'vac.perfil', 'vac.login.erros']) localStorage.removeItem(k); });
  await p.goto(PG + 'Portal.html'); await p.waitForTimeout(1200);
  await p.evaluate(() => enterTest()); await p.waitForTimeout(1200);
  await p.evaluate(U => { Cad.base.usuarios = U; Cad.recompute(); vacLogin.fechar(); vacLogin.checar(); }, USERS); await p.waitForTimeout(200);
  ok(await p.evaluate(() => vacLogin.aberto && !!document.querySelector('.vlog #vlId')), 'Portal sem sessão: pop-up abre pedindo o ID');
  const vis = await p.evaluate(() => ({ t: document.querySelector('.vlog .vl-t').textContent, logo: !!document.querySelector('.vlog .vl-logo'), inert: [...document.body.children].filter(n => !n.classList.contains('vlog')).every(n => n.inert), veu: getComputedStyle(document.querySelector('.vlog')).backgroundColor }));
  ok(/^Sistema de gestão Vacutainer/.test(vis.t) && vis.logo && vis.inert && /rgba\(.*0\.6/.test(vis.veu), `título, logo, fundo escurecido e página atrás sem clique (${vis.veu})`);
  await p.screenshot({ path: SAI + 'portal-id.png' });
  // ID inexistente com 1 letra errada e inativo
  await p.fill('#vlId', '9'); await p.click('#vlOk');
  ok(/inativo/.test(await p.textContent('#vlMsg')), 'ID inativo: não entra');
  // 1º acesso: cria a senha
  await p.fill('#vlId', '104233'); await p.click('#vlOk'); await p.waitForTimeout(100);
  const q = await p.textContent('.vlog .vl-who'); ok(/Pedro Teste/.test(q) && /Engenharia de Processos/.test(q), `mostra nome e função (${q.trim()})`);
  await digita(p, '#vlP1', '111111'); await digita(p, '#vlP2', '111111'); await p.click('#vlOk');
  ok(/repetidos ou em sequência/.test(await p.textContent('#vlMsg')), 'senha fraca (111111) recusada');
  await digita(p, '#vlP1', '482913'); await digita(p, '#vlP2', '482910'); await p.click('#vlOk');
  ok(/não são iguais/.test(await p.textContent('#vlMsg')), 'confirmação diferente recusada');
  await digita(p, '#vlP2', '482913'); await p.click('#vlOk'); await p.waitForTimeout(1500);
  const r1 = await p.evaluate(() => { const u = Cad.D.usuarios.find(x => x.codigo === '104233'), a = JSON.stringify(Cad.D.audit || Cad.fila || ''); return { aberto: vacLogin.aberto, user: localStorage.getItem('vac.user'), s: vacLogin.sessao(), senha: u.senha, vaza: a.includes(u.senha && u.senha.hash), fila: JSON.stringify(Cad.fila).includes('"senha"') }; });
  ok(!r1.aberto && r1.user === 'Pedro Teste' && r1.s && r1.s.id === '104233', '1º acesso: senha criada e sessão aberta');
  ok(r1.senha && r1.senha.alg === 'PBKDF2-SHA256' && r1.senha.iter >= 100000 && /^[0-9a-f]{64}$/.test(r1.senha.hash) && !r1.senha.provisoria && !JSON.stringify(r1.senha).includes('482913'), 'senha guardada embaralhada (PBKDF2, sal, sem o número)');
  ok(!r1.vaza, 'histórico do cadastro sem o valor da senha');
  const hist = await p.evaluate(() => { try { const D = clone(Cad.D); const o = Cad.fila.find(x => x.tipo === 'usuarios'); const A = []; aplicarOp(D, { ...o, mudancas: { senha: { antes: null, depois: o.mudancas.senha.depois } } }, A); return JSON.stringify(D.audit ? D.audit.slice(-1) : A); } catch (e) { return 'erro ' + e.message; } });
  ok(!/[0-9a-f]{64}/.test(hist), 'auditoria do cadastro mostra a senha como (oculto)');
  // sair e entrar com senha errada até bloquear
  await p.evaluate(() => vacLogin.sair()); await p.waitForTimeout(150);
  await p.fill('#vlId', '104233'); await p.click('#vlOk');
  for (let i = 0; i < 5; i++) { await digita(p, '#vlP1', '000001'); await p.waitForTimeout(700); }
  const bl = await p.evaluate(() => ({ m: document.querySelector('#vlMsg').textContent, dis: document.querySelector('#vlOk').disabled }));
  ok(/bloqueado/.test(bl.m) && bl.dis, `5 senhas erradas: ID bloqueado neste computador (${bl.m})`);
  await p.evaluate(() => { localStorage.removeItem('vac.login.erros'); vacLogin.abrir(); }); await p.fill('#vlId', '104233'); await p.click('#vlOk');
  await digita(p, '#vlP1', '482913'); await p.waitForTimeout(1500);
  ok(!(await p.evaluate(() => vacLogin.aberto)) && await p.evaluate(() => localStorage.getItem('vac.userId')) === '104233', 'senha certa (Enter automático no 6º número): entra');
  // provisória pelo administrador: ficha do usuário
  await p.evaluate(() => { Lock.on(Cad.D.seguranca && Cad.D.seguranca.senhaHash || 'x'); location.hash = 'cadastros/usuarios/208114'; }); await p.waitForTimeout(600);
  const temSec = await p.evaluate(() => !!document.querySelector('[data-usen="prov"]') && /sem senha/.test(document.body.innerText));
  ok(temSec, 'ficha do usuário: seção Senha com "sem senha" e Gerar senha provisória');
  await p.click('[data-usen="prov"]'); await p.waitForTimeout(1500);
  const prov = await p.evaluate(() => { const t = document.querySelector('.modal.on, #modal') ? document.body.innerText : ''; const m = /(\d{6})/.exec((document.querySelector('#usuProv') || {}).textContent || ''); return { pin: m && m[1], s: Cad.D.usuarios.find(u => u.codigo === '208114').senha }; });
  ok(prov.pin && prov.s && prov.s.provisoria, `senha provisória gerada e mostrada uma vez (${prov.pin})`);
  await p.evaluate(() => { if (typeof Modal !== 'undefined') Modal.close(true); App.show('cad'); Cad.ui.sec = 'usuarios'; App.render(); }); await p.waitForTimeout(700);
  const lista = await p.evaluate(() => [...document.querySelectorAll('table')].map(t => t.innerText).join('\n'));
  ok(/provisória/i.test(lista) && /definida/i.test(lista), 'lista de usuários com a coluna Senha');
  await p.evaluate(() => { if (typeof Modal !== 'undefined') Modal.close(true); vacLogin.abrir({ trocar: true }); }); await p.waitForTimeout(100);
  ok(await p.evaluate(() => !!document.querySelector('#vlSair') && !!document.querySelector('#vlSenha')), 'clique no nome: conta com Trocar usuário, Trocar minha senha e Sair');
  await p.click('#vlTroca'); await p.fill('#vlId', '208114'); await p.click('#vlOk'); await digita(p, '#vlP1', prov.pin); await p.waitForTimeout(1500);
  ok(await p.evaluate(() => !!document.querySelector('#vlP2') && /provisória/.test(document.querySelector('.vl-b').innerText)), 'entrou com a provisória: pede a senha definitiva');
  await digita(p, '#vlP1', '730516'); await digita(p, '#vlP2', '730516'); await p.click('#vlOk'); await p.waitForTimeout(1500);
  const r2 = await p.evaluate(() => ({ u: localStorage.getItem('vac.user'), s: Cad.D.usuarios.find(u => u.codigo === '208114').senha }));
  ok(r2.u === 'J. Lima' && r2.s && !r2.s.provisoria, 'senha definitiva criada no lugar da provisória');
  // autocadastro
  await p.evaluate(() => vacLogin.sair()); await p.fill('#vlId', '555777'); await p.click('#vlOk'); await p.waitForTimeout(100);
  ok(await p.evaluate(() => !!document.querySelector('#vlNome')), 'ID fora do cadastro: autocadastro (nome, turno, especialidade, senha)');
  await p.fill('#vlNome', 'Nova Pessoa'); await digita(p, '#vlP1', '381947'); await digita(p, '#vlP2', '381947'); await p.click('#vlOk'); await p.waitForTimeout(1500);
  const r3 = await p.evaluate(() => { const u = Cad.D.usuarios.find(x => x.codigo === '555777'); return u && { perfil: u.perfil, origem: u.origem, senha: !!(u.senha && u.senha.hash), user: localStorage.getItem('vac.user') }; });
  ok(r3 && r3.perfil === 'CONSULTA' && r3.origem === 'autocadastro' && r3.senha && r3.user === 'Nova Pessoa', 'autocadastro: entra como Consulta, com a senha criada');
  // copia do cadastro para as outras páginas (como o Portal faz ao ler a pasta)
  const copia = await p.evaluate(() => JSON.stringify({ ...Cad.D, turnos: [{ codigo: 'T1', nome: '1º', ativo: true, vigencias: [{ de: '2020-01-01', inicio: '06:00', fim: '14:30' }] }, { codigo: 'T2', nome: '2º', ativo: true, vigencias: [{ de: '2020-01-01', inicio: '14:30', fim: '23:00' }] }, { codigo: 'T3', nome: '3º', ativo: true, vigencias: [{ de: '2020-01-01', inicio: '23:00', fim: '06:00' }] }] }));
  // outra página: Produção
  const q2 = await ctx.newPage(); q2.on('pageerror', e => pe.push('produção: ' + e.message));
  await q2.goto(PG + 'OEE-Vacutainer.html'); await q2.waitForTimeout(600);
  await q2.evaluate(c => { localStorage.setItem('vac.cadastros', c); for (const k of ['vac.sessao', 'vac.user', 'vac.userId']) localStorage.removeItem(k); }, copia);
  await q2.reload(); await q2.waitForTimeout(1500);
  ok(await q2.evaluate(() => vacLogin.aberto && /Produção/.test(document.querySelector('.vlog .vl-t small').textContent)), 'Produção sem sessão: pop-up abre (nome da página no topo)');
  await q2.screenshot({ path: SAI + 'producao-id.png' });
  await q2.evaluate(() => { const C = JSON.parse(localStorage.getItem('vac.cadastros')); C.usuarios.push({ codigo: '700', nome: 'Sem Senha', perfil: 'CONSULTA', ativo: true }); localStorage.setItem('vac.cadastros', JSON.stringify(C)); });
  await q2.fill('#vlId', '700'); await q2.click('#vlOk');
  ok(await q2.evaluate(() => /Portal/.test(document.querySelector('.vl-b').innerText) && /entrar=oee/.test(document.querySelector('.vl-b a').getAttribute('href'))), 'Produção: quem não tem senha cria no Portal (link volta para a Produção)');
  await q2.click('#vlVolta'); await q2.fill('#vlId', '104233'); await q2.click('#vlOk'); await digita(q2, '#vlP1', '482913'); await q2.waitForTimeout(1500);
  const r4 = await q2.evaluate(() => ({ ab: vacLogin.aberto, u: localStorage.getItem('vac.user'), s: vacLogin.sessao() }));
  ok(!r4.ab && r4.u === 'Pedro Teste' && r4.s, 'Produção: entra com a senha criada no Portal (mesma conta da cópia do cadastro)');
  const fim = await q2.evaluate(() => { const f = d => new Date(vacLogin.fimSessao(new Date(d))).toTimeString().slice(0, 5); return [f('2026-11-11T07:10:00'), f('2026-11-11T22:00:00'), f('2026-11-12T02:00:00')]; });
  ok(fim[0] === '14:30' && fim[1] === '23:00' && fim[2] === '06:00', `sessão até o fim do turno (07:10→${fim[0]}, 22:00→${fim[1]}, 02:00→${fim[2]})`);
  // sessão vale nas outras páginas do mesmo computador
  const q3 = await ctx.newPage(); q3.on('pageerror', e => pe.push('paradas: ' + e.message)); await q3.goto(PG + 'Paradas.html'); await q3.waitForTimeout(1200);
  ok(!(await q3.evaluate(() => vacLogin.aberto)), 'Paradas no mesmo computador: entra junto, sem pedir de novo');
  // sair numa página reabre o pop-up nas outras
  await q2.evaluate(() => vacLogin.sair()); await q3.waitForTimeout(400);
  ok(await q3.evaluate(() => vacLogin.aberto), 'Sair na Produção: o pop-up volta também no Paradas');
  // sessão vencida
  await q3.evaluate(() => { localStorage.setItem('vac.userId', '104233'); localStorage.setItem('vac.sessao', JSON.stringify({ id: '104233', ate: Date.now() - 1000 })); vacLogin.fechar(); vacLogin.checar(); });
  ok(await q3.evaluate(() => vacLogin.aberto), 'sessão vencida (fim do turno): pop-up volta');
  // TV: sem login
  await q3.goto(PG + 'Paradas.html#tv'); await q3.waitForTimeout(1200);
  ok(!(await q3.evaluate(() => vacLogin.aberto)), 'modo TV (#tv): abre sem login, só leitura');
  // 390 px
  const c2 = await b.newContext({ viewport: { width: 390, height: 844 } }); const m = await c2.newPage(); await m.goto(PG + 'Paradas.html'); await m.evaluate(c => { localStorage.setItem('vac.login.forcar', '1'); localStorage.setItem('vac.cadastros', c); }, copia); await m.reload(); await m.waitForTimeout(1200);
  await m.fill('#vlId', '104233'); await m.click('#vlOk'); await m.waitForTimeout(100);
  const sw = await m.evaluate(() => { const d = document.querySelector('.vlog .vl-d').getBoundingClientRect(); return d.right <= innerWidth && d.left >= 0; });
  ok(sw, 'pop-up cabe em 390 px'); await m.screenshot({ path: SAI + 'paradas-390.png' }); await c2.close();
  await p.evaluate(() => localStorage.removeItem('vac.login.forcar'));
  ok(!pe.length, 'sem erro de página' + (pe.length ? ': ' + pe.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(errs.length ? `\n${errs.length} falha(s)` : '\nsem erros'); process.exit(errs.length ? 1 : 0);
})().catch(e => { console.error('FALHA ' + e.stack); process.exit(1); });

// C2–C6 da contra-análise de 8cad6a6 (08/11/2026). Cada bloco reproduz o achado; na main anterior falha, com a correção passa.
// C2: AT-04 (resumo de outro dia ao voltar à aba), AT-05 (link da anomalia), AT-10 (troca de usuário na Minha fila), AT-12 (ordem com zeros).
// Pasta simulada (OPFS) por HTTP local e dados fictícios. node testes/tcorrecoes.js → "sem erros"; código 1 se falhar
const path = require('path'), fs = require('fs'), http = require('http'); const RAIZ = path.resolve(__dirname, '..');
const { chromium } = require('playwright');
const srv = http.createServer((q, r) => { const f = path.join(RAIZ, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(RAIZ) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': f.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
const errs = []; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA ') + m); if (!c) errs.push(m); };
const dorme = ms => new Promise(r => setTimeout(r, ms));
const CAD = { equipamentos: ['EQ01', 'EQ02', 'EQ03', 'EQ 04/B'].map(c => ({ codigo: c, nome: 'Máquina ' + c, ativo: true })),
  usuarios: [{ codigo: '1', nome: 'Ana', ativo: true }, { codigo: '2', nome: 'Bia', ativo: true }] };

(async () => {
  await new Promise(r => srv.listen(0, r)); const U = `http://127.0.0.1:${srv.address().port}/paginas/`;
  const b = await chromium.launch(); const pe = [];
  const nova = async (ctx, arq, h = '') => { const p = await ctx.newPage(); p.on('pageerror', e => pe.push(arq + ': ' + e.message)); p.on('dialog', d => d.accept()); await p.goto(U + encodeURI(arq) + h); await p.waitForTimeout(900); return p; };
  const ev = (p, fn, a) => p.evaluate(fn, a);
  const PASTA = { limpa: async () => { const d = await navigator.storage.getDirectory(); for await (const [n] of d.entries()) await d.removeEntry(n, { recursive: true }); },
    grava: async ([nome, j]) => { const d = await navigator.storage.getDirectory(), bd = await d.getDirectoryHandle('00. Bases', { create: true }); const fh = await bd.getFileHandle(nome, { create: true }); const w = await fh.createWritable(); await w.write(JSON.stringify(j)); await w.close(); },
    le: async nome => { try { const d = await navigator.storage.getDirectory(), bd = await d.getDirectoryHandle('00. Bases'); return JSON.parse(await (await (await bd.getFileHandle(nome)).getFile()).text()); } catch (e) { return null; } },
    conecta: async () => { const d = await navigator.storage.getDirectory(); const s0 = IDB.set; IDB.set = async (k, v) => k === 'pasta' ? undefined : s0.call(IDB, k, v); return Store.usar(d); } };

  // ---------- AT-04 · aba aberta na virada do dia: ao voltar, o resumo (exports) passa a ser de hoje
  for (const [arq, base, schema, extra] of [['Iniciativas.html', 'iniciativas-base.json', 'vac-iniciativas', { acoes: [], eventos: [], kas: [] }],
    ['Equipamentos.html', 'equipamentos-base.json', 'vac-equipamentos', { os: [], tags: [], padroes: [], anomalias: [], eventos: [] }]]) {
    const ctx = await b.newContext(); const p = await nova(ctx, arq); await ev(p, PASTA.limpa);
    await ev(p, PASTA.grava, [base, Object.assign({ schema, schemaVersion: 1, rev: 3, revId: 'r3', auditoria: [] }, extra)]); await ev(p, PASTA.conecta); await p.waitForTimeout(600);
    const j0 = await ev(p, PASTA.le, base);
    // a página ficou aberta: outra estação gravou ontem e o resumo é de outro dia
    await ev(p, PASTA.grava, [base, Object.assign({}, j0, { rev: j0.rev + 1, revId: 'ontem', exports: Object.assign({}, j0.exports, { geradoEm: '2020-01-01T10:00:00.000Z' }) })]);
    await ev(p, () => vacAoVoltar()); await p.waitForTimeout(900);
    const j = await ev(p, PASTA.le, base); const g = j && j.exports && j.exports.geradoEm;
    const hoje = await ev(p, () => { const d = new Date(), z = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`; });
    ok(g && g.slice(0, 10) !== '2020-01-01' && j.rev === j0.rev + 2, `AT-04 ${arq}: voltar à aba com o resumo de outro dia grava o resumo de hoje (geradoEm ${g}, hoje ${hoje}; rev ${j && j.rev})`);
    await ctx.close();
  }

  // ---------- AT-05 · link da anomalia leva à máquina certa, também ao abrir a página e com código com espaço e barra
  {
    const ctx = await b.newContext(); await ctx.addInitScript(c => { localStorage.setItem('vac.cadastros', JSON.stringify(c)); }, CAD);
    const p = await nova(ctx, 'Equipamentos.html', '#teste');
    const lk = await ev(p, () => { const D = JSON.parse(JSON.stringify(Store.data)); D.anomalias = [{ id: 'AN-1', equipamento: 'EQ 04/B', descricao: 'vazamento', em: new Date().toISOString() }]; const e = calcExports(D); return (e.pendencias.find(x => x.tipo === 'anomaliaSemOS') || {}).link; });
    await p.close();
    const r = [];
    for (const h of ['#aba=equip&eq=EQ03', '#' + lk]) { const q = await nova(ctx, 'Equipamentos.html', h); r.push(await ev(q, () => App.tab + '|' + App.eq)); await q.close(); }
    const q = await nova(ctx, 'Equipamentos.html'); await ev(q, () => { location.hash = '#aba=equip&eq=EQ02'; }); await q.waitForTimeout(300); r.push(await ev(q, () => App.tab + '|' + App.eq)); await q.close();
    ok(lk === 'aba=equip&eq=EQ%2004%2FB' && r[0] === 'equip|EQ03' && r[1] === 'equip|EQ 04/B' && r[2] === 'equip|EQ02', `AT-05 Equipamentos: link ${lk}; ao abrir → ${r[0]} e ${r[1]}; com a página aberta → ${r[2]}`);
    await ctx.close();
  }

  // ---------- AT-10 · trocar de usuário atualiza a Minha fila e o contador, no "Entrar" e em outra aba
  {
    const ctx = await b.newContext(); const p = await nova(ctx, 'Portal.html');
    const prep = () => { enterTest(); const h = todayISO(); const C = vacCad() || JSON.parse(JSON.stringify(Cad.base || {})); C.usuarios = [{ codigo: '1', nome: 'Ana', ativo: true }, { codigo: '2', nome: 'Bia', ativo: true }]; if (Cad.base) Cad.base.usuarios = C.usuarios; localStorage.setItem('vac.cadastros', JSON.stringify(C));
      localStorage.setItem('vac.user', 'Ana'); localStorage.setItem('vac.userId', '1');
      const ac = (id, t, resp) => ({ id, titulo: t, status: 'em andamento', responsavel: resp, apoios: [], prazo: addDays(h, -1), atrasada: true, origem: { tipo: 'manual' }, vinculos: [], checklist: [0, 0] });
      MOD.data.inic = { sys: sysOf('inic'), kpis: [], pend: [], ex: { exportsVersion: 1, acoes: [ac('AC-A', 'Tarefa da Ana', 'Ana'), ac('AC-B', 'Tarefa da Bia', 'Bia')] } }; App.show('fila'); };
    await ev(p, prep); await p.waitForTimeout(200);
    const lista = pg => ev(pg, () => [...document.querySelectorAll('.fl-i')].map(x => x.querySelector('.fl-t div').textContent).join(','));
    const l0 = await lista(p);
    await ev(p, () => { Entrar.abrir(); Entrar.entrar({ codigo: '2', nome: 'Bia', perfil: '' }, false); }); await p.waitForTimeout(200); const l1 = await lista(p);
    await ev(p, () => Modal.close(true));
    const q = await ctx.newPage(); await q.goto(U + 'Portal.html#aba=geral'); await q.waitForTimeout(400); await ev(q, () => { localStorage.setItem('vac.user', 'Ana'); localStorage.setItem('vac.userId', '1'); }); await q.close(); await p.waitForTimeout(400);
    const l2 = await lista(p);
    ok(l0 === 'Tarefa da Ana' && l1 === 'Tarefa da Bia' && l2 === 'Tarefa da Ana', `AT-10 Portal › Minha fila: Ana (${l0}) → entrar como Bia (${l1}) → Ana em outra aba (${l2})`);
    await ctx.close();
  }

  // ---------- AT-12 · #ordem= acha a ação pelo vínculo de ordem, com ou sem os zeros; não pega ordem citada só no texto nem parecida
  {
    const ctx = await b.newContext(); const p = await nova(ctx, 'Iniciativas.html', '#teste');
    const r = await ev(p, async () => { const mk = (id, vinc, desc) => ({ id, titulo: id, descricao: desc || '', status: 'a fazer', origem: { tipo: 'manual' }, vinculos: vinc, checklist: [], comentarios: [], evidencias: [] });
      Store.data.acoes.push(mk('AC-COM', [{ tipo: 'ordem', cod: '100234567' }]), mk('AC-TXT', [], 'ver a ordem 100234567'), mk('AC-PAR', [{ tipo: 'ordem', cod: '1002345670' }]), mk('AC-LET', [{ tipo: 'ordem', cod: 'R-0042' }]));
      const vis = async h => { location.hash = h; await new Promise(r => setTimeout(r, 250)); return filtradas().map(a => a.id).filter(x => /^AC-(COM|TXT|PAR|LET)$/.test(x)).sort().join(','); };
      return [await vis('#ordem=000100234567'), await vis('#ordem=100234567'), await vis('#ordem=r-0042')]; });
    ok(r[0] === 'AC-COM' && r[1] === 'AC-COM' && r[2] === 'AC-LET', `AT-12 Iniciativas: #ordem=000100234567 → ${r[0]}; sem zeros → ${r[1]}; não numérica → ${r[2]}`);
    await ctx.close();
  }

  // ---------- C3 · AT-06 sem dado ≠ zero · AT-07 todas as ordens do grupo · link da Reunião com dia e turno
  {
    const ctx = await b.newContext(); const p = await nova(ctx, 'Portal.html');
    const r = await ev(p, async () => { enterTest(); const h = todayISO(), D = addDays(h, -1);
      MOD.data.paradas = { sys: sysOf('paradas'), kpis: [], pend: [], ex: { exportsVersion: 1, eventosCobertura: { de: addDays(D, -10), ate: D, cortado: false }, eventos: [
        { dia: D, turno: 'T1', equipamento: 'EQ03', codigo: 'FAL', minutos: 30, ordem: '111' }, { dia: D, turno: 'T1', equipamento: 'EQ03', codigo: 'FAL', minutos: 20, ordem: '222' },
        { dia: D, turno: 'T1', equipamento: 'EQ03', codigo: 'FAL', minutos: 5 }, { dia: D, turno: 'T2', equipamento: 'EQ03', codigo: 'FAL', minutos: 4, ordem: '111' }] } };
      const tx = () => document.getElementById('main') ? document.getElementById('main').innerText : document.body.innerText;
      Reu.dia = addDays(D, -20); Reu.rec = 'dia'; App.show('reuniao'); await new Promise(r => setTimeout(r, 150));
      const fora = reuDados(Reu.dia, 'dia').par, tFora = tx();
      Reu.dia = addDays(D, -3); App.render(); await new Promise(r => setTimeout(r, 100)); const zero = reuDados(Reu.dia, 'dia').par;
      Reu.dia = D; Reu.rec = 'T1'; App.render(); await new Promise(r => setTimeout(r, 100));
      const hr = [...document.querySelectorAll('a')].map(a => a.getAttribute('href') || '').find(x => /Iniciativas\.html#nova=/.test(x) && /EQ03/.test(decodeURIComponent(x)));
      let nv = null; try { nv = JSON.parse(decodeURIComponent(hr.split('#nova=')[1])); } catch (e) { }
      return { fora: fora && fora.min === null && fora.fora, tFora: /sem dado de paradas para esse dia/i.test(tFora), zero: zero && zero.min === 0 && !zero.fora,
        ordens: nv ? nv.vinculos.filter(v => v.tipo === 'ordem').map(v => v.cod).sort().join(',') : null, link: nv && nv.origem && nv.origem.link, D }; });
    ok(r.fora && r.tFora && r.zero, `AT-06 Portal › Reunião: dia fora da cobertura → "—" e "sem dado de paradas" (${r.fora}, ${r.tFora}); dia coberto sem paradas → 0 (${r.zero})`);
    ok(r.ordens === '111,222', `AT-07 Portal › Reunião: ação do grupo EQ03 · FAL ligada às ordens ${r.ordens} (evento sem ordem e ordem repetida não duplicam)`);
    const q = await nova(ctx, 'Portal.html', '#' + ((r.link || '').split('#')[1] || 'x')); const rq = await ev(q, () => App.tab + '|' + Reu.dia + '|' + Reu.rec);
    ok(/reuniao=/.test(r.link || '') && rq === 'reuniao|' + r.D + '|T1', `link da Reunião com dia e turno (${r.link}) → abre em ${rq}`);
    await ctx.close();
    // o Paradas publica a cobertura (aditivo) e o corte de 3000 fica com os eventos mais recentes
    const c2 = await b.newContext(); const pp = await nova(c2, 'Paradas.html', '#teste');
    const ex = await ev(pp, () => { const e = calcExports(Store.data); const d = e.eventos.map(x => x.dia); return { cb: e.eventosCobertura, min: d.reduce((m, x) => x < m ? x : m, '9999'), ord: d.every((x, i) => !i || d[i - 1] <= x) }; });
    ok(ex.cb && /^\d{4}-\d{2}-\d{2}$/.test(ex.cb.de) && /^\d{4}-\d{2}-\d{2}$/.test(ex.cb.ate) && ex.cb.cortado === false && ex.min >= ex.cb.de && ex.ord, `Paradas › exports.eventosCobertura ${JSON.stringify(ex.cb)}; eventos em ordem de dia a partir de ${ex.min}`);
    await c2.close();
  }

  // ---------- C5 · saúde dos dados no Portal › Versões: resumo de outro dia, cobertura cortada, pendentes deste navegador
  {
    const ctx = await b.newContext(); const pi = await nova(ctx, 'Paradas.html');
    await ev(pi, () => vacFila('paradas').espelhar([{ qid: 'qa1', k: 'list', c: 'acoes', items: [{ id: 'P1' }] }, { qid: 'qa2', k: 'list', c: 'acoes', items: [{ id: 'P2' }] }])); await pi.close();
    const p = await nova(ctx, 'Portal.html');
    const r = await ev(p, async () => { const fila = await vacFila.contar(); const iso = new Date().toISOString();
      const linha = { id: 'paradas', nome: 'Paradas', html: { arq: 'Paradas.html', v: '1.0.22', mod: Date.now(), cab: '2', como: 'PAGE.versao' }, base: { loc: '00. Bases', arq: '00. Bases/paradas-base.json', rev: 9, app: '1.0.22', em: iso, exp: true, expEm: '2020-01-01T10:00:00.000Z', expV: 1, cob: { de: '2019-12-20', ate: '2019-12-31', cortado: true } }, bkp: { arq: 'x.json', mod: Date.now(), n: 3 }, bkpPasta: '00. Backups/Paradas' };
      linha.htmls = [linha.html]; linha.bases = [linha.base];
      Vers.dados = { em: Date.now(), L: [linha], libs: [], fila }; const m0 = Store.mode; Store.mode = 'pasta'; const h = cardVersoes(); Store.mode = m0;
      const A = Vers.avisos(linha).map(a => a[1]).join(' | '); return { fila, A, cel: /eventos de 20\/12\/2019 a 31\/12\/2019 \(cortada\)/.test(h), col: /Pendentes neste navegador/.test(h) }; });
    ok(r.fila && r.fila.paradas === 2 && /resumo \(exports\) de 01\/01\/2020/.test(r.A) && /lista cortada/.test(r.A) && /2 alteração\(ões\) de Paradas ainda não gravada/.test(r.A) && r.cel && r.col,
      `C5 Portal › Versões: pendentes deste navegador ${JSON.stringify(r.fila)}; avisos: ${r.A.slice(0, 230)}`);
    await ctx.close();
  }

  ok(!pe.length, 'sem erro de página' + (pe.length ? ': ' + [...new Set(pe)].slice(0, 4).join(' | ') : ''));
  await b.close(); srv.close();
  if (errs.length) { console.log(`\n${errs.length} falha(s)`); process.exit(1); } console.log('\nsem erros');
})().catch(e => { console.error(e); process.exit(1); });

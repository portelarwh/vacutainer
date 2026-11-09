// C1 (08/11/2026): alterações pendentes sem perda entre abas (AT-01), base que some não vira base vazia (AT-02), formato próprio
// desconhecido não é gravado (AT-03), link de origem só com endereço seguro (AT-11), regravação das confirmadas sobrescritas (R-01),
// trava da 2ª aba nas páginas que guardam a base inteira (Portal, Waste). Pasta simulada (OPFS) por HTTP local, dados fictícios.
// node testes/tpendencias.js → "sem erros"; código 1 se falhar
const path = require('path'), fs = require('fs'), http = require('http'); const RAIZ = path.resolve(__dirname, '..');
const { chromium } = require('playwright');
const srv = http.createServer((q, r) => { const f = path.join(RAIZ, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(RAIZ) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': f.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
const errs = []; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA ') + m); if (!c) errs.push(m); };
const dorme = ms => new Promise(r => setTimeout(r, ms));

// as três páginas com fila de operações: como criar uma operação, ler a lista e qual a base
const PG = {
  inic: { arq: 'Iniciativas.html', base: 'iniciativas-base.json', schema: 'vac-iniciativas', lista: 'acoes', ls: 'inic',
    op: id => ({ k: 'nova', a: { id, titulo: 'teste ' + id, status: 'a fazer', criadaEm: new Date().toISOString(), origem: { tipo: 'manual' }, vinculos: [] } }), idDe: o => o.a && o.a.id },
  equip: { arq: 'Equipamentos.html', base: 'equipamentos-base.json', schema: 'vac-equipamentos', lista: 'os', ls: 'equip',
    op: id => ({ k: 'os', it: { id, equipamento: 'EQ01', titulo: 'teste ' + id, tipo: 'corretiva', status: 'aberta', origem: { tipo: 'manual' }, criadaEm: new Date().toISOString(), apontamentos: [] } }), idDe: o => o.it && o.it.id },
  paradas: { arq: 'Paradas.html', base: 'paradas-base.json', schema: 'vac-paradas', lista: 'acoes', ls: 'paradas',
    op: id => ({ k: 'list', c: 'acoes', items: [{ id, titulo: 'teste ' + id, status: 'aberta' }] }), idDe: o => o.items && o.items[0] && o.items[0].id }
};
const BASE = (k, rev, n) => { const b = { schema: PG[k].schema, schemaVersion: 1, rev, revId: 'r' + rev, auditoria: [] };
  if (k === 'inic') Object.assign(b, { acoes: [], eventos: [], kas: [] }); if (k === 'equip') Object.assign(b, { os: [], tags: [], padroes: [], anomalias: [], eventos: [] });
  if (k === 'paradas') Object.assign(b, { eventos: [], tecnico: {}, validacao: {}, acoes: [], importacoes: [], config: {} });
  for (let i = 0; i < n; i++) b[PG[k].lista].push(k === 'equip' ? { id: 'X' + i, equipamento: 'EQ01', titulo: 'existente ' + i, status: 'aberta' } : { id: 'X' + i, titulo: 'existente ' + i, status: k === 'paradas' ? 'aberta' : 'a fazer' });
  return b; };

(async () => {
  await new Promise(r => srv.listen(0, r)); const U = `http://127.0.0.1:${srv.address().port}/paginas/`;
  const b = await chromium.launch(); const pe = [];
  const nova = async (ctx, arq, h = '', dlg = 'accept') => { const p = await ctx.newPage(); p.on('pageerror', e => pe.push(arq + ': ' + e.message)); p.on('dialog', d => dlg === 'accept' ? d.accept() : d.dismiss()); await p.goto(U + encodeURI(arq) + h); await p.waitForTimeout(900); return p; };
  // pasta simulada: escreve/lê/apaga a base em 00. Bases; conecta sem guardar a raiz do OPFS no IndexedDB (o Chromium do teste não aguenta)
  const PASTA = { limpa: async () => { const d = await navigator.storage.getDirectory(); for await (const [n] of d.entries()) await d.removeEntry(n, { recursive: true }); },
    grava: async ([nome, j]) => { const d = await navigator.storage.getDirectory(), bd = await d.getDirectoryHandle('00. Bases', { create: true }); const fh = await bd.getFileHandle(nome, { create: true }); const w = await fh.createWritable(); await w.write(typeof j === 'string' ? j : JSON.stringify(j)); await w.close(); },
    le: async nome => { try { const d = await navigator.storage.getDirectory(), bd = await d.getDirectoryHandle('00. Bases'); return await (await (await bd.getFileHandle(nome)).getFile()).text(); } catch (e) { return null; } },
    apaga: async nome => { const d = await navigator.storage.getDirectory(), bd = await d.getDirectoryHandle('00. Bases'); await bd.removeEntry(nome); },
    conecta: async () => { const d = await navigator.storage.getDirectory(); const s0 = IDB.set; IDB.set = async (k, v) => k === 'pasta' ? undefined : s0.call(IDB, k, v);
      if (typeof Store.usar === 'function') return Store.usar(d); Store.dir = vacRaiz(d); Store.dirName = d.name; Store.perm = true; await Store.reload(); await Store.save(); } };   // Paradas antes da C1 não tinha usar()
  const ev = (p, fn, a) => p.evaluate(fn, a);
  const ids = (p, k) => ev(p, k => Store.queue.map(o => (o.a && o.a.id) || (o.it && o.it.id) || (o.items && o.items[0] && o.items[0].id)).sort().join(','), k);

  // ---------- AT-01 · três abas sem pasta, cada uma com uma alteração; fechadas em ordens diferentes; reabertas
  for (const k of Object.keys(PG)) {
    const ctx = await b.newContext(); const A = await nova(ctx, PG[k].arq), B = await nova(ctx, PG[k].arq), C = await nova(ctx, PG[k].arq);
    await ev(A, o => Store.commit(o), PG[k].op('AUD-1')); await ev(B, o => Store.commit(o), PG[k].op('AUD-2')); await ev(C, o => Store.commit(o), PG[k].op('AUD-3')); await dorme(500);
    const vivas = await ids(A, k);
    await B.close(); await A.close(); await C.close(); const D = await nova(ctx, PG[k].arq); const r1 = await ids(D, k);
    const n = await ev(D, () => Store.queue.length);
    ok(r1 === 'AUD-1,AUD-2,AUD-3' && n === 3, `AT-01 ${PG[k].arq}: 3 abas sem pasta, fechadas fora de ordem → reabrir tem as 3 alterações uma vez (${r1}); a aba viva só via a dela (${vivas})`);
    // duas abas vivas: a 2ª que abre não toma as da 1ª
    const E = await nova(ctx, PG[k].arq); const rE = await ids(E, k); ok(rE === '', `AT-01 ${PG[k].arq}: aba aberta junto de outra viva não pega as alterações dela (${rE || 'nenhuma'})`);
    await ctx.close();
  }

  // ---------- AT-01 · com a pasta e erro de leitura: duas abas pendentes; quando a leitura volta, as duas vão para a base, sem duplicar
  {
    const k = 'inic', ctx = await b.newContext(); const A = await nova(ctx, PG[k].arq); await ev(A, PASTA.limpa); await ev(A, PASTA.grava, [PG[k].base, BASE(k, 3, 1)]);
    const falha = () => { if (window.__gfh) return; window.__gfh = FileSystemDirectoryHandle.prototype.getFileHandle; FileSystemDirectoryHandle.prototype.getFileHandle = function (n, o) { if (window.__falha && /-base\.json$/.test(n) && !(o && o.create)) { const e = new Error('falha simulada'); e.name = 'NotReadableError'; return Promise.reject(e); } return window.__gfh.call(this, n, o); }; };
    await ev(A, falha); await ev(A, PASTA.conecta); const B = await nova(ctx, PG[k].arq); await ev(B, falha); await ev(B, PASTA.conecta);
    await ev(A, () => { window.__falha = 1; }); await ev(B, () => { window.__falha = 1; });
    await ev(A, o => { Store.commit(o); clearTimeout(Store.t); return Store.save(); }, PG[k].op('LER-A')); await ev(B, o => { Store.commit(o); clearTimeout(Store.t); return Store.save(); }, PG[k].op('LER-B'));
    const err = await ev(A, () => Store.lastErr); await ev(A, () => { window.__falha = 0; }); await ev(B, () => { window.__falha = 0; }); const antes = await ev(A, PASTA.le, PG[k].base);
    await A.close(); await B.close(); const C = await nova(ctx, PG[k].arq); await ev(C, PASTA.conecta); await C.waitForFunction(() => !Store.saving && !Store.queue.length, null, { timeout: 8000 }).catch(() => { });
    const j = JSON.parse(await ev(C, PASTA.le, PG[k].base)); const L = j.acoes.map(a => a.id).sort();
    const rA = JSON.parse(antes).rev; ok(/nada foi gravado/.test(err) && L.join(',') === 'LER-A,LER-B,X0' && j.rev === rA + 1 && j.auditoria.filter(a => /LER-/.test(a.acao)).length === 2, `AT-01 Iniciativas: erro de leitura nas duas abas → zero gravação; reabrir grava as duas uma vez (${L.join(',')}, rev ${rA} → ${j.rev}, auditoria com as 2 uma vez)`);
    await ctx.close();
  }

  // ---------- AT-01 · fila antiga (localStorage, versão anterior) entra uma vez e a original fica guardada; IndexedDB com falha avisa
  {
    const ctx = await b.newContext(); const A = await nova(ctx, PG.inic.arq);
    await ev(A, ops => { localStorage.setItem('inic.fila', JSON.stringify(ops)); }, [Object.assign(PG.inic.op('VELHA-1'), { id: 'opv1' }), Object.assign(PG.inic.op('VELHA-2'), { id: 'opv2' })]); await A.close();
    const B = await nova(ctx, PG.inic.arq); const r = await ids(B, 'inic'); const ls = await ev(B, () => ({ fila: localStorage.getItem('inic.fila'), antiga: JSON.parse(localStorage.getItem('inic.fila.antiga') || '[]').length })); await B.close();
    const C = await nova(ctx, PG.inic.arq); const r2 = await ids(C, 'inic');
    ok(r === 'VELHA-1,VELHA-2' && ls.fila === null && ls.antiga === 2 && r2 === 'VELHA-1,VELHA-2', `AT-01 importação da fila antiga: uma vez, sem duplicar ao reabrir (${r2}); original em inic.fila.antiga (${ls.antiga})`);
    await ctx.close();
    const c2 = await b.newContext(); await c2.addInitScript(() => { const o = indexedDB.open.bind(indexedDB); indexedDB.open = (n, v) => { if (n === 'vac-fila') throw new Error('IndexedDB indisponível (simulado)'); return o(n, v); }; });
    const P = await nova(c2, PG.inic.arq); await ev(P, o => Store.commit(o), PG.inic.op('SEM-IDB')); await dorme(400); await ev(P, () => topo());
    const t = await ev(P, () => ({ pill: /alterações não protegidas/.test(document.getElementById('stBase').innerText), res: JSON.parse(localStorage.getItem('inic.fila.reserva') || '[]').length + Object.keys(localStorage).filter(k => k.startsWith('vac.reserva.inic|')).length }));
    ok(t.pill && t.res === 1, `AT-01 IndexedDB com falha: aviso "alterações não protegidas" e reserva em localStorage (${t.res})`); await c2.close();
  }

  // ---------- revisão do PR #18 (Codex): reserva e fila antiga não se perdem quando o IndexedDB volta; erro antigo não pula a pergunta
  for (const k of ['inic', 'equip', 'paradas']) {
    const ctx = await b.newContext(); await ctx.addInitScript(() => { const o = indexedDB.open.bind(indexedDB); indexedDB.open = (n, v) => { if (n === 'vac-fila' && localStorage.getItem('teste.semidb') === '1') throw new Error('IndexedDB indisponível (simulado)'); return o(n, v); }; });
    const A = await nova(ctx, PG[k].arq); await ev(A, () => localStorage.setItem('teste.semidb', '1')); await A.close();
    const B = await nova(ctx, PG[k].arq); await ev(B, o => Store.commit(o), PG[k].op('RES-1')); await dorme(400);
    const res = await ev(B, p => JSON.parse(localStorage.getItem(p + '.fila.reserva') || '[]').length + Object.keys(localStorage).filter(k => k.startsWith('vac.reserva.' + p + '|')).length, PG[k].ls); await B.close();
    // fila antiga com o IndexedDB ainda fora: não pode sumir da fila ativa
    const C0 = await nova(ctx, PG[k].arq); await ev(C0, ([p, op]) => localStorage.setItem(p + '.fila', JSON.stringify([op])), [PG[k].ls, Object.assign(PG[k].op('VELHA-X'), { id: 'opvx', qid: 'opvx' })]); await C0.close();
    const C = await nova(ctx, PG[k].arq); const rC = await ids(C, k); const velha = await ev(C, p => !!localStorage.getItem(p + '.fila'), PG[k].ls); await ev(C, () => localStorage.setItem('teste.semidb', '0')); await C.close();
    ok(res === 1 && rC === 'RES-1,VELHA-X' && velha, `PR #18 ${PG[k].arq}: IndexedDB fora → reserva (${res}) e fila antiga continuam na fila ativa (${rC}); a fila antiga fica no localStorage até migrar`);
    // IndexedDB volta: as duas entram na fila durável, a reserva só sai depois disso, e nada se repete ao reabrir
    const D = await nova(ctx, PG[k].arq); const rD = await ids(D, k); await ev(D, o => Store.commit(o), PG[k].op('DEPOIS')); await dorme(500);
    const ls = await ev(D, p => ({ res: localStorage.getItem(p + '.fila.reserva'), novas: Object.keys(localStorage).filter(k => k.startsWith('vac.reserva.' + p + '|')).length, fila: localStorage.getItem(p + '.fila') }), PG[k].ls); await D.close();
    const E = await nova(ctx, PG[k].arq); const rE = await ids(E, k);
    ok(rD === 'RES-1,VELHA-X' && rE === 'DEPOIS,RES-1,VELHA-X' && ls.res === null && ls.novas === 0 && ls.fila === null, `PR #18 ${PG[k].arq}: IndexedDB de volta → reserva e fila antiga recuperadas (${rD}); reabrir tem tudo uma vez (${rE}); reserva e fila antiga saem do localStorage`);
    await ctx.close();
  }
  {
    const ctx = await b.newContext(); const p = await nova(ctx, PG.paradas.arq, '', 'dismiss'); await ev(p, PASTA.limpa);
    await ev(p, () => { Store.lastErr = 'erro de uma leitura anterior (simulado)'; }); await ev(p, PASTA.conecta);
    const r = await ev(p, async () => ({ con: !!Store.dir })); const nada = await ev(p, PASTA.le, PG.paradas.base);
    ok(!r.con && nada === null, `PR #18 Paradas: erro antigo não pula a pergunta de criar a base ("não" → sem pasta conectada, nada criado)`); await ctx.close();
  }

  // ---------- AT-01 · fila do cadastro do Portal e fila do Gel: duas abas, nenhuma alteração perdida
  {
    const ctx = await b.newContext(); const A = await nova(ctx, 'Portal.html'), B = await nova(ctx, 'Portal.html');
    const op = c => ({ acao: 'criação', tipo: 'linhas', codigo: c, item: { codigo: c, nome: 'Linha ' + c, ativo: true }, motivo: 'teste' });
    await ev(A, o => Cad.ops([o]), op('LA')); await ev(B, o => Cad.ops([o]), op('LB')); await dorme(500); await A.close(); await B.close();
    const C = await nova(ctx, 'Portal.html'); const r = await ev(C, () => Cad.fila.map(o => o.codigo).sort().join(','));
    ok(r === 'LA,LB', `AT-01 Portal › fila do cadastro: duas abas → as duas alterações ficam (${r})`); await ctx.close();
    const c2 = await b.newContext(); const G1 = await nova(c2, 'Gestão-Gel-Vacutainer.html'), G2 = await nova(c2, 'Gestão-Gel-Vacutainer.html');
    await ev(G1, () => { FS.pending = [{ teste: 'G1' }]; return fsPendSave(); }); await ev(G2, () => { FS.pending = [{ teste: 'G2' }]; return fsPendSave(); }); await G1.close(); await G2.close();
    const G3 = await nova(c2, 'Gestão-Gel-Vacutainer.html'); const rg = await ev(G3, async () => (typeof vacFila === 'function' ? ((await vacFila('gel').minhas()) || []) : ((await idb.get('fsPending')) || [])).map(x => x.teste).sort().join(','));   // sem vacFila (versão anterior): o valor único antigo
    ok(rg === 'G1,G2', `AT-01 Gel › alterações pendentes: duas abas → as duas ficam (${rg})`); await c2.close();
  }

  // ---------- trava da 2ª aba (Portal e Waste guardam a base inteira pendente): bloqueia sem descartar
  for (const [arq, faz, pend, nomeP] of [['Portal.html', () => Store.commit('teste', x => { x.config.c1 = (x.config.c1 || 0) + 1; }), () => Store.pending, 'portal'],
    ['Perdas-Ordem.html', () => commit('teste', x => { x.config.c1 = (x.config.c1 || 0) + 1; }), () => ST.pending, 'perdas']]) {
    const ctx = await b.newContext(); const A = await nova(ctx, arq), Bp = await nova(ctx, arq);
    await ev(A, faz); await dorme(2600);
    const r = await ev(Bp, async ([fz]) => { let erro = ''; try { await eval('(' + fz + ')')(); } catch (e) { erro = e.name; } return { erro, pend: typeof Store !== 'undefined' && Store.B ? !!Store.pending : !!ST.pending }; }, [faz.toString()]);
    const a = await ev(A, fz => eval('(' + fz + ')')(), pend.toString());
    ok(r.erro === 'VacAbaBloqueada' && !r.pend && a, `${arq}: 2ª aba não altera enquanto a 1ª tem alteração pendente (recusa "${r.erro}"); a da 1ª continua pendente`);
    await A.close(); await dorme(300); const r2 = await ev(Bp, async ([fz]) => { let erro = ''; try { await eval('(' + fz + ')')(); } catch (e) { erro = e.name; } return erro; }, [faz.toString()]);
    ok(r2 === '', `${arq}: fechada a 1ª aba, a 2ª volta a poder alterar`); await ctx.close();
  }

  // ---------- AT-02 · base conhecida some: zero gravações, aviso e "Recriar a base" com a cópia deste navegador
  for (const k of Object.keys(PG)) {
    for (const comFila of [false, true]) {
      const ctx = await b.newContext(); const p = await nova(ctx, PG[k].arq); await ev(p, PASTA.limpa); await ev(p, PASTA.grava, [PG[k].base, BASE(k, 5, 2)]);
      await ev(p, PASTA.conecta); await p.waitForTimeout(300); const revLida = await ev(p, () => Store.data.rev); await ev(p, PASTA.apaga, PG[k].base);
      if (comFila) await ev(p, o => { Store.commit(o); clearTimeout(Store.t); }, PG[k].op('NOVA'));
      await ev(p, async () => { await Store.reload(); await Store.save(); }); const depois = await ev(p, PASTA.le, PG[k].base);
      const s = await ev(p, () => ({ sumiu: Store.sumiu, botao: !!document.querySelector('#tRecriar,#pRecriar'), q: Store.queue.length }));
      ok(depois === null && s.sumiu && s.botao && s.q === (comFila ? 1 : 0), `AT-02 ${PG[k].arq}${comFila ? ' (com alteração pendente)' : ''}: base sumiu → nenhum arquivo criado, aviso e botão "Recriar a base" (fila ${s.q})`);
      if (comFila) {
        if (!(await ev(p, () => typeof Store.recriar === 'function'))) { ok(false, `AT-02 ${PG[k].arq}: sem "Recriar a base" (versão anterior à C1)`); await ctx.close(); continue; }
        await ev(p, () => Store.recriar()); await p.waitForTimeout(400); const j = JSON.parse(await ev(p, PASTA.le, PG[k].base) || 'null');
        const L = j && j[PG[k].lista].map(x => x.id).sort().join(',');
        ok(j && j.rev === revLida + 1 && L === 'NOVA,X0,X1' && j.auditoria.length > 0 && !(await ev(p, () => Store.sumiu)), `AT-02 ${PG[k].arq}: "Recriar a base" grava a cópia deste navegador, com histórico (rev lida ${revLida} → ${j && j.rev}; ${L})`);
      }
      await ctx.close();
    }
    // conectar uma pasta sem a base: pergunta; "não" não cria nada
    const c2 = await b.newContext(); const q = await nova(c2, PG[k].arq, '', 'dismiss'); await ev(q, PASTA.limpa); await ev(q, PASTA.conecta);
    const nada = await ev(q, PASTA.le, PG[k].base), con = await ev(q, () => !!Store.dir); await q.close();
    const q2 = await nova(c2, PG[k].arq); await ev(q2, PASTA.conecta); await q2.waitForTimeout(300); const criada = JSON.parse(await ev(q2, PASTA.le, PG[k].base) || 'null');
    ok(nada === null && !con && criada && criada.rev === 1, `AT-02 ${PG[k].arq}: pasta sem a base → pergunta; "não" não conecta nem cria; "sim" cria (rev ${criada && criada.rev})`); await c2.close();
  }

  // ---------- AT-03 · formato desconhecido: zero gravações e o motivo; base antiga sem schema continua gravando
  for (const k of Object.keys(PG)) {
    for (const [rot, mod, grava] of [['versão futura', x => Object.assign(x, { schemaVersion: 99 }), false], ['schema de outra página', x => Object.assign(x, { schema: 'vac-outra' }), false], ['base antiga sem schema', x => { delete x.schema; delete x.schemaVersion; return x; }, true]]) {
      const ctx = await b.newContext(); const p = await nova(ctx, PG[k].arq); await ev(p, PASTA.limpa); const base = mod(BASE(k, 7, 1)); await ev(p, PASTA.grava, [PG[k].base, base]);
      await ev(p, PASTA.conecta); await ev(p, o => { Store.commit(o); clearTimeout(Store.t); return Store.save(); }, PG[k].op('F1')); await p.waitForTimeout(200);
      const j = JSON.parse(await ev(p, PASTA.le, PG[k].base)); const msg = await ev(p, () => Store.readErr || Store.lastErr || '');
      const temF1 = JSON.stringify(j).includes('F1'); ok(grava ? j.rev > 7 && temF1 : j.rev === 7 && !temF1 && /versão mais nova|outro tipo/.test(msg), `AT-03 ${PG[k].arq} · ${rot}: ${grava ? 'grava normalmente (rev ' + j.rev + ')' : 'nenhuma gravação (rev ' + j.rev + '), motivo: ' + msg.slice(0, 70)}`);
      await ctx.close();
    }
  }

  // ---------- AT-11 · links de origem e evidência: javascript/data nunca viram link (ao receber e em registro antigo); legítimos abrem
  {
    const ctx = await b.newContext(); const p = await nova(ctx, PG.inic.arq, '#teste');
    const t = await ev(p, () => typeof vacLinkSeguro !== 'function' ? [['javascript:alert(1)', 'javascript:alert(1)']] : ['javascript:alert(1)', ' JavaScript:x', 'data:text/html,x', 'vbscript:x', 'https://x.y/z', 'http://intranet/a', 'file:///Z:/a.pdf', '\\\\servidor\\pasta\\a.pdf', 'Paradas.html#evento=1', '#aba=os', 'pasta/../x.html', '//evil.com/x'].map(u => [u, vacLinkSeguro(u)]));
    const ruim = t.filter(([u, v]) => /^\s*(javascript|data|vbscript):/i.test(u) || u.startsWith('//') || u.includes('/')).filter(([u]) => !/^(https?|file):/i.test(u));
    ok(ruim.every(([, v]) => v === '') && t.filter(([u]) => /^(https?|file):|^\\\\|^Paradas|^#/.test(u)).every(([u, v]) => v === u), `AT-11 vacLinkSeguro: ${t.map(([u, v]) => (v ? '✓ ' : '✗ ') + u.trim()).join(' · ')}`);
    await ev(p, () => { const a = Store.data.acoes[0]; a.origem.link = 'javascript:window.__x=1'; a.evidencias = [{ id: 'e1', url: 'javascript:window.__y=1', txt: 'ev' }, { id: 'e2', url: '\\\\srv\\a.pdf', txt: 'ok' }]; App.sel = a.id; render(); });
    const d = await ev(p, () => ({ js: [...document.querySelectorAll('#det a')].filter(a => /^javascript/i.test(a.getAttribute('href') || '')).length, rede: [...document.querySelectorAll('#det a')].some(a => a.getAttribute('href') === '\\\\srv\\a.pdf') }));
    ok(d.js === 0 && d.rede, `AT-11 Iniciativas › registro antigo com javascript: nenhum link executável (${d.js}); caminho de rede continua link`);
    await p.close();
    const dados = { titulo: 'x', origem: { tipo: 'paradas', link: 'javascript:window.__x=1', resumo: 'r' }, vinculos: [] };
    const q = await nova(ctx, PG.inic.arq, '#nova=' + encodeURIComponent(JSON.stringify(dados))); await ev(q, PASTA.limpa); await ev(q, PASTA.conecta); await q.waitForTimeout(400);
    const f = await ev(q, () => ({ links: [...document.querySelectorAll('.mod a')].map(a => a.getAttribute('href')), aviso: /não é um endereço seguro/.test(document.getElementById('toasts').innerText) }));
    ok(!f.links.some(h => /^javascript/i.test(h || '')) && f.aviso, `AT-11 Iniciativas › #nova= com javascript: link descartado ao receber, com aviso`);
    await q.close();
    const e = await nova(ctx, PG.equip.arq, '#teste'); await ev(e, () => { Store.data.os[0].origem.link = 'javascript:window.__x=1'; App.tab = 'os'; App.osSel = Store.data.os[0].id; render(); });
    const ej = await ev(e, () => [...document.querySelectorAll('.det a')].filter(a => /^javascript/i.test(a.getAttribute('href') || '')).length);
    const e2 = await nova(ctx, PG.equip.arq, '#novaOS=' + encodeURIComponent(JSON.stringify({ equipamento: 'EQ01', titulo: 'x', origem: { tipo: 'paradas', ref: 'ev1', link: 'data:text/html,x' } })));
    await ev(e2, PASTA.limpa); await ev(e2, PASTA.conecta); await e2.waitForTimeout(400); await e2.click('.mod [data-ok]').catch(() => { }); await e2.waitForFunction(() => !Store.saving && !Store.queue.length, null, { timeout: 8000 }).catch(() => { }); await e2.waitForTimeout(300);
    const osj = JSON.parse(await ev(e2, PASTA.le, PG.equip.base) || '{"os":[]}'); const o = osj.os.find(x => x.origem && x.origem.ref === 'ev1');
    ok(ej === 0 && o && !o.origem.link, `AT-11 Equipamentos: OS antiga com javascript sem link (${ej}); #novaOS= com data: grava a OS sem o link`);
    await ctx.close();
  }

  // ---------- R-01 · confirmadas nas últimas 24 h que sumiram da base voltam; mais antigas não (restauração de backup)
  for (const k of ['inic', 'paradas']) {
    const ctx = await b.newContext(); const p = await nova(ctx, PG[k].arq);
    if (!(await ev(p, () => typeof vacFila === 'function'))) { ok(false, `R-01 ${PG[k].arq}: sem a fila durável (versão anterior à C1)`); await ctx.close(); continue; } await ev(p, PASTA.limpa); await ev(p, PASTA.grava, [PG[k].base, BASE(k, 2, 0)]); await ev(p, PASTA.conecta);
    await ev(p, o => { Store.commit(o); clearTimeout(Store.t); return Store.save(); }, PG[k].op('R1')); await ev(p, o => { Store.commit(o); clearTimeout(Store.t); return Store.save(); }, PG[k].op('R2'));
    // R2 confirmada há 25 h (a idade fica no registro da fila durável); outra estação grava por cima sem R1 e R2
    await ev(p, async ([pg]) => { const F = vacFila(pg); const C = await F.confirmadas(864e5 * 3); const o = C.find(x => JSON.stringify(x).includes('R2')); await F.esquecer([o.qid]); delete o._c; await F.confirmar([o]);
      const d = await (await indexedDB.databases(), new Promise(r => { const q = indexedDB.open('vac-fila'); q.onsuccess = () => r(q.result); }));
      await new Promise(r => { const t = d.transaction('conf', 'readwrite'), s = t.objectStore('conf'); s.get(pg + '|' + o.qid).onsuccess = e => { const v = e.target.result; v._c = Date.now() - 25 * 36e5; s.put(v); }; t.oncomplete = r; }); }, [k]);
    await ev(p, PASTA.grava, [PG[k].base, BASE(k, 9, 0)]);
    await ev(p, () => Store.reload()); await p.waitForFunction(() => !Store.saving && !Store.queue.length, null, { timeout: 8000 }).catch(() => { }); await p.waitForTimeout(300);
    const j = JSON.parse(await ev(p, PASTA.le, PG[k].base)); const L = j[PG[k].lista].map(x => x.id).sort().join(',');
    ok(L === 'R1', `R-01 ${PG[k].arq}: confirmada há pouco e sobrescrita volta a ser gravada; a de 25 h não (${L || 'nenhuma'})`);
    await ctx.close();
  }

  ok(!pe.length, 'sem erro de página' + (pe.length ? ': ' + [...new Set(pe)].slice(0, 4).join(' | ') : ''));
  await b.close(); srv.close(); console.log(errs.length ? `\n${errs.length} falha(s)` : '\nsem erros'); process.exit(errs.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });

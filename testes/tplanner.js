// E6 e E8 do plano único (08/11/2026): Iniciativas › Ações (Planner) e KAS.
// Pasta simulada (OPFS) por HTTP local: gravação por operações, releitura, duas estações gravando juntas, erro de leitura,
// tempos por responsável e por status (transferência, espera, reabertura), exports, link #nova= com aviso de ação parecida, KAS.
// node testes/tplanner.js → "sem erros"; código 1 se falhar. Prints em testes/saida/planner/
const path = require('path'), fs = require('fs'), http = require('http'); const RAIZ = path.resolve(__dirname, '..');
const { chromium } = require('playwright');
const srv = http.createServer((q, r) => { const f = path.join(RAIZ, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(RAIZ) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': f.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
const errs = []; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA ') + m); if (!c) errs.push(m); };
const SAI = path.join(RAIZ, 'testes', 'saida', 'planner'); fs.mkdirSync(SAI, { recursive: true });
const CAD = { schema: 'vac-cadastros', rev: 3, equipamentos: [{ codigo: 'EQ03', nome: 'Tampadora', ativo: true }, { codigo: 'EQ05', nome: 'Transporte', ativo: true }], usuarios: [{ codigo: '1', nome: 'J. Lima', ativo: true }] };
const LIMPA = async cad => { const d = await navigator.storage.getDirectory(); for await (const [n] of d.entries()) await d.removeEntry(n, { recursive: true }); localStorage.clear(); localStorage.setItem('vac.cadastros', JSON.stringify(cad)); };
// o OPFS é só a pasta simulada: o Chromium do teste não aguenta guardar a raiz do OPFS no IndexedDB (a pasta real vem do seletor)
const CONECTA = async () => { const d = await navigator.storage.getDirectory(); const s0 = IDB.set; IDB.set = async (k, v) => k === 'pasta' ? undefined : s0.call(IDB, k, v); await Store.usar(d); await new Promise(r => setTimeout(r, 100)); };
const LER = async () => { const d = await navigator.storage.getDirectory(); try { const b = await d.getDirectoryHandle('00. Bases'); return JSON.parse(await (await (await b.getFileHandle('iniciativas-base.json')).getFile()).text()); } catch (e) { return null; } };
const espera = p => p.waitForFunction(() => !Store.saving && !Store.queue.length, null, { timeout: 8000 }).catch(() => { });

(async () => {
  await new Promise(r => srv.listen(0, r)); const U = `http://127.0.0.1:${srv.address().port}/paginas/Iniciativas.html`;
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const pe = [];
  const abre = async (h = '') => { const p = await ctx.newPage(); p.on('pageerror', e => pe.push(e.message)); p.on('dialog', d => d.accept()); await p.goto(U + h); await p.waitForTimeout(700); return p; };

  // 1. modo de teste: quadro, detalhe, tempos do exemplo
  {
    const p = await abre('#teste'); await p.waitForTimeout(300);
    const r = await p.evaluate(() => ({ cols: [...document.querySelectorAll('.col')].map(c => c.dataset.col + ':' + c.querySelectorAll('.ac').length), ver: document.getElementById('appVer').textContent, tit: document.title }));
    ok(r.cols.join() === 'a fazer:3,em andamento:2,aguardando:1,concluída:1', `quadro com 4 colunas (${r.cols.join(' · ')})`);
    ok(r.ver === 'v1.0.5' && /^Iniciativas/.test(r.tit), `versão ${r.ver}; página de verdade (saiu do gerador)`);
    await p.click('[data-ac="AC-T-0147"]'); await p.waitForTimeout(200);
    const d = await p.evaluate(() => document.getElementById('det').innerText.replace(/\s+/g, ' '));
    ok(/com P\. Costa 2,0 d → com J\. Lima 5,0 d/.test(d) && /A fazer 2,0 d · Em andamento 5,0 d/.test(d), 'tempos do exemplo: 2 d com P. Costa, 5 d com J. Lima; A fazer 2 d, Em andamento 5 d');
    ok(/original .* atual/.test(d) && /adiado 1×/.test(d) && /aguardando mola/.test(d), 'prazo original guardado, adiamento com motivo no histórico');
    await p.screenshot({ path: path.join(SAI, 'quadro-claro.png') });
    await p.click('[data-vis="resp"]'); await p.waitForTimeout(150);
    const g = await p.evaluate(() => [...document.querySelectorAll('.porresp .grp h3')].map(h => h.childNodes[0].textContent.trim()));
    ok(g.includes('J. Lima') && g[g.length - 1] === '(sem responsável)', `Por responsável: grupos (${g.join(', ')})`);
    await p.evaluate(() => { localStorage.setItem('vac.user', 'J. Lima'); }); await p.click('[data-vis="minhas"]'); await p.waitForTimeout(150);
    const m = await p.evaluate(() => [...document.querySelectorAll('.porresp .ac')].map(a => a.dataset.ac));
    ok(m.length === 1 && m[0] === 'AC-T-0147', `Minhas (J. Lima): só a ação dele (${m.join()})`);
    await p.evaluate(() => localStorage.removeItem('vac.user')); await p.click('[data-vis="quadro"]');
    await p.close();
  }

  // 2. tempos com transferência, espera e reabertura (PLA-03/05): histórico por intervalo
  {
    const p = await abre('#teste');
    const r = await p.evaluate(() => {
      const t0 = Date.parse('2026-11-01T08:00:00Z'), d = n => new Date(t0 + n * 864e5).toISOString(), D = completar(vazio());
      const op = (k, x, n, por = 'x') => applyOp(D, { k, ...x, id: 'op' + n + k, em: d(n), por });
      op('nova', { a: { id: 'A1', titulo: 't', status: 'a fazer', responsavel: 'Ana', criadaEm: d(0) } }, 0);
      op('campos', { ac: 'A1', f: { status: 'em andamento' }, ev: { tipo: 'status', de: 'a fazer', para: 'em andamento' } }, 1);
      op('campos', { ac: 'A1', f: { responsavel: 'Bia' }, ev: { tipo: 'responsável', de: 'Ana', para: 'Bia' } }, 3);
      op('campos', { ac: 'A1', f: { status: 'aguardando' }, ev: { tipo: 'status', de: 'em andamento', para: 'aguardando' } }, 4);
      op('campos', { ac: 'A1', f: { status: 'concluída' }, ev: { tipo: 'status', de: 'aguardando', para: 'concluída' } }, 6);
      op('campos', { ac: 'A1', f: { status: 'em andamento' }, ev: { tipo: 'status', de: 'concluída', para: 'em andamento' } }, 8);
      const T = tempos(D.acoes[0], D, new Date(t0 + 9 * 864e5)); const R = Object.fromEntries(T.porRs);
      return { st: T.porSt, rs: R, ab: T.aberto };
    });
    ok(r.st['a fazer'] === 1 && r.st['em andamento'] === 4 && r.st['aguardando'] === 2 && r.st['concluída'] === 2, `por status: a fazer 1, em andamento 4, aguardando 2, concluída 2 (${JSON.stringify(r.st)})`);
    ok(r.rs.Ana === 3 && r.rs.Bia === 4 && r.ab === 7, `por responsável só com a ação aberta: Ana 3, Bia 4; aberta 7 (${JSON.stringify(r.rs)}, ${r.ab})`);
    await p.close();
  }

  // 3. pasta: cria a base, grava por operação, relê; exports para o Portal e a ficha
  const p1 = await abre(); await p1.evaluate(LIMPA, CAD); await p1.reload(); await p1.waitForTimeout(600);
  await p1.evaluate(CONECTA); await espera(p1); 
  let B = await p1.evaluate(LER);
  ok(B && B.schema === 'vac-iniciativas' && B.rev === 1 && B.appVersion === '1.0.5' && B.exports && B.exports.exportsVersion === 1, `conectar: cria 00. Bases/iniciativas-base.json (rev ${B && B.rev})`);
  await p1.evaluate(() => { const ontem = addDias(hoje(), -1);
    Store.commit({ k: 'nova', a: { id: 'AC-1', titulo: 'Ajustar guia EQ03', status: 'a fazer', prioridade: 'alta', responsavel: 'J. Lima', apoios: ['R. Nunes'], prazo: ontem, prazoOriginal: ontem, criadaEm: new Date().toISOString(), origem: { tipo: 'paradas', ref: 'pareto|EQ03|FAL', resumo: 'Pareto · EQ03' }, vinculos: [{ tipo: 'equipamento', cod: 'EQ03' }, { tipo: 'ordem', cod: '100234567' }], checklist: [], comentarios: [], evidencias: [] } });
    Store.commit({ k: 'nova', a: { id: 'AC-2', titulo: 'Sem dono', status: 'a fazer', responsavel: '', prazo: null, criadaEm: new Date().toISOString(), origem: { tipo: 'manual' }, vinculos: [] } }); });
  await espera(p1); B = await p1.evaluate(LER);
  const ex = B.exports, a1 = ex.acoes.find(a => a.id === 'AC-1');
  ok(B.acoes.length === 2 && B.eventos.filter(e => e.tipo === 'criação').length === 2 && B.revId === (await p1.evaluate(() => Store.data.revId)), 'grava as duas ações com o evento de criação; releitura confere o revId');
  ok(a1 && a1.atrasada && a1.responsavel === 'J. Lima' && a1.vinculos.some(v => v.tipo === 'ordem' && v.cod === '100234567'), 'exports.acoes: atrasada, responsável e vínculo da ordem (texto)');
  ok(ex.pendencias.some(x => x.sev === 1 && x.id === 'AC-1' && x.responsavel === 'J. Lima' && x.link === 'acao=AC-1') && ex.pendencias.some(x => x.tipo === 'semResponsavel' && x.id === 'AC-2'), 'pendências com responsável e link (Minha fila do Portal)');
  ok(ex.kpis[0][1] === '2' && /1 atrasada/.test(ex.kpis[0][2]), `kpis: ${ex.kpis.map(k => k[0] + ' ' + k[1]).join(' · ')}`);
  // ficha da ordem mostra a ação ligada (kit lê iniciativas-base)
  await p1.evaluate(() => vacFicha.abrir('ordem', '100234567')); await p1.waitForTimeout(600);
  const fi = await p1.evaluate(() => { const s = [...document.querySelectorAll('#vacFicha .vf-bl')].find(x => /Ações ligadas/.test(x.querySelector('h3').textContent)); return s ? s.innerText.replace(/\s+/g, ' ') : ''; });
  ok(/Ajustar guia EQ03/.test(fi) && /J\. Lima/.test(fi), 'ficha da ordem: bloco "Ações ligadas" com a ação de Iniciativas');
  await p1.evaluate(() => vacFicha.fechar()); await p1.waitForTimeout(200);

  // revisão Codex (PR #15): resumo de outro dia é refeito mesmo sem alteração
  { const rv = await p1.evaluate(async () => { const d = await navigator.storage.getDirectory(), b = await d.getDirectoryHandle('00. Bases'), fh = await b.getFileHandle('iniciativas-base.json'); const j = JSON.parse(await (await fh.getFile()).text());
      j.exports.geradoEm = '2020-01-01T12:00:00Z'; const w = await fh.createWritable(); await w.write(JSON.stringify(j)); await w.close(); await Store.save(); return j.rev; });
    B = await p1.evaluate(LER); ok(B.rev === rv + 1 && B.exports.geradoEm.slice(0, 4) !== '2020', `Iniciativas: resumo de outro dia refeito sem alteração (rev ${rv} → ${B.rev})`); }
  // 4. duas estações gravando ao mesmo tempo: nada se perde (campos diferentes da mesma ação + ações novas)
  const p2 = await abre(); await p2.evaluate(CONECTA); await espera(p2);
  await p1.evaluate(() => { clearTimeout(Store.t); Store.commit({ k: 'campos', ac: 'AC-1', f: { status: 'em andamento' }, ev: { tipo: 'status', de: 'a fazer', para: 'em andamento' } }); Store.commit({ k: 'nova', a: { id: 'AC-3', titulo: 'da estação 1', status: 'a fazer', criadaEm: new Date().toISOString(), origem: { tipo: 'manual' }, vinculos: [] } }); clearTimeout(Store.t); });
  await p2.evaluate(() => { clearTimeout(Store.t); Store.commit({ k: 'campos', ac: 'AC-1', f: { prazo: addDias(hoje(), 5) }, ev: { tipo: 'prazo', de: '', para: addDias(hoje(), 5), motivo: 'peça' } }); Store.commit({ k: 'nova', a: { id: 'AC-4', titulo: 'da estação 2', status: 'a fazer', criadaEm: new Date().toISOString(), origem: { tipo: 'manual' }, vinculos: [] } }); clearTimeout(Store.t); });
  await Promise.all([p1.evaluate(() => Store.save()), p2.evaluate(() => Store.save())]); await espera(p1); await espera(p2);
  // a releitura confirma a gravação, mas não é transação: a próxima leitura confere se as alterações confirmadas continuam na base
  await p1.evaluate(() => Store.reload()); await p2.evaluate(() => Store.reload()); await p1.waitForTimeout(300); await espera(p1); await espera(p2);
  B = await p1.evaluate(LER); const A1 = B.acoes.find(a => a.id === 'AC-1');
  ok(['AC-1', 'AC-2', 'AC-3', 'AC-4'].every(id => B.acoes.some(a => a.id === id)) && A1.status === 'em andamento' && A1.prazo > A1.prazoOriginal, `duas estações juntas: 4 ações, status de uma e prazo da outra na mesma ação (rev ${B.rev})`);
  ok(B.eventos.some(e => e.tipo === 'status' && e.acao === 'AC-1') && B.eventos.some(e => e.tipo === 'prazo' && e.motivo === 'peça'), 'as duas mudanças ficam no histórico');

  // 5. erro de leitura: não grava, fica pendente e avisa
  const r5 = await p1.evaluate(async () => {
    const orig = FileSystemDirectoryHandle.prototype.getFileHandle; const antes = JSON.stringify(await (async () => { const d = await navigator.storage.getDirectory(); const b = await d.getDirectoryHandle('00. Bases'); return JSON.parse(await (await (await b.getFileHandle('iniciativas-base.json')).getFile()).text()); })());
    FileSystemDirectoryHandle.prototype.getFileHandle = function (n, o) { if (n === 'iniciativas-base.json' && !(o && o.create)) { const e = new Error('falha simulada'); e.name = 'NotReadableError'; return Promise.reject(e); } return orig.call(this, n, o); };
    clearTimeout(Store.t); Store.commit({ k: 'campos', ac: 'AC-2', f: { responsavel: 'M. Reis' }, ev: { tipo: 'responsável', de: '', para: 'M. Reis' } }); clearTimeout(Store.t); await Store.save();
    FileSystemDirectoryHandle.prototype.getFileHandle = orig;
    const d = await navigator.storage.getDirectory(); const b = await d.getDirectoryHandle('00. Bases'); const depois = await (await (await b.getFileHandle('iniciativas-base.json')).getFile()).text();
    const r = { igual: JSON.stringify(JSON.parse(depois)) === antes, fila: Store.queue.length, err: Store.lastErr }; await Store.save(); return { ...r, fila2: Store.queue.length };
  });
  ok(r5.igual && r5.fila === 1 && /nada foi gravado/.test(r5.err), `erro de leitura: zero gravação, 1 alteração pendente (${r5.err.slice(0, 60)}…)`);
  ok(r5.fila2 === 0, 'leitura de volta: "gravar de novo" leva a pendência');

  // 6. #nova= (de outra página): fotografia, link de reconsulta e aviso de ação aberta parecida (E8)
  {
    const dados = { titulo: 'Recorrência EQ03', origem: { tipo: 'paradas', ref: 'pareto|EQ03|FAL', resumo: 'Pareto 01–07/11 · EQ03 · 142 min', link: 'Paradas.html#equipamento=EQ03', foto: { período: '01–07/11', minutos: 142, eventos: 14 } }, vinculos: [{ tipo: 'equipamento', cod: 'EQ03' }, { tipo: 'codigo', cod: 'FAL' }] };
    const p = await abre('#nova=' + encodeURIComponent(JSON.stringify(dados))); await p.evaluate(CONECTA); await p.waitForTimeout(500);
    const r = await p.evaluate(() => { const m = document.querySelector('.mod'); return m ? { txt: m.innerText.replace(/\s+/g, ' '), t: m.querySelector('#aT').value, eq: m.querySelector('#vEq').value } : null; });
    ok(r && /Já existe ação aberta/.test(r.txt) && /AC-1/.test(r.txt) && r.t === 'Recorrência EQ03' && r.eq === 'EQ03', 'link #nova=: formulário preenchido e aviso da ação aberta ligada ao mesmo equipamento (AC-1)');
    await p.screenshot({ path: path.join(SAI, 'nova-aviso.png') });
    await p.click('.mod [data-ok]'); await espera(p); B = await p.evaluate(LER); const nv = B.acoes.find(a => a.titulo === 'Recorrência EQ03');
    ok(nv && nv.origem.tipo === 'paradas' && nv.origem.foto.minutos === 142 && nv.origem.link && nv.vinculos.length === 2, 'criada com origem, fotografia, link de reconsulta e vínculos (sem gravar no Paradas)');
    await p.close();
  }

  // 7. KAS com ação ligada
  {
    await p1.evaluate(() => { Store.commit({ k: 'kas', it: { id: 'KAS-1', titulo: 'Setup mais curto', status: 'ideia', dono: 'A. Souza', baseline: '48 min', meta: '30 min' } }); App.tab = 'kas'; App.kasSel = 'KAS-1'; render(); });
    await p1.click('[data-kac]'); await p1.waitForTimeout(200); await p1.fill('#aT', 'Kit de troca pronto'); await p1.click('.mod [data-ok]'); await espera(p1);
    B = await p1.evaluate(LER); const k = B.exports.kas.find(x => x.id === 'KAS-1'), a = B.acoes.find(x => x.titulo === 'Kit de troca pronto');
    ok(k && k.acoes === 1 && a && a.origem.tipo === 'kas' && a.origem.ref === 'KAS-1', 'KAS: ação criada a partir do KAS fica ligada (origem KAS, exports com 1 ação)');
  }

  // 8. E8: links "+ Ação no Planner" nas outras páginas (sem gravar lá): fotografia, referência, vínculos e link de reconsulta
  {
    const nova = h => { const m = /#nova=(.*)$/.exec(h || ''); return m ? JSON.parse(decodeURIComponent(m[1])) : null; };
    const p = await ctx.newPage(); p.on('pageerror', e => pe.push('Paradas: ' + e.message)); await p.goto(U.replace('Iniciativas.html', 'Paradas.html') + '#teste'); await p.waitForTimeout(1000);
    const r = await p.evaluate(() => { App.go('pareto'); VIEWS.pareto.dim = 'equip'; App.render(); const G = VIEWS.pareto.G; App.sel.par = G[0].k; App.render();
      const a = [...document.querySelectorAll('a[target]')].find(x => /nova=/.test(x.href)); App.go('recor'); const b = document.querySelector('#rcT a[target]');
      const ev = eventosTodos()[0]; abrirEvento(ev.id); const c = [...document.querySelectorAll('.mod a[target]')].find(x => /nova=/.test(x.href));
      return { a: a && a.getAttribute('href'), b: b && b.getAttribute('href'), c: c && c.getAttribute('href'), k: G[0].k, ev: ev.id }; });
    const A = nova(r.a), Bv = nova(r.b), C = nova(r.c);
    ok(A && A.origem.tipo === 'paradas' && A.origem.ref === 'pareto|equip|' + r.k && A.vinculos.some(v => v.tipo === 'equipamento' && v.cod === r.k) && A.origem.foto.minutos > 0 && /^Paradas\.html#pareto=/.test(A.origem.link) && decodeURIComponent(A.origem.link).endsWith('|equip|' + r.k), `Paradas › Pareto: link com referência, fotografia (${A && A.origem.foto.minutos} min) e reconsulta com o filtro (AT-09: ${A && decodeURIComponent(A.origem.link).slice(0, 70)})`);
    ok(Bv && /^recor\|/.test(Bv.origem.ref) && Bv.vinculos.some(v => v.tipo === 'codigo'), 'Paradas › Recorrência: link com equipamento e código');
    ok(C && C.vinculos.some(v => v.tipo === 'evento' && v.cod === r.ev) && /^Paradas\.html#evento=/.test(C.origem.link), 'Paradas › evento: link com o evento e a reconsulta');
    ok(/^Iniciativas\.html#nova=/.test(r.a), 'abre a página Iniciativas (nova aba), não grava no Paradas');
    await p.close();
    const q = await ctx.newPage(); q.on('pageerror', e => pe.push('Produção: ' + e.message)); await q.goto(U.replace('Iniciativas.html', 'OEE-Vacutainer.html')); await q.waitForTimeout(1200);
    const o = await q.evaluate(() => { const d = oeeAcaoPlanner('codigo', 'FAL · Falha', [{ minutes: 30, day: { date: '2026-11-02' } }, { minutes: 12, day: { date: '2026-11-05' } }]); return { d, b: vacNovaAcaoBotao(d, '+ Ação no Planner', 'btn sm') }; });
    ok(o.d.origem.tipo === 'oee' && o.d.origem.foto.minutos === 42 && o.d.origem.foto.período === '02/11/2026–05/11/2026' && /class="btn sm"/.test(o.b), 'Produção › Paradas: ação de OEE com período, minutos e eventos');
    const pa = await abre(); await pa.evaluate(CONECTA); await pa.evaluate(() => vacFicha.abrir('ordem', '100234567')); await pa.waitForTimeout(500);
    const fh = await pa.evaluate(() => { const x = [...document.querySelectorAll('#vacFicha a.vf-b')].find(a => /nova=/.test(a.href)); return x && x.getAttribute('href'); });
    const F1 = nova(fh); ok(F1 && F1.origem.tipo === 'ficha' && F1.vinculos[0].cod === '100234567', 'ficha da ordem: "+ Abrir ação" já com a ordem ligada');
    await pa.close();
  }

  // 9. visual: tema escuro e 390 px
  for (const [nome, vp, tema] of [['escuro', { width: 1440, height: 900 }, 'dark'], ['390', { width: 390, height: 844 }, 'light']]) {
    const c2 = await b.newContext({ viewport: vp }); const p = await c2.newPage(); p.on('pageerror', e => pe.push(e.message)); await p.goto(U + '#teste'); await p.waitForTimeout(600);
    await p.evaluate(t => document.documentElement.setAttribute('data-theme', t), tema); await p.click('[data-ac="AC-T-0147"]'); await p.waitForTimeout(200);
    const sw = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    ok(sw <= 1, `${nome}: sem rolagem horizontal da página (${sw}px; o quadro rola dentro)`);
    await p.screenshot({ path: path.join(SAI, 'planner-' + nome + '.png'), fullPage: nome === '390' }); await c2.close();
  }
  ok(!pe.length, 'sem erro de página' + (pe.length ? ': ' + pe.slice(0, 3).join(' | ') : ''));
  await b.close(); srv.close();
  console.log(errs.length ? `\n${errs.length} falha(s)` : '\nsem erros'); process.exit(errs.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });

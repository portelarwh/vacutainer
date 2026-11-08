// Contra-análise da revisão do Codex sobre 8cad6a6: reproduções independentes, cópia isolada (worktree), dados fictícios, OPFS/HTTP local.
// Saída: uma linha por cenário, "REPRODUZ" (o defeito ocorre) ou "NÃO REPRODUZ".
const path = require('path'), fs = require('fs'), http = require('http');
const RAIZ = process.argv[2]; const { chromium } = require('playwright');
const srv = http.createServer((q, r) => { const f = path.join(RAIZ, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(RAIZ) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': f.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
const R = []; const res = (id, rep, det) => { R.push({ id, rep, det }); console.log((rep ? 'REPRODUZ     ' : 'NÃO REPRODUZ ') + id + ' · ' + det); };
(async () => {
  await new Promise(r => srv.listen(0, r)); const U = `http://127.0.0.1:${srv.address().port}/paginas/`;
  const b = await chromium.launch();
  const nova = async (ctx, arq, h = '') => { const p = await ctx.newPage(); p.on('dialog', d => d.accept()); await p.goto(U + encodeURI(arq) + h); await p.waitForTimeout(900); return p; };

  // AT-01 · duas abas sem pasta, cada uma com uma alteração pendente (Iniciativas, Equipamentos e, fora da revisão, Paradas)
  for (const [arq, op, chave] of [['Iniciativas.html', i => ({ k: 'nova', a: { id: 'AUD-' + i, titulo: 'aba ' + i, status: 'a fazer', criadaEm: new Date().toISOString(), origem: { tipo: 'manual' }, vinculos: [] } }), 'inic.fila'],
    ['Equipamentos.html', i => ({ k: 'os', it: { id: 'AUD-' + i, equipamento: 'EQ01', titulo: 'aba ' + i, tipo: 'corretiva', status: 'aberta', origem: { tipo: 'manual' }, criadaEm: new Date().toISOString(), apontamentos: [] } }), 'equip.fila'],
    ['Paradas.html', i => ({ k: 'list', c: 'acoes', items: [{ id: 'AUD-' + i, titulo: 'aba ' + i, status: 'aberta' }] }), 'paradas.fila']]) {
    const ctx = await b.newContext(); const a = await nova(ctx, arq), c = await nova(ctx, arq);
    await a.evaluate(o => Store.commit(o), op(1)); await c.evaluate(o => Store.commit(o), op(2)); await a.waitForTimeout(800);
    const fila = await a.evaluate(k => JSON.parse(localStorage.getItem(k) || '[]').map(o => (o.a || o.it || (o.items || [])[0] || {}).id), chave);
    res('AT-01 ' + arq, !(fila.includes('AUD-1') && fila.includes('AUD-2')), `fila guardada no navegador: ${fila.join(', ') || 'vazia'}`); await ctx.close();
  }

  // AT-02 · base conhecida some da pasta → save grava base vazia (Iniciativas; e Paradas, fora da revisão)
  for (const [arq, base, completa] of [['Iniciativas.html', 'iniciativas-base.json', { schema: 'vac-iniciativas', schemaVersion: 1, rev: 5, revId: 'r5', acoes: [{ id: 'AC-X', titulo: 'existente', status: 'a fazer' }], eventos: [], kas: [], auditoria: [] }],
    ['Paradas.html', 'paradas-base.json', { schema: 'vac-paradas', schemaVersion: 1, rev: 5, revId: 'r5', eventos: [{ id: 'e1', dia: '2026-11-01', minutos: 10, equipamento: 'EQ01' }], tecnico: {}, validacao: {}, acoes: [], importacoes: [], config: {}, auditoria: [] }]]) {
    const ctx = await b.newContext(); const p = await nova(ctx, arq);
    const r = await p.evaluate(async ([base, B]) => {
      const d = await navigator.storage.getDirectory(); for await (const [n] of d.entries()) await d.removeEntry(n, { recursive: true });
      const bd = await d.getDirectoryHandle('00. Bases', { create: true }); const w = async j => { const fh = await bd.getFileHandle(base, { create: true }); const s = await fh.createWritable(); await s.write(JSON.stringify(j)); await s.close(); }; await w(B);
      Store.dir = vacRaiz(d); Store.perm = true; Store.dirName = 'x'; await Store.reload(); const conta = j => (base === 'paradas-base.json' ? j.eventos : j.acoes || []).length; const antes = conta(Store.data);
      await bd.removeEntry(base); await Store.reload(); await Store.save();
      let depois = null; try { depois = JSON.parse(await (await (await bd.getFileHandle(base)).getFile()).text()); } catch (e) { }
      return { antes, rev: depois && depois.rev, n: depois && conta(depois) };
    }, [base, completa]);
    res('AT-02 ' + arq, r.rev === 1 && r.n === 0, `lida com ${r.antes} registro(s) (rev 5); depois de sumir e "Gravar": arquivo rev ${r.rev}, ${r.n} registro(s)`); await ctx.close();
  }

  // AT-03 · formato próprio desconhecido aceito para escrita
  { const ctx = await b.newContext(); const p = await nova(ctx, 'Iniciativas.html');
    const r = await p.evaluate(async () => { const d = await navigator.storage.getDirectory(); for await (const [n] of d.entries()) await d.removeEntry(n, { recursive: true });
      const bd = await d.getDirectoryHandle('00. Bases', { create: true }); const fh = await bd.getFileHandle('iniciativas-base.json', { create: true }); const s = await fh.createWritable(); await s.write(JSON.stringify({ schema: 'vac-futuro', schemaVersion: 99, rev: 100, acoes: [], eventos: [], kas: [] })); await s.close();
      Store.dir = vacRaiz(d); Store.perm = true; await Store.reload(); Store.commit({ k: 'nova', a: { id: 'Z', titulo: 'z', status: 'a fazer', criadaEm: new Date().toISOString(), origem: { tipo: 'manual' }, vinculos: [] } }); clearTimeout(Store.t); await Store.save();
      const j = JSON.parse(await (await (await bd.getFileHandle('iniciativas-base.json')).getFile()).text()); return { schema: j.schema, sv: j.schemaVersion, rev: j.rev }; });
    res('AT-03 Iniciativas', r.rev === 101, `base schema ${r.schema} v${r.sv} recebeu gravação (rev ${r.rev})`); await ctx.close(); }

  // AT-04 · aba aberta, dia vira: vacAoVoltar não republica exports antigos
  { const ctx = await b.newContext(); const p = await nova(ctx, 'Iniciativas.html');
    const r = await p.evaluate(async () => { const d = await navigator.storage.getDirectory(); for await (const [n] of d.entries()) await d.removeEntry(n, { recursive: true });
      const s0 = IDB.set; IDB.set = async (k, v) => k === 'pasta' ? undefined : s0.call(IDB, k, v); await Store.usar(d);
      const bd = await d.getDirectoryHandle('00. Bases'), fh = await bd.getFileHandle('iniciativas-base.json'); const j = JSON.parse(await (await fh.getFile()).text()); j.exports.geradoEm = '2020-01-01T12:00:00Z'; const w = await fh.createWritable(); await w.write(JSON.stringify(j)); await w.close();
      vacAoVoltar(); await new Promise(r => setTimeout(r, 1500)); const k = JSON.parse(await (await fh.getFile()).text()); return k.exports.geradoEm; });
    res('AT-04 Iniciativas', /^2020/.test(r), `exports depois de voltar à aba: geradoEm ${r}`); await ctx.close(); }

  // AT-05 · link #aba=equip&eq=EQ03 na primeira abertura
  { const ctx = await b.newContext(); const p0 = await nova(ctx, 'Equipamentos.html'); await p0.evaluate(() => localStorage.setItem('vac.cadastros', JSON.stringify({ equipamentos: [{ codigo: 'EQ01', nome: 'A', ativo: true }, { codigo: 'EQ03', nome: 'B', ativo: true }] }))); await p0.close();
    const p = await nova(ctx, 'Equipamentos.html', '#aba=equip&eq=EQ03'); const eq = await p.evaluate(() => App.eq);
    res('AT-05 Equipamentos', eq !== 'EQ03', `link da pendência "anomalia sem OS" abriu ${eq}`); await ctx.close(); }

  // AT-06 · dia fora da janela de eventos do Paradas aparece como 0 min · AT-07 · ação com só a 1ª ordem
  { const ctx = await b.newContext(); const p = await nova(ctx, 'Portal.html');
    const r = await p.evaluate(() => { enterTest(); const h = todayISO(), velho = addDays(h, -120), D = addDays(h, -1);
      MOD.data.paradas = { sys: sysOf('paradas'), kpis: [], pend: [], ex: { exportsVersion: 1, eventos: [{ dia: D, turno: 'T1', equipamento: 'EQ03', codigo: 'FAL', minutos: 40, ordem: '111' }, { dia: D, turno: 'T1', equipamento: 'EQ03', codigo: 'FAL', minutos: 35, ordem: '222' }] } };
      const v = reuDados(velho, 'dia'), d = reuDados(D, 'dia'); return { min: v.par && v.par.min, fora: v.par && v.par.fora, ordem: d.par.top[0].ordem }; });
    res('AT-06 Portal', r.min === 0 && r.fora, `reunião de 120 dias atrás: ${r.min} min (fora=${r.fora}); o cartão mostra o número`);
    res('AT-07 Portal', r.ordem === '111', `grupo EQ03·FAL com as ordens 111 e 222: ação ligada só a ${r.ordem}`); await ctx.close(); }

  // AT-10 · troca de usuário pelo Entrar com Minha fila aberta
  { const ctx = await b.newContext(); const p = await nova(ctx, 'Portal.html');
    await p.evaluate(() => enterTest()); await p.waitForTimeout(500);
    const r = await p.evaluate(() => { const C = vacCad(); C.usuarios = [{ codigo: '1', nome: 'Ana', ativo: true }, { codigo: '2', nome: 'Bia', ativo: true }];
      MOD.data.inic = { sys: sysOf('inic'), kpis: [], pend: [], ex: { exportsVersion: 1, acoes: [{ id: 'A1', titulo: 'da Ana', status: 'a fazer', responsavel: 'Ana' }, { id: 'B1', titulo: 'da Bia', status: 'a fazer', responsavel: 'Bia' }] } };
      setUser('Ana'); localStorage.setItem('vac.userId', '1'); App.show('fila'); const antes = [...document.querySelectorAll('.fl-i .fl-t div:first-child')].map(x => x.textContent);
      Entrar.abrir(); Entrar.entrar({ codigo: '2', nome: 'Bia', perfil: '' }); try { Modal.close(true); } catch (e) { }
      const depois = [...document.querySelectorAll('.fl-i .fl-t div:first-child')].map(x => x.textContent); return { antes, depois }; });
    res('AT-10 Portal', r.depois.includes('da Ana'), `Minha fila antes: ${r.antes.join(',')}; depois de entrar como Bia: ${r.depois.join(',')}`); await ctx.close(); }

  // AT-11 · link de origem com protocolo javascript (Iniciativas e, fora da revisão, Equipamentos)
  for (const [arq, h, sel, prep] of [['Iniciativas.html', '#teste', '#det a[href^="javascript"]', () => { Store.data.acoes[0].origem.link = 'javascript:window.__x=1'; App.sel = Store.data.acoes[0].id; render(); }],
    ['Equipamentos.html', '#teste', '.det a[href^="javascript"]', () => { Store.data.os[0].origem.link = 'javascript:window.__x=1'; App.tab = 'os'; App.osSel = Store.data.os[0].id; render(); }]]) {
    const ctx = await b.newContext(); const p = await nova(ctx, arq, h); await p.evaluate(prep); await p.waitForTimeout(200);
    const tem = await p.$(sel); if (tem) await tem.click(); await p.waitForTimeout(200); const x = await p.evaluate(() => window.__x);
    res('AT-11 ' + arq, x === 1, `link "na origem" com javascript: ${tem ? 'renderizado e executado ao clicar (__x=' + x + ')' : 'não renderizado'}`); await ctx.close();
  }

  // AT-12 · #ordem= com zeros no Planner
  { const ctx = await b.newContext(); const p = await nova(ctx, 'Iniciativas.html', '#teste');
    const r = await p.evaluate(() => { location.hash = 'ordem=000100234567'; rota(); return filtradas().map(a => a.id); });
    res('AT-12 Iniciativas', !r.includes('AC-T-0147'), `#ordem=000100234567 lista: ${r.join(',') || 'nada'} (a ação AC-T-0147 está ligada à 100234567)`); await ctx.close(); }

  // AT-08 · cache da ficha: assinatura só por data e tamanho (leitura do código)
  { const t = fs.readFileSync(path.join(RAIZ, 'fontes/kit/kit_v21.js'), 'utf8'); const m = /atual\.mod === arq\.lastModified && atual\.tam === arq\.size/.test(t);
    res('AT-08 kit (código)', m, 'reuso do cache compara só lastModified e size, sem a pasta de origem'); }
  // AT-09 · reconsulta do Pareto sem os filtros (leitura do código)
  { const t = fs.readFileSync(path.join(RAIZ, 'paginas/Paradas.html'), 'utf8'); const m = /link:vacAquiHref\(onde==='evento'\?'evento='\+k:eq\?'equipamento='\+eq:'aba='\+\(onde==='recor'\?'recor':'pareto'\)\)/.test(t);
    res('AT-09 Paradas (código)', m, 'link de reconsulta leva só aba/equipamento; período, turno e classe não vão no endereço'); }
  fs.writeFileSync(path.join(__dirname, 'repro.json'), JSON.stringify(R, null, 1));
  await b.close(); srv.close();
})().catch(e => { console.error(e); process.exit(1); });

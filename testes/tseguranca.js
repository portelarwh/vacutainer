// Revisão independente dos achados do Codex sobre 065fe6f (07/11/2026): segurança e dados, TV da Produção, scripts, índice do Gel.
// node testes/tseguranca.js → código 1 se falhar. Usa cópias temporárias para testar os scripts (o repositório não muda).
const SP = require('path').resolve(__dirname, '..') + '/'; const PG = 'file://' + SP + 'paginas/';
const fs = require('fs'), os = require('os'), path = require('path'), crypto = require('crypto'); const { execFileSync, spawnSync } = require('child_process');
const { chromium } = require('playwright');
const errs = []; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA ') + m); if (!c) errs.push(m); };
const fecha = () => document.querySelectorAll('.overlay').forEach(o => o.remove());

(async () => {
  const b = await chromium.launch();

  // ---------- 1. Waste: identificadores importados nos botões do detalhe da ordem
  const src = fs.readFileSync(SP + 'paginas/Perdas-Ordem.html', 'utf8');
  const inl = src.match(/on[a-z]+="[^"]*\$\{[^"]*"/g) || [];
  ok(inl.length > 10 && inl.every(a => !/'\$\{/.test(a)), `Waste: nenhum onclick monta string com '\${…}' (${inl.length} atributos com valor da página, todos por jsArg)`);
  const CASOS = [
    ['aspa simples no componente', '900000001', "MAT');window.__pwn='comp';//"],
    ['aspa simples na ordem', "OS'+(window.__pwn='ordem')+'", '10000001'],
    ['aspas duplas e barra', '900000002', 'X\\");window.__pwn=1;//"'],
    ['fecha script e template', '900000003', "</script><img src=x onerror=window.__pwn=1>${window.__pwn=1}"],
    ['apóstrofo legítimo', '900000004', "D'AGUA"]];
  for (const [rot, ordem, comp] of CASOS) {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } }); const pe = []; p.on('pageerror', e => pe.push(e.message)); p.on('dialog', d => d.accept());
    await p.goto(PG + 'Perdas-Ordem.html'); await p.waitForTimeout(800); await p.evaluate(() => { document.querySelectorAll('.overlay').forEach(o => o.remove()); localStorage.setItem('vac.user', 'Teste'); enterTest(); }); await p.waitForTimeout(600);
    const v = await p.evaluate(async ([o, c]) => {
      const ordem = cleanOrd(o), comp = cleanMat(c); const r0 = B.rows[0];
      IMP = { R: { recs: [{ ...r0, ordem, comp, id: undefined }], rej: [], dupI: 0, subt: 0, gran: 'ordem × componente', extra: null }, meta: { arquivo: 'kkbc.txt', raw: null }, headers: [], map: {}, list: true }; await doImport();
      openOrder(ordem); await new Promise(r => setTimeout(r, 300));
      const rec = []; const orig = { commentForm, copyLink, actionForm, exportOrder };
      window.commentForm = (...a) => rec.push(['commentForm', ...a]); window.copyLink = (...a) => rec.push(['copyLink', ...a]); window.actionForm = (...a) => rec.push(['actionForm', ...a]); window.exportOrder = (...a) => rec.push(['exportOrder', ...a]);
      for (const bt of document.querySelectorAll('button[onclick]')) { const a = bt.getAttribute('onclick'); if (/commentForm|copyLink|actionForm|exportOrder/.test(a)) bt.click(); }
      Object.assign(window, orig); return { ordem, comp, rec, pwn: window.__pwn || null };
    }, [ordem, comp]);
    const comCompCerto = v.rec.some(r => r[0] === 'commentForm' && r[1] === v.ordem && r[2] === v.comp);
    ok(!v.pwn && v.rec.length >= 4 && v.rec.every(r => r.slice(1).includes(v.ordem)) && comCompCerto && !pe.length, `Waste ${rot}: nada executa e as funções recebem o valor exato (${v.rec.length} cliques${pe.length ? '; erro ' + pe[0] : ''})`);
    if (process.env.DEBUG) console.log(JSON.stringify(v));
    await p.close();
  }

  // ---------- 3 e 9. CSV com fórmulas e URLs de download
  const CSV = [['=HIPERLINK("x")', "'=HIPERLINK(\"x\")"], ['+1+1', "'+1+1"], ['@SOMA(A1)', "'@SOMA(A1)"], ['-2+3', "'-2+3"], ['\tx', "'\tx"],
    ['-1.234', '-1.234'], ['-12,5', '-12,5'], ['-3%', '-3%'], ['+5', '+5'], ['0123', '0123'], ['EQ01', 'EQ01'], ['Tubo PET', 'Tubo PET'], ['', '']];
  for (const [nome, arq] of [['Waste', 'Perdas-Ordem.html'], ['Gel', 'Gestão-Gel-Vacutainer.html'], ['Produção', 'OEE-Vacutainer.html']]) {
    const p = await b.newPage(); await p.goto(PG + encodeURI(arq)); await p.waitForTimeout(900);
    const r = await p.evaluate(C => typeof vacCsvTexto !== 'function' ? ['regra comum vacCsvTexto ausente'] : C.filter(([a, e]) => vacCsvTexto(a) !== e).map(([a, e]) => `${a} → ${vacCsvTexto(a)} (esperado ${e})`), CSV);
    ok(!r.length, `${nome}: regra do CSV (fórmula vira texto; número escrito como texto e códigos ficam iguais)${r.length ? ': ' + r.join('; ') : ''}`);
    await p.close();
  }
  {
    const p = await b.newPage(); p.on('dialog', d => d.accept()); await p.goto(PG + 'Perdas-Ordem.html'); await p.waitForTimeout(800); await p.evaluate(() => { document.querySelectorAll('.overlay').forEach(o => o.remove()); enterTest(); }); await p.waitForTimeout(500);
    const r = await p.evaluate(async () => {
      let n = 0, v = 0; const c = URL.createObjectURL, rv = URL.revokeObjectURL; URL.createObjectURL = x => { n++; return c.call(URL, x); }; URL.revokeObjectURL = x => { v++; return rv.call(URL, x); };
      let txt = null; const db0 = window.downloadBlob; window.downloadBlob = async (bl, nm) => { if (/\.csv$/.test(nm)) txt = await bl.text(); return db0(bl, nm); };
      exportCsv([['Descrição', 'Desvio'], ['=HIPERLINK("x")', -12.5], ['-1.234', 3]], 't.csv'); downloadJSON({ a: 1 }, 't.json');
      await new Promise(r => setTimeout(r, 900)); window.downloadBlob = db0; URL.createObjectURL = c; URL.revokeObjectURL = rv; return { n, v, txt };
    });
    ok(r.txt && r.txt.includes("'=HIPERLINK(\"\"x\"\")") && r.txt.includes(';-12,5') && r.txt.includes('-1.234;3'), 'Waste: CSV exportado com a fórmula como texto e os números iguais');
    ok(r.n === 2 && r.v === 2, `Waste: downloads de CSV e JSON liberam a URL depois (${r.n} criadas, ${r.v} liberadas)`);
    const comum = await p.evaluate(async () => { let n=0,v=0;const c=URL.createObjectURL,rv=URL.revokeObjectURL;URL.createObjectURL=x=>{n++;return c.call(URL,x)};URL.revokeObjectURL=x=>{v++;return rv.call(URL,x)};try{vacDownloadBlob(new Blob(['teste']),'recuperacao-teste.json');await new Promise(r=>setTimeout(r,1200));return{n,v}}finally{URL.createObjectURL=c;URL.revokeObjectURL=rv} });
    ok(comum.n===1&&comum.v===1,'Kit: download da recuperação libera a URL');
    const fora = []; for (const m of src.matchAll(/createObjectURL/g)) { const ctx = src.slice(Math.max(0, m.index - 120), m.index); if (!/function (?:downloadBlob|vacDownloadBlob)\(|Logo|this\.url/.test(ctx)) fora.push(src.slice(m.index - 60, m.index + 20)); }
    ok(!fora.length, `Waste: createObjectURL só nos helpers de download e no logo${fora.length ? ' (sobrou: ' + fora[0] + ')' : ''}`);
    await p.close();
  }

  // ---------- 2. Restauração com falha ao copiar a base atual (Portal e Gel)
  for (const resposta of ['cancelar', 'continuar']) {
    const p = await b.newPage(); const msgs = []; p.on('dialog', d => { msgs.push(d.message()); if (/Não consegui salvar/.test(d.message())) return resposta === 'continuar' ? d.accept() : d.dismiss(); d.accept(); });
    await p.goto(PG + 'Portal.html'); await p.waitForTimeout(900); await p.evaluate(() => { document.querySelectorAll('.overlay').forEach(o => o.remove()); enterTest(); App.show('config'); }); await p.waitForTimeout(500);
    await p.evaluate(() => { window.__commits = 0; Store.mode = 'pasta'; Store.sub = async () => ({}); Store.writeFile = async () => { throw new Error('acesso negado (simulado)'); }; const c = Store.commit.bind(Store); Store.commit = async (l, ...a) => { if (/restaurada/.test(l)) { window.__commits++; return; } return c(l, ...a); }; });
    const base = await p.evaluate(() => JSON.stringify({ ...Store.B, schema: Store.B.schema || PAGE.vazio().schema }));
    await p.setInputFiles('#cRest', { name: 'portal-base_copia.json', mimeType: 'application/json', buffer: Buffer.from(base) }); await p.waitForTimeout(500);
    const n = await p.evaluate(() => window.__commits);
    ok(msgs.some(m => /Não consegui salvar a cópia/.test(m)) && n === (resposta === 'continuar' ? 1 : 0), `Portal: cópia anterior falhou → pergunta; ${resposta} → ${n ? 'restaurou' : 'nada mudou'}`);
    await p.close();
  }
  for (const resposta of ['cancelar', 'continuar']) {
    const p = await b.newPage(); const msgs = []; p.on('dialog', d => { msgs.push(d.message()); if (/Não consegui salvar/.test(d.message())) return resposta === 'continuar' ? d.accept() : d.dismiss(); d.accept(); });
    await p.goto(PG + encodeURI('Gestão-Gel-Vacutainer.html')); await p.waitForTimeout(1200); await p.evaluate(() => { document.querySelectorAll('.overlay').forEach(o => o.remove()); enterDemo(); render(); }); await p.waitForTimeout(600);
    await p.evaluate(() => { window.__rest = 0; S.mode = 'file'; FS.base = {}; ui.demo = false; window.fsBackupCopy = async () => { throw new Error('acesso negado (simulado)'); }; window.restoreData = async () => { window.__rest++; }; openConfig('backup'); });
    await p.waitForTimeout(500);
    await p.setInputFiles('#bkI', { name: 'backup_fifo.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ lps: [], imports: [] })) }); await p.waitForTimeout(500);
    const n = await p.evaluate(() => window.__rest);
    ok(msgs.some(m => /Substituir os dados atuais/.test(m)) && msgs.some(m => /Não consegui salvar a cópia/.test(m)) && n === (resposta === 'continuar' ? 1 : 0), `Gel: confirma antes de restaurar; cópia anterior falhou → pergunta; ${resposta} → ${n ? 'restaurou' : 'nada mudou'}`);
    await p.close();
  }

  // ---------- 4. Produção: dica e clique dos gráficos depois de sair da TV
  {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } }); const pe = []; p.on('pageerror', e => pe.push(e.message)); p.on('dialog', d => d.accept());
    await p.goto(PG + 'OEE-Vacutainer.html'); await p.waitForTimeout(1200);
    await p.evaluate(() => { document.querySelectorAll('.overlay').forEach(o => o.remove()); Demo.enterExample(); const db = Store.S.db; for (const k of ['productionDays', 'monthPlans', 'calendar']) (db[k] || []).forEach(d => delete d.demo); Engine.bumpConfig(); document.querySelectorAll('.overlay').forEach(o => o.remove()); go('overview'); });
    await p.waitForTimeout(1500);
    const dica = () => p.evaluate(async () => { const h = document.querySelector('#main .hit[data-cid]'); if (!h) return 'sem gráfico'; h.scrollIntoView({ block: 'center' }); await new Promise(r => setTimeout(r, 50)); const bb = h.getBoundingClientRect(); h.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: bb.x + bb.width / 2, clientY: bb.y + bb.height / 2 })); await new Promise(r => setTimeout(r, 80)); const t = document.querySelector('.tip'); const v = t && !t.hidden ? t.innerText.replace(/\s+/g, ' ').slice(0, 40) : null; document.body.dispatchEvent(new MouseEvent('mousemove', { bubbles: true })); return v; });
    const a = await dica(); await p.evaluate(() => TV.open()); await p.waitForTimeout(800); await p.evaluate(() => TV.close()); await p.waitForTimeout(400); const d1 = await dica();
    await p.evaluate(() => go('panel')); await p.waitForTimeout(1200); await p.evaluate(() => { const v = Panel.viewOptions()[0]; TV.openView(v ? v[0] : undefined); }); await p.waitForTimeout(800); await p.evaluate(() => TV.close()); await p.waitForTimeout(400);
    const d2 = await p.evaluate(() => [...document.querySelectorAll('#main .hit[data-cid]')].length);
    const d2b = await dica();
    ok(a && d1 === a, `Produção: dica do gráfico igual antes e depois de sair da TV (${d1})`);
    ok(d2 > 0 && d2b, `Produção: no Painel, depois da TV aberta pela visão, a dica responde (${d2b})`);
    ok(!pe.length, `Produção: sem erro de página${pe.length ? ' (' + pe[0] + ')' : ''}`);
    await p.close();
  }

  // ---------- 7. Gel: índice por dia dá os mesmos números do Painel (período e comparação), e mais rápido
  {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } }); p.on('dialog', d => d.accept()); await p.goto(PG + encodeURI('Gestão-Gel-Vacutainer.html')); await p.waitForTimeout(1200);
    await p.evaluate(() => { document.querySelectorAll('.overlay').forEach(o => o.remove()); enterDemo(); render(); }); await p.waitForTimeout(900);
    const r = await p.evaluate(() => {
      const base = S.events.slice(); S.events = []; for (let i = 0; i < 30; i++) S.events.push(...base); const out = [];
      const fot = x => JSON.stringify({ B: x.G.B.map(b => b.s), P: x.P && x.P.G ? x.P.G.B.map(b => b.s) : null, k: Object.keys(DBK).map(k => { try { const v = DBK[k].c(x); return [k, v.v, v.s]; } catch (e) { return [k, 'erro']; } }) });
      for (const pre of ['30', 'mes_ant', 'ano', '365']) {
        const o = { ...dbState(), pre, cmp: 'prev', f: {} };
        memoClear(); const t0 = performance.now(); const x1 = dbCtx(o, {}); const f1 = fot(x1); const t1 = performance.now(); memoClear();
        const ri = window.rgIndice; window.rgIndice = () => null; const t2 = performance.now(); const x2 = dbCtx(o, {}); const f2 = fot(x2); const t3 = performance.now(); window.rgIndice = ri; memoClear();
        out.push({ pre, igual: f1 === f2, ms: Math.round(t1 - t0), msSem: Math.round(t3 - t2) });
      }
      S.events = base; return { n: base.length * 30, out };
    });
    ok(r.out.every(x => x.igual), `Gel: índice por dia dá os mesmos números e indicadores (com e sem índice; ${r.n} movimentações; ${r.out.map(x => x.pre + ' ' + x.ms + ' ms (antes ' + x.msSem + ')').join(' · ')})`);
    const ano = r.out.find(x => x.pre === '365'); ok(ano.ms * 3 < ano.msSem, `Gel: 12 meses com ${r.n} movimentações bem mais rápido (${ano.ms} ms; antes ${ano.msSem} ms)`);
    await p.close();
  }

  // ---------- 10. modelo das páginas em construção: toast declarado uma vez
  for (const f of ['fontes/modelo/pagina-em-construcao.html', 'paginas/Equipamentos.html', 'paginas/Iniciativas.html', 'paginas/Projetos.html']) {
    const n = (fs.readFileSync(SP + f, 'utf8').match(/^function toast\(/mg) || []).length; ok(n === 1, `${f}: toast declarado ${n} vez(es)`);
  }
  await b.close();

  // ---------- 5. scripts de geração: duas fases (nada pela metade) e saída com \n
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vac-scripts-')); const hash = f => crypto.createHash('sha1').update(fs.readFileSync(f)).digest('hex');
  try {
    for (const d of ['fontes', 'paginas']) fs.cpSync(SP + d, path.join(tmp, d), { recursive: true });
    const pags = fs.readdirSync(path.join(tmp, 'paginas')).filter(n => n.endsWith('.html')).map(n => path.join(tmp, 'paginas', n));
    const h0 = Object.fromEntries(pags.map(f => [f, hash(f)]));
    spawnSync('python3', [path.join(tmp, 'fontes/kit/aplicar_kit21.py')]); spawnSync('python3', [path.join(tmp, 'fontes/producao/build.py')]);
    ok(pags.every(f => hash(f) === h0[f]), 'scripts: rodar de novo gera os mesmos arquivos, byte a byte');
    ok(pags.every(f => !fs.readFileSync(f, 'utf8').includes('\r\n')), 'scripts: arquivos gravados com \\n (sem CRLF)');
    // página com o bloco do kit quebrado: o aplicar para antes de gravar qualquer página
    const par = path.join(tmp, 'paginas', 'Paradas.html'); fs.writeFileSync(par, fs.readFileSync(par, 'utf8').replace('/* ----- vac-cabecalho v2.1', '/* ----- QUEBRADO'));
    const h1 = Object.fromEntries(pags.map(f => [f, hash(f)]));
    const r1 = spawnSync('python3', [path.join(tmp, 'fontes/kit/aplicar_kit21.py')], { encoding: 'utf8' });
    ok(r1.status !== 0 && /nada foi gravado/.test(r1.stderr + r1.stdout) && pags.every(f => hash(f) === h1[f]), 'aplicar_kit21: erro numa página não regrava nenhuma outra');
    const r2 = spawnSync('python3', [path.join(tmp, 'fontes/modelo/gerar_paginas.py')], { encoding: 'utf8' });
    ok(r2.status !== 0 && pags.every(f => hash(f) === h1[f]), 'gerar_paginas: se o aplicar_kit21 falha, as páginas geradas voltam ao que eram');
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }

  console.log(errs.length ? `\n${errs.length} falha(s)` : '\nsem erros'); process.exit(errs.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });

// Fase 6 do briefing (09/11/2026): Iniciativas / Ações 1.1.0, Waste 1.8.28, Portal 1.9.14.
// INI-00 nome · INI-01 cards por status · I2 eficácia · INI-02 programas do Portal (abas) · INI-03 importar ações (prévia, sem
// duplicar, Portal › Importação) · WST-03/INI-04 ações do Waste em Iniciativas (+ Ação abre lá, leitura do exports, migração única
// com histórico, antigas só leitura, pendência sem contagem dupla).
// node testes/tiniciativas.js → "sem erros"; código 1 se falhar. Prints em testes/saida/iniciativas/
const path = require('path'), fs = require('fs'), http = require('http'); const RAIZ = path.resolve(__dirname, '..');
const { chromium } = require('playwright');
const verN = v => String(v || '').split(/[^\d]+/).filter(Boolean).slice(0, 4).map(Number).reduce((t, n, i) => t + n * Math.pow(1000, 3 - i), 0);   // versão como número (1.10 > 1.9; texto comparava errado)
const srv = http.createServer((q, r) => { const f = path.join(RAIZ, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(RAIZ) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': f.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
const errs = []; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA ') + m); if (!c) errs.push(m); };
const SAI = path.join(RAIZ, 'testes', 'saida', 'iniciativas'); fs.mkdirSync(SAI, { recursive: true });
const CAD = { schema: 'vac-cadastros', rev: 4, usuarios: [{ codigo: '1', nome: 'J. Lima', ativo: true }],
  programas: [{ codigo: 'AM', nome: 'Manutenção Autônoma', sigla: 'AM', responsavel: 'Eng. Processos', cor: '#2e7d32', descricao: 'Limpeza, inspeção e lubrificação pelo operador.', ativo: true },
    { codigo: 'KAS', nome: 'KAS', ativo: true }, { codigo: 'VELHO', nome: 'Programa inativo', ativo: false }] };
const LEG = [
  { id: 'w1', ordem: '100234567', comp: '1034567', desc: 'Inspecionar rolos de etiqueta', causa: 'Embalagem', status: 'em análise', resp: 'Qualidade', area: 'QA', prazo: '2026-10-15', conclusao: '', econ: 1200, pri: 'alta', obs: 'foto no Teams', abertura: '2026-10-01', user: 'ana', hist: [{ data: '2026-10-05T10:00:00Z', user: 'ana', status: 'aberta', prazo: '2026-10-10' }] },
  { id: 'w2', ordem: '100234568', comp: '', desc: 'Trocar faca da rotuladora', causa: 'Máquina', status: 'encerrada eficaz', resp: 'Manutenção', area: '', prazo: '2026-09-30', conclusao: '2026-09-28', econ: null, pri: 'média', obs: '', abertura: '2026-09-10', user: 'bia', hist: [] },
  { id: 'w3', ordem: '', comp: '', desc: 'Revisar padrão de setup', causa: '', status: 'aguardando validação', resp: '', area: '', prazo: '', conclusao: '', econ: null, pri: 'baixa', obs: '', abertura: '2026-11-01', user: 'ana', hist: [] }];

(async () => {
  await new Promise(r => srv.listen(0, r)); const PG = `http://127.0.0.1:${srv.address().port}/paginas/`;
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const pe = [];
  const abre = async (arq, h = '') => { const p = await ctx.newPage(); p.on('pageerror', e => pe.push(arq + ': ' + e.message)); p.on('dialog', d => d.accept()); await p.goto(PG + arq + h); await p.waitForTimeout(700); return p; };

  // 1. Iniciativas: nome, cards por status, programas do Portal
  {
    const p0 = await abre('Iniciativas.html'); await p0.evaluate(c => { localStorage.clear(); localStorage.setItem('vac.cadastros', JSON.stringify(c)); }, CAD); await p0.close();
    const p = await abre('Iniciativas.html', '#teste'); await p.waitForTimeout(300);
    const r = await p.evaluate(() => ({ ver: PAGE.versao, tit: PAGE.titulo, curto: PAGE.tituloCurto, nav: (systems().find(s => s.id === 'inic') || {}).nome,
      cls: [...document.querySelectorAll('.ac')].map(e => [...e.classList].find(c => c.startsWith('st-')) || ''),
      abas: ABAS.map(a => a[0]), orig: ORIGENS.map(o => o[0]), mais: !!document.querySelector('[data-novoprog]') }));
    ok(verN(r.ver) >= verN('1.1.0') && /^Iniciativas \/ Ações/.test(r.tit) && r.curto === 'Iniciativas / Ações' && r.nav === 'Iniciativas / Ações', `INI-00: "${r.curto}" (página e catálogo do cabeçalho), versão ${r.ver}`);
    ok(r.cls.length && r.cls.every(Boolean) && r.cls.includes('st-afazer') && r.cls.includes('st-concluida') && r.cls.includes('st-atrasada'), `INI-01: todo card com fundo do status (${[...new Set(r.cls)].join(', ')})`);
    const bg = await p.evaluate(() => { const g = s => getComputedStyle(document.querySelector('.ac.' + s)).backgroundColor; return [g('st-afazer'), g('st-concluida')]; });
    ok(bg[0] !== bg[1], `INI-01: cores diferentes por status (${bg.join(' × ')})`);
    ok(r.abas.includes('prog-AM') && !r.abas.includes('prog-KAS') && !r.abas.includes('prog-VELHO') && r.abas.indexOf('prog-AM') < r.abas.indexOf('config'), `INI-02: aba do programa AM do Portal antes da Configuração; KAS já tem aba; inativo fora (${r.abas.join(', ')})`);
    ok(r.orig.includes('prog:AM') && r.mais, 'INI-02: origem "Manutenção Autônoma" no formulário e botão + (novo programa no Portal)');
    await p.evaluate(() => { App.tab = 'prog-AM'; render(); });
    const t = await p.evaluate(() => document.getElementById('main') ? document.getElementById('main').innerText : document.body.innerText);
    ok(/Manutenção Autônoma/i.test(t) && /Limpeza, inspeção/.test(t) && /Importar dados/i.test(t) && /Eng\. Processos/.test(t), 'INI-02: aba do programa com nome, descrição, responsável e Importar dados');
    await p.screenshot({ path: path.join(SAI, 'programa.png') });

    // 2. INI-03: importar ações coladas do Excel
    const txt = 'Título\tResponsável\tPrazo\tStatus\tPrioridade\nLimpar guia da esteira\tJ. Lima\t20/11/2026\tEm andamento\tAlta\nLubrificar corrente\t\t2026-11-30\t\t\nSem prazo válido\tAna\t31-31-2026\t\t';
    const imp = async () => { await p.evaluate(() => ImpAcoes.abrir('prog-AM')); await p.fill('#iaTxt', txt); await p.click('#iaPrev'); const res = await p.textContent('#iaRes'); await p.click('.mod [data-ok]'); await p.waitForTimeout(200); return res; };
    const r1 = await imp();
    const s1 = await p.evaluate(() => { const L = Store.data.acoes.filter(a => (a.origem || {}).tipo === 'prog:AM'); const ex = calcExports(Store.data); return { n: L.length, l: L.map(a => [a.titulo, a.responsavel, a.prazo, a.status, a.prioridade].join('|')), imp: ex.importacoes }; });
    ok(/3 linha\(s\): 2 nova\(s\), 0 já importada\(s\), 1 com erro/.test(r1), `INI-03: prévia (${r1})`);
    ok(s1.n === 2 && s1.l.includes('Limpar guia da esteira|J. Lima|2026-11-20|em andamento|alta') && s1.l.includes('Lubrificar corrente||2026-11-30|a fazer|media'), `INI-03: 2 ações do AM com data dd/mm convertida e status/prioridade lidos (${s1.l.join(' ; ')})`);
    ok(s1.imp.length === 1 && s1.imp[0].tipo === 'ACOES' && s1.imp[0].novas === 2 && s1.imp[0].programa === 'prog:AM', 'INI-03: exports.importacoes com tipo ACOES (Portal › Importação › Iniciativas)');
    await p.evaluate(() => ImpAcoes.abrir('prog-AM')); await p.fill('#iaTxt', txt); await p.click('#iaPrev'); const r2 = await p.textContent('#iaRes'); await p.click('.mod [data-x]');
    ok(/0 nova\(s\), 2 já importada\(s\)/.test(r2), `INI-03: colar de novo não duplica (${r2})`);

    // 3. I2: eficácia na ação concluída
    const efi = await p.evaluate(async () => { App.tab = 'acoes'; const a = Store.data.acoes.find(x => x.status === 'concluída'); App.sel = a.id; render(); await new Promise(r => setTimeout(r, 50));
      const s = document.getElementById('efSel'); if (!s) return { erro: 'sem #efSel' }; s.value = 'eficaz'; s.onchange(); await new Promise(r => setTimeout(r, 50));
      const x = calcExports(Store.data).acoes.find(y => y.id === a.id); const ev = Store.data.eventos.filter(e => e.acao === a.id && e.tipo === 'eficácia');
      return { ef: Store.data.acoes.find(y => y.id === a.id).eficacia, ex: x && x.eficacia, ev: ev.length, pill: /Confirmação de Processo: Eficaz/i.test(document.getElementById('det').innerText) }; });
    ok(efi.ef === 'eficaz' && efi.ex === 'eficaz' && efi.ev === 1 && efi.pill, `I2: eficácia "eficaz" gravada, no histórico, no detalhe e no exports (${JSON.stringify(efi)})`);

    // 4. WST-03/INI-04: trazer as ações antigas do Waste (uma vez, com histórico)
    const mig = async () => p.evaluate(async L => { vacFicha.carregar = async () => { }; vacFicha._S.dados.perdas = { estado: 'pasta', geradoEm: '2026-11-10T10:00:00Z', d: { porOrdem: [], acoesLegado: L } };
      App.tab = 'config'; render(); await MigWaste.abrir(); await new Promise(r => setTimeout(r, 50)); const t = document.querySelector('.mod').innerText; document.querySelector('.mod [data-ok]').click(); await new Promise(r => setTimeout(r, 50)); return t; }, LEG);
    const m1 = await mig();
    const s4 = await p.evaluate(() => { const g = id => Store.data.acoes.find(a => a.id === id) || {}; const ex = calcExports(Store.data).acoes; return {
      w1: g('AC-W-w1'), w2: g('AC-W-w2'), w3: g('AC-W-w3'), ex1: ex.find(a => a.id === 'AC-W-w1'), n: Store.data.acoes.filter(a => (a.origem || {}).tipo === 'waste').length }; });
    ok(/3 nova\(s\), 0 já trazida/.test(m1.replace(/<[^>]+>/g, '')), `migração: prévia com 3 novas (${m1.split('\n').slice(0, 3).join(' / ')})`);
    ok(s4.n === 3 && s4.w1.status === 'a fazer' && s4.w2.status === 'concluída' && s4.w2.eficacia === 'eficaz' && s4.w3.status === 'aguardando', 'migração: em análise → a fazer; encerrada eficaz → concluída + eficácia eficaz; aguardando validação → aguardando');
    ok(s4.w1.prioridade === 'alta' && s4.w1.responsavel === 'Qualidade' && s4.w1.prazo === '2026-10-15' && s4.w1.prazoOriginal === '2026-10-10' && /Economia estimada/.test(s4.w1.descricao) && /Causa: Embalagem/.test(s4.w1.descricao), 'migração: prioridade, responsável, prazo (original do histórico) e causa/economia na descrição');
    ok(s4.w1.legado && s4.w1.legado.hist.length === 1 && s4.w1.origem.ref === 'waste|w1' && s4.ex1 && s4.ex1.vinculos.some(v => v.tipo === 'ordem' && v.cod === '100234567'), 'migração: histórico do Waste guardado, ref waste|<id> e vínculo com a ordem no exports');
    const m2 = await mig(); const n2 = await p.evaluate(() => Store.data.acoes.filter(a => (a.origem || {}).tipo === 'waste').length);
    ok(/0 nova\(s\), 3 já trazida/.test(m2) && n2 === 3, 'migração: trazer de novo não duplica');
    await p.evaluate(() => { App.tab = 'acoes'; App.sel = 'AC-W-w1'; App.f.fechadas = true; render(); });
    ok(/Do Waste \(id w1\)/.test(await p.evaluate(() => document.getElementById('det').innerText)), 'migração: detalhe mostra o status e o histórico de lá');
    await p.screenshot({ path: path.join(SAI, 'migrada.png') });
    await p.close();
  }

  // 5. Waste: + Ação abre Iniciativas; lê as ações de lá; antiga trazida só leitura; pendência sem contagem dupla
  {
    const p = await abre('Perdas-Ordem.html'); await p.evaluate(() => { document.querySelectorAll('.overlay').forEach(o => o.remove()); localStorage.setItem('vac.user', 'Teste'); enterTest(); }); await p.waitForTimeout(600);
    const r = await p.evaluate(L => { B.actions = JSON.parse(JSON.stringify(L)).map(a => ({ ...a, prazo: a.prazo || '' }));
      const antes = buildExports(); const pAntes = antes.pendencias.filter(x => x.tipo === 'acaoVencida').length;
      // Iniciativas publicou: a w1 trazida (AC-W-w1) e uma nova criada pelo + Ação do Waste
      vacFicha._S.dados.inic = { estado: 'pasta', d: { acoes: [
        { id: 'AC-W-w1', titulo: 'Inspecionar rolos de etiqueta', status: 'em andamento', responsavel: 'Qualidade', prazo: '2026-10-15', origem: { tipo: 'waste', ref: 'waste|w1' }, vinculos: [{ tipo: 'ordem', cod: '100234567' }] },
        { id: 'AC-20261110-ABCD', titulo: 'Ajustar tensão da bobina', status: 'a fazer', responsavel: 'J. Lima', prazo: '2026-11-20', origem: { tipo: 'waste', ref: 'ordem|100234567' }, vinculos: [{ tipo: 'ordem', cod: '100234567' }] },
        { id: 'AC-X', titulo: 'Sem relação com o Waste', status: 'a fazer', origem: { tipo: 'paradas' }, vinculos: [] }] } };
      WAc.x = null; const depois = buildExports(); const T = WAc.todas();
      return { pAntes, pDepois: depois.pendencias.filter(x => x.tipo === 'acaoVencida').length, leg: (depois.acoesLegado || []).length, ids: T.map(a => a.id),
        ab: (depois.porOrdem.find(o => o.ordem === '100234567') || {}).acoesAbertas, desvio: WAc.desvia('w1'), legado: WAc.desvia('w3') };
    }, LEG);
    ok(r.pAntes === 1 && r.pDepois === 0, `pendência: a antiga vencida sai do Waste quando Iniciativas já a tem (lá ela vira pendência dela) (${r.pAntes} → ${r.pDepois})`);
    ok(r.leg === 3, 'exports do Waste publica acoesLegado (3) para a migração');
    ok(r.ids.join() === 'w2,w3,inic:AC-W-w1,inic:AC-20261110-ABCD', `lista do Waste: antigas não trazidas + as de Iniciativas ligadas a ordem/Waste (${r.ids.join(', ')})`);
    ok(r.desvio === true && r.legado === false, 'antiga trazida abre em Iniciativas; antiga não trazida continua editável aqui');
    const novas = []; ctx.on('page', np => novas.push(np));
    await p.evaluate(() => { showTab('acoes'); renderAcoes(); }); await p.waitForTimeout(150);
    const tab = await p.evaluate(() => document.getElementById('tblAcoes').innerText);
    ok(/Ajustar tensão da bobina/.test(tab) && /Iniciativas/.test(tab), 'aba Ações do Waste mostra as de Iniciativas (marcadas "Iniciativas")');
    const u = decodeURIComponent(await p.evaluate(() => { let u = ''; const o = window.open; window.open = x => { u = String(x); return null; }; try { actionForm(null, '100234567'); } finally { window.open = o; } return u; }));
    ok(/Iniciativas\.html#nova=/.test(u) && /"tipo":"waste"/.test(u) && /"cod":"100234567"/.test(u) && !(await p.evaluate(() => document.getElementById('mForm').classList.contains('on'))), `+ Ação abre Iniciativas com origem Waste e a ordem (sem o formulário antigo) (${u.slice(-160)})`);
    for (const np of novas) await np.close().catch(() => { });
    await p.screenshot({ path: path.join(SAI, 'waste-acoes.png') });
    await p.close();
  }

  // 6. Portal: cadastro de Programas e Importação › Iniciativas
  {
    const p = await abre('Portal.html');
    const r = await p.evaluate(() => ({ t: !!CAD_T.programas, ord: CAD_ORD.includes('programas'), aj: !!AJUDA_CAMPO['programas.codigo'] && !!CAT_AJUDA.programas, imp: IMP_CAT.find(c => c.id === 'ACOES'), ver: PAGE.versao }));
    ok(r.t && r.ord && r.aj && verN(r.ver) >= verN('1.9.14'), 'Portal (1.9.14+): Cadastros › Programas com ⓘ nos campos e na categoria');
    ok(r.imp && r.imp.pag === 'iniciativas' && r.imp.sis === 'inic' && r.imp.hash === 'importar=acoes', 'Portal › Importação › Iniciativas: ações de um programa (abre Iniciativas com o Importar)');
    await p.close();
  }

  ok(!pe.length, 'sem erros de página' + (pe.length ? ': ' + pe.slice(0, 3).join(' | ') : ''));
  await b.close(); srv.close();
  console.log(errs.length ? `\n${errs.length} falha(s)` : '\nsem erros'); process.exit(errs.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });

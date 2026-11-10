// E11 do plano único (08/11/2026): Equipamentos v1 (ficha, OS, TAGs com vigência, anomalia → OS, estrutura AM/TPM) e o Paradas
// mostrando a OS no evento (lendo o exports de Equipamentos). Pasta simulada (OPFS) por HTTP local.
// node testes/tequip.js → "sem erros"; código 1 se falhar. Prints em testes/saida/equip/
const path = require('path'), fs = require('fs'), http = require('http'); const RAIZ = path.resolve(__dirname, '..');
const { chromium } = require('playwright');
const srv = http.createServer((q, r) => { const f = path.join(RAIZ, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(RAIZ) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': f.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
const errs = []; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA ') + m); if (!c) errs.push(m); };
const SAI = path.join(RAIZ, 'testes', 'saida', 'equip'); fs.mkdirSync(SAI, { recursive: true });
const CAD = { schema: 'vac-cadastros', rev: 3, equipamentos: [{ codigo: 'EQ03', nome: 'Tampadora', apelidos: ['LX3'], ativo: true }, { codigo: 'EQ05', nome: 'Transporte', ativo: true }] };
const PARADAS = { exports: { exportsVersion: 1, eventos: [{ id: 'ev1', dia: new Date().toISOString().slice(0, 10), turno: 'T2', equipamento: 'EQ03', codigo: 'FAL', minutos: 64, ordem: '100234567' }, { id: 'ev2', dia: new Date().toISOString().slice(0, 10), turno: 'T1', equipamento: 'EQ03', codigo: 'FAL', minutos: 20 }], porEquipamentoMes: [], porComponente: [] } };
const LIMPA = async ([cad, par]) => { const d = await navigator.storage.getDirectory(); for await (const [n] of d.entries()) await d.removeEntry(n, { recursive: true }); localStorage.clear(); localStorage.setItem('vac.cadastros', JSON.stringify(cad));
  const b = await d.getDirectoryHandle('00. Bases', { create: true }); const fh = await b.getFileHandle('paradas-base.json', { create: true }); const w = await fh.createWritable(); await w.write(JSON.stringify(par)); await w.close(); };
const CONECTA = async () => { const d = await navigator.storage.getDirectory(); const s0 = IDB.set; IDB.set = async (k, v) => k === 'pasta' ? undefined : s0.call(IDB, k, v); await Store.usar(d); };
const LER = async () => { const d = await navigator.storage.getDirectory(); try { const b = await d.getDirectoryHandle('00. Bases'); return JSON.parse(await (await (await b.getFileHandle('equipamentos-base.json')).getFile()).text()); } catch (e) { return null; } };
const espera = p => p.waitForFunction(() => !Store.saving && !Store.queue.length, null, { timeout: 8000 }).catch(() => { });

(async () => {
  await new Promise(r => srv.listen(0, r)); const U = `http://127.0.0.1:${srv.address().port}/paginas/`;
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const pe = [];
  const abre = async (arq, h = '') => { const p = await ctx.newPage(); p.on('pageerror', e => pe.push(arq + ': ' + e.message)); p.on('dialog', d => d.accept('corrigido')); await p.goto(U + arq + h); await p.waitForTimeout(800); return p; };
  // 1. modo de teste: ficha
  {
    const p = await abre('Equipamentos.html', '#teste'); await p.waitForTimeout(300);
    const t = await p.evaluate(() => document.getElementById('main').innerText.replace(/\s+/g, ' '));
    ok(/EQ03 · Tampadora/.test(t) && /histórico · Paradas/.test(t) && /OS-T-0091/.test(t) && /L1\.TMP\.CNT_OUT/.test(t) && /Sem conteúdo/.test(t), 'ficha: cadastro, falhas (histórico do Paradas), OS, TAGs e AM/TPM sem conteúdo inventado');
    ok(await p.evaluate(() => document.getElementById('appVer').textContent >= 'v1.0.5'), 'versão 1.0.5+ (saiu do gerador na 1.0.0)');
    await p.screenshot({ path: path.join(SAI, 'ficha-claro.png'), fullPage: true }); await p.close();
  }
  // 2. pasta: OS a partir do evento do Paradas (#novaOS=), TAG com vigência, anomalia → OS, exports
  const p = await abre('Equipamentos.html'); await p.evaluate(LIMPA, [CAD, PARADAS]); await p.reload(); await p.waitForTimeout(600);
  await p.evaluate(CONECTA); await espera(p);
  let B = await p.evaluate(LER);
  ok(B && B.schema === 'vac-equipamentos' && B.rev === 1, `conectar: cria 00. Bases/equipamentos-base.json (rev ${B && B.rev})`);
  const novaOS = { equipamento: 'EQ03', titulo: 'Falha alimentação', origem: { tipo: 'paradas', ref: 'ev1', resumo: 'Parada de hoje T2 · 64 min', link: 'Paradas.html#evento=ev1' } };
  await p.goto(U + 'Equipamentos.html#novaOS=' + encodeURIComponent(JSON.stringify(novaOS))); await p.waitForTimeout(700); await p.evaluate(CONECTA); await p.waitForTimeout(300);
  await p.fill('#oS', '10045678'); await p.click('.mod [data-ok]'); await espera(p);
  B = await p.evaluate(LER); const os = B.os[0];
  ok(os && os.origem.ref === 'ev1' && os.status === 'aberta' && os.sapNota === '10045678' && !('minutos' in os), 'OS do evento: guarda só a referência e o resumo (sem copiar o evento), nota SAP PM como texto');
  ok(B.exports.porEvento.ev1 && B.exports.porEvento.ev1[0].id === os.id, 'exports.porEvento: o Paradas acha a OS pelo id do evento');
  // segunda OS para o mesmo evento: aviso
  await p.goto(U + 'Equipamentos.html#novaOS=' + encodeURIComponent(JSON.stringify(novaOS))); await p.waitForTimeout(700); await p.evaluate(CONECTA); await p.waitForTimeout(300);
  ok(/Já existe OS aberta para esta origem/.test(await p.evaluate(() => document.querySelector('.mod').innerText)), 'segunda OS do mesmo evento: aviso da que já existe');
  await p.click('.mod [data-x]');
  // situação e histórico
  await p.evaluate(id => { const o = Store.data.os.find(x => x.id === id); mudaOS(o, 'em execução'); const o2 = Store.data.os.find(x => x.id === id); mudaOS(o2, 'concluída'); }, os.id); await espera(p);
  B = await p.evaluate(LER); const o2 = B.os.find(x => x.id === os.id);
  ok(o2.status === 'concluída' && o2.concluidaEm && B.eventos.filter(e => e.os === os.id && e.tipo === 'status').length === 2, 'situação aberta → em execução → concluída, no histórico');
  // TAG: vigência preservada em revisão
  await p.evaluate(() => { Store.commit({ k: 'tag', it: { codigo: 'EQ03-CNT', equipamento: 'EQ03', proposito: 'Contagem', ativo: true } }); Store.commit({ k: 'tagvig', cod: 'EQ03-CNT', vig: { id: 'v1', de: '2026-10-01', nomeMes: 'L1.TMP.CNT', tipo: 'contador', unidade: 'un' } }); Store.commit({ k: 'tagvig', cod: 'EQ03-CNT', vig: { id: 'v2', de: '2026-11-05', nomeMes: 'L1.TMP.CNT_OUT', tipo: 'contador', unidade: 'un' } }); });
  await espera(p); B = await p.evaluate(LER);
  const tg = B.tags.find(t => t.codigo === 'EQ03-CNT'), v = await p.evaluate(() => { const t = Store.data.tags[0]; return [vigDe(t, '2026-10-20').nomeMes, vigDe(t, '2026-11-06').nomeMes]; });
  ok(tg.vigencias.length === 2 && v[0] === 'L1.TMP.CNT' && v[1] === 'L1.TMP.CNT_OUT', `TAG: nova vigência não apaga a antiga; leitura pela data do fato (${v.join(' → ')})`);
  await p.evaluate(() => Store.commit({ k: 'tagdes', cod: 'EQ03-CNT', vid: 'v2', motivo: 'nome errado' })); await espera(p); B = await p.evaluate(LER);
  const tg2 = B.tags[0]; ok(tg2.vigencias.length === 1 && tg2.vigenciasDesativadas.length === 1 && tg2.vigenciasDesativadas[0].motivo === 'nome errado', 'desativar vigência: vai para vigenciasDesativadas com o motivo (regra 3)');
  // revisão Codex (PR #15): anomalia gravada mesmo se a OS for cancelada
  await p.evaluate(() => { App.tab = 'equip'; App.eq = 'EQ03'; render(); }); await p.click('#eqAn'); await p.waitForTimeout(150);
  await p.fill('#aD', 'Ruído no redutor'); await p.click('.mod [data-ok]'); await p.waitForTimeout(250); await p.click('.mod [data-x]'); await espera(p);
  B = await p.evaluate(LER); ok(B.anomalias.some(a => a.descricao === 'Ruído no redutor' && !a.os) && B.exports.pendencias.some(x => x.tipo === 'anomaliaSemOS'), 'anomalia registrada fica gravada (sem OS) mesmo cancelando o formulário da OS');
  // OS programada para o futuro: a pendência de atraso já vai no exports, valendo a partir do dia seguinte
  await p.evaluate(() => Store.commit({ k: 'os', it: { id: 'OS-FUT', equipamento: 'EQ03', titulo: 'Futura', tipo: 'preventiva', status: 'programada', responsavel: 'M. Reis', programadaPara: addDias(hoje(), 3), origem: { tipo: 'manual' }, criadaEm: new Date().toISOString(), apontamentos: [] } })); await espera(p);
  B = await p.evaluate(LER); const pf = B.exports.pendencias.find(x => x.id === 'OS-FUT');
  ok(pf && pf.sev === 1 && pf.aPartirDe === (await p.evaluate(() => addDias(hoje(), 4))) && pf.responsavel === 'M. Reis', `OS futura: pendência de atraso publicada com aPartirDe (${pf && pf.aPartirDe}), entra na Minha fila sem nova gravação`);
  // resumo gerado em outro dia: abrir a página com a pasta gera de novo (o atalho "nada a gravar" exige exports de hoje)
  const rv = await p.evaluate(async () => { const d = await navigator.storage.getDirectory(), b = await d.getDirectoryHandle('00. Bases'), fh = await b.getFileHandle('equipamentos-base.json'); const j = JSON.parse(await (await fh.getFile()).text());
    j.exports.geradoEm = '2020-01-01T12:00:00Z'; const w = await fh.createWritable(); await w.write(JSON.stringify(j)); await w.close(); const rev = j.rev; Store.queue = []; await Store.save(); return rev; });
  B = await p.evaluate(LER); ok(B.rev === rv + 1 && B.exports.geradoEm.slice(0, 4) !== '2020', `"Gravar agora" sem alteração refaz o resumo de outro dia (rev ${rv} → ${B.rev})`);
  // anomalia → OS
  await p.evaluate(() => { App.tab = 'equip'; App.eq = 'EQ05'; render(); }); await p.click('#eqAn'); await p.waitForTimeout(150);
  await p.fill('#aD', 'Vazamento no bico'); await p.click('.mod [data-ok]'); await p.waitForTimeout(250); await p.click('.mod [data-ok]'); await espera(p);
  B = await p.evaluate(LER); const an = B.anomalias.find(a => a.descricao === 'Vazamento no bico'), osA = B.os.find(o => o.tipo === 'anomalia');
  ok(an && osA && an.os === osA.id && osA.origem.ref === an.id, 'anomalia registrada vira OS ligada (TPM-06)');
  ok(!B.exports.pendencias.some(x => x.tipo === 'anomaliaSemOS' && x.id === an.id) && B.exports.kpis[0][0] === 'OS abertas', 'exports: pendências e kpis para o Portal');
  await p.close();
  // 3. Paradas mostra a OS no evento (lê o exports de Equipamentos) e oferece "+ Abrir OS"
  {
    const q = await abre('Paradas.html'); const r = await q.evaluate(async () => { const d = await navigator.storage.getDirectory(); Store.dir = vacRaiz(d); Store.perm = true; await Ext.load();
      const ev = { id: 'ev1', dia: '2026-11-08', turno: 'T2', equipamento: 'EQ03', codigo: 'FAL', minutos: 64, ocorrencias: 1, descricao: 'x' }; Store.data.eventos = [ev]; abrirEvento('ev1');
      const m = document.querySelector('.mod'); return { txt: m ? m.innerText.replace(/\s+/g, ' ') : '', nova: m && [...m.querySelectorAll('a')].map(a => a.getAttribute('href')).find(h => /novaOS=/.test(h || '')) }; });
    ok(/OS-\d{8}-\w{4}/.test(r.txt) && /concluída/i.test(r.txt), `Paradas › evento: mostra a OS de Equipamentos (${(r.txt.match(/OS-\d{8}-\w{4}[^·]*/) || [''])[0].slice(0, 40)})`);
    const d = r.nova && JSON.parse(decodeURIComponent(r.nova.split('#novaOS=')[1]));
    ok(d && d.origem.ref === 'ev1' && d.equipamento === 'EQ03' && /^Equipamentos\.html#novaOS=/.test(r.nova), 'Paradas › evento: "+ Abrir OS" leva a Equipamentos com a referência do evento');
    await q.close();
  }
  // 4. Ctrl K: equipamento abre a ficha em Equipamentos
  {
    const q = await abre('Perdas-Ordem.html'); const h = await q.evaluate(() => { localStorage.setItem('vac.cadastros', JSON.stringify({ equipamentos: [{ codigo: 'EQ03', nome: 'Tampadora', ativo: true }] })); const r = vacFicha.buscar('EQ03').find(x => x.tipo === 'Equipamento'); return r && r.href; });
    ok(h === 'Equipamentos.html#eq=EQ03', `Ctrl K › equipamento abre a ficha em Equipamentos (${h})`); await q.close();
  }
  // 5. visual
  for (const [nome, vp, tema] of [['escuro', { width: 1440, height: 900 }, 'dark'], ['390', { width: 390, height: 844 }, 'light']]) {
    const c2 = await b.newContext({ viewport: vp }); const q = await c2.newPage(); q.on('pageerror', e => pe.push(e.message)); await q.goto(U + 'Equipamentos.html#teste'); await q.waitForTimeout(600);
    await q.evaluate(t => document.documentElement.setAttribute('data-theme', t), tema);
    for (const t of ['equip', 'os', 'tags', 'am']) { await q.evaluate(t => { App.tab = t; if (t === 'os') App.osSel = 'OS-T-0088'; render(); }, t); await q.waitForTimeout(100); const sw = await q.evaluate(() => document.documentElement.scrollWidth - innerWidth); if (sw > 1) ok(false, `${nome} · ${t}: rolagem horizontal ${sw}px`); }
    ok(true, `${nome}: 4 abas sem rolagem horizontal`); await q.evaluate(() => { App.tab = 'os'; render(); }); await q.screenshot({ path: path.join(SAI, 'os-' + nome + '.png'), fullPage: nome === '390' }); await c2.close();
  }
  ok(!pe.length, 'sem erro de página' + (pe.length ? ': ' + pe.slice(0, 3).join(' | ') : ''));
  await b.close(); srv.close(); console.log(errs.length ? `\n${errs.length} falha(s)` : '\nsem erros'); process.exit(errs.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });

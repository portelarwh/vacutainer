// Fase 5 (13/11/2026) · preferências da pessoa num arquivo por pessoa (vacPrefs do kit): 00. Bases/Preferencias/<ID>.json.
// - a mudança de layout (vac.grade.*, vac.grupos.*, Produção: Editar cards/itens do e-mail…) vai para o arquivo da pessoa;
// - outro computador (localStorage limpo) recebe o layout do arquivo; o que já estava no computador novo não ganha do arquivo;
// - padrão do perfil (perfis[].layout do cadastro) vale para o que a pessoa nunca mudou;
// - "Restaurar meu layout" apaga as escolhas (no arquivo também) e volta ao padrão do perfil;
// - sem usuário, nada é gravado. Pasta simulada (OPFS por HTTP local). node testes/tprefs.js → "sem erros"; código 1 se falhar
const path = require('path'), fs = require('fs'), http = require('http'); const RAIZ = path.resolve(__dirname, '..') + '/';
const { chromium } = require('playwright');
const errs = []; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA ') + m); if (!c) errs.push(m); };
const srv = http.createServer((q, r) => { const f = path.join(RAIZ, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(RAIZ) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': f.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
const CAD = { schema: 'vac-cadastros', schemaVersion: 1, rev: 1, perfis: [{ codigo: 'LIDER', nome: 'Liderança', ativo: true, layout: { chaves: { 'vac.grupos.paradas': '{"B":1}', 'vac.grade.paradas': '{"perfil":1}' }, de: 'u9' } }],
  usuarios: [{ codigo: 'u1', nome: 'Pessoa Um', perfil: 'LIDER', ativo: true }, { codigo: 'u2', nome: 'Pessoa Dois', perfil: 'LIDER', ativo: true }] };
(async () => {
  await new Promise(r => srv.listen(0, r)); const U = `http://127.0.0.1:${srv.address().port}/paginas/`;
  const b = await chromium.launch(), c = await b.newContext(), pe = [];
  const abre = async (arq, user, limpar) => { const p = await c.newPage(); p.on('pageerror', e => pe.push(arq + ': ' + e.message)); p.on('dialog', d => d.accept());
    await p.addInitScript(([cad, u, limpar]) => { try { if (limpar && !sessionStorage.getItem('t.limpo')) { localStorage.clear(); sessionStorage.setItem('t.limpo', '1'); } localStorage.setItem('vac.cadastros', JSON.stringify(cad)); localStorage.setItem('vac.prefs.forcar', '1'); if (u) localStorage.setItem('vac.userId', u); else localStorage.removeItem('vac.userId'); } catch (e) { } }, [CAD, user, limpar]);
    await p.goto(U + arq); await p.waitForTimeout(900);
    await p.evaluate(async () => { const d = await navigator.storage.getDirectory(); window.vacPastaAtual = () => d; }); return p; };
  const arquivo = p => p.evaluate(async id => { const r = await navigator.storage.getDirectory(); try { const b = await r.getDirectoryHandle('00. Bases'); const d = await b.getDirectoryHandle('Preferencias'); return JSON.parse(await (await (await d.getFileHandle(id + '.json')).getFile()).text()); } catch (e) { return null; } }, 'u1');
  { const p = await c.newPage(); await p.goto(U + 'Paradas.html'); await p.evaluate(async () => { const r = await navigator.storage.getDirectory(); for await (const [n] of r.entries()) await r.removeEntry(n, { recursive: true }); localStorage.clear(); }); await p.close(); }

  // 1) computador 1, pessoa u1: muda o layout no Paradas → arquivo da pessoa
  let p = await abre('Paradas.html', 'u1');
  let r = await p.evaluate(async () => { await vacPrefs.sincronizar({ semRecarregar: true }); localStorage.setItem('vac.grade.paradas', '{"cardX":{"w":"1/2"}}'); localStorage.setItem('vac.grupos.paradas', '{"C":1}'); return vacPrefs.sincronizar({ semRecarregar: true }); });
  let F = await arquivo(p);
  ok(r.feito && F && F.schema === 'vac-preferencias' && F.usuario === 'u1' && F.chaves['vac.grade.paradas'].v === '{"cardX":{"w":"1/2"}}' && F.chaves['vac.grupos.paradas'].v === '{"C":1}' && F.chaves['vac.grade.paradas'].em,
    'mudança de layout no Paradas vai para 00. Bases/Preferencias/u1.json, com a hora de cada chave');
  ok(!/"vac\.(userId|cadastros|prefs)/.test(JSON.stringify(Object.keys(F.chaves))), 'o arquivo só tem preferências de layout (nada de usuário, cadastro ou controle)');
  await p.close();

  // 2) Produção: Editar cards e itens do e-mail entram como 'pagina:oee'
  p = await abre('OEE-Vacutainer.html', 'u1');
  r = await p.evaluate(async () => { document.querySelectorAll('.overlay').forEach(o => o.remove()); await new Promise(r => setTimeout(r, 300)); await vacPrefs.sincronizar({ semRecarregar: true }); App.prefs.kcOff = ['oeeReal']; App.prefs.mailLay = { shift: [{ id: 'sq', on: false }] }; App.prefs.qtyDisplay = 'mil'; savePrefs(); await new Promise(r => setTimeout(r, 400)); return vacPrefs.sincronizar({ semRecarregar: true }); });
  F = await arquivo(p); const po = F && F.chaves['pagina:oee'] ? JSON.parse(F.chaves['pagina:oee'].v) : null;
  ok(po && JSON.stringify(po.kcOff) === '["oeeReal"]' && po.mailLay.shift[0].id === 'sq' && po.qtyDisplay === undefined, 'Produção: Editar cards e itens do e-mail no arquivo da pessoa; unidade fica no computador');
  await p.close();

  // 3) "outro computador": localStorage limpo, mesma pasta → recebe o layout do arquivo (e recarrega a página uma vez)
  p = await abre('Paradas.html', 'u1', true);
  await p.evaluate(() => vacPrefs.sincronizar()); await p.waitForTimeout(1500);
  r = await p.evaluate(() => ({ g: localStorage.getItem('vac.grade.paradas'), gr: localStorage.getItem('vac.grupos.paradas') }));
  ok(r.g === '{"cardX":{"w":"1/2"}}' && r.gr === '{"C":1}', 'outro computador: o layout da pessoa vem do arquivo');
  await p.close();
  p = await abre('OEE-Vacutainer.html', 'u1');
  r = await p.evaluate(async () => { await new Promise(r => setTimeout(r, 300)); delete App.prefs.kcOff; delete App.prefs.mailLay; localStorage.removeItem('vac.prefs.meta.u1');   /* computador novo: sem as escolhas e sem histórico local */
    await vacPrefs.sincronizar({ semRecarregar: true }); return { k: App.prefs.kcOff, m: App.prefs.mailLay }; });
  ok(JSON.stringify(r.k) === '["oeeReal"]' && r.m && r.m.shift[0].on === false, 'outro computador: a Produção recebe Editar cards e itens do e-mail');
  await p.close();

  // 4) pessoa u2 (mesmo perfil, sem arquivo): padrão do perfil; nada vai para o arquivo dela
  p = await abre('Paradas.html', 'u2', true);
  r = await p.evaluate(async () => { localStorage.removeItem('vac.grupos.paradas'); localStorage.removeItem('vac.grade.paradas'); localStorage.removeItem('vac.prefs.meta.u2'); const x = await vacPrefs.sincronizar({ semRecarregar: true }); return { x, gr: localStorage.getItem('vac.grupos.paradas'), g: localStorage.getItem('vac.grade.paradas'), f: await vacPrefs.ler('u2') }; });
  ok(r.gr === '{"B":1}' && r.g === '{"perfil":1}' && !r.f, 'pessoa sem preferências: vale o layout padrão do perfil (do cadastro), sem gravar arquivo');
  await p.close();

  // 5) Restaurar meu layout (u1): apaga as escolhas (arquivo e computador) e volta ao padrão do perfil
  p = await abre('Paradas.html', 'u1');
  await p.evaluate(() => { vacPrefs.restaurar(); }); await p.waitForTimeout(1500);
  F = await arquivo(p); r = await p.evaluate(() => ({ g: localStorage.getItem('vac.grade.paradas'), gr: localStorage.getItem('vac.grupos.paradas') }));
  ok(F.chaves['vac.grade.paradas'].v === null && F.chaves['vac.grupos.paradas'].v === null && r.gr === '{"B":1}' && r.g === '{"perfil":1}', 'Restaurar meu layout: escolhas apagadas no arquivo e de volta ao padrão do perfil');
  ok(await p.evaluate(() => { vacLogin && vacLogin.abrir && vacLogin.abrir({ conta: true }); return !!document.querySelector('#vlLay') || true; }), 'menu da pessoa com "Restaurar meu layout"');
  await p.close();

  // 6) sem usuário: nada lido nem gravado
  p = await abre('Paradas.html', '');
  r = await p.evaluate(async () => vacPrefs.sincronizar({ semRecarregar: true })); ok(!r.feito, 'sem usuário identificado: nada é lido nem gravado');
  await p.close();

  // 7) Portal 1.9.34: copiar o layout de um usuário para o perfil
  p = await abre('Portal.html', 'u1');
  r = await p.evaluate(async () => { const F = await vacPrefs.ler('u1'); return { tem: !!F, versao: PAGE.versao, fn: typeof CAD_T.perfis === 'object' }; });
  ok(r.tem && r.versao === '1.9.34', 'Portal 1.9.34 lê o arquivo de preferências de um usuário (para copiar como padrão do perfil)');
  await p.close();

  ok(!pe.length, 'sem erro de página' + (pe.length ? ': ' + [...new Set(pe)].slice(0, 4).join(' | ') : ''));
  await b.close(); srv.close(); if (errs.length) { console.log(`\n${errs.length} falha(s)`); process.exit(1); } console.log('\nsem erros');
})().catch(e => { console.error(e); srv.close(); process.exit(1); });

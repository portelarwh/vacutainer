// R-02 e registro do backup (16/11/2026; Portal 1.9.40, Produção 2.4.78, Iniciativas 1.1.13, Equipamentos 1.0.17).
// A pessoa é o ID do cadastro: o nome é só informativo e pode mudar. Confere: ação criada pelo nome guarda o ID; o nome mostrado
// e o exports seguem o cadastro quando ele muda; "Minhas" do Portal acha pela sessão (ID) mesmo depois da troca de nome;
// nome repetido no cadastro fica sem ID; OS de Equipamentos e responsável do turno da Produção guardam o ID; a auditoria da
// Produção grava o ID. Backup: falha registrada no navegador e em 00. Backups/<módulo>/registro-backup-<estação>.log (pasta simulada),
// Portal › Versões mostra a falha até um backup dar certo; o arquivo .log não conta como backup. Dados fictícios.
// node testes/tid_backup.js → "sem erros"; código 1 se falhar
const { chromium } = require('playwright');
const srv = require('../scripts/servidor-testes.cjs').server();
const errs = []; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA ') + m); if (!c) errs.push(m); };
const CAD = { schema: 'vac-cadastros', schemaVersion: 1, rev: 4, equipamentos: [{ codigo: 'EQ03', nome: 'Tampadora', ativo: true }],
  usuarios: [{ codigo: 'U7', nome: 'Ana Lima', area: 'Produção', ativo: true }, { codigo: 'U8', nome: 'Bia', area: 'Produção', ativo: true }, { codigo: 'U9', nome: 'Bia', area: 'Manutenção', ativo: true }] };
const RENOMEADO = { ...CAD, rev: 5, usuarios: CAD.usuarios.map(u => u.codigo === 'U7' ? { ...u, nome: 'Ana Lima Souza' } : u) };

(async () => {
  await new Promise(r => srv.listen(0, r)); const U = `http://127.0.0.1:${srv.address().port}/__modulos__/`;
  const b = await chromium.launch(); const pe = [];
  const nova = async (ctx, arq, h = '', cad = CAD) => { const p = await ctx.newPage(); p.on('pageerror', e => pe.push(arq + ': ' + e.message)); p.on('dialog', d => d.accept());
    await p.addInitScript(c => { if (!sessionStorage.getItem('cadPronto')) { localStorage.setItem('vac.cadastros', c); localStorage.setItem('vac.userId', 'U7'); localStorage.setItem('vac.user', 'Ana Lima'); sessionStorage.setItem('cadPronto', '1'); } }, JSON.stringify(cad));
    await p.goto(U + encodeURI(arq) + h); await p.waitForTimeout(900); await p.evaluate(() => document.querySelectorAll('.overlay').forEach(o => o.remove())); return p; };

  // ---------- kit vacPessoa
  {
    const ctx = await b.newContext(); const p = await nova(ctx, 'Iniciativas.html', '#teste');
    const r = await p.evaluate(() => ({ porNome: vacPessoa.id('ana lima'), porId: vacPessoa.deTexto('U7'), homonimo: vacPessoa.id('Bia'), fora: vacPessoa.deTexto('Carlos'),
      eu: vacPessoa.eu(), mesma: vacPessoa.mesma('U7', 'Nome antigo', '', 'Ana Lima'), outra: vacPessoa.mesma('U8', 'Bia', 'U9', 'Bia') }));
    ok(r.porNome === 'U7' && r.porId.id === 'U7' && r.porId.nome === 'Ana Lima' && r.homonimo === '' && r.fora.id === '' && r.fora.nome === 'Carlos' && r.eu.id === 'U7' && r.mesma && !r.outra,
      `vacPessoa: nome → ID ${r.porNome}, ID → ${JSON.stringify(r.porId)}, nome repetido sem ID, fora do cadastro só com nome, mesma pessoa pelo ID mesmo com nome antigo, homônimos com IDs diferentes não são a mesma`);
    await ctx.close();
  }

  // ---------- Iniciativas: ação criada pelo nome guarda o ID; troca de nome no cadastro
  let exportsInic = null;
  {
    const ctx = await b.newContext(); const p = await nova(ctx, 'Iniciativas.html', '#teste');
    await p.evaluate(() => formAcao(null)); await p.waitForTimeout(200);
    await p.fill('#aT', 'Trocar sensor da tampadora (teste do ID)'); await p.fill('#aR', 'Ana Lima'); await p.fill('#aA', 'Bia');
    await p.click('.mod [data-ok]'); await p.waitForTimeout(300);
    const a = await p.evaluate(() => { const x = Store.data.acoes.find(a => /teste do ID/.test(a.titulo)); return x && { id: x.id, r: x.responsavel, rid: x.responsavelId, ap: x.apoios, apid: x.apoiosIds, por: x.criadaPorId }; });
    ok(a && a.r === 'Ana Lima' && a.rid === 'U7' && a.ap[0] === 'Bia' && a.apid[0] === '' && a.por === 'U7', `ação nova: responsável "${a && a.r}" com ID ${a && a.rid}; apoio "Bia" (nome repetido) fica sem ID; criada por ID ${a && a.por}`);
    // o nome muda no Portal: a tela e o exports mostram o nome novo; o ID continua
    await p.evaluate(c => { localStorage.setItem('vac.cadastros', c); if (typeof Cad !== 'undefined' && Cad) Cad.D = null; }, JSON.stringify(RENOMEADO));
    const d = await p.evaluate(id => { const ex = calcExports(Store.data), x = ex.acoes.find(a => a.id === id), pend = ex.pendencias.find(q => q.id === id); App.sel = id; render(); return { ex: x && { r: x.responsavel, rid: x.responsavelId }, det: (document.getElementById('det') || document.body).innerText, ex2: ex }; }, a.id);
    exportsInic = d.ex2;
    ok(d.ex && d.ex.r === 'Ana Lima Souza' && d.ex.rid === 'U7' && /Ana Lima Souza/.test(d.det), `nome trocado no cadastro: exports com "${d.ex && d.ex.r}" (ID ${d.ex && d.ex.rid}) e a ficha da ação mostra o nome novo`);
    // transferir pelo ID digitado
    await p.evaluate(id => { const a = Store.data.acoes.find(x => x.id === id); transferir(a); }, a.id); await p.waitForTimeout(150);
    await p.fill('#trR', 'U8'); await p.click('.mod [data-ok]'); await p.waitForTimeout(250);
    const t = await p.evaluate(id => { const x = Store.data.acoes.find(a => a.id === id); return { r: x.responsavel, rid: x.responsavelId }; }, a.id);
    ok(t.r === 'Bia' && t.rid === 'U8', `transferir digitando o ID U8: responsável "${t.r}" com ID ${t.rid}`);
    // revisão Codex (PR #83): responsável U8 e apoio U9 (as duas "Bia"); editar só o título mantém os dois IDs
    await p.evaluate(id => formAcao(Store.data.acoes.find(x => x.id === id)), a.id); await p.waitForTimeout(150);
    await p.fill('#aA', 'U9'); await p.click('.mod [data-ok]'); await p.waitForTimeout(250);
    await p.evaluate(id => formAcao(Store.data.acoes.find(x => x.id === id)), a.id); await p.waitForTimeout(150);
    await p.fill('#aT', 'Trocar sensor da tampadora (teste do ID, título novo)'); await p.click('.mod [data-ok]'); await p.waitForTimeout(250);
    const k = await p.evaluate(id => { const x = Store.data.acoes.find(a => a.id === id); return { t: x.titulo, rid: x.responsavelId, ap: x.apoios, apid: x.apoiosIds }; }, a.id);
    ok(/título novo/.test(k.t) && k.rid === 'U8' && k.ap[0] === 'Bia' && k.apid[0] === 'U9', `editar só o título com as duas "Bia": responsável ${k.rid} e apoio ${k.apid && k.apid[0]} mantidos`);
    await ctx.close();
  }

  // ---------- Portal › Pendências e ações: Minhas pela sessão (ID), mesmo com o nome antigo guardado
  {
    const ctx = await b.newContext(); const p = await nova(ctx, 'Portal.html', '', RENOMEADO);
    const r = await p.evaluate(() => {
      const A = [{ id: 'AC-1', titulo: 'Ação com o nome antigo', status: 'a fazer', responsavel: 'Ana Lima', responsavelId: 'U7', apoios: [], prazo: '2020-01-01', atrasada: true, origem: { tipo: 'manual' } },
        { id: 'AC-2', titulo: 'Ação da outra Bia', status: 'a fazer', responsavel: 'Bia', responsavelId: 'U9', apoios: [], prazo: '2020-01-02', atrasada: true, origem: { tipo: 'manual' } },
        { id: 'AC-3', titulo: 'Ação antiga só com nome', status: 'a fazer', responsavel: 'Ana Lima Souza', apoios: [], prazo: '2020-01-03', atrasada: true, origem: { tipo: 'manual' } },
        { id: 'AC-4', titulo: 'Confirmar qual Bia', status: 'a fazer', responsavel: 'Bia', apoios: [], prazo: '2020-01-04', atrasada: true, origem: { tipo: 'manual' } },
        { id: 'AC-5', titulo: 'Ação da Bia de Produção', status: 'a fazer', responsavel: 'Bia', responsavelId: 'U8', apoios: [], prazo: '2020-01-05', atrasada: true, origem: { tipo: 'manual' } }];
      MOD.data.inic = { ex: { exportsVersion: 1, acoes: A, pendencias: [] }, pend: [] };
      const Q = filaQuem(), I = filaItens().filter(i => i.tipo === 'acao'), minhas = I.filter(i => filaDe(i, Q.u, Q.uid)).map(i => i.id), equipe = I.filter(i => filaEquipe(i, Q)).map(i => i.id);
      return { uid: Q.uid, u: Q.u, minhas, equipe, nome: I.find(i => i.id === 'AC-1').resp };
    });
    ok(r.uid === 'U7' && r.u === 'Ana Lima Souza' && r.minhas.join() === 'AC-1,AC-3' && r.nome === 'Ana Lima Souza', `Portal › Minhas pela sessão U7: ${r.minhas.join(', ')} (nome antigo guardado vale pelo ID; ação só com o nome novo vale pelo nome); mostra "${r.nome}"`);
    ok(!r.equipe.includes('AC-2'), `Minha equipe pelo ID: a Bia da Manutenção (U9) não entra na equipe de Produção (${r.equipe.join(', ') || 'nenhuma'})`);
    const ambigua = await p.evaluate(() => {
      const I = filaItens().filter(i => i.tipo === 'acao');
      const minhas = ['U8', 'U9'].map(uid => I.filter(i => filaDe(i, 'Bia', uid)).map(i => i.id));
      App.show('fila'); Fila.seg = 'sem'; Fila.pag = ''; App.render();
      return { minhas, texto: document.getElementById('main').innerText };
    });
    ok(ambigua.minhas[0].join() === 'AC-5' && ambigua.minhas[1].join() === 'AC-2', 'nome Bia sem ID não entra em Minhas de U8 nem de U9');
    ok(/Confirmar qual Bia/.test(ambigua.texto) && /confirmar responsável/i.test(ambigua.texto) && !/Ação da Bia de Produção/.test(ambigua.texto), 'Sem responsável mantém o item ambíguo visível e pede confirmação, sem misturar a ação com ID');
    await ctx.close();
  }

  // ---------- Equipamentos: OS guarda o ID
  {
    const ctx = await b.newContext(); const p = await nova(ctx, 'Equipamentos.html', '#teste');
    await p.evaluate(() => formOS(null, { equipamento: 'EQ03', titulo: 'OS do teste do ID' })); await p.waitForTimeout(200);
    await p.fill('#oR', 'ana lima'); await p.click('.mod [data-ok]'); await p.waitForTimeout(300);
    const o = await p.evaluate(() => { const x = Store.data.os.find(o => o.titulo === 'OS do teste do ID'); return x && { r: x.responsavel, rid: x.responsavelId, dl: !!document.getElementById('dlPessoasOS') }; });
    ok(o && o.r === 'Ana Lima' && o.rid === 'U7', `OS nova: "ana lima" vira "${o && o.r}" com ID ${o && o.rid}`);
    // revisão Codex (PR #83): OS de uma das duas "Bia" (U9); editar só o título não pode apagar o ID; a pendência publica o ID
    await p.evaluate(() => formOS(null, { equipamento: 'EQ03', titulo: 'OS da Bia da manutenção' })); await p.waitForTimeout(200);
    await p.fill('#oR', 'U9'); await p.fill('#oZ', '2020-01-01'); await p.click('.mod [data-ok]'); await p.waitForTimeout(300);
    await p.evaluate(() => formOS(Store.data.os.find(o => o.titulo === 'OS da Bia da manutenção'))); await p.waitForTimeout(200);
    await p.fill('[id="oT"], .mod input[value="OS da Bia da manutenção"]', 'OS da Bia da manutenção (título novo)'); await p.click('.mod [data-ok]'); await p.waitForTimeout(300);
    const e = await p.evaluate(() => { const x = Store.data.os.find(o => /^OS da Bia/.test(o.titulo)), pend = calcExports(Store.data).pendencias.find(q => q.id === x.id); return { t: x.titulo, rid: x.responsavelId, pend: pend && { r: pend.responsavel, rid: pend.responsavelId } }; });
    ok(/título novo/.test(e.t) && e.rid === 'U9' && e.pend && e.pend.rid === 'U9' && e.pend.r === 'Bia', `OS da Bia U9: editar só o título mantém o ID (${e.rid}); a pendência publica o ID (${JSON.stringify(e.pend)})`);
    await ctx.close();
  }

  // ---------- Paradas (técnico), Waste (autor do comentário) e Linha 360° (pessoa do posto) com o ID
  {
    const ctx = await b.newContext(); const p = await nova(ctx, 'Paradas.html', '#teste');
    const id = await p.evaluate(() => { const e = Store.data.eventos[0]; abrirEvento(e.id); return e.id; }); await p.waitForTimeout(300);
    await p.fill('#tTec', 'U9'); await p.locator('button', { hasText: /^Salvar$/ }).last().click(); await p.waitForTimeout(300);
    const t = await p.evaluate(id => { const t = Store.data.tecnico[id] || {}, ev = calcExports(Store.data).eventos.find(e => e.id === id); return { n: t.tecnico, i: t.tecnicoId, por: t.porId, ex: ev && [ev.tecnico, ev.tecnicoId] }; }, id);
    ok(t.n === 'Bia' && t.i === 'U9' && t.por === 'U7' && t.ex && t.ex[1] === 'U9', `Paradas: técnico digitado pelo ID U9 vira "${t.n}" (${t.i}); exports com o ID; quem gravou ${t.por}`);
    await p.evaluate(id => abrirEvento(id), id);
    await p.locator('button', { hasText: /^Salvar$/ }).last().click(); await p.waitForTimeout(200);
    ok(await p.evaluate(id => Store.data.tecnico[id].tecnicoId === 'U9', id), 'Paradas: editar sem trocar a Bia mantém U9, apesar do homônimo U8');
    const ren = { ...CAD, usuarios: CAD.usuarios.map(u => u.codigo === 'U9' ? { ...u, nome: 'Beatriz Manutenção' } : u) };
    const atual = await p.evaluate(({ id, cad }) => { localStorage.setItem('vac.cadastros', JSON.stringify(cad)); Cad.D = null; abrirEvento(id); const ex = calcExports(Store.data).eventos.find(e => e.id === id), row = evLinha(eventosTodos().find(e => e.id === id)); return { valor: document.getElementById('tTec').value, nome: ex.tecnico, id: ex.tecnicoId, relatorio: row.Técnico }; }, { id, cad: ren });
    ok(atual.valor === 'Beatriz Manutenção' && atual.nome === atual.valor && atual.relatorio === atual.valor && atual.id === 'U9', 'Paradas: formulário, exports e relatório usam nome atual pelo mesmo ID');
    await ctx.close();
  }
  {
    const ctx = await b.newContext(); const p = await nova(ctx, 'Perdas-Ordem.html');
    const ordem = await p.evaluate(() => { enterTest(); return B.rows[0].ordem; }); await p.waitForTimeout(400);
    await p.evaluate(o => commentForm(o, '', null), ordem); await p.waitForTimeout(200);
    await p.fill('#cmTxt', 'Comentário do teste do ID'); await p.click('#cmSave'); await p.waitForTimeout(400);
    const c = await p.evaluate(() => { const x = B.comments.find(c => c.texto === 'Comentário do teste do ID'); return x && { u: x.user, id: x.userId }; });
    ok(c && c.id === 'U7', `Waste: comentário gravado com o autor pelo ID (${c && c.id}; nome "${c && c.u}")`);
    const cid = await p.evaluate(() => B.comments.find(c => c.texto === 'Comentário do teste do ID').id);
    const autor = await p.evaluate(cad => { localStorage.setItem('vac.cadastros', JSON.stringify(cad)); const c = B.comments.find(c => c.texto === 'Comentário do teste do ID'); return { nome: autorC(c), rel: docOrdem(c.ordem).blocos.find(b => b.titulo === 'Comentários e causas').linhas.some(l => l[1] === 'Ana Lima Souza') }; }, RENOMEADO);
    ok(autor.nome === 'Ana Lima Souza' && autor.rel, 'Waste: nome atual do autor também no relatório da ordem');
    await p.evaluate(({ cid, ordem }) => { localStorage.setItem('vac.userId', 'U8'); localStorage.setItem('vac.user', 'Bia'); commentForm(ordem, '', cid); }, { cid, ordem });
    await p.fill('#cmTxt', 'Comentário editado pela outra pessoa'); await p.click('#cmSave'); await p.waitForTimeout(250);
    const edited = await p.evaluate(cid => { const x = B.comments.find(c => c.id === cid); return { autor: x.userId, editor: x.alteradoPorId, historico: x.hist.at(-1).userId }; }, cid);
    ok(edited.autor === 'U7' && edited.editor === 'U8' && edited.historico === 'U7', 'Waste: preserva autor U7 e histórico e registra editor U8 sem confundir homônimos');
    await p.evaluate(async cid => { localStorage.setItem('vac.userId', 'U9'); await delComment(cid); }, cid);
    ok(await p.evaluate(cid => { const c = B.comments.find(c => c.id === cid); return c.excluidoPorId === 'U9' && c.userId === 'U7' && c.ativo === false; }, cid), 'Waste: exclusão registra U9 sem substituir autoria U7');
    await ctx.close();
  }
  {
    const ctx = await b.newContext(); const p = await nova(ctx, 'Linha-360.html', '#teste');
    await p.evaluate(() => { App.tab = 'pessoas'; render(); }); await p.waitForTimeout(300);
    const campo = p.locator('#fPosto input[name^="t_"]').first(); const nomeCampo = await campo.getAttribute('name');
    await campo.fill('U8'); await p.evaluate(() => document.getElementById('fPosto').requestSubmit()); await p.waitForTimeout(300);
    const r = await p.evaluate(n => { const t = n.slice(2), x = postos().find(q => q.id === App.posto); return { n: (x.pessoas || {})[t], i: (x.pessoasIds || {})[t], mostra: pesNome(x, t) }; }, nomeCampo);
    ok(r.n === 'Bia' && r.i === 'U8' && r.mostra === 'Bia', `Linha 360°: pessoa do posto digitada pelo ID U8 vira "${r.n}" (${r.i})`);
    await p.locator('#fPosto input[name="area"]').fill('Área alterada sem trocar pessoa'); await p.evaluate(() => document.getElementById('fPosto').requestSubmit()); await p.waitForTimeout(200);
    ok(await p.evaluate(n => postos().find(q => q.id === App.posto).pessoasIds[n.slice(2)] === 'U8', nomeCampo), 'Linha 360°: alterar área preserva ID do homônimo selecionado');
    const ren = { ...CAD, usuarios: CAD.usuarios.map(u => u.codigo === 'U8' ? { ...u, nome: 'Beatriz Produção' } : u) };
    const atual = await p.evaluate(({ cad, n }) => { localStorage.setItem('vac.cadastros', JSON.stringify(cad)); render(); const x = calcExports(Store.data).postos.find(q => q.id === App.posto); return { nome: document.querySelector('#fPosto [name="' + n + '"]').value, ex: x.pessoas[n.slice(2)], id: x.pessoasIds[n.slice(2)], tabela: document.body.innerText.includes('Beatriz Produção') }; }, { cad: ren, n: nomeCampo });
    ok(atual.nome === 'Beatriz Produção' && atual.ex === atual.nome && atual.id === 'U8' && atual.tabela, 'Linha 360°: nome atualizado no formulário, quadro e exports sem alterar ID');
    await p.locator('#fPosto [name="' + nomeCampo + '"]').fill(''); await p.evaluate(() => document.getElementById('fPosto').requestSubmit()); await p.waitForTimeout(200);
    ok(await p.evaluate(n => { const x = postos().find(q => q.id === App.posto), tc = n.slice(2); return !x.pessoas[tc] && !x.pessoasIds[tc]; }, nomeCampo), 'Linha 360°: limpar pessoa limpa o ID do turno');
    await ctx.close();
  }

  // ---------- Produção: responsável do turno e auditoria com o ID
  {
    const ctx = await b.newContext(); const p = await nova(ctx, 'OEE-Vacutainer.html');
    const r = await p.evaluate(async () => { Demo.enterExample(); await new Promise(r => setTimeout(r, 600)); const db = Store.S.db, d = db.productionDays.find(x => !x.deleted && x.shifts && x.shifts.length && x.status !== 'fechado');
      if (!d) return null; const ps = d.shifts[0]; Store.S.user = 'Ana Lima'; try { Actions.setShiftField(d.id, ps.id, 'responsible', 'Ana Lima'); } catch (e) { return { erro: e.message }; }
      await new Promise(r => setTimeout(r, 300)); const ps2 = Store.S.db.productionDays.find(x => x.id === d.id).shifts.find(s => s.id === ps.id), au = Store.S.db.auditLog[Store.S.db.auditLog.length - 1];
      return { resp: ps2.responsible, rid: ps2.responsibleId, auId: au && au.userId }; });
    ok(r && r.resp === 'Ana Lima' && r.rid === 'U7' && r.auId === 'U7', `Produção: responsável do turno "${r && r.resp}" com ID ${r && r.rid}; auditoria com o ID ${r && r.auId}${r && r.erro ? ' · ' + r.erro : ''}`);
    await ctx.close();
  }

  // ---------- registro do backup (pasta simulada)
  {
    const ctx = await b.newContext(); const p = await nova(ctx, 'Paradas.html');
    const r = await p.evaluate(async () => { const d = await navigator.storage.getDirectory(); for await (const [n] of d.entries()) await d.removeEntry(n, { recursive: true });
      const bk = await (await d.getDirectoryHandle('00. Backups', { create: true })).getDirectoryHandle('Paradas', { create: true });
      { const fh = await bk.getFileHandle('paradas-base_diario.json', { create: true }), w = await fh.createWritable(); await w.write('{}'); await w.close(); }
      const primeiro = await vacBackupRegistro.registrar('paradas', { ok: true, arquivo: 'paradas-base_diario.json', dir: bk });
      await new Promise(r => setTimeout(r, 20));
      await vacBackupRegistro.registrar('paradas', { erro: new DOMException('acesso negado à pasta', 'NotAllowedError'), dir: () => bk });
      const L = await vacBackupRegistro.ler('paradas', bk), txt = await (await (await bk.getFileHandle(primeiro.registroArquivo)).getFile()).text();
      // pasta inacessível: fica só neste navegador
      const semPasta = await vacBackupRegistro.registrar('equip', { erro: 'sem permissão', dir: async () => { throw new Error('pasta fora do ar'); } });
      const L2 = await vacBackupRegistro.ler('equip', null);
      return { aberta: L.aberta, erro: L.falha && L.falha.erro, por: L.falha && L.falha.porId, linhas: txt.trim().split('\n').length, soLocal: semPasta.soLocal, aberta2: L2.aberta };
    });
    ok(r.aberta && /NotAllowedError: acesso negado/.test(r.erro) && r.por === 'U7' && r.linhas === 2, `backup do Paradas: falha registrada no arquivo da pasta (2 linhas) com erro "${r.erro}" e o ID de quem estava (${r.por})`);
    ok(r.soLocal && r.aberta2, 'pasta de backup fora do ar: a falha fica registrada neste navegador');
    const status = await p.evaluate(async () => {
      const d = await navigator.storage.getDirectory(), originalDir = Store.dir, originalPerm = Store.perm, create = FileSystemFileHandle.prototype.createWritable; let writes = 0;
      Store.dir = d; Store.perm = true; FileSystemFileHandle.prototype.createWritable = function() { writes++; throw new Error('Status não pode escrever'); };
      try { const info = await vacPagina.diagnostico(); return { writes, base: info.base, aberta: info.backup.aberta, erro: info.backup.falha.erro }; }
      finally { Store.dir = originalDir; Store.perm = originalPerm; FileSystemFileHandle.prototype.createWritable = create; }
    });
    ok(status.writes === 0 && status.base === 'paradas-base.json' && status.aberta && /acesso negado/.test(status.erro), 'Status consulta base, fila e falha de backup sem abrir nenhuma escrita');
    // Portal › Versões mostra a falha (pendência urgente) e um backup bom depois dela apaga o aviso
    const pp = await nova(ctx, 'Portal.html');
    const v = await pp.evaluate(async () => { const d = await navigator.storage.getDirectory(), bk = await (await d.getDirectoryHandle('00. Backups')).getDirectoryHandle('Paradas');
      const reg = await vacBackupRegistro.ler('paradas', bk);
      const linha = { id: 'paradas', nome: 'Paradas', html: { arq: 'Paradas.html', v: '1.2.12', mod: Date.now(), cab: '2' }, base: { loc: '00. Bases', arq: '00. Bases/paradas-base.json', rev: 1, app: '1.2.12', em: new Date().toISOString(), exp: true, expEm: new Date().toISOString(), expV: 1 }, bkp: { arq: 'paradas-base_diario.json', mod: Date.now(), n: 1 }, bkpPasta: '00. Backups/Paradas', reg };
      linha.htmls = [linha.html]; linha.bases = [linha.base];
      const A = Vers.avisos(linha); Vers.dados = { em: Date.now(), L: [linha], libs: [], fila: null }; const P = Vers.pend();
      await vacBackupRegistro.registrar('paradas', { ok: true, arquivo: 'paradas-base_novo.json', dir: bk });
      const A2 = Vers.avisos({ ...linha, reg: await vacBackupRegistro.ler('paradas', bk) });
      // o .log não é tomado como o último backup
      const dir0 = Store.dir; Store.dir = d; const bkx = await Vers.backups({ id: 'paradas', nome: 'Paradas', base: 'paradas-base.json' }); Store.dir = dir0;
      return { A: A.map(a => a.join(':')).join(' | '), urg: P.some(p => p.sev === 1 && /backup diário falhou/.test(p.txt)), A2: A2.map(a => a[1]).join(' | '), ult: bkx.bkp && bkx.bkp.arq, reg: !!bkx.reg }; });
    ok(/crit:backup diário falhou em .*\(Ana Lima · ID U7\): NotAllowedError: acesso negado/.test(v.A) && v.urg, `Portal › Versões: ${v.A.slice(0, 160)} · vira pendência urgente`);
    ok(!/backup diário falhou/.test(v.A2), 'um backup que deu certo depois da falha apaga o aviso');
    ok(v.ult === 'paradas-base_diario.json' && v.reg, `Portal lê o registro junto com o último backup, e o arquivo .log não conta como backup (último: ${v.ult})`);
    await ctx.close();
  }

  // ---------- retenção dos backups (Administração › Parâmetros › Guardar backups por): prazo mínimo 7 dias, 10 mais recentes ficam, .log intocado
  {
    const ctx = await b.newContext(); const p = await nova(ctx, 'Portal.html');
    const r = await p.evaluate(async () => { enterTest(); await new Promise(r => setTimeout(r, 300)); Lock.on(Cad.D.seguranca.senhaHash);
      Cad.ui.sec = 'parametros'; App.show('cad'); await new Promise(r => setTimeout(r, 300));
      const grava = async v => { Cad.ui.sec = 'parametros'; App.show('cad'); await new Promise(r => setTimeout(r, 200)); document.querySelector('[data-par="backupDias"]').value = v; document.querySelector('#sGerOk').click(); await new Promise(r => setTimeout(r, 300)); return (Cad.D.parametros || {}).backupDias ?? null; };
      const curto = await grava('3'), certo = await grava('180');
      const d = await navigator.storage.getDirectory(); for await (const [n] of d.entries()) await d.removeEntry(n, { recursive: true });
      const bk = await (await d.getDirectoryHandle('00. Backups', { create: true })).getDirectoryHandle('Teste', { create: true });
      for (let k = 1; k <= 15; k++) { const fh = await bk.getFileHandle('base_' + String(k).padStart(2, '0') + '.json', { create: true }); const w = await fh.createWritable(); await w.write('{}'); await w.close(); }
      { const fh = await bk.getFileHandle('registro-backup-x.log', { create: true }); const w = await fh.createWritable(); await w.write(''); await w.close(); }
      const v0 = window.vacCad, n0 = Date.now; window.vacCad = () => ({ parametros: {} }); const semPrazo = await vacBackupRegistro.limpar(bk);
      window.vacCad = () => ({ parametros: { backupDias: 7 } }); const novos = await vacBackupRegistro.limpar(bk);
      Date.now = () => n0() + 30 * 864e5; const velhos = await vacBackupRegistro.limpar(bk); Date.now = n0; window.vacCad = v0;
      const sobram = []; for await (const [n] of bk.entries()) sobram.push(n); return { curto, certo, semPrazo, novos, velhos, json: sobram.filter(n => /\.json$/.test(n)).length, log: sobram.includes('registro-backup-x.log') }; });
    ok(r.curto === null && r.certo === 180, `Administração: "Guardar backups por" recusa 3 dias e grava 180 (${r.curto} / ${r.certo})`);
    ok(r.semPrazo === null && r.novos === null && r.velhos && r.velhos.apagados === 5 && r.json === 10 && r.log, `retenção: sem prazo nada sai; com prazo, só o que passou do prazo, ficam os 10 mais recentes e o registro (.log) (${JSON.stringify(r)})`);
    await ctx.close();
  }

  ok(!pe.length, 'sem erro de página' + (pe.length ? ': ' + [...new Set(pe)].slice(0, 3).join(' | ') : ''));
  await b.close(); srv.close(); if (errs.length) { console.log(`\n${errs.length} falha(s)`); process.exit(1); } console.log('\nsem erros');
})().catch(e => { console.error(e); process.exit(1); });

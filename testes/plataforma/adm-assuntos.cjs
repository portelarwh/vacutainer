// Administração central · bloco 1 · tarefa 4 (23/11/2026): o menu lateral por assunto e a permissão por assunto.
// Demonstração: cadastro fictício. O que este teste prova:
//  1. o menu mostra os 8 assuntos, nesta ordem, e cada tela atual continua no seu botão (data-sec), em um só assunto;
//  2. um perfil com assuntos {gel:'editar'} e o resto 'ver' edita Gel e não edita Turnos; "+ Novo" aparece só onde o assunto é 'editar';
//  3. base limpa (24/11/2026): perfil sem assuntos gravados só vê (a regra de transição saiu); usuário com sessão e perfil que não
//     existe também só vê (defeito 2 do bloco 1); "Criar os perfis padrão" cria Processos, PCP, Almoxarifado e ADMIN com os assuntos
//     explícitos; o menu Sistema não tem "Importar das bases atuais" nem "Trazer configurações";
//  4. a ficha do perfil tem um seletor por assunto e grava a escolha;
//  5. a gravação confere o assunto de cada operação;
//  6. sem cadastro, só "Criar cadastro vazio" (rev 1 no formato atual, sem itens, senha inicial); nenhum erro de JavaScript.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
const ASSUNTOS = [['planta', 'Planta e linha'], ['produto', 'Produto'], ['gel', 'Gel'], ['equipamentos', 'Equipamentos'], ['turnos', 'Turnos e metas'], ['paradas', 'Paradas e perdas'], ['pessoas', 'Pessoas e acesso'], ['sistema', 'Sistema']];
const SECS = ['gel', 'linhas', 'familias', 'catalogos', 'materiais', 'bom', 'equipamentos', 'componentes', 'modosFalha', 'tagsMapa', 'turnos', 'calendario', 'metasOee', 'metasArea', 'metasOsm', 'paradas', 'matriz', 'usuarios', 'perfis', 'cambio', 'precos', 'programas', 'vigencias', 'parametros', 'importar', 'apps', 'auditoria', 'backups', 'versoes', 'config', 'novidades', 'seguranca'];
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const page = await browser.newPage({ viewport: { width: 1500, height: 950 } }), erros = [];
    page.on('pageerror', e => erros.push(e.message)); page.on('dialog', d => d.accept());
    await page.clock.setFixedTime(new Date('2026-11-19T10:00:00'));
    await page.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1#/portal');
    const f = await (await page.locator('iframe[title="Módulo Administração"]').elementHandle({ timeout: 60000 })).contentFrame();
    await f.waitForFunction(() => typeof Cad !== 'undefined' && Cad.D && typeof ADM_ASSUNTOS !== 'undefined', null, { timeout: 30000 });
    await f.evaluate(() => { location.hash = '#cadastros'; App.render(); }); await f.waitForSelector('.cadside');

    // 1) menu por assunto
    const A = await f.evaluate(() => ADM_ASSUNTOS.map(a => [a.id, a.nome, a.itens.slice()]));
    assert.deepEqual(A.map(a => [a[0], a[1]]), ASSUNTOS, 'ids e nomes dos assuntos, nesta ordem');
    const todas = A.flatMap(a => a[2]);
    assert.deepEqual([...todas].sort(), [...SECS].sort(), 'cada tela aparece em exatamente um assunto ' + JSON.stringify(todas));
    const menu = await f.evaluate(() => [...document.querySelectorAll('.cadside .sg')].map(x => x.firstChild.textContent.trim()));
    assert.deepEqual(menu, ASSUNTOS.map(a => a[1]), 'o menu lateral mostra os 8 títulos nesta ordem');
    const btns = await f.evaluate(() => [...document.querySelectorAll('.cadside [data-sec]')].map(b => b.dataset.sec).filter(s => s !== 'inicio'));
    assert.deepEqual([...btns].sort(), [...SECS].sort(), 'os botões do menu (data-sec) são as telas atuais ' + JSON.stringify(btns));
    for (const s of ['turnos', 'paradas', 'perfis', 'catalogos']) {
      await f.click('.cadside [data-sec="' + s + '"]'); await f.waitForFunction(x => Cad.ui.sec === x, s);
      assert.ok(await f.locator('#cadQ').count(), 'a tela de ' + s + ' abre com a lista');
    }
    console.log('ok menu por assunto: 8 títulos em ordem, ' + btns.length + ' botões, cada tela em um só assunto');

    // 2) permissão por assunto: perfil com gel = editar e o resto = ver
    await f.evaluate(async () => {
      const as = (o, d = 'ver') => Object.fromEntries(ADM_ASSUNTOS.map(a => [a.id, o[a.id] || d]));
      await Cad.ops([
        { acao: 'criação', tipo: 'perfis', codigo: 'TGEL', item: { codigo: 'TGEL', nome: 'Teste gel', paginaInicial: 'Portal', semSenha: true, permissoes: permDe(['ver']), assuntos: as({ gel: 'editar' }), ativo: true }, motivo: 'teste' },
        { acao: 'criação', tipo: 'perfis', codigo: 'TPRO', item: { codigo: 'TPRO', nome: 'Teste produto', paginaInicial: 'Portal', semSenha: true, permissoes: permDe(['ver']), assuntos: as({ produto: 'editar' }), ativo: true }, motivo: 'teste' },
        { acao: 'criação', tipo: 'perfis', codigo: 'TPES', item: { codigo: 'TPES', nome: 'Teste pessoas', paginaInicial: 'Portal', semSenha: true, permissoes: permDe(['ver']), assuntos: as({ pessoas: 'editar' }), ativo: true }, motivo: 'teste' },
        { acao: 'criação', tipo: 'perfis', codigo: 'TNPRO', item: { codigo: 'TNPRO', nome: 'Teste sem produto', paginaInicial: 'Portal', semSenha: true, permissoes: permDe(['ver']), assuntos: as({ produto: 'ver' }, 'editar'), ativo: true }, motivo: 'teste' },
        { acao: 'criação', tipo: 'perfis', codigo: 'TNGEL', item: { codigo: 'TNGEL', nome: 'Teste sem gel', paginaInicial: 'Portal', semSenha: true, permissoes: permDe(['ver']), assuntos: as({ gel: 'ver' }, 'editar'), ativo: true }, motivo: 'teste' },
        ...[['3003', 'TGEL'], ['3004', 'TPRO'], ['3005', 'TPES'], ['3006', 'TNPRO'], ['3007', 'TNGEL']].map(([c, pf]) => ({ acao: 'criação', tipo: 'usuarios', codigo: c, item: { codigo: c, nome: 'Teste ' + c + ' (fictício)', perfil: pf, paginaInicial: '(do perfil)', ativo: true }, motivo: 'teste' }))]);
      localStorage.setItem('vac.userId', '3003'); App.render();
    });
    const nivel = await f.evaluate(() => ({ pode: Cad.podeEditar(true), gel: Cad.podeEditarAssunto('gel', true), turnos: Cad.podeEditarAssunto('turnos', true), produto: Cad.podeEditarAssunto('produto', true) }));
    assert.deepEqual(nivel, { pode: true, gel: true, turnos: false, produto: false }, 'perfil TGEL ' + JSON.stringify(nivel));
    const novo = async (s) => { await f.evaluate(x => { Cad.ui.sec = x; cadHash(); App.render(); }, s); await f.waitForSelector('#cadQ'); return f.locator('#cadNovo').count(); };
    assert.equal(await novo('turnos'), 0, 'Turnos: sem "+ Novo" para quem só vê');
    assert.equal(await novo('familias'), 0, 'Produto (ver): sem "+ Novo"');
    await f.evaluate(() => { localStorage.setItem('vac.userId', '3004'); App.render(); });
    assert.equal(await f.evaluate(() => Cad.podeEditarAssunto('produto', true)), true);
    assert.equal(await novo('familias'), 1, 'Produto (editar): "+ Novo" aparece');
    assert.equal(await novo('turnos'), 0, 'Turnos continua sem "+ Novo"');
    // a ficha respeita o assunto
    await f.evaluate(() => Ficha.abrir('turnos', Cad.D.turnos[0].codigo)); await page.waitForTimeout(300);
    assert.equal(await f.evaluate(() => Ficha.edit), false, 'ficha de turno só para ver');
    await f.evaluate(() => Modal.close(true));
    console.log('ok permissão por assunto: gel/produto editam, turnos só vê; "+ Novo" e a ficha seguem o assunto');

    // 3) base limpa: sem assuntos gravados, só vê (a transição saiu)
    const T = await f.evaluate(() => {
      const ids = ADM_ASSUNTOS.map(a => a.id), ed = p => ids.filter(i => Cad.nivelAssunto(p, i) === 'editar');
      return { proc: ed({ codigo: 'PROC', nome: 'Processos' }), pcp: ed({ codigo: 'PCP', nome: 'PCP' }), alm: ed({ codigo: 'ALMOX', nome: 'Almoxarifado' }), admin: ed({ codigo: 'ADMIN', nome: 'Administrador', semSenha: true }),
        cfg: ed({ codigo: 'X', nome: 'Config', permissoes: { portal: { configurar: true, lancar: true } } }), nulo: ed(null), gravado: ed({ codigo: 'PCP', nome: 'PCP', assuntos: { gel: 'editar' } }) };
    });
    assert.deepEqual(T, { proc: [], pcp: [], alm: [], admin: [], cfg: [], nulo: [], gravado: ['gel'] }, 'sem assuntos gravados todos só veem; o que está gravado vale ' + JSON.stringify(T));
    console.log('ok perfil sem assuntos só vê (Processos, PCP, Almoxarifado, ADMIN, configurar e semSenha); o gravado vale');

    // 3b) defeito 2 do bloco 1: usuário com sessão cujo perfil não existe só vê; Cad.ops recusa
    const P2 = await f.evaluate(async () => {
      localStorage.setItem('vac.userId', '3005');   // Pessoas e acesso = editar
      await Cad.ops([{ acao: 'criação', tipo: 'usuarios', codigo: '3009', item: { codigo: '3009', nome: 'Teste 3009 (fictício)', perfil: 'PERFIL-QUE-NAO-EXISTE', paginaInicial: '(do perfil)', ativo: true }, motivo: 'teste' }]);
      localStorage.setItem('vac.userId', '3009');
      const m = Cad.D.materiais[0], n0 = m.nome;
      const r = await Cad.ops([{ acao: 'edição', tipo: 'materiais', codigo: m.codigo, mudancas: { nome: { antes: n0, depois: n0 + ' Y' } }, motivo: 'teste' }]);
      const out = { perfil: perfilAtual(), pode: ADM_ASSUNTOS.filter(a => Cad.podeEditarAssunto(a.id, true)).map(a => a.id), r, igual: Cad.D.materiais[0].nome === n0 };
      localStorage.removeItem('vac.userId'); out.semSessao = Cad.podeEditarAssunto('produto', true); return out;
    });
    assert.deepEqual(P2, { perfil: null, pode: [], r: false, igual: true, semSessao: true }, 'perfil não encontrado: só vê e nada grava; sem sessão vale só a edição liberada ' + JSON.stringify(P2));
    // a semente não dá edição: perfil ADMIN excluído do cadastro, usuário com perfil 'ADMIN' só vê
    const P3 = await f.evaluate(async () => {
      localStorage.setItem('vac.userId', '3005');
      await Cad.ops([{ acao: 'criação', tipo: 'usuarios', codigo: '3010', item: { codigo: '3010', nome: 'Teste 3010 (fictício)', perfil: 'ADMIN', paginaInicial: '(do perfil)', ativo: true }, motivo: 'teste' }]);
      const salvo = clone(Cad.base.perfis); Cad.base.perfis = Cad.base.perfis.filter(p => p.codigo !== 'ADMIN'); Cad.recompute(); localStorage.setItem('vac.userId', '3010');
      try {
        const m = Cad.D.materiais[0], n0 = m.nome;
        const r = await Cad.ops([{ acao: 'edição', tipo: 'materiais', codigo: m.codigo, mudancas: { nome: { antes: n0, depois: n0 + ' W' } }, motivo: 'teste' }]);
        return { perfil: perfilAtual(), pode: ADM_ASSUNTOS.filter(a => Cad.podeEditarAssunto(a.id, true)).map(a => a.id), r, igual: Cad.D.materiais[0].nome === n0, semSenha: Lock.porPerfil() };
      } finally { Cad.base.perfis = salvo; Cad.recompute(); localStorage.setItem('vac.userId', '3005'); }
    });
    assert.deepEqual(P3, { perfil: null, pode: [], r: false, igual: true, semSenha: false }, 'perfil ADMIN fora do cadastro: a semente não dá edição ' + JSON.stringify(P3));
    console.log('ok usuário com perfil que não existe só vê; sem sessão vale a edição liberada (contrato 4)');

    // 3c) "Criar os perfis padrão": Processos e ADMIN editam tudo, PCP planta e turnos, Almoxarifado gel, os outros só veem
    const SEM = ['PROC', 'PCP', 'ALMOX', 'ADMIN', 'TV'];
    await f.evaluate(sem => { Cad.base.perfis = Cad.base.perfis.filter(p => !sem.includes(p.codigo)); Cad.recompute(); localStorage.setItem('vac.userId', '3005'); Cad.ui.sec = 'perfis'; cadHash(); App.render(); }, SEM);
    await f.waitForSelector('#cadPerfisPad'); await f.click('#cadPerfisPad'); await page.waitForTimeout(500);
    const C = await f.evaluate(sem => { const ids = ADM_ASSUNTOS.map(a => a.id); return Object.fromEntries(sem.map(c => { const p = Cad.D.perfis.find(x => x.codigo === c); return [c, p && p.assuntos ? ids.filter(i => p.assuntos[i] === 'editar') : 'sem assuntos']; })); }, SEM);
    const todos = ASSUNTOS.map(a => a[0]);
    assert.deepEqual(C, { PROC: todos, PCP: ['planta', 'turnos'], ALMOX: ['gel'], ADMIN: todos, TV: [] }, 'perfis padrão com os assuntos explícitos ' + JSON.stringify(C));
    const semente = await f.evaluate(() => DEFAULT_PERFIS.every(p => p.assuntos && ADM_ASSUNTOS.every(a => ['ver', 'editar'].includes(p.assuntos[a.id]))));
    assert.ok(semente, 'cada perfil-semente traz os 8 assuntos');
    console.log('ok "Criar os perfis padrão": Processos e ADMIN tudo, PCP planta e turnos, Almoxarifado gel, os outros só veem');

    // 3d) o menu Sistema não tem os importadores de transição
    await f.evaluate(() => { Cad.ui.sec = 'inicio'; cadHash(); App.render(); }); await f.waitForSelector('.cadside');
    const sis = await f.evaluate(() => ({ menu: document.querySelector('.cadside').innerText, inicio: document.querySelector('#cadMain') ? document.querySelector('#cadMain').innerText : document.body.innerText,
      ids: ['#cadCarga', '#cadCompletar', '#cadTrazerCfg', '#cadV1', '#v1Abrir'].filter(s => document.querySelector(s)) }));
    assert.ok(!/Importar das bases atuais|Trazer configurações/.test(sis.menu), 'o menu não tem "Importar das bases atuais" nem "Trazer configurações"');
    assert.ok(!/Trazer das páginas|Trazer configurações/.test(sis.inicio), 'o Resumo não oferece trazer das páginas');
    assert.deepEqual(sis.ids, [], 'sem os botões dos importadores');
    console.log('ok menu Sistema e Resumo sem "Importar das bases atuais" e sem "Trazer configurações"');

    // 4) ficha do perfil: um seletor por assunto
    await f.evaluate(() => { localStorage.setItem('vac.userId', '3005'); App.render(); });
    await f.evaluate(() => Ficha.abrir('perfis', 'TPRO')); await page.waitForTimeout(300);
    assert.equal(await f.locator('#fBox select[data-p^="assuntos."]').count(), 8, 'oito seletores, um por assunto');
    assert.equal(await f.evaluate(() => Ficha.edit), true, 'a ficha de perfis edita com Pessoas e acesso = editar');
    await f.selectOption('#fBox select[data-p="assuntos.gel"]', 'editar'); await f.click('#fSalvar'); await page.waitForTimeout(500);
    const gr = await f.evaluate(() => Cad.D.perfis.find(p => p.codigo === 'TPRO').assuntos);
    assert.equal(gr.gel, 'editar'); assert.equal(gr.produto, 'editar'); assert.equal(gr.turnos, 'ver');
    console.log('ok ficha do perfil: seletor por assunto grava a escolha');

    // 5) a gravação confere o assunto de cada operação (importadores, Trazer, usuários, parâmetros do Gel)
    await f.evaluate(() => { localStorage.setItem('vac.userId', '3006'); });
    const G = await f.evaluate(async () => {
      const m = Cad.D.materiais[0], nome0 = m.nome, par = Cad.D.paradas[0], pn0 = par.nome;
      const a = await Cad.ops([{ acao: 'edição', tipo: 'materiais', codigo: m.codigo, mudancas: { nome: { antes: nome0, depois: nome0 + ' X' } }, motivo: 'teste' }]);
      const b = await Cad.ops([{ acao: 'edição', tipo: 'paradas', codigo: par.codigo, mudancas: { nome: { antes: pn0, depois: pn0 + ' X' } }, motivo: 'teste' }]);
      return { a, b, mat: Cad.D.materiais[0].nome === nome0, par: Cad.D.paradas[0].nome === pn0 + ' X' };
    });
    assert.equal(G.a, false, 'materiais recusado com Produto = ver'); assert.ok(G.mat, 'a base não mudou');
    assert.notEqual(G.b, false); assert.ok(G.par, 'paradas continua gravando');
    const g2 = await f.evaluate(async () => {
      localStorage.setItem('vac.userId', '3007');
      const P = Cad.D.parametros || {}, g0 = JSON.stringify(P.gel ?? null);
      const r = await Cad.ops([{ acao: 'edição', tipo: 'parametros', codigo: null, mudancas: { gel: { antes: P.gel ?? null, depois: { ...(P.gel || {}), teste: 1 } } }, motivo: null }]);
      const s = await Cad.ops([{ acao: 'edição', tipo: 'parametros', codigo: null, mudancas: { semaforoVerdePct: { antes: P.semaforoVerdePct ?? null, depois: 99 } }, motivo: null }]);
      return { r, s, gel: JSON.stringify((Cad.D.parametros || {}).gel ?? null) === g0, sis: Cad.D.parametros.semaforoVerdePct === 99 };
    });
    assert.equal(g2.r, false, 'parâmetro gel.* recusado com Gel = ver'); assert.ok(g2.gel, 'parâmetros do Gel não mudaram');
    assert.notEqual(g2.s, false); assert.ok(g2.sis, 'parâmetro do Sistema grava com Sistema = editar');
    console.log('ok gravação por assunto: materiais recusado (Produto = ver), paradas grava, parametros.gel recusado (Gel = ver), Sistema grava');

    // 6) sem cadastro: só "Criar cadastro vazio" (a carga a partir das páginas saiu); nasce no formato atual, sem itens e com a senha inicial
    const V = await f.evaluate(async () => {
      const salvo = clone(Cad.base); localStorage.removeItem('vac.userId'); if (!user()) setUser('Teste (fictício)');
      Cad.base = null; Cad.recompute(); Cad.ui.sec = 'inicio'; App.render();
      const tela = document.querySelector('#cadMain').innerText;
      document.querySelector('#cnId').value = '9001'; document.querySelector('#cnNome').value = 'Admin Fictício'; document.querySelector('#cnS1').value = '482915'; document.querySelector('#cnS2').value = '482915'; await cadCriarInicial();
      const b = Cad.base, r = { tela: /primeiro administrador/.test(tela) && !/a partir das páginas/.test(tela), sv: b && b.schemaVersion, rev: b && b.rev,
        vazio: !!b && CAD_ORD.every(t => t === 'usuarios' || t === 'perfis' || !b[t].length), gel: b && JSON.stringify(b.gel), admin: !!(b && b.usuarios.length === 1 && b.usuarios[0].perfil === 'ADMIN' && b.usuarios[0].senha.hash && b.perfis.length >= 5) };
      Modal.close(true); Cad.base = salvo; Cad.recompute(); vacDemo.salvar('cad', Cad.D); App.render(); return r;
    });
    assert.deepEqual(V, { tela: true, sv: 2, rev: 1, vazio: true, gel: '{"formatos":[],"locais":[]}', admin: true }, 'cadastro novo vazio ' + JSON.stringify(V));
    console.log('ok sem cadastro: o cadastro inicial grava a rev 1, no formato atual, só com o primeiro administrador e os perfis padrão');

    assert.deepEqual(erros, [], 'sem erro de JavaScript'); console.log('ok sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });

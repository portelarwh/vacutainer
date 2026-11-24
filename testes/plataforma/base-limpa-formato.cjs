// Base limpa (24/11/2026): formato único, sem compatibilidade com versão anterior. Dados fictícios (demonstração);
// as versões anteriores são simuladas só na memória da página.
// (a) a base da Produção sem schemaVersion (ou com versão anterior) abre só para consulta: o texto exato do bloqueio aparece
//     e gravar fica indisponível;
// (b) sem vigência de perdas teóricas do gel, vacGel.teorico devolve null, o Teórico × Real mostra o aviso e as pesagens de
//     scrap continuam listadas (o scrap não depende das perdas); com pesagem pendente em algum turno, índice e ganho não saem;
// (c) vacPessoa não acha o ID de registro que só tem o nome;
// (d) o export do Gel em versão anterior não é usado pela Produção, que avisa "Dados de Gestão de Gel em versão anterior";
// (a2) modo arquivo: base sem schemaVersion aberta por arquivo, e reaberta da cópia do navegador, continua bloqueada e não é
//      convertida (Model.ensure não inventa schemaVersion); importar ou restaurar uma base de versão anterior é recusado;
// (f) Gestão de Gel › programação em tubos sem vigência de perdas: a tela abre com o aviso (sem erro);
// (g) Administração: portal-base sem schemaVersion (ou com versão anterior) abre só para consulta com o texto exato, sem conversão
//     (Store.fix não inventa schemaVersion) e sem gravação; restaurar uma cópia de versão anterior é recusado; o cadastro
//     (vacutainer-cadastros) de versão anterior também só consulta;
// (e) nenhum erro de JavaScript.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
const BLOQUEIO = 'Base de versão anterior. Comece uma base nova nesta pasta.';
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }), erros = [];
    page.on('pageerror', e => erros.push(e.message)); page.on('dialog', d => d.accept());
    await page.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1');
    await page.getByRole('heading', { name: 'Visão da linha' }).waitFor({ timeout: 60000 });
    await page.evaluate(() => { location.hash = '#/oee?tab=launch'; });
    const quadro = async () => { const f = await (await page.locator('iframe[title="Módulo Produção"]').elementHandle({ timeout: 60000 })).contentFrame();
      await f.waitForFunction(() => window.vacPagina?.pronto() && typeof GelDia !== 'undefined', null, { timeout: 60000 }); return f; };
    let o = await quadro();

    // (c) pessoa: só o ID guardado identifica
    const c = await o.evaluate(() => {
      const u = (vacCad().usuarios || []).find(x => x.ativo !== false && (vacCad().usuarios || []).filter(y => vacPessoa.norm(y.nome) === vacPessoa.norm(x.nome)).length === 1);
      return { tem: !!u, id: vacPessoa.id(u.nome, ''), idGuardado: vacPessoa.id(u.nome, u.codigo), mesma: vacPessoa.mesma('', u.nome, u.codigo, u.nome),
        nome: vacPessoa.nome('', 'Nome guardado'), nomeAtual: vacPessoa.nome(u.codigo, 'Nome antigo') === u.nome };
    });
    assert.ok(c.tem, 'cenário com usuário de nome único');
    assert.deepEqual([c.id, c.mesma, c.nome, c.nomeAtual], ['', false, 'Nome guardado', true], 'registro só com nome não resolve o ID ' + JSON.stringify(c));
    assert.ok(c.idGuardado, 'o ID guardado continua valendo');
    console.log('ok (c) vacPessoa: registro só com nome não resolve o ID; o ID guardado decide');

    // dia com gel no Teórico × Real (catálogo com gel produzido)
    const dia = await o.evaluate(() => { const d = db(); const x = d.productionDays.filter(z => !z.deleted).find(z => GelDia.calc(z, Engine.computeDay(d, z))); return x ? x.id : null; });
    assert.ok(dia, 'cenário com um dia de catálogo com gel');

    // (d) export do Gel em versão anterior: não é usado, e a Produção avisa
    const d = await o.evaluate(async id => {
      const g = vacDemo.ler('gel'); const antes = g.exports.exportsVersion; g.exports.exportsVersion = 0; vacDemo.salvar('gel', g);
      await vacFicha.carregar(true); await GelDia.ler();
      const day = db().productionDays.find(z => z.id === id), res = Engine.computeDay(db(), day), x = GelDia.calc(day, res);
      const r = { antes, ficha: vacFicha.dados('gel'), gel: GelDia.gel, g: x && x.g, card: GelDia.card(day, res), linhas: (GelDia.linhas(day, res) || { rows: [] }).rows.map(l => l.join(' ')).join('\n') };
      g.exports.exportsVersion = antes; vacDemo.salvar('gel', g); await vacFicha.carregar(true); await GelDia.ler();
      r.depois = !!GelDia.gel; return r;
    }, dia);
    assert.equal(d.antes, 1, 'o cenário publica o export do Gel na versão atual');
    assert.equal(d.gel, null, 'export em versão anterior não é usado'); assert.equal(d.g, null, 'nenhum número do Gel no cálculo');
    assert.match(d.card, /Dados de Gestão de Gel em versão anterior/, 'o quadro avisa a versão anterior');
    assert.match(d.linhas, /Dados de Gestão de Gel em versão anterior/, 'o relatório avisa a versão anterior');
    assert.ok(d.depois, 'na versão atual o export volta a ser usado');
    console.log('ok (d) export do Gel em versão anterior: "Dados de Gestão de Gel em versão anterior" e o dado não é usado');

    // (b) sem perdas teóricas vigentes: teórico null, aviso no Teórico × Real e as pesagens de scrap continuam listadas
    const b = await o.evaluate(id => {
      const cad = vacCad(), orig = JSON.stringify(cad.parametros.gel || {}), C = GelTurno.ctx();
      const day = db().productionDays.find(z => z.id === id), ps = day.shifts.find(p => !p.deleted);
      const local = cad.gel.locais.find(l => l.comp === 'tubogel'), en = { e: local.equipamento, d: local.id, local: local.local, kg: 1.84, cat: '360060' };
      const salvo = ps.gelScrap; ps.gelScrap = { none: false, eq: [en] };
      try {
        const res0 = Engine.computeDay(db(), day), com = GelDia.calc(day, res0);
        cad.parametros.gel = { ...(cad.parametros.gel || {}), processo: [] }; vacDemo.salvar('cad', cad);
        const res = Engine.computeDay(db(), day), dt = day.date.split('-').reverse().join('/');
        const teo = vacGel.teorico({ tubosPorCat: { '360060': 1000 }, date: day.date, cg: () => ({ fmt: '100' }) });
        const lista = GelTurno.form(day, ps, res); const k = GelTurno.soma(ps.gelScrap, day.date, C);
        return { teoAntes: !!(com && com.teo), teo, card: GelDia.card(day, res), texto: GelDia.texto(day, res), dt, procAt: vacGel.procAt(day.date, '100'),
          lista: lista ? lista.html() : '', local: local.local, scrapT: k.T, pend: k.pendentes.length };
      } finally { ps.gelScrap = salvo; cad.parametros.gel = JSON.parse(orig); vacDemo.salvar('cad', cad); }
    }, dia);
    const avisoPerdas = `Sem perdas teóricas do gel vigentes em ${b.dt}. Confira Administração › Gel.`;
    assert.ok(b.teoAntes, 'com a vigência do cenário o teórico sai');
    assert.equal(b.teo, null, 'vacGel.teorico sem vigência de perdas: null'); assert.equal(b.procAt, null, 'procAt sem vigência: null');
    assert.ok(b.card.includes(avisoPerdas), 'Teórico × Real com o aviso ' + b.card.slice(0, 300));
    assert.ok(!/id="gelDia"/.test(b.card), 'sem o quadro com números');
    assert.ok(b.texto.includes(avisoPerdas), 'o texto do relatório traz o aviso');
    assert.ok(b.lista.includes(b.local) && b.scrapT > 0 && b.pend === 0, 'as pesagens de scrap continuam listadas e calculadas ' + JSON.stringify({ scrapT: b.scrapT, pend: b.pend }));
    console.log('ok (b) sem perdas teóricas vigentes: teórico null, aviso no Teórico × Real, scrap pesado continua');

    // (b2) defeito 3 do bloco 1: pesagem pendente em algum turno = scrap incompleto; índice e ganho não saem
    const p = await o.evaluate(id => {
      const cad = vacCad(), day = db().productionDays.find(z => z.id === id), turnos = day.shifts.filter(x => !x.deleted);
      const local = cad.gel.locais.find(l => l.comp === 'tubogel'), ok = { e: local.equipamento, d: local.id, local: local.local, kg: 1.84, cat: '360060' };
      const salvos = turnos.map(x => x.gelScrap);
      turnos[0].gelScrap = { none: false, eq: [ok] };
      if (turnos[1]) turnos[1].gelScrap = { none: false, eq: [{ e: local.equipamento, d: 'LOCAL-QUE-NAO-EXISTE', local: 'Local apagado', kg: 2, cat: '360060' }] };
      try { const x = GelDia.calc(day, Engine.computeDay(db(), day)); return { turnos: turnos.length, pesou: x.pesou, idx: x.idx, saving: x.saving, pend: x.pendentes, card: GelDia.card(day, Engine.computeDay(db(), day)) }; }
      finally { turnos.forEach((x, i) => { x.gelScrap = salvos[i]; }); }
    }, dia);
    assert.ok(p.turnos >= 2, 'dia com dois turnos');
    assert.deepEqual([p.pesou, p.idx, p.saving], [false, null, null], 'pesagem pendente: sem índice nem ganho ' + JSON.stringify(p));
    assert.ok(p.pend > 0 && /pesagem pendente/i.test(p.card), 'o quadro mostra a pesagem pendente');
    console.log('ok (b2) pesagem pendente em um turno: índice e ganho não saem (sem número parcial)');

    // (a) base da Produção sem schemaVersion e com versão anterior: só consulta, com o texto exato
    for (const caso of ['sem', 0]) {
      await o.evaluate(v => { const base = vacDemo.ler('oee'); if (v === 'sem') delete base.schemaVersion; else base.schemaVersion = v; vacDemo.salvar('oee', base); }, caso);
      await o.evaluate(() => location.reload());
      o = await quadro();
      const a = await o.evaluate(async () => {
        go('launch'); await new Promise(r => setTimeout(r, 400));
        let erro = ''; try { Store.mutate(d => { d.settings.x = 1; }); } catch (e) { erro = e.message; }
        const sq = [...document.querySelectorAll('[data-sq-salvar]')];
        return { banner: document.querySelector('#banner').textContent, formato: Store.S.formato, ver: vacPode('oee', 'ver'), lancar: vacPode('oee', 'lancar'), erro,
          sq: sq.length, sqDis: sq.every(b => b.disabled), base: vacDemo.ler('oee').schemaVersion ?? 'sem' };
      });
      assert.ok(a.banner.includes(BLOQUEIO), `(${caso}) texto exato do bloqueio na página: ` + a.banner);
      assert.equal(a.formato, BLOQUEIO); assert.equal(a.ver, true, 'consulta continua');
      assert.equal(a.lancar, false, 'lançar indisponível'); assert.equal(a.erro, BLOQUEIO, 'gravar recusa com o texto exato');
      assert.ok(a.sq > 0 && a.sqDis, 'botão de gravar desabilitado');
      assert.equal(a.base, caso, 'a base anterior não foi convertida nem regravada');
    }
    console.log('ok (a) base da Produção sem schemaVersion ou com versão 0: só consulta, "' + BLOQUEIO + '"');

    // (f) Gestão de Gel › programação em tubos sem vigência de perdas: aviso, sem erro de JavaScript
    await page.evaluate(() => { location.hash = '#/gel'; });
    const g = await (await page.locator('iframe[title="Módulo Gestão de Gel"]').elementHandle({ timeout: 60000 })).contentFrame();
    await g.waitForFunction(() => typeof S !== 'undefined' && S && S.config && typeof render === 'function', null, { timeout: 60000 });
    const f = await g.evaluate(async () => {
      const cad = vacCad(), orig = JSON.stringify(cad.parametros.gel || {});
      cad.parametros.gel = { ...(cad.parametros.gel || {}), processo: [] }; vacDemo.salvar('cad', cad);
      const vista = S.config.planView; S.config.planView = 'tubos'; ui.tab = 'sim'; let erro = '';
      try { if (typeof memoClear === 'function') memoClear(); derive(); render(); await new Promise(r => setTimeout(r, 300)); } catch (e) { erro = e.message; }
      const txt = document.body.textContent;
      S.config.planView = vista; cad.parametros.gel = JSON.parse(orig); vacDemo.salvar('cad', cad);
      return { erro, card: txt.includes('Programação de produção com gel'), aviso: /Sem perdas teóricas do gel vigentes em \d{2}\/\d{2}\/\d{4}\. Confira Administração › Gel\./.test(txt) };
    });
    assert.deepEqual(f, { erro: '', card: true, aviso: true }, 'programação em tubos sem perdas vigentes: card com o aviso, sem erro ' + JSON.stringify(f));
    console.log('ok (f) Gestão de Gel › programação em tubos sem perdas vigentes: aviso e card sem erro');

    // (a2) modo arquivo e cópia do navegador (fora da demonstração)
    {
      const srv2 = require('../../scripts/servidor-testes.cjs').server(); await new Promise(r => srv2.listen(0, '127.0.0.1', r));
      const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 900 } });
      try {
        const p2 = await ctx2.newPage(); p2.on('pageerror', e => erros.push('arquivo: ' + e.message)); p2.on('dialog', d => d.accept());
        await p2.goto('http://127.0.0.1:' + srv2.address().port + '/__modulos__/OEE-Vacutainer.html');
        await p2.waitForFunction(() => typeof Store !== 'undefined' && Store.S && Store.S.db, null, { timeout: 60000 });
        const r1 = await p2.evaluate(async () => {
          const b = Model.emptyBase('teste'); delete b.schemaVersion; const txt = JSON.stringify(b);
          await Store.openFileFallback(txt, 'antiga.json'); const c = await Store.IDB.get('cache');
          let erro = ''; try { Store.mutate(d => { d.settings.x = 1; }); } catch (e) { erro = e.message; }
          let imp = ''; try { await Store.replaceWithImported(txt, 'teste'); } catch (e) { imp = e.message; }
          return { formato: Store.S.formato, cacheSv: c && c.db ? (c.db.schemaVersion ?? 'sem') : 'sem cópia', erro, imp };
        });
        assert.deepEqual(r1, { formato: BLOQUEIO, cacheSv: 'sem', erro: BLOQUEIO, imp: BLOQUEIO }, 'arquivo: bloqueada, cópia do navegador sem schemaVersion inventado, importação recusada ' + JSON.stringify(r1));
        await p2.reload();
        await p2.waitForFunction(() => typeof Store !== 'undefined' && Store.S && Store.S.mode === 'arquivo' && Store.S.db, null, { timeout: 60000 });
        const r2 = await p2.evaluate(async () => {
          document.querySelectorAll('.overlay').forEach(o => o.remove()); renderBanner();
          let erro = ''; try { Store.mutate(d => { d.settings.x = 1; }); } catch (e) { erro = e.message; }
          const c = await Store.IDB.get('cache');
          return { formato: Store.S.formato, banner: document.querySelector('#banner').textContent.includes(Store.S.formato || '???'), erro,
            sv: Store.S.db.schemaVersion ?? 'sem', cacheSv: c && c.db ? (c.db.schemaVersion ?? 'sem') : 'sem cópia', lancar: vacPode('oee', 'lancar') };
        });
        assert.deepEqual(r2, { formato: BLOQUEIO, banner: true, erro: BLOQUEIO, sv: 'sem', cacheSv: 'sem', lancar: false }, 'reaberta da cópia do navegador: continua bloqueada e sem conversão ' + JSON.stringify(r2));
        console.log('ok (a2) modo arquivo: base sem schemaVersion continua bloqueada ao reabrir a cópia do navegador; importar versão anterior é recusado');
      } finally { await ctx2.close(); srv2.close(); }
    }

    // (g) Administração: portal-base e cadastro de versão anterior
    {
      const adm = async () => { const f = await (await page.locator('iframe[title="Módulo Administração"]').elementHandle({ timeout: 60000 })).contentFrame();
        await f.waitForFunction(() => typeof Cad !== 'undefined' && Cad.D && typeof Store !== 'undefined' && Store.B, null, { timeout: 60000 }); return f; };
      await page.evaluate(() => { location.hash = '#/portal'; });
      let a = await adm();
      const cad0 = await a.evaluate(() => JSON.stringify(vacDemo.ler('cad')));
      for (const caso of ['sem', 0]) {
        await a.evaluate(v => { const b = vacDemo.ler('portal'); if (v === 'sem') delete b.schemaVersion; else b.schemaVersion = v; vacDemo.salvar('portal', b); }, caso);
        await a.evaluate(() => location.reload()); a = await adm();
        const r = await a.evaluate(async () => {
          const rev = Store.B.rev; let erro = ''; try { await Store.commit('teste', b => { b.config.avisoDias = 99; }); } catch (e) { erro = e.message; }
          let arq = ''; try { await Store.writeRemote(); } catch (e) { arq = e.message; }
          renderTop(); const fx = Store.fix({ schema: 'portal-base', rev: 3, config: {}, audit: [] });
          return { formato: Store.formato, topo: document.querySelector('#stBase').textContent, erro, arq, rev: Store.B.rev === rev, dias: Store.B.config.avisoDias !== 99,
            fix: 'schemaVersion' in fx, base: vacDemo.ler('portal').schemaVersion ?? 'sem', novo: vacFormatoBase(PAGE.vazio(), 'portal-base', 1) };
        });
        assert.deepEqual(r, { formato: BLOQUEIO, topo: r.topo, erro: BLOQUEIO, arq: BLOQUEIO, rev: true, dias: true, fix: false, base: caso, novo: '' }, `(${caso}) portal-base só consulta ` + JSON.stringify(r));
        assert.ok(r.topo.includes(BLOQUEIO), 'o topo da Administração mostra o texto exato: ' + r.topo);
      }
      await a.evaluate(() => { const b = vacDemo.ler('portal'); b.schemaVersion = 1; vacDemo.salvar('portal', b); });
      // restaurar uma cópia de versão anterior é recusado
      await a.evaluate(() => location.reload()); a = await adm();
      const msgs = [], ouve = d => msgs.push(d.message()); page.on('dialog', ouve);
      const antes = await a.evaluate(() => { App.show('config'); return JSON.stringify(Store.B); });
      const copia = await a.evaluate(() => { const b = JSON.parse(JSON.stringify(Store.B)); delete b.schemaVersion; b.config.avisoDias = 77; return JSON.stringify(b); });
      await a.setInputFiles('#cRest', { name: 'portal-base_copia.json', mimeType: 'application/json', buffer: Buffer.from(copia) }); await page.waitForTimeout(600);
      page.off('dialog', ouve);
      assert.ok(msgs.some(m => m.includes(BLOQUEIO)), 'restaurar cópia de versão anterior avisa o bloqueio ' + JSON.stringify(msgs));
      assert.equal(await a.evaluate(() => JSON.stringify(Store.B)), antes, 'a base não mudou');
      // cadastro de versão anterior: consulta, sem gravar e sem converter
      await a.evaluate(() => { const c = vacDemo.ler('cad'); c.schemaVersion = 1; vacDemo.salvar('cad', c); location.reload(); }); a = await adm();
      const c = await a.evaluate(async () => {
        const m = Cad.D.materiais[0], n0 = m.nome;
        const r = await Cad.ops([{ acao: 'edição', tipo: 'materiais', codigo: m.codigo, mudancas: { nome: { antes: n0, depois: n0 + ' Z' } }, motivo: 'teste' }]);
        return { formato: Cad.formato, pode: Cad.podeEditar(true), motivo: Cad.motivoEdicao(), r, igual: Cad.D.materiais[0].nome === n0, sv: vacDemo.ler('cad').schemaVersion, lista: Cad.D.materiais.length > 0 };
      });
      assert.deepEqual(c, { formato: BLOQUEIO, pode: false, motivo: BLOQUEIO, r: false, igual: true, sv: 1, lista: true }, 'cadastro de versão anterior só consulta ' + JSON.stringify(c));
      await a.evaluate(t => { vacDemo.salvar('cad', JSON.parse(t)); }, cad0);
      console.log('ok (g) Administração: portal-base e cadastro de versão anterior só consulta, "' + BLOQUEIO + '", sem conversão nem gravação');
    }

    assert.deepEqual(erros, [], 'sem erro de JavaScript'); console.log('ok (e) sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });

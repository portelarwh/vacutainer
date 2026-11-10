// SQDCP: apontamento real por formulário, consolidação, histórico, relatórios e impressão.
// Usa somente dados fictícios. HTTP e OPFS servem como transporte/pasta do teste.
const fs = require('fs'), path = require('path'), http = require('http'), assert = require('assert/strict');
const { spawnSync } = require('child_process'), { chromium } = require('playwright');
const M = require('../fontes/producao/sqdcp_modelo.js');
const raiz = path.resolve(__dirname, '..'), saida = path.join(__dirname, 'saida', 'sqdcp');
fs.mkdirSync(saida, { recursive: true });
const ok = (c, m) => { assert.ok(c, m); console.log('ok   ' + m); };
assert.equal(M.lerEvento(undefined), null);
assert.equal(M.lerEvento({ resposta: 'sim', quantidade: 0 }), null);
assert.throws(() => M.validarTurno({ qn: { resposta: 'sim', quantidade: '2a' } }));
assert.throws(() => M.validarTurno({ qn: { resposta: 'sim', quantidade: 1, numeros: ['01', '02'] } }));
const x = M.validarTurno({ acidente: { resposta: 'nao' }, qn: { resposta: 'sim', quantidade: 2, numeros: '00001; 00002' } });
const consolidado = M.resumo([{ acidente: x.acidente, qn: x.qn }, { acidente: null, qn: { resposta: 'sim', quantidade: 1, numeros: ['00001'] } }]);
ok(consolidado.qn.quantidade === 2 && consolidado.acidente.quantidade === 0 && !consolidado.acidente.completo,
  'QN repetida consolida uma vez; zero parcial mantém cobertura incompleta');
ok(M.resumo([{ acidente: null, qn: null }]).acidente.quantidade === null, 'base antiga sem resposta permanece desconhecida');
ok(!M.dataValida('2026-02-31') && M.dataValida('2026-11-09'), 'datas inválidas não são normalizadas para outro dia');

const srv = http.createServer((q, r) => {
  const f = path.resolve(raiz, '.' + decodeURIComponent(q.url.split('?')[0]));
  if (!f.startsWith(raiz + path.sep) || !fs.existsSync(f) || !fs.statSync(f).isFile()) { r.writeHead(404); return r.end(); }
  r.setHeader('Content-Type', f.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream'); fs.createReadStream(f).pipe(r);
});
(async () => {
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    const url = 'http://127.0.0.1:' + srv.address().port + '/paginas/OEE-Vacutainer.html';
    browser = await chromium.launch();
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const p = await ctx.newPage(), erros = [];
    p.on('pageerror', e => erros.push(e.stack)); p.on('dialog', d => d.accept());
    await p.goto(url + '?demo=teste-sqdcp-001#aba=sqdcp'); await p.waitForSelector('.sq-quadro');
    const prep = await p.evaluate(() => {
      Store.mutate(d => {
        const day = d.productionDays[0]; day.date = U.today(); day.status = 'em lançamento';
        day.shifts.forEach(ps => { ps.status = 'em lançamento'; ps.off = false; delete ps.offType; delete ps.sqdcp; });
        day._rev = (day._rev || 0) + 1; d.sqdcpDemo = true;
      });
      const d = db().productionDays[0]; Sqdcp.UI.dia = d.date;
      App.op = false; App.route = 'launch'; App.sel.date = d.date; renderNow();
      return { dia: d.date, day: d.id, ps: d.shifts.map(p => ({ id: p.id, shiftId: p.shiftId })) };
    });
    const box = id => p.locator('[data-sq-turno="' + id + '"]');
    await box(prep.ps[0].id).locator('[data-sq-resp="acidente"]').selectOption('sim');
    await box(prep.ps[0].id).locator('[data-sq-qtd="acidente"]').fill('2');
    await box(prep.ps[0].id).locator('[data-sq-refs="acidente"]').fill('AC-001, AC-002');
    await box(prep.ps[0].id).locator('[data-sq-resumo="acidente"]').fill('Ocorrências fictícias para o teste');
    await box(prep.ps[0].id).locator('[data-sq-resp="qn"]').selectOption('sim');
    await box(prep.ps[0].id).locator('[data-sq-qtd="qn"]').fill('2');
    await box(prep.ps[0].id).locator('[data-sq-refs="qn"]').fill('00001, 00002');
    await box(prep.ps[0].id).locator('[data-sq-salvar]').click();
    await p.waitForFunction(id => db().productionDays[0].shifts.find(p => p.id === id).sqdcp?.qn?.quantidade === 2, prep.ps[0].id);
    ok(await p.evaluate(() => db().auditLog.some(a => a.field === 'segurança e QN')), 'formulário grava respostas com auditoria');
    for (let i = 1; i < prep.ps.length; i++) {
      await box(prep.ps[i].id).locator('[data-sq-resp="acidente"]').selectOption('nao');
      await box(prep.ps[i].id).locator('[data-sq-resp="qn"]').selectOption(i === 1 ? 'sim' : 'nao');
      if (i === 1) await box(prep.ps[i].id).locator('[data-sq-refs="qn"]').fill('00001');
      await box(prep.ps[i].id).locator('[data-sq-salvar]').click();
      await p.waitForTimeout(100);
    }
    await p.locator('#nav .ngrp:has([data-route="sqdcp"])').hover();
    await p.locator('#nav [data-route="sqdcp"]').click(); await p.waitForSelector('.sq-quadro');
    ok(await p.locator('.sq-vaga').count() === 25 && await p.locator('.sq-coluna').count() === 5, 'quadro com cinco colunas e cinco vagas por coluna');
    const estat = await p.evaluate(() => ({ s: Sqdcp.relatorio('S0'), q: Sqdcp.relatorio('Q0') }));
    ok(estat.s.valor === 2 && estat.q.valor === 2 && !estat.s.parcial, 'total diário de acidentes e QNs únicas vem dos turnos');
    const alinhadas = await p.evaluate(() => {
      const cols = [...document.querySelectorAll('.sq-coluna')]; return [0, 1, 2, 3, 4].every(i => {
        const ys = cols.map(c => c.querySelectorAll('.sq-vaga')[i].getBoundingClientRect().top); return Math.max(...ys) - Math.min(...ys) < 2;
      });
    });
    ok(alinhadas, 'as cinco linhas do quadro ficam alinhadas entre os pilares');
    await p.locator('[data-sq-editar="P4"]').click(); await p.locator('#sqIndicador').selectOption('manual');
    await p.locator('#sqTitulo').fill('Presença da equipe'); await p.locator('#sqUnidade').fill('pessoas');
    await p.locator('#sqMeta').fill('12'); await p.locator('#sqValorManual').fill('11');
    await p.locator('#sqGravar').click(); await p.waitForTimeout(100);
    ok(await p.evaluate(() => Sqdcp.relatorio('P4').valor === 11), 'indicador manual configurado e vinculado à data');
    await p.locator('[data-sq-manual="P4"]').click(); await p.locator('#sqDiaValor').fill('0'); await p.locator('#sqDiaSalvar').click();
    ok(await p.evaluate(() => Sqdcp.relatorio('P4').valor === 0), 'zero manual explícito é diferente de não informado');
    await p.locator('[data-sq-manual="P4"]').click(); await p.locator('#sqDiaValor').fill(''); await p.locator('#sqDiaSalvar').click();
    ok(await p.evaluate(() => Sqdcp.relatorio('P4').valor === null), 'apagar medição volta a Não informado');
    const exp = await p.evaluate(() => {
      const dia = db().productionDays[0], ex = Exports.build(db()), T = Exporter.tables([dia]);
      const turno = rpShiftModel({ date: dia.date, psId: dia.shifts[0].id });
      const diario = rpModel({ type: 'day', date: dia.date });
      return { ex: ex.sqdcp.porDia.find(x => x.dia === dia.date && x.linha === dia.lineId),
        csv: T['Segurança e QN'], turno: turno.blocks.find(b => b.id === 'sqdcp').html,
        diario: diario.blocks.find(b => b.id === 'sqdcp').html, auto: diario.auto };
    });
    ok(exp.ex.qn.quantidade === 2 && exp.csv.some(r => String(r[10]).includes('00001')), 'exports e tabela CSV/Excel preservam números de QN como texto');
    ok(exp.turno.includes('00002') && exp.diario.includes('Segurança') && exp.auto.includes('QN'), 'passagem de turno e relatório do dia incluem segurança e QN');
    const reimportacao = await p.evaluate(() => {
      const t = U.clone(db()), day = t.productionDays[0], ps = day.shifts[0], cat = t.catalogs.find(c => !c.deleted && c.code);
      day.origin = 'importação'; const n = Number((t.shifts.find(s => s.id === ps.shiftId).code || '').replace('T', '')) || 1;
      const plan = Importers.planRelatorio(t, { rows: [{ line: 1, date: day.date, shift: String(n), catalog: cat.code, good: 123,
        pphTarget: 72000, plannedMin: 480, scrap: 1, oeeTarget: 0.8 }] }, { lineId: day.lineId, machineId: day.machineId, by: 'teste', importId: 'IMP-SQ' });
      const novo = plan.days[0];
      if (!novo) return false;
      t.productionDays = [novo]; const dados = SQDCPModelo.linhas(t, day.date, day.date, day.lineId, '', Engine, U);
      return novo.shifts[0].sqdcp.qn.numeros.includes('00002') && dados.length === day.shifts.length &&
        novo.shifts.length === 1 && SQDCPModelo.resumo(dados).qn.quantidade === 2;
    });
    ok(reimportacao, 'reimportação preserva S/Q e turnos ausentes no arquivo sem duplicar produção');
    // Desconhecido em um turno não vira um dia sem ocorrências.
    const inc = await p.evaluate(() => {
      const d = db().productionDays[0]; Actions.setShiftSQDCP(d.id, d.shifts[0].id, { acidente: { resposta: 'nao' }, qn: null });
      return { q: Sqdcp.relatorio('Q0'), s: Sqdcp.relatorio('S0') };
    });
    ok(inc.q.parcial && inc.q.valor === 1 && inc.q.estado === 'crit', 'ocorrência conhecida fica fora da meta mesmo com outro turno pendente');
    // Tela do operador exige as respostas ao concluir.
    await p.evaluate(id => { App.op = true; App.opSel = { date: U.today(), shiftId: id }; App.route = 'shift'; renderNow(); }, prep.ps[0].shiftId);
    await p.locator('#opDone').click();
    ok(!await p.locator('#sdOk').count(), 'operador não conclui com QN não informada');
    await p.locator('.sq-ocorrencias [data-sq-resp="qn"]').selectOption('nao');
    await p.locator('#opDone').click();
    ok(await p.locator('#sdOk').count() === 1 && await p.evaluate(() => db().productionDays[0].shifts[0].sqdcp.qn.resposta === 'nao'), 'Concluir salva as respostas preenchidas e abre a conferência');
    await p.locator('.overlay [data-close]').first().click();
    // Travas de fechamento e perfil.
    const trava = await p.evaluate(() => {
      const d = db().productionDays[0], ps = d.shifts[0]; ps.status = 'fechado';
      let a = false, b = false;
      try { Actions.setShiftSQDCP(d.id, ps.id, { acidente: { resposta: 'nao' }, qn: { resposta: 'nao' } }); } catch (_) { a = true; }
      db().productionDays[0].shifts[0].status = 'em lançamento'; const perm = vacPode; vacPode = () => false;
      try { Actions.setSQDCPP(d.lineId, 'produtividade'); } catch (_) { b = true; }
      Sqdcp.imprimir('S0'); const semImpressao = !document.querySelector('.sq-print-frame');
      vacPode = perm;
      return a && b && semImpressao;
    });
    ok(trava, 'turno fechado e perfil sem configuração respeitam as travas');
    // A4: três modelos, seis semanas e textos longos. PDF e conteúdo não podem exceder a folha.
    for (const formato of ['evolucao', 'calendario', 'desvios']) {
      const html = await p.evaluate(formato => {
        App.op = false; Sqdcp.UI.dia = '2026-08-31';
        if (formato === 'desvios') Store.mutate(d => {
          for (let i = 0; i < 5; i++) {
            const dia = Engine.buildDay(d, '2026-08-' + (27 + i), 'line_vac', 'mac_line', 'Verificação PDF');
            dia.shifts.forEach(ps => { ps.sqdcp = { qn: { resposta: 'sim', quantidade: 4,
              numeros: ['A', 'B', 'C', 'D'].map(s => 'QN-' + i + s.repeat(50)), resumo: 'Resumo operacional extenso para impressão. '.repeat(9).slice(0, 400) } }; });
            d.productionDays.push(dia);
          }
        });
        Actions.setSQDCPVaga('line_vac', 'Q0', { indicador: 'qn', formato, periodo: 'mes', titulo: 'Indicador com título extenso para validar a impressão em uma folha A4 paisagem', unidade: 'notificações', meta: 0, sentido: 'menor', observacao: 'Observação longa de teste. '.repeat(11) }, Sqdcp.UI.dia, '', undefined);
        return Sqdcp.htmlImpressao('Q0');
      }, formato);
      const q = await ctx.newPage(); await q.setContent(html); await q.emulateMedia({ media: 'print' });
      const geometria = await q.evaluate(() => {
        const a = document.querySelector('.sq-folha'), f = a.querySelector('footer');
        return a.scrollHeight <= a.clientHeight + 2 && f.getBoundingClientRect().bottom <= a.getBoundingClientRect().bottom + 2;
      });
      const arq = path.join(saida, formato + '.pdf'); await q.pdf({ path: arq, format: 'A4', landscape: true, preferCSSPageSize: true, printBackground: true, displayHeaderFooter: false });
      const inf = spawnSync('pdfinfo', [arq], { encoding: 'utf8' }).stdout || '';
      const tam = /Page size:\s+([\d.]+) x ([\d.]+) pts/.exec(inf);
      ok(geometria && /Pages:\s+1\b/.test(inf) && tam && Math.abs(+tam[1] - 841.89) < 1 && Math.abs(+tam[2] - 595.28) < 1,
        formato + ': uma A4 paisagem, sem conteúdo fora da folha');
      await q.screenshot({ path: path.join(saida, formato + '.png'), fullPage: true }); await q.close();
    }
    await p.evaluate(() => { App.op = false; App.route = 'sqdcp'; Sqdcp.UI.dia = U.today(); renderNow(); });
    for (const w of [1440, 390]) {
      await p.setViewportSize({ width: w, height: 1000 });
      await p.evaluate(() => document.documentElement.dataset.theme = 'dark');
      await p.screenshot({ path: path.join(saida, 'quadro-' + w + '.png'), fullPage: true });
      ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'quadro sem transbordamento em ' + w + ' px');
    }
    const snapshot = await p.evaluate(() => JSON.parse(JSON.stringify(db())));
    // Persistência na pasta simulada, com o Store e o serializador reais.
    const real = await ctx.newPage(); real.on('dialog', d => d.accept()); real.on('pageerror', e => erros.push(e.stack));
    await real.goto(url); await real.waitForTimeout(500);
    await real.evaluate(async snap => {
      document.querySelectorAll('.overlay').forEach(o => o.remove());
      Store.S.db = Model.ensure(snap); Store.S.user = 'Verificação SQDCP';
      const r = await navigator.storage.getDirectory(), d = await r.getDirectoryHandle('SQDCP', { create: true });
      await Store.connect(FolderBackend(d), { ask: false });
      const day = db().productionDays[0];
      Actions.setShiftSQDCP(day.id, day.shifts[0].id, { acidente: { resposta: 'nao' }, qn: { resposta: 'sim', quantidade: 1, numeros: ['0000999'] } });
      await Store.flush();
    }, snapshot);
    const salvo = await real.evaluate(async () => {
      const r = await (await navigator.storage.getDirectory()).getDirectoryHandle('SQDCP');
      const b = await r.getDirectoryHandle('00. Bases');
      const j = JSON.parse(await (await (await b.getFileHandle(BASE_FILE)).getFile()).text());
      await Store.resolveReload(); return { base: j.productionDays[0].shifts[0].sqdcp, config: j.sqdcp.quadros.line_vac.slots.P4,
        aberto: db().productionDays[0].shifts[0].sqdcp, exportado: !!j.exports.sqdcp };
    });
    ok(salvo.base.qn.numeros[0] === '0000999' && salvo.aberto.qn.numeros[0] === '0000999' && salvo.config.indicador === 'manual' && salvo.exportado,
      'gravação e releitura preservam respostas, configuração e exports');
    const reaplicado = await real.evaluate(async () => {
      const day = db().productionDays[0], ps = day.shifts[0], qn = U.clone(ps.sqdcp.qn);
      Actions.setShiftSQDCP(day.id, ps.id, { acidente: { resposta: 'sim', quantidade: 1, numeros: ['AC-TESTE'] }, qn });
      const op = Store.S.ops[Store.S.ops.length - 1], outra = U.clone(db());
      outra.productionDays[0].shifts[0].sqdcp.qn = { resposta: 'sim', quantidade: 2, numeros: ['QN-NOVA-1', 'QN-NOVA-2'] };
      op.fn(outra, () => {});
      const s = outra.productionDays[0].shifts[0].sqdcp;
      await Store.flush();
      return s.acidente.quantidade === 1 && s.qn.quantidade === 2 && s.qn.numeros[0] === 'QN-NOVA-1';
    });
    ok(reaplicado, 'reaplicar edição de acidente preserva a QN atualizada por outra estação');
    // A fonte externa da pasta anterior não pode aparecer ao trocar de pasta.
    const isolado = await real.evaluate(async () => {
      const anterior = Store.S.backend, pasta = valor => ({ __vacRaiz: true, getFileHandle: async () => ({ getFile: async () => new File([JSON.stringify({ exports: { exportsVersion: 1, porMes: [{ per: '2026-11', liquido: valor }] } })], 'perdas-base.json') }) });
      Store.S.backend = { dir: pasta(123) }; Sqdcp.UI.dia = '2026-11-09'; await Sqdcp.carregarFontes(true);
      const a = Sqdcp.relatorio('C0').valor;
      Store.S.backend = { dir: { __vacRaiz: true, getFileHandle: async () => { throw new DOMException('Ausente', 'NotFoundError'); } } };
      App.views.sqdcp.render(); const imediato = Sqdcp.relatorio('C0').valor; await Sqdcp.carregarFontes(true);
      const depois = Sqdcp.relatorio('C0').valor; Store.S.backend = anterior;
      return a === 123 && imediato === null && depois === null;
    });
    ok(isolado, 'troca de pasta limpa a fonte anterior antes de desenhar os indicadores');
    // Produção 2.4.44 · posições com blocos do Painel (padrão sugerido Q3, D3, C2), editáveis e impressas em A4
    const blocos = await p.evaluate(() => {
      const pad = ['Q3', 'D3', 'C2'].map(k => Sqdcp.relatorio(k)).map(r => r && r.painel ? r.cfg.blocos.map(b => b.b + ':' + b.periodo).join(',') : '');
      const h = Sqdcp.htmlImpressao('C2'), n = (h.match(/class="sq-blk/g) || []).length;
      let erro = ''; try { Sqdcp.validarVaga('Q3', { indicador: 'painel', blocos: [{ b: 'naoExiste', periodo: 'dia' }] }); } catch (e) { erro = e.message; }
      let vazio = ''; try { Sqdcp.validarVaga('Q3', { indicador: 'painel', blocos: [] }); } catch (e) { vazio = e.message; }
      return { pad, n, tema: /data-theme="light"/.test(h), svg: /<svg/.test(h), erro, vazio };
    });
    ok(blocos.pad[0] === 'scrapDay:dia,scrapDay:semana' && blocos.pad[1] === 'hourly:dia,planMonth:mes' && blocos.pad[2] === 'gaugeOee:dia,oeeDay:semana,oeeDay:mes',
      'padrão sugerido: Q scrap % dia e semana · D hora a hora e plano do mês · C velocímetro e OEE semana/mês (' + blocos.pad.join(' | ') + ')');
    ok(blocos.n === 3 && blocos.svg && blocos.tema, 'folha A4 com os 3 blocos do Painel, gráficos e tema claro na impressão');
    ok(/inválido/.test(blocos.erro) && /ao menos um bloco/.test(blocos.vazio), 'bloco inexistente ou posição sem bloco é recusado');
    ok(!erros.length, 'sem erros JavaScript: ' + erros.join('\n'));
    console.log('SQDCP: sem erros');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error('FALHA ' + e.stack); process.exitCode = 1; });

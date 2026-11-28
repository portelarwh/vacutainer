// Plataforma 1.8.108 · auditoria técnica de 28/11/2026 (Codex, revisada): consolidados de Produção e Waste. Demonstração, dados fictícios.
//  A03 Produção: dia sem nenhum lançamento fica fora do mês, do turno e do catálogo (ausência, não zero), como já ficava no porDia;
//  A08 Produção: o ponto de medição do OEE é o equipamento de papel OEE do cadastro; sem ele, mac_line;
//  A04 Waste: desfazer a importação do meio (A → B → C) deixa só C vigente para a ordem (não A e C somadas);
//  A05 Waste: mês com linha em dólar sem cotação sai com semCambio e valores nulos (sem somar moedas); com BRL só, nada muda.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(process.env.PLATAFORMA_HTML || path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html; charset=utf-8'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const base = 'http://127.0.0.1:' + srv.address().port + '/?demo=1', erros = [];
    const modulo = async (rota, nome) => {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, timezoneId: 'UTC' }), p = await ctx.newPage();
      p.on('pageerror', e => erros.push(nome + ': ' + e.message)); p.on('dialog', d => d.accept()); await p.clock.setFixedTime(new Date('2026-11-19T15:00:00Z'));
      await p.goto(base + '#/' + rota);
      const f = await (await p.locator(`iframe[title="Módulo ${nome}"]`).elementHandle({ timeout: 60000 })).contentFrame();
      await f.waitForFunction(() => window.vacPagina && vacPagina.pronto(), null, { timeout: 60000 }); return { ctx, f };
    };

    { const { ctx, f } = await modulo('oee?tab=reports', 'Produção');
      const r = await f.evaluate(() => {
        const d = db(), x = d.productionDays.filter(y => !y.deleted).sort((a, b) => b.date.localeCompare(a.date))[0], m = x.date.slice(0, 7);
        const E0 = Exports.build(d, x.date), antes = { mes: !!E0.porMes.find(e => e.mes === m), turnos: E0.porDiaTurno.filter(e => e.dia === x.date).length, cat: E0.porDiaCatalogo.filter(e => e.dia === x.date).length, gel: E0.porDiaTurno.filter(e => e.dia === x.date).map(e => JSON.stringify([e.turno, e.gel ?? null, e.extraMin, e.semProducao])) };
        const orig = JSON.parse(JSON.stringify(x.shifts)); x.shifts.forEach(s => s.intervals.forEach(i => { i.good = null; })); x._rev++;
        const E = Exports.build(d, x.date), dia = E.porDia.find(e => e.dia === x.date);
        const T = E.porDiaTurno.filter(e => e.dia === x.date), depois = { semLancamento: !!dia.semLancamento, mes: E.porMes.find(e => e.mes === m) || null, turnos: T.map(e => [e.semLancamento, e.boa, e.oee, e.cap, e.metaOp]), gel: T.map(e => JSON.stringify([e.turno, e.gel ?? null, e.extraMin, e.semProducao])), cat: E.porDiaCatalogo.filter(e => e.dia === x.date) };
        x.shifts = orig; x._rev++;
        // A08
        const o0 = pontoOee('line_vac'), maq0 = d.machines; d.machines = maq0.filter(y => y.id !== 'mac_line').concat([{ id: 'mac_med_ficticio', code: 'MED-FICT', name: 'Medidor fictício', lineId: 'line_vac', role: 'oee', active: true, status: 'ativo' }]);   /* cadastro com MEDIDOR: o ProdCad não cria mac_line */
        const o1 = pontoOee('line_vac', d), dd = Engine.buildDay(d, U.addDays(x.date, 30), 'line_vac', pontoOee('line_vac', d), 'teste').machineId; d.machines = maq0;
        return { antes, depois, o0, o1, dd };
      });
      assert.ok(r.antes.mes && r.antes.turnos > 0 && r.antes.cat > 0, 'com o dia lançado, o mês, os turnos e o catálogo aparecem: ' + JSON.stringify(r.antes));
      assert.equal(r.depois.semLancamento, true);
      assert.equal(r.depois.mes, null, 'mês só com o dia em branco não é publicado com zero (A03): ' + JSON.stringify(r.depois.mes));
      assert.deepEqual(r.depois.turnos, r.depois.turnos.map(() => [true, null, null, null, null]), 'turno sem lançamento: semLancamento e produção, OEE, capacidade e meta nulos'); assert.equal(r.depois.turnos.length, r.antes.turnos, 'os turnos continuam publicados');
      assert.deepEqual(r.depois.gel, r.antes.gel, 'gel, hora extra e sem produção do turno continuam (lidos pela Gestão de Gel)'); assert.deepEqual(r.depois.cat, [], 'catálogo sem lançamento fica fora do porDiaCatalogo');
      console.log('ok A03 Produção: dia sem lançamento fica fora do mês e do catálogo; o turno segue publicado sem produção (gel, hora extra e sem produção preservados)');
      assert.equal(r.o0, 'mac_line', 'sem equipamento de papel OEE, o ponto em memória'); assert.equal(r.o1, 'mac_med_ficticio', 'com o MEDIDOR, o equipamento do cadastro (A08)'); assert.equal(r.dd, 'mac_med_ficticio');
      console.log('ok A08 Produção: o lançamento usa o equipamento de papel OEE do cadastro (mac_med_ficticio); sem ele, mac_line');
      await ctx.close(); }

    { const { ctx, f } = await modulo('perdas', 'Waste');
      const r = await f.evaluate(async () => {
        const per = '2019-01', ord = 'ORD-FICT-A04', lin = (imp, v, extra = {}) => ({ id: 'r-' + imp, imp, ordem: ord, per, comp: 'C1', compDesc: 'Componente fictício', prod: 'P1', cT: 100, cR: 100 + v, dSap: null, dEstr: v, dEmp: 0, dPreco: 0, qT: 1, qR: 1, un: 'UN', moeda: 'BRL', ...extra });
        const imp = id => ({ id, tipo: 'KKBC_ORD', arquivo: id + '.txt', data: '2026-11-0' + id.slice(-1) + 'T10:00:00Z', periodos: [per], status: 'importado' });
        B.imports.push(imp('impA1'), imp('impB2'), imp('impC3')); B.rows.push({ ...lin('impA1', 10), sup: 'impB2' }, { ...lin('impB2', 20), sup: 'impC3' }, lin('impC3', 30));
        B.imports.find(i => i.id === 'impA1').status = 'substituído por versão posterior'; B.imports.find(i => i.id === 'impB2').status = 'substituído por versão posterior';
        await undoImport('impB2');
        const vig = vigRowsAll0().filter(x => x.ordem === ord).map(x => x.imp), stA = B.imports.find(i => i.id === 'impA1').status;
        // A05: mesma competência, linha em dólar sem cotação
        const per2 = '2019-02', usd = { ...lin('impU', 100), id: 'r-usd', ordem: 'ORD-FICT-A05', per: per2, moeda: 'USD' }, brl = { ...lin('impU', 100), id: 'r-brl', ordem: 'ORD-FICT-A05B', per: per2 };
        B.imports.push({ ...imp('impU9'), id: 'impU', periodos: [per2] }); B.rows.push(usd, brl);
        const ex = buildExports(), m = ex.porMes.find(x => x.per === per2), o = ex.porOrdem.find(x => x.ordem === 'ORD-FICT-A05'), ob = ex.porOrdem.find(x => x.ordem === 'ORD-FICT-A05B'), m1 = ex.porMes.find(x => x.per === per);
        return { vig, stA, mes: m && { semCambio: m.semCambio, muv: m.muv, ordens: m.ordens }, ord: o && { semCambio: o.semCambio, muv: o.muv }, ordBRL: ob && { semCambio: !!ob.semCambio, muv: ob.muv }, mesBRL: m1 && { semCambio: !!m1.semCambio, muv: m1.muv }, lista: ex.semCambio };
      });
      assert.deepEqual(r.vig, ['impC3'], 'depois de desfazer B, só C vale para a ordem (A04): ' + JSON.stringify(r.vig));
      assert.equal(r.stA, 'substituído por versão posterior', 'A continua substituída');
      console.log('ok A04 Waste: desfazer a importação do meio deixa só a mais nova vigente (antes: A e C somadas)');
      assert.deepEqual(r.mes, { semCambio: true, muv: null, ordens: 2 }, 'mês com dólar sem cotação: semCambio e MUV nulo (A05): ' + JSON.stringify(r.mes));
      assert.deepEqual(r.ord, { semCambio: true, muv: null }, 'a ordem em dólar também'); assert.deepEqual(r.ordBRL, { semCambio: false, muv: 100 }, 'a ordem em real segue com o valor');
      assert.deepEqual(r.mesBRL, { semCambio: false, muv: 30 }, 'mês só em real não muda'); assert.deepEqual(r.lista, ['2019-02']);
      console.log('ok A05 Waste: competência com dólar sem cotação sai com semCambio e valores nulos; em real, nada muda');
      await ctx.close(); }

    assert.deepEqual(erros, [], 'sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });

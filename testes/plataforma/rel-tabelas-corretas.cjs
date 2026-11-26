// Análise comum 26/11/2026 (C29, C30, C31, C32, K03): Lista de paradas filtra família; Excel só formata % onde era %, códigos ficam como texto;
// Lotes do MES atribui as caixas ao turno pela hora; descrições das importações com 12 px. Demonstração, dados fictícios.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); }); let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r)); browser = await chromium.launch(require('./chromium.cjs')());
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, timezoneId: 'UTC' }), p = await ctx.newPage(), erros = [];
    p.on('pageerror', e => erros.push(e.message)); await p.clock.setFixedTime(new Date('2026-11-19T15:00:00Z'));
    await p.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1#/oee?tab=reports');
    const q = p.locator('iframe[title="Módulo Produção"]'); await q.contentFrame().locator('body').waitFor({ state: 'attached', timeout: 60000 });
    const f = await (await q.elementHandle()).contentFrame(); await f.waitForFunction(() => window.vacPagina?.pronto() && typeof RpTab !== 'undefined', null, { timeout: 60000 });
    const r = await f.evaluate(async () => {
      const XL = await Libs.loadXLSX(), d = db(), out = {}; let blob = null; download = (n, b) => { blob = b; };
      const txt = M => JSON.stringify(M.blocks).replace(/<\/t[dh]>/g, ' | ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
      // C31: família na lista de paradas (o evento da demonstração é de catálogo SST)
      const R = {}, T = RpTab.st(R); T.mod = 'paradas'; T.from = '2026-11-01'; T.to = '2026-11-30'; out.fam = {};
      for (const fam of ['', 'fam_sst', 'fam_edta', 'fam_cit']) { T.fam = fam; const t = txt(RpTab.model(R)); out.fam[fam || 'todas'] = /FME/.test(t); }
      T.fam = '';
      // C29/C30: Excel
      const x0 = d.productionDays.find(y => !y.deleted), iv = x0.shifts[0].intervals[0]; iv.good = 500; x0._rev++; const cat = d.catalogs.find(c => c.id === iv.catalogId) || d.catalogs.find(c => !c.deleted); cat.code = '00123';
      const R2 = rpState(); R2.type = 'tables'; const T2 = RpTab.st(R2); T2.from = '2026-11-19'; T2.to = '2026-11-19'; T2.mod = 'hora';
      const M = rpModel(R2), doc = document.createElement('div'); doc.id = 'rpDoc'; doc.innerHTML = rpDocHtml(M, '', ''); await rpXlsx({ M, sum: '', note: '', doc });
      const ws = XL.read(await blob.arrayBuffer()).Sheets['Hora a hora'];
      out.xl = { D2: ws.D2 && { v: ws.D2.v, t: ws.D2.t }, F2: ws.F2 && { v: ws.F2.v, w: ws.F2.w }, H2: ws.H2 && { w: ws.H2.w, t: ws.H2.t } };
      // C32: lotes por turno
      const R3 = {}, T3 = RpTab.st(R3); T3.mod = 'lotes'; T3.from = '2026-11-01'; T3.to = '2026-11-30'; const caixas = () => { const t = txt(RpTab.model(R3)); const i = t.indexOf('Total'); const m = t.slice(i).match(/Total[^0-9]*([\d.]+)/); return m ? +m[1].replace(/\./g, '') : null; };
      T3.turno = ''; out.todos = caixas(); out.turnos = {}; for (const sh of d.shifts.filter(s => !s.deleted).map(s => s.id)) { T3.turno = sh; out.turnos[sh] = caixas(); }
      // C32 (Codex #167): caixas contadas pelo minuto registrado, inclusive em dia sem lançamento de produção
      const real = d.server.segments.slice(); d.productionDays.forEach(x => { x.deleted = true; });
      const mk = (lot, base, mins) => ({ lineId: 'line_vac', lot, cat: '360060', t0: '2026-11-19T06:00:00', t1: '2026-11-19T21:59:00', n: mins.length, b0: 1, b1: mins.length, base, m: mins.map((x, i) => i === 0 ? '0' : String(x - mins[i - 1])).join(',') });
      const t0 = Date.parse('2026-11-19T06:00:00Z') / 60000; d.server.segments = [mk('LOTE-X', t0, [0, 1, 2, 959])];   // 3 caixas cedo e 1 às 21:59
      const R4 = {}, T4 = RpTab.st(R4); T4.mod = 'lotes'; T4.from = '2026-11-19'; T4.to = '2026-11-19'; const c4 = () => { const t = txt(RpTab.model(R4)); const i = t.indexOf('Total'); const m = t.slice(i).match(/Total[^0-9]*([\d.]+)/); return m ? +m[1] : null; };
      out.semDia = {}; for (const sh of d.shifts.filter(s => !s.deleted)) { T4.turno = sh.id; out.semDia[sh.code || sh.id] = c4(); } T4.turno = ''; out.semDia.todos = c4(); d.server.segments = real;
      return out;
    });
    assert.equal(r.fam.todas, true, 'sem filtro de família a parada aparece'); assert.equal(r.fam.fam_sst, true, 'família do catálogo da parada: aparece');
    assert.equal(r.fam.fam_edta, false, 'outra família (EDTA): a parada não aparece'); assert.equal(r.fam.fam_cit, false, 'outra família (CIT): a parada não aparece');
    assert.deepEqual(r.xl.D2, { v: '00123', t: 's' }, 'código do catálogo fica texto com zeros à esquerda: ' + JSON.stringify(r.xl.D2));
    assert.equal(r.xl.F2.v, 0.5); assert.equal(r.xl.F2.w, '0.5', '0,5 mil continua número simples (não vira 50,0%)');
    assert.match(r.xl.H2.w, /%$/, 'a coluna Atend. (texto com %) segue em porcentagem: ' + r.xl.H2.w); assert.equal(r.xl.H2.t, 'n');
    const soma = Object.values(r.turnos).reduce((a, v) => a + v, 0);
    assert.ok(r.todos > 0 && Math.abs(soma - r.todos) <= Object.keys(r.turnos).length, `caixas dos turnos somam o total (${JSON.stringify(r.turnos)} → ${soma} vs ${r.todos})`);
    assert.ok(Object.values(r.turnos).every(v => v < r.todos) && Object.values(r.turnos).some(v => v > 0), 'cada turno recebe só a sua parte');
    assert.ok(r.semDia.todos === 4, 'sem lançamento de produção o lote aparece (4 caixas): ' + JSON.stringify(r.semDia));
    assert.equal(Object.entries(r.semDia).filter(([k]) => k !== 'todos').reduce((a, [, v]) => a + (v || 0), 0), 4, 'os turnos do cadastro dividem as 4 caixas pelo minuto de cada uma, sem fração: ' + JSON.stringify(r.semDia));
    assert.ok(Object.values(r.semDia).some(v => v === 3), 'as 3 caixas de 06:00 a 06:02 ficam no turno da manhã: ' + JSON.stringify(r.semDia));
    // K03: 12 px nas descrições da Central de importações
    await p.setViewportSize({ width: 390, height: 844 }); await p.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1#/importacoes'); await p.waitForTimeout(2500);
    const fs12 = await p.evaluate(() => { const e = document.querySelector('.import-row p'); return e && getComputedStyle(e).fontSize; }); assert.equal(fs12, '12px', 'descrição dos cartões de importação em 12 px');
    assert.deepEqual(erros, [], 'sem erro de JavaScript'); console.log('ok relatórios: família na lista de paradas, Excel (% só onde era %, códigos como texto), lote por turno somando o total, 12 px');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });

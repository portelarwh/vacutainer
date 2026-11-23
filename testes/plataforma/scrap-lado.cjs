// Produção 2.6.40 · GEL-08 (pedido do responsável, 23/11/2026): "Lançar / Editar scrap" com o scrap de máquina (40%) e o de gel (60%)
// lado a lado, um só Gravar; o gel no jeito do Registrar scrap da Gestão de Gel (todos os pontos por Tubos/Barril/Purga).
// Demonstração: dados e pontos de gel fictícios (Funil; Tullip A com dois locais: Caixa rejeição e Funil berço; Envasadora). O que este teste prova:
//  1. com gel no turno, o popup fica largo e tem as duas colunas (≈40% e ≈60%);
//  2. o gel mostra todos os pontos agrupados (Tubos, Barril, Purga), e digitar o peso mostra a conta (≈ tubos, gel) na hora;
//  3. um só Gravar grava o total da máquina (ps.scrap) e as pesagens do gel (ps.gelScrap), com o motivo;
//  4. sem gel no turno, o popup continua só com a máquina; nenhum erro de JavaScript.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
const OUT = process.env.SCRAP_PRINT || '';
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: OUT ? 2 : 1 }), erros = [];
    page.on('pageerror', e => erros.push(e.message)); page.on('dialog', d => d.accept());
    await page.clock.setFixedTime(new Date('2026-11-19T10:00:00'));
    await page.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1#/oee?tab=launch');
    const o = await (await page.locator('iframe[title="Módulo Produção"]').elementHandle({ timeout: 60000 })).contentFrame();
    await o.waitForFunction(() => window.vacPagina?.pronto());

    // 4) sem gel: popup só com a máquina (o cenário agora traz equipamentos de gel; aqui eles são tirados só na memória)
    const sem = await o.evaluate(async () => { const C00 = GelTurno.ctx() || {}; GelTurno.ctx = () => ({ ...C00, equips: () => [], eq: () => null }); const day = curDay(), ps = day.shifts.find(p => !p.deleted && !locked(day, p)); TurnoCard.abrir(day, ps.id); await new Promise(r => setTimeout(r, 200));
      const m = document.querySelector('.overlay .modal'), r = { largo: m.classList.contains('sc-largo'), lado: !!m.querySelector('.sc-lado') }; document.querySelectorAll('.overlay').forEach(x => x.remove()); return r; });
    assert.deepEqual(sem, { largo: false, lado: false }, 'sem gel: só a máquina');

    // pontos de gel fictícios (o que viria da Administração › Equipamentos, categoria Gel)
    await o.evaluate(() => { const C0 = GelTurno.ctx() || {};
      const E = [{ codigo: 'EQ31', nome: 'Funil', descs: [{ id: 'f1', comp: 'tubogel', cat: 'T', mots: [] }] }, { codigo: 'EQ32', nome: 'Tullip A', descs: [{ id: 'b1', local: 'Caixa rejeição', comp: 'completo', cat: 'T', mots: [] }, { id: 'b2', local: 'Funil berço', comp: 'completo', cat: 'T', mots: [] }] },
        { codigo: 'EQ33', nome: 'Envasadora de gel', descs: [{ id: 'e1', comp: 'barril', cat: 'B', mots: [] }, { id: 'e2', comp: 'gel', cat: 'P', mots: [] }] }];
      const fmts = [{ from: '2000-01-01', tara: 70, taraP: 4, sobra: 1.3, f: { '100': { tubo: 4.8, gel: 0.83, adit: 0.02, tr: 2.31 }, '75': { tubo: 3.55, gel: 0.82, adit: 0.015, tr: 2.29 } } }];
      const fake = { ...C0, fmts, params: [{ from: '2000-01-01', g: 0.97, pT: 2.1, pB: .71, pP: .5 }], equips: () => E, eq: c => E.find(x => x.codigo === c) || null, cat: () => ({ fmt: '100' }), usaGel: () => true, corte: '2026-11-01', motivos: [{ id: 'm1', name: 'Vazamento', comps: [] }, { id: 'm2', name: 'Bolha', comps: [] }] };
      GelTurno.ctx = () => fake; GelTurno.mostra = () => true; });

    // 1) largo, duas colunas 40/60
    const ps = await o.evaluate(async () => { const day = curDay(), ps = day.shifts.find(p => !p.deleted && !locked(day, p)); TurnoCard.abrir(day, ps.id); await new Promise(r => setTimeout(r, 300)); return ps.id; });
    const lay = await o.evaluate(() => { const m = document.querySelector('.overlay .modal'), c = [...m.querySelectorAll('.sc-lado > .sc-col')].map(x => x.getBoundingClientRect().width);
      return { largo: m.classList.contains('sc-largo'), n: c.length, prop: c.length === 2 ? +(c[0] / (c[0] + c[1])).toFixed(2) : 0, grupos: [...m.querySelectorAll('.gsc-g h4')].map(h => h.textContent), pontos: [...m.querySelectorAll('.gsc-n')].map(n => [...n.querySelectorAll('b')].map(b => b.textContent).join(' · ')) }; });
    assert.ok(lay.largo && lay.n === 2 && lay.prop >= .36 && lay.prop <= .44, 'popup largo, máquina ≈40% e gel ≈60% ' + JSON.stringify(lay));
    assert.deepEqual(lay.grupos, ['Tubos', 'Barril', 'Purga']); assert.deepEqual(lay.pontos, ['Funil', 'Tullip A · Caixa rejeição', 'Tullip A · Funil berço', 'Envasadora de gel', 'Envasadora de gel'], 'cada ponto com o local (GEL-09)');
    console.log('ok popup largo com máquina (' + Math.round(lay.prop * 100) + '%) e gel lado a lado; gel com Tubos, Barril e Purga e todos os pontos');

    // 2) digitar o peso mostra a conta
    await o.fill('[data-gkg="EQ31|f1"]', '1,84');
    const conta = await o.textContent('[data-gc="EQ31|f1"]');
    assert.match(conta, /≈\s?[\d.]+ tubos · gel [\d,]+ kg/, 'conta na hora: ' + conta);
    await o.click('[data-gmotadd="EQ31|f1"]'); await o.selectOption('[data-gmot="EQ31|f1|0"]', 'm1');
    if (OUT) await page.screenshot({ path: OUT });
    console.log('ok digitar 1,84 kg no Funil mostra a conta na hora (' + conta.trim() + ') e "+ motivo" acrescenta o motivo');

    // 3) um só Gravar grava as duas partes
    const tot = o.locator('#scTot'); if (await tot.isDisabled()) await o.click('#scSo'); await o.fill('#scTot', '3227');
    await o.click('#scOk'); await page.waitForTimeout(600);
    const g = await o.evaluate(id => { const day = db().productionDays.find(d => d.shifts.some(p => p.id === id)), p = day.shifts.find(x => x.id === id); return { scrap: p.scrap, gel: p.gelScrap && p.gelScrap.eq.map(e => [e.e, e.d, e.kg, (e.mots || []).map(m => m.m).join()]), aberto: !!document.querySelector('.overlay') }; }, ps);
    assert.deepEqual(g, { scrap: 3227, gel: [['EQ31', 'f1', 1.84, 'm1']], aberto: false }, 'Gravar grava máquina e gel ' + JSON.stringify(g));
    console.log('ok um só Gravar grava o total da máquina (3227) e a pesagem do gel (Funil 1,84 kg, Vazamento)');
    assert.deepEqual(erros, [], 'sem erro de JavaScript'); console.log('ok sem gel no turno o popup fica só com a máquina; sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });

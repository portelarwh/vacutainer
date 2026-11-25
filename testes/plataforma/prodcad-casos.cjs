// Bloco 3 · Task 2 (Review Focus 2 e 3): o que o ProdCad monta respeita a vigência da data do fato. Catálogo com duas vigências
// (PPH diferente) e turno cuja versão antiga continua valendo para os dias antigos. Dados fictícios.
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { server } = require('../../scripts/servidor-testes.cjs');

const { CADASTRO } = require('./prodcad-fixture.cjs');

(async () => {
  const srv = server(); await new Promise((resolve, reject) => { srv.once('error', reject); srv.listen(0, '127.0.0.1', resolve); });
  const browser = await chromium.launch(require('./chromium.cjs')()), erros = [];
  try {
    const p = await (await browser.newContext({ timezoneId: 'America/Sao_Paulo' })).newPage();
    p.on('pageerror', e => erros.push(e.message)); p.on('dialog', d => d.accept());
    await p.goto('http://127.0.0.1:' + srv.address().port + '/__modulos__/OEE-Vacutainer.html');
    await p.waitForFunction(() => typeof Engine !== 'undefined' && typeof ProdCad !== 'undefined', null, { timeout: 60000 });
    const r = await p.evaluate(C => {
      const T = ProdCad.montar(C), cats = T.catalogs.filter(c => c.code === '360060'), t1 = T.shifts.find(s => s.code === 'T1');
      const pphEm = d => { const c = cats.find(x => Engine.catalogValid(x, d)); return c ? c.pph : null; };
      const v = (d, wd) => { const x = Engine.shiftVersionAt(t1, d, wd); return x ? x.start + '-' + x.end : null; };
      return { pph2025: pphEm('2025-06-10'), pph2026: pphEm('2026-03-10'), pph2024: pphEm('2024-06-10'),
        t1Seg2025: v('2025-06-09', 1), t1Seg2026: v('2026-03-09', 1), t1Sab2026: v('2026-03-14', 6), t1Sab2025: v('2025-06-14', 6),
        versoes: t1.versions.map(x => [x.validFrom, x.validTo, x.weekdays.join('')]), idsUnicos: new Set(t1.versions.map(x => x.id)).size === t1.versions.length };
    }, CADASTRO);
    assert.equal(r.pph2025, 100, 'dia de 2025 usa a vigência de 2025 do catálogo');
    assert.equal(r.pph2026, 120, 'dia de 2026 usa a vigência de 2026');
    assert.equal(r.pph2024, null, 'antes da primeira vigência não há catálogo (não vira zero nem pega a vigência de outro ano)');
    assert.equal(r.t1Seg2025, '06:00-14:30', 'turno de segunda em 2025');
    assert.equal(r.t1Seg2026, '06:00-14:30', 'turno de segunda em 2026');
    assert.equal(r.t1Sab2026, '06:00-13:30', 'sábado de 2026 usa a versão própria (1 h a menos)');
    assert.equal(r.t1Sab2025, null, 'sábado de 2025 não tinha turno (a versão de sábado só existe desde 2026)');
    assert.equal(r.idsUnicos, true, 'cada versão de turno tem id próprio');
    assert.deepEqual(erros, []);
    console.log('ok ProdCad: catálogo e turno respeitam a vigência da data do fato (2025, 2026, sábado e antes da 1ª vigência)');
  } finally { await browser.close(); srv.close(); }
})().catch(e => { console.error(e.message || e); process.exitCode = 1; });

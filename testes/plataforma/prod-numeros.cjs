// Bloco 3 · prova de números da Produção (25/11/2026).
// Grava, ANTES de a Produção passar a montar a estrutura a partir do cadastro da Administração, os números que o motor produz no
// cenário de demonstração: OEE, disponibilidade, performance, qualidade, paradas, hora a hora e agregados do mês. Depois da troca,
// os números têm de ser IGUAIS (fórmulas e cálculos não mudam; muda só a origem dos cadastros).
//   node testes/plataforma/prod-numeros.cjs --gravar   (uma vez, antes da troca; falha se a referência já existe)
//   node testes/plataforma/prod-numeros.cjs            (compara com a referência)
// O SQDCP (25 posições) já tem a sua referência em testes/tsqdcp_layout.js.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const { server } = require('../../scripts/servidor-testes.cjs');

const referencia = path.resolve(__dirname, '../amostras/prod-numeros-antes.json');

// Serialização estável: chaves em ordem, números como estão, sem funções. Campos de identidade gerados na criação do dia ficam,
// porque o cenário é um arquivo fixo e os ids não mudam entre execuções.
const ESTAVEL = `(function estavel(v) {
  if (Array.isArray(v)) return v.map(estavel);
  if (v && typeof v === 'object') return Object.fromEntries(Object.keys(v).sort().filter(k => typeof v[k] !== 'function').map(k => [k, estavel(v[k])]));
  if (typeof v === 'number' && !Number.isFinite(v)) return String(v);
  if (typeof v === 'number' && Object.is(v, -0)) return 0;   // o JSON não distingue -0 de 0
  return v;
})`;

async function capturar() {
  const srv = server();
  await new Promise((resolve, reject) => { srv.once('error', reject); srv.listen(0, '127.0.0.1', resolve); });
  let browser;
  try {
    browser = await chromium.launch(require('./chromium.cjs')());
    const ctx = await browser.newContext({ timezoneId: 'America/Sao_Paulo' });
    await ctx.route(/^https?:\/\/(?!127\.0\.0\.1:)/, route => route.abort());
    const erros = [];
    const page = await ctx.newPage();
    page.on('pageerror', e => erros.push(e.message));
    await page.clock.setFixedTime(new Date('2026-11-09T15:00:00Z'));
    await page.goto('http://127.0.0.1:' + srv.address().port + '/Plataforma.html?demo=1#/oee?tab=launch');
    const quadro = page.locator('iframe[title="Módulo Produção"]');
    await quadro.contentFrame().locator('body').waitFor({ state: 'attached', timeout: 30000 });
    const frame = await (await quadro.elementHandle()).contentFrame();
    await frame.waitForFunction(() => window.vacPagina?.pronto() && typeof Engine !== 'undefined' && db().productionDays.length, null, { timeout: 30000 });
    const numeros = await frame.evaluate(`(() => {
      const estavel = ${ESTAVEL};
      const d = db();
      const dias = d.productionDays.filter(x => !x.deleted).sort((a, b) => a.date < b.date ? -1 : 1);
      const porDia = dias.map(day => {
        const res = Engine.computeDay(d, day);
        // só números e textos de resultado do cálculo: agregado, oficial do dia, por turno, mensagens e composição
        return estavel({ data: day.date, agg: res.agg, officialDaily: res.officialDaily, r: res.r, comp: res.comp, msgs: res.msgs,
          shifts: (res.shifts || []).map(s => ({ ps: s.ps && s.ps.id, r: s.r, agg: s.agg })), flat: res.flat });
      });
      // agregado do período (o mesmo que alimenta painel e relatórios): o mês do cenário e o dia a dia
      const noMes = dias.filter(x => x.date >= '2026-11-01' && x.date <= '2026-11-30');
      const agregados = { oeeMes: estavel(Engine.periodResult(d, noMes, {})), oeeDiaADia: noMes.map(x => estavel(Engine.periodResult(d, [x], {}))) };
      // IDs das tabelas de cadastro trocados pelo código (e pela vigência, quando há): a prova não depende de como o ID é montado
      const mapa = new Map();
      for (const l of d.lines) mapa.set(l.id, 'L:' + l.code);
      for (const m of d.machines) mapa.set(m.id, 'M:' + m.code);
      for (const f of d.families) mapa.set(f.id, 'F:' + f.code);
      for (const c of d.catalogs) mapa.set(c.id, 'C:' + c.code);
      for (const t of d.shifts) { mapa.set(t.id, 'S:' + t.code); for (const v of t.versions || []) mapa.set(v.id, 'S:' + t.code); }
      for (const x of d.downtimeCodes) mapa.set(x.id, 'D:' + x.code);
      const porCodigo = v => {
        if (Array.isArray(v)) return v.map(porCodigo);
        if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [mapa.get(k) ?? k, porCodigo(x)]));
        return typeof v === 'string' ? (mapa.has(v) ? mapa.get(v) : /^tg_/.test(v) ? 'TG' : v) : v;   // id de meta (aleatório antes, derivado agora)
      };
      const DESCRITIVOS = new Set(['createdAt', 'createdBy', 'updatedAt', 'updatedBy', 'revision', 'note', 'portalDe', 'portalCode', 'rounding', 'demo', 'name', 'description', 'validFrom', 'validTo']);   // campos que só descrevem o registro do cadastro; valores nulos também saem (presença de chave vazia não é número)
      const semDescritivos = v => Array.isArray(v) ? v.map(semDescritivos) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).filter(([k, x]) => !DESCRITIVOS.has(k) && x !== null).map(([k, x]) => [k, semDescritivos(x)])) : v;
      return estavel(semDescritivos(porCodigo({ dias: porDia, agregados, listas: estavel({ linhas: d.lines.length, equipamentos: d.machines.length, catalogos: d.catalogs.length,
        turnos: d.shifts.length, paradas: d.downtimeCodes.length }) })));
    })()`);
    assert.deepEqual(erros, []);
    assert.ok(numeros.dias.length >= 1, 'o cenário tem ao menos um dia de produção');
    assert.ok(numeros.dias.every(x => x.agg), 'todo dia tem o agregado calculado');
    return numeros;
  } finally {
    if (browser) await browser.close();
    srv.close();
  }
}

(async () => {
  const numeros = await capturar();
  if (process.argv.includes('--gravar')) {
    fs.writeFileSync(referencia, JSON.stringify(numeros, null, 2) + '\n', { flag: 'wx' });
    console.log('ok referência dos números da Produção capturada (' + numeros.dias.length + ' dia(s))');
  } else {
    const antes = JSON.parse(fs.readFileSync(referencia, 'utf8'));
    // as contagens de cadastro podem mudar com a troca de origem; os números calculados não
    const { listas: _a, ...sem } = numeros, { listas: _b, ...semAntes } = antes;
    assert.deepEqual(sem, semAntes);
    console.log('ok Produção: OEE, A, P, Q, paradas, hora a hora e agregados do mês iguais à referência');
  }
})().catch(erro => { console.error(erro); process.exitCode = 1; });

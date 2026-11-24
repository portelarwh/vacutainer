const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const { server } = require('../../scripts/servidor-testes.cjs');

const referencia = path.resolve(__dirname, '../amostras/gel-numeros-antes.json');
// O cenário tem produção no mês, mas não tem pesagens. As cinco pesagens fictícias
// exercitam as composições existentes no cadastro do cenário, sem gravar nas bases.
const pesagens = [
  { dia: '2026-11-08', local: 'MAQUINA GEL - VADG01', kg: 1.84 },
  { dia: '2026-11-08', local: 'MAQUINA GEL - PURGA MULTIPLA - CABEÇOTE A', kg: 0.61 },
  { dia: '2026-11-09', local: 'TULLIP A - CAIXA REJEIÇÃO (VATU01)', kg: 2.27 },
  { dia: '2026-11-09', local: 'SPRAY SILICA - VASS01', kg: 1.32 },
  { dia: '2026-11-09', local: 'MAQUINA GEL - BARRIL', nb: 2 },
];

function unidades(kg) {
  assert.ok(Number.isFinite(kg));
  return { g: +((kg * 1000).toFixed(3)), kg: +(kg.toFixed(6)) };
}

function porDiaCategoria(linhas) {
  const totais = {};
  for (const { dia, categoria, liquido } of linhas) {
    const diaTotal = totais[dia] ??= { T: 0, B: 0, P: 0 };
    diaTotal[categoria] += liquido;
  }
  return Object.fromEntries(Object.entries(totais).map(([dia, cats]) => [
    dia, Object.fromEntries(Object.entries(cats).map(([cat, kg]) => [cat, unidades(kg)])),
  ]));
}

async function capturar() {
  const srv = server();
  await new Promise((resolve, reject) => {
    srv.once('error', reject);
    srv.listen(0, '127.0.0.1', resolve);
  });
  let browser;
  try {
    browser = await chromium.launch(require('./chromium.cjs')());
    const ctx = await browser.newContext({ timezoneId: 'America/Sao_Paulo' });
    await ctx.route(/^https?:\/\/(?!127\.0\.0\.1:)/, route => route.abort());
    const erros = [];
    async function abrir(rota, titulo, pronto) {
      const page = await ctx.newPage();
      page.on('pageerror', erro => erros.push(erro.message));
      await page.clock.setFixedTime(new Date('2026-11-09T15:00:00Z'));
      await page.goto('http://127.0.0.1:' + srv.address().port + '/Plataforma.html?demo=1#/' + rota);
      const quadro = page.locator(`iframe[title="${titulo}"]`);
      await quadro.contentFrame().locator('body').waitFor({ state: 'attached', timeout: 30000 });
      const frame = await (await quadro.elementHandle()).contentFrame();
      await frame.waitForFunction(pronto, null, { timeout: 30000 });
      return frame;
    }

    const oee = await abrir('oee?tab=launch', 'Módulo Produção', () => window.vacPagina?.pronto() && GelTurno.ctx()?.equips().length);
    const producao = await oee.evaluate(apontamentos => {
      const C = GelTurno.ctx();
      return apontamentos.map(({ dia, local, kg, nb }) => {
        const e = C.equips().find(eq => eq.descs.some(d => d.local === local));
        const desc = e.descs.find(d => d.local === local);
        const c = GelTurno.calc({ e: e.codigo, d: desc.id, cat: '360060', kg, nb }, dia, C);
        return { dia, local, categoria: c.scat, bruto: c.gross, liquido: c.gel };
      });
    }, pesagens);

    const frame = await abrir('gel', 'Módulo Gestão de Gel', () => typeof S !== 'undefined' && S && Object.keys(S.prodlog || {}).length && GelProd.oee);
    const gel = await frame.evaluate(apontamentos => {
      const cat = S.catalogs.find(c => String(c.num) === '360060').id;
      const dados = new Map();
      for (const { dia, local, kg, nb } of apontamentos) {
        const e = equipList().find(eq => eq.descs.some(d => d.local === local));
        const desc = e.descs.find(d => d.local === local);
        const turno = (S.prodlog[dia] ??= { date: dia, turns: {}, orders: [] }).turns;
        (turno._dia ??= { eq: [] }).eq.push({ e: e.id, d: desc.id, cat, kg, nb });
        const nomes = dados.get(dia) || new Map();
        nomes.set(e.id + '|' + desc.id, local);
        dados.set(dia, nomes);
      }
      memoClear();
      const linhas = [...dados].flatMap(([dia, nomes]) => recEquipScrap(S.prodlog[dia], dia).ents
        .filter(en => en.turn === '_dia')
        .map(en => ({ dia, local: nomes.get(en.e + '|' + en.d), categoria: en.c.scat, bruto: en.c.gross, liquido: en.c.gel })));
      const { T } = dbData('2026-11-01', '2026-11-30', {}, 'mes', 'gel');
      return { linhas, consumo: { nosTubosBons: T.inT, teorico: T.teo, baixado: T.bx, real: T.realCov, scrap: T.scrGel } };
    }, pesagens);

    assert.deepEqual(erros, []);
    const formatar = linhas => {
      assert.equal(linhas.length, pesagens.length);
      assert.ok(linhas.every(l => l.local && l.liquido > 0));
      return {
        porDiaLocal: linhas.map(({ bruto, liquido, ...info }) => ({ ...info, bruto: unidades(bruto), liquido: unidades(liquido) })),
        porDiaCategoria: porDiaCategoria(linhas),
      };
    };
    assert.ok(gel.consumo.real > 0, 'o mês do cenário tem consumo: ' + JSON.stringify(gel));
    return {
      gel: formatar(gel.linhas),
      producao: formatar(producao),
      consumoNovembro: Object.fromEntries(Object.entries(gel.consumo).map(([k, kg]) => [k, unidades(kg)])),
    };
  } finally {
    if (browser) await browser.close();
    srv.close();
  }
}

(async () => {
  const numeros = await capturar();
  if (process.argv.includes('--gravar')) {
    fs.writeFileSync(referencia, JSON.stringify(numeros, null, 2) + '\n', { flag: 'wx' });
    console.log('ok referência do scrap dos dois motores e do consumo mensal capturada');
  } else {
    assert.deepEqual(numeros, JSON.parse(fs.readFileSync(referencia, 'utf8')));
    console.log('ok Gel e Produção: scrap por dia, local e categoria (g e kg) e consumo mensal iguais à referência');
  }
})().catch(erro => { console.error(erro); process.exitCode = 1; });

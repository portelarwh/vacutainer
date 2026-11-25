// Atualiza o cenário fictício da demonstração (bloco dados/cenario) com o formato e os resumos (exports)
// do código atual: abre cada módulo em modo demonstração, deixa ele completar a própria base e publicar o
// exports, e devolve as datas ao dia de referência do cenário. Não usa base real; não muda regra.
// node scripts/cenario-demo.cjs            → mostra o que muda
// node scripts/cenario-demo.cjs --gravar   → grava o bloco e atualiza os metadados
const fs = require('node:fs'), path = require('node:path');
const { chromium } = require('playwright');
const H = require('./html.cjs'); const { server } = require('./servidor-testes.cjs');
const ORDEM = ['portal', 'oee', 'perdas', 'gel', 'paradas', 'equip', 'inic', 'linha'];   // a Produção antes de quem lê o exports dela
const ID = 'cenario-atualizacao';
const complementos = [];
/* Dados fictícios que o cenário antigo não tinha, aplicados pelo próprio código da página (nada é calculado aqui).
   Só entram uma vez: se o dado já existe, nada muda. */
async function COMPLEMENTO([mod, id, desloc]) {
  // o dia da demonstração é o do cenário deslocado para hoje: as datas criadas aqui partem de hoje e voltam no fim
  if (mod === 'portal') {
    // a demonstração troca o localStorage da página; um quadro vazio da mesma origem grava no armazenamento de verdade da demonstração
    const gravar = cad => { const f = document.createElement('iframe'); document.body.appendChild(f); f.contentWindow.localStorage.setItem('vac.demo.' + id + '.base.cad', JSON.stringify(cad)); f.remove(); };
    const cad = vacDemo.ler('cad'), notas = []; cad.parametros = cad.parametros || {}; const g = cad.parametros.gel = cad.parametros.gel || {};
    // Gel lê a produção do turno pela Produção a partir de 30 dias antes do dia do cenário (Fase 4 · 4d)
    if (!g.registroPelaProducaoDesde) { const d = new Date(); d.setDate(d.getDate() - 30); g.registroPelaProducaoDesde = d.toISOString().slice(0, 10); notas.push('Gel lê a produção pela Produção desde ' + g.registroPelaProducaoDesde); }
    // Gel no formato v2 (cadastro central): formato de 01/10/2025 e os 14 locais de descarte da página antiga, ligados aos equipamentos.
    // As datas partem de hoje (deslocamento do cenário) e voltam no fim.
    if (!(cad.gel && (cad.gel.formatos || []).length)) {
      const mover = iso => new Date(Date.parse(iso + 'T12:00:00Z') + desloc * 864e5).toISOString().slice(0, 10), de = mover('2025-10-01');
      cad.schemaVersion = 2;
      cad.equipamentos = cad.equipamentos || [];
      if (!cad.equipamentos.some(e => e.codigo === 'EQ13')) cad.equipamentos.push({ codigo: 'EQ13', nome: '3H Delay', linha: 'VAC', tipo: 'equipamento', ativo: true });
      cad.gel = { formatos: [{ de, ate: null, embalagemG: 75, folhaPurgaG: 5, sobraBarrilKg: 1.6,
        tubos: { '100': { tuboG: 4.779, gelG: 0.936, aditivoG: 0.02, tampaRolhaG: 2.3 }, '75': { tuboG: 3.56, gelG: 0.834, aditivoG: 0.015, tampaRolhaG: 2.3 } },
        motivo: '', por: 'demo', em: de + 'T08:00:00' }], locais: [] };
      const LOC = [['EQ03', 'MAQUINA GEL - VADG01', 'tubogel', 'T'], ['EQ08', 'SPRAY SILICA - VASS01', 'spray', 'T'], ['EQ13', '3H DELAY - VARG01', 'spray', 'T'],
        ['EQ07', 'PACKOUT - VAEB01', 'completo', 'T'], ['EQ01', 'TULLIP A - CAIXA REJEIÇÃO (VATU01)', 'completo', 'T'], ['EQ01', 'TULLIP A - FUNIL BERÇO (VATU01)', 'completo', 'T'],
        ['EQ02', 'TULLIP B - CAIXA REJEIÇÃO (VATU02)', 'completo', 'T'], ['EQ02', 'TULLIP B - FUNIL BERÇO (VATU02)', 'completo', 'T'],
        ['EQ03', 'MAQUINA GEL - PURGA MULTIPLA - CABEÇOTE A', 'gel', 'P'], ['EQ03', 'MAQUINA GEL - PURGA MULTIPLA - CABEÇOTE B', 'gel', 'P'],
        ['EQ03', 'MAQUINA GEL - PURGA DE AR - CABEÇOTE A', 'gel', 'P'], ['EQ03', 'MAQUINA GEL - PURGA DE AR - CABEÇOTE B', 'gel', 'P'],
        ['EQ03', 'SALA GEL - PURGA DE AR', 'gel', 'P'], ['EQ03', 'MAQUINA GEL - BARRIL', 'barril', 'B']];
      LOC.forEach(([eq, local, comp, categoria], i) => {
        const n = String(i + 1).padStart(4, '0');
        cad.gel.locais.push({ id: 'L-' + n, equipamento: eq, local, comp, categoria, motivos: [], embalagemG: null, ordem: i + 1, ativo: true });
      });
      notas.push('Gel v2: formato de ' + de + ' e ' + LOC.length + ' locais');
    }
    // perdas teóricas do gel (Administração › Gel): sem vigência o teórico não é calculado; o cenário traz uma vigência para todos os formatos
    if (!(g.processo || []).length) {
      const de = new Date(Date.parse('2000-01-01T12:00:00Z') + desloc * 864e5).toISOString().slice(0, 10);
      g.processo = [{ from: de, g: 0.98, pT: 2.2406, pB: 0.7352, pP: 0.5252 }];
      notas.push('perdas teóricas do gel vigentes desde 01/01/2000');
    }
    if (g.cabecotes == null || g.barrisPorCabecote == null) {
      const cfg = vacDemo.ler('gel')?.config;
      g.cabecotes ??= cfg?.lineHeads ?? 2;
      g.barrisPorCabecote ??= cfg?.barrelsPerHead ?? 2;
      notas.push('cabeçotes e barris por cabeçote no cadastro');
    }
    if ('formatos' in g || cad.equipamentos.some(e => e.gel?.descs || e.gel?.tara != null)) {
      delete g.formatos;
      for (const e of cad.equipamentos) {
        if (!e.gel) continue;
        delete e.gel.descs;
        delete e.gel.tara;
        if (!Object.keys(e.gel).length) delete e.gel;
      }
      notas.push('cópias antigas de formato e locais removidas');
    }
    // base limpa (24/11/2026): perfil sem assuntos só vê; os perfis do cenário trazem os assuntos explícitos da semente (DEFAULT_PERFIS)
    if ((cad.perfis || []).some(p => !p.assuntos)) {
      for (const p of cad.perfis) if (!p.assuntos) { const s = DEFAULT_PERFIS.find(x => x.codigo === p.codigo); p.assuntos = s ? JSON.parse(JSON.stringify(s.assuntos)) : Object.fromEntries(ADM_ASSUNTOS.map(a => [a.id, 'ver'])); }
      notas.push('perfis com os assuntos explícitos');
    }
    if (!notas.length) return '';
    gravar(cad); return 'cadastro: ' + notas.join('; ');
  }
  if (mod === 'oee') {
    // caixas do MES do dia, pelo importador do servidor (CSV): o lote da ordem, a mesma produção lançada (881 caixas de 1.000),
    // com a pausa das 07:00 às 07:30 da parada fictícia do Paradas
    const db = Store.S.db, dia = db.productionDays.find(d => !d.deleted).date;
    if ((db.server && db.server.segments || []).length) { if ((db.server.dayLot || {})[dia + '|6275187']) return ''; await Srv.markDayLot(dia, '6275187', 'normal'); return 'MES: lote 6275187 confirmado no dia'; }
    const [a, m, dd] = dia.split('-').map(Number), p2 = n => String(n).padStart(2, '0');
    const hora = s => { const h = Math.floor(s / 3600), mi = Math.floor(s % 3600 / 60), se = s % 60, ap = h < 12 ? 'AM' : 'PM'; return `${m}/${dd}/${a} ${h % 12 || 12}:${p2(mi)}:${p2(se)}.000 ${ap}`; };
    const L = ['Time,VAEB01_MES_Catalogo_Atual,VAEB01_MES_Lote_Atual,VAEB01_MES_Caixa_Atual', `${m}/${dd}/${a} 12:00:01.000 AM,360060.000,6275187.000,0.0`];
    let t = 6 * 3600 + 60; for (let c = 1; c <= 881; c++) { if (t >= 7 * 3600 && t < 7.5 * 3600) t = 7.5 * 3600; L.push(`${hora(t)},,,${c}.0`); t += 64; }
    const an = ServerData.analyze(ServerData.parseCsv(L.join('\n')));
    await Srv.importData(an, { file: 'mes-demonstracao.csv', lines: L.length - 1, ignored: 0, lots: ['6275187'] }, { '6275187': 'normal' });
    await Srv.markDayLot(dia, '6275187', 'normal');   // o lote confirmado no dia (Lotes do dia), como faria a pessoa
    return `MES: ${an.boxes} caixas em ${an.segments.length} trecho(s) do lote 6275187 (importador do servidor), lote confirmado no dia`;
  }
  if (mod === 'gel') {
    // o lote da ordem na programação do Gel (PCP), para os tubos e o gel por ordem saírem da produção do turno
    S.config.pcp = S.config.pcp || {}; const L = S.config.pcp.lots = S.config.pcp.lots || [];
    if (L.some(l => String(l.lot) === '6275187')) return '';
    const cat = (S.catalogs || []).find(c => String(c.num) === '360060'); if (!cat) return '';
    L.push({ id: 'pcp-demo-6275187', lot: '6275187', ord: '100234567', cat: cat.id, size: 881000 });
    if (typeof memoClear === 'function') memoClear(); render(); return 'PCP: lote 6275187 da ordem 100234567 (catálogo 360060, 881.000 tubos)';
  }
  if (mod === 'perdas') {
    // KKBC_ORD no formato da controladoria (1.9.0): o desvio de cada componente dividido em estrutura, empregado e preço de input
    const r2 = x => Math.round(x * 100) / 100; let n = 0;
    for (const r of B.rows) { if (r.dEmp != null || r.dSap == null) continue; r.dEstr = r2(r.dSap * 0.4); r.dPreco = r2(r.dSap * 0.1); r.dEmp = r2(r.dSap - r.dEstr - r.dPreco); n++; }
    if (n) renderAll(); return n ? `KKBC: ${n} linha(s) com estrutura, empregado e preço de input (soma = desvio)` : '';
  }
  return '';
}

(async () => {
  const srv = server(); await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const U = `http://127.0.0.1:${srv.address().port}/__modulos__/`, arquivo = Object.fromEntries(H.registry().map(m => [m.id, m.file]));
  const b = await chromium.launch(require('../testes/plataforma/chromium.cjs')()); const ctx = await b.newContext(); const erros = [];
  await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.abort());
  const cen = JSON.parse(H.current().text('dados/cenario'));
  const hoje = new Date(), DESLOC = Math.round((Date.parse(hoje.getFullYear() + '-' + String(hoje.getMonth() + 1).padStart(2, '0') + '-' + String(hoje.getDate()).padStart(2, '0') + 'T12:00:00Z') - Date.parse(cen.referencia + 'T12:00:00Z')) / 864e5);   // o mesmo deslocamento que a demonstração aplica
  try {
    for (let volta = 1; volta <= 2; volta++) for (const mod of ORDEM) {   // 2ª volta: quem lê o exports dos outros já vê o novo
      const p = await ctx.newPage(); p.on('pageerror', e => erros.push(mod + ': ' + e.message)); p.on('dialog', d => d.accept());
      await p.goto(U + encodeURI(arquivo[mod]) + '?demo=' + ID); await p.waitForTimeout(2500);
      if (volta === 1) { const c = await p.evaluate(COMPLEMENTO, [mod, ID, DESLOC]); if (c) complementos.push(mod + ': ' + c); await p.waitForTimeout(800); }
      await p.evaluate(m => { if (!vacDemo.ativo) throw new Error('demonstração não ativa'); vacDemo.publicar(m); }, mod); await p.close();
    }
    console.log(complementos.join('\n') || 'nenhum complemento necessário');
    // o kit troca o localStorage da página na demonstração; o que ele gravou é lido pelo storageState do contexto
    const st = await ctx.storageState(); const ls = Object.fromEntries((st.origins[0] || { localStorage: [] }).localStorage.map(x => [x.name, x.value]));
    const dia = ls[`vac.demo.${ID}.dia`]; if (!/^\d{4}-\d{2}-\d{2}$/.test(dia || '')) throw new Error('dia da demonstração não encontrado');
    const dias = Math.round((Date.parse(dia + 'T12:00:00Z') - Date.parse(cen.referencia + 'T12:00:00Z')) / 864e5);
    const meses = (+dia.slice(0, 4) - +cen.referencia.slice(0, 4)) * 12 + +dia.slice(5, 7) - +cen.referencia.slice(5, 7);
    // o inverso do mover() do vacDemo: datas voltam ao dia de referência
    const volta = x => { if (Array.isArray(x)) return x.map(volta); if (x && typeof x === 'object') { const o = Object.fromEntries(Object.entries(x).map(([k, v]) => [volta(k), volta(v)])); if (typeof x.t0 === 'string' && typeof x.base === 'number' && typeof x.m === 'string') o.base = x.base - dias * 1440; return o; }   /* o minuto absoluto do trecho do servidor volta junto */ if (typeof x !== 'string') return x;
      if (/^\d{4}-\d{2}-\d{2}(?:T.*|\|.*)?$/.test(x)) { const t = new Date(Date.parse(x.slice(0, 10) + 'T12:00:00Z') - dias * 864e5);   /* também a chave "data|…" (dia ↔ lote), como o mover() */ return t.toISOString().slice(0, 10) + x.slice(10); }
      if (/^(?:cat|sv|tg)_.*\d{4}-\d{2}-\d{2}/.test(x)) return x.replace(/\d{4}-\d{2}-\d{2}/, d => volta(d));   /* ids derivados do cadastro com a data da vigência, como o mover() */
      if (/^\d{4}-\d{2}$/.test(x)) { const d = new Date(+x.slice(0, 4), +x.slice(5, 7) - 1 - meses, 1); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); } return x; };
    const novo = JSON.parse(JSON.stringify(cen)); const resumo = [];
    for (const mod of ['cad', ...ORDEM]) { const t = ls[`vac.demo.${ID}.base.${mod}`]; if (!t) { resumo.push(`${mod}: não publicou (mantido)`); continue; }
      const base = volta(JSON.parse(t)), ex0 = (cen.bases[mod] || {}).exports || {}, ex1 = base.exports || {};
      novo.bases[mod] = base; resumo.push(`${mod}: exports ${ex0.appVersion || '?'} → ${ex1.appVersion || '?'}; chaves ${Object.keys(ex0).length} → ${Object.keys(ex1).length}`); }
    console.log(resumo.join('\n')); if (erros.length) console.log('erros de página:\n' + [...new Set(erros)].join('\n'));
    if (process.argv.includes('--gravar')) {
      const tmp = path.join(require('node:os').tmpdir(), 'cenario-' + process.pid + '.json'); fs.writeFileSync(tmp, JSON.stringify(novo));
      require('node:child_process').execFileSync(process.execPath, [path.join(__dirname, 'bloco.mjs'), 'dados/cenario', tmp], { stdio: 'inherit' }); fs.rmSync(tmp, { force: true });
    }
  } finally { await b.close(); srv.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

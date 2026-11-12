// SQDCP · Gestão Diária (Produção 2.4.58): layout novo com os mesmos números.
// Lê, na demonstração (dados fictícios, data fixa), as 25 posições pela função do quadro (Sqdcp.relatorio): título, valor, unidade,
// meta, estado e nota; compara com testes/bases/sqdcp-referencia.json (gravada ANTES da mudança de layout).
// Depois confere a tela: cabeçalho em três blocos, resumo executivo (5 pilares, mesmos resultados das posições), 25 cards com posição,
// ícone, valor, meta/estado, prévia e engrenagem acessível, vaga livre tracejada, filtros, CSV, prévia A4, Modo Reunião (sem alterar a base),
// pilar ampliado, erro de fonte com "Tentar novamente", 3 larguras × 2 temas sem rolagem lateral, sem erro no console.
//   node testes/tsqdcp_layout.js --gravar   grava a referência (só antes de mudar a tela)
// Código 1 se falhar.
const path = require('path'), fs = require('fs'); const RAIZ = path.resolve(__dirname, '..') + '/';
const { chromium } = require('playwright');
const REF = RAIZ + 'testes/bases/sqdcp-referencia.json', SAI = RAIZ + 'testes/saida/sqdcp-layout/'; fs.mkdirSync(SAI, { recursive: true });
const GRAVAR = process.argv.includes('--gravar');
const errs = []; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA ') + m); if (!c) errs.push(m); };
const LER = () => {
  const out = {};
  for (const l of ['S', 'Q', 'D', 'C', 'P']) for (let n = 0; n < 5; n++) {
    const k = l + n, r = Sqdcp.relatorio(k);
    out[k] = r ? { titulo: r.titulo, valor: r.valor == null ? null : +(+r.valor).toFixed(6), unidade: r.unidade || '', meta: r.meta == null ? null : r.meta, estado: r.estado, nota: String(r.nota || '').replace(/Fonte atualizada: .*$/, '').trim() } : null;
  }
  return out;
};
(async () => {
  const b = await chromium.launch(); const pe = [];
  const nova = async (w, h, tema) => {
    const c = await b.newContext({ viewport: { width: w, height: h }, colorScheme: tema }); await c.clock.setFixedTime(new Date('2026-11-11T12:00:00'));
    const o = await c.newPage(); o.on('pageerror', e => pe.push(e.message)); o.on('console', m => { if (m.type() === 'error') pe.push('console: ' + m.text()); });
    await o.goto('file://' + RAIZ + 'paginas/OEE-Vacutainer.html'); await o.waitForTimeout(900);
    await o.evaluate(() => { document.querySelectorAll('.overlay').forEach(x => x.remove()); Demo.enterExample(); }); await o.waitForTimeout(900);
    // dias da demonstração valendo nas contas (como no trelatorios) e as fontes lidas antes de comparar
    await o.evaluate(async () => { const d0 = Store.S.db; for (const k of ['productionDays', 'monthPlans', 'calendar']) (d0[k] || []).forEach(x => delete x.demo); Engine.bumpConfig();
      Sqdcp.demo(); Sqdcp.UI.dia = '2026-11-10'; go('sqdcp'); await Sqdcp.carregarFontes(true); render(); }); await o.waitForTimeout(1200);
    return { c, o };
  };
  const { c, o } = await nova(1440, 900, 'light');
  const atual = await o.evaluate(LER);
  ok(Object.keys(atual).length === 25, '25 posições lidas pela função do quadro');
  if (GRAVAR) { fs.writeFileSync(REF, JSON.stringify(atual, null, 1)); console.log('referência gravada em ' + path.relative(RAIZ, REF)); await b.close(); process.exit(errs.length ? 1 : 0); }
  const ref = JSON.parse(fs.readFileSync(REF, 'utf8'));
  const dif = Object.keys(ref).filter(k => JSON.stringify(ref[k]) !== JSON.stringify(atual[k]));
  ok(!dif.length, 'mesmos títulos, valores, unidades, metas, estados e notas das 25 posições da referência' + (dif.length ? ': ' + dif.map(k => k + ' ' + JSON.stringify(ref[k]) + ' → ' + JSON.stringify(atual[k])).join(' ; ') : ''));
  const T = await o.evaluate(async () => {
    const w = t => new Promise(r => setTimeout(r, t)), q = s => document.querySelector(s), qa = s => [...document.querySelectorAll(s)], out = {};
    out.pagina = !!q('.sqdcp-page'); out.titulo = (q('.sqdcp-head h2') || {}).textContent || '';
    out.blocos = qa('.sqdcp-head > .sqdcp-hb').length; out.configurar = !!q('#sqConfigurar');
    out.filtros = ['#sqDia', '#sqLinha', '#sqTurno', '#sqP'].every(s => q('.sqdcp-filtros ' + s)); out.acoes = ['#sqFontes', '#sqCsv', '#sqReuniao'].every(s => q('.sqdcp-acoes ' + s));
    // resumo executivo: mesmos resultados das posições
    const R = qa('.sqdcp-resumo [data-sq-pilar]'); out.resumoN = R.length; out.resumoOrdem = R.map(x => x.dataset.sqPilar).join('');
    out.resumoIgual = R.every(x => { const k = x.dataset.sqFonteKey; if (!k) return /—/.test(x.querySelector('.sqdcp-rv').textContent) && /Não informado/.test(x.textContent);
      const card = q(`.sq-vaga[data-sq-key="${k}"] .sqdcp-card-value`); return card && x.querySelector('.sqdcp-rv').textContent.trim() === card.textContent.trim(); });
    // cards
    const cards = qa('.sq-vaga'); out.cards = cards.length; out.colunas = qa('.sq-coluna').map(c => c.dataset.sqPilar).join('');
    const conf = cards.filter(c => !c.classList.contains('sqdcp-card-empty'));
    out.cardOk = conf.every(c => c.querySelector('.sq-pos') && c.querySelector('.sqdcp-ic svg') && c.querySelector('h4') && c.querySelector('[data-sq-previa]') && c.querySelector('button.sqdcp-gear[data-sq-editar]'));
    out.gearA11y = qa('button.sqdcp-gear').every(b => /Configurar posição [SQDCP] \d/.test(b.getAttribute('aria-label') || '') && b.title);
    out.semTextoConfig = !qa('.sq-vaga button').some(b => /^Configurar posição$/.test(b.textContent.trim()));
    out.minAltura = Math.min(...cards.map(c => c.getBoundingClientRect().height));
    out.cores = qa('.sq-coluna').map(c => getComputedStyle(c).getPropertyValue('--pillar-color').trim().toLowerCase()).join(',');
    // vaga livre
    const k0 = 'P4'; const cfg = JSON.parse(JSON.stringify(Store.S.db.sqdcp || {})); Actions.setSQDCPVaga(Sqdcp.UI.linha, k0, { indicador: '', formato: 'evolucao', periodo: 'dia', titulo: '', unidade: '', meta: null, sentido: 'maior', observacao: '' }, Sqdcp.UI.dia, Sqdcp.UI.turno);
    render(); await w(300); const vz = q(`.sq-vaga[data-sq-key="${k0}"]`); out.vazio = !!(vz && vz.classList.contains('sqdcp-card-empty') && /Escolher indicador/.test(vz.textContent) && !!vz.querySelector('.sqdcp-add svg') && getComputedStyle(vz).borderStyle === 'dashed');
    // estados
    out.estados = [...new Set(cards.map(c => c.dataset.sqEstado))].sort().join(',');
    out.ausenteNaoZero = cards.filter(c => c.dataset.sqEstado === 'sem').every(c => /—/.test(c.querySelector('.sqdcp-card-value').textContent) && !/^0$/.test(c.querySelector('.sqdcp-card-value').textContent.trim()));
    // filtros mantêm o valor ao atualizar
    q('#sqTurno').value = (q('#sqTurno').options[1] || {}).value || ''; q('#sqTurno').dispatchEvent(new Event('change')); await w(300);
    q('#sqFontes').click(); await w(800); out.turnoMantido = q('#sqTurno').value === Sqdcp.UI.turno && Sqdcp.UI.turno !== '';
    q('#sqTurno').value = ''; q('#sqTurno').dispatchEvent(new Event('change')); await w(300);
    // modo reunião
    const antes = JSON.stringify(Store.S.db.sqdcp || {}), rev = Store.S.rev;
    q('#sqReuniao').click(); await w(300); out.reuniao = document.body.classList.contains('sqdcp-reuniao') && !!q('.sqdcp-rbar') && ['header.vsuite', 'nav.vtabs', '#nav', '.sqdcp-head'].every(s => { const x = q(s); return !x || x.offsetParent === null; });
    out.rbar = (q('.sqdcp-rbar') || {}).textContent || '';
    const zq = q('[data-sq-zoom="Q"]'); if (zq) { zq.click(); await w(200); } out.zoom = qa('.sq-coluna').filter(c => getComputedStyle(c).display !== 'none').map(c => c.dataset.sqPilar).join('');
    const zt = q('[data-sq-zoom=""]'); if (zt) { zt.click(); await w(200); } out.zoomTodos = qa('.sq-coluna').filter(c => getComputedStyle(c).display !== 'none').length;
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); await w(200); out.saiu = !document.body.classList.contains('sqdcp-reuniao');
    out.semAlterar = JSON.stringify(Store.S.db.sqdcp || {}) === antes && Store.S.rev === rev;
    // erro de fonte com tentar de novo
    Sqdcp.fontes.perdas = { erro: 'Falha simulada de leitura' }; render(); await w(200);
    const ce = qa('.sq-vaga').find(c => c.dataset.sqEstado === 'erro'); out.erro = !!(ce && /Falha simulada/.test(ce.textContent) && ce.querySelector('[data-sq-retry]'));
    // config SQDCP
    q('#sqConfigurar').click(); await w(300); out.cfgModal = qa('.modal [data-sq-editar]').length; const cl = q('.modal [data-close]'); if (cl) cl.click(); await w(100);
    // devolve a vaga
    Store.S.db.sqdcp = cfg; render(); await w(200);
    return out;
  });
  console.log('     tela:', JSON.stringify({ ...T, rbar: T.rbar.replace(/\s+/g, ' ').slice(0, 120) }));
  ok(T.pagina && /SQDCP – Gestão Diária/.test(T.titulo) && T.blocos === 3 && T.configurar && T.filtros && T.acoes, 'cabeçalho em três blocos: título + Configurar SQDCP · filtros (data, linha, turno, coluna P) · ações (fontes, CSV, Modo Reunião)');
  ok(T.resumoN === 5 && T.resumoOrdem === 'SQDCP' && T.resumoIgual, 'resumo executivo: 5 pilares na ordem S Q D C P, com os mesmos valores das posições (ou — Não informado)');
  ok(T.cards === 25 && T.colunas === 'SQDCP', '25 posições em 5 colunas na ordem S, Q, D, C, P');
  ok(T.cardOk && T.gearA11y && T.semTextoConfig, 'cards com posição, ícone, nome, valor, Prévia / Imprimir e engrenagem com nome acessível e dica (sem o botão "Configurar posição")');
  ok(T.minAltura >= 189, `altura mínima dos cards (${Math.round(T.minAltura)} px)`);
  ok(T.cores === '#16803c,#1769d2,#d99a00,#7935b2,#c72d45', `cores dos pilares (${T.cores})`);
  ok(T.vazio, 'posição livre: card tracejado com ＋ Escolher indicador (ícone de mais)');
  ok(T.ausenteNaoZero, `sem dado mostra — (nunca 0); estados presentes: ${T.estados}`);
  ok(T.turnoMantido, 'Atualizar fontes mantém o turno escolhido');
  ok(T.reuniao && /Linha/.test(T.rbar) && /Atualizado/.test(T.rbar) && T.zoom === 'Q' && T.zoomTodos === 5 && T.saiu && T.semAlterar, 'Modo Reunião: menus escondidos, barra com data/linha/turno/atualização, pilar ampliado, volta aos cinco, Esc sai, nada gravado');
  ok(T.erro, 'erro de carregamento da fonte: mensagem e Tentar novamente');
  ok(T.cfgModal === 25, `Configurar SQDCP lista as 25 posições (${T.cfgModal})`);
  // CSV e prévia A4 (iguais a antes)
  const [dl] = await Promise.all([o.waitForEvent('download', { timeout: 15000 }).catch(() => null), o.click('#sqCsv')]);
  ok(!!dl && /SQDCP_Seguranca_QN_/.test(dl.suggestedFilename()), 'CSV · Segurança e QN baixa o arquivo');
  await o.click('[data-sq-previa="D2"]'); await o.waitForTimeout(800);
  const pv = await o.evaluate(() => { const f = document.querySelector('#sqPreview'); const d = f && f.contentDocument; return d ? { folha: !!d.querySelector('.sq-folha'), page: /size:A4 landscape/.test(d.documentElement.innerHTML) } : null; });
  ok(pv && pv.folha && pv.page, 'Prévia / Imprimir: folha A4 paisagem com a configuração da posição');
  await o.screenshot({ path: SAI + 'previa.png' });
  await c.close();
  // larguras e temas
  for (const [w, h] of [[390, 900], [1100, 900], [1440, 900]]) for (const tema of ['light', 'dark']) {
    const x = await nova(w, h, tema); const sx = await x.o.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    ok(sx <= 1, `${w} px ${tema}: sem rolagem lateral (${sx})`); await x.o.screenshot({ path: SAI + `quadro-${w}-${tema}.png`, fullPage: true });
    if (w === 1440) { await x.o.click('#sqReuniao'); await x.o.waitForTimeout(300); await x.o.screenshot({ path: SAI + `reuniao-${tema}.png` }); }
    await x.c.close();
  }
  ok(!pe.length, 'sem erro de página nem no console' + (pe.length ? ': ' + pe.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(errs.length ? `\n${errs.length} falha(s)` : '\nsem erros'); process.exit(errs.length ? 1 : 0);
})();

// Calendário de produção no Portal (13/11/2026; Portal 1.9.35, Produção 2.4.73). Dados fictícios.
// Portal: tipo "calendario" (código = data AAAA-MM-DD, tipo, motivo), validação da data, lista com o dia da semana.
// Produção: o CadSync aplica o dia (origin 'portal'), o Plano do mês trava o dia ("edite no Portal"), dia com lançamento não vira
// "sem produção" (aviso), dia inativado no Portal sai, exports.calendario com a origem. node testes/tcalendario.js → "sem erros"
const path = require('path'); const RAIZ = path.resolve(__dirname, '..') + '/';
const { chromium } = require('playwright');
const errs = []; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA ') + m); if (!c) errs.push(m); };
(async () => {
  const b = await chromium.launch(), c = await b.newContext({ viewport: { width: 1440, height: 1000 } }), pe = [];
  // ---------- Portal
  const p = await c.newPage(); p.on('pageerror', e => pe.push('Portal: ' + e.message)); p.on('dialog', d => d.accept());
  await p.goto('file://' + RAIZ + 'paginas/Portal.html#geral'); await p.waitForTimeout(700);
  const P = await p.evaluate(async () => { enterTest(); await new Promise(r => setTimeout(r, 300)); Lock.on(Cad.D.seguranca.senhaHash);
    const ruim = cadValidarItem('calendario', { codigo: '25/12/2026', tipo: 'sem produção', nome: 'Natal' }, Cad.D, { novo: true });
    const bom = cadValidarItem('calendario', { codigo: '2026-12-25', tipo: 'sem produção', nome: 'Natal' }, Cad.D, { novo: true });
    Cad.ops([{ acao: 'criação', tipo: 'calendario', codigo: '2026-12-25', item: { codigo: '2026-12-25', tipo: 'sem produção', nome: 'Natal', ativo: true }, motivo: 'teste' },
      { acao: 'criação', tipo: 'calendario', codigo: '2026-12-26', item: { codigo: '2026-12-26', tipo: 'dia extra', nome: 'Sábado extra', ativo: true }, motivo: 'teste' }]);
    await new Promise(r => setTimeout(r, 300)); Cad.ui.sec = 'calendario'; App.show('cad'); await new Promise(r => setTimeout(r, 300));
    const lista = (document.querySelector('#cadMain table') || {}).innerText || '';
    return { ruim, bom, n: (Cad.D.calendario || []).length, lista: lista.replace(/\s+/g, ' '), ver: PAGE.versao, ajuda: typeof AJUDA_CAMPO['calendario.tipo'] === 'string' && typeof CAT_AJUDA.calendario === 'string' }; });
  ok(P.ver === '1.9.37' && P.ruim.length && !P.bom.length, 'Portal 1.9.37: data fora do formato AAAA-MM-DD é recusada; data certa passa');
  ok(P.n === 2 && /25\/12\/2026/.test(P.lista) && /Sex/.test(P.lista) && /sem produção/i.test(P.lista) && /dia extra/i.test(P.lista) && /Natal/.test(P.lista) && P.ajuda, 'Portal: Calendário de produção com data, dia da semana, tipo e motivo; ⓘ nos campos e na categoria');
  await p.close();

  // ---------- Produção
  const o = await c.newPage(); o.on('pageerror', e => pe.push('Produção: ' + e.message)); o.on('dialog', d => d.accept());
  await o.goto('file://' + RAIZ + 'paginas/OEE-Vacutainer.html'); await o.waitForTimeout(900);
  const R = await o.evaluate(() => { document.querySelectorAll('.overlay').forEach(x => x.remove()); Demo.enterExample(); document.querySelectorAll('.overlay').forEach(x => x.remove());
    const d = Store.S.db, LN = 'line_vac', aud = [], audit = x => aud.push(x);
    // dia com lançamento (não vira "sem produção")
    const comLanc = d.productionDays.filter(x => !x.deleted && Engine.dayEntries(x)).map(x => x.date).sort().pop(); d.productionDays.forEach(x => { if (x.date === comLanc) x.demo = false; });
    const C = { rev: 9, calendario: [{ codigo: '2026-12-25', tipo: 'sem produção', nome: 'Natal', ativo: true }, { codigo: '2026-12-26', tipo: 'dia extra', nome: 'Sábado extra', ativo: true }, { codigo: '2026-12-27', tipo: 'dia extra', nome: 'Domingo extra', ativo: true }, { codigo: comLanc, tipo: 'sem produção', nome: 'teste', ativo: true }] };
    const R1 = CadSync.aplicar(d, C, audit); const m = date => (d.calendar || []).find(x => !x.deleted && x.date === date && x.lineId === LN) || null;
    const natal = m('2026-12-25'), extra = m('2026-12-26'), lanc = m(comLanc);
    let trava = ''; try { Actions.setPlanDay('2026-12', LN, '2026-12-25', 'normal', ''); } catch (e) { trava = e.message; }
    let inicio = ''; try { Actions.startProduction('2026-12-27', LN, 1); } catch (e) { inicio = 'erro: ' + e.message; } const domingo = Store.S.db.productionDays.find(x => !x.deleted && x.date === '2026-12-27'), mDom = m('2026-12-27');
    const ex = Exports.build(d, '2026-12-27').calendario.find(x => x.dia === '2026-12-25');
    C.calendario[0].ativo = false; C.rev = 10; const R2 = CadSync.aplicar(d, C, audit);
    return { natal: natal && [natal.kind, natal.reason, natal.origin], extra: extra && [extra.kind, extra.origin], lanc: !!(lanc && lanc.origin === 'portal'), ign: d.settings.calIgnorados, R1, trava, ex, depois: m('2026-12-25'), R2, inicio, domingo: !!domingo, mDom: mDom && [mDom.kind, mDom.origin], aud: aud.filter(x => x.field === 'calendário').length, ver: APP_VERSION }; });
  ok(R.ver === '2.4.74' && JSON.stringify(R.natal) === '["off","Natal","portal"]' && JSON.stringify(R.extra) === '["extra","portal"]' && R.R1.calendario === 3 && R.aud >= 2, 'Produção 2.4.74: o CadSync aplica o dia sem produção e o dia extra do Portal (origin portal, com auditoria)');
  ok(!R.lanc && Array.isArray(R.ign) && R.ign.length === 1 && R.R1.calendarioIgnorado === 1, 'dia com lançamento não vira "sem produção" (ignorado, com aviso)');
  ok(!R.inicio && R.domingo && JSON.stringify(R.mDom) === '["extra","portal"]', 'iniciar produção num dia extra do Portal (domingo) cria o dia e mantém a marca do Portal (revisão Codex P1)' + (R.inicio ? ': ' + R.inicio : ''));
  ok(/vem do Calendário de produção do Portal/.test(R.trava), 'Plano do mês: o dia que veio do Portal fica travado (' + (R.trava || 'não travou').slice(0, 80) + '…)');
  ok(R.ex && R.ex.origem === 'portal' && R.ex.tipo === 'sem produção', 'exports.calendario diz a origem do dia (portal)');
  ok(R.depois === null && R.R2.calendario === 1, 'dia inativado no Portal: a marca que veio de lá sai da Produção');
  ok(!pe.length, 'sem erro de página' + (pe.length ? ': ' + [...new Set(pe)].slice(0, 3).join(' | ') : ''));
  await b.close(); if (errs.length) { console.log(`\n${errs.length} falha(s)`); process.exit(1); } console.log('\nsem erros');
})().catch(e => { console.error(e); process.exit(1); });

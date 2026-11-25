// Timeline Operacional da Produção (2.5.0) · docs/timeline-operacional.md e docs/timeline-operacional-acceptance-criteria.md (CA-01 a CA-20).
// Regras de tempo e de sobreposição (motor Timeline), as três origens (operador, MES, tags), a tela (filtros, KPIs, faixas, tooltip,
// detalhes, legenda, zoom), atualização sem recarregar e desempenho (30 dias, 50 máquinas, 100.000 eventos em até 5 s).
// Modo exemplo, dados fictícios. node testes/ttimeline.js → "sem erros"; código 1 se falhar. Prints em testes/saida/timeline/
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const RAIZ = path.resolve(__dirname, '..'), PG = 'file://' + RAIZ + '/__modulos__/OEE-Vacutainer.html';
const SAI = path.join(RAIZ, 'testes', 'saida', 'timeline'); fs.mkdirSync(SAI, { recursive: true });
const errs = []; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA ') + m); if (!c) errs.push(m); };
const D = '2031-03-10', D2 = '2031-03-11';   // segunda e terça, sem nada lançado no exemplo
(async () => {
  const b = await chromium.launch(); const pe = [];
  const novo = async (w = 1440, h = 900) => { const ctx = await b.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage(); p.on('pageerror', e => pe.push(e.message)); p.on('dialog', d => d.accept('teste'));
    await p.goto(PG); await p.waitForTimeout(1300); await p.evaluate(() => { document.querySelectorAll('.overlay').forEach(o => o.remove()); Demo.enterExample(); document.querySelectorAll('.overlay').forEach(o => o.remove()); }); await p.waitForTimeout(500); return p; };
  /* cenário: um turno de 480 min (06:00–14:00) em D, com paradas do operador, um intervalo sem caixas do MES e tags */
  const CENARIO = ([D, fechado]) => Store.mutate(B => {
    /* os códigos de parada que este cenário usa (antes vinham da semente de fábrica; agora o cadastro é que os traz) */
    for (const x of ProdCad.montar({ paradas: [
      { codigo: 'REF', nome: 'Refeição', categoria: 'Planejada', subcategoria: 'Pausa', cor: '#8d99a6', planejada: true, descontaPlanejado: true, pareto: false, duracaoManual: true },
      { codigo: 'FME', nome: 'Falha mecânica', categoria: 'Quebra', subcategoria: 'Mecânica', cor: '#c22a2a', afetaD: true, duracaoManual: true },
      { codigo: 'FMA', nome: 'Falta de material', categoria: 'Logística', subcategoria: 'Material', cor: '#b8620a', afetaD: true, duracaoManual: true },
      { codigo: 'OUT', nome: 'Outros', categoria: 'Outros', subcategoria: '', cor: '#94a2b1', afetaD: true, exigeObservacao: true, duracaoManual: true }] }).downtimeCodes)
      if (!B.downtimeCodes.some(c => c.code === x.code)) B.downtimeCodes.push(x);
    const cod = c => B.downtimeCodes.find(x => x.code === c).id, M = B.machines.filter(m => !m.deleted && m.role !== 'oee'), at = '2031-03-10T15:00:00.000Z', meta = { createdAt: at, createdBy: 'Operador Teste', updatedAt: at, updatedBy: 'Operador Teste', status: 'ativo', revision: 1 };
    B.productionDays = B.productionDays.filter(d => d.date !== D);
    B.productionDays.push({ ...meta, id: 'day_tl', date: D, lineId: 'line_vac', machineId: 'mac_line', status: fechado ? 'fechado' : 'em lançamento', responsible: 'Operador Teste', note: '', scrapMode: 'shift', scrapDay: null, gapJustification: '', origin: 'manual',
      shifts: [{ id: 'ps_tl', shiftId: 'sh_1', status: fechado ? 'fechado' : 'em lançamento', snap: { name: 'Turno Teste', start: '06:00', end: '14:00', breaks: [] }, intervals: [], initialCatalogId: null }],
      events: [
        { id: 'ev_fme', codeId: cod('FME'), start: 490, end: 515, minutes: null, equipmentId: M[0].id, note: 'Falta de sílica identificada no abastecimento.\nAguardando recebimento do material.', manual: true, ...meta },
        { id: 'ev_fma', codeId: cod('FMA'), start: 540, end: 580, minutes: null, equipmentId: M[1].id, note: 'Sem tampa na linha', manual: true, ...meta },
        { id: 'ev_ref', codeId: cod('REF'), start: 660, end: 680, minutes: null, note: 'Refeição', manual: true, ...meta },
        { id: 'ev_semhora', codeId: cod('OUT'), start: null, end: null, minutes: 7, productionShiftId: 'ps_tl', note: '', manual: true, ...meta }] });
    B.server = { segments: [], gaps: [], mes: [], lotClass: {}, imports: [], dayLot: {} }; B.timeline = { tagMap: [], tagEvents: [], imports: [], comments: {} };
  });
  
  try {
    /* ================= regras (motor) ================= */
    { const p = await novo(); await p.evaluate(CENARIO, [D, true]);
      const r = await p.evaluate(D => { const T = Timeline, J = T.janelas(db(), 'line_vac', D, D).todas[0], f = { a: J.a, b: J.b, lineId: 'line_vac', agora: J.b + 600 }, m = T.modelo(db(), f), S = m.linha.segs;
        const cont = S.every((s, i) => s.b > s.a && (i === 0 ? s.a === f.a : Math.abs(s.a - S[i - 1].b) < 1e-9)) && S[S.length - 1].b === f.b;
        const maq = m.rows.map(x => ({ id: x.m.id, t: T.totais(x.segs), n: x.segs.length }));
        return { t: m.t, total: m.total, soma: m.soma, util: m.util, cont, n: S.length, estados: S.map(s => s.state + ':' + Math.round(s.b - s.a)), semH: m.semHorario.length, oc: m.nOcorr, maior: m.maiorPerda && m.maiorPerda.m.id, m0: db().machines.filter(x => x.role !== 'oee')[0].id, m1: db().machines.filter(x => x.role !== 'oee')[1].id, maq }; }, D);
      ok(r.total === 480 && r.t.prod === 395 && r.t.parada === 25 && r.t.bloq === 40 && r.t.ociosa === 20, `CA-03/CA-04: turno de 480 min = 395 Produzindo + 25 Parada + 40 Bloqueada + 20 Ociosa ${JSON.stringify(r.t)}`);
      ok(Math.abs(r.soma - r.total) < 1e-9 && Math.abs(r.util - 395 / 480) < 1e-9, 'CA-18: a soma dos quatro estados é exatamente o período; % de produção útil = Produzindo ÷ total');
      ok(r.cont && r.n === 7, `CA-11/CA-12: trechos contínuos, sem buraco e sem sobreposição (${r.estados.join(' ')})`);
      ok(r.semH === 1, 'parada lançada só com a duração é avisada (não cabe na linha do tempo e não some em silêncio)');
      const a = r.maq.find(x => x.id === r.m0), c = r.maq.find(x => x.id === r.m1), o = r.maq.find(x => x.id !== r.m0 && x.id !== r.m1);
      ok(r.maq.length >= 3 && a.t.parada === 25 && a.t.bloq === 0 && c.t.bloq === 40 && c.t.parada === 0 && o.t.parada === 0 && o.t.prod === 480, 'CA-05: cada máquina tem a própria faixa, independente das outras');
      ok(r.oc === 3 && r.maior === r.m1, 'ocorrências do período e máquina com maior tempo de perda');
      // sobreposição das três origens
      const s = await p.evaluate(D => { const T = Timeline, base = T.inicioDia(D), h = (hh, mm) => `${D}T${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00`;
        Store.mutate(B => { B.server.gaps.push({ lineId: 'line_vac', from: h(8, 0), to: h(8, 50) }); B.server.segments.push({ lineId: 'line_vac', lot: 'LT-TESTE', cat: '367895', t0: h(6, 0), t1: h(8, 0), n: 10 }); B.server.imports.push({ at: '2031-03-10T16:00:00.000Z', by: 'Importador Teste' });
          B.timeline.tagEvents.push({ id: 'tg1', m: 'mac_line', t: 'STOP', s: h(8, 20), e: h(9, 10), by: 'Importador Teste', at: '2031-03-10T16:00:00.000Z' }); });
        const J = T.janelas(db(), 'line_vac', D, D).todas[0], m = T.modelo(db(), { a: J.a, b: J.b, lineId: 'line_vac', agora: J.b + 600 });
        const de = (x, y) => m.linha.segs.filter(q => q.a >= base + x - 1e-6 && q.b <= base + y + 1e-6).map(q => (q.ev ? q.ev.src + '/' + q.ev.code : 'padrao') + ':' + q.state + ':' + Math.round(q.b - q.a));
        const seg = m.linha.segs.find(q => q.ev && q.ev.id === 'ev_fme'); return { t: m.t, soma: m.soma, t8: de(480, 600), perd: T.sobrepostos(m.linha.evs, seg).map(e => e.src + '/' + e.code), prodMes: de(360, 480) }; }, D);
      ok(s.t8.join(' ') === 'mes/SEM-CAIXA:parada:10 op/FME:parada:25 mes/SEM-CAIXA:parada:15 tag/STOP:parada:10 op/FMA:bloq:40', `CA-11: operador validado > MES > tags, com o intervalo dividido onde só parte se sobrepõe (${s.t8.join(' ')})`);
      ok(s.t.parada === 60 && s.t.bloq === 40 && Math.abs(s.soma - 480) < 1e-9, 'CA-11: sobreposição não duplica duração (Parada 60 min, e não 25 + 50 + 50)');
      ok(s.perd.includes('mes/SEM-CAIXA') && s.perd.includes('tag/STOP'), 'os registros que não prevaleceram continuam disponíveis (auditoria)');
      ok(s.prodMes.join() === 'mes/CAIXAS:prod:120', 'CA-07: as caixas do MES entram na mesma estrutura como produção');
      // validado × não validado diante de uma parada registrada pelo MES
      const v = await p.evaluate(D => { const T = Timeline, base = T.inicioDia(D), quem = () => { const J = T.janelas(db(), 'line_vac', D, D).todas[0], m = T.modelo(db(), { a: J.a, b: J.b, lineId: 'line_vac', agora: J.b + 600 }); const q = m.linha.segs.find(x => x.a <= base + 500 && x.b > base + 500); return q.ev.id; };
        Store.mutate(B => { const d = B.productionDays.find(x => x.id === 'day_tl'); d.events.push({ id: 'ev_srv', codeId: B.downtimeCodes.find(x => x.code === 'TRL').id, start: 495, end: 505, minutes: null, srvSetup: true, manual: false, note: 'Troca (servidor)', createdBy: 'Servidor', createdAt: '2031-03-10T15:00:00.000Z' }); });
        const fechado = quem(); Store.mutate(B => { const d = B.productionDays.find(x => x.id === 'day_tl'); d.status = 'em lançamento'; d._rev = (d._rev || 0) + 1; }); const aberto = quem();
        Store.mutate(B => { const d = B.productionDays.find(x => x.id === 'day_tl'); d.status = 'fechado'; d.events = d.events.filter(e => e.id !== 'ev_srv'); }); return { fechado, aberto }; }, D);
      ok(v.fechado === 'ev_fme' && v.aberto === 'ev_srv', 'CA-11: o operador só vence a parada do MES quando o dia está validado (fechado) ' + JSON.stringify(v));
      // tags: em aberto, sem classificação, mapa com vigência, precisão em segundos
      const g = await p.evaluate(([D, D2]) => { const T = Timeline, base = T.inicioDia(D), h = (d, hh, mm, ss) => `${d}T${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss || 0).padStart(2, '0')}`, M = db().machines.filter(m => !m.deleted && m.role !== 'oee');
        Store.mutate(B => { B.timeline.tagEvents.push({ id: 'tg_ab', m: M[2].id, t: 'IDLE', s: h(D, 13, 0), e: null }, { id: 'tg_x', m: M[3].id, t: 'XYZ-99', s: h(D, 10, 0), e: h(D, 10, 30) }, { id: 'tg_s', m: M[4].id, t: 'FAULT', s: h(D, 10, 0, 15), e: h(D, 10, 0, 45) },
          { id: 'tg_d1', m: M[5].id, t: 'STOP', s: h(D, 7, 0), e: h(D, 7, 30) }, { id: 'tg_d2', m: M[5].id, t: 'STOP', s: h(D2, 7, 0), e: h(D2, 7, 30) });
          B.timeline.tagMap.push({ id: 'tm1', code: 'STOP', description: 'Bloqueio por acúmulo', machineId: M[5].id, state: 'bloq', category: 'Fluxo', priority: 3, active: true, validFrom: D2, validTo: null }); });
        const J = T.janelas(db(), 'line_vac', D, D).todas[0], m = T.modelo(db(), { a: J.a, b: J.b, lineId: 'line_vac', agora: base + 13 * 60 + 30 }), row = i => m.rows.find(r => r.m.id === M[i].id), tot = i => T.totais(row(i).segs);
        const m2 = T.modelo(db(), { a: T.inicioDia(D2) + 360, b: T.inicioDia(D2) + 840, lineId: 'line_vac', agora: base + 99999 }), r5 = T.totais(m2.rows.find(r => r.m.id === M[5].id).segs);
        const ab = row(2).segs.find(s => s.ev && s.ev.id === 'tg_ab'); const sc = row(3).segs.find(s => s.ev && s.ev.id === 'tg_x');
        return { aberto: ab && ab.ev.open && ab.b - ab.a, gravado: db().timeline.tagEvents.find(x => x.id === 'tg_ab').e, abertos: m.abertos, sem: [...m.semMapa.keys()], scEstado: sc && sc.state, scFlag: sc && sc.ev.semClasse, seg: tot(4).parada, d1: tot(5), d2: r5, soma4: Object.values(tot(4)).reduce((a, x) => a + x, 0) }; }, [D, D2]);
      ok(g.aberto === 30 && g.gravado === null && g.abertos === 1, 'evento em aberto: mostrado até o horário atual, sem gravar término');
      ok(g.sem.join() === 'XYZ-99' && g.scEstado === 'parada' && g.scFlag === true, 'tag sem classificação: avisada e destacada, nunca escondida');
      ok(Math.abs(g.seg - 0.5) < 1e-9 && Math.abs(g.soma4 - 480) < 1e-9, 'CA-14: precisão de segundos (30 s = 0,5 min) e soma exata');
      ok(g.d1.parada === 30 && g.d1.bloq === 0 && g.d2.bloq === 30 && g.d2.parada === 0, 'mapa de tags com vigência: o evento antigo mantém o estado que valia na data dele');
      // filtros recalculam (CA-02) e duração recalculada (CA-10)
      const f = await p.evaluate(D => { const T = Timeline, J = T.janelas(db(), 'line_vac', D, D).todas[0], M = db().machines.filter(m => !m.deleted && m.role !== 'oee'), mk = x => T.modelo(db(), { a: J.a, b: J.b, lineId: 'line_vac', agora: J.b + 600, ...x });
        const tudo = mk({}).t, tag = mk({ origem: 'tag' }).t, op = mk({ origem: 'op' }).t, fme = mk({ tipo: 'FME' }).t, maq = mk({ machineId: M[1].id }), meio = T.modelo(db(), { a: J.a + 120, b: J.a + 240, lineId: 'line_vac', agora: J.b + 600 });
        Store.mutate(B => { const e = B.productionDays.find(x => x.id === 'day_tl').events.find(x => x.id === 'ev_fme'); e.end = 530; }); const dep = mk({ origem: 'op' }).t;
        Store.mutate(B => { const e = B.productionDays.find(x => x.id === 'day_tl').events.find(x => x.id === 'ev_fme'); e.end = 515; });
        return { tudo, tag, op, fme, maqRows: maq.rows.length, maqT: maq.t, meio: meio.t, meioTot: meio.total, dep }; }, D);
      ok(f.tag.parada === 50 && f.tag.bloq === 0 && f.op.parada === 25 && f.op.bloq === 40 && f.fme.parada === 25 && f.fme.bloq === 0 && f.fme.ociosa === 0, 'CA-02: origem e tipo de parada recalculam a linha do tempo');
      ok(f.maqRows === 1 && f.maqT.bloq === 40, 'CA-02: filtro de máquina deixa só a faixa dela');
      ok(f.meioTot === 120 && f.meio.parada === 60 && f.meio.bloq === 40 && f.meio.prod === 20, 'CA-03/CA-14: período personalizado (08:00–10:00) reflete exatamente o intervalo pedido');
      ok(f.dep.parada === 40, 'CA-10: mudar o horário da ocorrência recalcula a duração (25 → 40 min)');
      // importação de tags
      const i = await p.evaluate(D => { const T = Timeline, M = db().machines.filter(m => !m.deleted && m.role !== 'oee'), txt = `Máquina;Tag;Início;Fim;Comentário\n${M[6].code};stop;10/03/2031 11:00;;Sensor travado\n${M[6].name};RUN;2031-03-10 11:30:00;2031-03-10 12:00:00;\nNAO-EXISTE;STOP;10/03/2031 11:00;10/03/2031 11:10;\n${M[6].code};STOP;10/03/2031 12:00;10/03/2031 11:00;`;
        const l = T.lerTags(db(), txt), n0 = db().timeline.tagEvents.length; const a = Store.mutate((B, au) => T.gravarTags(B, l.ok, 'Importador Teste', 'tags.csv', au));
        const l2 = T.lerTags(db(), `${M[6].code};STOP;10/03/2031 11:00;10/03/2031 11:20`); const c = Store.mutate((B, au) => T.gravarTags(B, l2.ok, 'Importador Teste', 'tags2.csv', au)); const e = db().timeline.tagEvents.find(x => x.m === M[6].id && x.t === 'STOP');
        return { ok: l.ok.length, erros: l.erros.length, novos: a.novos, alt: c.alterados, novos2: c.novos, total: db().timeline.tagEvents.length - n0, fim: e.e, aud: db().auditLog.filter(x => x.entity === 'tags da timeline').length }; }, D);
      ok(i.ok === 2 && i.erros === 2 && i.novos === 2 && i.alt === 1 && i.novos2 === 0 && i.total === 2 && /T11:20/.test(i.fim) && i.aud === 2, 'CA-06/CA-07: importar tags (recusa linhas inválidas; reimportar fecha o evento em aberto sem duplicar; fica na auditoria)');
      await p.close(); }

    /* ================= tela ================= */
    { const p = await novo(1440, 900); await p.evaluate(CENARIO, [D, true]);
      await p.evaluate(D => { App.tl.date = D; App.tl.modo = 'turno'; go('timeline'); }, D); await p.waitForSelector('#tloCv'); await p.waitForTimeout(300);
      const t = await p.evaluate(() => ({ leg: [...document.querySelectorAll('.tlo-leg span')].slice(0, 4).map(s => s.textContent.trim()), cores: ['prod', 'parada', 'bloq', 'ociosa'].map(e => getComputedStyle(document.querySelector('.tlo-leg .tlo-sw.' + e)).backgroundColor),
        k: Object.fromEntries([...document.querySelectorAll('[data-tlk]')].map(e => [e.dataset.tlk, e.querySelector('.v').textContent.replace(/\s+/g, ' ').trim()])), rot: [...document.querySelectorAll('[data-tlk] .l')].map(e => e.textContent.trim()),
        filtros: [...document.querySelectorAll('.tlo-f .f > span')].map(e => e.textContent.trim()), labs: document.querySelectorAll('.tlo-lab .r').length, maqs: db().machines.filter(m => !m.deleted && m.role !== 'oee' && m.status !== 'inativo' && m.active !== false).length, cv: document.querySelector('#tloCv').width > 400, soma: document.querySelector('#tloSoma').textContent }));
      ok(t.leg.join() === 'Produzindo,Parada,Bloqueada,Ociosa' && new Set(t.cores).size === 4 && t.cv, `CA-01: faixa consolidada com os quatro estados, cada um com a sua cor (${t.cores.join(' ')})`);
      ok(['Período', 'Data', 'Turno', 'Linha', 'Máquina', 'Tipo de parada', 'Origem do registro'].every(x => t.filtros.includes(x)), 'CA-02: filtros Data, Turno, Período, Linha, Máquina, Tipo de parada e Origem ' + t.filtros.join('|'));
      ok(['Tempo total do período', 'Tempo de produção útil', 'Tempo parado', 'Tempo bloqueado', 'Tempo ocioso', '% de produção útil'].every(x => t.rot.some(r => r.startsWith(x))), 'CA-03: os seis indicadores do período estão na tela');
      ok(t.k.total === '8 h 00min' && t.k.prod === '6 h 35min' && t.k.parada === '25min' && t.k.bloq === '40min' && t.k.ociosa === '20min' && /82,3/.test(t.k.util), 'CA-03/CA-04: valores do turno na tela ' + JSON.stringify(t.k));
      ok(t.labs === t.maqs && t.labs >= 5, `CA-05: uma faixa por máquina cadastrada (${t.labs})`);
      await p.screenshot({ path: path.join(SAI, 'turno-1440.png') });
      // tooltip (CA-13) e detalhes (CA-08, CA-09, CA-19)
      // plataforma 1.7.5: centraliza o gráfico antes de passar o mouse; perto do rodapé da janela o ponto pode cair sob um aviso (toast)
      await p.evaluate(() => document.querySelector('#tloCv').scrollIntoView({ block: 'center' })); await p.waitForTimeout(150);
      const pos = await p.evaluate(D => { const c = document.querySelector('#tloCv'), g = c._g, r = c.getBoundingClientRect(), M = TLV.modelo(), box = document.querySelector('#tloBox'); return { x: r.left + (Timeline.inicioDia(D) + 500 - M.a) * g.k - box.scrollLeft, y: r.top + TLV.AX + TLV.MC / 2 }; }, D);
      await p.mouse.move(pos.x, pos.y); await p.waitForTimeout(200);
      const tip = await p.evaluate(() => { const e = document.querySelector('#tloTip'); return e && !e.hidden ? e.innerText : ''; });
      ok(/Parada/.test(tip) && /08:10/.test(tip) && /08:35/.test(tip) && /25 min/.test(tip) && /FME/.test(tip) && /Falha mecânica/.test(tip) && tip.split('\n').length >= 5, 'CA-13: tooltip com estado, máquina, início, término, duração e motivo, sem clicar');
      await p.mouse.click(pos.x, pos.y); await p.waitForSelector('.modal');
      const det = await p.evaluate(() => { const m = document.querySelector('.modal'), v = k => (m.querySelector(`[data-tld="${k}"] b`) || m.querySelector(`[data-tld="${k}"]`) || {}).innerText; return { tit: m.querySelector('h2').textContent, maq: v('maquina'), est: v('estado'), mot: v('motivo'), ini: v('inicio'), fim: v('fim'), dur: v('duracao'), ori: v('origem'), resp: v('responsavel'), cri: v('criado'), alt: v('alterado'), com: m.querySelector('[data-tld="comentario"]').innerText, linha: v('linha'), cod: v('codigo') }; });
      ok(det.tit === 'Detalhes da Ocorrência' && det.est === 'Parada' && /Falha mecânica/.test(det.mot) && /10\/03\/2031 08:10/.test(det.ini) && /10\/03\/2031 08:35/.test(det.fim) && det.dur === '25 min' && det.ori === 'Operador' && det.resp === 'Operador Teste' && det.maq && det.maq !== '—', 'CA-08: detalhes com máquina, estado, motivo, início, fim, duração, origem e responsável ' + JSON.stringify(det));
      ok(det.com === 'Falta de sílica identificada no abastecimento.\nAguardando recebimento do material.', 'CA-09: o comentário aparece inteiro, com as quebras de linha');
      ok(det.ori === 'Operador' && det.resp === 'Operador Teste' && /\d{2}\/\d{2}\/\d{4}/.test(det.cri) && /\d{2}\/\d{2}\/\d{4}/.test(det.alt), 'CA-19: origem, quem registrou, criação e última alteração');
      await p.screenshot({ path: path.join(SAI, 'detalhes.png') }); await p.evaluate(() => document.querySelector('.modal [data-close]').click()); await p.waitForTimeout(200);
      // atualização sem recarregar (CA-06): cadastro, edição, exclusão, MES e tag
      const kp = () => p.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-tlk]')].map(e => [e.dataset.tlk, e.querySelector('.v').textContent.replace(/\s+/g, ' ').trim()])));
      const mut = async fn => { await p.evaluate(fn, D); await p.waitForFunction(() => document.querySelector('#tloCv') && !document.querySelector('#tloBody[aria-busy]')); await p.waitForTimeout(250); return kp(); };
      const k1 = await mut(D => Store.mutate(B => B.productionDays.find(x => x.id === 'day_tl').events.push({ id: 'ev_novo', codeId: B.downtimeCodes.find(x => x.code === 'FEL').id, start: 720, end: 750, minutes: null, note: 'Disjuntor', manual: true, createdBy: 'Operador Teste', createdAt: '2031-03-10T15:00:00.000Z' })));
      const k2 = await mut(D => Store.mutate(B => { B.productionDays.find(x => x.id === 'day_tl').events.find(x => x.id === 'ev_novo').end = 760; }));
      const k3 = await mut(D => Store.mutate(B => { B.productionDays.find(x => x.id === 'day_tl').events.find(x => x.id === 'ev_novo').deleted = true; }));
      const k4 = await mut(D => Store.mutate(B => B.server.gaps.push({ lineId: 'line_vac', from: D + 'T13:00:00', to: D + 'T13:15:00' })));
      const k5 = await mut(D => Store.mutate((B, au) => Timeline.gravarTags(B, Timeline.lerTags(B, `LINHA;BLOCKED;${D} 06:10:00;${D} 06:20:00`).ok, 'Importador Teste', 't.csv', au)));
      ok(k1.parada === '55min' && k2.parada === '1 h 05min' && k3.parada === '25min' && k4.parada === '40min' && k5.bloq === '50min', `CA-06: cadastro, edição, exclusão, MES e tag atualizam a tela sem recarregar (${[k1.parada, k2.parada, k3.parada, k4.parada, k5.bloq].join(' → ')})`);
      // tabela de ocorrências (CA-20) e comentário em evento do MES
      const oc = await p.evaluate(() => ({ cab: [...document.querySelectorAll('#tloOc th')].map(x => x.textContent), n: document.querySelectorAll('#tloOc [data-tloc]').length, l1: document.querySelector('#tloOc [data-tloc]').innerText }));
      ok(['Estado', 'Máquina', 'Motivo', 'Início', 'Fim', 'Duração', 'Origem', 'Responsável', 'Comentário'].every(x => oc.cab.includes(x)) && oc.n >= 5 && /Bloqueada/.test(oc.l1) && /40 min/.test(oc.l1), 'CA-20: quanto, qual máquina, motivo, quando, quanto durou, quem informou e o comentário, só com a linha do tempo');
      await p.evaluate(() => [...document.querySelectorAll('#tloOc [data-tloc]')].find(tr => /SEM-CAIXA/.test(tr.innerText)).click()); await p.waitForSelector('#tldCom'); await p.fill('#tldCom', 'Esteira parada para limpeza'); await p.click('#tldSalvar'); await p.waitForTimeout(500);
      const cm = await p.evaluate(() => ({ c: Object.values(db().timeline.comments)[0], aud: db().auditLog.filter(x => x.entity === 'ocorrência da timeline').pop(), tab: [...document.querySelectorAll('#tloOc [data-tloc]')].find(tr => /SEM-CAIXA/.test(tr.innerText)).innerText }));
      ok(cm.c && cm.c.text === 'Esteira parada para limpeza' && cm.c.by && cm.aud && cm.aud.after === 'Esteira parada para limpeza' && cm.aud.before === '' && /Esteira parada/.test(cm.tab), 'comentário em ocorrência do MES: gravado com autor, hora e auditoria (antes/depois)');
      // escalas (CA-14), zoom e rolagem horizontal (CA-16), legenda sempre visível (CA-17)
      const z = await p.evaluate(async D => { const box = () => document.querySelector('#tloBox'), espera = ms => new Promise(r => setTimeout(r, ms)), o = {};
        document.querySelector('[data-tlmodo="dia"]').click(); await espera(400); o.dia = TLV.modelo().total; o.diaIni = Timeline.iso(TLV.modelo().a).slice(11, 16);
        document.querySelector('[data-tlmodo="periodo"]').click(); await espera(400); const de = document.querySelector('[data-tlf="de"]'); de.value = D + 'T08:00'; de.dispatchEvent(new Event('change')); await espera(300); document.querySelector('[data-tlf="ate"]').value = D + 'T10:00'; document.querySelector('[data-tlf="ate"]').dispatchEvent(new Event('change')); await espera(400); o.per = TLV.modelo().total; o.perT = TLV.modelo().t;
        document.querySelector('[data-tlmodo="turno"]').click(); await espera(400); o.turno = TLV.modelo().total; o.fit = box().scrollWidth <= box().clientWidth + 2;
        document.querySelector('[data-tlzoom="hora"]').click(); await espera(300); o.hora = box().scrollWidth > box().clientWidth * 5; box().scrollLeft = box().scrollWidth; box().scrollTop = 9999; await espera(200);
        const l = document.querySelector('.tlo-leg').getBoundingClientRect(), bx = box().getBoundingClientRect(), lab = document.querySelector('.tlo-lab').getBoundingClientRect(), cv = document.querySelector('#tloCv').getBoundingClientRect();
        o.leg = l.bottom <= bx.top + 1 && l.height > 10 && l.top >= 0; o.labFixo = Math.abs(lab.left - bx.left) < 3; o.alinhado = Math.abs(cv.left - lab.right) < 3; o.semRolagemDaPagina = document.documentElement.scrollWidth <= innerWidth + 1; document.querySelector('[data-tlzoom="fit"]').click(); await espera(200); return o; }, D);
      ok(z.dia === 1440 && z.diaIni === '06:00' && z.per === 120 && z.perT.parada === 25 && z.perT.bloq === 40 && z.perT.prod === 55 && z.turno === 480, 'CA-14: Dia (24 h a partir do 1º turno), Turno e Período personalizado, sem perda de precisão ' + JSON.stringify(z));
      ok(z.fit && z.hora && z.semRolagemDaPagina && z.labFixo && z.alinhado, 'CA-16: Ajustar cabe na tela; no zoom Hora a rolagem é só dentro da linha do tempo, com os nomes das máquinas fixos e os horários alinhados');
      ok(z.leg, 'CA-17: a legenda continua visível ao rolar a linha do tempo para os lados e para baixo');
      // recolher máquinas, estados da interface, mapa de tags
      const e = await p.evaluate(async D => { const espera = ms => new Promise(r => setTimeout(r, ms)), o = {}; document.querySelector('#tloRec').click(); await espera(300); o.rec = document.querySelectorAll('.tlo-lab .r').length === 0 && !!document.querySelector('#tloCv'); document.querySelector('#tloRec').click(); await espera(300);
        o.avisos = [...document.querySelectorAll('[data-tlav]')].map(x => x.dataset.tlav); App.tl.modo = 'periodo'; App.tl.de = D + 'T08:00'; App.tl.ate = '2031-06-10T08:00'; render(); await espera(400); o.erro = (document.querySelector('[data-tlav="erro"]') || {}).innerText || '';
        App.tl.modo = 'dia'; App.tl.date = '2031-03-16'; render(); await espera(400); o.vazio = !!document.querySelector('[data-tlav="vazio"]') && TLV.modelo().t.ociosa === 1440; App.tl.date = D; App.tl.modo = 'turno'; render(); await espera(300); return o; }, D);
      ok(e.rec, 'máquinas recolhem e voltam; a faixa da linha continua');
      ok(e.avisos.includes('semhora') && /31 dias/.test(e.erro) && e.vazio, 'estados da tela: parada sem horário avisada, período inválido com mensagem e período sem dados explícito');
      await p.evaluate(() => document.querySelector('#tlMapa').click()); await p.waitForSelector('#tgNew'); await p.click('#tgNew'); await p.waitForSelector('#ff_code');
      await p.fill('#ff_code', 'm-alarme'); await p.fill('#ff_description', 'Alarme de porta'); await p.selectOption('#ff_state', 'bloq'); await p.click('#emOk'); await p.waitForTimeout(400);
      const mp = await p.evaluate(() => ({ m: db().timeline.tagMap.find(x => x.code === 'M-ALARME'), aud: db().auditLog.filter(x => x.entity === 'mapa de tags').length, tab: document.querySelector('#main').innerText.includes('M-ALARME') }));
      ok(mp.m && mp.m.state === 'bloq' && mp.m.validFrom && mp.m.active === true && mp.aud === 1 && mp.tab, 'mapa de tags administrável em Configurações, com auditoria');
      await p.close(); }

    /* ================= responsividade (CA-16) ================= */
    for (const [w, h, nome] of [[1366, 768, 'notebook'], [1920, 1080, 'Full HD'], [3440, 1440, 'ultrawide']]) { const p = await novo(w, h); await p.evaluate(CENARIO, [D, true]);
      await p.evaluate(D => { App.tl.date = D; App.tl.modo = 'dia'; go('timeline'); }, D); await p.waitForSelector('#tloCv'); await p.waitForTimeout(400);
      const r = await p.evaluate(() => { const box = document.querySelector('#tloBox'), cv = document.querySelector('#tloCv'), b = box.getBoundingClientRect(); return { pag: document.documentElement.scrollWidth <= innerWidth + 1, cv: cv.getBoundingClientRect().width, box: b.width, usa: b.width >= document.querySelector('#main').clientWidth - 90, kpis: document.querySelectorAll('[data-tlk]').length, leg: document.querySelector('.tlo-leg').getBoundingClientRect().width <= b.width + 2 }; });
      ok(r.pag && r.usa && Math.abs(r.cv - (r.box - 190)) < 6 && r.kpis === 8 && r.leg, `CA-16: ${nome} (${w}×${h}) sem rolagem lateral da página; a linha do tempo usa a largura (${Math.round(r.box)} px)`);
      await p.screenshot({ path: path.join(SAI, `dia-${w}.png`) }); await p.close(); }

    /* ================= desempenho (CA-15): 30 dias, 50 máquinas, 100.000 eventos ================= */
    { const p = await novo(1920, 1080);
      const r = await p.evaluate(async () => { const T = Timeline, espera = ms => new Promise(r => setTimeout(r, ms)), D0 = '2031-04-01', base = T.inicioDia(D0), pad = n => String(n).padStart(2, '0'), isoL = m => T.iso(m);
        Store.mutate(B => { const meta = { createdAt: '2031-04-01T00:00:00.000Z', createdBy: 'Teste', updatedAt: '2031-04-01T00:00:00.000Z', updatedBy: 'Teste', status: 'ativo', revision: 1 };
          B.machines = B.machines.filter(m => m.role === 'oee'); for (let i = 1; i <= 50; i++) B.machines.push({ id: 'mq' + i, lineId: 'line_vac', code: 'M' + pad(i), name: 'Máquina ' + pad(i), role: 'equipamento', ...meta });
          const tags = ['STOP', 'FAULT', 'BLOCKED', 'STARVED', 'IDLE', 'RUN'], ev = []; let s = 12345; const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
          for (let m = 1; m <= 50; m++) for (let k = 0; k < 2000; k++) { const ini = base + rnd() * 30 * 1440, dur = 0.5 + rnd() * 25; ev.push({ id: 't' + m + '_' + k, m: 'mq' + m, t: tags[Math.floor(rnd() * 6)], s: isoL(ini), e: isoL(ini + dur) }); }
          B.timeline = { tagMap: [], tagEvents: ev, imports: [], comments: {} }; B.server = { segments: [], gaps: [], mes: [], lotClass: {}, imports: [], dayLot: {} }; });
        const n = db().timeline.tagEvents.length, t0 = performance.now(); const m = T.modelo(db(), { a: base, b: base + 30 * 1440, lineId: 'line_vac' }); const tMotor = performance.now() - t0;
        const segs = m.rows.reduce((a, x) => a + x.segs.length, 0), okSoma = m.rows.every(x => Math.abs(Object.values(T.totais(x.segs)).reduce((a, v) => a + v, 0) - 30 * 1440) < 1e-6), cont = m.rows.every(x => x.segs.every((q, i) => i === 0 || Math.abs(q.a - x.segs[i - 1].b) < 1e-9));
        App.tl.modo = 'periodo'; App.tl.de = D0 + 'T00:00'; App.tl.ate = '2031-05-01T00:00'; App.tl.zoom = 'fit'; const t1 = performance.now(); go('timeline');
        for (let i = 0; i < 400 && !(document.querySelector('#tloCv') && document.querySelector('#tloCv')._g); i++) await espera(25); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); const tTela = performance.now() - t1;
        const box = document.querySelector('#tloBox'); const t2 = performance.now(); document.querySelector('[data-tlzoom="hora"]').click(); for (let i = 0; i < 30; i++) { box.scrollLeft += 4000; TLV.desenhar(); } const tRola = (performance.now() - t2) / 31;
        return { n, tMotor: Math.round(tMotor), tTela: Math.round(tTela), tRola: Math.round(tRola), segs, okSoma, cont, rows: m.rows.length, nos: document.querySelectorAll('#tloBody *').length, labs: document.querySelectorAll('.tlo-lab .r').length }; });
      ok(r.n === 100000 && r.rows === 50 && r.okSoma && r.cont, `CA-12/CA-18 em volume: 50 máquinas, 100.000 eventos, ${r.segs} trechos contínuos que somam 30 dias em cada faixa`);
      ok(r.tTela <= 5000 && r.tMotor <= 5000, `CA-15: carregamento completo em ${r.tTela} ms (cálculo ${r.tMotor} ms), limite de 5.000 ms`);
      ok(r.tRola < 120 && r.nos < 3000 && r.labs === 50, `desempenho ao rolar no zoom Hora: ${r.tRola} ms por quadro; ${r.nos} elementos na tela (o desenho é em canvas)`);
      await p.screenshot({ path: path.join(SAI, 'volume.png') }); await p.close(); }
    ok(!pe.length, 'sem erros de página' + (pe.length ? ': ' + pe.slice(0, 4).join(' | ') : ''));
  } catch (e) { ok(false, 'erro no teste: ' + (e.stack || e.message)); }
  await b.close(); console.log(errs.length ? `\n${errs.length} falha(s)` : '\nsem erros'); process.exit(errs.length ? 1 : 0);
})();

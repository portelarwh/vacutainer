/* =====================================================================
   OrdensSAP · serviço reutilizável (sem tela): leitura e consolidação do MB51 e do COOIS.
   Produção 2.1 · 05/11/2026 · regras em claude/producao-ordens-sap.md
   Não depende da página: recebe linhas (arrays) e devolve resultados. Pode ser copiado para outra página.
   ===================================================================== */
const OrdensSAP = (() => {
  const norm = s => String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const MB51 = {
    ordem: ['ordem', 'order'], material: ['material'], texto: ['texto breve material', 'texto breve de material', 'material description'],
    planta: ['planta', 'centro', 'plant'], deposito: ['deposito'], tipo: ['tipo de movimento', 'tipo movimento', 'tmv', 'movement type'],
    txtTipo: ['txt tipo movimento', 'texto tipo movimento'], doc: ['doc material', 'documento material', 'documento de material', 'material document'],
    ano: ['ano doc material', 'ano documento material', 'exercicio'], item: ['item doc material', 'item documento material'],
    dataLanc: ['data de lancamento', 'dt lancamento', 'posting date'], dataDoc: ['data do documento'], dataEntrada: ['data de entrada', 'entry date'],
    hora: ['hora do registro', 'hora'], qtd: ['qtd um registro', 'quantidade um registro', 'qtd em um registro', 'qty in unit of entry'],
    um: ['um registro', 'unidade de registro', 'unit of entry'], lote: ['lote', 'batch'], dc: ['cod debito credito', 'debito credito'],
    usuario: ['nome do usuario', 'usuario'], referencia: ['referencia'], quantidade: ['quantidade'], umb: ['unid medida basica', 'um basica']
  };
  const COOIS = {
    ordem: ['ordem'], material: ['n do material', 'no do material', 'numero do material', 'material'], texto: ['texto breve material'], lote: ['lote'],
    tipo: ['tipo de ordem'], qtdOrdem: ['quantidade da ordem'], um: ['unidade de medida'], dBaseIni: ['data base inic', 'data base inicio'],
    dBaseFim: ['data de conclusao base'], dLib: ['data de liberacao real'], dIni: ['data inicio real'], dFim: ['data fim real'],
    qConf: ['qtd confirmada'], qForn: ['qtd fornecida'], qRetr: ['qtd retrabalho'], refugo: ['refugo confirmado'], status: ['status do sistema']
  };
  const OBRIG = { mb51: ['ordem', 'material', 'tipo', 'dataLanc', 'qtd', 'um'], coois: ['ordem', 'material'] };
  /* mapeia cabeçalho → campo: igual primeiro, depois "começa com"; cada coluna e cada campo uma vez */
  function mapear(cab, ALI) {
    const n = cab.map(norm), map = {}, usadas = new Set();
    for (const pass of [0, 1]) for (const [k, al] of Object.entries(ALI)) {
      if (map[k] != null) continue;
      for (const a of al) { const i = n.findIndex((h, j) => !usadas.has(j) && h && (pass === 0 ? h === a : h.startsWith(a + ' '))); if (i >= 0) { map[k] = i; usadas.add(i); break; } }
    }
    return { map, reconhecidas: Object.entries(map).map(([k, i]) => ({ campo: k, coluna: cab[i] })), ignoradas: cab.filter((h, j) => h != null && String(h).trim() && !usadas.has(j)).map(String) };
  }
  function acharCabecalho(rows, ALI, obrig) {
    let best = null;
    for (let r = 0; r < Math.min(rows.length, 40); r++) {
      const m = mapear((rows[r] || []).map(x => x == null ? '' : x), ALI); const hits = Object.keys(m.map).length;
      if (obrig.every(k => m.map[k] != null) && (!best || hits > best.hits)) best = { r, hits, ...m };
    }
    return best;
  }
  /* texto colado → linhas: tabulação (Excel), "|" (lista do SAP) ou ";" (CSV) */
  function linhasDoTexto(txt) {
    const L = String(txt || '').replace(/\r/g, '').split('\n').filter(l => l.trim() && !/^[\s\-=|+_]+$/.test(l));
    const sep = L.some(l => l.includes('\t')) ? '\t' : L.filter(l => l.includes('|')).length > L.length / 2 ? '|' : L.some(l => l.includes(';')) ? ';' : '\t';
    return L.map(l => { let c = l.split(sep); if (sep === '|') { if (c[0].trim() === '') c.shift(); if (c.length && c[c.length - 1].trim() === '') c.pop(); } return c.map(x => x.trim()); });
  }
  function num(v) {
    if (v == null || v === '') return null; if (typeof v === 'number') return v;
    let s = String(v).trim().replace(/\s/g, ''); let neg = false;
    if (/-$/.test(s)) { neg = true; s = s.slice(0, -1); } if (/^-/.test(s)) { neg = !neg; s = s.slice(1); }
    const c = (s.match(/,/g) || []).length, d = (s.match(/\./g) || []).length;
    if (c && d) s = s.lastIndexOf(',') > s.lastIndexOf('.') ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
    else if (c) s = c > 1 ? s.replace(/,/g, '') : s.replace(',', '.');
    else if (d > 1 || /^\d{1,3}\.\d{3}$/.test(s)) s = s.replace(/\./g, '');
    const x = parseFloat(s); return isFinite(x) ? (neg ? -x : x) : null;
  }
  const pad = n => String(n).padStart(2, '0');
  function data(v) {
    if (v == null || v === '') return null;
    if (v instanceof Date && !isNaN(v)) return `${v.getFullYear()}-${pad(v.getMonth() + 1)}-${pad(v.getDate())}`;
    if (typeof v === 'number' && v > 20000 && v < 80000) { const d = new Date(Math.round((v - 25569) * 864e5)); return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`; }
    const s = String(v).trim(); let m;
    if ((m = s.match(/^(\d{4})-(\d{2})-(\d{2})/))) return `${m[1]}-${m[2]}-${m[3]}`;
    if ((m = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/))) return `${m[3]}-${pad(m[2])}-${pad(m[1])}`;
    return null;
  }
  function hora(v) { if (v == null || v === '') return ''; if (typeof v === 'number' && v < 1) { const s = Math.round(v * 86400); return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`; } if (v instanceof Date) return `${pad(v.getHours())}:${pad(v.getMinutes())}:${pad(v.getSeconds())}`; return String(v).trim(); }
  const cod = v => { const s = String(v == null ? '' : v).trim(); return /^\d+$/.test(s) ? String(BigInt(s)) : s; };
  const txt = v => v == null ? '' : String(v).trim();
  const mesDe = iso => iso ? iso.slice(0, 7) : null;
  /* ---------------- MB51 ---------------- */
  function lerMB51(rows) {
    const h = acharCabecalho(rows, MB51, OBRIG.mb51);
    if (!h) return { erro: 'Não achei o cabeçalho do MB51. Preciso pelo menos de: Ordem, Material, Tipo de movimento, Data de lançamento, Qtd. UM registro e UM registro.' };
    const M = h.map, g = (r, k) => M[k] != null ? r[M[k]] : null, out = [];
    for (let i = h.r + 1; i < rows.length; i++) {
      const r = rows[i] || []; if (!r.some(x => x != null && String(x).trim() !== '')) continue;
      if (norm(g(r, 'ordem')) === norm(h.reconhecidas.find(x => x.campo === 'ordem').coluna)) continue; // cabeçalho repetido
      out.push({ i, ordem: cod(g(r, 'ordem')), material: cod(g(r, 'material')), texto: txt(g(r, 'texto')), planta: txt(g(r, 'planta')), deposito: txt(g(r, 'deposito')),
        tipo: txt(g(r, 'tipo')), txtTipo: txt(g(r, 'txtTipo')), doc: txt(g(r, 'doc')), ano: txt(g(r, 'ano')), item: txt(g(r, 'item')),
        dl: data(g(r, 'dataLanc')), dd: data(g(r, 'dataDoc')), de: data(g(r, 'dataEntrada')), hora: hora(g(r, 'hora')), qtd: num(g(r, 'qtd')), um: txt(g(r, 'um')).toUpperCase(),
        lote: cod(g(r, 'lote')), dc: txt(g(r, 'dc')).toUpperCase(), usuario: txt(g(r, 'usuario')), quantidade: num(g(r, 'quantidade')) });
    }
    return { cabRow: h.r, cab: (rows[h.r] || []).map(x => x == null ? '' : String(x)), reconhecidas: h.reconhecidas, ignoradas: h.ignoradas, movs: out };
  }
  const chave = m => `${m.de || m.dl || ''} ${m.hora || ''} ${m.doc || ''} ${String(m.item || '').padStart(4, '0')}`;
  function processarMB51(lido, { comp, planta }) {
    const K = { linhas: 0, linhasComp: 0, m101: 0, m102: 0, outros: 0, semOrdem: 0, foraComp: 0, outraPlanta: 0, ordensDistintas: 0, ordensProduzidas: 0, combinacoes: 0, totalEstornadas: 0, parcialEstornadas: 0, saldosNegativos: 0, estornosSemRef: 0, divergencias: 0 };
    const plantas = {}, meses = {}, outrosTipos = {}, regras = [], avisos = [];
    const ign = { semOrdem: [], foraComp: [], outraPlanta: [], outrosMov: [] };
    const usados = [];
    for (const m of lido.movs) {
      K.linhas++;
      if (m.planta) plantas[m.planta] = (plantas[m.planta] || 0) + 1;
      if (m.dl) meses[mesDe(m.dl)] = (meses[mesDe(m.dl)] || 0) + 1;
      if (!m.ordem || !/\d/.test(m.ordem) || !m.tipo) { K.semOrdem++; ign.semOrdem.push(m.i); continue; }
      if (planta && m.planta && m.planta !== planta) { K.outraPlanta++; ign.outraPlanta.push(m.i); continue; }
      if (mesDe(m.dl) !== comp) { K.foraComp++; ign.foraComp.push(m.i); continue; }
      K.linhasComp++;
      if (m.tipo !== '101' && m.tipo !== '102') { K.outros++; outrosTipos[m.tipo] = (outrosTipos[m.tipo] || 0) + 1; ign.outrosMov.push(m.i); continue; }
      if (m.qtd == null) { avisos.push(`Linha ${m.i + 1}: movimento ${m.tipo} sem quantidade (ignorada).`); continue; }
      const x = { ...m };
      if (x.tipo === '102' && x.dc === 'H' && x.qtd > 0) { x.qtd = -x.qtd; if (!regras.includes('102h')) regras.push('102h'); }
      if (x.tipo === '101') K.m101++; else K.m102++;
      usados.push(x);
    }
    /* combinações Ordem + Material + UM */
    const combos = new Map();
    for (const m of usados) { const k = m.ordem + '|' + m.material + '|' + m.um; if (!combos.has(k)) combos.set(k, { ordem: m.ordem, material: m.material, texto: m.texto, um: m.um, movs: [] }); const c = combos.get(k); c.movs.push(m); if (!c.texto && m.texto) c.texto = m.texto; }
    const ordens = new Map();
    for (const c of combos.values()) {
      c.movs.sort((a, b) => chave(a) < chave(b) ? -1 : chave(a) > chave(b) ? 1 : 0);
      const s101 = c.movs.filter(m => m.tipo === '101'), s102 = c.movs.filter(m => m.tipo === '102');
      c.q101 = s101.reduce((a, m) => a + m.qtd, 0); c.q102 = s102.reduce((a, m) => a + m.qtd, 0); c.saldo = +(c.q101 + c.q102).toFixed(6);
      c.n101 = s101.length; c.n102 = s102.length; c.lotes = [...new Set(c.movs.map(m => m.lote).filter(Boolean))];
      const livres = new Set(s101.map(m => m.i)); const semVinc = [];
      for (const r of s102) {
        const cands = s101.filter(a => livres.has(a.i) && Math.abs(Math.abs(a.qtd) - Math.abs(r.qtd)) < 1e-9 && (!a.lote || !r.lote || a.lote === r.lote) && chave(a) <= chave(r));
        if (cands.length === 1) { livres.delete(cands[0].i); r.vinculo = cands[0].i; r.como = 'correspondência exata'; cands[0].estornadoPor = r.i; }
        else { r.como = cands.length > 1 ? `${cands.length} candidatos iguais` : 'sem 101 correspondente'; semVinc.push(r); }
      }
      c.estado = c.saldo > 0 ? 'valida' : c.saldo === 0 ? 'estornada' : 'negativo';
      if (c.estado === 'estornada') { for (const a of s101) if (livres.has(a.i)) { livres.delete(a.i); a.estornadoPor = 'saldo zero'; } for (const r of semVinc) r.como = 'saldo zero (estorno total)'; semVinc.length = 0; }
      const validos = s101.filter(a => livres.has(a.i));
      c.datas101 = [...new Set(s101.map(m => m.dl))].sort(); c.primeira101 = c.datas101[0] || null; c.ultima101 = c.datas101[c.datas101.length - 1] || null;
      c.dataPrincipal = null; c.dataPend = false; c.semRef = semVinc.length;
      if (c.estado === 'valida') {
        const ult = validos.length ? validos[validos.length - 1] : null;
        if (!semVinc.length) c.dataPrincipal = ult ? ult.dl : null;
        else if (ult && semVinc.every(r => chave(r) < chave(ult))) c.dataPrincipal = ult.dl; // 102 sem vínculo é anterior ao último 101: não pode tê-lo cancelado
        else { const ds = new Set(validos.map(a => a.dl)); if (ds.size === 1) c.dataPrincipal = [...ds][0]; else c.dataPend = true; }
      }
      if (semVinc.length) K.estornosSemRef += semVinc.length;
      if (!ordens.has(c.ordem)) ordens.set(c.ordem, { ordem: c.ordem, combos: [] }); ordens.get(c.ordem).combos.push(c);
    }
    const L = [];
    for (const o of ordens.values()) {
      const cs = o.combos; const neg = cs.some(c => c.estado === 'negativo'), val = cs.filter(c => c.estado === 'valida');
      o.status = neg ? 'pendencia' : val.length ? 'valida' : 'estornada';
      o.parcial = o.status === 'valida' && cs.some(c => c.n102 > 0);
      const dps = val.map(c => c.dataPrincipal).filter(Boolean).sort(); o.dataPrincipal = dps[dps.length - 1] || null; o.dataPend = val.some(c => c.dataPend);
      o.pend = []; if (neg) o.pend.push('Saldo negativo (estorno sem entrada na competência)'); if (cs.some(c => c.semRef && c.estado !== 'estornada')) o.pend.push('Estorno sem referência documental suficiente'); if (o.dataPend) o.pend.push('Data principal pendente');
      o.materiais = [...new Set(cs.map(c => c.material))]; o.texto = (cs.find(c => c.texto) || {}).texto || ''; o.lotes = [...new Set(cs.flatMap(c => c.lotes))];
      o.saldos = cs.filter(c => c.estado === 'valida').map(c => ({ material: c.material, um: c.um, qtd: c.saldo }));
      o.datas = [...new Set(cs.flatMap(c => c.datas101))].sort(); o.primeira101 = o.datas[0] || null; o.ultima101 = o.datas[o.datas.length - 1] || null;
      o.produzida = o.status === 'valida';
      K.combinacoes += cs.length; if (o.status === 'estornada') K.totalEstornadas++; if (o.parcial) K.parcialEstornadas++; if (neg) K.saldosNegativos++; if (o.produzida) K.ordensProduzidas++; if (o.pend.length) K.divergencias++;
      L.push(o);
    }
    K.ordensDistintas = L.length;
    L.sort((a, b) => a.ordem.localeCompare(b.ordem, 'pt', { numeric: true }));
    const unidades = {};
    for (const o of L) for (const s of o.saldos) { const u = unidades[s.um] || (unidades[s.um] = { qtd: 0, ordens: new Set(), combos: 0 }); u.qtd += s.qtd; u.ordens.add(o.ordem); u.combos++; }
    for (const u of Object.values(unidades)) u.ordens = u.ordens.size;
    if (planta && !plantas[planta]) avisos.push(`Nenhuma linha da planta ${planta}. Plantas no arquivo: ${Object.keys(plantas).join(', ') || '—'}.`);
    if (!K.linhasComp && Object.keys(meses).length && !meses[comp]) avisos.push(`Nenhuma linha na competência ${comp}. Meses no arquivo: ${Object.entries(meses).map(([m, n]) => m + ' (' + n + ')').join(', ')}.`);
    return { comp, planta, kpi: K, unidades, ordens: L, plantas, meses, outrosTipos, ignoradas: ign, regras, avisos };
  }
  const listaCOOIS = R => R.ordens.filter(o => o.produzida).map(o => o.ordem).sort((a, b) => a.localeCompare(b, 'pt', { numeric: true }));
  /* ---------------- COOIS ---------------- */
  function lerCOOIS(rows) {
    const h = acharCabecalho(rows, COOIS, OBRIG.coois);
    if (!h) return { erro: 'Não achei o cabeçalho do COOIS. Preciso pelo menos de: Ordem e Nº do material.' };
    const M = h.map, g = (r, k) => M[k] != null ? r[M[k]] : null, out = [];
    for (let i = h.r + 1; i < rows.length; i++) {
      const r = rows[i] || []; const o = cod(g(r, 'ordem')); if (!o || !/^\d+$/.test(o)) continue;
      out.push({ i, ordem: o, material: cod(g(r, 'material')), texto: txt(g(r, 'texto')), lote: cod(g(r, 'lote')), tipo: txt(g(r, 'tipo')), qtdOrdem: num(g(r, 'qtdOrdem')), um: txt(g(r, 'um')).toUpperCase(),
        dBaseIni: data(g(r, 'dBaseIni')), dBaseFim: data(g(r, 'dBaseFim')), dLib: data(g(r, 'dLib')), dIni: data(g(r, 'dIni')), dFim: data(g(r, 'dFim')),
        qConf: num(g(r, 'qConf')), qForn: num(g(r, 'qForn')), qRetr: num(g(r, 'qRetr')), refugo: num(g(r, 'refugo')), status: txt(g(r, 'status')) });
    }
    return { cabRow: h.r, cab: (rows[h.r] || []).map(x => x == null ? '' : String(x)), reconhecidas: h.reconhecidas, ignoradas: h.ignoradas, ordens: out };
  }
  function cruzarCOOIS(R, C) {
    const por = new Map(), dup = [];
    for (const c of C.ordens) { if (por.has(c.ordem)) dup.push(c.ordem); else por.set(c.ordem, c); }
    const esperadas = R.ordens.filter(o => o.produzida), porMB = new Map(R.ordens.map(o => [o.ordem, o]));
    const linhas = [], aus = [], div = [];
    for (const o of esperadas) {
      const c = por.get(o.ordem); if (!c) { aus.push(o.ordem); linhas.push({ ordem: o.ordem, situacao: 'ausente' }); continue; }
      const obs = [];
      if (c.material && !o.materiais.includes(c.material)) obs.push(`material do COOIS ${c.material} ≠ MB51 ${o.materiais.join('/')}`);
      const s = o.saldos.find(x => x.um === c.um && (!c.material || x.material === c.material)) || o.saldos.find(x => x.um === c.um);
      let qtd = null;
      if (c.qForn != null && s) { const r = s.qtd ? c.qForn / s.qtd : null; qtd = Math.abs(c.qForn - s.qtd) < 1e-6 ? 'igual' : r && (Math.abs(r - 1000) < 1e-6 || Math.abs(r - 0.001) < 1e-9) ? 'unidade ×1.000?' : 'diferente'; if (qtd !== 'igual') obs.push(qtd === 'diferente' ? `fornecida ${c.qForn} ${c.um} × MB51 ${s.qtd} ${s.um}` : `fornecida ${c.qForn} × MB51 ${s.qtd} ${c.um}: provável diferença de unidade (×1.000)`); }
      else if (c.qForn != null && !s) obs.push(`unidade do COOIS (${c.um}) diferente do MB51 (${o.saldos.map(x => x.um).join('/')})`);
      const retr = /ZPRW/i.test(c.tipo) || (c.qRetr || 0) > 0;
      if (obs.length) div.push(o.ordem);
      linhas.push({ ordem: o.ordem, situacao: obs.length ? 'divergente' : 'ok', qtd, obs, retrabalho: retr, tipo: c.tipo, status: c.status, dIni: c.dIni, dFim: c.dFim, qForn: c.qForn, qConf: c.qConf, um: c.um, refugo: c.refugo, qRetr: c.qRetr });
    }
    const extras = [...por.keys()].filter(k => !esperadas.some(o => o.ordem === k)).map(k => ({ ordem: k, noMB51: porMB.has(k) ? porMB.get(k).status : 'não está no MB51' }));
    const enc = esperadas.length - aus.length;
    return { esperadas: esperadas.length, encontradas: enc, ausentes: aus, extras, divergentes: div, duplicadas: dup, cobertura: esperadas.length ? enc / esperadas.length : null, linhas, porOrdem: Object.fromEntries([...por].map(([k, c]) => [k, c])) };
  }
  /* comparação entre duas versões da mesma competência (antes de substituir) */
  function comparar(A, B) {
    const ma = new Map(A.ordens.map(o => [o.ordem, o])), mb = new Map(B.ordens.map(o => [o.ordem, o]));
    const va = new Set(A.ordens.filter(o => o.produzida).map(o => o.ordem)), vb = new Set(B.ordens.filter(o => o.produzida).map(o => o.ordem));
    const out = { adicionadas: [...vb].filter(x => !va.has(x)), removidas: [...va].filter(x => !vb.has(x)), quantidades: [], novos102: [], datas: [], pendNovas: [], pendResolvidas: [] };
    const docs = o => new Set((o ? o.combos : []).flatMap(c => c.movs.filter(m => m.tipo === '102').map(m => m.doc + '/' + m.item)));
    for (const [k, b] of mb) {
      const a = ma.get(k); const sa = new Map((a ? a.saldos : []).map(s => [s.material + '|' + s.um, s.qtd]));
      for (const s of b.saldos) { const q = sa.get(s.material + '|' + s.um); if (q != null && Math.abs(q - s.qtd) > 1e-6) out.quantidades.push({ ordem: k, material: s.material, um: s.um, antes: q, depois: s.qtd }); }
      const d0 = docs(a); for (const d of docs(b)) if (!d0.has(d)) out.novos102.push({ ordem: k, doc: d });
      if (a && a.dataPrincipal !== b.dataPrincipal && va.has(k) && vb.has(k)) out.datas.push({ ordem: k, antes: a.dataPrincipal, depois: b.dataPrincipal });
      if (b.pend.length && !(a && a.pend.length)) out.pendNovas.push(k);
    }
    for (const [k, a] of ma) if (a.pend.length && !(mb.get(k) && mb.get(k).pend.length)) out.pendResolvidas.push(k);
    out.total = out.adicionadas.length + out.removidas.length + out.quantidades.length + out.novos102.length + out.datas.length + out.pendNovas.length + out.pendResolvidas.length;
    return out;
  }
  /* escolhe a aba de um arquivo com várias (MB51 ou COOIS) pelo cabeçalho */
  function escolherAba(abas, qual) { const ALI = qual === 'coois' ? COOIS : MB51, ob = OBRIG[qual]; let best = null; for (const [nome, rows] of abas) { const h = acharCabecalho(rows, ALI, ob); if (h && (!best || h.hits > best.hits)) best = { nome, rows, hits: h.hits }; } return best; }
  return { norm, num, data, linhasDoTexto, lerMB51, processarMB51, listaCOOIS, lerCOOIS, cruzarCOOIS, comparar, escolherAba, MB51, COOIS };
})();
if (typeof module !== 'undefined') module.exports = OrdensSAP;

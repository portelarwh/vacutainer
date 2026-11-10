/* =====================================================================
   Produção › Ordens (2.1 · 05/11/2026): MB51 + COOIS por competência, conciliação com o plano e a produção.
   Base própria ordens-base.json (pasta única), gravada só por esta aba; backup em 00. Backups/Ordens.
   Usa o serviço OrdensSAP (acima). Regras: claude/producao-ordens-sap.md
   ===================================================================== */
const ORD_FILE = 'ordens-base.json', ORD_BK = 'Ordens', ORD_PLANTA = '4017';
/* 2.4.11 · leitura estrita do arquivo de ordens: null só quando o arquivo não existe; qualquer outro erro sobe */
async function ordLerPasta() { const be = Store.S.backend; return be.readSiblingStrict ? be.readSiblingStrict(ORD_FILE) : be.readSibling(ORD_FILE); }
const ordMotivo = e => (e && (e.message || e.name)) || String(e);
/* junta auditoria sem repetir a mesma entrada (reenvio depois de uma gravação que chegou à pasta mas não foi confirmada) */
const ordJuntaAud = (base, novas) => { const A = (base || []).slice(), vis = new Set(A.map(a => a.em + '|' + a.acao + '|' + a.por)); for (const a of novas || []) if (!vis.has(a.em + '|' + a.acao + '|' + a.por)) { A.push(a); vis.add(a.em + '|' + a.acao + '|' + a.por); } return A; };
const Ord = {
  B: null, carregado: false, sub: 'lista',   /* 2.4.26 · PRD-02: Ordens produzidas no topo */ comp: null, planta: ORD_PLANTA, prevMB: null, prevCO: null, f: { q: '', st: '', un: '', linha: 'todas' }, fc: { q: '', sit: '' }, per: null, audPend: [], err: '',
  vazio() { return { schema: 'vac-ordens', schemaVersion: 1, rev: 0, revBy: '', revAt: null, revId: '', appVersion: '', competencias: {}, auditoria: [], exports: {} }; },
  modo() { return Store.S.mode; },
  /* 2.4.11 · E1 (revisão 08/11/2026): só "arquivo não existe" conta como ausente. Erro de leitura (rede, permissão, JSON) mostra a
     cópia deste navegador identificada e não deixa gravar na pasta. Gravação não confirmada fica pendente neste navegador
     (IDB 'ordens.pend') e é reaplicada sobre a versão da pasta ao carregar de novo ou em "Gravar de novo". */
  async carregar(force) {
    if (this.carregado && !force) return; this.err = ''; this.fonte = '';
    let remoto = null, falhou = null;
    if (this.modo() === 'pasta' && Store.S.backend && Store.S.backend.readSibling) {
      try { const t = await ordLerPasta(); if (t != null) { remoto = JSON.parse(t); this.fonte = 'pasta'; } else this.fonte = 'ausente'; }
      catch (e) { falhou = e; }
    }
    let loc = null, pend = null;
    if (this.modo() !== 'exemplo') { try { loc = await IDB.get('ordens'); pend = await IDB.get('ordens.pend'); } catch (e) { } }
    if (!(loc && loc.schema === 'vac-ordens')) loc = null;
    this.pend = pend && Array.isArray(pend.comps) && pend.comps.length ? pend : null;
    this.B = null;
    if (remoto) {
      this.B = remoto; this.B.competencias = this.B.competencias || {};
      if (this.pend && loc && loc.competencias) {   // reaplica a alteração pendente deste navegador sobre a versão da pasta
        for (const comp of this.pend.comps) { const mine = loc.competencias[comp]; if (mine) this.B.competencias[comp] = mine; else delete this.B.competencias[comp]; }
        this.audPend = (this.pend.aud || []).slice(); this.B.auditoria = ordJuntaAud(this.B.auditoria, this.audPend);
      }
    } else if (loc) { this.B = loc; if (this.fonte === 'ausente' || falhou) this.fonte = 'cache'; if (this.pend) this.audPend = (this.pend.aud || []).slice(); }
    if (falhou) this.err = `Não consegui ler ${ORD_FILE} na pasta (${ordMotivo(falhou)}). ${this.B ? 'Mostrando a cópia deste navegador' + (this.B.revAt ? ' de ' + new Date(this.B.revAt).toLocaleString('pt-BR') : '') + '. ' : ''}Nada será gravado na pasta até ela voltar a responder.`;
    else if (this.fonte === 'cache') this.err = `${ORD_FILE} ainda não existe na pasta: mostrando a cópia deste navegador. A próxima gravação cria o arquivo na pasta.`;
    if (!this.B) this.B = this.vazio(); this.B.competencias = this.B.competencias || {}; this.B.auditoria = this.B.auditoria || [];
    await this.lerWaste();
    const cs = Object.keys(this.B.competencias).sort(); if (!this.comp) this.comp = cs[cs.length - 1] || ordMesAnt(U.today());
    const cc = this.B.competencias[this.comp]; if (cc && cc.planta) this.planta = cc.planta;
    this.carregado = true;
  },
  podeImportar() { return typeof vacPode !== 'function' || vacPode('oee', 'importar'); },
  quem() { return Store.S.user || (typeof vacNomeUsuario === 'function' ? vacNomeUsuario() : '') || 'Sem nome'; },
  aud(acao, det) { const a = { em: new Date().toISOString(), por: this.quem(), acao, comp: this.comp, det }; this.B.auditoria.push(a); this.audPend.push(a); },
  async gravar(comps, motivo) {
    comps = [].concat(comps);
    const mode = this.modo(), naPasta = mode === 'pasta' && Store.S.backend && Store.S.backend.writeSibling;
    // a alteração fica pendente neste navegador até a releitura confirmar a gravação na pasta
    const ant = this.pend, todas = [...new Set([...(ant ? ant.comps : []), ...comps])];
    this.pend = { comps: todas, motivo: (ant && ant.motivo === 'substituição') || motivo === 'substituição' ? 'substituição' : motivo, em: (ant && ant.em) || new Date().toISOString(), aud: this.audPend.slice() };
    const guardaLocal = async () => { if (mode !== 'exemplo') { try { await IDB.set('ordens', this.B); await IDB.set('ordens.pend', this.pend); } catch (e) { } } };
    await guardaLocal();
    const falha = async m => { this.err = m; await guardaLocal(); setTimeout(() => { try { if (App.route === 'ordens') render(); } catch (e) { } }, 0); throw new Error(m); };   // a tela mostra o aviso de pendência
    if (naPasta) {
      let remoteTxt;
      try { remoteTxt = await ordLerPasta(); }
      catch (e) { return falha(`Não consegui ler ${ORD_FILE} na pasta (${ordMotivo(e)}); nada foi gravado. A alteração continua pendente neste navegador.`); }
      if (remoteTxt) {
        let R; try { R = JSON.parse(remoteTxt); } catch (e) { return falha(ORD_FILE + ' na pasta não é um JSON válido; nada foi gravado. A alteração continua pendente neste navegador.'); }
        const B = this.B;
        if (R.rev !== B.rev || R.revId !== B.revId) { // outra pessoa gravou: aplica só as competências pendentes sobre a versão nova
          R.competencias = R.competencias || {}; for (const comp of todas) { const mine = B.competencias[comp]; if (mine) R.competencias[comp] = mine; else delete R.competencias[comp]; }
          R.auditoria = ordJuntaAud(R.auditoria, this.audPend); this.B = R; toast('O arquivo de ordens tinha sido alterado por outra pessoa: ' + todas.map(compTxt).join(', ') + ' aplicada(s) sobre a versão mais nova.');
        }
        // backup: o diário é rotina (falha só avisa no console); antes de substituir competência é obrigatório
        const crit = this.pend.motivo === 'substituição', dia = U.today(), k = 'ordens.bk'; let ult = ''; try { ult = localStorage.getItem(k) || ''; } catch (e) { }
        if (ult !== dia || crit) {
          const t = new Date(), h = [t.getHours(), t.getMinutes(), t.getSeconds()].map(n => String(n).padStart(2, '0')), suf = Math.random().toString(36).slice(2, 5);
          const nome = `ordens-base_${dia}${crit ? '_antes-substituir_' + todas.join('_') : ''}_${h[0]}h${h[1]}m${h[2]}s_${suf}.json`;
          try { await Store.S.backend.backupSub(ORD_BK, nome, remoteTxt); try { localStorage.setItem(k, dia); } catch (e) { } }
          catch (e) { if (crit) return falha(`Não consegui salvar a cópia de ${ORD_FILE} em 00. Backups/${ORD_BK} antes de substituir (${ordMotivo(e)}); nada foi gravado. A alteração continua pendente neste navegador.`); console.warn('backup ordens', e); }
        }
      } else toast(ORD_FILE + ' ainda não existia na pasta: o arquivo foi criado.');
    }
    const b = this.B; b.rev = (b.rev || 0) + 1; b.revBy = this.quem(); b.revAt = new Date().toISOString(); b.revId = 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); b.appVersion = 'Produção ' + APP_VERSION;
    if (b.auditoria.length > 5000) b.auditoria.splice(0, b.auditoria.length - 5000);
    try { b.exports = this.exportsBuild(); } catch (e) { console.warn('exports ordens', e); }
    const txt = JSON.stringify(b);
    if (naPasta) {
      try { await Store.S.backend.writeSibling(ORD_FILE, txt); } catch (e) { return falha(`Não consegui gravar ${ORD_FILE} na pasta (${ordMotivo(e)}). A alteração continua pendente neste navegador.`); }
      // releitura: só dá como gravado se a pasta tiver exatamente esta gravação (revId)
      let ok = false, why = '';
      try { const t = await ordLerPasta(); const C = t ? JSON.parse(t) : null; ok = !!C && C.revId === b.revId; if (!ok) why = C ? `a pasta tem outra gravação (${C.revBy || '—'}, ${C.revAt ? new Date(C.revAt).toLocaleString('pt-BR') : 'sem data'})` : 'o arquivo não foi encontrado depois de gravar'; }
      catch (e) { why = 'não consegui reler o arquivo (' + ordMotivo(e) + ')'; }
      if (!ok) return falha(`A gravação de ${ORD_FILE} não foi confirmada: ${why}. A alteração continua pendente neste navegador; use "Gravar de novo".`);
    }
    this.pend = null; this.audPend = []; this.err = ''; this.fonte = naPasta ? 'pasta' : this.fonte;
    if (mode !== 'exemplo') { try { await IDB.set('ordens', b); await IDB.set('ordens.pend', null); } catch (e) { } }
  },
  async reenviar() { if (!this.pend) return; await this.gravar(this.pend.comps, this.pend.motivo); },
  exportsBuild() {
    const porOrdem = [], pend = [];
    for (const [comp, c] of Object.entries(this.B.competencias)) {
      const R = c.resultado; if (!R) continue; const X = c.coois ? c.coois.cruz : null, xl = X ? new Map(X.linhas.map(l => [l.ordem, l])) : new Map();
      for (const o of R.ordens) { const l = xl.get(o.ordem); porOrdem.push({ ordem: o.ordem, competencia: comp, dataPrincipal: o.dataPrincipal, status: o.status, parcial: o.parcial, materiais: o.materiais, texto: o.texto, lotes: o.lotes, saldos: o.saldos, pendencias: o.pend, coois: l ? { situacao: l.situacao, tipo: l.tipo, status: l.status, dIni: l.dIni, dFim: l.dFim, retrabalho: l.retrabalho } : null }); if (o.pend.length) pend.push({ sev: 1, txt: `Ordem ${o.ordem} (${compTxt(comp)}): ${o.pend.join('; ')}`, link: 'ordens=' + comp }); }
      if (X && X.ausentes.length) pend.push({ sev: 1, txt: `${X.ausentes.length} ordem(ns) de ${compTxt(comp)} sem COOIS`, link: 'ordens=' + comp });
    }
    const ult = Object.keys(this.B.competencias).sort().pop(), C = ult && this.B.competencias[ult];
    const kpis = C && C.resultado ? [['Ordens produzidas', String(C.resultado.kpi.ordensProduzidas), compTxt(ult), ''], ['Cobertura COOIS', C.coois ? fmtPct(C.coois.cruz.cobertura) : '–', '', C.coois && C.coois.cruz.cobertura < 1 ? 'bad' : '']] : [];
    /* 2.4.26 · IMP-04: MB51 e COOIS por competência, para o status por dia do Portal › Importação */
    const importacoes = [];
    for (const [comp, c] of Object.entries(this.B.competencias)) for (const [tipo, k] of [['MB51', 'mb51'], ['COOIS', 'coois']]) { const x = c[k]; if (x && x.em) importacoes.push({ tipo, comp, em: x.em, por: x.por || null, arquivo: x.arquivo || null }); }
    importacoes.sort((a, b) => a.em < b.em ? 1 : -1);
    return { exportsVersion: 1, geradoEm: new Date().toISOString(), modulo: 'ordens', porOrdem, pendencias: pend, kpis, importacoes };
  },
  cur() { return this.B && this.B.competencias[this.comp] || null; },
  /* ordens já lançadas no Waste (KKBC_ORD) e excluídas lá: lidas do exports de perdas-base.json */
  waste: null,
  async lerWaste() {
    this.waste = null; if (this.modo() !== 'pasta' || !Store.S.backend || !Store.S.backend.readSibling) return;
    try { const t = await Store.S.backend.readSibling('perdas-base.json'); if (!t) { this.waste = { erro: 'perdas-base.json não está na pasta' }; return; } const d = JSON.parse(t), vk = typeof vacExportsOk === 'function' ? vacExportsOk(d.exports) : { ok: true }; if (d.exports && !vk.ok) { this.waste = { erro: 'perdas-base.json: ' + vk.motivo }; return; } const ex = d.exports || {};   // 2.4.12 · E4: versão conferida
      const lanc = new Map((ex.porOrdem || []).map(o => [String(o.ordem).replace(/^0+/, ''), o])), excl = new Map((ex.ordensExcluidas || []).map(o => [String(o.ordem).replace(/^0+/, ''), o]));
      this.waste = { lanc, excl, em: d.updatedAt || d.revAt || null, rev: d.rev, temExports: !!d.exports }; } catch (e) { this.waste = { erro: String(e.message || e) }; }
  },
  kkbc(ordem) { const W = this.waste; if (!W || W.erro) return null; const k = String(ordem).replace(/^0+/, ''); return W.lanc.has(k) ? 'lancada' : W.excl.has(k) ? 'excluida' : 'pendente'; }
};
const ordMesAnt = d => { const [y, m] = d.slice(0, 7).split('-').map(Number), t = y * 12 + m - 2; return Math.floor(t / 12) + '-' + String(t % 12 + 1).padStart(2, '0'); };
const compTxt = c => { if (!c) return ''; const [y, m] = c.split('-'); return ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'][+m - 1] + '/' + y; };
const fmtPct = v => v == null || !isFinite(v) ? '–' : (v * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%';
const fmtQt = v => v == null || !isFinite(v) ? '–' : (+v).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
const brD = iso => iso ? iso.slice(8, 10) + '/' + iso.slice(5, 7) + '/' + iso.slice(0, 4) : '';
const ordPill = (t, c) => `<span class="pill ${c || 'none'}">${esc(t)}</span>`;
const ST_ORD = { valida: ['válida', 'ok'], estornada: ['estornada', 'none'], pendencia: ['pendência', 'warn'] };
const kkbcPill = o => { const k = Ord.kkbc(o); return k == null ? '<span class="muted small">—</span>' : k === 'lancada' ? ordPill('lançada', 'ok') : k === 'excluida' ? ordPill('excluída no Waste', 'none') : ordKkbcBtn(o); };
const ordAjuda = t => `<button type="button" class="ib" title="${esc(t)}" aria-label="Ajuda" onclick="event.preventDefault();toast(this.title)">i</button>`;

/* ---------- leitura de arquivo ou colagem ---------- */
async function ordLerEntrada(qual, file, texto) {
  if (file) {
    const nome = file.name;
    if (/\.(xlsx|xlsm|xls)$/i.test(nome)) {
      const XLSX = await Libs.loadXLSX(); const wb = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true });
      const abas = wb.SheetNames.map(n => [n, XLSX.utils.sheet_to_json(wb.Sheets[n], { header: 1, raw: true, defval: null, blankrows: false })]);
      const a = OrdensSAP.escolherAba(abas, qual); if (!a) throw new Error(`Não achei o cabeçalho do ${qual === 'coois' ? 'COOIS' : 'MB51'} em nenhuma aba de ${nome}.`);
      return { arquivo: nome + (abas.length > 1 ? ' › ' + a.nome : ''), rows: a.rows };
    }
    return { arquivo: nome, rows: OrdensSAP.linhasDoTexto(await file.text()) };
  }
  if (!String(texto || '').trim()) throw new Error('Cole o relatório (com o cabeçalho) ou escolha um arquivo.');
  return { arquivo: 'Colagem ' + new Date().toLocaleString('pt-BR').slice(0, 17), rows: OrdensSAP.linhasDoTexto(texto) };
}
const ordRowsJSON = rows => rows.map(r => (r || []).map(v => v instanceof Date ? v.toISOString() : v));

/* ---------- conciliação com o plano do PCP e a produção apurada ---------- */
function ordConciliar(comp, R, X) {
  const d = db(); const planos = (d.monthPlans || []).filter(p => !p.deleted);
  const planOrd = new Map(); for (const p of planos) for (const o of p.orders || []) if (o.order) { const k = OrdensSAP.norm(o.order).replace(/\D/g, '').replace(/^0+/, ''); if (!planOrd.has(k)) planOrd.set(k, { ...o, mes: p.month }); }
  let ex = []; try { ex = Exports.build(d, U.monthEnd(comp + '-01')).ordens || []; } catch (e) { console.warn(e); }
  const prod = new Map(ex.map(o => [String(o.ordem || '').replace(/^0+/, ''), o]));
  const cats = new Set(); for (const c of d.catalogs || []) if (c.code) cats.add(String(c.code)); const cad = typeof vacCad === 'function' ? vacCad() : null; for (const c of (cad && cad.catalogos) || []) { cats.add(String(c.codigo)); if (c.codigoSAP) cats.add(String(c.codigoSAP).replace(/^NS/i, '')); }
  const prepCad = new Set(); for (const c of (cad && cad.catalogos) || []) if (c.tipoItem === 'preparacao') { prepCad.add(String(c.codigo)); if (c.codigoSAP) prepCad.add(String(c.codigoSAP)); }
  const ehPrep = o => o.materiais.some(m => prepCad.has(String(m))) || (o.saldos.length && o.saldos.every(x => /^(L|ML|G|KG|MG)$/.test(x.um)));
  const daLinha = (o) => planOrd.has(o.ordem) || prod.has(o.ordem) || o.materiais.some(m => cats.has(String(m).replace(/^NS/i, '')) || cats.has(String(m)));
  const xl = X ? new Map(X.linhas.map(l => [l.ordem, l])) : new Map();
  const L = [];
  for (const o of R.ordens.filter(o => o.produzida)) {
    const p = planOrd.get(o.ordem), q = prod.get(o.ordem), un = o.saldos.filter(s => s.um === 'UN').reduce((a, s) => a + s.qtd, 0) || null;
    const sit = p ? 'planejada e produzida' : ehPrep(o) ? 'preparação (aditivo)' : daLinha(o) ? 'produzida fora do plano' : 'outros materiais';
    const fimReal = q && q.fimReal ? String(q.fimReal).slice(0, 10) : null; const dd = fimReal && o.dataPrincipal ? Math.round((new Date(o.dataPrincipal) - new Date(fimReal)) / 864e5) : null;
    L.push({ ordem: o.ordem, material: o.materiais.join('/'), texto: o.texto, sit, planQtd: p ? p.qty : null, planMes: p ? p.mes : null, planLote: p ? p.lot : null, mbUN: un, saldos: o.saldos, dataPrincipal: o.dataPrincipal, oeeProd: q ? q.produzido : null, fimReal, difDias: dd, coois: xl.get(o.ordem) || null, difPlano: p && p.qty && un ? un / p.qty - 1 : null, difOEE: q && q.produzido && un ? un / q.produzido - 1 : null });
  }
  const mb = new Map(R.ordens.map(o => [o.ordem, o]));
  for (const [k, p] of planOrd) if (p.mes === comp && !(mb.get(k) && mb.get(k).produzida)) { const q = prod.get(k); L.push({ ordem: k, material: p.code || '', texto: p.desc || '', sit: 'planejada não produzida', planQtd: p.qty, planMes: p.mes, planLote: p.lot, mbUN: null, saldos: [], dataPrincipal: null, oeeProd: q ? q.produzido : null, fimReal: q && q.fimReal ? String(q.fimReal).slice(0, 10) : null, obsMB: mb.get(k) ? 'no MB51: ' + ST_ORD[mb.get(k).status][0] : (q && q.produzido ? 'produção apurada no OEE, sem 101 na competência' : '') }); }
  for (const x of L) x.kkbc = x.sit === 'planejada não produzida' ? null : Ord.kkbc(x.ordem);
  const K = { semKKBC: L.filter(x => x.kkbc === 'pendente').length, planejadas: [...planOrd.values()].filter(p => p.mes === comp).length, planProd: L.filter(x => x.sit === 'planejada e produzida').length, naoProd: L.filter(x => x.sit === 'planejada não produzida').length, fora: L.filter(x => x.sit === 'produzida fora do plano').length, outros: L.filter(x => x.sit === 'outros materiais').length, prep: L.filter(x => x.sit === 'preparação (aditivo)').length, datas: L.filter(x => x.difDias != null && Math.abs(x.difDias) > 2).length };
  const pp = L.filter(x => x.sit === 'planejada e produzida' && x.planQtd && x.mbUN); K.atend = pp.length ? pp.reduce((a, x) => a + x.mbUN, 0) / pp.reduce((a, x) => a + x.planQtd, 0) : null;
  K.aderencia = K.planejadas ? L.filter(x => x.sit === 'planejada e produzida' && x.planMes === comp).length / K.planejadas : null;
  return { K, L, temPlano: planos.some(p => p.month === comp), temOEE: ex.length > 0 };
}

/* várias competências: concatena a conciliação de cada uma e refaz os indicadores do período */
function ordConcPer(cs) {
  const parts = cs.map(comp => { const c = Ord.B.competencias[comp], C = ordConciliar(comp, c.resultado, c.coois ? c.coois.cruz : null); C.L.forEach(x => x.comp = comp); return { comp, C }; });
  const L = parts.flatMap(p => p.C.L), K = {};
  for (const k of ['semKKBC', 'planejadas', 'planProd', 'naoProd', 'fora', 'outros', 'prep', 'datas']) K[k] = parts.reduce((a, p) => a + (p.C.K[k] || 0), 0);
  const pp = L.filter(x => x.sit === 'planejada e produzida' && x.planQtd && x.mbUN); K.atend = pp.length ? pp.reduce((a, x) => a + x.mbUN, 0) / pp.reduce((a, x) => a + x.planQtd, 0) : null;
  K.aderencia = K.planejadas ? L.filter(x => x.sit === 'planejada e produzida' && x.planMes === x.comp).length / K.planejadas : null;
  Ord._kkbcLista = [...new Set(L.filter(x => x.kkbc === 'pendente').map(x => x.ordem))];
  return { K, L, semPlano: parts.filter(p => !p.C.temPlano).map(p => p.comp), temOEE: parts.some(p => p.C.temOEE) };
}
/* filtro de competências (mesmo padrão do Waste): de/até, ano fiscal (out–set) e atalhos */
const ordCurM = () => U.today().slice(0, 7);
const ordFY = p => { const y = +p.slice(0, 4), m = +p.slice(5, 7); return 'FY' + String((m >= 10 ? y + 1 : y) % 100).padStart(2, '0'); };
const ordCompsImp = () => Object.keys(Ord.B.competencias).filter(k => Ord.B.competencias[k].resultado).sort();
function ordPer() { if (!Ord.per) Ord.per = { de: Ord.comp, ate: Ord.comp, fy: '', q: '' }; const P = Ord.per; return ordCompsImp().filter(k => (!P.fy || ordFY(k) === P.fy) && (!P.de || k >= P.de) && (!P.ate || k <= P.ate)); }
function ordPerTxt(cs) { const P = Ord.per || {}; if (cs.length === 1) return compTxt(cs[0]); if (P.fy && !P.de && !P.ate) return P.fy + (cs.length ? ` (${cs.length} competências)` : ''); if (!cs.length) return P.de && P.de === P.ate ? compTxt(P.de) : 'nenhuma competência no período'; return `${compTxt(cs[0])} a ${compTxt(cs[cs.length - 1])} (${cs.length} competências)`; }
function ordSetPer(k) {
  const ks = ordCompsImp(), last = ks[ks.length - 1] || '', P = Ord.per || (Ord.per = {}); P.fy = ''; P.q = k;
  if (k === 'atual') { P.de = P.ate = ordCurM(); if (!ks.includes(P.de)) toast('Ainda não há MB51 da competência atual (' + compTxt(P.de) + '). Use "Última" para a última importada.'); }
  else if (k === 'ult') P.de = P.ate = last; else if (k === 'ant') { const i = ks.length - 2; P.de = P.ate = i >= 0 ? ks[i] : last; }
  else if (k === 'tri') { P.de = ks[Math.max(0, ks.length - 3)] || ''; P.ate = last; } else if (k === 'fy') { P.de = P.ate = ''; P.fy = ordFY(ordCurM()); } else { P.de = P.ate = ''; }
  if (P.de && P.de === P.ate && ks.includes(P.de)) Ord.comp = P.de;
}
function ordPerBar() {
  ordPer(); const ks = ordCompsImp(), P = Ord.per, fys = [...new Set(ks.map(ordFY).concat([ordFY(ordCurM())]))].sort();
  const sel = (id, v) => `<select id="${id}"><option value="">—</option>${ks.map(k => `<option value="${k}" ${v === k ? 'selected' : ''}>${compTxt(k)}</option>`).join('')}</select>`;
  return `<div class="ord-bar ord-per"><label class="f"><span>Competência de</span>${sel('opDe', P.de)}</label><label class="f"><span>até</span>${sel('opAte', P.ate)}</label>
    <label class="f"><span>Ano fiscal ${ordAjuda('Ano fiscal BD: outubro a setembro (FY27 = out/2026 a set/2027).')}</span><select id="opFy"><option value="">—</option>${fys.map(f => `<option ${P.fy === f ? 'selected' : ''}>${f}</option>`).join('')}</select></label><button type="button" class="btn sm" id="opLimpar" title="Volta para a última competência e limpa busca e filtros">Limpar</button></div>
    <div class="ord-per-q"><span class="muted small">Competência:</span> ${[['atual', 'Atual', 'Mês corrente'], ['ult', 'Última', 'Última competência importada'], ['ant', 'Anterior', 'Penúltima competência importada'], ['tri', 'Últimas 3', 'As 3 últimas competências importadas'], ['fy', 'Ano fiscal atual', 'Outubro a setembro'], ['tudo', 'Todas', 'Todas as competências importadas']].map(([k, l, t]) => `<button type="button" class="btn xs${P.q === k ? ' on' : ''}" data-oper="${k}" title="${t}">${l}</button>`).join('')}</div>`;
}

/* ---------- telas ---------- */
App.views.ordens = {
  render() {
    if (!Ord.carregado) { Ord.carregar().then(() => render()); return '<section class="card section"><p class="muted">Lendo ordens…</p></section>'; }
    const c = Ord.cur(), R = c && c.resultado, X = c && c.coois ? c.coois.cruz : null;
    /* 2.4.26 · PRD-02/03: Ordens produzidas · Conciliação · Histórico · Importar (MB51 e COOIS num item só; a aba leva ao Portal › Importação, IMP-06) */
    /* 2.4.27 · PRD-02: "Ordens" = as ordens do PCP no Plano do mês (resposta do usuário em 10/11/2026); o botão leva à aba Plano do mês */
    const sub = [['lista', 'Ordens produzidas'], ['plano', 'Ordens (plano do mês)'], ['conc', 'Conciliação'], ['hist', 'Histórico de competências'], ['importar', 'Importar']];
    const naImp = Ord.sub === 'mb51' || Ord.sub === 'coois';
    const porPer = Ord.sub === 'lista' || Ord.sub === 'conc';
    const top = `<section class="card section ord-top"><div class="ord-bar">
      ${porPer ? '' : `<label class="f"><span>Competência ${ordAjuda('Mês civil da Data de lançamento do MB51. Define o período aceito e organiza o histórico. Reimportar a mesma competência substitui (nunca soma).')}</span><input type="month" id="oComp" value="${esc(Ord.comp)}"></label>
      <label class="f"><span>Planta ${ordAjuda('Planta esperada no MB51 (4017). Linhas de outra planta são contadas e ficam fora.')}</span><input id="oPlanta" value="${esc(Ord.planta)}" style="width:90px"></label>`}
      <div class="ord-st">${porPer ? '' : c && c.mb51 ? ordPill('MB51 · ' + c.mb51.arquivo + ' · ' + new Date(c.mb51.em).toLocaleDateString('pt-BR') + ' · ' + c.mb51.por, 'ok') : ordPill('MB51 não importado', 'warn')} ${porPer ? '' : c && c.coois ? ordPill('COOIS · cobertura ' + fmtPct(X.cobertura), X.cobertura < 1 ? 'warn' : 'ok') : R ? ordPill('COOIS pendente', 'pend') : ''} ${R && !porPer ? ordPill(R.kpi.ordensProduzidas + ' ordens produzidas', 'info') : ''} ${R && !porPer && Ord.waste && !Ord.waste.erro ? (n => n ? `<button class="pill crit" data-ofilt="sem KKBC" title="Ordens produzidas (MB51) sem KKBC_ORD lançada no Waste">${n} sem KKBC no Waste</button>` : ordPill('KKBC: todas lançadas', 'ok'))(R.ordens.filter(o => o.produzida && Ord.kkbc(o.ordem) === 'pendente').length) : ''} ${Ord.modo() === 'pasta' ? ordPill(ORD_FILE + ' · rev ' + (Ord.B.rev || 0), 'none') : ordPill(Ord.modo() === 'exemplo' ? 'modo exemplo: só na memória' : 'sem pasta: só neste navegador', 'warn')}</div></div>
      ${Ord.err ? `<div class="note e">${esc(Ord.err)}</div>` : ''}
      ${Ord.pend ? `<div class="note w" id="oPend"><b>Alteração pendente</b> desde ${new Date(Ord.pend.em).toLocaleString('pt-BR')}: ${esc(Ord.pend.comps.map(compTxt).join(', '))} ainda não foi confirmada na pasta. <button type="button" class="btn sm primary" id="oPendGo">Gravar de novo</button></div>` : ''}
      <div class="seg ord-sub" role="tablist">${sub.map(([k, l]) => k === 'plano' ? `<button type="button" data-oplano="1" title="Ordens do PCP do mês (Plano do mês): quantidade, janela prevista e pontuação">${l}</button>` : k === 'importar' ? `<button type="button" data-oimp-portal="1" aria-pressed="${naImp}" title="Abre o Portal › Importação › Produção: ordem recomendada e status de cada dia">${l} ↗</button>` : `<button type="button" data-osub="${k}" aria-pressed="${Ord.sub === k}">${l}</button>`).join('')}</div>${porPer ? ordPerBar() : ''}</section>
      ${naImp ? `<section class="card section ord-imp"><div class="row" style="gap:8px;align-items:center;flex-wrap:wrap"><b>Importar</b><div class="seg" role="tablist"><button type="button" data-osub="mb51" aria-pressed="${Ord.sub === 'mb51'}">1 · MB51 (movimentos, oficial)</button><button type="button" data-osub="coois" aria-pressed="${Ord.sub === 'coois'}">2 · COOIS (complementa o MB51)</button></div><span class="sp" style="flex:1"></span><a class="btn sm" href="${esc(ordPortalImpHref())}" data-oimp-portal="1">Ordem e status: Portal › Importação ↗</a></div></section>` : ''}`;
    const body = { mb51: () => this.vMB51(c), coois: () => this.vCOOIS(c), lista: () => this.vLista(c), conc: () => this.vConc(c), hist: () => this.vHist() }[Ord.sub]();
    return top + body;
  },
  entrada(qual) {
    const pode = Ord.podeImportar();
    return `<section class="card section"><header><h3>${qual === 'coois' ? 'Colar ou abrir o COOIS' : 'Colar ou abrir o MB51'}</h3></header>
      ${pode ? '' : '<div class="note w">Seu perfil não tem permissão para importar na Produção.</div>'}
      <p class="small muted">${qual === 'coois' ? 'No COOIS: lista de cabeçalhos de ordem → cole as ordens (lista ao lado) → executar → layout salvo → copie a grade inteira com o cabeçalho, ou exporte para Excel.' : 'No MB51: movimentos 101/102 da planta, com o layout salvo → copie a grade inteira com o cabeçalho (Ctrl+A, Ctrl+C), ou exporte para Excel/CSV. Pode ser um período maior (ex.: o ano todo): cada mês vira uma competência. Um arquivo com as abas MB51 e COOIS também serve: a aba certa é achada pelo cabeçalho.'}</p>
      <textarea id="oTxt" rows="5" placeholder="Cole aqui (com o cabeçalho)" ${pode ? '' : 'disabled'} style="width:100%;font-family:var(--f-mono,monospace);font-size:12px">${esc((Ord.txtIn || {})[qual] || '')}</textarea>
      <div class="ord-acts"><button class="btn primary" id="oLer" ${pode ? '' : 'disabled'}>Ler colagem</button><label class="btn ${pode ? '' : 'disabled'}">Abrir arquivo (XLSX, XLSM, CSV)<input type="file" id="oFile" accept=".xlsx,.xlsm,.xls,.csv,.txt" hidden ${pode ? '' : 'disabled'}></label></div></section>`;
  },
  kpisMB(R) {
    const K = R.kpi, it = [['Linhas recebidas', K.linhas], ['Linhas da competência', K.linhasComp], ['Movimentos 101', K.m101], ['Movimentos 102', K.m102], ['Outros movimentos', K.outros], ['Ordens distintas', K.ordensDistintas], ['Ordens produzidas', K.ordensProduzidas, 'ok'], ['Combinações (ordem+material+UM)', K.combinacoes], ['Totalmente estornadas', K.totalEstornadas], ['Parcialmente estornadas', K.parcialEstornadas], ['Saldos negativos', K.saldosNegativos, K.saldosNegativos ? 'crit' : ''], ['Estornos sem referência', K.estornosSemRef, K.estornosSemRef ? 'warn' : ''], ['Linhas sem ordem', K.semOrdem], ['Fora da competência', K.foraComp], ['Outra planta', K.outraPlanta, K.outraPlanta ? 'warn' : ''], ['Ordens com pendência', K.divergencias, K.divergencias ? 'warn' : '']];
    return `<div class="ord-k">${it.map(([l, v, c]) => `<div class="ord-kc ${c || ''}"><span>${esc(l)}</span><b>${fmtQt(v)}</b></div>`).join('')}</div>`;
  },
  resultadoMB(R, info) {
    const un = Object.entries(R.unidades).sort((a, b) => a[0] === 'UN' ? -1 : b[0] === 'UN' ? 1 : a[0].localeCompare(b[0]));
    const est = R.ordens.filter(o => o.status === 'estornada'), pend = R.ordens.filter(o => o.pend.length);
    const linhaOrd = o => `<tr class="click" data-oord="${esc(o.ordem)}"><td class="mono">${esc(o.ordem)}</td><td>${esc(o.materiais.join(', '))}</td><td class="small">${esc(o.texto)}</td><td>${o.saldos.map(s => fmtQt(s.qtd) + ' ' + esc(s.um)).join(' · ') || '–'}</td><td>${o.dataPrincipal ? brD(o.dataPrincipal) : o.dataPend ? '<span class="pill warn">pendente</span>' : '–'}</td><td class="small">${esc(o.pend.join('; '))}</td></tr>`;
    return `<section class="card section"><header><h3>Resultado ${info ? '· ' + esc(info) : ''}</h3></header>
      ${R.avisos.length ? `<div class="note w">${R.avisos.map(esc).join('<br>')}</div>` : ''}
      ${this.kpisMB(R)}
      <div class="grid g2 section"><div><h4>Totais por unidade ${ordAjuda('Saldo líquido (101 + 102) das ordens válidas. Unidades diferentes nunca são somadas.')}</h4><div class="tw"><table><tr><th>UM</th><th class="n">Quantidade líquida</th><th class="n">Ordens</th></tr>${un.map(([u, x]) => `<tr><td><b>${esc(u)}</b></td><td class="n">${fmtQt(x.qtd)}</td><td class="n">${x.ordens}</td></tr>`).join('') || '<tr><td colspan="3" class="muted">—</td></tr>'}</table></div></div>
      <div><h4>Linhas ignoradas neste cálculo ${ordAjuda('Ficam preservadas nos dados brutos; só não entram na consolidação de ordens produzidas.')}</h4><ul class="small">${Object.entries(R.outrosTipos).map(([t, n]) => `<li>Movimento ${esc(t)}: ${n}</li>`).join('')}<li>Sem ordem ou sem movimento: ${R.kpi.semOrdem}</li><li>Fora da competência: ${R.kpi.foraComp}${Object.keys(R.meses).length > 1 ? ' (' + Object.entries(R.meses).map(([m, n]) => compTxt(m) + ': ' + n).join(', ') + ')' : ''}</li><li>Outra planta: ${R.kpi.outraPlanta}${Object.keys(R.plantas).length ? ' (plantas no arquivo: ' + Object.entries(R.plantas).map(([p, n]) => p + ': ' + n).join(', ') + ')' : ''}</li></ul>
      ${R.regras.includes('102h') ? '<p class="small muted">Regra aplicada: 102 com quantidade positiva e "H" tratado como negativo.</p>' : ''}</div></div>
      <h4>Pendências <span class="muted small">${pend.length}</span></h4>${pend.length ? `<div class="tw"><table><tr><th>Ordem</th><th>Material</th><th>Descrição</th><th>Saldo</th><th>Data principal</th><th>Pendência</th></tr>${pend.map(linhaOrd).join('')}</table></div>` : '<p class="small muted">Nenhuma.</p>'}
      <h4>Ordens estornadas <span class="muted small">${est.length}</span></h4>${est.length ? `<div class="tw"><table><tr><th>Ordem</th><th>Material</th><th>Descrição</th><th>Saldo</th><th>Data principal</th><th></th></tr>${est.map(linhaOrd).join('')}</table></div>` : '<p class="small muted">Nenhuma.</p>'}
      <p class="small"><b>${R.kpi.ordensProduzidas}</b> ordens válidas · veja em <a href="#" data-osub="lista">Ordens produzidas</a>.</p></section>`;
  },
  vMB51(c) {
    const P = Ord.prevMB;
    if (P && P.meses && P.meses.length > 1 && !P.soUma) {
      const linhas = P.meses.map(m => { const x = P.porMes[m].R, old = Ord.B.competencias[m], cmp = old && old.resultado ? OrdensSAP.comparar(old.resultado, x) : null; return { m, x, old, cmp }; });
      return `<section class="card section ord-prev"><header><h3>Prévia · ${esc(P.arquivo)} · ${P.meses.length} competências</h3></header>
        <p class="small">O arquivo cobre <b>${compTxt(P.meses[0])} a ${compTxt(P.meses[P.meses.length - 1])}</b>. Cada mês vira uma competência (mês civil da data de lançamento), processada separadamente. Competência que já existe é <b>substituída</b>, nunca somada. Planta <b>${esc(Ord.planta)}</b>${Object.keys(P.R.plantas).length && !P.R.plantas[Ord.planta] ? ` <span class="warn-t">(não está no arquivo: ${Object.entries(P.R.plantas).map(([p, n]) => `<button class="btn xs" data-oplanta="${esc(p)}">${esc(p)} (${n})</button>`).join(' ')})</span>` : ''}.</p>
        <p class="small muted">Atenção: um 102 que estorna um 101 de outro mês aparece como saldo negativo (pendência) no mês do estorno, como manda a regra da competência.</p>
        <div class="tw"><table><tr><th>Competência</th><th class="n">Linhas</th><th class="n">101 / 102</th><th class="n">Ordens produzidas</th><th class="n">Estornadas</th><th class="n">Pendências</th><th>Unidades</th><th>Situação</th><th></th></tr>
        ${linhas.map(({ m, x, old, cmp }) => `<tr><td><b>${compTxt(m)}</b></td><td class="n">${fmtQt(x.kpi.linhasComp)}</td><td class="n">${x.kpi.m101} / ${x.kpi.m102}</td><td class="n"><b>${x.kpi.ordensProduzidas}</b></td><td class="n">${x.kpi.totalEstornadas}</td><td class="n">${x.kpi.divergencias ? `<span class="warn-t">${x.kpi.divergencias}</span>` : 0}</td><td class="small">${Object.entries(x.unidades).map(([u, v]) => fmtQt(v.qtd) + ' ' + u).join(' · ')}</td>
          <td>${!old || !old.resultado ? ordPill('nova', 'info') : cmp.total ? ordPill(`substitui · ${cmp.total} diferença(s)`, 'warn') : ordPill('igual à atual', 'ok')}</td><td><button class="btn xs" data-omes="${m}">Ver detalhe</button></td></tr>`).join('')}</table></div>
        <div class="ord-acts"><button class="btn primary" id="oGravaTodas" ${linhas.some(l => l.x.kpi.linhasComp) ? '' : 'disabled'}>Gravar as ${linhas.filter(l => l.x.kpi.linhasComp).length} competências</button><button class="btn" id="oCanc">Cancelar</button></div></section>`;
    }
    if (P) {
      const ex = c && c.resultado; const cmp = ex ? OrdensSAP.comparar(c.resultado, P.R) : null;
      return `<section class="card section ord-prev"><header><h3>Prévia · ${esc(P.arquivo)}</h3></header>
        <p class="small">Competência <b>${compTxt(Ord.comp)}</b> · planta <b>${esc(Ord.planta)}</b> · ${P.lido.reconhecidas.length} colunas reconhecidas${P.lido.ignoradas.length ? ' · ignoradas: ' + esc(P.lido.ignoradas.join(', ')) : ''}.</p>
        ${Object.keys(P.R.plantas).length && !P.R.plantas[Ord.planta] ? `<div class="note w">O arquivo não tem a planta ${esc(Ord.planta)}. Plantas encontradas: ${Object.entries(P.R.plantas).map(([p, n]) => `<button class="btn xs" data-oplanta="${esc(p)}">${esc(p)} (${n})</button>`).join(' ')}</div>` : ''}
        ${!P.R.kpi.linhasComp && Object.keys(P.R.meses).length && !P.R.meses[Ord.comp] ? `<div class="note w">Nenhuma linha em ${compTxt(Ord.comp)}. Meses no arquivo: ${Object.entries(P.R.meses).map(([m, n]) => `<button class="btn xs" data-ocomp="${m}">${compTxt(m)} (${n})</button>`).join(' ')}</div>` : ''}
        ${cmp ? `<div class="note ${cmp.total ? 'w' : ''}"><b>A competência ${compTxt(Ord.comp)} já foi importada</b> (${esc(c.mb51.arquivo)}, ${new Date(c.mb51.em).toLocaleDateString('pt-BR')}, ${esc(c.mb51.por)}). Gravar <b>substitui</b> (nunca soma). Diferenças:
          <ul class="small"><li>Ordens adicionadas: ${cmp.adicionadas.length}${cmp.adicionadas.length ? ' — ' + cmp.adicionadas.slice(0, 20).join(', ') : ''}</li><li>Ordens removidas: ${cmp.removidas.length}${cmp.removidas.length ? ' — ' + cmp.removidas.slice(0, 20).join(', ') : ''}</li><li>Quantidades alteradas (material/UM): ${cmp.quantidades.length}</li><li>Novos 102: ${cmp.novos102.length}</li><li>Mudanças de data principal: ${cmp.datas.length}</li><li>Pendências novas: ${cmp.pendNovas.length} · resolvidas: ${cmp.pendResolvidas.length}</li></ul></div>` : ''}
        <div class="ord-acts">${P.meses && P.meses.length > 1 ? `<button class="btn" id="oTodas">← Voltar às ${P.meses.length} competências</button>` : ''}<button class="btn primary" id="oGrava" ${P.R.kpi.linhasComp ? '' : 'disabled'}>${cmp ? 'Limpar e substituir a competência' : 'Gravar competência'}</button><button class="btn" id="oCanc">Cancelar</button></div></section>` + this.resultadoMB(P.R, 'prévia');
    }
    return (c && c.resultado ? this.resultadoMB(c.resultado, c.mb51.arquivo) : `<section class="card section"><p>Nenhum MB51 importado para <b>${compTxt(Ord.comp)}</b>.</p><ol class="small"><li>Escolha a competência (mês da data de lançamento).</li><li>Cole ou abra o MB51 (101/102 da planta).</li><li>Confira a prévia e grave.</li><li>Vá em Complementar COOIS.</li></ol></section>`) + this.entrada('mb51');
  },
  vCOOIS(c) {
    const R = c && c.resultado;
    if (!R) return `<section class="card section"><p>Importe primeiro o MB51 de <b>${compTxt(Ord.comp)}</b>: a lista de ordens para o COOIS sai dele.</p><button class="btn primary" data-osub="mb51">Importar MB51</button></section>`;
    const lista = OrdensSAP.listaCOOIS(R), X = Ord.prevCO ? Ord.prevCO.X : c.coois ? c.coois.cruz : null;
    const aus = X ? X.ausentes : [];
    const lst = `<section class="card section"><header><h3>Lista para o COOIS <span class="muted small">${lista.length} ordens</span> ${ordAjuda('Uma ordem por linha, sem cabeçalho, sem espaços, sem repetição, em ordem numérica. Saem as totalmente estornadas e as só com saldo negativo; entram as parcialmente estornadas com saldo positivo.')}</h3></header>
      <textarea readonly rows="6" style="width:100%;font-family:var(--f-mono,monospace);font-size:12px" id="oLista">${lista.join('\n')}</textarea>
      <div class="ord-acts"><button class="btn primary" data-ocp="lista">Copiar ordens para o COOIS</button><button class="btn" data-ocp="sep">Copiar com separador (;)</button><button class="btn" id="oTxtDl">Baixar TXT</button>${aus.length ? `<button class="btn" data-ocp="aus">Copiar ordens ausentes (${aus.length})</button>` : ''}</div></section>`;
    const res = X ? `<section class="card section ${Ord.prevCO ? 'ord-prev' : ''}"><header><h3>${Ord.prevCO ? 'Prévia · ' + esc(Ord.prevCO.arquivo) : 'COOIS · ' + esc(c.coois.arquivo) + ' · ' + new Date(c.coois.em).toLocaleDateString('pt-BR') + ' · ' + esc(c.coois.por)}</h3></header>
      <div class="ord-k">${[['Ordens válidas no MB51', X.esperadas], ['Encontradas no COOIS', X.encontradas, 'ok'], ['Ausentes', X.ausentes.length, X.ausentes.length ? 'crit' : ''], ['Extras (ignoradas)', X.extras.length, X.extras.length ? 'warn' : ''], ['Divergências', X.divergentes.length, X.divergentes.length ? 'warn' : ''], ['Cobertura', fmtPct(X.cobertura), X.cobertura < 1 ? 'warn' : 'ok'], ['Retrabalho (ZPRW)', X.linhas.filter(l => l.retrabalho).length]].map(([l, v, k]) => `<div class="ord-kc ${k || ''}"><span>${l}</span><b>${typeof v === 'number' ? fmtQt(v) : v}</b></div>`).join('')}</div>
      ${X.ausentes.length ? `<p class="small"><b>Ausentes:</b> ${X.ausentes.map(o => `<a href="#" data-oord="${o}" class="mono">${o}</a>`).join(', ')}</p>` : ''}
      ${X.extras.length ? `<p class="small"><b>Extras (no COOIS, fora das válidas; não entram no consolidado):</b> ${X.extras.map(e => esc(e.ordem + ' (' + (ST_ORD[e.noMB51] ? ST_ORD[e.noMB51][0] : e.noMB51) + ')')).join(', ')}</p>` : ''}
      ${X.divergentes.length ? `<div class="tw"><table><tr><th>Ordem</th><th>Tipo</th><th>Divergência</th></tr>${X.linhas.filter(l => l.obs && l.obs.length).map(l => `<tr class="click" data-oord="${l.ordem}"><td class="mono">${l.ordem}</td><td>${esc(l.tipo || '')}</td><td class="small">${esc(l.obs.join('; '))}</td></tr>`).join('')}</table></div>` : ''}
      ${Ord.prevCO ? `<div class="ord-acts"><button class="btn primary" id="oGravaCO">${c.coois ? 'Substituir o COOIS da competência' : 'Gravar COOIS'}</button><button class="btn" id="oCancCO">Cancelar</button></div>` : ''}</section>` : '';
    return lst + res + this.entrada('coois');
  },
  vLista(c) {
    const cs = ordPer(); if (!cs.length) return `<section class="card section"><p>Nenhum MB51 importado em ${esc(ordPerTxt(cs))}.</p><button class="btn primary" data-osub="mb51">Importar MB51</button></section>`;
    const F = Ord.f, multi = cs.length > 1, toks = OrdensSAP.norm(F.q).split(' ').filter(Boolean), rows = [];
    for (const comp of cs) { const cc = Ord.B.competencias[comp], R = cc.resultado, X = cc.coois ? cc.coois.cruz : null, xl = X ? new Map(X.linhas.map(l => [l.ordem, l])) : new Map(), cm = new Map(ordConciliar(comp, R, X).L.map(x => [x.ordem, x]));
      for (const o of R.ordens) rows.push({ o, comp, l: xl.get(o.ordem), s: cm.get(o.ordem), temX: !!X }); }
    let L = rows.filter(({ o }) => (!F.st || o.status === F.st || (F.st === 'parcial' && o.parcial) || (F.st === 'pend' && o.pend.length) || (F.st === 'kkbc' && o.produzida && Ord.kkbc(o.ordem) === 'pendente')) && (!F.un || o.saldos.some(s => s.um === F.un) || (o.status !== 'valida' && o.combos.some(x => x.um === F.un))));
    if (F.linha !== 'todas') L = L.filter(({ s }) => {return F.linha === 'linha' ? s && !['outros materiais', 'preparação (aditivo)'].includes(s.sit) : F.linha === 'prep' ? s && s.sit === 'preparação (aditivo)' : s && s.sit === 'outros materiais'; });
    if (toks.length) L = L.filter(({ o, l, s, comp }) => { const t = OrdensSAP.norm([compTxt(comp), o.ordem, o.materiais.join(' '), o.texto, o.lotes.join(' '), o.status, o.pend.join(' '), o.dataPrincipal, brD(o.dataPrincipal), o.saldos.map(x => x.um).join(' '), l && l.tipo, l && l.status, s && s.sit].join(' ')); return toks.every(w => t.includes(w)); });
    const uns = [...new Set(rows.flatMap(({ o }) => o.saldos.map(x => x.um).concat(o.combos.map(x => x.um))))]; Ord._listaL = L;
    return `<section class="card section"><header><h3>Ordens · ${esc(ordPerTxt(cs))} <span class="muted small">${L.length} de ${rows.length}</span></h3><button class="btn sm" id="oXls">⇩ Excel</button></header>
      <div class="ord-bar"><label class="f"><span>Busca livre</span><input type="search" id="oQ" value="${esc(F.q)}" placeholder="ordem, material, lote, descrição, status…" style="min-width:240px"></label>
      <label class="f"><span>Situação</span><select id="oSt">${[['', 'todas'], ['valida', 'válidas'], ['parcial', 'parcialmente estornadas'], ['estornada', 'estornadas'], ['pendencia', 'saldo negativo'], ['pend', 'com pendência'], ['kkbc', 'sem KKBC no Waste']].map(([v, l]) => `<option value="${v}" ${F.st === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      <label class="f"><span>Unidade</span><select id="oUn"><option value="">todas</option>${uns.map(u => `<option ${F.un === u ? 'selected' : ''}>${esc(u)}</option>`).join('')}</select></label>
      <label class="f"><span>Materiais ${ordAjuda('Tubos da linha = no plano, com produção apurada ou catálogo cadastrado. Preparações = soluções e gel de aditivo (catálogo do tipo Preparação no Portal, ou ordens só em L/G/KG enquanto não estiverem cadastradas); têm BOM e entram no Waste. Outros = demais materiais da planta.')}</span><select id="oLinha">${[['todas', 'todos'], ['linha', 'tubos (da linha)'], ['prep', 'preparações (aditivo)'], ['outros', 'outros materiais']].map(([v, l]) => `<option value="${v}" ${F.linha === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label></div>
      <div class="tw"><table><tr><th>Ordem</th>${multi ? '<th>Competência</th>' : ''}<th>Material</th><th>Descrição</th><th>Lote</th><th>Tipo</th><th>Data principal</th><th class="n">Saldo líquido</th><th class="n">101 / 102</th><th>Situação</th><th>COOIS</th><th>KKBC (Waste)</th><th>Plano</th></tr>
      ${L.slice(0, 600).map(({ o, comp, l, s, temX }) => { const st = ST_ORD[o.status]; return `<tr class="click" data-oord="${esc(o.ordem)}" data-ofcomp="${comp}"><td class="mono">${esc(o.ordem)}</td>${multi ? `<td class="small">${compTxt(comp)}</td>` : ''}<td class="mono small">${esc(o.materiais.join(', '))}</td><td class="small">${esc(o.texto)}</td><td class="mono small">${esc(o.lotes.join(', '))}</td><td>${esc(l && l.tipo || '')}${l && l.retrabalho ? ' ' + ordPill('retrabalho', 'pend') : ''}</td>
        <td>${o.dataPrincipal ? brD(o.dataPrincipal) : o.dataPend ? ordPill('pendente', 'warn') : '–'}</td><td class="n">${o.saldos.map(x => fmtQt(x.qtd) + ' ' + esc(x.um)).join('<br>') || '–'}</td><td class="n small">${o.combos.reduce((a, x) => a + x.n101, 0)} / ${o.combos.reduce((a, x) => a + x.n102, 0)}</td>
        <td>${ordPill(st[0], st[1])}${o.parcial ? ' ' + ordPill('parcial', 'info') : ''}${o.pend.length ? ' ' + ordPill('pendência', 'warn') : ''}</td><td>${!temX ? '<span class="muted small">—</span>' : !l ? '' : l.situacao === 'ok' ? ordPill('ok', 'ok') : l.situacao === 'ausente' ? ordPill('ausente', 'crit') : ordPill('divergente', 'warn')}</td>
        <td>${o.produzida ? kkbcPill(o.ordem) : ''}</td><td class="small">${s ? esc(s.sit) : ''}</td></tr>`; }).join('') || `<tr><td colspan="${multi ? 13 : 12}" class="muted">Nada com esses filtros.</td></tr>`}</table></div>${L.length > 600 ? '<p class="small muted">Mostrando 600; use os filtros.</p>' : ''}</section>`;
  },
  vConc(c) {
    const cs = ordPer(); if (!cs.length) return `<section class="card section"><p>Nenhum MB51 importado em ${esc(ordPerTxt(cs))}.</p></section>`;
    const C = ordConcPer(cs), K = C.K, F = Ord.fc, toks = OrdensSAP.norm(F.q).split(' ').filter(Boolean), multi = cs.length > 1;
    let L = C.L.filter(x => !F.sit || x.sit === F.sit || (F.sit === 'sem KKBC' && x.kkbc === 'pendente')); if (toks.length) L = L.filter(x => { const t = OrdensSAP.norm([compTxt(x.comp), x.ordem, x.material, x.texto, x.sit, x.planLote].join(' ')); return toks.every(w => t.includes(w)); });
    const pct = v => v == null ? '–' : `<span class="${Math.abs(v) > 0.02 ? 'warn-t' : ''}">${v > 0 ? '+' : ''}${fmtPct(v)}</span>`;
    return `<section class="card section"><header><h3>Conciliação · plano × MB51 × produção · ${esc(ordPerTxt(cs))} ${ordAjuda('MB51 diz quais ordens foram produzidas e em qual competência. O plano do PCP (Plano do mês) e a produção apurada no hora a hora/MES dizem o que era esperado e quando foi feito. A aderência diária usa as datas da produção; a competência usa o MB51.')}</h3><button class="btn sm" id="oReWaste" title="Reler perdas-base.json (KKBC lançadas no Waste)">↻ Reler Waste</button></header>
      ${Ord.waste && !Ord.waste.erro ? (K.semKKBC ? `<div class="note e"><b>${K.semKKBC} ordem(ns) produzida(s) sem KKBC_ORD lançada no Waste.</b> Extraia a KKBC_ORD dessas ordens no SAP e importe no Waste. <button class="btn xs" data-ocp="kkbc">Copiar ordens sem KKBC</button> <button class="btn xs primary" data-okkbc="*" title="Copia as ordens e abre o Waste na importação da KKBC_ORD">Copiar e importar no Waste</button> <button class="btn xs" data-ofilt="sem KKBC">Ver só elas</button></div>` : '') : `<div class="note">${Ord.waste && Ord.waste.erro ? 'Waste não lido: ' + esc(Ord.waste.erro) : 'Waste não lido (sem pasta).'} A coluna KKBC fica vazia.</div>`}${C.semPlano.length ? `<div class="note w">Não há plano do PCP para ${C.semPlano.map(compTxt).join(', ')} no Plano do mês: a comparação com o planejado fica vazia${multi ? ' nesses meses' : ''}.</div>` : ''}${!C.temOEE ? '<div class="note">Sem produção apurada no OEE para o período: as colunas de produção ficam vazias.</div>' : ''}
      <div class="ord-k">${[[multi ? 'Ordens planejadas no período' : 'Ordens planejadas no mês', K.planejadas], ['Planejadas e produzidas', K.planProd, 'ok'], ['Planejadas não produzidas', K.naoProd, K.naoProd ? 'crit' : ''], ['Produzidas fora do plano (linha)', K.fora, K.fora ? 'warn' : ''], ['Preparações (aditivo)', K.prep], ['Outros materiais', K.outros], ['Aderência (ordens)', fmtPct(K.aderencia), K.aderencia != null && K.aderencia < 0.9 ? 'warn' : ''], ['Atendimento (qtd UN)', fmtPct(K.atend)], ['Data MB51 × fim real > 2 dias', K.datas, K.datas ? 'warn' : ''], ['Sem KKBC no Waste', Ord.waste && !Ord.waste.erro ? K.semKKBC : '?', K.semKKBC ? 'crit' : '']].map(([l, v, k]) => `<div class="ord-kc ${k || ''}"><span>${l}</span><b>${typeof v === 'number' ? fmtQt(v) : v}</b></div>`).join('')}</div>
      <div class="ord-bar"><label class="f"><span>Busca livre</span><input type="search" id="ocQ" value="${esc(F.q)}" placeholder="ordem, material, lote…"></label><label class="f"><span>Situação</span><select id="ocSit">${['', 'planejada e produzida', 'planejada não produzida', 'produzida fora do plano', 'preparação (aditivo)', 'outros materiais', 'sem KKBC'].map(v => `<option value="${v}" ${F.sit === v ? 'selected' : ''}>${v || 'todas'}</option>`).join('')}</select></label></div>
      <div class="tw"><table><tr><th>Ordem</th>${multi ? '<th>Competência</th>' : ''}<th>Material</th><th>Situação</th><th class="n">Plano (qtd)</th><th class="n">MB51 (UN)</th><th class="n">MB51 × plano</th><th class="n">Produção apurada</th><th class="n">MB51 × produção</th><th>Data principal</th><th>Fim real</th><th>COOIS</th><th>KKBC (Waste)</th></tr>
      ${L.map(x => `<tr class="click" data-oord="${esc(x.ordem)}" data-ofcomp="${x.comp}"><td class="mono">${esc(x.ordem)}</td>${multi ? `<td class="small">${compTxt(x.comp)}</td>` : ''}<td class="small">${esc(x.material)}<br><span class="muted">${esc(x.texto || '')}</span></td><td class="small">${esc(x.sit)}${x.obsMB ? '<br><span class="muted">' + esc(x.obsMB) + '</span>' : ''}</td><td class="n">${fmtQt(x.planQtd)}${x.planMes && x.planMes !== x.comp ? '<br><span class="muted small">plano ' + compTxt(x.planMes) + '</span>' : ''}</td><td class="n">${x.mbUN != null ? fmtQt(x.mbUN) : x.saldos.length ? x.saldos.map(s => fmtQt(s.qtd) + ' ' + s.um).join('<br>') : '–'}</td><td class="n">${pct(x.difPlano)}</td><td class="n">${fmtQt(x.oeeProd)}</td><td class="n">${pct(x.difOEE)}</td>
        <td>${brD(x.dataPrincipal)}</td><td>${brD(x.fimReal)}${x.difDias != null && Math.abs(x.difDias) > 2 ? ' ' + ordPill((x.difDias > 0 ? '+' : '') + x.difDias + ' d', 'warn') : ''}</td><td>${x.coois ? (x.coois.situacao === 'ok' ? ordPill('ok', 'ok') : x.coois.situacao === 'ausente' ? ordPill('ausente', 'crit') : ordPill('divergente', 'warn')) : ''}</td><td>${x.sit === 'planejada não produzida' ? '' : kkbcPill(x.ordem)}</td></tr>`).join('') || `<tr><td colspan="${multi ? 13 : 12}" class="muted">Nada.</td></tr>`}</table></div></section>`;
  },
  vHist() {
    const cs = Object.entries(Ord.B.competencias).sort((a, b) => a[0] < b[0] ? 1 : -1);
    return `<section class="card section"><header><h3>Histórico de competências ${ordAjuda('Uma linha por competência. Reimportar o MB51 de uma competência compara e substitui (nunca soma). Backups em 00. Backups/Ordens.')}</h3></header>
      <div class="tw"><table><tr><th>Competência</th><th>Planta</th><th>Arquivo MB51</th><th>Arquivo COOIS</th><th>Importação</th><th>Usuário</th><th class="n">Ordens válidas</th><th class="n">Pendências</th><th class="n">Cobertura COOIS</th><th class="n">Versões</th><th></th></tr>
      ${cs.map(([k, c]) => `<tr><td><b>${compTxt(k)}</b></td><td>${esc(c.planta || '')}</td><td class="small">${esc(c.mb51 ? c.mb51.arquivo : '')}</td><td class="small">${esc(c.coois ? c.coois.arquivo : '—')}</td><td class="small">${c.mb51 ? new Date(c.mb51.em).toLocaleString('pt-BR').slice(0, 17) : ''}</td><td class="small">${esc(c.mb51 ? c.mb51.por : '')}</td><td class="n">${c.resultado ? c.resultado.kpi.ordensProduzidas : ''}</td><td class="n">${c.resultado ? c.resultado.kpi.divergencias : ''}</td><td class="n">${c.coois ? fmtPct(c.coois.cruz.cobertura) : '—'}</td><td class="n">${(c.historico || []).length + 1}</td>
        <td><button class="btn xs" data-overcomp="${k}">Visualizar</button> <button class="btn xs" data-ojson="${k}">JSON</button></td></tr>`).join('') || '<tr><td colspan="11" class="muted">Nenhuma competência importada.</td></tr>'}</table></div>
      <h4 class="section">Auditoria</h4><div class="tw"><table><tr><th>Quando</th><th>Quem</th><th>Ação</th><th>Competência</th><th>Detalhe</th></tr>${Ord.B.auditoria.slice(-80).reverse().map(a => `<tr><td class="small">${new Date(a.em).toLocaleString('pt-BR').slice(0, 17)}</td><td class="small">${esc(a.por)}</td><td class="small">${esc(a.acao)}</td><td class="small">${compTxt(a.comp)}</td><td class="small">${esc(a.det || '')}</td></tr>`).join('') || '<tr><td colspan="5" class="muted">Sem registros.</td></tr>'}</table></div></section>`;
  },
  mount(root) {
    const on = (s, ev, f) => { const x = root.querySelector(s); if (x) x[ev] = f; };
    root.querySelectorAll('[data-osub]').forEach(b => b.onclick = e => { e.preventDefault(); Ord.sub = b.dataset.osub; render(); });
    root.querySelectorAll('[data-oimp-portal]').forEach(b => b.onclick = e => { e.preventDefault(); ordIrPortalImp(); });
    root.querySelectorAll('[data-oplano]').forEach(b => b.onclick = e => { e.preventDefault(); go('plan'); });
    on('#oComp', 'onchange', e => { if (!/^\d{4}-\d{2}$/.test(e.target.value)) return; Ord.comp = e.target.value; Ord.per = { de: Ord.comp, ate: Ord.comp, fy: '', q: '' }; Ord.prevMB = Ord.prevCO = null; const c = Ord.cur(); if (c && c.planta) Ord.planta = c.planta; render(); });
    on('#oPlanta', 'onchange', e => { Ord.planta = e.target.value.trim(); if (Ord.prevMB) { Ord.prevMB.R = OrdensSAP.processarMB51(Ord.prevMB.lido, { comp: Ord.comp, planta: Ord.planta }); ordMultiPrep(); } render(); });
    root.querySelectorAll('[data-oplanta]').forEach(b => b.onclick = () => { Ord.planta = b.dataset.oplanta; Ord.prevMB.R = OrdensSAP.processarMB51(Ord.prevMB.lido, { comp: Ord.comp, planta: Ord.planta }); ordMultiPrep(); render(); });
    root.querySelectorAll('[data-omes]').forEach(b => b.onclick = () => { Ord.comp = b.dataset.omes; Ord.prevMB.R = Ord.prevMB.porMes[Ord.comp].R; Ord.prevMB.soUma = true; render(); });
    on('#oTodas', 'onclick', () => { Ord.prevMB.soUma = false; render(); });
    on('#oGravaTodas', 'onclick', () => run(async () => {
      if (!Ord.podeImportar()) return toast('Seu perfil não pode importar.', true);
      const P = Ord.prevMB, ms = P.meses.filter(m => P.porMes[m].R.kpi.linhasComp), subs = ms.filter(m => Ord.B.competencias[m] && Ord.B.competencias[m].resultado);
      if (!(await confirmDlg(`Gravar ${ms.length} competência(s)?`, `${ms.map(compTxt).join(', ')}.${subs.length ? `<br><b>${subs.length} já existem e serão substituídas</b> (nunca somadas): ${subs.map(compTxt).join(', ')}. As versões anteriores ficam no histórico e no backup.` : ''}`, subs.length ? 'Gravar e substituir' : 'Gravar todas', !!subs.length))) return;
      for (const m of ms) ordNovaComp(P, m, P.porMes[m].R, P.porMes[m].rows);
      Ord.aud('MB51 importado (várias competências)', `${P.arquivo} · ${ms.map(compTxt).join(', ')}${subs.length ? ' · substituídas: ' + subs.map(compTxt).join(', ') : ''}`);
      await Ord.gravar(ms, subs.length ? 'substituição' : 'importação'); Ord.prevMB = null; if (Ord.txtIn) Ord.txtIn.mb51 = ''; Ord.comp = ms[ms.length - 1]; Ord.per = ms.length > 1 ? { de: ms[0], ate: ms[ms.length - 1], fy: '', q: '' } : { de: Ord.comp, ate: Ord.comp, fy: '', q: '' }; toast(ms.length + ' competência(s) gravada(s).'); render(); window.scrollTo(0, 0);
    }));
    root.querySelectorAll('[data-ocomp]').forEach(b => b.onclick = () => { Ord.comp = b.dataset.ocomp; Ord.prevMB.R = OrdensSAP.processarMB51(Ord.prevMB.lido, { comp: Ord.comp, planta: Ord.planta }); render(); });
    const ler = async (file) => {
      const qual = Ord.sub === 'coois' ? 'coois' : 'mb51';
      try {
        const E = await ordLerEntrada(qual, file, (root.querySelector('#oTxt') || {}).value);
        if (qual === 'mb51') { const lido = OrdensSAP.lerMB51(E.rows); if (lido.erro) throw new Error(lido.erro);
          let R = OrdensSAP.processarMB51(lido, { comp: Ord.comp, planta: Ord.planta });
          if (!R.plantas[Ord.planta] && Object.keys(R.plantas).length === 1) { const p = Object.keys(R.plantas)[0]; toast(`O arquivo só tem a planta ${p} (esperada ${Ord.planta}). Confira antes de gravar.`, true); }
          if (!R.kpi.linhasComp && Object.keys(R.meses).length === 1 && !R.meses[Ord.comp]) { Ord.comp = Object.keys(R.meses)[0]; R = OrdensSAP.processarMB51(lido, { comp: Ord.comp, planta: Ord.planta }); toast('Competência ajustada para ' + compTxt(Ord.comp) + ' (único mês do arquivo).'); }
          Ord.prevMB = { arquivo: E.arquivo, rows: E.rows, lido, R }; ordMultiPrep();
        } else { const lido = OrdensSAP.lerCOOIS(E.rows); if (lido.erro) throw new Error(lido.erro); Ord.prevCO = { arquivo: E.arquivo, rows: E.rows, lido, X: OrdensSAP.cruzarCOOIS(Ord.cur().resultado, lido) }; }
        render();
      } catch (e) { toast(e.message || String(e), true); }
    };
    const tx = root.querySelector('#oTxt'); if (tx) tx.addEventListener('input', () => { Ord.txtIn = Ord.txtIn || {}; Ord.txtIn[Ord.sub === 'coois' ? 'coois' : 'mb51'] = tx.value; });
    on('#oLer', 'onclick', () => ler(null)); on('#oFile', 'onchange', e => { const f = e.target.files[0]; e.target.value = ''; if (f) ler(f); });
    on('#oPendGo', 'onclick', () => run(async () => { await Ord.reenviar(); render(); }, 'Alteração pendente gravada e confirmada na pasta.'));
    on('#oCanc', 'onclick', () => { Ord.prevMB = null; render(); }); on('#oCancCO', 'onclick', () => { Ord.prevCO = null; render(); });
    on('#oGrava', 'onclick', () => run(async () => {
      if (!Ord.podeImportar()) return toast('Seu perfil não pode importar.', true);
      const P = Ord.prevMB, comp = Ord.comp, old = Ord.B.competencias[comp];
      if (old && old.resultado) { const cmp = OrdensSAP.comparar(old.resultado, P.R); if (!(await confirmDlg('Substituir a competência ' + compTxt(comp) + '?', `A importação anterior (${esc(old.mb51.arquivo)}) é substituída por <b>${esc(P.arquivo)}</b>; nada é somado. ${cmp.total} diferença(s). A versão anterior fica no histórico e no backup${old.coois ? '; o COOIS é recruzado com as ordens novas' : ''}.`, 'Limpar e substituir', true))) return; }
      ordNovaComp(P, comp, P.R, P.porMes && P.porMes[comp] ? P.porMes[comp].rows : null); Ord.aud(old ? 'MB51 substituído' : 'MB51 importado', `${P.arquivo} · ${P.R.kpi.ordensProduzidas} ordens produzidas · ${P.R.kpi.linhas} linhas`);
      await Ord.gravar(comp, old ? 'substituição' : 'importação'); Ord.prevMB = null; if (Ord.txtIn) Ord.txtIn.mb51 = ''; Ord.per = { de: comp, ate: comp, fy: '', q: '' }; toast('Competência ' + compTxt(comp) + ' gravada.'); render(); window.scrollTo(0, 0);
    }));
    on('#oGravaCO', 'onclick', () => run(async () => {
      if (!Ord.podeImportar()) return toast('Seu perfil não pode importar.', true);
      const P = Ord.prevCO, c = Ord.cur(), now = new Date().toISOString();
      if (c.coois && !(await confirmDlg('Substituir o COOIS?', `O COOIS de ${compTxt(Ord.comp)} (${esc(c.coois.arquivo)}) é substituído por <b>${esc(P.arquivo)}</b>.`, 'Substituir'))) return;
      c.coois = { arquivo: P.arquivo, em: now, por: Ord.quem(), cab: P.lido.cab, linhas: ordRowsJSON(P.rows.slice(P.lido.cabRow)), colunas: { reconhecidas: P.lido.reconhecidas, ignoradas: P.lido.ignoradas }, ordens: P.lido.ordens, cruz: P.X };
      Ord.aud('COOIS importado', `${P.arquivo} · cobertura ${fmtPct(P.X.cobertura)} · ausentes ${P.X.ausentes.length} · extras ${P.X.extras.length}`);
      await Ord.gravar(Ord.comp, 'coois'); Ord.prevCO = null; if (Ord.txtIn) Ord.txtIn.coois = ''; toast('COOIS gravado.'); render(); window.scrollTo(0, 0);
    }));
    root.querySelectorAll('[data-ocp]').forEach(b => b.onclick = async () => { const cc = Ord.cur() || {}, R = cc.resultado || { ordens: [] }, l = cc.resultado ? OrdensSAP.listaCOOIS(R) : [], X = Ord.prevCO ? Ord.prevCO.X : cc.coois && cc.coois.cruz; const t = b.dataset.ocp === 'kkbc' ? (Ord._kkbcLista || R.ordens.filter(o => o.produzida && Ord.kkbc(o.ordem) === 'pendente').map(o => o.ordem)).join('\n') : b.dataset.ocp === 'sep' ? l.join(';') : b.dataset.ocp === 'aus' ? (X ? X.ausentes : []).join('\n') : l.join('\n'); try { await navigator.clipboard.writeText(t); toast('Copiado: ' + t.split(/[\n;]/).filter(Boolean).length + ' ordens.'); } catch (e) { const ta = root.querySelector('#oLista'); if (ta) { ta.select(); document.execCommand('copy'); toast('Copiado.'); } } });
    on('#oTxtDl', 'onclick', () => { const l = OrdensSAP.listaCOOIS(Ord.cur().resultado); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([l.join('\r\n')], { type: 'text/plain' })); a.download = `ordens-COOIS_${Ord.comp}.txt`; a.click(); });
    const deb = (sel, k, obj) => { const i = root.querySelector(sel); if (!i) return; let t; i.oninput = () => { clearTimeout(t); t = setTimeout(() => { obj[k] = i.value; render(); setTimeout(() => { const n = document.querySelector(sel); if (n) { n.focus(); n.setSelectionRange(n.value.length, n.value.length); } }, 30); }, 220); }; };
    deb('#oQ', 'q', Ord.f); deb('#ocQ', 'q', Ord.fc);
    on('#oSt', 'onchange', e => { Ord.f.st = e.target.value; render(); }); on('#oUn', 'onchange', e => { Ord.f.un = e.target.value; render(); }); on('#oLinha', 'onchange', e => { Ord.f.linha = e.target.value; render(); }); on('#ocSit', 'onchange', e => { Ord.fc.sit = e.target.value; render(); });
    root.querySelectorAll('[data-ofilt]').forEach(b => b.addEventListener('click', () => { Ord.fc.sit = b.dataset.ofilt; Ord.sub = 'conc'; render(); }));
    on('#oReWaste', 'onclick', () => run(async () => { await Ord.lerWaste(); render(); toast('Waste relido.'); }));
    root.querySelectorAll('[data-oord]').forEach(r => r.onclick = e => { if (e.target.closest('a,button') && e.target.closest('a,button') !== r) return; e.preventDefault(); ordFicha(r.dataset.oord, r.dataset.ofcomp); });
    root.querySelectorAll('[data-oper]').forEach(b => b.onclick = () => { ordSetPer(b.dataset.oper); render(); });
    const perSel = () => { const P = Ord.per; P.q = ''; P.de = (root.querySelector('#opDe') || {}).value || ''; P.ate = (root.querySelector('#opAte') || {}).value || ''; P.fy = (root.querySelector('#opFy') || {}).value || ''; if (P.de && P.ate && P.de > P.ate) P.ate = P.de; if (P.de && P.de === P.ate) Ord.comp = P.de; render(); };
    on('#opDe', 'onchange', perSel); on('#opAte', 'onchange', perSel); on('#opFy', 'onchange', perSel);
    on('#opLimpar', 'onclick', () => { Object.assign(Ord.f, { q: '', st: '', un: '', linha: 'todas' }); Object.assign(Ord.fc, { q: '', sit: '' }); ordSetPer('ult'); render(); });
    root.querySelectorAll('[data-overcomp]').forEach(b => b.onclick = () => { Ord.comp = b.dataset.overcomp; Ord.per = { de: Ord.comp, ate: Ord.comp, fy: '', q: '' }; Ord.sub = 'lista'; render(); });
    root.querySelectorAll('[data-ojson]').forEach(b => b.onclick = () => { const k = b.dataset.ojson; const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(Ord.B.competencias[k], null, 1)], { type: 'application/json' })); a.download = `ordens_${k}.json`; a.click(); });
    on('#oXls', 'onclick', () => run(async () => { const XLSX = await Libs.loadXLSX(), LL = Ord._listaL || [];
      const aoa = [['Competência', 'Ordem', 'Material', 'Descrição', 'Lote', 'Situação', 'Parcial', 'Data principal', 'Primeira 101', 'Última 101', 'UM', 'Saldo líquido', '101', '102', 'Pendências', 'COOIS', 'Tipo', 'Status SAP']];
      for (const { o, comp, l } of LL) for (const c of o.combos) { aoa.push([comp, o.ordem, c.material, c.texto, c.lotes.join(', '), ST_ORD[o.status][0], o.parcial ? 'sim' : '', o.dataPrincipal || '', c.primeira101 || '', c.ultima101 || '', c.um, c.saldo, c.q101, c.q102, o.pend.join('; '), l ? l.situacao : '', l ? l.tipo : '', l ? l.status : '']); }
      const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa), 'Ordens'); const cs = ordPer(); XLSX.writeFile(wb, `Ordens_${cs[0] || Ord.comp}${cs.length > 1 ? '_a_' + cs[cs.length - 1] : ''}.xlsx`); }));
  }
};
/* várias competências no mesmo arquivo: processa cada mês separadamente e guarda as linhas de cada um */
function ordMultiPrep() {
  const P = Ord.prevMB; if (!P) return; const meses = Object.keys(P.R.meses).filter(Boolean).sort(); P.meses = meses; P.porMes = {};
  for (const m of meses) { const R = OrdensSAP.processarMB51(P.lido, { comp: m, planta: Ord.planta }); const idx = P.lido.movs.filter(x => x.dl && x.dl.slice(0, 7) === m).map(x => x.i); P.porMes[m] = { R, rows: [P.rows[P.lido.cabRow]].concat(idx.map(i => P.rows[i])) }; }
  if (meses.length > 1) P.soUma = false; else if (meses.length === 1 && P.porMes[Ord.comp]) P.R = P.porMes[Ord.comp].R;
}
function ordNovaComp(P, comp, R, rows) {
  const old = Ord.B.competencias[comp], now = new Date().toISOString(), por = Ord.quem();
  const nova = { comp, planta: Ord.planta, mb51: { arquivo: P.arquivo, em: now, por, cab: P.lido.cab, cabRow: rows ? 0 : P.lido.cabRow, linhas: ordRowsJSON(rows || P.rows.slice(P.lido.cabRow)), colunas: { reconhecidas: P.lido.reconhecidas, ignoradas: P.lido.ignoradas }, regras: ['competência = mês civil da data de lançamento', 'saldo = 101 + 102 por ordem+material+UM', 'vínculo 102→101 por correspondência exata (sem referência documental no MB51)', ...R.regras] }, resultado: R, coois: null, historico: [] };
  if (old) { nova.historico = (old.historico || []).concat(old.mb51 ? [{ em: old.mb51.em, por: old.mb51.por, arquivo: old.mb51.arquivo, ordensProduzidas: old.resultado ? old.resultado.kpi.ordensProduzidas : null, substituidaEm: now, por2: por }] : []); if (old.coois) nova.coois = { ...old.coois, cruz: OrdensSAP.cruzarCOOIS(R, { ordens: old.coois.ordens }) }; }
  Ord.B.competencias[comp] = nova; return nova;
}
/* status do sistema do SAP (COOIS): cada sigla vira uma etiqueta; passar o mouse mostra o significado de todas.
   Os textos oficiais variam com a configuração do SAP; as siglas marcadas "a confirmar" ainda não foram conferidas no SAP da planta
   (transação da ordem › status, ou tabelas TJ02T/TJ30T). Sigla com * = status de usuário. */
const ORD_ST_SAP = {
  ABER: ['Aberta', 'Ordem criada, ainda não liberada.', 'prep'], LIB: ['Liberada', 'Ordem liberada para produção.', 'prep'], IMPR: ['Impressa', 'Documentos da ordem impressos (não quer dizer que a produção começou).', 'prep'],
  CONF: ['Confirmada', 'Houve confirmação de produção (quantidade, refugo, tempos).', 'exec'], FORN: ['Fornecida', 'Entrada de mercadoria da ordem reconhecida (veja a quantidade fornecida).', 'ok'],
  ENTE: ['Encerrada tecnicamente', 'Execução encerrada no SAP; novas confirmações ou movimentos exigem desfazer o encerramento.', 'fim'], ENCE: ['Encerrada', 'Ordem encerrada também para custos.', 'fim'],
  CAPC: ['Cálculo de custos', 'Custos da ordem calculados.', 'calc', 1], DSVA: ['Desvios calculados', 'Desvios/variações da ordem calculados (custo e Waste).', 'calc', 1],
  LOAT: ['Lote atribuído', 'Há lote atribuído à ordem; o lote vale o do campo Lote.', 'lote', 1]
};
const ordStSig = c => { const k = String(c || '').replace(/\*$/, ''), d = ORD_ST_SAP[k]; return d ? { nome: d[0], txt: d[1], cat: d[2], conf: !d[3] } : { nome: /\*$/.test(c) ? 'Status de usuário' : 'Sigla sem descrição', txt: 'Ainda sem descrição cadastrada: confira o texto no SAP.', cat: 'desc', conf: false }; };
function ordStatusTitulo(st) { return String(st || '').trim().split(/\s+/).filter(Boolean).map(c => { const d = ordStSig(c); return `${c} · ${d.nome}${d.conf ? '' : ' (a confirmar)'}: ${d.txt}`; }).join('\n'); }
function ordStatusSAP(st) {
  const cs = String(st || '').trim().split(/\s+/).filter(Boolean); if (!cs.length) return '<span class="muted small">—</span>';
  return `<span class="ord-st-sap" title="${esc('Status do sistema (SAP):\n' + ordStatusTitulo(st))}">${cs.map(c => `<span class="sst ${ordStSig(c).cat}">${esc(c)}</span>`).join('')}</span>`;
}
/* material da ordem: link para o catálogo no Portal; se não estiver cadastrado, botão que abre o Portal na CS12 já com o material */
const ordChaveMat = v => String(v || '').trim().toUpperCase().replace(/^NS/, '').replace(/^0+(?=\d)/, '');
function ordMatLink(m, o) {
  const port = (typeof systems === 'function' ? systems() : []).find(s => s.id === 'portal') || { id: 'portal', html: 'Portal.html' };
  const cad = typeof vacCad === 'function' ? vacCad() : null, k = ordChaveMat(m);
  const it = cad && (cad.catalogos || []).find(c => ordChaveMat(c.codigo) === k || (c.codigoSAP && ordChaveMat(c.codigoSAP) === k));
  if (it) return `<a class="mono ord-mat" href="${esc(sysHref(port, 'cadastros/catalogos/' + encodeURIComponent(it.codigo)))}" target="_blank" title="Abrir o catálogo ${esc(it.codigo)} no Portal${it.nome ? ' · ' + esc(it.nome) : ''}"><b>${esc(m)}</b> ↗</a>`;
  if (!cad) return `<a class="mono ord-mat" href="${esc(sysHref(port, 'cadastros/catalogos/' + encodeURIComponent(k)))}" target="_blank" title="Abrir no cadastro do Portal (a cópia do cadastro não está neste navegador)"><b>${esc(m)}</b> ↗</a>`;
  const cb = o.combos.find(x => x.material === m) || {}, um = String(cb.um || (o.saldos[0] || {}).um || '').toUpperCase(), prep = /^(L|ML|G|KG|MG)$/.test(um);
  const q = new URLSearchParams({ cs12: String(m).trim().toUpperCase(), nome: cb.texto || o.texto || '', tipo: prep ? 'preparacao' : 'tubo', un: um }).toString();
  return `<b class="mono">${esc(m)}</b> <span class="pill warn" title="Material não está nos catálogos do Portal">não cadastrado</span> <a class="btn xs" href="${esc(sysHref(port, q))}" target="_blank" title="Abre o Portal em Importar do SAP › CS12 com este material. Cole a CS12 e o catálogo é criado junto com a BOM.">＋ Cadastrar pela CS12</a>`;
}
/* "sem KKBC": um clique copia a(s) ordem(ns) e abre o Waste na importação da KKBC_ORD (mesma aba; o ← Voltar traz de volta) */
const ordKkbcBtn = o => `<button type="button" class="pill crit ord-kkbc" data-okkbc="${esc(o)}" title="Sem KKBC_ORD no Waste. Clique: copia a ordem ${esc(o)} e abre a importação no Waste para colar no SAP.">sem KKBC ⧉</button>`;
async function ordCopiar(t) {
  try { await navigator.clipboard.writeText(t); return true; } catch (e) { }
  try { const a = document.createElement('textarea'); a.value = t; a.style.position = 'fixed'; a.style.opacity = '0'; document.body.appendChild(a); a.select(); const ok = document.execCommand('copy'); a.remove(); return ok; } catch (e) { return false; }
}
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-okkbc]'); if (!b) return; e.preventDefault(); e.stopPropagation();
  const ords = b.dataset.okkbc === '*' ? (Ord._kkbcLista || []) : [b.dataset.okkbc]; if (!ords.length) return toast('Nenhuma ordem sem KKBC.');
  const ok = await ordCopiar(ords.join('\n')); const W = (typeof systems === 'function' ? systems() : []).find(x => x.id === 'perdas') || { id: 'perdas', html: 'Perdas-Ordem.html' };
  toast((ok ? (ords.length > 1 ? ords.length + ' ordens copiadas' : 'Ordem ' + ords[0] + ' copiada') : 'Não consegui copiar; as ordens aparecem no Waste') + '. Abrindo a importação do Waste…');
  setTimeout(() => { vacDemo.ir(sysHref(W, 'aba=importar&kkbc=' + encodeURIComponent(ords.slice(0, 200).join(',')))); }, 450);
}, true);
/* ficha da ordem (2.1: dados de ordens; abas de produção, waste, gel e paradas entram na 2.3) */
function ordFicha(ordem, comp) {
  comp = comp && Ord.B.competencias[comp] ? comp : Ord.comp;
  const c = Ord.B.competencias[comp] || null, R = c && c.resultado, o = R && R.ordens.find(x => x.ordem === ordem), X = c && c.coois ? c.coois.cruz : null, l = X && X.linhas.find(x => x.ordem === ordem), cr = c && c.coois && c.coois.ordens ? c.coois.ordens.find(x => x.ordem === ordem) : null;
  const conc = R ? ordConciliar(comp, R, X).L.find(x => x.ordem === ordem) : null;
  const sys = id => (typeof systems === 'function' ? systems() : []).find(s => s.id === id);
  const lk = (id, h, t) => { const s = sys(id); return s ? `<a class="btn sm" href="${esc(sysHref(s, h))}" target="_blank">${t}</a>` : ''; };
  const movs = o ? o.combos.flatMap(cb => cb.movs.map(m => ({ ...m, combo: cb }))).sort((a, b) => (a.de || a.dl) + a.hora < (b.de || b.dl) + b.hora ? -1 : 1) : [];
  const st = o ? ST_ORD[o.status] : null;
  const body = !o ? `<p>A ordem ${esc(ordem)} não está no MB51 de ${compTxt(comp)}.</p>${conc ? `<p class="small">${esc(conc.sit)} · plano ${fmtQt(conc.planQtd)} · ${esc(conc.obsMB || '')}</p>` : ''}` : `
    <div class="ord-fh"><div><span class="muted small">Competência</span><b>${compTxt(comp)}</b></div><div><span class="muted small">Data principal</span><b>${o.dataPrincipal ? brD(o.dataPrincipal) : o.dataPend ? 'pendente' : '–'}</b></div><div><span class="muted small">Material</span><span>${o.materiais.map(m => ordMatLink(m, o)).join(' ')}</span><span class="small">${esc(o.texto)}</span></div><div><span class="muted small">Lote</span><b class="mono">${esc(o.lotes.join(', ') || '–')}</b></div><div><span class="muted small">Tipo</span><b>${esc(cr ? cr.tipo : '–')}</b></div><div><span class="muted small">Situação</span>${ordPill(st[0], st[1])}${o.parcial ? ordPill('parcialmente estornada', 'info') : ''}</div><div><span class="muted small">Saldo líquido</span><b>${o.saldos.map(s => fmtQt(s.qtd) + ' ' + esc(s.um)).join(' · ') || '–'}</b></div><div><span class="muted small">Conciliação</span><b>${esc(conc ? conc.sit : '–')}</b></div></div>
    ${o.pend.length ? `<div class="note w">${o.pend.map(esc).join('<br>')}</div>` : ''}
    <div class="ord-acts">${typeof vacFichaBotao === 'function' ? vacFichaBotao(ordem) : ''}<span class="small">KKBC no Waste: ${kkbcPill(ordem)}</span>${lk('perdas', 'ordem=' + ordem, 'Waste da ordem')}${lk('gel', 'ordem=' + ordem, 'Gel da ordem')}${conc && conc.planMes ? `<a class="btn sm" href="#ordem=${esc(ordem)}">Plano do mês</a>` : ''}</div>
    ${conc ? `<h4 class="section">Planejado × produzido</h4><div class="tw"><table><tr><th>Plano (qtd)</th><th>Mês do plano</th><th>Lote do plano</th><th>MB51 (UN)</th><th>Produção apurada (OEE)</th><th>Fim real</th></tr><tr><td class="n">${fmtQt(conc.planQtd)}</td><td>${compTxt(conc.planMes)}</td><td class="mono">${esc(conc.planLote || '')}</td><td class="n">${fmtQt(conc.mbUN)}</td><td class="n">${fmtQt(conc.oeeProd)}</td><td>${brD(conc.fimReal)}${conc.difDias != null ? ' (' + (conc.difDias > 0 ? '+' : '') + conc.difDias + ' d da data principal)' : ''}</td></tr></table></div>` : ''}
    <h4 class="section">Movimentos MB51 ${ordAjuda('Linhas originais da competência. O 102 é ligado ao 101 por correspondência exata (mesma ordem, material, UM, lote e quantidade, 101 anterior); o MB51 não traz a referência do documento estornado.')}</h4>
    <div class="tw"><table><tr><th>Mov.</th><th>Data lanç.</th><th>Entrada · hora</th><th>Doc. material / item</th><th>Material</th><th>Lote</th><th class="n">Qtd. UM registro</th><th>UM</th><th>D/C</th><th>Usuário</th><th>Vínculo</th></tr>
    ${movs.map(m => `<tr class="${m.tipo === '102' || m.estornadoPor != null ? 'muted' : ''}"><td><b>${esc(m.tipo)}</b></td><td>${brD(m.dl)}</td><td class="small">${brD(m.de)} ${esc(m.hora)}</td><td class="mono small">${esc(m.doc)} / ${esc(m.item)}</td><td class="mono small">${esc(m.material)}</td><td class="mono small">${esc(m.lote)}</td><td class="n">${fmtQt(m.qtd)}</td><td>${esc(m.um)}</td><td>${esc(m.dc)}</td><td class="small">${esc(m.usuario)}</td><td class="small">${m.tipo === '102' ? esc(m.como || '') + (m.vinculo != null ? ' → doc ' + esc((movs.find(x => x.i === m.vinculo) || {}).doc || '') : '') : m.estornadoPor != null ? 'estornado' + (m.estornadoPor === 'saldo zero' ? ' (saldo zero)' : '') : 'válido'}</td></tr>`).join('')}</table></div>
    ${cr ? `<h4 class="section">COOIS</h4><div class="tw"><table><tr><th>Tipo</th><th>Status do sistema</th><th>Qtd. ordem</th><th>Confirmada</th><th>Fornecida</th><th>Retrabalho</th><th>Refugo</th><th>Início real</th><th>Fim real</th><th>Conciliação</th></tr><tr><td>${esc(cr.tipo)}</td><td>${ordStatusSAP(cr.status)}</td><td class="n">${fmtQt(cr.qtdOrdem)} ${esc(cr.um)}</td><td class="n">${fmtQt(cr.qConf)}</td><td class="n">${fmtQt(cr.qForn)}</td><td class="n">${fmtQt(cr.qRetr)}</td><td class="n">${fmtQt(cr.refugo)}</td><td>${brD(cr.dIni)}</td><td>${brD(cr.dFim)}</td><td class="small">${l ? esc(l.situacao + (l.obs && l.obs.length ? ': ' + l.obs.join('; ') : '')) : ''}</td></tr></table></div>` : X ? '<p class="small warn-t">Ordem ausente no COOIS.</p>' : '<p class="small muted">COOIS ainda não importado.</p>'}
    <p class="small muted">Produção, hora a hora, paradas, waste e gel da ordem entram na ficha unificada (Produção 2.3).</p>`;
  modal(`Ordem ${ordem}`, body, '<button class="btn" data-close>Fechar</button>', null, { wide: true });
}
/* kit v2.1: chamado quando a página volta a ficar visível (troca de aba/janela ou ← Voltar) */
window.vacAoVoltar = async function () {
  if (!Ord.carregado || Ord._relendo || Ord.modo() !== 'pasta') return; Ord._relendo = true;
  try { const antes = JSON.stringify([Ord.B && Ord.B.rev, Ord.waste && Ord.waste.lanc && Ord.waste.lanc.size, Ord.waste && Ord.waste.rev]);
    await Ord.lerWaste(); if (!Ord.prevMB && !Ord.prevCO && Ord.modo() === 'pasta') { const comp = Ord.comp, per = Ord.per, sub = Ord.sub; Ord.carregado = false; await Ord.carregar(); Ord.comp = comp; Ord.per = per; Ord.sub = sub; _ordIdx = null; }
    const depois = JSON.stringify([Ord.B && Ord.B.rev, Ord.waste && Ord.waste.lanc && Ord.waste.lanc.size, Ord.waste && Ord.waste.rev]);
    if (antes !== depois && !document.querySelector('.modal, .overlay') && ![...document.querySelectorAll('textarea')].some(t => !t.readOnly && t.value.trim()) && !(document.activeElement && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))) render();
  } catch (e) { console.warn('vacAoVoltar', e); } finally { Ord._relendo = false; }
};
/* kit v2.1: posição atual para o histórico (← Voltar volta para a aba e a sub-aba de Ordens) */
window.vacNavAtual = () => ({ attr: 'data-route', val: App.route, sub: App.route === 'ordens' ? Ord.sub : null });
/* registra a aba (grupo Ordens) */
(() => { if (!ROUTES.some(r => r[0] === 'ordens')) { const i = ROUTES.findIndex(r => r[0] === 'overview'); ROUTES.splice(i < 0 ? ROUTES.length : i, 0, ['ordens', 'Ordens']); } ROUTE_GROUP.ordens = 'Ordens'; })();

/* =====================================================================
   Produção 2.2 · cabeçalho em grupos (uma linha, sem rolagem), na ordem da história:
   Plano → Ordens → Apontamento → Análise → Gestão → Configurações. Menus abrem ao passar o mouse (ou tocar).
   ===================================================================== */
const NAV_GRUPOS = [
  { g: 'Visão Geral', itens: [['overview', 'Visão Geral']] },   // 2.4.31 · PRD-01: Painel e Visão Geral numa aba só (visões do Painel dentro dela)
  { g: 'Plano', itens: [['plan', 'Plano do mês']] },
  { g: 'Ordens', itens: [['ordens', 'Ordens produzidas', 'lista'], ['plan', 'Ordens (plano do mês)'], ['ordens', 'Conciliação', 'conc'], ['ordens', 'Histórico de competências', 'hist'], ['ordens', 'Importar ↗', 'portal']] },   // 2.4.26 · PRD-02/03, IMP-06
  { g: 'Apontamento', itens: [['launch', 'Lançamento'], ['hourly', 'Hora a hora'], ['lots', 'Lotes (MES)'], ['pend', 'Pendências']] },
  { g: 'Análise', itens: [['stops', 'Paradas'], ['history', 'Histórico'], ['weekly', 'Semanal'], ['monthly', 'Mensal']] },
  { g: 'Gestão', itens: [['reports', 'Relatórios'], ['sqdcp', 'SQDCP']] },
  { g: 'Configurações', itens: [['config', 'Configurações']] }];
function renderNavGrupos() {
  const vis = new Set(visibleRoutes().map(r => r[0])); vis.add('ordens'); vis.add('config');
  const B = ordBadges();
  const html = NAV_GRUPOS.map(G => {
    const it = G.itens.filter(([r]) => vis.has(r)); if (!it.length) return '';
    const ativo = it.some(([r]) => r === App.route), atual = ativo ? it.find(([r, , sb]) => r === App.route && (!sb || sb === Ord.sub)) || it.find(([r]) => r === App.route) : null;
    const prim = it[0], lbl = G.g;
    const sub = it.length > 1 ? `<div class="nmenu" role="menu">${it.map(([r, l, sb]) => `<button type="button" role="menuitem" class="nitem${r === App.route && (!sb || sb === Ord.sub) ? ' on' : ''}" data-route="${r}"${sb ? ` data-osub2="${sb}"` : ''}>${esc(l)}${(B.item[r + (sb ? ':' + sb : '')] || '')}</button>`).join('')}</div>` : '';
    return `<div class="ngrp${ativo ? ' on' : ''}${it.length > 1 ? ' tem' : ''}"><button type="button" class="tab" data-route="${prim[0]}"${prim[2] ? ` data-osub2="${prim[2]}"` : ''} ${ativo ? 'aria-current="page"' : ''} title="${esc(it.map(x => x[1]).join(' · '))}"><span class="nl">${esc(lbl)}${B.grupo[G.g] || ''}</span>${atual && it.length > 1 ? `<small class="natual">${esc(atual[1])}</small>` : ''}</button>${sub}</div>`;
  }).join('');
  $('#nav').innerHTML = html; $('#nav').classList.add('ngrupos');
}
/* uma pílula por grupo com o total; o menu (passar o mouse) mostra em que item está cada pendência */
function ordBadges() {
  const item = {}, grupo = {}, num = h => +((String(h || '').match(/>(\d+)</) || [])[1] || 0);
  const tit = h => (String(h || '').match(/title="([^"]*)"/) || [])[1] || '';
  let op = '', pe = ''; try { op = openBadge() || ''; } catch (e) { } try { pe = pendBadge() || ''; } catch (e) { }
  item.launch = op; item.pend = pe; const nA = num(op) + num(pe);
  if (nA) grupo.Apontamento = `<span class="cnt" data-goto="pend-top" title="${[num(op) && 'Lançamento: ' + num(op) + ' em aberto', num(pe) && 'Pendências: ' + num(pe) + ' (' + tit(pe) + ')'].filter(Boolean).join('\n')}\nPasse o mouse para ver onde estão.">${nA}</span>`;
  try {
    if (Ord.carregado) { let nk = 0, np = 0; const ks = new Set();
      for (const c of Object.values(Ord.B.competencias)) { const R = c.resultado; if (!R) continue; for (const o of R.ordens) { if (o.pend.length) np++; if (o.produzida && Ord.kkbc(o.ordem) === 'pendente' && !ks.has(o.ordem)) { ks.add(o.ordem); nk++; } } }
      if (np) item['ordens:mb51'] = `<span class="cnt" title="${np} ordem(ns) com pendência no MB51 (saldo negativo ou estorno sem referência)">${np}</span>`;
      if (nk) item['ordens:conc'] = `<span class="cnt" title="${nk} ordem(ns) produzida(s) sem KKBC_ORD lançada no Waste">${nk}</span>`;
      if (np + nk) grupo.Ordens = `<span class="cnt" title="${[nk && 'Sem KKBC no Waste: ' + nk + ' (Conciliação)', np && 'Pendências do MB51: ' + np + ' (Importar MB51)'].filter(Boolean).join('\n')}\nPasse o mouse para ver onde estão.">${np + nk}</span>`;
    }
  } catch (e) { console.warn(e); }
  return { item, grupo };
}
/* Pendências: resumo das ordens do SAP no topo */
(() => { const V = App.views.pend; if (!V || V._ord) return; const r0 = V.render; V._ord = 1;
  V.render = function () { const h = r0.apply(this, arguments); let card = '';
    try { if (Ord.carregado) { const L = []; for (const [comp, c] of Object.entries(Ord.B.competencias).sort()) { const R = c.resultado; if (!R) continue; const nk = R.ordens.filter(o => o.produzida && Ord.kkbc(o.ordem) === 'pendente').length, np = R.ordens.filter(o => o.pend.length).length, aus = c.coois && c.coois.cruz ? c.coois.cruz.ausentes.length : null;
          if (nk || np || aus || !c.coois) L.push(`<tr><td><b>${compTxt(comp)}</b></td><td class="n">${nk ? `<a href="#" data-oir="conc:${comp}" class="crit-t">${nk}</a>` : '0'}</td><td class="n">${np ? `<a href="#" data-oir="mb51:${comp}">${np}</a>` : '0'}</td><td>${!c.coois ? `<a href="#" data-oir="coois:${comp}">COOIS não importado</a>` : aus ? aus + ' ausente(s)' : 'ok'}</td></tr>`); }
        if (L.length) card = `<section class="card section"><header><h3>Ordens (SAP) ${ordAjuda('Ordens do MB51 sem KKBC_ORD no Waste, pendências do MB51 e COOIS por competência. Clique no número para abrir.')}</h3></header><div class="tw"><table><tr><th>Competência</th><th class="n">Sem KKBC no Waste</th><th class="n">Pendências MB51</th><th>COOIS</th></tr>${L.join('')}</table></div></section>`; }
      else Ord.carregar().then(() => render()); } catch (e) { console.warn(e); }
    return card + h; };
})();
document.addEventListener('click', e => { const a = e.target.closest('[data-oir]'); if (!a) return; e.preventDefault(); const [sb, comp] = a.dataset.oir.split(':'); Ord.comp = comp; Ord.per = { de: comp, ate: comp, fy: '', q: '' }; Ord.prevMB = Ord.prevCO = null; Ord.sub = sb; if (sb === 'conc') Ord.fc.sit = 'sem KKBC'; go('ordens'); });
/* 2.4.26 · IMP-06: Importar leva ao Portal › Importação › Produção (lá ficam a ordem recomendada e o status do dia; o botão de cada relatório volta para cá) */
function ordPortalImpHref() { const h = 'importacao/producao'; return typeof vacPortalHref === 'function' ? vacPortalHref(h) : 'Portal.html#' + h; }
function ordIrPortalImp() { const h = ordPortalImpHref(); if (typeof vacDemo !== 'undefined' && vacDemo.ativo) vacDemo.ir(h); else location.href = h; }
document.addEventListener('click', e => { const p = e.target.closest('[data-osub2="portal"]'); if (p) { e.preventDefault(); e.stopPropagation(); ordIrPortalImp(); return; } }, true);
document.addEventListener('click', e => { const x = e.target.closest('[data-osub2]'); if (x) { Ord.sub = x.dataset.osub2; Ord.prevMB = Ord.prevMB && x.dataset.osub2 === 'mb51' ? Ord.prevMB : Ord.prevMB; } const g = e.target.closest('.ngrp'); document.querySelectorAll('.ngrp.abre').forEach(n => { if (n !== g) n.classList.remove('abre'); }); }, true);
/* =====================================================================
   2.2 · Plano do mês × SAP: cada ordem do plano mostra o que o MB51/COOIS (oficial) diz
   (mesma chave: ordem e lote sem zeros à esquerda)
   ===================================================================== */
const ordChave = v => String(v == null ? '' : v).trim().replace(/\D/g, '').replace(/^0+/, '');
let _ordIdx = null, _ordIdxRev = null;
function ordIndice() {
  if (!Ord.carregado) { Ord.carregar().then(() => render()); return null; }
  if (_ordIdx && _ordIdxRev === Ord.B.rev + '|' + Object.keys(Ord.B.competencias).length) return _ordIdx;
  const m = new Map();
  for (const [comp, c] of Object.entries(Ord.B.competencias).sort()) { const R = c.resultado; if (!R) continue; const co = c.coois && c.coois.ordens ? new Map(c.coois.ordens.map(x => [x.ordem, x])) : new Map();
    for (const o of R.ordens) { const prev = m.get(o.ordem); if (prev && prev.produzida && !o.produzida) continue; m.set(o.ordem, { comp, status: o.status, produzida: o.produzida, parcial: o.parcial, dataPrincipal: o.dataPrincipal, saldos: o.saldos, lotes: o.lotes, pend: o.pend, coois: co.get(o.ordem) || null }); } }
  _ordIdx = m; _ordIdxRev = Ord.B.rev + '|' + Object.keys(Ord.B.competencias).length; return m;
}
function ordSapCel(o) {
  const I = ordIndice(); if (!I) return '<span class="muted small">…</span>'; if (!I.size) return '<span class="muted small" title="Importe o MB51 em Ordens">sem MB51</span>';
  const k = ordChave(o.order); if (!k) return ''; const x = I.get(k);
  if (!x) return `<span class="pill none" title="A ordem não aparece em nenhum MB51 importado (${[...new Set([...I.values()].map(v => v.comp))].map(compTxt).join(', ')})">não está no MB51</span>`;
  const out = [];
  if (!x.produzida) out.push(ordPill(x.status === 'estornada' ? 'estornada no SAP' : 'saldo negativo', x.status === 'estornada' ? 'none' : 'warn'));
  else out.push(`<span class="pill ok" title="MB51 · competência ${compTxt(x.comp)}${x.parcial ? ' · parcialmente estornada' : ''}">SAP ${x.dataPrincipal ? brD(x.dataPrincipal).slice(0, 5) : '?'} · ${x.saldos.map(s => fmtQt(s.qtd) + ' ' + s.um).join(' · ')}</span>`);
  const lp = ordChave(o.lot), ls = x.lotes.map(ordChave).concat(x.coois && x.coois.lote ? [ordChave(x.coois.lote)] : []);
  if (lp && ls.length && !ls.includes(lp)) out.push(`<span class="pill warn" title="Lote do plano (PCP) diferente do lote do SAP (MB51/COOIS). O SAP é a fonte oficial.">lote SAP ${esc(x.lotes.join('/') || (x.coois && x.coois.lote) || '')}</span>`);
  else if (!lp && ls.length) out.push(`<span class="pill info" title="O plano não tem lote; o SAP informa">lote ${esc(x.lotes[0] || '')}</span>`);
  const un = x.saldos.filter(s => s.um === 'UN').reduce((a, s) => a + s.qtd, 0); const q = o.qtyReal != null ? o.qtyReal : o.qty;
  if (x.produzida && q && un && Math.abs(un / q - 1) > 0.02) out.push(`<span class="small ${un < q ? 'warn-t' : ''}" title="Quantidade do plano × saldo líquido do MB51">${un > q ? '+' : ''}${fmtPct(un / q - 1)} × plano</span>`);
  if (x.coois) out.push(`<span class="small muted" title="${esc('COOIS · status do sistema:\n' + ordStatusTitulo(x.coois.status))}">${esc((x.coois.tipo || '') + (x.coois.dFim ? ' · fim ' + brD(x.coois.dFim).slice(0, 5) : ''))}</span>`);
  const kb = Ord.kkbc(k); if (x.produzida && kb === 'pendente') out.push(ordKkbcBtn(k));
  return `<div class="ord-sap" data-oord2="${esc(k)}">${out.join(' ')}</div>`;
}
document.addEventListener('click', e => { const x = e.target.closest('[data-oord2]'); if (!x) return; const I = ordIndice(), v = I && I.get(x.dataset.oord2); if (v) { Ord.comp = v.comp; ordFicha(x.dataset.oord2); } });
/* E5 · pasta conectada para a ficha comum (kit): a da base da Produção, só no modo pasta */
function vacPastaAtual() { const S = typeof Store !== 'undefined' && Store.S; return S && S.mode === 'pasta' && S.backend && S.backend.dir || null; }
/* E8 · ação no Planner (Iniciativas) a partir do Pareto de paradas da Produção: fotografia (período, minutos, eventos) e link para reconsultar */
function oeeAcaoPlanner(dim, pick, evs) {
  const min = evs.reduce((s, e) => s + (+e.minutes || 0), 0), dias = evs.map(e => e.day && e.day.date).filter(Boolean).sort(), br = d => d ? d.slice(8, 10) + '/' + d.slice(5, 7) + '/' + d.slice(0, 4) : '';
  const per = dias.length ? (dias[0] === dias[dias.length - 1] ? br(dias[0]) : br(dias[0]) + '–' + br(dias[dias.length - 1])) : '';
  return { titulo: 'Pareto da Produção: ' + pick, origem: { tipo: 'oee', ref: 'oee-pareto|' + dim + '|' + pick, resumo: `Pareto (${dim}) · ${pick} · ${Math.round(min)} min em ${evs.length} evento(s)${per ? ' · ' + per : ''}`,
    link: typeof vacAquiHref === 'function' ? vacAquiHref('aba=stops') : '', foto: { período: per, minutos: Math.round(min), eventos: evs.length, em: new Date().toISOString() } }, vinculos: [] };
}
/* 2.4.26 · IMP-06: Configurações › Importação (RELATÓRIO, PARADAS, planos do PCP, CSV do MES) com o atalho para a visão única do Portal */
(() => { const C = typeof Cfg !== 'undefined' && Cfg.importacao; if (!C || C._imp) return; C._imp = 1; const r0 = C.render;
  C.render = function () { return `<div class="banner info" style="margin-bottom:10px"><p><b>Todas as importações da plataforma</b> (ordem recomendada e status de cada dia) ficam no Portal › Importação. Daqui, cada relatório continua sendo importado nesta página. <a class="btn sm" href="${esc(ordPortalImpHref())}" data-keep="1">Abrir Portal › Importação ↗</a></p></div>` + r0.apply(this, arguments); }; })();

/* ----- vac-cabecalho v2.1 · 05/11/2026 (igual em todas as páginas; não editar só numa) -----
   1) ← Voltar ao lado do título: volta para a tela anterior (aba da página ou página anterior), igual ao botão voltar do navegador.
      As abas da página entram no histórico do navegador: clique numa aba = nova entrada; voltar = clica de novo na aba anterior.
      A página pode definir vacNavAtual() → {attr,val,sub} quando a aba atual não é o botão marcado (ex.: Produção).
   2) Ao voltar para a página (troca de aba/janela, ← Voltar, página restaurada), chama vacAoVoltar() se a página definir,
      para reler o que outras páginas gravaram sem precisar de F5. */
(() => {
  if (window.__vacV21) return; window.__vacV21 = 1;
  const SEL = '#nav [data-route],#nav [data-t],#nav [data-tab],[role=tab][data-tab]';
  const ATR = ['data-route', 'data-t', 'data-tab'];
  const doEl = el => { for (const a of ATR) if (el.hasAttribute(a)) return { attr: a, val: el.getAttribute(a), sub: el.getAttribute('data-osub2') || null }; return null; };
  const atual = el => {
    if (typeof vacNavAtual === 'function') { try { const v = vacNavAtual(); if (v) return v; } catch (e) { } }
    if (el) return doEl(el);
    const on = document.querySelector('#nav .on[data-t],#nav button.on,#nav [aria-current=page],#nav [aria-selected=true],[role=tab][data-tab][aria-selected=true]');
    return on ? doEl(on) : null;
  };
  /* páginas que limpam o estado do histórico (replaceState(null…)) não apagam a posição gravada */
  try { const rs = history.replaceState.bind(history); history.replaceState = function (st, t, u) { if (st == null && history.state && history.state.vacNav) st = { vacNav: history.state.vacNav }; return rs(st, t, u); }; } catch (e) { }
  let restaurando = false;
  document.addEventListener('click', e => {
    if (restaurando) return; const el = e.target.closest && e.target.closest(SEL); if (!el) return;
    const antes = atual(null);
    setTimeout(() => {
      const depois = atual(el); if (!depois || JSON.stringify(depois) === JSON.stringify(antes)) return;
      try { if (antes && !(history.state && history.state.vacNav)) history.replaceState({ ...(history.state || {}), vacNav: antes }, ''); history.pushState({ vacNav: depois }, ''); } catch (x) { }
      vacVoltarRender();
    }, 0);
  }, true);
  window.addEventListener('popstate', e => {
    const v = e.state && e.state.vacNav; vacVoltarRender(); if (!v) return;
    const cs = [...document.querySelectorAll(SEL)].filter(x => x.getAttribute(v.attr) === v.val); if (!cs.length) return;
    const el = cs.find(x => (x.getAttribute('data-osub2') || null) === (v.sub || null)) || cs[0];
    restaurando = true; try { el.click(); } finally { setTimeout(() => { restaurando = false; }, 0); }
  });
  function vacVoltarRender() {
    const t = document.getElementById('vacTitulo'); if (!t) return; let b = document.getElementById('vacVoltar');
    if (!b) {
      if (!document.getElementById('vacVoltarCss')) { const st = document.createElement('style'); st.id = 'vacVoltarCss'; st.textContent = '.vvoltar{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;margin-right:10px;border:1px solid var(--line,#d0d7e2);border-radius:8px;background:transparent;color:inherit;font-size:17px;line-height:1;cursor:pointer;vertical-align:middle;flex:none}.vvoltar:hover{background:var(--hover,rgba(127,127,127,.12))}.vvoltar[hidden]{display:none!important}'; document.head.appendChild(st); }
      t.insertAdjacentHTML('beforebegin', '<button type="button" id="vacVoltar" class="vvoltar" title="Voltar para a tela anterior (igual ao voltar do navegador · Alt+←)" aria-label="Voltar">←</button>');
      b = document.getElementById('vacVoltar'); b.onclick = () => history.back();
    }
    b.hidden = history.length < 2;
  }
  window.vacVoltarRender = vacVoltarRender;
  let ult = 0;
  const voltou = () => { if (document.hidden) return; const n = Date.now(); if (n - ult < 1500) return; ult = n; vacVoltarRender(); try { if (typeof vacAoVoltar === 'function') vacAoVoltar(); } catch (e) { console.warn('vacAoVoltar', e); } };
  document.addEventListener('visibilitychange', voltou); window.addEventListener('focus', voltou); window.addEventListener('pageshow', e => { vacVoltarRender(); if (e.persisted) voltou(); });
  setInterval(() => { if (!document.getElementById('vacVoltar')) vacVoltarRender(); }, 1500);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', vacVoltarRender); else setTimeout(vacVoltarRender, 0);
})();
/* kit v2.1 · câmbio do cadastro geral (Portal › Câmbio): cotação vigente numa data, em R$ por 1 unidade da moeda. null = sem cadastro. */
/* kit v2.1 · E2 (08/11/2026): "hoje" no dia local do computador (antes, sem data, valia o dia em UTC: às 22h de Brasília já era amanhã).
   Os leitores abaixo usam a data do fato quando recebem uma; vacHoje() é só o padrão quando não recebem. */
function vacHoje() { const d = new Date(); return new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); }
function vacCambio(data, moeda = 'USD') {
  const c = typeof vacCad === 'function' ? vacCad() : null, m = c && (c.cambio || []).find(x => String(x.codigo).toUpperCase() === moeda && x.ativo !== false); if (!m) return null;
  const d = String(data || '').slice(0, 10) || vacHoje();
  const v = (m.vigencias || []).filter(x => x.de <= d && (!x.ate || x.ate >= d)).sort((a, b) => a.de < b.de ? 1 : -1)[0];
  return v && +v.cotacao > 0 ? { cotacao: +v.cotacao, de: v.de, ate: v.ate || null } : null;
}
/* kit v2.1 · leituras do cadastro geral (cópia vac.cadastros), iguais em todas as páginas */
const vacVig = (vs, data) => { const d = String(data || '').slice(0, 10) || vacHoje(); return (vs || []).filter(v => v.de <= d && (!v.ate || v.ate >= d)).sort((a, b) => a.de < b.de ? 1 : -1)[0] || null; };
function vacParam(k) { const c = typeof vacCad === 'function' ? vacCad() : null; return c && c.parametros ? c.parametros[k] ?? null : null; }
/* turnos vigentes numa data: [{codigo, nome, inicio, fim, dias, ativo, pausas}] (fim em 24 h+) */
function vacTurnosEm(data) { const c = typeof vacCad === 'function' ? vacCad() : null; return (c && c.turnos || []).filter(t => t.ativo !== false).map(t => { const v = vacVig(t.vigencias, data); return v ? { codigo: t.codigo, nome: t.nome, ...v } : null; }).filter(Boolean); }
/* preço vigente de um material: {preco, moeda, porUnidade, de} */
function vacPrecoEm(material, data) { const c = typeof vacCad === 'function' ? vacCad() : null; const it = c && (c.precos || []).find(p => String(p.material) === String(material)); const v = it ? vacVig(it.vigencias, data) : null; return v && +v.preco > 0 ? { preco: +v.preco, moeda: v.moeda || 'USD', porUnidade: v.porUnidade || 'kg', de: v.de } : null; }
/* meta da área vigente: {valor, alerta, unidade, sentido, periodo, de} */
function vacMetaArea(codigo, data) { const c = typeof vacCad === 'function' ? vacCad() : null; const it = c && (c.metasArea || []).find(m => m.codigo === codigo && m.ativo !== false); const v = it ? vacVig(it.vigencias, data) : null; return v && v.valor != null ? { valor: +v.valor, alerta: v.alerta != null ? +v.alerta : null, unidade: it.unidade, sentido: it.sentido, periodo: it.periodo, de: v.de } : null; }
/* kit v2.1 · E2 (08/11/2026): meta da área de um mês (AAAA-MM), pela vigência de cada dia (regra 3). Duas vigências no mesmo mês =
   média ponderada pelos dias de cada uma (só os dias cobertos por vigência). null se nenhum dia do mês tem vigência.
   Volta {valor, ponderada, partes:[{de, valor, dias}], diasCobertos, diasMes, unidade, sentido, periodo}. */
function vacMetaAreaMes(codigo, per) {
  const c = typeof vacCad === 'function' ? vacCad() : null; const it = c && (c.metasArea || []).find(m => m.codigo === codigo && m.ativo !== false);
  if (!it || !/^\d{4}-\d{2}$/.test(String(per || ''))) return null;
  const [y, mo] = String(per).split('-').map(Number), n = new Date(y, mo, 0).getDate(), partes = new Map(); let soma = 0, dias = 0;
  for (let d = 1; d <= n; d++) {
    const v = vacVig(it.vigencias, per + '-' + String(d).padStart(2, '0')); if (!v || v.valor == null || v.valor === '' || !isFinite(+v.valor)) continue;
    soma += +v.valor; dias++; let p = partes.get(v.de); if (!p) partes.set(v.de, p = { de: v.de, valor: +v.valor, dias: 0 }); p.dias++;
  }
  if (!dias) return null; const P = [...partes.values()];
  return { valor: soma / dias, ponderada: P.length > 1, partes: P, diasCobertos: dias, diasMes: n, unidade: it.unidade, sentido: it.sentido, periodo: it.periodo };
}
/* link para uma tela do Portal (Administração) */
function vacPortalHref(h) { const port = (typeof systems === 'function' ? systems() : []).find(s => s.id === 'portal') || { id: 'portal', html: 'Portal.html' }; return typeof sysHref === 'function' ? sysHref(port, h) : 'Portal.html#' + h; }
/* kit v2.1 · vac-visual v1 (06/11/2026): abas numa linha só. Quando não cabem, a faixa rola na horizontal, com sombra e seta ‹ › na borda
   que tem mais abas, e a aba ativa fica à vista. A Produção (abas agrupadas com menus, nav.vtabs.nav) não rola. CSS em fontes/kit/kit_visual.css. */
(function () {
  const marcar = () => {
    const nav = document.querySelector('nav.vtabs:not(.nav)'); if (!nav) return; const t = nav.querySelector('.tabs'); if (!t) return;
    const w = nav.querySelector('.wrap');
    if (w && !w.querySelector('.vrola')) {
      w.insertAdjacentHTML('beforeend', '<button type="button" class="vrola e" aria-label="Ver abas anteriores" tabindex="-1">‹</button><button type="button" class="vrola d" aria-label="Ver mais abas" tabindex="-1">›</button>');
      w.querySelector('.vrola.e').onclick = () => { t.scrollLeft -= t.clientWidth * .7; };
      w.querySelector('.vrola.d').onclick = () => { t.scrollLeft += t.clientWidth * .7; };
      t.addEventListener('scroll', () => requestAnimationFrame(estado), { passive: true });
    }
    estado();
  };
  const estado = () => {
    const nav = document.querySelector('nav.vtabs:not(.nav)'); const t = nav && nav.querySelector('.tabs'); if (!t) return;
    const esq = t.scrollLeft > 2, dir = t.scrollLeft + t.clientWidth < t.scrollWidth - 2;
    nav.toggleAttribute('data-mais-esq', esq); nav.toggleAttribute('data-mais-dir', dir);
  };
  const ativaVisivel = () => {
    const t = document.querySelector('nav.vtabs:not(.nav) .tabs'); if (!t || t.scrollWidth <= t.clientWidth) return estado();
    const on = t.querySelector('.on, [aria-selected="true"]'); if (!on) return estado();
    const a = on.offsetLeft - t.offsetLeft, b = a + on.offsetWidth;
    if (a < t.scrollLeft + 24) t.scrollLeft = Math.max(0, a - 40); else if (b > t.scrollLeft + t.clientWidth - 24) t.scrollLeft = b - t.clientWidth + 40;
    estado();
  };
  window.vacAbasRolagem = () => { marcar(); ativaVisivel(); };
  const ini = () => { marcar(); ativaVisivel(); const t = document.querySelector('nav.vtabs:not(.nav) .tabs'); if (t) { new MutationObserver(() => requestAnimationFrame(() => { marcar(); ativaVisivel(); })).observe(t, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'aria-selected'] }); } };
  window.addEventListener('resize', () => requestAnimationFrame(ativaVisivel));   // ao redimensionar, a aba ativa continua à vista
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ini); else setTimeout(ini, 0);
})();
/* kit v2.1 · vac-visual v1: menu "Mais" (details.vmais) sempre dentro da tela. Abre alinhado à direita do botão; se não couber, alinha à esquerda */
document.addEventListener('toggle', e => {
  const d = e.target; if (!d || !d.classList || !d.classList.contains('vmais') || !d.open) return;
  const l = d.querySelector('.vmais-l'); if (!l) return; l.style.left = ''; l.style.right = '';
  const r = l.getBoundingClientRect(); if (r.left < 8) { l.style.right = 'auto'; l.style.left = '0'; }
  const r2 = l.getBoundingClientRect(); if (r2.right > innerWidth - 8) l.style.left = (innerWidth - 8 - r2.width - d.getBoundingClientRect().left) + 'px';
}, true);
/* kit v2.1 · impressão e exportação sempre no tema claro (07/11/2026). vacTemaClaro(true) põe o tema claro e guarda o anterior;
   vacTemaClaro(false) devolve. Ctrl+P e window.print() passam por aqui (beforeprint/afterprint). Páginas que vigiam o tema
   (Gel) não desfazem enquanto data-vac-claro estiver marcado. */
function vacTemaClaro(on) {
  const r = document.documentElement;
  if (on) { if (r.dataset.vacClaro != null) return; r.dataset.vacClaro = r.hasAttribute('data-theme') ? r.getAttribute('data-theme') : '-'; r.setAttribute('data-theme', 'light'); }
  else { const t = r.dataset.vacClaro; if (t == null) return; delete r.dataset.vacClaro; if (t === '-') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', t); }
}
window.addEventListener('beforeprint', () => vacTemaClaro(true));
window.addEventListener('afterprint', () => vacTemaClaro(false));
/* kit v2.1 · situação da página (07/11/2026, docs/paginas-construcao.md): 'construcao' | 'atualizacao' | null (estável).
   Vale, nesta ordem: Portal › Configuração do Portal › Módulos (vac.sistemas[].estado) > PAGE.estado do HTML > DEFAULT_SYSTEMS.
   Mostra um selo na barra do sistema (ponto colorido; o texto aparece ao passar o mouse), uma pílula ao lado da versão, uma faixa abaixo das abas da página atual e o selo no Ctrl K. */
const VAC_ESTADO = { construcao: { rot: 'em construção', cls: 'none' }, atualizacao: { rot: 'em atualização', cls: 'info' } };
function vacEstadoDe(id) {
  const L = typeof systems === 'function' ? systems() : [], s = L.find(x => x.id === id) || {};
  const pg = typeof PAGE !== 'undefined' && PAGE && PAGE.id === id ? PAGE : {};
  const d = (typeof DEFAULT_SYSTEMS !== 'undefined' ? DEFAULT_SYSTEMS : []).find(x => x.id === id) || {};
  const e = s.estado !== undefined ? s.estado : pg.estado !== undefined ? pg.estado : d.estado;
  return VAC_ESTADO[e] ? { estado: e, ...VAC_ESTADO[e], nota: s.estadoNota || pg.estadoNota || d.estadoNota || '' } : null;
}
(function () {
  const esc2 = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const arq = h => String(h || '').split('#')[0].split('/').pop();
  const sisDoLink = a => { const h = a.getAttribute('href') || ''; const L = typeof systems === 'function' ? systems() : [];
    if (typeof PAGE !== 'undefined' && PAGE.id === 'portal' && h === '#geral') return L.find(s => s.id === 'portal');
    return L.find(s => s.html && arq(s.html) === arq(h) && arq(h)); };
  const selos = () => {
    document.querySelectorAll('#sysNav a, #sysOutros .vmenu-l a').forEach(a => {
      const s = sisDoLink(a), e = s ? vacEstadoDe(s.id) : null, v = a.querySelector('.vest');
      if (!e) { if (v) v.remove(); return; }
      if (v && v.dataset.e === e.estado) return; if (v) v.remove();
      a.insertAdjacentHTML('beforeend', `<span class="vest" data-e="${e.estado}" role="img" aria-label="${esc2(e.rot)}" title="${esc2(e.rot + (e.nota ? ' · ' + e.nota : ''))}"></span>`);
    });
  };
  const oculta = id => { try { const d = localStorage.getItem('vac.estadoOculto.' + id); return d && Date.now() - new Date(d).getTime() < 7 * 864e5; } catch (e) { return false; } };
  const pagina = () => {
    if (typeof PAGE === 'undefined' || !PAGE) return; const e = vacEstadoDe(PAGE.id);
    const ver = document.getElementById('appVer'); let p = document.getElementById('vacEstPill');
    if (!e) { if (p) p.remove(); } else if (ver) {
      if (!p) { ver.insertAdjacentHTML('afterend', '<span class="pill" id="vacEstPill"></span>'); p = document.getElementById('vacEstPill'); }
      p.className = 'pill ' + e.cls; p.textContent = e.rot; p.title = e.nota || '';
    }
    let f = document.getElementById('vacEstFaixa'); const nav = document.querySelector('nav.vtabs');
    if (!e || (e.estado === 'atualizacao' && oculta(PAGE.id))) { if (f) f.remove(); return; }
    const ver2 = typeof vacPortalHref === 'function' ? vacPortalHref('versoes') : 'Portal.html#versoes';
    const html = e.estado === 'construcao'
      ? `<b>Página em construção.</b> Ainda não grava dados; mostra o que vai ter.${e.nota ? ' ' + esc2(e.nota) : ''}`
      : `<b>Página em atualização.</b> Ela funciona normalmente; algumas telas ainda vão mudar.${e.nota ? ' ' + esc2(e.nota) : ''} <a href="${esc2(ver2)}">Ver o que muda ↗</a><button type="button" class="vestx" title="Esconder por 7 dias" aria-label="Esconder aviso">✕</button>`;
    if (!f) { const box = document.createElement('div'); box.id = 'vacEstFaixa'; (nav || document.querySelector('.vpage') || document.body.firstElementChild).insertAdjacentElement('afterend', box); f = box; }
    if (f.dataset.e !== e.estado || f.dataset.n !== e.nota) { f.dataset.e = e.estado; f.dataset.n = e.nota; f.className = 'vestfaixa ' + e.estado; f.innerHTML = `<div class="wrap">${html}</div>`;
      const x = f.querySelector('.vestx'); if (x) x.onclick = () => { try { localStorage.setItem('vac.estadoOculto.' + PAGE.id, new Date().toISOString()); } catch (er) { } f.remove(); }; }
  };
  const busca = () => {
    if (typeof Busca === 'undefined' || !Busca || Busca._vacEst) return; Busca._vacEst = 1; const f0 = Busca.itens;
    Busca.itens = function () { const R = f0.apply(this, arguments) || []; for (const x of R) { if (x.tipo !== 'Ir para' || !x.href) continue;
      const s = (typeof systems === 'function' ? systems() : []).find(s => s.html && arq(s.html) === arq(x.href) && !String(x.href).includes('#'));
      const e = s && vacEstadoDe(s.id); if (e && !String(x.sub || '').includes(e.rot)) x.sub = (x.sub ? x.sub + ' · ' : '') + e.rot; } return R; };
  };
  function vacEstadoRender() { try { selos(); pagina(); busca(); } catch (e) { console.warn('vacEstadoRender', e); } }
  window.vacEstadoRender = vacEstadoRender;
  const ini = () => {
    vacEstadoRender();
    for (const id of ['sysNav', 'sysOutros']) { const el = document.getElementById(id); if (el) new MutationObserver(() => requestAnimationFrame(selos)).observe(el, { childList: true }); }
  };
  window.addEventListener('storage', e => { if (e.key === 'vac.sistemas' || (e.key || '').startsWith('vac.estadoOculto')) vacEstadoRender(); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(ini, 0)); else setTimeout(ini, 0);
})();
/* kit v2.1 · texto seguro para CSV (07/11/2026): texto que começa com = + - @ (ou tab/retorno) vira fórmula ao abrir o CSV no Excel.
   Recebe um prefixo ' (o Excel mostra o texto como está). Número escrito como texto (-1.234 · -12,5 · -3%) não é mexido, e
   valores number continuam número. Usado por Waste, Gel e Produção (cada página mantém o próprio formato de número e aspas). */
function vacCsvTexto(v) { const s = String(v ?? ''); return /^[=+\-@\t\r]/.test(s) && !/^[+-]?[\d.,\s]+%?$/.test(s) ? "'" + s : s; }
/* kit v2.1 · E3 (08/11/2026): número de texto, estrito (o texto inteiro precisa ser número; "12a" não vira 12).
   Volta number, null (vazio) ou NaN (inválido). Regras por campo/fonte:
   · vírgula sozinha = decimal (1,5); várias vírgulas = milhar em grupos de 3; com vírgula e ponto, o último é o decimal (1.234,5 · 1,234.5);
   · ponto sozinho: ponto:'decimal' (padrão; 1.234 = 1,234) ou ponto:'milhar' (1.234 = 1234 quando tem 3 dígitos depois; 1.5 = 1,5);
   · sinal no fim (15-, negativo do SAP) só com sap:true; espaços entre dígitos são ignorados (4 500,0).
   Códigos nunca passam por aqui (regra 4). */
function vacNumero(v, { ponto = 'decimal', sap = false } = {}) {
  if (v == null) return null; if (typeof v === 'number') return Number.isFinite(v) ? v : NaN;
  let s = String(v).replace(/\u2212/g, '-').replace(/[\s\u00a0\u202f]+/g, ''); if (!s) return null;
  let neg = false; if (sap && /^\d[\d.,]*-$/.test(s)) { neg = true; s = s.slice(0, -1); }
  if (/^[+-]/.test(s)) { if (s[0] === '-') neg = !neg; s = s.slice(1); }
  if (!/^[\d.,]+$/.test(s) || !/\d/.test(s)) return NaN;
  const g3 = (t, sep) => t.split(sep).slice(1).every(x => x.length === 3) && t.split(sep)[0].length > 0;
  const lc = s.lastIndexOf(','), ld = s.lastIndexOf('.');
  if (lc >= 0 && ld >= 0) { const dec = lc > ld ? ',' : '.', mil = dec === ',' ? '.' : ','; const p = s.split(dec); if (p.length !== 2 || p[1].includes(mil) || !g3(p[0], mil)) return NaN; s = p[0].split(mil).join('') + '.' + p[1]; }
  else if (lc >= 0) { const p = s.split(','); if (p.length === 2) s = p[0] + '.' + p[1]; else if (g3(s, ',')) s = p.join(''); else return NaN; }
  else if (ld >= 0) { const p = s.split('.'); if (p.length === 2 && !(ponto === 'milhar' && p[1].length === 3)) { /* decimal */ } else if (g3(s, '.')) s = p.join(''); else return NaN; }
  if (!/^(\d+\.?\d*|\.\d+)$/.test(s)) return NaN; const n = parseFloat(s); return Number.isFinite(n) ? (neg ? -n : n) : NaN;
}
/* kit v2.1 · E4 (08/11/2026): quem lê o exports de outra página confere a versão antes de usar (regra 1). Sem número (base antiga)
   ou até a versão conhecida → usa; versão mais nova → não usa e avisa (não alimenta números com estrutura desconhecida).
   Campos novos opcionais entram na mesma versão (regra 6) e quem não conhece ignora. */
function vacExportsOk(ex, conhecida = 1) {
  if (!ex || typeof ex !== 'object') return { ok: false, versao: null, motivo: 'a base não tem o bloco exports' };
  const v = ex.exportsVersion; if (v == null || +v <= conhecida) return { ok: true, versao: v == null ? null : +v, motivo: '' };
  return { ok: false, versao: +v, motivo: `exports na versão ${v}; esta página só conhece até a ${conhecida}: atualize esta página` };
}

/* kit v2.1 · E5 (08/11/2026): ficha da ordem, do lote e da LP · índice da busca (Ctrl K) · link #ficha=ordem/<n>.
   A ficha SÓ mostra o que cada página publica no exports (regra 1: não recalcula, não lê a estrutura interna).
   Lê as bases da pasta conectada (a página define vacPastaAtual() → pasta ou null), cada uma só quando muda (data e tamanho do
   arquivo). Sem pasta ou com erro de leitura, usa a última cópia lida neste computador (IndexedDB "vac-ficha"), sempre com a data.
   Abre por: busca (Ctrl K), clique em elemento com data-vac-ordem / data-vac-lote / data-vac-lp, vacFicha.abrir(tipo, código)
   ou o link <página>#ficha=ordem/<n> (também lote/<x> e lp/<x>). O ← Voltar do navegador fecha a ficha e mantém a tela. */
const vacFicha = (() => {
  const FONTES = [
    { id: 'oee', nome: 'Produção', base: 'oee-vacutainer-base.json', pega: ex => ({ porOrdem: ex.porOrdem || [], cob: ex.porOrdemCobertura || null, lotes: ex.lotes || [] }) },
    { id: 'ordens', nome: 'SAP (Produção › Ordens)', sis: 'oee', base: 'ordens-base.json', pega: ex => ({ porOrdem: ex.porOrdem || [] }) },
    { id: 'perdas', nome: 'Waste', base: 'perdas-base.json', pega: ex => ({ porOrdem: ex.porOrdem || [] }) },
    { id: 'gel', nome: 'Gestão de Gel', base: 'fifo-base.json', pega: ex => ({ ordens: ex.ordens || [], cob: ex.ordensCobertura || null }) },
    { id: 'paradas', nome: 'Paradas', base: 'paradas-base.json', pega: ex => ({ porOrdem: ex.porOrdem || [], eventos: (ex.eventos || []).filter(e => e && e.ordem) }) },
    { id: 'inic', nome: 'Iniciativas', base: 'iniciativas-base.json', pega: ex => ({ acoes: ex.acoes || [] }) }];
  const S = { dados: {}, idx: null, carregando: null, aberto: null, empilhado: false };
  const e2 = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const tx = v => String(v ?? '').trim();
  const nk = v => { const s = tx(v); return /^\d+$/.test(s) ? s.replace(/^0+(?=\d)/, '') : s.toUpperCase(); };   // só para comparar; o código mostrado é o original (regra 4)
  const semAc = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const nf = (n, d = 0) => n == null || !Number.isFinite(+n) ? '—' : (+n).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const dt = s => { const m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/.exec(tx(s)); return m ? `${m[3]}/${m[2]}${m[4] ? ' ' + m[4] + ':' + m[5] : '/' + m[1]}` : (s ? tx(s) : '—'); };
  const dth = iso => { if (!iso) return '—'; const d = new Date(iso); if (isNaN(d)) return dt(iso); const p = n => String(n).padStart(2, '0'); return `${p(d.getDate())}/${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`; };
  const mes = s => { const m = /^(\d{4})-(\d{2})/.exec(tx(s)); return m ? ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'][+m[2] - 1] + '/' + m[1] : tx(s); };
  const F = id => FONTES.find(f => f.id === id);
  const D = id => (S.dados[id] && S.dados[id].d) || null;
  const naoAchou = e => typeof vacNaoAchou === 'function' ? vacNaoAchou(e) : !!e && e.name === 'NotFoundError';
  /* IndexedDB: última cópia lida de cada base (só o que a ficha usa) */
  const idbAbre = () => new Promise((ok, no) => { const r = indexedDB.open('vac-ficha', 1); r.onupgradeneeded = () => r.result.createObjectStore('f'); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); });
  const idbGet = async k => { const db = await idbAbre(); return new Promise((ok, no) => { const q = db.transaction('f').objectStore('f').get(k); q.onsuccess = () => { db.close(); ok(q.result); }; q.onerror = () => { db.close(); no(q.error); }; }); };
  const idbSet = async (k, v) => { const db = await idbAbre(); return new Promise((ok, no) => { const t = db.transaction('f', 'readwrite'); t.objectStore('f').put(v, k); t.oncomplete = () => { db.close(); ok(); }; t.onerror = () => { db.close(); no(t.error); }; }); };
  const pasta = () => { let d = null; try { d = typeof vacPastaAtual === 'function' ? vacPastaAtual() : null; } catch (e) { } return d && !d.__vacRaiz && typeof vacRaiz === 'function' ? vacRaiz(d) : d; };
  function carregar(forcar) {
    if (S.carregando) return S.carregando;
    S.carregando = (async () => {
      if(vacDemo.ativo){for(const f of FONTES){const ex=vacDemo.exports(f.id);S.dados[f.id]=ex?{estado:'pasta',pasta:'Demonstração',geradoEm:ex.geradoEm,d:f.pega(ex)}:{estado:'ausente'}}S.idx=null;return}
      const dir = pasta();
      /* AT-08 · trocou de pasta na mesma aba: o que a ficha tem em memória e o índice da busca são da pasta anterior; relê tudo.
         NV-03: a cópia do IndexedDB guarda a identidade comprovada da origem, não só o nome final. */
      if (dir) { let mesma = false; try { mesma = !!S.pasta && await dir.isSameEntry(S.pasta); } catch (e) { } if (S.pasta && !mesma) { S.dados = {}; S.idx = null; } S.pasta = dir; }
      const nomeP = dir ? String(dir.name || '') : '';
      let origem = ''; if(dir) { try { origem = await vacOrigemPasta(dir); } catch(e) { } }
      for (const f of FONTES) {
        const atual = S.dados[f.id];
        try {
          if (!dir) throw { semPasta: true };
          let fh; try { fh = await dir.getFileHandle(f.base); } catch (e) { if (naoAchou(e)) { S.dados[f.id] = { estado: 'ausente' }; continue; } throw e; }
          const arq = await fh.getFile();
          if (!forcar && atual && atual.estado === 'pasta' && atual.mod === arq.lastModified && atual.tam === arq.size) continue;
          const j = JSON.parse(await arq.text()), ex = j && j.exports, v = typeof vacExportsOk === 'function' ? vacExportsOk(ex) : { ok: !!ex };
          if (!v.ok) { S.dados[f.id] = { estado: ex ? 'versao' : 'semexports', motivo: v.motivo || 'a base ainda não publica o resumo (exports)' }; continue; }
          const x = { estado: 'pasta', mod: arq.lastModified, tam: arq.size, lidoEm: new Date().toISOString(), geradoEm: ex.geradoEm || null, pasta: nomeP, origem, d: f.pega(ex) };
          S.dados[f.id] = x; try { await idbSet(f.id, x); } catch (e) { }
        } catch (e) {
          let c = atual && atual.d ? atual : null; if (!c) { try { c = await idbGet(f.id); } catch (x) { } } if (c && dir && (!origem || !c.origem || c.origem !== origem)) c = null;   // cópia de outra pasta não vale para esta
          const motivo = e && e.semPasta ? 'pasta da rede não conectada nesta página' : `não consegui ler ${f.base} (${(e && (e.name || e.message)) || e})`;
          S.dados[f.id] = c && c.d ? { ...c, estado: 'cache', motivo } : { estado: e && e.semPasta ? 'sempasta' : 'erro', motivo };
        }
      }
      S.idx = null;
    })().finally(() => { S.carregando = null; });
    return S.carregando;
  }
  /* índice da busca: o que existe de verdade nos exports e no cadastro (não adivinha pelo número de dígitos) */
  function indice() {
    if (S.idx) return S.idx;
    const I = { ordem: new Map(), lote: new Map(), lp: new Map() };
    const reg = (tipo, cod, info) => { const k = nk(cod); if (!k) return null; let x = I[tipo].get(k); if (!x) I[tipo].set(k, x = { k, cod: tx(cod), ordens: new Set(), lotes: new Set(), cats: new Set(), datas: [], fontes: new Set() }); if (info) { if (info.o && ![...x.ordens].some(o => nk(o) === nk(info.o))) x.ordens.add(tx(info.o).replace(/^0+(?=\d)/, '')); if (info.l) x.lotes.add(tx(info.l)); if (info.c) x.cats.add(tx(info.c)); if (info.d && /^\d{4}-\d{2}-\d{2}/.test(tx(info.d))) x.datas.push(tx(info.d).slice(0, 10)); if (info.f) x.fontes.add(info.f); } return x; };
    const ord = (o, f, l, c, d) => { reg('ordem', o, { l, c, d, f }); if (l) reg('lote', l, { o, c, d, f }); };
    for (const o of (D('oee') || {}).porOrdem || []) ord(o.ordem, 'Produção', o.lote, o.catalogo, o.inicioReal || o.inicio || o.mes);
    for (const l of (D('oee') || {}).lotes || []) reg('lote', l.lote, { c: l.catalogo, d: l.inicio, f: 'Produção' });
    for (const o of (D('ordens') || {}).porOrdem || []) { ord(o.ordem, 'SAP', null, null, o.dataPrincipal); for (const l of o.lotes || []) ord(o.ordem, 'SAP', l, null, null); }
    for (const o of (D('perdas') || {}).porOrdem || []) ord(o.ordem, 'Waste', o.lote, o.catalogo, o.per);
    for (const o of (D('gel') || {}).ordens || []) { ord(o.ordem, 'Gel', o.lote, o.catalogo, o.inicio); for (const p of o.lps || []) reg('lp', p, { o: o.ordem, l: o.lote, f: 'Gel' }); }
    for (const o of (D('paradas') || {}).porOrdem || []) ord(o.ordem, 'Paradas', null, null, o.de);
    return (S.idx = I);
  }
  function buscar(q) {
    const k = nk(q), ks = semAc(q).trim(); if (k.length < 2) return [];
    const I = indice(), R = [];
    const rank = c => c === k ? 0 : c.startsWith(k) ? 1 : 2;
    const top = (m, n) => [...m.values()].filter(x => x.k.includes(k)).sort((a, b) => rank(a.k) - rank(b.k) || a.k.length - b.k.length || a.k.localeCompare(b.k)).slice(0, n);
    const per = x => { const d = x.datas.filter(Boolean).sort(); return d.length ? (d[0] === d[d.length - 1] ? dt(d[0]) : dt(d[0]) + ' a ' + dt(d[d.length - 1])) : ''; };
    for (const x of top(I.lote, 6)) R.push({ tipo: 'Lote', txt: x.cod, sub: [x.ordens.size ? 'ordem ' + [...x.ordens].join(', ') : '', x.cats.size ? 'catálogo ' + [...x.cats].join(', ') : '', per(x)].filter(Boolean).join(' · '), go: () => abrir('lote', x.cod), r: rank(x.k) });
    for (const x of top(I.ordem, 8)) R.push({ tipo: 'Ordem', txt: x.cod, sub: [x.lotes.size ? 'lote ' + [...x.lotes].join(', ') : '', x.cats.size ? 'catálogo ' + [...x.cats].join(', ') : '', [...x.fontes].join(' · ')].filter(Boolean).join(' · '), go: () => abrir('ordem', x.cod), r: rank(x.k) });
    for (const x of top(I.lp, 5)) R.push({ tipo: 'LP', txt: x.cod, sub: 'barril de gel · ordem ' + [...x.ordens].join(', '), go: () => abrir('lp', x.cod), r: rank(x.k) });
    const C = typeof vacCad === 'function' ? vacCad() : null, href = h => typeof vacPortalHref === 'function' ? vacPortalHref(h) : 'Portal.html#' + h;
    if (C) {
      for (const c of (C.catalogos || []).filter(c => c.ativo !== false && (nk(c.codigo).includes(k) || semAc(c.nome).includes(ks))).slice(0, 5)) R.push({ tipo: 'Catálogo', txt: tx(c.codigo) + (c.nome ? ' · ' + c.nome : ''), sub: 'cadastro do Portal', href: href('cadastros/catalogos/' + encodeURIComponent(c.codigo)), r: nk(c.codigo) === k ? 0 : 2 });
      for (const e of (C.equipamentos || []).filter(e => e.ativo !== false && (nk(e.codigo).includes(k) || semAc(e.nome).includes(ks) || (e.apelidos || []).some(a => semAc(a).includes(ks)))).slice(0, 5)) {
        const ap = (e.apelidos || []).find(a => semAc(a).includes(ks));
        R.push({ tipo: 'Equipamento', txt: tx(e.codigo) + (e.nome ? ' · ' + e.nome : ''), sub: (ap ? `apelido “${ap}” · ` : '') + 'ficha do equipamento', href: typeof vacEquipHref === 'function' ? vacEquipHref(e.codigo) : (() => { const s = (typeof systems === 'function' ? systems() : []).find(x => x.id === 'equip'); return s && !s.futuro && (typeof vacEstadoDe !== 'function' || (vacEstadoDe('equip') || {}).estado !== 'construcao') && typeof sysHref === 'function' ? sysHref(s, 'eq=' + encodeURIComponent(e.codigo)) : href('cadastros/equipamentos/' + encodeURIComponent(e.codigo)); })(), r: nk(e.codigo) === k ? 0 : 2 });
      }
    }
    return R.sort((a, b) => a.r - b.r);
  }
  /* ---------- painel ---------- */
  const sysHrefDe = (id, hash) => { try { const s = (typeof systems === 'function' ? systems() : []).find(x => x.id === id); if (!s) return null; if (typeof PAGE !== 'undefined' && PAGE.id === id) return '#' + hash; return typeof sysHref === 'function' ? sysHref(s, hash) : s.html + '#' + hash; } catch (e) { return null; } };
  const linkAbrir = (id, hash, rot) => { const h = sysHrefDe(id, hash); return h ? `<a class="vf-abrir" href="${e2(h)}" data-vf-ir>${e2(rot)} ›</a>` : ''; };
  function fonteTxt(id) {
    const x = S.dados[id], f = F(id); if (!x) return 'lendo…';
    if (x.estado === 'pasta') return `exports ${f.id === 'ordens' ? 'de Produção › Ordens' : 'de ' + f.nome} · gerado ${dth(x.geradoEm)}`;
    if (x.estado === 'cache') return `<span class="vf-cache">cópia lida em ${dth(x.lidoEm)}</span> · ${e2(x.motivo)}`;
    return e2(x.motivo || '');
  }
  const okFonte = id => S.dados[id] && (S.dados[id].estado === 'pasta' || S.dados[id].estado === 'cache');
  const vazio = (id, txt) => okFonte(id) ? txt : (S.dados[id] ? ({ ausente: `${F(id).base} ainda não existe na pasta.`, sempasta: 'Pasta da rede não conectada nesta página (e ainda sem cópia lida neste computador).' }[S.dados[id].estado] || S.dados[id].motivo || 'Sem dado.') : 'Lendo…');
  const bloco = (titulo, id, link, corpo, semDado) => `<section class="vf-bl${semDado ? ' off' : ''}"><h3>${e2(titulo)}${link || ''}</h3>${semDado ? `<p class="vf-vz">${e2(semDado)}</p>` : corpo}<div class="vf-fonte">${fonteTxt(id)}</div></section>`;
  const dl = pares => `<dl class="vf-dl">${pares.filter(Boolean).map(([a, b]) => `<div><dt>${e2(a)}</dt><dd>${b}</dd></div>`).join('')}</dl>`;
  const tab = (cab, linhas) => linhas.length ? `<div class="vf-tw"><table class="vf-t"><tr>${cab.map(c => `<th${/^#/.test(c) ? ' class="n"' : ''}>${e2(c.replace(/^#/, ''))}</th>`).join('')}</tr>${linhas.map(l => `<tr>${l.map((c, i) => `<td${/^#/.test(cab[i]) ? ' class="n"' : ''}>${c}</td>`).join('')}</tr>`).join('')}</table></div>` : '';
  const modo = () => { try { return localStorage.getItem('vac.ficha.modo') === 'det' ? 'det' : 'res'; } catch (e) { return 'res'; } };
  const fora = (cob, datas, rot) => { if (!cob) return ''; const de = tx(cob.de || cob.desde); const d = (datas || []).filter(Boolean).sort()[0]; return de && d && d.slice(0, de.length) < de ? ` A ordem é de antes da janela que ${rot} publica (desde ${de.length === 7 ? mes(de) : dt(de)}): sem dado não quer dizer zero.` : ''; };
  function htmlOrdem(cod) {
    const k = nk(cod), m = a => (a || []).filter(x => nk(x.ordem) === k), det = modo() === 'det';
    const oee = m((D('oee') || {}).porOrdem).sort((a, b) => tx(a.mes).localeCompare(tx(b.mes))), sap = m((D('ordens') || {}).porOrdem).sort((a, b) => tx(a.competencia).localeCompare(tx(b.competencia)));
    const ws = m((D('perdas') || {}).porOrdem).sort((a, b) => tx(a.per).localeCompare(tx(b.per))), gel = m((D('gel') || {}).ordens), par = m((D('paradas') || {}).porOrdem), ev = m((D('paradas') || {}).eventos);
    const ac = ((D('inic') || {}).acoes || []).filter(a => (a.vinculos || []).some(v => v.tipo === 'ordem' && nk(v.cod) === k));
    const lotes = new Set([...oee.map(o => o.lote), ...ws.map(o => o.lote), ...gel.map(o => o.lote), ...sap.flatMap(o => o.lotes || [])].filter(Boolean).map(tx));
    const cat = [...oee, ...ws, ...gel].map(o => tx(o.catalogo)).find(Boolean) || '', C = typeof vacCad === 'function' ? vacCad() : null;
    const catNome = cat && C ? ((C.catalogos || []).find(c => tx(c.codigo) === cat) || {}).nome || '' : '';
    const comps = [...new Set([...sap.map(o => o.competencia), ...ws.map(o => o.per)].filter(Boolean))].sort();
    const datas = [...oee.map(o => o.inicioReal || o.inicio || o.mes), ...sap.map(o => o.dataPrincipal), ...ws.map(o => o.per), ...par.map(o => o.de)].filter(Boolean).map(tx);
    const stSap = sap.length ? sap[sap.length - 1].status : '';
    const nada = !oee.length && !sap.length && !ws.length && !gel.length && !par.length;
    const H = [];
    // Produção
    { const u = oee[oee.length - 1];
      const corpo = u ? dl([['Planejado', nf(u.qtd)], ['Produzido', nf(u.produzido)], ['Atingimento', u.qtd ? nf(100 * u.produzido / u.qtd, 1) + '%' : '—'], ['Início real', dt(u.inicioReal)], ['Fim real', dt(u.fimReal)], ['Dias do lote', (u.diasLote || []).length ? nf(u.diasLote.length) + ((u.retrabalhoDias || []).length ? ` (${u.retrabalhoDias.length} retrabalho)` : '') : '—']])
        + (oee.length > 1 ? `<p class="vf-nota">No plano de ${oee.map(o => mes(o.mes)).join(', ')}; números do plano mais recente.</p>` : `<p class="vf-nota">Plano de ${mes(u.mes)}.</p>`)
        + (det ? tab(['Plano', 'Lote', '#Planejado', '#Produzido', 'Início real', 'Fim real'], oee.map(o => [mes(o.mes), e2(o.lote || '—'), nf(o.qtd), nf(o.produzido), dt(o.inicioReal), dt(o.fimReal)])) + ((u.diasLote || []).length ? `<p class="vf-nota">Dias do lote: ${u.diasLote.map(d => (u.retrabalhoDias || []).includes(d) ? `<b>${dt(d)}</b>` : dt(d)).join(', ')}${(u.retrabalhoDias || []).length ? ' (em negrito: retrabalho)' : ''}</p>` : '') : '') : '';
      H.push(bloco('Produção', 'oee', u ? linkAbrir('oee', 'ordem=' + encodeURIComponent(cod), 'Abrir em Produção') : '', corpo, u ? '' : vazio('oee', 'Ordem fora dos planos do mês da Produção.' + fora((D('oee') || {}).cob, datas, 'a Produção')))); }
    // Paradas
    { const p = par[0];
      const corpo = p ? dl([['Eventos', nf(p.eventos)], ['Minutos', nf(p.minutos, p.minutos % 1 ? 1 : 0)], ['Período', p.de === p.ate ? dt(p.de) : dt(p.de) + ' a ' + dt(p.ate)], ['Equipamentos', e2((p.equipamentos || []).join(', ') || '—')]])
        + (det ? (ev.length ? tab(['Dia', 'Turno', 'Equip.', 'Código', '#Min', 'Descrição'], ev.slice().sort((a, b) => tx(a.dia).localeCompare(tx(b.dia))).map(e => [dt(e.dia), e2(e.turno || ''), e2(e.equipamento || ''), e2(e.codigo || ''), nf(e.minutos, e.minutos % 1 ? 1 : 0), e2(e.descricao || '')])) + '<p class="vf-nota">Lista com os eventos dos últimos 90 dias publicados pelo Paradas.</p>' : '<p class="vf-nota">Os eventos desta ordem são de antes dos 90 dias que o Paradas publica em lista.</p>') : '') : '';
      H.push(bloco('Paradas', 'paradas', p ? linkAbrir('paradas', 'ordem=' + encodeURIComponent(cod), 'Abrir em Paradas') : '', corpo, p ? '' : vazio('paradas', 'Nenhuma parada apontada com esta ordem.'))); }
    // Waste
    { const s = (f) => ws.reduce((a, o) => a + (+o[f] || 0), 0), u = ws[ws.length - 1];
      const corpo = u ? dl([['Perda', 'R$ ' + nf(s('perda'))], ['Desvio líquido', 'R$ ' + nf(s('desvio'))], ['Nível', e2(u.nivel || '—')], ['Causa', e2(u.causa || '—')], ['Comentários', nf(s('comentarios'))], ['Ações abertas', nf(s('acoesAbertas'))]])
        + (ws.length > 1 ? `<p class="vf-nota">Soma de ${ws.length} competências (${ws.map(o => mes(o.per)).join(', ')}).</p>` : `<p class="vf-nota">Competência ${mes(u.per)}.</p>`)
        + (det ? tab(['Competência', '#Custo meta', '#Custo real', '#Desvio', '#Perda', 'Nível'], ws.map(o => [mes(o.per), nf(o.custoMeta), nf(o.custoReal), nf(o.desvio), nf(o.perda), e2(o.nivel || '')])) : '') : '';
      H.push(bloco('Waste', 'perdas', u ? linkAbrir('perdas', 'ordem=' + encodeURIComponent(cod), 'Abrir em Waste') : '', corpo, u ? '' : vazio('perdas', 'Ordem sem KKBC importada no Waste.'))); }
    // Gel
    { const g = gel[0];
      const corpo = g ? dl([['Gel baixado', g.consumoKg == null ? '—' : nf(g.consumoKg, 1) + ' kg'], ['g por tubo', g.gPorTubo == null ? '—' : nf(g.gPorTubo, 3) + (g.metaG ? ' · meta ' + nf(g.metaG, 3) : '')], ['Scrap de gel', g.scrapKg == null ? '—' : nf(g.scrapKg, 2) + ' kg (estimado)'], ['Barris (LP)', nf((g.lps || []).length)]])
        + (det && (g.lps || []).length ? `<p class="vf-nota">LPs: ${g.lps.map(l => `<a href="#" data-vac-lp="${e2(l)}" class="mono">${e2(l)}</a>`).join(', ')}</p>` : '') : '';
      H.push(bloco('Gestão de Gel', 'gel', g ? linkAbrir('gel', 'ordem=' + encodeURIComponent(cod), 'Abrir em Gestão de Gel') : '', corpo, g ? '' : vazio('gel', 'Sem registro desta ordem no Gel.' + fora((D('gel') || {}).cob, datas, 'o Gel')))); }
    // SAP
    { const u = sap[sap.length - 1];
      const corpo = u ? dl([['Status', e2(u.status || '—')], ['Tipo (COOIS)', e2((u.coois && u.coois.tipo) || '—')], ['Materiais', nf((u.materiais || []).length)], ['Pendências', nf((u.pendencias || []).length)], ['Início (COOIS)', dt(u.coois && u.coois.dIni)], ['Fim (COOIS)', dt(u.coois && u.coois.dFim)]])
        + (det ? tab(['Competência', 'Status', 'Data', 'Lotes', 'Pendências'], sap.map(o => [mes(o.competencia), e2(o.status || ''), dt(o.dataPrincipal), e2((o.lotes || []).join(', ')), e2((o.pendencias || []).join('; ') || '—')])) : '') : '';
      H.push(bloco('SAP (MB51 / COOIS)', 'ordens', u ? '<span class="pill">só leitura</span>' : '', corpo, u ? '' : vazio('ordens', 'Ordem sem MB51/COOIS importado em Produção › Ordens.'))); }
    // Ações (Iniciativas; o Waste já conta as dele acima)
    if (okFonte('inic') || ac.length) H.push(bloco('Ações ligadas', 'inic', linkAbrir('inic', 'ordem=' + encodeURIComponent(cod), 'Abrir em Iniciativas'),
      ac.map(a => `<p class="vf-ac"><span class="pill">${e2(a.status || '')}</span> ${e2(a.titulo || '')}${a.responsavel ? ' · ' + e2(a.responsavel) : ''}${a.prazo ? ' · vence ' + dt(a.prazo) : ''}</p>`).join(''), ac.length ? '' : 'Nenhuma ação ligada a esta ordem.'));
    const cab = `<div class="vf-t1"><span class="vf-tp">Ordem</span><h2 class="mono">${e2(cod)}</h2>${stSap ? `<span class="pill">${e2(stSap)}</span>` : ''}</div>
      <div class="vf-ids">${cat ? `<span>Catálogo <b>${e2(cat)}</b>${catNome ? ' · ' + e2(catNome) : ''}</span>` : ''}${lotes.size ? `<span>Lote${lotes.size > 1 ? 's' : ''} ${[...lotes].map(l => `<a href="#" data-vac-lote="${e2(l)}"><b>${e2(l)}</b></a>`).join(' ')}</span>` : ''}${comps.length ? `<span>Competência${comps.length > 1 ? 's' : ''} <b>${comps.map(mes).join(' ')}</b></span>` : ''}</div>`;
    return { cab, corpo: (nada && Object.keys(S.dados).length ? `<p class="vf-aviso">Esta ordem não aparece em nenhuma página (ou a pasta não está conectada). Confira o número.</p>` : '') + H.join('') };
  }
  function htmlLote(cod) {
    const I = indice(), x = I.lote.get(nk(cod)), L = (D('oee') || {}).lotes || [], l = L.find(y => nk(y.lote) === nk(cod));
    const ords = x ? [...x.ordens] : [];
    const corpo = (l ? bloco('Servidor (Produção)', 'oee', linkAbrir('oee', 'lote=' + encodeURIComponent(cod), 'Abrir em Produção › Lotes'), dl([['Catálogo', e2(l.catalogo || '—')], ['Peças', nf(l.pecas)], ['Início', dt(l.inicio)], ['Fim', dt(l.fim)], ['Situação', e2(l.situacao || '—')], ['Dias de retrabalho', nf((l.retrabalhoDias || []).length)]]) + (l.obs ? `<p class="vf-nota">${e2(l.obs)}</p>` : ''), '') : '')
      + `<section class="vf-bl"><h3>Ordens do lote</h3>${ords.length ? ords.map(o => `<p><a href="#" data-vac-ordem="${e2(o)}" class="mono">${e2(o)}</a> <span class="vf-nota">abre a ficha da ordem</span></p>`).join('') : '<p class="vf-vz">Nenhuma ordem ligada a este lote nos exports.</p>'}</section>`;
    return { cab: `<div class="vf-t1"><span class="vf-tp">Lote</span><h2 class="mono">${e2(cod)}</h2></div><div class="vf-ids">${x && x.cats.size ? `<span>Catálogo <b>${e2([...x.cats].join(', '))}</b></span>` : ''}</div>`, corpo };
  }
  function htmlLp(cod) {
    const os = ((D('gel') || {}).ordens || []).filter(o => (o.lps || []).some(p => nk(p) === nk(cod)));
    const corpo = bloco('Gestão de Gel', 'gel', linkAbrir('gel', 'lp=' + encodeURIComponent(cod), 'Abrir em Gestão de Gel'),
      os.length ? tab(['Ordem', 'Lote', '#Gel baixado (kg)', 'Período'], os.map(o => [`<a href="#" data-vac-ordem="${e2(o.ordem)}" class="mono">${e2(o.ordem)}</a>`, e2(o.lote || '—'), nf(o.consumoKg, 1), o.inicio ? dt(o.inicio) + (o.fim ? ' a ' + dt(o.fim) : '') : '—'])) : '', os.length ? '' : vazio('gel', 'Nenhuma ordem com baixa deste barril nos 150 dias que o Gel publica.'));
    return { cab: `<div class="vf-t1"><span class="vf-tp">LP (barril de gel)</span><h2 class="mono">${e2(cod)}</h2></div>`, corpo };
  }
  function render() {
    const a = S.aberto; if (!a) return; let el = document.getElementById('vacFicha');
    if (!el) {
      el = document.createElement('div'); el.id = 'vacFicha'; el.className = 'vficha-fundo'; el.innerHTML = '<aside class="vficha" role="dialog" aria-modal="true" aria-label="Ficha"></aside>'; document.body.appendChild(el);
      el.addEventListener('click', e => { if (e.target === el) fechar(); });
    }
    const h = a.tipo === 'lote' ? htmlLote(a.cod) : a.tipo === 'lp' ? htmlLp(a.cod) : htmlOrdem(a.cod), md = modo();
    const asd = el.querySelector('.vficha'), rol = asd.scrollTop;
    asd.innerHTML = `<header class="vf-cab">${h.cab}<div class="vf-acoes"><span class="vf-seg" role="group" aria-label="Nível de detalhe"><button type="button" data-vf-modo="res" class="${md === 'res' ? 'on' : ''}">Resumo</button><button type="button" data-vf-modo="det" class="${md === 'det' ? 'on' : ''}">Detalhado</button></span><span class="vf-sp"></span>${S.carregando ? '<span class="vf-nota">lendo as bases…</span>' : ''}${a.tipo === 'ordem' && typeof vacNovaAcaoHref === 'function' ? `<a class="vf-b" href="${e2(vacNovaAcaoHref({ titulo: '', origem: { tipo: 'ficha', ref: 'ordem|' + a.cod, resumo: 'Ficha da ordem ' + a.cod, link: link(a.tipo, a.cod) }, vinculos: [{ tipo: 'ordem', cod: a.cod }] }))}" target="_blank" rel="noopener" title="Abre Iniciativas com a ordem já ligada">+ Abrir ação</a>` : ''}<button type="button" class="vf-b" data-vf-link title="Copia o endereço que abre esta ficha">Copiar link</button><button type="button" class="vf-b" data-vf-fechar aria-label="Fechar a ficha" title="Fechar (Esc)">✕</button></div></header><div class="vf-corpo">${h.corpo}</div>`;
    asd.scrollTop = rol;
  }
  function abrir(tipo, cod, op = {}) {
    cod = tx(cod); if (!cod) return; tipo = ['ordem', 'lote', 'lp'].includes(tipo) ? tipo : 'ordem';
    S.aberto = { tipo, cod };
    if (op.hist !== false) { try { if (history.state && history.state.vacFicha) history.replaceState({ ...history.state, vacFicha: { tipo, cod } }, ''); else { history.pushState({ ...(history.state || {}), vacFicha: { tipo, cod } }, ''); } S.empilhado = true; } catch (e) { } }
    render(); document.addEventListener('keydown', esc, true);
    const p = carregar(); render(); p.then(render, render);
  }
  function fechar(op = {}) {
    if (!S.aberto) return; S.aberto = null; const el = document.getElementById('vacFicha'); if (el) el.remove(); document.removeEventListener('keydown', esc, true);
    if (op.hist !== false && history.state && history.state.vacFicha) { try { history.back(); } catch (e) { } }
  }
  function esc(e) { if (e.key === 'Escape' && S.aberto && !document.querySelector('.vbusca')) { e.stopPropagation(); fechar(); } }
  const link = (tipo, cod) => vacDemo.atualHref('ficha=' + tipo + '/' + encodeURIComponent(cod));
  function avisa(m) { try { if (typeof toast === 'function') return toast(m); } catch (e) { } console.info(m); }
  document.addEventListener('click', e => {
    const t = e.target.closest && e.target.closest('[data-vac-ordem],[data-vac-lote],[data-vac-lp],[data-vf-modo],[data-vf-link],[data-vf-fechar],[data-vf-ir]'); if (!t) return;
    if (t.hasAttribute('data-vf-ir')) { const h = t.getAttribute('href') || ''; if (h.startsWith('#')) { e.preventDefault(); fechar({ hist: false }); try { if (history.state && history.state.vacFicha) history.replaceState({ ...history.state, vacFicha: null }, ''); } catch (x) { } if (location.hash === h) window.dispatchEvent(new HashChangeEvent('hashchange')); else location.hash = h; } else fechar({ hist: false }); return; }
    e.preventDefault(); e.stopPropagation();
    if (t.hasAttribute('data-vf-modo')) { try { localStorage.setItem('vac.ficha.modo', t.getAttribute('data-vf-modo')); } catch (x) { } return render(); }
    if (t.hasAttribute('data-vf-fechar')) return fechar();
    if (t.hasAttribute('data-vf-link')) { const u = link(S.aberto.tipo, S.aberto.cod); try { navigator.clipboard.writeText(u).then(() => avisa('Link da ficha copiado.'), () => prompt('Copie o link da ficha:', u)); } catch (x) { prompt('Copie o link da ficha:', u); } return; }
    if (t.hasAttribute('data-vac-ordem')) return abrir('ordem', t.getAttribute('data-vac-ordem'));
    if (t.hasAttribute('data-vac-lote')) return abrir('lote', t.getAttribute('data-vac-lote'));
    if (t.hasAttribute('data-vac-lp')) return abrir('lp', t.getAttribute('data-vac-lp'));
  }, true);
  window.addEventListener('popstate', e => { const f = e.state && e.state.vacFicha; if (f) abrir(f.tipo, f.cod, { hist: false }); else if (S.aberto) fechar({ hist: false }); });
  const rota = () => { const m = /^#ficha=(ordem|lote|lp)\/(.+)$/.exec(location.hash || ''); if (!m) return; let c = m[2]; try { c = decodeURIComponent(c); } catch (e) { } try { history.replaceState(history.state, '', location.href.split('#')[0]); } catch (e) { } abrir(m[1], c); };
  window.addEventListener('hashchange', rota);
  /* busca: ordem, lote, LP, catálogo e equipamento entram na busca comum (Ctrl K) de todas as páginas */
  const ligaBusca = () => {
    if (typeof Busca === 'undefined' || !Busca || Busca._vacFicha) return; Busca._vacFicha = 1;
    const fi = Busca.itens, fa = Busca.abrir;
    Busca.itens = function (q) { let P = []; try { P = buscar(q || ''); } catch (e) { console.warn('vacFicha.buscar', e); } const R = fi.apply(this, arguments) || []; const vist = new Set(P.map(x => x.tipo + '|' + x.txt)); return P.concat(R.filter(x => !vist.has(x.tipo + '|' + x.txt))).slice(0, 40); };
    Busca.abrir = function () { const r = fa.apply(this, arguments); try { const i = document.getElementById('vbQ'); if (i) i.placeholder = 'Ordem, lote, LP, catálogo, equipamento ou página…'; } catch (e) { }
      carregar().then(() => { if (Busca.el) { const i = document.getElementById('vbQ'); Busca.lista(i ? i.value : ''); } }); return r; };
  };
  const ini = () => { ligaBusca(); rota(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(ini, 0)); else setTimeout(ini, 0);
  return { abrir, fechar, carregar, buscar, indice, _S: S, FONTES };
})();
/* botão "Ficha" para as páginas porem ao lado de um número de ordem (abre a ficha comum) */
function vacFichaBotao(ordem, tipo = 'ordem') { const v = String(ordem ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); return `<button type="button" class="vficha-bt" data-vac-${tipo}="${v}" title="Ficha: tudo sobre ${tipo === 'lp' ? 'o barril' : 'a ' + tipo} ${v} em todas as páginas">Ficha</button>`; }
/* kit v2.1 · E8 (08/11/2026): link para abrir uma ação em Iniciativas (Planner) a partir de outra página, sem gravar lá (regra 1).
   d = {titulo, descricao, origem:{tipo, ref, resumo, link, foto:{…}}, vinculos:[{tipo, cod}]}. Iniciativas abre o formulário
   preenchido, mostra as ações abertas parecidas e só cria depois da confirmação. Use referências, não listas grandes (URL curta). */
function vacNovaAcaoHref(d) {
  const h = 'nova=' + encodeURIComponent(JSON.stringify(d || {}));
  if (typeof PAGE !== 'undefined' && PAGE.id === 'inic') return '#' + h;
  let s = null; try { s = (typeof systems === 'function' ? systems() : []).find(x => x.id === 'inic'); } catch (e) { }
  return s && typeof sysHref === 'function' ? sysHref(s, h) : 'Iniciativas.html#' + h;
}
function vacNovaAcaoBotao(d, rot = '+ Ação no Planner', cls = 'b sm') { const e = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); return `<a class="${e(cls)}" href="${e(vacNovaAcaoHref(d))}" target="_blank" rel="noopener" title="Abre Iniciativas com a ação preenchida (você confere antes de criar)">${e(rot)}</a>`; }
/* endereço desta página com uma rota (para o "reconsultar" da ação) */
function vacAquiHref(hash) { return vacDemo.ativo ? vacDemo.paginas[PAGE.id] + (hash ? '#' + hash : '') : location.href.split('#')[0].split('/').pop() + (hash ? '#' + hash : ''); }

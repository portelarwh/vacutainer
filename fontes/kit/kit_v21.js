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


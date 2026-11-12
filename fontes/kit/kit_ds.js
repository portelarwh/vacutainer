
/* ----- vac-ds v1 · Design System BD · Sistemas da Linha Vacutainer (fontes/kit/kit_ds.js; 12/11/2026) -----
   Camada só de apresentação, igual em todas as páginas (vai junto do kit_v21.js; CSS em kit_ds.css; especificação em docs/design-system.md):
   - vacIcone(nome): ícones Lucide embutidos (a pasta da rede não tem internet);
   - vacShell: barra lateral recolhível (vac.sidebarCollapsed), cabeçalho de 58 px (onde estou, base, busca, usuário), ícone do módulo;
     os nós do cabeçalho antigo são MOVIDOS, com os mesmos IDs e eventos;
   - vacGrade: todo cartão com gráfico pode ficar em largura inteira, metade ou um terço e mudar de ordem (vac.grade.<página>, por computador);
   - impressão: cabeçalho e rodapé do relatório.
   Nenhum cálculo, dado, ID ou evento das páginas muda. */
const VAC_ICONES = {
  portal: '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
  oee: '<path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/>',
  perdas: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
  gel: '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  paradas: '<circle cx="12" cy="12" r="10"/><line x1="10" x2="10" y1="15" y2="9"/><line x1="14" x2="14" y1="15" y2="9"/>',
  equip: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  inic: '<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
  projetos: '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/><path d="M8 10v4"/><path d="M12 10v2"/><path d="M16 10v6"/>',
  linha: '<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/>',
  relatorios: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M8 18v-2"/><path d="M12 18v-4"/><path d="M16 18v-6"/>',
  importacao: '<path d="M12 13v8"/><path d="M4 14.9A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.24"/><path d="m8 17 4-4 4 4"/>',
  admin: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  ajuda: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  tv: '<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>',
  tema: '<circle cx="12" cy="12" r="10"/><path d="M12 18a6 6 0 0 0 0-12v12z"/>',
  usuario: '<path d="M18 20a6 6 0 0 0-12 0"/><circle cx="12" cy="10" r="4"/><circle cx="12" cy="12" r="10"/>',
  recolher: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m16 15-3-3 3-3"/>',
  expandir: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m14 9 3 3-3 3"/>',
  menu: '<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>',
  seta: '<path d="m9 18 6-6-6-6"/>',
  esquerda: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  direita: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  busca: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  atualizar: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  baixar: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
  salvar: '<path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  alerta: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  ok: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  erro: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
  fechar: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  pega: '<circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/>',
  restaurar: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  filtro: '<line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/>',
  calendario: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  pessoas: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  camadas: '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  editar: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
  mais: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  ampliar: '<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" x2="14" y1="3" y2="10"/><line x1="3" x2="10" y1="21" y2="14"/>'
};
function vacIcone(nome, cls) { const p = VAC_ICONES[nome] || VAC_ICONES.info; return '<svg class="vi' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + p + '</svg>'; }

const vacShell = (() => {
  const LS = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { } } };
  const H = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pid = () => (typeof PAGE !== 'undefined' && PAGE && PAGE.id) || '';
  const arq = h => String(h || '').split('#')[0].split('/').pop();
  const sisDe = a => { const h = a.getAttribute('href') || '', L = typeof systems === 'function' ? systems() : []; if (pid() === 'portal' && h.charAt(0) === '#') return 'portal'; const s = L.find(s => s.html && arq(s.html) === arq(h)); return s ? s.id : ''; };
  const ir = h => { if (typeof vacDemo !== 'undefined' && vacDemo.ativo && vacDemo.ir) vacDemo.ir(h); else location.href = h; };
  /* tema: claro é o padrão do Design System (quem nunca escolheu); a escolha da pessoa continua valendo */
  function tema() { if (LS.get('vac.theme') == null) { LS.set('vac.theme', 'light'); } const t = LS.get('vac.theme'); if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t; }
  function recolhida() { const v = LS.get('vac.sidebarCollapsed'); if (v === 'true') return true; if (v === 'false') return false; return innerWidth < 1200; }
  function aplicarRec() { const r = recolhida(); document.documentElement.classList.toggle('vds-rec', r); const b = document.getElementById('vdsRec'); if (b) { b.innerHTML = vacIcone(r ? 'expandir' : 'recolher') + '<span class="vds-tx">Recolher menu</span>'; b.title = r ? 'Expandir menu' : 'Recolher menu'; b.setAttribute('aria-expanded', String(!r)); } }
  function decorarNav() {
    document.querySelectorAll('#sysNav a').forEach(a => { if (a.querySelector(':scope > .vi')) return; const id = sisDe(a);
      const tx = [...a.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim(); [...a.childNodes].forEach(n => { if (n.nodeType === 3) n.remove(); });
      a.insertAdjacentHTML('afterbegin', vacIcone(VAC_ICONES[id] ? id : 'camadas') + '<span class="vds-tx">' + H(tx) + '</span>'); if (!a.title) a.title = tx; a.dataset.sis = id; });
    const o = document.querySelector('#sysOutros details.vmenu > summary'); if (o && !o.querySelector('.vi')) o.insertAdjacentHTML('afterbegin', vacIcone('camadas'));
  }
  function item(id, ic, tx, tit) { return '<button type="button" class="vds-it" id="' + id + '" title="' + H(tit || tx) + '">' + vacIcone(ic) + '<span class="vds-tx">' + H(tx) + '</span></button>'; }
  function aba() { const n = document.querySelector('nav.vtabs'); if (!n) return ''; const b = n.querySelector('#nav > button.on, .tabs > button.on, .tab.on, [aria-current="page"], button[aria-selected="true"]'); if (!b) return '';
    return [...b.childNodes].filter(x => x.nodeType === 3 || (x.nodeType === 1 && !/badge|cnt|vest/.test(x.className || ''))).map(x => x.textContent).join(' ').replace(/[▾▸]/g, '').replace(/\s+/g, ' ').trim(); }
  function migalha() { const el = document.getElementById('vdsMig'); if (!el) return; const t = document.getElementById('vacTitulo'), nm = (t && t.textContent.trim()) || '', ab = aba();
    const lim = x => x.replace(/^[^\wÀ-ÿ]+\s*/, '').toLowerCase(); const h = '<span>' + H(nm) + '</span>' + (ab && lim(ab) !== lim(nm) ? vacIcone('seta') + '<b>' + H(ab.replace(/^[^\wÀ-ÿ]+\s*/, '')) + '</b>' : ''); if (el._h !== h) { el._h = h; el.innerHTML = h; } }
  function montar() {
    const sb = document.querySelector('header.vsuite'), w = sb && sb.querySelector('.wrap'), pg = document.querySelector('.vpage'); if (!sb || !w || !pg || document.getElementById('vdsTop')) return;
    const $ = id => document.getElementById(id); const logo = $('brandLogo'), nome = $('vacNome'), nav = $('sysNav'), outros = $('sysOutros'), sp = w.querySelector('.sp'), busca = $('vacBusca'), usr = $('stUser'), adm = $('btnAdmin'), thm = $('btnTheme'), stb = $('stBase');
    sb.setAttribute('aria-label', 'Navegação dos sistemas');
    /* marca */
    const marca = document.createElement('div'); marca.className = 'vds-marca'; w.insertBefore(marca, w.firstChild); if (logo) marca.appendChild(logo); marca.insertAdjacentHTML('beforeend', '<span class="vds-sig" aria-hidden="true">' + vacIcone('linha', 'lg') + '</span>');
    if (nome) { nome.innerHTML = 'Sistemas<small>Linha Vacutainer</small>'; marca.appendChild(nome); }
    /* área administrativa (telas do Portal) */
    const blocoAdm = document.createElement('div'); blocoAdm.className = 'vapps vds-adm';
    blocoAdm.innerHTML = '<div class="vds-div" role="separator"></div>' + item('vdsRel', 'relatorios', 'Relatórios', 'Relatórios (no Portal)') + item('vdsImp', 'importacao', 'Importação', 'Importação: tudo o que se importa, por página (no Portal)');
    if (outros) outros.insertAdjacentElement('afterend', blocoAdm); else if (nav) nav.insertAdjacentElement('afterend', blocoAdm);
    if (adm) { adm.innerHTML = vacIcone('admin') + '<span class="vds-tx">Administração</span>'; adm.classList.add('vds-it'); adm.classList.remove('vic'); blocoAdm.appendChild(adm); }
    /* rodapé da barra */
    const pe = document.createElement('div'); pe.className = 'vapps vds-pe'; pe.innerHTML = '<div class="vds-div" role="separator"></div>' + item('vdsAjuda', 'ajuda', 'Ajuda', 'Guia desta aba (F1)') + (document.getElementById('btnTV') ? item('vdsTV', 'tv', 'Modo TV', 'Modo TV') : '');
    w.appendChild(pe); if (sp) w.insertBefore(sp, pe);
    if (thm) { thm.innerHTML = vacIcone('tema') + '<span class="vds-tx">Tema</span>'; thm.classList.add('vds-it'); thm.classList.remove('vic'); pe.appendChild(thm); }
    pe.insertAdjacentHTML('beforeend', '<button type="button" class="vds-it" id="vdsRec" aria-controls="sysNav"></button>');
    /* cabeçalho superior */
    const top = document.createElement('div'); top.className = 'vds-top'; top.id = 'vdsTop';
    top.innerHTML = '<button type="button" class="vds-bt vds-menu" id="vdsMenu" aria-label="Abrir menu" title="Menu">' + vacIcone('menu', 'lg') + '</button><nav class="vds-mig" id="vdsMig" aria-label="Onde estou"></nav><span class="sp"></span>';
    pg.insertAdjacentElement('beforebegin', top);
    if (stb) top.appendChild(stb); if (busca) { busca.innerHTML = vacIcone('busca') + '<span>Buscar…</span><kbd>Ctrl K</kbd>'; top.appendChild(busca); } if (usr) top.appendChild(usr);
    const fundo = document.createElement('button'); fundo.type = 'button'; fundo.className = 'vds-fundo'; fundo.id = 'vdsFundo'; fundo.setAttribute('aria-label', 'Fechar menu'); document.body.appendChild(fundo);
    /* ícone do módulo no cabeçalho da página */
    const tit = $('vacTitulo'); if (tit && !pg.querySelector('.vds-mod')) tit.insertAdjacentHTML('beforebegin', '<span class="vds-mod" aria-hidden="true">' + vacIcone(VAC_ICONES[pid()] ? pid() : 'camadas', 'xl') + '</span>');
    /* ícones nos botões conhecidos do cabeçalho (o texto continua) */
    [['btnSync', 'atualizar'], ['btnBackup', 'salvar'], ['btnTV', 'tv']].forEach(([id, ic]) => { const b = $(id); if (!b || b.querySelector('.vi')) return; const n = b.firstChild; if (n && n.nodeType === 3) n.textContent = n.textContent.replace(/^[^\wÀ-ÿ]+\s*/, ''); b.insertAdjacentHTML('afterbegin', vacIcone(ic, 'sm')); });
    /* eventos */
    const fechar = () => document.documentElement.classList.remove('vds-aberta');
    $('vdsMenu').onclick = () => document.documentElement.classList.toggle('vds-aberta'); fundo.onclick = fechar;
    document.addEventListener('keydown', e => { if (e.key === 'Escape') fechar(); });
    sb.addEventListener('click', e => { if (e.target.closest('a,button') && innerWidth < 900 && !e.target.closest('#vdsRec')) fechar(); });
    $('vdsRec').onclick = () => { if (innerWidth < 900) { fechar(); return; } LS.set('vac.sidebarCollapsed', String(!recolhida())); aplicarRec(); setTimeout(() => window.dispatchEvent(new Event('resize')), 200); };
    $('vdsRel').onclick = () => ir(typeof vacPortalHref === 'function' ? vacPortalHref('relatorios') : 'Portal.html#relatorios');
    $('vdsImp').onclick = () => ir(typeof vacImportacaoHref === 'function' ? vacImportacaoHref('') : 'Portal.html#importacao');
    $('vdsAjuda').onclick = () => { const g = $('vacGuiaBtn'); if (g) g.click(); else if (typeof vacGuia !== 'undefined' && vacGuia && vacGuia.abrir) vacGuia.abrir(); };
    const tvb = $('vdsTV'); if (tvb) tvb.onclick = () => { const b = $('btnTV'); if (b) b.click(); };
    aplicarRec(); decorarNav(); migalha();
    if (nav) new MutationObserver(() => { decorarNav(); migalha(); }).observe(nav, { childList: true });
    if (outros) new MutationObserver(decorarNav).observe(outros, { childList: true });
    const vt = document.querySelector('nav.vtabs'); if (vt) new MutationObserver(migalha).observe(vt, { subtree: true, attributes: true, attributeFilter: ['class', 'aria-current', 'aria-selected'], childList: true });
    if (tit) new MutationObserver(migalha).observe(tit, { childList: true, characterData: true, subtree: true });
    /* o botão do guia (criado pelo kit) fica fora da vista: a Ajuda da barra lateral aciona o mesmo botão */
    const esconderGuia = () => { const g = $('vacGuiaBtn'); if (g) { g.style.display = 'none'; g.setAttribute('tabindex', '-1'); } }; esconderGuia(); new MutationObserver(esconderGuia).observe(w, { childList: true, subtree: true });
    window.addEventListener('resize', () => { if (LS.get('vac.sidebarCollapsed') == null) aplicarRec(); });
    window.addEventListener('storage', e => { if (e.key === 'vac.sidebarCollapsed') aplicarRec(); });
  }
  /* impressão: cabeçalho e rodapé do relatório (some depois de imprimir) */
  function impressao() {
    const por = () => { document.querySelectorAll('.vds-imp').forEach(x => x.remove()); if (window.VAC_IMP_PROPRIA) return; const m = document.querySelector('main') || document.body, t = document.getElementById('vacTitulo'), sb = document.getElementById('stBase');
      const ag = new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }), ab = aba(), base = sb ? sb.textContent.replace(/\s+/g, ' ').trim() : '';
      const c = document.createElement('div'); c.className = 'vds-imp cab'; c.innerHTML = '<b>BD · Sistemas da Linha Vacutainer</b> — ' + H((t && t.textContent.trim()) || '') + (ab ? ' · ' + H(ab) : '') + '<br>' + (base ? 'Base: ' + H(base) + ' · ' : '') + 'Gerado em: ' + H(ag);
      const r = document.createElement('div'); r.className = 'vds-imp rod'; r.textContent = 'Documento gerado automaticamente pelo Sistema da Linha Vacutainer · Uso interno · Valores conforme base disponível na data de geração';
      m.insertAdjacentElement('afterbegin', c); m.insertAdjacentElement('beforeend', r); };
    window.addEventListener('beforeprint', por); window.addEventListener('afterprint', () => document.querySelectorAll('.vds-imp').forEach(x => x.remove()));
  }
  tema();
  const ini = () => { try { montar(); impressao(); } catch (e) { console.warn('vacShell', e); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ini); else ini();
  return { montar, migalha, aplicarRec };
})();

/* ----- vacOrdemLote · regra da linha (12/11/2026): cada ordem tem UM lote e cada lote tem UMA ordem. Recebe [{ordem, lote, mes?}] e devolve os
   conflitos, sem bloquear nada: {ordens:[{ordem, lotes[], mes}], lotes:[{lote, ordens[], mes}]}. Ordem e lote são texto (regra 4); vazio não conta. ----- */
function vacOrdemLote(lista) {
  const O = new Map(), L = new Map(), t = v => String(v == null ? '' : v).trim();
  for (const x of lista || []) { const o = t(x && x.ordem), l = t(x && x.lote); if (!o || !l) continue; const m = (x && x.mes) || '';
    if (!O.has(o)) O.set(o, { ordem: o, lotes: [], mes: m }); const a = O.get(o); if (!a.lotes.includes(l)) a.lotes.push(l); if (m > a.mes) a.mes = m;
    if (!L.has(l)) L.set(l, { lote: l, ordens: [], mes: m }); const b = L.get(l); if (!b.ordens.includes(o)) b.ordens.push(o); if (m > b.mes) b.mes = m; }
  return { ordens: [...O.values()].filter(x => x.lotes.length > 1), lotes: [...L.values()].filter(x => x.ordens.length > 1) };
}

/* ----- vacGrade · cartões de gráfico reorganizáveis: largura (inteira, metade, um terço) e ordem; preferências por página e por computador ----- */
const vacGrade = (() => {
  const pid = () => (typeof PAGE !== 'undefined' && PAGE && PAGE.id) || 'pagina';
  const ler = () => { try { const x = JSON.parse(localStorage.getItem('vac.grade.' + pid()) || '{}'); return x && typeof x === 'object' ? x : {}; } catch (e) { return {}; } };
  const gravar = p => { try { localStorage.setItem('vac.grade.' + pid(), JSON.stringify(p)); } catch (e) { } };
  const CARTAO = '.card,.vk-card,.chart-card,.gcard,.panel,.bloco,.box,.chart,.grafico,.vg-card';
  const FORA = 'header.vsuite,.vds-top,.vpage,nav,dialog,.modal,.overlay,table,[data-vg-nao],[draggable="true"],.vg-barra,#vacGuia,.tv,.kpi,.vk-dc,button,a';
  const ehGrafico = g => { if (g.closest(FORA)) return false; const r = g.getBoundingClientRect(); return r.width >= 220 && r.height >= 110; };
  const slug = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);
  const chaveItem = (el, i) => el.dataset.vgK || el.id || (() => { const h = el.querySelector('h2,h3,h4,.t,.tit,header'); const s = h ? slug(h.textContent) : ''; return s || 'i' + i; })();
  const chaveGrupo = (p) => { if (p.id) return p.id; let a = p.parentElement, n = 0; while (a && !a.id && n < 6) { a = a.parentElement; n++; } const base = a && a.id ? a.id : 'raiz'; const irm = a ? [...a.querySelectorAll('.vg-grade,[data-vg-g]')] : []; if (!p.dataset.vgG) p.dataset.vgG = base + ':' + (irm.filter(x => x !== p).length); return p.dataset.vgG; };
  function cartoes() { const S = new Set(); document.querySelectorAll('main svg, main canvas').forEach(g => { if (!ehGrafico(g)) return; const c = g.closest(CARTAO); if (!c || c.closest(FORA) || c.tagName === 'MAIN' || !c.parentElement || c.parentElement.tagName === 'BODY') return; S.add(c); }); /* só o cartão mais interno */ return [...S].filter(c => ![...S].some(o => o !== c && c.contains(o))); }
  function larguraNatural(el, p) { const pw = p.clientWidth || 1, r = el.getBoundingClientRect().width / pw; return r >= .8 ? 6 : r >= .42 ? 3 : r >= .27 ? 2 : 0; }
  function aplicar() {
    if (aplicar._em) return; aplicar._em = 1;
    try {
      const prefs = ler(), grupos = new Map(); cartoes().forEach(c => { const p = c.parentElement; if (!grupos.has(p)) grupos.set(p, []); grupos.get(p).push(c); });
      grupos.forEach((cs, p) => { if (p.dataset.vgNao) return;
        const filhos = [...p.children].filter(x => !x.classList.contains('vg-barra') && x.tagName !== 'SCRIPT' && x.tagName !== 'STYLE' && getComputedStyle(x).display !== 'none' && getComputedStyle(x).position !== 'absolute' && getComputedStyle(x).position !== 'fixed');
        if (!p.classList.contains('vg-grade')) { /* 1ª vez: guarda a largura que cada filho tinha no layout da página */
          const nat = filhos.map(x => larguraNatural(x, p)); if (nat.some(n => !n)) { p.dataset.vgNao = '1'; return; } p._vgNat = {}; filhos.forEach((x, i) => { x.dataset.vgN = nat[i]; p._vgNat[chaveItem(x, i)] = nat[i]; }); p.classList.add('vg-grade'); }
        const gk = chaveGrupo(p), pg = prefs[gk] || {}, larg = pg.larg || {}, ordem = pg.ordem || [];
        const chaves = filhos.map((x, i) => chaveItem(x, i));
        filhos.forEach((x, i) => { const k = chaves[i]; if (!x.dataset.vgN) x.dataset.vgN = String((p._vgNat && p._vgNat[k]) || 6); const l = String(larg[k] || x.dataset.vgN); if (x.dataset.vgL !== l) x.dataset.vgL = l; const o = ordem.indexOf(k), ord = String(o >= 0 ? o : ordem.length + i); if (x.style.order !== ord) x.style.order = ord; x.dataset.vgKey = k; });
        cs.forEach(c => { c.classList.add('vg-it'); if (c.querySelector(':scope > .vg-barra')) { marcar(c); return; }
          const b = document.createElement('div'); b.className = 'vg-barra'; b.setAttribute('role', 'toolbar'); b.setAttribute('aria-label', 'Disposição do gráfico');
          b.innerHTML = '<button type="button" class="vg-pega" draggable="true" data-vg="pega" title="Arrastar para mudar de lugar" aria-label="Arrastar para mudar de lugar">' + vacIcone('pega', 'sm') + '</button><button type="button" data-vg="antes" title="Mover para antes" aria-label="Mover para antes">' + vacIcone('esquerda', 'sm') + '</button><button type="button" data-vg="depois" title="Mover para depois" aria-label="Mover para depois">' + vacIcone('direita', 'sm') + '</button><i></i><button type="button" data-vg="l6" title="Largura inteira" aria-label="Largura inteira"></button><button type="button" data-vg="l3" title="Metade da largura (2 lado a lado)" aria-label="Metade da largura"></button><button type="button" data-vg="l2" title="Um terço da largura (3 lado a lado)" aria-label="Um terço da largura"></button><i></i><button type="button" data-vg="rest" title="Voltar à disposição original deste bloco" aria-label="Voltar à disposição original">' + vacIcone('restaurar', 'sm') + '</button>';
          c.appendChild(b); marcar(c); });
      });
    } finally { aplicar._em = 0; }
  }
  function marcar(c) { const l = c.dataset.vgL || '6'; c.querySelectorAll(':scope > .vg-barra [data-vg^="l"]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.vg === 'l' + l))); }
  function itens(p) { return [...p.children].filter(x => x.dataset.vgKey).sort((a, b) => (+a.style.order || 0) - (+b.style.order || 0)); }
  function salvarOrdem(p, lista) { const prefs = ler(), gk = chaveGrupo(p); prefs[gk] = prefs[gk] || {}; prefs[gk].ordem = lista.map(x => x.dataset.vgKey); gravar(prefs); lista.forEach((x, i) => { x.style.order = String(i); }); }
  function redesenhar() { setTimeout(() => window.dispatchEvent(new Event('resize')), 60); }
  document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('.vg-barra [data-vg]'); if (!b) return; const c = b.closest('.vg-it'), p = c && c.parentElement; if (!p) return; e.preventDefault(); e.stopPropagation();
    const a = b.dataset.vg, prefs = ler(), gk = chaveGrupo(p); prefs[gk] = prefs[gk] || {};
    if (a === 'l6' || a === 'l3' || a === 'l2') { prefs[gk].larg = prefs[gk].larg || {}; prefs[gk].larg[c.dataset.vgKey] = +a.slice(1); gravar(prefs); c.dataset.vgL = a.slice(1); marcar(c); redesenhar(); }
    else if (a === 'antes' || a === 'depois') { const L = itens(p), i = L.indexOf(c), j = a === 'antes' ? i - 1 : i + 1; if (j < 0 || j >= L.length) return; L.splice(i, 1); L.splice(j, 0, c); salvarOrdem(p, L); b.focus(); }
    else if (a === 'rest') { delete prefs[gk]; gravar(prefs); [...p.children].forEach((x, i) => { if (x.dataset.vgN) x.dataset.vgL = x.dataset.vgN; x.style.order = ''; }); aplicar(); redesenhar(); } }, true);
  let arr = null;
  document.addEventListener('dragstart', e => { const g = e.target.closest && e.target.closest('.vg-pega'); if (!g) return; arr = g.closest('.vg-it'); if (!arr) return; arr.classList.add('vg-arrastando'); try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', 'vg'); e.dataTransfer.setDragImage(arr, 20, 20); } catch (x) { } });
  document.addEventListener('dragover', e => { if (!arr) return; const t = e.target.closest && e.target.closest('.vg-grade > *'); document.querySelectorAll('.vg-alvo').forEach(x => x.classList.remove('vg-alvo')); if (t && t !== arr && t.parentElement === arr.parentElement && t.dataset.vgKey) { e.preventDefault(); t.classList.add('vg-alvo'); } });
  document.addEventListener('drop', e => { if (!arr) return; const t = e.target.closest && e.target.closest('.vg-grade > *'); if (t && t !== arr && t.parentElement === arr.parentElement && t.dataset.vgKey) { e.preventDefault(); const p = arr.parentElement, L = itens(p), i = L.indexOf(arr); L.splice(i, 1); const j = L.indexOf(t), r = t.getBoundingClientRect(), depois = e.clientX > r.left + r.width / 2; L.splice(j + (depois ? 1 : 0), 0, arr); salvarOrdem(p, L); } });
  document.addEventListener('dragend', () => { document.querySelectorAll('.vg-alvo,.vg-arrastando').forEach(x => x.classList.remove('vg-alvo', 'vg-arrastando')); arr = null; });
  let t = 0; const agendar = () => { clearTimeout(t); t = setTimeout(() => { try { aplicar(); } catch (e) { console.warn('vacGrade', e); } }, 180); };
  const ini = () => { const m = document.querySelector('main'); if (!m || window.VAC_GRADE_OFF) return; new MutationObserver(agendar).observe(m, { childList: true, subtree: true }); document.addEventListener('click', agendar); window.addEventListener('hashchange', agendar); agendar(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(ini, 300)); else setTimeout(ini, 300);
  return { aplicar, agendar };
})();

# Ajustes do formulário de parada; aplicados sobre a base imutável 2.0.
def aplicar(R):
    R(r"""id="eClr">Limpar e destravar</button>""", r"""id="eClr">Limpar tempos</button>""")
    R(r"""clear: '#eClr', onMode:""", r"""clear: '#eClr', requiresTimes: () => { const c = d.downtimeCodes.find(x => x.id === el.querySelector('#eCode').value); return c && (c.requiresTimes || !c.allowsManualDuration); }, onMode:""")
    R(r"""        const needT = c && (c.requiresTimes || !c.allowsManualDuration);
        el.querySelector('#eM').closest('label').hidden = !!needT;""", r"""        getPair.sync();""")
    R(r"""<span>ou Início</span><input type="time" id="eS" """, r"""<span>Início</span><input type="time" id="eS" """)
    R(r"""function lockPair(root, sel) {
  const d = root.querySelector(sel.dur), s = root.querySelector(sel.start), e = root.querySelector(sel.end);
  const hint = sel.hint ? root.querySelector(sel.hint) : null;
  const sync = () => {
    const hasT = !!(s.value || e.value), hasD = !!String(d.value).trim();
    const mode = hasT ? 't' : hasD ? 'm' : '';
    d.disabled = mode === 't'; s.disabled = e.disabled = mode === 'm';
    [d, s, e].forEach(x => x.classList.toggle('locked', x.disabled));
    if (mode === 't') { const a = timeIn(s.value), b0 = timeIn(e.value); let b = b0; if (a != null && b != null && b <= a) b += 1440; d.value = a != null && b != null ? b - a : ''; }
    if (hint) hint.textContent = mode === 't' ? 'Pelo horário: a duração é calculada.' : mode === 'm' ? 'Só o tempo: início e fim ficam bloqueados.' : 'Preencha a duração OU o início e o fim.';
    if (sel.onMode) sel.onMode(mode);
  };
  d.addEventListener('input', () => { if (s.disabled || !d.disabled) sync(); });
  [s, e].forEach(x => x.addEventListener('input', sync));
  [d, s, e].forEach(x => x.addEventListener('change', sync));
  // botão para limpar e destravar
  if (sel.clear) { const c = root.querySelector(sel.clear); if (c) c.onclick = () => { d.value = ''; s.value = ''; e.value = ''; d.disabled = s.disabled = e.disabled = false; sync(); d.focus(); }; }
  sync();
  return () => ({ mode: s.value || e.value ? 't' : String(d.value).trim() ? 'm' : '', dur: +String(d.value).replace(',', '.'), start: s.value, end: e.value });
}
""", r"""function lockPair(root, sel) {
  const d = root.querySelector(sel.dur), s = root.querySelector(sel.start), e = root.querySelector(sel.end);
  const hint = sel.hint ? root.querySelector(sel.hint) : null;
  let lastMode = '';
  const sync = () => {
    const required = !!(sel.requiresTimes && sel.requiresTimes());
    if (sel.requiresTimes && !(s.value || e.value) && (required || lastMode === 't')) d.value = '';
    const hasT = !!(s.value || e.value), hasD = !!String(d.value).trim();
    const mode = hasT ? 't' : hasD ? 'm' : '';
    d.disabled = !sel.requiresTimes && mode === 't';
    d.readOnly = !!sel.requiresTimes && (required || mode === 't');
    s.disabled = e.disabled = mode === 'm';
    [d, s, e].forEach(x => x.classList.toggle('locked', x.disabled));
    if (mode === 't') { const a = timeIn(s.value), b0 = timeIn(e.value); let b = b0; if (a != null && b != null && b <= a) b += 1440; d.value = a != null && b != null ? b - a : ''; }
    if (sel.requiresTimes) d.closest('label').querySelector('span').textContent = required || mode === 't' ? 'Duração calculada (min)' : 'Duração (min)';
    if (hint) hint.textContent = required ? 'Este tipo de parada exige início e fim. A duração é calculada pelos horários.' : mode === 't' ? 'Pelo horário: a duração é calculada.' : mode === 'm' ? 'Só o tempo: início e fim ficam bloqueados.' : 'Preencha a duração OU o início e o fim.';
    lastMode = mode;
    if (sel.onMode) sel.onMode(mode);
  };
  d.addEventListener('input', () => { if (s.disabled || !d.disabled) sync(); });
  [s, e].forEach(x => x.addEventListener('input', sync));
  [d, s, e].forEach(x => x.addEventListener('change', sync));
  // botão para limpar e destravar
  if (sel.clear) { const c = root.querySelector(sel.clear); if (c) c.onclick = () => { d.value = ''; s.value = ''; e.value = ''; d.disabled = s.disabled = e.disabled = false; sync(); (sel.requiresTimes && sel.requiresTimes() ? s : d).focus(); }; }
  sync();
  const read = () => ({ mode: s.value || e.value ? 't' : String(d.value).trim() ? 'm' : '', dur: +String(d.value).replace(',', '.'), start: s.value, end: e.value });
  read.sync = sync;
  return read;
}
""")

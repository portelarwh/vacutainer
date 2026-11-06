import sys
import os
AQUI=os.path.dirname(os.path.abspath(__file__)); RAIZ=os.path.normpath(os.path.join(AQUI,'..','..'))
os.chdir(AQUI)
src=os.path.join(AQUI,'OEE-base-2.0.html'); out=os.path.join(RAIZ,'paginas','OEE-Vacutainer.html')
s=open(src,encoding='utf-8').read()
def R(a,b,cnt=1):
    global s
    c=s.count(a)
    if c!=cnt: raise SystemExit(f'ERRO ({c}x): {a[:90]!r}')
    s=s.replace(a,b)
R("const APP_VERSION = '2.0.1';","const APP_VERSION = '2.4';")
R("  $('#nav').innerHTML = visibleRoutes().map(([k, l]) => { const g = ROUTE_GROUP[k] || ''; const sep","  if (typeof renderNavGrupos === 'function') { renderNavGrupos(); renderBanner(); return; }\n  $('#nav').innerHTML = visibleRoutes().map(([k, l]) => { const g = ROUTE_GROUP[k] || ''; const sep")
R("    <span title=\"${esc(S.mode === 'pasta' ? 'Pasta ' + (S.backend && S.backend.name) : S.mode === 'arquivo' ? 'Arquivo ' + (S.fileName || '') : 'Somente neste navegador')}\">Última gravação <b>${d ? U.brDT(d.lastModifiedAt) : '—'}</b>${d ? ' por ' + esc(d.lastModifiedBy || '—') : ''}</span>`;","    <span class=\"pill none\" title=\"${esc((S.mode === 'pasta' ? 'Pasta ' + (S.backend && S.backend.name) : S.mode === 'arquivo' ? 'Arquivo ' + (S.fileName || '') : 'Somente neste navegador') + (d ? ' · última gravação ' + U.brDT(d.lastModifiedAt) + ' por ' + (d.lastModifiedBy || '—') : ''))}\">${d ? U.brDT(d.lastModifiedAt).slice(0, 5) + ' ' + U.brDT(d.lastModifiedAt).slice(-5) : '—'}</span>`;")
R("const PAGE = { id: 'oee', titulo: 'OEE · Linha Vacutainer', tituloCurto: 'OEE', subtitulo: 'Produção e OEE',","const PAGE = { id: 'oee', titulo: 'Produção · Linha Vacutainer', tituloCurto: 'Produção', subtitulo: 'Plano, ordens, apontamento e OEE',")
R("    async readSibling(name) { try { const fh = await dir.getFileHandle(name); return await (await fh.getFile()).text(); } catch (e) { return null; } },",
  "    async readSibling(name) { try { const fh = await dir.getFileHandle(name); return await (await fh.getFile()).text(); } catch (e) { return null; } },\n    // 2.1 · outra base da mesma pasta (ordens-base.json) e backup em 00. Backups/<sub>\n    async writeSibling(name, text) { const fh = await dir.getFileHandle(name, { create: true }); const w = await fh.createWritable(); await w.write(text); await w.close(); },\n    async backupSub(sub, name, text) { const r = await this.backupRoot(); const d = await r.getDirectoryHandle(sub, { create: true }); const fh = await d.getFileHandle(name, { create: true }); const w = await fh.createWritable(); await w.write(text); await w.close(); return name; },")
svc=open('ordens_servico.js',encoding='utf-8').read().replace("if (typeof module !== 'undefined') module.exports = OrdensSAP;\n","")
tela=open('ordens_tela.js',encoding='utf-8').read()
css="""<style>
/* Produção 2.1 · Ordens (MB51 + COOIS) */
.ord-bar{display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end}.ord-bar .f{min-width:0}
.ord-st{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-left:auto}
.ord-sub{margin-top:12px;flex-wrap:wrap}
.ord-acts{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;align-items:center}
.ord-k{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:8px;margin:10px 0}
.ord-kc{border:1px solid var(--line);border-left:4px solid var(--accent);border-radius:8px;padding:8px 10px;background:var(--surface);display:flex;flex-direction:column;gap:2px}
.ord-kc span{font-size:12px;color:var(--muted)}.ord-kc b{font-size:20px;font-family:var(--f-display,inherit)}
.ord-kc.ok{border-left-color:var(--ok)}.ord-kc.warn{border-left-color:var(--warn)}.ord-kc.crit{border-left-color:var(--crit)}
.ord-prev{outline:2px dashed color-mix(in srgb,var(--info) 50%,transparent);outline-offset:-2px}
.ord-fh{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;margin-bottom:10px}.ord-fh>div{display:flex;flex-direction:column;gap:3px}
.note{border:1px solid var(--line);border-left:4px solid var(--info);border-radius:8px;padding:8px 12px;margin:8px 0;background:color-mix(in srgb,var(--info) 6%,var(--surface))}
.note.w{border-left-color:var(--warn);background:color-mix(in srgb,var(--warn) 8%,var(--surface))}.note.e{border-left-color:var(--crit);background:color-mix(in srgb,var(--crit) 8%,var(--surface))}
.warn-t{color:var(--warn)}
.nitem .cnt{font-family:var(--f-body);font-size:11px;background:var(--pend);color:#fff;border-radius:99px;padding:0 6px;margin-left:8px}
.ord-per{margin-top:8px}.ord-per-q{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:6px}
.ord-per-q .btn.on{background:var(--accent,#1f6feb);color:#fff;border-color:transparent}
.ord-mat{text-decoration:none;color:var(--accent,#1f6feb)}.ord-mat:hover{text-decoration:underline}
.ord-st-sap{display:inline-flex;flex-wrap:wrap;gap:3px;cursor:help}
.sst{font:600 11px/1 var(--f-mono,monospace);padding:3px 5px;border-radius:5px;border:1px solid transparent;background:#e8eef9;color:#1d4ed8}
.sst.exec{background:#e0f2f1;color:#0f766e}.sst.ok{background:#e6f4ea;color:#15803d}.sst.fim{background:#d7eedd;color:#14532d}
.sst.calc{background:#efe7fb;color:#6d28d9}.sst.lote{background:#eceff3;color:#475569}.sst.desc{background:#fff6d6;color:#92400e;border-color:#f2d27a}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .sst{filter:brightness(.8) saturate(1.2)}}
:root[data-theme="dark"] .sst{filter:brightness(.8) saturate(1.2)}
.ord-sap{display:flex;flex-wrap:wrap;gap:4px;align-items:center;cursor:pointer;min-width:160px}
.ngrp>.tab .nl{display:flex;gap:6px;align-items:center}
#main tr.click{cursor:pointer}
/* 2.2 · cabeçalho em grupos com menu (sem rolagem) */
#nav.ngrupos{overflow:visible;flex-wrap:nowrap;gap:0}
.ngrp{position:relative;display:flex}
.ngrp>.tab{display:flex;flex-direction:column;align-items:flex-start;justify-content:center;line-height:1.05}
.ngrp.tem>.tab::after{content:'▾';font-size:10px;opacity:.6;position:absolute;right:4px;top:50%;transform:translateY(-50%)}
.ngrp.tem>.tab{padding-right:18px}
.ngrp .natual{display:block;font-size:10.5px;letter-spacing:.04em;text-transform:none;font-weight:500;color:var(--accent);margin-top:1px}
.nmenu{display:none;position:absolute;top:100%;left:0;z-index:80;min-width:220px;background:var(--surface);border:1px solid var(--line);border-radius:8px;box-shadow:0 10px 28px rgba(0,0,0,.18);padding:6px}
.ngrp.tem:hover>.nmenu,.ngrp.tem:focus-within>.nmenu{display:flex;flex-direction:column}
.nitem{all:unset;display:flex;justify-content:space-between;gap:10px;align-items:center;padding:8px 10px;border-radius:6px;cursor:pointer;font-size:14px;color:var(--ink)}
.nitem:hover,.nitem:focus-visible{background:var(--surface-2,rgba(0,0,0,.05))}.nitem.on{color:var(--accent);font-weight:600}
.ngrp.on>.tab{color:var(--accent)}
@media(max-width:760px){#nav.ngrupos{overflow-x:auto}.ngrp .natual{display:none}}
</style>
"""
kit21=open(os.path.join(RAIZ,'fontes','kit','kit_v21.js'),encoding='utf-8').read()
sync=open(os.path.join(AQUI,'cad_sync.js'),encoding='utf-8').read()
R("S.cadastro = c && c.schema === 'vac-cadastros' ? { rev: c.rev, revAt: c.revAt, revBy: c.revBy } : null; }","S.cadastro = c && c.schema === 'vac-cadastros' ? { rev: c.rev, revAt: c.revAt, revBy: c.revBy } : null; S.cadDoc = S.cadastro ? c : null; if (S.cadDoc && typeof CadSync !== 'undefined') setTimeout(() => CadSync.talvez(), 0); }")
R("// cadastro base do Portal na mesma pasta: só a revisão, para a pílula do cabeçalho (o OEE ainda usa os próprios cadastros)","// cadastro base do Portal na mesma pasta: guarda o documento e aplica na base quando a revisão muda (CadSync, Produção 2.4)")
R("</script>\n</body>","</script>\n"+css+"<script>\n'use strict';\n"+svc+"\n"+tela+"\n"+sync+"\n</script>\n<script>\n"+kit21+"\n</script>\n</body>")
R('<th class="n">Diferença</th><th>Situação</th></tr></thead>','<th class="n">Diferença</th><th>Situação</th><th title="O que o MB51/COOIS (oficial) diz desta ordem: data principal, saldo, lote, tipo, KKBC no Waste">SAP</th></tr></thead>')
R("data-accrow=\"${o.id}\">✓ Aceitar apurado</button>` : ''}</td></tr>`; }).join('')}</tbody>","data-accrow=\"${o.id}\">✓ Aceitar apurado</button>` : ''}</td><td>${typeof ordSapCel === 'function' ? ordSapCel(o) : ''}</td></tr>`; }).join('')}</tbody>")
open(out,'w',encoding='utf-8').write(s);print('ok')

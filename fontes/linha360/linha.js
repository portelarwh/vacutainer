/* =====================================================================================
   Linha 360° · planta interativa da linha Vacutainer (1.0.0, 12/11/2026). Fontes em fontes/linha360/ (build.py monta a página).
   Base própria: linha360-base.json em 00. Bases (só esta página grava; regra 1): pontos da planta e seus equipamentos, áreas,
   postos de trabalho (quem está em cada posto, por turno) e checklists. Tudo o mais é LIDO do exports das outras páginas:
   paradas (Paradas), ordem e lote em produção e OEE (Produção), ordens de serviço (Equipamentos), ações (Iniciativas).
   Ação nova nasce em Iniciativas (vacNovaAcaoHref) e OS nova em Equipamentos (#novaOS=): aqui nada disso é copiado.
   Desenho: página 2 do LINHA.pdf; pontos 1–12 e 14–18 e fluxos (comum, EDTA, SST) da página 1. O 13 não existe no desenho.
   ===================================================================================== */
const LW=2000,LH=1125;
const FLUXOS={comum:['Comum','#C23B3A'],edta:['EDTA','#D9730B'],sst:['SST','#1466C2']};
const PONTOS_PADRAO=[
 {id:'1',nome:'Tray Loader',x:56.1,y:26.5,fluxo:'comum',chaves:['tray loader']},
 {id:'2',nome:'Aplicação de gel',x:80.9,y:26.5,fluxo:'sst',chaves:['gel dispensor','gel dispenser','aplicacao de gel']},
 {id:'3',nome:'Aplicação de EDTA (coater)',x:88.5,y:37.5,fluxo:'edta',chaves:['edta']},
 {id:'4',nome:'Aplicação de sílica (coater)',x:88.8,y:55.2,fluxo:'sst',chaves:['silica']},
 {id:'5',nome:'Espera de 3 horas',x:64.0,y:80.2,fluxo:'sst',chaves:['espera','delay']},
 {id:'6',nome:'Cap + Stopper',x:56.2,y:52.7,fluxo:'comum',chaves:['metro','cap + stopper','stopper']},
 {id:'7',nome:'Cap Placer (tubo)',x:56.2,y:39.0,fluxo:'comum',chaves:['cap placer']},
 {id:'8',nome:'Vácuo',x:47.0,y:39.0,fluxo:'comum',chaves:['evacuator','vacuo']},
 {id:'9',nome:'Impressora de etiquetas',x:33.6,y:36.6,fluxo:'comum',chaves:['etiquetagem','label printer','impressora']},
 {id:'10',nome:'Rotulagem de tubos A',x:28.9,y:25.2,fluxo:'comum',chaves:['tullip a','tulip a']},
 {id:'11',nome:'Rotulagem de tubos B',x:28.9,y:47.3,fluxo:'comum',chaves:['tullip b','tulip b']},
 {id:'12',nome:'Shrink wrap',x:9.7,y:25.9,fluxo:'comum',chaves:['kallfass','shrink']},
 {id:'14',nome:'Rotulagem do tube pack',x:9.8,y:51.6,fluxo:'comum',chaves:['tube pack']},
 {id:'15',nome:'Embalagem em caixas',x:9.8,y:68.1,fluxo:'comum',chaves:['packout','cardbox packaging','encaixotadora']},
 {id:'16',nome:'Rotulagem de caixas',x:9.7,y:83.5,fluxo:'comum',chaves:['cardbox labeling','rotuladora de caixas']},
 {id:'17',nome:'Aplicação de silicone no stopper',x:40.0,y:77.9,fluxo:'comum',chaves:['silicone']},
 {id:'18',nome:'Saída da linha',x:4.6,y:19.2,fluxo:'comum',chaves:['saida da linha']}];
const AREAS_PADRAO=[
 {id:'preparo',nome:'Preparação e aplicação',pts:['1','2','3','4','5'],pol:'49,12 99,12 99,60 73,60 73,99 49,99 49,64 73,64 73,30 49,30'},
 {id:'montagem',nome:'Montagem e fechamento',pts:['6','7','8'],pol:'43,31 72,31 72,62 43,62'},
 {id:'rotulagem',nome:'Rotulagem',pts:['9','10','11'],pol:'15,12 43,12 43,62 15,62'},
 {id:'embalagem',nome:'Embalagem final',pts:['12','14','15','16','18'],pol:'0,10 14,10 14,98 0,98'},
 {id:'auxiliar',nome:'Processos auxiliares',pts:['17'],pol:'32,66 48,66 48,98 32,98'}];
const POSTOS_PADRAO=[
 {id:'OP1-A',op:'OP1',x:30,y:89,area:'G0 · Abastecimento',ponto:'1'},{id:'OP2-A',op:'OP2',x:24.7,y:32,area:'Tullip A / B',ponto:'10'},
 {id:'OP2-B',op:'OP2',x:15.1,y:54,area:'Kallfass / Packout',ponto:'12'},{id:'OP3-A',op:'OP3',x:28.8,y:43,area:'Rotulagem',ponto:'9'},
 {id:'OP3-B',op:'OP3',x:46.6,y:60.5,area:'Evacuator / Cap Placer',ponto:'8'},{id:'OP3-C',op:'OP3',x:63.5,y:51,area:'Metro',ponto:'6'},
 {id:'OP3-D',op:'OP3',x:72.5,y:39.3,area:'EDTA Coater',ponto:'3'},{id:'OP3-E',op:'OP3',x:56.2,y:84,area:'Gel Manufatura',ponto:'17'}];
const OP_COR={OP1:'#14804A',OP2:'#B26F00',OP3:'#6B3DB3'};
/* trajetos aproximados da página 1 do PDF, em pixels do desenho (2000 × 1125) */
const TRAJETOS=[
 ['comum','995,185 995,310 1425,310'],['comum','1300,655 1300,460 965,460 820,410 820,275 360,275 360,520 820,520 820,410'],['comum','360,275 320,175 205,175 205,1000 55,1010 55,180'],['comum','835,880 1115,620',1],
 ['edta','1490,305 1975,305 1975,440 1445,440 1445,655 1300,655'],['sst','1490,318 1962,318 1962,585 1460,585 1460,640 1205,660 1205,900 1365,900 1365,660 1300,655']];
const FREQ=[['turno','A cada turno'],['dia','Uma vez por dia'],['semana','Uma vez por semana']];

/* ---------- base e operações ---------- */
function vazio(){return{schema:'vac-linha360',schemaVersion:1,rev:0,revBy:'',revAt:'',revId:'',appVersion:APP_VERSION,pontos:[],areas:[],postos:[],checklists:[],feitos:[],eventos:[],auditoria:[],exports:null}}
function completar(D){const V=vazio();for(const k of Object.keys(V))if(D[k]==null)D[k]=V[k];return D}
function validarBase(D){const e=[];if(!D||typeof D!=='object')return['não é um objeto'];for(const k of['pontos','areas','postos','checklists','feitos'])if(D[k]!=null&&!Array.isArray(D[k]))e.push(k+' não é lista');return e.slice(0,10)}
/* operações (idempotentes; reaplicadas sobre a versão mais nova da base). Nada se apaga: ativo:false.
   {k:'ponto',it}   posição, nome, fluxo e equipamentos (códigos do cadastro do Portal) de um ponto da planta
   {k:'area',it}    área: nome, pontos e polígono (em % do desenho)
   {k:'posto',it}   posto de trabalho: posição, ponto vinculado e pessoa por turno
   {k:'chk',it}     checklist (título, ponto, posto, frequência)
   {k:'feito',it}   checklist cumprido num dia/turno (id = checklist|dia|turno); {k:'desfeito',id,motivo} anula sem apagar */
function applyOp(D,op){const up=(L,it)=>{const i=L.findIndex(x=>x.id===it.id);if(i>=0)L[i]={...L[i],...clone(it)};else L.push(clone(it))};
 if(op.k==='ponto')up(D.pontos,op.it);else if(op.k==='area')up(D.areas,op.it);else if(op.k==='posto')up(D.postos,op.it);else if(op.k==='chk')up(D.checklists,op.it);
 else if(op.k==='feito'){const f=D.feitos.find(x=>x.id===op.it.id);if(f)Object.assign(f,clone(op.it),{anulado:false});else D.feitos.push(clone(op.it))}
 else if(op.k==='desfeito'){const f=D.feitos.find(x=>x.id===op.id);if(f){f.anulado=true;f.anuladoEm=op.em;f.anuladoPor=op.por}}
 return D}
const junta=(base,pad)=>{const m=new Map(pad.map(x=>[x.id,{...x}]));for(const x of base||[])m.set(x.id,{...(m.get(x.id)||{}),...x});return[...m.values()].filter(x=>x.ativo!==false)};
const pontos=()=>junta(Store.data.pontos,PONTOS_PADRAO).sort((a,b)=>(+a.id||999)-(+b.id||999)||String(a.id).localeCompare(String(b.id)));
const areas=()=>junta(Store.data.areas,AREAS_PADRAO);
const postos=()=>junta(Store.data.postos,POSTOS_PADRAO).sort((a,b)=>a.id.localeCompare(b.id));
const P=id=>pontos().find(p=>p.id===String(id));
function eqs(){const c=typeof vacCad==='function'?vacCad():null;return((c&&c.equipamentos)||[]).filter(e=>e.ativo!==false).map(e=>({codigo:String(e.codigo),nome:e.nome||'',apelidos:e.apelidos||[]})).sort((a,b)=>a.codigo.localeCompare(b.codigo,'pt-BR',{numeric:true}))}
const eqNome=c=>{const e=eqs().find(x=>x.codigo===String(c));return e?e.nome:''};
function turnos(){const c=typeof vacCad==='function'?vacCad():null;const L=((c&&c.turnos)||[]).filter(t=>t.ativo!==false).map(t=>({codigo:String(t.codigo),nome:t.nome||t.codigo}));return L.length?L:[{codigo:'T1',nome:'1º turno'},{codigo:'T2',nome:'2º turno'},{codigo:'T3',nome:'3º turno'}]}
/* equipamentos de um ponto: o vínculo gravado vale; sem vínculo, sugere pelo nome ou apelido do cadastro (marcado como "sugerido") */
function eqDoPonto(p){if(Array.isArray(p.equipamentos))return{lista:p.equipamentos.map(String),sugerido:false};const ch=(p.chaves||[]).map(norm).filter(Boolean);
 const L=eqs().filter(e=>{const n=[e.nome].concat(e.apelidos).map(norm);return ch.some(c=>n.some(x=>x&&(x===c||x.includes(c))))}).map(e=>e.codigo);return{lista:L,sugerido:L.length>0}}
function mapaEq(){const m={};for(const p of pontos())for(const c of eqDoPonto(p).lista)if(!m[c])m[c]=p.id;return m}

/* ---------- leitura das outras páginas (só o exports; regra 1) ---------- */
const Ext={par:null,oee:null,equip:null,inic:null,erros:{},em:null};
const FONTES=[['par','paradas-base.json','Paradas'],['oee','oee-vacutainer-base.json','Produção'],['equip','equipamentos-base.json','Equipamentos'],['inic','iniciativas-base.json','Iniciativas']];
async function lerExt(){if(Store.test||!Store.dir||!Store.perm)return;for(const[k,arq,nome]of FONTES){try{const f=await(await Store.dir.getFileHandle(arq)).getFile();const j=JSON.parse(await f.text());const v=typeof vacExportsOk==='function'?vacExportsOk(j.exports):{ok:!!j.exports};
   Ext[k]=v.ok?j.exports:null;Ext.erros[k]=v.ok?'':(nome+': '+(v.motivo||'sem exports'))}catch(e){Ext[k]=null;Ext.erros[k]=nome+': '+(vacNaoAchou(e)?arq+' não está na pasta':'não consegui ler '+arq)}}Ext.em=new Date()}

/* ---------- números do período (nenhum cálculo novo: só somas do que as páginas publicam) ---------- */
const App={tab:'mapa',sel:'1',camada:'min',zonas:false,zona:null,fluxo:'',edit:false,posto:'OP1-A',f:{per:'7',de:'',ate:'',turno:'',ordem:''},zoom:1,desenho:null};
function periodo(){const h=hoje(),f=App.f;if(f.per==='p'&&f.de&&f.ate)return[f.de<=f.ate?f.de:f.ate,f.de<=f.ate?f.ate:f.de];if(f.per==='0')return[h,h];if(f.per==='1')return[addDias(h,-1),addDias(h,-1)];if(f.per==='m')return[h.slice(0,8)+'01',h];return[addDias(h,-(+f.per||7)+1),h]}
function eventos(){const[de,ate]=periodo(),f=App.f;return((Ext.par&&Ext.par.eventos)||[]).filter(e=>e.dia>=de&&e.dia<=ate&&(!f.turno||e.turno===f.turno)&&(!f.ordem||String(e.ordem||'')===f.ordem))}
const acAberta=a=>!/conclu|cancel/i.test(a.status||'');
function numeros(){const m=mapaEq(),R={},z=()=>({min:0,oc:0,queb:0,os:0,osAtr:0,ac:0,acAtr:0});for(const p of pontos())R[p.id]=z();const fora=z();fora.eq=new Set();
 for(const e of eventos()){const k=m[String(e.equipamento)],r=k?R[k]:fora;if(!k)fora.eq.add(String(e.equipamento||'(sem equipamento)'));r.min+=+e.minutos||0;r.oc+=+e.ocorrencias||1;if(e.classe==='quebra')r.queb+=+e.ocorrencias||1}
 const h=hoje();for(const o of((Ext.equip&&Ext.equip.os)||[]).filter(o=>!/conclu|cancel/i.test(o.status||''))){const k=m[String(o.equipamento)];if(k){R[k].os++;if(o.programadaPara&&o.programadaPara<h)R[k].osAtr++}}
 for(const a of((Ext.inic&&Ext.inic.acoes)||[]).filter(acAberta)){const ks=new Set();for(const v of a.vinculos||[]){if(v.tipo==='equipamento'&&m[String(v.cod)])ks.add(m[String(v.cod)]);if(v.tipo==='ponto'&&R[String(v.cod)])ks.add(String(v.cod))}
  for(const k of ks){R[k].ac++;if(a.atrasada||(a.prazo&&a.prazo<h))R[k].acAtr++}}
 const tot=z();for(const k in R)for(const c in tot)tot[c]+=R[k][c];return{R,tot,fora}}
const CAMADAS=[['min','Tempo parado','min'],['oc','Ocorrências',''],['queb','Quebras',''],['os','OS abertas',''],['ac','Ações abertas','']];
const camNome=k=>(CAMADAS.find(c=>c[0]===k)||CAMADAS[0])[1];
const fmtCam=(k,v)=>k==='min'?nf(v)+' min':nf(v);
/* intensidade relativa ao maior ponto do período: baixa, média, alta (texto + cor; nunca só a cor) */
function nivel(v,max){if(!v)return['none','sem registro'];const r=v/(max||1);return r>=.66?['crit','alta']:r>=.33?['warn','média']:['ok','baixa']}
function ordemAtual(){const L=((Ext.oee&&(Ext.oee.ordens||Ext.oee.porOrdem))||[]).filter(o=>o.ordem);if(!L.length)return null;const k=o=>String(o.inicioReal||o.inicio||'');const ag=new Date().toISOString().slice(0,16);
 const ini=L.filter(o=>k(o)&&k(o)<=ag).sort((a,b)=>k(b).localeCompare(k(a)));return ini[0]||L.slice().sort((a,b)=>k(b).localeCompare(k(a)))[0]}
function ordensPeriodo(){const[de,ate]=periodo(),S=new Map();for(const e of((Ext.par&&Ext.par.eventos)||[]))if(e.ordem&&e.dia>=de&&e.dia<=ate)S.set(String(e.ordem),1);
 const lote={};for(const o of((Ext.oee&&(Ext.oee.ordens||Ext.oee.porOrdem))||[]))if(o.ordem)lote[String(o.ordem)]=o.lote||'';return[...S.keys()].sort().map(o=>({ordem:o,lote:lote[o]||''}))}
const fichaOrd=o=>typeof vacFichaBotao==='function'?vacFichaBotao(o):'';

/* ---------- checklists ---------- */
const chkAtivos=()=>Store.data.checklists.filter(c=>c.ativo!==false);
const semanaDe=d=>{const x=new Date(d+'T12:00:00');x.setDate(x.getDate()-((x.getDay()+6)%7));return x.toISOString().slice(0,10)};
function chkFeito(c,dia,turno){return Store.data.feitos.find(f=>!f.anulado&&f.checklist===c.id&&(c.frequencia==='semana'?semanaDe(f.dia)===semanaDe(dia):f.dia===dia)&&(c.frequencia!=='turno'||f.turno===turno))}
function chkPendentes(dia,turno){return chkAtivos().filter(c=>!chkFeito(c,dia,turno))}
function turnoAgora(){try{if(typeof vacTurnosEm==='function'){const L=vacTurnosEm(hoje())||[],hm=new Date().toTimeString().slice(0,5);const t=L.find(t=>t.inicio&&t.fim&&(t.inicio<=t.fim?hm>=t.inicio&&hm<t.fim:hm>=t.inicio||hm<t.fim));if(t)return String(t.codigo)}}catch(e){}return turnos()[0].codigo}

/* ---------- exports (Portal: cartão, pendências; outras páginas: ponto de cada equipamento) ---------- */
function calcExports(D){const s0=Store.data;Store.data=D;try{const h=hoje(),pend=[];
  const semPessoa=postos().filter(p=>!turnos().some(t=>((p.pessoas||{})[t.codigo]||'').trim()));
  if(semPessoa.length)pend.push({sev:2,tipo:'postoSemPessoa',txt:`${semPessoa.length} posto(s) da linha sem pessoa definida em nenhum turno`,link:'aba=pessoas'});
  const semEq=pontos().filter(p=>!eqDoPonto(p).lista.length&&p.id!=='18'&&p.id!=='5');
  if(semEq.length)pend.push({sev:2,tipo:'pontoSemEquipamento',txt:`${semEq.length} ponto(s) da planta sem equipamento do cadastro vinculado: ${semEq.map(p=>p.id).join(', ')}`,link:'aba=config'});
  return{exportsVersion:1,geradoEm:new Date().toISOString(),modulo:'linha',appVersion:APP_VERSION,
   pontos:pontos().map(p=>({id:p.id,nome:p.nome,fluxo:p.fluxo,equipamentos:eqDoPonto(p).lista})),
   areas:areas().map(a=>({id:a.id,nome:a.nome,pontos:a.pts||[]})),
   postos:postos().map(p=>({id:p.id,op:p.op,area:p.area||'',ponto:p.ponto||null,pessoas:p.pessoas||{}})),
   checklists:{ativos:chkAtivos().length,feitosHoje:D.feitos.filter(f=>!f.anulado&&f.dia===h).length},
   pendencias:pend,
   kpis:[['Pontos na planta',String(pontos().length),`${semEq.length} sem equipamento`,semEq.length?'warn':'good'],['Postos',String(postos().length),`${semPessoa.length} sem pessoa`,semPessoa.length?'warn':'good'],['Checklists',String(chkAtivos().length),'ativos','']]}}finally{Store.data=s0}}

/* ---------- interface ---------- */
const ABAS=[['mapa','Visão da linha'],['pessoas','Pessoas e postos'],['checklists','Checklists'],['config','Configuração']];
const ic=(n,c)=>typeof vacIcone==='function'?vacIcone(n,c):'';
function navHtml(){const n=chkPendentes(hoje(),turnoAgora()).length;return ABAS.map(([id,t])=>`<button data-t="${id}" class="${App.tab===id?'on':''}"${App.tab===id?' aria-current="page"':''}>${esc(t)}${id==='checklists'&&n?` <span class="cnt" title="Checklists pendentes agora">${n}</span>`:''}</button>`).join('')}
function ir(tab){App.tab=tab;App.edit=false;App.desenho=null;const h='#aba='+tab;if(location.hash!==h)history.replaceState(history.state,'',h);render()}
document.addEventListener('click',e=>{const b=e.target.closest('#nav [data-t]');if(b)ir(b.dataset.t)});
function avisos(){const L=Object.values(Ext.erros).filter(Boolean);if(Store.test||!L.length)return'';if(!Store.dir||!Store.perm)return'';return`<p class="l3-av" role="status">${ic('alerta','sm')} Parte dos dados não pôde ser lida: ${esc(L.join(' · '))}. Os números dessas páginas aparecem como "sem dados", nunca como zero.</p>`}
function semPasta(){return!Store.test&&(!Store.dir||!Store.perm)?`<p class="l3-av" role="status">${ic('info','sm')} Sem a pasta conectada, a planta mostra só o que está gravado neste navegador. <a href="#" id="avConn">Conectar a pasta</a> para ler Paradas, Produção, Equipamentos e Iniciativas.</p>`:''}
const dado=(fonte,v)=>fonte?v:'<span class="muted" title="A página de origem não foi lida">sem dados</span>';

/* planta: imagem + áreas + fluxos + pinos. modo: 'mapa' | 'pessoas' | 'config' */
function plantaHtml(modo,N){const mx=N?Math.max(1,...Object.values(N.R).map(r=>r[App.camada])):1,k=App.camada;
 const zon=(App.zonas||modo==='config')?areas().map(a=>{const pts=(a.pol||'').split(/\s+/).map(q=>q.split(',').map(Number)).filter(q=>q.length===2&&q.every(isFinite));if(pts.length<3)return'';
   const v=N?(a.pts||[]).reduce((s,id)=>s+((N.R[id]||{})[k]||0),0):0,mz=N?Math.max(1,...areas().map(z=>(z.pts||[]).reduce((s,id)=>s+((N.R[id]||{})[k]||0),0))):1,nv=N?nivel(v,mz)[0]:'none',cor={crit:'#C23B3A',warn:'#B26F00',ok:'#14804A',none:'#6F8092'}[nv];
   const cx=pts.reduce((s,q)=>s+q[0],0)/pts.length*LW/100,cy=Math.min(...pts.map(q=>q[1]))*LH/100+34;
   return`<polygon class="zona${App.zona===a.id?' on':''}" data-zona="${esc(a.id)}" points="${pts.map(q=>(q[0]*LW/100)+','+(q[1]*LH/100)).join(' ')}" fill="${cor}" stroke="${cor}" tabindex="0" role="button" aria-label="${esc('Área '+a.nome+(N?': '+fmtCam(k,v):''))}"><title>${esc(a.nome+(N?' · '+camNome(k)+': '+fmtCam(k,v):''))}</title></polygon><text class="zrot" x="${cx}" y="${cy}" text-anchor="middle" fill="${cor}">${esc(a.nome)}</text>`}).join(''):'';
 const des=App.desenho&&App.desenho.pts.length?`<polyline points="${App.desenho.pts.map(q=>(q[0]*LW/100)+','+(q[1]*LH/100)).join(' ')}" fill="none" stroke="#0D5E9C" stroke-width="5" stroke-dasharray="14 8"/>`+App.desenho.pts.map(q=>`<circle cx="${q[0]*LW/100}" cy="${q[1]*LH/100}" r="9" fill="#0D5E9C"/>`).join(''):'';
 const fl=(modo==='mapa'&&App.camada==='fluxo')?TRAJETOS.filter(t=>!App.fluxo||t[0]===App.fluxo).map(t=>`<polyline class="fl${t[2]?' t':''}" points="${t[1]}" stroke="${FLUXOS[t[0]][1]}"/>`).join(''):'';
 const pins=modo==='pessoas'?'':pontos().filter(p=>!App.fluxo||p.fluxo===App.fluxo||modo==='config').map(p=>{let cls='info',vl='',tit=p.nome;
   if(modo==='mapa'&&N&&k!=='fluxo'){const v=N.R[p.id][k],nv=nivel(v,mx);cls=Ext.par||k==='os'||k==='ac'?nv[0]:'none';vl=v?`<span class="vl">${esc(fmtCam(k,v))}</span>`:'';tit=`${p.id} · ${p.nome} · ${camNome(k)}: ${fmtCam(k,v)} (intensidade ${nv[1]})`}
   else if(k==='fluxo'&&modo==='mapa'){cls='';tit=`${p.id} · ${p.nome} · fluxo ${FLUXOS[p.fluxo]?FLUXOS[p.fluxo][0]:''}`}
   const st=k==='fluxo'&&modo==='mapa'&&FLUXOS[p.fluxo]?`background:${FLUXOS[p.fluxo][1]};`:'';
   return`<button type="button" class="l3-pin ${cls}${App.sel===p.id?' on':''}${App.edit?' edit':''}" data-pin="${esc(p.id)}" style="${st}left:${p.x}%;top:${p.y}%" title="${esc(tit)}" aria-label="${esc(tit)}">${esc(p.id)}${vl}</button>`}).join('');
 const ops=modo==='pessoas'||(modo==='config'&&App.edit)?postos().map(p=>{const tem=turnos().some(t=>((p.pessoas||{})[t.codigo]||'').trim());return`<button type="button" class="l3-op${tem?'':' vago'}${App.posto===p.id?' on':''}" data-posto="${esc(p.id)}" style="left:${p.x}%;top:${p.y}%;background-color:${OP_COR[p.op]||'#6F8092'}" title="${esc(p.id+' · '+(p.area||'')+(tem?'':' · sem pessoa definida'))}">${esc(p.op.replace('OP',''))}</button>`}).join(''):'';
 return`<div class="l3-vp"><div class="l3-cv" id="cv" style="width:${Math.round(App.zoom*100)}%"><img src="${PLANTA}" alt="Planta da linha Vacutainer: do Tray Loader (início, ao centro) à saída da linha (à esquerda), com aplicação de gel, EDTA e sílica à direita."><svg class="ov" viewBox="0 0 ${LW} ${LH}" preserveAspectRatio="none" aria-hidden="${zon?'false':'true'}">${zon}${fl}${des}</svg>${pins}${ops}</div></div>`}

function fichaPonto(N){const p=P(App.sel)||pontos()[0];if(!p)return'';const r=N.R[p.id],E=eqDoPonto(p),m=mapaEq(),[de,ate]=periodo();
 const evs=eventos().filter(e=>m[String(e.equipamento)]===p.id).sort((a,b)=>(b.dia+(b.inicio||'')).localeCompare(a.dia+(a.inicio||''))).slice(0,6);
 const oss=((Ext.equip&&Ext.equip.os)||[]).filter(o=>!/conclu|cancel/i.test(o.status||'')&&m[String(o.equipamento)]===p.id).slice(0,5);
 const acs=((Ext.inic&&Ext.inic.acoes)||[]).filter(a=>acAberta(a)&&(a.vinculos||[]).some(v=>(v.tipo==='equipamento'&&m[String(v.cod)]===p.id)||(v.tipo==='ponto'&&String(v.cod)===p.id))).slice(0,5);
 const eq1=E.lista[0]||'',h=(s,hash)=>{const x=(typeof systems==='function'?systems():[]).find(y=>y.id===s);return x&&typeof sysHref==='function'?sysHref(x,hash):'#'};
 const nova={titulo:'',descricao:'',origem:{tipo:'linha360',ref:'ponto|'+p.id,resumo:`Ponto ${p.id} · ${p.nome} · ${nf(r.min)} min parados de ${br(de)} a ${br(ate)}`,link:vacAquiHref('ponto='+p.id)},vinculos:[{tipo:'ponto',cod:p.id}].concat(E.lista.map(c=>({tipo:'equipamento',cod:c})))};
 return`<aside class="card l3-fi" id="ficha" aria-label="Ficha do ponto selecionado"><div><div class="eb">Ponto ${esc(p.id)} · fluxo ${esc((FLUXOS[p.fluxo]||['—'])[0])}</div><h3>${esc(p.nome)}</h3>
  <div class="small muted">${E.lista.length?E.lista.map(c=>`<span class="code">${esc(c)}</span> ${esc(eqNome(c))}`).join(' · ')+(E.sugerido?' <span class="pill warn" title="Vínculo sugerido pelo nome; confirme em Configuração">sugerido</span>':''):'Sem equipamento do cadastro vinculado · <a href="#aba=config">vincular</a>'}</div></div>
  <div class="l3-tl"><div class="g"><small>Tempo parado no período</small><b>${dado(Ext.par,nf(r.min)+' min')}</b></div><div><small>Ocorrências</small><b>${dado(Ext.par,nf(r.oc))}</b></div><div><small>Quebras</small><b>${dado(Ext.par,nf(r.queb))}</b></div>
   <div><small>OS abertas</small><b>${dado(Ext.equip,nf(r.os))}</b>${r.osAtr?` <span class="pill crit">${r.osAtr} atrasada(s)</span>`:''}</div><div><small>Ações abertas</small><b>${dado(Ext.inic,nf(r.ac))}</b>${r.acAtr?` <span class="pill crit">${r.acAtr} atrasada(s)</span>`:''}</div></div>
  ${evs.length?`<h4>Últimas paradas</h4><ul class="l3-li">${evs.map(e=>`<li class="g"><span class="small muted">${brc(e.dia)} ${esc(e.turno||'')}</span><span>${esc(e.descricao||e.codigo||'')}${e.ordem?`<br><span class="small muted">ordem ${esc(e.ordem)}</span> ${fichaOrd(e.ordem)}`:''}</span><span class="n">${nf(e.minutos)} min</span></li>`).join('')}</ul>`:''}
  ${oss.length?`<h4>Ordens de serviço abertas</h4><ul class="l3-li">${oss.map(o=>`<li><a href="${esc(h('equip','os='+encodeURIComponent(o.id)))}">${esc(o.id)}</a><span>${esc(o.titulo||'')}</span><span class="sp"></span><span class="pill ${o.programadaPara&&o.programadaPara<hoje()?'crit':'info'}">${esc(o.status||'')}</span></li>`).join('')}</ul>`:''}
  ${acs.length?`<h4>Ações abertas</h4><ul class="l3-li">${acs.map(a=>`<li><a href="${esc(h('inic','acao='+encodeURIComponent(a.id)))}">${esc(a.id)}</a><span>${esc(a.titulo||'')}</span><span class="sp"></span><span class="small muted">${esc(a.responsavel||'sem responsável')} · ${br(a.prazo)}</span></li>`).join('')}</ul>`:''}
  <h4>Investigar e agir</h4><div class="l3-lk">
   ${eq1?`<a href="${esc(h('paradas','equipamento='+encodeURIComponent(eq1)))}"><span>${ic('paradas')} Paradas deste equipamento</span>${ic('seta','sm')}</a><a href="${esc(h('equip','eq='+encodeURIComponent(eq1)))}"><span>${ic('equip')} Ficha do equipamento</span>${ic('seta','sm')}</a>
   <a href="${esc(h('equip','novaOS='+encodeURIComponent(JSON.stringify({equipamento:eq1,titulo:'',origem:{tipo:'linha360',ref:'ponto|'+p.id,resumo:'Ponto '+p.id+' · '+p.nome}}))))}" target="_blank" rel="noopener"><span>${ic('mais')} Abrir OS em Equipamentos</span>${ic('seta','sm')}</a>`:''}
   <a href="${esc(vacNovaAcaoHref(nova))}" target="_blank" rel="noopener" title="Abre Iniciativas com a ação preenchida; você confere antes de criar"><span>${ic('inic')} Nova ação em Iniciativas</span>${ic('seta','sm')}</a>
   <a href="${esc(h('oee',''))}"><span>${ic('oee')} Produção e OEE</span>${ic('seta','sm')}</a></div></aside>`}

/* gráficos (docs/graficos-padrao.md): título, "Valores em …", valor no fim da barra, frase de resumo */
function barrasH(itens,un,sel){if(!itens.length||!itens.some(i=>i.v))return'<p class="empty">Sem registros no período e nos filtros escolhidos.</p>';const L=itens.filter(i=>i.v).sort((a,b)=>b.v-a.v).slice(0,12),mx=L[0].v,tot=L.reduce((s,i)=>s+i.v,0),lh=30,W=640,x0=200,H=L.length*lh+26;let ac=0;
 return`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Barras horizontais ordenadas da maior para a menor">${L.map((i,n)=>{ac+=i.v;const w=Math.max(2,(W-x0-150)*i.v/mx),y=n*lh+6,p80=(ac-i.v)/tot<.8;
  return`<text x="${x0-8}" y="${y+16}" text-anchor="end">${esc(i.l.length>28?i.l.slice(0,27)+'…':i.l)}</text><rect class="bar" data-bar="${esc(i.k)}" x="${x0}" y="${y}" width="${w}" height="20" rx="3" fill="${p80?'#C94645':'#F1A2A2'}" ${sel===i.k?'stroke="#0D5E9C" stroke-width="3"':''}><title>${esc(i.l+': '+nf(i.v)+' '+un+' · '+(i.v/tot*100).toFixed(1)+'% · acumulado '+(ac/tot*100).toFixed(1)+'%')}</title></rect><text class="v" x="${x0+w+6}" y="${y+16}">${nf(i.v)} ${un}</text><text x="${W-4}" y="${y+16}" text-anchor="end">${(ac/tot*100).toFixed(0)}%</text>`}).join('')}<text x="${W-4}" y="${H-4}" text-anchor="end">% acumulado</text></svg>`}
function barrasV(serie,un){if(!serie.some(s=>s.v))return'<p class="empty">Sem registros no período e nos filtros escolhidos.</p>';const W=640,H=230,L=46,B=30,T=14,mx=Math.max(...serie.map(s=>s.v)),w=(W-L-8)/serie.length,Y=v=>T+(H-T-B)*(1-v/mx);let g='';
 for(let i=0;i<=4;i++){const v=mx*i/4;g+=`<line x1="${L}" x2="${W-8}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--grid,#E4EBF2)"/><text x="${L-6}" y="${Y(v)+4}" text-anchor="end">${nf(v)}</text>`}
 const passo=Math.ceil(serie.length/12);return`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Barras por dia">${g}${serie.map((s,i)=>`<rect x="${L+i*w+w*.15}" y="${Y(s.v)}" width="${w*.7}" height="${Math.max(0,H-B-Y(s.v))}" rx="2" fill="#1972AE"><title>${esc(br(s.d)+': '+nf(s.v)+' '+un)}</title></rect>${serie.length<=14&&s.v?`<text class="v" x="${L+i*w+w/2}" y="${Y(s.v)-4}" text-anchor="middle">${nf(s.v)}</text>`:''}${i%passo===0?`<text x="${L+i*w+w/2}" y="${H-10}" text-anchor="middle">${brc(s.d)}</text>`:''}`).join('')}</svg>`}

function vMapa(){const N=numeros(),[de,ate]=periodo(),oa=ordemAtual(),T=N.tot,k=App.camada==='fluxo'?'min':App.camada;
 const top=pontos().map(p=>({p,v:N.R[p.id].min})).sort((a,b)=>b.v-a.v)[0];const ords=ordensPeriodo();
 const dias=[];for(let d=de;d<=ate&&dias.length<92;d=addDias(d,1))dias.push({d,v:0});const idx=Object.fromEntries(dias.map((x,i)=>[x.d,i]));for(const e of eventos())if(idx[e.dia]!=null)dias[idx[e.dia]].v+=+e.minutos||0;
 const porP=pontos().map(p=>({k:p.id,l:p.id+' · '+p.nome,v:N.R[p.id][k]})),porA=areas().map(a=>({k:a.id,l:a.nome,v:(a.pts||[]).reduce((s,id)=>s+((N.R[id]||{})[k]||0),0)}));
 const un=k==='min'?'min':'',lider=porP.slice().sort((a,b)=>b.v-a.v)[0];
 return`<div class="vk-hd"><div><h2>Visão da linha</h2><p>A planta da linha com o que está acontecendo em cada ponto: paradas, ordens de serviço e ações. Clique num ponto para investigar.</p></div></div>
 ${semPasta()}${avisos()}
 <div class="filters" id="filtros"><label>Período <select id="fPer">${[['0','Hoje'],['1','Ontem'],['7','Últimos 7 dias'],['30','Últimos 30 dias'],['m','Mês atual'],['p','Personalizado']].map(o=>`<option value="${o[0]}"${App.f.per===o[0]?' selected':''}>${o[1]}</option>`).join('')}</select></label>
  ${App.f.per==='p'?`<label>De <input type="date" id="fDe" value="${esc(App.f.de||de)}"></label><label>Até <input type="date" id="fAte" value="${esc(App.f.ate||ate)}"></label>`:''}
  <label>Turno <select id="fTurno"><option value="">Todos</option>${turnos().map(t=>`<option value="${esc(t.codigo)}"${App.f.turno===t.codigo?' selected':''}>${esc(t.nome)}</option>`).join('')}</select></label>
  <label title="Ordem de produção (cada ordem tem um lote) em que a parada aconteceu">Ordem · lote <select id="fOrdem"><option value="">Todas</option>${ords.map(o=>`<option value="${esc(o.ordem)}"${App.f.ordem===o.ordem?' selected':''}>${esc(o.ordem+(o.lote?' · lote '+o.lote:''))}</option>`).join('')}</select></label>
  <label>Fluxo <select id="fFluxo"><option value="">Todos</option>${Object.entries(FLUXOS).map(([c,v])=>`<option value="${c}"${App.fluxo===c?' selected':''}>${v[0]}</option>`).join('')}</select></label>
  <span class="sp"></span><span class="small muted">${br(de)}${de!==ate?' a '+br(ate):''}${Ext.par&&Ext.par.eventosCobertura&&Ext.par.eventosCobertura.de>de?` · o Paradas publica eventos desde ${br(Ext.par.eventosCobertura.de)}`:''}</span></div>
 ${vacLayout.sec('01','Situação da linha','Ordem em produção e o que pede atenção no período')}
 <div class="l3-top">
  <div class="l3-k"><span class="l">${ic('oee','sm')} Ordem em produção</span><span class="v">${oa?esc(oa.ordem):'<span class="muted" style="font-size:16px">sem dados</span>'}</span><span class="s l3-ord">${oa?`lote <b>${esc(oa.lote||'—')}</b> · catálogo ${esc(oa.catalogo||'—')} ${fichaOrd(oa.ordem)}`:'A Produção não publicou ordens'}</span></div>
  <div class="l3-k ${Ext.par?(T.min?'crit':'ok'):'none'}"><span class="l">${ic('paradas','sm')} Tempo parado</span><span class="v">${dado(Ext.par,nf(T.min+N.fora.min)+' min')}</span><span class="s">${Ext.par?`${nf(T.oc+N.fora.oc)} ocorrência(s) · ${nf(T.queb+N.fora.queb)} quebra(s)`:'Paradas não lido'}</span></div>
  <div class="l3-k ${top&&top.v?'warn':'none'}"><span class="l">${ic('alerta','sm')} Ponto com mais tempo parado</span><span class="v">${top&&top.v?esc(top.p.id+' · '+top.p.nome):'—'}</span><span class="s">${top&&top.v?nf(top.v)+' min · '+(T.min?(top.v/T.min*100).toFixed(0):0)+'% do tempo localizado':'Sem paradas localizadas no período'}</span></div>
  <div class="l3-k ${Ext.equip?(T.osAtr?'crit':'ok'):'none'}"><span class="l">${ic('equip','sm')} OS abertas</span><span class="v">${dado(Ext.equip,nf(T.os))}</span><span class="s">${Ext.equip?(T.osAtr?T.osAtr+' atrasada(s)':'nenhuma atrasada'):'Equipamentos não lido'}</span></div>
  <div class="l3-k ${Ext.inic?(T.acAtr?'crit':'ok'):'none'}"><span class="l">${ic('inic','sm')} Ações abertas na linha</span><span class="v">${dado(Ext.inic,nf(T.ac))}</span><span class="s">${Ext.inic?(T.acAtr?T.acAtr+' atrasada(s)':'nenhuma atrasada'):'Iniciativas não lido'}</span></div></div>
 ${N.fora.min?`<p class="l3-av">${ic('info','sm')} ${nf(N.fora.min)} min de parada são de equipamento sem ponto na planta (${esc([...N.fora.eq].join(', '))}). Eles entram no total, mas não aparecem no mapa. <a href="#aba=config">Vincular em Configuração</a></p>`:''}
 ${vacLayout.sec('02','Planta interativa','Escolha a camada; a cor e o número do ponto mostram a intensidade no período')}
 <div class="l3-lay"><section class="card l3-map" data-vg-nao><div class="l3-mh"><div><h3>${esc(App.camada==='fluxo'?'Fluxo produtivo':camNome(App.camada)+' por ponto')}</h3><p>${App.camada==='fluxo'?'Caminho do produto: comum, EDTA e SST':'Valores em '+(App.camada==='min'?'minutos':'quantidade')+' · '+br(de)+(de!==ate?' a '+br(ate):'')}</p></div><span class="sp"></span>
   <span class="row"><button class="b sm" id="zMenos" aria-label="Diminuir a planta">−</button><span class="small" style="min-width:42px;text-align:center">${Math.round(App.zoom*100)}%</span><button class="b sm" id="zMais" aria-label="Aumentar a planta">+</button></span></div>
  <div class="l3-cam" role="group" aria-label="Camada da planta">${CAMADAS.concat([['fluxo','Fluxo produtivo']]).map(c=>`<button type="button" data-cam="${c[0]}" aria-pressed="${App.camada===c[0]}">${esc(c[1])}</button>`).join('')}<label><input type="checkbox" id="cZonas"${App.zonas?' checked':''}> Áreas</label></div>
  ${plantaHtml('mapa',N)}
  <div class="l3-leg">${App.camada==='fluxo'?Object.values(FLUXOS).map(v=>`<span><i style="background:${v[1]}"></i>${v[0]}</span>`).join(''):`<span><i style="background:#14804A"></i>Intensidade baixa</span><span><i style="background:#B26F00"></i>Média</span><span><i style="background:#C23B3A"></i>Alta</span><span><i style="background:#A8B4C1"></i>Sem registro</span><span class="sp"></span><span>Intensidade relativa ao ponto com o maior valor do período.</span>`}</div>
  ${App.zona&&areas().find(a=>a.id===App.zona)?(()=>{const a=areas().find(x=>x.id===App.zona),s=c=>(a.pts||[]).reduce((t,id)=>t+((N.R[id]||{})[c]||0),0);return`<div class="l3-leg" role="status"><b style="color:var(--ink)">Área: ${esc(a.nome)}</b><span>${nf(s('min'))} min parados</span><span>${nf(s('oc'))} ocorrência(s)</span><span>${nf(s('os'))} OS aberta(s)</span><span>${nf(s('ac'))} ação(ões)</span><span class="sp"></span><span>Pontos: ${(a.pts||[]).map(id=>`<a href="#" data-irp="${esc(id)}">${esc(id)}</a>`).join(' · ')}</span><button class="b sm" id="zLimpa">Limpar área</button></div>`})():''}
 </section>${fichaPonto(N)}</div>
 ${vacLayout.sec('03','Análises','Onde o tempo se concentra. Passe o mouse num gráfico para mudar a largura ou a ordem')}
 <div class="l3-g3" id="l3graf">
  <section class="card l3-ch" id="gPonto"><h3>${esc(camNome(k))} por ponto da planta</h3><p class="c-un">Valores em <b>${k==='min'?'minutos':'quantidade'}</b> · barras escuras somam 80% · clique na barra para ver o ponto</p>${barrasH(porP,un,App.sel)}<p class="res">${lider&&lider.v?`Maior concentração: ${esc(lider.l)}, com ${nf(lider.v)} ${un}.`:'Nada localizado no período.'}</p></section>
  <section class="card l3-ch" id="gArea"><h3>${esc(camNome(k))} por área</h3><p class="c-un">Valores em <b>${k==='min'?'minutos':'quantidade'}</b> · clique na barra para destacar a área na planta</p>${barrasH(porA,un,App.zona)}<p class="res">Áreas e pontos de cada área são definidos em Configuração.</p></section>
  <section class="card l3-ch" id="gDia"><h3>Tempo parado por dia</h3><p class="c-un">Valores em <b>minutos</b> · ${br(de)}${de!==ate?' a '+br(ate):''}</p>${Ext.par?barrasV(dias,'min'):'<p class="empty">Paradas não lido.</p>'}<p class="res">${Ext.par&&dias.some(d=>d.v)?(()=>{const m=dias.slice().sort((a,b)=>b.v-a.v)[0];return`Pior dia: ${br(m.d)}, com ${nf(m.v)} min.`})():''}</p></section>
 </div>`}

function vPessoas(){const p=postos().find(x=>x.id===App.posto)||postos()[0],T=turnos(),nomes=((typeof vacCad==='function'&&vacCad()||{}).usuarios||[]).filter(u=>u.ativo!==false).map(u=>u.nome).filter(Boolean);
 const vagos=postos().filter(x=>!T.some(t=>((x.pessoas||{})[t.codigo]||'').trim())).length;
 return`<div class="vk-hd"><div><h2>Pessoas e postos</h2><p>Quem ocupa cada posto da linha (OP1, OP2, OP3), por turno. Clique num posto na planta ou na lista.</p></div></div>${semPasta()}
 <div class="l3-top"><div class="l3-k"><span class="l">${ic('pessoas','sm')} Postos</span><span class="v">${postos().length}</span><span class="s">${['OP1','OP2','OP3'].map(o=>o+': '+postos().filter(x=>x.op===o).length).join(' · ')}</span></div>
  <div class="l3-k ${vagos?'warn':'ok'}"><span class="l">${ic('alerta','sm')} Postos sem pessoa</span><span class="v">${vagos}</span><span class="s">${vagos?'sem ninguém definido em nenhum turno (hachurados na planta)':'todos com pessoa definida'}</span></div></div>
 <div class="l3-lay"><section class="card l3-map" data-vg-nao><div class="l3-mh"><div><h3>Postos na planta</h3><p>O número é o grupo do operador (1 = OP1, 2 = OP2, 3 = OP3)</p></div></div>${plantaHtml('pessoas')}
  <div class="l3-leg">${Object.entries(OP_COR).map(([o,c])=>`<span><i style="background:${c};border-radius:3px"></i>${o}</span>`).join('')}<span>Hachurado = sem pessoa definida</span></div></section>
  <aside class="card l3-fi">${p?`<div><div class="eb">Posto ${esc(p.id)}</div><h3>${esc(p.area||p.id)}</h3><div class="small muted">Ponto da planta: ${p.ponto&&P(p.ponto)?esc(p.ponto+' · '+P(p.ponto).nome):'sem vínculo'}</div></div>
   <form id="fPosto" class="fgrid" style="grid-template-columns:1fr">${T.map(t=>`<label>${esc(t.nome)}<input name="t_${esc(t.codigo)}" list="dlNomes" maxlength="80" placeholder="Não definido" value="${esc((p.pessoas||{})[t.codigo]||'')}"></label>`).join('')}
    <label>Área / atividade<input name="area" maxlength="80" value="${esc(p.area||'')}"></label>
    <label>Ponto da planta<select name="ponto"><option value="">Sem vínculo</option>${pontos().map(x=>`<option value="${esc(x.id)}"${p.ponto===x.id?' selected':''}>${esc(x.id+' · '+x.nome)}</option>`).join('')}</select></label>
    <label>Observação<input name="nota" maxlength="160" value="${esc(p.nota||'')}"></label><datalist id="dlNomes">${nomes.map(n=>`<option value="${esc(n)}">`).join('')}</datalist>
    <div class="row"><button class="b pri" type="submit">Salvar posto</button></div></form>`:''}</aside></div>
 ${vacLayout.sec('02','Quadro de postos','Todos os postos, por turno')}
 <div class="tw"><table class="t"><caption class="small muted" style="text-align:left;padding:6px 8px">Posto, área e pessoa em cada turno</caption><thead><tr><th scope="col">Posto</th><th scope="col">Área / atividade</th><th scope="col">Ponto</th>${T.map(t=>`<th scope="col">${esc(t.nome)}</th>`).join('')}</tr></thead><tbody>${postos().map(x=>`<tr class="clk${App.posto===x.id?' on':''}" data-posto="${esc(x.id)}"><td class="code">${esc(x.id)}</td><td>${esc(x.area||'')}</td><td>${x.ponto&&P(x.ponto)?esc(x.ponto+' · '+P(x.ponto).nome):'—'}</td>${T.map(t=>`<td>${esc((x.pessoas||{})[t.codigo]||'')||'<span class="muted">—</span>'}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`}

function vChecklists(){const h=hoje(),tn=App.chkTurno||turnoAgora(),L=chkAtivos(),pen=chkPendentes(h,tn);
 return`<div class="vk-hd"><div><h2>Checklists</h2><p>Verificações de rotina ligadas a um ponto da planta. Marque o que foi feito no turno.</p></div><span class="sp"></span><label class="small">Turno <select id="ckTurno">${turnos().map(t=>`<option value="${esc(t.codigo)}"${tn===t.codigo?' selected':''}>${esc(t.nome)}</option>`).join('')}</select></label></div>${semPasta()}
 <div class="l3-top"><div class="l3-k ${pen.length?'warn':'ok'}"><span class="l">${ic('inic','sm')} Pendentes agora</span><span class="v">${pen.length}</span><span class="s">de ${L.length} checklist(s) · ${br(h)} · ${esc((turnos().find(t=>t.codigo===tn)||{}).nome||tn)}</span></div></div>
 ${vacLayout.sec('01','Hoje','O que falta e o que já foi feito')}
 <div class="l3-ckl">${L.length?L.map(c=>{const f=chkFeito(c,h,tn),p=c.ponto&&P(c.ponto);return`<div class="l3-ck${f?' feito':''}"><span class="pill ${f?'ok':'warn'}">${f?'Feito':'Pendente'}</span><span class="t">${esc(c.titulo)}</span><span class="small muted">${p?esc('ponto '+p.id+' · '+p.nome):'sem ponto'} · ${esc((FREQ.find(x=>x[0]===c.frequencia)||FREQ[0])[1].toLowerCase())}${f?' · '+esc(f.por||'?')+' em '+brh(f.em):''}</span><span class="sp"></span>
   ${f?`<button class="b sm" data-desf="${esc(f.id)}">Desfazer</button>`:`<button class="b sm pri" data-feito="${esc(c.id)}">Marcar como feito</button>`}<button class="b sm" data-chked="${esc(c.id)}" aria-label="Editar checklist">${ic('editar','sm')}</button></div>`}).join(''):'<p class="empty card">Nenhum checklist cadastrado. Cadastre o primeiro abaixo, com o padrão em mãos.</p>'}</div>
 ${vacLayout.sec('02','Cadastrar checklist','O conteúdo vem do padrão da área; a página não inventa verificações')}
 <form class="card fgrid" id="fChk"><input type="hidden" name="id" value=""><label class="w2">Verificação<input name="titulo" required maxlength="150" placeholder="Ex.: Conferir nível de gel antes da partida"></label>
  <label>Ponto da planta<select name="ponto"><option value="">Sem ponto</option>${pontos().map(x=>`<option value="${esc(x.id)}">${esc(x.id+' · '+x.nome)}</option>`).join('')}</select></label>
  <label>Posto responsável<select name="posto"><option value="">Qualquer</option>${postos().map(x=>`<option value="${esc(x.id)}">${esc(x.id+' · '+(x.area||''))}</option>`).join('')}</select></label>
  <label>Frequência<select name="frequencia">${FREQ.map(f=>`<option value="${f[0]}">${f[1]}</option>`).join('')}</select></label>
  <div class="row wf"><button class="b pri" type="submit" id="chkSalvar">Adicionar checklist</button><button class="b" type="button" id="chkDesativar" hidden>Desativar</button><button class="b" type="reset" id="chkLimpar">Limpar</button></div></form>`}

function vConfig(){const S=Store,E=eqs(),a=areas().find(x=>x.id===App.areaSel)||areas()[0];
 return`<div class="vk-hd"><div><h2>Configuração</h2><p>Posição e equipamentos de cada ponto, áreas da linha, pasta e base.</p></div></div>
 ${vacLayout.sec('01','Planta','Arraste os pontos e os postos para o lugar certo; desenhe as áreas')}
 <section class="card l3-map" data-vg-nao><div class="l3-cam"><button type="button" id="cfEdit" aria-pressed="${App.edit}">${App.edit?'Concluir edição das posições':'Editar posições (arrastar)'}</button>
   <label>Área <select id="cfArea">${areas().map(x=>`<option value="${esc(x.id)}"${a&&a.id===x.id?' selected':''}>${esc(x.nome)}</option>`).join('')}</select></label>
   ${App.desenho?`<button type="button" id="cfDesFim" aria-pressed="true">Concluir desenho (${App.desenho.pts.length} pontos)</button><button type="button" id="cfDesVolta">Desfazer último</button><button type="button" id="cfDesCanc">Cancelar</button>`:`<button type="button" id="cfDes">Redesenhar esta área</button><button type="button" id="cfAreaNova">+ Área</button>`}
   <span class="small muted">${App.desenho?'Clique na planta para marcar cada canto da área.':App.edit?'Arraste e solte; cada ponto movido é gravado.':''}</span></div>${plantaHtml('config')}</section>
 ${a?`<form class="card fgrid mt" id="fArea"><label>Nome da área<input name="nome" maxlength="60" required value="${esc(a.nome)}"></label><label class="wf">Pontos desta área<span class="l3-eqs">${pontos().map(p=>`<label><input type="checkbox" name="pt" value="${esc(p.id)}"${(a.pts||[]).includes(p.id)?' checked':''}> ${esc(p.id+' · '+p.nome)}</label>`).join('')}</span></label><div class="row wf"><button class="b pri" type="submit">Salvar área</button><button class="b" type="button" id="cfAreaDes">Desativar área</button></div></form>`:''}
 ${vacLayout.sec('02','Pontos e equipamentos','O equipamento do cadastro do Portal é o que liga o ponto às paradas, às OS e às ações')}
 ${E.length?'':`<p class="l3-av">${ic('info','sm')} O cadastro de equipamentos do Portal ainda não foi lido neste computador. <a href="${esc(vacPortalHref('cadastros/equipamentos'))}">Abrir o cadastro no Portal</a></p>`}
 <div class="tw"><table class="t"><thead><tr><th scope="col">Ponto</th><th scope="col">Nome</th><th scope="col">Fluxo</th><th scope="col">Equipamentos do cadastro</th><th scope="col"></th></tr></thead><tbody>${pontos().map(p=>{const q=eqDoPonto(p);return`<tr data-pt="${esc(p.id)}"><td class="code">${esc(p.id)}</td><td><input data-c="nome" maxlength="60" value="${esc(p.nome)}" aria-label="Nome do ponto ${esc(p.id)}"></td>
   <td><select data-c="fluxo" aria-label="Fluxo do ponto ${esc(p.id)}">${Object.entries(FLUXOS).map(([c,v])=>`<option value="${c}"${p.fluxo===c?' selected':''}>${v[0]}</option>`).join('')}</select></td>
   <td><span class="l3-eqs">${E.map(e=>`<label title="${esc(e.nome)}"><input type="checkbox" data-eq value="${esc(e.codigo)}"${q.lista.includes(e.codigo)?' checked':''}> ${esc(e.codigo)} ${esc(e.nome)}</label>`).join('')||'<span class="muted small">sem cadastro</span>'}</span>${q.sugerido?' <span class="pill warn" title="Sugerido pelo nome; salve para confirmar">sugerido</span>':''}</td>
   <td><button class="b sm" data-ptsalvar>Salvar</button></td></tr>`}).join('')}</tbody></table></div>
 ${vacLayout.sec('03','Pasta e base','Onde a página grava')}
 <div class="card"><p>${S.test?'Modo de teste: nada é gravado.':S.dir?`Pasta <b>${esc(S.dirName)}</b> · base <span class="code">00. Bases/${esc(PAGE.baseFile)}</span> · rev ${S.data.rev||0}`:'Sem pasta conectada: as alterações ficam neste navegador até conectar.'}</p>
  <div class="row"><button class="b" id="cConn">${S.dir&&!S.perm?'Reconectar a pasta':'Conectar pasta'}</button><button class="b" id="cSave">Sincronizar</button><button class="b" id="cBk">Backup agora</button>${S.test?'<button class="b" id="cSairT">Sair do modo de teste</button>':'<button class="b" id="cTeste">Ver com dados de demonstração</button>'}</div>
  <p class="small muted mt">Só esta página grava em ${esc(PAGE.baseFile)}. Paradas, ordens de serviço, ações e a ordem em produção são lidas das páginas donas (Paradas, Equipamentos, Iniciativas e Produção) e nunca copiadas para cá.</p></div>`}

function render(){topo();const nv=$('#nav');if(nv)nv.innerHTML=navHtml();const m=$('#main');const sy=scrollY;const vp=$('.l3-vp'),sl=vp?[vp.scrollLeft,vp.scrollTop]:null;
 m.innerHTML=App.tab==='pessoas'?vPessoas():App.tab==='checklists'?vChecklists():App.tab==='config'?vConfig():vMapa();const v2=$('.l3-vp');if(v2&&sl){v2.scrollLeft=sl[0];v2.scrollTop=sl[1]}scrollTo(0,sy);ligar()}
function pctDe(e){const r=$('#cv').getBoundingClientRect();return[Math.max(0,Math.min(100,+((e.clientX-r.left)/r.width*100).toFixed(2))),Math.max(0,Math.min(100,+((e.clientY-r.top)/r.height*100).toFixed(2)))]}
function ligar(){const on=(s,ev,f)=>{const e=$(s);if(e)e[ev]=f};const av=$('#avConn');if(av)av.onclick=e=>{e.preventDefault();Store.dir?Store.reconnect():Store.pick()};
 on('#fPer','onchange',e=>{App.f.per=e.target.value;if(App.f.per==='p'){const[d,a]=periodo();App.f.de=App.f.de||d;App.f.ate=App.f.ate||a}App.f.ordem='';render()});on('#fDe','onchange',e=>{App.f.de=e.target.value;render()});on('#fAte','onchange',e=>{App.f.ate=e.target.value;render()});
 on('#fTurno','onchange',e=>{App.f.turno=e.target.value;render()});on('#fOrdem','onchange',e=>{App.f.ordem=e.target.value;render()});on('#fFluxo','onchange',e=>{App.fluxo=e.target.value;render()});
 $$('[data-cam]').forEach(b=>b.onclick=()=>{App.camada=b.dataset.cam;render()});on('#cZonas','onchange',e=>{App.zonas=e.target.checked;if(!App.zonas)App.zona=null;render()});
 on('#zMais','onclick',()=>{App.zoom=Math.min(2.5,+(App.zoom+.25).toFixed(2));render()});on('#zMenos','onclick',()=>{App.zoom=Math.max(1,+(App.zoom-.25).toFixed(2));render()});on('#zLimpa','onclick',()=>{App.zona=null;render()});
 $$('[data-irp]').forEach(a=>a.onclick=e=>{e.preventDefault();App.sel=a.dataset.irp;render()});
 $$('.l3-ch .bar').forEach(b=>b.onclick=()=>{const k=b.dataset.bar;if(b.closest('#gArea')){App.zonas=true;App.zona=App.zona===k?null:k}else App.sel=k;render()});
 $$('.zona').forEach(z=>{const f=()=>{if(App.tab==='config'){App.areaSel=z.dataset.zona}else App.zona=App.zona===z.dataset.zona?null:z.dataset.zona;render()};z.onclick=f;z.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();f()}}});
 /* pinos e postos: clique seleciona; no modo de edição, arrastar grava a posição */
 const arrastar=(el,salvar)=>{el.onpointerdown=e=>{if(!App.edit)return;e.preventDefault();el.setPointerCapture(e.pointerId);let xy=null;el.onpointermove=ev=>{xy=pctDe(ev);el.style.left=xy[0]+'%';el.style.top=xy[1]+'%'};el.onpointerup=()=>{el.onpointermove=el.onpointerup=null;if(xy)salvar(xy)}}};
 $$('[data-pin]').forEach(b=>{b.onclick=()=>{if(App.edit)return;App.sel=b.dataset.pin;if(App.tab==='mapa')render()};arrastar(b,xy=>{const p=P(b.dataset.pin);Store.commit({k:'ponto',it:{id:p.id,x:xy[0],y:xy[1]}},{silencio:true});toast(`Ponto ${p.id} movido`)})});
 $$('button[data-posto]').forEach(b=>{b.onclick=()=>{if(App.edit)return;App.posto=b.dataset.posto;render()};arrastar(b,xy=>{Store.commit({k:'posto',it:{id:b.dataset.posto,x:xy[0],y:xy[1]}},{silencio:true});toast(`Posto ${b.dataset.posto} movido`)})});
 $$('tr[data-posto]').forEach(r=>r.onclick=()=>{App.posto=r.dataset.posto;render()});
 const fp=$('#fPosto');if(fp)fp.onsubmit=e=>{e.preventDefault();const f=new FormData(fp),p=postos().find(x=>x.id===App.posto),pes={};for(const t of turnos())pes[t.codigo]=String(f.get('t_'+t.codigo)||'').trim();
  Store.commit({k:'posto',it:{id:p.id,pessoas:pes,area:String(f.get('area')||'').trim(),ponto:String(f.get('ponto')||'')||null,nota:String(f.get('nota')||'').trim()}});toast('Posto salvo')};
 on('#ckTurno','onchange',e=>{App.chkTurno=e.target.value;render()});
 $$('[data-feito]').forEach(b=>b.onclick=()=>{const c=Store.data.checklists.find(x=>x.id===b.dataset.feito),h=hoje(),tn=App.chkTurno||turnoAgora();Store.commit({k:'feito',it:{id:c.id+'|'+(c.frequencia==='semana'?semanaDe(h):h)+'|'+(c.frequencia==='turno'?tn:''),checklist:c.id,dia:h,turno:tn,por:user()||'',em:new Date().toISOString()}})});
 $$('[data-desf]').forEach(b=>b.onclick=()=>{if(confirm('Desfazer a marcação deste checklist?'))Store.commit({k:'desfeito',id:b.dataset.desf})});
 const fc=$('#fChk');if(fc){fc.onsubmit=e=>{e.preventDefault();const f=new FormData(fc),id=String(f.get('id')||'')||uid('CK');Store.commit({k:'chk',it:{id,titulo:String(f.get('titulo')).trim(),ponto:String(f.get('ponto')||'')||null,posto:String(f.get('posto')||'')||null,frequencia:String(f.get('frequencia')||'turno'),ativo:true}});toast('Checklist salvo')};
  $$('[data-chked]').forEach(b=>b.onclick=()=>{const c=Store.data.checklists.find(x=>x.id===b.dataset.chked);if(!c)return;fc.id.value=c.id;fc.titulo.value=c.titulo;fc.ponto.value=c.ponto||'';fc.posto.value=c.posto||'';fc.frequencia.value=c.frequencia||'turno';$('#chkSalvar').textContent='Salvar alteração';$('#chkDesativar').hidden=false;fc.scrollIntoView({block:'center'});fc.titulo.focus()});
  on('#chkDesativar','onclick',()=>{const id=fc.id.value;if(id&&confirm('Desativar este checklist? O histórico continua guardado.'))Store.commit({k:'chk',it:{id,ativo:false}})});on('#chkLimpar','onclick',()=>{fc.id.value='';$('#chkSalvar').textContent='Adicionar checklist';$('#chkDesativar').hidden=true})}
 /* configuração */
 on('#cfEdit','onclick',()=>{App.edit=!App.edit;App.desenho=null;render()});on('#cfArea','onchange',e=>{App.areaSel=e.target.value;render()});
 on('#cfDes','onclick',()=>{App.desenho={id:(areas().find(x=>x.id===App.areaSel)||areas()[0]).id,pts:[]};App.edit=false;render()});on('#cfDesCanc','onclick',()=>{App.desenho=null;render()});on('#cfDesVolta','onclick',()=>{App.desenho.pts.pop();render()});
 on('#cfDesFim','onclick',()=>{const d=App.desenho;if(d.pts.length<3)return toast('Marque pelo menos 3 cantos',1);Store.commit({k:'area',it:{id:d.id,pol:d.pts.map(q=>q.join(',')).join(' ')}});App.desenho=null;toast('Área redesenhada');render()});
 on('#cfAreaNova','onclick',()=>{const n=(prompt('Nome da nova área:')||'').trim();if(!n)return;const id=uid('ar');Store.commit({k:'area',it:{id,nome:n.slice(0,60),pts:[],pol:''}},{silencio:true});App.areaSel=id;App.desenho={id,pts:[]};render();toast('Marque os cantos da área na planta')});
 const cv=$('#cv');if(cv&&App.desenho)cv.onclick=e=>{if(e.target.closest('[data-pin],[data-posto]'))return;App.desenho.pts.push(pctDe(e));render()};
 const fa=$('#fArea');if(fa){fa.onsubmit=e=>{e.preventDefault();const a=areas().find(x=>x.id===App.areaSel)||areas()[0];Store.commit({k:'area',it:{id:a.id,nome:String(new FormData(fa).get('nome')).trim(),pts:$$('input[name=pt]:checked',fa).map(i=>i.value)}});toast('Área salva')};
  on('#cfAreaDes','onclick',()=>{const a=areas().find(x=>x.id===App.areaSel)||areas()[0];if(confirm(`Desativar a área "${a.nome}"? Ela some da planta; nada é apagado.`)){App.areaSel=null;Store.commit({k:'area',it:{id:a.id,ativo:false}})}})}
 $$('[data-ptsalvar]').forEach(b=>b.onclick=()=>{const tr=b.closest('tr'),id=tr.dataset.pt;Store.commit({k:'ponto',it:{id,nome:$('[data-c=nome]',tr).value.trim()||P(id).nome,fluxo:$('[data-c=fluxo]',tr).value,equipamentos:$$('[data-eq]:checked',tr).map(i=>i.value)}});toast(`Ponto ${id} salvo`)});
 const cc=$('#cConn');if(cc)cc.onclick=()=>Store.dir&&!Store.perm?Store.reconnect():Store.pick();on('#cSave','onclick',async()=>{await Store.reload();await Store.save();render();toast('Sincronizado')});on('#cBk','onclick',()=>Store.backupAgora());
 on('#cTeste','onclick',()=>enterTest());on('#cSairT','onclick',()=>{location.hash='';location.reload()})}

/* ---------- modo de teste (dados fictícios; nada é gravado) ---------- */
function enterTest(){Store.test=true;Store.queue=[];const h=hoje(),D=completar(vazio()),iso=d=>new Date(Date.now()-d*864e5).toISOString();
 const c=(typeof vacCad==='function'&&vacCad())||{};if(!(c.equipamentos||[]).length){c.equipamentos=[['EQ01','Tullip A'],['EQ02','Tullip B'],['EQ03','Gel dispensor'],['EQ04','Metro'],['EQ05','Evacuator'],['EQ06','Cap Placer'],['EQ07','Packout'],['EQ08','Silica spray coater'],['EQ09','Kallfass'],['EQ10','Tray Loader'],['EQ12','Etiquetagem']].map(([codigo,nome])=>({codigo,nome,ativo:true}));try{localStorage.setItem('vac.cadastros',JSON.stringify(c))}catch(e){}}
 D.postos=[{id:'OP1-A',pessoas:{T1:'R. Nunes (TESTE)',T2:'J. Lima (TESTE)'}},{id:'OP2-A',pessoas:{T1:'A. Souza (TESTE)'}},{id:'OP3-C',pessoas:{T1:'M. Reis (TESTE)',T2:'P. Costa (TESTE)'}}];
 D.checklists=[{id:'CK-T-1',titulo:'Conferir nível de gel antes da partida',ponto:'2',posto:'OP3-E',frequencia:'turno',ativo:true},{id:'CK-T-2',titulo:'Limpeza do sensor de presença do Tray Loader',ponto:'1',posto:'OP1-A',frequencia:'dia',ativo:true},{id:'CK-T-3',titulo:'Inspeção das guias da Tullip A',ponto:'10',posto:'OP2-A',frequencia:'semana',ativo:true}];
 D.feitos=[{id:'CK-T-2|'+h+'|',checklist:'CK-T-2',dia:h,turno:'T1',por:'R. Nunes (TESTE)',em:iso(.1)}];D.rev=1;Store.data=D;
 const E=['EQ03','EQ01','EQ04','EQ05','EQ09','EQ10','EQ02','EQ06','EQ07','EQ12','EQ08'],ev=[];for(let i=0;i<150;i++){const eq=E[(i*i+i)%E.length%(3+i%9)]||E[0];ev.push({id:'T-EV-'+i,dia:addDias(h,-(i%30)),turno:'T'+(1+i%3),inicio:String(6+i%16).padStart(2,'0')+':'+String((i*7)%60).padStart(2,'0'),equipamento:eq,codigo:['FME','AJP','FEL','MIC'][i%4],classe:i%4===0?'quebra':'operacional',descricao:['Falha mecânica','Ajuste de processo','Falha elétrica','Microparada'][i%4],minutos:4+(i*13)%55,ocorrencias:1,ordem:String(100234560+(i%30>14?1:i%30>6?2:3))})}
 Ext.par={exportsVersion:1,eventos:ev,eventosCobertura:{de:addDias(h,-30),ate:h}};
 Ext.oee={exportsVersion:1,ordens:[{ordem:'100234563',lote:'6275190',catalogo:'360060',inicioReal:addDias(h,-6)+'T06:00'},{ordem:'100234562',lote:'6275189',catalogo:'367861',inicioReal:addDias(h,-14)+'T06:00'},{ordem:'100234561',lote:'6275188',catalogo:'360060',inicioReal:addDias(h,-29)+'T06:00'}]};
 Ext.equip={exportsVersion:1,os:[{id:'OS-T-0091',equipamento:'EQ03',titulo:'Trocar mola do batente',status:'aberta',programadaPara:addDias(h,-1)},{id:'OS-T-0088',equipamento:'EQ01',titulo:'Folga na guia de etiquetas',status:'programada',programadaPara:addDias(h,2)},{id:'OS-T-0070',equipamento:'EQ09',titulo:'Sensor sujo',status:'concluída'}]};
 Ext.inic={exportsVersion:1,acoes:[{id:'AC-T-0147',titulo:'Ajustar alimentação do gel',status:'em andamento',responsavel:'Ana Líder (TESTE)',prazo:addDias(h,3),vinculos:[{tipo:'equipamento',cod:'EQ03'}]},{id:'AC-T-0152',titulo:'Proteção solta na saída da Kallfass',status:'a fazer',responsavel:'P. Costa (TESTE)',prazo:addDias(h,-2),atrasada:true,vinculos:[{tipo:'equipamento',cod:'EQ09'}]},{id:'AC-T-0160',titulo:'Padronizar partida do Tray Loader',status:'a fazer',responsavel:'',prazo:addDias(h,9),vinculos:[{tipo:'ponto',cod:'1'}]}]};
 Ext.erros={};App.sel='2';
 if(!$('.testbar'))document.body.insertAdjacentHTML('afterbegin','<div class="testbar">Modo de teste · dados fictícios · nada é gravado · <a href="#" id="tbSair">sair</a></div>');$('#tbSair').onclick=e=>{e.preventDefault();location.hash='';location.reload()};render()}

/* ---------- rotas: #aba=, #ponto=, #teste ---------- */
function rota(){const h=location.hash.slice(1);if(!h)return;const i=h.indexOf('='),k=i<0?h:h.slice(0,i);let v=i<0?'':h.slice(i+1);try{v=decodeURIComponent(v)}catch(e){}
 if(k==='teste')return enterTest();if(k==='aba'&&ABAS.some(a=>a[0]===v)){App.tab=v;return render()}
 if(k==='ponto'&&P(v)){App.tab='mapa';App.sel=String(v);history.replaceState(history.state,'','#aba=mapa');return render()}}
window.addEventListener('hashchange',rota);
PAGE.busca=q=>{const k=norm(q),R=[];for(const p of pontos())if(norm(p.id+' '+p.nome+' '+eqDoPonto(p).lista.map(c=>c+' '+eqNome(c)).join(' ')).includes(k))R.push({tipo:'Ponto da linha',txt:p.id+' · '+p.nome,sub:'Linha 360° · planta',go:()=>{App.sel=p.id;ir('mapa')}});
 for(const p of postos())if(norm(p.id+' '+(p.area||'')+' '+Object.values(p.pessoas||{}).join(' ')).includes(k))R.push({tipo:'Posto',txt:p.id+' · '+(p.area||''),sub:Object.values(p.pessoas||{}).filter(Boolean).join(', ')||'sem pessoa',go:()=>{App.posto=p.id;ir('pessoas')}});return R.slice(0,20)};
function vacAoTrocarUsuario(){render()}
function vacGuiaAba(){return App.tab}
(async()=>{applyTheme();Logo.apply();wireCabecalho();renderSysNav();$('#btnTheme').onclick=cycleTheme;$('#appVer').textContent='v'+PAGE.versao;
 const va=document.createElement('span');va.className='vacts';va.innerHTML='<button class="b" id="btnSync" title="Reler Paradas, Produção, Equipamentos e Iniciativas e gravar pendências">Sincronizar</button><button class="b" id="btnImp" title="Imprimir ou salvar em PDF">Imprimir</button>';$('.vpage .wrap').appendChild(va);
 $('#btnSync').onclick=async()=>{if(Store.test)return toast('Modo de teste: nada a sincronizar');if(!Store.dir)return Store.pick();if(!Store.perm)return Store.reconnect();await Store.reload();await Store.save();render();toast('Sincronizado')};$('#btnImp').onclick=()=>window.print();
 window.addEventListener('storage',e=>{if(e.key==='vac.theme')applyTheme();if(e.key==='vac.cadastros')render()});
 const h0=location.hash;if(/^#aba=/.test(h0)){const t=h0.slice(5).split('&')[0];if(ABAS.some(a=>a[0]===t))App.tab=t}
 render();if(vacDemo.ativo){Store.test=true;const lerDemo=()=>{Ext.par=vacDemo.exports('paradas');Ext.oee=vacDemo.exports('oee');Ext.equip=vacDemo.exports('equip');Ext.inic=vacDemo.exports('inic');Ext.erros={};render()};
  vacDemo.registrar('linha',()=>({...Store.data,exports:calcExports(Store.data)}),d=>{Store.data=completar(d)},lerDemo);vacDemo.publicar('linha');rota();return}
 if(h0==='#teste')return enterTest();await Store.init();render();if(h0&&!/^#aba=/.test(h0))rota()})();

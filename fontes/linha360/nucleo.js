/* ===== Linha 360° · núcleo de gravação (mesmo padrão de Equipamentos/Iniciativas: fila de operações, releitura, revId, C1) ===== */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s??'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const LS_TEXTO=new Set(['vac.theme','vac.user','vac.userId','vac.perfil','vac.logo']);
const LS={get(k,d){try{const v=localStorage.getItem(k);if(v==null)return d;if(LS_TEXTO.has(k)){if(/^".*"$/s.test(v)){try{return JSON.parse(v)}catch(e){}}return v}return JSON.parse(v)}catch(e){return d}},
 set(k,v){try{localStorage.setItem(k,LS_TEXTO.has(k)?String(v):JSON.stringify(v))}catch(e){}},del(k){try{localStorage.removeItem(k)}catch(e){}}};
function toast(msg,err){const t=document.createElement('div');t.className='toast'+(err?' err':'');t.textContent=msg;$('#toasts').appendChild(t);setTimeout(()=>t.remove(),err?7000:3800)}
function user(){return LS.get('vac.user','')||''}
function applyTheme(){const t=LS.get('vac.theme','auto');if(t==='auto')document.documentElement.removeAttribute('data-theme');else document.documentElement.setAttribute('data-theme',t)}
function cycleTheme(){const o=['auto','light','dark'];const t=LS.get('vac.theme','auto');LS.set('vac.theme',o[(o.indexOf(t)+1)%3]);applyTheme();toast('Tema: '+({auto:'automático',light:'claro',dark:'escuro'})[LS.get('vac.theme')])}
const help=t=>`<span class="help" data-help="${esc(t)}">i</span>`;
document.addEventListener('click',e=>{const h=e.target.closest('.help');$$('.pop').forEach(p=>p.remove());if(!h)return;e.stopPropagation();const p=document.createElement('div');p.className='pop';p.innerHTML=esc(h.dataset.help).replace(/\n/g,'<br>');document.body.appendChild(p);
 const r=h.getBoundingClientRect();p.style.left=Math.max(8,Math.min(innerWidth-350,r.left+scrollX-10))+'px';p.style.top=(r.bottom+scrollY+6)+'px'},true);
const Logo={apply(){const im=$('#brandLogo');if(!im)return;const src=LS.get('vac.logo',null)||'Logo.png';im.onload=()=>{im.hidden=false};im.onerror=()=>{im.hidden=true};im.src=src}};
const clone=o=>JSON.parse(JSON.stringify(o));
const uid=p=>(p||'')+Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const hoje=()=>typeof vacHoje==='function'?vacHoje():new Date().toISOString().slice(0,10);
const addDias=(d,n)=>{const x=new Date(d+'T12:00:00');x.setDate(x.getDate()+n);return x.toISOString().slice(0,10)};
const br=d=>{const m=/^(\d{4})-(\d{2})-(\d{2})/.exec(String(d||''));return m?`${m[3]}/${m[2]}/${m[1]}`:'—'};
const brc=d=>{const m=/^(\d{4})-(\d{2})-(\d{2})/.exec(String(d||''));return m?`${m[3]}/${m[2]}`:'—'};
const brh=iso=>{if(!iso)return'—';const d=new Date(iso);if(isNaN(d))return br(iso);const p=n=>String(n).padStart(2,'0');return`${p(d.getDate())}/${p(d.getMonth()+1)} ${p(d.getHours())}:${p(d.getMinutes())}`};
const nf=(n,d=0)=>n==null||!isFinite(n)?'—':(+n).toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d});
const dias=x=>x==null?'—':x<1?(x*24<1?'<1 h':nf(x*24)+' h'):nf(x,x<10?1:0)+' d';


/* ---------- IndexedDB (pasta escolhida, compartilhada com as outras páginas) ---------- */
const IDB={db:null,async open(){if(this.db)return this.db;return this.db=await new Promise((ok,err)=>{const r=indexedDB.open('vac-sistemas',1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onsuccess=()=>ok(r.result);r.onerror=()=>err(r.error)})},
 async get(k){const db=await this.open();return new Promise(ok=>{const t=db.transaction('kv').objectStore('kv').get(k);t.onsuccess=()=>ok(t.result);t.onerror=()=>ok(null)})},
 async set(k,v){const db=await this.open();return new Promise(ok=>{const t=db.transaction('kv','readwrite').objectStore('kv').put(v,k);t.onsuccess=()=>ok();t.onerror=()=>ok()})}};

/* ---------- Store: igual ao de Equipamentos e Iniciativas (fila de operações, releitura, conferência das confirmadas) ---------- */
const Store={origem:'',dir:null,dirName:'',perm:false,data:completar(vazio()),queue:[],fila:null,sumiu:false,saving:false,again:false,lastErr:'',readErr:'',test:false,baseFound:false,lastSaved:null,
 async init(){this.fila=vacFila('linha');const c=LS.get('linha.cache',null);if(c)this.data=completar(c);
  /* C1 · fila durável do kit (um registro por alteração no IndexedDB); se o IndexedDB falhar, a reserva em localStorage */
  const leg=await this.migrarFila();const m=await this.fila.minhas();this.confirmadasSemOrigem=(await this.fila.confirmadas()).filter(o=>!o._pasta).length;/* C1 · revisão do PR #18: a reserva (IndexedDB falhou antes) e a fila antiga que não migrou entram junto, sem repetir; a reserva só sai depois que a fila durável aceitar tudo (cache) */{const vis=new Set();this.queue=[].concat(leg||[],LS.get('linha.fila.reserva',[])||[],this.fila.reservas(),m||[]).filter(o=>{if(!o)return false;const k=o.qid||o.id;if(!k)return true;if(vis.has(k))return false;vis.add(k);return true})}this._leg=!!(leg&&leg.length);this.queue.forEach(op=>applyOp(this.data,op));
  try{const h=await IDB.get('pasta');if(h){this.dir=vacRaiz(h);this.dirName=h.name;this.perm=(await h.queryPermission({mode:'readwrite'}))==='granted'}}catch(e){}
  if(this.perm){await this.reload();if(!this.sumiu&&(this.queue.length||(this.baseFound&&!this.readErr&&diaLocal((this.data.exports||{}).geradoEm)!==hoje())))this.save()}},
 /* C1 · a fila antiga (localStorage, até a 1.0.1) entra uma vez na fila durável; a original fica em equip.fila.antiga para conferência */
 async migrarFila(){const v=LS.get('linha.fila',null),cf=LS.get('linha.conf',null);
  let leg=[];if(Array.isArray(v)){v.forEach(o=>{o.qid=o.qid||o.id});if(!await this.fila.importar(v,()=>{if(v.length)LS.set('linha.fila.antiga',v);LS.del('linha.fila')}))leg=v}
  if(Array.isArray(cf)){if(cf.length&&!await this.fila.confirmar(cf.map(o=>{const{_c,...x}=o;x.qid=x.qid||x.id;return x})))return leg;LS.del('linha.conf')}return leg},
 /* AT-02 · a última base lida nesta estação (por pasta): se ela some, nada é gravado até a pessoa decidir */
 conhecida(){const mapa=LS.get('linha.bases.conhecidas',{}),leg=LS.get('linha.base.conhecida',null);return mapa[this.origem]||((leg&&(!leg.origem?leg.pasta===this.dirName:leg.origem===this.origem))?leg:null)},
 conhecer(b){const x={rev:b.rev||0,revId:b.revId||'',pasta:this.dirName,origem:this.origem,em:new Date().toISOString()},mapa=LS.get('linha.bases.conhecidas',{});mapa[this.origem]=x;LS.set('linha.bases.conhecidas',mapa);LS.set('linha.base.conhecida',x)},
 async recriar(){if(!this.sumiu)return;const n=Object.values(this.data).filter(Array.isArray).reduce((s,L)=>s+L.length,0);
  if(!confirm(`Recriar ${PAGE.baseFile} em 00. Bases com a cópia deste navegador?\n\nA cópia tem a rev ${this.data.rev||0} (${n} registro(s), histórico incluído) e as alterações pendentes. O que outras estações gravaram depois da última leitura deste computador não está nela.`))return;
  this.dataRecriar=clone(this.data);this.dataRecriar.exports=null;this._recriar=true;this.readErr='';await this.save();render()},
 async pick(){if(!window.showDirectoryPicker){toast('Este navegador não permite acesso à pasta (use Chrome ou Edge).',1);return}
  try{const h=await showDirectoryPicker({id:'vac-sistemas',mode:'readwrite'});await this.usar(h);toast('Pasta conectada: '+h.name)}catch(e){if(e.name!=='AbortError')toast('Não foi possível abrir a pasta: '+e.message,1)}},
 async preparar(){if(!this.test&&this.dir)await vacVincularFila(this,this.dir)},
 async usar(h){await vacVincularFila(this,h);const antes={dir:this.dir,dirName:this.dirName,perm:this.perm};this.dir=vacRaiz(h);this.dirName=h.name;this.perm=true;this._bases=false;this.sumiu=false;await this.reload();
  /* AT-02 · pasta sem a base: só cria com a confirmação (como o Portal); se é a pasta onde a base existia, não oferece criar por cima */
  if(!this.readErr&&!this.baseFound&&!this.sumiu){if(!confirm(`A pasta "${h.name}" não tem 00. Bases/${PAGE.baseFile}.\n\nCriar a base nesta pasta? Só as alterações ainda pendentes deste navegador vão para a base nova.`)){Object.assign(this,antes);toast('Pasta não conectada: nada foi criado.');render();return}}
  await IDB.set('pasta',h);if(!this.readErr&&!this.sumiu)await this.save();render()},
 async reconnect(){if(!this.dir)return this.pick();try{const p=await this.dir.requestPermission({mode:'readwrite'});this.perm=p==='granted';if(this.perm){await this.reload();await this.save();render()}}catch(e){toast(e.message,1)}},
 async sub(path,create){let d=this.dir;for(const p of path.split('/').filter(Boolean))d=await d.getDirectoryHandle(p,{create:!!create});return d},
 async ler(){let f;try{f=await(await this.dir.getFileHandle(PAGE.baseFile)).getFile()}catch(e){if(vacNaoAchou(e))return null;throw e}const t=await f.text();let o;try{o=JSON.parse(t)}catch(e){throw new Error(PAGE.baseFile+' com JSON inválido')}const fm=typeof vacFormatoBase==='function'?vacFormatoBase(o,'vac-linha360',1):'';if(fm)throw new Error(fm);const v=validarBase(o);if(v.length)throw new Error('base com problema: '+v.join('; '));return o},
 async escrever(obj,dir,nome){const h=await(dir||this.dir).getFileHandle(nome||PAGE.baseFile,{create:true});const w=await h.createWritable();await w.write(JSON.stringify(obj));await w.close()},
 async reload(){if(this.test||!this.dir||!this.perm)return;
  if(!this._bases){this._bases=true;try{vacAvisoBases(await vacMoverBases(this.dir,[[PAGE.baseFile,PAGE.backupDir]]))}catch(e){console.warn('bases',e)}}
  try{await this.preparar();const r=await this.ler();this.readErr='';await this.recarga(r)}
  catch(e){this.readErr='Não consegui ler '+PAGE.baseFile+' ('+(e.message||e.name)+'). Nada será gravado até a leitura voltar; as alterações ficam pendentes neste navegador.';toast(this.readErr,1)}
  await lerExt()},
 async recarga(r){const k=this.conhecida();
  if(r){const n=await this.perdidas(r);if(n){toast(n+' alteração(ões) sua(s) que outra estação gravou por cima voltaram para a fila e serão gravadas de novo.');setTimeout(()=>this.save(),50)}
   this.sumiu=false;this.data=completar(r);this.baseFound=true;this.queue.forEach(op=>applyOp(this.data,op));this.conhecer(r);this.cache()}
  else{this.baseFound=false;this.sumiu=!!(k&&(!k.origem||k.origem===this.origem));if(this.sumiu)this.readErr=`${PAGE.baseFile} não está mais em 00. Bases (a última lida neste computador era a rev ${k.rev}, de ${brh(k.em)}). Nada será gravado: recrie a base com a cópia deste navegador ou escolha a pasta certa.`}},
 cache(){if(this.test){vacDemo.publicar('linha');return}const c=clone(this.data);c.exports=null;LS.set('linha.cache',c);
  if(this.fila){this.fila.reservar(this.queue.concat(this.outrasFilas||[]));this.fila.espelhar(this.queue.concat(this.outrasFilas||[])).then(ok=>{if(ok){LS.del('linha.fila.reserva');if(this._leg){this._leg=false;const v=LS.get('linha.fila',null);if(Array.isArray(v)){if(v.length)LS.set('linha.fila.antiga',v);LS.del('linha.fila')}}}else{topo()}})}},
 /* R-01 · operações confirmadas nas últimas 24 h (fila durável do kit) que não estão na auditoria da base: outra estação gravou por
    cima depois da nossa releitura. Voltam para a fila (as operações são idempotentes) e a página avisa. */
 async perdidas(base){if(!base||!this.fila)return 0;const todas=await this.fila.confirmadas(864e5);this.confirmadasSemOrigem=todas.filter(o=>!o._pasta).length;const C=todas.filter(o=>o._pasta&&o._pasta===this.origem);if(!C.length)return 0;const ids=new Set((base.auditoria||[]).map(a=>a.id));
  const L=C.filter(o=>!ids.has(o.id));if(!L.length)return 0;await this.fila.esquecer(L.map(o=>o.qid));const naFila=new Set(this.queue.map(o=>o.id));
  this.queue=L.filter(o=>!naFila.has(o.id)).map(({_c,...o})=>o).concat(this.queue);this.cache();return L.length},
 commit(op,{silencio}={}){op._pasta=this.origem||'';op.id=uid('op');op.qid=op.id;op.em=new Date().toISOString();op.por=user()||'';this.queue.push(op);applyOp(this.data,op);this.cache();if(!silencio)render();clearTimeout(this.t);this.t=setTimeout(()=>this.save(),600)},
 async save(){if(this.test){this.queue=[];topo();return}
  if(!this.dir||!this.perm){topo();return}
  if(this.saving){this.again=true;return}this.saving=true;topo();
  try{for(let volta=0;volta<5;volta++){
    let fresh;try{await this.preparar();fresh=await this.ler()}catch(e){throw new Error('não consegui ler a base antes de gravar ('+(e.message||e.name)+'); nada foi gravado')}
    /* AT-02 · base que já existiu nesta pasta e sumiu: nada é gravado (sem recriar vazia) até "Recriar a base" */
    if(!fresh&&!this._recriar){const k=this.conhecida();if(this.sumiu||(k&&(!k.origem||k.origem===this.origem))){this.sumiu=true;throw new Error(PAGE.baseFile+' sumiu da pasta; nada foi gravado (use "Recriar a base" ou escolha a pasta certa)')}}
    if(fresh)await this.perdidas(fresh);const n=this.queue.length;
    if(!n&&fresh&&fresh.exports&&fresh.appVersion===APP_VERSION&&diaLocal(fresh.exports.geradoEm)===hoje()){this.data=completar(fresh);this.baseFound=true;break}
    const D=completar(fresh?clone(fresh):this._recriar&&this.dataRecriar?clone(this.dataRecriar):vazio()),revAntes=D.rev||0,ops=this.queue.slice(0,n);ops.forEach(op=>applyOp(D,op));
    ops.forEach(op=>D.auditoria.push({em:op.em,por:op.por,k:op.k,id:op.id,ref:(op.it&&(op.it.id||op.it.codigo))||op.ac||op.cod||''}));if(D.auditoria.length>5000)D.auditoria=D.auditoria.slice(-5000);
    if(fresh)await this.backupDiario(fresh);
    D.rev=revAntes+1;D.revBy=user()||'?';D.revAt=new Date().toISOString();D.revId=uid('r');D.appVersion=APP_VERSION;
    try{D.exports=calcExports(D)}catch(e){console.warn('exports',e)}
    await this.escrever(D);
    let chk=null;try{chk=await this.ler()}catch(e){}
    if(!chk||chk.revId!==D.revId)continue;
    if(this.fila)this.fila.confirmar(ops);const feitas=new Set(ops.map(o=>o.qid||o.id));this.queue=this.queue.filter(o=>!feitas.has(o.qid||o.id));if(this._recriar){this._recriar=false;this.dataRecriar=null;toast('Base recriada em 00. Bases com a cópia deste navegador.')}this.sumiu=false;this.conhecer(D);this.data=D;this.queue.forEach(op=>applyOp(this.data,op));this.baseFound=true;this.lastSaved=new Date();this.lastErr='';this.readErr='';this.cache();
    if(!this.queue.length&&!this.again)break;this.again=false}
   if(this.queue.length&&!this.again)this.lastErr='a gravação não foi confirmada depois de 5 tentativas; as alterações continuam pendentes neste navegador';
  }catch(e){this.lastErr=e.message;toast('Gravação pendente: '+e.message,1)}finally{this.saving=false;topo();if(this.again){this.again=false;setTimeout(()=>this.save(),200)}}},
 async backupDiario(obj){try{const d=await this.sub(PAGE.backupDir,true);const nm=bkNome('diario');try{await d.getFileHandle(nm)}catch(e){if(!vacNaoAchou(e))throw e;await this.escrever(obj,d,nm)}}catch(e){console.warn('backup',e)}},
 async backupAgora(){if(this.test)return toast('Modo de teste: sem backup');if(!this.dir||!this.perm)return toast('Conecte a pasta para criar backup',1);
  let r;try{r=await this.ler()}catch(e){return toast('Não consegui ler a base: '+e.message,1)}if(!r)return toast('Ainda não existe base gravada');const d=await this.sub(PAGE.backupDir,true);const nm=bkNome('botao');await this.escrever(r,d,nm);toast('Backup criado: '+PAGE.backupDir+'/'+nm)}};
/* dia local de um ISO (o exports guarda UTC) */
const diaLocal=iso=>{const d=new Date(iso||'');return isNaN(d)?'':`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
function bkNome(t){const d=new Date(),p=n=>String(n).padStart(2,'0');return`linha360-base_${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}${t==='diario'?'':'_'+p(d.getHours())+'h'+p(d.getMinutes())+'m'+p(d.getSeconds())+'s_'+t}.json`}
function vacPastaAtual(){return Store.perm&&!Store.test?Store.dir:null}
/* AT-04 · aba aberta na virada do dia: ao voltar, relê e, se o resumo (exports) é de outro dia, grava de novo (mesma regra do init) */
function vacAoVoltar(){if(Store.test||!Store.perm)return;Store.reload().then(()=>{const S=Store;if(!S.sumiu&&!S.saving&&S.baseFound&&!S.readErr&&(S.queue.length||diaLocal((S.data.exports||{}).geradoEm)!==hoje()))S.save();render()})}

function topo(){const el=$('#stBase');if(!el)return;const S=Store,n=S.queue.length;let h='';
 if(S.test)h='<span class="pill" style="--tc:var(--hold)">modo de teste · nada é gravado</span>';
 else if(!S.dir)h='<span class="pill warn">só neste navegador</span> <button class="b sm" id="tConn">Conectar pasta</button>';
 else if(!S.perm)h=`<span class="pill warn">pasta ${esc(S.dirName)} sem permissão</span> <button class="b sm" id="tConn">Reconectar</button>`;
 else h=`<span>pasta <b>${esc(S.dirName)}</b> · rev ${S.data.rev||0}</span>${S.saving?' <span class="pill info">gravando…</span>':n?` <span class="pill warn">${n} alteração(ões) pendente(s)</span>`:S.lastSaved?` <span class="small">gravado ${brh(S.lastSaved.toISOString())}</span>`:''}`;
 if(S.sumiu)h+=` <span class="pill crit" title="${esc(S.readErr)}">base sumiu da pasta</span> <button class="b sm" id="tRecriar">Recriar a base</button> <button class="b sm" id="tOutra">Escolher outra pasta</button>`;
 else if(S.readErr||S.lastErr)h+=` <span class="pill crit" title="${esc(S.readErr||S.lastErr)}">${S.readErr?'erro de leitura':'gravação pendente'}</span> ${S.dir&&S.perm?'<button class="b sm" id="tRetry">Gravar de novo</button>':''}`;
 if(S.fila&&S.fila.erro)h+=` <span class="pill crit" title="${esc(S.fila.erro)}">alterações não protegidas</span>`;
 h+=vacRecuperacaoBotao(S);el.innerHTML=h;const c=$('#tConn');if(c)c.onclick=()=>S.dir?S.reconnect():S.pick();const r=$('#tRetry');if(r)r.onclick=async()=>{await S.reload();await S.save();render()};const rc=$('#tRecriar');if(rc)rc.onclick=()=>S.recriar();const ou=$('#tOutra');if(ou)ou.onclick=()=>S.pick()}

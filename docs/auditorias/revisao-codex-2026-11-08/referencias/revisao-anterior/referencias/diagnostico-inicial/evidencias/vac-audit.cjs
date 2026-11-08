const {chromium}=require('playwright');
const fs=require('fs');
(async()=>{
 const browser=await chromium.launch();
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 const page=async name=>{const p=await context.newPage();p.on('dialog',d=>d.accept());await p.goto('file:///workspace/vacutainer/paginas/'+encodeURI(name));await p.waitForTimeout(800);return p;};
 const out={commit:'e0435136359847e07a2a775a1d7eea31371495b8',data:new Date().toISOString(),ambiente:'Chromium do sistema via HTTP local; dados sintéticos; sem pasta real'};
 const o=await page('OEE-Vacutainer.html');
 out.ordensErroLeitura=await o.evaluate(async()=>{
  let text=JSON.stringify({schema:'vac-ordens',rev:20,revId:'remoto',competencias:{'2026-09':{marca:'remoto setembro'},'2026-10':{marca:'outra pessoa outubro'}},auditoria:[]});let writes=0,reads=0;
  const dir={name:'simulada',__vacRaiz:true,async getFileHandle(name,opts){if(!opts?.create){reads++;throw Object.assign(new Error('rede temporariamente indisponível'),{name:'NotReadableError'});}return{async createWritable(){return{async write(t){text=t;writes++;},async close(){}};}};}};
  Store.S.mode='pasta';Store.S.backend=FolderBackend(dir);Ord.B={schema:'vac-ordens',schemaVersion:1,rev:19,revId:'local',competencias:{'2026-09':{marca:'minha setembro'}},auditoria:[]};Ord.audPend=[];
  let error=null;try{await Ord.gravar('2026-09','importação');}catch(e){error=e.message;}
  const saved=JSON.parse(text);Store.S.mode='local';Store.S.backend=null;
  return{reads,writes,error,competenciasFinais:Object.keys(saved.competencias),outubroRemotoPreservado:!!saved.competencias['2026-10'],rev:saved.rev};
 });
 out.ordensConfirmacao=await o.evaluate(async()=>{
  let reads=0,after=null;const base={schema:'vac-ordens',schemaVersion:1,rev:1,revId:'base',competencias:{'2026-09':{marca:'minha'}},auditoria:[]};let remote=JSON.stringify(base);
  Store.S.mode='pasta';Store.S.backend={async readSibling(){reads++;return remote;},async backupSub(){},async writeSibling(n,t){after=JSON.parse(t);remote=JSON.stringify({...after,revId:'outra-sessao',competencias:{'2026-09':{marca:'outro'}}});}};Ord.B=structuredClone(base);Ord.audPend=[{acao:'teste'}];
  let error=null;try{await Ord.gravar('2026-09','importação');}catch(e){error=e.message;}
  const result={reads,error,audPend:Ord.audPend.length,localRevId:Ord.B.revId,remoteRevId:JSON.parse(remote).revId,remoteMarca:JSON.parse(remote).competencias['2026-09'].marca};Store.S.mode='local';Store.S.backend=null;return result;
 });
 out.backupLegado=await o.evaluate(async()=>{
  const paths=[];const file=t=>({async getFile(){return{async text(){return t;}};}});
  const sub={async getFileHandle(n){paths.push('00. Backups/OEE/'+n);throw Object.assign(new Error('não encontrado'),{name:'NotFoundError'});}};
  const rootbk={async getFileHandle(n){paths.push('00. Backups/'+n);return file('BACKUP LEGADO');},async getDirectoryHandle(){return sub;}};
  const dir={__vacRaiz:true,name:'simulada',async getDirectoryHandle(){return rootbk;}};
  let text=null,error=null;try{text=await FolderBackend(dir).readBackup('oee-vacutainer-base_antigo.json',true);}catch(e){error=e.name;}
  return{paths,text,error};
 });
 const w=await page('Perdas-Ordem.html');
 out.exportsIncompativel=await w.evaluate(async()=>{
  const ex={exportsVersion:99,ordens:[{ordem:'110834720',lote:'6279776',catalogo:'360060',qtd:123456}],porOrdem:[{ordem:'110834720',coois:{tipo:'Z999'},saldos:[{um:'KG'}],materiais:['X']}]};
  OEE.src={exports:ex};const f=oeeFind('110834720');
  ST.mode='pasta';ST.dir={async getFileHandle(){return{async getFile(){return{lastModified:77,async text(){return JSON.stringify({exports:ex});}};}};}};await loadOrdens(true);const ord=ordX('110834720');ST.mode='local';ST.dir=null;
  return{exportVersion:99,oeeAceito:!!f?.hits.length,catalogo:f?.cat,ordensAceitas:!!ord,tipo:ord?.tipo};
 });
 out.diasLote=await w.evaluate(()=>{
  OEE.src={exports:{exportsVersion:1,ordens:[{ordem:'110834720',lote:'6279776'}]},server:{dayLot:{'2026-11-03|6279776':{kind:'retrabalho',by:'teste'},'2026-11-04|6279776':{kind:'normal',by:'teste'}}}};
  const f=oeeFind('110834720');return{lote:f.lote,diasNaFonte:Object.keys(OEE.src.server.dayLot),diasEncontrados:f.lotHits.filter(h=>h.path.includes('dias do lote'))};
 });
 out.ordemMultiplasCompetencias=await w.evaluate(async()=>{
  const ex={exportsVersion:1,porOrdem:[{ordem:'110834720',competencia:'2026-10',coois:{tipo:'ZP01'},saldos:[{um:'UN',qtd:1000}],materiais:['360060']},{ordem:'110834720',competencia:'2026-11',coois:null,saldos:[{um:'UN',qtd:2000}],materiais:['360060']}]};
  ST.mode='pasta';ST.dir={async getFileHandle(){return{async getFile(){return{lastModified:78,async text(){return JSON.stringify({exports:ex});}};}};}};await loadOrdens(true);const r={linhasFonte:ex.porOrdem.length,tipoFonte:ex.porOrdem[0].coois.tipo,tipoLido:tipoOrdDe('110834720'),indice:ordX('110834720')};ST.mode='local';ST.dir=null;return r;
 });
 out.metaHistorica=await w.evaluate(()=>{
  localStorage.setItem('vac.cadastros',JSON.stringify({schema:'vac-cadastros',metasArea:[{codigo:'WASTE-MES',ativo:true,vigencias:[{de:'2026-01-01',ate:'2026-10-31',valor:10000},{de:'2026-11-01',ate:null,valor:20000}]}]}));
  _pc.t=0; // força releitura da cópia do Portal
  return{consulta:'2026-10',esperada:vacMetaArea('WASTE-MES','2026-10-31')?.valor,usadaNoCFG:CFG().meta};
 });
 out.linksContextuais=await w.evaluate(()=>{
  ST.mode='pasta';GEL.src={exports:{exportsVersion:1,ordens:[{ordem:'110834720',lote:'6279776',consumoKg:42,scrapKg:1,lps:['40194830745']}]}};
  OEE.src={exports:{exportsVersion:1,ordens:[{ordem:'110834720',lote:'6279776',inicioReal:'2026-11-03T08:00',qtd:1000}]}};
  const gel=document.createElement('div');gel.innerHTML=gelBlock('110834720');const prod=document.createElement('div');prod.innerHTML=oeeBlock('110834720');
  return{lp:[...gel.querySelectorAll('a')].map(a=>({texto:a.textContent,href:a.getAttribute('href')})),oee:[...prod.querySelectorAll('a')].map(a=>a.getAttribute('href'))};
 });
 out.versaoWaste=await w.evaluate(()=>({APP_VER,PAGE:PAGE.versao,rotulo:document.querySelector('#appVer').textContent,base:emptyBase().appVersion}));
 const g=await page('Gestão-Gel-Vacutainer.html');out.versaoGel=await g.evaluate(()=>({APP_VERSION,PAGE:PAGE.versao,rotulo:document.querySelector('#appVer').textContent}));
 fs.writeFileSync('/tmp/vac-audit-evidencias.json',JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});

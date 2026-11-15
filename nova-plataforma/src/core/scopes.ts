import {dbGet,dbSet,type Directory} from './data';
export type Scope={handle:Directory;scope:string};
export async function scopeFor(handle:Directory,records:Scope[]){
 for(const entry of records)if(await handle.isSameEntry!(entry.handle))return entry.scope;
 const scope=crypto.randomUUID();records.push({handle,scope});return scope;
}
export async function rememberFolder(handle:Directory){
 const records:Scope[]=await dbGet('scopes')||[];
 // Importa a identidade criada pela primeira plataforma, sem perder sua fila.
 if(!records.length){const old=await dbGet('folder'),scope=await dbGet('scope');if(old&&scope)records.push({handle:old,scope})}
 const scope=await scopeFor(handle,records);await dbSet('scopes',records);await dbSet('folder',handle);await dbSet('scope',scope);return scope;
}
async function pendingRecords(scope:string){
 const prefix='vac.app.'+scope+'.',records:any[]=[];
 for(const info of await indexedDB.databases()){
  if(!info.name?.startsWith(prefix))continue;
  const db=await new Promise<IDBDatabase>((ok,no)=>{const r=indexedDB.open(info.name!);r.onupgradeneeded=()=>r.transaction?.abort();r.onblocked=()=>no(new Error('Banco bloqueado'));r.onerror=()=>no(r.error);r.onsuccess=()=>ok(r.result)});
  try{for(const store of [...db.objectStoreNames]){
   if(store!=='ops'&&store!=='kv')continue;
   const keys=store==='ops'?[null]:['pending','cadFila','fsPending.reserva'];
   for(const key of keys){const value=await new Promise<any>((ok,no)=>{const tx=db.transaction(store);const req=key===null?tx.objectStore(store).getAll():tx.objectStore(store).get(key);req.onsuccess=()=>ok(req.result);req.onerror=()=>no(req.error)});if(Array.isArray(value))records.push(...value);else if(value)records.push(value)}
  }}finally{db.close()}
 }
 return records;
}
export async function queuePending(scope:string,storage:Storage=localStorage,read=pendingRecords){
 try{
  const prefix='vac.app.'+scope+'.';
  for(let i=0;i<storage.length;i++){const key=storage.key(i);if(!key?.startsWith(prefix))continue;const name=key.slice(prefix.length);
   if(name.startsWith('vac.reserva.'))return true;
   if(/\.fila\.reserva$/.test(name)&&JSON.parse(storage.getItem(key)||'[]').length)return true;
   if(name.startsWith('vac.aba.')){const value=JSON.parse(storage.getItem(key)||'{}');if(value.pend&&Date.now()-(+value.t||0)<20000)return true}
  }
  return(await read(scope)).some(v=>!!v&&(!!v.db||v.p!==false));
 }catch{return true}
}

/* Diagnóstico da troca de pasta (15/11/2026): diz o que está guardado e onde, em vez de só bloquear.
   Os registros continuam no navegador, ligados ao escopo desta pasta; voltam quando a mesma pasta é conectada de novo. */
export type QueueItem={origem:string;quantidade:number;modulo?:string};
const NOMES:Record<string,string>={'vac-fila':'alterações na fila'};
async function pendingByDatabase(scope:string){
 const prefix='vac.app.'+scope+'.',out:QueueItem[]=[];
 for(const info of await indexedDB.databases()){
  if(!info.name?.startsWith(prefix))continue;
  const records=(await pendingRecordsOf(info.name)).filter(v=>!!v&&(!!v.db||v.p!==false)),banco=info.name.slice(prefix.length),origem=NOMES[banco]||'guardado em '+banco;
  const porModulo=new Map<string,number>();for(const r of records){const m=typeof r.pagina==='string'?r.pagina:'';porModulo.set(m,(porModulo.get(m)||0)+1)}
  for(const [m,n] of porModulo)out.push({origem,quantidade:n,...(m?{modulo:m}:{})});
 }
 return out;
}
async function pendingRecordsOf(name:string){
 const records:any[]=[];
 const db=await new Promise<IDBDatabase>((ok,no)=>{const r=indexedDB.open(name);r.onupgradeneeded=()=>r.transaction?.abort();r.onblocked=()=>no(new Error('Banco bloqueado'));r.onerror=()=>no(r.error);r.onsuccess=()=>ok(r.result)});
 try{for(const store of [...db.objectStoreNames]){
  if(store!=='ops'&&store!=='kv')continue;
  for(const key of store==='ops'?[null]:['pending','cadFila','fsPending.reserva']){const value=await new Promise<any>((ok,no)=>{const tx=db.transaction(store);const req=key===null?tx.objectStore(store).getAll():tx.objectStore(store).get(key);req.onsuccess=()=>ok(req.result);req.onerror=()=>no(req.error)});if(Array.isArray(value))records.push(...value);else if(value)records.push(value)}
 }}finally{db.close()}
 return records;
}
export async function queueDetail(scope:string,storage:Storage=localStorage,read:(scope:string)=>Promise<QueueItem[]>=pendingByDatabase):Promise<{itens:QueueItem[];erro?:string}>{
 const itens:QueueItem[]=[],prefix='vac.app.'+scope+'.';
 try{
  let reservas=0,filas=0,abas=0;
  for(let i=0;i<storage.length;i++){const key=storage.key(i);if(!key?.startsWith(prefix))continue;const name=key.slice(prefix.length);
   if(name.startsWith('vac.reserva.'))reservas++;
   else if(/\.fila\.reserva$/.test(name))filas+=JSON.parse(storage.getItem(key)||'[]').length;
   else if(name.startsWith('vac.aba.')){const v=JSON.parse(storage.getItem(key)||'{}');if(v.pend&&Date.now()-(+v.t||0)<20000)abas++}
  }
  if(reservas)itens.push({origem:'reservas de gravação',quantidade:reservas});
  if(filas)itens.push({origem:'operações reservadas',quantidade:filas});
  if(abas)itens.push({origem:'outra aba com alteração pendente',quantidade:abas});
  itens.push(...await read(scope));
  return{itens};
 }catch(e){return{itens,erro:(e as Error).message||'falha ao consultar a fila'}}
}

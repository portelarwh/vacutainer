import {z} from 'zod';import {FILES,type ModuleId} from './modules';
export type Json=Record<string,any>;
export type Source={id:ModuleId;state:'ok'|'ausente'|'erro'|'incompativel';exports?:Json;updated?:string;message?:string;revision?:number};
const Exports=z.object({exportsVersion:z.number().int().positive().optional()}).passthrough();
export function sourceFrom(id:ModuleId,input:unknown):Source{
 if(!input||typeof input!=='object'||Array.isArray(input))return{id,state:'erro',message:'A base não é um objeto JSON.'};
 const b=input as Json,v=Exports.safeParse(b.exports);if(!v.success)return{id,state:'incompativel',message:'Esta base não publica um resumo compatível.'};
 if(v.data.exportsVersion!=null&&v.data.exportsVersion!==1)return{id,state:'incompativel',message:'Versão de exports não suportada: '+v.data.exportsVersion};
 const ex=v.data as Json;
 const rowSchema=z.object({dia:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),turno:z.string().optional(),boa:z.number().finite().nonnegative().nullable().optional(),scrap:z.number().finite().nonnegative().nullable().optional(),oee:z.number().finite().nullable().optional()}).passthrough();
 for(const k of ['porDia','porDiaTurno'])if(ex[k]!=null&&!z.array(rowSchema).safeParse(ex[k]).success)return{id,state:'incompativel',message:'Resumo com datas ou quantidades inválidas em '+k+'.'};
 if(ex.kpis!=null&&!z.array(z.array(z.union([z.string(),z.number().finite(),z.boolean(),z.null()])).min(2)).safeParse(ex.kpis).success)return{id,state:'incompativel',message:'Lista de indicadores inválida.'};
 if(ex.pendencias!=null&&!z.array(z.object({txt:z.string(),sev:z.number().optional()}).passthrough()).safeParse(ex.pendencias).success)return{id,state:'incompativel',message:'Lista de pendências inválida.'};
 const expected:Partial<Record<ModuleId,string[]>>={oee:['porDia','porMes'],perdas:['porMes'],inic:['acoes']};
 if((expected[id]||[]).some(k=>!z.array(z.record(z.unknown())).safeParse(ex[k]).success))return{id,state:'incompativel',message:'Resumo sem as listas esperadas para este módulo.'};
 return{id,state:'ok',exports:ex,updated:b.updatedAt||b.lastModifiedAt||b.revAt||ex.geradoEm||ex.generatedAt,revision:b.rev??b.databaseVersion};
}
export interface Directory {name:string;getDirectoryHandle(name:string,options?:{create?:boolean}):Promise<Directory>;getFileHandle(name:string):Promise<{getFile():Promise<File>}>;queryPermission?(options:{mode:string}):Promise<string>;requestPermission?(options:{mode:string}):Promise<string>}
export async function readSources(root:Directory):Promise<{sources:Source[];cad:Json|null}>{
 let dir:Directory;try{dir=await root.getDirectoryHandle('00. Bases')}catch(e){if((e as Error).name!=='NotFoundError')throw e;dir=root}
 const sources=await Promise.all(Object.entries(FILES).filter(([id])=>id!=='projetos').map(async([key,file])=>{const id=key as ModuleId;try{const f=await(await dir.getFileHandle(file)).getFile();return sourceFrom(id,JSON.parse(await f.text()))}catch(e){return{id,state:(e as Error).name==='NotFoundError'?'ausente':'erro',message:(e as Error).name==='NotFoundError'?'Base não encontrada.':String((e as Error).message)} as Source}}));
 let cad:Json|null=null;try{const c=JSON.parse(await(await(await dir.getFileHandle('vacutainer-cadastros.json')).getFile()).text());if(!z.object({schema:z.literal('vac-cadastros'),rev:z.number().int().nonnegative().optional(),usuarios:z.array(z.object({codigo:z.string(),nome:z.string()}).passthrough()).optional(),turnos:z.array(z.object({codigo:z.string()}).passthrough()).optional(),perfis:z.array(z.object({codigo:z.string()}).passthrough()).optional()}).passthrough().safeParse(c).success)throw new Error('Cadastro com formato desconhecido ou listas inválidas.');cad=c}catch(e){if((e as Error).name!=='NotFoundError'){const i=sources.findIndex(s=>s.id==='portal');sources[i]={id:'portal',state:'erro',message:'Cadastro geral: '+String((e as Error).message)}}}
 return{sources,cad};
}
export function today(){const d=new Date();return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
export function addDays(day:string,n:number){const d=new Date(day+'T12:00:00');d.setDate(d.getDate()+n);return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
export type Period='hoje'|'ontem'|'semana'|'mes'|'custom';
export function periodRange(period:Period,from:string,to:string):[string,string]{const h=today();if(period==='custom')return[from,to];if(period==='hoje')return[h,h];if(period==='ontem'){const d=addDays(h,-1);return[d,d]}if(period==='semana'){const wd=new Date(h+'T12:00:00').getDay();return[addDays(h,-((wd+6)%7)),h]}return[h.slice(0,7)+'-01',h]}
export const fmt=(v:unknown,d=0)=>v==null||!Number.isFinite(Number(v))?'—':Number(v).toLocaleString('pt-BR',{maximumFractionDigits:d});
export const pct=(v:unknown)=>v==null?'—':fmt(Number(v)*100,1)+'%';
export const date=(v?:string)=>v?new Date(v.length===10?v+'T12:00:00':v).toLocaleDateString('pt-BR'):'—';
export function productionView(ex:Json|undefined,from:string,to:string,turno:string){
 const rows=(turno?ex?.porDiaTurno:ex?.porDia)||[];const selected=rows.filter((r:Json)=>r.dia>=from&&r.dia<=to&&(!turno||r.turno===turno));
 const good=selected.some((r:Json)=>typeof r.boa==='number')?selected.reduce((n:number,r:Json)=>n+(Number(r.boa)||0),0):null;
 // Nunca tirar média simples dos OEEs diários; só usar uma taxa já publicada no mesmo recorte.
 let rate:number|null=null,goal:number|null=null;
 if(selected.length===1){rate=selected[0].oee??null;goal=selected[0].oeeMeta??null}
 const month=(ex?.porMes||[]).find((r:Json)=>r.mes===from.slice(0,7));
 if(!turno&&from.endsWith('-01')&&from.slice(0,7)===to.slice(0,7)&&to===today()&&month&&month.boa===good&&(!month.dias||month.dias===new Set(selected.map((r:Json)=>r.dia)).size)){rate=month.oee??null;goal=month.oeeMeta??null}
 return{rows:selected as Json[],good,rate,goal,scrap:selected.some((r:Json)=>typeof r.scrap==='number')?selected.reduce((n:number,r:Json)=>n+(Number(r.scrap)||0),0):null,rateNote:rate==null?'Abra a Produção para calcular o OEE ponderado deste recorte.':'Taxa publicada pela Produção para este recorte.'};
}
export function pending(sources:Source[]){return sources.flatMap(s=>s.state==='ok'?(s.exports?.pendencias||[]).filter((p:Json)=>!p.aPartirDe||p.aPartirDe<=today()).map((p:Json)=>({...p,module:s.id})):[]).sort((a,b)=>(Number(a.sev)||2)-(Number(b.sev)||2));}
export function searchOrders(sources:Source[],query:string){const map=new Map<string,Json>();const key=(s:unknown)=>String(s??'').trim();for(const s of sources){if(s.state!=='ok')continue;for(const row of [...(s.exports?.porOrdem||[]),...(s.exports?.ordens||[])]){const code=key(row.ordem??row.order);if(!code||!code.toLowerCase().includes(query.toLowerCase()))continue;const prev=map.get(code)||{code,modules:[],rows:[]};if(!prev.modules.includes(s.id))prev.modules.push(s.id);prev.rows.push({module:s.id,...row});map.set(code,prev)}}return[...map.values()].slice(0,30)}
export const esc=(s:unknown)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function csvCell(s:unknown){let v=String(s??'');if(/^[=+@\-\t\r]/.test(v))v="'"+v;return'"'+v.replace(/"/g,'""')+'"'}
export async function saveHandle(handle:Directory){await dbSet('folder',handle)}
export async function loadHandle(){return dbGet('folder') as Promise<Directory|undefined>}
async function database(){return new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open('vac-nova-plataforma',1);r.onupgradeneeded=()=>r.result.createObjectStore('app');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
export async function dbGet(key:string){const db=await database();return new Promise<any>((resolve,reject)=>{const r=db.transaction('app').objectStore('app').get(key);r.onsuccess=()=>{resolve(r.result);db.close()};r.onerror=()=>{reject(r.error);db.close()}})}
export async function dbSet(key:string,value:unknown){const db=await database();return new Promise<void>((resolve,reject)=>{const t=db.transaction('app','readwrite');t.objectStore('app').put(value,key);t.oncomplete=()=>{resolve();db.close()};t.onerror=()=>{reject(t.error);db.close()}})}

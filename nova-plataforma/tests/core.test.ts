import {test} from 'node:test';import assert from 'node:assert/strict';
import {sourceFrom,productionView,readSources,searchOrders,csvCell,addDays,periodRange,type Directory} from '../src/core/data';
test('exports desconhecidos e números inválidos não viram zero',()=>{
 assert.equal(sourceFrom('oee',{exports:{exportsVersion:2,porDia:[],porMes:[]}}).state,'incompativel');
 assert.equal(sourceFrom('oee',{exports:{exportsVersion:1,porDia:[{dia:'2026-01-01',boa:'123abc'}],porMes:[]}}).state,'incompativel');
 assert.equal(sourceFrom('oee',{exports:{exportsVersion:1,porDia:[{dia:'2026-01-01',boa:0}],porMes:[]}}).state,'ok');
 assert.equal(productionView(undefined,'2026-01-01','2026-01-02','').good,null);
 assert.equal(productionView({porDia:[{dia:'2026-01-01',boa:null}]},'2026-01-01','2026-01-01','').good,null);
});
test('listas malformadas não chegam ao painel',()=>{assert.equal(sourceFrom('inic',{exports:{acoes:[null]}}).state,'incompativel');assert.equal(sourceFrom('gel',{exports:{kpis:[null]}}).state,'incompativel');assert.equal(sourceFrom('gel',{exports:{pendencias:[{}]}}).state,'incompativel')});
test('OEE não usa média de taxas; apenas taxa publicada para o mesmo recorte',()=>{
 const ex={porDia:[{dia:'2026-01-01',boa:90,oee:.9},{dia:'2026-01-02',boa:10,oee:.1}]};
 assert.equal(productionView(ex,'2026-01-01','2026-01-02','').rate,null);
 assert.equal(productionView(ex,'2026-01-01','2026-01-02','').good,100);
 assert.equal(productionView(ex,'2026-01-01','2026-01-01','').rate,.9);
});
test('filtro por turno não retorna o total diário',()=>{
 const ex={porDia:[{dia:'2026-01-01',boa:100}],porDiaTurno:[{dia:'2026-01-01',turno:'T1',boa:30},{dia:'2026-01-01',turno:'T2',boa:70}]};
 assert.equal(productionView(ex,'2026-01-01','2026-01-01','T2').good,70);
 assert.equal(productionView(ex,'2026-01-01','2026-01-01','T3').good,null);
});
test('ordem textual com zeros permanece identificável em vários módulos',()=>{
 const a=sourceFrom('oee',{exports:{porDia:[],porMes:[],porOrdem:[{ordem:'000123',lote:'001'}]}}),b=sourceFrom('perdas',{exports:{porMes:[],porOrdem:[{ordem:'000123',desvio:12}]}});
 const list=searchOrders([a,b],'000123');assert.equal(list.length,1);assert.equal(list[0].code,'000123');assert.deepEqual(list[0].modules,['oee','perdas']);
});
test('falha de leitura da pasta não é ausência de bases',async()=>{
 const root={name:'teste',getDirectoryHandle:async()=>{throw new DOMException('Sem acesso','NotAllowedError')}} as unknown as Directory;
 await assert.rejects(readSources(root),{name:'NotAllowedError'});
});
test('pasta lida sem criação; JSON inválido fica explicitamente em erro',async()=>{
 const calls:string[]=[];const root={name:'teste',getDirectoryHandle:async(_name:string,options?:unknown)=>{assert.equal(options,undefined);return root},getFileHandle:async(name:string)=>{calls.push(name);return{getFile:async()=>new File([name==='oee-vacutainer-base.json'?'{ quebrado':JSON.stringify(name==='vacutainer-cadastros.json'?{schema:'vac-cadastros',rev:2}:{exports:{porMes:[],porDia:[],acoes:[]}})],name)}}} as Directory;
 const result=await readSources(root);assert.equal(result.sources.find(s=>s.id==='oee')?.state,'erro');assert.equal(result.cad?.rev,2);assert.ok(calls.includes('fifo-base.json'));
});
test('CSV neutraliza fórmulas e escapa aspas; datas atravessam o mês',()=>{
 assert.equal(csvCell('=1+1'),'"\'=1+1"');assert.equal(csvCell('Ordem "001"'),'"Ordem ""001"""');assert.equal(addDays('2026-03-01',-1),'2026-02-28');assert.deepEqual(periodRange('custom','2026-10-01','2026-10-10'),['2026-10-01','2026-10-10']);
});

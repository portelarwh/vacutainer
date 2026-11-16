import {test} from 'node:test';
import assert from 'node:assert/strict';
import {executiveView,productionView} from '../../.test-cache/modulo/core/data.mjs';
import helpers from '../../scripts/html.cjs';
const bases=JSON.parse(helpers.current().text('dados/cenario')).bases;
const source=(id,exports)=>({id,state:'ok',exports});
const demo=()=>['oee','paradas','inic'].map(id=>source(id,structuredClone(bases[id].exports)));
const day='2026-11-09';
test('resumo mantém os números publicados e a meta operacional, sem criar taxa de scrap',()=>{
 const s=demo(),v=executiveView(s,day,day,'',bases.cad);
 assert.deepEqual(v.prod,productionView(bases.oee.exports,day,day,''));
 assert.equal(v.prod.good,881000);assert.equal(v.prod.scrap,8610);assert.equal(v.prod.rate,.7291);assert.equal(v.target,937000);
 assert.equal(v.chartRows.length,2);assert.deepEqual(v.chartRows.map(r=>r.boa),[449000,432000]);
 assert.equal(v.stopMinutes,369);assert.equal(v.equipment.reduce((n,r)=>n+r.minutes,0),369);
 assert.equal('scrapPct' in v,false);assert.equal('stopTarget' in v,false);
});
test('turno selecionado mantém sua própria produção, meta, reportes e paradas',()=>{
 const v=executiveView(demo(),day,day,'T2',bases.cad);
 assert.equal(v.prod.good,432000);assert.equal(v.prod.scrap,5383);assert.equal(v.target,461000);assert.equal(v.prod.rate,.7243);
 assert.equal(v.chartRows.length,1);assert.equal(v.chartRows[0].turno,'T2');assert.equal(v.safety.quantity,0);assert.equal(v.quality.quantity,1);
});
test('QN repetida em dois turnos usa a quantidade consolidada publicada, sem somar duas vezes',()=>{
 const v=executiveView(demo(),day,day,'',bases.cad);
 assert.equal(v.quality.quantity,1);assert.equal(v.quality.answered,2);assert.equal(v.quality.expected,2);assert.equal(v.quality.complete,true);
 assert.equal(v.safety.quantity,1);assert.equal(v.safety.complete,true);
});
test('fora da cobertura e fonte em erro não viram ausência de paradas nem segurança verde',()=>{
 const v=executiveView(demo(),'2026-12-01','2026-12-02','',bases.cad);
 assert.equal(v.prod.good,null);assert.equal(v.target,null);assert.equal(v.stopMinutes,null);assert.equal(v.safety.complete,false);assert.equal(v.safety.quantity,null);
 const errors=demo().map(s=>({...s,state:'erro'})),e=executiveView(errors,day,day,'',bases.cad);
 assert.equal(e.prod.good,null);assert.equal(e.stopMinutes,null);assert.equal(e.actionsAvailable,false);assert.deepEqual(e.actions,[]);
});
test('zero real com cobertura é diferente de uma lista sem cobertura ou com número inválido',()=>{
 const ex={eventos:[],eventosCobertura:{de:day,ate:day,cortado:false}};
 assert.equal(executiveView([source('paradas',ex)],day,day,'').stopMinutes,0);
 assert.equal(executiveView([source('paradas',{eventos:[]})],day,day,'').stopMinutes,null);
 ex.eventos=[{dia:day,turno:'T1',minutos:'12'}];assert.equal(executiveView([source('paradas',ex)],day,day,'').stopMinutes,null);
});
test('meta parcial não vira meta completa e vários dias não geram média simples de OEE',()=>{
 const s=[source('oee',{porDia:[{dia:day,boa:30,metaOp:50,oee:.6},{dia:'2026-11-10',boa:10,metaOp:null,oee:.1}]})];
 const v=executiveView(s,day,'2026-11-10','');assert.equal(v.prod.good,40);assert.equal(v.prod.rate,null);assert.equal(v.target,null);
});
test('reportes parciais não afirmam zero e QNs não são somadas entre dias',()=>{
 const s=demo(),ex=s[0].exports;ex.sqdcp.turnos=ex.sqdcp.turnos.filter(r=>r.dia===day);ex.sqdcp.turnos[1].acidente=null;
 ex.sqdcp.porDia.find(r=>r.dia===day).acidente.quantidade=0;
 let v=executiveView(s,day,day,'');assert.equal(v.safety.quantity,null);assert.equal(v.safety.complete,false);assert.equal(v.safety.answered,1);
 ex.sqdcp.ate='2026-11-10';ex.sqdcp.turnos.push({...ex.sqdcp.turnos[0],dia:'2026-11-10'});
 v=executiveView(s,day,'2026-11-10','');assert.equal(v.quality.quantity,null);assert.equal(v.quality.positive,true);
});
test('Planner usa atraso publicado e ID para mostrar a posição atual, independente da janela de produção',()=>{
 const s=demo(),snapshot=JSON.stringify(s),a=executiveView(s,day,day,''),b=executiveView(s,'2025-01-01','2025-01-02','');
 assert.deepEqual(a.actions,b.actions);assert.equal(a.overdue,s[2].exports.acoes.filter(a=>a.atrasada&&!['concluída','cancelada'].includes(a.status)).length);
 assert.equal(JSON.stringify(s),snapshot,'consulta não modifica exports');
});
test('equipamentos com zeros permanecem distintos e sem vínculo não ganha equipamento inventado',()=>{
 const s=[source('paradas',{eventos:[{dia:day,minutos:5,equipamento:'001'},{dia:day,minutos:9,equipamento:'1'},{dia:day,minutos:2}],eventosCobertura:{de:day,ate:day}})];
 const v=executiveView(s,day,day,'',{equipamentos:[{codigo:'001',nome:'Máquina 001'},{codigo:'1',nome:'Máquina 1'}]});
 assert.deepEqual(v.equipment.map(e=>[e.code,e.minutes]),[['1',9],['001',5],['',2]]);assert.equal(v.equipment[2].name,'Sem equipamento');
});

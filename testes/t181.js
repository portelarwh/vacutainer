const RAIZ=require('path').resolve(__dirname,'..')+'/';
const {chromium}=require('playwright');const SP=require('path').resolve(__dirname,'..')+'/';(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:1100}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
await p.goto('file://'+SP+'paginas/Portal.html#geral');await p.waitForTimeout(600);await p.evaluate(()=>enterTest());await p.waitForTimeout(400);await p.evaluate(()=>Lock.on(Cad.D.seguranca.senhaHash));
console.log('regra 06:00–14:20 (30):',await p.evaluate(()=>turnoIntervalosRegra({inicio:'06:00',fim:'14:20',regraPedacoFinal:30}).map(([a,c])=>a/60+'-'+(c/60).toFixed(2)).join(' ')));
console.log('resumo:',await p.evaluate(()=>turnoResumo({inicio:'06:00',fim:'14:20',dias:[1,2,3,4,5,6],pausas:[{duracaoMin:60,dias:[6],desconta:true}]})));
// turnos lista + ficha
await p.evaluate(()=>{Cad.ui.sec='turnos';App.show('cad')});await p.waitForTimeout(300);console.log('lista turnos:',await p.$eval('#cadMain table',e=>e.innerText.split('\n').slice(0,2).join(' / ')));
await p.evaluate(()=>Ficha.abrir('turnos','T1'));await p.waitForTimeout(300);await p.click('#fvNova');await p.waitForTimeout(300);await p.click('[data-ivfill]');await p.waitForTimeout(300);
console.log('intervalos copiados:',await p.evaluate(()=>JSON.stringify(Ficha.W.vigencias.find(v=>v._nova).intervalos)));
console.log('horas:',await p.evaluate(()=>[...document.querySelectorAll('#fBox .small')].map(x=>x.innerText).filter(t=>/Horas do turno|Intervalos do Hora/.test(t)).slice(0,2).join(' || ')));
await p.screenshot({path:SP+'testes/saida/q1.png'});await p.evaluate(()=>Modal.close(true));
// parâmetros
await p.evaluate(()=>{Cad.ui.sec='parametros';App.render()});await p.waitForTimeout(300);await p.fill('[data-par=motivosAbono]','Almoço\nRevezamento');await p.click('#sParOk');await p.waitForTimeout(600);console.log('motivosAbono:',await p.evaluate(()=>JSON.stringify(Cad.D.parametros.motivosAbono)));
// preparação: cria catálogo prep com código de material da BOM
await p.evaluate(()=>{const mat=Cad.D.bom[0].vigencias.slice(-1)[0].itens[0].material;Cad.ops([{acao:'criação',tipo:'catalogos',codigo:mat,item:{codigo:mat,tipoItem:'preparacao',unidade:'L',nome:'Solução teste',ativo:true,vigencias:[{de:'2026-01-01',ate:null,pphNominal:null,tubosPorCaixa:null,caixasPorLote:null}]}}])});await p.waitForTimeout(800);
const mat=await p.evaluate(()=>Cad.D.bom[0].vigencias.slice(-1)[0].itens[0].material);
await p.evaluate(m=>Ficha.abrir('catalogos',m),mat);await p.waitForTimeout(400);console.log('ficha prep:',await p.$eval('#fBox .note',e=>e.innerText.slice(0,240)).catch(e=>'sem nota'));await p.evaluate(()=>Modal.close(true));
await p.evaluate(()=>Ficha.abrir('bom',Cad.D.bom[0].catalogo));await p.waitForTimeout(400);console.log('bom badge:',await p.evaluate(()=>[...document.querySelectorAll('#fBox a.pill')].map(a=>a.innerText).join(' | ')));await p.evaluate(()=>Modal.close(true));
// matriz
await p.evaluate(()=>{Cad.ui.sec='matriz';App.render()});await p.waitForTimeout(300);await p.check('#mxT');await p.waitForTimeout(300);await p.screenshot({path:SP+'testes/saida/mx1.png'});
await p.click('[data-mxcol] >> nth=1');await p.waitForTimeout(200);console.log('após ✗ coluna:',await p.evaluate(()=>JSON.stringify(Matriz.pend)));
await p.click('[data-mxv=maq]');await p.waitForTimeout(300);await p.screenshot({path:SP+'testes/saida/mx2.png'});
await p.click('[data-mxgrp][data-on="1"] >> nth=0');await p.waitForTimeout(200);console.log('após marcar grupo:',await p.evaluate(()=>JSON.stringify(Matriz.pend)));
await p.click('#mxOk');await p.waitForTimeout(600);console.log('salvo:',await p.evaluate(()=>JSON.stringify(Cad.D.paradas.map(x=>x.codigo+':'+JSON.stringify(x.equipamentos??null)))));
console.log(errs.join('\n')||'sem erros');await b.close()})();

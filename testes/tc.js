const RAIZ=require('path').resolve(__dirname,'..')+'/';
const {chromium}=require('playwright');const S='file://'+require('path').resolve(__dirname,'..')+'/paginas/';(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:1000}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.type()==='prompt'?d.accept('5,6000'):d.accept());
await p.goto(S+'Portal.html#geral');await p.waitForTimeout(600);await p.evaluate(()=>{enterTest();});await p.waitForTimeout(400);
await p.evaluate(()=>{Lock.on(Cad.D.seguranca.senhaHash);location.hash='cadastros/cambio'});await p.waitForTimeout(600);
const st=async l=>console.log(l,JSON.stringify(await p.evaluate(()=>{const it=cadItem('cambio','USD');return it?{v:it.vigencias.map(v=>v.de+'→'+(v.ate||'…')+'='+v.cotacao),d:(it.vigenciasDesativadas||[]).length}:null})));
// 1) adicionar hoje
await p.fill('#cbV','5,45');await p.click('#cbAdd');await p.waitForTimeout(900);await st('após hoje:');
// 2) FY26 mês a mês
await p.selectOption('#cbFy',{index:1});await p.waitForTimeout(300);const ms=await p.$$('[data-cbm]');const vals=['5,40','5,42','5,44','5,46','5,48','5,50','5,52','5,54','5,56','5,58','5,60','5,62'];for(let i=0;i<ms.length;i++)await ms[i].fill(vals[i]);
await p.click('#cbFyGo');await p.waitForTimeout(900);await st('após FY:');
// 3) colar
await p.fill('#cbTxt','out/24\t5,10\n01/11/2024;5,12\n2024-12 5,15\nlixo');await p.click('#cbLer');await p.waitForTimeout(300);console.log('prev:',await p.$eval('#cbPrev',e=>e.innerText.replace(/\n/g,' | ')));await p.click('#cbPrevGo');await p.waitForTimeout(900);await st('após colar:');
// 4) corrigir e excluir
await p.click('[data-cbc="2025-10-01"]');await p.waitForTimeout(900);await p.click('[data-cbx="2024-12-01"]');await p.waitForTimeout(900);await st('após corrigir/excluir:');
console.log('vacCambio 2025-03-31 / 2024-12-15:',JSON.stringify(await p.evaluate(()=>[vacCambio('2025-03-31'),vacCambio('2024-12-15')])));
await p.screenshot({path:RAIZ+'testes/saida/c1.png',fullPage:true});
console.log(errs.join('\n')||'sem erros');await b.close()})();

const RAIZ=require('path').resolve(__dirname,'..')+'/';
const {chromium}=require('playwright');const S='file://'+require('path').resolve(__dirname,'..')+'/paginas/';(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:1000}});
await p.goto(S+'Portal.html#geral');await p.waitForTimeout(600);await p.evaluate(()=>enterTest());await p.waitForTimeout(400);await p.evaluate(()=>Lock.on(Cad.D.seguranca.senhaHash));
for(const t of ['paradas','turnos','equipamentos','catalogos','usuarios','perfis','materiais','componentes','linhas','familias','modosFalha']){await p.evaluate(t=>{Cad.ui.sec=t;App.render()},t);await p.waitForTimeout(200);await p.click('#cadNovo',{timeout:2000}).catch(()=>{});await p.waitForTimeout(250);
console.log(t,':',await p.evaluate(()=>[...document.querySelectorAll('#fBox label')].filter(l=>!l.querySelector('.ib')&&!l.closest('.dias')&&!l.closest('table')).map(l=>l.innerText.trim().split('\n')[0].slice(0,40)).join(' | ')));await p.evaluate(()=>Modal.close(true))}
await b.close()})();

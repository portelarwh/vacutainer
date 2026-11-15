// Executa as mesmas asserções de login/permissão nos motores dentro de Plataforma.html.
// A fachada só redireciona a navegação e o alvo Playwright; não altera os motores nem suas regras.
const pw=require('playwright'),http=require('http'),fs=require('fs'),path=require('path');
const definitions={ 'Portal.html':'portal','OEE-Vacutainer.html':'oee','Perdas-Ordem.html':'perdas','Gestão-Gel-Vacutainer.html':'gel','Paradas.html':'paradas','Equipamentos.html':'equip','Iniciativas.html':'inic','Linha-360.html':'linha','Projetos.html':'projetos'};
exports.chromium={...pw.chromium,async launch(options={}){
 const html=fs.readFileSync(path.resolve(__dirname,'../../Plataforma.html')),server=http.createServer((q,r)=>{r.setHeader('Content-Type','text/html');r.end(html)});await new Promise(r=>server.listen(0,'127.0.0.1',r));server.unref();
 const browser=await pw.chromium.launch(require('./chromium.cjs')(options)),base='http://127.0.0.1:'+server.address().port+'/';
 function wrap(page){let frame=null,last='';async function attach(){const iframe=page.locator('iframe').first();await iframe.waitFor();frame=await(await iframe.elementHandle()).contentFrame();await frame.waitForFunction(()=>window.vacPagina?.pronto());}
  return new Proxy(page,{get(target,key){
   if(key==='goto')return async url=>{last=url;const parsed=new URL(url),module=definitions[decodeURIComponent(parsed.pathname.split('/').pop())];if(!module)throw new Error('Motor desconhecido: '+url);await page.goto(base+'#/'+module+(parsed.hash?'?rota='+encodeURIComponent(parsed.hash):''));await attach()};
   if(key==='reload')return async()=>{await page.reload();await attach()};
   if(key==='addInitScript')return async(fn,arg)=>{await page.addInitScript('('+fn.toString()+')('+JSON.stringify(arg)+');\n'+`for(const key of Object.keys(localStorage)){if(key.startsWith('vac.')&&!key.startsWith('vac.app.'))localStorage.setItem('vac.app.real-inicial.'+key,localStorage.getItem(key));}`)};
   if(['evaluate','evaluateHandle','waitForFunction','locator','$','$$','$eval','$$eval','fill','click','textContent','getByRole','getByText','waitForSelector','inputValue','selectOption','check','uncheck','press'].includes(key))return(...args)=>{if(!frame)throw new Error('Abra o motor antes de consultar a tela.');return frame[key](...args)};
   const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;
  }});
 }
 const newContext=browser.newContext.bind(browser),newPage=browser.newPage.bind(browser),close=browser.close.bind(browser);
 browser.newContext=async opts=>{const context=await newContext(opts),create=context.newPage.bind(context);context.newPage=async()=>wrap(await create());return context};
 browser.newPage=async opts=>(await browser.newContext(opts)).newPage();browser.close=async()=>{try{await close()}finally{server.close()}};return browser;
}};

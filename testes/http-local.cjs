// Preload opcional de testes: VAC_TEST_HTTP=1 NODE_OPTIONS="--require ./testes/http-local.cjs" npm test
// Alternativa explícita para ambientes que bloqueiam file://. NÃO homologa file://, SMB ou a pasta real.
const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path');
const launch=chromium.launch.bind(chromium),root=path.resolve(__dirname,'..');
chromium.launch=async(options={})=>{
 let server,origin;
 if(process.env.VAC_TEST_HTTP==='1'){
  server=http.createServer((req,res)=>{try{if(new URL(req.url,'http://local').pathname==='/favicon.ico'){res.writeHead(204);return res.end()}const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://local').pathname));if(!file.startsWith(root+path.sep))throw new Error('Fora do repositório');res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.json':'application/json','.css':'text/css','.png':'image/png'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file))}catch{res.writeHead(404);res.end()}});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));server.unref();origin='http://127.0.0.1:'+server.address().port;
 }
 const browser=await launch(require('../nova-plataforma/tests/chromium.cjs')(options));
 if(server){const wrapped=new WeakSet(),wrap=page=>{if(wrapped.has(page))return page;wrapped.add(page);const goto=page.goto.bind(page);page.goto=(url,opts)=>{if(String(url).startsWith('file:')){const u=new URL(url),local=decodeURIComponent(u.pathname);if(local.startsWith(root+path.sep))url=origin+encodeURI(local.slice(root.length))+u.search+u.hash}return goto(url,opts)};return page};const newContext=browser.newContext.bind(browser),close=browser.close.bind(browser);browser.newContext=async opts=>{const context=await newContext(opts),newPage=context.newPage.bind(context);context.newPage=async()=>wrap(await newPage());return context};browser.newPage=async opts=>(await browser.newContext(opts)).newPage();browser.close=async()=>{try{await close()}finally{server.close()}}}
 return browser;
};

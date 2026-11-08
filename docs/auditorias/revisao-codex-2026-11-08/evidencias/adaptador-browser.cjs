const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const root = '/workspace/verificacao-isolada-c3ae4b0';
let origin;
const server = http.createServer((req,res)=>{
  const file = path.resolve(root, '.' + decodeURIComponent(req.url.split('?')[0]));
  if (!file.startsWith(root + '/') || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404);res.end();return; }
  res.setHeader('Content-Type', file.endsWith('.html') ? 'text/html; charset=utf-8' : file.endsWith('.js') ? 'text/javascript' : 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
const ready = new Promise(resolve=>server.listen(0,'127.0.0.1',()=>{origin='http://127.0.0.1:'+server.address().port;server.unref();resolve();}));
const launch = chromium.launch.bind(chromium);
chromium.launch = async options => {
  await ready;
  const browser = await launch({ ...options, executablePath: '/usr/bin/chromium', args: [...(options?.args || []), '--no-sandbox'] });
  const wrapPage = page => { const goto=page.goto.bind(page); page.goto=(url,opts)=>goto(url.replace('file://'+root,origin),opts); return page; };
  const browserNewPage = browser.newPage.bind(browser);
  browser.newPage = async options => wrapPage(await browserNewPage(options));
  const newContext = browser.newContext.bind(browser);
  browser.newContext = async options => {
    const context = await newContext(options), newPage=context.newPage.bind(context);
    context.newPage = async()=>wrapPage(await newPage());
    return context;
  };
  return browser;
};

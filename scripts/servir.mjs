import {createServer} from 'node:http';
import {readFileSync} from 'node:fs';
import helpers from './html.cjs';
// Apenas desenvolvimento. O produto abre diretamente pelo arquivo na linha.
const server=createServer((req,res)=>{
 if(new URL(req.url,'http://local').pathname!=='/'){res.writeHead(404);return res.end();}
 res.setHeader('Content-Type','text/html; charset=utf-8');res.end(readFileSync(helpers.FILE));
});
server.listen(5173,'127.0.0.1',()=>console.log('Demonstração local: http://127.0.0.1:5173/?demo=1'));

import {execFileSync} from 'node:child_process';import {readFileSync,readdirSync} from 'node:fs';import {createHash} from 'node:crypto';import path from 'node:path';import {fileURLToPath} from 'node:url';
const app=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const hashes=()=>Object.fromEntries(['src/generated','dist'].flatMap(dir=>readdirSync(path.join(app,dir)).filter(f=>f!=='fixtures.json').map(f=>{const p=dir+'/'+f;return[p,createHash('sha256').update(readFileSync(path.join(app,p))).digest('hex')]})));
execFileSync('npm',['run','build'],{cwd:app,stdio:'inherit'});const before=hashes();execFileSync('npm',['run','build'],{cwd:app,stdio:'inherit'});const after=hashes();
if(JSON.stringify(before)!==JSON.stringify(after))throw new Error('Dois builds consecutivos produziram bytes diferentes');
console.log('ok N5: dois builds idênticos em todos os artefatos · Plataforma.html SHA-256 '+after['dist/Plataforma.html']);

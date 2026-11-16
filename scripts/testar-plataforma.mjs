import {execFileSync} from 'node:child_process';
import {readdirSync} from 'node:fs';
import path from 'node:path';
import helpers from './html.cjs';
const root=helpers.ROOT;
const run=(file,args=[])=>execFileSync(process.execPath,[file,...args],{cwd:root,stdio:'inherit',env:process.env});
run('scripts/preparar-testes.mjs');
const tests=readdirSync(path.join(root,'testes/plataforma')).filter(f=>f.endsWith('.test.mjs')).map(f=>'testes/plataforma/'+f);
execFileSync(process.execPath,['--test',...tests],{cwd:root,stdio:'inherit'});
if(!process.argv.includes('--unit')){
 for(const file of ['contrato','abas','pasta','integracao','permissoes-paridade','conta'])run('testes/plataforma/'+file+'.cjs');
 for(const name of ['tlogin','tpermissoes'])execFileSync(process.execPath,['testes/'+name+'.js'],{cwd:root,stdio:'inherit',env:{...process.env,VAC_PLATAFORMA:'1'}});
 for(const file of ['browser','tela','inicializacao','marca','arquivo-unico','metadados','backup-concorrencia','executivo'])run('testes/plataforma/'+file+'.cjs');
}

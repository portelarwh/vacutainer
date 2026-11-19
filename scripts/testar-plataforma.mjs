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
 for(const name of ['tlogin','tpermissoes','tsqdcp_layout'])execFileSync(process.execPath,['testes/'+name+'.js'],{cwd:root,stdio:'inherit',env:{...process.env,VAC_PLATAFORMA:'1'}});
 for(const file of ['browser','tela','inicializacao','marca','arquivo-unico','metadados','backup-concorrencia','executivo','contraste','outlook','ajustes-usabilidade','rolagem-graficos','timeline','favicon','total-turno','semaforo','lancamento-183','equipamentos-mes','linha-ficha','importacoes-periodo','entrada','parametros-semaforo','lancamento-unificado','abas-agrupadas','turno-sabado','kkbc-competencia','gel-producao','gel-relatorio','enviar-relatorio','equip-ordem','turno-vigente','login-fotos','servidor-dia','formularios'])run('testes/plataforma/'+file+'.cjs');
}

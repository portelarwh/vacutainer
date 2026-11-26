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
 for(const file of ['browser','login-marca','plano-sabado','tur05-fechado','tl03-acoes','rel02-formatos','cfg-adm','adm-assuntos','adm-gel','gel-perdas-formato','base-limpa-formato','base-limpa-motores','prod-numeros','prodcad-equivalencia','prodcad-casos','prodcad-memoria','prod-config-adm','carga-tabela','logo-unico','padroes-embutidos','primeiro-uso','gel-ritmo','celular-lancamento','fuso-planta','paradas-simultaneas','dado-impossivel','demo-ids-deslocados','cad-consulta','mt-celular','man-celular','linha-pontos','linha-fotos','form-resumido','abrindo-prazo','form-campos','form-pdf-leve','filtro-lista','scrap-lado','tela','inicializacao','marca','arquivo-unico','metadados','backup-concorrencia','executivo','contraste','outlook','ajustes-usabilidade','rolagem-graficos','timeline','favicon','total-turno','semaforo','lancamento-183','equipamentos-mes','linha-ficha','importacoes-periodo','entrada','parametros-semaforo','lancamento-unificado','abas-agrupadas','turno-sabado','kkbc-competencia','gel-numeros','gel-fonte-unica','gel-producao','gel-relatorio','enviar-relatorio','equip-ordem','turno-vigente','login-fotos','servidor-dia','formularios','parada-categorias','turno-meia-noite','hora-extra','turno-virada','novidades','abas-config','grade-larguras','lancamento-topo','lancamento-cabecalho','lancamento-validacao','lancamento-modos','par-lote'])run('testes/plataforma/'+file+'.cjs');
}

import {execFileSync} from 'node:child_process';
export function sourceProvenance(root){
 const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
 if(git('rev-parse','--is-shallow-repository')==='true')throw new Error('O build exige histórico Git completo: faça fetch --unshallow (CI: fetch-depth: 0).');
 return{sourceRevision:git('log','-1','--format=%H','--','fontes','paginas',':(exclude)paginas/Demonstracao.html'),dirtySources:git('status','--porcelain','--','fontes','paginas',':(exclude)paginas/Demonstracao.html').split('\n').filter(Boolean)};
}

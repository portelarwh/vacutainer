import {vacPodeComum} from '../../../fontes/kit/permissoes.mjs';
import type {Json} from './data';
export function sessionUser(storage:Pick<Storage,'getItem'>,cad:Json|null,now=Date.now()){
 try{const s=JSON.parse(storage.getItem('vac.sessao')||'null');if(!s?.id||String(s.id)!==storage.getItem('vac.userId')||!(+s.ate>now))return null;
 return(cad?.usuarios||[]).find((u:Json)=>String(u.codigo)===String(s.id)&&u.ativo!==false)||null}catch{return null}
}
export function mayWrite(storage:Pick<Storage,'getItem'>,cad:Json|null,module:string){
 const u=sessionUser(storage,cad);if(!u)return false;return['lancar','fechar','importar','excluir','configurar'].some(acao=>vacPodeComum(cad,u,module,acao));
}

import {useCallback,useEffect,useRef,useState} from 'react';import {engineHtml,frames,routeEngine,connectEngine,type EngineStatus} from '../core/runtime';import {type ModuleId,moduleOf} from '../core/modules';import {Button,Empty} from './ui';
export function ModuleFrame({id,tab,hash,active,session,status,context,folder}:{id:ModuleId;tab:string;hash?:string;active:boolean;session:string;status?:EngineStatus;context:{from:string;to:string;turno:string};folder:boolean}){
 const ref=useRef<HTMLIFrameElement>(null),[html,setHtml]=useState(''),[error,setError]=useState(''),attached=useRef(false);
 const setFrame=useCallback((node:HTMLIFrameElement|null)=>{const previous=ref.current;if(previous&&previous!==node){(previous.contentWindow as any)?.vacPagina?.descartar();if(frames.get(id)===previous)frames.delete(id)}ref.current=node;if(node)frames.set(id,node)},[id]);
 useEffect(()=>{let alive=true;engineHtml(id,hash||'').then(t=>{if(alive)setHtml(t)}).catch(e=>setError(e.message));return()=>{alive=false}},[id,session]);
 useEffect(()=>{if(status?.ready&&active){routeEngine(id,tab,hash,context)}},[status?.ready,status?.connected,active,tab,hash,context.from,context.to,context.turno]);
 useEffect(()=>{if(status?.ready&&folder&&!status.connected&&!attached.current){attached.current=true;connectEngine(id).catch((e:Error)=>{setError(e.message);attached.current=false})}},[status?.ready,folder]);
 if(!active&&!html)return null;
 return <section className="module-frame" hidden={!active} aria-label={moduleOf(id)?.name}>{error&&<div className="inline-alert">{error}<Button onClick={()=>{setError('');connectEngine(id).catch((e:Error)=>setError(e.message))}}>Tentar conexão novamente</Button></div>}{!html?<Empty title="Preparando o módulo…">Carregando os recursos incorporados ao aplicativo.</Empty>:<iframe ref={setFrame} title={'Módulo '+moduleOf(id)?.name} srcDoc={html} />}</section>
}

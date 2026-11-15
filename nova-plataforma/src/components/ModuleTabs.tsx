import {useLayoutEffect,useRef,useState} from 'react';
import type {Tab} from '../core/modules';
export function ModuleTabs({tabs,active,onSelect}:{tabs:Tab[];active:string;onSelect:(id:string)=>void}){
 const nav=useRef<HTMLElement>(null),[edges,setEdges]=useState({left:false,right:false});
 useLayoutEffect(()=>{const n=nav.current;if(!n)return;const update=()=>{const next={left:n.scrollLeft>1,right:n.scrollLeft+n.clientWidth<n.scrollWidth-1};setEdges(old=>old.left===next.left&&old.right===next.right?old:next)};
 const reveal=()=>{n.querySelector('.active')?.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});update()};
 reveal();n.addEventListener('scroll',update,{passive:true});const observer=new ResizeObserver(reveal);observer.observe(n);return()=>{n.removeEventListener('scroll',update);observer.disconnect()};
 },[tabs,active]);
 return <div className={'module-tabs-wrap'+(edges.left?' more-left':'')+(edges.right?' more-right':'')}><nav ref={nav} className="module-tabs" aria-label="Abas do módulo">{tabs.map(t=><button key={t.id} data-tab-id={t.id} aria-current={active===t.id?'page':undefined} className={active===t.id?'active':''} onClick={()=>onSelect(t.id)}>{t.label}</button>)}</nav></div>;
}

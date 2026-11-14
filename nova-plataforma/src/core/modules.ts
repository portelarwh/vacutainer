export type ModuleId='portal'|'oee'|'perdas'|'gel'|'paradas'|'equip'|'inic'|'linha'|'projetos';
export type PageId='inicio'|'importacoes'|'relatorios'|'saude'|ModuleId;
export interface Tab {id:string;label:string;route:string}
export interface Module {id:ModuleId;name:string;short:string;description:string;icon:string;file:string;group:'Operação'|'Gestão'|'Sistema'}
export const modules:Module[]=[
 {id:'oee',name:'Produção',short:'Produção',icon:'factory',file:'OEE-Vacutainer.html',group:'Operação',description:'Plano, ordens, apontamento e desempenho da linha'},
 {id:'perdas',name:'Waste',short:'Waste',icon:'chart',file:'Perdas-Ordem.html',group:'Operação',description:'Custos, desvios e perdas por ordem de produção'},
 {id:'gel',name:'Gestão de Gel',short:'Gel',icon:'drop',file:'Gestão-Gel-Vacutainer.html',group:'Operação',description:'FIFO, estoque, consumo, medições e scrap de gel'},
 {id:'paradas',name:'Paradas',short:'Paradas',icon:'clock',file:'Paradas.html',group:'Operação',description:'Eventos, causas, Pareto e planos de ação'},
 {id:'equip',name:'Equipamentos',short:'Equipamentos',icon:'wrench',file:'Equipamentos.html',group:'Gestão',description:'Fichas técnicas, manutenção, OS, TAGs e TPM'},
 {id:'inic',name:'Iniciativas / Ações',short:'Ações',icon:'kanban',file:'Iniciativas.html',group:'Gestão',description:'Planner, responsáveis, prazos, KAS, OSM e 5S'},
 {id:'linha',name:'Linha 360°',short:'Linha 360°',icon:'factory',file:'Linha-360.html',group:'Operação',description:'Planta, postos, eventos e checklists da linha'},
 {id:'projetos',name:'Projetos',short:'Projetos',icon:'layers',file:'Projetos.html',group:'Gestão',description:'Estrutura de projetos e investimentos; escopo em definição'},
 {id:'portal',name:'Administração',short:'Cadastros',icon:'settings',file:'Portal.html',group:'Sistema',description:'Cadastros únicos, parâmetros, pessoas e configuração'}
];
export const moduleOf=(id:string)=>modules.find(m=>m.id===id);
export const FILES:Record<ModuleId,string>={portal:'portal-base.json',oee:'oee-vacutainer-base.json',perdas:'perdas-base.json',gel:'fifo-base.json',paradas:'paradas-base.json',equip:'equipamentos-base.json',inic:'iniciativas-base.json',linha:'linha360-base.json',projetos:'projetos-base.json'};
export const IMPORTS=[{module:'portal',tab:'cadastros',title:'Cadastros e regras',files:'CS12 · Meta OEE FY27',note:'Catálogos, lista técnica, ritmos, turnos e metas vigentes.'},{module:'oee',tab:'config',title:'Produção realizada',files:'RELATÓRIO · CSV de lotes',note:'Confira datas, catálogos, turnos e registros fora da jornada.'},{module:'oee',tab:'ordens',title:'Ordens de produção',files:'MB51 → COOIS',note:'Importe movimentos primeiro e complemente as ordens em seguida.'},{module:'perdas',tab:'importar',title:'Custos e perdas',files:'KKBC_ORD',note:'Confira competência, moeda e ordens antes de gravar.'},{module:'gel',tab:'op',title:'Estoque de gel',files:'Relatório SAP de LPs',note:'Concilie barris, locais, validade e movimentações.'},{module:'paradas',tab:'importar',title:'Apontamentos de parada',files:'Forms / planilha de máquina',note:'Confira equipamento, causa, início, fim e duplicidades.'}] as const;

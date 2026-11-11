# Visão Geral da Produção (Produção 2.4.49 · 11/11/2026)

Especificação: `docs/ux/UX_Wireframe_Visao_Geral_OEE_Vacutainer.md`. Plano aprovado em 11/11/2026 com quatro decisões: maior desvio ao lado das pendências, "Mais indicadores" sem repetir os cartões ligados, botão Limpar nos filtros, uma PR no fim com commits por etapa.

## O que mudou (só a visão "Visão Geral · padrão")

Fonte: `fontes/producao/vg_layout.js` (`VGL.montar`, entra pelo `build.py`). A montagem original continua sendo renderizada como antes (`App.views.overview` da base + `VGC` + `Decide` + `Dobra`); no mount, **os mesmos nós** são reorganizados. Nenhum gráfico é redesenhado e nenhum número é recalculado de outro jeito.

| Seção | Conteúdo | Origem dos dados |
|---|---|---|
| Cabeçalho | "Visão geral da operação", seletor de visão e uma fileira de ações (Personalizar, Imprimir, Exportar, Apresentar; o Imprimir repetido da barra de filtros saiu) | `VisaoGeral.barra`, `#ovExp` movido |
| Filtros | Os mesmos + **Limpar** (mês atual; Máquina, Catálogo, Turno e Status em Todos; a Linha continua) e **Mais filtros** no celular | `filterBar`, `bindFilters` |
| 01 Situação do período | OEE, meta vigente, desvio (p.p.), estado em texto, barra até a meta, período anterior; Ação prioritária e Próximas decisões; **Maior perda do período** (maior etapa da cascata e 1ª parada do Pareto, com atalhos) | `aggF`, `A.prevRange`, `Decide`, `r.cascade.steps`, `A.pareto` |
| 02 Números do período | Os 14 cartões (Editar cards) e Mais indicadores; Produção boa e Capacidade planejada só aparecem em Mais indicadores quando desligadas na grade | `VGC`, `KC.filtrar` |
| 03 Diagnóstico rápido | Melhor e pior dia do OEE (abrem o dia) e confiabilidade do apontamento (abre Pendências); com 1 dia, "Só 1 dia" | `A.dayRows`, `openDayDrawer`, `oeeReliability` |
| 04 Análises de desempenho | 13 gráficos em 6 grupos recolhíveis (A Produção e plano · B Eficiência · C Perdas · D Qualidade · E Resultado · F Evolução), grupo "Outros" para qualquer gráfico novo; aviso de 1 dia e de tendência com menos de 2 semanas/meses | gráficos originais; `A.byWeek`, `A.byMonth` |
| 05 Explorar dados | Último dia, Paradas, Pendências, Plano e ordens, Histórico, Relatório do período; período e estado da base | rotas existentes |

Preferências: grupos em `App.prefs.vgGrupo` (não colide com `App.prefs.vgFold` dos blocos). Impressão: grupos sempre abertos. Meu painel, visões compartilhadas e modelos (`Panel`) não passam por aqui.

## Evidência

- `testes/tvisaogeral.js`: referência gravada **antes** da mudança (`testes/bases/visaogeral-referencia.json`): 23 cartões, texto dos 13 gráficos e de Meu painel num período fixo. Depois: mesmos valores, mesmo texto, Meu painel igual; cliques (dia e Pareto); seções e grupos; Imprimir único; Situação; maior perda; Mais indicadores sem repetir (e com eles quando desligados); avisos de 1 dia e tendência curta; grupo lembrado sem mexer nas dobras; Limpar (inclusive com período sem dados); impressão com grupos abertos; 1440/768/390 px nos dois temas sem rolagem lateral. Prints em `testes/saida/visaogeral/antes-*` e `depois-*`.
- Também rodados: `toeereal`, `tperiodo`, `tfase7`, `trelatorios` (Excel NÃO VERIFICADO, falta `xlsx`), `tseguranca`, `tpg`, `tdemo`, `tvisual` e a suíte inteira.

## Rollback

Cada etapa é um commit (E1 referência; E2–E4 layout; E5 testes, guia e docs). Para voltar ao layout anterior: tirar a regra do `vg_layout.js` do `build.py` e rodar o build; nenhum dado gravado muda de formato (`vgGrupo` fica ignorado).

## Riscos remanescentes

- A reorganização acontece no mount: se a base mudar o título de um gráfico, ele cai em "Outros" (nunca some).
- Estados "Conectando", "Base desatualizada" e "Gravação pendente" continuam na faixa da página (não foram duplicados aqui).
- Validar com operador e liderança na pasta real (densidade e ordem dos grupos).

## Padrão comum no kit e Waste 1.8.35 (11/11/2026)

Decisões do responsável: ordem Waste → Paradas → Gel → Portal; Visão geral completa e estilo nas outras abas; uma PR por página.

**Kit** (`fontes/kit/kit_visual.css` + `kit_v21.js`, iguais nas 8 páginas): estilos `vk-*` (cabeçalho da visão, seções numeradas, situação, estado em texto, barra até a meta, cartões de diagnóstico, grupos recolhíveis, aviso) e `vacLayout` (`sec`, `grupo`, `estado`, `ligar(raiz, página)`, `fechado`); grupos recolhidos em `localStorage vac.grupos.<página>`; impressão com grupos abertos. `vk-estilo` no contêiner da página deixa cartões e títulos das outras abas no mesmo estilo (sem caixa alta). Filtros: `.vk-mais` + `.vk-opt` = "Mais filtros" no celular. A Produção continua com o `vg_layout.js` (mesmo visual).

**Waste 1.8.35** (`paginas/Perdas-Ordem.html`, `wasteVK`): "Visão geral do Waste" com 01 Situação (desvio líquido × meta do período, estado em texto, acumulado do FY; Ação prioritária: críticas/altas sem causa e ações vencidas; Maior perda: componente e catálogo do topo dos Paretos, com Filtrar) · 02 Números (o antigo Resumo foi para os indicadores: Var. material e Scrap viraram cartões e o Total é o Desvio líquido, sem repetir; pendência do registro § L) · 03 Diagnóstico (pior e melhor competência, críticas/altas sem causa) · 04 Análises (A Evolução: tendência e quadro por competência; B Onde está a perda: Paretos de componente e catálogo; C Causas) · 05 Ordens e componentes (a tabela). Nenhum cálculo mudou. Teste: `testes/twaste_vg.js` (referência `testes/bases/waste-vg-referencia.json` gravada antes).

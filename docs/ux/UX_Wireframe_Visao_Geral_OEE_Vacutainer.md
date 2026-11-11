# UX/UI — Visão Geral do OEE Vacutainer

**Tipo:** especificação de experiência do usuário + wireframe textual + plano de implementação seguro  
**Status:** proposta para avaliação; **não autoriza alterações automáticas**  
**Projeto:** Sistemas · Linha Vacutainer (BD Curitiba)  
**Escopo:** `Produção › Visão Geral` do OEE Vacutainer; adaptações estritamente necessárias nos componentes visuais compartilhados, se justificadas  
**Repositório:** `portelarwh/vacutainer`  
**Referência:** `paginas/OEE-Vacutainer.html`, branch `main`, código consultado na conversa (SHA do arquivo: `cd466e1e2a7655a892f17df6ff69eb0ec0cdc424`). **Antes de atuar, reler a versão atual, que pode ter mudado.**

> **Regra principal:** preservar **100% das funcionalidades já existentes**, os dados e cálculos, as visualizações individuais e compartilhadas, os filtros e os fluxos de trabalho. Esta proposta **não pede outro sistema**, não elimina gráficos e não substitui o dashboard personalizável. É uma reestruturação de *apresentação, hierarquia, leitura e navegação*, a ser feita de modo incremental.

---

## 1. Contexto e decisões já tomadas com o responsável

1. O sistema é uma suíte de gestão industrial para a linha de tubos de coleta de sangue Vacutainer.
2. O **Portal** é o núcleo da suíte. O módulo **Produção/OEE** é responsável pela gestão produtiva, indicadores, apontamentos, metas, análises e relatórios.
3. A tela compartilhada anteriormente mostrava **muitos cartões porque o administrador ativou intencionalmente todos os indicadores para inspecionar os dados**. **Isso NÃO é uma falha de UX nem um pedido para remover KPIs.**
4. O sistema **já permite personalizar visualizações por usuário/perfil ou compartilhar uma visão geral**. Preservar essa possibilidade exatamente; conferir as regras reais de escopo, perfis e gravação no código antes de propor ajustes.
5. O sistema já contém **Visão Geral**, **Meu painel/visões personalizadas**, **Editar cards**, blocos recolhíveis, comparação entre períodos, **Modo TV**, relatórios, filtros, indicadores com metas e gráficos interativos. **Não recriar funções já presentes.**
6. A identidade visual industrial existente deve ser preservada: família Barlow, cores da suíte, barra superior global, abas da Produção e estilos claros/escuros.
7. Objetivo principal: a página deve ajudar a responder, nesta sequência: **Como estamos? Onde está o desvio? Por que aconteceu? Onde investigar/agir?**
8. O projeto está em evolução. Não usar esta especificação para introduzir novas fórmulas de OEE nem alterar as regras de apuração.

### O que NÃO está sendo pedido

- Eliminar indicadores, suprimir dados ou ocultar itens compulsoriamente para o administrador.
- Criar outro motor de cálculos, outro banco de dados ou um sistema de permissões paralelo.
- Alterar a forma de salvar views por usuário ou compartilhadas.
- Alterar lógica de lançamento, importação SAP/MES, fechamento, reabertura, scrap, turnos, metas com vigência, D/P/Q, OEE reportado/real, backups ou sincronização.
- Redesenhar todas as páginas ou editar indiscriminadamente o tema global.
- Publicar diretamente na pasta de rede ou dar merge na `main` sem homologação.

---

## 2. Estado do código: confirmar antes de implementar

**Fonte primária:** `CLAUDE.md` da raiz e documentos da Produção no repositório. Foram observados na versão consultada:

- `paginas/OEE-Vacutainer.html` é **artefato gerado**. **NÃO EDITAR DIRETAMENTE.** Implementar nos arquivos de `fontes/producao/` e executar `python fontes/producao/build.py`.
- Existe kit compartilhado em `fontes/kit/` (`kit_visual.css`, `kit_v21.js`, `sistemas.js` e geradores). Alteração de kit exige avaliação de impacto em todas as páginas. A auditoria visual anterior está documentada em `docs/auditorias/layout-2026-11-06/`.
- `CLAUDE.md`, `docs/auditorias/registro-decisoes.md`, contratos e instruções de teste são obrigatórios para evitar regressões de decisões anteriores.
- **Visão Geral** é a rota `overview`; a visualização padrão é `padrao`; as demais visões derivam do mecanismo de painel (`Panel`). A composição está em `fontes/producao/visao_geral.js` e outras fontes; **verificar o ponto real da renderização antes de editar**.
- A base HTML contém referências a `VisaoGeral`, `VGC.html`, `A.kpiCmp`, `Decide.html`, `Dobra`, `Panel`, `Charts`, `KC.filtrar`, `openDayDrawer`, `go('stops')` e a uma grade de gráficos de Visão Geral. Essas referências são pistas para leitura, não uma autorização para alterá-las sem localizar a fonte correta.
- Existem testes amplos em `testes/`, incluindo testes de gráficos/visual/integração/produção. O comando `node testes/tudo.js` executa a suíte completa, conforme instruções da raiz.

**Verificação inicial obrigatória do Claude Code:** apontar onde cada seção e função é gerada, e quais testes cobrem a área. Registrar possíveis divergências entre esta proposta e a versão mais recente do projeto antes de fazer modificações.

---

## 3. Objetivos de UX e critérios

| Objetivo | Resultado verificável |
|---|---|
| Leitura executiva rápida | Resultado do período, meta e desvio são compreensíveis sem depender apenas da cor. |
| Densidade controlada | A quantidade de cartões depende da **visualização escolhida**, não de um corte global arbitrário. |
| Clareza dos gráficos | Escala, unidade, contexto do período, meta e significado das séries ficam explícitos. |
| Hierarquia visual | Agrupamentos por tema têm título/descrição e tornam o percurso de análise previsível. |
| Drill-down | Quando tecnicamente suportado, clicar no desvio conduz ao registro detalhado mantendo o contexto dos filtros. |
| Resiliência | Zero dados, dados parciais, 1 único dia, períodos longos e erros de conexão têm estados distintos e legíveis. |
| Consistência | Visões salvas, tema claro/escuro, modo TV, exportação e relatórios continuam compatíveis. |
| Responsividade | Desktop, notebook, tablet e celular não apresentam sobreposição ou cortes de conteúdo. |
| Acessibilidade | Navegação por teclado, foco visível, rótulos e contrastes adequados; status não só por cor. |

---

## 4. Wireframe da página inteira — DESKTOP

> **Wireframe estrutural, não mockup pixel-perfect.** Os números da reunião anterior eram **ilustrativos** e **não devem ser hard-coded**. Os blocos de priorização e personalização devem reaproveitar funções existentes. As posições exatas podem respeitar o layout de cada view salva.

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ SISTEMAS · LINHA VACUTAINER    Portal | Produção | Waste | Gel | Paradas | Outros    ⌕  Usuário ⚙│
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ PRODUÇÃO       [← Voltar]                                 Sincronizar   Backup   Apresentar / TV │
│ Visão Geral | Lançamento | Hora a Hora | Plano do mês | Ordens | Relatórios | ...               │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ VISÃO GERAL DA OPERAÇÃO                                                                  [?]     │
│ OEE, produção, perdas e desempenho da linha Vacutainer                                           │
│ [Período: Mês ▼] [Turno: Todos ▼] [Catálogo: Todos ▼] [Mais filtros ▾] [Limpar]                 │
│ [Visão: Administrador ▼] [Personalizar] [Imprimir] [Exportar (quando disponível)] [TV]         │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 01. SITUAÇÃO DA FÁBRICA                                                                        │
│ ┌─────────────────────────────────────┐ ┌──────────────────────────────────────────────────────┐│
│ │ OEE DO PERÍODO                     │ │ ONDE ATUAR AGORA?                                   ││
│ │ Valor  |  Meta  |  Desvio           │ │ Prioridade calculada com base no dado disponível    ││
│ │ Faixa de progresso + descrição     │ │ Impacto/categoria/causa, se houver fundamento       ││
│ │ Comparação com período anterior    │ │ [Ver ocorrência ou análise correspondente]         ││
│ └─────────────────────────────────────┘ └──────────────────────────────────────────────────────┘│
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 02. INDICADORES DO PERÍODO                                              [Editar cards]          │
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────────────┐   │
│ │ Produção boa     │ │ OEE realizado    │ │ Disponibilidade │ │ Performance              │   │
│ │ valor / meta     │ │ valor / meta     │ │ valor/contexto   │ │ valor/contexto           │   │
│ │ delta / mini     │ │ delta / mini     │ │ delta / mini     │ │ delta / mini             │   │
│ └──────────────────┘ └──────────────────┘ └──────────────────┘ └──────────────────────────┘   │
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────────────┐   │
│ │ Qualidade        │ │ Atendimento      │ │ ...              │ │ ...                      │   │
│ └──────────────────┘ └──────────────────┘ └──────────────────┘ └──────────────────────────┘   │
│ [Demais indicadores selecionados pelo usuário (sem corte forçado) / Mais indicadores ▾]          │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 03. DIAGNÓSTICO RÁPIDO   [Melhor dia]   [Pior dia]   [Qualidade do apontamento / Pendências]   │
│     Cada cartão só aparece ou apresenta valor quando houver dado e conceito válidos.             │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 04. ANÁLISES DE DESEMPENHO                                                                     │
│                                                                                                │
│ A. PRODUÇÃO E PLANO  ▾                                                                         │
│ ┌──────────────────────────────────────┐ ┌──────────────────────────────────────┐              │
│ │ Produção boa × Meta × Capacidade     │ │ Atendimento por hora do dia          │              │
│ │ (gráfico legível e clicável)         │ │ (gráfico legível e clicável)         │              │
│ └──────────────────────────────────────┘ └──────────────────────────────────────┘              │
│                                                                                                │
│ B. EFICIÊNCIA DO OEE  ▾                                                                        │
│ ┌──────────────────────────────────────┐ ┌──────────────────────────────────────┐              │
│ │ OEE × Meta por dia                   │ │ D / P / Q                            │              │
│ └──────────────────────────────────────┘ └──────────────────────────────────────┘              │
│ ┌──────────────────────────────────────┐                                                      │
│ │ PPH real × nominal                   │                                                      │
│ └──────────────────────────────────────┘                                                      │
│                                                                                                │
│ C. PERDAS E CONFIABILIDADE  ▾                                                                  │
│ ┌──────────────────────────────────────┐ ┌──────────────────────────────────────┐              │
│ │ Cascata de perdas                    │ │ Pareto de paradas                    │              │
│ └──────────────────────────────────────┘ └──────────────────────────────────────┘              │
│ ┌──────────────────────────────────────┐                                                      │
│ │ Perdas em minutos por dia            │                                                      │
│ └──────────────────────────────────────┘                                                      │
│                                                                                                │
│ D. QUALIDADE  ▾                                                                                │
│ ┌──────────────────────────────────────┐                                                      │
│ │ Scrap % por dia                      │                                                      │
│ └──────────────────────────────────────┘                                                      │
│                                                                                                │
│ E. RESULTADO OPERACIONAL  ▾                                                                   │
│ ┌──────────────────────────────────────┐ ┌──────────────────────────────────────┐              │
│ │ Resultado por turno                  │ │ Produção por catálogo               │              │
│ └──────────────────────────────────────┘ └──────────────────────────────────────┘              │
│                                                                                                │
│ F. EVOLUÇÃO HISTÓRICA  ▾                                                                       │
│ ┌──────────────────────────────────────┐ ┌──────────────────────────────────────┐              │
│ │ Tendência semanal                    │ │ Tendência mensal                    │              │
│ └──────────────────────────────────────┘ └──────────────────────────────────────┘              │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 05. EXPLORAR DADOS [Abrir dia] [Paradas] [Ordens] [Apontamentos] [Gerar relatório do período]   │
│ Estado dos dados / conexão / data de referência                                                │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Interpretação crucial do wireframe

- A grade de **KPIs é ilustrativa**. Não fixar seis cartões e não impor que todos vejam a mesma coisa. **Na visão administrativa, todos os indicadores podem estar habilitados.**
- Os blocos de tema **não substituem** as visões personalizadas. A visão padrão pode receber organização temática; uma visão salva deve manter seus itens, ordenação e larguras atuais salvo migração previamente testada.
- O bloco “Onde atuar agora” **já tem equivalente funcional** (`Decide.html()` e elementos existentes). Priorizar **reposicionar/refinar**, não duplicar cálculo ou criar outra lista incoerente.
- “Diagnóstico rápido” só deve reutilizar dados comprovados: melhor/pior dia existente, qualidade/confiabilidade de apontamento existente. Se não houver informação, mostrar ausência, nunca inventar causa.
- “Explorar dados” reaproveita rotas e ações que já existem; novos links devem ser propostos apenas se o destino real puder manter o contexto.

---

## 5. Wireframe responsivo — CELULAR

```text
┌──────────────────────────────┐
│ VACUTAINER   ☰  ⌕  ☻         │
│ PRODUÇÃO / VISÃO GERAL       │
│ [Período ▼] [Filtros ▾]      │
│ [Visão salva ▼] [Personalizar]│
├──────────────────────────────┤
│ SITUAÇÃO DO PERÍODO          │
│ ┌──────────────────────────┐ │
│ │ OEE valor / meta / gap   │ │
│ │ status + comparação     │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ Principal prioridade    │ │
│ │ [Investigar]            │ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│ INDICADORES [Editar cards]   │
│ [KPI] [KPI]                  │
│ [KPI] [KPI]                  │
│ (todos os selecionados)      │
├──────────────────────────────┤
│ A. Produção e plano       ▾  │
│ [gráfico com leitura adequada]│
│ [outro gráfico]               │
│ B. Eficiência             ▸  │
│ C. Perdas                 ▸  │
│ D. Qualidade              ▸  │
│ E. Resultado              ▸  │
│ F. Tendências             ▸  │
├──────────────────────────────┤
│ Explorar registros / relatório│
└──────────────────────────────┘
```

**Regras mobile:** uma coluna para gráficos; cards em 1 ou 2 colunas conforme a largura; rótulos completos ou truncados com acesso ao texto; alvos de toque confortáveis; filtros avançados recolhíveis; manutenção das ações básicas; nada de transformar em dashboard diferente com dados distintos. Respeitar a navegação e os controles já implementados, sem esconder funções operacionais essenciais.

---

## 6. Inventário de gráficos existentes — PRESERVAR TODOS

A versão consultada apresenta estes **13 blocos analíticos** na Visão Geral padrão. A proposta apenas **reordena/agrupa**:

| Grupo visual proposto | Gráfico existente | Comportamento desejado |
|---|---|---|
| A. Produção | Produção boa × meta e capacidade | Comparar realizado, meta e capacidade com unidade clara; clique no dia preservado. |
| A. Produção | Atendimento por hora do dia | Comparar % de meta por intervalo; período com 1 intervalo não parecer tendência. |
| B. Eficiência | OEE × meta | Mostrar desvio e metas vigentes; clique no dia preservado. |
| B. Eficiência | Disponibilidade, Performance e Qualidade | Três séries distinguíveis, inclusive fora da percepção de cores; período curto tratado. |
| B. Eficiência | PPH real × nominal | Diferença e referência explícitas; não confundir PPH com peças totais. |
| C. Perdas | Cascata de perdas do período | Preservar identidade e valores de cada etapa; rótulos legíveis. |
| C. Perdas | Pareto de paradas | Mostrar principais causas sem perder o clique para eventos/paradas. |
| C. Perdas | Perdas em minutos por dia | Diferenciar apontadas e não explicadas, sem misturar conceitos. |
| D. Qualidade | Scrap % por dia | Exibir contexto de refugo; `0` verdadeiro não é ausência de dados. |
| E. Resultado | Resultado por turno | Comparar DADOS de turnos existentes; não criar turnos faltantes fictícios. |
| E. Resultado | Produção por catálogo | Rótulos legíveis; manter família/cor conforme cadastro. |
| F. Tendência | Tendência semanal | Só representar tendência quando houver semanas suficientes; período insuficiente recebe aviso claro. |
| F. Tendência | Tendência mensal | Só representar tendência quando houver meses suficientes; meta histórica vigente preservada. |

**Não remover gráficos** de relatórios ou de visões salvas porque foram reorganizados no padrão.

### Regras de visualização gráfica

1. **Uma única observação:** preferir comparação realizado × meta/valor anotado, quando já existem ambos, ou gráfico de ponto/coluna com contexto; não desenhar uma “tendência” falsa. Se necessário, manter o gráfico com um estado “1 ponto no período”.
2. **Sem observações:** mensagem “Sem dados no período para esta análise”, com orientação de filtro quando fizer sentido. Não exibir 0% sem base.
3. **Períodos longos:** não sobrepor dezenas de rótulos; usar rótulos seletivos, zoom, tooltip ou barra de rolagem de gráfico, respeitando os recursos existentes.
4. **Escalas:** preservar zero quando a comparação exige; não truncar eixos de modo enganoso; unidades, milhares e porcentagem explícitos.
5. **Meta:** meta histórica vigente; não substituir por meta fixa ilustrativa. Desvio em pontos percentuais para indicadores percentuais quando aplicável.
6. **Cores:** usar padrões semânticos já estabelecidos (adequado, atenção, crítico); cores de séries distintas não substituem legendas/rótulos.
7. **Interação:** preservar tooltips e ações de clique existentes (ex.: `openDayDrawer`, navegação ao Pareto); manter navegação por teclado quando possível.
8. **Layout:** gráficos com alturas adequadas ao volume de dados e legibilidade de títulos; responsividade sem cards excessivamente altos para um único dado.

---

## 7. Indicadores — preservar conteúdo, configurações e conceitos

A visão consultada gera cartões como: **Último catálogo do período; Produção boa; OEE realizado; Disponibilidade; Performance; Qualidade; Capacidade planejada; Meta oficial do período; OEE reportado; OEE real; Fora de turno; Caixas do MES; Atendimento ao plano; Confiabilidade do OEE**. O bloco **Mais indicadores** inclui outros como OEE meta, diferença contra meta, scrap em unidades e %, PPH, perdas, perda não explicada e cobertura do apontamento.

**Regras:**

- Não retirar, renomear arbitrariamente, duplicar ou mudar os cálculos sem solicitação explícita.
- Identificar duplicidades **puramente visuais** entre grade principal e “Mais indicadores” e propor o tratamento sem quebrar as preferências existentes. Exemplos observados no código: Produção boa e Capacidade planejada aparecem em ambas as áreas.
- Preservar **Editar cards**, ordem, largura, visões compartilhadas, perfis e quaisquer regras de escopo de salvamento já implementadas.
- OEE **realizado**, **reportado** e **real** possuem conceitos existentes; **não unificar por nome**, não alterar cálculo nem ocultar qualquer um unilateralmente.
- Faltas de registro, ausência de produção e perda real são estados diferentes. Não substituir `null`/“—” por zero.
- As setas e minigráficos de período anterior devem continuar funcionando.
- Não atrelar cores críticas apenas ao crescimento/queda numérica; a interpretação depende do indicador (ex.: scrap menor é melhor).

---

## 8. Design visual e interação

### Sistema de design

- **Manter** barra global escura, cabeçalho da página, abas, fonte Barlow e Barlow Condensed, ícones, tokens CSS do kit e temas claro/escuro.
- Reaproveitar `fontes/kit/kit_visual.css` e o CSS atual; mudanças globais só após checar impacto nas demais páginas.
- Mostrar informações prioritárias por **hierarquia tipográfica**, não por grandes manchas coloridas.
- Espaçamentos propostos (ajustáveis após screenshot e teste): 8 px entre controles próximos; 12–16 px entre cards; 20–24 px entre grupos; padding 14–18 px nos cards; bordas e raios conforme tokens atuais.
- **Status sempre acompanhado de texto** (ex.: “Abaixo da meta”, “Sem dados”, “Atenção”), não apenas por cor ou ícone.
- Títulos de gráficos objetivos; subtítulo no formato de pergunta de decisão, como já existe no código.
- Os filtros e o nome da visualização ativa devem permanecer perceptíveis ao rolar/analisar. Avaliar sticky leve apenas se não prejudicar a altura visível.
- Recolhimento por **grupo** pode ser adicionado na visão padrão, mas deve coexistir com as dobras de `section.card` e persistências já existentes sem colisão de chaves.

### Estados e casos de borda

- `Sem dados`, `Dados parciais`, `Conectando`, `Base desatualizada`, `Gravação pendente`, `Indicador não aplicável`, `Valor zero confirmado` são situações distintas.
- Períodos sem dados devem oferecer instrução existente (criar lançamento, importar histórico ou ajustar período), não painel vazio confuso.
- Se o diagnóstico não puder provar a causa principal pelos dados, mostrar “Investigar o principal desvio” — jamais inventar “microparadas” ou perda específica.
- Preservar informações da origem dos dados e restrições de cobertura.
- Botões importantes devem ter label e foco visível; cards clicáveis precisam indicar affordance e operar por teclado se aplicável.

---

## 9. Plano de implementação seguro (etapas que exigem validação)

### Fase 0 — Diagnóstico, sem modificar código

- [ ] Ler `CLAUDE.md`, `README.md`, regras visuais e decisões anteriores.
- [ ] Verificar `git status`, branch atual, commit e arquivos alterados; **não sobrescrever mudanças não commitadas**.
- [ ] Localizar as fontes reais da Visão Geral e os testes relevantes.
- [ ] Fazer inventário **antes/depois** de: cartões, gráficos, filtros, modos, botões e ações.
- [ ] Capturar screenshots-base da Visão Geral em tema claro/escuro e múltiplas larguras, com dados de demonstração fictícios.
- [ ] Propor um **plano de alterações por arquivo**, esforço e riscos. **Aguardar aprovação antes de executar.**

### Fase 1 — Organização da Visão Geral padrão

- [ ] Agrupar os 13 gráficos por assunto, conservando suas funções e referências.
- [ ] Melhorar cabeçalhos, espaçamento, legendas e leitura de cards.
- [ ] Não alterar ordem, largura, conteúdo ou escopo de visões salvas sem migração validada.
- [ ] Reaproveitar a priorização atual no primeiro bloco; não criar outro diagnóstico independente.
- [ ] Validar cartões na visualização do administrador **com todos habilitados** e na visualização enxuta de outros perfis.

### Fase 2 — Qualidade de gráficos e drill-down

- [ ] Resolver estados de uma observação, ausência e período longo, sem alterar indicadores.
- [ ] Melhorar escala, unidade, meta e legenda para cada gráfico.
- [ ] Testar cliques para detalhe do dia, Pareto, paradas e outras rotas existentes.
- [ ] Só propor novos atalhos quando houver destino suportado e contexto de filtros preservável.

### Fase 3 — Responsividade, acessibilidade e homologação

- [ ] Validar desktop, notebook, tablet e celular, temas claro/escuro.
- [ ] Verificar largura total, títulos, labels, tabelas, acessibilidade do recolhimento e teclado.
- [ ] Testar modo TV, personalização, perfis, visão compartilhada, relatório, impressão, exportação e retorno à página.
- [ ] Documentar antes/depois com screenshots e changelog por arquivo.
- [ ] Publicar **apenas após** revisão e aprovação expressa.

---

## 10. Controles de não regressão

### Fluxos fundamentais que não podem sofrer efeito colateral

- Lançamentos do dia, Hora a Hora, turnos, ordens, catálogo, scrap, paradas, metas e fechamento/reabertura.
- D × P × Q, OEE realizado/reportado/real, vigências, produção fora de turno e integrações SAP/MES.
- Leitura e persistência JSON; gravações concorrentes; backups, filas pendentes e sincronização.
- Visão padrão, **visualização por perfil/usuário** e **visualização geral compartilhada**; personalização com escopo correto.
- Modo TV, relatórios, impressão e exportações (inclusive eventuais visões montadas).
- Tema claro/escuro, identidade visual da suíte, navegação global e atalho de busca.

### Comandos documentados no repositório

Executar da **raiz do projeto**, conforme disponibilidade de dependências e `CLAUDE.md` atual:

```bash
python fontes/producao/build.py
node testes/tvisual.js
node testes/tpg.js
node testes/tperiodo.js
node testes/toeereal.js
node testes/trelatorios.js
node testes/tudo.js
```

> **Observação:** a suíte pode ter mudado desde a leitura. Conferir os scripts de teste existentes e dependências. Registrar **PASSOU / FALHOU / NÃO VERIFICADO** — nunca afirmar sucesso sem execução. Caso o build também afete o kit ou outros módulos, seguir a ordem oficial, incluindo `python fontes/demo/gerar_demo.py` **por último**, segundo o `CLAUDE.md`.

### Evidência esperada da entrega

1. Lista de arquivos-fonte alterados (e motivo de cada alteração).
2. Capturas comparativas: antes/depois, tema claro/escuro, desktop/mobile.
3. Matriz de regressão: **13 gráficos**, todos os cartões (inclusive os administrativos), filtros, views salvas/compartilhadas, exportação/TV/relatórios.
4. Resultado real de cada teste, com erro e motivo quando houver.
5. Commit isolado em branch de trabalho, com mudança de escopo limitada ao que foi aprovado.
6. Relatório de riscos remanescentes e passos de rollback.

---

## 11. Critérios de aceite do responsável

O trabalho só está concluído quando:

- [ ] O administrador consegue habilitar **todos os indicadores** como antes, com leitura organizada.
- [ ] Cada visualização individual ou geral abre com os mesmos indicadores e configurações que tinha antes, exceto alteração de layout aprovada conscientemente.
- [ ] Nenhum dos **13 gráficos** foi removido ou perdeu ação, filtro, meta ou dado.
- [ ] O mesmo período exibe exatamente os mesmos **valores numéricos** antes e depois do redesign.
- [ ] Os quadros de situação/diagnóstico usam **dados existentes e regras oficiais**, sem novo cálculo paralelo.
- [ ] Um período com apenas um dia, sem dados ou com dados incompletos tem apresentação honesta e compreensível.
- [ ] Os testes essenciais executados passam ou os bloqueios são declarados.
- [ ] O layout funciona em claro/escuro e em diferentes larguras, sem rolagem horizontal da página por vazamento de componentes.
- [ ] O modo TV, impressão e relatórios não apresentam regressão.
- [ ] A alteração foi revisada visualmente e aprovada **antes de qualquer publicação**.

---

## 12. Prompt para colar no Claude Code

Copie o bloco abaixo **depois de salvar este arquivo no repositório**, por exemplo em `docs/ux/UX_Wireframe_Visao_Geral_OEE_Vacutainer.md`:

```text
Leia integralmente:
1. CLAUDE.md da raiz;
2. docs/auditorias/registro-decisoes.md nas seções relevantes de layout e Produção;
3. docs/ux/UX_Wireframe_Visao_Geral_OEE_Vacutainer.md;
4. os arquivos-fonte de fontes/producao/ responsáveis pela Visão Geral e pelo kit, bem como os testes correspondentes.

Quero melhorar a UX/UI da Visão Geral do OEE Vacutainer de acordo com esse documento, sem perder nenhuma funcionalidade existente. A tela que mostrei com todos os indicadores era intencionalmente uma visão administrativa — não reduza nem elimine indicadores ou gráficos. As visões individuais e compartilhadas já existem e devem ser preservadas.

ETAPA 1 — SOMENTE ANÁLISE, SEM MODIFICAR ARQUIVOS:
- Faça inventário do que já existe e associe cada item da especificação ao código atual.
- Aponte funcionalidades já atendidas que não precisam ser reconstruídas.
- Identifique exatamente quais fontes precisarão ser editadas. Não edite o HTML gerado em paginas/OEE-Vacutainer.html.
- Proponha o layout final da Visão Geral padrão e a política de compatibilidade com as visões salvas.
- Informe riscos, testes e sequência de trabalho em pequenas entregas.
- Não altere cálculos, bases JSON, persistência, permissões, rotas, fluxos de produção, relatórios, Modo TV ou outras páginas.
- Não edite código, não faça commit/push/merge e não publique ainda. Aguarde minha aprovação expressa do plano.

Depois que eu aprovar, implemente em uma branch isolada, com commits pequenos, screenshots comparativos, build oficial e testes. Informe sempre PASSOU, FALHOU ou NÃO VERIFICADO. Se algo do documento divergir da main atual, pare e me mostre a divergência antes de decidir.
```

---

## 13. Como usar este documento sem perder nada

1. **Baixar** este `.md` para o computador.
2. Abrir a **pasta do repositório local** no Claude Code; não executar diretamente na pasta compartilhada de produção.
3. Salvar o arquivo em `docs/ux/UX_Wireframe_Visao_Geral_OEE_Vacutainer.md` dentro do repositório. Criar `docs/ux/` se ainda não existir.
4. Conferir se o arquivo está lá, juntamente com `CLAUDE.md` e `fontes/producao/`.
5. Colar no Claude Code o prompt da seção 12.
6. Aprovar **apenas o plano primeiro**. Depois aprovar a implementação por etapas.
7. Usar branch + commits + evidências antes de publicar. **Markdown registra requisitos, mas quem protege o código é o controle de versão e os testes.**

### Fonte de verdade e prioridade em caso de conflito

1. **Dados e comportamentos atuais validados** (não quebrar produção).
2. **Contratos/regras documentadas em `CLAUDE.md` e documentos oficiais do repositório.**
3. **Decisões expressas do responsável** na conversa e neste briefing (especialmente não remover indicadores e preservar views).
4. **Proposta visual deste documento** — ajustável apenas para compatibilidade, acessibilidade e aprovação.

**Fim do briefing.**

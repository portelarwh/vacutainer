# Vacutainer — análise visual e plano de padronização

**Referência:** `portelarwh/vacutainer`, `main` no commit `142b9c208831198b8a75566e596840b0fd92b6b5` (PR #5).  
**Data:** 06/11/2026.  
**Escopo:** Portal, Produção, Waste, Gestão de Gel e Paradas. Esta análise trata da apresentação, da navegação e da leitura da informação. A auditoria não alterou código da aplicação; esta pasta registra o diagnóstico e suas evidências.

## 1. Parecer

As páginas já pertencem à mesma família visual: barra escura de sistemas, título em caixa alta, mesmas famílias de fontes, temas claro/escuro, cartões brancos ou escuros, bordas suaves e indicadores com destaque lateral. Essa base deve ser mantida.

**Ainda não existe uniformidade suficiente para a troca parecer completamente contínua.** Os principais desvios estão na geometria do cabeçalho, na navegação do Gel, no alinhamento em monitores largos, na escala dos indicadores e no tratamento dos estados. A preferência de tema também se perde ao passar por Paradas. Há ainda dois problemas concretos de leitura: textos muito reduzidos nos gráficos pequenos do Portal e contraste baixo em alguns controles no tema escuro.

A direção recomendada é **uma estrutura comum e poucas variantes explícitas de componente**, preservando o conteúdo próprio de cada módulo. O Portal pode continuar sendo um resumo entre sistemas; o Gel precisa do kanban e dos barris; Waste precisa das análises financeiras; Produção e Paradas precisam de suas séries operacionais.

## 2. Como a análise foi feita

- Leitura do `CLAUDE.md`, registro de decisões, documentação do padrão comum, CSS e marcação das cinco páginas.
- Renderização em Chromium, nos temas claro e escuro, nas larguras de **1920, 1440, 1280, 1024, 768 e 390 px**: 60 combinações de página, tema e largura.
- Inspeção de estados iniciais e exemplos incorporados. Também foram abertas Pendências/Relatórios do Portal, Mensal/Ordens da Produção, Comparativos/Ações do Waste, Painel/Idade e validade/Consumo do Gel e Pareto/Eventos de Paradas.
- Medição de posições, dimensões, fontes e cores efetivamente renderizadas. O tamanho dos textos SVG considera a escala aplicada pelo navegador.
- Navegação entre sistemas na mesma aba, persistência do tema e observação do menu da Produção por foco de teclado.

Os exemplos são fictícios. Na Produção, foi retirada somente na cópia em memória a marca que exclui os dias de demonstração da consolidação, para inspecionar os gráficos e indicadores preenchidos. Não houve gravação em base ou alteração de HTML.

As páginas foram servidas por um adaptador HTTP local; as fontes Barlow, Barlow Condensed e IBM Plex Mono foram carregadas por um cache externo ao projeto. Não foram avaliados o tempo de abertura na rede real, todas as configurações personalizadas nem cada modal, relatório impresso e tela de TV. As recomendações de densidade são de design, não resultado de pesquisa com operadores.

## 3. Comparação objetiva

Medidas no tema claro, viewport de 1440 px. As alturas usam o estado inicial, sem faixa de exemplo acima do sistema. O conteúdo das pílulas pode exigir mais linhas quando houver conexão, avisos ou nomes maiores.

| Elemento | Portal | Produção | Waste | Gestão de Gel | Paradas |
|---|---:|---:|---:|---:|---:|
| Largura máxima do contêiner | 1560 px | 1560 px | 1560 px | **1500 px** | **1600 px** |
| Margem externa do `body` | 0 | 0 | 0 | **8 px** | 0 |
| Altura da barra de sistemas | 47 px | 47 px | 47 px | 47 px | 47 px |
| Altura da faixa da página | 50,8 px | 50,8 px | 50,8 px | **84,9 px** | 49,6 px |
| Altura da faixa de abas | 43,8 px | **49,8 px** | 43,8 px | 41,6 px | 45 px |
| Fonte das abas | 15 px | 15 px | 15 px | **13,5 px** | 15 px |
| Valor de indicador | 22 px no resumo / 24 px em KPI | 28 px | 24 px | 30 px no topo / 24 px no painel | 28 px |
| Modelo de navegação local | Abas diretas | Grupos com menus | Abas diretas | Abas que quebram linha | Abas com rótulos de grupo |

Em 1920 px, a borda esquerda do contêiner está em **180 px** no Portal/Produção/Waste, **210 px** no Gel e **160 px** em Paradas. A diferença entre Gel e Paradas chega a **50 px**. Na passagem entre elas, a marca, os links e o conteúdo mudam de posição.

### O que já está bom

- A barra de sistemas é reconhecível e mantém a ordem dos módulos.
- Busca, usuário, administração e tema seguem a mesma organização geral.
- Sincronizar, Backup e TV já aparecem como ações recorrentes.
- Cantos de 10 px, espaçamento de 12 px entre KPIs e borda lateral de 4 px já aparecem em vários módulos.
- A navegação entre sistemas foi feita na mesma aba. Portal, Produção, Waste e Gel leram o tema escuro compartilhado; Paradas apresentou a divergência descrita em V08.
- O menu agrupado da Produção abriu por foco e permitiu alcançar o primeiro item por Tab no cenário observado.

## 4. Achados e recomendações

As prioridades abaixo são **de melhoria visual**, não uma reclassificação dos problemas funcionais das auditorias anteriores.

### V01 — Estrutura e cabeçalho mudam de posição entre módulos — prioridade alta

**Observado:** o Gel não zera a margem padrão do `body`, tem contêiner mais estreito e coloca oito ações na faixa da página. Em 1440 px, as ações já ocupam outra linha, enquanto Portal e Waste usam uma faixa mais baixa. Paradas tem outro limite de largura e altura de linha.

**Efeito:** há deslocamentos horizontais e verticais justamente na região usada para orientar a navegação.

**Recomendação:**

- Adotar o contêiner de 1560 px e espaçamento lateral de 16 px já usados em três páginas; zerar a margem externa em todas.
- Uniformizar altura de linha, dimensões dos botões, espaçamentos e alinhamento do título, versão e status.
- Manter Sincronizar, Backup e TV na mesma ordem e posição relativa. O menu de TV do Gel pode continuar existindo.
- Reservar espaço para uma ação principal de cada módulo, como “Lançar meu turno” ou “Importar relatório”.
- Levar as demais ações do Gel para a barra da aba ou para um menu de ações secundárias identificado. Não esconder ações frequentes sem observar o uso real.
- Em telas menores, usar uma quebra planejada em duas linhas; evitar que o tamanho de cada texto decida sozinho onde todos os controles cairão.

**Referências:** [Gel: CSS inicial](https://github.com/portelarwh/vacutainer/blob/142b9c208831198b8a75566e596840b0fd92b6b5/paginas/Gest%C3%A3o-Gel-Vacutainer.html#L31), [Gel: ações do cabeçalho](https://github.com/portelarwh/vacutainer/blob/142b9c208831198b8a75566e596840b0fd92b6b5/paginas/Gest%C3%A3o-Gel-Vacutainer.html#L602), [Paradas: contêiner](https://github.com/portelarwh/vacutainer/blob/142b9c208831198b8a75566e596840b0fd92b6b5/paginas/Paradas.html#L28).

### V02 — Abas têm comportamentos e densidades diferentes — prioridade alta

**Observado:** a Produção usa seis grupos com menus; Paradas mistura rótulos de grupo e doze abas; Waste usa nove abas; Gel usa onze abas, com fonte menor e quebra de linha. Em 1024 px, a faixa de abas do Gel mede aproximadamente **84 px**, contra 44–50 px nos outros módulos. Em 390 px, chega a **169 px**.

**Efeito:** o início do conteúdo muda muito de altura e a pessoa precisa aprender formas diferentes de encontrar as seções. O problema é maior no Gel em telas menores.

**Recomendação:** estabelecer a mesma aparência e um comportamento responsivo comum: fonte, altura mínima, padding, marca ativa de 3 px e estilo dos contadores. Poucas seções podem continuar como abas diretas; muitas seções podem usar grupos com menus, aproveitando o padrão existente na Produção. O Gel não deve expandir a navegação em várias linhas sem limite. Se houver rolagem horizontal, indicar que existem itens fora da área visível e manter a seleção perceptível.

Não é necessário dar os mesmos nomes às abas de sistemas com tarefas diferentes. A consistência deve estar na interação e na hierarquia.

**Referências:** [Gel: quebra de abas](https://github.com/portelarwh/vacutainer/blob/142b9c208831198b8a75566e596840b0fd92b6b5/paginas/Gest%C3%A3o-Gel-Vacutainer.html#L94), [Produção: grupos e menus](https://github.com/portelarwh/vacutainer/blob/142b9c208831198b8a75566e596840b0fd92b6b5/paginas/OEE-Vacutainer.html#L8248), [Paradas: abas](https://github.com/portelarwh/vacutainer/blob/142b9c208831198b8a75566e596840b0fd92b6b5/paginas/Paradas.html#L198).

### V03 — Cards compartilham a ideia, mas não uma hierarquia uniforme — prioridade média

**Observado:** os valores usam 24, 28 ou 30 px, com pesos e espaços diferentes. Produção inclui meta, melhor/pior, comparação e minigráfico no mesmo card; Waste usa cards mais compactos. No Gel, o topo usa borda lateral e o painel analítico usa borda superior. O Portal apresenta os quatro indicadores de cada módulo em uma grade interna de 2 × 2.

**Efeito:** indicadores com importância semelhante aparentam pesos diferentes. A quantidade de detalhes também altera bastante a altura dos cards.

**Recomendação:** definir três variantes deliberadas:

| Variante | Uso | Conteúdo recomendado |
|---|---|---|
| Indicador principal | Topo de uma aba operacional ou analítica | Rótulo, valor e unidade, contexto curto; meta/status quando aplicável |
| Indicador compacto | Resumo por módulo no Portal ou bloco secundário | Mesmo vocabulário visual, valor menor, uma linha de contexto |
| Card operacional | Barril, lote, ordem ou ocorrência | Identificação, estado, informação para decidir e ações da tarefa |

Para o indicador principal, 28 px é uma boa referência já existente. Reservar uma segunda linha ou expansão para comparação, melhor/pior e detalhes. Usar ícone quando ajudar a reconhecer o assunto; manter borda e ícone discretos nos estados neutros. Não obrigar todos os cards da aplicação a terem a mesma altura: alinhar os componentes equivalentes e os integrantes da mesma linha.

No Portal, manter o agrupamento por módulo. Replicar a estrutura visual do indicador compacto, sem criar quatro conjuntos completos de grandes KPIs.

**Referências:** [Portal: indicadores compactos](https://github.com/portelarwh/vacutainer/blob/142b9c208831198b8a75566e596840b0fd92b6b5/paginas/Portal.html#L209), [Gel: cards do painel](https://github.com/portelarwh/vacutainer/blob/142b9c208831198b8a75566e596840b0fd92b6b5/paginas/Gest%C3%A3o-Gel-Vacutainer.html#L407).

### V04 — Cores e pílulas precisam comunicar o mesmo estado — prioridade média

**Observado:** Portal, Produção e Waste usam `accent #1d4b73`, enquanto Paradas usa `#2f6db5`. Os verdes, vermelhos e tons de atenção também variam. O modo de exemplo aparece em roxo no Portal/Produção/Waste, em vermelho no Gel e em âmbar em Paradas. As pílulas alternam entre fonte condensada em caixa alta e fonte de corpo com capitalização normal.

Há sinais diferentes dentro de um mesmo indicador: na Produção, o OEE de 70,4%, com meta de 72,3%, recebeu borda/ícone âmbar e número vermelho; “Confiabilidade: Média” também teve borda âmbar e texto vermelho. **É uma escolha explícita do código atual**, que pinta de vermelho valores em atenção ou críticos, e não prova erro no cálculo do semáforo. No Waste, “Críticas/altas sem causa” aparece com valor âmbar e borda azul.

**Recomendação:**

- Unificar os tokens de superfície, borda, texto, azul de ação e estados gerais nos dois temas.
- Definir verde = condição adequada; âmbar = atenção; vermelho = condição crítica/erro; azul = ação/informação; cinza = neutro ou sem dados. Manter identificação textual.
- Reservar roxo para o estado especial já utilizado, com rótulo claro quando representar exemplo ou bloqueio. Cores de classe de parada, turnos e categorias continuam com sua legenda de domínio.
- Aplicar um mesmo estado visual à borda, ao ícone e ao valor do KPI. Se houver duas regras diferentes, explicar essa diferença em vez de deixar que as cores pareçam contraditórias.
- Usar pílula suave por padrão; preenchimento forte fica para situações que precisam se destacar. Badge de quantidade e botão de filtro selecionado devem ter funções reconhecíveis, mesmo quando compartilham formato arredondado.
- Padronizar a apresentação de “Modo de exemplo”, “Base na pasta”, “Só neste navegador”, “Gravação pendente” e “Sem dados”. A falha de gravação deve continuar explícita e prioritária.

Isso não exige alterar metas, limiares, `sev`, `exportsVersion` ou regras de negócio.

**Referências:** [Produção: estado do KPI](https://github.com/portelarwh/vacutainer/blob/142b9c208831198b8a75566e596840b0fd92b6b5/paginas/OEE-Vacutainer.html#L4872), [Paradas: paleta](https://github.com/portelarwh/vacutainer/blob/142b9c208831198b8a75566e596840b0fd92b6b5/paginas/Paradas.html#L22).

### V05 — Há perda de contraste no tema escuro — prioridade alta para leitura

Foram medidos pares de cores sólidos em controles realmente exibidos. Referência para texto pequeno: contraste de **4,5:1**.

| Exemplo no tema escuro | Texto / fundo | Contraste aproximado |
|---|---|---:|
| Contador de pendências da Produção e do Waste | Branco / `#f39a5a` | **2,19:1** |
| Contador “Pendências Almox” do Gel | Branco / `#ff6464` | **2,89:1** |
| Botão “Resolver” de Paradas | Branco / `#6aa5e6` | **2,58:1** |

Além disso, Paradas mantém `color-scheme: normal` mesmo no tema escuro; nos controles de data observados, o ícone nativo de calendário fica preto sobre fundo escuro.

**Recomendação:** criar cor de texto sobre preenchimento para cada tema e usá-la também nos contadores. Em fundo claro ou luminoso no tema escuro, usar texto escuro quando necessário. Configurar o esquema dos controles nativos de Paradas. Conferir contraste no componente renderizado, incluindo estados ativo, hover e foco.

**Referências:** [Paradas: botão principal](https://github.com/portelarwh/vacutainer/blob/142b9c208831198b8a75566e596840b0fd92b6b5/paginas/Paradas.html#L33), [Gel: contador](https://github.com/portelarwh/vacutainer/blob/142b9c208831198b8a75566e596840b0fd92b6b5/paginas/Gest%C3%A3o-Gel-Vacutainer.html#L97), [Waste: contador](https://github.com/portelarwh/vacutainer/blob/142b9c208831198b8a75566e596840b0fd92b6b5/paginas/Perdas-Ordem.html#L91).

### V06 — Gráficos precisam de padrão de leitura e adaptação ao espaço — prioridade alta no Portal

**Observado:** o gráfico diário de Produção dentro do card do Portal chega a cerca de **5,3 px** nos textos de eixo/valor e **5,8 px** nas datas, em 1440 px. O SVG mantém uma área interna grande e encolhe para caber em um dos quatro cards. A diferença foi medida considerando a transformação aplicada ao texto. Não é apenas uma fonte declarada pequena.

Os demais módulos usam gráficos maiores e mais legíveis, mas variam em títulos, subtítulos, formatação de unidades, posição dos rótulos e composição das legendas. No gráfico mensal de Paradas, há marcas de eixo em horas e outras como números sem unidade na mesma escala, exigindo interpretação adicional.

**Recomendação:**

- No Portal, tratar a visualização como tendência compacta: menos datas/valores impressos e detalhe acessível ao abrir o módulo. Alternativamente, oferecer expansão do gráfico. Não reduzir uma análise completa até caber no resumo.
- Buscar texto renderizado de 11–12 px em gráficos analíticos; no resumo, retirar elementos secundários antes de encolher o texto.
- Padronizar título, subtítulo com período/unidade, eixos discretos, legenda e linha de meta tracejada.
- Definir o formato da unidade para toda a escala: minutos, horas, kg, %, R$ ou mil tubos.
- Manter uma cor de série para tendências neutras; usar cores de estado quando a série realmente representa o cumprimento de uma condição. Manter cores categóricas estáveis e com legenda.
- Não representar “sem dados” como zero, nem usar somente cor para informar estado.

Não é necessário trocar o motor dos gráficos: os SVGs atuais podem receber esses ajustes.

**Referências:** [Portal: gráfico SVG](https://github.com/portelarwh/vacutainer/blob/142b9c208831198b8a75566e596840b0fd92b6b5/paginas/Portal.html#L672), [Portal: gráfico no resumo](https://github.com/portelarwh/vacutainer/blob/142b9c208831198b8a75566e596840b0fd92b6b5/paginas/Portal.html#L892), [Paradas: gráficos](https://github.com/portelarwh/vacutainer/blob/142b9c208831198b8a75566e596840b0fd92b6b5/paginas/Paradas.html#L609).

### V07 — A densidade precisa de uma hierarquia comum — prioridade média

**Observado:** na amostra do Waste, filtros, atalhos de competência, resumo financeiro e tabela de competências vêm antes de nove KPIs, com repetição de totais em vários blocos. O Gel tem oito ações no cabeçalho e, no Painel, duas camadas de indicadores. A Produção mostra duas faixas de demonstração e cards com vários detalhes. Paradas coloca Ação prioritária antes dos filtros; Produção a coloca depois dos filtros; Gel, depois dos indicadores e filtros.

Esses casos não justificam remover informação útil. Pedem uma hierarquia mais previsível.

**Proposta de composição:**

1. Cabeçalho e navegação estáveis.
2. Estado impeditivo ou falha de gravação, quando existir.
3. Contexto e filtros essenciais, com o recorte aplicado sempre visível.
4. Resumo principal, geralmente com 4–6 indicadores; 7 pode ser adequado quando cada um tem função clara.
5. Ação prioritária e até três próximas decisões, em posição consistente nas abas que tenham essa função.
6. Dois gráficos de primeira leitura, quando necessários; demais análises em seções próprias.
7. Tabela e detalhes consultáveis sem perder filtros e contexto.

No Waste, testar a reunião de resumo e KPIs para reduzir repetição, mantendo o período sempre explícito. No Painel do Gel, distinguir claramente “Hoje” de “Período selecionado”. Na Produção, usar a expansão “Mais indicadores”, que já existe, e revisar a repetição de avisos de demonstração. Em tabelas, preferir sinalização na coluna de estado e no valor relevante; limitar grandes áreas vermelhas aos casos em que esse destaque realmente ajuda.

A quantidade exata deve ser validada com o uso. Não transformar todo módulo em um painel resumido, nem aplicar o limite de gráficos ao kanban operacional do Gel.

### V08 — Paradas quebra a continuidade do tema escolhido — prioridade alta

**Observado na navegação:** com a preferência do navegador em claro e `vac.theme` contendo a string simples `dark`, Portal, Produção, Waste e Gel ficam escuros. Ao abrir Paradas, a página volta ao claro. O leitor `LS.get` tenta interpretar `dark` como JSON, falha e usa `auto`.

Na direção inversa, o botão de tema de Paradas grava a string serializada como JSON, com aspas no valor armazenado. Os demais módulos esperam a string simples e não reconhecem essa escolha corretamente. Esse formato diferente é suficiente para quebrar a continuidade mesmo sem mudar o navegador, a pasta ou os dados.

**Recomendação:** padronizar especificamente a chave compartilhada `vac.theme`: ler os valores legados com e sem serialização e passar a gravar `auto`, `light` ou `dark` como string simples. Não alterar indiscriminadamente o `LS.get` genérico de Paradas, porque outras preferências próprias podem precisar de JSON. Conferir a navegação de ida e volta com tema explícito diferente do tema do sistema.

**Referências:** [Paradas: leitor/gravação de preferências e tema](https://github.com/portelarwh/vacutainer/blob/142b9c208831198b8a75566e596840b0fd92b6b5/paginas/Paradas.html#L231), [Portal: tema compartilhado](https://github.com/portelarwh/vacutainer/blob/142b9c208831198b8a75566e596840b0fd92b6b5/paginas/Portal.html#L507).

## 5. Padrão visual recomendado

| Parte | Diretriz inicial |
|---|---|
| Estrutura | Contêiner de 1560 px, padding lateral de 16 px, `body` sem margem |
| Tipografia | Preservar Barlow no corpo, Barlow Condensed em títulos/indicadores e IBM Plex Mono em códigos; limitar caixa alta a rótulos curtos |
| Cabeçalho | Mesma geometria e ordem das ações comuns; uma ação principal do módulo; ações secundárias na área da tarefa |
| Abas | Mesma escala, marca ativa e contadores; grupos quando houver muitas seções; quebra responsiva planejada |
| Indicador principal | Valor de referência de 28 px, rótulo de 12–13 px, contexto de 12 px, cantos de 10 px, intervalo de 12 px |
| Indicador compacto | Versão menor da mesma família, adequada ao resumo do Portal |
| Card de tarefa | Identificação + estado + informação para agir + ações; manter o desenho do domínio |
| Pílula | Fundo suave, texto legível e estado explícito; variantes fortes restritas a destaque necessário |
| Gráfico | Título, período/unidade, escala coerente, legenda e leitura adequada à largura real |
| Tema escuro | Tokens próprios de texto sobre preenchimento; contraste verificado também em badges e controles nativos |
| Fluidez | Alinhamento e comportamento previsíveis primeiro; transições curtas de hover/foco podem ser refinadas depois |

## 6. Plano de implementação

### Prioridade 1 — Corrigir os saltos visuais e a leitura

1. Corrigir o formato da preferência de tema de Paradas e confirmar a continuidade na ida e na volta.
2. Unificar contêiner, margem do `body`, altura de linha, botões e alinhamentos do cabeçalho.
3. Reorganizar as ações do Gel e seu comportamento de abas em 1024/768/390 px.
4. Corrigir os contrastes medidos e os controles nativos de Paradas no tema escuro.
5. Reduzir a densidade do gráfico compacto do Portal, preservando acesso ao detalhe.

**Aceite:** o tema explícito é mantido na navegação entre as cinco páginas e no retorno; os elementos equivalentes da barra ocupam as mesmas posições entre páginas na mesma largura; a navegação do Gel não forma várias linhas sem limite; nenhum botão ou status importante fica inacessível; os pares de cores apontados atingem contraste adequado; os textos preservados no gráfico podem ser lidos na dimensão real.

### Prioridade 2 — Consolidar componentes e hierarquia

1. Documentar e aplicar as variantes principal, compacta e operacional de card.
2. Padronizar pílulas, badges e seleção de filtros; revisar as cores divergentes dentro de KPIs.
3. Uniformizar títulos, unidades e legendas dos gráficos.
4. Reorganizar blocos repetidos no Waste e distinguir os dois recortes de indicadores do Gel.
5. Harmonizar a posição de filtros, resumo e próximas decisões nas telas equivalentes.

**Aceite:** rótulo, valor, unidade, período e estado são localizados da mesma forma em componentes equivalentes; o contexto permanece visível ao expandir detalhes; os fluxos operacionais mantêm suas informações e ações.

### Prioridade 3 — Sustentar o padrão e conferir na operação

1. Consolidar o CSS comum na etapa de geração/cópia do kit, com limites claros para as variantes locais.
2. Registrar exemplos visuais dos componentes nos dois temas.
3. Acrescentar uma verificação visual curta das cinco páginas nas larguras usadas na operação, incluindo nome de usuário longo, status de conexão e pendência de gravação.
4. Conferir na pasta real, com logo e configurações usados pela equipe; observar algumas tarefas de operador e liderança para ajustar densidade.

**Compatibilidade com as decisões existentes:** manter os HTMLs únicos e o funcionamento offline da distribuição. O atual `aplicar_kit21.py` copia JavaScript e o catálogo de sistemas; ele **ainda não padroniza todo o CSS visual**. Sua ampliação e a integração com o build da Produção podem distribuir o CSS comum embutido em cada HTML. Não é proposta a criação de dependências externas de interface em tempo de execução.

Na Produção, implementar pelos arquivos em `fontes/producao/` e pelo build; não editar o HTML gerado diretamente. Mudanças comuns devem chegar às cinco páginas na mesma entrega.

## 7. Evidências nesta pasta

- [Índice das evidências visuais](evidencias/README.md): cabeçalhos das cinco páginas nos dois temas, telas principais com dados fictícios e o caso responsivo do Gel.
- [Medições comparativas](evidencias/medicoes.json): dimensões e cores das cinco páginas nos dois temas e seis larguras.
- [Reprodução da continuidade do tema](evidencias/continuidade-tema.json): estados observados na navegação Portal → Paradas → Portal.

As capturas são uma seleção da auditoria; registram o estado do commit analisado e não um protótipo de redesign. Os horários e números pertencem aos exemplos fictícios usados na inspeção.

**Recomendação de sequência:** começar pela continuidade do tema, pela estrutura e pelas abas do Gel; corrigir leitura e contraste na mesma etapa; em seguida harmonizar cards, pílulas e organização do conteúdo. A identidade existente já permite esse avanço com mudanças pontuais.

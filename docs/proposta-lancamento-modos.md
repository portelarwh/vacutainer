# Proposta LANC-03 · aba Lançamento por modo (hora a hora, por turno, dia) e scrap por turno ou diário

Pedido do responsável (20/11/2026). **LANC-04 (itens 0.1 e 0.2) entregue na Produção 2.6.22 / plataforma 1.8.31. LANC-03: etapa a (itens 0 e 1.1) entregue na Produção 2.6.23 / plataforma 1.8.32; etapa b (itens 1, 2 e 7) na Produção 2.6.24 / plataforma 1.8.33; etapa c (item 9) na Produção 2.6.25 / plataforma 1.8.34; etapa d (itens 3, 5 e 6) na Produção 2.6.26 / plataforma 1.8.35; etapa e1 (modo Dia) na Produção 2.6.27 / plataforma 1.8.36; falta a e2 (Segurança e qualidade do dia e obrigatórias, Excluir dia antigo).** Muda a interface da aba Lançamento da Produção (`motor/oee`, LANC-02, cartões `lc-*`/`tl-*`). Os números, as fórmulas e as permissões continuam iguais (contrato 6), O modo "Dia" foi decidido como "só no dia" (item 4), sem rateio entre turnos ou horas.

## Pedidos do responsável (conferência)

| # | Pedido | Onde |
|---|---|---|
| 1 | Sem itens repetidos nem poluição visual | 1, 7 |
| 2 | Menu ⋮ Mais ações: Ações do dia, Correções, Consulta | 2 |
| 3 | Fechar dia sempre visível | 1 |
| 4 | Pílulas de Lançamento: Hora a hora, Por turno, Dia; a página se adapta | 3 |
| 5 | Pílulas de Scrap: Por turno (campo em cada turno) ou Diário | 5 |
| 6 | Hora extra por turno, com os indicadores do turno ajustados | 6 |
| 7 | Modo Dia só no dia, sem rateio; cada reporte vale só no seu nível | 4 |
| 8 | Manter Segurança e qualidade e a tabela hora a hora detalhada | 3.1 |
| 9 | Dia: abono e observação do dia. Turno: abono/revezamento, hora extra, observação e paradas de cada turno | 3.1 |
| 10 | Segurança e qualidade obrigatórias; o turno é opcional e a conta é do dia | 3.1 |
| 11 | Validação: botão para ir até o ajuste (cobertura, divergência…) | 9 |
| 12 | Cards resumo em bloco recolhível, expandido por padrão | 1.1 |
| 13 | Topo da página Produção conforme a imagem enviada (cabeçalho, abas e barra de ações) | 0 |
| 14 | Config. › Abas refletida na página (destaque, cores, estado): **pendência própria LANC-04** | 0.1 |
| 15 | Gráficos que não mudam de tamanho (1/1, 1/2, 1/3) nem de lugar; grade de até 3 lado a lado: **LANC-04** | 0.2 |

## 0. Topo da página Produção (decisão do responsável, 20/11/2026)

Segue a imagem enviada. Vale para todas as abas da Produção. Muda só o arranjo: IDs, handlers, permissões e travas continuam os mesmos.

**Cabeçalho, uma linha:**
- À esquerda, o título "Produção" e o subtítulo "Plano, ordens, apontamento e desempenho da linha".
- À direita, em ordem:
  - **chip de situação** com ponto colorido, no lugar do botão vermelho "Status": "Sistema online" (verde), "Atenção" (âmbar) ou "Sem conexão com a pasta" (vermelho). O chip lê o mesmo estado e o clique abre o mesmo painel de hoje;
  - **?** (ajuda);
  - **Atualizar** (ícone ↻);
  - **Trocar pasta** (botão principal azul, `data-act="connect"`; sem pasta conectada vira "Conectar pasta da rede"; na Demonstração fica oculto ou desabilitado com explicação).

**Abas**, um cartão com divisória abaixo, nesta ordem:
1. Visão geral
2. Lançamento
3. Pendências
4. Paradas
5. Resultados
6. Plano do mês
7. Relatórios
8. Equipamentos
9. Config.
10. Ordens e lotes
11. SQDCP

Os rótulos ficam padronizados ("Visão geral", não "Visão Geral"; "Config." sem a engrenagem). A rota de cada aba continua a mesma.

**Barra de ações**, no mesmo cartão das abas, abaixo da divisória:
- À esquerda: **← Voltar** (secundário) e **+ Lançar meu turno** (laranja, principal da operação).
- À direita: **↻ Sincronizar**, **Backup** (ícone de pasta) e **Modo TV** (ícone de monitor; hoje o rótulo é só "TV").
- Botões com ícone e altura iguais. No celular, a barra quebra em duas linhas e mantém Lançar meu turno primeiro.

**Seletor do dia:** a barra Data / Linha / "Ver o dia inteiro (24 h)" fica logo abaixo, sem mudança, e o cabeçalho do dia (item 1) vem depois dela.

**Visão geral · período e filtros (pedido do responsável, 21/11/2026, com imagem):** um cartão só, em três linhas:
1. **Período** (De – Até numa caixa com um ícone de calendário) e as pílulas **Hoje · Ontem · 7 dias · 30 dias · Personalizado**; Semana, Mês, Semana anterior, Mês anterior e Ano fiscal ficam dentro de Personalizado (nenhum período sai). À direita, a **Visão** (Visão geral · padrão, Meu painel, modelos).
2. **Turno · Linha · Máquina · Catálogo · Status** e o link **Limpar filtros**.
3. O resumo do filtro: "21/11/2026 · Todos os turnos · Vacutainer · Todas as máquinas" (com Catálogo e Status quando escolhidos).

Personalizar, Imprimir, Exportar e Apresentar ficam à direita do título "Visão geral da operação". Os campos, os nomes e os eventos do filtro são os mesmos (contrato 6). Isso revê a decisão D9 (Hoje · Ontem · Semana · Mês) só na Visão geral. **Entregue na plataforma 1.8.32** (teste `lancamento-topo`, `tperiodo`).

**Teste:** a ordem das abas, os rótulos, o chip de situação nos três estados, Trocar pasta (pasta × sem pasta × Demonstração) e a barra de ações à esquerda e à direita.

> **Entregue (Produção 2.6.23, plataforma 1.8.32).** O cabeçalho, as abas e a barra são da casca (`modulo/App`); o motor só deu a ordem e os rótulos (`GrpAbas`) e o rótulo "Modo TV". O chip usa o mesmo estado do antigo botão Status (`situacaoChip`, modulo/core/data); um erro com a pasta conectada aparece como "Erro a conferir", para não dizer "sem conexão" quando a pasta está lá. Na Demonstração o chip diz "Demonstração" (azul) e o Trocar pasta fica oculto. A barra separa os comandos pelo ID (`vacVoltar`, `opBtn` à esquerda); os IDs e as travas não mudam. Com a ordem nova, a Produção abre em Visão geral quando a pessoa não salvou outra aba inicial. Testes `lancamento-topo` e `situacao`.

## 0.1 LANC-04 · Config. › Abas refletida na página (diagnóstico de 20/11/2026)

> **Entregue (Produção 2.6.22, plataforma 1.8.31).** `abas()` manda `cor`, `corTexto`, `estado` e `inicial`; `ModuleTabs` desenha a pílula e o selo; a casca já relia as abas a cada 1,8 s e depois de cada clique, então a mudança aparece sem recarregar. A casca abria sempre a primeira aba (`route.tab || currentTabs[0]`) e mandava essa aba ao motor, por cima do `start`: agora abre a aba inicial **salva** pela pessoa; sem aba salva, continua a primeira (a ordem padrão nova fica para a LANC-03, item 0). Teste `abas-config`.

Pendência separada da LANC-03 (decisão do responsável, 20/11/2026): é correção do que já existe e pode ser entregue antes. Só a ordem padrão nova das abas (item 0) depende da LANC-03.

Testado na Demonstração da plataforma 1.8.30, salvando pelo próprio formulário de Config. › Abas e lendo as abas que a casca mostra:

| Configuração | Reflete na página? | Motivo |
|---|---|---|
| Ordem (arrastar) | sim | a casca usa `visibleRoutes()` |
| Mostrar / ocultar (só para mim) | sim | idem |
| Estado "Oculta para todos" | sim | idem |
| Estado "Em atualização": faixa no topo da tela | sim | `tabBanner` do motor |
| **Destaque colorido** | **não** | `abas()` (comum/interface) passa só `[id, nome]`, e `ModuleTabs` (modulo/components) desenha só o texto. A cor (`App.prefs.tabs.hl`) se perde. |
| **Selo "em construção" / "atualizando" na aba** | **não** | mesmo motivo: `tabLabel()` só é usado no `#nav` antigo do motor, que fica oculto na plataforma. Até esse `#nav` agrupado (`nitem`) usa só o nome. |
| Aba inicial | não confirmado | `loadPrefs` aplica `start`, mas na Demonstração as preferências não sobrevivem ao recarregar. Conferir com a pasta, e ver se a casca, ao abrir a Produção, não força a rota `launch`. |

Correção (sem mudar rota, ID nem permissão):

- **`abas()` (comum/interface):** para a Produção, devolver também `cor` (`App.prefs.tabs.hl[k]`) e `estado` (`tabState(k).state`).
- **`ModuleTabs`:**
  - aplicar a cor como pílula atrás do nome, com contraste automático (`textOn`), mantendo o sublinhado da aba ativa;
  - mostrar o selo "em construção" ou "atualizando" ao lado do nome.
- **Atualização imediata:** depois de **Salvar** em Config. › Abas, a casca relê as abas na hora, sem precisar recarregar.
- **Aba inicial:** ao abrir a Produção sem rota explícita na URL, a casca respeita `start`.
- **Ordem padrão:** a ordem da imagem (item 0) passa a ser a ordem padrão de `ROUTES`. A ordem que cada pessoa salvou continua valendo para ela.
- **Teste `abas`** (estender): cor visível na aba da casca, selo de estado, atualização sem recarregar e aba inicial.

### 0.2 LANC-04 · Grade de gráficos: 1/1, 1/2 e 1/3 e mover (diagnóstico de 20/11/2026)

> **Entregue (Produção 2.6.22, plataforma 1.8.31).** Em vez de estilo em linha, a largura escolhida vence por regra do css/kit com `!important` sobre `data-vg-l`, para que a regra do celular (abaixo de 760 px, 1/1) continue valendo. Os blocos `.pn-grid > .pn-blk` entram na grade mesmo sendo só tabela. O redesenho já existia (`Charts.fit` no `resize` que o `vacGrade` dispara); faltava o `scatter` (Frequência × duração), que desenhava sempre em 720 px. No Hora a hora em 1/3, os rótulos do eixo passam a sair um a cada N, abaixo da faixa de família. A conferência achou o mesmo defeito na Gestão de Gel (painel), também corrigido. Teste `grade-larguras`: 103 cartões em 16 páginas.

**Regra pedida:** a página é uma grade de até 3 colunas. Qualquer cartão (gráfico, tabela ou lista) aceita 1/1, 1/2 ou 1/3. Três cartões em 1/3 ficam lado a lado na mesma linha. ← → e o arrasto mudam o lugar de qualquer cartão.

**Teste na Demonstração (1.8.30, tela de 1600 px):** cliquei 1/3 em cada cartão e medi a largura.

| Onde | Cartão | Resultado |
|---|---|---|
| Visão geral · padrão | PPH real × nominal, Perdas em minutos por dia, Scrap % por dia, Tendência mensal | **não muda** (continua 1282 de 1282 px) |
| Visão geral · Meu painel e modelos | OEE × meta, Tendência de OEE · 12 meses | **não muda** |
| Visões e relatórios com os blocos | Hora a hora, Paradas do período, Plano do mês · acumulado, Plano por família e catálogo, Observações registradas (os que você citou), Resultado por turno | **não muda**: todos são blocos de largura inteira (`w:'f'`) |
| Demais cartões (Produção boa, OEE por turno, Cascata, Pareto…) | | ok: 635 → 419 px |

**Causa:** os cartões nascidos com largura inteira têm `grid-column:1/-1` fixo, que vence a largura escolhida (`data-vg-l`) do `vacGrade` (comum/interface):
- `style="grid-column:1/-1"` em linha (Visão geral · padrão, `card(…, span)`);
- a classe `.pn-grid .pn-blk.full` (blocos `PN_B` com `w:'f'`).

Ocupando a linha toda, o cartão também não fica ao lado de outro, por isso parece que não se move.

**Correção:**
- **Largura escolhida sempre vence:** o `vacGrade.aplicar` passa a gravar a largura como `grid-column: span N` em linha, sobrescrevendo o `1/-1` do cartão. A largura inteira de nascença continua sendo só o padrão (`data-vg-n`), usado enquanto a pessoa não escolhe outra.
- **Gráfico redesenhado na largura nova:** depois da troca, o gráfico é redesenhado na largura real do cartão (o mesmo redesenho de "texto sempre no mesmo tamanho"), em vez de encolher o desenho de 1440 px (`Charts.setWidth`). Eixos e legendas continuam legíveis em 1/3.
- **Tabelas em 1/2 ou 1/3:** rolam na horizontal dentro do cartão (`.tw`), sem quebrar a grade.
- **Todos os cartões têm a barra 1/1 · 1/2 · 1/3 e ← →:** inclusive os de tabela ou lista sozinhos numa grade, que hoje ficam sem barra (Paradas do período, Plano por família e catálogo, Observações registradas).
- **Celular:** abaixo de 760 px, tudo continua 1/1 (regra atual).
- **Revisar todas as páginas que usam `vacGrade`:** Visão geral (padrão, Meu painel, visões e modelos), Lançamento, Resultados, Plano do mês, Relatórios e as páginas dos outros motores. O teste faz isso automaticamente.
- **Teste `grade-larguras` (novo):**
  - para cada cartão com barra, em cada página: 1/3 dá cerca de 1/3 da grade, 1/2 cerca de metade e 1/1 a largura toda;
  - três cartões em 1/3 ficam na mesma linha;
  - ← → muda a ordem e a ordem sobrevive ao redesenho;
  - o gráfico é redesenhado: a largura do SVG acompanha a do cartão.

## 1. Cabeçalho do dia (uma linha, sem repetição)

- À esquerda: `Terça-feira, 17/11/2026`, o chip de situação (Em produção, Pendente de conferência, Sem produção ou Fechado, vindo de `day.status` e da pendência) e o texto discreto "Semana 47 · seg–sáb · Linha".
- Sai o bloco Linha/máquina + Calendário: a linha já está no seletor da barra.
- À direita: **Fechar dia** (botão principal; com o dia fechado vira **Reabrir**) e **⋮ Mais ações**.
- Abaixo, duas pílulas (controle segmentado):
  - **Lançamento:** Hora a hora (padrão) · Por turno · Dia.
  - **Scrap:** Por turno · Diário.

> **Entregue (etapa b, Produção 2.6.24).** Data por extenso ("Quinta-feira, 19/11/2026"), chip de situação (Em produção, Pendente de conferência, Sem produção ou Fechado; reaberto aparece como "Em produção · reaberto") e "Semana 47 · seg–sáb · Vacutainer". À direita, Fechar dia (Reabrir com o dia fechado) e ⋮ Mais ações, na mesma linha; com o cabeçalho recolhido, os dois continuam à vista. Scrap, Responsável e Observação geral continuam no corpo do cabeçalho até a etapa d (pílulas). A barra do dia deixou de repetir "dia · semana · situação" quando o cabeçalho está na tela. A "Última alteração" passou para o item Histórico de alterações do menu.

## 1.1 Cards resumo em bloco recolhível (decisão do responsável, 20/11/2026)

- Os cards resumo do dia (OEE do dia, meta diária, scrap, gel, cards configurados em **Editar cards**, com o semáforo) ficam num bloco **"Resumo do dia"** com o botão Recolher/Expandir (`aria-expanded`, `aria-controls`).
- Abre **expandido** por padrão.
- O estado fica só neste navegador (`localStorage`, chave `vac.oee.resumoAberto`, com try/catch). Sem armazenamento, volta a expandido. Não grava nada na base.
- Recolhido, o cabeçalho do bloco mantém uma linha curta com o OEE do dia e o semáforo, para o número principal não sumir.
- Não muda os números, a ordem nem a configuração dos cards (contrato 6). Vale nos três modos; no modo Dia, mostra os mesmos cards do dia.

> **Entregue (Produção 2.6.23).** Bloco `#lcResumo` em volta da faixa de cards (`ResumoDia`, motor/oee), com `aria-expanded`/`aria-controls`; recolhido, mostra "OEE do dia" com o semáforo da meta. Teste `lancamento-topo` (inclusive sem armazenamento).

## 2. Menu "⋮ Mais ações"

- Botão `aria-haspopup="menu"` + `div[role=menu]`. Fecha com Esc, com clique fora e depois de escolher; ↑/↓ navega.
- Grupos:
  - **Ações do dia:** Pendente de conferência (`#dPend`), Dia sem produção (`#dOff`/`#offDay`), Mover para outro dia (`#dMove`), Enviar relatório (`#dEnviar`).
  - **Correções:** Restaurar intervalos padrão (`#dRestore`), Reaplicar metas vigentes (a ação que já existe), Editar cards, Metas dos próximos meses.
  - **Consulta:** Histórico de alterações (auditoria do dia).
  - **Zona de risco**, separada e em vermelho: Excluir dia (`#dDel`).
- Só aparece o que vale para a situação do dia.
- **Regra técnica:** os itens mantêm os mesmos IDs e handlers. Assim `VAC_PODE_MAPA.oee` e `vacTravas` (travas por perfil) continuam funcionando. Os itens ficam no DOM, escondidos quando o menu está fechado.

> **Entregue (etapa b).** Menu `#dMais`/`#dMaisMenu` (`CabDia`, motor/oee): Esc, clique fora, Home/End e ↑/↓ (pulam os itens travados pelo perfil); o foco volta ao botão. "Excluir lançamento" passou a se chamar "Excluir dia". Teste `lancamento-cabecalho`.

## 3. Pílula Lançamento: o que cada modo mostra

| Modo | Cartão de cada turno | Usa |
|---|---|---|
| **Hora a hora** (padrão) | Indicadores do turno (tempo, meta, produzido, OEE), tabela das horas, paradas e hora extra | `iv.good` por intervalo (como hoje) |
| **Por turno** | Indicadores, um campo "Produção do turno" e as paradas do turno; o hora a hora fica oculto | `TotalTurno` (lançar o total do turno, que já existe) |
| **Dia** | Um bloco "Produção do dia" com tempo, meta e campo de produção e paradas do dia; turnos e horas ficam ocultos | **Novo**: ver item 4 |

- **Onde guardar o modo:** em `day.modoLanc` (`'hh' | 'turno' | 'dia'`), uma propriedade nova e aditiva; sem ela vale `'hh'`. O modo é por dia e fica na auditoria.
- **Trocar de modo com dados lançados:** pede confirmação e diz o que acontece, por exemplo "o total do turno é apagado e as horas voltam a abrir", reaproveitando a troca que já existe no `TotalTurno`. Nunca apaga sem confirmar.
- **Avisos que não se perdem:** sugestões do servidor e alertas (hora extra, meia-noite) continuam aparecendo em qualquer modo.

> **Entregue (etapa d, Produção 2.6.26).** Pílulas no cabeçalho do dia. `day.modoLanc` só existe quando é 'turno' (sem ela vale 'hh') e a troca fica na auditoria (`Actions.setModoLanc`). Trocar o modo só muda a tela: as horas já lançadas e os turnos lançados pelo total continuam e contam como antes, por isso a confirmação diz "Nada é apagado" e explica o caso de cada turno. No modo Por turno, cada turno mostra o bloco do total do turno (`TotalTurno`), as paradas do turno com "+ Parada do turno" (horário no formulário) e "Ver hora a hora"; a tabela e o gráfico do hora a hora ficam ocultos, e o "Abrir hora a hora" do rodapé some. O modo Dia vem na etapa e.

## 3.1 O que cada modo pede (decisão do responsável, 20/11/2026)

Cada informação fica no nível do modo escolhido, sem repetir nem dividir:

| Informação | Hora a hora | Por turno | Dia |
|---|---|---|---|
| Produção | por hora (`iv.good`) | do turno (`TotalTurno`) | do dia (`day.lancDia.good`) |
| Paradas | na hora em que aconteceram | do turno | do dia (`nivel:'dia'`, sem turno e sem hora) |
| Abono / revezamento | do turno (`saveAbono`) | do turno | **do dia**: minutos que descontam do tempo planejado do dia, sem rateio nos turnos |
| Hora extra | do turno (HEX-01) | do turno | do turno (selos), porque muda o tempo planejado do dia |
| Observação | do turno (`ps.note`) | do turno (`ps.note`) | do dia (`day.note`) |
| Segurança e qualidade (SQDCP) | do turno (`ps.sqdcp`) | do turno (`ps.sqdcp`) | do dia; ver abaixo |
| Scrap | conforme a pílula Scrap | conforme a pílula Scrap | do dia (a pílula fica em Diário e travada) |

- **O detalhe continua:** a seção Segurança e qualidade e a tabela hora a hora detalhada (com todas as colunas, a aba Hora a hora de hoje) não saem da plataforma. No modo Hora a hora, o cartão do turno mostra a tabela compacta e o link "Abrir hora a hora" leva à tabela detalhada. Segurança e qualidade ficam numa seção recolhível do cartão do turno (ou do bloco do dia), que abre com um clique e mostra um selo quando há registro.
- **Abono no modo Dia:** o abono de hoje é rateado nos intervalos do turno (`saveAbono`), e no modo Dia isso não pode acontecer. Um evento novo, `nivel:'dia'`, guarda o código REV (ou outro que desconte do planejado) e os minutos. Ele entra só no tempo planejado do dia.
- **Segurança e qualidade (decisão do responsável, 20/11/2026):**
  - **Obrigatórias** em qualquer modo, para cada dia produtivo; "Sem ocorrência" é uma resposta válida. Sem elas, **Fechar dia** fica bloqueado e explica o que falta, com o botão "Ir para Segurança e qualidade".
  - **O turno é opcional:** é um detalhe a mais que pode ser informado. A conta oficial é do dia: o dia soma o que foi registrado por turno e o que foi registrado sem turno, sem contar o mesmo registro duas vezes.
  - **No modo Dia,** o registro fica em `day.sqdcpDia` (mesmo modelo `SQDCPModelo`), com o campo "turno" opcional por ocorrência.
  - **SQDCP por turno:** mostra só o que tem turno informado. O que não tem aparece como "sem turno" e continua contando no dia, na semana e no mês (A4 paisagem mantida, contrato 6). Um acidente nunca some por não ter turno.
- **Trocar de modo:** a confirmação lista também abonos, observações e segurança e qualidade do nível que sai. Eles ficam guardados e não são apagados, mas deixam de contar enquanto o modo estiver em outro nível. Voltar ao modo anterior traz tudo de volta.

## 4. Modo "Dia": decidido, só no dia (opção b, responsável, 20/11/2026)

**Princípio:** o tipo de reporte vale só para o nível em que foi feito. Nada é dividido nem estimado para um nível mais fino. Ratear a produção do dia entre turnos ou horas inventaria números e contaminaria o cálculo real dos dias lançados hora a hora ou por turno.

| Visão | Dia lançado por **hora** | Dia lançado por **turno** | Dia lançado por **dia** |
|---|---|---|---|
| Dia, semana, mês, período | entra | entra | entra |
| Por turno (OEE, relatório, ranking) | entra | entra | **não entra**; aparece como "lançado por dia" |
| Hora a hora (perfil por hora, gráfico) | entra | **não entra** (o total do turno não vira hora) | **não entra** |

Regras de implementação:

- **Onde guardar:** `day.lancDia = { good, scrap? }`, um bloco novo e aditivo. As paradas do dia ficam em `day.events`, sem `intervalId`/turno e marcadas `nivel:'dia'`. Não se grava produção em `iv.good` nem em `ps.*` nesse modo, para nenhuma visão por turno ou hora a pegar por engano.
- **OEE do dia:** soma a produção, o tempo planejado (com as horas extras de cada turno) e as paradas, e calcula o OEE uma vez sobre essas somas. É o mesmo agregado ponderado de hoje; nunca a média de taxas (contrato 1).
- **Turnos desse dia:** OEE, produzido e atendimento mostram "—" com o selo "lançado por dia". Ausência nunca vira zero (contrato 1), e a meta do turno não entra num denominador por turno.
- **Semana e mês com dias mistos:** o total soma todos os dias. A visão por turno ou por hora mostra uma nota: "N dia(s) lançado(s) por dia não entram nesta visão".
- **Conferir:** os relatórios e gráficos por hora precisam ignorar o período único do `TotalTurno` (turno lançado pelo total), para que ele não seja lido como produção de uma hora.
- **Trocar de modo:** como no item 3, com confirmação. Ao sair do modo Dia, o `lancDia` fica guardado (com auditoria) e só deixa de contar; voltar ao modo Dia traz o valor de volta (item 3.1).
- **Contrato 7:** nenhuma fórmula nova. O modo Dia só soma os mesmos componentes no nível do dia.

> **Entregue (etapa e1, Produção 2.6.27).** Em `computeDayRaw`, com `day.modoLanc === 'dia'`: o "Catálogo do dia" (`day.lancDia.catalogId`, que vem com o catálogo inicial do 1º turno) dá o catálogo de todas as horas, e o tempo, a meta e a capacidade continuam os dos turnos (com as horas extras); a produção das horas não é lida (fica guardada) e a do dia (`day.lancDia.good`) entra só no total do dia; o OEE do dia é o mesmo agregado (boa ÷ capacidade). A produção fora de turno (MES) e a divisão na meia-noite não se aplicam ao modo Dia, que fica desligado quando o dia tem turno que passa de 00:00 ou recebe a parte do dia anterior (`Actions.viradaImpede`, decisão 1). Paradas e abono do dia usam o mecanismo que já existia para paradas sem turno (`dayLevel`), com `nivel: 'dia'`; o abono do dia desconta do tempo planejado do dia na mesma proporção que a importação de paradas sem turno já usava. Registros de outro nível ficam guardados e só deixam de contar: abono por turno no modo Dia, parada e abono do dia fora dele. Os turnos desse dia devolvem resultado vazio (`porDia`, produção e OEE `null`), por isso nenhuma soma por turno os pega; `aggregate` com filtro de turno conta os dias de fora (`diasPorDia`) e, com filtro de catálogo, usa o dia inteiro quando o catálogo do dia bate. `HHComum` não devolve pontos por hora desses dias. Exports: o dia entra em `porDia` com `lancadoPorDia: true` e sai de `porDiaTurno`; `tempoProgramadoTurnos` continua com o tempo do turno. Nota "N dia(s) lançado(s) por dia não entram nesta visão" em Resultado por turno, na tabela por turno e no hora a hora do período. Teste `lancamento-modos` (casos do modo Dia). Cenário da demonstração refeito.

## 5. Pílula Scrap

- **Diário:** o campo "Scrap do dia" (com o responsável) fica abaixo dos turnos; os turnos não pedem scrap. Usa `day.scrapMode = 'day'`, que já existe, e a regra da TUR-07 de somar o scrap que vem do turno da madrugada.
- **Por turno:** cada cartão de turno ganha o campo "Scrap do turno" (`ps.scrap`) logo abaixo dos indicadores; o campo do dia some.
- **Trocar com scrap já lançado:** pede confirmação. O valor do outro modo fica guardado e não é apagado, mas deixa de contar.

> **Entregue (etapa d).** `setScrapMode` não apaga mais: ao passar para Diário com o total do dia vazio, grava a soma dos turnos (com auditoria); `ps.scrap` e `day.scrapDay` ficam guardados, e a conta já lia só o do modo atual (Engine). Um único leitor somava os dois (`dayEntries`, "o dia tem apontamento?") e passou a seguir o modo. O campo "Scrap do dia" fica ao lado da pílula.

## 6. Hora extra por turno

- Cada turno tem o seu "+ Hora extra" (HEX-01). Marcado, vira um selo "Hora extra 05:00–06:00".
- Os indicadores do turno se ajustam: tempo, meta e capacidade (ex.: 510 → 570 min).
- Um turno pode ter hora extra e o outro não. A hora extra aparece:
  - no modo Hora a hora, como a linha "extra" na tabela;
  - no modo Por turno, somada ao tempo do turno;
  - no modo Dia, como os selos dos turnos, porque o tempo do dia soma as horas extras.

> **Entregue (etapa d).** A hora extra por turno já existia (HEX-01) e já ajustava tempo, meta e capacidade; entrou o selo "Hora extra 05:00–06:00" no topo do turno. Teste `lancamento-modos`.

## 7. Rodapé e repetições

- O rodapé fica com "Alterações salvas" à esquerda e "Abrir hora a hora" (só no modo Hora a hora) à direita.
- Antes de mexer, inventariar os botões repetidos (Hora a hora no topo e no rodapé, Enviar relatório) e deixar cada ação em um lugar só.

> **Entregue (etapa b).** Inventário: "Hora a hora" (todos os turnos) estava no cabeçalho do dia e passou para o rodapé como "Abrir hora a hora"; "Enviar relatório" ficou só no menu; "Hora a hora" de cada turno continua no cartão do turno (é outra ação: abre só aquele turno). O rodapé mostra "Alterações salvas", "Alterações pendentes de gravação" ou o aviso de erro de gravação, acompanhando a base.

## 8. Testes, versão e entrega

- **Ajustar testes:** `lancamento-unificado`, `enviar-relatorio`, `ajustes-usabilidade`, `semaforo`, `total-turno`, `servidor-dia`, `hora-extra` e `turno-virada`. Onde clicam num item do menu, abrir o menu antes.
- **Teste novo `lancamento-modos`:**
  - as pílulas e o que cada modo mostra ou esconde;
  - a troca com confirmação;
  - scrap diário × por turno;
  - hora extra em um turno só;
  - menu: grupos, Esc e travas por perfil;
  - modo Dia fora das visões por turno e hora a hora, e dentro do total da semana;
  - abono e observação no nível do modo (dia × turno), sem rateio no modo Dia;
  - Fechar dia bloqueado sem Segurança e qualidade, liberado com "Sem ocorrência" e sem turno;
  - botões da Validação levando ao campo certo e à seção certa da Administração;
  - Resumo do dia recolhe, mantém o OEE visível e abre expandido sem armazenamento.
- **Versão:** nova versão da Produção e da plataforma, com a entrada em **Administração › Novidades**.
- **Telas:** enviar as telas antes do merge.

## 9. Validação: cada aviso leva ao lugar do ajuste (decisão do responsável, 20/11/2026)

Hoje a seção **Validação** e o painel **Qualidade do apontamento** (cobertura, divergência, Performance acima de 100%) dizem o problema, mas não onde corrigir. Cada aviso passa a ter um botão **"Ir para o ajuste"**. Quando há mais de um lugar possível, aparecem até três botões curtos, na ordem da causa mais provável.

| Aviso (`pointingQuality` e `res.msgs`) | Botões |
|---|---|
| Cobertura abaixo do mínimo | **Registrar paradas**: abre o turno, ou a hora no modo Hora a hora, com mais minutos sem explicação, no campo de paradas. **Ver o mínimo**: Administração › Metas de OEE (`coberturaMinPct`). |
| Divergência acima do limite | **Tempo planejado do turno** (intervalos e abonos). **PPH e catálogo** (catálogo do turno ou vigência em Metas de OEE). **Classificação das paradas**. **Ver o limite** (`divergenciaMaxPct`). |
| Minutos apontados acima da perda | **Ver paradas do dia**, filtrando as que se sobrepõem ou que descontam do planejado. |
| Performance acima de 100% | **Catálogo do turno**, **PPH vigente** (Metas de OEE) e **Paradas que descontam do planejado**. |
| Sem dados suficientes | **Turnos do dia** (tempo planejado) ou **Catálogo**, conforme o que falta. |
| Mensagem com `ref` (`{ iv }`, `{ ps }`, `{ ev }`) | **Ir para a hora / turno / parada** com rolagem e destaque. |

Regras:

- **Mesma página:** abre o modo e o cartão certos, rola até o campo, foca e destaca por 2 s. Num cartão recolhido, abre antes. Se o modo atual não mostra o campo (ex.: a hora no modo Por turno), o botão diz "Abrir hora a hora".
- **Administração (Portal):** usa `vacPortalHref('cadastros/<seção>')` (comum/interface), como já faz `vacIrImportacao`, abrindo a seção e, se houver, a meta da linha. Sem permissão para editar (`vacPodeAqui`), o botão vira "Ver" e mostra quem pode ajustar.
- **Explicar o número:** cada aviso ganha uma linha curta com o cálculo, por exemplo "Cobertura 82% = 41 min apontados ÷ 50 min de perda; mínimo 95%".
- **Contrato 6 e 7:** só navegação e texto. Limites, fórmulas e status (adequado, atenção, crítico) não mudam.
- **Teste:** cada botão leva ao campo certo (foco visível) e o link para a Administração abre a seção certa.

> **Entregue (etapa c, Produção 2.6.25).** `pointingQuality` ganhou `tipos` ao lado de `msgs` (o texto e o status não mudam); os avisos do apontamento entram na Validação com `ref: { qa }`. `Ajuste` (motor/oee) monta os botões e a conta e faz a navegação: "Registrar paradas" abre o turno com mais minutos sem explicação e foca o "+" de parada; "Tempo planejado do turno" foca o "+ Abono"; "PPH e catálogo" e "Catálogo do turno" focam o catálogo inicial; "Classificação das paradas", "Turnos do dia" e "Catálogo" abrem as seções de Configurações; "Ver o mínimo", "Ver o limite" e "PPH vigente" abrem Administração › Metas de OEE (`vacPortalHref('cadastros/metasOee')`); "Ver paradas do dia" abre Paradas no dia. Mensagens com `iv`, `ev` ou `ps` ganham "Ir para a hora / parada / turno". Sem permissão de lançar, o botão diz "Ver…"; sem configurar, a dica diz quem ajusta. Os mínimos e limites mostrados na conta são os de Configurações › Parâmetros de cálculo, os mesmos que o status usa. Os botões aparecem no Lançamento; nas outras telas o painel continua só com o texto. Teste `lancamento-validacao`.

## 10. Decisões de 20/11/2026 (dúvidas levantadas antes de implementar)

1. **Madrugada no modo Dia:** a pílula Dia fica desligada quando o dia tem turno produtivo que passa de 00:00 ou recebe a parte depois de 00:00 do dia anterior (TUR-07); o aviso diz para usar Por turno. A regra da madrugada não muda.
2. **Catálogo no modo Dia:** um campo "Catálogo do dia" dá o PPH da capacidade; vem preenchido com o catálogo inicial do 1º turno. Dia com troca de catálogo usa Por turno.
3. **Troca do modo de scrap:** os dois valores ficam guardados (`ps.scrap` e `day.scrapDay`); só o do modo atual conta. Ao passar para Diário, a soma dos turnos é sugerida apenas quando o campo do dia está vazio, sempre com confirmação. Hoje `setScrapMode` apaga ou soma: muda na etapa d.
4. **Segurança e qualidade para fechar o dia:** exigidas só nos dias a partir da data da versão que trouxer a regra; dias antigos reabertos não travam. **Pedido adicional do responsável:** para que os dias antigos sigam a mesma regra, deve ser possível excluir os lançamentos de um dia antigo, tenha ele lançamentos ou nem tenha sido iniciado, e relançá-lo; conferir na etapa e o que o Excluir dia (`#dDel`) permite hoje.

## Maquete

A maquete foi enviada ao responsável na conversa de 20/11/2026: hora a hora com scrap por turno, por turno com scrap diário, dia, e o menu Mais ações. Ela não está no repositório.

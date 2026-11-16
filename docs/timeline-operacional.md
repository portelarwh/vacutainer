# Timeline Operacional

Status: Approved

Owner: Pedro Portela

Related Documents:

- timeline-operacional-acceptance-criteria.md
- production-module.md
- oee-module.md

OBJETIVO

Adicionar à página atual uma visualização Timeline de Produção que permita analisar o estado operacional das linhas e máquinas em diferentes períodos (dia, turno ou período personalizado), utilizando as paradas cadastradas manualmente pelos operadores, importadas do MES ou provenientes das tags do sistema.

================================================================

VISÃO GERAL

Criar um componente Timeline/Gantt interativo com dois níveis:

Nível 1 - Visão Macro (Linha)
Nível 2 - Visão Detalhada (Máquinas)

A timeline deverá representar o comportamento operacional ao longo do tempo utilizando estados consolidados.

Estados Macro:

- Produzindo (Verde)
- Parada (Vermelho)
- Bloqueada (Laranja)
- Ociosa (Cinza)

================================================================

FILTROS

Adicionar filtros no topo da página:

- Data
- Turno
- Período personalizado (Data/Hora Inicial e Final)
- Linha
- Máquina
- Tipo de Parada
- Origem do Registro
    - Operador
    - MES
    - Tags Automáticas
    - Todos

Ao alterar qualquer filtro, toda a timeline deve ser recalculada automaticamente.

================================================================

NÍVEL 1 - TIMELINE MACRO DA LINHA

Exibir uma timeline horizontal da linha produtiva.

Exemplo:

06:00 -------------------------------------------------- 18:00

[Produzindo][Produzindo][Parada][Produzindo][Bloqueada][Produzindo][Ociosa]

Objetivo:

Permitir visualizar rapidamente:

- Tempo Produzindo
- Tempo Parado
- Tempo Bloqueado
- Tempo Ocioso
- Distribuição dos eventos ao longo do período

KPIs calculados acima da timeline:

- Tempo Total do Período
- Tempo Produção Útil
- Tempo Parado
- Tempo Bloqueado
- Tempo Ocioso
- % Produção Útil

Produção Útil = Soma dos períodos classificados como Produzindo.

================================================================

NÍVEL 2 - TIMELINE POR MÁQUINA

Logo abaixo da timeline da linha, exibir uma timeline para cada máquina.

Exemplo:

Tubing
███████░░░░███████

Silica
████████████░░░██

Packout
████░░███████████

Cada máquina deverá possuir sua própria linha temporal baseada nos registros cadastrados.

Os estados serão calculados a partir das tags e paradas registradas para cada máquina.

================================================================

FUNCIONAMENTO DAS PARADAS

O sistema deverá receber informações de três origens:

1. Registro manual do operador
2. Importação MES
3. Tags automáticas do equipamento

Todas as fontes deverão alimentar a mesma estrutura de eventos.

Cada evento deverá possuir no mínimo:

- Máquina
- Tipo de Evento
- Estado
- Data/Hora Início
- Data/Hora Fim
- Duração
- Comentário
- Origem do Registro

================================================================

REGRAS DE CÁLCULO

Quando existir uma parada cadastrada, o período correspondente deverá ser automaticamente marcado na timeline.

Exemplo:

Parada:
08:10 até 08:35

Timeline:

08:00 -------- 08:10 [PARADA] 08:35 ---------

O gráfico deverá recalcular automaticamente:

- Produção Útil
- Tempo Parado
- Tempo Bloqueado
- Tempo Ocioso

Sempre que:

- Um operador cadastrar uma ocorrência
- Uma importação MES ocorrer
- Uma tag de máquina for atualizada

Sem necessidade de atualizar a página.

================================================================

INTERAÇÃO

Ao clicar em qualquer bloco da timeline abrir painel lateral ou modal contendo:

Título:
Detalhes da Ocorrência

Campos:

- Máquina
- Estado
- Motivo
- Data/Hora Início
- Data/Hora Fim
- Duração
- Origem do Registro
- Responsável
- Comentário

Exemplo:

Parada por Falta de Material

Início:
08:12

Fim:
08:46

Duração:
34 minutos

Comentário:
Silica não disponível no abastecimento.

Origem:
Operador

================================================================

TRATAMENTO DE SOBREPOSIÇÕES

Caso existam registros conflitantes entre Operador, MES e Tags:

Prioridade:

1. Operador (quando validado)
2. MES
3. Tags

O sistema deve consolidar automaticamente os eventos para evitar intervalos duplicados.

================================================================

COMPORTAMENTO VISUAL

Requisitos:

- Zoom por Dia
- Zoom por Turno
- Zoom por Hora
- Responsivo
- Tooltip ao passar o mouse
- Legenda fixa
- Cores padronizadas
- Atualização em tempo real

================================================================

RESULTADO ESPERADO

O usuário deve conseguir responder rapidamente:

- Quanto tempo a linha realmente produziu?
- Em quais horários ocorreram as perdas?
- Qual máquina gerou a parada?
- Qual foi o motivo?
- Quando começou e terminou?
- Quanto tempo foi perdido?
- Qual a distribuição das perdas durante o turno?

A timeline deve se tornar a principal ferramenta visual de análise operacional da página, permitindo visão executiva no nível da linha e investigação detalhada no nível da máquina.

## Definition of Done

A implementação somente poderá ser considerada concluída quando todos os critérios definidos em:

timeline-operacional-acceptance-criteria.md

forem atendidos.

================================================================

## Implementação (Produção 2.5.0 · plataforma 1.7.0 · 17/11/2026)

Onde fica: Produção › aba **Linha do tempo** (`#/oee?tab=timeline`). Código no bloco `motor/oee` do `Plataforma.html`: `Timeline` (motor, sem tela), `TLV` e `App.views.timeline` (tela), `Cfg.tags` (Configurações › Mapa de tags). Não há servidor nem endpoints: a plataforma é um arquivo único que lê e grava a base da pasta.

### Estrutura única de eventos

As três origens viram o mesmo objeto antes de qualquer cálculo:

| Campo | Significado | Equivalente no modelo mínimo |
|---|---|---|
| `id` | identificador do registro de origem | EventId / SourceRecordId |
| `src` | `op` (Operador), `mes` (MES) ou `tag` (Tag automática) | Source |
| `machineId` | máquina do cadastro; vazio = linha | MachineId |
| `state` | `prod`, `parada`, `bloq` ou `ociosa` | MacroState |
| `code`, `reason`, `category` | tag ou tipo de parada, descrição e categoria | TagCode / ReasonCode |
| `a`, `b` | início e fim em minutos absolutos de relógio local (fracionários: precisão de segundos) | StartDateTime / EndDateTime |
| `open` | evento em aberto: `b` = agora só para exibir | — |
| `note` | comentário | Comment |
| `by`, `createdAt`, `updatedBy`, `updatedAt` | quem registrou e quando | CreatedBy / CreatedAt / UpdatedBy / UpdatedAt |
| `validated` | dia fechado (operador) | IsValidated |
| `rank` | prioridade na sobreposição | — |

A duração nunca é gravada: é sempre `b − a`. Linha é a do filtro (LineId); ordem e lote vêm do trecho do MES no horário do bloco.

De onde vem cada origem:

- **Operador:** `day.events` com início e fim (o lançamento que já existia). Nada foi duplicado: editar a parada no Lançamento muda a linha do tempo.
- **MES:** `db.server.segments` (caixas passando = produção inferida) e `db.server.gaps` (intervalo sem caixas = parada); paradas que a Produção gera a partir do servidor (troca, retrabalho) e as importadas de planilha entram como MES.
- **Tags:** `db.timeline.tagEvents` `{id, m (máquina), t (tag), s (início), e (fim ou null), c (comentário), by, at}`, importadas por CSV (Linha do tempo › Importar tags).

Bloco novo na base da Produção, **aditivo** (base antiga continua válida): `db.timeline = { tagMap[], tagEvents[], comments{}, imports[] }`.

### Estados e mapeamento

- Tipo de parada do operador: desconta do tempo planejado (refeição, sem programação, retrabalho) = **Ociosa**; logística / falta de material = **Bloqueada**; os demais = **Parada**.
- Tags: Configurações › **Mapa de tags** (código, descrição, máquina, estado macro, categoria, prioridade 0–9, ativa, vigência). Alterar uma linha encerra a vigência e cria outra; o evento usa a linha vigente na data dele. Sem linha própria vale o mapeamento inicial (RUN, STOP, FAULT, ALARM, BLOCKED, STARVED, IDLE, STANDBY e os nomes em português).
- Tag sem mapeamento: entra como Parada, com contorno tracejado e aviso no alto, até ser classificada.
- **Estado padrão** (onde não há registro): dentro de turno produtivo = Produzindo; fora = Ociosa. É mostrado mais claro e identificado como "Estado padrão" no tooltip e nos detalhes.

### Sobreposições

Em cada instante vale um único registro, o de maior prioridade:

1. Operador validado (dia fechado)
2. Parada registrada a partir do MES (troca, retrabalho, planilha)
3. Operador ainda não validado
4. Intervalo sem caixas do MES
5. Tags (entre duas tags, a de maior prioridade no mapa; empate: a que começou depois)
6. Produção inferida pelas caixas do MES
7. Estado padrão

Os itens 4 e 6 são inferidos da contagem de caixas (não dizem máquina nem motivo), por isso ficam abaixo de um registro feito por uma pessoa. O intervalo é dividido onde só parte se sobrepõe; nenhuma duração é somada duas vezes; os registros que não prevaleceram continuam na base e aparecem em Detalhes › "Registros sobrepostos que não prevaleceram".

### Linha × máquinas

- Faixa da linha (nível 1): todas as paradas do operador (com ou sem máquina indicada), o MES e as tags da própria linha.
- Faixa de cada máquina (nível 2): as paradas do operador atribuídas a ela e as tags dela. Tag de uma máquina **não** muda o estado da linha.

### Atualização

Sem servidor, "tempo real" é: a tela se refaz a cada alteração da base nesta estação (lançar, editar, excluir, importar MES ou tags, comentar), sem recarregar; alterações de outra estação chegam na releitura periódica da pasta (padrão 60 s); a marca "agora" e os eventos em aberto andam a cada 30 s.

### Tela

Canvas do tamanho da área visível (a rolagem só muda o trecho desenhado), com eixo de horários e faixa da linha fixos no alto e nomes das máquinas fixos à esquerda. Zoom Ajustar, Dia (24 h por tela), Turno (8 h) e Hora (1 h). Cada estado tem cor e textura (não depende só da cor); a tabela "Ocorrências do período" repete os blocos em texto. Limite de 31 dias por consulta.

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
# Módulo de Produção

**Sistema:** Vacutainer · Plataforma da Linha  
**Documento:** Especificação funcional do módulo de Produção  
**Owner:** Pedro Portela  
**Status:** Em definição  
**Versão:** 1.0  
**Última atualização:** 16/11/2026

## 1. Objetivo

Disponibilizar uma visão única da operação para acompanhamento da produção por linha, máquina, dia, turno e período personalizado, permitindo identificar produção útil, paradas, bloqueios, ociosidade e suas causas.

O módulo deve consolidar dados informados pelo operador, importados do MES e recebidos por tags automáticas dos equipamentos.

## 2. Escopo

O módulo deve permitir:

- acompanhar o status operacional da linha e de cada máquina;
- visualizar a evolução dos estados em uma timeline;
- consultar produção por dia, turno, hora, ordem e lote;
- registrar e consultar comentários de ocorrências;
- calcular o tempo de produção útil;
- relacionar eventos com máquina, ordem, lote e origem do dado;
- atualizar os indicadores e gráficos quando novos eventos forem recebidos;
- permitir navegação da visão macro para o detalhe da máquina e da ocorrência.

## 3. Hierarquia de navegação

```text
Produção
├── Visão geral da linha
├── Produção por dia e turno
├── Produção por hora
├── Produção por ordem e lote
├── Timeline operacional
│   ├── Nível 1: estado macro da linha
│   └── Nível 2: estado por máquina e detalhe da tag
└── Detalhes da ocorrência
```

## 4. Filtros globais

A página deve disponibilizar:

- Data;
- Turno;
- Período personalizado, com data e hora inicial e final;
- Linha;
- Máquina;
- Ordem de produção;
- Lote;
- Estado operacional;
- Tipo ou tag da parada;
- Origem do registro: Operador, MES ou Tag automática.

Ao alterar um filtro, todos os KPIs, gráficos, timelines e tabelas da página devem usar o mesmo contexto.

## 5. Indicadores principais

Exibir no topo da página, conforme disponibilidade dos dados:

- Produção realizada;
- Meta de produção;
- Aderência à meta;
- Tempo total selecionado;
- Tempo de produção útil;
- Tempo parado;
- Tempo bloqueado;
- Tempo ocioso;
- Percentual de produção útil;
- Quantidade de ocorrências;
- Máquina com maior tempo de perda.

### 5.1 Regras dos indicadores de tempo

```text
Tempo total = fim do período - início do período

Produção útil = soma dos intervalos classificados como Produzindo

% produção útil = Produção útil / Tempo total × 100

Tempo classificado = Produzindo + Parada + Bloqueada + Ociosa
```

A soma dos quatro estados deve ser igual ao período analisado. Intervalos sem classificação devem ser tratados conforme regra de estado padrão definida no modelo de dados, sem serem ocultados silenciosamente.

## 6. Timeline operacional

A timeline deve ser o principal componente analítico do módulo.

Documentação detalhada recomendada:

- `timeline-operacional.md`
- `timeline-operacional-acceptance-criteria.md`

### 6.1 Períodos disponíveis

A timeline deve permitir consulta por:

- Dia;
- Turno;
- Período personalizado;
- Hora, como nível de zoom.

### 6.2 Nível 1: estado macro

Exibir uma faixa consolidada da linha com quatro estados:

| Estado | Cor recomendada | Definição |
|---|---:|---|
| Produzindo | Verde | Linha em condição produtiva |
| Parada | Vermelho | Interrupção por falha ou ocorrência |
| Bloqueada | Laranja | Equipamento impedido por condição anterior ou posterior do processo |
| Ociosa | Cinza | Disponível, porém sem produção |

### 6.3 Nível 2: estado por máquina

Exibir uma linha temporal para cada máquina pertencente à linha selecionada.

Cada faixa deve ser construída a partir das tags e dos eventos associados à máquina, considerando:

- identificador da máquina;
- tag ou código do evento;
- estado macro correspondente;
- data e hora inicial;
- data e hora final;
- duração;
- motivo;
- comentário;
- origem do registro.

### 6.4 Interação com a ocorrência

Ao clicar em um segmento, abrir painel lateral ou modal com:

- Linha;
- Máquina;
- Estado macro;
- Tag ou código da parada;
- Motivo;
- Início;
- Fim;
- Duração;
- Ordem;
- Lote;
- Origem;
- Responsável pelo registro;
- Comentário do problema;
- Data da criação e última alteração.

Ao passar o cursor sobre um segmento, exibir tooltip com estado, máquina, início, fim, duração e motivo.

## 7. Fontes de dados

Todos os eventos devem alimentar uma estrutura comum, independentemente da origem.

### 7.1 Registro manual

O operador pode cadastrar ou complementar uma ocorrência dentro da hora ou posteriormente, conforme permissão.

Campos mínimos:

- Máquina;
- Estado macro;
- Motivo ou tag;
- Início;
- Fim;
- Comentário;
- Ordem e lote, quando aplicável.

### 7.2 Importação MES

O MES pode fornecer:

- períodos sem produção;
- eventos de parada;
- estados dos equipamentos;
- início e fim dos eventos;
- códigos ou tags de motivo.

### 7.3 Tags automáticas

As tags devem identificar a máquina, o estado ou motivo e o intervalo do evento. A aplicação deve mapear cada tag para um dos quatro estados macro.

## 8. Mapeamento de tags

Manter configuração administrável com, no mínimo:

| Campo | Descrição |
|---|---|
| Código da tag | Identificador recebido do equipamento ou MES |
| Descrição | Nome apresentado ao usuário |
| Máquina | Equipamento relacionado |
| Estado macro | Produzindo, Parada, Bloqueada ou Ociosa |
| Categoria | Grupo da ocorrência |
| Prioridade | Usada na resolução de conflitos |
| Ativa | Controla se a tag participa do cálculo |

Uma alteração no mapeamento deve preservar a rastreabilidade da configuração utilizada no evento histórico.

## 9. Consolidação e conflitos

Quando houver sobreposição para a mesma máquina e intervalo, aplicar a prioridade:

1. Registro do operador validado;
2. Evento do MES;
3. Tag automática.

Requisitos adicionais:

- não duplicar duração;
- manter o dado original para auditoria;
- registrar qual fonte prevaleceu;
- dividir intervalos quando apenas parte do período estiver sobreposta;
- eventos em aberto devem usar o horário atual apenas para exibição, sem gravar término fictício.

## 10. Atualização da página

A timeline, os KPIs e os gráficos devem ser atualizados quando ocorrer:

- inclusão, edição ou exclusão de ocorrência manual;
- validação de ocorrência pelo operador ou supervisão;
- nova importação do MES;
- recebimento ou alteração de tag automática;
- mudança no filtro da página.

A atualização deve ocorrer sem recarregar a página inteira. Pode ser implementada por WebSocket, Server-Sent Events ou atualização incremental periódica, conforme a arquitetura existente.

## 11. Modelo mínimo de evento

```text
EventId
LineId
MachineId
MacroState
TagCode
ReasonCode
StartDateTime
EndDateTime
DurationSeconds
OrderNumber
BatchNumber
Comment
Source
SourceRecordId
IsValidated
CreatedBy
CreatedAt
UpdatedBy
UpdatedAt
```

`DurationSeconds` pode ser calculado no backend ou no banco, mas deve ser consistente com `StartDateTime` e `EndDateTime`.

## 12. Requisitos de interface

- manter o design system atual da plataforma;
- manter legenda visível;
- permitir scroll horizontal quando necessário;
- permitir expansão e recolhimento das máquinas;
- destacar visualmente ocorrências sem comentário ou sem classificação;
- preservar leitura em notebook, Full HD e ultrawide;
- não depender apenas da cor: apresentar rótulo, tooltip ou padrão acessível;
- manter horários alinhados entre a faixa macro e as faixas das máquinas.

## 13. Permissões sugeridas

| Perfil | Acesso |
|---|---|
| Operador | Consultar timeline e cadastrar/complementar ocorrências permitidas |
| Supervisão | Validar, editar e reclassificar ocorrências |
| Engenharia/Processos | Consultar histórico, analisar tags e administrar mapeamentos autorizados |
| Administrador | Administrar integrações, máquinas, tags, perfis e regras |
| Gestão | Consultar visão consolidada e detalhes, sem alterar registros |

## 14. Rastreabilidade e auditoria

Toda alteração manual deve registrar:

- valor anterior e novo valor;
- usuário;
- data e hora;
- motivo da alteração, quando exigido;
- origem do evento;
- status de validação.

Eventos importados não devem ser apagados fisicamente durante a consolidação.

## 15. Estados da interface

A página deve possuir tratamento explícito para:

- carregando;
- sem dados no período;
- falha de integração;
- evento em aberto;
- evento sem classificação;
- evento sem comentário;
- dados parcialmente atualizados;
- ausência de permissão.

## 16. Fora do escopo inicial

Salvo definição posterior, não faz parte desta entrega:

- previsão de falhas por inteligência artificial;
- recomendação automática de causa raiz;
- alteração direta de parâmetros do equipamento;
- comando remoto de partida ou parada;
- substituição do MES como sistema de registro oficial.

## 17. Critérios de aceite

A implementação somente será considerada concluída quando todos os critérios do arquivo abaixo forem atendidos:

- `timeline-operacional-acceptance-criteria.md`

Também devem ser validados:

- consistência entre KPIs e timeline;
- ausência de dupla contagem em sobreposições;
- atualização após entrada manual, MES e tags;
- rastreabilidade do evento;
- aderência ao design system da plataforma.

## 18. Definition of Done

- Código revisado e integrado à página atual;
- Modelo de dados e endpoints documentados;
- Mapeamento inicial de tags configurado;
- Testes unitários das regras de tempo e sobreposição aprovados;
- Testes de integração das três origens aprovados;
- Critérios de aceite aprovados pelo responsável funcional;
- Permissões validadas;
- Auditoria validada;
- Documentação atualizada no repositório;
- Sem regressão nas demais páginas da plataforma.

## 19. Documentos relacionados

- `timeline-operacional.md`
- `timeline-operacional-acceptance-criteria.md`
- `data-model.md`
- `mes-integration.md`
- `dashboard-style-guide.md`
- `architecture-decisions.md`

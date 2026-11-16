# Plano de melhorias · Vacutainer

Atualizado em 16/11/2026. **Uma entrega por etapa, com os mesmos dados antes e depois.** O estado e o responsável de cada item ficam em [PENDENCIAS.md](../PENDENCIAS.md), evitando duas listas de progresso divergentes. Este documento define sequência, escopo e aceite.

## Ordem recomendada

| Etapa | IDs | Entrega | Reutilizar / limite | Critério de aceite |
|---|---|---|---|---|
| 0 | R02-A / BKP-01 | Corrigir identificação e concorrência do log | vacPessoa, fila existente e vacBackupRegistro | Homônimos sem ID não entram na fila errada e continuam visíveis para confirmação. Duas estações simuladas preservam os dois eventos; leitura inclui legado e cache. Cadastro, bases e cálculos permanecem iguais. |
| 1 | H01 / H02 | Homologar funcionamento essencial | Roteiro CORTE e ferramentas já incorporadas | Evidência em Chrome/Edge por file://, duas estações, releitura, recuperação, perda de rede/permissão e backup. Registrar versão/hash, máquinas, data, resultado e pendências. Usar somente cópias previamente autorizadas. |
| 2 | IMP-01 | Conferir atualização dos dados na Central | Status do Portal, importadores e exports atuais | Mostrar período, fonte, resultado e cobertura. Distinguir recebido de processado/gravado; informar rejeições/duplicatas quando publicadas. “Completo” só após definir fontes obrigatórias e granularidade. Novos campos de exports exigem proposta autorizada. |
| 3 | VG-01 | Refinar Visão da linha | Metric, BarChart, cards e filtros existentes | Situação → meta → desvio → ação, com resumo e aprofundamento. Mesmo valor para a mesma fonte/período; ausência nunca vira zero. Nada de nova fórmula de OEE. |
| 4 | OP-01 / R02-B | Refinar a jornada do operador | Lançamento, fechamento e hora a hora existentes | Identificar dia/turno e responsável, preencher, conferir, fechar e reabrir sem perder rascunho. Preservar IDs, regra de madrugada, calendário e permissões. Validar com operador antes de concluir. |
| 5 | UI-01 / CTX-01 | Padronizar consultas e contexto | Gráficos, tabelas, filtros, vacFicha e componentes compartilhados | Período/unidade/fonte explícitos, filtros claros, teclado/foco e números alinhados. Ordem/lote/equipamento abrem registros relacionados sem perder zeros ou inventar vínculos. |
| 6 | PLN-01 / PLN-02 / EQP-01 | Melhorar acompanhamento e equipamentos | Kanban, ações, OS, ficha e vínculos atuais | Entregas menores abaixo. Não recriar Planner nem inserir conteúdo técnico sem E12/E13. |
| 7 | REL-01 / REL-02 / H05 | Refinar relatórios | Geradores, SQDCP e peças comuns existentes | Mesmos números/filtros da tela; relatório do dia/turno e foco em performance claramente identificados. Segurança/QN conforme o relatório escolhido. SQDCP continua uma A4 paisagem. Testar PDF, papel e Outlook. |

Etapa 1 é o aceite para uso na linha; seu bloqueio não impede preparar melhorias de consulta com dados fictícios. Cada tela precisa de diagnóstico antes de alterar. Não é uma ordem para reescrever tudo em React ou criar outra árvore de fontes.

## Recortes da etapa 6

- **PLN-01 — Kanban:** títulos e responsáveis legíveis; status com texto e cor, prioridade e prazo claros. Preservar filtros, movimentação e histórico.
- **PLN-02 — Acompanhamento:** apresentar os indicadores já calculados de tempo, responsável, atraso e fechamento. Definir critério antes de propor indicador novo; mudança de cálculo depende de aprovação.
- **EQP-01 — Ficha e OS:** facilitar chegar ao equipamento, sua OS, anomalia, parada e ação relacionadas. Manter vínculos por ID e origem. TAGs MES e padrões/checklists técnicos dependem das amostras aprovadas.

## O que pode avançar e o que espera material

- Pode avançar com dados fictícios: revisão de consultas, hierarquia visual, legibilidade, teclado, filtros e detalhamento, mantendo valores e permissões.
- E10c valida o conteúdo de cada perfil. Um modelo visual pode ser preparado antes; não apresentar a seleção de indicadores por perfil como aprovada.
- E7, E9, E12, E13 e E15 continuam nas dependências da lista única. Nenhuma regra de OSM, conciliação MES, TPM/5S ou Projetos será inventada.
- Coleta automática por pasta vem depois da definição da estação e de um fluxo manual de importação conferível. Deve prever arquivos repetidos, reprocessamento, falha e retomada. Não funciona como serviço com o navegador fechado.
- Microparadas 5/10 minutos e critérios de madrugada exigem a decisão vigente; layout não escolhe regras operacionais.
- Não criar nova página agora. Evoluir Central de importações, Saúde dos dados e módulos existentes.

## Padrão de cada entrega

1. Designar um agente e combinar os blocos do HTML a editar, evitando trabalho simultâneo no mesmo bloco.
2. Fixar cenário, números, filtros e fontes de referência antes de mexer.
3. Aplicar o Design System e a marca pelo bloco css/brand: verde/vermelho para resultado versus meta; azul para identidade e séries neutras. Fontes/logos comerciais são opcionais e externos, com fallback offline.
4. Conferir 390/768/1440 px, claro/escuro, foco/teclado, erro, ausência, dado desatualizado, modais e rascunhos, conforme a tela.
5. Executar testes aplicáveis e regressão compartilhada quando necessário. Confirmar que números, códigos, contratos e permissões não mudaram incidentalmente.
6. Atualizar metadados, documentação e evidências da PR; declarar o que ficou não verificado. Atualizar o estado apenas em PENDENCIAS.md.

A referência vigente é [DESIGN_SYSTEM](DESIGN_SYSTEM.md), com a [marca fornecida](BD_Dashboard_Brand_Guidelines.md). Cores específicas de gráficos, formulários e relatórios dos motores ainda precisam de revisão por etapa; tokens compartilhados não equivalem a revisão completa ou aprovação corporativa no Maxwell.

**Vacutainer — diagnóstico e plano mestre revisado após análise comparada**

Edição final de 08/11/2026, incorporando os esclarecimentos do responsável e a avaliação independente do diagnóstico publicado em `c3ae4b0f5a82cba9802889131688a06387389fb0`. Código da aplicação examinado: `portelarwh/vacutainer`, `main`, commit `e0435136359847e07a2a775a1d7eea31371495b8`. O `main` remoto foi novamente conferido e continua nesse commit. Este documento registra verificação e propostas; não autoriza nem representa implementação. O parecer item por item está em [01-PARECER-COMPARATIVO.md](01-PARECER-COMPARATIVO.md); a lista atual é [03-PENDENCIAS-E-MELHORIAS.md](03-PENDENCIAS-E-MELHORIAS.md).

**1. Direção do sistema e limites atuais**

O objetivo é uma plataforma integrada pela ordem, lote, equipamento e evento, com leitura resumida ou detalhada conforme a tarefa. Os dados devem permitir detectar um desvio, investigar a evidência, abrir uma ação, encaminhá-la e verificar resultado. A expansão deve preservar cálculos, importadores e histórico que já funcionam.

**A arquitetura de trabalho será por arquivos. Não há API de negócio nem servidor interno disponível.** Um sistema externo poderá, se viável, gerar relatórios e salvá-los em pastas. O navegador lê esses arquivos autorizados, importa, atualiza a base do módulo e publica os resumos que as demais páginas consomem. A extração SQL é externa: o navegador não precisa se conectar ao SQL. O acesso a arquivos pelo mecanismo já usado no navegador permanece.

Salvar o relatório automaticamente e lê-lo automaticamente são etapas diferentes. A leitura no HTML depende de página aberta, computador ativo e permissão da pasta; temporizadores podem atrasar com suspensão do computador ou da aba. Não prometer monitoramento contínuo com tudo fechado. A interface deve mostrar a última verificação e a última importação confirmada, e retomar a verificação ao voltar à página.

A sugestão de API/banco do diagnóstico inicial fica fora do roteiro atual. Nenhuma funcionalidade deste plano pode depender dela, nem de um serviço obrigatório de sincronização em segundo plano.

**2. Decisões do usuário e o que elas substituem**

| ID | Definição atual | Consequência para o plano |
|---|---|---|
| DEC-01 | Operação por pasta e arquivos, sem API/servidor | Reutilizar e evoluir o padrão do Gel para todos os módulos importadores |
| DEC-02 | OSM são observações de segurança de qualquer tema: comportamento, condição da área, adequação etc. | OSM não fica restrita a máquina ou quebra |
| DEC-03 | OSM será extraída da plataforma oficial e importada por planilha | Fonte oficial é preservada; o foco local é acompanhar ações, sem exigir digitação duplicada ou validação oficial local |
| DEC-04 | Ações de OSM precisam de Kanban/Planner, encaminhamento, prioridade e tempos | Construir histórico de estados e responsáveis, não apenas um campo com o responsável atual |
| DEC-05 | KAS são iniciativas de melhoria de processo, no estilo mini kaizens | Manter identidade e benefícios próprios, usando o acompanhamento de ações comum |
| DEC-06 | Iniciativas de OEE também precisam de acompanhamento | Acrescentar origem/visão OEE em Iniciativas e acesso direto a partir de Produção e Paradas |
| DEC-07 | Diagnóstico de produção/paradas deve permitir “Abrir ação de OEE” | Levar causa/categoria, equipamento, período, impacto e evidências ao cartão; acompanhar no Planner |
| DEC-08 | Equipamentos terá cadastro de TAGs MES, semântica, medida, classificação de paradas e impacto no OEE | Criar aba técnica de TAGs MES com regras versionadas e vínculo ao equipamento |
| DEC-09 | Relatório extraído do SQL trará sinais/eventos a importar e confrontar com apontamento manual | Construir importação, interpretação, conciliação e publicação controladas; preservar as duas origens |
| DEC-10 | A plataforma mostrará cronologia da linha e dos equipamentos e tempo de produção | Construir linha do tempo com cobertura, intervalos, estados, sobreposições e detalhamento |
| DEC-11 | Manutenção deve contemplar TPM e AM, checklists, CILT, Center Line, lubrificação e outras rotinas | Reservar essas estruturas por equipamento; detalhes dos padrões serão fornecidos depois |
| DEC-12 | Agora somente verificar e registrar para uma contra-análise | Nenhum código, base, gerador, versão ou documento existente da aplicação será alterado nesta entrega |

São propostas técnicas sujeitas à contra-análise: colunas exatas do Kanban, fórmulas de prazo/idade, limites para conciliação automática, precedência de TAGs, regras de rateio e nomes das subpastas. Elas não foram apresentadas pelo usuário como políticas já aprovadas.

**3. O que existe no código e o que ainda é proposta**

| Área | Conferência | Situação e limite |
|---|---|---|
| Gel | `fsSapDir`, `fsNewest`, `fsFileDone`, `fsWatch`, `watchMin` e agendamento | Existe busca periódica na pasta, com intervalo, aviso ou importação automática; há verificações de risco que encaminham casos para conferência |
| Waste | `DIR_IN`, `renderEntrada`, `readFile`, `syncNow` | Existe entrada de arquivos em pasta; “Interpretar arquivo” é acionado pelo usuário. A sincronização periódica da base não é um importador automático de relatórios |
| Produção | `ServerData`, `Srv`, importadores de Ordens | Existe leitura CSV de catálogo/lote/caixas, trechos, sugestões e confirmação. Isso não comprova catálogo genérico de TAGs nem conciliação completa dos estados por equipamento |
| Paradas | `eventosTodos`, fila técnica, validação e `buscaPagina` | Existe deduplicação aproximada e busca de eventos incluindo ordem; falta rota/filtro integrado e conciliação por intervalos MES × apontamento manual |
| Equipamentos | Gerador e página 0.1.1 | Há abas planejadas de máquina, relatórios, intervalos, comparativo, preventiva, OS e TPM; o módulo operacional ainda precisa ser implementado |
| Iniciativas | Gerador e página 0.1.1 | Há planejamento de OSM, 5S e KAS. Planner real e origem OEE ainda precisam ser implementados |
| Projetos | Estrutura 0.1.1 | Planejamento de lista, cronograma, ações e relatórios; não é módulo operacional completo |

Referências principais no commit fixo:

- [Gel: leitura e monitoramento da pasta](https://github.com/portelarwh/vacutainer/blob/e0435136359847e07a2a775a1d7eea31371495b8/paginas/Gest%C3%A3o-Gel-Vacutainer.html#L1629); agendamento na linha 7227.
- [Waste: seleção de arquivos da entrada](https://github.com/portelarwh/vacutainer/blob/e0435136359847e07a2a775a1d7eea31371495b8/paginas/Perdas-Ordem.html#L2301); sincronização da base na linha 2465.
- [Produção: ServerData](https://github.com/portelarwh/vacutainer/blob/e0435136359847e07a2a775a1d7eea31371495b8/fontes/producao/OEE-base-2.0.html#L3144).
- [Paradas: eventosTodos](https://github.com/portelarwh/vacutainer/blob/e0435136359847e07a2a775a1d7eea31371495b8/paginas/Paradas.html#L696).
- [Modelo das páginas em construção](https://github.com/portelarwh/vacutainer/blob/e0435136359847e07a2a775a1d7eea31371495b8/fontes/modelo/gerar_paginas.py#L12).

A consolidação anterior fez leitura estática direcionada desses fluxos. Nesta revisão, executei o script original do outro agente e cenários complementares em cópia isolada: UTC/vigência/câmbio, campo de preço do Gel, busca por ordem, passagem de turno, FY27 central versus legado, cache de Ordens e controles de importação por perfil. O script original visitou 102 abas das cinco páginas principais em dois temas/1440 px, sem erro de JavaScript capturado. Isso não é homologação da pasta real, da automação contínua nem dos formatos reais de OSM/TAGs. As oito suítes da primeira análise não foram reexecutadas nesta etapa.

**4. Diagnóstico técnico preservado para revisão independente**

F01–F11 vêm da análise inicial e continuam pendentes de implementação. Suas reproduções e critérios estão em `referencias/revisao-anterior/referencias/diagnostico-inicial/diagnostico-completo.md`, seção 4, e nas evidências da mesma pasta. F01 foi ampliado nesta etapa para o carregamento com cache silencioso; F12/F13 foram incorporados após avaliar os itens B4/B5 do outro agente e executar verificações complementares. Os registros históricos também usam códigos F: sempre citar documento e commit.

| ID / prioridade sugerida | Problema e localização | Impacto e correção proposta |
|---|---|---|
| F01 / P1 | `FolderBackend.readSibling`, `Ord.gravar` e `Ord.carregar`: erro de leitura vira ausência/cache silencioso | Reprodução anterior removeu competência remota do arquivo; nova verificação carregou cache rev 7 sem erro visível após falha. Propagar erro, identificar cache e impedir escrita sem leitura válida |
| F02 / P1 | `Ord.gravar`: falta confirmação após escrita | Pode retornar sucesso após outra sessão substituir o arquivo. Conferir identidade da gravação e manter operação pendente |
| F03 / P1 | `Ord.gravar`: substituição segue depois de falhar o backup | Versão anterior pode ser substituída sem nova cópia de recuperação. Exigir backup válido e nome único antes de substituir |
| F04 / P2 | `FolderBackend`: duas definições de `readBackup` | A segunda ignora a localização legada. Manter uma implementação que trate os dois locais |
| F05 / P2 | Waste: meta `WASTE-MES` buscada pela data de hoje | Consulta histórica usa vigência incorreta. Aplicar meta por competência e critério documentado |
| F06 / P2 | Leitores de integração sem verificação uniforme de `exportsVersion` | Dados incompatíveis podem alimentar classificação. Validar versão/estrutura antes de consumir |
| F07 / P2 | `loadOrdens`: índice só pela ordem | Outra competência pode apagar do índice informação disponível, como tipo do COOIS. Preservar competência e precedência explícita |
| F08 / P2 | Waste: busca de lote em `server.dayLot` procura o valor, mas o lote está na chave | Dias do lote ficam ausentes. Corrigir leitura da chave e depois publicar os dias no contrato |
| F09 / P2 | `oeeBlock`/`gelBlock`: links sem identificador | Abre a página e exige pesquisar de novo. Gerar link do item e preservar contexto |
| F10 / P2 | Versões declaradas, exibidas e gravadas divergem | Diagnóstico de atualização fica inconsistente. Uma origem de versão alimenta todos os locais |
| F11 / P2 | Biblioteca XLSX local ausente no checkout | Instalação nova depende de CDN. Distribuir biblioteca aprovada/licença e testar sem internet |
| F12 / P2 | `vacVig`/`vacCambio` sem data usam o dia UTC | Às 22h30 de 30/11 em Brasília escolhem dezembro. Corrigir fallback de dia e passar data do fato; impacto em cada consumidor deve ser demonstrado, sem alterar timestamps absolutos de auditoria |
| F13 / P2 | Parsers aceitam texto parcial e o campo de preço do Gel tenta salvar `12a` como 12 | Validação estrita por fonte/campo, com unidade, separadores, sinal e vazio definidos. Não impor semântica única a todos os números nem converter códigos |

A contra-análise deve tentar refutar, delimitar ou reproduzir cada apontamento. Testes anteriores e os desta revisão usaram dados fictícios/ambiente isolado, com adaptação HTTP local para o Chromium. Sucesso nesses cenários não é homologação de duas estações na pasta real. Nenhum achado desta tabela está corrigido por ter sido documentado.

**5. Padrão de importação por pasta para os módulos**

O Gel oferece uma referência funcional a reaproveitar, com adaptações ao significado de cada relatório. Copiar o critério “arquivo mais recente” indiscriminadamente seria inadequado: um retrato completo de estoque e uma sequência de eventos de máquina exigem estratégias distintas.

Fluxo proposto:

```text
Sistema oficial / exportador SAP, OSM ou SQL
    → grava relatório completo na pasta autorizada
    → página identifica candidato novo e arquivo estável
    → reconhece tipo e cobertura, valida, prepara importação
    → aplica somente ao módulo dono, com backup e confirmação
    → publica exports versionado e carimbo de atualização
    → outras páginas releem e atualizam consultas
```

| Requisito | Como deve funcionar | Motivo |
|---|---|---|
| Configuração por fonte | Pasta, padrão de nome/tipo, intervalo, modo desligado/avisar/automático, período e regra de atualização | Cada módulo recebe tipos diferentes de arquivo |
| Permissão | Seleção inicial pelo usuário e status claro quando a autorização expirar | Sem servidor, o navegador precisa de acesso autorizado à pasta |
| Arquivo estável | Ignorar temporários `~$`, arquivos incompletos e mudanças de tamanho/data durante a leitura; preferir publicação por nome temporário e renomeação pelo exportador quando possível | Evitar importar um relatório ainda sendo escrito |
| Identidade | Identificador do lote de importação e do conteúdo; nome/data/tamanho ajudam, mas não comprovam conteúdo único | Reimportar ou renomear o mesmo arquivo não pode duplicar fatos |
| Cobertura | Declarar sistema, linha, período, data de extração e se o arquivo é retrato completo ou atualização parcial | Não inferir exclusão de um registro só por ele não aparecer numa extração parcial |
| Ordem de processamento | Retratos completos usam regra de substituição da cobertura; eventos/incrementais processam todos os pacotes elegíveis, incluindo atrasados | O arquivo mais recente pode não conter o histórico de arquivos anteriores |
| Validação | Layout, IDs, datas/fuso, unidades, tipos, duplicidade, cobertura e campos obrigatórios | Importar automaticamente só depois de saber o significado do pacote |
| Modos | “Avisar” mostra prévia. “Automático” aplica apenas pacote que atende regras publicadas; demais casos ficam para conferência | Automatizar rotina repetitiva mantendo divergências visíveis |
| Persistência | Ler base atual, conciliar operações, fazer backup conforme risco, gravar, reler e confirmar; marcar importado somente no fim | Falha de escrita não pode virar arquivo “processado” |
| Concorrência | Uma estação coletora designada por fonte como primeira opção operacional; rechecagem de importação e teste de dois leitores; estado de pausa/troca visível | Dois navegadores podem detectar o mesmo arquivo; designação operacional reduz concorrência, mas não é trava transacional garantida |
| Originais | Preservar arquivo ou referência verificável, hash, contagens, rejeições e revisão do parser | Permitir auditoria e reprocessamento |
| Status | Última busca, dado coberto até, última importação confirmada, próximo ciclo estimado, erro e pendência | Diferenciar ausência de arquivo novo de sistema parado |
| Retomada | Reavaliar arquivos ao abrir/retornar, com operação idempotente; não interromper formulário em edição | Recuperar ciclos perdidos sem refazer importações nem perder digitação |

Uma estrutura possível é `00. Entrada/<fonte>/`, `00. Originais/<fonte>/` e uma área de rejeitados/pendentes. **Não renomear nem mover agora as pastas existentes**, como `00. Entrada KKBC`, `00. Originais SAP` e as configurações do Gel. Futuro padrão deve aceitar caminhos configurados e migração explícita.

É preciso separar automação de ingestão de alteração de fatos fechados. Um pacote novo pode atualizar a camada de origem e criar pendência; reabrir turno/mês ou reclassificar informação histórica exige a regra correspondente. Implantar em etapas: importação manual confiável → pasta com aviso → automático por fonte validada.

**6. Planner integrado de OSM, KAS, OEE e 5S**

Proposta de navegação em Iniciativas: **Ações/Planner · OSM · KAS · OEE · 5S · Indicadores · Importações**. A ordem inicial depende do perfil. O quadro, a lista, o calendário e a visão por responsável são apresentações da mesma coleção de ações, filtrada por origem. A inclusão de OEE amplia a proposta antiga de três frentes; ainda não existe no código.

Observação, iniciativa e ação são entidades diferentes. Uma OSM pode gerar várias ações; uma iniciativa de KAS/OEE pode ter várias tarefas. Uma ação pode referenciar mais de uma evidência/origem, sem ser duplicada em quadros distintos. Fechamento de uma tarefa não prova automaticamente que a observação oficial foi encerrada ou que a iniciativa teve eficácia.

**6.1 OSM importada da plataforma oficial**

- Preservar ID oficial, datas originais, observador, descrição, local, tema, risco e status que realmente vierem na planilha. A seleção dos campos depende da amostra, ainda não fornecida.
- Guardar em paralelo os dados de importação: sistema, arquivo/hash, linha, extração, cobertura e última alteração recebida.
- A plataforma oficial continua sendo a referência para existência, texto e situação oficial da observação. O Vacutainer mantém ações locais, responsáveis, prioridade, prazo, comentários, anexos e evidências de tratamento.
- Reimportação atualiza campos de origem pelo ID oficial e preserva o trabalho local. Mudanças de risco/status que afetem a ação produzem sinalização. Divergência entre fechamento oficial e ação local aparece como divergência, não como sincronização fictícia.
- Ausência na planilha não cancela ação automaticamente; pode ser filtro/período da extração. Arquivos sem ID ou com ID repetido precisam de regra assistida, não de correspondência aproximada silenciosa.
- A visualização da observação inclui suas ações e o link/identificador para conferência oficial quando disponível. Não há envio de mudanças de volta ao sistema oficial previsto neste plano.
- O formulário “Nova OSM” e a validação oficial local do plano anterior deixam de ser a entrada principal. Metas de participação podem existir se desejadas e calculáveis pela cobertura importada; não bloqueiam a primeira entrega do Planner.

**6.2 Campos do cartão e operação**

| Bloco | Campos/funções propostos | Razão |
|---|---|---|
| Identidade | ID local único, título, tipo/origem, observação ou iniciativa pai, vínculos a ordem/lote/equipamento/evento/projeto | Rastrear por que a ação existe e evitar cópias |
| Encaminhamento | Responsável principal, apoios, equipe, data de atribuição e histórico de transferências | Responder com quem está e há quanto tempo |
| Planejamento | Prioridade, risco, impacto estimado com unidade, prazo, início previsto, dependências e motivo de espera | Priorizar de forma explicável |
| Execução | Status, checklist de tarefas, comentários com autor/data, anexos e última atualização relevante | Acompanhar avanço e bloqueios |
| Encerramento | Data, executor, evidência, resultado e verificação de eficácia quando aplicável | Diferenciar trabalho feito de problema resolvido |
| Histórico | Mudanças de status, prazo, responsável, prioridade, reabertura e vínculo, com antes/depois/quem/quando | Permitir indicadores temporais corretos |

Colunas propostas: A fazer → Em andamento → Aguardando → Concluída; para ações que exigem comprovação, incluir “Em verificação” ou situação equivalente. Cancelada fica no histórico. Arrastar é uma opção; menu/botão de mudança de status atende teclado e celular. Mudanças de prazo guardam motivo e preservam o prazo original para análise de atrasos.

**6.3 Indicadores e seus relógios**

| Indicador | Base proposta | Cuidado de interpretação |
|---|---|---|
| Idade da ação aberta | Agora menos criação local da ação | Data da observação oficial e importação são mostradas separadas |
| Tempo do fato oficial até importação | Importação menos data oficial correspondente | Mede defasagem de entrada, não demora do responsável local |
| Tempo até primeira atribuição | Primeira atribuição menos criação da ação | Expor ações ainda sem responsável |
| Tempo com responsável atual | Agora menos última atribuição ativa | Não atribuir toda a idade ao responsável atual |
| Tempo acumulado por responsável | Soma dos trechos em que a pessoa esteve responsável | Manter períodos sem responsável e transferências |
| Tempo por status / espera | Soma dos intervalos de cada estado | “Aguardando” deve aparecer; não parar todos os relógios silenciosamente |
| Tempo de fechamento | Conclusão menos criação; início até conclusão como medida adicional | Declarar população, calendário e como tratar reaberturas |
| Atraso | Prazo versus conclusão/agora, conforme estado | Preservar reprogramações e distinguir atraso original do prazo atual |
| Carga e fluxo | Abertas, em andamento, aguardando, sem dono e concluídas no período, por pessoa/origem | Cancelamentos não contam como ações concluídas com resultado |
| Eficácia | Verificadas eficazes / verificadas; reincidências vinculadas | Não pressupor causalidade só pela melhora de um percentual |

Apresentar mediana e distribuição/faixas junto da média quando fizer sentido. Dias corridos ou úteis, pausas, reaberturas e SLA por risco são regras a definir. Enquanto não forem definidas, exibir datas e duração em base explícita, sem inventar uma política oficial.

Risco de segurança e impacto em produção são dimensões diferentes. O quadro pode ser comum, mas não se deve diminuir prioridade de segurança porque a perda financeira estimada é menor.

**6.4 KAS — mini kaizens**

Cadastro da iniciativa: problema/oportunidade, processo/área, proposta, responsável, baseline, metas, esforço, benefício esperado e evidências. A iniciativa usa o Planner para suas ações. Conclusão requer registrar resultado; ganhos validados guardam período, método e quem conferiu. Um mesmo benefício não pode ser contado de novo em KAS, iniciativa de OEE, Waste e Projeto.

**6.5 Iniciativas e ações de OEE a partir do diagnóstico**

Percurso desejado: Produção/Paradas → Pareto, recorrência ou cronologia → selecionar evidência → **Abrir ação de OEE** → cartão/iniciativa em Iniciativas › OEE → tratamento no Planner → verificação de resultado.

Ao abrir a ação, levar: origem, categoria/código, equipamento/componente quando conhecido, ordem/lote quando aplicável, período/filtros, quantidade de eventos, minutos, impacto calculado com unidade, referência dos registros e revisão das fontes. Guardar uma fotografia da evidência de abertura e também um link para reconsultar o período, distinguindo os dois.

A plataforma deve listar oportunidades por **impacto, tempo e quantidade**, como solicitado. Comparar eventos distintos e minutos conciliados para não priorizar duplicatas. Perdas em peças ou custo só entram quando houver método válido e dados suficientes; oportunidade não é economia já realizada. Padrões ou regras podem sugerir ações, mas o diagnóstico deve mostrar a base e permitir revisão da recomendação. Não inventar causa raiz a partir de correlação.

Antes de criar, mostrar ações/iniciativas já relacionadas à mesma categoria/equipamento/período. Permitir vincular evidência nova a uma ação existente. Origem OEE permanece distinta de OSM e KAS nos filtros e relatórios.

**7. Equipamentos › TAGs do MES**

Cada equipamento deve ter acesso às TAGs, estados, cronologia e rotinas de manutenção. Uma TAG é um sinal técnico. Ela pode informar contador, estado ou código; por si só não comprova causa raiz, peça defeituosa ou uma parada que deve reduzir o OEE da linha.

| Cadastro proposto | Conteúdo mínimo a avaliar | Razão |
|---|---|---|
| Identificação | ID, nome/endereço exato no MES, equipamento/linha, descrição, ativo e origem do relatório | Relacionar o sinal à máquina e aos dados importados |
| Significado | Para que serve, como é medida, tipo de dado e unidade | Interpretar booleano, contador e código corretamente |
| Medição | Contagem acumulada/incremental, escala/fator, frequência esperada, sentido/inversão, reset e valor inválido | Evitar produção duplicada e estados invertidos |
| Tempo | Fuso, resolução, timestamp do evento/amostra, início/fim, qualidade e cobertura esperada | Reconstruir intervalos com limites conhecidos |
| Classificação | Valores/condições para produção, parada, máquina bloqueada, máquina ociosa e desconhecido; categoria/código de parada quando aplicável | Transformar leitura em estado explicado |
| Regras | Prioridade entre sinais, estabilização, tratamento de sobreposição, lacuna, falha de comunicação e transição | Produzir cronologia consistente sem preencher ausência como produção |
| OEE | Participação do equipamento e regra proposta de impacto D/P/Q ou fora do cálculo, referenciada às categorias oficiais | Separar fenômeno de máquina de perda efetiva da linha |
| Vigência | Revisão, início/fim, autor e motivo | Explicar por qual regra um dia antigo foi interpretado |

O equipamento e os códigos de parada continuam referenciando o cadastro geral do Portal. Proposta de responsabilidade: TAGs e suas regras técnicas pertencem a `equipamentos-base.json`, editadas em Equipamentos; são publicadas para os leitores por contrato. Isso atende ao cadastro na aba solicitada sem autorizar Equipamentos a gravar `vacutainer-cadastros.json`. Essa divisão deve ser confirmada na contra-análise antes de implementar.

Não renomear nem substituir o importador de caixas/lotes existente para encaixar o novo formato. Ele deve continuar funcionando; relatórios genéricos de TAGs precisam de adaptador próprio ou extensão compatível.

**8. SQL por arquivo, conciliação e cronologia**

**8.1 Entrada e normalização**

O relatório será extraído externamente do SQL e importado manualmente ou pela pasta monitorada. O formato pode trazer eventos já fechados com início/fim ou amostras/transições; isso precisa ser confirmado por amostra. O mesmo modelo visual não significa que os dois formatos possam usar o mesmo parser sem adaptação.

Preservar ID de origem quando existir, TAG, equipamento, timestamps originais, valor/código, qualidade, período extraído e identificador do pacote. Registros tardios, corrigidos ou cancelados precisam atualizar sua revisão sem duplicar fatos. Se o extrato incremental não trouxer estado anterior ao início da janela, o início fica desconhecido ou exige a informação de fronteira; não se presume que o equipamento começou produzindo.

Representar intervalo com limites explícitos e regra uniforme, por exemplo `[início, fim)`, para que dois intervalos adjacentes não contem o mesmo instante. Cortar visualizações nos limites de dia, turno e ordem sem perder o evento original. Evento aberto continua aberto até fechamento/limite de cobertura, com isso indicado.

**8.2 Confronto MES × hora a hora manual**

O usuário quer conciliar quando possível e acrescentar o que faltar. A proposta realiza isso mantendo origem e classificação:

| Situação | Tratamento proposto | Efeito na contagem |
|---|---|---|
| Correspondência clara entre MES e manual | Vincular as duas evidências a um evento lógico, preservando observação do operador e medição MES | Contar a ocorrência/tempo conforme regra única, sem duplicar |
| Sobreposição parcial | Mostrar trecho comum e diferenças de início/fim; aceitar conciliação por regra aprovada ou revisão | Não somar os intervalos inteiros dos dois lados |
| Um manual cobre vários eventos MES, ou o inverso | Permitir relação vários-para-vários e segmentos | Evitar obrigar uma falsa correspondência um-para-um |
| Apenas MES | Acrescentar ocorrência importada identificada e classificada como pendente ou validada conforme política definida | Nova evidência aparece na cronologia; entrada no OEE oficial segue validação/regra |
| Apenas manual | Preservar apontamento e sinalizar ausência/cobertura da fonte MES | Ausência no MES não elimina o manual |
| Divergência de equipamento, código ou duração | Criar pendência com ambos os lados e opção de decisão fundamentada | Não escolher silenciosamente uma verdade |
| Manual registra só minutos numa hora | Comparar volume/janela, mas indicar horário exato desconhecido | Não desenhar uma posição temporal fictícia como se fosse medida |
| Turno/mês já fechado | Mostrar nova informação e abrir divergência; respeitar reabertura controlada | Não alterar resultado fechado silenciosamente |

“Acrescentar” não significa gravar uma segunda cópia indistinguível nem somar a mesma parada em duas bases. Proposta: evento MES não conciliado entra na camada rastreável de eventos; sua promoção para cálculo oficial depende de critérios validados. Conciliar automaticamente correspondências inequívocas pode ser permitido futuramente; limites, precedência e impacto ainda precisam ser definidos.

A aproximação atual de `eventosTodos` (dia/equipamento/turno, início próximo ou duração próxima) não basta para a solução completa. É necessária identidade de origem, relações, interseção temporal e revisão de decisão. Reimportar o mesmo pacote deve produzir a mesma contagem. Corrigir um evento de origem deve reavaliar seu vínculo e expor mudanças, não apagar a decisão anterior.

**8.3 Fluxo de dados proposto sem escrita cruzada**

1. Produção publica os eventos manuais e contexto do turno/ordem por IDs estáveis.
2. Equipamentos importa o MES, interpreta TAGs e publica intervalos/estados de máquina com origem e revisão da regra.
3. Paradas consome as duas origens, registra vínculos e decisões, e publica eventos conciliados/validados.
4. Produção lê os resultados relevantes e os aplica conforme a regra operacional, preservando a referência; continua dona do cálculo oficial do OEE.
5. Equipamentos apresenta a cronologia técnica de suas origens e decisões; Portal/Rastreabilidade consulta os resultados publicados.

É uma proposta de contratos, não uma autorização para cada módulo editar a base do outro. Deve-se impedir o ciclo de realimentação: um evento conciliado reaplicado na Produção não pode ser exportado como novo evento manual e entrar de novo na conciliação. Guardar origem primária, revisões e relações, com regras de exclusão desse retorno.

**8.4 Linha do tempo**

Visões: linha completa, máquina individual e comparação em faixas alinhadas; zoom dia/turno/hora; filtro por ordem, lote, equipamento, categoria e origem. Ao clicar num segmento, mostrar medidas, código, motivo manual, TAG, origem, qualidade, revisão e conciliação.

Estados principais por equipamento: Produzindo, Parada, Bloqueada, Ociosa e Sem dados/Indeterminado, além dos contextos programados necessários. Duas TAGs simultâneas da mesma máquina precisam de regra de composição. Preservar sinais brutos em camada própria e uma faixa consolidada mutuamente exclusiva para totalizar estados.

**9. Tempo e OEE: regras que a interface precisa explicar**

- Tempo em estado “Produzindo”, tempo planejado de produção, tempo operacional e tempo produtivo ideal são medidas diferentes. Mostrar nome, unidade, fórmula e cobertura.
- A soma dos estados consolidados de um equipamento deve fechar com a janela analisada, incluindo sem dados. A produção boa e o refugo continuam sendo quantidades, com unidade e fonte.
- Paradas simultâneas em máquinas diferentes não são somadas para formar tempo parado da linha. Para o tempo de linha, considerar a união temporal do impacto efetivo e a regra do ponto de medição. “30 min-máquina” e “10 min de linha” podem ser ambos verdadeiros e precisam de rótulo.
- Bloqueada e ociosa podem significar espera por outra parte do processo. Não converter automaticamente em falha própria nem em desconto do OEE oficial da linha.
- A regra já documentada de OEE próprio por máquina e tratamento de estados será revisada com amostras; não se mistura com o OEE oficial da linha. Tempo de estados sozinho não fornece todos os componentes D/P/Q.
- TAG de ausência de pulso/caixa pode sugerir um intervalo sem produção; não prova duração exata de parada nem seu motivo. Quantização e frequência precisam aparecer como limite da inferência.
- Regras históricas de calendário, abono, retrabalho e microparada continuam vigentes; alterações dependem de documento/regra operacional, não deste planejamento.

Exemplo conceitual para a contra-análise: em uma janela de 60 min, uma máquina para de 10 a 20 e outra de 15 a 25. São 20 min somados entre máquinas e 15 min de união temporal. A perda oficial da linha ainda depende de como esses eventos afetaram seu ponto de medição. O exemplo não define por si só o cálculo oficial.

**10. Equipamentos › TPM, AM e rotinas por máquina**

Registrar desde já a necessidade de manutenção autônoma e dos princípios de TPM, contemplando **CILT, Center Line, lubrificação e checklists por equipamento/componente**. O responsável fornecerá detalhes. Nenhuma tarefa, periodicidade, faixa técnica ou conteúdo de procedimento será inventado nesta etapa. Também não fixar a expansão local de CILT ou as etapas corporativas de TPM sem confirmação.

| Estrutura proposta | Conteúdo | Motivo |
|---|---|---|
| Biblioteca de padrões | Tipo de rotina, equipamento/componente, revisão, vigência, instruções, imagens/documentos e qualificação necessária | Executar a versão correta e preservar padrões anteriores |
| Plano | Periodicidade/calendário, responsáveis e regra de aplicação por uso/turno quando definida | Saber o que está previsto, vencido ou não aplicável |
| Execução AM/CILT | Data/hora, executante, versão do checklist, itens, conforme/não conforme/não aplicável com motivo e evidências | Provar execução sem apenas marcar “feito” |
| Center Line | Parâmetro/ponto, valor alvo, unidade, faixa aprovada, condição de medição e leitura executada | Comparar medição com padrão vigente; não recalcular faixa a partir de média histórica |
| Lubrificação | Ponto, lubrificante aprovado, método, quantidade/frequência quando definidos, registro e anomalia | Padronizar tarefa e registrar desvios |
| Anomalias/etiquetas | Não conformidade, risco, prioridade, responsável, estado e vínculo a evento/OS/ação | Fechar a ligação entre inspeção, intervenção e resultado |
| Manutenção planejada | Preventiva/preditiva, ordens de serviço, planejamento e histórico técnico | Integrar AM com PM e intervenções especializadas |
| Indicadores | Cumprimento do plano, atrasos, anomalias abertas, reincidência e tempo de tratamento | Acompanhar execução e confiabilidade |

Não duplicar AM e preventiva para o mesmo serviço. Um checklist mede execução de padrão; uma OS registra uma intervenção; uma ação de melhoria pode alterar o padrão após validação. Os três se vinculam, mas têm ciclos de vida diferentes. Encaminhamento e limites entre operação e manutenção especializada permanecem conforme procedimentos e habilitações locais a fornecer.

Revisar um padrão não pode reescrever resultados de checklists antigos. A execução guarda qual versão usou. Falha de leitura da base ou conflito entre estações segue as mesmas exigências de integridade dos demais módulos.

**11. Responsabilidades e integração por arquivos**

| Dono | Dados próprios propostos/existentes | Publicação para outras páginas |
|---|---|---|
| Portal | Cadastro geral, pessoas/perfis, códigos e vigências comuns, configuração central | Referências comuns e diagnóstico de integração |
| Produção / Ordens | Plano, calendário, manual hora a hora, dados SAP de ordens e cálculo de OEE | Ordem/lote/turno/produção/eventos manuais e resultados, com cobertura histórica |
| Waste | KKBC, custos, causas/fechamentos e ações existentes até eventual integração | Resultados financeiros e evidências para ficha/Planner |
| Gel | LPs, movimentações, consumo e complementos de gel | Ordem–lote–LP, consumo, scrap e pendências |
| Equipamentos | TAGs MES e regras, importações técnicas, estados, padrões TPM/AM, execuções e OS | Intervalos de máquina, revisões, manutenção, anomalias e vínculos |
| Paradas | Camada técnica, validação, conciliação e eventos lógicos relacionados às fontes | Eventos validados, minutos e indicadores de falhas |
| Iniciativas | Observações OSM importadas, KAS/OEE/5S, ações comuns e histórico de tratamento | Ações/pendências, indicadores e vínculos a origens |
| Projetos | Escopo, marcos, investimento e benefícios de projetos | Portfólio e vínculos, sem duplicar tarefa/benefício |

O quadro global do Portal agrega ações/OS dos seus donos. Novas ações de OSM/KAS/OEE vivem em Iniciativas; ações já existentes de Waste/Paradas não são movidas neste plano. Sua migração, se adotada futuramente, precisa preservar IDs, referências e histórico. Manutenção continua dona de suas OS em Equipamentos.

O botão “Abrir ação de OEE” pode encaminhar contexto a Iniciativas por link estruturado e confirmação na página dona; não deve escrever diretamente a base de Iniciativas a partir de Produção. O meio exato de transferência deve ser projetado sem excesso de dados na URL e sem depender de API.

Contratos publicados devem evoluir de forma aditiva quando compatíveis e explicitar versão quando o significado mudar. Leitores reconhecem a versão antes de usar. A arquitetura deve prever carregamento por período/índice e retenção dos arquivos brutos: um dump de TAGs não pode tornar o JSON operacional ilimitado.

**12. Propostas por página, preservando o diagnóstico inicial**

| Página | Entregas propostas | Por que / dependência |
|---|---|---|
| Portal | Rastreabilidade; Minha fila/Minha equipe/Sem responsável; Reunião diária; atualização/cobertura e relatórios resumidos/detalhados | Entrada única com responsabilidade e granularidade explícitas, sem recalcular os resultados |
| Administração | Configurar fontes de arquivos, situação/versões, cadastro e calendário/vigências visíveis | Entender de onde vem cada dado e corrigir indisponibilidade |
| Produção | Ordem/lote por trecho; eventos manuais; sugestões/conciliação MES; “Abrir ação de OEE”; importação por pasta; evolução da passagem de turno e alerta de ritmo | Ligar tempo/quantidade a evidência e tratamento, reutilizando observações e relatório de turno já existentes |
| Waste | Corrigir metas/competências; reduzir resumos repetidos; links completos; qualidade dos dados; entrada por pasta; causas e eficácia | Tornar análise financeira verificável e integrada |
| Gel | Preservar monitoramento; produção/calendário do OEE; Programação e Simulador separados; rastreabilidade de LP | Eliminar digitação repetida e compartilhar o padrão de importação |
| Paradas | Conciliação por intervalos/identidade; fila técnica; cronologia e Pareto; relatório próprio; ações de OEE | Diagnóstico sem duplicatas e encaminhamento com base factual |
| Equipamentos | Ficha do ativo; TAGs MES; importações e cronologia; AM/CILT/Center Line/lubrificação; TPM, preventiva/OS e anomalias | Reunir semântica técnica, estado e cuidado do equipamento |
| Iniciativas | Importar OSM oficial; Planner comum; KAS; OEE; 5S; históricos e métricas de tempo/carga/eficácia | Tratar as frentes solicitadas sem perder identidade |
| Projetos | Portfólio e cronograma; vincular iniciativas maiores; validar benefício | Acompanhar escopo/investimento sem transformar toda tarefa em projeto |

As melhorias visuais anteriores permanecem: filtros e unidades claros; uma ação principal por tarefa; menos repetição; resumo com detalhe acessível; foco/teclado e toque; status de gravação pendente visível; navegação e retorno com filtros. A cronologia e o Planner devem oferecer alternativas de lista/tabela para situações em que o gráfico/quadro não seja a melhor leitura.

Perfis mudam a apresentação inicial: operador vê seu turno/rotina; líder vê perdas e conferências; responsável vê suas ações; manutenção vê máquinas, anomalias e OS; gestão vê tendência e decisões. Fórmulas e filtros são os mesmos nas visões resumida e detalhada. Separar permissão funcional de preferência de foco: função permitida pouco usada pode ir em Mais; função não permitida não reaparece ali, e Detalhado não aumenta permissão. Perfis locais seguem o modelo de confiança atual da pasta; não representam autenticação corporativa.

**13. Relatórios e histórico que precisam nascer integrados**

- Dossiê da ordem: produção/horas, eventos conciliados, Waste, Gel/LPs, SAP, ações e pendências.
- Cronologia diária: linha e equipamentos, cobertura, estados, tempos, conciliação, responsável pela decisão e origem do relatório.
- Ações por pessoa: carteira atual, tempo com o responsável, transferências, espera, atrasos e encerramentos do período.
- OSM: situação oficial importada, tratamento local, temas/risco/recorrência e defasagem da extração.
- KAS/OEE: problema, evidência de abertura, ações, resultado e eficácia; ganho estimado separado do validado.
- TPM/AM: plano versus executado, revisão dos checklists, leituras, anomalias e intervenções.
- Consolidado gerencial: poucos indicadores, tendências e decisões; anexo com registros que sustentam os números.

Todo relatório deve informar filtros, período do fato, competência quando relevante, instante de extração/importação, fontes/revisões, unidade, cobertura e situação preliminar/fechada. Tempos sobrepostos, falta de dado e dados incompatíveis não podem desaparecer no resumo. Excel, PDF e tela com o mesmo critério precisam mostrar o mesmo resultado.

**14. Refinamento de código e implementação futura**

Priorizar correções de integridade antes de ampliar gravações automáticas. Separar importação/persistência, leitores explícitos, cálculo, conciliação e tela. Modularizar no código-fonte mantendo a entrega em HTML autônomo. Utilitários só devem ser compartilhados quando tiverem o mesmo contrato; funções homônimas não precisam ser iguais. Não distribuir scripts externos obrigatórios nem reescrever de uma vez todos os mecanismos de gravação.

Áreas extensas identificadas anteriormente permanecem candidatas a refino com testes de comportamento: `computeDayRaw`, `CadSync.aplicar`, `openConfig` do Gel, parser da Meta FY27 e validadores de cadastro. A nova conciliação temporal deve ter um núcleo puro com casos de fronteira verificáveis, sem decisões escondidas em renderização de tela.

A falta de servidor exige especial cuidado com confirmação de escrita, operações reaplicáveis, importação idempotente e recuperação. Nenhum arquivo `.lock` caseiro deve ser descrito como garantia absoluta de exclusão entre estações sem validar a semântica real da pasta/navegador. Designar coletor reduz concorrência, mas a solução precisa detectar/reconciliar conflitos, com testes representativos.

**15. Ordem proposta de entregas e dependências**

Esta é uma recomendação para discussão, não uma autorização de execução nem um cronograma fechado.

1. Contra-analisar F01–F13, o parecer B1–B10/C1–C5 e as propostas; registrar concordâncias/divergências com evidência.
2. Quando autorizado: corrigir integridade, confirmação, backup e consistência de contratos/identidades; homologar concorrência real.
3. Implementar importação manual de OSM com IDs e preservação do trabalho local; Planner inicial OSM/KAS/OEE e histórico de responsáveis/status. Integrar botões de ação de OEE com contexto confiável.
4. Definir e aplicar padrão de pasta/aviso por fonte; liberar automático apenas para importadores validados, de modo incremental.
5. Construir ficha integrada da ordem e publicação histórica, incluindo eventos manuais necessários para a próxima etapa.
6. Com amostras: TAGs MES, adaptador SQL por arquivo, estados por equipamento, conciliação temporal e cronologia; só depois ampliar aplicação automática ao OEE validado.
7. Com padrões detalhados: AM/TPM, CILT, Center Line, lubrificação, checklists, anomalias e OS. Ficha simples e reserva de estrutura podem anteceder o detalhe técnico.
8. Ampliar 5S, relatórios e Projetos, com ganhos conciliados e visão por público.

O Planner pode começar antes do motor MES completo; a cronologia não depende de construir todo o TPM; registrar a necessidade de TPM agora não exige inventar seus procedimentos. As dependências detalhadas e critérios estão na lista de pendências.

**16. Informações a obter, sem bloquear o registro das necessidades**

| Tema | Informação necessária na fase correspondente | Já pode ser feito conceitualmente |
|---|---|---|
| OSM | Amostra descaracterizada, ID estável, datas/status, cobertura e mudanças entre extrações | Modelo fonte oficial versus trabalho local e histórico do Planner |
| Planner | Estados, reabertura, dias úteis/corridos, prioridade/SLA, papéis e verificação | Registro de eventos de status/responsável e visões comuns |
| OEE | Critérios oficiais de impacto, meta e sugestões; identidade de eventos | Referências de evidência e encaminhamento de ações |
| MES/SQL | Colunas, formato de evento/transição, IDs, frequência, fuso, qualidade, correções/cancelamentos, amostra por máquina | Catálogo de TAGs, requisitos de normalização e casos de conciliação |
| Linha | Ponto oficial de medição, relações de bloqueio/ociosidade e regras já aprovadas | Separar minutos-máquina, união de intervalos e impacto efetivo |
| TPM/AM | Procedimentos, significado local de CILT, pontos, faixas, periodicidades, habilitações e evidências | Reservar biblioteca de padrões versionados, planos e execuções |
| Pasta | Estação coletora possível, disponibilidade, permissões, volume e processo de publicação dos arquivos | Modos manual/aviso/automático e diagnóstico de atualização |

**17. Como este material deve ser contra-analisado**

O outro agente deve ler primeiro as decisões mais recentes e o registro do repositório. Depois deve confrontar os achados e as propostas com o código exato, identificar conclusões fortes demais ou lacunas e propor uma arquitetura viável sem servidor. Deve dar atenção especial à interpretação das TAGs, relações vários-para-vários, intervalos sobrepostos, turnos noturnos, ausência de cobertura, reimportações, dois leitores e cálculo de tempo por responsável.

O resultado esperado é um parecer escrito com evidências, alternativas e sequência recomendada. Para cada F01–F13 e item novo relevante: confirmado, parcialmente confirmado, refutado com evidência, ou não verificável com o material disponível. Não implementar correções, não rodar geradores sobre a árvore original, não modificar regras de OEE nem bases reais. Testes novos devem ser feitos em cópia isolada e descritos. A confirmação de entrega exige código e validação posteriores.

**18. Complementos incorporados após a análise comparada**

**18.1 Datas e números — contratos antes de uniformização**

O caso F12 demonstra erro no fallback sem data, não em toda função que recebe uma data válida. A data do fato deve seguir explícita em preço, câmbio, turno e meta. O dia operacional de um turno noturno não é necessariamente a data civil do relógio; definir sua referência sem modificar carimbos absolutos da auditoria.

F13 foi reproduzido no formulário de preço: `12a`, cotação 5, resultou em prévia e pacote de gravação de 12/60 sem aviso. O pacote foi interceptado no teste. O parser estrito deverá rejeitar texto parcial, NaN/Infinity e valores fora da faixa. A interpretação de `1.234`, de `15-`, da unidade textual e do vazio depende da fonte/campo; preservar os contratos válidos de SAP, Forms e entrada manual. Uma tabela única de resultados para todo campo não é critério suficiente.

**18.2 Minha fila no Portal**

Uma pendência só entra em “Minha fila” por vínculo com usuário, equipe ou papel configurado; não por ser urgente. Exibir também “Minha equipe” e “Sem responsável”, com triagem. O modelo publicado precisa de ID, origem, responsável/equipe, prazo/status, severidade, contexto e link. Barris vencendo, competências sem KKBC e validações podem ser pendências da área até serem atribuídas. A ação continua sendo editada por seu dono.

**18.3 Reunião diária**

Proposta de aba do Portal com período/turno, produção/OEE, principais perdas, gel e ações, seguida de decisões, responsáveis, prazos e encaminhamentos ao Planner. Guardar a fotografia da pauta apresentada, fontes/revisões e deliberações. Distinguir dado disponível até cada instante, pendências de conferência e números preliminares.

O Waste pode estar em competência mensal enquanto Produção é diária e o Gel é um retrato de estoque. Não gerar “perda de ontem” a partir de custo mensal sem fonte diária. Relatório executivo deriva dessa composição, com anexo detalhado; uma página é objetivo de leitura, não justificativa para cortes silenciosos.

**18.4 Passagem de turno e alerta de ritmo**

Já há campo `ps.note`, observações e relatório “Passagem de turno” em Produção. Evoluir o existente para itens que passam à próxima equipe, ciência e encaminhamento de ações, preservando quem registrou e quando. Não construir outro relatório equivalente alegando ausência de registro.

O ritmo/projeção mensal já existe. Uma projeção do turno no hora a hora deve considerar tempo útil decorrido/restante, pausas, catálogo/meta e dados faltantes. Mostrar hipótese e atualização; não gerar alerta de desempenho a partir de turno sem cobertura suficiente.

**18.5 Componentes e relatórios comuns**

Compartilhar primeiro metadados e modelo de documento, depois adaptadores e saídas conforme forem alterados. A migração completa dos três geradores é manutenção gradual, não dependência obrigatória do Planner, da Reunião diária ou do relatório próprio de Paradas. Preservar os testes de comentário longo, tabelas completas, tema, impressão e cópia para Outlook.

Cadastro central FY27 já faz a interface da Produção encaminhar a importação ao Portal; a entrada local permanece quando não há metas centrais. Remover o modo legado requer decisão posterior e validação da compatibilidade. Separar as fontes do Gel é opção de manutenção; não precisa copiar o build por substituições da Produção e deve preservar o HTML autônomo distribuído.

**18.6 Recuperação e recursos**

Downloads da Produção e o helper de download do Portal já revogam URLs. Revisar pontos específicos de backup/imagem no Paradas e documentos do Portal, respeitando o tempo de vida de abas e imagens. Tratar como manutenção delimitada, não como vazamento geral comprovado nas três páginas.

O backup diário do Portal ignora falhas por decisão registrada. Proposta: última falha/última cópia confirmada visíveis e nova tentativa; não acusar “backup de hoje não feito” antes da primeira gravação. A gravação normal segue a política existente; backups críticos de substituição/restauração permanecem separados.

**18.7 O que os dados existentes já permitem e o que falta**

Paradas já encontra ordem na busca textual, mas precisa de rota/filtro integrado. Gel já publica `lps` por ordem; o trabalho é cobertura e navegação. Produção publica `produzido`, mas isso sozinho não define boa, scrap e OEE por ordem. Não somar/atribuir indicadores sem denominadores e vínculos válidos.

Histórico de falhas permite ficha e criticidade histórica de equipamento; não comprova estado atual ou gargalo. Estado precisa de fonte/cobertura, e gargalo precisa de critério de fluxo. A cronologia MES e os estados definidos nas seções anteriores tratam essa lacuna.

Os recortes de PRs propostos, seus riscos e validações estão na seção 11 de `01-PARECER-COMPARATIVO.md`. Eles são propostas para aprovação futura, sem implementação nesta revisão.

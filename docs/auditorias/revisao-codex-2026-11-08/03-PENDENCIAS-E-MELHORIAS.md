**Vacutainer — lista única revisada após análise comparada**

Atualizada em 08/11/2026 após avaliar o diagnóstico de `c3ae4b0`. Aplicação de referência: `e0435136359847e07a2a775a1d7eea31371495b8`. Documentos orientadores: [02-PLANO-MESTRE-REVISADO.md](02-PLANO-MESTRE-REVISADO.md) e [01-PARECER-COMPARATIVO.md](01-PARECER-COMPARATIVO.md). Os documentos originais do projeto e os pacotes anteriores foram preservados.

**Como usar:** pedir “Revise `03-PENDENCIAS-E-MELHORIAS.md`, compare com o código atual e diga quais IDs podemos fazer agora”. Exigir o commit examinado na resposta. Avaliar cada item como existente, parcial, ausente, dependente de informação ou fora de escopo. Não considerar uma proposta implementada por aparecer no HTML em construção.

**Situações desta edição:**

- `DOCUMENTADO`: necessidade registrada; implementação não foi constatada.
- `PARCIAL`: parte existe, e o restante está explicitado.
- `REPRODUZIDO ANTES`: cenário reproduzido na análise inicial do mesmo commit; aguarda contra-análise/correção.
- `REPRODUZIDO NESTA REVISÃO`: cenário complementar executado em cópia isolada; continua pendente de implementação e pode ser contra-analisado.
- `A DEFINIR`: faltam detalhes técnicos ou de negócio para fechar a implementação.
- `FORA DO ESCOPO ATUAL`: não é dependência das entregas.

Prioridades abaixo são recomendações para revisão: **P1** integridade/recuperação; **P2** núcleo das jornadas solicitadas; **P3** ampliação e refinamento. Não são prazos ou autorização de execução. “Pedido” vem das orientações do usuário; “proposta” é a forma sugerida de atender ao pedido. A distinção não dispensa aprovação futura para implementar.

Para marcar `CONCLUÍDO` no futuro, registrar: commit, arquivos, teste/homologação, limites e data. Para `REFUTADO`, guardar a evidência e o motivo; não apagar o histórico. O responsável pela execução será definido quando a etapa for autorizada.

**1. Integridade e consistência — diagnóstico inicial, seção 4**

Os códigos F pertencem a este diagnóstico de 08/11; não confundir com códigos homônimos das auditorias antigas do repositório.

| ID | Prioridade e item | Situação | Critério mínimo para encerrar |
|---|---|---|---|
| F01 | P1 — Ordens: impedir escrita após erro e identificar cache no carregamento | REPRODUZIDO ANTES; AMPLIADO AGORA | Erro gera zero escritas; cache pode ser consultado identificado, sem silêncio nem falsa leitura remota; pacote local e competências remotas preservados |
| F02 | P1 — Confirmar a gravação de Ordens por releitura e identidade | REPRODUZIDO ANTES | Colisão/releitura falha não retorna sucesso falso nem limpa operação pendente |
| F03 | P1 — Backup obrigatório antes de substituir competência; nome único | REPRODUZIDO ANTES | Falha do backup impede substituição; cópias sucessivas não se sobrescrevem |
| F04 | P2 — Eliminar duplicidade de `readBackup` preservando caminho legado | REPRODUZIDO ANTES | Cópia antiga e nova podem ser lidas/baixadas/restauradas pelo caminho correto |
| F05 | P2 — Meta do Waste por vigência da competência | REPRODUZIDO ANTES | Relatório histórico e período de vários meses usam metas corretas e iguais às telas |
| F06 | P2 — Validar versão/estrutura de contratos em todos os leitores relevantes | REPRODUZIDO ANTES | Contrato desconhecido gera incompatibilidade explícita, sem alimentar indicadores |
| F07 | P2 — Índice de Ordens por ordem/competência com precedência explícita | REPRODUZIDO ANTES | Informação do COOIS não desaparece ao mudar ordem do array ou importar outro mês |
| F08 | P2 — Recuperar dias do lote em `dayLot` e depois publicá-los no contrato | REPRODUZIDO ANTES | Dias corretos aparecem sem coincidência por substring de outro lote |
| F09 | P2 — Links de ordem, dia e LP com item e contexto | REPRODUZIDO ANTES | Clique abre item exato; voltar preserva filtros |
| F10 | P2 — Igualar versão exibida, declarada e gravada | REPRODUZIDO ANTES | Uma versão de origem alimenta os três locais e os testes conferem igualdade |
| F11 | P2 — Distribuição XLSX local, com licença e versão aprovada | REPRODUZIDO ANTES | Instalação limpa importa/exporta Excel sem CDN; versão efetiva fica verificável |
| F12 | P2 — Padrão de dia de `vacVig`/`vacCambio` usa UTC sem data explícita; incorporado de B4 | REPRODUZIDO NESTA REVISÃO | Fallback de dia correto na fronteira do fuso; data explícita preservada, timestamp de auditoria não alterado e consumidores afetados identificados |
| F13 | P2 — Texto parcial aceito em parsers e no campo real de preço do Gel; incorporado de B5 | REPRODUZIDO NESTA REVISÃO | `12a` não prepara gravação; separadores/sinal/unidade/vazio definidos por campo e fonte, sem parser numérico para códigos |

**2. Arquitetura por pasta e importação — pedidos DEC-01/03/09; plano mestre § 5**

| ID | Item e motivo | Situação | Dependências / critério de aceite |
|---|---|---|---|
| ARQ-01 | Manter todas as entregas viáveis por HTML, JSON e pasta compartilhada | PARCIAL | Modelo já existe; cada proposta nova deve declarar dono, base e contrato, sem exigir servidor |
| ARQ-02 | Definir um dono por dado e impedir escrita cruzada/realimentação de eventos | PARCIAL | Contratos e IDs; evento conciliado não retorna como nova origem manual |
| IMP-01 | Configuração por fonte: pasta, padrão, intervalo e modos manual/aviso/automático | PARCIAL | Gel já possui referência; aplicar aos demais por adaptadores, sem renomear pastas atuais |
| IMP-02 | Publicação/leitura de arquivo estável e identificação de conteúdo | DOCUMENTADO | Temporário/incompleto é ignorado; arquivo renomeado ou reimportado não duplica fatos |
| IMP-03 | Tratar retrato completo, pacote incremental, correção e cobertura de forma distinta | DOCUMENTADO | Arquivo antigo atrasado e extrato parcial não provocam perda de fatos nem exclusão indevida |
| IMP-04 | Validar pacote e persistir antes de marcar arquivo como importado | PARCIAL | F01–F03; pacote com erro vai à conferência e falha de gravação permite retomada |
| IMP-05 | Coleta por estação designada e tratamento de leitores concorrentes | A DEFINIR | Decidir operação; testar duas estações e não prometer trava transacional sem comprovação |
| IMP-06 | Exibir última busca, cobertura, última importação confirmada, erro e retomada | PARCIAL | Diferenciar base relida de relatório importado; suspender/revogar permissão fica visível |
| IMP-07 | Preservar originais, hash, revisão do parser e rejeições; definir retenção/particionamento | PARCIAL | Estratégia por fonte/volume; reprocessamento rastreável sem JSON operacional ilimitado |
| IMP-08 | Ampliar ingestão por pasta a Waste, Ordens/SAP, OSM e MES por etapas | DOCUMENTADO | Parser manual validado por fonte; não confundir timer de sincronização com importação |
| HOM-01 | Homologar rede real, duas estações, arquivo em escrita, permissão, suspensão e uso offline | DOCUMENTADO | Usar cópias de teste autorizadas; registrar resultados e limites por navegador |

**3. Rastreabilidade e integração entre páginas — diagnóstico e DEC-07/09/10**

| ID | Item e motivo | Situação | Dependências / critério de aceite |
|---|---|---|---|
| RAS-01 | Ficha única por ordem/lote/LP, busca global e resumo/detalhe | PARCIAL | Ctrl K por índice/tipo sem tamanho rígido; Paradas já pesquisa ordem, Gel já publica LPs; acrescentar rota/contratos sem duplicar o existente |
| RAS-02 | Publicar eventos manuais, dias/trechos e histórico necessário fora das janelas atuais | DOCUMENTADO | IDs estáveis; distinguir falta de dado de período não publicado |
| RAS-03 | Preservar origem, revisão, contexto e vínculo inferido/confirmado | PARCIAL | Não atribuir parada à ordem só porque têm a mesma data |
| RAS-04 | Produção/calendário do OEE alimentar Gel; centralizar cadastros comuns | PARCIAL | Complementos de gel permanecem no Gel; eliminar dupla digitação sem mudar resultado histórico |
| RAS-05 | Visão global de ações no Portal, com edição no módulo dono | DOCUMENTADO | Planner e referências; nenhuma ação/OS é duplicada só para aparecer no quadro |

**4. Planner comum — pedidos DEC-04/05/06/07; plano mestre § 6**

| ID | Item e motivo | Situação | Dependências / critério de aceite |
|---|---|---|---|
| PLA-01 | Modelo de ações com origens OSM, KAS, OEE e 5S, sem confundir ação e iniciativa | DOCUMENTADO | IDs e relações; uma ação aparece em visões filtradas sem cópias divergentes |
| PLA-02 | Kanban, lista, calendário, por responsável e Minhas ações | DOCUMENTADO | Mesma coleção/filtros; operação acessível por menu/teclado além de arrastar |
| PLA-03 | Histórico de status, responsável, prazo, prioridade e transferências | DOCUMENTADO | Eventos com data/autor; mudanças antigas não são sobrescritas |
| PLA-04 | Prioridade, risco, impacto, prazo, bloqueio/espera e dependências | A DEFINIR | Definir regras por origem; risco de segurança não é reduzido por pontuação financeira; dado confiável vem antes da recomendação |
| PLA-05 | Tempo com responsável atual/acumulado, sem dono, por status, fechamento e atraso | DOCUMENTADO | PLA-03; relógios e populações explícitos, sem atribuir toda a idade ao dono atual |
| PLA-06 | Checklist de tarefas, comentários, evidências e verificação de eficácia | DOCUMENTADO | Concluir tarefa não fecha automaticamente observação oficial nem comprova eficácia |
| PLA-07 | Reabertura, cancelamento, prazo original/atual e calendário de SLA | A DEFINIR | Manter histórico; fixar dias úteis/corridos, esperas e múltiplos ciclos de conclusão |
| PLA-08 | Preservar ações existentes e vincular OS/projetos sem migração automática | DOCUMENTADO | Plano de migração separado se adotado; referências antigas continuam válidas |

**5. OSM oficial importada — pedidos DEC-02/03/04**

| ID | Item e motivo | Situação | Dependências / critério de aceite |
|---|---|---|---|
| OSM-01 | Importar planilha da plataforma oficial, com ID, campos e cobertura originais | DOCUMENTADO | Amostra descaracterizada; uma observação por identidade oficial, sem ID local sequencial como identidade externa |
| OSM-02 | Reimportar sem perder ações, comentários, responsáveis e evidências locais | DOCUMENTADO | OSM-01/PLA-03; alteração oficial atualiza origem e mantém trabalho local |
| OSM-03 | Mostrar situação oficial e tratamento local separadamente, inclusive divergências | DOCUMENTADO | Não fechar/reabrir ações ou apagar ausentes só pela extração oficial |
| OSM-04 | Indicadores de risco/tema, tratamento, fechamento e defasagem da extração | DOCUMENTADO | Cobertura e datas; participação/metas só se aplicáveis e aprovadas, sem bloquear o Planner |

**6. KAS, iniciativas de OEE e 5S — pedidos DEC-05/06/07 e escopo preservado**

| ID | Item e motivo | Situação | Dependências / critério de aceite |
|---|---|---|---|
| KAS-01 | Mini kaizens: problema, proposta, baseline, ações, resultado e sustentação | DOCUMENTADO | PLA-01/06; iniciativa permanece distinta de observação de segurança |
| KAS-02 | Ganho esperado/validado por método, período e responsável | A DEFINIR | Método e validação; não duplicar benefício em Waste/OEE/Projeto |
| OEE-01 | Visão/aba de iniciativas de OEE no Planner | DOCUMENTADO | Amplia a proposta de OSM/KAS/5S; origem e carteira OEE identificáveis |
| OEE-02 | “Abrir ação de OEE” em Produção/Paradas com evidência e contexto | DOCUMENTADO | Encaminhar à página dona; abrir/confirmar um cartão sem escrita cruzada |
| OEE-03 | Priorizar oportunidades por impacto, minutos, quantidade e recorrência | DOCUMENTADO | Eventos confiáveis e deduplicados; mostrar métrica/unidade e não inventar causa raiz |
| OEE-04 | Vincular ação existente, comparar baseline/resultado e verificar eficácia | DOCUMENTADO | Períodos/fontes explícitos; não confundir correlação ou estimativa com ganho validado |
| S5-01 | Auditorias 5S, checklist versionado, evidências, ações e reauditoria | DOCUMENTADO | Padrão de auditoria a definir; preservar esta frente no plano ampliado |

**7. Equipamentos › TAGs MES — pedido DEC-08; plano mestre § 7**

| ID | Item e motivo | Situação | Dependências / critério de aceite |
|---|---|---|---|
| TAG-01 | Cadastro de TAGs por equipamento, propósito, nome MES, tipo e unidade | DOCUMENTADO | Referenciar equipamento do Portal; definir propriedade em Equipamentos sem gravar cadastro alheio |
| TAG-02 | Medição: contador, escala, reset, resolução, qualidade, fuso e fronteira da janela | A DEFINIR | Amostra SQL/sinais; reset não vira produção negativa e falta de comunicação não vira produção |
| TAG-03 | Mapear produção/parada/bloqueada/ociosa, categorias e efeito no OEE | A DEFINIR | Regras oficiais e precedência; não inferir causa raiz nem impacto da linha só pelo estado local |
| TAG-04 | Vigências, revisão, auditoria e reprocessamento técnico por regra | DOCUMENTADO | Resultado histórico identifica regra usada; reprocessar não altera fechamento silenciosamente |

**8. MES, conciliação e cronologia — pedidos DEC-09/10; plano mestre §§ 8–9**

| ID | Item e motivo | Situação | Dependências / critério de aceite |
|---|---|---|---|
| MES-01 | Importador de relatório SQL por arquivo, com eventos ou transições | A DEFINIR | Layout/IDs e TAG-01/02; preservar importador atual de catálogo/lote/caixas |
| MES-02 | Intervalos normalizados, fronteiras, turnos noturnos, eventos abertos e lacunas | DOCUMENTADO | MES-01; original preservado e soma/recortes verificáveis, com sem dados explícito |
| MES-03 | Conciliar MES × manual com relações vários-para-vários e diferenças visíveis | DOCUMENTADO | RAS-02/TAG-03/MES-02; mesmo evento não duplica, divergência não é escolhida silenciosamente |
| MES-04 | Acrescentar eventos MES sem manual, com origem e validação definida | DOCUMENTADO | Critérios operacionais; novo evento rastreável sem sobrescrever manual ou fechamento |
| MES-05 | Cronologia da linha e por máquina, alinhamento, zoom e clique em evidência | DOCUMENTADO | Estados e conciliação; produzir lista/tabela equivalente e mostrar incerteza temporal |
| MES-06 | Tempo total de produção, estados, minutos-máquina e impacto efetivo da linha | A DEFINIR | Fórmulas/denominadores; sobreposições não inflam tempo de linha e sem dados não é zero |
| MES-07 | Reimportações/correções tardias/cancelamentos e prevenção de realimentação | DOCUMENTADO | IDs/revisões/ARQ-02; reaplicação não duplica e mantém histórico de decisões |
| MES-08 | Critérios de conciliação automática e proteção de dias fechados | A DEFINIR | Amostras e política; automatizar somente correspondência dentro de regra aprovada |

**9. Equipamentos › TPM/AM — pedido DEC-11; plano mestre § 10**

| ID | Item e motivo | Situação | Dependências / critério de aceite |
|---|---|---|---|
| TPM-01 | Estrutura por equipamento para TPM e manutenção autônoma AM | DOCUMENTADO | Delimitar AM, PM e intervenções especializadas conforme padrão local |
| TPM-02 | Biblioteca de checklists/padrões versionados, plano e execução | DOCUMENTADO | Conteúdo/periodicidade a fornecer; execução guarda a revisão aplicada |
| TPM-03 | CILT por equipamento/componente, etapas e evidências | A DEFINIR | Significado e procedimento local; não inventar tarefas, frequências ou habilitações |
| TPM-04 | Center Line: ponto, alvo, unidade, faixa, condição e leitura | A DEFINIR | Padrões técnicos aprovados; faixa e revisão preservadas em execução antiga |
| TPM-05 | Lubrificação: pontos, produto, método, quantidade, frequência e desvios | A DEFINIR | Informações técnicas a fornecer; planejamento/registro e anomalia vinculáveis |
| TPM-06 | Anomalias/etiquetas → responsável, OS/ação e fechamento | DOCUMENTADO | Modelo de anomalia e PLA/OS; checklist, OS e melhoria se relacionam sem virar cópias |
| TPM-07 | Indicadores de cumprimento, atrasos, reincidência e tratamento | DOCUMENTADO | Planos/execuções; não considerar “não aplicável” como execução conforme sem critério |

**10. Interface, relatórios e manutenção do código — propostas do diagnóstico**

| ID | Item e motivo | Situação | Dependências / critério de aceite |
|---|---|---|---|
| UX-01 | Jornadas por perfil; resumo/detalhe e preferência de foco | PARCIAL | Aba inicial já existe; Mais só reúne funções permitidas; Detalhado não aumenta permissão; não tratar isso como autenticação |
| UX-02 | Reduzir repetição no Waste e padronizar posição de filtros/ação principal | PARCIAL | Ajuste visual sem mudar regra de cálculo; manter gravação pendente visível |
| UX-03 | Navegação contextual, teclado, toque e alternativa de lista a quadros/gráficos | PARCIAL | Links e rotas; uso em celular/PC sem perder contexto |
| REL-01 | Dossiê da ordem e relatório de cronologia com origem/cobertura | DOCUMENTADO | RAS/MES; tela/PDF/Excel com critérios iguais |
| REL-02 | Relatórios por responsável, OSM/KAS/OEE/5S, tempo, carga e eficácia | DOCUMENTADO | PLA-03/05 e regras de tempo; resumo e detalhamento verificáveis |
| REL-03 | Relatórios próprios de Paradas e execução TPM/AM | DOCUMENTADO | Eventos/planos validados e critérios de indicadores explícitos |
| REF-01 | Separar persistência/importação/contratos e utilitários realmente equivalentes; refinar funções extensas | PARCIAL | Preservar comportamento, IDs e HTML autônomo; hash de função homônima não prova defeito ou equivalência |
| REF-02 | Dependências/checks e parser FY27 duplicado, preservando modo legado | PARCIAL | Interface já redireciona ao Portal quando há metas centrais; remoção local só após decisão e validação do legado |
| REF-03 | Modelo de relatório e adaptadores comuns, migração gradual das saídas | DOCUMENTADO | Preservar conteúdo/tema/quebras; resumo executivo exige seleção própria; não bloquear Planner/reunião pela fusão completa |
| REF-04 | Avaliar fontes/geração do Gel quando a manutenção justificar | DOCUMENTADO | Opcional P3; preservar HTML autônomo e comportamento; não impor build por substituições como única alternativa |
| PROJ-01 | Projetos: portfólio, cronograma, vínculos e benefícios validados | DOCUMENTADO | Separar projeto de tarefa pequena; prevenir contagem dupla de ganhos |

**10.1. Complementos incorporados do outro diagnóstico e delimitações**

| ID | Item e motivo | Situação | Dependências / critério de aceite |
|---|---|---|---|
| FIL-01 | P2 — Publicar responsabilidade individual/equipe das pendências e ações | DOCUMENTADO | ID, responsável/equipe, prazo/status, origem/contexto/link; não atribuir tudo que é urgente ao usuário atual |
| FIL-02 | P2 — Minha fila, Minha equipe e Sem responsável no Portal | DOCUMENTADO | FIL-01 e RAS-05; itens filtram corretamente, abrem origem e não duplicam ações/OS |
| REU-01 | P2 — Reunião diária por dia/turno no Portal | DOCUMENTADO | Fontes/cobertura; OEE diário, estoque e custo mensal com seus períodos reais, sem “waste de ontem” inventado |
| REU-02 | P2 — Pauta apresentada, decisões, responsáveis e ações vinculadas | DOCUMENTADO | REU-01/PLA; fotografia com revisões e pendências, sem copiar ações para outra base |
| TUR-01 | P2 — Evoluir passagem de turno existente com continuidade/ciência e encaminhamento | PARCIAL | Já há `ps.note` e relatório; pendência para próxima equipe é rastreável sem criar relatório duplicado |
| RIT-01 | P2 — Projeção/alerta de ritmo por turno no hora a hora | DOCUMENTADO | Ritmo mensal já existe; projeção do turno considera tempo útil, pausas, catálogo e cobertura; hipótese fica visível |
| MEM-01 | P3 — Ciclo de URLs de backup/imagens Paradas e documentos Portal | PARCIAL | Downloads comuns da Produção/Portal já revogam; corrigir pontos reais sem interromper abertura em outra aba |
| BKP-01 | P2/P3 — Mostrar última falha/último backup diário confirmado do Portal | DOCUMENTADO; DECISÃO REGISTRADA PENDENTE | Não interromper gravação normal nem acusar falha antes de tentativa necessária; distinguir F03 de rotina diária |
| AUD-01 | P3 — Tornar critérios do script diagnóstico verificáveis e escopo explícito | PARCIAL | §4 não confirma incondicionalmente; separar inspeção/execução/UX, medir largura e console se alegados; não usar “10/11” como dez bugs |

**11. Fora do escopo atual e propostas substituídas**

| ID | Item | Situação | Registro da decisão |
|---|---|---|---|
| LIM-01 | API de negócio, servidor interno, conexão direta do navegador ao SQL | FORA DO ESCOPO ATUAL | DEC-01: arquivos exportados são a integração possível; nenhuma entrega depende dessas alternativas |
| LIM-02 | Formulário local de abertura de OSM como fluxo principal e validação oficial local | FORA DO ESCOPO ATUAL | DEC-03: importar observações da plataforma oficial e acompanhar ações locais |
| LIM-03 | Execução garantida de monitoramento com navegador/PC fechado | FORA DO ESCOPO ATUAL | HTML aberto pode buscar por intervalo; extração externa é etapa separada e disponibilidade precisa ficar explícita |
| LIM-04 | Alterar código, bases, versões, geradores ou documentos existentes nesta revisão | FORA DO ESCOPO ATUAL | DEC-12: apenas verificar e criar este pacote de documentação |

**12. Próxima revisão sugerida**

Confrontar F01–F13 e o parecer B1–B10/C1–C5 com as evidências; validar ARQ/IMP; depois fechar o recorte OSM-01/02 e PLA-01/02/03, incluindo OEE-01/02. Minha fila e Reunião diária podem evoluir com contratos suficientes, sem aguardar fusão global de relatórios. Na fase apropriada, obter amostras TAG/MES e padrões de TPM. Os recortes de PRs, riscos e validações estão na seção 11 do parecer comparativo.

Nenhum item foi marcado como implementado nesta consolidação. A criação desta lista garante o registro de CILT, Center Line, lubrificação, AM/TPM, OEE e importações futuras, mas sua entrega dependerá de trabalho e autorização posteriores.

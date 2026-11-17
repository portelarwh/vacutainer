# Pendências atuais · Vacutainer

Atualizado em 17/11/2026. Só itens em aberto: o que está pronto e conferido sai daqui (histórico no Git e em docs/CONTRATO-MOTORES.md). Este arquivo é a fonte única do **estado** das entregas. O [plano](docs/PLANO-DE-MELHORIAS.md) define a ordem e os critérios de aceite, usando os mesmos IDs. Item recusado no [histórico](docs/DECISOES-HISTORICAS.md) só volta com fato novo.

## Como ler

- **Pronto:** implementado e conferido com dados fictícios; não significa implantado ou homologado na linha.
- **Parcial:** existe implementação, com uma parte ainda identificada abaixo.
- **A fazer:** trabalho definido que pode ser preparado sem inventar regras.
- **Pendente de teste:** depende de validação no ambiente indicado.
- **Aguardando material/decisão:** depende do responsável antes de implementar a parte técnica.

## Correções e próximos passos

| ID | Prioridade | Estado | Entrega / o que falta | Responsável |
|---|---|---|---|---|
| ADM-01 | P1 | Pronto, aguardando conferência | Plataforma 1.8.5: a Administração diz por que não conectou (permissão, leitura ou falta de `00. Bases/portal-base.json`), oferece "Conectar agora" e a casca mostra "Tentar conexão novamente". Falta: restaurar `portal-base.json` do backup em `00. Bases` e conferir na pasta real. | Responsável |
| EQP-02 | P2 | Pronto, aguardando conferência | Plataforma 1.8.5: botão Editar nas listas de cadastro, motivo do bloqueio, campos Código MES, Departamento e Work Center e Importar › Equipamentos (MES). Falta: importar a planilha real e conferir as ligações (Cap Placer, Metro, elevadores e a LINHA). | Responsável |
| H01 | P1 | Pendente de teste | Abrir o HTML por file:// em Chrome/Edge corporativos, sem internet, com acentos e permissões reais. | Responsável e equipe da linha |
| H02 | P1 | Pendente de teste | Duas estações e duas abas: gravar/reler, filas, conflito, queda de rede/permissão, logs de backup e relógios sincronizados. Somente cópias de bases previamente autorizadas. OPFS não conclui esse aceite. | Responsável e equipe da linha |
| IMP-01 | P1 | Parcial | A conferência existente está acessível em Importações › Importação por página (1.3.0). Falta consolidar cobertura, rejeições e fontes obrigatórias por período para distinguir completo, parcial ou não aplicável. Waste conserva competência mensal. | Desenvolvimento |
| TL-01 | P1 | Pronto, aguardando aceite | Timeline Operacional (Produção 2.5.0): aba Linha do tempo com estado da linha e de cada máquina, três origens, prioridade, KPIs, tooltip, detalhes, mapa de tags e importação de tags. CA-01 a CA-20 verificados em testes/ttimeline.js. | Responsável funcional: aceite com dados reais (CA-20) |
| TL-02 | P2 | Pendente de decisão | Timeline: tag de máquina não muda o estado da linha; intervalo sem caixas do MES fica abaixo do operador não validado. Confirmar as duas regras. | Responsável funcional |
| TL-03 | P2 | Pendente | Timeline: filtros Ordem e Lote; produção, meta e aderência no topo da aba; conexão direta com MES e tags (hoje, importação de arquivo); prazo de retenção dos eventos de tag (100 mil eventos ≈ 10 MB na base). | Responsável e TI |
| UX-20 | P3 | Pronto; favicon depende do arquivo | Plataforma 1.7.2: favicon lido de `Marca/favicon.svg` (o responsável inclui o arquivo na pasta Marca da rede; confirmar em file:// no Chrome/Edge corporativo) e ⚠ visíveis trocados pelo ícone de alerta da biblioteca (Produção e Gel). | Responsável: incluir Marca/favicon.svg |
| TOT-01 | P2 | Pronto, aguardando validação | Produção 2.6.0 (plataforma 1.8.0): Produção total do turno no Lançar meu turno e no Hora a hora (sem hora a hora; períodos na troca de catálogo, com média por hora); servidor não aplica produção em turno pelo total sem a troca e avisa; prévia da importação avisa produção já apontada, inclusive dia fechado. Falta: uso real por um turno e conferência pela liderança. | Responsável funcional |
| MAIL-02 | P2 | Pronto, aguardando conferência | Plataforma 1.8.1: o Outlook novo descartava o branco do título sobre o fundo azul-escuro. Cabeçalho do e-mail passou a ser claro com texto azul-marinho, legível sem a cor do texto ou sem o fundo. Falta: conferir colando no Outlook corporativo. | Responsável |
| SEM-01 | P2 | Pronto, aguardando conferência | Plataforma 1.8.2: indicadores com meta em verde/amarelo/vermelho conforme o semáforo (Produção, Visão da linha, Waste). SQDCP, Gel e D/P/Q fora por decisão. Falta: conferir nas telas com dados reais. | Responsável |
| LANC-01 | P2 | Pronto, aguardando conferência | Plataforma 1.8.3: card Scrap (total), OEE do dia no Editar cards, turnos em resumo lado a lado (clicar abre o detalhe), semáforo no cartão do turno e aba Painel repetida removida. Falta: conferir no uso do dia a dia. | Responsável |
| OP-01 | P2 | Parcial | Escala visual e campos padronizados nos módulos. O fluxo existente de lançamento/fechamento foi preservado; validar a jornada com operadores antes de redesenhar etapas. | Desenvolvimento e operação |
| UI-01 / CTX-01 | P2 | Parcial | Tipografia/navegação nos nove módulos e consultas da visão executiva padronizadas. Atalhos para dia, equipamento e ação preservam o contexto existente. Restam os recortes específicos de gráficos, tabelas e fichas de cada jornada. | Desenvolvimento |
| PLN-01 / EQP-01 | P2 | Parcial | Legibilidade e espaçamento de cards/listas melhorados; estados e cores existentes preservados. Restam recortes específicos do acompanhamento e da ficha/OS. Conteúdo técnico TPM/MES aguarda E12/E13. | Desenvolvimento |
| PLN-02 | P2 | A fazer | Refinar a apresentação dos indicadores de tempo, responsável, atraso e fechamento já calculados pelo Planner, conforme o plano. | Desenvolvimento |
| REL-01 / REL-02 | P2 | Parcial | Resumo executivo passa a imprimir os mesmos indicadores e reportes do recorte. Relatórios específicos, SQDCP e Outlook já existem; falta revisão individual e homologação dos formatos. | Desenvolvimento e usuários dos relatórios |


## Material e decisões do responsável

| ID | Estado | O que precisa ser definido / fornecido | Responsável |
|---|---|---|---|
| E7 | Aguardando material | Amostra da planilha oficial de OSM. Reutilizar ações e Planner existentes. | Responsável pela extração |
| E9 | Aguardando decisão | Estação coletora e rotina de leitura dos relatórios por pasta. Navegador aberto e permissão necessários; não há API/servidor interno. A deduplicação e o registro de falhas devem fazer parte do desenho. | Responsável e operação |
| E10c | Aguardando validação | Jornadas de operador, liderança, PCP, qualidade e manutenção; conteúdo de Resumo/Detalhado. Alterar apresentação não muda permissões. | Liderança e usuários |
| E12 | Aguardando material/decisão | Amostras SQL/MES e regras de conciliação com apontamentos manuais, início/fim e cronologia por equipamento. | Responsável pelo MES e operação |
| E13 | Aguardando material | Padrões AM/TPM, CILT, center line, lubrificação e 5S, por equipamento/checklist. | Manutenção e operação |
| E15 | Aguardando escopo | Projetos de melhoria, investimento e compra de máquina. Área permanece em construção. | Responsável |
| REG-01 | Aguardando decisão | Regra vigente de microparadas: o histórico menciona 5 e 10 minutos. Conferir parâmetro/decisão vigente; preservar o motor atual até aprovação. | Responsável pela regra |

## Demais homologações

| ID | Estado | Conferência necessária | Responsável |
|---|---|---|---|
| H03 | Pendente de teste | Área dos usuários, bases da pasta, ação a partir de Paradas, configuração/corte do gel, scrap no turno e Resumo do dia. | Liderança e operação |
| H04 | Pendente de teste | Primeira conexão/CadSync, fechar/reabrir turno e dia, turno não produtivo habilitado pontualmente e produção fora de turno. | Operação e PCP |
| H05 | Pendente de teste | Impressora, PDF, SQDCP A4 paisagem e imagens no Outlook desktop/web. | Usuários dos relatórios |
| MAR-01 | Aguardando material/validação | Fontes/licenças e logos oficiais; conferir Maxwell. O suporte opcional já existe. Não publicar arquivos comerciais. | Responsável pela marca |

## Manutenção condicionada a evidência

- **PERF-01 — A fazer quando medido:** índice de comentários/ações do Waste se o painel ultrapassar 300 ms ou 2 mil comentários. Fixar referência antes de refatorar funções grandes ou o parser Meta FY27 duplicado.
- **GEL-01 — Parcial:** locais de estoque continuam no Gel. Scrap “Dia (sem turno)” não tem equivalente na Produção; não converter automaticamente.
- **REL-03 — A avaliar:** unificar geradores somente com prova de equivalência de números, filtros e conteúdo. Não é pré-requisito para melhorar a aparência dos relatórios existentes.

## Aceite e limites

Uma entrega só muda para Pronto depois de registrar testes, versão e limitações na PR. Mudar cálculo, critério operacional ou estrutura de base exige autorização explícita, mesmo que o item conste do plano. Cópias de dados reais também precisam de autorização antes de qualquer homologação. A limpeza do repositório não executou o [corte](docs/CORTE.md).

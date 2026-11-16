# Pendências atuais · Vacutainer

Atualizado em 16/11/2026. Este arquivo é a fonte única do **estado** das entregas. O [plano](docs/PLANO-DE-MELHORIAS.md) define a ordem e os critérios de aceite, usando os mesmos IDs. Item recusado no [histórico](docs/DECISOES-HISTORICAS.md) só volta com fato novo.

## Como ler

- **Pronto:** implementado e conferido com dados fictícios; não significa implantado ou homologado na linha.
- **Parcial:** existe implementação, com uma parte ainda identificada abaixo.
- **A fazer:** trabalho definido que pode ser preparado sem inventar regras.
- **Pendente de teste:** depende de validação no ambiente indicado.
- **Aguardando material/decisão:** depende do responsável antes de implementar a parte técnica.

## Correções e próximos passos

| ID | Prioridade | Estado | Entrega / o que falta | Responsável |
|---|---|---|---|---|
| R02-A | P1 | Pronto | Homônimos sem ID não são associados automaticamente a Minhas/Minha equipe. Registro antigo com nome único no cadastro continua resolvendo o ID; nome ambíguo fica em Sem responsável com Confirmar responsável. Opções do cadastro usam o ID. | Codex, nesta entrega |
| BKP-01 | P1 | Pronto | Log separado por estação, leitura consolidada e compatibilidade com registro-backup.log antigo. Abas do mesmo perfil serializam escritas; sem Web Locks, logs por instância. Falha sem pasta fica marcada como só local. Empate de horários não comprova recuperação. | Codex, nesta entrega |
| H01 | P1 | Pendente de teste | Abrir o HTML por file:// em Chrome/Edge corporativos, sem internet, com acentos e permissões reais. | Responsável e equipe da linha |
| H02 | P1 | Pendente de teste | Duas estações e duas abas: gravar/reler, filas, conflito, queda de rede/permissão, logs de backup e relógios sincronizados. Somente cópias de bases previamente autorizadas. OPFS não conclui esse aceite. | Responsável e equipe da linha |
| IMP-01 | P1 | Parcial | A conferência existente está acessível em Importações › Importação por página (1.3.0). Falta consolidar cobertura, rejeições e fontes obrigatórias por período para distinguir completo, parcial ou não aplicável. Waste conserva competência mensal. | Desenvolvimento |
| R02-B | P2 | Pronto | Técnico de Paradas, autor/editor/exclusão e histórico de comentários do Waste, pessoas por turno dos postos e conclusão de checklist da Linha 360° guardam ID junto do nome. Formulários, quadros, exports e relatório mostram o nome atual onde aplicável. Homônimos mantêm o ID ao editar outro campo; legado ambíguo não é associado em lote. Conferência fictícia e OPFS; sem migração de bases reais. | Codex, plataforma 1.4.0 |
| NAV-01 | P2 | Pronto | Plataforma 1.3.0: Visão da linha com as abas Resultado da linha, Situação da linha, Pendências e ações e Reunião diária; Relatórios e Importações com a tela do Portal como 2ª aba; Administração só com cadastros e configuração. Links antigos (`#/portal?rota=#fila` etc.) levam ao lugar novo. Aviso de login sem "Portal". | Claude, nesta entrega |
| TXT-01 | P3 | Pronto | Textos de orientação apontam para Administração, Importações ou Visão da linha conforme o destino. IDs, caminhos históricos, nomes personalizados e valores armazenados de página inicial permanecem compatíveis; o valor Portal recebe rótulo Visão da linha no cadastro. | Codex, plataforma 1.4.0 |
| A11Y-01 | P2 | Pronto | Contraste dos nove grupos apontados e das falhas adicionais encontradas nas outras abas, campos e opacidades; paleta original mantida. Teste de 87 recortes por tema inclui nove módulos, Status, busca e menu TV com foco/hover. SVG/canvas, fundos com imagens/gradientes e impressão não são certificação WCAG. | Codex, plataforma 1.4.0 |
| NAV-02 | P2 | Pronto | Ctrl K começa no campo e devolve o foco ao fechar. Comando Voltar curto com explicação no título; menus TV e Mais agrupados, com teclado, Escape e clique fora. Os seis textos pequenos da casca têm pelo menos 12 px; Guia e Sair da demonstração têm alvo de 40 px. | Codex, plataforma 1.4.0 |
| STS-01 | P2 | Pronto | Botão Status no cabeçalho, fora das abas: versão, base, revisão, conexão, fila e registros de backup; consulta sem escrita. Metadados e situação da página recolhidos. Erro, somente leitura, alertas críticos e alterações pendentes continuam sinalizados na tela. | Codex, plataforma 1.4.0 |
| MAIL-01 | P2 | Pronto | Cabeçalho de Copiar para Outlook usa branco explícito em todos os textos, sem depender de herança da célula. Clipboard HTML/texto e editor com estilo próprio conferidos nos nove módulos, com dados fictícios. Validar no Outlook real em H05. Estrutura de pasta operacional registrada em docs/MARCA.md. | Codex, plataforma 1.4.1 |
| VG-01 | P2 | Pronto | Visão executiva 1.2.0: quatro indicadores, metas/desvios publicados, segurança/QN, dia/turno, tempos por equipamento, ações, Resumo/Detalhado e resumo impresso. Conferida com dados fictícios. | Codex, nesta entrega |
| OP-01 | P2 | Parcial | Escala visual e campos padronizados nos módulos. O fluxo existente de lançamento/fechamento foi preservado; validar a jornada com operadores antes de redesenhar etapas. | Desenvolvimento e operação |
| UI-01 / CTX-01 | P2 | Parcial | Tipografia/navegação nos nove módulos e consultas da visão executiva padronizadas. Atalhos para dia, equipamento e ação preservam o contexto existente. Restam os recortes específicos de gráficos, tabelas e fichas de cada jornada. | Desenvolvimento |
| PLN-01 / EQP-01 | P2 | Parcial | Legibilidade e espaçamento de cards/listas melhorados; estados e cores existentes preservados. Restam recortes específicos do acompanhamento e da ficha/OS. Conteúdo técnico TPM/MES aguarda E12/E13. | Desenvolvimento |
| PLN-02 | P2 | A fazer | Refinar a apresentação dos indicadores de tempo, responsável, atraso e fechamento já calculados pelo Planner, conforme o plano. | Desenvolvimento |
| REL-01 / REL-02 | P2 | Parcial | Resumo executivo passa a imprimir os mesmos indicadores e reportes do recorte. Relatórios específicos, SQDCP e Outlook já existem; falta revisão individual e homologação dos formatos. | Desenvolvimento e usuários dos relatórios |

BKP-01 registra eventos em `00. Backups/<módulo>/registro-backup-<id>.log`, com até 50 linhas por arquivo. O ID identifica o perfil do navegador nesta pasta, não autentica um computador. Os logs são dados auxiliares; as bases JSON e seus formatos não mudam. Sem pasta acessível, o aviso fica só neste navegador; não há reenvio automático desse evento. Uma nova tentativa de backup gera outro registro. O registro antigo é apenas lido, nunca sobrescrito pela nova versão.

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

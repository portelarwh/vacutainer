# Pendências atuais · Vacutainer

Atualizado após a consolidação do aplicativo em 15/11/2026. Esta é a lista ativa; entregas antigas e instruções de distribuir HTMLs separados foram retiradas. O histórico continua recuperável no Git e no [registro de decisões](docs/DECISOES-HISTORICAS.md).

## Material e decisões do responsável

- E7: amostra da planilha oficial de OSM para definir o importador; ações e Planner já existentes devem ser reutilizados.
- E9: definir a estação que coleta os relatórios da pasta e a rotina de atualização. Não há API ou servidor interno; automatização deve respeitar permissões e navegador aberto.
- E10c: validar jornadas de operador, liderança, PCP, qualidade e manutenção; definir Resumo/Detalhado por uso, sem mudar permissões implicitamente.
- E12: amostras de SQL/MES e critérios de conciliação com apontamentos manuais, início/fim e cronologia por equipamento.
- E13: padrões técnicos AM/TPM, CILT, center line, lubrificação e 5S, por equipamento e checklist. Não inventar conteúdo técnico.
- E15: escopo de Projetos. A área incorporada continua identificada como em construção.
- R-02: decidir tratamento de responsáveis digitados por nome versus identificador estável.
- Confirmar regra vigente de microparadas (documentos históricos divergem entre 5 e 10 minutos); preservar o parâmetro/motor atual até decisão.

## Homologação na linha

- Chrome e Edge corporativos por file://, sem internet; caminhos com acentos e permissões da pasta.
- SMB, perda de conexão/permissão, duas estações e duas abas; filas, recuperação e conflitos. Testes em OPFS não concluem essa homologação.
- Cadastro de área dos usuários, bases da pasta, ação originada de Paradas, configurações do gel, data de corte, scrap no turno e Resumo do dia.
- Primeira conexão/CadSync, fechamento/reabertura de turno e dia, habilitação pontual do turno não produtivo e atribuição de produção fora do turno.
- Impressora da linha, PDF, A4 do SQDCP e gráficos colados no Outlook desktop/web.
- Fontes/licenças corporativas, logotipos oficiais e conferência das diretrizes atuais no Maxwell. Não publicar arquivos comerciais no repositório público.

## Melhorias já identificadas

- [Plano de UX](docs/PLANO-DE-MELHORIAS.md): Visão da linha, operador, filtros/tabelas/gráficos, ficha contextual, Planner e relatórios.
- Revisão individual dos gráficos, formulários e e-mails dos motores; a camada BD não equivale a revisão completa dessas telas.
- Registrar a última falha de backup diário do Portal: comportamento e aviso ainda precisam de decisão; não esconder falha de gravação.
- Índice de comentários/ações do Waste quando o painel ultrapassar 300 ms ou 2 mil comentários; funções grandes e parser Meta FY27 duplicado precisam de referência de comportamento antes de refatorar.
- Locais de estoque continuam no Gel. Scrap "Dia (sem turno)" do Gel não tem equivalente na Produção; não converter automaticamente.
- Unificar geradores de relatório somente com prova de números, filtros e conteúdo equivalente.

## Limites da consolidação

Retirar arquivos antigos do GitHub não executa corte na pasta da linha, não migra bases e não resolve as decisões acima. Seguir [CORTE](docs/CORTE.md). Novas ideias devem entrar nesta lista ou no plano com motivo, dependência e critério de aceite.

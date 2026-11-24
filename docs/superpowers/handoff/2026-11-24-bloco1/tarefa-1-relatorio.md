# Task 1 · relatório

Status: DONE_WITH_CONCERNS. Commit 2eca8d5 (scripts/inventario-paginas-antigas.mjs, docs/CONFIGURACOES.md). Plataforma.html não foi tocada.

## O que foi feito
- Script extrai 10 arquivos (9 páginas de a2214fd^ + Gel-2026-11-13.html de 2161e02); falha se o repositório é raso. Rodado: 10 arquivos, 445 kB a 1872 kB.
- docs/CONFIGURACOES.md: legenda, 9 achados principais, uma seção por assunto (8), resumo de cópias por página, tabela de cobertura das nove páginas, 14 decisões.

## Verificação da cobertura
Comparei tela a tela (extraindo as seções de configuração do HTML antigo e do bloco atual):
Produção (CFG_SECS, F_LINE/F_MAC/F_FAM/F_CAT/F_TGT/F_DC, Parâmetros, Abonos), Gel 13/11 e 15/11 (15 seções de CFG_SECS, fmtCfgHtml, equipCfgHtml, motCfgHtml, shiftCfgHtml, abonoCfgHtml, locCfgHtml), Waste (renderConfig e ids cfg*/th*), Paradas (VIEWS.config, config:{...}), Equipamentos (viewConfig, TAGs, padrões), Iniciativas (constantes, programas), Linha 360 (vazio(), PONTOS/AREAS/POSTOS_PADRAO), Projetos (sem configuração), Portal (CAD_T antigo × atual, cadSide, parâmetros). Contra: CAD_T, parametros.*, settings.* (DEFAULT_SETTINGS + grep de `settings.`), S.config.* (grep de todas as chaves) e CadSync.

## Linhas por assunto (tabelas)
Planta e linha 12 · Produto 19 · Gel 44 · Equipamentos 19 · Turnos e metas 25 · Paradas e perdas 26 · Pessoas e acesso 9 · Sistema 23. Total 177 linhas.

## Perdido ou resumido (destaques)
1. Gel Tubo 100: 0,834 g é o padrão do código tanto na antiga quanto hoje. 0,936 não existe em padrão nenhum (só em texto de ajuda "meta 0,940, dosagem 0,936"); é dado gravado na base do responsável. Hoje sem vigência no Portal o Gel usa 0,834 sem avisar.
2. Composições calculadas (completo, tubo+gel, spray, gel puro, barril) sumiram como tela; só tabela de componentes.
3. Calculadora de perda do processo (scrap no período, tubos bons, divisão) perdida.
4. Sem editor hoje, mas ainda lidos: ritmo do Gel (pcpParams: 900 000, 1 200 000, 10 dias, 72 000 tubos/h), scrapBase, abDefault do Gel, ordem dos equipamentos no Registrar scrap, horaExtraMax, planWorkdays.
5. Código de parada: vigência e descrição existiam na Produção antiga, não no Portal.
6. Linha: descrição e fuso por linha; calendário aplicável.
7. Duplicados: catálogo (formato texto × gel.fmt; lotSize × caixas×tubos; rateH × pphNominal; BOM de gel em gel.vig e em bom), semáforo (3), parada longa (3), logo (4+), apelidos de equipamento (3), vacCad() em 9 blocos.

## Decisões deixadas (seção final do doc)
14 itens: Linha 360 (definição × desenho), regras do estoque do Gel, ritmo do Gel, preços/câmbio, tags, TPM, vigência dos códigos de parada, vocabulários, padrões embutidos, valor 0,936, calendário, preços locais do Gel, permissão por assunto, logo.

## Concerns
- Não pude ver as telas do responsável; "0,936 é dado da base" é inferência (nenhuma ocorrência em código, cenário ou histórico além do exemplo de texto).
- Nomes de campo v2 e a lista de chaves de preferência por página (S.config.tv*, ld*) foram agrupados; um construtor deve reconferir com grep antes de remover.
- A contagem de linhas é menor que 150-400 só se contada por assunto; agrupei campos triviais (ex. 4 composições ficaram uma a uma; cores numa linha).

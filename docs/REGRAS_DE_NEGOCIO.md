# REGRAS DE NEGÓCIO — VACUTAINER

## 1. Objetivo
Preservar a integridade dos cálculos, indicadores e regras operacionais do sistema Vacutainer.

Este documento estabelece diretrizes de proteção e validação. As fórmulas efetivamente implementadas devem ser identificadas por auditoria do código.

## 2. Regra fundamental
Nenhuma alteração visual, de layout, dashboard, gráfico, filtro ou navegação pode modificar os resultados dos cálculos existentes sem autorização explícita.

## 3. Indicadores protegidos
- OEE
- Disponibilidade
- Performance
- Qualidade
- Eficiência produtiva
- Produção hora a hora
- Produção por turno
- Produção por ordem e lote
- Scrap
- Waste
- Paradas e duração
- Tempos de troca de lote e catálogo
- Outros indicadores identificados no código

## 4. Rastreabilidade
Toda informação operacional deve manter seus relacionamentos com ordem, lote, catálogo, equipamento, data e turno, quando aplicável.

Não presumir unicidade global de identificadores sem validação.

## 5. Origem dos dados
Distinguir:
- Apontamentos manuais.
- Dados importados do servidor.
- Dados conciliados.
- Dados calculados.
- Estimativas e projeções.

Não sobrescrever registros sem regras aprovadas.

## 6. Cálculos e fórmulas
Antes de alterar qualquer cálculo:
1. Localizar a função responsável.
2. Identificar entradas e dependências.
3. Documentar a fórmula atual.
4. Identificar todas as páginas consumidoras.
5. Demonstrar o motivo da mudança.
6. Apresentar exemplos antes e depois.
7. Solicitar autorização explícita.
8. Executar testes de regressão.

## 7. Consistência entre páginas
Indicadores equivalentes devem utilizar as mesmas definições, unidades, critérios de período e regras de agregação.

Não duplicar fórmulas em diferentes páginas quando existir implementação compartilhada adequada.

## 8. OEE
Preservar as fórmulas e critérios existentes até que sejam auditados e aprovados.

Verificar separadamente disponibilidade, performance e qualidade, suas bases de tempo e regras de agregação.

Não calcular médias simples de percentuais quando a consolidação exigir ponderação ou recálculo a partir dos componentes.

## 9. Produção hora a hora
Preservar os registros originais e seus horários.

Investigar corretamente viradas de turno, mudança de dia, registros duplicados e intervalos sem produção.

## 10. Paradas
Diferenciar duração observada, parada registrada, parada planejada e tempo de setup conforme as regras efetivamente aprovadas.

Não presumir causas a partir de intervalos de produção.

## 11. Perdas
Preservar a distinção entre scrap, waste e demais categorias existentes.

Não somar categorias que possam representar o mesmo evento sem verificar duplicidade.

## 12. Relatórios
PDF, imagem, Outlook e dashboards devem apresentar valores consistentes para os mesmos filtros e fontes de dados.

## 13. Testes obrigatórios
Toda alteração que afete dados ou indicadores deve ser validada com:
- Cenários conhecidos.
- Comparação antes e depois.
- Casos de múltiplos turnos.
- Casos de múltiplas ordens e lotes.
- Dados incompletos ou duplicados.
- Verificação de regressões.

## 14. Documentação de fórmulas
O agente deverá identificar e documentar posteriormente:
- Nome do indicador.
- Fórmula efetivamente implementada.
- Arquivo e função.
- Entradas.
- Unidades.
- Regras de arredondamento.
- Critérios de agregação.
- Páginas consumidoras.
- Casos de teste.

Não inventar fórmulas nem apresentar hipóteses como regras aprovadas.

## 15. Autorização
Mudanças estruturais ou matemáticas dependem de aprovação explícita.

Correções exclusivamente visuais devem preservar integralmente os motores de cálculo e os dados.

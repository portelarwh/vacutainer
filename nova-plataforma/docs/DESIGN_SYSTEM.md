# DESIGN SYSTEM — VACUTAINER

## 1. Objetivo
Garantir uma experiência moderna, intuitiva, consistente, responsiva e personalizável em todas as páginas do sistema industrial.

## 2. Princípios obrigatórios
- Priorizar clareza e facilidade de utilização.
- Mostrar primeiro informações essenciais e permitir aprofundamento.
- Evitar dashboards sobrecarregados.
- Reutilizar componentes e padrões aprovados.
- Preservar a identidade visual entre módulos.
- Não alterar cálculos ou regras de negócio para implementar mudanças visuais.
- Separar dados, apresentação e preferências do usuário.

## 3. Estrutura das páginas
Organização preferencial:
1. Cabeçalho com título, contexto e ações principais.
2. Filtros relevantes e sincronizados.
3. Cards com indicadores prioritários.
4. Gráficos de análise e tendências.
5. Tabelas, históricos e detalhes sob demanda.

A disposição deve ser adaptada à finalidade de cada página.

## 4. Cards e indicadores
- Título claro, valor, unidade e período.
- Exibir meta, comparação ou tendência quando aplicável.
- Usar números formatados consistentemente.
- Evitar indicadores duplicados sem justificativa.
- Permitir navegação contextual quando houver dados rastreáveis.

## 5. Gráficos
- Gráficos equivalentes devem compartilhar critérios, escalas, unidades, cores e comportamentos.
- Produção hora a hora deve seguir um padrão único entre módulos.
- Utilizar gráficos de linha para tendências, barras para comparações e Pareto para priorização de perdas e falhas.
- Permitir filtros, tooltips e drill-down quando tecnicamente viável.
- Ao selecionar elementos, apresentar ordens, lotes, equipamentos e ocorrências relacionados.
- Não criar relações inexistentes ou atribuir indicadores agregados a uma única ordem sem evidência.
- Exibir claramente períodos, unidades, fontes e estados dos dados.

## 6. Navegação contextual
- Priorizar painéis laterais para consulta de informações detalhadas.
- Permitir acessar o histórico completo da ordem, lote ou equipamento.
- Preservar filtros e contexto quando aplicável.
- Manter comportamento consistente entre páginas.

## 7. Filtros
- Padronizar filtros de período, turno, ordem, lote, catálogo e equipamento.
- Utilizar critérios consistentes entre módulos.
- Preservar filtros relevantes durante a navegação.
- Permitir limpar e restaurar filtros facilmente.

## 8. Personalização
- Permitir reorganizar cards e gráficos quando implementado.
- Permitir mostrar ou ocultar indicadores.
- Permitir salvar preferências por usuário e/ou perfil.
- Oferecer restauração do layout padrão.
- Personalização não deve alterar dados, cálculos ou permissões.

## 9. Perfis
- Operacional: foco em apontamentos rápidos e informações essenciais.
- Analítico: foco em investigação, comparações e tendências.
- Executivo: foco em KPIs, desvios e prioridades.
- Respeitar as permissões reais implementadas no sistema.

## 10. Relatórios
- Manter consistência entre dashboard, PDF, imagem e conteúdo copiado para Outlook.
- Permitir selecionar conteúdos quando a funcionalidade estiver implementada.
- Padronizar unidades, datas, números e títulos.
- Preservar o contexto dos filtros utilizados.

## 11. Cores e tipografia
Paleta de cores e fontes ainda não aprovadas.
Não estabelecer novos padrões definitivos sem autorização.
Usar cores funcionais para comunicar estados e prioridades.
Não depender exclusivamente da cor para transmitir informação.

## 12. Responsividade e acessibilidade
- Garantir legibilidade em diferentes tamanhos de tela.
- Evitar rolagem horizontal desnecessária.
- Manter contraste adequado e áreas clicáveis acessíveis.
- Apresentar estados de carregamento, erro, ausência de dados e dados desatualizados.

## 13. Componentes reutilizáveis
Antes de criar um componente, investigar se já existe equivalente.
Priorizar componentes compartilhados para cards, gráficos, filtros, tabelas e painéis contextuais.
Não criar novas dependências ou reestruturar o projeto sem avaliação.

## 14. Validação obrigatória
Antes de concluir mudanças visuais:
1. Verificar consistência com este documento.
2. Testar a página modificada.
3. Verificar impactos em componentes compartilhados.
4. Confirmar que cálculos e dados não foram alterados.
5. Verificar responsividade e interações.
6. Registrar padrões novos aprovados.

## 15. Evolução
Este documento é a referência visual do sistema.
Mudanças de padrões devem ser documentadas e aprovadas.
Não substituir padrões existentes arbitrariamente.

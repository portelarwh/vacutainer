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

A preparação visual de 15/11/2026 adota a referência de marca fornecida pelo responsável em [BD_Dashboard_Brand_Guidelines.md](BD_Dashboard_Brand_Guidelines.md). Ela foi adaptada do Template.pptx; não equivale a uma conferência do Maxwell. A norma corporativa vigente prevalece em assuntos de marca.

A fonte técnica única da identidade é o bloco `css/brand` do `Plataforma.html`. Ela é aplicada na casca React, nos nove motores incorporados, no resumo impresso da casca e no guia auxiliar, depois da base visual do kit. Os tokens bd-* preservam a paleta original; os aliases funcionais adaptam tema e contraste. Não criar cópias de paleta por módulo; ajustar o bloco compartilhado no arquivo único.

- Base institucional: navy #060A3D, azul #044ED7; realces #1D74FF; lavanda #9199D8; laranja #FF6E00; neutros do anexo.
- Laranja pontual (aproximadamente 5–10% de área), distinguindo destaque de marca de alerta operacional.
- Verde e vermelho preservam o significado de resultado versus meta, inclusive SQDCP. Não substituir uma regra de cor funcional por uma sequência de séries institucionais.
- Títulos em FS Albert Pro Light; corpo em FS Albert Pro; fallback Arial/Helvetica Neue/sans-serif. Sem CDN. Nenhum arquivo de fonte é redistribuído sem a licença aplicável.
- Logotipo somente com arquivo oficial. O ícone V existente identifica a aplicação; não é uma reprodução do logotipo BD.
- Tema escuro: adaptação técnica acessível dos aliases, mantendo os valores institucionais originais. Conferência corporativa do tema segue pendente.

### Contraste e exceções ao anexo

Texto normal precisa de 4,5:1; texto grande e indicadores gráficos essenciais, 3:1. Sempre combinar cor e texto/forma. Não usar cinza quente como texto principal.

A recomendação do anexo de charcoal sobre laranja/lavanda não atinge 4,5:1 em texto normal (3,81:1 e 3,95:1). Usar navy nesses fundos (6,69:1 e 6,93:1). Laranja sobre branco tem 2,81:1; azul vivo sobre branco, 4,20:1. Portanto, ambos não são cores de texto normal nesses fundos. O alias warn usa um tom escuro para texto; warn-fill preserva o laranja institucional. A ordem de séries do anexo não dispensa contraste, rótulos e significado operacional.

### Escala e suporte

Grid de 8 px, margens de 24–32 px no desktop e 16 px no celular, espaços de 16–24 px e raios de 8–12 px. Na casca, títulos de página 30–36 px, números principais 32–44 px, corpo/controles 14 px e notas 12 px. Controles com pelo menos 40 px e foco visível de 2 px ou mais.

Tabelas extensas podem ter rolagem própria; não comprimir a página inteira para evitar isso. Impressão tem escala própria. O SQDCP continua uma A4 paisagem e os formulários que exigem retrato preservam essa orientação. Layout nunca modifica número, unidade, fonte do dado, período ou regra de agregação.

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


## 16. Estado da adoção
A fundação de marca e a casca são tratadas nesta rodada. Os motores reutilizam os tokens, mas gráficos específicos, PDFs, e-mails e formulários ainda precisam de revisão por jornada conforme [PLANO-DE-MELHORIAS.md](PLANO-DE-MELHORIAS.md). Não declarar acessibilidade completa, nova identidade corporativa aprovada no Maxwell ou migração integral para React com base apenas nessa camada.

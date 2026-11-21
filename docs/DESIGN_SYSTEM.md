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

Grid de 8 px, margens de 24–32 px no desktop e 16 px no celular, espaços de 16–24 px e raios de 8–12 px. Na revisão executiva aprovada em 16/11/2026, títulos de página usam 32–36 px, indicadores principais 36–48 px conforme a largura (44–48 px no desktop amplo), corpo/campos 15 px e notas/rótulos 13 px. Tabelas operacionais usam 14–15 px. Controles com pelo menos 40 px e foco visível de 2 px ou mais.

Tabelas extensas podem ter rolagem própria; não comprimir a página inteira para evitar isso. Impressão tem escala própria. O SQDCP continua uma A4 paisagem e os formulários que exigem retrato preservam essa orientação. Layout nunca modifica número, unidade, fonte do dado, período ou regra de agregação.

### Espaçamento (plataforma 1.7.3)

Escala única aprovada pelo responsável: **4, 8, 12, 16, 24 e 32 px**, nos tokens `--sp-4` … `--sp-32` de `css/brand` (8, 16, 24 e 32 apontam para `--bd-space-1` a `--bd-space-4` da referência de marca). Use sempre com o valor de reserva, `var(--sp-8,8px)`, porque um módulo aberto isolado pode não ter `css/brand`.

Vale para padding, margin e gap. Ficam fora: 0; 1–3 px (bordas e ajuste fino); medidas estruturais acima de 32 px (largura da barra lateral, altura do cabeçalho); valores com `calc()`. Valores entre passos vão para o mais próximo; no empate (6, 10, 14, 20, 28), o menor, para não aumentar a densidade das telas.

Aplicada na casca e no kit (`css/brand`, `css/kit`, `css/style`, 1.7.3) e nos blocos `<style>` de todos os módulos (1.7.4 e 1.7.5). Ficam de fora, de propósito: o CSS montado no JavaScript, porque vai para relatórios e para o Outlook, que não leem `var()`; `@media print` e `@page`; o SQDCP (A4 paisagem) e os relatórios impressos (`.rep`, `.printarea`). CSS novo usa a escala desde o início.

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
A fundação de marca foi preservada e a casca recebeu a direção executiva aprovada em 16/11/2026. Os motores reutilizam os tokens, mas gráficos específicos, PDFs, e-mails e formulários ainda precisam de revisão por jornada conforme [PLANO-DE-MELHORIAS.md](PLANO-DE-MELHORIAS.md). Não declarar acessibilidade completa, nova identidade corporativa aprovada no Maxwell ou migração integral para React com base apenas nessa camada.


## 17. Direção executiva aprovada e aplicada (16/11/2026)

O responsável aprovou a proposta visual e sua aplicação completa. A versão 1.2.0 adota **resultado → análise → ação**, mantendo os valores da paleta e os motores originais.

- **Visão inicial:** Resultado da fábrica, com quatro indicadores, meta/desvio quando publicados, segurança/qualidade, produção por turno ou dia, tempos por equipamento e prioridades do Planner. Resumo destaca três ações; Detalhado amplia a lista e mostra as linhas do recorte. As demais pendências e os atalhos continuam acessíveis em uma seção recolhível e no menu.
- **Fontes reais:** a imagem de referência é conceitual. Os exports atuais não publicam hora a hora completo; o resumo usa dia/turno e abre o hora a hora na Produção. Scrap aparece em peças, sem criar percentual/limite. Paradas são soma de registros, com cobertura explícita e possível sobreposição; não são automaticamente perda de OEE. QN informada não significa QN aberta. Quantidades consolidadas de SQDCP vêm do resumo publicado, sem somar a mesma QN entre turnos.
- **Contextos separados:** indicadores diários seguem o período/turno selecionados; ações mostram a posição atual publicada no Planner. Waste conserva competência mensal. Data de publicação é identificada como publicação, não como atualização em tempo real ou prova de importação completa.
- **Componentes:** fontes, filtros, botões, tabelas, estados, margens e navegação compartilham a escala da casca e de css/brand nos nove módulos. Comandos longos têm limite visual, descrição completa e rolagem na barra. Nada é removido por densidade ou por falta de espaço.
- **Gráficos:** rótulos legíveis, base zero, marcador de meta e barras no semáforo (seção 20) somente quando existe meta; sem meta, série institucional neutra. Rolagem é interna ao gráfico quando necessária. Equipamentos e ações preservam seus IDs nos atalhos.
- **Impressão:** Exportar resumo da visão inicial usa o mesmo recorte e valores do dashboard, com unidades, cobertura e referência das ações. O relatório compilado mantém a granularidade de cada módulo. A nova escala operacional é de tela; os PDFs específicos e o SQDCP A4 mantêm seus formatos.

A preparação usa dados fictícios em 390/768/1440/1920 px, claro/escuro, navegação offline e os nove módulos. Aprovação visual não substitui validação das jornadas por perfil (E10c), conferência corporativa, impressora/Outlook ou homologação da pasta da linha.

## 18. Acessibilidade e Status — plataforma 1.4.0 (16/11/2026)

- Metadados técnicos saem da barra das abas. O botão **Status**, no cabeçalho da página, abre versão, arquivo da base, revisão, publicação, cadastro, conexão, permissão, fila e registros de backup. Falha de consulta é informada; falta de registro não comprova sucesso. Erro, alterações pendentes e somente leitura continuam visíveis fora da janela.
- TV e Mais são menus recolhíveis. O rótulo identifica o comando; a explicação aparece no título ou na descrição do item. Setas/Home/End percorrem itens; Escape devolve o foco. Ctrl K abre diretamente no campo de busca; diálogos devolvem foco ao comando de origem.
- Os seis textos pequenos da casca têm piso de 12 px; Guia e Sair da demonstração têm alvo de 40 px. A escala operacional da seção 11 continua valendo; isso não autoriza reduzir corpo/tabelas a 12 px.
- A paleta mantém seus valores. Fundos fortes usam tinta adequada ao tema; grupos/códigos podem usar a mesma cor em borda e fundo suave, com texto legível. Atenuação por opacidade não pode tornar ilegível um estado sem dados/em construção. Verde/vermelho continuam com seus significados operacionais.
- `testes/plataforma/contraste.cjs` mede texto HTML, valores/placeholder e opacidade sobre fundos sólidos nos dois temas, percorrendo abas dos nove módulos e janelas de Status, além de busca e TV em foco/hover. O teste informa os fundos não suportados; SVG/canvas, imagens/gradientes, popups nativos, pseudoelementos decorativos e impressão exigem conferência própria. Não declarar conformidade WCAG integral com base nesse ensaio.
- Destinos visíveis: Administração para cadastros; Importações para carga/conferência; Visão da linha para acompanhamento. Valores antigos, rotas e IDs permanecem compatíveis; não substituir nomes em dados históricos.

## 19. Cabeçalho copiado para Outlook — 1.4.1

Os textos sobre o fundo escuro do cabeçalho do e-mail comum usam branco diretamente em cada bloco, com cor inline e atributo `font color` para compatibilidade com os editores Office. O título não depende de herdar a cor da célula. A composição, o fundo, os números e o conteúdo claro do relatório permanecem iguais. Não aplicar branco indiscriminadamente às tabelas e aos indicadores sobre fundo claro. O teste do ClipboardItem exercita os nove módulos e um editor de destino que redefine a cor dos blocos; isso não substitui a conferência no Outlook desktop/web real (H05).

**Plataforma 1.8.1:** o Outlook novo mantinha o fundo azul-escuro do cabeçalho e descartava a cor branca do texto, inclusive a explícita: o título saía preto sobre azul. O cabeçalho passou a ser **claro** (`#EAF2FA`), com uma faixa azul-marinho em linha própria no topo e texto azul-marinho explícito (inline e `font color`). Fica legível nos dois modos de falha: sem a cor do texto (preto sobre claro) e sem o fundo (azul-marinho sobre branco). Teste: `testes/plataforma/outlook.cjs` confere contraste ≥ 4,5 e os dois modos de falha nos nove módulos.

## 20. Semáforo de três cores — plataforma 1.8.2

Todo indicador com meta usa as três cores do semáforo da Administração (substitui o verde/vermelho da seção 17): verde (`--ok`/`--green`) na meta, amarelo (`--warn-fill`/`--amber`, texto `--warn`) em atenção, vermelho (`--crit`/`--red`) abaixo. Barra sem meta mantém a cor da série. Legendas listam as três. Exceções: SQDCP (binário por contrato), Gel (regra de dosagem × BOM) e medidores D/P/Q.

## 21. Modelo de página e títulos — Produção 2.6.29 (21/11/2026)

- **Modelo de página:** Produção › Visão geral (consulta) e Produção › Lançamento (lançamento) são a referência de estrutura, filtros, gráficos e disposição de botões para as demais páginas. O modelo detalhado e o passo a passo para adequar outra página estão na skill [padrao-visual](../.claude/skills/padrao-visual/SKILL.md); `node scripts/varredura-visual.mjs --modulo "<Módulo>" --aba <id>` lista o que foge do modelo.
- **Caixa de frase** em títulos h1–h4, seções, cartões e botões, como no guia da marca. Maiúsculas só em rótulos curtos (rótulo de KPI, cabeçalho de tabela, pílula, chip, grupo do menu). As seções não são numeradas.
- **Um aviso num lugar só:** o que está na Validação não se repete em outro bloco da mesma página; o bloco remete à Validação.
- **Cartão que repete outro número** (ex.: OEE reportado igual ao realizado) só aparece quando mostra um valor diferente.
- **Período de 1 dia:** grupos de gráficos recolhidos e uma nota única, sem tendência.

## 22. Cores das categorias do SQDCP — padrão da empresa (21/11/2026)

Pedido do responsável: na gestão do quadro, cada categoria tem uma cor. Ela vale nos **cabeçalhos das categorias** do SQDCP e, em qualquer página, como **barra ou detalhe do cartão** de um indicador dessa categoria (ex.: um cartão de Segurança na Visão da linha leva a barra verde). É cor de identidade, não de resultado: o resultado contra a meta continua no semáforo (seção 20) no valor ou no selo, e o SQDCP impresso continua uma A4 paisagem com verde/vermelho para o resultado (contrato 6).

| Categoria | Cor | Preenchimento | Texto sobre o preenchimento | Texto/traço sobre branco |
|---|---|---|---|---|
| S · Segurança | verde | `#16803C` | branco (5,0:1) | `#16803C` (5,0:1) |
| Q · Qualidade | azul | `#1769D2` | branco (5,3:1) | `#1769D2` (5,3:1) |
| D · Entrega | laranja | `#FF6E00` | navy (6,7:1) | `#B04A00` (5,5:1) |
| C · Custo | amarelo | `#F2B705` | navy (10,3:1) | `#7A5A00` (6,4:1) |
| P · Pessoas | cinza | `#8A94A6` | navy (6,1:1) | `#56606E` (6,4:1) |

Barras e bordas usam o preenchimento; texto e ícone sobre fundo claro usam a última coluna. O laranja da categoria Entrega não substitui o laranja de ação primária nem o amarelo de atenção do semáforo: a categoria aparece sempre com a letra ou o nome (S, Q, D, C, P).


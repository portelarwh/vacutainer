# BD Dashboard Brand Guidelines

> **Fonte:** extraído do tema e dos layouts do arquivo `Template.pptx` da BD. Este documento foi adaptado para uso em dashboards, portais e relatórios digitais. Em caso de conflito com normas corporativas publicadas no Maxwell, prevalece a versão corporativa mais recente.

## 1. Direção visual

A identidade deve transmitir **clareza, precisão, confiança e tecnologia aplicada à saúde**. O dashboard deve ser limpo, com alto contraste, bastante espaço em branco e uso disciplinado das cores. A linguagem visual do template combina:

- azul profundo como base institucional;
- azul vivo para ações e dados prioritários;
- laranja como destaque pontual;
- lilás e cinza quente como cores auxiliares;
- formas horizontais com extremidades arredondadas, inspiradas nas *advancing shapes* do template;
- títulos leves, grandes e diretos;
- conteúdo organizado em blocos simples, sem excesso de bordas ou efeitos.

## 2. Paleta oficial extraída do tema

| Token | Hex | RGB | Uso recomendado |
|---|---:|---:|---|
| `bd-navy` | `#060A3D` | `6, 10, 61` | Cabeçalhos, navegação, títulos, fundos institucionais e séries de maior hierarquia |
| `bd-blue` | `#044ED7` | `4, 78, 215` | Cor primária de interação, links, filtros selecionados e série principal |
| `bd-bright-blue` | `#1D74FF` | `29, 116, 255` | Realces, estados ativos, seleção e segunda série quantitativa |
| `bd-lavender` | `#9199D8` | `145, 153, 216` | Comparações, referência, metas e séries secundárias |
| `bd-orange` | `#FF6E00` | `255, 110, 0` | Exceções, atenção, destaques e chamadas pontuais |
| `bd-warm-gray` | `#DBD8D7` | `219, 216, 215` | Divisores, fundos de cards e áreas desabilitadas |
| `bd-off-white` | `#F9F4F1` | `249, 244, 241` | Fundo alternativo e áreas de conteúdo suave |
| `bd-white` | `#FFFFFF` | `255, 255, 255` | Fundo principal e texto sobre fundos escuros |
| `bd-charcoal` | `#3D3E41` | `61, 62, 65` | Texto corrido e rótulos sobre fundos claros |
| `bd-link` | `#044DD6` | `4, 77, 214` | Links e navegação textual |

### Hierarquia de uso

1. **Base:** `bd-white`, `bd-off-white`, `bd-charcoal`.
2. **Institucional:** `bd-navy` e `bd-blue`.
3. **Dados:** `bd-blue`, `bd-bright-blue`, `bd-lavender` e `bd-navy`.
4. **Destaque:** `bd-orange`, limitado a aproximadamente **5% a 10%** da área visual da página.
5. **Estrutura:** `bd-warm-gray` para separações discretas, nunca como texto principal.

## 3. Tipografia

### Família principal

- **FS Albert Pro Light**: títulos, números de destaque e cabeçalhos.
- **FS Albert Pro**: textos de apoio, rótulos, menus e conteúdo que exige maior legibilidade.
- O tema utiliza **FS Albert Pro Light** como fonte principal para títulos e corpo.
- Para ambientes onde a família corporativa não estiver instalada, usar a sequência de fallback abaixo.

```css
font-family: "FS Albert Pro", "FS Albert Pro Light", Arial, "Helvetica Neue", sans-serif;
```

> Não substituir a fonte corporativa em materiais oficiais quando ela estiver disponível. Em aplicações web ou Power BI, confirmar se a licença e a distribuição da fonte são permitidas.

### Escala recomendada para dashboard

| Elemento | Tamanho | Peso/estilo | Cor padrão |
|---|---:|---|---|
| Título da página | `30–36 px` | Light | `bd-navy` |
| KPI principal | `32–44 px` | Light | `bd-navy` ou `bd-blue` |
| Título de seção | `22–24 px` | Light | `bd-navy` |
| Título de card/gráfico | `16–18 px` | Regular | `bd-navy` |
| Corpo e tabelas | `14–16 px` | Regular | `bd-charcoal` |
| Rótulos e filtros | `12–14 px` | Regular | `bd-charcoal` |
| Notas e metadados | `11–12 px` | Regular | `bd-charcoal` com menor ênfase |

Evitar caixa alta em frases longas. Usar **sentence case** nos títulos e reservar negrito para ênfase funcional, não decorativa.

## 4. Layout e espaçamento

- Usar grid de **8 px**.
- Margem externa recomendada: **24–32 px**.
- Espaçamento entre cards: **16–24 px**.
- Padding interno de cards: **16–24 px**.
- Raio de borda padrão: **8–12 px**.
- Para elementos institucionais ou destaques, podem ser usadas extremidades totalmente arredondadas, seguindo as *advancing shapes*.
- Priorizar alinhamento à esquerda para títulos, descrições, filtros e tabelas.
- Preservar áreas livres. Não preencher todos os espaços com indicadores.

## 5. Componentes do dashboard

### Cabeçalho

- Fundo preferencial: `bd-navy` ou branco.
- Em fundo escuro, usar logotipo BD branco e textos brancos.
- Em fundo claro, usar a versão azul institucional do logotipo.
- Altura recomendada: **56–72 px**.
- Não distorcer, recolorir, inclinar ou aplicar sombra ao logotipo.

### Navegação

- Item ativo: fundo `bd-blue`, texto branco.
- Item inativo: texto `bd-charcoal` sobre fundo branco, ou branco com menor ênfase sobre `bd-navy`.
- Indicadores de seleção podem usar uma cápsula arredondada ou barra de **3–4 px**.

### Cards de KPI

- Fundo branco ou `bd-off-white`.
- Borda opcional: `1 px solid #DBD8D7`.
- Sem sombras pesadas. Quando necessária, usar sombra muito suave.
- Ordem interna: rótulo, valor, variação, contexto temporal.
- Reservar `bd-orange` para desvio relevante, atenção ou exceção, não para toda variação positiva.

### Filtros

- Altura entre **36 e 44 px**.
- Estado padrão: fundo branco, borda `bd-warm-gray`.
- Estado ativo: borda ou preenchimento `bd-blue`.
- Foco por teclado: contorno visível em `bd-bright-blue`, com pelo menos **2 px**.

### Tabelas

- Cabeçalho: `bd-navy` com texto branco, ou `bd-off-white` com texto `bd-navy`.
- Linhas alternadas podem usar `bd-off-white` em baixa intensidade.
- Alinhar texto à esquerda e números à direita.
- Evitar grades completas. Preferir divisores horizontais em `bd-warm-gray`.
- Destacar somente exceções ou pontos que exigem ação.

## 6. Gráficos e visualização de dados

### Ordem recomendada das séries

```text
1. #044ED7  BD Blue
2. #1D74FF  Bright Blue
3. #9199D8  Lavender
4. #060A3D  Navy
5. #FF6E00  Orange
6. #DBD8D7  Warm Gray
```

### Regras

- Série principal em `bd-blue`.
- Meta ou referência em `bd-navy` ou `bd-lavender`.
- Comparação anterior em `bd-lavender` ou `bd-warm-gray`.
- `bd-orange` somente para alertas, desvios ou pontos que precisam de atenção.
- Eixos e linhas de grade em `bd-warm-gray`, com baixa intensidade.
- Rótulos em `bd-charcoal`.
- Evitar gráficos 3D, gradientes, sombras fortes e excesso de linhas.
- Não depender apenas de cor. Usar rótulos, ícones, padrões ou estilos de linha para diferenciar estados.
- Para muitos grupos, limitar a paleta visível e permitir seleção/realce interativo.

## 7. Estados semânticos

As cores semânticas abaixo não foram definidas no tema do PPTX. Quando o sistema exigir sucesso, alerta ou erro, usar cores acessíveis e manter o visual BD por meio de tipografia, espaçamento e componentes.

| Estado | Cor sugerida | Uso |
|---|---:|---|
| Informação | `#044ED7` | Informações e estados selecionados |
| Atenção | `#FF6E00` | Risco, desvio ou ação pendente |
| Sucesso | `#197A4A` | Meta atingida ou operação concluída |
| Erro crítico | `#C62828` | Falha, bloqueio ou condição crítica |
| Neutro | `#DBD8D7` | Indisponível, sem dados ou desabilitado |

Sempre combinar cor com texto ou ícone. Não interpretar o laranja automaticamente como "ruim" quando ele estiver sendo usado apenas como destaque de marca.

## 8. Formas, ícones e imagens

- Usar formas simples e horizontais, com cantos amplamente arredondados.
- A composição pode sobrepor formas arredondadas para indicar progressão, etapas ou agrupamentos.
- Ícones devem ser lineares, simples e de espessura consistente.
- Preferir ícones monocromáticos em `bd-navy`, `bd-blue` ou branco.
- Fotografias devem ser claras, profissionais e relevantes ao contexto de saúde, operação ou tecnologia.
- Evitar imagens genéricas sem relação com a informação apresentada.
- Não usar múltiplas cores de marca em um mesmo ícone.

## 9. Acessibilidade

- Garantir contraste mínimo **WCAG 2.1 AA**: `4.5:1` para texto normal e `3:1` para texto grande.
- Usar texto branco sobre `bd-navy` e `bd-blue` em componentes de destaque.
- Evitar texto branco pequeno sobre `bd-orange` e `bd-lavender`; preferir `bd-navy` ou `bd-charcoal` nesses fundos.
- Não usar `bd-warm-gray` como texto sobre branco.
- Indicadores críticos devem ter rótulo explícito, como “Acima da meta”, “Atenção” ou “Crítico”.
- Todos os elementos interativos precisam de estado de foco visível e área de clique adequada.

## 10. Tokens CSS

```css
:root {
  --bd-navy: #060A3D;
  --bd-blue: #044ED7;
  --bd-bright-blue: #1D74FF;
  --bd-lavender: #9199D8;
  --bd-orange: #FF6E00;
  --bd-warm-gray: #DBD8D7;
  --bd-off-white: #F9F4F1;
  --bd-white: #FFFFFF;
  --bd-charcoal: #3D3E41;
  --bd-link: #044DD6;

  --bd-font: "FS Albert Pro", "FS Albert Pro Light", Arial, "Helvetica Neue", sans-serif;

  --bd-radius-sm: 8px;
  --bd-radius-md: 12px;
  --bd-radius-pill: 999px;

  --bd-space-1: 8px;
  --bd-space-2: 16px;
  --bd-space-3: 24px;
  --bd-space-4: 32px;

  --bd-border: 1px solid var(--bd-warm-gray);
  --bd-shadow-soft: 0 2px 8px rgba(6, 10, 61, 0.08);
}
```

## 11. Tema inicial para Power BI

```json
{
  "name": "BD Dashboard",
  "dataColors": [
    "#044ED7",
    "#1D74FF",
    "#9199D8",
    "#060A3D",
    "#FF6E00",
    "#DBD8D7"
  ],
  "background": "#FFFFFF",
  "foreground": "#3D3E41",
  "tableAccent": "#044ED7",
  "good": "#197A4A",
  "neutral": "#FF6E00",
  "bad": "#C62828",
  "maximum": "#060A3D",
  "center": "#9199D8",
  "minimum": "#DBD8D7",
  "null": "#DBD8D7"
}
```

> O JSON acima é um ponto de partida. A disponibilidade da fonte FS Albert Pro no Power BI depende das fontes instaladas no ambiente e do método de publicação.

## 12. Uso da marca e rodapé legal

- Usar apenas arquivos oficiais do logotipo BD.
- Manter proporção, área de proteção e legibilidade.
- Não recriar o símbolo, alterar cores ou combinar o logotipo com outros elementos.
- Quando houver exigência legal ou publicação externa, utilizar o texto de direitos autorais e marcas vigente.
- O template orienta consultar as **General Trademark Usage Guidelines** no Maxwell para obter o bloco de copyright e a assinatura de marcas mais recentes.

Exemplo-base presente no template:

```text
BD, the BD Logo and [additional brands] are trademarks of Becton, Dickinson and Company or its affiliates. © [current year] BD. All rights reserved.
```

## 13. Checklist de aplicação

- [ ] Fundo predominantemente branco ou off-white.
- [ ] Títulos em FS Albert Pro Light, ou fallback aprovado.
- [ ] Azul BD usado como cor principal de interação e dados.
- [ ] Laranja restrito a destaques e atenção.
- [ ] Cards organizados em grid de 8 px.
- [ ] Gráficos sem 3D, gradientes ou sombras pesadas.
- [ ] Texto e números com contraste WCAG AA.
- [ ] Estados não dependem apenas de cor.
- [ ] Logotipo oficial sem alterações.
- [ ] Rodapé legal validado quando aplicável.
- [ ] Conteúdo objetivo, com explicações detalhadas em tooltip, ajuda contextual ou ícone de informação.

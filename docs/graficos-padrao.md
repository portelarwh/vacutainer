# Gráficos: título, unidade e legenda (padrão comum)

Pendência § L do registro de decisões (V06, "Unidades dos gráficos"): revisar título, unidade e legenda dos gráficos de cada página. A revisão vai **uma página por PR**, na ordem Produção → Waste → Paradas → Gel → Portal. Os números não mudam: a referência gravada antes da mudança continua igual.

## Regra

1. **Título** diz o que se mede (ex.: "Produção boa × meta e capacidade"). A pergunta embaixo (`p.q`) diz para que serve.
2. **Unidade**: todo gráfico cujo eixo ou barra mostra **número sem unidade** ganha a linha pequena **"Valores em &lt;unidade&gt;"** acima do desenho, por exemplo "Valores em mil tubos", "Valores em mil tubos/h" ou "Valores em min".
   - Quando o eixo já mostra a unidade em cada rótulo (%), a linha não aparece.
   - A unidade da quantidade acompanha a exibição escolhida no computador: "mil tubos" em milheiros e "tubos" no número completo (`vac.qtd`). Outro rótulo vindo do Portal (`unitLabel`) aparece como está, seguido de "tubos".
   - A linha fica **fora** do SVG, então o redesenho ao mudar a largura não a apaga.
3. **Legenda**: aparece quando há mais de uma série, ou quando a barra muda de cor pela meta. Gráfico de uma série só, sem meta, não tem legenda: o título já diz o que é.
4. **Eixo sem rótulos repetidos**: quando o eixo em % repetiria um rótulo (Scrap %: 0,0% · 0,0% · 0,1%), o **eixo** usa as casas necessárias para o passo (0,025% → 3 casas). Os rótulos dentro das barras usam as mesmas casas. A tabela "Ver dados em tabela" fica como antes.

## Produção 2.4.51 (11/11/2026)

Arquivo: `fontes/producao/graf_build.py` (regras `R(...)` no motor `Charts` e nas chamadas). É só apresentação, sem nenhum cálculo novo.

- **Motor:** `unTag(o)` lê `o.unit` (texto ou função) em `combo`, `hbar` e `waterfall`. No `hbar`, sem `valueName` a unidade é "min", que é o que a tabela e a dica já diziam. O `scatter` já tem nome e unidade nos eixos ("Ocorrências", "Duração média (min)").
- **Quantidade:** `qUn()` vale nas 12 chamadas com `fmtY: v => fq(v)`: produção × meta, cascata, hora a hora, Evolução diária, Plano do mês e Meu painel. O PPH usa `qUn() + '/h'`.
- **Minutos:** "Perdas em minutos por dia" e "Perda de produção (min)" do Meu painel.
- **Pareto:** Pareto de paradas, Principais paradas, Paradas por equipamento e o Pareto da TV (todos em minutos).
- **Por catálogo e família:** Produção por catálogo e Produção por família em quantidade.
- **Teste:** `testes/tvisaogeral.js` confere três coisas:
  - todo gráfico sem % no eixo diz a unidade;
  - as unidades são produção = mil tubos, PPH = mil tubos/h e paradas = min;
  - nenhum eixo repete rótulo.
- **Comparação com a referência:** a linha da unidade e os rótulos do eixo Y (escala) ficam fora da comparação com a referência, que foi regravada a partir da página anterior (2.4.50). A única diferença em relação à referência anterior são os rótulos das barras do Scrap %: 0,032% / 0,054% / 0,081% em vez de 0,0% / 0,1% / 0,1%. Cartões, tabelas e Meu painel ficaram iguais.

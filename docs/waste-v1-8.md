# Waste (Perdas-Ordem.html) · v1.8

Continuação de `claude/perdas-ordem-v1.md` (v1 a v1.7.3).

## v1.8 · 05/11/2026 (Waste · preparação para a reunião de waste)

Mudanças aditivas; tudo da 1.7.3 preservado (importação KKBC_ORD nos dois layouts, cálculos, comparativos, fechamento, ações, relatórios, backups). MB51/COOIS **não** entram nesta versão: ficam para Produção › Ordens (ver `claude/plano-evolucao-plataforma.md`).

- **Nome exibido Waste** (título, barra Sistemas, TV, relatórios e arquivos exportados `Waste_…`). Arquivo `Perdas-Ordem.html`, base `perdas-base.json`, `PAGE.id:'perdas'` e `schema:'perdas-base'` **não mudam**. A barra troca "Perdas" por "Waste" mesmo quando a lista `vac.sistemas` do Portal ainda tem o nome antigo.
- **Competência** = mês de referência da KKBC_ORD (`per`). Filtros "Competência de / até", atalhos Última · Anterior · Últimas 3 · Ano fiscal atual · Todas; colunas "Mês" renomeadas para "Competência". Quando existir Produção › Ordens, a competência passa a vir do MB51 e o `per` vira período de custo.
- **Quadro "Por competência"** no Painel (com os filtros): ordens, VAR. MATERIAL, SCRAP, TOTAL, desvio %, R$/milhão, meta, críticas/altas e linha de total; clique filtra a competência.
- **Busca livre** (filtra enquanto digita): ordem, lote, catálogo, descrição, componentes (código e texto), unidade, grupo, colunas extras, status, centro, competência (aaaa-mm, mmm/aa, FY e período), nível, aberta/encerrada, causa, comentários e ações. Várias palavras = todas precisam aparecer; sem acento e sem maiúsculas. Ctrl K usa a mesma busca e acha também ordens excluídas.
- **Filtro de status**: abertas / encerradas / sem status.
- **Selo de origem** acima do resumo: fonte, última importação (quando e quem), competência, nº de ordens e de linhas, e o aviso de ordens excluídas fora dos totais. O relatório mensal leva o mesmo texto no subtítulo.
- **Exclusão lógica da ordem** (qualquer usuário, justificativa obrigatória com pelo menos 5 caracteres): `B.exclusoes[{id, ordem, em, por, motivo, ativo, restauradoEm, restauradoPor, motivoRestauro}]`. A ordem excluída sai de `vigRows()` e, com isso, de todos os totais, painéis, comparativos, TV, relatórios, qualidade dos dados e do `exports` (que ganha `ordensExcluidas`). Nada é apagado. Painel › aba **Excluídas** (com Restaurar), faixa vermelha no detalhe da ordem, auditoria "Ordem excluída" / "Ordem restaurada". `vigRowsAll()` = vigentes sem o filtro de exclusão (usado no detalhe e na lista de excluídas).
- **Detalhe da ordem**: barra de navegação fixa (Resumo · Produção (OEE) · Gel · Componentes · Comentários e ações · Versões · Dados de origem · Histórico), botão "Excluir ordem…", seção **Dados de origem (SAP)** por importação (vigente, substituída ou desfeita) e **Histórico da ordem** (exclusões/restaurações e linhas da auditoria que citam a ordem).
- **Dados brutos**: cada linha importada a partir da 1.8 guarda o texto original (`raw`, até 600 caracteres; lista do SAP = a linha como veio; tabela = células separadas por tabulação). Importações anteriores mostram os valores lidos e apontam para o original em `00. Originais SAP`.
- **Modo de teste**: botões "Sair do modo de teste" (volta à base real) e "⇩ Dados de teste" na faixa roxa.
- Testado (Playwright): modo teste, atalhos de competência, busca com várias palavras, status, quadro por competência, excluir → totais caem e a aba Excluídas mostra a ordem → restaurar volta os totais, importação colada guardando `raw`, Dados de origem, relatório mensal, sair do teste, 390 px sem rolagem lateral, sem erros de JavaScript.

## Waste 1.8.2 (05/11/2026)

- **Importar fica na tela**: depois de gravar a KKBC_ORD, não vai mais para o Painel. Mostra "✓ Importadas N linhas de M ordens" com **Importar a próxima** (limpa e põe o cursor na colagem) e **Ver no Painel**; a tela sobe para o topo da importação.
- **Ordens sem KKBC vindas da Produção**: `Perdas-Ordem.html#aba=importar&kkbc=ord1,ord2` (pílula "sem KKBC ⧉" na Produção, que já copia as ordens) abre a importação com a faixa das ordens pedidas, ✓ nas já importadas, "Copiar de novo" e "Fechar".
- **Filtros novos no Painel**: **Tipo de item** (Tubo / Preparação (aditivo) / Sem cadastro: pelo catálogo do Portal › Tipo de item; sem cadastro, pela unidade da ordem no MB51 — L/ML/G/KG/MG = preparação) e **Tipo de ordem** (do COOIS: ZP02, ZPRW = retrabalho, "sem dado do COOIS"), lidos de `ordens-base.json` (exports.porOrdem; só leitura, relido no sincronizar). Aparecem nos chips e saem no Limpar.
- Kit do cabeçalho v2.1 (← Voltar).

## Waste 1.8.3 (05/11/2026) · moeda BRL/USD

- Importação da KKBC_ORD lê a coluna **Moeda** (grade e saída dinâmica de lista; também a linha "Moeda XXX" do cabeçalho da ordem). Cada linha guarda `moeda`.
- **Sem a coluna** (inclusive tudo o que já foi importado) = moeda padrão da Configuração (**BRL**). Não precisa reimportar; só mudar o padrão se as antigas estavam em dólar.
- **Moeda: BRL | USD** no Painel (preferência de cada pessoa): converte custo meta, real, desvio SAP e desvio de estrutura pela cotação do **cadastro geral (Portal › Câmbio, USD)** vigente no **último dia da competência**. Sem cotação no mês: valor fica na moeda original e aparece aviso com os meses.
- Limites de criticidade continuam em R$; vendo em USD, são convertidos pela cotação vigente hoje (a criticidade não muda com a troca de moeda).
- **Exports** (Portal, OEE, Gel) saem sempre em BRL.

## Waste 1.8.4 (05/11/2026) · conferência de moeda na importação

- Decisão do Pedro: a KKBC_ORD passa a ser enviada **sempre em BRL**, com a coluna Moeda. As ordens já importadas (que eram USD lidas como BRL) serão **reimportadas** em BRL; a reimportação vira nova versão da ordem (substitui, não soma).
- Prévia da importação (grade e lista) mostra a **Conferência de moeda**: tudo BRL → "✓ Moeda conferida: tudo em BRL" e segue normal. Linhas em outra moeda, **ordens com mais de uma moeda** (conversão dupla no SAP) ou linhas **sem a coluna Moeda** → aviso vermelho com a lista e o botão Importar fica travado até marcar "Conferi e quero importar assim mesmo".
- A prévia mostra os valores como vieram (sem conversão, com o símbolo da moeda do arquivo).
- Histórico de importações ganhou a coluna **Moeda** (contagem de linhas por moeda; "—" = importada antes da coluna).

## Waste 1.8.5 (05/11/2026) · relatório por tipo de ordem

- Relatórios › **Ordens por tipo · produção × preparação** (mês de / até): resumo com o total de cada tipo e o geral; tabela Produção × preparação × Total (ordens, custo meta, custo real, perdas, ganhos, desvio, desvio %, var. material, scrap, críticas); depois a lista de ordens de cada tipo com linha de total. PDF/Excel/texto/Outlook como os demais.
- O **Mensal de perdas** ganhou o bloco "Produção × preparação" logo depois do Resumo.
- Tipo da ordem = mesma regra do filtro do Painel (Tipo de item do catálogo no Portal; sem cadastro, ordem só em L/G/KG no MB51 = preparação). O que não se classifica aparece como "Sem classificação" (somado no total).

## Waste 1.8.6 (05/11/2026) · lê o cadastro geral

- Meta mensal = Portal › Metas da área › **WASTE-MES** (vigente hoje). O campo da Configuração fica travado, com link para editar.
- Tipo do componente (agrupamento) = Portal › Materiais › Tipo, quando o material está cadastrado (gel, rolha, tubo, etiqueta, caixa, aditivo). A regra por palavra fica como reserva.
- Logo = a do Portal (`vac.logo`), quando houver.
- Leitura em cache de 10 s.

## Waste 1.8.7 (06/11/2026) · gravação pendente não grava por cima de outra pessoa

- Se uma gravação falhou (alteração pendente) e a `perdas-base.json` da pasta mudou depois, a sincronização baixa a cópia local `perdas-base_NAO-GRAVADO_<data>.json` e passa a usar a base da pasta, em vez de gravar por cima. Se a pasta não mudou, grava normalmente.
- Uma alteração nova feita enquanto outra está pendente leva as duas juntas (antes a pendente era descartada ao reler a pasta).
- Catálogo de sistemas único do kit (`fontes/kit/sistemas.js`).

## Waste 1.8.8 (06/11/2026) · pendências no exports

- `exports.pendencias` (contrato: `sev 1` = urgente, `2` = atenção), `exports.ultimaImportacao`, `modulo`, `appVersion`.
  - Ação aberta com prazo: `{sev:1, tipo:'acaoVencida', aPartirDe:<dia seguinte ao prazo>, quando:<prazo>, txt, link}`. Publicada antes de vencer, com `aPartirDe`, porque o `exports` só é recalculado quando alguém grava: assim a ação vence no Portal no dia certo mesmo sem gravação nova.
  - Ordem crítica/alta sem causa: `{sev: crítica 1 · alta 2, tipo:'semCausa', txt, link:'ordem=…'}`.
- O Portal 1.8.4 deixa de ler `actions` e `imports` da base do Waste (regra 1).

## Waste 1.8.9 (06/11/2026) · consumo de gel sem o scrap

- Detalhe da ordem › Gel: consumo e scrap lidos pelos nomes do contrato (`exports.ordens[].consumoKg` / `scrapKg`). A busca por nome de campo fica só para base do Gel sem `exports` e nunca soma campos de scrap no consumo (antes `scrapKg` entrava em "kg": 100 + 5 = 105).

## Waste 1.8.10 (06/11/2026) · diagnóstico pós-merge

- **M01**: se a leitura da `perdas-base.json` antes de gravar falhar, a alteração fica pendente em vez de gravar por cima; a sincronização confere a base.
- Detalhe da ordem › Gel: `exports` do Gel em versão desconhecida não é lido (nem pela busca genérica); a tela pede para atualizar o Waste.

## Waste 1.8.11 (06/11/2026) · layout (vac-visual v1)

- Indicador em atenção: a borda segue o âmbar do valor. Antes, valor âmbar com borda azul, como em "Críticas/altas sem causa".
- Valor do indicador principal em 28 px, como nas outras páginas; a grade dos indicadores passa para 200 px por coluna.
- Padrão visual comum do kit.

## Waste 1.8.12 (06/11/2026) · bases em 00. Bases

- Ao conectar, move `perdas-base.json` para `00. Bases` (kit vac-bases), com cópia em `00. Backups/Perdas`. Lê OEE, Gel e Ordens em `00. Bases` ou, enquanto não forem movidas, na raiz.

## Waste 1.8.13 (06/11/2026) · revisão c341f8e

- Kit vac-bases v2. Um erro ao ler a base não oferece criar base nova. Aba ativa com a marca de volta; pílula de estado visível em telas pequenas.

## Waste 1.8.14 (07/11/2026) · relatórios

As mesmas correções do relatório do Portal 1.8.11 (módulo `Report` igual):
- comentário inteiro no PDF;
- gráfico com as cores do tema claro;
- impressão em paisagem e no tema claro;
- aviso de corte no texto;
- Outlook com os gráficos como imagem.

No relatório mensal, o Pareto de componentes diz "20 maiores de N (todos no Excel)". O Excel já trazia todos. Registro § P.

## Waste 1.8.16 (07/11/2026) · revisão `065fe6f` (registro § C)

- **Botões do detalhe da ordem e das listas:** valores passam por `jsArg` (JSON + escape do atributo), nos 21 pontos. Um componente ou ordem importados com aspa executavam código no clique; um código com apóstrofo legítimo quebrava o botão.
- **CSV:** texto que viraria fórmula no Excel ganha o prefixo `'` (`vacCsvTexto`, kit). Números iguais.
- **Downloads** (CSV, JSON, backup) pelo `downloadBlob`, que libera a URL.

## Waste 1.8.17 (08/11/2026) · E2 do plano único (registro § U)

- **Meta do mês pela vigência do próprio mês** (regra 3): WASTE-MES do Portal, com duas vigências no mesmo mês = média ponderada pelos dias (`vacMetaAreaMes`, kit). Mês sem vigência no Portal: a meta local da Configuração. Antes, todos os meses usavam a meta de hoje.
  - painel: meta do período = soma das metas de cada mês;
  - tabela por mês: "acima/dentro" pela meta do mês;
  - tendência (painel, TV, relatório): um traço de meta por barra quando os meses têm metas diferentes; uma linha quando são iguais;
  - relatório mensal e TV: "meta R$ x (ponderada pelos dias: R$ a × d + R$ b × d)".
- **Versão única:** `PAGE.versao = APP_VER`; título sem número. Antes havia 1.8.13, 1.8.15 e 1.8.16 em lugares diferentes, e o Portal › Versões mostrava um aviso falso.

## Waste 1.8.18 (08/11/2026) · E4 do plano único (registro § U)

- **Versão do `exports` conferida:** os da Produção e das Ordens só são usados se a versão for conhecida (`vacExportsOk`); se não, a página avisa o motivo.
- **Ordem em várias competências (Ordens SAP):** o índice junta todas. O tipo do COOIS vem da competência mais recente que o tem; antes, a última do arquivo apagava as outras.
- **Dias do lote:** lidos pela chave "dia|lote" do servidor (antes, a página procurava no valor e não achava). Com a Produção 2.4.12, os dias também chegam pelo `exports.porOrdem`.

## Waste 1.8.22 (08/11/2026) · C1

Trava da 2ª aba: se outra aba do Waste tem alteração não gravada na pasta, esta não altera e avisa. Nada é descartado.

## Waste 1.8.23 (08/11/2026)

Só o kit: ficha por pasta (AT-08) e contagem da fila durável para o Portal.


## 1.8.24 · 08/11/2026

Exclusão mútua entre abas; retomada preserva o snapshot pendente mais recente. Procedimento, testes e limites em [estabilizacao-nv-01-05.md](estabilizacao-nv-01-05.md).

## 1.8.27 · 10/11/2026 · Fase 3 do briefing (WST-02)

A aba Importar leva ao Portal › Importação › Waste; a tela da KKBC_ORD continua aqui e abre direto por `#aba=importar` (botão do Portal). `exports.importacoes` com as competências de cada importação (desfeitas ficam fora). Detalhes: `docs/briefing-2026-11-09-fase0-fase1.md` § 7.

## 1.8.28 · Ações em Iniciativas / Ações (Fase 6 do briefing, WST-03; 10/11/2026)

"+ Ação" abre Iniciativas com a ação preenchida (origem Waste, vínculo com a ordem). O Waste lê as ações de lá pelo `exports` (ficha comum) e as mostra só para consulta. As ações antigas continuam editáveis aqui até Iniciativas › Configuração › Trazer ações do Waste (uma vez, com o histórico, pelo novo `exports.acoesLegado`); trazidas, saem das listas e da pendência daqui. Detalhes: `docs/briefing-2026-11-09-fase0-fase1.md` § 11.1.

## 1.8.36 · Gráficos: unidade e moeda (11/11/2026)

- **Unidade e moeda:** a Tendência mensal (Visão Geral e TV) mostra "Valores em R$" ou "US$", conforme a moeda vista. As medidas do Comparativo e o cabeçalho "Desvio" das tabelas também acompanham a moeda; antes diziam "R$" fixo.
- **Eixo:** sem rótulos repetidos.
- **Relatórios:** a unidade vai no título do gráfico. O gráfico do Comparativo em "desvio qtd" sai em %.
- **Números:** nenhum muda. Padrão comum em `docs/graficos-padrao.md`.

## 1.9.0 · KKBC_ORD em grade (layout da controladoria) e Desv. empregado (11/11/2026)

Etapa 1 de 3 do alinhamento com a análise da controladoria (Waste Report / Dashboard Scrap FY27). Decisões do usuário:
- uma ordem por arquivo;
- **MUV = Desv. estrutura + Desv. empregado** vira o número oficial do Waste (etapa 2);
- target MUV da linha no Portal (etapa 3);
- linha, tipo de ordem e semana vêm das outras páginas.

Ponto de atenção: o "Scrap" atual (desvio total − estrutura) inclui o **desvio de preço de input**; o MUV da controladoria não inclui. Por isso a base precisa ser reimportada no layout novo. A reimportação substitui a ordem (versão vigente por ordem) e não soma duas vezes.

### O que mudou

**Importação da grade nova** (`isKKBCGrade`, `parseKKBCGrade`, `interpretGrade`). A grade é reconhecida pelas colunas "Grupo de elementos (Texto)" ou "Origem" + "Desvio de qtd.empregada".
- **Ordem:**
  - a coluna Ordem vem vazia; a ordem vem do campo novo **"Ordem (arquivo de uma ordem)"** ou do número no nome do arquivo;
  - sem nenhum dos dois, a prévia pede a ordem.
- **Produto:** a linha sem grupo e com quantidade negativa (entrega) dá o material produzido e a quantidade entregue.
- **Componentes:** vêm da coluna **Material**; a coluna Origem é planta/material.
- **Grupos:** só o grupo Materials vira linha. Labor, Mfg Overhead e Allocated Fixed ficam no resumo da ordem, como na lista do SAP.
- **Linhas descartadas:** as linhas "Elemento de custo (Texto) …" são subtotais; as linhas sem Origem são totais ou continuações em outras unidades.

**Campos novos (opcionais)**, com aliases no `DEFAULT_ALIAS`:
- `dEmp`: Desvio de qtd.empregada;
- `dPreco`: Desvio de preço de input;
- `dQtd`: Desvio qtd.teórico/real;
- `grupo`.

Títulos novos aceitos:
- "Custos teór.totais" → custo meta;
- "Total custos reais" → custo real;
- "Desvio teórico/real" → desvio total;
- "Unid.de medida da qtd.produz." → unidade.

**Outros ajustes**
- `aliasIndex` passa a somar os nomes do padrão. Uma base que guardou a lista de nomes antes desta versão reconhece os títulos novos.
- A conversão de moeda (`vigRowsAll`) inclui `dEmp` e `dPreco`.
- **Aviso na aba Importar:** "N de M ordens no formato antigo (sem o Desv. de qtd. empregada)". Mostra a quantidade por competência, a lista das ordens e o botão para copiar. Some à medida que as ordens são reimportadas.

### Próximas etapas

- **Etapa 2:** MUV oficial (meta, situação, exports e Portal); indicadores e Paretos do dashboard da controladoria (Linha, SKU, Componente × MUV, Estrutura, Empregado; favorável/desfavorável; Top N).
- **Etapa 3:** target MUV da linha no Portal (vigência, acumulado ou mensal, câmbio do Portal); gráfico MUV × target; filtros por tipo de ordem (COOIS), semana e linha.

**Teste:** `testes/twaste_grade.js`, montado com a estrutura da amostra real descaracterizada.

## 1.10.0 · MUV oficial e Pareto do MUV (11/11/2026, etapa 2 de 3)

O número oficial do Waste passa a ser o **MUV = Desv. estrutura + Desv. empregado**, como na análise da controladoria. O desvio de preço de input fica fora do MUV e aparece à parte. Portal 1.9.26 e o SQDCP da Produção leem o MUV do `exports`.

### Conta
- Por linha da KKBC (sem a linha de entrega): `muvOf(r) = dEst(r) + dEmpOf(r)`. O sinal segue a mesma regra do desvio (`sapInv`).
- **Ordem no formato antigo** (sem `dEmp`): o MUV usa o desvio total da linha, que inclui o preço de input.
  - A ordem fica marcada **"aprox."** no quadro por competência, na ficha e nos indicadores até ser reimportada no layout novo.
  - O aviso da 1.9.0 (aba Importar) lista essas ordens.
- **Ordem** (`aggOrders`): ganha `muv`, `estr`, `emp`, `preco`, `mDesf` (MUV positivo), `mFav` (MUV negativo) e `aprox`.
  - **Criticidade** (`level`), **MUV %**, **R$/milhão** e **prioridade** passam a usar o MUV.
  - `o.d` continua sendo o desvio total (custo real − teórico), mostrado como **"Desv. real × teórico"**.

### Telas
- **Visão Geral › Situação:** "MUV do período" × meta (WASTE-MES do Portal); a pior e a melhor competência são pelo MUV.
- **Indicadores** (nenhum foi retirado; os nomes seguem a controladoria):
  - MUV × meta;
  - Desv. estrutura (o antigo "Var. material");
  - Desv. empregado;
  - Desv. preço de input (fora do MUV);
  - Desv. real × teórico (o antigo "Desvio líquido");
  - Custo teórico e Custo real;
  - MUV % e MUV por milhão;
  - Desfavorável e Favorável (o antigo "Perdas/Ganhos", agora pelo MUV);
  - Ordens, Críticas/altas sem causa, Acumulado no FY (MUV) e Ações vencidas.
  - O antigo "Scrap" (desvio total − estrutura) incluía o preço de input. Ele virou Desv. empregado + Desv. preço de input.
- **Quadro por competência:** Desv. estrutura, Desv. empregado, MUV, Desv. preço input, Desv. real × teórico, MUV %, MUV R$/milhão e meta (pelo MUV).
- **Tendência mensal do MUV** e **Paretos** por componente, catálogo e causa: pelo MUV.
- **Pareto do MUV (novo, grupo B):**
  - dimensão: Linha (catálogo → linha do cadastro do Portal), SKU (catálogo) ou Componente;
  - métrica: MUV, Desv. estrutura ou Desv. empregado;
  - sentido: Desfavorável (positivo) ou Favorável (negativo; barras verdes);
  - Top 5, 10 ou 20;
  - o total e o % acumulado são do sentido escolhido;
  - clicar em SKU ou Componente filtra;
  - a escolha fica neste computador (`vac.waste.pareto`).
- **Tabelas:**
  - Ordens: Custo teórico, Custo real, Desv. estrutura, Desv. empregado, MUV, Desv. real × teórico, MUV % e MUV R$/milhão;
  - Componentes: Desv. qtde, Desv. estrutura, Desv. empregado, MUV e Desv. real × teórico;
  - Prioridades: só ordens com MUV desfavorável.
- **Ficha da ordem:** MUV (estrutura + empregado), Desv. preço de input, Custo teórico, Desv. real × teórico e MUV %.
- **Relatórios** (mensal, por tipo de ordem, TV): MUV, estrutura, empregado, preço de input e desvio total. A tendência e as tabelas são pelo MUV.
- **Modo de teste:** os dados fictícios vêm no formato da grade (`dEstr` 0, `dEmp` = desvio). O MUV e o desvio total ficam iguais, e por isso a referência da Visão Geral confere os mesmos números com os nomes novos.

### Exports (aditivo, `exportsVersion` 1)
- **`oficial: 'muv'`.**
- **`porMes[]`:** ganha `muv`, `estrutura`, `empregado`, `precoInput`, `muvDesfavoravel`, `muvFavoravel`, `ordensAprox` e `meta`. Os campos antigos (`liquido`, `perda`, `ganho`…) continuam.
- **`porOrdem[]`:** ganha `muv`, `estrutura`, `empregado`, `precoInput` e `muvAprox`.
- **`porComponenteMes[]`:** ganha `muv`, `estrutura` e `empregado`.
- **Pendência "sem causa":** mostra o MUV.

### Quem lê
- **Portal 1.9.26:**
  - o cartão do Waste, o período e a Reunião diária mostram o **MUV** quando o `exports` tem `muv`; com o exports de um Waste antigo, mostram o Desvio líquido;
  - Desfavorável/Favorável no lugar de Perdas/Ganhos.
- **SQDCP (Produção 2.4.56):** posição "Waste — MUV da competência", que lê `muv` (ou `liquido` num exports antigo).

### Atenção na implantação
- **A meta WASTE-MES do Portal** era comparada com o desvio total e agora é comparada com o MUV. Se a meta foi definida sobre o desvio total, revisar o valor no Portal (Metas da área).
- **Reimportar as ordens no formato antigo** (lista na aba Importar) para que o MUV delas deixe de ser aproximado.

### Testes
- **`twaste_vg.js`:** MUV = estrutura + empregado; Desv. real × teórico igual ao Desvio líquido de antes; Pareto do MUV (dimensão, Top N, métrica, favorável, escolha lembrada). A referência foi gravada de novo com os nomes novos.
- **`twaste_grade.js`:** a ordem da grade real descaracterizada dá MUV = −4.723,20 (estrutura 137,11 + empregado −4.860,31). `exports.porOrdem` e `porMes` trazem o MUV, e o preço de input fica fora.

### Próxima etapa (3)
- Target MUV da linha no Portal (vigência, acumulado ou mensal, câmbio do Portal) e gráfico MUV × target.
- Filtros por tipo de ordem (COOIS), semana e linha.

## 1.11.0 · Target MUV da linha, MUV × target e filtros (11/11/2026, etapa 3 de 3)

### Target no Portal (sem tipo novo no cadastro)
- **Onde cadastrar:** Portal › Cadastros › Metas da área, um item por linha com o código **`WASTE-MUV-<linha>`** (ex.: `WASTE-MUV-VAC`), página Waste e o campo **Linha** preenchido. Valem as regras de sempre: vigência imutável e desativação.
- **Período:**
  - mês: o valor do mês;
  - ano: ÷ 12 (target anual vira 1/12 por mês; o acumulado do FY soma os meses);
  - trimestre: ÷ 3;
  - semana e dia: pelos dias do mês.
- **Duas vigências no mês:** média ponderada pelos dias (`vacMetaAreaMes`).
- **Unidade R$ ou US$:** convertida para a moeda da tela pela **cotação do Portal no fim do mês** (`cotUSD`), a mesma dos valores.
  - Sem cotação, a meta daquela linha fica de fora e a nota avisa.
- **Meta do mês** (`metaMesInfo`):
  - soma dos targets das linhas;
  - com o filtro de uma linha, só o target dela;
  - sem nenhum `WASTE-MUV` no Portal, vale a `WASTE-MES` de antes (área inteira; com uma linha escolhida, fica sem meta).
  - A nota da meta lista as linhas.

### Telas
- **Filtros novos:**
  - **Linha**: catálogo → linha do cadastro (`linhaDe`; "Sem linha no cadastro" quando falta);
  - **Semana**: semana ISO em que a ordem começou a produzir, pela Produção (`oeeQuick(ordem).ini`). A KKBC é mensal: a semana só escolhe as ordens. Sem as datas da Produção, o seletor fica desligado.
  - O **Tipo de ordem** (COOIS) já existia.
  - Cada filtro aparece como pílula, e o Limpar tira todos.
- **"MUV × target acumulado no FY" (grupo A):**
  - barras com o MUV acumulado do ano fiscal até cada mês (com os filtros);
  - traço com o target acumulado;
  - vermelho = acumulado acima do target;
  - clicar na barra filtra o mês.
- **Situação, quadro por competência, tendência e relatórios:** usam a mesma meta (target MUV).
- **Guia da aba (UX-02):** ganhou Linha, Semana, MUV × target e Pareto do MUV.

### Exports
- **`porMes[].meta`:** sempre o target **total** em R$, sem o filtro de linha nem de semana da tela, com `metaFonte` (`portal-muv`, `portal` ou `local`).
- **Portal 1.9.27:**
  - o cartão do Waste mostra "target R$ …" e colore pelo target;
  - a Reunião diária usa a meta do `exports` (regra 1), com a `WASTE-MES` como reserva;
  - a ajuda dos campos da meta explica o `WASTE-MUV-<linha>`, o US$ e o período anual.

### Teste
`testes/twaste_target.js` confere:
- duas linhas, uma em R$/mês e outra em US$/ano com cotação 5: meta = 20.000 + 120.000 ÷ 12 × 5 = 70.000;
- com o filtro de uma linha, só o target dela; vendo em US$, 14.000;
- o filtro de linha separa as ordens e o MUV soma;
- o gráfico do acumulado;
- o `exports` com a meta total e o filtro da tela preservado;
- a volta para a `WASTE-MES`;
- a semana ISO (inclusive a virada do ano);
- o filtro de semana.

### Atenção na implantação
Cadastrar o target de cada linha no Portal. Se a `WASTE-MES` continuar ativa, ela deixa de valer assim que existir um `WASTE-MUV`: desativar para não confundir.

## 1.12.0 · Paretos da controladoria e Design System (12/11/2026)

Pedido do usuário: trazer para o Waste os gráficos do dashboard de desvios da controladoria (`Dashboard_Scrap_Demonstracao`).

**O que entrou.** Visão Geral › 04 Análises › grupo **D · Paretos da controladoria**: nove gráficos, Linha, SKU e Componente × MUV, Desv. estrutura e Desv. empregado.
- Barras verticais com a soma **líquida** de cada item: desfavorável (positivo, vermelho) e favorável (negativo, verde) no mesmo gráfico, do mais desfavorável ao mais favorável.
- Top N (10, 15, 20, 30) pelos maiores impactos absolutos; linha azul com o % acumulado do impacto absoluto e a marca de 80%; barras mais claras ficam fora dos itens que somam 80%.
- Exibir: todos, só desfavoráveis ou só favoráveis.
- Clique na barra filtra a linha, o SKU ou o componente; segundo clique tira o filtro; a barra filtrada ganha contorno âmbar.
- Abaixo de cada gráfico: saldo líquido, total desfavorável, total favorável e a frase do maior impacto desfavorável (vale para a impressão).
- Cada gráfico pode mudar de largura e de ordem (grade do Design System).

**Contas.** Nenhuma nova: os valores são os mesmos do "Pareto do MUV" da 1.10.0 (`muvOf`, `dEst`, `dEmpOf` por componente; `muv`, `estr`, `emp` por ordem), só que sem separar o sinal antes de somar. Escolhas em `vac.waste.paretov`, por computador.

**O que já existia e continua.** A evolução mensal do dashboard corresponde aos gráficos "Tendência mensal do MUV" e "MUV × target acumulado no FY" (grupo A, 1.11.0), com o target vindo do Portal. A troca de moeda é a da página (BRL/USD pelo câmbio do Portal), não uma taxa digitada.

**Teste:** `testes/tds.js`.

## 1.12.7 · Pareto comum do kit (13/11/2026)

O Pareto do MUV e os da Visão Geral (por componente, por catálogo, por causa) passam de tabela com barras para o desenho comum do kit (`vacPareto.barras`): barras horizontais com valor, % acumulado e clique para filtrar (data-fk/data-fv, como antes); o subtítulo do item (descrição) vai para a dica. O Pareto vertical da controladoria mantém o desenho homologado e usa a conta comum (`vacPareto.calc`) para marcar quem soma 80 %. Números iguais à referência gravada antes (`twaste_vg`: rótulo | valor | % acumulado).

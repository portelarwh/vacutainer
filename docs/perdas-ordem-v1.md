
## 9. Perdas por ordem · v1 de 31/10/2026

- **Página** `Perdas-Ordem.html` + `perdas-base.json`, mesmo padrão das outras (pasta da rede, cache no navegador, backup diário em `00. Backups/`, conflito por `rev`). Subpastas próprias: `00. Originais SAP/` (cópia do que foi importado) e `00. Entrada KKBC/` (arquivos a importar; vão para `Processados/` depois).
- **Fonte principal: KKBC_ORD**, colada ou em arquivo (.xlsx/.csv/.txt, inclusive lista ALV com `|`). Colunas reconhecidas pelo nome (português ou inglês); a escolha feita na prévia fica guardada. Números BR com sinal no fim (`1.234,56-`) tratados. Linhas de total/subtotal e cabeçalhos repetidos são ignorados; ordem em branco (agrupamento do SAP) herda a de cima.
- **Desvio = custo real − custo meta** (positivo = perda). O desvio do SAP fica guardado e serve de conferência (aviso de sinal invertido).
- **Versão vigente por ordem** (KKBC acumulada): reimportar a ordem substitui a versão anterior, que fica no histórico; desfazer uma importação restaura a anterior. Opção "por ordem e mês" na configuração.
- Linha de entrega (componente = produto da ordem) entra no desvio, mas fica fora do custo de consumo, do Pareto e dos outliers.
- Criticidade: R$ (500 / 1.000 / 5.000) e % (5 / 10 / 20, só com custo meta ≥ R$ 500), configuráveis. Outlier por componente: IQR (≥ 8 ordens) e z robusto (≥ 10). Recorrente: nível alto em 3+ ordens nos 2 últimos meses ou 3 meses seguidos. Prioridade 0–100.
- Comentários com causa/subcausa (exclusão lógica, histórico de edição), ações, fechamento mensal com versão e reabertura com motivo.
- **`exports` (exportsVersion 1)**: `porOrdem` (ordem, mês, catálogo, lote, custos de consumo, desvio, perda, nível, causa, comentários, ações abertas), `porMes`, `porComponenteMes`.
- Próximas fases: COOIS (status e datas), cruzamento com `exports` do OEE e do Gel, MB51, saving.

## v1.1 · 31/10/2026 (formato real da KKBC_ORD)

- **Entrada principal: "Saída dinâmica de lista"** da KKBC_ORD, como sai na área de transferência ou em .txt/Excel. Cabeçalho por ordem (Ordem + NS/catálogo, Material, Quantidade planejada, Quantidade real) e tabela `Origem | Material (Texto) | CstsTeórTo | Tot.cstsRe | Desvio | DvCsT/C(%) | Desv.estr. | Desvio | Qtd.teór. | Qtd.real | DsvQtd.T/R`. Aceita várias ordens coladas de uma vez.
- **Só o grupo `* Materials Materials` entra na análise** (configurável em "Grupos de custo usados"). Os itens de cada grupo são os que vêm antes da linha de subtotal `|*`. Linha do produto, Labor Activity, Mfg Overhead e Allocated Fixed Ovhd ficam só como resumo no detalhe da ordem. Conferido: a soma dos materiais bate com o subtotal do SAP.
- Desvio separado em **efeito quantidade** = (qtd real − qtd teórica) × custo unitário teórico e **efeito preço/custo** = desvio − efeito quantidade.
- **Resumo no painel** (v1.4, definido por Pedro): **VAR. MATERIAL = desvio de estrutura** (coluna Desv.estr. da KKBC_ORD); **SCRAP = desvio total − desvio de estrutura**; TOTAL = desvio real − meta. Efeito quantidade × preço continua no detalhe da ordem e nos comparativos como análise extra.
- Destaque nas tabelas: atenção/alta = fonte vermelha; crítica = linha vermelha com fonte branca.
- Valores dos cards com centavos por padrão; cada pessoa pode desligar em Configuração.

## v1.2–1.3 · 31/10/2026

- **OEE (somente leitura)**: lê `oee-vacutainer-base.json` da mesma pasta. Procura a ordem pelo nome do campo (ordem/order/op/wo) no `exports` e, se não achar, nas ordens do Plano do mês; depois procura o lote da ordem (lotes do servidor, classificação, dias). O detalhe da ordem mostra catálogo, lote, quantidade, início/fim previstos e reais e todos os registros encontrados. Catálogo e lote vazios na KKBC são completados pelo OEE. "Abrir no OEE" vai para `#dia=` do início real.
- **Aba Comparativos**: comparar por catálogo, família, tipo de item, mês ou semana. Medidas: R$ de desvio por milhão de tubos (padrão), desvio de quantidade %, desvio R$, efeito preço por milhão. Ranking com mediana por ordem, faixa P25–P75, % de ordens fora do ideal e "acima do conjunto em X de Y meses" (consistência). Gráfico ordem a ordem (pontos), matriz tipo de item × catálogo e lista de ordens do grupo/célula.
- **Semana** = data real da ordem no OEE (fim real, ou início); sem OEE fica "sem data".
- **Tipo de item** por palavras na descrição (Configuração › Tipos de item), padrão: Rolha, Tampa, Tubo PET, Etiqueta do tubo/bandeja/caixa, Bandeja, Caixa, Filme, Fita, IFU/folheto, Aditivo. Família pela descrição do produto (EDTA, SST…) até ler o cadastro mestre.

## v1.5 · 31/10/2026 (padrão visual e ligações)

- **Visual igual ao OEE e ao Gel**: mesmos tokens de cor (tema claro/escuro/automático), fontes Barlow / Barlow Condensed / IBM Plex Mono, barra superior branca com título em caixa alta + subtítulo + versão, status em pílulas, abas em caixa alta, KPIs, tabelas e filtros no mesmo formato.
- **Logo**: `Logo.png` na pasta (prioridade) ou imagem enviada em Configuração (guardada reduzida na base), ao lado do título, igual ao OEE.
- **Barra "Sistemas"** no topo: links para Portal, OEE, Gel, Perdas e Manutenção; com a pasta conectada, só aparecem os HTML que existem nela.
- **Gel (somente leitura)**: lê `fifo-base.json`; o detalhe da ordem ganha o quadro "No Gel" (lote, consumo e scrap de gel, barris LP com link `Gestao-Gel.html#lp=`). Pílulas OEE/Gel no topo mostram se cada base foi lida.
- Pendente nas outras páginas: OEE e Gel abrirem `Perdas-Ordem.html#ordem=` ao clicar numa ordem, e aceitarem `#ordem=` no próprio endereço.

## v1.7 · 02/11/2026 (kit cabeçalho comum v1 e backups por módulo)

- Topo trocado pelo bloco `vac-cabecalho v1`: faixa escura comum (logo, Sistemas · Linha Vacutainer, Portal · OEE · Gel · Perdas · Cadastros na mesma aba, busca Ctrl K, usuário, tema), faixa branca da página (PERDAS · Perdas por ordem · v1.7 → `Portal.html#versoes`, pílulas, Sincronizar · Backup · TV) e as mesmas abas. Acabamento V1.90 aplicado.
- `PAGE = {id:'perdas', tituloCurto:'Perdas', subtitulo:'Perdas por ordem', versao:'1.7', baseFile, backupDir:'00. Backups/Perdas', busca}`; `appVersion` gravado na base.
- Sistemas no formato do kit (pasta única, link só com o nome do arquivo; Gel = `Gestão-Gel-Vacutainer.html`, aceitando os nomes antigos).
- Ctrl K (`PAGE.busca`): catálogos, ordens (ordem, lote, catálogo, descrição) e ações.
- Pílulas: base/rev ou gravação pendente, OEE e Gel lidos, Última KKBC (vermelha após 35 dias).
- Backups só em `00. Backups/Perdas` (diário `perdas-base_AAAA-MM-DD`, botão `…_HHhMM`, `…_antes-restaurar_…`); Configuração › Backups lista os da pasta nova e os antigos de `00. Backups/` com o selo "local antigo", com Baixar e Restaurar.
- Endereço também abre `#aba=…` e `#tv` depois de carregada; celular 390 px sem rolagem lateral.

## v1.7.1 · 03/11/2026 (segundo layout da KKBC_ORD)

- A linha de títulos da lista pode começar por **Origem** (layout antigo) ou por **Material** (layout novo: `Material | Material (Texto) | Qtd.teór. | Qtd.total plan. | Qtd.real | CstsTeórTo | Tot.cstsRe | Desvio`); exige uma coluna de custo. A 1ª coluna é sempre o componente. `Qtd.total plan.` é ignorada.
- Lista sem linhas de grupo com nome (`* Materials…`): entram todos os itens da ordem, menos a linha do produto e as atividades (`40175100/PRODUN`…); a prévia avisa.
- Sem a coluna `Desv.estr.`, a prévia avisa que a VAR. MATERIAL fica zerada (todo o desvio vira SCRAP).

## v1.7.2–1.7.3 · 03/11/2026

- **Centavos nas tabelas** (preferência de cada pessoa, `perdas.centsTab`): botão **R$ ,00** em cima da tabela do Painel e dos Comparativos e em Configuração; vale para todas as tabelas e listas (padrão: sem centavos). Os cards seguem a preferência própria; o detalhe da ordem continua sempre com centavos.
- **Nova ação**: Ordem, Componente, Responsável e Área com lista do que já existe na base (ordens com catálogo/mês/desvio; componentes da ordem escolhida, ou todos; responsáveis e áreas já usados), aceitando digitar livre.
- Detalhe da ordem mais largo (até 1.720 px / 98 % da tela) e tabela de componentes sem rolagem interna.

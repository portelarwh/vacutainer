# Configurações: inventário comparado com as nove páginas antigas

Etapa 0 do desenho [Administração central](superpowers/specs/2026-11-23-administracao-central-design.md). Data do levantamento: 23/11/2026, plataforma 1.9.x. Inventário histórico anterior à incorporação do bloco 1 pela [PR #148](https://github.com/portelarwh/vacutainer/pull/148). Para o contrato vigente, consulte [CONTRATO-MOTORES](CONTRATO-MOTORES.md). O estado de homologação está em [PENDENCIAS](../PENDENCIAS.md).

Este documento lista **tudo o que hoje é configuração ou cadastro**, onde fica, quantas cópias existem, quem lê, o que se perdeu ou foi resumido em relação às páginas antigas e para onde vai no formato v2. As etapas 1 a 8 seguem esta tabela.

## Como ler

- **Páginas antigas**: a última versão antes da junção (`a2214fd^`, 15/11/2026): Produção (`OEE-Vacutainer.html`), Gestão de Gel, Waste (`Perdas-Ordem.html`), Paradas, Equipamentos, Iniciativas, Linha 360°, Projetos e Portal. Para o Gel vale também a versão de 13/11/2026 (`2161e02`, citada como "Gel 13/11"); nas telas de configuração as duas versões são iguais. O script `scripts/inventario-paginas-antigas.mjs <pasta>` extrai as dez páginas do Git para a comparação.
- **Onde está hoje**: `bloco · tela · campo`. Blocos: `portal` (Administração), `oee` (Produção), `gel`, `perdas` (Waste), `paradas`, `equip`, `inic`, `linha`, `projetos`, `comum/bases`, `comum/interface`.
- **Cópias hoje**: outros lugares onde o mesmo dado está guardado ou recalculado.
- **Perdido ou resumido?**: "Não" quando a tela atual tem o mesmo detalhe da antiga. "Resumido" quando a tela existe mas mostra menos. "Perdido" quando o campo, a tela ou o cálculo visível sumiu. "Duplicado" quando o dado tem dois donos.
- **Destino v2**: assunto da Administração (os oito do desenho) e a seção. "Fica na página" é o que se lança ou planeja no dia a dia (regra 8 do desenho). "Preferência" é ajuste de tela por usuário ou computador, que não é cadastro. "Sai" é o que deixa de existir.
- Nomes exatos dos campos v2 ficam para quem constrói. Aqui só o assunto e a seção.

### Os oito assuntos

1. Planta e linha · 2. Produto · 3. Gel · 4. Equipamentos · 5. Turnos e metas · 6. Paradas e perdas · 7. Pessoas e acesso · 8. Sistema.

### Regra usada para separar configuração de dado do dia a dia

Vai para a Administração o que **define** como a linha funciona (cadastros, vigências, parâmetros, metas-padrão, motivos, calendário, regras de cálculo). Fica na página dona o que se **lança ou planeja** (plano do mês, ordens, programação de barris, abastecimento e estoque do gel, lançamentos, ações, ordens de serviço, checklists feitos). Preferência de tela (abas, tema, TV, filtros salvos) não é cadastro e não vai para a Administração.

---

## Achados principais (leia primeiro)

1. **Gel do Tubo 100: 0,936 g na página antiga, 0,834 g hoje.** No código das duas versões o padrão é o mesmo: `GEL_FMT_DEF` (motor/portal) e `FMT_DEF` (Gel 13/11 e 15/11) trazem gel 0,834 g nos formatos 100 e 75. O 0,936 g **não aparece em nenhum padrão do código**; só existe como exemplo de texto na ajuda de "Economia na dosagem" (meta 0,940, dosagem 0,936). Logo, o 0,936 que o responsável viu é **dado gravado na base dele** (`config.fmts` do Gel). Hoje, sem vigência de formato salva em `parametros.gel.formatos`, o Gel e a Produção usam o padrão 0,834 sem avisar. A importação das bases atuais precisa trazer esse valor, e o padrão embutido deve sair (sem vigência, mostrar "formato não cadastrado", nunca um número inventado).
2. **`vacCad()` está definida nove vezes** (portal, oee, gel, perdas, paradas, equip, inic, linha, projetos), todas lendo `Cad.D` ou `localStorage['vac.cadastros']`. Existem também leitores parciais já compartilhados em `comum/interface`: `vacParam`, `vacTurnosEm`, `vacPrecoEm`, `vacCambio`, `vacMetaArea`, `vacMetaAreaMes`, `vacConsultaCad`, mas nenhum motor usa `vacParam`. O leitor único da etapa 1 substitui os nove e os parciais.
3. **O Gel guarda cópia de cadastro em `S.config` e `S.catalogs`**: `fmts`, `params`, `motivos` (cópia de `parametros.gel`), `equips[].tara/descs` (cópia de `equipamentos[].gel`), `S.catalogs[].vig/fmt/lotSize/rateH` (cópia de `catalogos[].gel`), `prices`, `shifts`, `abDefault`, `abMotivos`. `GelCad.aplicarGel` copia do Portal só quando o Portal tem dado; senão o valor antigo do Gel continua valendo (fonte dupla silenciosa).
4. **A Produção copia o cadastro inteiro** para a própria base (`CadSync`: linhas, famílias, máquinas, catálogos, turnos, metas, tipos de parada, calendário e parâmetros). Alguns itens **não** são sincronizados e divergem: `unitName`, `sector`, `timezone`, `calendar`, `coverageMin`, `divergenceMax`, `perfMode`, `speedLossPremise`, `planWorkdays`.
5. **Telas sem editor hoje (valor só lido):** "Ritmo" do Gel (`S.config.pcpParams`: meta sem histórico 900 000, capacidade nominal 1 200 000, dias na média 10, velocidade máxima 72 000 tubos/h, meta de OEE), "Indicador relativo de scrap" (`S.config.scrapBase`, kg a cada N mil tubos), abonos padrão por dia da semana do Gel (`abDefault`), ordem dos equipamentos no Registrar scrap. Os valores continuam sendo lidos; a tela de edição saiu com a migração do Gel (CFG-ADM) e não foi recriada na Administração.
6. **Composições do Gel sumiram como tela.** No Gel 13/11, a tela "Formatos de tubo" mostrava as composições calculadas (Tubo completo, Tubo + gel, Tubo + gel + spray) em gramas, por formato, a partir dos componentes. A Administração (`parGelHtml`) mostra só a tabela de componentes e o ficha do equipamento mostra os componentes por formato; a soma de cada composição não aparece em lugar nenhum.
7. **Código de parada perdeu vigência e descrição.** Na Produção antiga cada tipo de parada tinha "Vigência inicial/final" e "Descrição"; `CAD_T.paradas` não tem `vig:true` nem descrição.
8. **Quatro logos**: Produção (`settings.logo`), Paradas (`config.logo`), Waste (`Logo`), Gel (`S.config.logo`), mais `vac.logo` no navegador e a pasta externa `Marca/`.
9. **Três semáforos e três limites de parada longa.** Semáforo: `parametros.semaforo*`, `settings.semaphore` (Produção) e `semaforoVerdePct/AmareloPct` dentro de cada meta de OEE. Parada longa: `parametros.paradaLongaMin`, `settings.longStopMin` (Produção) e `config.filaMin` (Paradas).

---

## 1. Planta e linha

| Configuração | Página antiga (tela) | Onde está hoje | Cópias hoje | Quem lê | Perdido ou resumido? | Destino v2 |
|---|---|---|---|---|---|---|
| Unidade fabril (nome) | Produção › Config › Estrutura › Unidade e setor | portal · Parâmetros gerais · `parametros.unidade`; oee · `settings.unitName`; `linhas[].unidade` | 3 (Portal, Produção, linha) | relatórios, cabeçalhos | Duplicado: Produção não sincroniza | Planta e linha › Planta |
| Setor | idem | portal · `parametros.setor`; oee · `settings.sector`; `linhas[].setor` | 3 | relatórios | Duplicado | Planta e linha › Planta |
| Fuso horário | Produção › Estrutura › Unidade e setor; linha tinha "Fuso horário" | portal · `parametros.fusoHorario`; oee · `settings.timezone` | 2 | todas as datas | Resumido: fuso por linha não existe mais (só global) | Planta e linha › Planta |
| Calendário aplicável (texto "Segunda a sábado") | Produção › Estrutura › Linhas (campo Calendário aplicável) | oee · `settings.calendar` (sem tela no Portal) | 1 | cabeçalho da Produção | Perdido: não existe em `CAD_T.linhas` | Planta e linha › Calendário (texto vira dias de trabalho) |
| Dias de trabalho do plano do mês | Produção › Plano do mês (padrão 1 a 6) | oee · `settings.planWorkdays` (sem tela de edição) | 1 | Plano do mês | Perdido: só o padrão | Planta e linha › Calendário |
| Linhas (código, nome, unidade, setor) | Produção › Estrutura › Linhas | portal · `CAD_T.linhas`; oee · `db.lines` | CadSync copia para a Produção | todas | Resumido: sem descrição da linha nem fuso | Planta e linha › Linhas |
| Descrição da linha | Produção › Estrutura › Linhas (campo Descrição) | oee · `db.lines[].description` (não sincroniza) | 1 | Produção | Perdido no Portal | Planta e linha › Linhas |
| Calendário de produção: dia sem produção e dia extra | Produção › Plano do mês (marcações locais `db.calendar`) | portal · `CAD_T.calendario` (código = data); oee · `db.calendar` | CadSync copia (origem portal); marca local convive | Produção, Plano do mês | Duplicado: ainda dá para marcar dia no Plano do mês, fora da Administração | Planta e linha › Calendário; Plano do mês só lê |
| Motivos de "sem produção" programado | Produção › Config › Parâmetros (offMotivosProg) | portal · `parametros.motivosSemProducaoProg`; oee · `settings.offMotivosProg` | 2 (CadSync) | Lançamento, Plano | Não | Paradas e perdas › Motivos |
| Motivos de "sem produção" não programado | idem (offMotivosNP) | portal · `parametros.motivosSemProducaoNP`; oee · `settings.offMotivosNP` | 2 | Lançamento, OEE | Não | Paradas e perdas › Motivos |
| Logo da planta | Produção › Estrutura › Logo; Paradas › Config › Logo; Waste › Config › Logo; Gel › Config › Geral › Logo | oee · `settings.logo`; paradas · `config.logo`; perdas · `Logo`; gel · `S.config.logo`; localStorage `vac.logo`; pasta `Marca/` | 4 a 6 | cabeçalhos e PDFs | Duplicado | Sistema › Marca (um só, ver seção 8) |
| Pasta da rede e base de cada página | Todas › Config › Pasta e base | cada motor · tela Base de dados / Pasta | 1 por página | gravação | Não | Fica na página (infraestrutura) |

## 2. Produto

| Configuração | Página antiga (tela) | Onde está hoje | Cópias hoje | Quem lê | Perdido ou resumido? | Destino v2 |
|---|---|---|---|---|---|---|
| Famílias (código, nome, cor) | Produção › Estrutura › Famílias | portal · `CAD_T.familias`; oee · `db.families` | CadSync | Produção, metas, Waste | Não | Produto › Famílias |
| Cor da família | idem | portal · `familias[].cor` | idem | gráficos | Não | Produto › Famílias (uma linha para as cores) |
| Catálogos: código, nome, tipo (tubo/preparação), unidade | Produção › Catálogos; Gel › Catálogos (Número, Descrição) | portal · `CAD_T.catalogos`; oee · `db.catalogs`; gel · `S.catalogs[].num/desc` | 3 | Produção, Gel, Waste | Duplicado | Produto › Catálogos |
| Catálogo: família, linha, formato (texto), volume, aditivo, código SAP, cor | Produção › Catálogos (família, máquina, cor); Gel › Catálogos (cor da pílula) | portal · `catalogos[]`; gel · `S.catalogs[].color`; oee · `catalogs[].color` | 3 (cor em 3 lugares) | idem | Duplicado | Produto › Catálogos |
| Catálogo: "Máquina" (escopo do catálogo) e "Observação" | Produção › Catálogos | oee · `catalogs[].machineId/note` | 1 | Produção | Perdido no Portal | Produto › Catálogos (observação) · máquina some (a meta já escopa por máquina) |
| Catálogo: situação (ativo) e vigência inicial/final | Produção › Catálogos; Gel › Catálogos (Situação) | portal · `catalogos[].ativo`; `vigencias`; gel · `S.catalogs[].active` | 3 | todas | Duplicado | Produto › Catálogos |
| PPH nominal do catálogo (vigência) | Produção › Catálogos (PPH, PPM) | portal · `catalogos[].vigencias[].pphNominal` | CadSync; Gel usa `rateH` (cópia) | OEE, Gel | Duplicado com `gel.rateH` | Produto › Catálogos (vigência) |
| Tubos por caixa e caixas por lote (vigência) | Gel › Catálogos (Tamanho padrão do lote) | portal · `vigencias[].tubosPorCaixa/caixasPorLote`; gel · `S.catalogs[].lotSize` | 2 | Gel, PCP | Duplicado: `gel.lotSize` e caixas × tubos | Produto › Catálogos (vigência) |
| Materiais: código SAP, descrição, unidade, tipo, tipo SAP | Waste › Config › Tipos de item (texto `cfgTipos`) | portal · `CAD_T.materiais`; perdas · `config.tipos` | 2 | Waste, Gel, BOM | Duplicado: Waste mantém lista própria de tipos | Produto › Materiais |
| Tipos de item e causas (texto) | Waste › Config (Tipos de item, Causas) | perdas · `config.tipos`, `config.causas` | 1 | Waste | Não (ver seção 6 para causas) | Produto › Materiais (tipos); Paradas e perdas (causas) |
| BOM (lista técnica) por catálogo, com vigência | Gel › Catálogos (BOM do SAP kg) | portal · `CAD_T.bom` (itens e quantidade por milheiro) | Gel copia BOM em `catalogos[].gel.vig.bomKg` | Produção (ordens), Gel, Waste | Duplicado: BOM de gel em dois lugares | Produto › BOM (gel dentro da BOM) |
| Preço de material (com vigência) | Gel › Config › Preço do gel (US$/kg) | portal · `CAD_T.precos`; gel · `S.config.prices` | Gel lê por `vacPrecoEm`; `S.config.prices` sobra | Gel, Waste | Resumido: sai a cotação digitada no Gel | Produto › Preços |
| Câmbio (cotação com vigência) | Gel › Preço do gel (Cotação do dólar) | portal · `CAD_T.cambio` | `vacCambio` | Gel, Waste | Não | Produto › Preços (ou Sistema; ver Decisões) |
| Gel aplicado por catálogo (g/tubo) | Gel › Catálogos › Gel e BOM (Gel aplicado hoje, valor próprio) | portal · `catalogos[].gel.vig[].gTubo`; gel · `S.catalogs[].vig` | 2 | Gel, Produção (scrap) | Resumido: perdeu "valor próprio" × do formato | Produto › Gel do produto |
| BOM do SAP em kg, base e tolerância % | idem | portal · `gel.vig[].bomKg/bomBase/tol` | 2 | Gel (índice), Produção | Resumido: perdeu "BOM (índice)", "Meta (100)" e "Índice" calculados na tela | Produto › Gel do produto |
| Formato do tubo do catálogo (100 ou 75) | Gel › Catálogos (Formato do tubo) | portal · `catalogos[].gel.fmt` e `catalogos[].formato` (texto livre) | `GelCad.fmt` adivinha pelo texto | Gel, Produção | Duplicado: dois campos para o mesmo dado | Produto › Catálogos (um só) |
| Tamanho do lote e velocidade (tubos/h) do Gel | Gel › Catálogos | portal · `gel.lotSize`, `gel.rateH` | duplicam `tubosPorCaixa × caixasPorLote` e `pphNominal` | Gel (plano) | Duplicado | Produto › Catálogos (usa só os campos de vigência) |
| Preparação de aditivo ligada à BOM (onde é usada) | (não existia) | portal · catálogo tipo `preparacao` + BOM | — | Portal | Não | Produto › BOM |
| Metas por família ou catálogo | ver seção 5 | | | | | |

## 3. Gel

Cadeia que o responsável quer numa tela só: **formato com vigência → composições → equipamentos / locais de descarte → scrap**.

| Configuração | Página antiga (tela) | Onde está hoje | Cópias hoje | Quem lê | Perdido ou resumido? | Destino v2 |
|---|---|---|---|---|---|---|
| Formato do tubo: vigência (a partir de) | Gel 13/11 › Config › Formatos de tubo (Nova vigência, Vale a partir de) | portal · Parâmetros › Gestão de Gel › Formatos de tubo · `parametros.gel.formatos[].from`; gel · `S.config.fmts` | 2 (cópia no Gel) | Gel, Produção (scrap, Teórico × Real) | Não | Gel › Formatos |
| Peso do saco (embalagem de pesagem, g) | idem (Peso da embalagem de pesagem) | portal · `formatos[].tara`; `GEL_FMT_DEF.tara` = 75 | 2 | Registrar scrap | Não | Gel › Formatos |
| Folha plástica da purga (g) | idem | portal · `formatos[].taraP` (padrão 5) | 2 | scrap de purga | Não | Gel › Formatos |
| Sobra padrão de gel por barril (kg) | idem | portal · `formatos[].sobra` | 2 | composição Barril | Não | Gel › Formatos |
| Componentes por formato: tubo vazio, gel, aditivo/spray, tampa + rolha (g), Tubo 100 e Tubo 75 | idem (tabela Componente × Tubo 100 × Tubo 75) | portal · `formatos[].f['100'/'75'].tubo/gel/adit/tr`; gel · `S.config.fmts` | 2 | Gel, Produção | Não nos campos. **Valor: 0,936 g (antiga) × 0,834 g (padrão atual)** | Gel › Formatos |
| Padrão embutido do formato | Gel `FMT_DEF` | portal · `GEL_FMT_DEF`; gel · `FMT_DEF`; Gel `PROC_DEF` | 3 (portal, gel, ficha) | quando não há vigência | Duplicado: padrão 0,834 mascara dado ausente | Sai (sem vigência = aviso) |
| Etiqueta contada em unidades (não pesa) | Formatos de tubo (nota) | texto em `COMPS.completo` | — | explicação | Resumido: nota sumiu | Gel › Composições (texto de ajuda) |
| Composição: Tubo completo (tubo + tampa + rolha + etiqueta + gel + aditivo) | Formatos de tubo (tabela Composição × Tubo 100 × Tubo 75, soma em g) | portal · `GEL_COMPS` (só rótulo); gel · `COMPS` (rótulo e partes) | 2 (rótulos duplicados) | descartes e Registrar scrap | **Perdido: a soma em gramas por formato não aparece** | Gel › Composições (calculadas, visíveis) |
| Composição: Tubo + gel | idem | idem | 2 | idem | Perdido (soma) | Gel › Composições |
| Composição: Tubo + gel + spray | idem | idem | 2 | idem | Perdido (soma) | Gel › Composições |
| Composição: Gel puro (purga, barril) | idem | idem | 2 | idem | Perdido (soma) | Gel › Composições |
| Composição: Barril (barris × sobra padrão) | idem | idem | 2 | idem | Perdido (soma) | Gel › Composições |
| Categoria de scrap (Tubos, Barril, Purga) | Equipamentos da linha (Categoria do scrap de gel) | portal · `GEL_SCAT`; gel · `SCAT` | 2 | scrap, relatórios | Duplicado (constante em dois blocos) | Gel › Composições (lista fixa única) |
| Perda em tubos, barril e purga (% do gel) e gel/tubo padrão | Gel 13/11 › Config › Parâmetros de processo (Nova vigência) | portal · `parametros.gel.processo[].g/pT/pB/pP`; gel · `S.config.params` | 2 | teórico do Gel, Produção | Resumido | Gel › Perdas teóricas |
| Calculadora da perda: scrap no período, tubos bons, divisão tubos/barril/purga, perda total | idem (Scrap de gel no período, Tubos bons, Divisão %) | (não existe) | — | ajuda a preencher | **Perdido** | Gel › Perdas teóricas (calculadora) |
| Registrado por, em cada vigência de processo | idem | portal · auditoria genérica | — | auditoria | Resumido | Gel › Perdas teóricas |
| Gel lido da Produção a partir de (corte) | (não existia na antiga) | portal · `parametros.gel.registroPelaProducaoDesde` | 1 | Gel (`GelProd.corte`) | Não | Gel › Origem do scrap |
| Motivos de descarte do gel (nome, vale para quais composições, ativo) | Gel › Config › Motivos de descarte | portal · `parametros.gel.motivos[]` (id, name, comps, active); gel · `S.config.motivos` | 2 | Registrar scrap, relatórios | Resumido: sem editar/excluir com o alerta "(motivo excluído)" | Gel › Motivos |
| Locais de descarte por equipamento: local, composição, categoria, motivos aceitos | Gel › Equipamentos da linha (Descarte: como é contabilizado; Categoria; Motivos que aparecem) | portal · Equipamentos ficha · `equipamentos[].gel.descs[]`; gel · `S.config.equips[].descs` | 2 | Registrar scrap (Produção e Gel) | Resumido: local do descarte novo (1.8.59) | Gel › Locais de descarte |
| Embalagem própria do equipamento (g) | Gel › Equipamentos da linha (Peso da embalagem própria) | portal · `equipamentos[].gel.tara`; gel · `S.config.equips[].tara` | 2 | Registrar scrap | Não | Gel › Locais de descarte |
| Equipamento do Gel ligado ao equipamento do cadastro (código) | Gel › Equipamentos (Equipamento do Portal) | gel · `S.config.equips[].portal` | 1 | Gel | Duplicado: Gel ainda guarda `name`, `active` | Gel › Locais de descarte (só o código) |
| Ordem dos equipamentos no Registrar scrap | Gel › Equipamentos (arrastar ⠿ ou ↑ ↓) | gel · ordem do array `S.config.equips` (ordem de entrada) | 1 | Registrar scrap | **Perdido: sem tela para ordenar** | Gel › Locais de descarte (ordem) |
| Indicador relativo de scrap (kg a cada N mil tubos, padrão 100) | Gel › Equipamentos (Indicador relativo de scrap) | gel · `S.config.scrapBase` (lido por `relK`, sem editor) | 1 | relatórios do Gel | **Perdido: sem tela** | Gel › Indicadores |
| Ritmo: meta sem histórico (900 000/dia), capacidade nominal (1 200 000/dia), dias na média (10), velocidade máxima (72 000 tubos/h), meta de OEE | Gel › Config › Turnos e ritmo (Salvar ritmo) | gel · `S.config.pcpParams` (lido por `pcpPar`, sem editor) | 1 | projeção e plano do Gel | **Perdido: sem tela** | Turnos e metas › Ritmo (ver Decisões) |
| Turnos do Gel (vigência, dias, turnos, pausa fixa) | Gel › Config › Turnos e ritmo | portal · `CAD_T.turnos` (`vacTurnosEm`); gel · `S.config.shifts`, `DEF_SHIFT` | 2 | Gel (horas planejadas) | Duplicado: cópia só usada sem cadastro | Turnos e metas › Turnos |
| Abono padrão por dia da semana e motivos de abono do Gel | Gel › Turnos e ritmo › Abonos | portal · pausas sem horário em `turnos[].vigencias[].pausas`; gel · `S.config.abDefault`, `abMotivos` | 2 | Gel | Perdido a tela; vem da pausa do turno | Turnos e metas › Turnos (pausas) |
| Preço do gel (US$/kg) e cotação | Gel › Config › Preço do gel | portal · `precos` + `cambio`; gel · `S.config.prices` | 2 | custo do gel | Duplicado | Produto › Preços |
| Gel por catálogo (aplicado, BOM, tolerância, formato, lote, velocidade) | Gel › Catálogos | ver seção 2 | | | | Produto › Gel do produto |
| Programação: modo da fila (plano ou apontamento) | Gel › Config › Programação | gel · `S.config.fifoMode` | 1 | HOJE, TV, fichas | Não | Gel › Regras do estoque (ver Decisões) |
| Programação: barris por dia típico e máximo | idem | gel · `S.config.typicalPerDay`, `maxPerDay` | 1 | plano | Não | Gel › Regras do estoque |
| Cabeçotes da máquina e barris por cabeçote | idem | gel · `S.config.lineHeads`, `barrelsPerHead` | 1 | auditoria de cabeçotes | Não | Gel › Regras do estoque |
| Usar catálogos na programação | idem | gel · `S.config.useCatalog` | 1 | plano | Não | Gel › Regras do estoque |
| Gel remanescente padrão (kg), tolerância remanescente × SAP, medição confiável desde | idem (Fim do barril) | gel · `S.config.remKg`, `remTol`, `sapFrom` | 1 | baixa de barril | Não | Gel › Regras do estoque |
| Bomba: kg por cm, altura útil do barril, medição desatualizada após (h) | idem | gel · `S.config.kgPerCm`, `drumH`, `measStaleH` | 1 | estimativa de barril | Não | Gel › Regras do estoque |
| Vencimento crítico, atenção, lotes em "Próximos", janela do consumo, alerta de Hold | Gel › Config › Geral | gel · `S.config.critDays`, `warnDays`, `nextBatches`, `rateWindow`, `holdAlertDays`; portal · `config.avisoDias` (aviso do Portal) | 2 (Gel e Portal têm "dias de aviso") | alertas | Duplicado: aviso de gel vencendo no Portal × Gel | Gel › Regras do estoque (um só) |
| Locais do SAP: tipo (etapa 1 a 6, alerta, fora do fluxo), zona, locais criados à mão | Gel › Config › Locais | gel · `S.config.locs`, `locZone`, `locZonePend`, `locsManual`, `zoneSteps`, `flow`, `locAlerts` | 1 | FIFO, auditoria | Não (fica no Gel) | Decisão: Gel › Regras do estoque ou fica no Gel |
| Plano de barris, extras, paradas, baselines, planos | Gel › Programação | gel · `S.config.pcp` | 1 | plano | Não | Fica na página (dado do dia a dia) |
| Ordem (Work Order) ↔ lote do PCP (tabela colada) | Gel › Programação | gel · `S.config.woMap` | 1 | rastreabilidade | Não | Fica na página |
| Projeção do ano fiscal por catálogo | Gel › Projeção | gel · `S.config.calcProj`, `calcProjFY` | 1 | simulador | Não | Fica na página |
| Origem do relatório SAP (mesma pasta ou subpasta) | Gel › Config › Pasta da rede | gel · `S.config.sapSrc` | 1 | importação | Não | Fica na página (infraestrutura) |
| Modelos de relatório e layouts do painel | Gel › Relatórios; Dashboard | gel · `S.config.repTpls`, `dbViews` | 1 | Gel | Não | Preferência |
| Modo TV e Apresentação (segundos, telas) | Gel › Config › Modo TV | gel · `S.config.tvSeconds`, `tvScreens`, `ldSeconds`, `ldScreens`, `ldView` | 1 | TV | Não | Preferência |
| Nome da página, tema, abas visíveis e ordem, aba inicial | Gel › Config › Aparência, Abas | gel · `S.config.pageName`; abas em `ui.prefs` (`tabs`, `tabOrder`, `tabHl`, `home`) | 1 | tela | Não | Preferência |
| Consulta dos cadastros do Gel (turnos, preço, catálogos, equipamentos, materiais) | (não existia) | gel · Config › Consulta de cadastros (`vacConsultaCad`) | — | Gel | Novo; só leitura | Sai (o Gel só lê por `vacCad`) |

## 4. Equipamentos

| Configuração | Página antiga (tela) | Onde está hoje | Cópias hoje | Quem lê | Perdido ou resumido? | Destino v2 |
|---|---|---|---|---|---|---|
| Equipamentos: código, nome, linha, posição, tipo, papel (oee ou equipamento) | Produção › Estrutura › Máquinas; Equipamentos › lista | portal · `CAD_T.equipamentos`; oee · `db.machines`; equip, linha, paradas, gel leem `vacCad` | CadSync (Produção); Gel `S.config.equips` guarda nome e ativo | todas | Duplicado | Equipamentos › Equipamentos |
| Fabricante, modelo, nº de série, ano | Equipamentos › ficha | portal · `equipamentos[]` | — | Equipamentos | Não | Equipamentos › Dados técnicos |
| Outros nomes (de-para) | Paradas › Config › Máquinas: de-para | portal · `equipamentos[].apelidos`; paradas · `config.deparaMaquina`; linha · `pontos[].chaves` | 3 | importação do Forms, Linha 360° | Duplicado | Equipamentos › Outros nomes (um só) |
| Código MES, departamento, centro de trabalho | (não existia nas antigas) | portal · `equipamentos[].codigoMes/departamento/centroTrabalho` | — | Produção (servidor), SAP | Não | Equipamentos › de-para MES |
| Categoria (equipamento da linha ou Equipamento – Gel) | Gel › Equipamentos | portal · `equipamentos[].categoria` | Gel cria equipamento próprio | Gel | Não | Equipamentos › Equipamentos |
| Componentes (código `<EQ>-Cnn`, sistema, criticidade, material SAP) | Equipamentos › ficha | portal · `CAD_T.componentes` | — | Paradas, Equipamentos | Não | Equipamentos › Componentes |
| Modos de falha | Paradas / Equipamentos | portal · `CAD_T.modosFalha`; paradas · `MODOS_PADRAO` | 2 | Paradas | Duplicado | Equipamentos › Modos de falha |
| Matriz de paradas (qual código vale em qual equipamento) | Paradas › Config; Produção › Tipos de parada | portal · Matriz · `paradas[].equipamentos`; paradas · `config.matriz` | 2 | Paradas, Produção | Duplicado | Paradas e perdas › Códigos (matriz) |
| TAGs de equipamento (código, equipamento, propósito) | Equipamentos › TAGs | equip · `D.tags[]` (base `equipamentos-base.json`) | 1 | Equipamentos, Produção | Não (base própria) | Decisão: Equipamentos › TAGs |
| Vigência da TAG (nome no mês, tipo, unidade) | Equipamentos › TAGs | equip · `tags[].vigencias[]` | 1 | idem | Não | idem |
| Mapa de tags da linha do tempo (tag do equipamento/MES → estado macro, prioridade, vigência) | (não existia) | oee · Config › Mapa de tags · `Timeline.tagMap` (`TAGS_PADRAO` embutido) | 1 | Linha do tempo | Novo, mora na Produção | Equipamentos › Tags (ou Sistema; ver Decisões) |
| Padrões AM/TPM (tipo, equipamento, ponto, periodicidade, faixa, habilitação) | Equipamentos › Padrões AM/TPM | equip · `D.padroes[]` | 1 | Equipamentos | Não (contrato 7: não mudar sem autorização) | Fica na página (TPM intocado) |
| Guia do código de parada por equipamento | Paradas › ficha | portal · texto "Guia" na ficha da parada | 1 | Paradas (verso do formulário) | Não | Paradas e perdas › Códigos |
| Pontos da planta: nome, posição x/y, fluxo, chaves de equipamento | Linha 360° › Config › Posição dos pontos | linha · `D.pontos`, `PONTOS_PADRAO` | 1 (chaves duplicam apelidos) | Linha 360° | Não | Decisão: desenho do mapa (ver Decisões) |
| Áreas (polígono, pontos) | Linha 360° › Config › Redesenhar área | linha · `D.areas`, `AREAS_PADRAO` | 1 | Linha 360° | Não | idem |
| Postos de operador (OP1, OP2, OP3; ponto; área) | Linha 360° › Pessoas e postos | linha · `D.postos`, `POSTOS_PADRAO`, `OP_COR` | 1 | Linha 360° | Não | idem |
| Fluxos (Comum, EDTA, SST) e trajetos | Linha 360° | linha · `FLUXOS`, `TRAJETOS` | 1 | Linha 360° | Não | idem |
| Planta baixa e fotos na planta | Linha 360° | `IMAGENS/PLANTA_BAIXA.SVG`; `vacImagens` | 1 | Linha 360° | Não | Decisão (ver Decisões) |
| Checklists e frequência (turno, dia, semana) | Linha 360° › Checklists | linha · `D.checklists`, `FREQ` | 1 | Linha 360° | Não | Decisão (definição na Administração, feitos na página) |

## 5. Turnos e metas

| Configuração | Página antiga (tela) | Onde está hoje | Cópias hoje | Quem lê | Perdido ou resumido? | Destino v2 |
|---|---|---|---|---|---|---|
| Turnos: código, nome, linha, cor | Produção › Config › Turnos | portal · `CAD_T.turnos`; oee · `db.shifts` | CadSync; Gel `S.config.shifts` | Produção, Gel, apps | Duplicado | Turnos e metas › Turnos |
| Vigência do turno: início, fim (24 h+), dias, ativo | idem | portal · `turnos[].vigencias[]` | idem | idem | Não | Turnos e metas › Turnos |
| Pausas planejadas (rótulo, início, fim, dias, desconta) | Produção › Turnos (Editar intervalos e pausas) | portal · `vigencias[].pausas[]` | idem | Produção | Não | Turnos e metas › Turnos |
| Intervalos do Hora a Hora: pela regra ou personalizados | Produção › Turnos (template) | portal · `vigencias[].intervalos[]`; oee · `breaks`/`template` | idem | Hora a Hora | Não | Turnos e metas › Turnos |
| Turno não produtivo | (nova) | portal · `vigencias[].naoProdutivo` | CadSync | Produção | Não | Turnos e metas › Turnos |
| Somar pedaço final de até N min ao intervalo anterior | Produção › Parâmetros (tailMergeMax) | portal · `vigencias[].regraPedacoFinal`; oee · `settings.tailMergeMax` | 2 | Hora a Hora | Duplicado: parâmetro e vigência | Turnos e metas › Turnos (só na vigência) |
| Motivos de abono | Produção › Parâmetros; Gel › Abonos | portal · `parametros.motivosAbono`; oee · `settings.abMotivos`; gel · `S.config.abMotivos` | 3 | Lançamento | Duplicado | Turnos e metas › Abonos |
| Abono padrão por dia da semana (min e motivo) | Produção › Parâmetros › Abonos; Gel › Turnos e ritmo | oee · `settings.abDefault` (editado na Produção); portal · pausas sem horário | 3 | Lançamento | Duplicado: Produção edita local, Portal tem pausa | Turnos e metas › Abonos |
| Hora extra: máximo além do turno (60 min) | (aviso na Produção) | oee · `settings.horaExtraMax` (sem tela) | 1 | Lançamento | Perdido: sem tela | Turnos e metas › Hora extra |
| Meta de OEE (por catálogo, família, máquina, linha) com vigência | Produção › Metas e capacidades | portal · `CAD_T.metasOee`; oee · `db.targets` | CadSync | Produção, Gel, apps | Não | Turnos e metas › Metas de OEE |
| PPH da meta, meta diária de referência | idem | portal · `metasOee[].vigencias[].pph/metaDiaria` | CadSync | Produção | Não | idem |
| Semáforo próprio da meta (verde, amarelo) | idem | portal · `vigencias[].semaforoVerdePct/AmareloPct` | 3 semáforos | Produção | Duplicado | idem |
| Cobertura mínima do apontamento e divergência máxima (por meta) | idem | portal · `vigencias[].coberturaMinPct/divergenciaMaxPct`; oee · `settings.coverageMin/divergenceMax` | 2 | Pendências | Duplicado: padrão geral só na Produção | Turnos e metas › Metas de OEE (padrão + por meta) |
| Quadro hora a hora da meta (intervalos importados da planilha) | Produção › Metas (Quadro hora a hora, `intervalBoard`) | portal · `metasOee[].vigencias[].quadro` (só consulta, importado); oee · `targets[].intervalBoard` | 2 | Produção | Resumido: só consulta no Portal | Turnos e metas › Metas de OEE |
| Prioridade de busca da meta (catálogo + máquina → … → linha) | Produção › Metas (texto) | oee · motor de metas | — | OEE | Não | Regra de cálculo (não muda) |
| Arredondamento da meta (múltiplo, vigência) | Produção › Parâmetros (roundingUnit) | portal · `parametros.producao.arredondamentoMeta[]`; oee · `settings.roundingVig`, `roundingUnit` | 2 | Hora a Hora | Duplicado | Turnos e metas › Metas de OEE |
| Unidade de lançamento (1000) e rótulo ("mil") | Produção › Parâmetros | portal · `parametros.producao.unidadeLancamento/rotuloUnidade`; oee · `settings.entryUnit/unitLabel` | 2 | Lançamento | Duplicado | Turnos e metas › Lançamento |
| Casas decimais dos percentuais | (nova) | portal · `parametros.producao.casasPct`; oee · `PCT_D` | 2 | Produção | Não | Sistema › Exibição |
| Continuidade entre caixas (min) | Produção › Parâmetros | portal · `parametros.producao.continuidadeMin`; oee · `settings.continuityMin` | 2 | troca de turno | Duplicado | Turnos e metas › Turnos |
| Produção fora de turno vale a partir de | (nova, 1.9.7) | portal · `parametros.producao.foraTurnoDesde`; oee · `settings.foraTurnoDesde` | 2 | reatribuição | Duplicado | Turnos e metas › Turnos |
| Metas da área (Waste mensal, SQDCP, etc.) | Waste › Config › Meta de perda líquida por mês (local) | portal · `CAD_T.metasArea` (`WASTE-MES`); perdas · `config.meta` | 2 | Waste, Portal | Duplicado: meta local aparece quando falta a do Portal | Turnos e metas › Metas da área |
| Metas de OSM | Iniciativas › OSM | portal · `CAD_T.metasOsm` | 1 | Iniciativas | Não | Turnos e metas › Metas de OSM |
| Plano do mês e ordens | Produção › Plano do mês | oee · `plans`, `ordens-base.json` | 1 | Produção | Não | Fica na página |
| Meta do dia (lançada por vigência) e hora extra do dia | Produção › Lançamento | oee · `productionDays` | 1 | Produção | Não | Fica na página |
| Ritmo do Gel (meta, capacidade, velocidade máxima) | ver seção 3 | | | | | Decisão |

## 6. Paradas e perdas

| Configuração | Página antiga (tela) | Onde está hoje | Cópias hoje | Quem lê | Perdido ou resumido? | Destino v2 |
|---|---|---|---|---|---|---|
| Códigos de parada: código, nº (3 dígitos), nome, categoria, subcategoria, cor, macro | Produção › Tipos de parada; Paradas › Matriz | portal · `CAD_T.paradas`; oee · `db.downtimeCodes`; paradas · catálogo `CAT_PROPOSTO` | CadSync; Paradas lê `exports.cadastros` | Produção, Paradas, Portal | Duplicado | Paradas e perdas › Códigos |
| Pilar (U, D, P, Q), classe (fixa, por duração, calculada, em peças), onde se aponta | idem | portal · `paradas[].pilar/classe/ondeAponta` | idem | classificação | Não | idem |
| Impacto: planejada, desconta do planejado, afeta D, P, Q, entra no Pareto, aparece no relatório | Produção › Tipos de parada (Impacto, Regras) | portal · `paradas[].planejada/descontaPlanejado/afetaD/afetaP/afetaQ/pareto/relatorio` | idem | OEE | Não | idem (contrato 7: classificação não muda) |
| Regras: exige observação, horário, catálogo anterior/seguinte, componente, troca de peça, duração manual, temporário | idem | portal · `paradas[].exige*`, `duracaoManual`, `temporario` | idem | Lançamento, Paradas | Não | idem |
| Vigência do código de parada (inicial/final) | Produção › Tipos de parada (Vigência inicial, Vigência final) | oee · `downtimeCodes[].validFrom/validTo`; portal · sem `vig` | 1 | Produção | **Perdido no Portal** | Paradas e perdas › Códigos (vigência) |
| Descrição do código | idem | oee · `downtimeCodes[].description` | 1 | Produção | **Perdido no Portal** | idem |
| Edição em lote e importação dos códigos | (nova) | portal · Matriz de paradas, Importar | — | Portal | Não | idem |
| Código de parada no Forms (de-para de tipo) | Paradas › Importar (Salvar de-para) | paradas · `config.deparaTipo` | 1 | importação | Não | Paradas e perdas › Códigos (de-para) |
| Limite de microparada (5 min) | Paradas › Config › Regras (Limite micro) | portal · `parametros.limiteMicroMin`; paradas · `config.limiteMicroMin` (local) | 2 | Paradas, Produção | Duplicado (padrão 5 no Paradas, 10 no texto antigo) | Sistema › Parâmetros de cálculo |
| Parada longa (30 min) / fila técnica | Produção › Parâmetros (longStopMin); Paradas › Regras (filaMin) | portal · `parametros.paradaLongaMin`; oee · `settings.longStopMin`; paradas · `config.filaMin` | 3 | Produção, Paradas | Duplicado | Sistema › Parâmetros de cálculo |
| Horas programadas por dia (sem OEE) | Paradas › Config › Regras | paradas · `config.horasDia` (17) | 1 | tempo de operação | Não | Sistema › Parâmetros de cálculo |
| Ignorar nas análises antes de | Paradas › Config › Regras | paradas · `config.ignorarAntesDe` | 1 | análises | Não | Sistema › Parâmetros de cálculo |
| Ações padrão ("ação tomada") | Paradas | portal · `parametros.acoesPadrao`; paradas · `ACOES_PADRAO` | 2 | Paradas | Duplicado | Paradas e perdas › Listas |
| Motivos de abono e de "sem produção" | ver seção 5 e 1 | | | | | Paradas e perdas › Motivos |
| Problemas da QN (lista) | Produção › Segurança e qualidade | oee · `settings.qnProblemas` (Config › Problemas de QN) | 1 | Lançamento | Não | Paradas e perdas › Listas |
| Waste: limites de criticidade (atenção, alto, crítico em R$ e %, piso) | Waste › Config › Limites de criticidade | perdas · `config.thr` | 1 | semáforo do Waste | Não | Paradas e perdas › Waste |
| Waste: regra de sinal (calculado × SAP, inverter) | Waste › Config | perdas · `config.sign`, `sapInv` | 1 | cálculo | Não (não muda; contrato 7) | Paradas e perdas › Waste |
| Waste: formato de número, versão da KKBC (por ordem, por ordem e mês) | idem | perdas · `config.num`, `ver` | 1 | importação | Não | Paradas e perdas › Waste |
| Waste: grupos de custo usados | idem | perdas · `config.grupos` | 1 | análise | Não | idem |
| Waste: moeda das importações sem coluna | idem | perdas · `config.moedaPadrao` | 1 | importação | Não | idem |
| Waste: casas decimais (cards e tabelas) | idem | perdas · localStorage `perdas.cents`, `perdas.centsTab` (por computador) | 1 | exibição | Não | Preferência |
| Waste: nomes de cabeçalho (alias) e escolhas da prévia | Waste › Config › Nomes de cabeçalho | perdas · `config.alias`, `layouts` | 1 | importação | Não | Paradas e perdas › Waste |
| Waste: causas (por tipo, lista) | Waste › Config › Causas | perdas · `config.causas` | 1 | ações de causa | Não | Paradas e perdas › Listas |
| Waste: tipos de item (rolha, tubo…) | Waste › Config › Tipos de item | perdas · `config.tipos`; portal · `materiais[].tipo` | 2 | Waste | Duplicado | Produto › Materiais |
| Iniciativas: status, prioridade, origem, vínculos, eficácia, status do KAS | Iniciativas (constantes) | inic · `STATUS`, `PRIO`, `ORIGENS`, `VINC`, `EFIC`, `KAS_ST` | 1 | Iniciativas | Não (vocabulário fixo) | Sistema › Vocabulários (ver Decisões) |
| Programas de melhoria (KAS, OSM, 5S e outros) | Iniciativas › abas fixas KAS, OSM, 5S | portal · `CAD_T.programas`; inic · `ABAS`, `ORIGENS` | 2 | Iniciativas | Resumido: programas viraram cadastro | Sistema › Programas |

## 7. Pessoas e acesso

| Configuração | Página antiga (tela) | Onde está hoje | Cópias hoje | Quem lê | Perdido ou resumido? | Destino v2 |
|---|---|---|---|---|---|---|
| Usuários: ID/matrícula, nome, perfil, turno, especialidade, área, e-mail, página inicial | Portal › Pessoas › Usuários | portal · `CAD_T.usuarios` | oee · `settings.users` (lista de nomes já usados) | todas | Duplicado: nomes soltos na Produção | Pessoas e acesso › Usuários |
| Perfis: código, nome, página inicial, descrição, "edita sem senha" | Portal › Perfis | portal · `CAD_T.perfis`, `DEFAULT_PERFIS` | 2 (padrão embutido) | todas | Não | Pessoas e acesso › Perfis |
| Permissões por página e função (ver, lançar, fechar, importar, exportar, excluir, configurar) | Portal › Perfis e permissões | portal · `perfis[].permissoes`, `PERM_MODS`, `PERM_FN` | — | `vacPode` em todas | Não | Pessoas e acesso › Perfis |
| Permissão para editar por assunto da Administração | (nova, decisão 9) | (não existe) | — | Administração | Novo | Pessoas e acesso › Perfis |
| Layout padrão do perfil (cópia do arquivo de preferências de um usuário) | Portal › Perfis | portal · `perfis[].layout` (chaves de preferência) | — | cabeçalho/kit | Não | Pessoas e acesso › Perfis |
| Senha de edição do cadastro e editores | Portal › Segurança e senha | portal · `D.seguranca` (hash, editores, trocar) | — | Administração | Não | Pessoas e acesso › Segurança |
| Senha de cada pessoa (login `vacLogin`) | Portal › Entrar | portal · `usuarios[].senha` (PBKDF2) | — | todas | Não | Pessoas e acesso › Usuários |
| Autocadastro (perfil Consulta) | Portal › Entrar | portal · perfil `CONSULTA` | — | login | Não | Pessoas e acesso › Perfis |
| Nome do usuário na página (identificação local) | Produção, Paradas, Gel, Waste, etc. › Usuário | localStorage `vac.userId`; oee · `Store.S.user`; gel · `myName`; paradas · `user()` | 4 | gravações | Duplicado | Preferência (vem do login) |

## 8. Sistema

| Configuração | Página antiga (tela) | Onde está hoje | Cópias hoje | Quem lê | Perdido ou resumido? | Destino v2 |
|---|---|---|---|---|---|---|
| Semáforo comum: verde a partir de, amarelo a partir de, usar amarelo | Produção › Parâmetros (Verde, Amarelo) | portal · `parametros.semaforoVerdePct/AmareloPct/semaforoAmarelo`; oee · `settings.semaphore`; por meta | 3 | todas as páginas | Duplicado | Sistema › Parâmetros de cálculo |
| Modo da Performance (1 ou 2) e premissa de perda de velocidade | Produção › Parâmetros | oee · `settings.perfMode`, `speedLossPremise` (só Produção) | 1 | OEE | Não sincronizado | Sistema › Parâmetros de cálculo (sem mudar o efeito) |
| Cobertura mínima e divergência máxima (padrão geral) | Produção › Parâmetros | oee · `settings.coverageMin`, `divergenceMax` | 2 (e por meta) | Pendências | Duplicado | Sistema › Parâmetros de cálculo |
| Pendências: dias para trás, alerta de lançamento aberto (h) | Produção › Parâmetros | oee · `settings.pendDaysBack`, `openHoursAlert` | 1 | Pendências | Não | Sistema › Parâmetros de cálculo |
| Servidor/MES: peças por caixa, sem caixa por mais de N min, tolerância por hora, troca acima de N min | Produção › Parâmetros | oee · `settings.serverBoxQty`, `serverGapMin`, `serverHourTol`, `serverSetupMax` | 1 | importação do servidor | Não | Sistema › Servidor / MES |
| Recarga automática (s) e rodízio da TV (s) | Produção › Base / TV | oee · `settings.autoReloadSec`, `tvRotateSec` | 1 por página | tela | Não | Preferência |
| Abas da página (ordem, visíveis, destaque, aba inicial) | Produção › Abas; Gel › Abas | oee · `Cfg.abas` (`App.prefs.tabs`); gel · `ui.prefs.tabs/tabOrder/tabHl/home` | 1 por página | tela | Não | Preferência |
| Estado das abas (em construção) | Produção | oee · `settings.tabState` | 1 | tela | Não | Sistema › Páginas |
| Exibição das quantidades (milheiros ou número completo) | Produção › Usuário | localStorage `vac.qtd`; portal · Neste computador | 2 | todas | Não | Preferência |
| Botões em destaque na barra | (nova) | portal · `parametros.destaques` | — | barra de comandos | Não | Sistema › Páginas |
| Backup: retenção em dias | (nova) | portal · `parametros.backupDias` | — | `vacBackupRegistro` | Não | Sistema › Backup |
| Backup: pasta, criar, restaurar | Produção › Base; Paradas/Waste/Gel › Backup | cada motor · tela Backup; portal · Backups do cadastro | 1 por página | gravação | Não | Fica na página (restaurar) + Sistema › Backup (política) |
| Módulos: caminho do HTML, ocultar, menu Outros, situação (estável, atualização, construção) | Portal › Configuração › Módulos | portal · `config.sistemas` (em `portal-base.json`) | — | barra de navegação | Não | Sistema › Páginas |
| Links do menu Outros | Portal › Configuração | portal · `config.links` | `vac.links` no navegador | barra | Não | Sistema › Páginas |
| Aviso de gel vencendo (dias de antecedência) | Portal › Configuração | portal · `config.avisoDias` | gel · `critDays/warnDays` | Portal | Duplicado com o Gel | Gel › Regras do estoque |
| Versões das páginas, Novidades, Auditoria | Portal | portal · telas Versões, Novidades, Auditoria | — | Portal | Não | Sistema › Versões / Auditoria |
| Importações SAP (CS12, BOM, componentes, equipamento × mês, Meta OEE FY27) | Portal › Importar | portal · Integrações SAP | — | cadastro | Não | Sistema › Importações |
| "Trazer configurações das páginas" | Portal › Início | portal · `TrazCfg` (Só no Gel, Só na Produção, Parâmetros, Pausas e abonos, Regras de apontamento, Câmbio, Preço do gel, Metas…) | — | uso único | Novo | Sai na etapa 8 (importador único) |
| Apps de celular (Meu Turno e Manutenção) | (nova) | portal · Apps de celular (`MT_APP.cfg`, gera o HTML com o cadastro) | derivado | celular | Não | Sistema › Apps de celular |
| TV (telas, segundos) | Paradas/Gel/Produção › Modo TV | cada motor | 3 | TV | Não | Preferência |
| Demonstração e dados de exemplo | Todas › Demonstração | portal · Configuração › Demonstração | — | — | Não | Fica na página |
| Limpar base | Paradas, Gel, Waste, Produção | cada motor | — | — | Não | Fica na página (restrito) |
| Integração entre páginas (leitura do exports) | Todas | `vacFicha` e `exports` em cada base | — | todas | Não | Fica (exports só de resultados) |

---

## Resumo de cópias por página (o que cada página guarda do cadastro)

| Página | Cópia de cadastro que guarda hoje |
|---|---|
| Produção (`oee`) | `db.lines`, `machines`, `families`, `shifts`, `catalogs`, `targets`, `downtimeCodes`, `calendar` e `settings.*` (CadSync); `unitName`, `sector`, `timezone`, `calendar`, `logo`, `users` fora do sync |
| Gel (`gel`) | `S.catalogs` (catálogos e gel por catálogo), `S.config.equips`, `fmts`, `params`, `motivos`, `prices`, `shifts`, `abDefault`, `abMotivos`, `logo` |
| Waste (`perdas`) | `config.tipos`, `config.meta` (local), `config.moedaPadrao`, `Logo` |
| Paradas (`paradas`) | `config.deparaMaquina`, `deparaTipo`, `matriz`, `limiteMicroMin`, `filaMin`, `horasDia`, `logo`; `Cad.eqs` montado de `exports.cadastros` |
| Equipamentos (`equip`) | TAGs e padrões em base própria; equipamentos vêm do cadastro |
| Iniciativas (`inic`) | só vocabulários fixos |
| Linha 360° (`linha`) | `pontos[].chaves` (de-para de equipamento), áreas, postos, checklists |
| Projetos (`projetos`) | nenhuma configuração |
| Portal (`portal`) | dono: `vacutainer-cadastros.json` e `portal-base.json` (`config.sistemas`, `links`, `avisoDias`) |

## Cobertura das nove páginas antigas

| Página antiga | Telas de configuração comparadas |
|---|---|
| Produção (`OEE-Vacutainer.html`) | Base de dados, Usuário, Estrutura (logo, unidade/setor, linhas, máquinas, famílias), Turnos, Catálogos, Metas e capacidades, Tipos de parada, Parâmetros de cálculo (inclui Abonos e Sem produção), Abas, Importação, Exportação, Auditoria, Ajuda |
| Gestão de Gel (15/11 e 13/11) | Geral, Aparência, Programação (inclui Fim do barril), Turnos e ritmo (inclui Abonos), Parâmetros de processo, Preço do gel, Locais, Catálogos (Gel e BOM), Formatos de tubo, Equipamentos da linha, Motivos de descarte, Modo TV e apresentação, Abas, Pasta da rede, Backup |
| Waste (`Perdas-Ordem.html`) | Configuração (usuário, moeda, sinal, grupos, limites, meta, nomes de cabeçalho, tipos, causas, pasta, backups) |
| Paradas | Configuração (pasta, regras, de-para de máquina e de tipo, matriz, logo, backups, limpar base, exports) |
| Equipamentos | Configuração (pasta e base), TAGs, Padrões AM/TPM |
| Iniciativas | Configuração (pasta e base, migração do Waste), vocabulários, programas |
| Linha 360° | Configuração (posição dos pontos, áreas, postos, equipamentos de cada ponto), Checklists |
| Projetos | nenhuma tela de configuração |
| Portal | Cadastros (CAD_T), Metas, Pessoas, Regras (Vigências, Parâmetros), Sistema (Importar, Configuração, Versões, Auditoria, Backups, Segurança) |

---

## Decisões para o responsável

> **Respondidas pelo responsável em 23/11/2026:** todas as propostas abaixo aceitas. Item 10: o gel do Tubo 100 é **0,936 g desde 01/10/2025**.

O inventário não resolve estas; a ordem das etapas 3 a 7 pode mudar conforme a resposta.

1. **Linha 360° (pontos, áreas, postos, checklists, planta, fotos) é configuração ou desenho do mapa?** Proposta: a **definição** (quais pontos existem, quais equipamentos cada um tem, postos, checklists) vai para a Administração; a **posição na planta** (x/y, polígonos, fotos) continua na Linha 360° como desenho do mapa. O de-para `chaves` dos pontos some quando o equipamento do ponto passar a ser o código do cadastro.
2. **Gel: regras do estoque** (modo da fila, barris por dia, cabeçotes, remanescente, bomba em kg/cm, altura do barril, vencimentos, locais e zonas do SAP) são configuração que muda raramente, mas pertencem ao estoque e ao abastecimento, que a regra 8 manda deixar na página. Proposta: ir para a Administração só o que é **parâmetro de regra** (remanescente, kg por cm, altura, tolerâncias, vencimento, cabeçotes); locais e zonas do SAP ficam no Gel. Decidir.
3. **Ritmo do Gel** (meta sem histórico, capacidade nominal, velocidade máxima 72 000 tubos/h, meta de OEE): hoje sem tela e com padrão embutido. Vai para "Turnos e metas" ou para "Gel"? A velocidade máxima de 72 000 tubos/h conflita com o PPH nominal por catálogo?
4. **Preços de material e câmbio**: o desenho não os coloca em nenhum dos oito assuntos. Proposta: Produto › Preços; Câmbio no mesmo lugar.
5. **Tags**: TAGs de equipamento (Equipamentos) e mapa de tags da Linha do tempo (Produção) são duas listas. Unificar em Equipamentos › Tags? Mexe com TPM e com a classificação de paradas (contrato 7); só com autorização.
6. **Padrões AM/TPM e TAGs de equipamento**: mantidos na página (TPM intocado), ou cadastro na Administração?
7. **Vigência dos códigos de parada**: a Produção antiga tinha vigência inicial/final por código e a Administração não. Recuperar? Mudar a classificação hoje vale para o passado inteiro (contrato 2 manda vigência imutável).
8. **Vocabulários fixos** (status, prioridade, origem de ações; causas e tipos do Waste): ficam no código ou viram listas editáveis na Administração?
9. **Padrões embutidos que mascaram ausência** (`GEL_FMT_DEF` 0,834, `GEL_PROC_DEF`, `DEFAULT_PERFIS`, `TAGS_PADRAO`, `DEFAULT_CAUSAS`, `DEFAULT_TIPOS`): sair com o importador (sem dado, aviso) ou ficar como sugestão de partida?
10. **Valor do gel do Tubo 100**: confirmar com o responsável qual é o 0,936 g vigente e desde quando; ele precisa estar numa vigência real antes de qualquer teste de "mesmos números do antigo".
11. **Calendário de produção**: o Plano do mês ainda permite marcar dia sem produção fora da Administração. Passar a só ler?
12. **Câmbio e preço digitados no Gel** (`S.config.prices`): descartar na importação, já que o Portal tem `precos` e `cambio`?
13. **Permissão por assunto**: usar os mesmos oito assuntos na tabela de perfis; confirmar os perfis iniciais (Processos edita tudo; PCP só Planta e Turnos e metas; Almoxarifado só Gel).
14. **Logo e marca**: um só lugar (Sistema › Marca) com a pasta externa `Marca/` como fonte, e as quatro cópias saem.

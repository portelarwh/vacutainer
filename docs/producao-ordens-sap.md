# Produção › Ordens (MB51 + COOIS) · especificação e decisões

05/11/2026 · Produção 2.1. Complementa o plano (`claude/plano-evolucao-plataforma.md` § 6.2) e a lista técnica da Produção enviada por Pedro em 05/11/2026.

## 1. Decisões do Pedro (05/11/2026)

- **Planta: 4017.** Competência = **mês civil da Data de lançamento** do MB51.
- **UM do produto acabado = UN** (unidades, ex.: 1.260.000).
- Microparada: **5 min** (cadastrado no Portal; a Produção lê `parametros.limiteMicroMin`).
- Lançamento padrão: **por turno** (hora a hora como opção).
- **REF e REV**: só contam no OEE o **excedente da pausa padrão** (pausa de 60 min, parada de 65 min → 5 min de perda). A pausa padrão fica no cadastro de turnos (pausas), ligada ao código (a fazer na Produção 2.4: `turnos.vigencias[].pausas[].codigo`).
- MB51 e COOIS ficam na **Produção** (dona das ordens). O Waste consome depois.

## 2. O que a amostra mostrou (MB51 e COOIS descaracterizados)

- **MB51 · 22 colunas**: Ordem, Material, Texto breve material, Planta, Depósito, Tipo de movimento, Txt.tipo movimento, Doc.material, Ano doc.material, Item doc.material, Data de lançamento, Data do documento, Data de entrada, Hora do registro, **Qtd.  UM registro** (dois espaços), UM registro, **Lote**, Cód.débito/crédito (S/H), Item gerado automaticamente, Nome do usuário, Referência (vazia), Texto cabeçalho documento.
- **Não há referência do documento estornado.** O 102 vem com **quantidade negativa** e "H"; o sinal é usado como veio.
- Caso real na amostra: ordem com 101 em 23/09, 102 em 23/09 (mesma quantidade e lote) e novo 101 em 25/09 → o 102 é ligado ao 101 de 23/09 (único 101 **anterior** com mesma quantidade e lote); **data principal = 25/09**.
- **Unidades UN, L e G** na mesma planta (tubos, soluções de processo, gel): nunca somadas.
- O MB51 traz **materiais de outras linhas e semiacabados** (soluções, gel). Não se filtra (regra), mas a conciliação separa "da linha" (catálogo cadastrado, plano ou produção) de "outros materiais".
- **COOIS**: 17 colunas esperadas, uma linha por ordem, Tipo ZP02 (e ZPRW = retrabalho). Para **L e G a quantidade do COOIS veio 1.000× a do MB51** (ex.: 42 L × 42.000) → a conciliação marca "provável diferença de unidade (×1.000)" em vez de divergência simples. Para UN bate.
- Linhas de observação no fim das planilhas são ignoradas (sem ordem/movimento).

## 3. Regras do importador (serviço `OrdensSAP`, separado da tela)

- Cabeçalhos pelo nome (sem acento, espaço ou caixa); aceita colagem (tabulação ou `|` do SAP), XLSX, XLSM, CSV; num arquivo com várias abas escolhe a aba pelo cabeçalho (MB51 ou COOIS).
- Números BR/EUA e sinal no fim (`990.000-`); datas DD.MM.AAAA, DD/MM/AAAA ou data do Excel.
- **Planta**: a prévia lista as plantas encontradas; padrão 4017 (se não houver, a mais frequente, com aviso).
- Linhas fora da competência, sem ordem, de outra planta e outros movimentos são **contadas e preservadas**, não entram na consolidação.
- **Saldo** por Ordem + Material + UM registro = soma de 101 e 102 (sinal do SAP; 102 positivo com "H" vira negativo, regra registrada).
- **Vínculo 102 → 101** (sem referência documental): mesmo Ordem + Material + UM + Lote, mesma quantidade, 101 **anterior** ao 102 e ainda não vinculado. Um só candidato → vinculado ("correspondência exata"). Saldo zero → todos estornados. Nos outros casos: **"Estorno sem referência documental suficiente"**; a data principal só fica pendente se o 102 sem vínculo puder ter cancelado o último 101.
- **Data principal** = última Data de lançamento de 101 válido. Guardadas também primeira/última 101, todas as datas, documentos, itens, horas e usuários.
- Situação: saldo > 0 válida (parcialmente estornada se houver 102); = 0 estornada; < 0 pendência.
- **Contagem** = ordens distintas com saldo > 0. **Lista para o COOIS**: uma por linha, numérica, sem duplicidade, sem as estornadas e as só negativas.
- **Substituir competência**: compara antes (ordens adicionadas/removidas, quantidades, novos 102, data principal, pendências novas/resolvidas); nunca soma.

## 4. Base `ordens-base.json` (pasta única; dona: Produção › Ordens)

```
{ schema:'vac-ordens', schemaVersion:1, rev, revBy, revAt, revId, appVersion,
  competencias:{ 'AAAA-MM':{ comp, planta, mb51:{arquivo,em,por,cab,linhas[],colunas}, coois:{…}|null,
      resultado:{kpi, unidades, ordens[…]}, conciliacao:{…}, historico:[…] } },
  auditoria:[…], exports:{ exportsVersion:1, porOrdem[…], kpis, pendencias } }
```
Backup em `00. Backups/Ordens/` antes de cada gravação (o primeiro do dia e antes de substituir). Gravação relê o arquivo e aplica a competência alterada sobre a versão mais nova.

## 5. Conciliação

Por ordem: MB51 (saldo, data principal) × COOIS (tipo, status, datas, fornecida, retrabalho, refugo) × plano do PCP (Plano do mês) × produção apurada do OEE (exports.ordens: produzido, início/fim real). Situações: planejada e produzida, planejada não produzida, produzida fora do plano (da linha), outros materiais. Aviso quando a data principal do MB51 e o fim real da produção diferem mais de 2 dias (o 101 pode ser lançado depois da produção): **competência pelo MB51, aderência diária pelo hora a hora/MES**.

## 6. Feito na Produção 2.1 (05/11/2026)

- Aba **Ordens** (grupo ORDENS, entre Operação e Análise) com: Importar MB51 · Complementar COOIS · Ordens produzidas · Conciliação · Histórico de competências. Código em dois blocos no fim do `OEE-Vacutainer.html`: `OrdensSAP` (serviço, sem tela; reaproveitável) e `App.views.ordens` (tela).
- Competência e planta no topo; prévia com KPIs, totais por unidade, pendências, estornadas, ignoradas, colunas reconhecidas; botões para trocar planta/competência quando o arquivo não bate; comparação antes de substituir.
- Lista para o COOIS (copiar, com separador, TXT, ausentes); COOIS com cobertura, ausentes, extras, divergências (inclui ×1.000 de unidade) e retrabalho (ZPRW).
- Ordens produzidas com busca livre, filtros (situação, unidade, da linha/outros), Excel; ficha da ordem com movimentos e vínculos, COOIS, planejado × produzido, links para Waste e Gel.
- Conciliação com o Plano do mês e a produção apurada (exports da própria Produção para o mês da competência).
- `ordens-base.json` gravado pela pasta (relê e aplica a competência sobre a versão nova; backup diário e antes de substituir em `00. Backups/Ordens/`); sem pasta, fica no navegador; no modo exemplo, só na memória. Importar exige permissão "importar" na Produção (perfil).
- Testado com a amostra descaracterizada (planta 5012): 39 ordens, 1 parcialmente estornada com data principal 25/09, COOIS 100 %, 16 avisos ×1.000, 1 retrabalho.
- Próximo: 2.2 (ajustes da conciliação com plano real) → 2.3 ficha unificada (produção, hora a hora, paradas, waste, gel) → 2.4 cadastro/metas/vigências e pausa padrão com código (REF/REV: só o excedente conta).

## 7. Feito na Produção 2.2 (05/11/2026)

- **Cabeçalho sem rolagem**, em grupos com menu ao passar o mouse, na ordem da história: Plano · Ordens ▾ · Apontamento ▾ (lançamento, hora a hora, lotes, pendências) · Análise ▾ (visão geral, paradas, histórico, semanal, mensal) · Gestão ▾ (painel, relatórios) · Configurações. A aba Equipamentos saiu da barra (vai para a página Equipamentos).
- **MB51 de vários meses** (ex.: o ano todo): a prévia separa por competência (mês civil da Data de lançamento), mostra cada uma com comparação e grava todas de uma vez ("Gravar todas") ou uma por uma.
- **Ordens sem KKBC_ORD no Waste**: a Produção lê `perdas-base.json` (exports.porOrdem / ordensExcluidas). Cada ordem fica lançada, excluída ou pendente. Aparece na pílula do topo de Ordens, no KPI e na coluna da Conciliação, no filtro "sem KKBC", no botão "Copiar ordens sem KKBC" e na ficha. "↻ Reler Waste" atualiza.
- **Preparações de aditivo** (soluções/gel): categoria própria na conciliação. É preparação quando o catálogo do Portal diz `tipoItem: 'preparacao'` ou, sem cadastro, quando todas as unidades do material são L/ML/G/KG/MG.
- **Plano do mês × SAP**: coluna SAP em cada ordem do plano (chave = nº da ordem) com data principal e quantidade do MB51, divergência de lote ("LOTE SAP …"), diferença % × plano, tipo/fim do COOIS e "sem KKBC". Clique abre a ficha. O lote do plano **não é sobrescrito automaticamente**: o SAP é mostrado como oficial (próximo: ação "usar lote/dados do SAP").

### Sai de Produção › Configurações (vai para o cadastro do Portal)
- Estrutura (linhas/máquinas), Turnos, Catálogos e Tipos de parada → só leitura com "Editar no Portal" (Produção 2.4).
- Metas e capacidades / PPH → cadastro quando o Portal ganhar o tipo `metasOee`.
- Ficam locais: Parâmetros de cálculo, Abas, Base, Importação/Exportação, Auditoria, Modo exemplo, Ajuda.

## 8. Produção 2.2.1 (05/11/2026)

- **Ficha da ordem › Material**: catálogo cadastrado no Portal → link para a ficha (`Portal.html#cadastros/catalogos/<código>`). Não cadastrado → pílula "não cadastrado" + botão **"＋ Cadastrar pela CS12"** → `Portal.html#cs12=<material>&nome=<texto>&tipo=tubo|preparacao&un=<UM>` (tipo pela unidade: L/ML/G/KG/MG = preparação).
- **Status do sistema (COOIS)** em etiquetas por sigla, cor por categoria (preparação, execução, fornecimento, encerramento, cálculo, lote, sem descrição). Passar o mouse mostra o significado de **todas** as siglas. Dicionário embutido: ABER, LIB, IMPR, CONF, FORN, ENTE, ENCE confirmados; **CAPC, DSVA, LOAT "a confirmar"**; sigla com * = status de usuário, sem descrição. Texto oficial: status da ordem no SAP ou tabelas TJ02T/TJ30T. Próximo, se precisar: dicionário no cadastro do Portal.
- **Pílulas de pendência**: uma por grupo com o **total** (Apontamento = lançamentos em aberto + pendências; Ordens = sem KKBC no Waste + pendências do MB51, sem repetir ordem). O menu (passar o mouse) mostra o número em cada item. Pendências ganhou o quadro **"Ordens (SAP)"** por competência (sem KKBC, pendências MB51, COOIS), com link direto.
- **Filtro de competência** em Ordens produzidas e Conciliação (igual ao Waste): de / até, ano fiscal (out–set, FY27 = out/2026 a set/2027), atalhos Atual · Última · Anterior · Últimas 3 · Ano fiscal atual · Todas, e Limpar. Com mais de uma competência aparece a coluna Competência; a conciliação soma os indicadores e recalcula aderência e atendimento no período; o Excel sai com o período e os filtros. Importar MB51/COOIS continuam por uma competência (campo do topo).

## 9. Produção 2.2.2 (05/11/2026)

- Pílula **"sem KKBC ⧉"** (listas, ficha e Plano do mês): copia a ordem e abre o Waste na importação (`#aba=importar&kkbc=…`), na mesma aba; **← Voltar** traz de volta. Na Conciliação: "Copiar e importar no Waste" (todas as sem KKBC do período).
- Ao voltar para a Produção relê Waste e Ordens sem F5 (kit v2.1 `vacAoVoltar`). O texto colado no MB51/COOIS fica guardado mesmo se a tela redesenhar.
- Depois de gravar MB51/COOIS a tela sobe para o topo; o filtro de competência passa para a(s) competência(s) gravada(s).
- Link "＋ Cadastrar pela CS12" manda o material como veio (zero à esquerda preservado).

## 10. Produção 2.4 (05/11/2026) · lê o cadastro geral do Portal

- **CadSync:** ao ler `vacutainer-cadastros.json` (abertura, releitura periódica, volta à página), se a revisão mudou, aplica numa alteração só (`Store.mutate`, com auditoria "sincronização do Portal" por campo):
  - linhas, famílias e máquinas (papel OEE);
  - catálogos (só tubos, uma entrada por vigência, PPH);
  - tipos de parada (todas as regras de apontamento);
  - turnos: horário, dias, pausas com código (viram `breaks`), regra do pedaço final, intervalos do Hora a Hora;
  - metas de OEE, quando o Portal tiver alguma: as locais sem correspondência são removidas, com auditoria;
  - parâmetros: parada longa, semáforo comum, motivos de abono e de "sem produção".
  Mantém os ids já usados nos lançamentos. Dias já lançados guardam o que usaram. Domínio vazio no Portal continua com o cadastro local. Grava `settings.cadSync = {stamp, rev, em, resumo}`.
- **Configurações:** Estrutura, Turnos, Catálogos, Metas e capacidades e Tipos de parada ficam só para consulta, com faixa "Vem do cadastro do Portal · rev N" e o botão "Editar no Portal ↗". A importação da Meta OEE FY27 fica desligada enquanto as metas vêm do Portal (o quadro entra pelo Trazer do Portal). Em Parâmetros, a parada longa e o semáforo ficam travados. Em Usuário, a faixa aponta para o Entrar do cabeçalho.

## 11. Produção 2.4.1 (06/11/2026) · Meta OEE FY27 importada no Portal

- Com as metas de OEE vindo do Portal, Configurações › Importação › "1 · Metas" troca o botão por **"Importar no Portal ↗"** (`Portal.html#cadastros/importar/metaoee`). Importar aqui gravaria metas que a sincronização do cadastro removeria.
- A faixa de Metas e capacidades aponta para o mesmo lugar. Sem metas no Portal, a importação local continua como antes.
- As metas e o quadro hora a hora chegam pelo CadSync na próxima revisão do cadastro (`intervalBoard` = `quadro` da vigência).

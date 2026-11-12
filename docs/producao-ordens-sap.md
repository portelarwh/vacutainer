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

## 12. Produção 2.4.2 (06/11/2026)

- Catálogo de sistemas único do kit (`fontes/kit/sistemas.js`): a barra passa a ter Paradas e os mesmos nomes do Portal. Sem mudança na base nem no `exports` (o Portal 1.8.3 passa a usar `exports.kpis`, `pendencias`, `porDia` e `ordens` no lugar de recalcular).

## 13. Produção 2.4.3 (06/11/2026) · gravação, CadSync e importador

- **Gravação**: cada gravação leva `saveId`; a releitura confere o `saveId`, não só o `databaseVersion`. Se outra pessoa gravou a mesma versão ao mesmo tempo, a alteração continua pendente ("Outra pessoa gravou ao mesmo tempo…") e a próxima tentativa reaplica as operações sobre a versão dela (caminho de conflito que já existia).
- **CadSync**: vigência de catálogo desativada no Portal fica `active:false` (não é apagada: os registros antigos acham o catálogo pelo id); o Portal manda nas metas quando tem metas cadastradas, mesmo todas inativas; turno inativo = vigências inativas. Se o `vacutainer-cadastros.json` sumir da pasta, vale a última cópia lida (as travas continuam) e a faixa avisa.
- **Importador MB51/COOIS**: data que não existe (31.02.2026) é recusada; número só é aceito inteiro ("123abc" → vazio). As amostras de `testes/amostras/` dão o mesmo resultado de antes. Zeros à esquerda do material **continuam sendo tirados** (mesma regra do Portal/CS12, ver registro de decisões).

## 14. Produção 2.4.4 (06/11/2026) · identidade das vigências de catálogo (CadSync)

- Um registro de catálogo com outra data só é reaproveitado no mapeamento inicial de catálogo local nunca sincronizado (sem `portalDe`, não criado pelo Portal, data fora das vigências desativadas). A vigência antiga mantém id, data e PPH (fica inativa); a nova ganha registro próprio. Campo novo `portalDe` (data da vigência do Portal que o registro representa).
- Corrigido junto: ao criar a nova vigência, o id marcado como "usado" era o calculado (`cat_<código>`) e não o que o registro recebia de fato; com isso a vigência antiga escapava da desativação.

## 15. Produção 2.4.5 (06/11/2026) · layout (vac-visual v1)

- No card com estado (borda e ícone do semáforo), o valor usa a cor do estado. Antes, o OEE de 70,4% com meta de 72,3% tinha borda âmbar e número vermelho. Sem estado, abaixo da meta continua vermelho. Só CSS, sem mudar regra.
- No modo exemplo, o aviso "Dados de demonstração carregados" deixa de aparecer: repetia o aviso do exemplo, e Remover não grava nada ali.
- Padrão visual comum do kit, pelo `build.py`.

## 16. Produção 2.4.6 (06/11/2026) · bases em 00. Bases

- `FolderBackend` usa `vacRaiz`. Em `Store.connect`, com permissão de gravação, move `oee-vacutainer-base.json` (cópia em `00. Backups/OEE`) e `ordens-base.json` (cópia em `00. Backups/Ordens`) para `00. Bases`. Lê o cadastro e a KKBC em `00. Bases` ou na raiz.

## 17. Produção 2.4.7 (06/11/2026) · revisão c341f8e

- Kit vac-bases v2, pelo build. `connectFolder`: um erro ao ler a base não abre "Criar base nesta pasta?". Contadores do submenu das abas com contraste ≥ 4,5 nos dois temas.

## 18. Produção 2.4.8 (07/11/2026) · relatórios e abas

Responde à auditoria de relatórios e painéis (registro § P). Regras `R(...)` novas no `build.py` e `NAV_GRUPOS` em `ordens_tela.js`.
- **PDF do relatório:** o comentário longo continua na página seguinte (antes parava na linha 40 de 70), e o rótulo do cartão sai em até 2 linhas ("ATENDIMENTO AO PLANO INICIAL").
- **Imprimir o relatório:** sai só o relatório (sem cabeçalho da página nem faixa de exemplo), em A4 paisagem (página nomeada `relatorio`) e no tema claro (kit).
- **Menu:**
  - "Visão geral" e "Painel" são os dois primeiros grupos;
  - o grupo Análise fica com Paradas, Histórico, Semanal e Mensal;
  - o grupo Gestão fica com Relatórios.
- **Aba ao abrir:**
  - `#aba=<rota>` abre a rota;
  - a aba do perfil (`vacAbaInicial('oee')`) vale na 1ª abertura da sessão, antes da última rota lembrada (`oee-route`) e da aba inicial pessoal;
  - "Produção › Tela do operador" abre `#turno`.

## Produção 2.4.10 (07/11/2026) · revisão `065fe6f` (registro § C)

- **Sair da TV redesenha a tela** (`TV.close` › `renderNow`, mantendo a rolagem). A TV limpava o registro dos gráficos, e a dica e o clique paravam até trocar de aba.
- **CSV:** a mesma regra das outras páginas (`vacCsvTexto`). Número escrito como texto que começa com `-` não ganha mais o prefixo `'`.
- **`build.py`:** grava com `\n`.

## 19. Produção 2.4.11 (08/11/2026) · E1 do plano único: Ordens e backups confiáveis (registro § U)

- **Leitura estrita** (`readSiblingStrict`, regra `R` no `build.py`): só "arquivo não existe" é ausência. Erro de rede, permissão ou JSON:
  - o `carregar` mostra a cópia deste navegador, com a data, e avisa que nada será gravado;
  - o `gravar` não escreve.
- **Pendência recuperável:** antes de gravar, a cópia e a lista de competências pendentes vão para o IDB (`ordens.pend`).
  - Se a gravação ou a confirmação falhar, a tela mostra "Alteração pendente… Gravar de novo".
  - Ao abrir de novo, a pendência é reaplicada sobre a versão da pasta (mesclagem por competência, sem repetir a auditoria).
- **Confirmação:** depois de gravar, relê e confere o `revId`. Se divergir ou a releitura falhar, não dá como gravado.
- **Backup antes de substituir competência:** obrigatório (se falhar, nada é gravado). Nome com segundos e sufixo, para não sobrescrever outro. O diário continua sendo rotina.
- **Backups antigos:** o `FolderBackend` tinha duas chaves `readBackup`; ficou a que lê também `00. Backups/` (local antigo).
- **Teste:** `testes/tordens.js`, com 15 checagens. Sobre a versão 2.4.10, reproduz a perda da competência de outra estação.

## 20. Produção 2.4.12 (08/11/2026) · E4 do plano único (registro § U)

- **`exports.porOrdem`** (regra `R` no `build.py`): ordens dos planos dos últimos 24 meses, com mês, ordem, lote, catálogo, quantidades, início e fim previstos e reais, produzido, `diasLote` e `retrabalhoDias`. Os dias vêm do servidor pela chave "dia|lote". Também publica `porOrdemCobertura` (de, até, meses, número de ordens, fonte).
- O bloco `ordens` (mês atual e anterior) continua igual.
- Sem OEE por ordem: falta definir a atribuição de tempo e capacidade.
- **Produção › Ordens:** só usa o `exports` do Waste se a versão for conhecida (`vacExportsOk`).

## 2.4.18 · 08/11/2026

Atualização do kit comum, com cache identificado pela origem da pasta. Procedimento, testes e limites em [estabilizacao-nv-01-05.md](estabilizacao-nv-01-05.md).


## Produção 2.4.20 · 09/11/2026

A aba SQDCP e os registros de acidente/QN por turno estão descritos em [producao-sqdcp.md](producao-sqdcp.md). Reimportações do RELATÓRIO preservam esses registros manuais, inclusive quando um turno deixa de aparecer na nova planilha, sem somar novamente sua produção. MB51/COOIS mantêm seus contratos.

## Produção 2.4.21 · 09/11/2026

No formulário Registrar/Editar parada, a duração permanece visível. Para códigos que exigem horários ou não permitem duração manual, ela fica somente para leitura e é calculada a partir de início e fim. A mensagem explica a exigência; o botão passa a se chamar **Limpar tempos** e retorna o foco ao início quando os horários são obrigatórios.

Códigos que permitem minutos continuam aceitando duração manual. Ao trocar de duração manual para um código que exige horários, o tempo anterior é limpo e os horários são liberados. Apagar ambos os horários também limpa o cálculo, evitando convertê-lo em duração manual por engano. Nenhuma regra do cadastro, base real ou contrato de dados foi alterado.

Validação: `node testes/tparada_tempo.js` (incluído em `testes/tudo.js`): opções do Portal, troca de código, limpeza, cálculo, gravação/reabertura, virada do dia e regressão do abono.

## Produção 2.4.25 · 10/11/2026

Junção da `main` (2.4.21: duração visível no registro de paradas, PR #24) com o branch do briefing de 09/11/2026 (2.4.21–2.4.24: ARQ-09, ARQ-06, fonte única/PRD-04, turnos não produtivos). As duas linhas de versão correram em paralelo; a 2.4.25 tem as duas. Detalhes do briefing: [briefing-2026-11-09-fase0-fase1.md](briefing-2026-11-09-fase0-fase1.md).

## Produção 2.4.26 · 10/11/2026 · Fase 3 do briefing

Ordens abre em Ordens produzidas (PRD-02); MB51 e COOIS viraram o item Importar (PRD-03: 1 · MB51, 2 · COOIS), que leva ao Portal › Importação › Produção (IMP-06). Endereços diretos: `#aba=ordens&sub=mb51|coois|lista|conc|hist` e `#aba=config&sec=importacao`. `exports.importacoes` na base do OEE (MES com o período, plano do PCP, históricos) e na de Ordens (MB51/COOIS por competência). Detalhes: [briefing-2026-11-09-fase0-fase1.md](briefing-2026-11-09-fase0-fase1.md) § 7.

## 2.4.35 · CSV do servidor (MES): registro do lote na preparação (10/11/2026)

O MES grava o lote e o catálogo quando a linha é preparada (ex.: 00:00, lote com caixa 0) e a 1ª caixa passa horas depois (04:53). Antes, a linha "lote · caixa 0" abria o trecho às 00:00 com a caixa 0 contada (1 caixa a mais, no turno errado) e, quando o catálogo vinha na linha seguinte, o trecho ficava sem catálogo/lote. Agora: **catálogo e lote registrados acima da 1ª caixa pertencem a ela**; o trecho começa no horário da 1ª caixa; **caixa 0 não conta** (nem abre lacuna); o horário do registro continua como evento do MES (a troca mostra última caixa → registro → 1ª caixa). A prévia da importação avisa quantos registros com contador 0 houve. Dias já importados com esse caso: **importar o período de novo**. Regras em `fontes/producao/mes_build.py`; teste em `testes/tfase7.js`.


## 2.4.63 · CSV do servidor (MES): relatório diário e a 1ª linha (12/11/2026)

O usuário vai enviar todo dia o relatório do MES das últimas 24 h (colunas Time, Catálogo, Lote e Caixa). Regra dele:
- a **1ª linha** (00:00:01) sempre traz o catálogo, o lote e a caixa da **última linha do relatório anterior**;
- **caixa 0**: não houve produção antes; catálogo e lote valem para a caixa 1 (regra da 2.4.35);
- **caixa maior que 0**: é a última caixa do dia anterior; o horário dessa linha é ignorado e a contagem começa na 2ª linha. Se o lote continua, o relatório anterior terminou nesse mesmo número.

**Erro encontrado e corrigido.** Antes, com caixa > 0, a 1ª linha era contada de novo, no horário da exportação. Com os relatórios de 09 a 12/11/2026 isso dava:
- 3 caixas a mais (3.639 contra 3.636);
- a 1ª caixa do dia às 00:00, o que puxa o início do dia no OEE real, nas "Caixas do MES" e na produção fora do turno;
- uma lacuna falsa entre 00:00 e a 1ª caixa de verdade.

Agora a 1ª linha só fixa catálogo, lote e o ponto de partida. O trecho do dia seguinte é marcado como "retomado". Com os quatro relatórios, a soma de cada lote fecha com o contador do MES (6299928: 108 + 1.131 + 20 = 1.259; 6299937: 1.041 + 219 = 1.260).

**Casos que já eram tratados e foram conferidos nos arquivos reais:**
- troca de lote: linha só com o lote e o contador volta a 1 (o catálogo continua o mesmo quando não vem na linha);
- linha "(null)" seguida da releitura completa da mesma caixa (11/11, 06:16): não conta em dobro;
- lote trocado e destrocado sem caixas no meio (11/11, 07:03 e 07:05): a contagem continua no mesmo trecho.

**Dias já importados** com a 1ª linha maior que 0: importar o período de novo. A importação substitui o período do arquivo e tira a caixa repetida das 00:00; a prévia avisa.

Regra em `fontes/producao/mes_build.py`; teste `testes/tmes_dia.js`, com dados fictícios.

## 2.4.64 · Fechar turno e botões acesos (12/11/2026)

**Erro encontrado e corrigido.** O dia pode ter um turno não produtivo que foi habilitado e depois desabilitado (TUR-02). Esse turno fica guardado como excluído (`deleted:true`), mas o fechamento olhava todos os turnos do dia, inclusive ele:
- "Fechar o dia" parava com o erro `Cannot read properties of undefined (reading 'r')`;
- fechar os turnos um a um nunca deixava o dia "fechado";
- o envio para conferência e o aviso de dia atrasado contavam o turno excluído.

Agora, como já acontecia no cálculo, o turno excluído não conta. Reabrir o dia também não mexe nele.

**Botões acesos (pedido do usuário):** usam o verde da pílula "ok", nos dois temas.
- **Turno fechado:** o botão vira "🔒 Fechado · Reabrir", aceso.
- **"Hora a hora x/y" no cartão do turno:** acende quando todos os intervalos do turno têm produção lançada, ou quando o turno está fechado.
- **Seletor de turno do Hora a hora:** acende do mesmo jeito; o turno fechado mostra "✓ fechado".

Regras em `fontes/producao/fecha_build.py`; botões em `turno_layout.js`, `fase7.js` e `hh24.js`. Teste: `testes/tfechar.js`.


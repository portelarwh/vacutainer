# Diagnóstico completo e visão do sistema · Linha Vacutainer

- **Commit analisado:** `e043513`, a `main` mais recente, com o PR #11 já incluído.
- **Data:** 08/11/2026.
- **Escopo:** somente análise. Nada foi alterado no repositório.

---

## 0. Resumo

**O sistema está estável.** A varredura abriu 52 abas (Portal, Produção, Waste, Gel, Paradas e as 3 em construção) nos 2 temas, em 1440 px e 390 px. Não houve **nenhum erro de JavaScript** nem rolagem lateral, e a suíte de testes passa.

Os problemas que sobram são de quatro tipos:

1. **Regras de dados que ainda vazam.** O arquivo de Ordens SAP pode ser regravado por cima quando a leitura falha. A meta do Waste é lida pela data de hoje. O Waste grava uma versão errada na base e gera um aviso falso no Portal.
2. **Código repetido que já diverge.** A mesma função existe em várias versões diferentes, uma em cada página. A leitura de número, por exemplo, dá resultados diferentes no Gel e no Paradas. Várias falhas corrigidas nas últimas revisões nasceram dessa divergência.
3. **Integração incompleta.** Não existe um lugar onde se digita o número da ordem e se vê tudo. Os dados para isso **já existem** nos `exports` de quase todas as páginas; falta juntá-los.
4. **Tela quase igual para todos.** O cadastro já tem perfis com permissões e página inicial, mas as páginas mostram as mesmas abas e botões para o operador e para a diretoria (só a Produção › Ordens respeita a permissão de importar). Também não há modo resumido nem detalhado.

### As 10 recomendações, em ordem

| # | O quê | Por quê | Esforço |
|---|---|---|---|
| 1 | Corrigir os 4 defeitos de dados (§ 2: B1 a B4) | perda de dados, meta errada em relatório e aviso falso | pequeno |
| 2 | **Ficha da ordem** em todas as páginas, com busca Ctrl K que reconhece ordem, lote, LP e catálogo | é o pedido central: digitar a ordem e ver tudo | médio |
| 3 | `exports` com dados por ordem na Produção (com histórico) e no Gel | sem isso, a ficha fica incompleta | médio |
| 4 | **Resumo / Detalhado** em cada página e em cada relatório, com padrão por perfil | atende quem opera, quem analisa e quem decide | médio |
| 5 | Perfil aplicado à tela: esconder o que a pessoa não usa | tela mais simples (não é segurança) | pequeno |
| 6 | Utilitários comuns no kit (números, datas, CSV, download, avisos) | acaba com as versões divergentes | médio |
| 7 | **Minha fila** no Portal: o que cada pessoa precisa fazer hoje, de todas as páginas | ponto único de ação | médio |
| 8 | Um gerador de relatório só (hoje são três) e um relatório executivo da linha | mesma aparência e menos código | médio |
| 9 | Iniciativas › OSM como próxima página nova | é a que tem meta e dono definidos | grande |
| 10 | Equipamentos começando pelo que já existe (Paradas + cadastro) | valor rápido, sem depender de relatório de máquina | grande |

---

## 1. Como a análise foi feita

- **Cópia isolada** de `e043513`, fora do repositório.
- **Leitura prévia:** `CLAUDE.md`, as pendências, o registro de decisões (§ C, § P, § R, § L, § 1), o plano de evolução e a especificação das páginas em construção.
- **Varredura de execução:** todas as abas de todas as páginas, com dados de teste, nos 2 temas e em 2 larguras, registrando erros de página e de console e rolagem lateral.
- **Testes de comportamento:**
  - leitura de número nas 5 páginas, com os mesmos 13 valores;
  - `exports` de cada página;
  - título e versão em tempo de execução;
  - avisos do Portal › Versões.
- **Medições:** tamanho das páginas, código igual entre páginas e funções com o mesmo nome e implementação diferente.

Ficou de fora o que já está decidido no registro. Por exemplo, "perfis não são autenticação" (5.4, recusado) não volta como proposta de segurança; o item 5 da tabela acima é sobre **simplificar a tela**, não sobre proteger.

---

## 2. Defeitos (problema · onde · por que corrigir · como)

### B1 · Ordens SAP podem ser regravadas por cima quando a leitura falha · **P1**

- **Onde:**
  - `fontes/producao/ordens_tela.js`, `Ord.gravar` (linha 26) e `Ord.carregar` (linha 14);
  - `readSibling` em `fontes/producao/build.py` (regra das linhas 58-59).
- **Problema:** `readSibling` devolve "vazio" para **qualquer** erro (rede, permissão, arquivo em uso). O `gravar` entende que o `ordens-base.json` não existe e grava a cópia da página **por cima**, sem mesclar o que outra estação gravou. O `carregar` cai na cópia antiga do navegador sem avisar.
- **Por quê:** é o mesmo defeito de "erro de leitura tratado como arquivo ausente" que foi corrigido nas 7 bases principais (B04, registro § R). Ficou de fora porque o arquivo de Ordens usa outro caminho de leitura.
- **Como:**
  - `readSibling` passa a devolver `null` só quando o arquivo não existe (`vacNaoAchou`) e a repassar os outros erros;
  - `gravar` para com a mensagem "Não consegui ler o arquivo de ordens; nada foi gravado" e mantém a alteração pendente;
  - `carregar` mostra o erro em vez de cair no cache em silêncio.

  Tudo por regra `R(...)` no `build.py` e no `ordens_tela.js`.
- **Aceite:** com a leitura forçada a falhar, nada é gravado, a alteração continua pendente e o aviso aparece. Com o arquivo realmente ausente, ele é criado como hoje.

### B2 · Meta do Waste (WASTE-MES) lida pela data de hoje · **P1** (pendência já registrada, confirmada)

- **Onde:** `paginas/Perdas-Ordem.html`, linha 922: `vacMetaArea('WASTE-MES', todayISO())`, guardada em cache e usada em todos os meses.
- **Problema:** o relatório de um mês passado usa a meta **de hoje**. Se a meta mudar em dezembro, o relatório de outubro "muda de resultado".
- **Por quê:** fere a regra 3 (vale a vigência da data do fato) e faz relatórios fechados mudarem sozinhos.
- **Como:** ler a meta pelo **último dia do mês consultado** (`vacMetaArea('WASTE-MES', fimMes(per))`), com cache por mês.
- **Aceite:** com duas vigências (até out = 40 mil, a partir de nov = 35 mil), o relatório de outubro mostra 40 mil e o de novembro, 35 mil.

### B3 · Waste com três versões diferentes e aviso falso no Portal · **P1** (pequeno)

- **Onde:** `paginas/Perdas-Ordem.html`:
  - `PAGE.versao` = 1.8.16;
  - `APP_VER` = 1.8.15 (linha 780; é o que vai para a base e para o `exports`);
  - `<title>` = V1.8.13.
- **Problema:**
  - a base registra que foi gravada pela 1.8.15;
  - o Portal › Versões compara com o HTML (1.8.16) e mostra, **sempre**, "última gravação da base feita pela versão 1.8.15; o HTML da pasta é 1.8.16";
  - esse aviso serve justamente para detectar página antiga aberta noutro computador.
- **Por quê:**
  - um aviso que nunca some ensina todo mundo a ignorar avisos;
  - fere a regra 8 (gravar `appVersion` certo).

  É regressão das últimas entregas: subiu-se uma constante e não as outras.
- **Como:**
  - uma constante só: `APP_VER = PAGE.versao`, como já fazem Paradas e as páginas novas;
  - título sem número;
  - um teste que confere, nas 8 páginas, que versão na tela, na base e no `exports` são a mesma.

### B4 · Vigência e câmbio "de hoje" calculados em UTC · **P2**

- **Onde:** kit `fontes/kit/kit_v21.js`, `vacCambio` (linha 55) e `vacVig` (linha 60), quando chamados sem data: `new Date().toISOString().slice(0,10)`.
- **Problema:** entre 21h e meia-noite (Brasília), "hoje" vira amanhã. Se uma vigência nova começa amanhã (preço, câmbio, turno, meta), ela já vale à noite, por exemplo para o 3º turno.
- **Por quê:** os números da noite usam a régua errada, e isso é difícil de perceber.
- **Como:** função `vacHoje()` no kit com a data local, usada como padrão. As páginas já têm `todayISO()` local; o defeito está só no kit.

### B5 · Leitura de número diferente em cada página · **P2**

- **Onde:**
  - Gel: `parseNum`, linha 927;
  - Paradas: `parseNum`, linha 763;
  - Waste: a leitura certa.
- **Teste:**

| Entrada | Waste | Gel | Paradas |
|---|---|---|---|
| `1.234` | 1234 | **1,234** | 1234 |
| `15-` (negativo do SAP) | -15 | **15** | **15** |
| `123abc` | recusa | **123** | **123** |
| `1,234.56` | 1234,56 | 1234,56 | **1,234** |
| `12.345.678` | 12345678 | **12,345** | 12345678 |
| `R$ 1.234,56` | 1234,56 | **0** | recusa |

- **Impacto real:** a importação do SAP no Gel já trata o formato brasileiro antes (linha 1020). O risco está nos **campos digitados**: kg, cm, preço, tolerâncias e o scrap do Registro de produção. "1.234" digitado em kg vira 1,234 kg sem aviso; "12a" vira 12. No Paradas, o risco é baixo (minutos do Forms).
- **Por quê:** é a mesma regra de negócio dando três respostas. O registro § 1 já tinha corrigido "123abc virava 123" na Produção e no Waste, mas o Gel e o Paradas ficaram de fora.
- **Como:**
  - leitor único no kit, `vacNum(v, {sap})`, que recusa texto parcial e entende `15-`, `1.234,5` e `1,234.5`;
  - nos campos digitados, uma prévia "= 1.234 kg" embaixo, como a Produção já faz nas quantidades.
- **Aceite:** a tabela acima com o mesmo resultado nas 5 páginas, e os campos do Gel recusando "12a" com mensagem.

### B6 · Ordens SAP sem releitura que confirme a gravação · **P2** (pendência registrada, confirmada)

- **Onde:** `Ord.gravar` grava e não relê (linhas 44-45).
- **Por quê:** fere a regra 10 (sem releitura, não dá como gravado).
- **Como:** o mesmo padrão das bases principais: reler e conferir `revId`. Se não conferir, fica pendente. Fazer junto com o B1.

### B7 · Waste lê a estrutura interna da Produção · **P2** (pendência registrada)

- **Onde:** Waste lê `monthPlans` e `server.dayLot` da base da Produção.
- **Por quê:** fere a regra 1. Uma mudança interna na Produção quebra o Waste sem aviso.
- **Como:** a Produção passa a publicar, no `exports`, as ordens (com histórico, § 4) e os dias de cada lote. O Waste lê só isso. Entra na fase de integração.

### B8 a B10 · menores, já registrados

- **B8:** `eventoId` comum entre Produção e Paradas. É latente: só vale quando a Produção publicar os eventos.
- **B9:** links de download sem liberação de memória no Paradas, na Produção e no Portal (o Waste já foi corrigido).
- **B10:** o backup diário automático do Portal ignora falha.

  **Sugestão para o B10:** pílula "backup de hoje não foi feito" no cabeçalho do Portal, sem interromper a gravação.

---

## 3. Código extenso ou repetido

### C1 · Utilitários copiados em cada página, já com versões diferentes

Medido nas 5 páginas principais:

| Função | Versões diferentes |
|---|---|
| `uid` | 5 em 5 páginas |
| `toast` | 5 em 5 |
| `addDays` | 4 em 4 |
| `applyTheme` | 4 em 5 |
| `parseNum` | 3 em 3 |
| `todayISO` | 3 em 4 |
| `esc` | 3 em 5 |
| `modal`, `norm`, `daysBetween` | 3 em 3 |

O Portal e o Waste têm 37 KB de código idêntico fora do kit (relatório, gravação). Entre as outras duplas, são de 6 a 12 KB.

- **Por que importa:** a divergência já deu defeito várias vezes:
  - restauração tratada de um jeito em cada página (§ C, item 2);
  - CSV com e sem proteção (§ C, item 3);
  - leitura de número (B5);
  - versão (B3).

  Cada correção precisa ser lembrada em cada página.
- **Como (gradual, sem reescrever):** um bloco **`vac-util`** no kit, aplicado pelo `aplicar_kit21.py` como os outros. Ele traz:
  - **números e datas:** `vacNum`, `vacFmt` (pt-BR), `vacHoje`, `vacSomaDias`;
  - **arquivos:** `vacCsvTexto` (já existe), `vacBaixar` (download que libera a memória);
  - **interface:** `vacAviso` (toast) e `vacConfirma`.

  Cada página passa a usar o comum **quando for mexida** por outro motivo, com teste de tabela para cada função. Nada de trocar tudo de uma vez.

### C2 · Três geradores de relatório e PDF

| Onde | Gerador |
|---|---|
| Portal e Waste | `Report` (o mesmo código) |
| Produção | `rpPdf`, `rpOutlookHtml`, `rpText` |
| Gel | 11 funções `pdf*` |

- **Por que importa:** cabeçalho, rodapé, cores, quebras e opções diferentes. Cada correção de relatório (registro § P) teve de ser feita até três vezes.
- **Como:** levar para o kit o modelo de documento do `Report` do Portal (blocos: indicadores, tabela, gráfico, texto, comentário), com as melhores partes da Produção (modelos, imagens no Outlook, versão de texto). As páginas passam a só **montar o documento**; PDF, Excel, texto, Outlook e impressão vêm do kit. Isso também dá, de graça, a **versão executiva e a completa** de qualquer relatório (§ 5).

### C3 · Leitura da Meta OEE FY27 em dobro

- **Onde:** a Produção (`Importers.parseMetaFY27`, cerca de 114 linhas) e o Portal (funções `mof*`) leem a mesma planilha.
- **Por quê:** as metas de OEE já moram no cadastro do Portal (decisão D6). A importação da Produção sobrou da fase anterior, e duas leituras da mesma planilha acabam discordando.
- **Como:** a Produção mostra "a meta vem do Portal" com o link, e a importação dela sai, depois de conferir que ninguém mais a usa. Precisa da sua confirmação.

### C4 · Funções muito grandes

`computeDayRaw` (204 linhas), `CadSync.aplicar` (101), `openConfig` do Gel (236 linhas, 44 KB) e `cadValidarItem`. **Não recomendo reescrever** (registro § C, item 8). A regra é: antes de mexer, um teste que fixe o comportamento; depois, quebrar só a parte mexida.

### C5 · O Gel é um arquivo de 1 MB editado direto

A Produção tem fontes e build; o Gel, do mesmo tamanho, não. Mexer nele é lento e arriscado.

**Recomendação:** quando o Gel sair de "em atualização", separar em fontes (`fontes/gel/`) com o mesmo `build.py` por regras. É opcional e não urgente; só vale a pena se o Gel continuar crescendo.

---

## 4. Integração por número de ordem (o pedido central)

### Como está hoje

| Onde você digita ou clica a ordem | O que acontece |
|---|---|
| Portal (Ctrl K) | procura só no cadastro; **não acha ordem** |
| Produção `#ordem=` | pula para o plano do mês (só se a ordem estiver no plano) |
| Produção › Ordens | competência, MB51 e COOIS da ordem |
| Waste `#ordem=` | detalhe de custo (KKBC, componentes, causa, ações) |
| Gel `#ordem=` | consumo de gel da ordem |
| Paradas | os eventos guardam a ordem, mas **não há busca nem link** por ela |

Quem quer "tudo da ordem 110834720" precisa abrir 4 páginas e saber o que procurar em cada uma.

### O que já existe e permite resolver sem quebrar regras

Cada página já publica no `exports` o que sabe da ordem:

| Página | Bloco do `exports` | O que traz |
|---|---|---|
| Ordens SAP | `porOrdem` | competência, saldos, status, conciliação |
| Produção | `ordens` | lote, catálogo, quantidade planejada e real, início e fim, caixas do servidor, dias de retrabalho |
| Waste | `porOrdem` | custo meta e real, desvio, perda, nível, causa, comentários, ações abertas |
| Gel | `ordens` | consumo, scrap, g/tubo, índice |
| Paradas | `eventos[]` | campo `ordem` em cada evento |

A ficha pode ser montada **só lendo esses blocos**, dentro da regra 1 (ninguém lê a estrutura interna de outra página).

### Proposta

1. **Ficha da ordem** (componente do kit, igual nas 8 páginas). Abre como painel lateral ao clicar numa ordem em qualquer página ou ao digitar o número no Ctrl K.
   - **Cabeçalho:** ordem, catálogo e descrição, lote(s), competência, status SAP, situação no Waste.
   - **Linha do tempo:** planejada → iniciada → produzida → custo apurado → fechada, cada etapa com a data e a página de origem.
   - **Seções:**

     | Seção | Conteúdo |
     |---|---|
     | Resumo | os números principais de cada módulo |
     | Produção | boa, scrap, dias, OEE da ordem |
     | Paradas | eventos e minutos por equipamento |
     | Gel | kg, g/tubo, LPs |
     | Waste | custo, desvio, causa, ações |
     | SAP | MB51 e COOIS |
     | Histórico | comentários e auditoria |
   - **Cada número leva à página dona** já filtrada (ex.: minutos de parada → Paradas com a ordem filtrada). Seção sem dado aparece em cinza ("sem dados no Gel"), nunca escondida.
2. **Busca Ctrl K global:** reconhece ordem (9 dígitos), lote, LP, catálogo (6 dígitos), código de equipamento e de parada, em todas as páginas.
3. **Mesma gramática de links em todas as páginas:** `#ordem=`, `#lote=`, `#lp=`, `#equipamento=`, `#catalogo=`, mais `&origem=` para o "← voltar". Os links de hoje continuam valendo.
4. **Leitor comum de `exports`** no kit, que lê as bases de `00. Bases` com cópia no navegador. O Portal já lê todas as bases; as outras páginas passam a usar o mesmo leitor.

### O que falta publicar

- **Produção:** o bloco `ordens` traz só o mês atual e o anterior, e não traz a produção boa, o scrap e o OEE da ordem. Proposta: `porOrdem` com histórico (cerca de 2 mil ordens mais recentes) e esses números.
- **Gel:** conferir se `ordens` tem histórico suficiente e incluir as LPs consumidas.
- **Paradas:** publicar um resumo por ordem (minutos e eventos), em vez de deixar a ficha filtrar 700 eventos a cada abertura.
- **Ficha do lote e do catálogo:** o mesmo componente, com outra chave.

É um acréscimo (regra 6): `exportsVersion` 1 continua valendo. O Portal precisa aprender a ler os campos novos; hoje ele marca como crítico qualquer `exportsVersion` diferente de 1. Por isso, ou os campos entram como opcionais na versão 1, ou o Portal é atualizado junto.

**Aceite:** digitar 110834720 no Ctrl K de qualquer página abre a ficha, com os mesmos números das páginas donas; sem a pasta conectada, abre pela última cópia, com a data dela.

---

## 5. Interface: fluida, fácil de entender e agradável

### Problemas que observei

- **Muitas abas e duas "visões gerais":**
  - Produção: 15 rotas em 7 grupos;
  - Gel: 11 abas;
  - Paradas: 12 abas;
  - na Produção, Visão geral e Painel ficam lado a lado, por decisão sua.

  Para quem só lança, é muito; para quem analisa, falta um caminho direto.
- **Tela igual para todos:** os perfis do cadastro (Operador, Liderança, Técnico, PCP, Almoxarifado, Qualidade, Processos, Consulta, TV) definem permissões, mas as páginas quase não as usam. Além de esconder links da barra, só a Produção › Ordens respeita "importar" (`ordens_tela.js`, linha 23). Lançar, excluir, configurar e fechar não mudam nada na tela: o operador vê Importar, Configuração e Excluir nas outras páginas.
- **Pendências de layout já registradas** (§ L): indicadores repetidos no Waste, posição diferente de filtros e "ação prioritária" entre páginas, títulos e unidades de gráficos.
- **Três estilos de relatório** (C2).

### Proposta

1. **Resumo ↔ Detalhado** (botão no cabeçalho, igual em todas as páginas; padrão pelo perfil; a pessoa pode trocar e a escolha fica guardada):
   - **Resumo:** 4 a 6 indicadores com semáforo, a "ação prioritária" e um gráfico de tendência; tabelas recolhidas.
   - **Detalhado:** o que existe hoje.
   - Nos relatórios, "Versão executiva (1 página)" × "Completa", saindo do gerador comum (C2).
2. **Perfil aplicado à tela** (simplificação, não segurança):
   - abas e botões que o perfil não usa saem do caminho e ficam em "Mais ▾";
   - o operador vê Lançamento, Hora a hora e Paradas do turno;
   - a liderança vê Visão geral, Painel e Relatórios;
   - o PCP vê Plano e Ordens.

   Usa o `vacPode` que já está no kit.
3. **Minha fila** (Portal): numa lista só, o que é seu:
   - pendências urgentes;
   - ações vencidas ou a vencer (Waste, Paradas, Iniciativas);
   - validações do Paradas;
   - competências sem KKBC;
   - barris vencendo.

   Cada item abre o lugar certo.
4. **Componentes iguais:**
   - um cartão de indicador;
   - uma tabela (ordenar, filtrar, colunas, exportar, "mostrando N de M");
   - uma barra de filtros (período, comparar, turno, catálogo) **sempre no mesmo lugar**;
   - um painel lateral (ficha).

   Isso fecha as pendências de layout do § L.
5. **Fluidez:**
   - indicador de "gravando… / gravado às 14:32" sempre visível;
   - desfazer no lugar de "tem certeza?" onde a ação não apaga nada (as exclusões já são lógicas);
   - atalhos de teclado nas telas de lançamento;
   - carregamento sem tela travada nas bases grandes (o índice do Gel foi o primeiro passo).

---

## 6. Funcionalidades por página (com carta branca)

### Portal

| Nova | Por quê |
|---|---|
| Minha fila | ponto único de ação por pessoa (§ 5) |
| Ficha e busca global | integração por ordem (§ 4) |
| **Reunião diária** (aba nova): uma tela por turno ou dia com OEE, waste, paradas, gel e ações do dia anterior, pronta para projetar | a reunião de linha hoje junta números de várias páginas na mão |
| Relatório executivo da linha (semana e mês): uma página com os 5 módulos | o relatório da diretoria hoje é por página |
| Calendário de produção (pendente) | dias úteis, feriados e paradas programadas num lugar só |
| Saúde do sistema: versões, backups e bases com um semáforo só | o que já existe em Versões, mais claro |

### Produção

- **Ficha da ordem** e `porOrdem` com histórico (§ 4).
- **Passagem de turno:** notas do turno que saem e chegam ao próximo (o que ficou pendente, máquina com problema). A informação crítica de um turno para o outro hoje não fica registrada.
- **Alerta de ritmo no hora a hora:** "neste ritmo o turno fecha em 92 % da meta", a tempo de reagir.
- **Papéis claros para as duas telas** (mantendo a sua decisão): Visão geral = **resumo pronto**; Painel = **montável e detalhado**.
- Correções B1 e B6 (Ordens) e retirada da importação da Meta FY27 (C3, se você confirmar).

### Waste

- **Pauta da reunião de waste** gerada automaticamente: ordens críticas, sem causa e ações vencidas. A reunião de reporte de waste foi a prioridade D2.
- **Gel da ordem no detalhe** (pelo `exports` do Gel): desvio do gel × BOM ao lado do desvio da KKBC.
- **Resumo e indicadores numa faixa só** (pendência § L).
- Correções B2, B3 e B7.

### Gestão de Gel

- **Cadastro do Portal** (catálogos e equipamentos; pendência § 1). Hoje o Gel ainda mantém os dele.
- **Ficha da LP e da ordem** no mesmo componente comum.
- **Prévia e recusa nos campos numéricos** (B5).
- **Previsão de falta de gel:** cobertura em dias × programação, com alerta na Minha fila (a cobertura já é calculada).

### Paradas

- **Relatório próprio** (pendência § P), pelo gerador comum (C2).
- **Busca e link por ordem**, e minutos por ordem no `exports`.
- **Fila técnica → ordem de serviço em Equipamentos**, quando ela existir (§ 7).
- **`eventoId` com a Produção**, para não contar a mesma parada duas vezes (pendência).

---

## 7. Páginas em construção e em atualização: motivo de cada uma

### Equipamentos (em construção, 0.1.1)

- **Motivo:** a informação de máquina está espalhada em 4 lugares (plano § 1): a ficha no Portal, a aba no Paradas (MTBF, MTTR), a aba na Produção e os equipamentos no Gel. A manutenção não tem lugar.

| Aba planejada | Para quê | Minha avaliação |
|---|---|---|
| Visão geral | estado de cada máquina, gargalo do dia | **fazer primeiro**, com o que já existe (Paradas + cadastro) |
| Máquina | ficha, indicadores e eventos de uma máquina | **fazer primeiro**: junta o que hoje está em 4 páginas |
| Ordens de serviço | registro e acompanhamento da manutenção corretiva | **segundo**: a fila técnica do Paradas já guarda "OS" e "técnico" |
| Plano preventivo | preventiva e preditiva por máquina e componente | **segundo** |
| Relatórios de máquina e Intervalos anormais | estados da máquina a partir dos relatórios dela | **depende de saber o que as máquinas exportam**; sem isso, não começar |
| Comparativo, TPM | análise e programa TPM | depois |

### Iniciativas (em construção, 0.1.1): 5S, OSM e KAS numa página

- **Motivo:**
  - a OSM (observação de segurança) tem meta por operador e hoje não tem onde ser registrada;
  - 5S e KAS também não têm;
  - existem **duas listas de ações separadas** (Waste e Paradas, decisão D3 em aberto).

| Aba | Para quê | Avaliação |
|---|---|---|
| OSM | registrar, cobrar e medir a meta por operador; ações estilo planner | **próxima a construir**: tem dono, meta e regra definidos (`docs/osm-arquitetura.md`) |
| 5S | auditorias por área, notas, ações | depois da OSM, reaproveitando o quadro de ações |
| KAS | ideias e kaizens | idem |
| Quadro de ações comum | uma lista de ações para as 3 abas (e, se decidir, para Waste e Paradas) | **decisão sua (D3):** unificar ou manter cada página com a sua |

### Projetos (em construção, 0.1.1)

- **Motivo:** dar lugar aos projetos de melhoria, aos projetos grandes e à compra de máquina.
- **Avaliação:** o **escopo ainda não está definido** (está marcado como provisório). Recomendo não construir antes de fechar com a liderança:
  - que tipos de projeto entram;
  - quem cadastra;
  - como medir o ganho (esperado × realizado, ligado a waste e OEE).

  O mínimo útil é uma carteira com dono, prazo, ganho esperado e situação.

### Gestão de Gel e Paradas (em atualização)

- **Gel:** passa a ler o cadastro do Portal, usar a paleta comum e publicar `exports` mais completos (consumo por ordem com histórico).
- **Paradas:**
  - matriz do Portal como fonte;
  - `eventoId` com a Produção;
  - relatório próprio;
  - link por ordem e por equipamento.

---

## 8. Plano em fases

| Fase | Entregas | Por quê nesta ordem | Validação |
|---|---|---|---|
| **0 · Correções** (1 PR) | B1 a B4, B6 | dado e relatório certos antes de qualquer função nova | teste de cada defeito falhando antes e passando depois; suíte completa |
| **1 · Base comum** | `vac-util` no kit (números, datas, download, avisos); Gel e Paradas no leitor único (B5); teste de versões | a integração e a interface nova dependem disso | tabela de casos igual nas 8 páginas |
| **2 · Integração por ordem** | `porOrdem` na Produção (com histórico) e no Gel; resumo por ordem no Paradas; leitor comum de `exports`; Ficha da ordem, do lote e da LP; Ctrl K global; Waste sem ler a Produção por dentro (B7) | o pedido central | ficha com os mesmos números das páginas; links de ida e volta |
| **3 · Tela por perfil** | Resumo ↔ Detalhado; perfil escondendo o que não usa; Minha fila | depende da ficha e do kit | perfis de teste (operador, liderança, PCP) em `tvisual` |
| **4 · Relatórios** | gerador comum (C2); executiva × completa; Reunião diária; relatório da linha | depende das fases 2 e 3 | `trelatorios` nos 3 geradores |
| **5 · Páginas novas** | Iniciativas › OSM; Equipamentos v1 (Visão geral, Máquina, OS); Projetos depois do escopo | cada uma vira uma base nova; precisam do kit e da ficha prontos | testes no padrão do `tbases` (gravação, conflito, backup) |

Em todas as fases:
- mudanças pequenas e aditivas;
- a Produção só pelo `build.py`;
- o kit pelo `aplicar_kit21.py`;
- versão e documentação de cada página atualizadas;
- registro de decisões alimentado.

---

## 9. Decisões que preciso de você

1. **Ordem das fases:** concorda em começar pela Fase 0 (correções) e ir direto para a integração por ordem (Fase 2), deixando a interface por perfil para depois?
2. **Meta FY27:** posso tirar a importação da Produção, ficando só a do Portal (C3)?
3. **Ações (D3):** um quadro de ações único (Waste, Paradas e Iniciativas) ou cada página com a sua?
4. **Reunião diária no Portal:** quer essa aba nova? Quem conduz (liderança por turno ou gerência por dia)?
5. **Equipamentos:** existe exportação dos relatórios das máquinas? Se não, começo só pelo que já existe.
6. **Projetos:** quem define o escopo e quando?
7. **Backup diário do Portal (B10):** a pílula de aviso no cabeçalho serve?

**Nada foi implementado.** Aguardo sua aprovação para começar.

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

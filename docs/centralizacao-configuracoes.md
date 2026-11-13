# Centralização das configurações no Portal · varredura

05/11/2026 · análise das abas de configuração de Produção 2.2.3, Waste 1.8.5, Gestão de Gel 1.94 e Paradas 1.0.4, comparadas com o cadastro do Portal 1.7.7. **Nada foi alterado ainda.**

## 1. Regra

- **Vai para o Portal:** cadastros gerais e regras comuns a mais de uma página (estrutura, turnos e pausas, catálogos, equipamentos, códigos de parada, metas, câmbio, logo, parâmetros comuns). É cadastrado uma vez, com vigência e auditoria.
- **Fica na página:** o que só ela usa. Isso inclui os parâmetros do próprio cálculo, as preferências de exibição, as regras de importação do próprio relatório e a pasta, os backups, a auditoria e o modo exemplo da própria base.
- **Como aparece na página o que foi para o Portal:** fica visível só para leitura, com o botão **"Editar no Portal ↗"**, que abre direto o cadastro certo (ex.: `Portal.html#cadastros/paradas/REF`). O formulário e o código de edição saem da página.
- **Transição sem quebrar:** enquanto o Portal não tiver o dado, a página continua usando o que já tem. Quando o cadastro tiver o dado, ele vale e a página avisa que a cópia local ficou sem uso.

## 2. Duplicidades encontradas (risco hoje)

| Cadastro | Onde existe hoje | Risco |
|---|---|---|
| Turnos | Produção (com pausas), Gestão de Gel (com pausa fixa e abono), Portal (sem pausas) | **3 definições** de horário e pausa: o OEE e o gel podem calcular horas diferentes |
| Catálogos | Produção (PPH), Gel (lote, velocidade, formato, BOM do gel), Portal | 3 listas; PPH e lote podem divergir |
| Máquinas / equipamentos | Produção (máquinas), Gel (equipamentos da linha), Portal (equipamentos) | 3 listas, códigos diferentes |
| Códigos de parada | Produção (tipos de parada com as regras), Portal (códigos com as mesmas regras D/P/Q) | Duas fontes da mesma classificação |
| Logo | Produção, Waste, Gel, Paradas, Portal | 5 uploads |
| Nome do usuário | Produção (Usuário), Waste (Seu nome) | Já substituído pelo **Entrar pelo ID** |
| Semáforo | Produção (parâmetros e por meta), Portal (semáforo comum) | Cores diferentes entre páginas |
| Microparada | Portal (5 min), Paradas (campo próprio, usado se o Portal não tiver) | Baixo (Paradas já lê o Portal primeiro) |
| Matriz de paradas | Portal, Paradas (cópia na config) | Baixo |

## 3. Varredura por página

### Produção (Configurações: 14 seções)

| Item | Destino | Portal hoje |
|---|---|---|
| Base de dados | fica | — |
| Usuário › nome | **sai** (Entrar pelo ID) | feito (kit v2) |
| Usuário › exibição das quantidades | fica (preferência) | — |
| Estrutura › logo | **Portal** | já tem (Configuração do Portal) |
| Estrutura › unidade, setor, fuso | **Portal** | já tem (Parâmetros) |
| Estrutura › calendário aplicável | **Portal** | criar (dias de produção / feriados) |
| Estrutura › linhas | **Portal** | já tem |
| Estrutura › máquinas e equipamentos | **Portal** | já tem (Equipamentos, papel OEE) |
| Estrutura › famílias | **Portal** | já tem |
| Turnos › horário, dias, vigência, cor | **Portal** | já tem |
| Turnos › pausas (desconta ou não, dias) | **Portal** | **criar** `turnos.vigencias[].pausas[]` com **código de parada** (REF/REV: só o excedente conta no OEE) |
| Turnos › somar pedaço final (tailMergeMax) | fica (regra de cálculo) | — |
| Catálogos | **Portal** | já tem (PPH, tubos/caixa, caixas/lote com vigência) |
| Metas e capacidades (OEE meta, PPH por máquina/família/catálogo, meta diária, cobertura, divergência) | **Portal** | **criar tipo Metas** |
| Tipos de parada | **Portal** | já tem (Códigos de parada + Matriz). **Faltam** as regras de apontamento: exige observação, exige horário, duração manual, catálogo anterior/seguinte, aparece no relatório |
| Parâmetros › verde/amarelo | **Portal** (semáforo comum) | já tem |
| Parâmetros › servidor: peças por caixa | **Portal** (catálogo, tubos por caixa) | já tem |
| Parâmetros › limite de parada longa | **Portal** (comum com Paradas) | criar `parametros.paradaLongaMin` |
| Parâmetros › unidade de lançamento, rótulo, arredondar metas, cobertura e divergência padrão, modo da performance, premissa de velocidade, pendências, tolerâncias do servidor, releitura, TV | fica | — |
| Abas, Importação (xlsm), Exportação, Auditoria, Modo exemplo, Ajuda | fica | — |

### Waste

| Item | Destino | Portal hoje |
|---|---|---|
| Pasta da rede, Backups, Ambiente de teste | fica | — |
| Logo | **Portal** | já tem |
| Seu nome | **sai** (Entrar pelo ID) | feito (kit v2) |
| Valores em R$ nos cards e nas tabelas | fica (preferência) | — |
| Regra de sinal, desvio usado, formato dos números, versão vigente, grupos de custo, moeda padrão, nomes de cabeçalho | fica (importação da KKBC_ORD) | — |
| Limites de criticidade | fica (próprios do Waste) | — |
| Meta de perda líquida por mês | **Portal** | criar no tipo Metas (indicador Waste) |
| Tipos de item (agrupar componentes por palavra) | **Portal** (Materiais › Tipo) | já tem o campo. A regra por palavra fica só como reserva para material não cadastrado |
| Causas de perda | fica | — (avaliar depois uma lista única de causas por módulo) |

### Gestão de Gel

| Item | Destino | Portal hoje |
|---|---|---|
| Geral (vencimento, próximos, janela de consumo, hold) | fica | — |
| Logo | **Portal** | já tem |
| Aparência, Modo TV, Abas, Pasta, Backup | fica | — |
| Programação (barris/dia, cabeçotes, remanescente, bomba, altura) | fica | — |
| Turnos e ritmo › turnos (início, fim, pausa fixa, dias, vigência) | **Portal** | já tem os turnos; **pausas a criar** |
| Turnos e ritmo › abono (tempo que não conta no OEE) e motivos de abono | **Portal** | criar junto com as pausas (abono padrão por dia, motivo = código de parada planejada) |
| Turnos e ritmo › meta sem histórico (tubos/dia) | fica (planejamento do gel) | — |
| Parâmetros de processo (perdas %) | fica | — |
| Preço do gel › cotação | **Portal** | **feito** (Câmbio, 1.7.7) |
| Preço do gel › US$/kg | fica por ora | avaliar "preço de material com vigência" se outra página precisar |
| Locais (zonas do SAP) | fica | — |
| Catálogos › número, descrição, formato, lote padrão, velocidade, situação | **Portal** | já tem (nome, formato, tubos/caixa × caixas/lote, PPH) |
| Catálogos › BOM do SAP (kg de gel) e tolerância | **Portal** (BOM da CS12, componente gel) | já tem a BOM; falta o Gel ler o componente com Materiais › Tipo = gel |
| Catálogos › gel aplicado (g/tubo) com vigência, cor da pílula | fica | — |
| Formatos de tubo (peso dos componentes por formato) | fica (a lista de formatos vem de Catálogos › Formato) | — |
| Equipamentos da linha › lista | **Portal** | já tem |
| Equipamentos da linha › descartes, composição, categoria, embalagem | fica (ligado pelo código do equipamento do Portal) | — |
| Motivos de descarte | fica | — |

### Paradas

| Item | Destino | Portal hoje |
|---|---|---|
| Pasta, Backups, Limpar base, Ignorar antes de | fica | — |
| Limite micro/operacional | **sai** (Portal) | já tem (`limiteMicroMin`) |
| Fila técnica (operacional a partir de N min) | **Portal** | criar `parametros.paradaLongaMin` (mesma regra da Produção, a confirmar) |
| Horas programadas por dia | **sai** (calcula pelos turnos do Portal) | já tem os turnos |
| Máquinas: de-para (nome do Forms → equipamento) | **Portal** | criar `equipamentos[].apelidos` |
| Matriz de paradas (cópia local) | **sai** (Portal) | já tem |
| Logo | **Portal** | já tem |

## 4. O que o Portal precisa ganhar

1. **Turnos com pausas e abonos** (`turnos.vigencias[].pausas[]`: código de parada, início/fim ou duração, dias, desconta do planejado). Este item resolve também a regra REF/REV, em que só o excedente da pausa padrão conta no OEE.
2. **Tipo Metas** com vigência:
   - escopo: módulo, indicador, linha, máquina, família, catálogo;
   - indicadores: OEE meta, PPH (quando difere do catálogo), meta diária, cobertura, divergência, meta de Waste por mês (R$) e, futuramente, a meta de OSM por operador/mês.
3. **Códigos de parada:** regras de apontamento (exige observação, exige horário, duração manual, catálogo anterior/seguinte, aparece no relatório).
4. **Equipamentos:** apelidos (de-para do Forms).
5. **Parâmetros:** `paradaLongaMin` e calendário (dias de produção e feriados).
6. **Logo única:** a logo do Portal vai para a cópia do navegador (`vac.logo`), e todas as páginas usam essa (a Paradas já faz isso).
7. **Trazer das páginas** (uma vez, com prévia): carregar no Portal o que hoje está só nas bases da Produção (turnos, pausas, metas, catálogos, tipos de parada) e do Gel (turnos, catálogos, equipamentos), mostrando as diferenças antes de gravar.

## 5. Ordem sugerida

| Fase | Página | Conteúdo |
|---|---|---|
| A | Portal 1.8 | itens 1 a 7 da seção 4 · **feito em 05/11/2026** (calendário de produção ficou para depois) |
| B | Produção 2.4 | Estrutura, Turnos, Catálogos, Metas e Tipos de parada passam a ler do Portal (só leitura, com "Editar no Portal ↗"); sai o nome do usuário; semáforo e peças por caixa do Portal |
| C | Gestão de Gel 1.95 | turnos, abono, catálogos básicos, equipamentos e BOM do gel vindos do Portal |
| D | Waste 1.8.6 e Paradas 1.0.5 | logo, nome, meta de Waste, tipos de item por Materiais; Paradas sem horas/dia, matriz e limite locais, de-para pelo Portal |

## 6. Decisões do Pedro (05/11/2026)

1. **Microparada:** fica no Portal (já está). **Parada longa / fila técnica:** é o mesmo conceito nas duas páginas. Na Produção, o "limite de parada longa (30 min)" só filtra a lista "Paradas acima de 30 min" para análise de causa. Na Paradas, a "fila técnica" pede **ação** para toda parada operacional de 30 min ou mais. **Confirmado:** um parâmetro único no Portal, `parametros.paradaLongaMin` (30), usado nas duas. **Horas programadas por dia (sem OEE):** é só a reserva da Paradas para calcular MTBF e disponibilidade quando a base da Produção não foi lida (dias com apontamento × 17 h). Com os turnos e pausas no Portal o cálculo sai dos turnos, e o campo **sai**.
2. **Abono do Gel = pausa planejada do turno.** Vai para o Portal como pausa/abono do turno, **com código de parada**.
3. **Metas:** no Portal, mas **separadas por tipo de tratativa**:
   - Metas de OEE: % por linha, máquina, família ou catálogo, com PPH, cobertura e divergência;
   - Metas gerais da área: Waste em R$ por mês e outras metas gerais;
   - Metas de OSM: número de observações/tickets por operador por mês.
   Ficam como telas diferentes no Portal (grupo Metas), não num cadastro único genérico.
4. **Preço do gel (US$/kg):** vai para o Portal (preço de material com vigência). O Gel só consulta, com "Editar no Portal". A cotação vem do Câmbio do Portal (feito).
5. **Câmbio precisa ser simples** e aceitar cotações do ano fiscal passado. Feito no **Portal 1.7.8**, com quatro formas de cadastrar:
   - lista de cotações (a partir de · R$ por US$);
   - "Adicionar" com qualquer data, inclusive passada, sem pedir motivo;
   - preencher os 12 meses de um ano fiscal (out–set);
   - colar do Excel (data ou mês + cotação).
   "Corrigir" e "Excluir" mandam a linha antiga para Desativadas, que guarda a auditoria.


## 8. Fonte única (briefing de 09/11/2026 · Portal 1.9.9, Produção 2.4.23, Gel 2.15)

O "domínio vazio no Portal → a página usa o cadastro local" acabou: com o cadastro do Portal (ou na pasta), as Configurações da Produção ficam só consulta. O Gel liga catálogos (número) e equipamentos (código/nome) ao Portal. Migração por Trazer configurações (grupos "Só na Produção" e "Só no Gel"). Detalhes, PRD-04 e o que ainda fica no Gel (D10): [briefing-2026-11-09-fase0-fase1.md](briefing-2026-11-09-fase0-fase1.md) § 5.

## 7. Andamento (05/11/2026, fim do dia)

| Fase | Página | Situação |
|---|---|---|
| A | Portal 1.8 / 1.8.1 | feito. Turnos completos (intervalos do Hora a Hora, regra do pedaço final, horas brutas e produtivas), metas iguais às da Produção, preparação ligada à BOM, Matriz de paradas nova |
| B | Produção 2.4 | feito. Aplica o cadastro do Portal quando a revisão muda (CadSync) e deixa Estrutura, Turnos, Catálogos, Metas e Tipos de parada só para consulta |
| C | Gestão de Gel 1.95 | feito em parte: turnos, pausas, abono e preço do gel (com câmbio) vêm do Portal; config de Turnos e Preço só para consulta. **Falta:** catálogos básicos e lista de equipamentos do Portal |
| D | Waste 1.8.6 · Paradas 1.0.5 | feito: meta WASTE-MES, tipo dos materiais e logo no Waste; parada longa, tempo programado pelos turnos e outros nomes (de-para) na Paradas |

Pendente: importação da **Meta OEE FY27** no Portal (hoje só pelo Trazer, a partir da Produção); calendário de produção; Gel ler catálogos e equipamentos do Portal; nova varredura das páginas depois de o Pedro usar com os dados reais.

## Calendário de produção (13/11/2026, Portal 1.9.35 / Produção 2.4.73)

Feito o item que tinha ficado para depois. Portal › Cadastros › **Calendário de produção** (`calendario`): um registro por dia, código = data `AAAA-MM-DD` (texto), `tipo` `sem produção` | `dia extra`, `nome` = motivo, `ativo`. A Produção aplica pelo `CadSync` (`cad_sync.js`) quando muda a `rev`:
- o dia vai para `db.calendar` com `origin: 'portal'` (mesma marca que o Plano do mês usa: sai do plano e do OEE, ou entra como dia extra);
- no Plano do mês esse dia fica travado ("vem do Calendário de produção do Portal… edite no Portal");
- dia já fechado ou com lançamento não vira "sem produção": fica de fora, contado no aviso da sincronização e em `settings.calIgnorados`;
- inativar o dia no Portal tira a marca que veio de lá; a marca local do mesmo dia é substituída pela do Portal (fonte única);
- `exports.calendario[].origem` = `portal` | `producao` (aditivo).
As marcas feitas na Produção antes continuam valendo (não há "Trazer configurações" do calendário). Teste: `testes/tcalendario.js`.

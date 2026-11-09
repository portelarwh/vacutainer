# Arquitetura de integração · Sistemas da Linha Vacutainer

Proposta de 29/10/2026 (atualizada em 02/11/2026). Vale para OEE-Vacutainer, Gestão de Gel e as próximas páginas (Perdas por ordem, Paradas de máquina e manutenção, Portal).

## 1. Princípio

Cada página é um **módulo** com sua própria base JSON na pasta da rede. Os módulos **leem** dados uns dos outros, mas **só gravam na própria base**. Isso evita conflito de gravação entre páginas e permite evoluir cada uma separadamente. Mais tarde, os módulos podem ser juntados num único sistema, porque todos seguem o mesmo contrato.

## 2. Estrutura da pasta

**Decidido em 01/11/2026: pasta única** (todos os HTML, todas as bases, o cadastro base, `lib/`, `Logo.png` e `00. Backups/<Módulo>/`), com entrada pelo Portal (atalho do Windows). Detalhe e migração em "Cadastro base · contrato" § 2. **Portal 1.1 (02/11/2026)** já procura na raiz e, por um tempo, no local antigo (subpasta), avisando "local antigo"; OEE, Gel e Perdas ainda vão receber a mesma busca.

```
Vacutainer/
  Portal.html  OEE-Vacutainer.html  Gestão-Gel-Vacutainer.html  Perdas-Ordem.html  Modelo-Pagina.html
  Paradas.html  Maquinas.html  Manutencao.html  Projetos.html   (páginas novas)
  portal-base.json  oee-vacutainer-base.json  fifo-base.json  perdas-base.json
  vacutainer-cadastros.json        ← cadastro base (só o Portal grava)
  Logo.png   lib/   Equipamentos/<código>/   00. Backups/Cadastros|Portal|OEE|Gel|Perdas/
```

## 3. Chaves comuns (o "idioma" entre as páginas)

| Chave | Formato | Exemplo |
|---|---|---|
| Data operacional | AAAA-MM-DD (na tela sempre DD/MM/AAAA) | 2026-10-27 |
| Mês | AAAA-MM | 2026-11 |
| Turno | código | T1, T2, T3 |
| Catálogo | 6 dígitos (no PCP vem como NS + catálogo) | 360060 |
| Família | código | EDTA, SST |
| Ordem (Work Order PCP) | número | 110834720 |
| Lote | número | 6279776 |
| LP (barril) | número | 40194830745 |
| Equipamento | código | EQ01 (Tullip A) |
| Código de parada | código | FME, TRL, REV, RTB |

## 4. Contrato de dados

- **Cadastro base** (`vacutainer-cadastros.json`, decidido em 01/11/2026): catálogos, famílias, materiais, BOM/lista técnica, equipamentos, turnos e códigos de parada, por código e com vigência. **O Portal é o dono e o único editor** (aba Cadastros, edição com senha); as outras páginas leem e consultam travado, com "Editar no Portal", e guardam localmente só o que é delas. Contrato completo em "Cadastro base · contrato". Até o arquivo existir, o OEE publica `exports.cadastros` (carga inicial). **Aba Cadastros feita no Portal 1.1 (02/11/2026)**: carga inicial a partir das páginas, importação colada do SAP (BOM CS03 e materiais), senha, gravação segura com fila e backup, links `Portal.html#cadastros/<tipo>/<código>`.
- **Bloco `exports` em cada base**: resumo estável e versionado (`exportsVersion`) que as outras páginas leem. Nenhuma página lê a estrutura interna da outra, só o `exports`.
  - OEE publica: produção boa, scrap, abono, sem produção e OEE **por dia, turno e catálogo**; paradas por equipamento; **plano do mês** (inicial e atual, por catálogo e família); **calendário** (dias sem produção programada e dias extras); **ordens do plano do PCP** (ordem, lote, catálogo, quantidade, início/fim previstos e reais); **lotes** (histórico do servidor, retrabalho por dia, observações).
  - Gel publica: **ordem ↔ lote ↔ catálogo ↔ período de produção** (pelos barris consumidos), consumo de gel e scrap de gel por ordem.
  - Manutenção publicará: paradas de máquina, MTBF/MTTR por equipamento.
- **Links profundos**: cada página abre direto num item pelo endereço.
  - `OEE-Vacutainer.html#dia=2026-10-27` · `#turno` (tela do operador)
  - `Gestão-Gel-Vacutainer.html#lp=40194830745`
  - `Perdas-Ordem.html#ordem=110834720`
  Em qualquer página, clicar numa ordem abre a análise dela.

## 5. Fluxos combinados

1. **OEE → Gel** (aprovado): o Registro de produção do Gel passa a ler do OEE os tubos bons por turno, abonos e "sem produção". Fim da digitação em dobro.
2. **Ordens no hora a hora**: a ordem e o lote aparecem no hora a hora do OEE, sugeridos pelo início/fim real (ou previsto) das ordens do plano do PCP e pelo catálogo (editável). O Gel confirma pelo consumo de barris.
3. **Perdas por ordem** (nova página): junta, por ordem, a produção, as paradas, as perdas em minutos e o scrap (OEE), o gel e o scrap de gel (Gel) e os dados do SAP.
4. **Paradas → Máquinas → Manutenção (TPM)** (páginas novas, 03/11/2026): Paradas faz a análise completa das falhas e paradas de máquina e alimenta Máquinas (histórico por equipamento) e Manutenção (plano TPM); equipamentos vêm do cadastro base do Portal. **Projetos** acompanha as melhorias ligadas a perdas, paradas e OEE. Padrão e decisões em aberto em "Páginas novas" (`claude/paginas-novas.md`).
5. **Portal**: indicadores de cada módulo, pendências consolidadas, links e uma TV geral.
6. **Servidor (MES) → OEE**: dados da estação de medição entram no OEE como sugestões (seção 8).

## 6. Caminho para um sistema único

- Agora: páginas separadas que compartilham o mesmo **núcleo** (pasta da rede, cache, backup, conflito de versão, ajuda ⓘ, tabelas, gráficos, visual).
- Quando houver 4 módulos estáveis: um único HTML com os módulos como abas, mantendo uma base por módulo. Como o contrato já é o mesmo, a junção não muda dados.

## 7. Decisões registradas

- OEE é a fonte da produção por turno; o Gel lê do OEE.
- Ordem e lote: entram no OEE pelo plano do PCP colado no Plano do mês (CENTRO, CÓDIGO, DESCRIÇÃO, ORDEM, LOTE, QTDE, UMB, …, INICIO, FIM, INÍCIO REAL, FIM REAL; centro e eficiência ignorados; números com vírgula de milhar e datas DD/MM ou MM/DD detectadas pela coluna). Início e fim reais: pontuação manual ou servidor confirmado > apurado da produção lançada (continuidade da ordem em andamento > janela prevista mais próxima). O Gel continua ligando ordem e lote aos barris consumidos.
- **Calendário: uma marca por dia** (`calendar` na base do OEE). "Sem produção programada" (sem plano, feriado, parada programada…) tira o dia do plano e de todos os resultados (OEE, metas, painéis, relatórios); os dados lançados ficam guardados e voltam a contar com "Iniciar produção". "Dia extra" inclui um dia fora dos dias de trabalho. Plano do mês, Lançamento, Pendências e tela do operador leem a mesma marca.
- **Turno sem produção**: programado (sai do planejado e do OEE; todos os turnos programados = dia sem produção no calendário) ou não programado (falta de material, quebra, falta de operador: o tempo do turno conta como parada do código escolhido no OEE e no Pareto; no plano o dia segue disponível).
- Visões compartilhadas do painel: qualquer pessoa edita, fica registrado quem salvou (igual ao Gel).
- Plano do mês: informado por catálogo e/ou família; o total do mês é a soma. A 1ª versão é o plano inicial (congelado quando o mês começa); mudanças posteriores viram revisões com motivo. Cálculo igual à aba CALC: dias disponíveis = dias de trabalho − sem produção programada + extras; necessidade/dia = plano atual ÷ dias disponíveis; saldo = realizado − necessidade × dias decorridos. Fica na base do OEE (`monthPlans`, com `orders`).
- Conferência de turno: o operador conclui ("pendente de conferência") e a liderança fecha ou devolve com motivo, pela aba Pendências.
- Turnos: editar uma vigência vale para dias criados depois (dias existentes guardam os intervalos que usaram; os em aberto sem produção podem receber o novo formato); "Nova vigência" muda só a partir da data. Turnos que passam da meia-noite pertencem ao dia em que começam.
- Exibição: datas sempre DD/MM/AAAA; quantidades em milheiros (padrão) ou número completo, por pessoa; valor abaixo da meta em vermelho nos quadros; coluna verde/vermelha nos gráficos com meta.
- OSM, KAS e 5S: "em construção" por enquanto; KAS só para o dashboard da diretoria.
- **Retrabalho (política da empresa)**: retrabalho não existe para o OEE. O tempo do lote de retrabalho no dia (1ª à última caixa, dentro dos turnos) vira parada **RTB · Retrabalho (fora do OEE)**, que desconta do tempo planejado e fica fora do Pareto; as peças não contam (a produção da hora fica só com lotes normais). Ex.: 10 h de turno com 9 h de retrabalho → só 1 h entra no planejado e só o que foi feito nela conta. Vale **por dia**. Trocas ligadas ao retrabalho: a entrada sai do OEE; a saída sai quando volta para o mesmo catálogo (X → retrabalho → X); se vai para outro catálogo (X → retrabalho → Y), a saída fica como troca normal, porque X → Y existiria de qualquer jeito. A sugestão é conferida e decidida pelo usuário. Um lote pode ser interrompido por retrabalho várias vezes e retomado: continua uma ordem só, com vários trechos.
- **Lançamento manual continua sendo a base**: o operador lança como sempre; os dados do servidor chegam quando der e só comparam e sugerem.
- **Gravação e conflito (01/11/2026, após auditoria externa)**: uma alteração feita durante uma gravação nunca é dada como salva (a gravação só marca "salvo" se nenhuma alteração nova chegou; senão grava de novo). Se outra pessoa gravou antes, as alterações desta sessão são **reaplicadas sobre a versão nova** (padrão comum do Portal) e o fato fica na auditoria; só quando não dá para reaplicar (ex.: alterações recuperadas do navegador depois de fechar, ou alteração que não cabe mais) a tela de conflito pede decisão. Trava total entre usuários só com servidor de banco de dados (avaliar junto com a tabela SQL do MES).
- **Digitação de quantidades**: segue "61 ou 61.000" (milheiros abaixo do limite, peças com o ponto). Proteções: prévia do valor convertido embaixo do campo ("= 61.000 peças") e recusa de valor acima do possível (hora: PPH × minutos × 1,5; plano: PPH × 24 h × 31 dias × 1,2; qtde real da ordem: 1,5 × a ordem), mostrando a leitura alternativa.
- **Validação da base**: estrutura obrigatória (listas, tipos, datas AAAA-MM-DD, intervalos numéricos) conferida sempre; arquivo trazido pelo usuário (importar / abrir arquivo) também precisa passar na integridade. Base antiga é completada por migração explícita: registrada na auditoria e gravada com backup.
- **Bloco `exports` do OEE publicado** (contrato em "Portal e padrão comum" § 4) e links pelo endereço `#dia=`, `#ordem=`, `#lote=`, `#plano=`, `#pend=servidor`; número da ordem abre a página de Perdas.
- **Cadastro base no Portal (02/11/2026, Portal 1.1)**: só a aba Cadastros grava no `vacutainer-cadastros.json`. Cada alteração vira uma operação numa fila (com o valor antes e depois); a gravação relê o arquivo, reaplica a fila sobre a versão mais nova, faz backup em `00. Backups/Cadastros/`, grava `rev + 1` com um `revId` novo e relê para conferir (se outra pessoa gravou a mesma rev ao mesmo tempo, reaplica). Tela de conflito só quando os dois mudaram a mesma informação. Edição com senha (hash SHA-256 de salt + senha no arquivo), desbloqueio por aba do navegador que expira com 30 min sem uso, troca obrigatória da senha inicial.
- **PPH, fotos e materiais (02/11/2026)**: PPH técnico (`pphNominal`) no cadastro por catálogo e vigência; a meta do OEE usa esse PPH, salvo quando a meta traz PPH próprio (o dia fechado guarda qual valeu; diferença > 5 % vira pendência). Fotos e documentos de equipamento em `Equipamentos/<código>/`, com só o caminho no cadastro. Materiais: só os da BOM da linha (mais os incluídos de propósito, ex.: itens da KKBC); o mestre inteiro do SAP não entra.

## 8. Dados do servidor (MES) · decidido em 30/10/2026

- **Fonte hoje**: CSV exportado do historiador, formato longo: `Time, VAEB01_MES_Catalogo_Atual, VAEB01_MES_Lote_Atual, VAEB01_MES_Caixa_Atual`. Cada linha traz só o sinal que mudou. Data M/D/AAAA 12h (convertida). Linhas `(null)` = servidor sem leitura (ignoradas); releitura completa sem mudança é ignorada. **Depois**: tabela SQL com as mesmas colunas (+ linha, + rejeito no futuro); só troca a fonte.
- **Nº da caixa** = contagem dentro do lote: volta a 1 no lote novo e continua na retomada. Distingue pausa (noite parada) de interrupção (outro lote no meio). Leituras fora de sequência que voltam à numeração em seguida são ruído e são ignoradas.
- **1 caixa = 1.000 peças** (parâmetro `serverBoxQty`; lotes de 1.260 caixas = QTDE 1.260.000 do PCP; 360060/360051 com 900).
- **Setup** = última caixa do lote → 1ª caixa do próximo. O registro no MES divide em "fim → MES" e "MES → 1ª caixa". Troca acima de `serverSetupMax` (240 min) é marcada como "inclui parada longa" e fica fora da média.
- **Guardado na base do OEE** (`server`): trechos de lote com o minuto de cada caixa compactado (~50 KB/mês), trocas do MES, paradas sem caixa > `serverGapMin` (10 min), classificação dos lotes (`lotClass`), marcação por dia (`dayLot`), observações (`lotNotes`) e decisões das divergências (`decisions`). Reimportar um período substitui o trecho coberto (sem duplicar).
- **Servidor só sugere**: produção boa por intervalo (só lotes normais), catálogo nos pontos de troca, paradas (TRC/TRL pré-preenchidas; sem caixa desmarcadas), início/fim/qtde real das ordens. O usuário marca e confirma; auditoria com origem "servidor (confirmado)".
- **Hora a hora × servidor**: tolerância `serverHourTol` (2 caixas). Diferença que se compensa na hora vizinha do mesmo turno é linha de corte da hora ("≈ srv", sem aviso). Só avisa ("⚠ srv") quando passa da tolerância e não compensa.
- **Lote sem ordem em nenhum plano**: fica "a confirmar" até o usuário classificar como retrabalho, produção normal ou ignorar. Enquanto isso não entra na produção sugerida.
- **Divergências com decisão** (Pendências › Servidor × plano × lançamento): lote sem ordem; lote acima do planejado; lote parado abaixo do planejado (encerrado ou vai voltar); catálogo do MES ≠ plano; início/fim real da ordem ≠ servidor (> 30 min); ordem prevista sem caixas (reprogramada ou cancelada); produção do dia ≠ servidor; caixas fora dos turnos lançados; retrabalho marcado sem RTB. Cada uma fica aberta até uma decisão (algumas corrigem direto, outras pedem motivo); dados novos reabrem; decididas podem ser reabertas.
- **Aba Lotes** (histórico de todos os lotes do servidor): filtro por situação/mês/busca, dias em que cada lote rodou com check de retrabalho por dia, situação do lote inteiro e observação. A mesma marcação aparece no Lançamento.


## SQDCP · Produção 2.4.20 (09/11/2026)

A Produção é dona das respostas de acidente/QN e das definições/medições manuais do quadro. Publica `exports.sqdcp` (120 dias, turnos e consolidação diária com cobertura explícita). O quadro lê somente os exports de Waste, Gel e Iniciativas, com referência de competência/posição atual; não grava nessas bases. Detalhes em [producao-sqdcp.md](producao-sqdcp.md).

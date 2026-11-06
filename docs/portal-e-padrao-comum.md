# Portal e padrão comum · Sistemas da Linha Vacutainer

31/10/2026 (atualizado em 02/11/2026: Portal 1.1 com a aba Cadastros e a pasta única; 1.2 com Versões das páginas; 1.3 com o cabeçalho comum). Complementa a "Arquitetura de integração" (seções 1 a 8) e o "Cadastro base · contrato".

## 1. Arquivos

**Pasta única (decidida em 01/11/2026; Portal 1.1 já trabalha assim):**

```
Vacutainer/                         ← pasta escolhida no Portal
  Portal.html     + portal-base.json      (só configuração, comentários de relatório e logo)
  OEE-Vacutainer.html + oee-vacutainer-base.json
  Gestão-Gel-Vacutainer.html + fifo-base.json
  Perdas-Ordem.html + perdas-base.json
  Paradas.html · Maquinas.html · Manutencao.html · Projetos.html  (+ paradas-base.json …; páginas novas, ver "Páginas novas")
  Modelo-Pagina.html                       (ponto de partida para páginas novas)
  vacutainer-cadastros.json                (cadastro base; só o Portal grava)
  Logo.png                                 (aparece em todas as páginas abertas pela pasta)
  lib/  xlsx.full.min.js · jspdf.umd.min.js · jspdf.plugin.autotable.min.js
  Equipamentos/<código>/                   (fotos e documentos dos equipamentos)
  00. Backups/Cadastros|Portal|OEE|Gel|Perdas|Paradas|Maquinas|Manutencao|Projetos/
```

O Portal procura a base de cada módulo primeiro na pasta principal e, **por um tempo**, também no local antigo (subpasta guardada ou qualquer subpasta de 1 nível), mostrando "local antigo" no cartão, no topo, nas pendências e em **Configuração › Pasta única** (o que mover e para onde). O caminho encontrado do HTML vira o link usado por todas as páginas (lista comum `vac.sistemas` no navegador; caminho simples quando o módulo está na pasta principal). Módulo fora da pasta: "Pasta do módulo…" em Configuração › Módulos.

**Biblioteca de planilhas**: `lib/xlsx.full.min.js` deve ser a SheetJS **0.20.3** (baixar de `https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js`; o npm só tem a 0.18.5, que tem falhas de segurança conhecidas). O OEE avisa quando encontra uma versão até 0.19.2.

## 2. Núcleo comum (Portal, Modelo e Perdas)

- Visual do OEE/Gel: tokens de cor com tema claro/escuro/automático (`vac.theme`, vale para todas as páginas), Barlow / Barlow Condensed / IBM Plex Mono, barra superior com título em caixa alta + subtítulo + versão, status em pílulas, abas em caixa alta, KPIs, tabelas, filtros. Acabamento (cantos, sombra, fundos suaves, cartões de KPI, ação prioritária): seção 6.
- **Cabeçalho comum `vac-cabecalho v1` (decidido em 02/11/2026, opção 2; feito no Portal 1.3)**: faixa escura igual em todas (logo, "Sistemas · Linha Vacutainer", páginas Portal · OEE · Gel · Perdas · Cadastros como abas, links na mesma aba, busca Ctrl K, usuário, tema), faixa branca da página (título, subtítulo, versão clicável → Versões, pílulas de status, Sincronizar · Backup · TV) e as abas da página. Bloco copiado igual em cada HTML; código e passo a passo em **"Kit · cabeçalho comum e backups por módulo"** (`claude/kit-cabecalho-e-backups.md`). O quadro de Versões do Portal mostra a versão do cabeçalho de cada página. Nome do usuário comum (`vac.user`).
- Pasta da rede: base JSON + cópia no navegador, gravação pendente quando a pasta não responde, conflito por `rev` (reaplica a alteração sobre a versão nova), backup em `00. Backups/<Módulo>/` (`PAGE.backupDir`; diário `<base>_AAAA-MM-DD.json`, botão `<base>_AAAA-MM-DD_HHhMM.json`, antes de restaurar `<base>_antes-restaurar_AAAA-MM-DD_HHhMM.json`; cada página lista só os próprios, os antigos soltos em `00. Backups/` aparecem como "local antigo"), restaurar/baixar cópia. **Uma alteração feita enquanto a gravação está em andamento nunca é dada como salva**: a gravação só marca "salvo" se nenhuma alteração nova chegou durante ela; senão grava de novo (corrigido no OEE em 01/11/2026; no Portal 1.1 as gravações da própria base entram numa fila e acontecem uma de cada vez; conferir no Gel e no Modelo).
- Logo: `Logo.png` na pasta > imagem enviada na base > imagem enviada em outra página.
- Ajuda ⓘ clicável (mesma janelinha do OEE).
- **Modo TV** (igual ao OEE): slides que giram a cada 20 s e se atualizam, relógio, ←/→, Esc; abre também por `#tv` no endereço.
- **Relatórios** (molde do OEE): prévia na tela → PDF (A4 deitado, logo, comentário em destaque, tabelas com destaque vermelho, gráficos, número de página), Excel (aba Resumo + uma aba por tabela, números como valores), copiar texto (WhatsApp/Teams), copiar para Outlook (HTML), imprimir. Comentário salvo na base por relatório.
- Destaque: fora do ideal = fonte vermelha (`hl1`/`hl2`); bem acima = linha vermelha com fonte branca (`hl3`).
- Avisos (toasts) empilhados no rodapé; janela (modal) com `guard` (pergunta antes de fechar com alteração não salva) e `onClose`.

## 3. Portal

- **Visão geral**: um cartão por módulo com 4 números, gráfico e atalhos (OEE: tela do operador; Gel: TVs; Perdas: Comparativos, Ações), e as pendências da linha.
- **Pendências** consolidadas: OEE (turnos aguardando conferência, lançamentos abertos de dias anteriores, divergências servidor × plano × lançamento), Gel (barris vencidos e vencendo, baixa pendente, relatório SAP antigo), Perdas (ações vencidas, ordens altas/críticas sem causa), **Portal** (cadastro não criado, alterações do cadastro não gravadas ou em conflito, senha inicial não trocada, problemas da conferência do cadastro, base de módulo em local antigo).
- **Relatórios**: Resumo da linha e Pendências da linha. **TV geral**: visão geral + um slide por módulo.
- **Cadastros (1.1, 02/11/2026)**: dono e único editor do `vacutainer-cadastros.json`. Resumo, listas por tipo com busca/filtro/Excel, ficha com vigências e histórico, Importar do SAP (BOM CS03 e materiais), Auditoria, Backups, Segurança (senha, editores, parâmetros). Edição com senha por aba do navegador (30 min sem uso), gravação segura com fila, conferência de `rev`/`revId`, backup em `00. Backups/Cadastros/` antes de cada gravação. Links `#cadastros/<tipo>/<código>`. Detalhes no "Cadastro base · contrato" § 4.
- **Configuração**: pasta, logo, nome, **Versões das páginas**, módulos (caminho, pasta própria, ocultar) e **Pasta única** (o que ainda está no local antigo).
- **Versões das páginas (1.2, 02/11/2026)**: para cada página, o HTML achado (pasta principal e subpastas), a versão escrita no próprio arquivo, a data do arquivo, e da base: rev, última gravação (quando e quem), versão que gravou e se publica o `exports`. Avisa: esta janela diferente do `Portal.html` da pasta (ex.: aberto de Downloads), cópias repetidas de HTML ou base, base gravada por outra versão, HTML não encontrado, base sem `exports`, `lib/xlsx` antiga. Colunas **Cabeçalho** (v1 ou antigo) e **Último backup** (pasta do módulo ou local antigo; avisa se o último foi para `00. Backups/` solto ou se faz mais de 3 dias). Toda mudança de versão do HTML (ou da data do arquivo) e da versão que gravou a base entra no **histórico** (`portal-base.json › config.versoes.log`, últimas 500), com Excel. Também pelo endereço `Portal.html#versoes` ou clicando na versão no topo (que fica vermelha quando a janela não é a da pasta). Confere ao conectar, ao Sincronizar, a cada 5 min e em "Conferir agora".
- **Páginas novas (1.5, 03/11/2026)**: Paradas, Máquinas, Manutenção e Projetos na lista padrão, "em construção" até o HTML chegar na pasta (aí o Portal grava em `vac.sistemas` e todas as páginas passam a mostrar na barra, sem mudar o código delas). Ocultar em Configuração › Módulos. Página nova aparece no Portal pelo `exports` (`kpis`, `pendencias`, `serie`). Padrão em `claude/paginas-novas.md`.
- O Portal só lê as bases dos módulos; nunca grava nelas. Grava só `portal-base.json` e `vacutainer-cadastros.json`.

## 4. `exports` no OEE e no Gel

**Gel: feito na V1.89 (31/10/2026). OEE: feito em 01/11/2026.** Com o bloco presente, o Portal deixa de usar os dados brutos do OEE (some o selo "dados brutos") e passa a mostrar o OEE %.

**OEE** (`exports` na raiz de `oee-vacutainer-base.json`, recalculado a cada gravação; uma falha no cálculo nunca impede a gravação):
```
exports: { exportsVersion: 1, geradoEm, modulo:'oee', appVersion, linha:'line_vac',
  cadastros: { atualizadoEm, linhas:[{codigo,nome,unidade,setor}], familias:[{codigo,nome,cor,ativo}],
               catalogos:[{codigo:'360060',nome,familia:'SST',pph,cor,validoDe,validoAte,ativo}],
               turnos:[{codigo:'T1',nome,vigencias:[{de,ate,inicio,fim,dias,ativo}]}],
               equipamentos:[{codigo:'EQ01',nome,papel,ativo}],
               paradas:[{codigo:'FME',nome,categoria,subcategoria,cor,planejada,descontaPlanejado,afetaD,afetaP,afetaQ,pareto,ativo}] },
  porMes:  [{ mes:'AAAA-MM', dias, oee, oeeMeta, D, P, Q, boa, scrap, scrapPct, metaOp, atendimento, perdaMin }],   // 13 meses
  porDia:  [{ dia:'AAAA-MM-DD', oee, oeeMeta, boa, scrap, metaOp, status, origem:'lançado'|'importado' }],         // 120 dias
  porDiaTurno: [{ dia, turno:'T1', oee, boa, scrap, abonoMin, descontoMin,
                  semProducao: null|'programado'|'não programado', motivo, status }],                              // 60 dias
  porDiaCatalogo: [{ dia, turno, catalogo:'360060', boa, metaOp, oee, minutos }],                                    // 60 dias
  paradasEquipamento: [{ mes, equipamento:'EQ01', equipamentoNome, codigo:'FME', tipo, minutos, ocorrencias }],     // 90 dias, sem pausas/abonos/RTB
  calendario: [{ dia, tipo:'sem produção'|'extra', motivo }],                                                        // 120 dias
  planoMes: { mes, inicial, atual, realizado, ritmo, saldo, projecao, necessidadeDia, diasDisponiveis, diasDecorridos,
              porFamilia: [{ familia, inicial, atual, realizado, porCatalogo: [{ catalogo, inicial, atual, realizado }] }] },
  ordens:  [{ mes, ordem, lote, catalogo, qtd, qtdReal, inicio, fim, inicioReal, fimReal, fonteInicio, fonteFim, produzido,
              servidor: null|{ caixas, ultimaCaixa, trechos, inicio, fim }, retrabalhoDias:['AAAA-MM-DD'] }],          // mês atual e anterior
  lotes:   [{ lote, catalogo, caixas, pecas, trechos, inicio, fim, situacao:'normal'|'retrabalho'|'ignorar'|'pendente',
              retrabalhoDias, obs }],                                                                                 // servidor, 150 dias
  pendencias: [{ sev:1|2, txt, link:'dia=…' | 'pend=servidor' | 'plano=AAAA-MM' }],
  kpis: [[rótulo, valor, subtítulo, 'bad'|'good'|'']] }                                                               // OEE do mês · Produção × meta · Ritmo do plano · Pendências
```
- Quantidades sempre em peças; percentuais como fração (0,725 = 72,5%).
- `abonoMin` = só abonos; `descontoMin` = tudo que sai do tempo planejado (abono, refeição, retrabalho RTB…).
- Para o Gel: tubos bons por turno (`porDiaTurno.boa`), abonos (`abonoMin`) e sem produção (`semProducao` + `calendario`).
- **Cadastro mestre**: ~~o OEE é o dono (edição só em Configurações do OEE)~~ **substituído em 01/11/2026** pelo `vacutainer-cadastros.json` na pasta única, editado só no Portal (aba Cadastros, feita no Portal 1.1). O `exports.cadastros` do OEE serve para a **carga inicial** do cadastro e depois fica só como espelho de compatibilidade, até sair. As outras páginas leem por **código** (catálogo de 6 dígitos, EQ01, FME), nunca pelo id interno, e guardam localmente só o que é delas, preso ao código. Nada é apagado: sai de uso = `ativo:false`.

**Gel (V1.89)**: `fifo-base.json` começa com `{"rev":N,"revBy":"…","appVersion":"1.89", …}` e traz o bloco `exports`, recalculado a cada gravação:
```
exports: { exportsVersion: 1, geradoEm, modulo:'gel', appVersion,
  estoque:  { kg, barris, naLinha, disponivelKg, disponiveis, coberturaDias,
              porLocal:[{ local, kg, barris }] },                          // Gel 1.96; kg = saldo (relatório − retiradas parciais)
  vencendo: [{ lp, lote, validade, local, dias, kg }],                    // até "Atenção" dias (config warnDays)
  ordens:   [{ ordem, lote, catalogo, inicio, fim, tubos, tamanho, consumoKg, scrapKg, lps:[...],
               sapPrimeira, sapUltima, gPorTubo, indice, metaG, bomG, concluida, fonte }],   // últimos 150 dias
  pendencias: [{ sev:1|2, txt, link:'lp=…' | '' }],
  kpis: [[rótulo, valor, subtítulo, 'bad'|'good'|'']] }                   // Disponível · Na linha · Vencendo · Pendências
```
- `consumoKg` = gel baixado no SAP para a ordem (histórico de transações de LP); `null` sem histórico.
- `scrapKg` = scrap de gel estimado: scrap de cada dia do Registro de produção × parte dos tubos do dia que foi para o lote (PCP).
- Ordem ↔ lote: campo Ordem do lote no PCP, tabela "Ordens × lotes" (`config.woMap`) ou o lote da transação SAP.
- **Proposto para o Gel** (para a carga do cadastro): publicar também `exports.cadastros = { catalogos:[{codigo,nome}], materiais:[…], bom:[formato do contrato], gel:{material,nome} }`. Até lá, o Portal tira catálogos e BOM de gel (`bomG`) de `exports.ordens`.

**Severidade das pendências (contrato, vale para todo `exports.pendencias`)** · registrado em 06/11/2026 (Portal 1.8.3):
- `sev: 1` = **urgente** (vermelho), `sev: 2` = **atenção** (âmbar). É o que OEE, Gel e Paradas já publicavam (ex.: barril vencido = 1; vencendo em 30 dias = 2).
- Dentro do Portal a escala interna é a inversa (2 = urgente); a conversão é feita **na entrada** (`sevDoModulo`), nunca na página de origem. Mudar o significado de `sev` exige `exportsVersion 2`.

- `aPartirDe: 'AAAA-MM-DD'` (opcional, Portal 1.8.4): a pendência só aparece a partir desse dia. Serve para o que vence com o tempo sem nova gravação na página (ex.: ação do Waste com prazo). `tipo` (opcional) identifica a pendência para contagens (`acaoVencida`, `semCausa`).

**Série para o gráfico do Portal (`exports.serie`)**: lista `[{label, value, key}]` ou `{rotulo, pontos:[{x, y}]}` (Paradas; `x` = `AAAA-MM` vira mês).

**O Portal mostra o que a página publica (Portal 1.8.3)**: cartões, pendências e séries vêm do `exports` (OEE, Gel, Paradas e Waste). Os dados brutos só são somados quando a base não tem `exports` ou tem uma `exportsVersion` que o Portal não conhece; nesse caso o cartão mostra a pílula **dados brutos**.

Quando o `exports` existe, o Portal e a página de Perdas usam ele automaticamente (o leitor do Perdas já procura `ordem/lote` no `exports`).

**Gel (V1.89) também já faz**: aceita `#lp=` e `#ordem=` no endereço; números de ordem (histórico SAP, Gel por ordem) abrem `Perdas-Ordem.html#ordem=…` em outra aba; barra Sistemas no topo lida de `vac.sistemas` (aceita lista `[{id, nome, url}]` ou objeto `{gel:'…'}`; caminhos relativos à pasta raiz; sem a lista, links em cinza com caminho presumido); `vac.theme` e `vac.user` comuns; `lib/` local com a internet como reserva; conflito por `rev`.

**OEE (01/11/2026) já faz**: aceita no endereço `#dia=AAAA-MM-DD`, `#ordem=N` (abre o plano do mês da ordem e destaca a linha), `#lote=N` (aba Lotes), `#plano=AAAA-MM`, `#pend=servidor` e `#turno`; o número da ordem (Plano do mês e aba Lotes) abre `Perdas-Ordem.html#ordem=…` em outra aba, com o caminho lido de `vac.sistemas` (OEE em subpasta volta até a raiz); conflito reaplicando as alterações sobre a versão nova; barra Sistemas e busca Ctrl K (dia, ordem, lote, catálogo, tipo de parada, tela); `vac.theme`/`vac.user` comuns; acabamento da seção 6 (KPIs em cartão com status e ícone, Ação prioritária + Próximas decisões na Visão geral, pílulas suaves); abas agrupadas em Operação · Análise · Planejamento · Gestão.

**Falta**: OEE, Gel e Perdas lerem o `vacutainer-cadastros.json` (consulta travada + "Editar no Portal"; cópia em `vac.cadastros`, formato no contrato § 5) e aceitarem a pasta única com o local antigo. **Próximo passo Gel ↔ OEE**: o Registro de produção do Gel pode passar a ler tubos, abonos e dias sem produção do `exports` do OEE.

## 5. Página nova

Copiar `Modelo-Pagina.html`; o cabeçalho do arquivo tem o passo a passo (PAGE, vazio(), Store.commit, exports(), tvSlides(), relatórios) e os padrões (datas, mês, catálogo, cores de destaque). Página nova também define `PAGE.backupDir = '00. Backups/<Módulo>'` e lê o cadastro base (contrato § 5).

**Versão de cada página (para o quadro de versões do Portal)**: declarar a versão no HTML de um destes jeitos, nesta ordem de preferência: `PAGE = { …, versao:'1.2' }`, uma constante `APP_VERSION = '1.2'` (ou `VERSAO`/`VERSION`), ou `V1.90` no `<title>`. Gravar sempre `appVersion` na raiz da base (o Gel já faz). Sem isso, o Portal mostra "versão não identificada".

## 6. Acabamento visual (aprovado na Gel V1.90, 01/11/2026)

Vale para todas as páginas (Portal, OEE, Perdas, Modelo). Mesmas cores e fontes; muda o acabamento. Referência pronta no CSS da Gestão de Gel V1.90 (bloco "V1.90 · acabamento"). Aplicado no Portal 1.3 (cantos, sombra, KPIs em cartão; Ação prioritária e Próximas decisões ainda não).

- **Tokens novos**: `--r:10px` (cantos); `--sh` sombra leve (claro `0 1px 2px rgba(16,24,40,.06),0 2px 6px rgba(16,24,40,.06)`; escuro `0 1px 2px rgba(0,0,0,.35),0 2px 8px rgba(0,0,0,.25)`). Botões com cantos de 8 px.
- **Fundo suave** (`.tint` com `--tc`): `color-mix(--tc 13%, surface)`, texto `color-mix(--tc 82%, ink)`, borda `color-mix(--tc 30%, line)`. Usado em faixas, selos e números de lista. Funciona nos dois temas sem cor nova.
- **Indicadores (KPIs)**: cartões separados (espaço de 12 px), borda esquerda de 4 px na cor do status (ok, crítico, atenção, hold; neutro = accent) e ícone de 30 px no canto superior direito.
- **Topo**: barra Sistemas à esquerda e **busca** à direita (Ctrl K) que acha os itens principais da página de qualquer aba (no Gel: LP, lote, ordem).
- **Primeira tela da aba principal**: **Ação prioritária** (uma frase + botão; âmbar = ação, vermelho = crítico, verde = nada urgente) ao lado de **Próximas decisões** (3 pendências por gravidade, clicáveis, "Ver todas (N)"). Avisos grandes empilhados saem da tela e entram nessa lista.
- **Seções**: ícone + título em caixa alta + uma linha de subtítulo explicando o que a seção mostra.
- **Pílulas**: crítico continua cheio (vermelho); as informativas ficam suaves (fundo claro da cor, texto na cor).
- **Ícones**: SVG de linha desenhados dentro do arquivo (sem biblioteca, funciona sem internet).
- **Não muda**: cores, fontes, títulos em caixa alta, abas no topo, densidade das tabelas e colunas, Modo TV.

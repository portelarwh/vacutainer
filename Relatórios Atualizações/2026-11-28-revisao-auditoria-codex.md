# Revisão da auditoria técnica do Codex (28/11/2026)

**Origem:** [2026-11-28-auditoria-tecnica-codex.md](2026-11-28-auditoria-tecnica-codex.md), guardado sem alteração.
**Commit auditado:** `13eaa6e1b96bab27e3e82aabb45bbe96df8caf8f` (Plataforma 1.8.105).

**Método.** Cada achado foi conferido no código do commit auditado, numa cópia de trabalho separada. Usei as funções do próprio produto, a demonstração e dados fictícios. Leitura de pasta, falhas de leitura, armazenamento e respostas HTTP foram simulados quando necessário. Nenhuma base operacional foi aberta.

Depois da conferência, o responsável pediu as correções. Elas entraram nas versões 1.8.107 a 1.8.110, cada uma com testes novos. Cada teste novo falha no commit auditado e passa depois da correção.

**Ambiente.** Node v22.23.5, Playwright 1.63.0, Chromium 158.0.8127.36 (headless), Linux com 4 CPUs.

## Vereditos

Gravidade proposta:
- **Alta:** perde ou distorce dado sem aviso.
- **Média:** quebra uma função ou depende de condição pouco comum.
- **Baixa:** cosmético, ou depende de cenário raro (duas estações, por exemplo).

### A01 a A07 (prioridade alta)

| ID | Veredito | Evidência | Gravidade proposta | Referência de código |
| --- | --- | --- | --- | --- |
| A01 | Confirmado | Reproduzido (`gravacao-auditoria`, parte A01). Edição que entra durante a releitura de uma base gravada por outra estação some da gravação: `loadData` volta ao conteúdo da pasta e só a captura inicial (`chs`) é reaplicada. A fila termina vazia. Condição: outra estação ter gravado e haver edição durante a releitura. | Alta | motor/gel `fsFlush` |
| A02 | Confirmado | Reproduzido (`gravacao-auditoria`, parte A02): primeira leitura certa, releitura final com erro. O `catch` deixava `chk = null` e o laço tratava isso como base sem mudança, e gravava. Só uma revisão de outra estação entre as duas leituras é sobrescrita. Precisa de uma falha de leitura justo nesse intervalo. | Média | motor/portal `Store._commit` (C12) |
| A03 | Confirmado | Reproduzido. Dia fictício 19/11 sem produção informada: o `porDia` sai certo, com `semLancamento`. O mês sai com OEE 0, produção 0, scrap de 100% e `perdaMin` 1.020. Os turnos e o catálogo saem com produção 0 e OEE 0. O contrato manda ignorar o dia no consolidado. O teste `ausencia-producao` existente cobre só o `porDia`. | Alta | motor/oee `Exports.build` (porMes, porDiaTurno, porDiaCatalogo) |
| A04 | Confirmado | Leitura do código e prova na correção (`consolidados-auditoria`). Ao desfazer B na sequência A → B → C, as linhas que B tinha substituído (as de A) perdem o `sup`, e C continua vigente para a mesma ordem. A agregação soma as duas. | Alta | motor/perdas `undoImport` |
| A05 | Confirmado | Leitura do código e prova na correção. `buildExports` força BRL. Linha em USD sem cotação no mês fica na moeda original e entra na mesma soma. O aviso `MOEDA_FALTA` só aparece na tela. A Administração ainda somava os meses com `+m[k]\|\|0`. | Alta | motor/perdas `vigRowsAll`, `buildExports0`; motor/portal (indicadores do Waste) |
| A06 | Confirmado (por leitura) | O `refresh` da casca não descarta leitura atrasada. Se a leitura da pasta A termina depois da troca para B, ela repõe as fontes e o cadastro de A e marca `lidoDe`. Enquanto isso, `configureRuntime` combina a pasta B com o cadastro de A. Não automatizei a ordem de conclusão das duas leituras no navegador; a condição é trocar de pasta durante uma leitura lenta. Quem fica, por pasta: a casca guarda a pasta da última troca (`folder`). Antes da correção, guardava as fontes e o cadastro da leitura que terminasse por último. Depois, só a leitura mais recente da pasta ainda conectada. | Média | modulo/App `refresh` |
| A07 | Confirmado | Reproduzido (`ferramentas-auditoria`, no commit auditado). "Ana Lima", numa coluna desconhecida de texto curto (até 12 caracteres), virou `livre` e passou sem troca. A conferência verde procura só códigos com dígitos. Observado só na saída local da ferramenta. | Alta (privacidade) | ferramenta/comparar `tipoPorConteudo`, conferência `sobra` |

### A08 a A22 (demais achados)

| ID | Sintoma | Veredito | Evidência | Gravidade proposta | Referência de código |
| --- | --- | --- | --- | --- | --- |
| A08 | `mac_line` no lugar do MEDIDOR | Confirmado (mais amplo) | Além do `bindNoDay`, 14 pontos da Produção usavam `'mac_line'` fixo: criação do dia, importadores, simulações e meta. Com equipamento de papel OEE no cadastro, o `ProdCad` não cria `mac_line`. | Média | motor/oee (`pontoOee` novo) |
| A09 | fila vazia pula a reserva | Confirmado | `F.minhas()` devolve `[]`, que conta como verdadeiro no `\|\|`. | Média | motor/gel `fsUse` |
| A09 | base sumida recriada | Confirmado | `fsReadBase` devolve `null` para arquivo ausente, e o laço trata isso como sem mudança e grava com `create:true`. Reproduzido na parte A09 do teste. | Média | motor/gel `fsFlush` |
| A10 | linhas descartadas | Parcial | O descarte é proteção intencional: a versão esperada de cada evento é conferida, e o lote grava as contagens reais (`novas`/`atualizadas`). O defeito está na mensagem, que usava a contagem da prévia. | Baixa | motor/paradas importação |
| A11 | duas vigências com a mesma data | Confirmado (duas estações) | A tela recusa, mas a reaplicação `tagvig` aceitava. `vacCad.vigente` ordena só por `de`. | Baixa | motor/equip `applyOp` |
| A12 | Desfazer a marcação | Confirmado | `Store.commit` troca `op.id` por `uid('op')`, então `desfeito` procurava o id da operação. Nunca funcionou. Reproduzido. | Média | motor/linha `commit`, `applyOp` |
| A13 | vírgula entre aspas | Confirmado | Reproduzido: "Ajustar, limpar…" deslocou o responsável para o título. | Média | motor/inic `ImpAcoes.ler` |
| A13 | 31/02 aceito | Confirmado | Reproduzido. | Média | motor/inic `ImpAcoes.ler` |
| A13 | repetidas no lote | Confirmado | `ja` confere só a base. | Média | motor/inic `ImpAcoes.ler` |
| A13 | seletor único de equipamento | Confirmado | Editar uma ação da Linha 360° com vários equipamentos mantinha só um. | Média | motor/inic `formAcao` |
| A14 | escopos concorrentes | Confirmado (por leitura, duas abas) | Ler, criar e gravar a lista sem trava. | Baixa | modulo/core/scopes `rememberFolder` |
| A15 | `porOrdem: [null]` | Confirmado | `searchOrders` lê `row.ordem` de `null` durante a renderização. | Média | modulo/core/data |
| A15 | export sem versão | Confirmado | `exportsVersion` era opcional. Todos os motores lidos pela casca publicam a versão 1. | Baixa | modulo/core/data `sourceFrom` |
| A15 | base só na raiz | Parcial | É o mesmo fallback do `vacRaiz` dos motores (sem `00. Bases`, a raiz é a pasta). Coerente; mantido. | — | modulo/core/data `readSources` |
| A15 | cópia antiga na raiz | Confirmado | `protectFolder` conferia a raiz e `00. Bases`. Uma cópia solta, que o motor move para o backup ao conectar, travava a base válida. | Média | modulo/core/compatibility |
| A16 | proteção sem prazo; nova tentativa sem iframe | Confirmado (por leitura) | `engineHtml` espera `safeFolder` sem prazo. Em caso de erro, "Tentar conexão novamente" chama `connectEngine` sem iframe e responde "Contrato indisponível". Pode explicar a falha do `entrada.cjs` no CI (ver abaixo). Hipótese, não causa provada. | Média | modulo/core/runtime, modulo/components/ModuleFrame |
| A17 | ontem errado | Parcial | Só quando o fuso do computador difere do `parametros.fusoHorario` cadastrado. Os motores já usavam o fuso da planta (A04 de 26/11); a casca não. | Baixa | modulo/core/data `today` |
| A18 | formato zero recebe OK | Confirmado | A ferramenta não conferia `schemaVersion` e ainda dizia "atualiza ao gravar", contra o contrato 10. | Média | ferramenta/verificar |
| A18 | JSON `null` encerra a varredura | Confirmado | TypeError em `j.appVersion`. Reproduzido. | Média | ferramenta/verificar |
| A19 | pacote só da Operação libera Manutenção | Confirmado | `semCad` exigia só um dos dois cadastros. | Média | CELULAR/linha.html |
| A19 | rev 10 sobre rev 20 | Confirmado | Reproduzido: `aplicar` não compara revisões. | Média | CELULAR/linha.html |
| A19 | metas ocultas sem plano | Confirmado | As metas ficavam dentro do ramo do plano. | Baixa | CELULAR/linha.html |
| A20 | reabertura escolhe outro turno | Confirmado | `atual()` dá preferência a `abertoHoje()`. | Média | CELULAR/index.html |
| A20 | ordens de outro dia | Confirmado | `ordensDia()` não conferia `dia`. | Baixa | CELULAR/index.html |
| A20 | 0 bons + 10 descartados = ausente | Confirmado | A condição `re?` exige bons maiores que zero. A fórmula `scrap/(boa+scrap)` não muda; só a condição do denominador. | Baixa | CELULAR/index.html `resumo` |
| A21 | sucesso depois de falha local | Confirmado | `LS.set` mostra "Memória cheia" e quem chama mostra "Turno fechado" em seguida. Reproduzido. | Média | CELULAR/index.html, CELULAR/manutencao.html |
| A21 | transação da foto sem erro | Confirmado (por leitura) | Sem `onerror` nem `onabort`, a promessa nunca termina. | Baixa | CELULAR/index.html `FotoDB.por` |
| A22 | apaga cache de outro app | Confirmado | Reproduzido com dois caches na mesma origem. No GitHub Pages, a origem é a mesma para todos os sites do usuário. | Média | scripts/celular-site.mjs (sw.js) |
| A22 | 503 gravado | Confirmado | A resposta ia para o cache sem conferir `ok`. | Média | scripts/celular-site.mjs |
| A22 | recurso offline recebe HTML | Confirmado | O fallback `index.html` valia para qualquer pedido. | Baixa | scripts/celular-site.mjs |
| A22 | gatilho sem `scripts/html.cjs` | Confirmado | A montagem depende diretamente desse arquivo. | Baixa | .github/workflows/app-linha.yml |

## Achados desta revisão, fora do relatório do Codex

- **BUG-01 (plataforma 1.8.106, PR #205):** Produção › Config. › Usuário quebrava com "u is not defined". Achado na varredura: ESLint sobre os blocos extraídos, mais a abertura de todas as abas e seções dos nove módulos.
- **Corrida no Linha no celular:** com o arquivo escolhido, o aviso atrasado de câmera indisponível apagava o resultado. Essa é a causa da falha intermitente do `app-cel-qr.cjs` sob carga (passou 3 de 3 vezes isolado). Corrigido na 1.8.110.
- **Regressão evitada:** a primeira versão da correção A17 criava um `Intl.DateTimeFormat` a cada renderização da casca. Isso deixou a tela lenta e quebrou o `celular-hora-a-hora.cjs`. Achei a causa isolando um bloco de cada vez; o formatador agora é guardado. As correções da auditoria vão juntas num PR para essa regressão não entrar sozinha.

## CI no commit auditado e testes intermitentes (item 4)

- **Execução [46097598444](https://github.com/portelarwh/vacutainer/actions/runs/46097598444):** as quatro partições de regras passaram. O job da plataforma falhou em `testes/plataforma/entrada.cjs:47`: `locator.elementHandle`, 30 s esperando `iframe[title="Módulo Administração"]` depois de `.porta-login` aparecer.
- **`entrada.cjs` aqui:** 6 de 6 vezes isolado (cerca de 10 s cada, uma delas com a suíte completa rodando ao mesmo tempo) e 3 de 3 preso a 1 CPU (`taskset`, cerca de 15 s). Também passou dentro da suíte completa no commit auditado. Não reproduzi.
  - **Hipótese ligada ao A16:** o iframe só nasce depois de `safeFolder` (`protectFolder`), que lia a pasta sem prazo. Uma leitura OPFS lenta no runner deixaria o módulo em "Preparando o módulo…". A 1.8.109 põe prazo de 30 s e mostra o erro, então uma nova falha no CI vai trazer a mensagem.
- **`lancamento-unificado.cjs:30` (dois cartões onde esperava três):** 5 de 5 vezes isolado aqui (14 a 15 s). **Inconclusivo.**
  - **Hipótese:** o teste muda `db().shifts` (T3 ativo), que o `ProdCad` monta em memória a partir do cadastro. Uma remontagem que chega depois, sob carga, desfaria a mudança antes da contagem.

## Testes que cobriam só parte do problema

- `ausencia-producao`: só o `porDia` (A03).
- `app-cel-site`: só a abertura sem internet, não a convivência de caches nem as respostas de erro (A22).
- `app-cel-qr`: só cadastro novo depois de antigo, não o inverso (A19).
- `compatibility.test.mjs`: um diretório só, sem a raiz e `00. Bases` diferentes (A15).
- `core.test.mjs`: listas obrigatórias com `null`, mas não `porOrdem` (A15).

## Fica para a homologação (sem simulação local possível)

- **SMB ou pasta de rede real:** A01, A02, A09 e A16, com latência e falhas de leitura de verdade.
- **Duas estações ao mesmo tempo:** A01, A02, A10 e A11.
- **Duas abas reais:** A14.
- **Celular físico:** A19 a A21 (câmera, memória cheia, instalação da página) e A22 (GitHub Pages ligado).
- **Outlook corporativo:** nenhum achado desta auditoria depende dele.

**Vacutainer — parecer sobre o diagnóstico do outro agente e revisão final**

08/11/2026. Aplicação: `e0435136359847e07a2a775a1d7eea31371495b8`. Material avaliado: `c3ae4b0f5a82cba9802889131688a06387389fb0`, branch informada `claude/bold-feynman-7c69j0`, pasta `docs/auditorias/diagnostico-2026-11-08/`. O commit acrescenta somente `LEIA-ME.md`, `diagnostico.md` e `reproducoes/verificar.js`; seu pai é `e043513`. Portanto, os diagnósticos tratam do mesmo código da aplicação.

O ZIP indicado em `/tmp/claude-0/...` não estava disponível neste ambiente. Os três arquivos foram obtidos pelo GitHub e seus hashes de blob foram conferidos: `51c7318…`, `bc732a0…` e `7fd9bbe…`, iguais aos arquivos publicados. Nenhuma alteração, commit ou PR foi realizado na aplicação. Os documentos desta entrega são novos e externos ao repositório original.

**1. Parecer executivo: o que incorporar e o que corrigir**

O diagnóstico acrescenta valor. Incorporei dois defeitos ao inventário técnico: **padrão de data em UTC nos leitores de vigência/câmbio sem data explícita** e **aceitação de números parciais em campos reais do Gel**. Também incorporei a formulação mais concreta de **Minha fila**, **Reunião diária**, o reforço de **Resumo/Detalhado**, componentes comuns e a evolução de passagem de turno e alerta de ritmo.

É necessário corrigir a abrangência de algumas conclusões:

- “10 de 11 confirmados” não significa dez defeitos reproduzidos. O script mistura inspeção textual, comportamento, proposta e ausência de erro.
- Paradas já pesquisa `ordem` em `buscaPagina`; falta consulta integrada/rota específica, não a pesquisa inteira.
- Produção já registra observações e gera “Passagem de turno”. Oportunidade é melhorar continuidade e ciência da próxima equipe.
- Gel já publica `lps` em `exports.ordens`. A lacuna é cobertura, detalhamento e navegação, não a inexistência do campo.
- O padrão UTC foi reproduzido em chamada sem data; não foi demonstrado que os cálculos reais do terceiro turno estejam atualmente errados, pois vários consumidores passam a data explicitamente.
- Os parsers divergem, mas não se deve impor o mesmo significado a todo texto numérico em toda fonte/campo.
- Não há prova de vazamento generalizado de URLs na Produção: seu helper `download` já revoga a URL. Há pontos específicos em Paradas e ciclo de vida a revisar no Portal.
- Uma biblioteca comum de relatórios não entrega automaticamente resumo executivo ou conteúdo completo; ainda são necessárias regras de seleção e cobertura.
- OSM deve seguir sua definição mais recente: observações importadas da plataforma oficial, com tratamento local das ações. Isso substitui a proposta de cadastro local como entrada principal. OEE, TAGs MES e AM/TPM precisam constar explicitamente do roteiro.

Preservei os achados anteriores F01–F11 que o novo material não refutou e que ele não cobre integralmente. O relatório atualizado diferencia defeito, risco de manutenção e proposta de produto. Severidade e prioridade são recomendações, não autorização de implementação.

**2. O que foi executado e o que o script realmente prova**

Executei o `verificar.js` original, sem modificá-lo, numa cópia isolada contendo os 106 arquivos da aplicação e os três documentos do outro agente. A única adaptação externa selecionou o Chromium disponível e serviu o mesmo HTML por HTTP local, porque o navegador deste ambiente bloqueia `file://`. Isso preserva as limitações já declaradas na análise anterior: não é homologação da pasta industrial real.

Resultado: **10 de 11 itens marcados CONFIRMADO; 102 visitas a abas das cinco páginas principais, nos dois temas, sem erro de JavaScript capturado**. A saída está em `evidencias/verificar-outro-agente.log` e `evidencias/resultado-original-outro-agente.json`.

Executei também `evidencias/verificacao-complementar.cjs`, com resultados em JSON e log. Foram verificados: vigência/câmbio com e sem data, campo real de preço do Gel, busca por ordem no Paradas, conteúdo da passagem de turno, roteamento FY27 com/sem cadastro, cache silencioso no carregamento de Ordens e controles de importação sob perfil que nega importar. A tentativa de gravar preço foi interceptada; nenhum arquivo real foi gravado.

As oito suítes antigas não foram novamente executadas nesta etapa. Seus resultados anteriores continuam preservados, mas não são apresentados como nova execução.

| Parte do script original | Concordância com a evidência | Limite/correção necessária |
|---|---|---|
| B1 e B6 | Código suspeito realmente existe; nossos cenários anteriores/complementares sustentam o comportamento | Regex não é reprodução de falha de leitura ou concorrência. A busca de releitura em janela curta também não é prova geral de ausência |
| B2/B7 | Identifica texto/caminhos usados no código | Não calcula o impacto de todas as competências nem testa migração do contrato |
| B3 | Constantes de versão divergem | Não testa o Portal; o teste complementar reproduziu a mensagem relevante. `PAGE.versao` não é necessariamente a versão mostrada na tela |
| B4 | Chamada sem data escolhe dezembro às 22h30 de 30/11 em Brasília | Testa `vacVig`; complementei `vacCambio`. Falta demonstrar cada consumidor de produção afetado |
| B5 | As seis entradas produzem os resultados publicados nos três parsers | Não testa, sozinho, formulário, validação, origem SAP ou unidade. Complementei com um formulário real |
| C1 | Há trechos textualmente diferentes sob nomes semelhantes | Hash dos primeiros até 400 caracteres da linha não mede equivalência semântica, duplicação completa ou defeito |
| § 4 | Publica inventário útil de chaves | `res('§4', true, ...)` confirma sempre, sem critério de aprovação. Não valida completude de contrato nem ficha integrada |
| § 5 | Quase não há chamadas literais às permissões funcionais selecionadas | Regex não demonstra comportamento de todos os perfis/rotas. Testei três controles de importação; não é uma auditoria geral de autorização |
| Estabilidade | Nenhum `pageerror` nos percursos executados | O script entregue cobre cinco páginas, dois temas e 1440 px; não mede rolagem horizontal, não escuta erros de console e não inclui as três páginas em construção. A cobertura maior citada no texto não está comprovada por este script |
| Saída do processo | Código zero indica conclusão do script | Não é um teste de aprovação/reprovação de produto; “CONFIRMADO estabilidade” significaria que houve erro |
| “Só lê” | Não escreve nas bases reais da rede nesse percurso | Grava JSON em `testes/saida/` e altera estado de demonstração/armazenamento do navegador. Por isso foi executado em cópia e contextos isolados |

A formulação correta é “varredura de execução sem erro capturado nesses cenários”. A frase ampla “o sistema está estável” excede a evidência, sobretudo enquanto existem riscos reproduzidos de gravação.

**3. Defeitos B1–B10: parecer individual**

Referências de código são do commit da aplicação, não da documentação. Os IDs F são os do nosso diagnóstico. Um código igual no registro histórico pode representar outro problema; citar sempre documento e SHA.

Severidade descreve a consequência; prioridade descreve a ordem recomendada. **P1:** proteger gravação/recuperação antes de ampliar automação. **P2:** próxima evolução de confiabilidade ou produto, conforme dependências. **P3:** manutenção/evolução posterior quando justificar o custo. Uma proposta de produto não recebe severidade de incidente: seu impacto e sua prioridade são avaliados separadamente.

| Item | Severidade / natureza | Prioridade e motivo |
|---|---|---|
| B1 | Alta: pode substituir dados válidos após falha de leitura | P1; integridade da base de Ordens |
| B2 | Média: meta histórica e comparação incorretas | P2; antes de confiar em análises entre competências |
| B3 | Baixa: metadados/avisos inconsistentes | P2; confiabilidade do diagnóstico de versões |
| B4 | Média potencial: seleção de vigência/câmbio errada no fallback | P2; impacto real depende de consumidores sem data explícita |
| B5 | Média: valor parcial aceito como preço válido | P2; não foi medido impacto em bases reais |
| B6 | Alta: sucesso indevido e perda de operação pendente na concorrência | P1; tratar junto da recuperação de Ordens |
| B7 | Média: leitor depende de estrutura interna e pode perder compatibilidade | P2; risco de integração confirmado, não novo erro total reproduzido |
| B8 | Sem incidente demonstrado; lacuna de integração com impacto alto se automatizada sem conciliação | P2; resolver antes de ingestão MES automática |
| B9 | Baixa: recursos temporários mantidos além do necessário | P3; pontos específicos, sem exaustão medida |
| B10 | Baixa para o aviso ausente; média para a recuperabilidade se backups rotineiros falharem repetidamente | P2/P3 conforme política; respeitar decisão já registrada e separar F03 |

**B1 — Concordo. Defeito reproduzido. Severidade alta; prioridade P1. Relacionado a F01.**

`FolderBackend.readSibling` captura qualquer erro e retorna `null` ([fonte, linha 1618](https://github.com/portelarwh/vacutainer/blob/e0435136359847e07a2a775a1d7eea31371495b8/fontes/producao/OEE-base-2.0.html#L1618)); o build incorpora esse leitor e a escrita auxiliar nas linhas 58–59; `Ord.gravar` está em `ordens_tela.js:26`.

A perda de competência remota já tinha sido reproduzida por nós. Acrescentei a verificação de `Ord.carregar`: com `NotReadableError` e cache de revisão 7, ele terminou `carregado:true`, usou o cache e deixou `err:''`. Essa ampliação do B1 merece incorporação.

A solução proposta está na direção correta: ausência reconhecida retorna `null`, outros erros propagam. O consumidor deve bloquear gravação e manter uma operação recuperável. Para consulta offline, é possível continuar mostrando a cópia identificada como cache/desatualizada, sem tratá-la como base remota recém-lida. Não é necessário apagar ou proibir toda consulta ao cache.

O aceite deve cobrir: erro de permissão/rede/leitura/JSON, arquivo realmente inexistente, cache anterior, competências diferentes, estado pendente e retomada. Criação de arquivo após ausência verdadeira deve ser uma decisão explícita, não uma consequência de erro genérico. Fazer em conjunto com B6/F02 e backup crítico F03.

**B2 — Concordo parcialmente. Defeito reproduzido; prioridade P2, antes de relatórios históricos confiáveis. Relacionado a F05.**

Waste usa `vacMetaArea('WASTE-MES', todayISO())` em `Perdas-Ordem.html:922`. O erro de vigência histórica está confirmado. Na nossa reprodução anterior, outubro deveria usar 10 mil e recebeu 20 mil.

Não adotaria P1 automaticamente: não demonstrou perda de dados; afeta comparação/meta e decisão financeira, podendo ganhar urgência se já houver vigências diferentes em uso. O erro deve ser corrigido independentemente disso.

Último dia do mês é uma solução simples para meta mensal se essa for a regra acordada. Ela não resolve sozinha períodos com vários meses nem mudança dentro do mês. Centralizar uma função por competência, usar cache por data/competência e somar as metas correspondentes. Ampliar o aceite para outubro/novembro, período agregado, ausência de meta, gráficos e PDF/Excel, preservando fatos fechados e a regra de negócio escolhida.

**B3 — Concordo parcialmente. Defeito reproduzido; prioridade P2. Relacionado a F10.**

`APP_VER='1.8.15'` e `PAGE.versao='1.8.16'` estão nas linhas 780/783; o título HTML inicial diz 1.8.13. Porém o título da janela é atualizado em execução e o rótulo visível usa `APP_VER`. Portanto, a variável `PAGE.versao` lida pelo script não comprova que a tela mostre 1.8.16.

O Portal compara as versões em `Portal.html:1304`; a reprodução complementar chamou `Vers.avisos` com metadados sintéticos e gerou o aviso de 1.8.15 versus 1.8.16. Não foi uma varredura de pasta real. O aviso ocorre sob essa combinação de base/HTML, não incondicionalmente em qualquer estado sem base.

Uma origem de versão é a solução adequada. Atenção à ordem de inicialização: aplicar literalmente `APP_VER = PAGE.versao` onde `PAGE` ainda não foi inicializado pode criar um erro novo. É mais simples manter uma constante inicial e derivar `PAGE.versao`/rótulo/metadados dela, ou gerar tudo no build com o scanner do Portal compatível. O aceite proposto é bom, acrescentando versão visível real, título inicial versus runtime e evitando “corrigir” metadados de bases antigas sem nova gravação legítima.

**B4 — Concordo parcialmente. Defeito da função reproduzido; impacto nos consumidores precisa ser delimitado. Prioridade P2. Novo F12.**

`kit_v21.js:55` e linha 60 usam a data UTC como padrão em `vacCambio`/`vacVig`. Reproduzi: 30/11/2026, 22h30 em Brasília, sem data → vigência dezembro e câmbio 6; com `2026-11-30` → novembro e câmbio 5.

Isso merece correção, mas não prova que todos os preços/turnos/metas da noite estejam errados: vários leitores passam a data explicitamente, como Waste `cotUSD(fimMes(per))` e os leitores de preço/turno do Gel. A afirmação sobre o terceiro turno é risco potencial, não ocorrência de produção demonstrada.

Uma função comum de data operacional evita repetição. Usar explicitamente a data do fato nos cálculos é mais importante que trocar o fallback. Para ausência de data, seguir a política de dia local/da planta definida; não converter timestamps de auditoria em datas locais indiscriminadamente. Aceite: fronteira de dia/mês/ano, Brasília e outro fuso, data explícita preservada, câmbio e demais leitores, turno iniciado no dia anterior e migração do kit em todas as páginas.

**B5 — Concordo parcialmente. Defeito de validação reproduzido; normalização universal proposta precisa mudar. Prioridade P2. Novo F13.**

As diferenças da tabela foram reproduzidas. Gel usa `parseFloat` em `Gestão-Gel-Vacutainer.html:927`; Paradas, em `Paradas.html:763`. O ponto mais forte é aceitar texto parcial.

No formulário real do Gel, `#pcUsd` é texto com `inputmode=decimal` (linha 4009). Digitei `12a`, cotação 5; a prévia mostrou R$ 60,00/kg e o clique preparou `usd:12`, `price:60`, sem erro. A chamada de persistência foi interceptada: comprova validação insuficiente sem gravar base. O uso de minutos/ocorrências importados no Paradas está nas linhas 797/802; merece validação de ponta a ponta com layout da fonte.

Contudo, `1.234` pode significar decimal em uma fonte e milhar em outra. `R$`, unidade textual, sinal final SAP, vazio e negativo também dependem do contrato. Dizer “Waste é certo para todo campo” e exigir igualdade irrestrita nas cinco/oito páginas é inadequado e arriscado.

Recomendo parser estrito com política por fonte/campo: separadores, agrupamento, sinal SAP permitido ou recusado, unidade esperada, vazio, faixa e precisão. Códigos jamais passam por parser numérico. Manter o adaptador SAP do Gel que já trata parte do formato brasileiro; migrar os pontos afetados gradualmente. Aceite: texto parcial/NaN/Infinity recusados sem gravação, erro associado ao campo, formatos válidos e unidades mantidos, sinal permitido por origem, prévia de interpretação e compatibilidade com os dados existentes.

**B6 — Concordo. Defeito confirmado no código e reproduzido anteriormente; prioridade P1 junto da gravação. Relacionado a F02.**

`Ord.gravar` escreve em `ordens_tela.js:45` e limpa a fila sem reler. A regex do script isoladamente não provaria a ausência, mas o código e nossa simulação de outra sessão substituindo a escrita a confirmam.

Conferir `revId` é adequado, acompanhado de operação pendente recuperável e regra para duas importações da mesma competência. Aceite deve incluir releitura que falha, conteúdo divergente, mesma revisão com outra identidade, concorrência em competências diferentes e nenhuma mensagem de sucesso antes de confirmar. Releitura não é uma transação de banco nem garantia contra toda escrita futura.

**B7 — Concordo. Acoplamento confirmado no código; prioridade P2 de integração. Relacionado a RAS-02/F08.**

Waste lê `monthPlans` e `server` em `loadOEE`, `Perdas-Ordem.html:1581`, e usa os dados no detalhe. O diagnóstico reconhece corretamente a exceção existente ao contrato. Publicar histórico/dias do lote e migrar o leitor é a solução de menor risco.

Aceite adicional: produtor publica antes de retirar fallback; ordem antiga continua encontrável; base legada e versão desconhecida têm comportamento explícito; ausência fora da janela não vira zero; pares de versões compatíveis produzem números iguais. O histórico deve incluir classificação/observações necessárias, não apenas renomear um bloco.

**B8 — Concordo parcialmente. Lacuna de integração, não contagem dupla geral demonstrada. Prioridade P2 antes do MES automático.**

Produção hoje publica agregados `paradasEquipamento`, e Paradas espera `paradasEventos`; a publicação individual está incompleta. `eventosTodos`, linha 696, já teve correção de deduplicação, respeitada nesta análise.

ID comum ajuda, mas fontes independentes podem ter IDs diferentes para o mesmo fato. Para o MES solicitado, a solução precisa de ID por origem, relação entre evidências, revisão e conciliação temporal vários-para-vários. Aceite: não ocultar evento legítimo de outra máquina, não duplicar evidência conciliada, manter microparadas, reimportar sem inflar total e impedir realimentação do evento aplicado de volta à Produção.

**B9 — Concordo parcialmente. Manutenção/recursos em pontos específicos; prioridade P3.**

No Paradas, download de backup cria URL sem revogação em `Paradas.html:1379`; a leitura de imagem na linha 1371 também merece revisão do ciclo. No Portal, `EqFiles.url/abrir`, linhas 1721–1722, cria URL para documento em outra janela e requer gestão de vida útil.

Por outro lado, `downloadBlob` do Portal (linha 665) e `download` da Produção (fonte linha 3956) já revogam URLs; logos também possuem caminhos de substituição com revogação. Não confirmo a afirmação ampla de que os downloads das três páginas estão todos sem liberação, nem vazamento da Produção neste material.

Solução: inventariar cada URL temporária, aproveitar os helpers que já funcionam e revogar quando o recurso não for mais necessário. Não revogar cedo demais documentos abertos em outra aba. Aceite: contagem de criação/revogação para downloads repetidos, documento ainda abre e exceções/fechamento não deixam referência desnecessária. Não usar número de `createObjectURL` no arquivo como medida de memória vazada.

**B10 — Concordo com a observação; tratamento é decisão de produto/diagnóstico já adiada. Prioridade P2/P3, sem bloquear a gravação normal.**

`Store.writeRemote`, `Portal.html:805`, captura falha do backup diário sem avisar. Isso está reconhecido como decisão pendente no registro; não é regressão nova nem o mesmo cenário do backup obrigatório de substituição F03.

Recomendo sinalizar a última tentativa que falhou e a última cópia confirmada, com possibilidade de tentar de novo. “Backup de hoje não foi feito” isoladamente pode ser um aviso falso antes da primeira gravação ou numa sessão que não precisava gerá-lo. O estado deve representar fato verificado, não apenas um marcador no navegador. Aceite: falha real aparece, recuperação limpa o estado e a gravação normal continua conforme a política existente. A política de backup crítico de restauração/substituição segue separada.

**4. Código C1–C5: parecer individual**

| Item | Parecer e classificação | Evidência | Solução de menor risco e aceite |
|---|---|---|---|
| C1 — utilitários | **Concordo parcialmente. Manutenção; P3, com os reparos B4/B5 em P2** | Funções homônimas e código comum existem; o hash de trecho curto não demonstra semântica nem valida a medição de 37 KB | Reutilizar funções de contrato bem definido no código-fonte do kit e embutir no HTML. Não unificar `uid`, normalização de cabeçalhos, modais ou formatos apenas por nome. Preservar IDs, mensagens e chamadas existentes; testes por contrato/contexto |
| C2 — relatórios | **Concordo parcialmente. Manutenção e produto; P3 para fusão completa, P2 para saídas necessárias** | `Report` Portal/Waste, `rp*` Produção e funções PDF do Gel existem. As saídas já passaram em verificações anteriores | Primeiro modelo de documento/metadados e adaptadores; migrar uma saída por vez. Preservar comentários longos, tabelas, tema e imagens. Gerador comum não fornece resumo editorial “de graça” |
| C3 — FY27 | **Concordo parcialmente. Duplicação/compatibilidade; P3** | `parseMetaFY27` e `mof*` existem. `cad_sync.js:172` já troca o botão local por link ao Portal quando há metas centrais | Reproduzi botão local sem metas no Portal e atalho com metas. Manter modo legado até seu descarte ser decidido; comparar/adaptar parser comum se necessário. Não remover funcionalidade porque o relatório a chamou de sobra |
| C4 — funções extensas | **Concordo. Manutenção; P3** | `computeDayRaw`, `CadSync.aplicar`, `openConfig`, `cadValidarItem` concentram responsabilidades, já registradas | Teste de comportamento antes de mudar e extração da parte afetada, sem reescrita geral. Aceite inclui histórico, IDs, vigências e igualdade de resultados |
| C5 — fonte do Gel | **Concordo parcialmente. Manutenção opcional; P3** | Gel é HTML de cerca de 1 MB editado diretamente, conforme regra atual | Pode ganhar fontes/geração determinística quando a manutenção justificar. Não é obrigatório copiar o build por substituições da Produção; montagem por módulos também pode preservar o HTML autônomo. Primeira migração deve gerar resultado equivalente/idealmente idêntico, sem exigir arquivos extras em runtime |

Severidade de incidente: não se aplica a C1–C5 por si sós. Impacto de manutenção: médio para C1/C2/C4/C5 e baixo para C3, que já preserva um caminho legado intencional. Os defeitos concretos associados a C1 são classificados em B4/B5, sem contá-los novamente.

Referências adicionais para reprodução da inspeção: C1 em `Perdas-Ordem.html:1015`, Gel linha 927 e Paradas linha 763; C2 em `Portal.html:893`, `Perdas-Ordem.html:2072` e `fontes/producao/OEE-base-2.0.html:7375`; C3 em `fontes/producao/OEE-base-2.0.html:2734` e `cad_sync.js:172`; C4 em `fontes/producao/OEE-base-2.0.html:1090`, `cad_sync.js:21`, Gel linha 3928 e `Portal.html:1620`. Em C5, a fonte atual é o próprio `paginas/Gestão-Gel-Vacutainer.html`; seu `openConfig` é um exemplo de manutenção concentrada, não prova de que o tamanho do arquivo seja um defeito funcional.

O fato de várias funções terem nomes iguais não exige interfaces iguais: `toast` com duração/estilo, `modal` com assinatura e `norm` de importadores podem ter diferenças legítimas. A divergência numérica demonstrada deve ser corrigida pelo contrato, não por uma troca indiscriminada de utilitários.

**5. Integração por ordem — avaliação da seção 4**

**Concordo com a direção; concordo parcialmente com a descrição do estado atual e da completude dos dados. Proposta de produto/contratos, prioridade P2.**

| Proposta/afirmação | Avaliação | O que incorporar ou corrigir |
|---|---|---|
| Ficha comum da ordem nas páginas | Concordo | Reutilizar o componente e oferecer endereço de consulta no Portal; cada bloco mostra fonte, cobertura e revisão, e cada edição fica com seu dono |
| Ctrl K por ordem, lote, LP, catálogo/equipamento | Concordo parcialmente | Classificar por tipo/índice; 9 ou 6 dígitos são pistas, não condições rígidas para aceitar identificador. Desambiguar resultados e preservar códigos como texto |
| Portal “só procura cadastro” | Discordo da formulação absoluta | `PAGE.busca`, linha 1051, também busca pendências e telas; pode encontrar ordem incidentalmente no texto. Falta índice global dedicado e ficha integrada |
| Paradas “não há busca por ordem” | Discordo dessa parte; concordo que falta rota específica | `buscaPagina`, linha 1038, inclui `e.ordem`. Reproduzi evento encontrado por `110834720`. Acrescentar filtro/rota por ordem, sem reconstruir a busca já existente |
| Gel precisa incluir LPs no `exports.ordens` | Parcialmente já atendido | `gelOrdersCalc` mantém `lps`; `gelExports`, linhas 1331–1337, publica esses campos. Avaliar cobertura e detalhe de cada LP; não criar outro campo equivalente |
| Os dados existentes bastam para “tudo” | Concordo parcialmente | Waste publica contagem de comentários/ações, não todo histórico; Paradas limita eventos recentes; Produção só dois meses de ordens. Camadas faltantes precisam de contrato e cobertura |
| OEE da ordem, boa e scrap | Concordo como objetivo condicionado | `produzido` já aparece em `exports.ordens` da Produção; não é suficiente, sozinho, para OEE/D/P/Q por ordem. Definir atribuição de tempo, capacidade, scrap e denominadores; não ratear OEE automaticamente |
| Histórico de cerca de 2 mil ordens | Concordo como referência de índice, não limite do negócio | Declarar janela/cobertura e acesso ao restante; nunca fazer ordem antiga “sumir” ou apagar histórico por causa do limite de consulta |
| Leitor comum de `exports` | Concordo | Índices por revisão, cache identificado, validação de versão e leitura autorizada. Evitar reler todas as bases a cada tecla |
| Campos opcionais no v1 | Concordo | Compatibilidade aditiva antes de renumerar; mudança de significado exige transição de leitores/produtores, sem ligar v2 sozinho |

**Aceite ampliado:** mesma ordem com várias competências/lotes; ordem só num módulo; ordem antiga fora da janela; índice sem pasta conectada com cache datado; versão incompatível; múltiplas correspondências; link de ida/volta; nenhum bloco faltante convertido em zero. Dados financeiros, peças, kg e minutos não são somados entre si para produzir um total artificial.

**6. Interface e relatórios — avaliação da seção 5**

| Proposta | Parecer / classe / prioridade | Ajuste e validação |
|---|---|---|
| Resumo ↔ Detalhado por página/relatório | **Concordo. Produto, P2** | Mesmos filtros/fórmulas e metadados. Preferência por usuário/página, com padrão de perfil e retorno previsível. Quatro a seis indicadores são referência, não regra rígida para qualquer tarefa |
| Executivo de uma página | **Concordo parcialmente. Produto, P2** | Uma página pode ser meta de composição; não cortar informação sem aviso para caber. Mostrar fontes/cobertura e oferecer anexo completo |
| Perfil simplifica abas/ações | **Concordo parcialmente. Produto, P2** | A restrição funcional do perfil é diferente da preferência de foco. “Pouco usado mas permitido” pode ir em Mais; ação não permitida não deve reaparecer em Mais. Detalhado não aumenta permissão |
| Teste por regex das permissões | **Concordo com a lacuna delimitada, não com prova de todos os caminhos** | Perfil negando importar manteve controles ativos/visíveis em Waste/Gel/Paradas na reprodução. Permissão de pasta, cadastro bloqueado, dia fechado e perfil são mecanismos distintos. Não reabrir a discussão recusada de autenticação |
| Minha fila | **Concordo. Produto, P2** | Separar Minhas, Minha equipe e Sem responsável. Barril vencendo ou competência sem KKBC não pertencem automaticamente a alguém. Precisa de ID/responsável/equipe/prazo/status/origem/link publicados |
| Componentes comuns | **Concordo parcialmente. Manutenção/UX, P3 gradual** | Padrão de semântica, unidades, filtros, foco e tabelas; conservar variantes úteis da operação e da análise |
| Desfazer e menos confirmações | **Concordo parcialmente. Produto, P3** | Exclusão lógica também altera totais/fechamento e pode conflitar entre usuários. Usar desfazer apenas quando a operação inversa for segura e auditável; não eliminar confirmação de restauração/substituição |
| Atalhos, feedback de gravação e carregamento | **Concordo. UX, P2/P3** | Estado de pendência/erro tem precedência sobre “salvo”. Teclado/toque e atualização não tiram foco ou apagam formulário |

Os perfis já têm página/aba inicial e preferências de visibilidade existem em algumas telas; a proposta é aplicá-los melhor à jornada, não afirmar que hoje não existe personalização alguma. Preserve Visão geral antes de Painel e o papel distinto de cada uma, conforme decisão registrada.

**7. Funcionalidades por página — avaliação das seções 6 e 7**

**7.1 Portal**

| Proposta | Parecer / prioridade | Complemento |
|---|---|---|
| Minha fila | Concordo, P2 | Com responsabilidade explícita e edição na origem; relacionar ao Planner solicitado |
| Ficha/busca global | Concordo, P2 | Contratos, história e cobertura antes de prometer visão completa |
| Reunião diária — aba nova | Concordo, P2 como proposta a priorizar | Filtro dia/turno, pauta, decisões, responsáveis, notas e ações vinculadas; fotografia do que foi apresentado com revisões e pendências |
| Executivo semanal/mensal da linha | Concordo, P2 | Mostrar períodos efetivamente disponíveis; não transformar custo mensal KKBC em resultado diário sem fonte |
| Calendário comum | Concordo, P2 | Produção continua dona da operação do calendário; Portal consulta/encaminha, evitando dois editores concorrentes da mesma entidade |
| Saúde do sistema | Concordo parcialmente, P2/P3 | Ampliar a tela existente de Versões/Diagnóstico com fontes/backup, em vez de criar outra lista divergente |

Reunião diária é um bom complemento ao nosso relatório diário: acrescenta condução e continuidade de decisões. Deve informar que o OEE do dia, Waste da competência e estoque do Gel têm granularidades e horários de atualização diferentes. A tela não pode sugerir que todos representam “ontem” se a fonte não permite.

**7.2 Produção**

| Proposta | Parecer / prioridade | Complemento |
|---|---|---|
| Ficha/porOrdem histórico | Concordo, P2 | Preservar `produzido` existente e completar dados sem recalcular OEE da ordem por suposição |
| Passagem de turno “não registrada” | Discordo da ausência; concordo com evolução, P2 | Há `ps.note`, campo de observação linha 6210 e `rpShiftModel` linha 7405. Reproduzi a observação no relatório. Melhorar pendências para próxima equipe, ciência e encaminhamento ao Planner |
| Alerta de ritmo do turno | Concordo como melhoria, P2 | Plano mensal já tem ritmo/projeção. O alerta por turno exige tempo decorrido útil, pausas, catálogo e dado atualizado; indicar previsão, não garantia |
| Visão geral pronta / Painel montável | Concordo, P2 | Reutilizar estruturas atuais; manter resumo/detalhe sem duplicar fórmulas |
| Remover FY27 local | Concordo parcialmente, P3 | Conforme C3: modo central já redireciona; preservar legado enquanto necessário |

**7.3 Waste**

| Proposta | Parecer / prioridade | Complemento |
|---|---|---|
| Pauta de reunião de Waste | Concordo, P2 | Ordens críticas, sem causa, reincidência e ações, com corte/competência claros e sem gerar ações duplicadas |
| Gel × BOM no detalhe | Concordo parcialmente, P2 | Consumo/scrap/LPs já são consultados; ampliar explicação e vínculo vigente. Distinguir scrap físico de custo já incluído na KKBC para não duplicar perda |
| Faixa única de resumo | Concordo, P2 | Pendência visual real; preservar perda, ganho, total e limites da decomposição quando falta `Desv.estr.` |
| B2/B3/B7 | Concordo com os reparos delimitados | Incluir F06/F07/F08/F09 que o outro diagnóstico não detalhou |

**7.4 Gestão de Gel**

| Proposta | Parecer / prioridade | Complemento |
|---|---|---|
| Catálogos/equipamentos do Portal | Concordo, P2 | Integrar também produção/calendário do OEE, preservando complementos específicos de gel |
| Ficha comum LP/ordem | Concordo, P2 | LPs já publicados e seus links devem apontar ao barril exato |
| Prévia/recusa numérica | Concordo com política por campo, P2 | Novo F13; o formulário real confirma a necessidade |
| Previsão de falta de gel | Concordo parcialmente, P2 | Cobertura já existe; cruzar programação, validade, bloqueios e estoque utilizável. Separar simulação e plano aprovado, com premissas visíveis |

O monitoramento da pasta já funciona como referência. Sua evolução para outros módulos é uma necessidade central do plano atual e estava pouco tratada no outro diagnóstico.

**7.5 Paradas**

| Proposta | Parecer / prioridade | Complemento |
|---|---|---|
| Relatório próprio | Concordo, P2 | Não precisa esperar fusão completa dos três geradores; reutilizar modelo/adaptador e validar PDF/Excel |
| Busca/link por ordem | Concordo parcialmente, P2 | Busca textual já inclui ordem; falta filtro/rota e ficha transversal |
| Fila técnica → OS | Concordo, P2 | Encaminhamento para Equipamentos com referência ao evento, não escrita cruzada |
| EventoId | Concordo com ampliação, P2 | Conciliação temporal, fontes e decisões, conforme novo MES; simples ID não substitui correlação |

**7.6 Equipamentos**

Concordo em começar pela ficha e histórico com cadastro/Paradas, sem esperar todos os relatórios de máquina. Classificação: produto, P2. **Não concordo em prometer estado atual ou gargalo do dia só com histórico de falhas e cadastro.** Esses dados permitem mostrar falhas/criticidade histórica; estado atual e restrição de fluxo dependem de sinais/cobertura e critério.

OS e plano preventivo fazem sentido. TAGs MES precisam de aba explícita e semântica versionada. A importação completa dos estados depende de amostras SQL, mas o modelo técnico pode ser projetado antes. TPM/AM não deve desaparecer num “depois” genérico: manter CILT, Center Line, lubrificação e checklists por equipamento registrados desde já; só o detalhe dos procedimentos aguarda o responsável. AM manual não depende de concluir o MES.

**7.7 Iniciativas**

Concordo com a página e o Planner, mas **discordo da justificativa atual de que OSM não tem lugar oficial de registro e de que sua regra já está toda definida**. O responsável informou uma plataforma oficial; a proposta antiga ainda listava perguntas em `osm-arquitetura.md:150` e seguintes. Esta orientação substitui as partes antigas.

Prioridade P2 para importar OSM e acompanhar ações, com histórico por responsável/status; preservar OSM/KAS/5S e acrescentar a origem/visão OEE. Cadastro local de OSM e metas não são pré-condição do Planner. Não migrar automaticamente ações existentes de Waste/Paradas nem OS de manutenção para uma base única: visões podem agregá-las, cada dono continua editando seu registro. Novas ações OSM/KAS/OEE podem nascer em Iniciativas, com vínculos às origens.

**7.8 Projetos**

Concordo, produto P3 até o escopo ser fechado. Carteira, dono, prazo, marcos e benefícios são um começo útil. Relacionar mini kaizen/iniciativa/OS/projeto, sem transformar toda ação em projeto nem contar o mesmo ganho em várias páginas.

**7.9 Gel e Paradas em atualização**

Concordo com as frentes apontadas, prioridade P2. Registrar o que já veio do kit e o que ainda falta; não apresentar cor comum ou ligação existente como entrega inteiramente nova. A nova ingestão por pasta e o motor MES ampliam o plano de atualização e exigem validação própria.

**8. Plano da seção 8: avaliação fase por fase**

| Fase do outro agente | Parecer | Mudança recomendada / risco / validação |
|---|---|---|
| 0 — B1 a B4/B6 em um PR | Concordo parcialmente | Correções primeiro, mas separar gravação/recuperação de metadados/tempo para revisão focada. Incluir F03/F04, ausentes dessa fase. Testes de falha antes/depois, sem gravar dados reais |
| 1 — utilitários e leitor numérico único | Concordo parcialmente | B4/B5 merecem reparo, mas não fazer a igualdade irrestrita das tabelas nem bloquear produto por kit inteiro. Preservar contrato por fonte/campo |
| 2 — integração | Concordo | Dividir produtores/histórico/contratos de leitores/ficha/rotas. Testar pares compatíveis de versão, datas antigas e vínculos |
| 3 — perfil/Resumo/Minha fila | Concordo parcialmente | Minha fila pode começar assim que houver responsáveis/contratos, sem depender de toda ficha ou ocultação. Visão resumida e detalhada compartilha cálculo |
| 4 — gerador comum/Reunião diária | Concordo parcialmente | Reunião diária pode reutilizar geradores atuais/adaptadores. Não exigir migração global do PDF como pré-condição |
| 5 — todas páginas novas ao final | Discordo do bloqueio rígido | Importação OSM + Planner já é necessidade clara e pode ser recorte inicial depois de integridade. Ficha de Equipamentos e AM evoluem em paralelo lógico ao MES; Projetos espera escopo |

A restrição por arquivos é permanente no roteiro atual: nenhuma fase inclui API, servidor ou conexão do navegador ao SQL. Tempo de esforço “pequeno/médio/grande” do outro diagnóstico é estimativa preliminar, não compromisso validado para a equipe.

**9. O que faltou ao outro diagnóstico**

| Ausência/limite | Consequência para a revisão final |
|---|---|
| F03: substituição de Ordens segue sem backup | Incluir antes da automação de importações |
| F04: método duplicado quebra backup legado | Incluir recuperação de cópia antiga na verificação |
| F06: leitores não uniformes de versão | Não ligar novos contratos sem validação de compatibilidade |
| F07: mesma ordem em competências diferentes perde informação | Ficha precisa preservar competência e origem |
| F08: leitura errada da chave `dayLot` | Corrigir vínculo de dias e publicar contrato antes de retirar leitura interna |
| F09: LP/dia abrem página sem item | Navegação exata já é melhoria pequena com impacto direto |
| Gel mostra 2.01 apesar do código 2.04 | Ampliar o inventário B3/F10 para todas as páginas |
| XLSX ausente do checkout | Incorporar distribuição/versão local ao plano sem internet |
| Fonte oficial OSM e reimportação | Preservar ações/históricos locais e estados distintos |
| Iniciativas OEE e indicadores por responsável | Planner comum com identidade, transferências e relógios explícitos |
| TAGs, conciliação e cronologia | Intervalos, qualidade, múltiplas fontes, sem dados, fronteiras, estados e validação de impacto no OEE |
| TPM/AM/CILT/Center Line/lubrificação | Registrar padrões versionados e execuções, sem inventar procedimentos |
| Arquivos monitorados por fonte | Idempotência, arquivo em escrita, cobertura, dois leitores e retomada; não basta timer |
| Atribuição de Meu trabalho | Pendência geral não é automaticamente individual; precisa responsável/equipe |
| Linhagem e granularidade dos relatórios | Evitar comparar “ontem” com custo de outra competência sem declarar isso |

Alguns itens já estavam no nosso material e são mantidos. Os dois novos defeitos e as melhorias de fluxo são acréscimos desta revisão, não implementação.

**10. O que eu corrigi ou melhorei no nosso próprio material**

1. Ampliei F01 para incluir carregamento de Ordens com cache silencioso, reproduzido nesta etapa.
2. Acrescentei F12 (fallback de data) e F13 (validação numérica real), com a delimitação entre defeito observado e risco potencial.
3. Tornei explícitos Minha fila, Reunião diária, continuação da passagem de turno e alerta de ritmo como propostas identificadas no backlog.
4. Refinei o plano de componentes/relatórios: compartilhar contrato e adaptadores gradualmente; resumo editorial exige projeto próprio.
5. Acrescentei à nossa matriz que Paradas já pesquisa ordem, Gel já publica LPs, Produção já faz passagem de turno e centralização FY27 já redireciona a interface. A revisão anterior não precisava afirmar ausência dessas funções, mas agora esses pontos ficam documentados para impedir duplicação futura.
6. Registrei ciclo de vida de URLs e falha de backup diário de forma delimitada, respeitando o adiamento anterior e sem classificá-los como perda de dados equivalente ao F03.
7. Ajustei os critérios de aceitação de tempo/número, cache, histórico e contagem de verificação. Os materiais anteriores ficam preservados como histórico, sem edição retroativa.

**11. Ordem de entregas proposta para PRs futuros**

São recortes para aprovação futura. Nenhuma branch/PR foi criada nesta etapa. Dependências são de dados e comportamento, não uma exigência de que toda a interface comum esteja pronta antes do próximo módulo.

| PR proposto | Escopo / IDs de referência | Risco principal | Validação mínima |
|---|---|---|---|
| PR-01 — Ordens confiável | F01/F02/F03: leitura, cache identificado, pacote pendente, backup e confirmação | Alterar reenvio/concorrência e sobrepor a mesma competência | Falhas de leitura/escrita/releitura, mesma revisão com outra identidade, duas competências e cache/retomada |
| PR-02 — recuperação/metadados | F04/F10: backup legado e versões | Recuperação por caminho errado ou ordem de inicialização de constante | Backups nas duas pastas; versão visível/export/base e scanner do Portal; build determinístico |
| PR-03 — data do fato | F05/F12: metas por competência e fallback de data | Alterar regra histórica ou timestamp absoluto | Virada local/UTC, mês/ano, data explícita, múltiplas competências e saídas iguais |
| PR-04 — números por contrato | F13 e validadores afetados | Mudar significado de decimal/milhar ou transformar vazio em zero | Formulários reais, fontes SAP/Forms, unidades, sinal, negativos, NaN/Infinity e ausência sem gravação |
| PR-05 — produtores/contratos | F06/F07/F08, RAS-02: identidade, cobertura e histórico | Quebrar leitor antigo ou limitar histórico silenciosamente | Contrato aditivo, versão desconhecida, ordem multi-competência e índice/cobertura |
| PR-06 — ficha/busca/navegação | F09/RAS-01/UX-03, busca contextual | Recontar dados e perder contexto/estado | Ordem/lote/LP/equipamento, vários módulos/meses, cache datado e retorno |
| PR-07 — OSM importada | OSM-01/02/03 e persistência de Iniciativas | Reimportar e apagar trabalho local | ID oficial, revisão, extração parcial, duplicata, backup/conflito/recuperação |
| PR-08 — Planner e OEE | PLA-01/02/03/05/06, OEE-01/02, KAS-01 | Tempo atribuído ao responsável errado ou ações duplicadas | Transferências/esperas/reaberturas, link de evidência, origem distinta e edição pelo dono |
| PR-09 — monitoramento por fonte | IMP-01 a IMP-08, por importador validado | Ler arquivo parcial ou dois leitores confirmarem pacote duplicado | Aviso/automático, estabilidade/conteúdo/cobertura, suspensão e duas estações reais |
| PR-10 — Minha fila e reunião | FIL-01/02, REU-01/02, UX-01/02, REL-02 | Misturar responsabilidade, granularidades e dados desatualizados | Pessoa/equipe/sem dono, dia/competência, fotografia da reunião, filtros e resumo/detalhe iguais |
| PR-11 — Equipamentos inicial/TAGs | Ficha existente + TAG-01/02/03/04 | Inferir estado/gargalo sem fonte ou classificar TAG incorretamente | Cadastro e regras versionadas, amostras SQL, valores inválidos, fronteiras e medição |
| PR-12 — MES/cronologia | MES-01 a MES-08 | Duplicar paradas, inventar horários ou alterar fechado | Interseções, vários-para-vários, sobreposição, noturno, lacunas, correções e reprocessamento |
| PR-13 — AM/TPM | TPM-01 a TPM-07, conforme padrões recebidos | Checklist antigo mudar com padrão novo | Revisão aplicada, não conformidade, anomalia/OS, periodicidade e limites autorizados |
| PR-14 — relatórios/manutenção | REL/REF, MEM-01, BKP-01, C2/C3/C5 quando justificado | Regressão de saídas ou remoção de legado | Comentários longos, tabelas completas, tema/Outlook, fallback FY27 e fontes/build sem mudança de resultado |
| PR-15 — Projetos/expansão | PROJ-01, 5S/KAS ampliados | Carteira sem escopo e ganho duplicado | Dono, marcos, método de ganho e vínculo às iniciativas |

Alguns recortes podem ser subdivididos. A ficha, o Planner mínimo, a ficha de Equipamentos e a estrutura AM não exigem concluir a fusão global de relatórios. A ordem final depende da aprovação e das amostras, mantendo integridade antes de automação e gravações novas.

**12. Decisões antigas versus definições mais recentes**

- Fase inicial de correção continua recomendada; execução não está autorizada.
- Retirada FY27 não está aprovada por esta revisão e o modo central já redireciona para Portal.
- Há definição suficiente para propor acompanhamento comum OSM/KAS/OEE, mas não uma migração automática de todas as ações Waste/Paradas ou OS.
- Reunião diária é proposta incorporada, com condução/ritual a definir quando for priorizada.
- Existe intenção de obter relatório SQL; o formato e as amostras ainda faltam. Pode-se começar a ficha do equipamento e o cadastro conceitual de TAGs sem inventar parser de máquina.
- Projetos e padrões técnicos de TPM ainda precisam de detalhamento oportuno.
- Aviso de backup diário é proposta de status, respeitando a distinção entre cópia rotineira e backup crítico.

Para a próxima contra-análise, usar este parecer, o plano mestre e o backlog revisados. Reavaliar F12/F13 e as discordâncias factuais com o código, em vez de somar automaticamente dois relatórios como se todas as suas afirmações fossem independentes e confirmadas.

# Estabilização NV-01–NV-05

Implementação sobre `81ea71bb82cc62f08360684c7ce1a5df54697202`, após os PRs #18 e #19. Branch: [`codex/correcoes-nv-01-05`](https://github.com/portelarwh/vacutainer/tree/codex/correcoes-nv-01-05). Alterações preparadas para revisão; a main e a pasta real não são modificadas por esta entrega.

## O que mudou

| Achado | Correção | Fontes principais |
|---|---|---|
| NV-01, operações de outra pasta | Operações novas têm `_pasta`, uma identidade local verificada. A recuperação de confirmadas filtra a origem. Pendências de outra origem ficam preservadas e não são enviadas ao destino errado | `fontes/kit/kit_bases.js`, Store de Iniciativas, Equipamentos e Paradas |
| NV-02, duas abas e snapshot pendente | Web Locks abrangem a leitura, mutação e persistência, além de conexão e sincronização. A guarda é revalidada dentro da trava, e o snapshot identifica a aba dona. Quando a primeira aba fecha, a segunda retoma a cópia pendente mais recente | `vacEditarBase`, `vacGuardaAba`, Portal e Waste |
| NV-03, pastas homônimas | Cache da ficha guarda a identidade comprovada da origem. Um nome final igual não autoriza reutilizar a cópia. O cache da própria pasta continua funcionando em falha de leitura | `fontes/kit/kit_v21.js` |
| NV-04, reserva na falha do IndexedDB | Uma chave de reserva por operação, sem substituir a lista de outra aba. Limpeza limitada à cópia aceita e à aba dona. A abertura do IndexedDB pode ser tentada novamente depois de uma falha síncrona | `vacFila.reservar`, `reservas`, `espelhar`; Store dos três módulos |
| NV-05, zero enganoso | Portal › Versões distingue cópia inteira pendente, quantidade na fila, reserva local e verificação desconhecida/parcial. A mesma informação segue para o relatório de versões | `vacFila.saude`, `Vers.pendentes` |

Versões: Portal **1.9.3**, Produção **2.4.18**, Waste **1.8.24**, Gel **2.12**, Paradas **1.0.23**, Equipamentos/Iniciativas **1.0.4**, Projetos **0.1.7**. Os módulos sem mudança de negócio recebem a versão nova porque o kit comum foi atualizado. Projetos continua em construção.

## Origem da pasta e migração

`vacOrigemPasta` usa o handle original do seletor, não o objeto de adaptação `vacRaiz`. Para pastas externas, o navegador guarda um identificador local e o handle em `vac-origens/pastas`; os próximos acessos comparam `isSameEntry`. A aquisição usa exclusão mútua para que duas abas não criem identidades diferentes para a mesma pasta. OPFS, usado nos testes, pode ser identificado pelo caminho verificável relativo à sua raiz.

Não há UUID novo dentro das bases de negócio, arquivo de identidade no compartilhamento, API ou servidor. O nome da pasta continua sendo usado para exibição, nunca como prova de identidade. Se a identidade não puder ser verificada, não se grava uma alteração pendente numa origem presumida.

As operações pendentes antigas sem identidade precisam de confirmação explícita do destino. Cancelar preserva a fila. Confirmadas antigas sem origem não são reaplicadas automaticamente na primeira pasta aberta; permanecem disponíveis durante a retenção existente e podem ser baixadas para conferência. Não é seguro inferir o destino pelo nome ou apenas pela ausência de uma operação na auditoria.

Ao recuperar operações órfãs de várias pastas, a página mantém separadas as da pasta atual e as demais. Salvar A não descarta as pendências de B; depois de salvar A, conectar B recupera as de B. Uma troca enquanto há pendências da pasta atual é recusada, com indicação para voltar à origem e salvar.

A memória de bases conhecidas também passa a ser indexada pela origem. A informação antiga continua sendo considerada de forma conservadora quando ainda não tem identidade; uma base conhecida que desaparece não é recriada silenciosamente.

## Recuperação e segunda aba

Iniciativas, Equipamentos e Paradas mostram **Baixar cópia de recuperação** quando há pendências, operações antigas sem origem ou falha de proteção. O JSON contém pendências ativas, preservadas de outras origens e confirmadas ainda retidas. Baixar não limpa a fila nem modifica uma base. O arquivo serve para conferência assistida; não foi criado um importador que aplique operações arbitrárias automaticamente.

Portal e Waste continuam guardando uma cópia inteira pendente. A trava do navegador abrange toda a operação assíncrona e é liberada pelo próprio navegador quando a aba fecha. O snapshot registra quem o escreveu; uma aba recém-aberta não ganha permissão de editar só porque carregou `pending:true` da outra. Quando não há outro dono vivo, a retomada lê a cópia mais recente antes de aplicar a nova edição.

Sem Web Locks, a edição desses módulos é recusada antes da mutação, com orientação de usar Chrome ou Edge atualizado. Essa trava coordena abas da mesma origem/navegador. Entre computadores continuam valendo os mecanismos anteriores de releitura e conflito; a entrega não transforma arquivos em transações de banco de dados.

## Saúde dos dados

`vacFila.contar` mantém a contagem anterior de operações, para compatibilidade. `vacFila.saude` acrescenta as reservas e os flags locais de cópia inteira do Portal/Waste. A consulta não lê a estrutura de negócio de outra base nem escreve arquivos do compartilhamento. Bancos locais ausentes não são criados pela consulta; leitura indisponível resulta em desconhecido.

O painel pode mostrar, por exemplo, `cópia pendente · 1 na fila`. Para uma cópia inteira não se inventa uma quantidade de operações. As categorias podem se sobrepor durante a proteção e a recuperação, por isso não são somadas como um total fictício. As informações são deste navegador; não representam pendências locais de outra estação.

## Validação

O teste novo `node testes/tnv.js` usa dados fictícios e cobre:

- gravação em A, troca para B e confirmação de que B continua vazia, nos três módulos;
- Portal/Waste com leituras controladas, edição simultânea, recusa da segunda aba e retomada preservando as duas alterações depois do fechamento da primeira;
- cache entre pastas com o mesmo nome e cache offline da própria pasta;
- falha de `vac-fila`, duas abas e reabertura nos três módulos, incluindo volta do IndexedDB na mesma página;
- falha numa aba e IndexedDB funcional na outra, sem apagar a reserva alheia;
- recuperação de filas órfãs com duas origens e isolamento dos respectivos arquivos;
- download de recuperação sem limpar a fila;
- cópia pendente, fila do cadastro, verificação parcial e navegador sem Web Locks;
- identificação persistida por handle, com comparação após reabrir a aba.

O teste está incluído em `testes/tudo.js`. As verificações existentes de reserva foram ajustadas para contar registros por operação e exigir sua limpeza depois da migração. As versões esperadas em Equipamentos/Planner foram atualizadas; os critérios de negócio e de preservação continuam sendo conferidos.

A consolidação da suíte e das repetições terminou com **30 suítes aprovadas, uma parcial, uma não executada e nenhuma falha restante**, entre 32 previstas. O `tnv` final passou em **18 cenários**. `tz` passou na segunda tentativa, conforme a instabilidade já registrada. Excel do Paradas ficou não verificado por falta da biblioteca local; `tmeta` não foi executado por falta do pacote npm `xlsx`.

Na primeira rodada houve quatro suítes com falhas: as expectativas de reserva ainda liam a chave antiga; Equipamentos/Planner ainda esperavam as versões anteriores; o teste estático de URLs ainda não reconhecia o helper comum. As verificações foram atualizadas e ampliadas (inclusive liberação da URL e limpeza das reservas novas), e essas suítes passaram nas repetições. O resultado consolidado não é apresentado como uma única rodada integral sem falhas.

Os três builds oficiais, repetidos em cópia isolada, terminaram sem diferenças. O guia foi regenerado com 11 capturas. Logs e matriz em [evidências da entrega](auditorias/estabilizacao-nv-01-05/LEIA-ME.md).

Os testes usam Chromium/Playwright e OPFS, além de um adaptador externo de navegação HTTP local necessário neste executor. Esse HTTP não faz parte da aplicação. A comparação por handle é exercitada com handles reais do navegador; o compartilhamento físico da fábrica não foi acessado.

## Atualização e limites

Atualizar todos os HTMLs juntos, com as abas antigas fechadas, conforme o **Guia de instalação.html** regenerado. Preservar os dados do navegador enquanto houver pendências e baixar a cópia de recuperação quando necessário. Não misturar uma aba da versão anterior, que desconhece as novas reservas, com a versão nova.

Antes de ampliar o uso: homologar Chrome/Edge corporativo, permissões, caminhos de rede, duas abas, duas estações e restauração de backup numa pasta identificada para homologação. A retenção das confirmadas continua em **24 horas e até 2.000 operações**, dependente do navegador que fez a alteração. Restaurar backup precisa de procedimento porque operações recentes da mesma origem podem ser reaplicadas, conforme a decisão já registrada.

Não foram alterados schemas de negócio, vigências, códigos como texto, contratos de exports ou propriedade das bases. Produção continua vindo de `fontes/producao/`; o kit continua vindo de `fontes/kit/` e dos builds oficiais. As demais etapas de produto e materiais pendentes permanecem no backlog existente.

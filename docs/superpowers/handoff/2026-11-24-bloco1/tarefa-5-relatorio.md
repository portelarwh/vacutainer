# Tarefa 5 · formato v2 do Gel e vacCad.gel

## Mudanças
- comum/bases: `vacCad.gel` com `formato(data)`, `composicao(tubo, comp, data)` e `locais({data, equipamento, ativos})`. O formato vigente vem de `vacCad.vigente`. Sem formato, tubo ou peso o resultado é `null`, nunca um padrão ou zero. A soma é arredondada a 3 casas. `barril` devolve `gPorTubo: null`. `etiqueta` é true só em `completo`. `locais` ordena por `ordem` e tira os inativos e os de equipamento inativo; com `ativos:false` devolve tudo.
- motor/portal: `cadVazio()` nasce com `schemaVersion: 2` e `gel:{formatos:[],locais:[]}`. A validação recusa `schemaVersion > 2` ("mais nova"). Uma base v1 continua carregando. `cadFix` completa `gel` só quando o documento é v2. A gravação mantém a versão que o documento tem (`Math.max(1, versão)`) em vez de forçar 1. A migração e o aviso "formato antigo" ficam para a Tarefa 7.
- `GEL_FMT_DEF` e o `FMT_DEF` do Gel não foram removidos (decisão do controlador: as Tarefas 6 e 8 os removem).

## Cenário de demonstração
`scripts/cenario-demo.cjs` (complemento do portal) agora, uma vez só:
- põe o cadastro em `schemaVersion: 2`, com `gel.formatos` (de 2025-10-01: embalagem 75 g, folha 5 g, sobra 1,6 kg; 100 = 4,779/0,936/0,02/2,3; 75 = 3,56/0,834/0,015/2,3) e `gel.locais` com os 14 locais antigos.
- Mapa de equipamentos: VADG01, as purgas, a sala de gel e o barril vão para EQ03; VASS01 para EQ08; VAEB01 para EQ07; VATU01 para EQ01; VATU02 para EQ02. VARG01 ("3H DELAY") não tinha equipamento no cenário, então criei EQ13 "3H Delay".
- Cópias antigas alinhadas, com o mesmo formato e os mesmos locais, que são o que o código atual lê:
  - `cad.parametros.gel.formatos` (forma antiga `{from,tara,taraP,sobra,f:{tubo,gel,adit,tr}}`).
  - `cad.equipamentos[].gel.descs` (`{id,local,comp,cat,mots}`).
  - A base do Gel (`config.fmts`, `config.equips`) se alinha sozinha pelo `GelCad.aplicar` ao rodar a página. Conferi no bloco gravado: `fmts` e as 14 descs, em 6 equipamentos.
- O complemento calcula `de` com o deslocamento do cenário, para a data voltar a 2025-10-01 depois de gravar. Conferido.
- Rodei `--gravar` e `atualizar:metadados`. O `--gravar` também atualizou as versões dos exports (oee, gel, linha), que estavam defasadas em relação ao código.

## Testes
- RED: `vaccad-gel.test.mjs` com 6 de 6 falhando (antes de implementar). GREEN: 6 de 6 (composições 8,035; 5,715; 5,735; 6,709; 4,394; 4,409; formato antes de 01/10/2025 = null; vigência futura não vale; peso ausente = null; locais).
- Como o cenário passou a ter equipamentos de gel, `gel-producao.cjs` (passo 1) e `scrap-lado.cjs` (passo 4) pressupunham "sem equipamento de gel". Eles passam a tirar os equipamentos só na memória da página (`GelTurno.ctx` com `equips: () => []`). A intenção dos testes é a mesma.
- Resultados: `npm run test:unit` 67 de 67; `gel-producao`, `scrap-lado`, `gel-relatorio`, `cad-consulta` e `adm-assuntos` passam; `tudo.js tgel` passa; `npm test` completo, 71 de 71 suítes. Nenhuma falha.

## Preocupações
- A comparação código novo × antigo (tarefa posterior) vê dados idênticos, mas a lógica antiga ainda usa `GEL_FMT_DEF` quando não há formato, com gel 100 = 0,834, enquanto `vacCad.gel` dá `null`. O cenário traz formato para os dois lados.
- Criei EQ13 no cenário por falta de equipamento para o VARG01; o responsável pode preferir outro equipamento.
- `cadFix` só cria `gel` em documentos v2. Uma base v1 não ganha `gel` até a Tarefa 7.

## Rodada de correção 1 · equip-ordem.cjs
- Causa: o EQ13 do cenário tem os mesmos campos dos outros (linha, tipo, ativo), e o cenário antigo com o código novo também passa; o que quebrava era o teste. Com 13 equipamentos a lista (`.tw`, rolagem interna, cabeçalho fixo) rola diferente depois do `scrollIntoViewIfNeeded` do EQ12. Ou a alça do EQ12 ficava coberta, ou o EQ03 ficava sob o `th` fixo. O arrastar não encontrava o alvo e nada era gravado (posições todas null).
- Correção só no teste: `testes/plataforma/equip-ordem.cjs` agora fixa a rolagem interna da lista em 120 px (mostra a alça do EQ12 e o EQ03 abaixo do cabeçalho). As asserções e o cenário não mudaram; EQ13 permanece.
- Resultados: equip-ordem, adm-gel, gel-producao, scrap-lado, linha-ficha e cad-consulta passam; `npm run test:plataforma` completo, sem falha (rc=0).

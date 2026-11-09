# Verificação da demonstração integrada · 09/11/2026

Base: `main` em `8f952babf2e2764e0e3ec2344432b7f7a75ebd00`. Implementação na branch `codex/demonstracao-integrada`. Uso, arquitetura, fontes e geração: [demonstracao-integrada.md](../demonstracao-integrada.md).

## Resultado funcional

Antes, Portal, Produção, Waste, Gel, Paradas, Equipamentos e Iniciativas tinham exemplos locais. Esses exemplos não formavam uma sessão navegável e usavam referências diferentes. Projetos não tinha exemplo operacional, pois continua em construção.

A entrega acrescenta uma demonstração comum às oito páginas, com uma ordem ligada à produção, perdas, gel, paradas e ações; parada relacionada com OS; busca e ficha comuns. O pacote `paginas/Demonstracao.html` usa as páginas reais e guarda as alterações fictícias na memória durante a navegação. A entrada da Produção também está nas janelas de primeira configuração, sem exigir nome ou pasta.

O teste novo confirmou:

- Menu entre as oito páginas, faixa de demonstração e ficha da mesma ordem em todas.
- Aba planejada de Projetos acessível, mantendo a indicação de construção.
- Encaminhamento pelo contrato de link de Paradas para o Planner, ordem preenchida, criação da ação e leitura no Portal/Minha fila e na ficha.
- Ação preservada ao sair do Planner e voltar; busca leva à ficha de EQ03.
- Reiniciar descarta as alterações de todos os módulos; sair devolve a página original em todas as oito entradas, inclusive o nome acentuado de Gestão de Gel.
- Dados e preferências reais de localStorage iguais antes/depois; pendência sintética do IndexedDB preservada; aberturas de bancos restritas ao prefixo da demonstração; nenhum acesso às APIs de diretórios/arquivos reais durante o cenário.
- Tela sem transbordamento horizontal e saída visível em 1440 e 390 px. Sem erros JavaScript no fluxo integrado.

A comparação de localStorage exclui apenas `vac.aba.*`: são sinais temporários de presença, que a página normal remove quando é fechada para entrar na demonstração. Bases, reservas, usuário e preferências não são excluídos da comparação.

Foi conferido separadamente no navegador: Voltar para Iniciativas, Avançar para Gel e fechar a ficha pelo botão, preservando a demonstração.

## Testes e limites

Comandos na raiz:

```sh
python fontes/kit/aplicar_kit21.py
python fontes/producao/build.py
python fontes/modelo/gerar_paginas.py
python fontes/demo/gerar_demo.py
node fontes/guia/gerar_guia.js
node testes/tudo.js
node testes/tudo.js tdemo tseguranca
```

A execução usa Chromium e Playwright. O ambiente de auditoria bloqueia abrir qualquer `file://`, inclusive HTML mínimo sem código da plataforma. Por isso os mesmos arquivos foram servidos por HTTP local exclusivamente no teste. **A abertura direta na pasta Windows/rede ainda precisa ser conferida na estação da linha.** O pacote foi desenhado para funcionar como arquivo único e não depende de compartilhar localStorage entre arquivos, API ou servidor de produção.

A primeira regressão teve uma falha na comparação dos builds porque o cenário havia sido atualizado sem reembutir os HTML antes daquela fotografia. Depois de regenerar e estabilizar os arquivos, a repetição de `tseguranca` passou. Esse teste foi repetido com o teste integrado na versão final. A comparação adicional dos hashes após os quatro builds confirmou geração reproduzível, incluindo o pacote.

Consolidação das execuções: **31 suítes aprovadas, 1 com item não verificado e 1 não verificada**, considerando a repetição de `tseguranca` após a geração final e o acréscimo de `tdemo`:

| Grupo | Resultado |
|---|---|
| `tdemo` | Aprovada: fluxo integrado, isolamento, reinício, saída e oito origens |
| `tnv`, `tpendencias`, `tcorrecoes`, `tfila`, `tequip`, `tplanner`, `tficha`, `tordens` | Aprovadas |
| `tvigencias`, `tnumeros`, `tcontratos`, `tbases`, `tdiag`, `tintegra`, `tpg`, `tseguranca` | Aprovadas |
| `tconstrucao`, `tvisual`, `t18`, `t18c`, `t18d`, `t18e`, `tc`, `tdin`, `tg`, `tk`, `tq`, `tr`, `ts1`, `tz` | Aprovadas |
| `trelatorios` | Passou; Excel de Paradas não verificado por falta de `paginas/lib/xlsx.full.min.js` (E3b) |
| `tmeta` | Não verificada: falta o pacote npm `xlsx` no ambiente |

O guia foi regenerado com 11 imagens reais. As capturas e logs de desenvolvimento ficam em `/workspace/resultado-demo/` e `testes/saida/` (fora do Git). Não há dados da pasta operacional nesses testes.

## Pontos para revisão independente

1. Conferir em Chrome/Edge da linha, abrindo o pacote pelo arquivo local, sem pasta conectada e sem internet; conferir navegação, gráficos, busca e entrada/saída.
2. Conferir que o pacote é atualizado junto com os HTML e que o empacotamento roda sempre depois dos outros builds. Ele contém cópias das oito páginas; não acompanha alterações de fonte automaticamente.
3. As alterações do cenário duram só na sessão do pacote. Recarregar/fechar inicia outro exemplo; guias separadas têm cenários independentes.
4. A demonstração cobre as funcionalidades que existem. Projetos, MES, importação OSM e procedimentos AM/TPM continuam sujeitos ao escopo e aos materiais pendentes.
5. O isolamento cobre os caminhos normais do programa, não código arbitrário executado manualmente no console. Os contratos operacionais e a persistência das bases reais permanecem na arquitetura atual.

# Linha 360° · planta interativa da linha

Versão 1.0.0, 12/11/2026. Arquivo `paginas/Linha-360.html`, **gerado**: editar `fontes/linha360/` e rodar `python fontes/linha360/build.py`.

## Para que serve

Mostrar, sobre o desenho da linha, o que está acontecendo em cada ponto: tempo parado, ocorrências, quebras, ordens de serviço e ações. O protótipo do usuário (`Linha-Inteligente-360-Editor-Visual-Areas.html`) usava números simulados; esta página lê os dados reais.

## De onde vêm os dados

| O que aparece | De onde vem | Observação |
|---|---|---|
| Tempo parado, ocorrências, quebras, últimas paradas | `exports.eventos` do Paradas | Só o período que o Paradas publica (`eventosCobertura`) |
| Ordem em produção, lote e catálogo | `exports.ordens` da Produção | Com o botão da ficha da ordem |
| OS abertas e atrasadas | `exports.os` de Equipamentos | |
| Ações abertas e atrasadas | `exports.acoes` de Iniciativas | Vínculo `equipamento` ou `ponto` |
| Pontos, áreas, postos, pessoas por turno, checklists | `linha360-base.json` (base própria) | Única coisa que a página grava |

Página que não foi lida aparece como "sem dados", nunca como zero. Ação nova abre em Iniciativas (`vacNovaAcaoHref`, origem `linha360`, vínculo `ponto`) e OS nova abre em Equipamentos (`#novaOS=`): nada é copiado para cá.

## Planta

- Desenho: página 2 do `LINHA.pdf`, em `fontes/linha360/planta.webp` (2000 × 1125).
- Pontos 1 a 12 e 14 a 18, com os nomes e os fluxos (comum, EDTA, SST) da página 1 do PDF. O 13 não existe no desenho.
- Cada ponto é ligado a um ou mais **equipamentos do cadastro do Portal**. Sem vínculo gravado, a página sugere pelo nome ou apelido (pílula "sugerido"); confirmar em Configuração.
- Parada de equipamento sem ponto entra no total e gera um aviso com os códigos.
- Camadas: tempo parado, ocorrências, quebras, OS abertas, ações abertas e fluxo produtivo. A intensidade (baixa, média, alta) é relativa ao maior ponto do período e vem escrita no título do ponto.
- Áreas: polígonos sobre a planta, com a soma dos pontos. Editáveis em Configuração (nome, pontos, redesenhar clicando nos cantos).

## Base (`schema: vac-linha360`, `schemaVersion: 1`)

`pontos`, `areas`, `postos`, `checklists`, `feitos`, `auditoria`, `exports`. Gravação por operações, igual a Equipamentos e Iniciativas (`fontes/linha360/nucleo.js`): `ponto`, `area`, `posto`, `chk`, `feito`, `desfeito`. Nada se apaga (`ativo:false`, `anulado:true`). Os padrões de pontos, áreas e postos ficam no código; a base guarda só o que foi alterado.

`exports`: `pontos` (com os equipamentos), `areas`, `postos`, `checklists`, `pendencias` (posto sem pessoa, ponto sem equipamento) e `kpis`.

## O que falta

- Conferir com a linha a posição dos pontos e dos postos (foram tiradas do PDF e do fluxograma do protótipo) e os trajetos dos fluxos, que são aproximados.
- Vincular os equipamentos reais do cadastro a cada ponto.
- Cartão da Linha 360° no Portal › Visão geral e leitura das pendências dela pelo Portal.
- OEE e contadores por equipamento dependem do MES (E12).
- Conteúdo dos checklists: vem dos padrões da área (E13).

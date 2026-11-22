# Pasta IMAGENS: banco de imagens, planta e marca

Pedido do responsável em 22/11/2026 (plataforma 1.8.51 e 1.8.52). A pasta `IMAGENS` fica na pasta da linha, ao lado do `Plataforma.html`.
Nada é enviado nem copiado para dentro das bases: a plataforma lê a pasta quando abre, quando você clica em Sincronizar e no botão Atualizar
do banco. Foto nova colocada na pasta aparece sozinha nessas leituras.

```text
Pasta da linha/
├── Plataforma.html
├── IMAGENS/
│   ├── PLANTA_BAIXA.SVG      # planta da linha usada na Linha 360° (vetor; troque o arquivo para atualizar a planta)
│   ├── Marca/                # fontes e logos da BD (docs/MARCA.md); fica fora do banco de imagens
│   ├── Linha/                # fotos da linha: o banco da camada Fotos da Linha 360°
│   │   └── <subpastas>/      # opcionais: viram categorias no filtro "Subpasta"
│   └── <outras pastas>/      # aparecem no "Escolher do banco" dos Formulários
└── 00. Bases/ …
```

## Como funciona

- **Leitura:** `vacImagens` (no motor/linha, o único que usa) lista `IMAGENS/<subpasta>` pela pasta conectada (até 4 níveis de subpasta), com miniaturas de no
  máximo 320 px feitas na hora e guardadas só na sessão. O navegador não lista uma pasta pelo endereço; por isso o banco precisa da pasta da linha
  conectada. Sem ela, o banco mostra o aviso; na demonstração, 8 fotos fictícias.
- **Formatos:** JPG, JPEG, PNG, WebP, GIF, SVG, BMP e AVIF.
- **Quem usa uma foto guarda só o caminho** (`IMAGENS/Linha/x.jpg`). Foto renomeada, movida ou apagada na pasta aparece como "não encontrada"
  (pino vermelho e a lista "No mapa, mas não estão mais na pasta"), sem sumir sem aviso.

## Planta da linha (Linha 360°)

- A planta vem de `IMAGENS/PLANTA_BAIXA.SVG`, lida pela pasta conectada ou pelo caminho ao lado do `Plataforma.html`. Sem o arquivo, vale a
  planta embutida (imagem de 2000 × 1125 px, que perde nitidez a partir de uns 200%).
- Em vetor, o zoom vai a 800% sem perder nitidez; com a planta embutida, até 400%. Ctrl + roda do mouse aproxima no ponto do cursor.
- A proporção do desenho vem do `viewBox` (ou de `width`/`height`) do SVG. Pontos, postos, áreas e fotos ficam em % do desenho: uma planta nova
  com o mesmo enquadramento não desloca nada; com outro enquadramento, reposicione os pontos em Configuração › Editar posições.
- Do CAD: exporte a planta como SVG (DWG/DXF → SVG) e salve com o nome `PLANTA_BAIXA.SVG`. Prefira linhas a texto convertido em curvas pesadas;
  arquivos de até alguns MB abrem bem.

## Fotos na planta (Linha 360° › Visão da linha › camada Fotos)

- Ao lado da planta abre o banco `IMAGENS/Linha`, com o filtro **Todas** ou **Não colocadas**, subpasta e busca pelo nome.
- **Arraste** uma foto do banco até o local na planta. Para mudar de lugar, arraste o pino da foto. Clique no pino para ver a foto grande, o
  ponto mais perto e quem a colocou; ali também fica **Tirar do mapa** (o arquivo continua na pasta).
- Afastado, as fotos próximas viram um pino com o número de fotos; clique para aproximar. A partir de 200%, cada foto aparece com a miniatura.
- Gravação: bloco aditivo `fotos` em `linha360-base.json` (`{k:'foto'}`), com id = caminho do arquivo, `x`/`y` em %, `em`, `por`, `porId`.
  Nada se apaga: tirar do mapa grava `ativo:false` com quem e quando.

## Formulários A4

"Escolher do banco" lista a pasta `IMAGENS` inteira (menos `Marca`). A foto escolhida é reduzida e copiada para `Formularios/` junto do
formulário, como em "Adicionar fotos": trocar ou apagar a foto do banco depois não muda o formulário.

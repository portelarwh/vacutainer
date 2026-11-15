# Marca: fonte e logos oficiais (fora do repositório)

O repositório é público. A fonte **FS Albert Pro** é comercial e as logos são marca registrada da BD: **nenhum desses arquivos entra no git
nem é embutido no `Plataforma.html`**. Eles ficam só na pasta da rede.

## Onde colocar

Uma pasta `Marca` ao lado do `Plataforma.html`:

```
Pasta da linha\
├─ Plataforma.html
├─ Marca\
│  ├─ FSAlbertPro-Regular.otf
│  ├─ FSAlbertPro-Bold.otf
│  ├─ FSAlbertPro-Italic.otf
│  ├─ BD_1-Color_Reverse_RGB_TransparentBurst.svg   (barra lateral, fundo navy)
│  └─ BD_2-Color_RGB.svg                            (relatório impresso, fundo claro)
├─ 00. Bases\
└─ 00. Backups\
```

Os nomes são os do kit de marca; não renomeie.

## Como funciona

- `src/design/marca.ts` declara os `@font-face` apontando para `Marca/…` e é aplicado na casca (`main.tsx`), em cada motor incorporado
  (`runtime.ts`, junto do `brand.css`) e no relatório impresso da casca.
- A logo da barra lateral só troca o símbolo em texto depois que o arquivo carrega (`BrandLogo`), então não há imagem quebrada.
- **Sem a pasta** (ou sem um dos arquivos) nada quebra: o texto sai em Arial (a reserva de `--bd-font-body`) e a barra lateral mostra o símbolo "V".
- `font-display: block`: a leitura na pasta leva milissegundos e o texto não troca de fonte depois de aparecer (sem salto de layout).
- O kit de marca não tem o peso Light: os títulos usam o Regular.

## O que não fazer

- Não copiar a pasta `Marca` para dentro do repositório (está no `.gitignore`), nem converter a fonte em base64 dentro de CSS ou HTML.
- Não publicar o `Plataforma.html` com a fonte embutida.

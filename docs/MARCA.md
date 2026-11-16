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

- o bloco `modulo/design/marca` declara os `@font-face` apontando para `Marca/…` e é aplicado na casca (`modulo/main`), em cada motor incorporado
  (`modulo/core/runtime`, junto do `brand.css`) e no relatório impresso da casca.
- A logo da barra lateral só troca o símbolo em texto depois que o arquivo carrega (`BrandLogo`), então não há imagem quebrada.
- **Sem a pasta** (ou sem um dos arquivos) nada quebra: o texto sai em Arial (a reserva de `--bd-font-body`) e a barra lateral mostra o símbolo "V".
- `font-display: block`: a leitura na pasta leva milissegundos e o texto não troca de fonte depois de aparecer (sem salto de layout).
- O kit de marca não tem o peso Light: os títulos usam o Regular.

## O que não fazer

- Não copiar a pasta `Marca` para dentro do repositório (está no `.gitignore`), nem converter a fonte em base64 dentro de CSS ou HTML.
- Não publicar o `Plataforma.html` com a fonte embutida.

## Estrutura da pasta operacional

A raiz é a pasta que você seleciona em **Conectar pasta**, não a pasta `Marca` nem `00. Bases`.

```text
Pasta da linha/
├── Plataforma.html
├── Marca/                         # arquivos oficiais opcionais, nomes acima
├── 00. Bases/
│   ├── vacutainer-cadastros.json
│   ├── portal-base.json
│   ├── oee-vacutainer-base.json
│   ├── ordens-base.json
│   ├── perdas-base.json
│   ├── fifo-base.json
│   ├── paradas-base.json
│   ├── equipamentos-base.json
│   ├── iniciativas-base.json
│   ├── linha360-base.json
│   └── Preferencias/              # arquivos de layout por ID de pessoa
├── 00. Backups/
│   ├── Portal/
│   ├── OEE/
│   ├── Perdas/
│   ├── Gel/
│   ├── Paradas/
│   ├── Equipamentos/
│   ├── Iniciativas/
│   └── Linha360/
└── pastas de relatórios de entrada # conforme o caminho configurado em cada importador
```

As bases e subpastas são mantidas pelo aplicativo conforme o uso; não criar JSON vazios, renomear bases ou apagar dados existentes para reproduzir a árvore. Projetos ainda está em construção: não é necessário criar `projetos-base.json`. Algumas rotinas também guardam originais SAP nas pastas configuradas; preserve-as. Os logs de backup ficam nas subpastas do respectivo módulo.

Na pasta da linha, `scripts`, `testes`, `node_modules` e `docs` não são dependências de execução. A pasta `Marca` fica somente nessa distribuição local/corporativa e continua excluída do Git. A distribuição e o retorno seguem [CORTE.md](CORTE.md).

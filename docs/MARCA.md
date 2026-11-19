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
│  ├─ BD_2-Color_RGB.svg                            (relatório impresso, fundo claro)
│  ├─ favicon.svg                                   (ícone da aba do navegador: símbolo BD legível em fundo claro)
│  ├─ login.png ou login.svg                        (foto de fundo da tela de entrada; aparece desfocada)
│  └─ login1.jpg, login2.png, login3.webp…          (opcional: várias fotos que trocam a cada 3 s)
├─ 00. Bases\
└─ 00. Backups\
```

Os nomes são os do kit de marca; não renomeie.

## Como funciona

- o bloco `modulo/design/marca` declara os `@font-face` apontando para `Marca/…` e é aplicado na casca (`modulo/main`), em cada motor incorporado
  (`modulo/core/runtime`, junto do `brand.css`) e no relatório impresso da casca.
- A logo da barra lateral só troca o símbolo em texto depois que o arquivo carrega (`BrandLogo`), então não há imagem quebrada.
- O favicon (`aplicarFavicon`, plataforma 1.7.2) segue a mesma regra: `Marca/favicon.svg` só vira ícone da aba se carregar; sem ele, a aba fica sem ícone. O nome `favicon.svg` foi escolhido pelo responsável. Em `file://`, confirmar no Chrome/Edge corporativo se o navegador mostra o ícone.
- A tela de entrada (plataforma 1.8.9) usa `Marca/login.png` ou, sem ele, `Marca/login.svg` como fundo, desfocado e escurecido para destacar o login. Sem nenhum dos dois, o fundo é o azul da marca. Foto em paisagem, de preferência 1920 × 1080 ou maior; o nome tem de ser exatamente `login.png` ou `login.svg`.
- **Várias fotos (plataforma 1.8.22):** `login1`, `login2`, `login3`… (`.jpg`, `.jpeg`, `.png`, `.webp` ou `.svg`; a plataforma 1.8.23 passou a aceitar `.webp` e `.jpeg`), em sequência e sem pular número: a busca para no primeiro número que falta (até 30). Elas trocam a cada 3 s com transição suave; com fotos numeradas, o `login.png` só aparece enquanto elas carregam. Quem usa "reduzir movimento" no sistema vê só a primeira. O desfoque passou de 12 px para 4 px.
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
│   ├── Portal/                    # base da Administração (portal-base.json)
│   ├── Cadastros/                 # vacutainer-cadastros.json
│   ├── OEE/
│   ├── Ordens/                    # ordens-base.json (Produção)
│   ├── Perdas/
│   ├── Gel/
│   ├── Paradas/
│   ├── Equipamentos/
│   ├── Iniciativas/
│   ├── Linha360/
│   └── Projetos/                  # quando Projetos gravar
└── pastas de relatórios de entrada # conforme o caminho configurado em cada importador
```

Todas as páginas usam a mesma pasta raiz (a conectada na plataforma). As subpastas de `00. Backups/` são criadas pelo aplicativo no primeiro backup de cada página. A Administração continua dentro do `Plataforma.html` e usa `00. Bases/portal-base.json`: não apagar; sem ele a Administração fica sem a pasta (restaure o backup de `00. Backups/Portal/`). As bases e subpastas são mantidas pelo aplicativo conforme o uso; não criar JSON vazios, renomear bases ou apagar dados existentes para reproduzir a árvore. Projetos ainda está em construção: não é necessário criar `projetos-base.json`. Algumas rotinas também guardam originais SAP nas pastas configuradas; preserve-as. Os logs de backup ficam nas subpastas do respectivo módulo.

Na pasta da linha, `scripts`, `testes`, `node_modules` e `docs` não são dependências de execução. A pasta `Marca` fica somente nessa distribuição local/corporativa e continua excluída do Git. A distribuição e o retorno seguem [CORTE.md](CORTE.md).

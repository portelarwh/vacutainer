# Sistemas · Linha Vacutainer

Código-fonte das páginas da linha (Portal, Produção, Waste, Gel, Paradas).

## Instalar e atualizar na pasta da rede

Abra **`Guia de instalação.html`** (raiz do repositório e do ZIP) no Chrome ou no Edge: passo a passo com prints de onde clicar, para baixar o ZIP, atualizar a pasta da rede e liberar o sistema no computador de outra pessoa. Gerado por `node fontes/guia/gerar_guia.js`.

## Pastas

```
paginas/   as 5 páginas prontas → é isto que vai para a pasta da rede
fontes/    producao/ (base + módulos + build.py) · kit/ (cabeçalho comum) · guia/ (gerador do Guia de instalação)
docs/      arquitetura, contratos e histórico de cada página
testes/    testes Playwright, bases fictícias, amostras do SAP
CLAUDE.md  regras do projeto (o Claude Code lê sozinho)
```

## Começar no Claude Code

1. Descompacte numa pasta do seu computador (ex.: `Documentos\sistemas-vacutainer`), **não** na pasta da rede.
2. Abra um terminal nessa pasta e rode uma vez:
   ```
   git init
   git add .
   git commit -m "Ponto de partida: Portal 1.8.1, Produção 2.4, Waste 1.8.6, Gel 1.95, Paradas 1.0.5"
   ```
3. Abra a pasta no Claude Code e peça o que quiser (ex.: "leia o CLAUDE.md e os docs da Produção e …").
4. Para publicar: copie os arquivos de `paginas/` para a pasta da rede (por cima dos atuais). As bases JSON da rede não são tocadas.

## Rotina

- Produção: nunca editar `paginas/OEE-Vacutainer.html` direto; editar `fontes/producao/` e rodar `python fontes/producao/build.py`.
- Kit do cabeçalho: editar `fontes/kit/kit_v21.js` e rodar `python fontes/kit/aplicar_kit21.py` + o build da Produção.
- Testes: `npm i -D playwright xlsx` (uma vez) e `node testes/tpg.js` (ou outro de `testes/`).
- Um commit por entrega (ex.: "Waste 1.8.7: filtro por turno").

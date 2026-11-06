# Sistemas · Linha Vacutainer

Código-fonte das páginas da linha (Portal, Produção, Waste, Gel, Paradas).

## Pastas

```
paginas/   as 5 páginas prontas → é isto que vai para a pasta da rede
fontes/    producao/ (base + módulos + build.py) · kit/ (cabeçalho comum)
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
- Testes: `npm i -D playwright` (uma vez) e `node testes/tpg.js`.
- Um commit por entrega (ex.: "Waste 1.8.7: filtro por turno").

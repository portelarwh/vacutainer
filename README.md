# Sistemas · Linha Vacutainer

Plataforma única da linha e fontes dos nove motores atuais.

## Produto e instalação

A plataforma única é o produto: `nova-plataforma/dist/Plataforma.html`. O Chrome/Edge abre esse arquivo na pasta da linha; bases e backups continuam em `00. Bases/` e `00. Backups/`. Sem API ou servidor interno.

**O corte ainda não foi executado.** Leia [o roteiro de homologação e corte](nova-plataforma/docs/CORTE.md) e o `Guia de instalação.html`. Os HTML de `paginas/` não serão distribuídos: são as fontes e referências dos motores atuais incorporados à plataforma.

## Compilar e testar

```sh
npm install
npm ci --prefix nova-plataforma
npm run build --prefix nova-plataforma
npm test
npm run test:all --prefix nova-plataforma
```

O build da plataforma compila a raiz antes de empacotar os nove motores. Alterações de regra continuam em `fontes/` ou `paginas/`, conforme o proprietário documentado em [CLAUDE.md](CLAUDE.md). A casca React não duplica esses cálculos.

Código e contratos da plataforma: [nova-plataforma/README.md](nova-plataforma/README.md). Correção da revisão PR76: [acompanhamento](nova-plataforma/docs/pr76/ACOMPANHAMENTO.md).


## Preparação de layout e marca

Para trabalhar no produto novo, leia [o ponto de entrada dos agentes](nova-plataforma/docs/COMECE-AQUI.md), o [Design System](nova-plataforma/docs/DESIGN_SYSTEM.md) e a [referência BD](nova-plataforma/docs/BD_Dashboard_Brand_Guidelines.md). As alterações visuais usam os mesmos tokens na casca e nos motores incorporados, preservando suas regras.

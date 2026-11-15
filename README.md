# Vacutainer

**Abra ou baixe [Plataforma.html](Plataforma.html). É o aplicativo completo e sua única fonte de código.**

Não precisa de páginas antigas, instalação de Node, internet, API ou servidor. Produção, Portal, Waste, Gel, Paradas, Equipamentos, Iniciativas/Ações, Linha 360°, Projetos e demonstração estão incorporados. Os dados operacionais permanecem em `00. Bases/` e `00. Backups/`; não entram no Git.

Para testar sem dados reais, abra `Plataforma.html?demo=1` ou use o botão de demonstração. Fontes/logotipos oficiais são opcionais e externos por licença: [MARCA](docs/MARCA.md).

## Melhorar o aplicativo

Leia [AGENTS](AGENTS.md) e [COMECE-AQUI](docs/COMECE-AQUI.md). Os componentes, estilos, motores e bibliotecas são blocos nomeados dentro do mesmo HTML. Procure `data-vac-source="css/brand"`, `modulo/App` ou `motor/oee`, conforme o que precisa editar. Não há outra cópia de fonte nem etapas Python de substituição.

Testes, scripts de verificação, documentação e licenças são mantidos para permitir evolução com segurança. Nenhum deles é consultado pelo aplicativo durante o uso.

```sh
npm ci
npm run build
npm run test:unit
npm test
npm run test:plataforma
```

Node 22 e Chromium do Playwright são necessários apenas para esses comandos. `npm run dev` abre uma prévia local com o mesmo HTML. Detalhes: [arquitetura](docs/ARQUITETURA.md), [consolidação](docs/CONSOLIDACAO.md), [plano visual](docs/PLANO-DE-MELHORIAS.md), [pendências](PENDENCIAS.md) e [homologação/corte](docs/CORTE.md).

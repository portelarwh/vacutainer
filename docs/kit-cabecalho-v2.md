# Kit · cabeçalho comum v2 (`vac-cabecalho v2`)

05/11/2026 · feito e aplicado em **Portal 1.7.1, Produção (OEE) 2.0.1, Waste 1.8.1, Gestão de Gel V1.92 e Paradas 1.0.2**. Substitui o v1 de `claude/kit-cabecalho-e-backups.md` (backups por módulo continuam iguais). O quadro de Versões do Portal passa a esperar v2.

## O que o v2 acrescenta (igual em todas as páginas)

- **Barra**: nomes novos mesmo com `vac.sistemas` antigo (OEE → Produção, Perdas → Waste, Gel → Gestão de Gel; `vacNomeSis`); páginas com `grupo:'outros'` e os ids antigos `maquinas`/`manut` vão para **Outros ▾**, junto com os links de `localStorage['vac.links']` (editados no Portal › Administração › Configuração do Portal); a barra **esconde as páginas sem "ver"** no perfil de quem entrou (a página atual sempre aparece).
- **⚙** ao lado do tema: nas páginas é um link para `Portal.html#admin`; no Portal abre a Administração. O link "Cadastros" saiu da barra.
- **Título da página** = nome exibido na barra (ex.: o OEE mostra PRODUÇÃO). TV e relatórios de cada página mudam na fase de cada uma.
- **Entrar pelo ID** (`VacEntrar`): lê os usuários da cópia do cadastro (`localStorage['vac.cadastros']`, que o Portal grava); grava `vac.user`, `vac.userId`, `vac.perfil`; mostra "nome · perfil" no topo. ID desconhecido → "Fazer o 1º acesso no Portal" (`Portal.html#entrar`) ou usar só um nome neste navegador. "Sair" esquece no navegador. No Portal, usa o Entrar completo (com autocadastro).
- Gancho opcional `vacAoTrocarUsuario(nome)`: o OEE grava em `Store.S.user` e IDB; o Gel em `fifo.resp`. Evento `vac:usuario` no `window`.
- **Funções para as páginas usarem** nas próximas fases: `vacCad()`, `vacUsuario()`, `vacPerfil()`, `vacPode(modulo, funcao='ver')` (ver, lancar, fechar, importar, exportar, excluir, configurar; sem perfil = pode) e `vacSemaforo(valor, meta, {inverso})` → `'ok'|'warn'|'crit'|'none'` com os limites do cadastro (`parametros.semaforoVerdePct/AmareloPct`, padrão 100/90).
- Como foi aplicado: a função v1 `renderSysNav` foi renomeada para `renderSysNav_v1` (sem uso) e o bloco v2 entra antes do fim do bloco JS do kit; o CSS v2 (menu Outros, ⚙ como link, janela Entrar) antes do fim do bloco CSS; HTML: `<span id="sysOutros">` depois da barra e o ⚙ antes do tema; o `#stUser` de cada página passa a ser desenhado por `vacUserRender()`.

## Ainda não está no v2 (fica para a fase de cada página)

- Permissões além de "ver" (lançar, fechar, importar…) dentro das páginas.
- Busca global entre páginas (depende do `exports.indice`, plano § 3.4).
- Modo demonstração padronizado (hoje cada página tem o seu, todas com saída).
- Ler o cadastro em modo travado (OEE, Gel, Waste).

## Waste 1.8.1 (junto com o kit)

- **Busca livre na tabela** (ao lado de Ordens · Componentes · Prioridades · Excluídas): filtra só a tabela, em todos os campos da linha (para ordens, também componentes, causa, comentários e ações); não muda os totais do painel.
- Pílula de competência **Atual** (mês corrente; avisa quando ainda não há dados e sugere "Última").

## Kit v2.1 (05/11/2026) · Voltar e atualização ao voltar

Bloco `vac-cabecalho v2.1` (arquivo-fonte `kit/kit_v21.js`, igual em Portal 1.7.6, Produção 2.2.2, Waste 1.8.2, Gestão de Gel 1.93, Paradas 1.0.3):
- **← Voltar** ao lado do título (aparece quando há para onde voltar): `history.back()`. Clicar numa aba (`#nav [data-route|data-t|data-tab]`, `[role=tab][data-tab]`) cria uma entrada no histórico do navegador; voltar clica de novo na aba anterior. Também funciona o voltar do navegador/mouse e Alt+←. Entre páginas, o voltar é o do navegador (a navegação é na mesma aba).
- Página com aba "virtual" define `vacNavAtual()` → `{attr,val,sub}` (Produção: rota + sub-aba de Ordens).
- `history.replaceState(null…)` da página não apaga a posição gravada (o kit preserva `vacNav`).
- **Ao voltar para a página** (visibilitychange, focus, pageshow restaurada) chama `vacAoVoltar()` se a página definir. Produção: relê `perdas-base.json` (KKBC) e `ordens-base.json` sem F5 e redesenha se mudou (não redesenha com modal aberto, campo em foco ou texto colado). Portal: relê as bases das páginas (readModules) e o cadastro. Waste, Gel e Paradas já reliam a própria base ao voltar.

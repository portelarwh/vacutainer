# Login com ID e senha (kit vacLogin · 11/11/2026)

Portal 1.9.22 · Produção 2.4.45 · Waste 1.8.34 · Gel 2.25 · Paradas 1.0.30 · Equipamentos 1.0.9 · Iniciativas 1.1.6 · Projetos 0.1.9.

## O que a pessoa vê

1. Qualquer uma das 8 páginas abre com a janela **Sistema de gestão Vacutainer** (logo da pasta à direita) sobre a página escurecida. A página atrás fica sem clique (`inert`) até entrar.
2. Digita o **ID**. Aparecem o nome, a função (especialidade · área, ou o turno) e o perfil.
3. Digita a **senha de 6 números** (6 caixas, teclado numérico; colar os 6 números também funciona; o 6º número já confere).
4. A sessão vale **neste computador até o fim do turno** em que entrou, em todas as páginas abertas nele. Clique no nome no cabeçalho: Trocar usuário, Trocar minha senha, Sair.

| Situação | O que acontece |
|---|---|
| Computador sem cadastro (`vac.cadastros`) | Portal: "Conectar pasta". Outras páginas: "Abrir o Portal". |
| ID inativo | Não entra ("fale com o administrador"). |
| ID fora do cadastro | **Autocadastro** no Portal: nome, turno, especialidade e senha; perfil Consulta (`origem: 'autocadastro'`). Nas outras páginas: "Ir para o Portal". |
| ID sem senha | **A própria pessoa cria** a senha (2 vezes) no Portal. Nas outras páginas: "Ir para o Portal" (`#entrar=<página>`; depois de entrar, volta para a página). |
| Senha provisória | Depois de digitá-la, cria a definitiva no Portal. |
| Senha fraca | Recusada: 111111, 123456, 987654… |
| 5 senhas erradas | ID bloqueado **neste computador** por 5 minutos (`vac.login.erros`). |
| Sessão vencida (fim do turno) | O pop-up volta. Sair numa página reabre nas outras. |
| TV (`#tv`, `.tv`, `#tv` visível) | Sem login, só leitura. |
| Demonstração, modo de teste, testes automáticos | Sem pop-up (`navigator.webdriver`; o `testes/tlogin.js` liga com `localStorage['vac.login.forcar']='1'`). |

## Onde fica

- `vacutainer-cadastros.json` › `usuarios[].senha = {alg:'PBKDF2-SHA256', iter:150000, sal, hash, provisoria, em, por}` (campo novo e opcional; quem não usa ignora). Só o Portal grava (regra 2), por operação `edição` de `usuarios` com `mudancas.senha`; o histórico mostra `(oculto)`.
- Portal › Cadastros › Usuários: coluna **Senha** (sem senha · provisória · definida) e, na ficha, **Gerar senha provisória** (6 números mostrados uma vez) e **Zerar senha** (precisa da edição do cadastro desbloqueada).
- Kit (`fontes/kit/kit_v21.js`, `vacLogin`): pop-up, conferência, sessão (`vac.sessao = {id, nome, em, ate, pagina}`), bloqueio e último acesso (`vac.login.ultimo.<id>`). O `VacEntrar` antigo do cabeçalho abre o login. Portal: ganchos `window.vacLoginPortal` (conectar, turnos, criarSenha, autocadastro). Produção: o "Quem está usando?" e o `openUser` do Gel só aparecem quando o login não vale.
- Fim da sessão: o turno do Portal (`vacTurnosEm`) que contém a hora da entrada (inclui o T3 que cruza a meia-noite); fora de turno, o fim do próximo turno (no máximo 12 h); sem turno, 12 h.

## Limites (conhecidos e aceitos)

- **Identifica quem lança; não é cofre.** As páginas rodam no navegador e o cadastro é um arquivo na rede. Quem copia o arquivo vê a senha embaralhada e pode testar as 1 milhão de combinações; o PBKDF2 com 150 mil iterações leva isso de segundos para horas por pessoa. Pelas ferramentas do navegador também dá para pular o pop-up. Segurança forte (AD/SSO) pede servidor.
- "Usuário cria" + autocadastro: quem souber o ID de um colega que ainda não tem senha pode criá-la. Mitigação: a ficha mostra quando e por quem a senha foi criada, a pessoa vê o último acesso neste computador ao entrar, o administrador zera a qualquer momento.
- O bloqueio e o último acesso são por computador. Outra estação pode ter uma cópia do cadastro mais velha até abrir o Portal (a senha nova só vale lá depois disso).

Teste: `node testes/tlogin.js` (incluído no `testes/tudo.js`).

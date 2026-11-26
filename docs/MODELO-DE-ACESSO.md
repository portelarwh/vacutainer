# Modelo de acesso (quem pode o quê)

Decisão do responsável (26/11/2026, auditoria B02): documentar o modelo de acesso como ele é.

## O que o ID e a senha fazem
- **Identificam** quem fez cada alteração (auditoria com nome e ID, contrato 8) e decidem **o que a tela oferece** (perfil, página inicial, o que aparece como "somente consulta").
- A senha é de **6 números**. Só o hash (PBKDF2-SHA256, 150 mil iterações, com sal) é gravado, em `00. Bases/vacutainer-cadastros.json`.
- A sessão vale no navegador de cada computador (`vac.sessao`) e expira.

## O que o ID e a senha NÃO fazem
- **Não protegem o arquivo.** A plataforma roda inteira no navegador, sem servidor. Quem consegue **escrever** na pasta de rede pode editar os `.json` direto e ignorar perfis e permissões. Quem consegue **ler** a pasta vê o cadastro, incluindo o hash de cada senha; com 6 números, o hash pode ser quebrado offline em minutos.
- Por isso a senha de 6 números **não é segredo forte**: serve para saber quem foi, não para impedir um mal-intencionado com acesso à pasta.

## A proteção real é a permissão da pasta de rede
Recomendação de configuração (NTFS/compartilhamento):
| Quem | Permissão na pasta da plataforma |
|---|---|
| Quem só consulta (Entrar só para consulta) | **Leitura** |
| Operação e liderança (lançam, importam, fecham) | **Leitura e escrita** em `00. Bases` e `00. Backups` |
| Administradores do cadastro | **Leitura e escrita**, mais controle da pasta |
| Todos | **Sem permissão** de excluir fora dos administradores; backup da pasta fora do compartilhamento |

Boas práticas: grupo de rede por perfil (não por pessoa); o `Plataforma.html` somente leitura para todos (só o administrador atualiza); backup diário da pasta em outro local; não guardar a pasta em compartilhamento aberto a toda a rede.

## O que a plataforma já faz para ajudar
- Sem login válido, **nenhuma gravação** passa (exceção única: o cadastro inicial de uma pasta nova, contrato 4).
- Uma recusa de gravação aparece como falta de **permissão**, não como "arquivo não encontrado".
- Gravação com releitura, backup antes de cada gravação e fila durável (contrato 3); a auditoria registra quem mudou o quê.
- O escape de HTML e a neutralização de fórmula em CSV/Excel reduzem o risco de conteúdo malicioso vindo de dados digitados.

## Quando isso não basta
Se houver necessidade de impedir tecnicamente que alguém com acesso à pasta altere dados (requisito de auditoria externa, por exemplo), é preciso mudar o desenho: autenticação em servidor e gravação só por ele. Isso é uma evolução fora do escopo atual e deve virar decisão do responsável.

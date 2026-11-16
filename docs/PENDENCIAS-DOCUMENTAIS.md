# Pendências documentais e escopo

Registro de 15/11/2026. As diferenças abaixo não autorizam alterações nos motores. Preserve o comportamento atual até identificar a decisão aplicável e obter autorização quando a regra precisar mudar.

Após a consolidação, caminhos para paginas/ e fontes/ no histórico referem-se ao commit anterior, não a dependências atuais. Consulte COMECE-AQUI.md para os blocos do HTML único e PENDENCIAS.md na raiz para a lista ativa.

| Tema | Situação e orientação para os agentes |
|---|---|
| Marca | A referência fornecida está em BD_Dashboard_Brand_Guidelines.md. O Design System desta pasta detalha sua aplicação e as correções de contraste; a frase antiga de paleta indefinida foi substituída para esta preparação visual. O Maxwell não foi consultado. |
| Microparadas | docs/producao-ordens-sap.md menciona 5 min; docs/paradas-arquitetura.md/portal-pedido-paradas.md mencionam 10 min e confirmação em documento controlado. Auditar o parâmetro efetivo do Portal e a decisão vigente antes de qualquer alteração. Não escolher um limiar só pelo texto de um MD. |
| Sev | Decisão atual da PR76: sev 1 urgente e sev 2 atenção também no Portal. A antiga conversão interna para 2 urgente é histórica; não reintroduzi-la. |
| Exports | A casca só consome exports compatíveis. Base incompatível não gera números por fallback bruto. A documentação histórica do Portal não autoriza criar novos leitores de estruturas internas. |
| Vigências | Gravadas são imutáveis conforme CLAUDE.md. Não recriar edição destrutiva com base em propostas antigas. |
| Permissão | O kit nativo tem travas por ação na interface; a plataforma acrescenta sessão e proteção da escrita. Cadastro de senha/autocadastro usa a transação restrita de conta própria do Portal. Isso não substitui as permissões de arquivo da rede. |
| Distribuição | Procedimentos antigos de copiar HTMLs separados correspondem à distribuição anterior. O produto novo é Plataforma.html; a troca só ocorre conforme CORTE.md, sem misturar versões após o aceite. |
| Arquiteturas | ARQUITETURA.md descreve a implementação atual. ARQUITETURA-v1.md descreve requisitos de evolução. Ambos são obrigatórios; a lista de conceitos do segundo não é uma ordem para duplicar módulos como Produção/OEE ou Iniciativas/Ações. |
| Identificadores | Códigos preservados como texto; normalização e escopo devem seguir os contratos atuais. Não presumir unicidade global ou alterar vínculo ordem/lote nesta rodada visual. |
| Pessoas | R-02 usa ID. Nome antigo só resolve uma pessoa quando é único no cadastro; homônimo ou nome não cadastrado fica a confirmar. Não reintroduzir comparação direta por nome. A implantação nos demais campos segue R02-B da lista única. |
| Backup | O log compartilhado antigo é somente lido. A escrita é por perfil/estação, com fallback por instância e leitura consolidada. Teste em OPFS não comprova SMB. Falha sem pasta é visível localmente; não prometer que outra estação recebeu um registro que não chegou à rede. |

A auditoria histórica e os registros de decisões são preservados. Quando um ponto for resolvido, registre decisão, escopo, data, fonte e critérios de aceite, com ligação ao documento vigente.

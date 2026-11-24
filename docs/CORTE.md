# Corte para a plataforma única

**NÃO EXECUTADO.** Preparação documental. A rodada usa apenas dados fictícios; não há autorização para testar ou gravar nas bases reais.

Antes do corte, aprovar a homologação de file:// no Chrome e Edge corporativos, SMB, perda de permissão/rede e duas estações. Comparar números com a referência atual, testar login/perfil Consulta, fila pendente e uma base mais nova em somente leitura. Registrar versão do artefato e hashes das bases da cópia usada.

Na janela de corte, siga os passos 1 a 5. O passo 6 orienta o retorno se houver divergência.

1. Responsável agenda pausa e confirma ausência de fila em todas as estações.
2. Última gravação pelas páginas atuais; fechar todas as instâncias e fazer cópia das bases e do aplicativo anterior.
3. Copiar somente `Plataforma.html` da raiz do repositório para a pasta. Preservar `00. Bases/` e `00. Backups/`. Não copiar scripts, testes ou documentação como dependências do aplicativo.
4. Abrir a plataforma, conectar a pasta, conferir totais, versões, ordens/lotes, turnos, MUV e gel com o ponto de corte. Gravar um fato de teste previamente autorizado e reler nas duas estações.
5. Com aceite do responsável, retirar os HTML antigos da pasta e guardá-los junto da cópia. Não manter versões concorrentes distribuídas.
6. Se houver divergência, parar todas as gravações. Preservar uma cópia das bases após o corte e reconciliar fatos posteriores. Restaurar aplicativo e bases do mesmo ponto; não baixar só a versão do HTML sobre bases já atualizadas.

A demonstração e o guia contextual estão dentro de `Plataforma.html`. O código antigo foi retirado da árvore ativa por pedido explícito do responsável; o ponto anterior continua recuperável no Git (ffc9ee8c9883f171e478f15e33c5e938a9cb57a0). Isso não executa o corte nem autoriza gravar em dados reais. A eventual volta exige aplicativo e bases do mesmo ponto, com reconciliação dos fatos posteriores, conforme o passo 6.

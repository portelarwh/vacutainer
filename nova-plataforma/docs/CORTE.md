# Corte para a plataforma única

**NÃO EXECUTADO.** Preparação documental. A rodada usa apenas dados fictícios; não há autorização para testar ou gravar nas bases reais.

Antes do corte, concluir os itens 1 a 8 e aprovar a homologação de file:// no Chrome e Edge corporativos, SMB, perda de permissão/rede e duas estações. Comparar números com a referência atual, testar login/perfil Consulta, fila pendente e uma base mais nova em somente leitura. Registrar versão do artefato e hashes das bases da cópia usada.

1. Responsável agenda pausa e confirma ausência de fila em todas as estações.
2. Última gravação pelas páginas atuais; fechar todas as instâncias e fazer cópia das bases e do aplicativo anterior.
3. Copiar somente `nova-plataforma/dist/Plataforma.html` para a pasta. Preservar `00. Bases/` e `00. Backups/`.
4. Abrir a plataforma, conectar a pasta, conferir totais, versões, ordens/lotes, turnos, MUV e gel com o ponto de corte. Gravar um fato de teste previamente autorizado e reler nas duas estações.
5. Com aceite do responsável, retirar os HTML antigos da pasta e guardá-los junto da cópia. Não manter versões concorrentes distribuídas.
6. Se houver divergência, parar todas as gravações. Preservar uma cópia das bases após o corte e reconciliar fatos posteriores. Restaurar aplicativo e bases do mesmo ponto; não baixar só a versão do HTML sobre bases já atualizadas.

A demonstração do produto está dentro de `Plataforma.html` (`?demo=1`). `paginas/Demonstracao.html` permanece um cenário de desenvolvimento para os testes dos motores; não será distribuído. O guia de instalação é gerado por `node fontes/guia/gerar_guia.js` a partir do modelo da plataforma.

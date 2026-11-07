"""Gera as páginas em construção (Equipamentos, Iniciativas, Projetos) a partir de fontes/modelo/pagina-em-construcao.html
e roda o fontes/kit/aplicar_kit21.py em seguida (kit v2.1, catálogo de sistemas, padrão visual e bases iguais às outras páginas).
Uso (na raiz do projeto): python fontes/modelo/gerar_paginas.py
Especificação: docs/paginas-construcao.md. Quando uma página começar de verdade (v1.0), tire-a da lista PAGINAS
e passe a editar o HTML dela direto (registrar no CLAUDE.md)."""
import os, json, subprocess, sys
RAIZ = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
MODELO = os.path.join(RAIZ, 'fontes', 'modelo', 'pagina-em-construcao.html')
DOCS_PLANO = 'docs/plano-evolucao-plataforma.md'

PAGINAS = [
 {'arquivo': 'Equipamentos.html',
  'page': {'id': 'equip', 'titulo': 'Equipamentos · Máquinas da linha e manutenção', 'tituloCurto': 'Equipamentos',
           'subtitulo': 'Máquinas da linha e manutenção', 'versao': '0.1', 'baseFile': 'equipamentos-base.json',
           'backupDir': '00. Backups/Equipamentos', 'estado': 'construcao',
           'estadoNota': 'Ficha e indicadores por máquina, relatórios das máquinas e manutenção.'},
  'plano': {
   'nota': 'Ficha e indicadores de cada máquina da linha, relatórios das máquinas, OEE próprio por máquina e a manutenção (preventiva, ordens de serviço e TPM).',
   'entrega': 'Fase 5 do plano de evolução (depois de Produção e Paradas). O OEE oficial continua sendo o da Linha, na Produção.',
   'docs': [DOCS_PLANO + ' § 6.4', 'docs/paginas-construcao.md § 5.3'],
   'contagens': [{'tipo': 'equipamentos', 'rot': 'Equipamentos cadastrados'}, {'tipo': 'componentes', 'rot': 'Componentes cadastrados'}],
   'hoje': [{'txt': 'Ficha do equipamento (fotos, documentos, componentes)', 'portal': 'cadastros/equipamentos', 'obs': 'no Portal'},
            {'txt': 'MTBF, MTTR e disponibilidade por máquina', 'pagina': 'paradas', 'hash': 'aba=equip', 'obs': 'em Paradas › Equipamentos'},
            {'txt': 'Matriz de paradas por máquina', 'portal': 'cadastros/matriz', 'obs': 'no Portal'}],
   'abas': [
    {'id': 'maquina', 'aba': 'Máquina', 'grupo': 'Operação',
     'itens': ['Ficha do cadastro: fotos, documentos, componentes e dados técnicos', 'Indicadores da máquina (OEE próprio, D, P, tempo parado)', 'Eventos de parada da máquina (do Paradas)'],
     'fonte': 'Equipamentos e componentes: cadastro do Portal. Eventos e MTBF/MTTR: Paradas (exports).'},
    {'id': 'relatorios', 'aba': 'Relatórios de máquina', 'grupo': 'Análise',
     'itens': ['Importação do relatório de cada máquina', 'Tempo em cada estado: Produzindo · Parada · Ociosa · Bloqueada', 'OEE próprio por máquina (sem Ociosa e Bloqueada) e gargalo do dia'],
     'fonte': 'Relatórios exportados de cada máquina (amostras ainda pendentes).'},
    {'id': 'intervalos', 'aba': 'Intervalos anormais', 'grupo': 'Análise',
     'itens': ['Intervalos sem produção encontrados nos relatórios', 'Sugestão de parada para o Paradas validar'],
     'fonte': 'Relatórios de máquina; as sugestões vão para o Paradas.'},
    {'id': 'comparativo', 'aba': 'Comparativo', 'grupo': 'Análise',
     'itens': ['Máquinas lado a lado', 'Tendência por mês', 'Semáforo pela meta do cadastro']},
    {'id': 'preventiva', 'aba': 'Plano preventivo', 'grupo': 'Manutenção',
     'itens': ['Plano preventivo e preditivo por máquina e componente', 'Próximas intervenções e atrasadas']},
    {'id': 'os', 'aba': 'Ordens de serviço', 'grupo': 'Manutenção',
     'itens': ['Ordens de serviço abertas e fechadas', 'Ligação com os eventos de quebra do Paradas']},
    {'id': 'tpm', 'aba': 'TPM', 'grupo': 'Manutenção',
     'itens': ['Pilares do TPM e etiquetas', 'Priorização pelas falhas recorrentes do Paradas']}]}},
 {'arquivo': 'Iniciativas.html',
  'page': {'id': 'inic', 'titulo': 'Iniciativas · 5S · OSM · KAS', 'tituloCurto': 'Iniciativas', 'subtitulo': '5S · OSM · KAS',
           'versao': '0.1', 'baseFile': 'iniciativas-base.json', 'backupDir': '00. Backups/Iniciativas', 'estado': 'construcao',
           'estadoNota': 'Observações de segurança, auditorias 5S e kaizens numa página só.'},
  'plano': {
   'nota': 'Observações de segurança (OSM), auditorias 5S e kaizens (KAS) numa página só, com metas, ações estilo planner e relatórios.',
   'entrega': 'OSM é a próxima aba a ser construída (fase 6 do plano); 5S e KAS vêm depois (fase 7).',
   'docs': ['docs/osm-arquitetura.md', DOCS_PLANO + ' § 6.5–6.6', 'docs/paginas-construcao.md § 5.4'],
   'contagens': [{'tipo': 'metasOsm', 'rot': 'Metas de OSM cadastradas'}],
   'hoje': [{'txt': 'Metas de OSM', 'portal': 'cadastros/metasOsm', 'obs': 'no Portal'},
            {'txt': 'Metas da área', 'portal': 'cadastros/metasArea', 'obs': 'no Portal'}],
   'grupoGeral': '',
   'abas': [
    {'id': 'osm', 'aba': 'OSM', 'grupo': '', 'status': 'próxima a ser construída',
     'itens': ['Observações de segurança com meta por operador por mês', 'Ações tratadas no estilo planner (quadro, prazos, cobrança)', 'Participação por operador e por turno; temas e recorrência'],
     'fonte': 'Pessoas e metas: cadastro do Portal (usuários, Metas de OSM). Observações e ações: base da página (iniciativas-base.json › osm).',
     'subabas': [
      {'id': 'nova', 'nome': 'Nova OSM', 'itens': ['Formulário curto para tablet/celular: observador, turno, tema, tipo, local, descrição, risco', '"Precisa de ação?" e "Registrar outra"']},
      {'id': 'observacoes', 'nome': 'Observações', 'itens': ['Lista com busca e filtros (mês, turno, tema, tipo, risco, situação)', 'Ficha da OSM com ações e histórico']},
      {'id': 'planner', 'nome': 'Ações (Planner)', 'itens': ['Quadro: A fazer · Em andamento · Aguardando · Concluída', 'Lista, Calendário e Por responsável', '"Minhas ações"']},
      {'id': 'meta', 'nome': 'Meta por operador', 'itens': ['Matriz operador × mês com semáforo', 'Quanto falta no mês e total por turno']},
      {'id': 'painel', 'nome': 'Painel', 'itens': ['OSM × meta da equipe, % de operadores na meta', 'Ações abertas e vencidas, Pareto de temas e locais']},
      {'id': 'temas', 'nome': 'Temas e recorrência', 'itens': ['Mesmo tema + local 3 vezes ou mais em 30 dias']},
      {'id': 'cobranca', 'nome': 'Cobrança', 'itens': ['Ações vencidas, sem responsável, paradas', 'Texto pronto para Teams/WhatsApp']},
      {'id': 'relatorios', 'nome': 'Relatórios', 'itens': ['Mensal para a diretoria, por pessoa e por turno']},
      {'id': 'importar', 'nome': 'Importar', 'itens': ['Planilha atual de OSM (histórico)', 'Excel de respostas do Forms']},
      {'id': 'config', 'nome': 'Configuração', 'itens': ['Temas, tipos, locais, riscos e prazos', 'Regras da cobrança']}]},
    {'id': 's5', 'aba': '5S', 'grupo': '', 'status': 'a desenhar',
     'itens': ['Auditorias 5S por área, com nota por senso', 'Plano de ação das não conformidades', 'Evolução das notas'],
     'subabas': [{'id': 'auditorias', 'nome': 'Auditorias', 'itens': ['Auditoria por área e data, nota por senso']},
                 {'id': 'acoes', 'nome': 'Plano de ação', 'itens': ['Ações das não conformidades (mesmo quadro da OSM)']},
                 {'id': 'painel', 'nome': 'Painel', 'itens': ['Notas por área e evolução']}]},
    {'id': 'kas', 'aba': 'KAS', 'grupo': '', 'status': 'a desenhar',
     'itens': ['Ideias e kaizens do dia a dia', 'Situação de cada ideia e ganhos', 'Campos do documento consolidado (§ 13) como ponto de partida'],
     'subabas': [{'id': 'ideias', 'nome': 'Ideias', 'itens': ['Registro e avaliação das ideias']},
                 {'id': 'quadro', 'nome': 'Quadro', 'itens': ['Ideias por situação']},
                 {'id': 'painel', 'nome': 'Painel', 'itens': ['Ideias por área, ganhos, implantadas no mês']}]}]}},
 {'arquivo': 'Projetos.html',
  'page': {'id': 'projetos', 'titulo': 'Projetos · Projetos de melhoria e investimentos', 'tituloCurto': 'Projetos',
           'subtitulo': 'Projetos de melhoria e investimentos', 'versao': '0.1', 'baseFile': 'projetos-base.json',
           'backupDir': '00. Backups/Projetos', 'estado': 'construcao',
           'estadoNota': 'Escopo a desenhar: projetos de melhoria, projetos grandes e compra de máquina.'},
  'plano': {
   'nota': 'Projetos de melhoria, projetos grandes e compra de máquina. Escopo ainda não definido: esta lista de abas é provisória.',
   'entrega': 'Depois das outras fases do plano de evolução; o escopo será desenhado antes.',
   'docs': [DOCS_PLANO, 'docs/paginas-construcao.md § 5.5'],
   'hoje': [{'txt': 'Ações de perdas', 'pagina': 'perdas', 'hash': 'aba=acoes', 'obs': 'no Waste'},
            {'txt': 'Ações de paradas', 'pagina': 'paradas', 'hash': 'aba=acoes', 'obs': 'em Paradas'}],
   'abas': [
    {'id': 'lista', 'aba': 'Projetos', 'grupo': 'Operação', 'itens': ['Lista e ficha do projeto: tipo, dono, ganho esperado, prazo', 'Situação de cada projeto']},
    {'id': 'cronograma', 'aba': 'Cronograma', 'grupo': 'Gestão', 'itens': ['Marcos e prazos', 'Atrasos']},
    {'id': 'acoes', 'aba': 'Ações', 'grupo': 'Gestão', 'itens': ['Ações dos projetos', 'Ligação com Waste, Paradas e Produção']},
    {'id': 'relatorios', 'aba': 'Relatórios', 'grupo': 'Gestão', 'itens': ['Resumo para a diretoria']}]}}]

def js(o): return json.dumps(o, ensure_ascii=False, separators=(',', ':'))
# PAGE como objeto JS (chaves sem aspas), para o Portal › Versões achar versao:'…' e estado:'…' no texto do HTML
def jsobj(o): return '{' + ','.join(k + ':' + json.dumps(v, ensure_ascii=False) for k, v in o.items()) + '}'

def gerar():
    m = open(MODELO, encoding='utf-8').read()
    for p in PAGINAS:
        pg = p['page']; s = m
        cab = pg['titulo'].upper()
        for k, v in [('@@TITULO@@', pg['tituloCurto']), ('@@CAB@@', cab), ('@@PAGE@@', jsobj(pg)),
                     ('@@PLANO@@', js(p['plano']).replace('</', '<\\/'))]:
            if k not in s: raise SystemExit('ERRO: ' + k + ' não achado no modelo')
            s = s.replace(k, v)
        open(os.path.join(RAIZ, 'paginas', p['arquivo']), 'w', encoding='utf-8', newline='\n').write(s); print('gerada', p['arquivo'])
    r = subprocess.run([sys.executable, os.path.join(RAIZ, 'fontes', 'kit', 'aplicar_kit21.py')])
    if r.returncode: raise SystemExit('ERRO no aplicar_kit21.py')

if __name__ == '__main__':
    gerar()

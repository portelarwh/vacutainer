"""Monta paginas/Linha-360.html (Linha 360°: planta interativa da linha).
Uso (na raiz do projeto): python fontes/linha360/build.py   (roda o fontes/kit/aplicar_kit21.py em seguida)
Partes: a moldura comum (CSS base, cabeçalho v2 e seu JS) vem de paginas/Equipamentos.html, que é igual em todas as páginas;
a página em si está em linha.css, nucleo.js (gravação, igual a Equipamentos/Iniciativas), linha.js, guia.js e planta.webp
(página 2 do LINHA.pdf). NÃO editar o HTML gerado."""
import os, re, base64, subprocess, sys
RAIZ = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
AQUI = os.path.dirname(os.path.abspath(__file__))
VERSAO = '1.1.0'
ler = lambda *p: open(os.path.join(*p), encoding='utf-8').read()
def corta(s, a, b, depois=0):
    i = s.find(a, depois); j = s.find(b, i + len(a)) if i >= 0 else -1
    if i < 0 or j < 0: raise SystemExit('ERRO: marcador não achado na moldura: ' + repr(a[:40]) + ' … ' + repr(b[:40]))
    return i, j
m = ler(RAIZ, 'paginas', 'Equipamentos.html')
# 1 · CSS da página
i, j = corta(m, '/* ===== Equipamentos (página) ===== */', '</style>')
m = m[:i] + ler(AQUI, 'linha.css') + m[j:]
# 2 · PAGE
i, j = corta(m, 'const PAGE={', '};\n')
page = ('const PAGE={id:"linha",titulo:"Linha 360° · Planta interativa da linha",tituloCurto:"Linha 360°",subtitulo:"Planta interativa: paradas, pessoas e ações em cada ponto da linha",'
        'versao:"' + VERSAO + '",baseFile:"linha360-base.json",backupDir:"00. Backups/Linha360",estado:"atualizacao",estadoNota:"Primeira versão: planta, pontos, áreas, postos e checklists. MES por equipamento chega depois."')
m = m[:i] + page + m[j:]
# 3 · script da página (do comentário de abertura até o fim do script) e guia
i = m.find('<script>\n/* =====================================================================================\n   Equipamentos ·')
j = m.find('</body>')
if i < 0 or j < 0: raise SystemExit('ERRO: script da página não achado na moldura')
img = 'data:image/webp;base64,' + base64.b64encode(open(os.path.join(AQUI, 'planta.webp'), 'rb').read()).decode()
js = ("<script>\nconst PLANTA='" + img + "';\n" + ler(AQUI, 'nucleo.js') + '\n' + ler(AQUI, 'linha.js') + '\n</script>\n<script>\n' + ler(AQUI, 'guia.js') + '</script>\n')
m = m[:i] + js + m[j:]
# 4 · textos da moldura
m = re.sub(r'<title>.*?</title>', '<title>Linha 360° · Linha Vacutainer</title>', m, count=1, flags=re.S)
m = m.replace('<h1 id="vacTitulo">Equipamentos</h1>', '<h1 id="vacTitulo">Linha 360°</h1>')
if 'Equipamentos (página)' in m or 'function formOS' in m or 'window.VAC_GUIA.equip' in m: raise SystemExit('ERRO: sobrou trecho da página Equipamentos')
open(os.path.join(RAIZ, 'paginas', 'Linha-360.html'), 'w', encoding='utf-8', newline='\n').write(m)
print('gerada Linha-360.html', VERSAO, len(m), 'bytes')
if '--sem-kit' not in sys.argv:
    r = subprocess.run([sys.executable, os.path.join(RAIZ, 'fontes', 'kit', 'aplicar_kit21.py')])
    if r.returncode: raise SystemExit('ERRO no aplicar_kit21.py')

from pathlib import Path
import os,subprocess,json,datetime
OUT=Path(__file__).resolve().parent
ROOT=Path(os.environ.get('VAC_AUDIT_ROOT','/workspace/verificacao-main-81ea71b'))
env=os.environ.copy()
env['NODE_OPTIONS']=' '.join(filter(None,[env.get('NODE_OPTIONS',''),'--require '+str(OUT/'adaptador-browser.cjs'),'--require '+str(OUT/'rastrear-suites.cjs')]))
env['GIT_DIR']=os.environ.get('VAC_AUDIT_GIT_DIR','/workspace/vacutainer/.git')
env['GIT_WORK_TREE']=str(ROOT)
with (OUT/'tudo.log').open('w') as log:
 p=subprocess.Popen(['node',str(ROOT/'testes/tudo.js')],cwd=ROOT,env=env,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True)
 for line in p.stdout:
  log.write(line);log.flush();print(line,end='',flush=True)
 rc=p.wait()
(OUT/'execucao-suites.json').write_text(json.dumps({'commit':'81ea71bb82cc62f08360684c7ce1a5df54697202','concluida_em_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'comando':'node testes/tudo.js','adaptacao':'preload externo Chromium/HTTP e captura de saídas','exit_code':rc},ensure_ascii=False,indent=2))
raise SystemExit(rc)

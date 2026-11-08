from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
import subprocess, os, time, json, re, signal

ROOT=Path('/workspace/verificacao-main-8cad6a6')
OUT=Path(__file__).resolve().parent
SUITES=['tordens','tvigencias','tnumeros','tcontratos','tficha','tplanner','tfila','tequip','tpg','tintegra','tdiag','tseguranca','tbases','trelatorios','tconstrucao','tvisual']
env=os.environ.copy()
env['GIT_DIR']='/workspace/vacutainer/.git'
env['GIT_WORK_TREE']=str(ROOT)

def run(name):
    start=time.monotonic()
    log=OUT/(name+'.log')
    with log.open('w') as out:
        p=subprocess.Popen(['node','--require',str(OUT/'adaptador-browser.cjs'),str(ROOT/'testes'/(name+'.js'))],cwd=ROOT,env=env,stdout=out,stderr=subprocess.STDOUT,start_new_session=True)
        timed=False
        try: rc=p.wait(timeout=420 if name=='trelatorios' else 240)
        except subprocess.TimeoutExpired:
            timed=True
            os.killpg(p.pid,signal.SIGKILL)
            rc=p.wait()
    text=log.read_text(errors='replace')
    return {'suite':name,'exit_code':rc,'timeout':timed,'segundos':round(time.monotonic()-start,1),'checagens_ok':len(re.findall(r'^ok\s',text,re.M)),'falhas_linhas':[s for s in text.splitlines() if re.search(r'FALHA|Error:|falha\(s\)|FALHA\(S\)',s)],'sem_erros':'sem erros' in text,'log':log.name}

results=[]
with ThreadPoolExecutor(max_workers=2) as pool:
    for future in as_completed({pool.submit(run,n):n for n in SUITES}):
        result=future.result();results.append(result)
        (OUT/'suites.json').write_text(json.dumps(sorted(results,key=lambda x:SUITES.index(x['suite'])),ensure_ascii=False,indent=2))
        print(json.dumps(result,ensure_ascii=False),flush=True)

print('SUITES CONCLUÍDAS',flush=True)

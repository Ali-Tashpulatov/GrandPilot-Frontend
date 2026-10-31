import sys
sys.path.insert(0, '/Users/ali/Downloads/hack-ce32ffa1-lsj-main')
from fastapi.testclient import TestClient
from src.api import app
from src.verdict_engine import _detect_response_lang
c=TestClient(app)
refs=set(c.get('/rules/refs').json()['refs'])
required={'ticket_id','category','priority','rule_refs','verdict','punishment_suggestion','draft','needs_human','confidence','processing_time_ms'}
for lang in ['kk','ru','uz','en']:
 assert _detect_response_lang({'lang':lang,'server_lang':'en'}, 'haqorat көмектесіңіз')==lang
 for kind,text in [('report','My account was hacked, please help'),('complaint','Player used racial slurs https://youtu.be/test')]:
  r=c.post('/triage',json={'ticket_id':'submission-'+lang,'kind':kind,'lang':lang,'images_count':1,'rule_refs_raw':'99.99','messages':[{'role':'player','text':text}]})
  assert r.status_code==200,r.text
  d=r.json();assert required<=d.keys();assert set(d['rule_refs'])<=refs;assert d['needs_human'];assert d['punishment_suggestion'] is None;assert d['draft'];assert d['priority'] in ['p0','p1','p2','p3']
  if kind=='report':assert d['category']=='report.account' and d['priority']=='p0'
  else:assert d['verdict']=='escalated'
for payload in [{},{'lang':'xx','messages':[{'role':'player','text':'test'}]},{'images_count':-1,'messages':[{'role':'player','text':'test'}]}]:
 assert c.post('/triage',json=payload).status_code==422
assert c.options('/triage',headers={'Origin':'https://grandpilot.example','Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'content-type'}).status_code==200
print('PASS: 8 HTTP triage cases, four language overrides, whitelist, escalation, account priority, response schema, validation, CORS')

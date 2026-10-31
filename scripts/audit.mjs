import { build } from 'esbuild';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
async function bundle(entry) {
 const r = await build({entryPoints:[entry],bundle:true,write:false,platform:'node',format:'esm',define:{'import.meta.env.VITE_API_BASE_URL':'"https://test.invalid"'}});
 return import('data:text/javascript;base64,'+Buffer.from(r.outputFiles[0].text).toString('base64'));
}
const {translations}=await bundle('src/i18n/translations.ts');
for(const lang of ['en','ru','kk','uz']) {
 for(const key of Object.keys(translations.en)) {
  assert.ok(translations[lang][key],`${lang}: missing ${key}`);
  assert.deepEqual([...translations[lang][key].matchAll(/\{\d+\}/g)].map(x=>x[0]).sort(),[...translations.en[key].matchAll(/\{\d+\}/g)].map(x=>x[0]).sort(),`${lang}: placeholders ${key}`);
 }
}
globalThis.localStorage={getItem:()=>null};
const {api}=await bundle('src/services/api.ts');
for(const lang of ['en','ru','kk','uz']) {
 let payload;
 globalThis.fetch=async (url,options)=>{payload=JSON.parse(options.body);assert.equal(url,'https://test.invalid/triage');return new Response(JSON.stringify({draft:'Original draft — түпнұсқа',rule_refs:[]}));};
 const result=await api.triage({complaint:'Original complaint — asl matn',lang,kind:'report',player_id:'reporter-id'});
 assert.equal(payload.lang,lang);assert.equal(payload.server_lang,lang);assert.equal(payload.kind,'report');assert.equal(payload.messages[0].text,'Original complaint — asl matn');assert.equal(payload.reported_nick,undefined);assert.equal(result.draft,'Original draft — түпнұсқа');
}
globalThis.fetch=async()=>new Response(JSON.stringify({refs:['2.1','5.3']}));
const rules=await api.getRules();assert.deepEqual(rules.map(r=>r.id),['2.1','5.3']);assert.ok(rules.every(r=>!r.category&&!r.severity));
globalThis.fetch=async()=>new Response(JSON.stringify({detail:'Backend validation detail'}),{status:422});
await assert.rejects(()=>api.triage({complaint:'test'}),/Backend validation detail/);
console.log('PASS: four-language key/placeholder parity, four-language request preservation, report type, original drafts, rule IDs, API errors.');

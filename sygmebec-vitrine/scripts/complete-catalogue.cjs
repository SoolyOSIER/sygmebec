const fs=require('fs');
const read=(file)=>fs.readFileSync(file,'utf8').replace(/^\uFEFF/,'');
const messages=JSON.parse(read('src/locales/messages.json'));
const raw=read('src/content/churchText.txt').replace(/\r/g,'');
for(const [prefix,ht,en] of JSON.parse(read('scripts/church-translations.json'))) {
 const start=raw.indexOf(prefix); if(start<0)throw Error(prefix);
 const source=raw.slice(start).split(/\n\s*\n/)[0].replace(/\n+/g,' ').trim();
 const references=source.match(/\([^()]*\)\.?$/)?.[0];
 messages[source]={ht:ht+(references?' '+references:''), en:en+(references?' '+references:'')};
}
fs.writeFileSync('src/locales/messages.json',JSON.stringify(messages,null,2)+'\n');
const normalize=s=>s.replace(/\s+/g,' ').replace(/[’‘]/g,"'").trim();
const keys=new Set(Object.keys(messages).map(normalize));
const missing=JSON.parse(read('scripts/language-sources.json')).filter(s=>{
 const n=normalize(s);
 return n && !keys.has(n) && !keys.has(n.replace(/\s*[*:]$/,'')) && !keys.has(n.split(' - ')[0]);
});
fs.writeFileSync('scripts/language-missing.json',JSON.stringify(missing,null,2));
console.log(Object.keys(messages).length,'translations; unmatched strings:');console.log(missing.join('\n'));


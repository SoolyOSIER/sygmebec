const fs = require('node:fs'), path = require('node:path'), http = require('node:http'), os = require('node:os');
const { spawn } = require('node:child_process');
const assert = require('node:assert/strict');
const root=path.resolve(__dirname,'..'), dist=path.join(root,'dist');
const event={id:1,titre:'Rencontre communautaire',lieu:'Cap-Haïtien',date:'2026-09-20T10:00:00',description:'Une rencontre ouverte à tous.',places_restantes:1,type_evenement:{nom:'Rencontre'}};
let eventMode='success';
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname.includes('/api/')) {
  let data=[],status=200;
  if(url.pathname.includes('/auth/')){data={detail:'Unauthorized'};status=401}
  else if(url.pathname.includes('verset-du-jour'))data={};
  else if(url.pathname.includes('/evenements/1/'))data=event;
  else if(url.pathname.includes('/evenements/')){data=eventMode==='empty'?[]:[event];if(eventMode==='error')status=503;}
  res.writeHead(status,{'Content-Type':'application/json'});return res.end(JSON.stringify(data));
 }
 const requested=path.resolve(dist,'.'+decodeURIComponent(url.pathname));
 const file=requested.startsWith(dist+path.sep)&&fs.existsSync(requested)&&fs.statSync(requested).isFile()?requested:path.join(dist,'index.html');
 const types={'.js':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png'};
 res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);
});
const delay=ms=>new Promise(r=>setTimeout(r,ms));
let browser,ws,id=0;const pending=new Map(),exceptions=[];
async function call(method,params={}){const request=++id;return new Promise((resolve,reject)=>{pending.set(request,{resolve,reject});ws.send(JSON.stringify({id:request,method,params}))})}
async function evaluate(expression){const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;}
async function waitFor(expression,timeout=12000){const end=Date.now()+timeout;while(Date.now()<end){if(await evaluate(expression))return;await delay(120)}throw Error('Timed out: '+expression)}
async function go(route){await call('Page.navigate',{url:base+route});await waitFor("!!document.querySelector('.language-select select')");await delay(250)}
async function language(code){await evaluate("(()=>{const s=document.querySelector('.language-select select');s.value="+JSON.stringify(code)+";s.dispatchEvent(new Event('change',{bubbles:true}));})()");await waitFor("document.documentElement.lang.startsWith("+JSON.stringify(code)+")");await delay(100)}
async function clickText(text){await evaluate("(()=>{const e=[...document.querySelectorAll('button,a')].find(x=>x.textContent.trim()==="+JSON.stringify(text)+");if(!e)throw Error('Missing control');e.click();})()");await delay(200)}
const base='http://127.0.0.1:4178';
(async()=>{
 await new Promise(resolve=>server.listen(4178,'127.0.0.1',resolve));
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),'sygmebec-language-'));
 const executable=process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe';
 browser=spawn(executable,['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking','--remote-debugging-port=9338','--user-data-dir='+profile,'about:blank'],{windowsHide:true,stdio:'ignore'});
 browser.on('error',e=>{console.error(e);process.exitCode=1});
 let targets;
 for(let i=0;i<100;i++){try{targets=await(await fetch('http://127.0.0.1:9338/json/list')).json();if(targets.length)break}catch{}await delay(150)}
 if(!targets?.length)throw Error('Headless Chrome did not start');
 ws=new WebSocket(targets[0].webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
 ws.addEventListener('message',({data})=>{const m=JSON.parse(data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);if(m.error)p?.reject(Error(m.error.message));else p?.resolve(m.result)}else if(m.method==='Runtime.exceptionThrown')exceptions.push(m.params.exceptionDetails.text+' '+(m.params.exceptionDetails.exception?.description||''))});
 await call('Runtime.enable');await call('Page.enable');await call('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 await go('/');await language('en');
 assert.match(await evaluate("document.querySelector('h1').textContent"),/Discover.*true hope.*Jesus Christ/);
 assert.match(await evaluate('document.title'),/Home/);
 assert.equal(await evaluate("getComputedStyle(document.querySelector('.ebec-button-gold')).backgroundColor"),'rgb(0, 0, 255)');
 await language('ht');assert.match(await evaluate("document.querySelector('h1').textContent"),/Dekouvri/);
 await go('/a-propos');assert.match(await evaluate("document.querySelector('h1').textContent"),/Istwa/);
 await evaluate("document.querySelectorAll('details').forEach(e=>e.open=true)");
 const doctrine=await evaluate("document.querySelector('.about-faith-content').textContent");assert.match(doctrine,/Nou kwè tout Bib la/);assert.doesNotMatch(doctrine,/Nous croyons/);
 assert.equal(await evaluate("document.querySelectorAll('details').length"),13);
 await language('en');assert.match(await evaluate("document.querySelector('.about-faith-content').textContent"),/We believe/);
 await go('/contact');
 await evaluate("(()=>{const i=document.querySelector('input[name=nom]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(i,'Jean');i.dispatchEvent(new Event('input',{bubbles:true}));})()");
 await language('ht');assert.equal(await evaluate("document.querySelector('input[name=nom]').value"),'Jean');
 await evaluate("document.querySelector('form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))");
 await waitFor("document.body.innerText.includes('Prenon an obligatwa')");
 await language('en');assert.match(await evaluate("document.body.innerText"),/First name is required/);
 await go('/adhesion');assert.match(await evaluate("document.body.innerText"),/Spiritual journey/);
 await evaluate("document.querySelector('form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))");
 await waitFor("document.body.innerText.includes('Last name is required')");
 await language('ht');assert.match(await evaluate("document.body.innerText"),/Siyati a obligatwa/);
 await go('/evenements');await language('en');await waitFor("document.body.innerText.includes('1 published event')");
 assert.match(await evaluate("document.body.innerText"),/September/);assert.match(await evaluate("document.body.innerText"),/1 place remaining/);
 await language('ht');assert.match(await evaluate("document.body.innerText"),/septanm/);assert.doesNotMatch(await evaluate("document.body.innerText"),/publié/);
 await go('/evenements/1');assert.match(await evaluate("document.body.innerText"),/septanm/);
 eventMode='empty';await go('/evenements');await waitFor("document.body.innerText.includes('Pa gen evènman')");
 eventMode='error';await go('/evenements');await waitFor("document.body.innerText.includes('Nou pa kapab chaje')");
 await go('/galerie');await waitFor("document.body.innerText.includes('Pa gen foto pibliye')");
 for(const route of ['/mentions-legales','/confidentialite','/espace-membre/connexion','/missing-page']){await go(route);await language('en');assert.doesNotMatch(await evaluate("document.querySelector('h1').textContent"),/Mentions|Politique|Connexion|trouvée/)}
 await go('/contact');await language('ht');await call('Page.reload');await waitFor("document.documentElement.lang==='ht-HT'");assert.equal(await evaluate("document.querySelector('.language-select select').value"),'ht');
 await evaluate("window.dispatchEvent(new StorageEvent('storage',{key:'sygmebec-language',newValue:'en'}))");await waitFor("document.documentElement.lang==='en-US'");
 await evaluate("window.dispatchEvent(new StorageEvent('storage',{key:'sygmebec-language',newValue:'invalid'}))");await waitFor("document.documentElement.lang==='fr-HT'");
 await language('en');
 await call('Emulation.setDeviceMetricsOverride',{width:375,height:812,deviceScaleFactor:1,mobile:true});
 await go('/');
 assert.ok(await evaluate("document.documentElement.scrollWidth<=window.innerWidth"),'Mobile page must not overflow');
 await evaluate("document.querySelector('.theme-toggle').click()");await waitFor("document.documentElement.dataset.theme==='dark'");
 assert.equal(await evaluate("getComputedStyle(document.querySelector('.ebec-home')).backgroundColor"),'rgb(15, 23, 42)');
 const artifacts=path.join(root,'artifacts');fs.mkdirSync(artifacts,{recursive:true});
 for(const [name,route] of [['home-en-mobile-dark','/'],['contact-en-mobile-dark','/contact']]){await go(route);await delay(600);const shot=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(artifacts,name+'.png'),Buffer.from(shot.data,'base64'));}
 assert.deepEqual(exceptions,[],'No uncaught browser exceptions');
 console.log('PASS: 3 languages, persistence, cross-tab sync, forms, validation, 13 faith sections, event dates/counts, empty/error states, SEO, mobile layout, login palette and dark mode.');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{try{if(ws?.readyState===1)await call('Browser.close')}catch{}browser?.kill();ws?.close();server.close();setTimeout(()=>process.exit(process.exitCode||0),200).unref()});


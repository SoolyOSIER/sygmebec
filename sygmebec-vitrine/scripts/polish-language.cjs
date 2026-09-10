const fs=require('fs'), path=require('path');
const parser=require('@babel/parser'), traverse=require('@babel/traverse').default;
for(const rel of JSON.parse(fs.readFileSync('scripts/language-files.json','utf8'))) {
 if(!rel.endsWith('.jsx'))continue;
 const file=path.join('src',rel);let s=fs.readFileSync(file,'utf8');
 const ast=parser.parse(s,{sourceType:'module',plugins:['jsx']});const edits=[];
 traverse(ast,{CallExpression(p){if(p.node.callee.name!=='t'||p.node.arguments.length!==1)return;const arg=p.node.arguments[0];
 const hasJSX=n=>n&&(n.type==='JSXElement'||n.type==='JSXFragment'||n.type==='ConditionalExpression'&&(hasJSX(n.consequent)||hasJSX(n.alternate))||n.type==='LogicalExpression'&&hasJSX(n.right));
 if(hasJSX(arg)||arg.type==='CallExpression'&&arg.callee.type==='MemberExpression'&&arg.callee.property.name==='map'||arg.type==='NumericLiteral') {
 edits.push([p.node.start,arg.start,''],[arg.end,p.node.end,'']);
 } }});
 for(const [a,b,v] of edits.sort((a,b)=>b[0]-a[0]))s=s.slice(0,a)+v+s.slice(b);
 fs.writeFileSync(file,s);
}
const edit=(file,fn)=>fs.writeFileSync('src/'+file,fn(fs.readFileSync('src/'+file,'utf8')));
edit('pages/Adhesion.jsx',s=>s.replace('useState(() => formatRegistrationDate())','useState(() => new Date())').replace('setRegistrationDate(formatRegistrationDate())','setRegistrationDate(new Date())').replace('value={registrationDate}','value={formatRegistrationDate(registrationDate)}'));
edit('pages/espace-membre/MesInscriptions.jsx',s=>s.replace("t(inscription.evenement?.date_ev || 'Date à venir')","inscription.evenement?.date_ev ? localizedDate(inscription.evenement.date_ev) : t('Date à venir')"));
edit('theme/ThemeProvider.jsx',s=>s.replace("const resolveTheme =", "const readTheme = () => { try { return normaliseTheme(localStorage.getItem(themeKey)) } catch { return 'system' } }\n\nconst resolveTheme =").replaceAll('normaliseTheme(localStorage.getItem(themeKey))','readTheme()').replace("try { return readTheme() }","try { return normaliseTheme(localStorage.getItem(themeKey)) }").replace("    document.documentElement.classList.toggle('dark', resolved === 'dark')\n    document.documentElement.dataset.theme = resolved\n    localStorage.setItem(themeKey, themePreference)","    try { localStorage.setItem(themeKey, themePreference) } catch { /* Keep theme usable when storage is blocked. */ }").replace("  const setTheme =", "  useEffect(() => {\n    document.documentElement.classList.toggle('dark', theme === 'dark')\n    document.documentElement.dataset.theme = theme\n  }, [theme])\n\n  const setTheme ="));


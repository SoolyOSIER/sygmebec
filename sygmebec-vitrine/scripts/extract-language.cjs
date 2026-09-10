const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const root = path.resolve(__dirname, '../src');
const seen = new Set();
function visit(file) {
  if (seen.has(file) || !/\.[jt]sx?$/.test(file)) return;
  seen.add(file);
  const code = fs.readFileSync(file, 'utf8');
  const ast = parser.parse(code, {sourceType:'module',plugins:['jsx']});
  traverse(ast, { ImportDeclaration(p) {
    const source=p.node.source.value;
    if (!source.startsWith('.')) return;
    const base=path.resolve(path.dirname(file), source);
    const next=[base,base+'.jsx',base+'.js'].find(f=>fs.existsSync(f)&&fs.statSync(f).isFile());
    if(next) visit(next);
  }});
}
visit(path.join(root,'App.jsx'));
const strings = new Set();
for(const file of seen) {
  if(file.endsWith('i18n.js')) continue;
  const ast=parser.parse(fs.readFileSync(file,'utf8'),{sourceType:'module',plugins:['jsx']});
  traverse(ast, {
    JSXText(p) {const s=p.node.value.replace(/\s+/g,' ').trim();if(/[a-zA-ZÀ-ÿ]/.test(s))strings.add(s);},
    StringLiteral(p) {const s=p.node.value; if((/[À-ÿ]/.test(s)||/^[A-Z][a-z]/.test(s)||s.includes(' '))&&!/[{}#]|^\.|^\/|^http|^from-|^bg-|^text-|^flex|^grid|^w-|^h-|^p-|^m-|^border|^relative|^absolute|^inline|^block|^hidden|^min-|^max-/.test(s)&&!s.includes('className')&&!p.parentPath.isImportDeclaration()&&!(p.parentPath.isJSXAttribute()&&['className','d','style'].includes(p.parent.name.name)))strings.add(s.replace(/\s+/g,' ').trim());}
  });
}
fs.writeFileSync(path.resolve(__dirname,'language-files.json'),JSON.stringify([...seen].map(f=>path.relative(root,f)),null,2));
fs.writeFileSync(path.resolve(__dirname,'language-sources.json'),JSON.stringify([...strings],null,2));
console.log(seen.size, 'files;',strings.size,'strings');

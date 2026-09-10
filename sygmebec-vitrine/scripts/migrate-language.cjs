const fs = require('fs'), path = require('path');
const parser = require('@babel/parser'), traverse = require('@babel/traverse').default;
const root = path.resolve(__dirname, '../src');
for (const relative of require('./language-files.json')) {
  if (!relative.endsWith('.jsx') || /LanguageSelect|ThemeProvider|App.jsx|PublicPages/.test(relative)) continue;
  const file=path.join(root,relative), code=fs.readFileSync(file,'utf8');
  if (code.includes('useTranslation')) continue;
  const ast=parser.parse(code,{sourceType:'module',plugins:['jsx']});
  const edits=[]; const add=(start,end,text)=>edits.push({start,end,text});
  const wrap=(node)=>{add(node.start,node.start,'t(');add(node.end,node.end,')')};
  traverse(ast, {
    JSXText(p) {
      const lines=p.node.value.split(/\r\n|\n|\r/); let value='';
      lines.forEach((line,i)=>{let s=line.replace(/\t/g,' ');if(i!==0)s=s.replace(/^ +/,'');if(i!==lines.length-1)s=s.replace(/ +$/,'');if(s){value+=s;if(i!==lines.length-1)value+=' '}});
      if(/[a-zA-ZÀ-ÿ]/.test(value))add(p.node.start,p.node.end,'{t('+JSON.stringify(value)+')}');
    },
    JSXExpressionContainer(p) {
      if (!p.parentPath.isJSXElement() && !p.parentPath.isJSXFragment()) return;
      const n=p.node.expression;
      if (['JSXEmptyExpression','JSXElement','JSXFragment','ArrowFunctionExpression'].includes(n.type))return;
      wrap(n);
    },
    JSXAttribute(p) {
      if(!['title','description','placeholder','aria-label','alt','label'].includes(p.node.name.name))return;
      const n=p.node.value;if(!n)return;
      if(n.type==='StringLiteral')add(n.start,n.end,'{t('+JSON.stringify(n.value)+')}');
      else if(n.type==='JSXExpressionContainer')wrap(n.expression);
    },
    Function(p) {
      const name=p.node.id?.name || (p.parentPath.isVariableDeclarator()?p.parent.id.name:'');
      if(!/^[A-Z]/.test(name))return;
      const body=p.node.body;
      if(body.type==='BlockStatement')add(body.start+1,body.start+1,'\n  useTranslation()\n');
      else {add(body.start,body.start,'{ useTranslation(); return (');add(body.end,body.end,') }')}
    },
  });
  if(!edits.length)continue;
  let output=code; for(const e of edits.sort((a,b)=>b.start-a.start||b.end-a.end))output=output.slice(0,e.start)+e.text+output.slice(e.end);
  let modulePath=path.relative(path.dirname(file),path.join(root,'i18n')).replaceAll('\\','/');if(!modulePath.startsWith('.'))modulePath='./'+modulePath;
  output="import { t, useTranslation } from '"+modulePath+"'\n"+output;
  parser.parse(output,{sourceType:'module',plugins:['jsx']});fs.writeFileSync(file,output);
}


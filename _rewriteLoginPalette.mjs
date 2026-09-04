import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

// Mechanical migration of legacy brand values to the LoginPage blue scale.
// Semantic success, warning, and error colors are deliberately excluded.
const replacements = {
  '#111a30': '#000033', '#0e1830': '#000033', '#10213f': '#000033', '#0a1833': '#000033', '#08142e': '#000033', '#060a17': '#00001f',
  '#1c2c52': '#000066', '#1c2c54': '#000066', '#1d2b52': '#000066', '#182950': '#000066', '#18264a': '#000066', '#1c2940': '#000066', '#1d2940': '#000066', '#28396b': '#000066',
  '#314d86': '#000099', '#4d6094': '#000099', '#526ba7': '#000099', '#5b7298': '#000099', '#7565a9': '#000099',
  '#436fd5': '#0000cc', '#456bd4': '#0000cc', '#466ee8': '#0000cc', '#4669cb': '#0000cc', '#476cdc': '#0000cc', '#5488d8': '#0000cc', '#3768d6': '#0000cc', '#7c50d1': '#0000cc', '#8152c4': '#0000cc',
  '#7d3346': '#0000cc', '#a9536a': '#0000cc', '#793646': '#0000cc', '#713646': '#0000cc',
  '#b6903f': '#0000cc', '#d9b876': '#0000cc', '#c6a15b': '#0000cc', '#e6d3a3': '#a5b4fc',
  '#9c7a2c': '#000099', '#a57d2d': '#000099', '#9a7224': '#000099', '#9b7229': '#000099', '#9b7631': '#000099', '#9b7628': '#000099', '#8d6b27': '#000099', '#8a6d26': '#000099', '#866420': '#000099', '#8b6f43': '#000099', '#806322': '#000099', '#7d6840': '#000099', '#6c5630': '#000099', '#5a4620': '#000099', '#5f4b29': '#000099',
  '#2c2618': '#000033', '#241a05': '#000033', '#1e190d': '#000033',
  '#f8edcf': '#eef2ff', '#faf3e2': '#eef2ff', '#f7e8c6': '#eef2ff', '#fbf4e3': '#eef2ff', '#f7f1e3': '#eef2ff', '#fdf8ec': '#eef2ff', '#fbf6e8': '#eef2ff', '#f4ecdb': '#eef2ff', '#f2ead8': '#eef2ff', '#efe4c9': '#eef2ff', '#eee0bd': '#eef2ff', '#e8d9b0': '#e0e7ff',
  '#f6f3ec': '#f8fafc', '#f7f5f0': '#f8fafc', '#fcfbf8': '#f8fafc', '#fbf9f3': '#f8fafc', '#faf9f5': '#f8fafc', '#fdfcf9': '#f8fafc', '#fffdf8': '#ffffff', '#fdfaf2': '#f8fafc', '#faf7f0': '#f8fafc', '#f5f2eb': '#f8fafc', '#f4f1e9': '#f8fafc', '#f3f1ea': '#f8fafc',
  '#eae5d8': '#e2e8f0', '#e7e3d8': '#e2e8f0', '#e4dfd3': '#e2e8f0', '#ddd9cf': '#e2e8f0', '#dbd9d2': '#e2e8f0', '#ded9cf': '#e2e8f0', '#dedbd2': '#e2e8f0', '#e1ded5': '#e2e8f0', '#eee4cf': '#e2e8f0', '#eee9dd': '#e2e8f0', '#eeeae2': '#e2e8f0', '#e4e9f2': '#e2e8f0', '#e5e9f0': '#e2e8f0', '#dcd3bd': '#e2e8f0', '#cfc5ad': '#cbd5e1',
  '#dfe8fb': '#e0e7ff', '#ece2fb': '#e0e7ff', '#cbd9fa': '#c7d2fe', '#dfd0f8': '#c7d2fe', '#e8edf7': '#eef2ff', '#e7ecf7': '#eef2ff', '#e9edf8': '#eef2ff', '#e6ebf5': '#eef2ff', '#edf0f6': '#eef2ff', '#edf3ff': '#eef2ff', '#ecf1ff': '#eef2ff', '#e9edfb': '#eef2ff', '#eaf0ff': '#eef2ff', '#eef2fa': '#eef2ff',
  '#211f1a': '#0f172a', '#1e2438': '#0f172a', '#20263b': '#0f172a', '#34394a': '#0f172a',
  '#4b5060': '#334155', '#4e566a': '#334155', '#596174': '#64748b', '#5c6274': '#64748b', '#5c6376': '#64748b', '#697083': '#64748b', '#6c7890': '#64748b', '#73798a': '#64748b', '#737a8d': '#64748b', '#78746a': '#64748b', '#7c8295': '#64748b',
  '#8a95a7': '#94a3b8', '#8a96aa': '#94a3b8', '#9aa0b5': '#94a3b8', '#969bae': '#94a3b8', '#9ca0ae': '#94a3b8', '#a39e91': '#94a3b8', '#a5b4c7': '#cbd5e1', '#b1bac8': '#cbd5e1', '#c9cfe4': '#c7d2fe', '#dbe7f6': '#e2e8f0', '#e8c77e': '#a5b4fc', '#e7cb86': '#a5b4fc', '#f7ddb4': '#c7d2fe', '#fbe4e1': '#fee2e2',
}

const rewriteDirectory = (directory) => {
  let changed = 0
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const target = join(directory, entry.name)
    if (entry.isDirectory()) {
      changed += rewriteDirectory(target)
      continue
    }
    if (!entry.name.endsWith('.css')) continue

    const source = readFileSync(target, 'utf8')
    let result = source
    for (const [from, to] of Object.entries(replacements)) {
      result = result.replace(new RegExp(from, 'gi'), to)
    }
    if (result !== source) {
      writeFileSync(target, result, 'utf8')
      changed += 1
    }
  }
  return changed
}

console.log(`Updated ${rewriteDirectory(resolve('sygmebec-frontend/src'))} stylesheet(s).`)

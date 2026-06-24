const fs = require('fs');
const config = fs.readFileSync('tailwind.config.js', 'utf8');
const lines = config.match(/colors: \{([\s\S]*?)\},/)[1].split('\n').filter(l => l.includes(':'));

let darkVars = '.dark {\n  color-scheme: dark;\n';
let lightVars = ':root {\n  color-scheme: light;\n';
let newColors = 'colors: {\n';

lines.forEach(line => {
  const match = line.match(/"([^"]+)":\s*"([^"]+)"/);
  if (match) {
    const name = match[1];
    const hex = match[2];
    darkVars += `  --color-${name}: ${hex};\n`;
    lightVars += `  --color-${name}: ${hex};\n`;
    newColors += `        "${name}": "var(--color-${name})",\n`;
  }
});

darkVars += '}\n';
lightVars += '}\n';
newColors += '      },';

fs.writeFileSync('theme-vars.css', lightVars + '\n' + darkVars);
fs.writeFileSync('new-colors.js', newColors);

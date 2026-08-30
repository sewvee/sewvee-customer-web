const fs = require('fs');
const layoutPath = 'src/app/layout.tsx';
let content = fs.readFileSync(layoutPath, 'utf8');
content = content.replace(
  `const inter = Inter({ subsets: ['latin'] });`,
  `const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });`
);
content = content.replace(
  `body className={\`\${inter.className}`,
  `body className={\`\${inter.variable} \${inter.className}`
);
fs.writeFileSync(layoutPath, content);

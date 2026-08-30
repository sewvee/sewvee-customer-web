const fs = require('fs');
const file = 'public/manifest.json';
let data = JSON.parse(fs.readFileSync(file, 'utf8'));

// Update icon paths with a cache-buster
data.icons.forEach(icon => {
  if (icon.src.includes('?v=')) {
    icon.src = icon.src.replace(/\?v=.+$/, '?v=' + Date.now());
  } else {
    icon.src = icon.src + '?v=' + Date.now();
  }
});

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log('Successfully added cache-buster to manifest.json icons.');

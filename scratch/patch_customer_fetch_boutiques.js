const fs = require('fs');
const file = 'src/app/(app)/stitching/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const search = `  // Ensure boutiques are loaded so the header can show the name
  useEffect(() => {
    if (boutiques.length === 0) {
      fetchBoutiques();
    }
  }, [boutiques.length, fetchBoutiques]);`;
const replace = `  // Ensure boutiques are fresh so we get latest T&C
  useEffect(() => {
    fetchBoutiques();
  }, [fetchBoutiques]);`;

content = content.replace(search, replace);
fs.writeFileSync(file, content);
console.log('patched fetchBoutiques in frontend');

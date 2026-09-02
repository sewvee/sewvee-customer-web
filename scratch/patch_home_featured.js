const fs = require('fs');

let content = fs.readFileSync('src/app/(app)/home/page.tsx', 'utf8');

// Update the useEffect that fetches featuredShop
const newEffect = `
  useEffect(() => {
    async function fetchFeatured() {
      try {
        let allItems = [];
        
        // Fetch Sewvee Originals
        const originalsRes = await fetch(URL_CUSTOMER_STORE_CATALOGUE).then(r => r.json()).catch(() => null);
        if (originalsRes && Array.isArray(originalsRes.products)) {
          allItems = [...allItems, ...originalsRes.products];
        } else if (originalsRes && Array.isArray(originalsRes.data)) {
          allItems = [...allItems, ...originalsRes.data];
        } else if (Array.isArray(originalsRes)) {
          allItems = [...allItems, ...originalsRes];
        }

        // Fetch My Boutiques
        if (selectedBoutiqueId) {
          const boutiqueRes = await fetch(\`\${URL_CUSTOMER_PORTAL_SHOP}?companyId=\${selectedBoutiqueId}&limit=10\`).then(r => r.json()).catch(() => null);
          if (boutiqueRes && Array.isArray(boutiqueRes.data)) {
            allItems = [...allItems, ...boutiqueRes.data];
          } else if (Array.isArray(boutiqueRes)) {
            allItems = [...allItems, ...boutiqueRes];
          }
        }

        // Shuffle the combined array
        allItems.sort(() => 0.5 - Math.random());
        
        // Limit to 5
        setFeaturedShop(allItems.slice(0, 5));
      } catch (err) {
        console.error(err);
      }
    }
    fetchFeatured();
  }, [selectedBoutiqueId]);
`;

// Replace the old useEffect
content = content.replace(/useEffect\(\(\) => \{\n\s*if \(selectedBoutiqueId\) \{\n\s*fetch\(\`\$\{URL_CUSTOMER_PORTAL_SHOP\}\?companyId=\$\{selectedBoutiqueId\}&limit=5\`\)(?:.|\n)*?\}, \[selectedBoutiqueId\]\);/m, newEffect.trim());

fs.writeFileSync('src/app/(app)/home/page.tsx', content);
console.log('patched fetch logic');

const fs = require('fs');
const file = 'src/app/(app)/stitching/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix progress dots
const progressRegex = /\{Array\.from\(\{ length: 5 \}\)\.map\(\(\_, i\) => \(/;
content = content.replace(progressRegex, '{Array.from({ length: 3 }).map((_, i) => (');

// 2. Fix line where the line is drawn for progress dots
content = content.replace(/className="absolute top-1\/2 left-0 h-1 bg-\[\#5B43EE\] transition-all duration-300"/, 'className="absolute top-1/2 left-0 h-1 bg-[#5B43EE] transition-all duration-300"');
const lineRegex = /width: \`\$\{\(\(step - 1\) \/ 4\) \* 100\}\%\`/;
content = content.replace(lineRegex, 'width: `${((step - 1) / 2) * 100}%`');

// 3. Update payload to store configs in details
const submitRegex = /const payload = \{[\s\S]*?delivery_date: deliveryDate,\s*\}\s*\};/;
const oldSubmit = content.match(submitRegex)[0];
const newSubmit = `const payload = {
        order_type: 'STITCHING_REQUEST',
        customer_mobile: user?.mobile,
        company_id: selectedBoutiqueId,
        outfits: payloadOutfits,
        details: {
          multi_outfit: true,
          delivery_date: deliveryDate,
          outfit_configs: payloadOutfits.map(po => ({
            name: po.name,
            customer_notes: po.customer_notes,
            photos: po.photos
          }))
        }
      };`;
content = content.replace(oldSubmit, newSubmit);

fs.writeFileSync(file, content);
console.log('Stitching page patched');

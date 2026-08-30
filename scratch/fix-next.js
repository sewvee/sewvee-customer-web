const fs = require('fs');
const file = 'src/app/(app)/stitching/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldNext = '  const handleNext = () => setStep((s) => s + 1);';
const newNext = `  const handleNext = () => {
    if (step === 1) {
      const newOutfits = [];
      Object.entries(categoryCounts).forEach(([cat, count]) => {
        for (let i = 0; i < count; i++) {
          const id = \`\${cat}-\${i}\`;
          const existing = outfits.find(o => o.id === id);
          if (existing) {
            newOutfits.push(existing);
          } else {
            newOutfits.push({
              id,
              category: cat,
              name: \`\${cat} \${count > 1 ? i + 1 : ''}\`.trim(),
              images: [],
              previewUrls: [],
              collageDataUrl: null,
              description: '',
              audioBlob: null,
              audioUrl: null,
              measurement_option: 'Use Previous Measurements',
              selected_past_order_id: '',
              isConfigured: false
            });
          }
        }
      });
      setOutfits(newOutfits);
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };`;

content = content.replace(oldNext, newNext);
fs.writeFileSync(file, content);

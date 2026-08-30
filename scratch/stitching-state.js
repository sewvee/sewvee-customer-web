const fs = require('fs');
const file = 'src/app/(app)/stitching/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace state and handleNext
content = content.replace(/const \[formData, setFormData\] = useState\(\{[^\}]+\}\);/s, 
`const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [outfits, setOutfits] = useState<any[]>([]);
  const [editingOutfitId, setEditingOutfitId] = useState<string | null>(null);
  const [deliveryDate, setDeliveryDate] = useState('');

  const [formData, setFormData] = useState({
    description: '',
    measurement_option: 'Use Previous Measurements',
    selected_past_order_id: '',
  });`);

content = content.replace(/const handleNext = \(\) => \{[^}]+\};/s, 
`const handleNext = () => {
    if (step === 1) {
      const newOutfits: any[] = [];
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
  };`);

fs.writeFileSync(file, content);
console.log('State replaced');

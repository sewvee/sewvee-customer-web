const fs = require('fs');
const file = 'src/app/(app)/stitching/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const submitStart = content.indexOf('const handleSubmit = async () => {');
const submitEnd = content.indexOf('const res = await fetch(URL_CUSTOMER_PORTAL_ORDERS, {');

const newSubmit = `const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('sewvee_customer_token') ?? '';
      const formattedToken = token.startsWith('Bearer ') ? token : \`Bearer \${token}\`;
      
      const payloadOutfits = [];

      for (const outfit of outfits) {
        const uploadedUrls = [];
        
        // Upload images
        for (const file of outfit.images || []) {
          const fd = new FormData();
          fd.append('file', file);
          fd.append('key_name', 'order_reference');
          
          const uploadRes = await fetch(URL_UPLOAD, {
            method: 'POST',
            headers: { Authorization: formattedToken },
            body: fd,
          });
          
          if (uploadRes.ok) {
            const json = await uploadRes.json();
            const url = json.file_url ?? json.data?.file_url ?? json.url ?? json.data?.url;
            if (url) uploadedUrls.push(url);
          }
        }

        // Upload collage if created
        if (outfit.collageDataUrl) {
          try {
            const res = await fetch(outfit.collageDataUrl);
            const blob = await res.blob();
            const collageFile = new File([blob], \`collage_\${Date.now()}.jpg\`, { type: 'image/jpeg' });
            const fd = new FormData();
            fd.append('file', collageFile);
            fd.append('key_name', 'order_reference');
            const collageUploadRes = await fetch(URL_UPLOAD, {
              method: 'POST',
              headers: { Authorization: formattedToken },
              body: fd,
            });
            if (collageUploadRes.ok) {
              const json = await collageUploadRes.json();
              const url = json.file_url ?? json.data?.file_url ?? json.url ?? json.data?.url;
              if (url) uploadedUrls.push(url);
            }
          } catch(e) {
            console.error('Failed to upload collage:', e);
          }
        }

        // Upload voice recording if present
        if (outfit.audioBlob) {
          try {
            const audioFile = new File([outfit.audioBlob], \`voice_note_\${Date.now()}.webm\`, { type: 'audio/webm' });
            const fd = new FormData();
            fd.append('file', audioFile);
            fd.append('key_name', 'order_reference');
            const audioUploadRes = await fetch(URL_UPLOAD, {
              method: 'POST',
              headers: { Authorization: formattedToken },
              body: fd,
            });
            if (audioUploadRes.ok) {
              const json = await audioUploadRes.json();
              const url = json.file_url ?? json.data?.file_url ?? json.url ?? json.data?.url;
              if (url) uploadedUrls.push(url);
            }
          } catch(e) {
            console.error('Failed to upload voice note:', e);
          }
        }

        payloadOutfits.push({
          name: \`Stitching Request - \${outfit.category}\`,
          quantity: 1,
          total_amount: 0,
          customer_notes: \`Category: \${outfit.category}\\nOutfit Name: \${outfit.name}\\nDescription: \${outfit.description}\\nMeasurement: \${outfit.measurement_option} (\${outfit.selected_past_order_id})\\nExpected Date: \${deliveryDate}\`,
          photos: uploadedUrls.map(url => ({ file_url: url })),
          items: [] // required to pass validation
        });
      }

      const payload = {
        order_type: 'STITCHING_REQUEST',
        customer_mobile: user?.mobile,
        company_id: selectedBoutiqueId,
        outfits: payloadOutfits,
        details: {
          multi_outfit: true,
          delivery_date: deliveryDate,
        }
      };

      `;

content = content.substring(0, submitStart) + newSubmit + content.substring(submitEnd);
fs.writeFileSync(file, content);

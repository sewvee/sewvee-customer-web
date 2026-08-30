const fs = require('fs');
const file = 'src/app/(app)/orders/[id]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldOnSave = `          const outfitId = activeOutfitForCollage.id || activeOutfitForCollage.order_outfit_id;
          console.log('[DEBUG] Saving to outfitId:', outfitId, 'activeOutfitForCollage:', activeOutfitForCollage);
          
          // Auto submit to backend
          await fetch(\`\${URL_CUSTOMER_PORTAL_ORDERS}/\${order.id.toString()}/outfits/\${outfitId}/requests\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: formattedToken },
            body: JSON.stringify({ attachment_url: fileUrl, message: 'Uploaded reference photo via Customer Web', phone: user?.mobile ?? '' })
          });
          
          if (user?.mobile) {
            fetchOrders(user.mobile);
          }

          setCollageOpen(false);
          setActiveOutfitForCollage(null);`;

const newOnSave = `          const outfitId = activeOutfitForCollage.id || activeOutfitForCollage.order_outfit_id;
          console.log('[DEBUG] Saving to outfitId:', outfitId, 'activeOutfitForCollage:', activeOutfitForCollage);
          
          // Save to pendingPhotos instead of auto-submitting
          setPendingPhotos(prev => {
            const next = { ...prev };
            if (!next[outfitId]) next[outfitId] = [];
            next[outfitId].push(fileUrl);
            return next;
          });

          setCollageOpen(false);
          setActiveOutfitForCollage(null);`;

if (code.includes(oldOnSave)) {
  code = code.replace(oldOnSave, newOnSave);
  fs.writeFileSync(file, code);
  console.log('Successfully reverted to pendingPhotos UI!');
} else {
  console.log('Failed to find the auto-submit block.');
}

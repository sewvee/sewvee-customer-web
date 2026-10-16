const fs = require('fs');
const file = 'src/app/(app)/orders/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldFallbackLogic = `                  // FALLBACK: parse from customer_notes text blob (for orders created before this fix)
                  const rawNotes = activeOutfit.customer_notes || activeOutfit.notes || '';
                  const extractField = (label: string) => {
                    const match = rawNotes.match(new RegExp(\`\${label}:\\\\s*(.+)\`, 'i'));
                    return match ? match[1].trim() : '';
                  };`;

const newFallbackLogic = `                  // FALLBACK: parse from customer_notes or outfitRequests (which the backend uses to store the form data)
                  const activeOutfitIdStr = String(activeOutfit.id || activeOutfit.order_outfit_id || '');
                  const outfitReqs = outfitRequests.filter((r: any) => String(r.outfit_id || r.order_outfit_id || r.outfitId || '') === activeOutfitIdStr || !r.outfit_id);
                  const firstCustomerReq = outfitReqs.find((r: any) => r.sender_type === 'CUSTOMER' && r.message && r.message.includes('Category:'));
                  const rawNotes = activeOutfit.customer_notes || activeOutfit.notes || (firstCustomerReq ? firstCustomerReq.message : '');
                  
                  const extractField = (label: string) => {
                    const match = rawNotes.match(new RegExp(\`\${label}:\\\\s*(.+)\`, 'i'));
                    return match ? match[1].trim() : '';
                  };`;

content = content.replace(oldFallbackLogic, newFallbackLogic);

const oldPhotoLogic = `                  // Photos: from localStorage OR from outfit.photos (attached via /requests)
                  const localPhotoUrls: string[] = localConfig?.photo_urls || [];
                  const outfitPhotoUrls: string[] = (activeOutfit.photos || []).map((p: any) =>
                    typeof p === 'string' ? p : (p.file_url || p.url || p.attachment_url || p.image || '')
                  ).filter(Boolean);
                  const allUrls: string[] = [...new Set([...localPhotoUrls, ...outfitPhotoUrls])];`;

const newPhotoLogic = `                  // Photos: from localStorage OR from outfit.photos OR from outfitRequests
                  const localPhotoUrls: string[] = localConfig?.photo_urls || [];
                  const outfitPhotoUrls: string[] = (activeOutfit.photos || []).map((p: any) =>
                    typeof p === 'string' ? p : (p.file_url || p.url || p.attachment_url || p.image || '')
                  ).filter(Boolean);
                  const requestUrls: string[] = outfitReqs.map((r: any) => r.attachment_url || r.file_url).filter(Boolean);
                  const allUrls: string[] = [...new Set([...localPhotoUrls, ...outfitPhotoUrls, ...requestUrls])];`;

content = content.replace(oldPhotoLogic, newPhotoLogic);

fs.writeFileSync(file, content);
console.log('patched fallback logic');

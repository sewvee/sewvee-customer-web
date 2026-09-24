const fs = require('fs');
const file = 'src/app/(app)/orders/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Use regex to replace the block
const regex = /\/\/ FALLBACK: parse from customer_notes text blob[\s\S]*?const allUrls: string\[\] = \[\.\.\.new Set\(\[\.\.\.localPhotoUrls, \.\.\.outfitPhotoUrls, \.\.\.requestUrls\]\)\];/;

const newLogic = `                  // FALLBACK: parse from customer_notes or outfitRequests (which the backend uses to store the form data)
                  const activeOutfitIdStr = String(activeOutfit.id || activeOutfit.order_outfit_id || '');
                  const outfitReqs = outfitRequests.filter((r: any) => String(r.outfit_id || r.order_outfit_id || r.outfitId || '') === activeOutfitIdStr || !r.outfit_id);
                  const firstCustomerReq = outfitReqs.find((r: any) => r.sender_type === 'CUSTOMER' && r.message && r.message.includes('Category:'));
                  const rawNotes = activeOutfit.customer_notes || activeOutfit.notes || (firstCustomerReq ? firstCustomerReq.message : '');
                  
                  const extractField = (label: string) => {
                    const match = rawNotes.match(new RegExp(\`\${label}:\\\\s*(.+)\`, 'i'));
                    return match ? match[1].trim() : '';
                  };

                  const category = localConfig?.category || extractField('Category') || activeOutfit.name?.replace('Stitching Request - ', '') || '';
                  let description = localConfig?.description || extractField('Description') || '';
                  if (!description && rawNotes && !rawNotes.includes('Category:')) description = rawNotes;
                  if (description) {
                    description = description.replace(/\\[CUSTOMER_CANCELLED\\]/g, '').trim();
                  }
                  const measurement = localConfig?.measurement_option || extractField('Measurement') || activeOutfit.measurement_option || '';
                  const delivDate = localConfig?.delivery_date || localRichData.delivery_date || extractField('Expected Date') || activeOutfit.deliveryDate || (order as any).deliveryDate || '';

                  // Photos: from localStorage OR from outfit.photos OR from outfitRequests
                  const localPhotoUrls: string[] = localConfig?.photo_urls || [];
                  const outfitPhotoUrls: string[] = (activeOutfit.photos || []).map((p: any) =>
                    typeof p === 'string' ? p : (p.file_url || p.url || p.attachment_url || p.image || '')
                  ).filter(Boolean);
                  const requestUrls: string[] = outfitReqs.map((r: any) => r.attachment_url || r.file_url).filter(Boolean);
                  const allUrls: string[] = [...new Set([...localPhotoUrls, ...outfitPhotoUrls, ...requestUrls])];`;

content = content.replace(regex, newLogic);
fs.writeFileSync(file, content);

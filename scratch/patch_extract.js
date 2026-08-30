const fs = require('fs');
const file = 'src/app/(app)/orders/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldDetailsBlock = `                {order.order_type === 'STITCHING_REQUEST' ? (() => {
                  const od = (order as any).details || {};
                  
                  // Extract text details
                  const getDetails = () => {
                    const d: any = {};
                    const cat = activeOutfit.category || activeOutfit.type || activeOutfit.name || od.category;
                    if (cat) d['Category'] = cat.replace('Stitching Request - ', '');
                    
                    if (activeOutfit.name) d['Outfit Name'] = activeOutfit.name.replace('Stitching Request - ', '');
                    
                    const desc = activeOutfit.customer_notes || activeOutfit.notes || activeOutfit.description || activeOutfit.customer_instructions || od.description;
                    if (desc) d['Description / Notes'] = desc;
                    
                    const meas = activeOutfit.measurement_option || activeOutfit.measurement || od.measurement_option;
                    if (meas) d['Measurement'] = meas;
                    
                    const del = activeOutfit.deliveryDate || activeOutfit.expected_date || od.delivery_date || order.deliveryDate;
                    if (del) d['Expected Date'] = new Date(del).toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'});
                    
                    return d;
                  };`;

const newDetailsBlock = `                {order.order_type === 'STITCHING_REQUEST' ? (() => {
                  const od = (order as any).details || {};
                  const backupConfig = (od.outfit_configs && od.outfit_configs[activeOutfitIndex]) || {};
                  
                  // Extract text details
                  const getDetails = () => {
                    const d: any = {};
                    const cat = activeOutfit.category || activeOutfit.type || backupConfig.category || activeOutfit.name || od.category;
                    if (cat) d['Category'] = cat.replace('Stitching Request - ', '');
                    
                    if (activeOutfit.name || backupConfig.name) d['Outfit Name'] = (activeOutfit.name || backupConfig.name).replace('Stitching Request - ', '');
                    
                    const desc = activeOutfit.customer_notes || backupConfig.customer_notes || activeOutfit.notes || activeOutfit.description || activeOutfit.customer_instructions || od.description;
                    if (desc) d['Description / Notes'] = desc;
                    
                    const meas = activeOutfit.measurement_option || activeOutfit.measurement || od.measurement_option;
                    if (meas) d['Measurement'] = meas;
                    
                    const del = activeOutfit.deliveryDate || activeOutfit.expected_date || od.delivery_date || order.deliveryDate;
                    if (del) d['Expected Date'] = new Date(del).toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'});
                    
                    return d;
                  };`;

content = content.replace(oldDetailsBlock, newDetailsBlock);

const oldNotesCheck = `                  const parsed = (activeOutfit.customer_notes && activeOutfit.customer_notes.includes('Category:')) 
                    ? parseNotes(activeOutfit.customer_notes) 
                    : getDetails();
                    
                  // Extract Photos & Audio
                  const oldPhotos = od.photos || []; 
                  const newPhotos = activeOutfit.photos || []; 
                  const allPhotosRaw = [...oldPhotos, ...newPhotos];`;

const newNotesCheck = `                  const rawNotes = activeOutfit.customer_notes || backupConfig.customer_notes || '';
                  const parsed = (rawNotes && rawNotes.includes('Category:')) 
                    ? parseNotes(rawNotes) 
                    : getDetails();
                    
                  // Extract Photos & Audio
                  const oldPhotos = od.photos || []; 
                  const newPhotos = activeOutfit.photos || backupConfig.photos || []; 
                  const allPhotosRaw = [...oldPhotos, ...newPhotos];`;

content = content.replace(oldNotesCheck, newNotesCheck);

fs.writeFileSync(file, content);
console.log('Extract block patched');

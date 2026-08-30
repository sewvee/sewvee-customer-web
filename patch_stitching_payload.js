import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('src/app/(app)/stitching/page.tsx', 'utf-8');

const oldPayload = `      const payload = {
        order_type: 'STITCHING_REQUEST',
        customer_mobile: user?.mobile,
        company_id: selectedBoutiqueId,
        details: {
          category: formData.category,
          description: formData.description,
          measurement_option: formData.measurement_option,
          reference_order_id: formData.selected_past_order_id,
          delivery_date: formData.delivery_date,
          photos: uploadedUrls
        }
      };`;

const newPayload = `      const payload = {
        order_type: 'STITCHING_REQUEST',
        customer_mobile: user?.mobile,
        company_id: selectedBoutiqueId,
        outfits: [
          {
            name: \`Stitching Request - \${formData.category}\`,
            quantity: 1,
            total_amount: 0,
            customer_notes: \`Category: \${formData.category}\\nDescription: \${formData.description}\\nMeasurement: \${formData.measurement_option}\\nExpected Date: \${formData.delivery_date}\`,
            photos: uploadedUrls.map(url => ({ file_url: url })),
            items: [] // required to pass validation
          }
        ],
        // keep details just in case any other logic uses it
        details: {
          category: formData.category,
          description: formData.description,
          measurement_option: formData.measurement_option,
          reference_order_id: formData.selected_past_order_id,
          delivery_date: formData.delivery_date,
          photos: uploadedUrls
        }
      };`;

if (content.includes(oldPayload)) {
    content = content.replace(oldPayload, newPayload);
    writeFileSync('src/app/(app)/stitching/page.tsx', content);
    console.log('patched successfully');
} else {
    console.log('payload not found');
}

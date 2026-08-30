const fs = require('fs');
const file = 'src/app/(app)/stitching/page.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
    /return \`Selected: \$\\{selectedOrder \? \(selectedOrder\.billNo \|\| \\\\?\`ORD-\\\\\?\$\\{selectedOrder\.id\\}\\\\?\`\) : formData\.selected_past_order_id\\} \(Tap to change\)\`;/g,
    "return `Selected: ${selectedOrder ? (selectedOrder.billNo || `ORD-${selectedOrder.id}`) : formData.selected_past_order_id} (Tap to change) `;"
);
fs.writeFileSync(file, content);

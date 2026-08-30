const fs = require('fs');
const file = '/Users/bhuvan/Documents/Bhuvan/Products/Sewvee-Backend-API/src/Mobile/customer-portal/customer-portal.service.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /SELECT om\.id, om\.outfit_id, om\.measurement_name, om\.value\n\s*FROM order_measurements om/g,
  `SELECT om.id, om.outfit_id, COALESCE(om.measurement_name, m.name) as measurement_name, om.value
         FROM order_measurements om
         LEFT JOIN measurements m ON m.id = om.measurement_id`
);

fs.writeFileSync(file, content);
console.log('Patched successfully');

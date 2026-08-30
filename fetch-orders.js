const http = require('http');

http.get('http://localhost:3000/api/mobile/customer-portal/orders?phone=9876543210', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const order = json.data.find(o => String(o.id) === '83');
      if (order) {
        console.log('Order 83 Outfits:', JSON.stringify(order.outfits, null, 2));
        console.log('Order 83 Items:', JSON.stringify(order.items, null, 2));
      } else {
        console.log('Order 83 not found in list.');
      }
    } catch(e) {
      console.error(e);
    }
  });
}).on('error', console.error);

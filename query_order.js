fetch("http://localhost:3021/mobile/customer-portal/orders?phone=9876543210")
  .then(r => r.json())
  .then(data => {
    const order = data.data.find(o => o.id == '573');
    console.log(JSON.stringify(order.outfits, null, 2));
  })
  .catch(console.error);

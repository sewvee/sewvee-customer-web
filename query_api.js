const axios = require('axios');
async function run() {
  try {
    const res = await axios.get('http://localhost:3021/mobile/orders/578'); // Assuming local backend is running
    console.log(JSON.stringify(res.data, null, 2));
  } catch (e) {
    console.error(e.message);
  }
}
run();

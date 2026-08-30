const axios = require('axios');
axios.get('http://localhost:3021/mobile/marketing/banners?platform=WEB&target_app=CUSTOMER_APP')
  .then(res => console.log(JSON.stringify(res.data, null, 2)))
  .catch(err => console.log("Failed localhost:", err.message));

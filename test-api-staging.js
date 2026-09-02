const https = require('https');
https.get('https://api-stage.sewvee.com/mobile/customer-portal/all-boutiques', (resp) => {
  let data = '';
  resp.on('data', (chunk) => { data += chunk; });
  resp.on('end', () => { console.log("Response:", data); });
}).on("error", (err) => { console.log("Error: " + err.message); });

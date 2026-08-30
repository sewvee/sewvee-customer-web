const { Client } = require('pg');
require('dotenv').config({ path: '/Users/bhuvan/Documents/Bhuvan/Products/Sewvee-Backend-API/.env' });
async function run() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });
  await client.connect();
  
  try {
    await client.query(`UPDATE order_outfits SET customer_notes = 'test' WHERE id = 78`);
    console.log("Success updating customer_notes!");
  } catch (err) {
    console.error("Error:", err.message);
  }
  
  process.exit(0);
}
run();

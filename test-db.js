const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/sewvee_backend_dev'
});
async function run() {
  await client.connect();
  const res = await client.query('SELECT * FROM orders WHERE id=83');
  console.log('Order:', res.rows[0]);
  const outRes = await client.query('SELECT id FROM order_outfits WHERE order_id=83');
  console.log('Outfits:', outRes.rows);
  await client.end();
}
run();

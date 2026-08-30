const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://bhuvan:admin@localhost:5432/sewvee_stage' });
async function run() {
  const res = await pool.query(`SELECT id, trial_date FROM order_outfits ORDER BY id DESC LIMIT 5`);
  console.log("Order Outfits Trial Dates:", res.rows);
  const resOrder = await pool.query(`SELECT id, trial_date FROM orders ORDER BY id DESC LIMIT 5`);
  console.log("Orders Trial Dates:", resOrder.rows);
  pool.end();
}
run();

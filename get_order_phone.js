const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'sewvee_user',
  password: 'SEw%%!!246',
  database: 'sewvee'
});
pool.query('SELECT customer_mobile FROM orders WHERE id = 573')
  .then(res => { console.log(res.rows); pool.end(); })
  .catch(err => { console.error(err); pool.end(); });

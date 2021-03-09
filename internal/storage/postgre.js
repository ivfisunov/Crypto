const { Pool } = require("pg");
const { buildQueryString, parse } = require("../tools");

function Database(pool) {
  this.pool = pool;
}

Database.Init = function (dsn) {
  const pool = new Pool({ connectionString: dsn });

  const db = new Database(pool);
  return db;
};

Database.prototype.createTable = async function () {
  return await this.pool.query(`CREATE TABLE IF NOT EXISTS public.currency (
    id SERIAL PRIMARY KEY,
    data jsonb,
    "lastUpdate" timestamptz DEFAULT NOW(),
    status varchar(5)
  )`);
};

Database.prototype.close = async function () {
  return await this.pool.end();
};

Database.prototype.saveCurrency = async function (data) {
  const client = await this.pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`
    UPDATE public.currency
    SET status = 'old'
    WHERE status = 'new';`);
    await client.query(`
    INSERT INTO public.currency
    (data, status)
    VALUES ($1, 'new');`,
      [data]
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

Database.prototype.clearOldRows = async function () {
  await this.pool.query(`
    DELETE FROM public.currency
    WHERE "lastUpdate" < ((SELECT "lastUpdate" FROM public.currency WHERE status='new') - INTERVAL '2 hours')
    AND status = 'old'`);
};

Database.prototype.getCurrency = async function (fsyms, tsyms) {
  const queryString = buildQueryString(fsyms, tsyms);
  const resDb = await this.pool.query(queryString);
  return parse(resDb.rows[0]);
};

module.exports = Database;

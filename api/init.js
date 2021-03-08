const util = require("util");
const redis = require("redis");
const Database = require("../internal/storage/postgre");
const Server = require("./Server");

const dsn = process.env.DSN;
const api_port = process.env.API_PORT;
const redis_host = process.env.REDIS_HOST;
const redis_port = process.env.REDIS_PORT;
const cacheTime = process.env.CACHE_TIME;

async function initApp() {
  const db = Database.Init(dsn);

  const client = redis.createClient({
    host: redis_host,
    port: redis_port,
  });
  client.on("error", function (error) {
    console.error(error);
  });

  const cache = { cacheTime };
  cache.get = util.promisify(client.get).bind(client);
  cache.set = util.promisify(client.set).bind(client);
  cache.expire = util.promisify(client.expire).bind(client);

  try {
    const server = new Server(db, api_port, cache);
    server.startServer();
  } catch (error) {
    await db.close();
    client.quit();
    console.error(error);
    process.exit(1);
  }

  process.on("SIGTERM", async () => {
    console.log("\nServer gracefully shutdown...");
    await db.close();
    client.quit();
    process.exit(0);
  });
}

module.exports = initApp;

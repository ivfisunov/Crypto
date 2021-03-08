const fs = require("fs");
const yaml = require("js-yaml");
const Database = require("../internal/storage/postgre");
const { runScheduler } = require("./scheduler");

const server = require("http").createServer();
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

const conf = yaml.load(fs.readFileSync("./config/conf.yaml", "utf8"));
const timeIntervalMinutes = 2;
const dsn = process.env.DSN;
const wsPort = process.env.WS_PORT;

async function init(conf) {
  const db = Database.Init(dsn);

  // create if not exists
  await db.createTable();

  io.on("connection", (/*client*/) => {
    // some logic with client
  });
  io.listen(wsPort);
  console.log(`Scheduler started.\nRealtime quotes are broadcasting on port ${wsPort}...`);

  // run scheduler
  runScheduler(conf.currency, db, io, timeIntervalMinutes);

  process.on("SIGTERM", async () => {
    console.log("\nScheduler shutdown...");
    await db.close();
    process.exit(0);
  });
}

init(conf);

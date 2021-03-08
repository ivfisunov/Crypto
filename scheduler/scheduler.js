const axios = require("axios");

function runScheduler(currency, db, io, timeIntervalMinutes) {
  scheduler(currency, db, io);
  setInterval(() => {
    scheduler(currency, db, io);
  }, 1000 * 60 * timeIntervalMinutes);
}

async function scheduler(currency, db, io) {
  try {
    const currencyData = await fetchCurrency(currency);
    io.emit("currency", currencyData.data);
    await db.saveCurrency(currencyData.data);
    await db.clearOldRows();
  } catch (error) {
    console.error(error);
  }
}

async function fetchCurrency(currency) {
  const fsyms = currency.fsyms.join(",");
  const tsyms = currency.tsyms.join(",");
  try {
    return await axios(
      `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${fsyms}&tsyms=${tsyms}`
    );
  } catch (error) {
    throw new Error("Cryprocompare.com fetching error: " + error.code);
  }
}

module.exports = { runScheduler };

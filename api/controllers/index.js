const axios = require("axios");
const ApiError = require("../api-error");

const getPrice = (db, cache) => async (req, res, next) => {
  const fsyms = req.query.fsyms;
  const tsyms = req.query.tsyms;
  const fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;

  try {
    const fromCache = await cache.get(fullUrl);
    if (fromCache) {
      console.log("--> from cache");
      res.json(JSON.parse(fromCache));
      return;
    }
  } catch (error) {
    console.error("error fetching from cache: " + error.code);
  }

  try {
    const cryptoRes = await axios(
      `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${fsyms}&tsyms=${tsyms}`
    );
    console.log("--> from cryptocompare.com");
    await cache.set(fullUrl, JSON.stringify(cryptoRes.data));
    await cache.expire(fullUrl, cache.cacheTime);
    res.json(cryptoRes.data);
    return;
  } catch (error) {
    console.error("error fetching from cryptocompare.com: " + error.code);
  }

  try {
    const dbRes = await db.getCurrency(fsyms.split(","), tsyms.split(","));
    console.log("--> from postgreSQL");
    res.json(dbRes);
    return;
  } catch (error) {
    console.error("error fetching from PostgreSQL: " + error);
  }

  next(new ApiError("Everything is broken...", 500));
};

module.exports = { getPrice };

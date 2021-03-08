const { Router } = require("express");
const { getPrice } = require("../controllers");

module.exports = function (db, cache) {
  const router = new Router();

  router.get("/price", getPrice(db, cache));

  return router;
};

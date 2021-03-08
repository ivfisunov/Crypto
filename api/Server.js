const express = require("express");
const registerRoutes = require("./routes");

class Server {
  constructor(db, port, cache) {
    this.db = db;
    this.cache = cache;
    this.port = port;

    const app = express();
    app.use(registerRoutes(this.db, this.cache));

    // handle 404 error
    app.use(function (req, res, next) {
      res.status(404).json({ message: "Not found" });
    });

    // one point error handling
    app.use(function (err, req, res, next) {
      if (err.code === 500) {
        res.status(500).json({ error: "Internal Server error" });
      }
      console.error(err.stack);
      next();
    });

    this.app = app;
  }

  startServer() {
    this.app.listen(this.port, "0.0.0.0", () => {
      console.log(`HTTP server started on port ${this.port}.`);
    });
  }
}

module.exports = Server;

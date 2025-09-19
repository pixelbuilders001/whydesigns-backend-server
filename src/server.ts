import { Application } from "express";
import { config } from "./config";

import app from "./app";

const startServer = (App: Application) => {
  App.listen(config.PORT, () => {
    console.log(`Server running on http://${config.HOST}:${config.PORT}`);
  });
};

startServer(app);

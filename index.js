require("dotenv").config();
require("./bot/index.js");
process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);
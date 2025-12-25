const { readFileSync, readdirSync } = require("fs");
const { join } = require("path");
const mongoose = require("mongoose");

module.exports = class DataBase {
    constructor () {this._mongoose = mongoose; this.models = {}; this.cache = {};}
    async connect (...data) {
        return await this._mongoose.connect(...data);
    }

    async load_models() {
        return readdirSync(join(__dirname, "./models")).filter(x => x.endsWith('.js')).forEach(file => {
            let db = require(`./models/${file}`);
            this[file.replace(".js", "")] = db;
            this.models[file.replace(".js", "")] = db;
        });
    }
}
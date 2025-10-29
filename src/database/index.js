const { readFileSync, readdirSync } = require("fs");
const { join } = require("path");
const mongoose = require("mongoose");
const { eachSeries } = require('async')

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

    async saveCache() {
        var cache = {};
        await eachSeries(Object.keys(this.models), async (key) => {
            cache[key] = await this.models[key].find();
        });
        this.cache = cache;
        return cache;
    }
}
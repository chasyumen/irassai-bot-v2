const Discord = require("discord.js");
const { Client, GatewayIntentBits, Collection, Options, Partials } = Discord;
const { join } = require("path");
const { readdirSync } = require("fs");
const mongoose = (global.mongoose = require("mongoose"));
const async2 = (global.async2 = require("async"));
const db_class = require("../src/database/index.js");
const client = (global.client = new Client({
    //   ws: {
    //     properties: {
    //       $browser: "Discord Android",
    //       $device: "Discord Android",
    //     },
    //   },
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        // GatewayIntentBits.GuildBans,
        // GatewayIntentBits.GuildEmojisAndStickers,
        // GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        // GatewayIntentBits.GuildInvites,
        // GatewayIntentBits.GuildVoiceStates,
        // GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        // GatewayIntentBits.GuildMessageReactions,
        // GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages,
        // GatewayIntentBits.DirectMessageReactions,
        // GatewayIntentBits.DirectMessageTyping,
        // GatewayIntentBits.MessageContent,
    ],
    makeCache: Options.cacheWithLimits({
        // Disable most caches entirely
        MessageManager: 0,
        GuildMemberManager: {
            maxSize: 10, // limit guild member cache
            keepOverLimit: member => member.id === client.user.id // always keep bot user
        },
        PresenceManager: 0,
        UserManager: 0,
        ThreadManager: 0,
        ThreadMemberManager: 0,
        ReactionManager: 0,
    }),
    partials: [Partials.GuildMember, Partials.User],
    allowedMentions: { repliedUser: false },
    presence: {
        status: "idle",
        activities: [
            { name: `起動中 | ${require("../package.json").version}` }
        ]
    },
    restGlobalRateLimit: 40
}));

client.db = (global.db = new db_class());

global.config = require("../config.json");

client.isReady = false;

// client.aliases = new Collection();
client.commands = new Collection();
client.functions = new Collection();
client.events = new Collection();
client.interactions = new Collection();

db.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true }).then(async (db_connected) => {
    console.log("CONNECTED TO DATABASE");
    await db.load_models();
    await dbCache()
    setInterval(dbCache, 2000);
    async function dbCache() {
        return await db.saveCache();
    }
    // console.log(db);
});

process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

// client.db = {};
client.logQueue = new Array();
client.logInterval = setInterval(async () => {
    if (client.logQueue.length >= 1) {
        var logs = client.logQueue.splice(0, 5);
        var content = logs.join("\n");
        await client.channels.cache.get(config.logs).send(content);
    }
    return;
}, 5000);

readdirSync(join(__dirname, './events')).filter(x => x.endsWith('.js')).forEach(file => {
    let event = require(`./events/${file}`);
    client.on(event.event, event.exec);
    client.events.set(event.name, event);
});

readdirSync(join(__dirname, './functions')).filter(x => x.endsWith('.js')).forEach(file => {
    let func = require(`./functions/${file}`);
    client.functions.set(func.name, func);
});

readdirSync(join(__dirname, './commands')).filter(x => x.endsWith('.js')).forEach(file => {
    let command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
});

readdirSync(join(__dirname, './interactions')).filter(x => x.endsWith('.js')).forEach(file => {
    let interaction = require(`./interactions/${file}`);
    client.interactions.set(interaction.name, interaction);
});

setTimeout(() => {
    client.login(process.env.DISCORD_TOKEN);
}, 3000);

Discord.BaseChannel.prototype.getdb = async function () {
    // console.log(client.db);
    try {
        var channelData = this.client.db.cache.channel.find(data => data.channelId == this.id);
    } catch (error) {
        var channelData = await this.client.db.models.channel.findOne({
            channelId: this.id
        });
    }
    // var channelData = await this.client.db.channel.findOne({
    //     channelId: this.id
    // });
    if (!channelData) {
        channelData = new client.db.channel({
            channelId: this.id
        });
    }
    return channelData;
};

Discord.BaseChannel.prototype.setdb = async function (data) {
    var channelData = await this.client.db.channel.findOne({
        channelId: this.id
    });
    if (!channelData) {
        var dataSave = data;
        dataSave["channelId"] = this.id;
        return await (new client.db.channel(dataSave)).save();
    } else {
        return await client.db.channel.findOneAndUpdate({ channelId: this.id }, data);
    }
};

Discord.Guild.prototype.getdb = async function () {
    try {
        var guildData = this.client.db.cache.guild.find(data => data.guildId == this.id);
    } catch (error) {
        var guildData = await this.client.db.models.guild.findOne({
            guildId: this.id
        });
    }
    // var guildData = await this.client.db.guild.findOne({
    //     guildId: this.id
    // });
    if (!guildData) {
        guildData = new client.db.guild({
            guildId: this.id
        });
    }
    return guildData;
};

Discord.Guild.prototype.setdb = async function (data) {
    var guildData = await this.client.db.guild.findOne({
        guildId: this.id
    });
    if (!guildData) {
        var dataSave = data;
        dataSave["guildId"] = this.id;
        return await (new client.db.guild(dataSave)).save();
    } else {
        return await client.db.guild.findOneAndUpdate({ guildId: this.id }, data);
    }
};
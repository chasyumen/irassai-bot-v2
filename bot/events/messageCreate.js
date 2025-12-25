module.exports = {
    name: "messageCreate",
    event: "messageCreate",
    exec: async function (message) {
        if (message.author.bot) return;
        if (!(message.channel.type == "0")) {
            return;
        }
        // var channelData = await message.channel.getdb();
        // if (channelData.autoReply) {
        //     if (!message.channel.permissionsFor((await message.guild.members.fetchMe())).has([1 << 10, 1 << 11])) return;
        //     if (message.content.match(/いらっさい/)) {
        //         message.reply("いらっさい");
        //     } else if (message.content.match(/いってらっさい/)) {
        //         message.reply("いってらっさい");
        //     }
        // }
    }
}
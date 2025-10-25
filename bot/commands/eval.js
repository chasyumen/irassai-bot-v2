const Util = require("util");
const { inspect } = Util;

module.exports = {
    name: "eval",
    description: "Bot管理者専用のコマンドです。",
    category: "config",
    isServerAdminOnly: false,
    isGlobalAdminOnly: true,
    slashOptions: {
        options: [
            {name: "code", description: "code", type: 3, required: true, options: []},
        ]
    },
    exec: async function (interaction, i, res) {
        await res.defer();
        if (interaction.options.getString("code")) {
            try {
                const code = interaction.options.getString("code");//info.option.split("```")[1];
                let evaled = eval(code);
        
                if (typeof evaled !== "string") evaled = inspect(evaled);
                if (evaled == "") {
                    evaled = null
                }
                if (evaled.length < 1992) {
                    var msg = `\`\`\`xl\n${evaled}\`\`\``;
                } else {
                    var msg = `\`\`\`xl\n${evaled.slice(0, 1961)} ... (More ${evaled.slice(1961).length} characters)\`\`\``;
                }
                var sentmsg = await res.reply({ embeds: [{ color: config.default_color, description: msg }] });
                // if (message.guild.ownerId !== message.author.id) {
                //     // setTimeout(() => {
                //         // sentmsg.delete()
                //     // }, 10000);
                // }
                // i.user.send({ embeds: [{ color: config.colors.default_color, description: msg }] });
                return true;
            } catch (err) {
                // if (message.guild.ownerId == message.author.id) {
                var msg = await res.reply({
                    embeds: [{
                        title: "Failed",
                        description: "Error:\n```xl\n" + inspect(err) + "```",
                        color: config.colors.error_color,
                        timestamp: new Date()
                    }]
                });
                // }
                // if (message.guild.ownerId !== message.author.id) {
                    // setTimeout(() => {
                        // msg.delete()
                    // }, 10000)
                // }
                // message.author.send({
                //     embeds: [{
                //         title: "Failed",
                //         description: "Error:\n```xl\n" + inspect(err) + "```",
                //         color: config.colors.error_color,
                //         timestamp: new Date()
                //     }]
                // });
                return true;
            }
        }
    }
}
const { PermissionFlagsBits } = require("discord.js");

module.exports = {
    name: "guildMemberAdd",
    event: "guildMemberAdd",
    exec: async function (member) {
        if (member.guild.available) {
            var serverData = await member.guild.getdb();
            // console.log(serverData);
            let user = member.user;
            if (member.partial) {
                user = await client.users.fetch(member.id);
            }
            if (!serverData.memberJoinNotify) {
                var logString = `GUILD: \`${member.guild.name} (ID:${member.guild.id})\`, MEMBER: \`${user.tag} (ID:${user.id})\`, NOTIFY: \`DISABLED\``;

                client.emit("addLogQueue", "MEMBER", "JOIN", new Date(), logString);
                return;
            }

            if (serverData.memberJoinNotifyChannel) {
                var channel = member.guild.channels.cache.get(serverData.memberJoinNotifyChannel);
            } else {
                var channel = member.guild.systemChannel ?? null;
            }
            var userDisplayname = client.functions.get("usernameFormat").run(user)
            // console.log(channel);
            if (!channel) {
                var logString = `GUILD: \`${member.guild.name} (ID:${member.guild.id})\`, MEMBER: \`${userDisplayname} (ID:${user.id})\`, NOTIFY: \`CHANNEL_NOT_FOUND\``;

                client.emit("addLogQueue", "MEMBER", "JOIN", new Date(), logString);
                return;
            }

            if (!channel.isTextBased() && !channel.isDMBased()) {
                var logString = `GUILD: \`${member.guild.name} (ID:${member.guild.id})\`, MEMBER: \`${userDisplayname} (ID:${user.id})\`, NOTIFY: \`INVALID_CHANNEL_TYPE\``;
                client.emit("addLogQueue", "MEMBER", "JOIN", new Date(), logString);
                return;
            }

            if (!channel.permissionsFor(member.guild.members.me).has([PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel])) {
                var logString = `GUILD: \`${member.guild.name} (ID:${member.guild.id})\`, MEMBER: \`${userDisplayname} (ID:${user.id})\`, NOTIFY: \`NO_PERMISSION\``;
                client.emit("addLogQueue", "MEMBER", "JOIN", new Date(), logString);
                return;
            }

            try {
                if (serverData.memberJoinNotifyType == "embed") {
                    await channel.send({
                        embeds: [{
                            title: `${user.displayName}さん!! いらっさい!!`,
                            color: config.colors.default_color,
                            description: `${user.displayName}${user.displayName == user.username ? `` : ` (${user.username})`}さんが${member.guild.name}に参加しました！`,
                            thumbnail: {
                                url: user.avatarURL({ dynamic: true }) ?? user.defaultAvatarURL
                            }
                        }]
                    });
                } else {
                    await channel.send(`${userDisplayname}さん!! いらっさい!!`);
                }

                var logString = `GUILD: \`${member.guild.name} (ID:${member.guild.id})\`, MEMBER: \`${userDisplayname} (ID:${user.id})\`, NOTIFY: \`ENABLED\``;

                client.emit("addLogQueue", "MEMBER", "JOIN", new Date(), logString);
                return;
            } catch {
                var logString = `GUILD: \`${member.guild.name} (ID:${member.guild.id})\`, MEMBER: \`${userDisplayname} (ID:${user.id})\`, NOTIFY: \`FAILED\``;

                client.emit("addLogQueue", "MEMBER", "JOIN", new Date(), logString);
                return;
            }
        }
    }
}
module.exports = {
    name: "welcome_member",
    description: "メンバー参加通知の設定をします。",
    category: "config",
    isServerAdminOnly: true,
    isGlobalAdminOnly: false,
    slashOptions: {
        options: [
            {name: "view", description: "設定を確認します", type: 1, options: []},
            {name: "on", description: "メンバー参加通知を有効化します", type: 1, options: []},
            {name: "off", description: "メンバー参加通知を無効化します", type: 1, options: []},
            {name: "set_channel", description: "チャンネルをセットします。", type: 1, options: [ { "name": "channel", "description": "チャンネル", "type": 7, "required": true }]},
            {name: "type", description: "チャンネルをセットします。", type: 1, options: [ { "name": "type", "description": "参加メッセージの種類", "type": 3, "choices": [{"name": "テキスト", "value": "text"}, {"name": "埋め込み", "value": "embed"}], "required": true }]},
        ]
    },
    exec: async function (interaction, i, res) {
        await res.defer();
        // console.log(await i.guild.getdb());
        if (interaction.options.getSubcommand() == "view") {
            let conf_data = await i.guild.getdb();
            var fieldArray = new Array({
                    "name": "機能を利用する (有効/無効)",
                    "value": conf_data.memberJoinNotify ? "有効" : "無効",
                    "inline": true
                });
            // if (conf_data.memberJoinNotify == true) {
                fieldArray.push({
                    "name": "チャンネル",
                    "value": conf_data.memberJoinNotifyChannel !== null ? 
                    `<#${conf_data.memberJoinNotifyChannel}> \n(ID: \`${conf_data.memberJoinNotifyChannel}\`)` : 
                    "未登録",
                    "inline": true
                });
                fieldArray.push({
                    "name": "タイプ",
                    "value": `${conf_data.memberJoinNotifyType == "text" ? "テキスト" : conf_data.memberJoinNotifyType == "embed" ? "埋め込み" : null}`,
                    "inline": true
                });
            // }
            return await res.reply({embeds:[{
                title: "メンバー参加通知設定",
                color: config.default_color,
                fields: fieldArray
            }]});
        } else if (interaction.options.getSubcommand() == "on") {
            await i.guild.setdb({memberJoinNotify: true});
            return await res.reply("メンバー参加通知を有効にしました！");
        } else if (interaction.options.getSubcommand() == "off") {
            await i.guild.setdb({memberJoinNotify: false});
            return await res.reply("メンバー参加通知を無効にしました！");
        } else if (interaction.options.getSubcommand() == "set_channel") {
            var ch = interaction.options.getChannel("channel");
            if (ch.type == "0") {
                await interaction.guild.setdb({memberJoinNotifyChannel: ch.id});
                return await res.reply(`メンバー参加通知チャンネルを <#${ch.id}> に設定しました。`);
            } else {
                return await res.reply("指定されたチャンネルはテキストチャンネルではありません。");
            }
        } else if (interaction.options.getSubcommand() == "type") {
            var type = interaction.options.getString("type");
            if (type == "text" || type == "embed") {
                await interaction.guild.setdb({memberJoinNotifyType: type});
                return await res.reply(`メンバー参加通知の種類をを \`${type == "text" ? "テキスト" : type == "embed" ? "埋め込み" : null}\` に設定しました。`);
            } else {
                return await res.reply("指定されたオプションは無効です。");
            }
        }
    }
}
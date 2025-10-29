module.exports = {
    name: "ready",
    event: "clientReady",
    exec: async function () {
        console.log("[Bot] Bot ready");
        await this.application.commands.fetch();
        // await async2.eachSeries(client.application.commands.cache, async (cmd) => {
        //     var set = false;
        //     var command = client.commands.toJSON().find(x => x.name == cmd.name);
        //     if (!command) {
        //         await command.delete();
        //     }
        //     return true;
        // });
        await async2.eachSeries(client.commands.toJSON(), async (cmd) => {
            var set = false;
            var command = client.application.commands.cache.find(x => x.name == cmd.name);
            if (typeof command == "object") {
                if (cmd.description !== command.description) {
                    set = true;
                } else if (cmd.slashOptions.options.length !== command.options.length) {
                    set = true;
                }
            } else {
                set = true;
            }
            // console.log(command, "\n", set, "\n", cmd)

            var commandData = cmd.slashOptions;
            commandData["name"] = cmd.name;
            commandData["description"] = cmd.description;
            if (set) {
                if (command) {
                    await command.delete();
                }
                await client.application.commands.create(commandData);
            }
            return true;
        });
        
        client.isReady = true;
        var number = 0;
        setPresence();
        setInterval(setPresence, 10000);
        async function setPresence() {
            var presences = [
                { name: `${client.guilds.cache.size} サーバー`, type: 5 },
                { name: `新メンバー`, type: 3 },
                { name: `バージョン ${require("../../package.json").version}`, type: 0 },
                { name: `/help で、ヘルプを表示`, type: 0 },
            ]
            if (number >= (presences.length - 1)) {
                number = 0;
            } else {
                number++;
            }
            // console.log(presences[number])
            client.user.presence.set({
                activities: [presences[number]],
                status: "online"
            });
        }
    }
}
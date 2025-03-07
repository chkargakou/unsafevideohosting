const Discord = require("discord.js");
const bot = new Discord.Client();

bot.on("ready", async() => {
    const channel = await bot.guilds.cache.get("<guild id>").channels.cache.get("<channel id>");

    channel.send("<@&role id>" + "\n new audio uploaded: https://video.chrysa.eu/audio").then(() => { process.kill(0); });
});

const token = require("./secret.json").token;
bot.login(token);
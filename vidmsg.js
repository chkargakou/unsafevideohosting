const Discord = require("discord.js");
const bot = new Discord.Client();
const db = require("quick.db");

const lastNum = db.fetch("latestNum");
const file = db.fetch(`${lastNum}_fname`);

bot.on("ready", async () => {
   const channel = await bot.guilds.cache.get("<guild id>").channels.cache.get("<channel id>");

   channel.send("<@&role id>" + "\n new video uploaded: https://video.chrysa.eu/videos?v=" + file).then(() => { process.kill(0); });
});

const token = require("./secret.json").token;
bot.login(token);

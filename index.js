const Discord = require("discord.js");
const {MessageEmbed,MessageAttachment,Permissions} = require("discord.js");
const fs = require("fs");
const os = require("os");
const https = require("https");
const Database = require("better-sqlite3");
const htmlToImage = require("node-html-to-image");
// Files --------------
const botconfig = require("./botconfig.json");
const pConfig = require("./package.json");

const client = new Discord.Client({intents:["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS"]});

let prefix = botconfig.prefix;
let botver = pConfig.version;
let bothost = os.hostname(); // `Ares, Cluster 0, Shard 0`
let statuses = botconfig.statuses;

const date = new Date();

client.on("ready", () => {
	console.log(`Capitalist (${botver}) is online in ${client.guilds.cache.size} servers.`);
	client.user.setStatus("online");

	setInterval(function() {
		let status = statuses[Math.floor(Math.random() * statuses.length)];
		client.user.setActivity(status);
	}, 600000);

	let conDays = 0;
	setInterval(function() {
		if (date.getHours() === 2) {
			conDays++;
			console.log(`Capitalist (${botver}) in online in ${client.guilds.cache.size} servers and has been online for ${conDays} consecutive days.`);
		}
	}, 1800000);
});

client.on("messageCreate", (msg) => {
	if(!msg.author.bot) {
		// Config Handling
		const DB = new Database('capitalistDB.sqlite');
		let prefixQuery = DB.prepare(`SELECT prefix FROM 'GuildConfig' WHERE guildId = ${msg.guild.id}`);
		prefix = prefixQuery.get().prefix;
		DB.close();

		let author = msg.author;
		let messageArray = msg.content.split(" ");
		let cmd = messageArray[0].toLowerCase();
		let args = messageArray[1];
		let args2 = msg.content.split(" ").slice(2).join(" ");

		// Basic
		/*
		if (cmd === prefix + "help" || cmd === "%help") {
			if(!args) {
				msg.channel.send("No help menu specified");
				msg.channel.send("Please choose from the following 'Info or Game' ex: *help game");
			} else {
				switch(args.toLowerCase()) {
					case "info":

				}
			}
		}
		*/

		if (cmd === prefix + "botinfo" || cmd === prefix + "info") {
			msg.delete();
			let embed = new MessageEmbed()
			.setColor("#5F5CFF") // Find theme color
			.setAuthor(client.user.username, client.user.avatarURL())
			.addFields(
				{name: "Version", value: botver, inline: true},
  				{name: "Creator", value: "Syntaxis#5260", inline: true},
				{name: '\u200B', value: '\u200B'},
				{name: "Library", value: "discord.js", inline: true},
  				{name: "Hosted on", value: bothost, inline: true}
			);
			return msg.channel.send({embeds:[embed]});
		}

		if (cmd === prefix + "ping") {
			msg.channel.send("Pinging...").then(ping => {
  				let pingCalc = ping.createdTimestamp - msg.createdTimestamp;
  				ping.delete();
  				msg.channel.send(`Pong!(${pingCalc}ms)`);
  			});
		}

		if (cmd === prefix + "prefix") {
  			msg.delete();
  			msg.channel.send(`This server's prefix is ${prefix}`);
  		}

  		// Game

	}
});

client.on("guildCreate", guild => {
	const DB = new Database('capitalistDB.sqlite');
		let sql = DB.prepare(`INSERT OR IGNORE INTO GuildConfig (guildId) VALUES (${guild.id});`);
		sql.run();
	DB.close();
});

client.on("guildDelete", guild => {
	const DB = new Database('capitalistDB.sqlite');
		const deleteQuery = DB.prepare(`DELETE FROM GuildConfig WHERE guildId = ${guild.id}`);
		deleteQuery.run();
	DB.close();
});

client.login(botconfig.token);
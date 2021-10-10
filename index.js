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
  		if (cmd === prefix + "start") {
  			msg.delete();
  			const filter = m => m.author.id === author.id;
  			msg.channel.send(`Hello ${author}, thank you for your interest in Capitalist! Before we get started I need you to answer a few questions! What type of business would you like to start? (Retail, Gas Station, Restraurant`);

  			let businessType;
  			let businessName;
  
  			msg.channel.awaitMessages({filter, max: 1, time:10000, errors:["time"]}).then(collected => {
  				collected = collected.first().content;
  				if (collected.toLowerCase() === "retail") {
  					businessType = "retail";
  				} else if (collected.toLowerCase() === "gas station") {
  					businessType = "gas station";
  				} else if (collected.toLowerCase() === "restraurant") {
  					businessType = "restraurant";
  				} else {
  					msg.channel.send("That is not a valid business type right now. Maybe later ;)");
  				}
  				if (collected.toLowerCase() === "retail" || collected.toLowerCase() === "gas station" || collected.toLowerCase() === "restraurant") {
  					msg.channel.send(`Alright what would you like to call your brand new ${collected}?`);
  					msg.channel.awaitMessages({filter, max: 1, time:10000, errors:["time"]}).then(collected1 => {
  						collected1 = collected1.first().content;
						
  						if (collected1.length < 15) {
  							msg.channel.send(`You named your ${collected} business ${collected1}`);
  							businessName = collected1;

							const DB1 = new Database('capitalistDB.sqlite');
  							let profileCreate = DB1.prepare(`INSERT OR IGNORE INTO Profiles (username, businessType, businessName) VALUES ('${author.username}','${businessType}','${businessName}');`);
  							profileCreate.run();
  							DB1.close();
  						} else {
  							msg.channel.send(`Please pick a name under 15 characters`);
  						}
  					}).catch(collected1 => {console.log(collected1);msg.channel.send(`${author} you didn't select a name! Please use %start to try again`)})
  				}
  			}).catch(collected => {
  				msg.channel.send(`${author} it seems you did not select a business type. Your choices are Retail, Gas Station, Restraurant`);
  			});
  		}
  		DB.close();
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
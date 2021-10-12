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
  							
  							let profileCreate = DB1.prepare(`INSERT OR IGNORE INTO Profiles (userId, username, businessType, businessName) VALUES ('${author.id}','${author.username}','${businessType}','${businessName}');`);
  							profileCreate.run();
  							let upgradeCreate = DB1.prepare(`CREATE TABLE '${msg.guild.id}.${author.id}.upgrades' (upgradeId INT PRIMARY KEY UNIQUE NOT NULL, name STRING NOT NULL);`);
  							upgradeCreate.run();

  							switch(collected) {
  								case "retail":
  									return DB1.prepare(`CREATE TABLE '${msg.guild.id}.${author.id}.businessProfile' (username STRING PRIMARY KEY NOT NULL, businessType STRING NOT NULL, gasPump INT NOT NULL DEFAULT (0), parkingLot INT NOT NULL DEFAULT (0), shelf INT DEFAULT (0) NOT NULL, cashier INT DEFAULT (0) NOT NULL, slushee INT DEFAULT (0) NOT NULL, bathrooms INT DEFAULT (0) NOT NULL, amenities INT NOT NULL DEFAULT (0), electric INT DEFAULT (0) NOT NULL);`).run();
  									break;
  								case "gas station":
  									// return
  									break;
  								case "restraurant":
  									// return
  									break;
  							}
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

  		if (cmd === prefix + "work") {
  			const DB = new Database('capitalistDB.sqlite');
  			let moneyGive = Math.random() * (3.75 - 0.50) + 0.1;
  			let businessType = DB.prepare(`SELECT businessType from 'Profiles' WHERE userId = '${author.id}'`).get().businessType;
  			let originalMoney = DB.prepare(`SELECT money from 'Profiles' WHERE userId = '${author.id}'`).get().money;
  			let unlockedQuery = DB.prepare(`SELECT * FROM '${msg.guild.id}.${author.id}.upgrades'`);
  			
  			let upgradeIds = [];
  			unlockedQuery.all().forEach(id => {
  				upgradeIds.push(id.upgradeId);
  			});
  			// Math.floor(i * 100) / 100)
  			let effects = [];
  			upgradeIds.forEach(id => {
  				let effectQuery =  DB.prepare(`SELECT effect FROM '${businessType}.upgrades' WHERE upgradeId = ${id}`).get().effect;
  				effects.push(effectQuery);
  			});
  			
  			effects.forEach(effect => {
  				let effectArray = effect.split(",");
  				let effectGive = Math.random() * (effectArray[1] - effectArray[0]) + 0.1;
  				moneyGive += effectGive;
  			});
  			let newAmount = Math.floor(moneyGive*100)/100;
  			moneyGive = Math.floor(moneyGive*100)/100 + originalMoney;
  			let moneyUpdate = DB.prepare(`UPDATE 'Profiles' SET money = ${moneyGive} WHERE userId = ${author.id};`).run();
  			DB.close();
  			msg.channel.send(`You worked for 1 hour and earned $${newAmount} bringing your new total to $${Math.floor(moneyGive*100)/100}`);
  		}

  		if (cmd === prefix + "shop") {
  			const DB = new Database('capitalistDB.sqlite');
  			let userProfile;
  			let userUpgrades = [];
  			
  			try {
  				const userProfileQuery = DB.prepare(`SELECT * FROM 'Profiles' WHERE userId = ${author.id}`).get();
  				let userUpgradesQuery = DB.prepare(`SELECT * FROM '${msg.guild.id}.${author.id}.upgrades'`).all();
  				userProfile = userProfileQuery;
  				userUpgrades = userUpgradesQuery;
  			} catch(err) {
  				if (err) {
  					msg.channel.send(`There was a database error. If you haven't made a profile you can make one by typing ${prefix}start!`);
  				}
  			}

  			if (userUpgrades.length >= 1) {
  				let unlockableUpgrades = DB.prepare(`SELECT * FROM '${userProfile.businessType}.upgrades' WHERE name LIKE '%${'Gas Pump'}%'`).all();
  				console.log(unlockableUpgrades);
  			} else {
  				let unlockableUpgrades = DB.prepare(`SELECT * FROM '${userProfile.businessType}.upgrades' WHERE name LIKE '%1%'`).all();
  				console.log(unlockableUpgrades);
  				const shopEmbed = new Discord.MessageEmbed()
    			.setTitle(`${userProfile.username}'s Shop`)
   		 		.setColor("#47e59c");
  				unlockableUpgrades.forEach(async array => {
   					shopEmbed.addFields({ name: `Id ${array.upgradeId}) ${array.name}`, value: `Effect: ${array.effect}, Cost: $${array.cost}` });
  				});
  				setTimeout(function() {
  					return msg.channel.send({embeds:[shopEmbed]});
				}, 3000);
  			}
  			/*
  			switch(userProfile.get().businessType) {
  				case "retail":
  					let embed0 = new MessageEmbed()
  					.setColor("#605cfc")
  					.setTitle(`${userProfile.username}'s Shop`)

  				return "not";
  				break;
  			}

  			const shopEmbed = new Discord.MessageEmbed()
    		.setTitle(`${msg.guild.name} XP Leaderboard!`)
   		 	.setColor("#47e59c");
  			sql.forEach(async user => {
   				embed.addFields({ name: `${number}) ${user.username}`, value: `${user.xp} xp (level ${user.level})` });
   				number++;
  			});
  			setTimeout(function() {
  				return msg.channel.send({embeds:[shopEmbed]});
			}, 5000);
			*/
			DB.close();
  		}
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

function gasPumpAlg(level) {
	if (level > 5) {
		return "Invalid";
	} else {
    	let gasPumpAlg = (level) + level*1000*(1.6667**level);
    	return gasPumpAlg;
	}
}

function shelfAlg(level) {
	if (level > 8) {
		return "Invalid";
	} else {
    	let shelfAlg = (level) + level*1500*(1.347**level);
    	return shelfAlg;
	}
}

function cashierAlg(level) {
	if (level > 4) {
		return "Invalid";
	} else {
		let cashierAlg = (level) + level*891*(1.347**level);
    	return cashierAlg;
	}
}

function bathroomAlg(level) {
    let bathroomAlg = (level) + level*5000*(1.25**level);
    return bathroomAlg;
}

function amenitiesAlg(level) {
    let amenitiesAlg = (level) + level*6000*(1.55**level);
    return amenitiesAlg;
}

function electricAlg(level) {
    let electricAlg = (level) + level*10000*(1.8**level);
    return electricAlg;
}

client.login(botconfig.token);
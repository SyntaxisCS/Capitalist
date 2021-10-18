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
						break;
					case "game":
						break;
				}
			}
		}
		*/

		if (cmd === prefix + "botinfo" || cmd === prefix + "info") {
			msg.delete();
			let embed = new MessageEmbed()
			.setColor("#e54d47") // Find theme color
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
  							msg.channel.send(`Trying to create your new ${collected} business named ${collected1}`);
  							setTimeout(() => {
  								msg.channel.send("If no error message showed up then it worked!");
  							}, 6000);
  							businessName = collected1;

  							const DB1 = new Database('capitalistDB.sqlite');
  							
  							let profileCreate = DB1.prepare(`INSERT OR IGNORE INTO Profiles (userId, username, businessType, businessName) VALUES ('${author.id}','${author.username}','${businessType}','${businessName}');`);
  							profileCreate.run();
  							let upgradeCreate = DB1.prepare(`CREATE TABLE '${msg.guild.id}.${author.id}.upgrades' (upgradeId INT PRIMARY KEY UNIQUE NOT NULL, name STRING NOT NULL);`);
  							upgradeCreate.run();

  							switch(collected) {
  								case "retail":
  									return DB1.prepare(`INSERT OR IGNORE INTO '${collected}.businessProfile' (userId) VALUES ('${author.id}')`).run();
  									break;
  								case "gas station":
  									return DB1.prepare(`INSERT OR IGNORE INTO '${collected}.businessProfile' (userId) VALUES ('${author.id}')`).run();
  									break;
  								case "restraurant":
  									return DB1.prepare(`INSERT OR IGNORE INTO '${collected}.businessProfile' (userId) VALUES ('${author.id}')`).run();
  									break;
  							}
  							DB1.close();
  						} else {
  							msg.channel.send(`Please pick a name under 15 characters`);
  						}
  					}).catch(collected1 => {
  						if (collected1.toString().includes("SqliteError")) {
  							msg.channel.send(`${author} you already have a profile!`);
  						} else {
  							msg.channel.send(`${author} you didn't select a name! Please use %start to try again`);
  						}
  					});
  				}
  			}).catch(collected => {
  				msg.channel.send(`${author} it seems you did not select a business type. Your choices are Retail, Gas Station, Restraurant`);
  			});
  		}

  		if (cmd === prefix + "work") {
  			try {
  				const DB = new Database('capitalistDB.sqlite');
  				// let moneyGive = Math.random() * (3.75 - 0.50) + 0.1;
  				let moneyGive = Math.random() * (10.75 - 2.50) + 0.1;

  				let businessType = DB.prepare(`SELECT businessType from 'Profiles' WHERE userId = '${author.id}'`).get().businessType;
  				let originalMoney = DB.prepare(`SELECT money from 'Profiles' WHERE userId = '${author.id}'`).get().money;
  				let unlockedQuery = DB.prepare(`SELECT * FROM '${msg.guild.id}.${author.id}.upgrades'`);
  			
  				let upgradeIds = [];
  				unlockedQuery.all().forEach(id => {
  					upgradeIds.push(id.upgradeId);
  				});

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
  			} catch(err) {
  				msg.channel.send(`There was a database error. If you haven't made a profile you can make one by typing ${prefix}start!`);
  			}
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

  				let unlockableUpgrades;
  				try {
  					let unlockableUpgradesQuery = DB.prepare(`SELECT * FROM '${userProfile.businessType}.businessProfile' WHERE userId = '${userProfile.userId}'`).get();
  					unlockableUpgrades = unlockableUpgradesQuery
  				} catch(err) {
  					msg.channels.send("There was a database error.");
  					console.log(`Error: ${err}`);
  				}

  				switch(userProfile.businessType) {
  					case "retail":
  						let checkOut = unlockableUpgrades.checkOut + 1;
  						let aisle = unlockableUpgrades.aisle + 1;
  						let departments = unlockableUpgrades.departments + 1;
  						let retailParkingLot = unlockableUpgrades.parkingLot + 1;
  						let pharmacy = unlockableUpgrades.pharmacy + 1;
  						let shopping = unlockableUpgrades.shopping + 1;
  						let logistical = unlockableUpgrades.logistical + 1;

  						let retailUpgrades = [];
  						if (checkOut <= 8) {
  							retailUpgrades.push(`${checkOut}:CheckOut`);
  						}
  						if (aisle <= 5) {
  							retailUpgrades.push(`${aisle}:Aisle`);
  						}
  						if (departments <= 3) {
  							retailUpgrades.push(`${departments}:Departments`);
  						}
  						if (retailParkingLot <= 4) {
  							retailUpgrades.push(`${retailParkingLot}:Parking Lots`);
  						}
  						if (pharmacy <= 4) {
  							retailUpgrades.push(`${pharmacy}:Pharmacy`);
  						}
  						if (shopping <= 7) {
  							retailUpgrades.push(`${shopping}:Shopping`);
  						}
  						if (logistical <= 5) {
  							retailUpgrades.push(`${logistical}:Logistical`);
  						}

  						let retailNewUpgrades = [];
  						if (retailUpgrades.length >= 1) {
  							retailUpgrades.forEach(upgrade => {
  								if (upgrade === "Invalid") {return} else {
  									let newUpgrade = DB.prepare(`SELECT * FROM '${userProfile.businessType}.upgrades' WHERE name LIKE '%${upgrade}%'`).get();
  									retailNewUpgrades.push(newUpgrade);
  								}
  							});
  						}
  						if (retailNewUpgrades.length >= 1) {
  							const shopEmbed = new Discord.MessageEmbed()
    						.setTitle(`${userProfile.username}'s Shop`)
   		 					.setColor("#47e59c");
  							retailNewUpgrades.forEach(async array => {
   								shopEmbed.addFields({ name: `${array.name}`, value: `Effect: ${array.effect}, Cost: $${array.cost}` });
   								// shopEmbed.addFields({ name: `Id ${array.upgradeId}) ${array.name}`, value: `Effect: ${array.effect}, Cost: $${array.cost}` });
  							});
  							setTimeout(function() {
  								return msg.channel.send({embeds:[shopEmbed]});
							}, 3000);
  						} else {
  							return msg.channel.send(`You have unlocked everything!`);
  						}
  						break;
  					case "gas station":
  						// New Levels
  						let gasPump = unlockableUpgrades.gasPump + 1;
  						let gasParkingLot = unlockableUpgrades.parkingLot + 1;
  						let shelf = unlockableUpgrades.shelf + 1;
  						let cashier = unlockableUpgrades.cashier + 1;
  						let slushee = unlockableUpgrades.slushee + 1;
  						let bathrooms = unlockableUpgrades.bathrooms + 1;
  						let amenities = unlockableUpgrades.amenities + 1;
  						let electric = unlockableUpgrades.electric + 1;

  						let gasUpgrades = [];
  						if (gasPump <= 8) {
  							gasUpgrades.push(`${gasPump}:Gas Pump`);
  						}
  						if (gasParkingLot <= 4) {
  							gasUpgrades.push(`${gasParkingLot}:Parking Lot`);
  						}
  						if (shelf <= 5) {
  							gasUpgrades.push(`${shelf}:Shelf`);
  						}
  						if (cashier <= 5) {
  							gasUpgrades.push(`${cashier}:Cashier`);
  						}
  						if (slushee <= 1) {
  							gasUpgrades.push(`${slushee}:Slushee`);
  						}
  						if (bathrooms <= 5) {
  							gasUpgrades.push(`${bathrooms}:Bathrooms`);
  						}
  						if (amenities <= 5) {
  							gasUpgrades.push(`${amenities}:Amenities`);
  						}
  						if (electric <= 4) {
  							gasUpgrades.push(`${electric}:Electric`);
  						}

  						let gasNewUpgrades = [];
  						if (gasUpgrades.length >= 1) {
  							gasUpgrades.forEach(upgrade => {
  								if (upgrade === "Invalid") {return} else {
  									let newUpgrade = DB.prepare(`SELECT * FROM '${userProfile.businessType}.upgrades' WHERE name LIKE '%${upgrade}%'`).get();
  									gasNewUpgrades.push(newUpgrade);
  								}
  							});
  						}
  						if (gasNewUpgrades.length >= 1) {
  							const shopEmbed = new Discord.MessageEmbed()
    						.setTitle(`${userProfile.username}'s Shop`)
   		 					.setColor("#47e59c");
  							gasNewUpgrades.forEach(async array => {
   								shopEmbed.addFields({ name: `${array.name}`, value: `Effect: ${array.effect}, Cost: $${array.cost}` });
   								// shopEmbed.addFields({ name: `Id ${array.upgradeId}) ${array.name}`, value: `Effect: ${array.effect}, Cost: $${array.cost}` });
  							});
  							setTimeout(function() {
  								return msg.channel.send({embeds:[shopEmbed]});
							}, 3000);
  						} else {
  							return msg.channel.send(`You have unlocked everything!`);
  						}
  						break;
  					case "restraurant":
  						break;
  				}
			DB.close();
  		}

  		if (cmd === prefix + "profile") {
  			msg.channel.send("Creating your profile card now...").then( async orig => {
  				try {
  					const DB = new Database('capitalistDB.sqlite');
  					const userProfile = DB.prepare(`SELECT * FROM 'Profiles' WHERE userId = ${author.id}`).get();
  					let maxUpgrade = "error";
  					if (userProfile.businessType === "retail") {
  						maxUpgrade = "36";
  					} else if ("gas station") {
  						maxUpgrade = "37";
  					}

  					let profileCard = `<!DOCTYPE html> <html> <meta charset="UTF-8" /> <meta name="viewport" content="width=device-width, initial-scale=1.0" /> <meta http-equiv="X-UA-Compatible" content="ie=edge" /> <head> <style> body { margin: 0; padding: 0px; max-width: 450px; max-height: 350px; background-color: #1f1f1f; } .card { color: #fff; display: flex; max-width: 450px; max-height: 350px; font-family: "Segoe UI", sans-serif; } .leftWrapper { margin: 0; width: 35%; padding: 35px 20px; text-align: center; background-color: #e53d47; } .leftWrapper img { border-radius: 20px; } .leftWrapper p { font-size: 13px } .rightWrapper { margin: 0; width: 65%; float: left; padding: 30px 25px; background-color: #1f1f1f; } .rightWrapper h3 { text-transform: uppercase; border-bottom: 1px solid #e0e0e0; } .data { display: flex; font-size: 14px; justify-content: space-between; } .packet { width: 45%; float: left; margin-bottom: 5px; } .packet h4 { font-weight: 500px; color: #d9d9d9; } .packet p { color: #8d8d8d; } </style> </head> <body> <div class="card"> <div class="leftWrapper"> <img width="100" src="https://cdn.discordapp.com/avatars/${author.id}/${author.avatar}.webp"> <h3>${author.username}</h3> <p>GuildName</p> </div> <div class="rightWrapper"> <h3 style="margin-top:0;padding-top:0">Business Info</h3> <div class="data"> <div class="packet"> <h4>Type</h4> <p>${userProfile.businessType.charAt(0).toUpperCase()+userProfile.businessType.slice(1)}</p> </div> <div class="packet"> <h4>Name</h4> <p>${userProfile.businessName}</p> </div> </div> <h3>Business Stats</h3> <div class="data"> <div class="packet"> <h4>Money</h4> <p>$${userProfile.money}</p> </div> <div class="packet"> <h4>Upgrades</h4> <p>${userProfile.upgrades} of ${maxUpgrade}</p></div></div></div></div><body></html>`;

  						let profileImage = await htmlToImage({
  							html: profileCard,
							quality: 100,
							type: "png",
							puppeteerArgs: {
								args: ["--no-sandbox"],
							},
							encoding: "buffer"
  						});
  					
  					let attachment = new MessageAttachment(profileImage, `${author.id}.png`);
  					msg.channel.send({files: [attachment]});
  					orig.delete();
  					
  					DB.close();
  				} catch(err) {
  					console.log(err);
  					orig.delete();
  					if (err.toString().includes("undefined")) {
  						msg.channel.send(`${author} you don't have a profile!`);
  					} else {
  						msg.channel.send(`${author} I couldn't create your profile card!`);
  					}
  				}
  			});
  		}

  		if (cmd === prefix + "buy") {
  			const DB = new Database('capitalistDB.sqlite');
  			if(!args) {
  				msg.channel.send("You didn't select anything to buy!");
  			} else {
  				let userProfile;
  				let businessProfile;
  				try {
  					 let userProfileQuery = DB.prepare(`SELECT * FROM 'Profiles' WHERE userId = ${author.id}`).get();
  					 let businessProfileQuery = DB.prepare(`SELECT * FROM '${userProfileQuery.businessType}.businessProfile' WHERE userId = '${userProfileQuery.userId}'`).get();

  					 userProfile = userProfileQuery;
  					 businessProfile = businessProfileQuery;
  				} catch(err) {
  					console.log(err);
  					msg.channel.send("There was a database error.");
  				}
  				if (isNaN(args)) {
  					if (args.includes(":")) {
  						// Max level checker
  						let split = args.split(":");
  						if (!userProfile || !businessProfile) {
  							msg.channel.send("You do not have a profile!");
  						} else {
  							if (userProfile.businessType === "gas station") {
  							if (split[1].toLowerCase() === "gas") {
  								if (split[0] > 8 || split[0] < 0) {
  									msg.channel.send("The max level for the Gas Pump upgrade tree is **8**");
  								} else {
  									if (split[0] <= businessProfile.gasPump) {
  										msg.channel.send(`You have unlocked this upgrade already! You are Gas Pump level **${businessProfile.gasPump}**`);
  									} else {
  										try {
  											let upgradeFind = DB.prepare(`SELECT * FROM '${userProfile.businessType}.upgrades' WHERE name LIKE '%${args}%'`).get();
  											if (split[0] === `${businessProfile.gasPump+1}`) {
  												
  												if (userProfile.money >= upgradeFind.cost) {
  													let moneyGive = userProfile.money - upgradeFind.cost;
  													let businessUpdate = DB.prepare(`UPDATE '${userProfile.businessType}.businessProfile' SET gasPump = '${split[0]}'`).run();

  													let userUpgrades = DB.prepare(`INSERT OR IGNORE INTO '${msg.guild.id}.${author.id}.upgrades' (upgradeId, name) VALUES ('${upgradeFind.upgradeId}','${upgradeFind.name}');`).run();
  													let moneyUpdate = DB.prepare(`UPDATE 'Profiles' SET money = ${Math.floor(moneyGive*100)/100} WHERE userId = ${author.id};`).run();
  													let upgradeQuery = DB.prepare(`SELECT upgrades FROM 'Profiles' WHERE userId = ${author.id}`).get();
  													let upgradeUpdate = DB.prepare(`UPDATE 'Profiles' SET upgrades = ${upgradeQuery.upgrades+1} WHERE userId = ${author.id};`).run();
  													msg.channel.send(`You have succesfully bought the upgrade **${upgradeFind.name}** for $${upgradeFind.cost}. Your new bank account balance is $${Math.floor(moneyGive*100)/100}.`);
  												} else {
  													msg.channel.send(`You do not have enough money to buy **${upgradeFind.name}**!`);
  												}

  											} else {
  												msg.channel.send("You have not unlocked the previous upgrades yet!");
  											}
  										} catch(err) {
  											console.log(err);
  											msg.channel.send("There was a database error.");
  										}
  									}
  								}
  							}
  							if (split[1].toLowerCase() === "parking") {
  								if (split[0] > 4 || split[0] < 0) {
  									msg.channel.send("The max level for the Parking Lot upgrade tree is **4**");
  								} else {
  									try {
  										
  										let upgradeFind = DB.prepare(`SELECT * FROM '${userProfile.businessType}.upgrades' WHERE name LIKE '%${args}%'`).get();

  										if (split[0] === `${businessProfile.parkingLot+1}`) {

  											if (userProfile.money >= upgradeFind.cost) {
  												let moneyGive = userProfile.money - upgradeFind.cost;
  												let businessUpdate = DB.prepare(`UPDATE '${userProfile.businessType}.businessProfile' SET parkingLot = '${split[0]}'`).run();

  												let userUpgrades = DB.prepare(`INSERT OR IGNORE INTO '${msg.guild.id}.${author.id}.upgrades' (upgradeId, name) VALUES ('${upgradeFind.upgradeId}','${upgradeFind.name}');`).run();
  												let moneyUpdate = DB.prepare(`UPDATE 'Profiles' SET money = ${Math.floor(moneyGive*100)/100} WHERE userId = ${author.id};`).run();
  												let upgradeQuery = DB.prepare(`SELECT upgrades FROM 'Profiles' WHERE userId = ${author.id}`).get();
  												let upgradeUpdate = DB.prepare(`UPDATE 'Profiles' SET upgrades = ${upgradeQuery.upgrades+1} WHERE userId = ${author.id};`).run();
  												msg.channel.send(`You have succesfully bought the upgrade **${upgradeFind.name}** for $${upgradeFind.cost}. Your new bank account balance is $${Math.floor(moneyGive*100)/100}.`);
  											} else {
  												msg.channel.send(`You do not have enough money to buy **${upgradeFind.name}**!`);
  											}
  										
  										} else {
  											msg.channel.send("You have not unlocked the previous upgrades yet!");
  										}
  									} catch(err) {
  										console.log(err);
  										msg.channel.send("There was a database error.");
  									}
  								}
  							}
  							if (split[1].toLowerCase() === "shelf") {
  								if (split[0] > 5 || split[0] < 0) {
  									msg.channel.send("The max level for the shelves upgrade tree is **5***");
  								} else {
  									try {
  										
  										let upgradeFind = DB.prepare(`SELECT * FROM '${userProfile.businessType}.upgrades' WHERE name LIKE '%${args}%'`).get();

  										if (split[0] === `${businessProfile.shelf+1}`) {

  											if (userProfile.money >= upgradeFind.cost) {
  												let moneyGive = userProfile.money - upgradeFind.cost;
  												let businessUpdate = DB.prepare(`UPDATE '${userProfile.businessType}.businessProfile' SET shelf = '${split[0]}'`).run();

  												let userUpgrades = DB.prepare(`INSERT OR IGNORE INTO '${msg.guild.id}.${author.id}.upgrades' (upgradeId, name) VALUES ('${upgradeFind.upgradeId}','${upgradeFind.name}');`).run();
  												let moneyUpdate = DB.prepare(`UPDATE 'Profiles' SET money = ${Math.floor(moneyGive*100)/100} WHERE userId = ${author.id};`).run();
  												let upgradeQuery = DB.prepare(`SELECT upgrades FROM 'Profiles' WHERE userId = ${author.id}`).get();
  												let upgradeUpdate = DB.prepare(`UPDATE 'Profiles' SET upgrades = ${upgradeQuery.upgrades+1} WHERE userId = ${author.id};`).run();
  												msg.channel.send(`You have succesfully bought the upgrade **${upgradeFind.name}** for $${upgradeFind.cost}. Your new bank account balance is $${Math.floor(moneyGive*100)/100}.`);
  											} else {
  												msg.channel.send(`You do not have enough money to buy **${upgradeFind.name}**!`);
  											}

  										} else {
  											msg.channel.send("You have not unlocked the previous upgrades yet!");
  										}
  									
  									} catch(err) {
  										console.log(err);
  										msg.channel.send("There was a database error.");
  									}
  								}
  							}
  							if (split[1].toLowerCase() === "cashier") {
  								if (split[0] > 5 || split[0] < 0) {
  									msg.channel.send("The max level for the cashier upgrade tree is **5**");
  								} else {
  									try {
  										
  										let upgradeFind = DB.prepare(`SELECT * FROM '${userProfile.businessType}.upgrades' WHERE name LIKE '%${args}%'`).get();

  										if (split[0] === `${businessProfile.cashier+1}`) {

  											if (userProfile.money >= upgradeFind.cost) {
  												let moneyGive = userProfile.money - upgradeFind.cost;
  												let businessUpdate = DB.prepare(`UPDATE '${userProfile.businessType}.businessProfile' SET cashier = '${split[0]}'`).run();

  												let userUpgrades = DB.prepare(`INSERT OR IGNORE INTO '${msg.guild.id}.${author.id}.upgrades' (upgradeId, name) VALUES ('${upgradeFind.upgradeId}','${upgradeFind.name}');`).run();
  												let moneyUpdate = DB.prepare(`UPDATE 'Profiles' SET money = ${Math.floor(moneyGive*100)/100} WHERE userId = ${author.id};`).run();
  												let upgradeQuery = DB.prepare(`SELECT upgrades FROM 'Profiles' WHERE userId = ${author.id}`).get();
  												let upgradeUpdate = DB.prepare(`UPDATE 'Profiles' SET upgrades = ${upgradeQuery.upgrades+1} WHERE userId = ${author.id};`).run();
  												msg.channel.send(`You have succesfully bought the upgrade **${upgradeFind.name}** for $${upgradeFind.cost}. Your new bank account balance is $${Math.floor(moneyGive*100)/100}.`);
  											} else {
  												msg.channel.send(`You do not have enough money to buy **${upgradeFind.name}**!`);
  											}

  										} else {
  											msg.channel.send("You have not unlocked the previous upgrades yet!");
  										}
  									
  									} catch(err) {
  										console.log(err);
  										msg.channel.send("There was a database error.");
  									}
  								}
  							}
  							if (split[1].toLowerCase() === "slushee") {
  								if (split[0] > 1 || split[0] < 0) {
  									msg.channel.send("The max level for the Slushee upgrade tree is **1**");
  								} else {
  									try {
  										
  										let upgradeFind = DB.prepare(`SELECT * FROM '${userProfile.businessType}.upgrades' WHERE name LIKE '%${args}%'`).get();

  										if (split[0] === `${businessProfile.slushee+1}`) {

  											if (userProfile.money >= upgradeFind.cost) {
  												let moneyGive = userProfile.money - upgradeFind.cost;
  												let businessUpdate = DB.prepare(`UPDATE '${userProfile.businessType}.businessProfile' SET slushee = '${split[0]}'`).run();

  												let userUpgrades = DB.prepare(`INSERT OR IGNORE INTO '${msg.guild.id}.${author.id}.upgrades' (upgradeId, name) VALUES ('${upgradeFind.upgradeId}','${upgradeFind.name}');`).run();
  												let moneyUpdate = DB.prepare(`UPDATE 'Profiles' SET money = ${Math.floor(moneyGive*100)/100} WHERE userId = ${author.id};`).run();
  												let upgradeQuery = DB.prepare(`SELECT upgrades FROM 'Profiles' WHERE userId = ${author.id}`).get();
  												let upgradeUpdate = DB.prepare(`UPDATE 'Profiles' SET upgrades = ${upgradeQuery.upgrades+1} WHERE userId = ${author.id};`).run();
  												msg.channel.send(`You have succesfully bought the upgrade **${upgradeFind.name}** for $${upgradeFind.cost}. Your new bank account balance is $${Math.floor(moneyGive*100)/100}.`);
  											} else {
  												msg.channel.send(`You do not have enough money to buy **${upgradeFind.name}**!`);
  											}

  										} else {
  											msg.channel.send("You have not unlocked the previous upgrades yet!");
  										}
  									
  									} catch(err) {
  										console.log(err);
  										msg.channel.send("There was a database error.");
  									}
  								}
  							}
  							if (split[1].toLowerCase() === "bathrooms") {
  								if (split[0] > 5 || split[0] < 0) {
  									msg.channel.send("The max level for the Bathroom upgrade tree is **5**");
  								} else {
  									try {
  										
  										let upgradeFind = DB.prepare(`SELECT * FROM '${userProfile.businessType}.upgrades' WHERE name LIKE '%${args}%'`).get();

  										if (split[0] === `${businessProfile.bathrooms+1}`) {

  											if (userProfile.money >= upgradeFind.cost) {
  												let moneyGive = userProfile.money - upgradeFind.cost;
  												let businessUpdate = DB.prepare(`UPDATE '${userProfile.businessType}.businessProfile' SET bathrooms = '${split[0]}'`).run();

  												let userUpgrades = DB.prepare(`INSERT OR IGNORE INTO '${msg.guild.id}.${author.id}.upgrades' (upgradeId, name) VALUES ('${upgradeFind.upgradeId}','${upgradeFind.name}');`).run();
  												let moneyUpdate = DB.prepare(`UPDATE 'Profiles' SET money = ${Math.floor(moneyGive*100)/100} WHERE userId = ${author.id};`).run();
  												let upgradeQuery = DB.prepare(`SELECT upgrades FROM 'Profiles' WHERE userId = ${author.id}`).get();
  												let upgradeUpdate = DB.prepare(`UPDATE 'Profiles' SET upgrades = ${upgradeQuery.upgrades+1} WHERE userId = ${author.id};`).run();
  												msg.channel.send(`You have succesfully bought the upgrade **${upgradeFind.name}** for $${upgradeFind.cost}. Your new bank account balance is $${Math.floor(moneyGive*100)/100}.`);
  											} else {
  												msg.channel.send(`You do not have enough money to buy **${upgradeFind.name}**!`);
  											}

  										} else {
  											msg.channel.send("You have not unlocked the previous upgrades yet!");
  										}
  									
  									} catch(err) {
  										console.log(err);
  										msg.channel.send("There was a database error.");
  									}
  								}
  							}
  							if (split[1].toLowerCase() === "amenities") {
  								if (split[0] > 5 || split[0] < 0) {
  									msg.channel.send("The max level for the Amenities upgrade tree is **5**");
  								} else {
  									try {
  										
  										let upgradeFind = DB.prepare(`SELECT * FROM '${userProfile.businessType}.upgrades' WHERE name LIKE '%${args}%'`).get();

  										if (split[0] === `${businessProfile.amenities+1}`) {

  											if (userProfile.money >= upgradeFind.cost) {
  												let moneyGive = userProfile.money - upgradeFind.cost;
  												let businessUpdate = DB.prepare(`UPDATE '${userProfile.businessType}.businessProfile' SET amenities = '${split[0]}'`).run();

  												let userUpgrades = DB.prepare(`INSERT OR IGNORE INTO '${msg.guild.id}.${author.id}.upgrades' (upgradeId, name) VALUES ('${upgradeFind.upgradeId}','${upgradeFind.name}');`).run();
  												let moneyUpdate = DB.prepare(`UPDATE 'Profiles' SET money = ${Math.floor(moneyGive*100)/100} WHERE userId = ${author.id};`).run();
  												let upgradeQuery = DB.prepare(`SELECT upgrades FROM 'Profiles' WHERE userId = ${author.id}`).get();
  												let upgradeUpdate = DB.prepare(`UPDATE 'Profiles' SET upgrades = ${upgradeQuery.upgrades+1} WHERE userId = ${author.id};`).run();
  												msg.channel.send(`You have succesfully bought the upgrade **${upgradeFind.name}** for $${upgradeFind.cost}. Your new bank account balance is $${Math.floor(moneyGive*100)/100}.`);
  											} else {
  												msg.channel.send(`You do not have enough money to buy **${upgradeFind.name}**!`);
  											}

  										} else {
  											msg.channel.send("You have not unlocked the previous upgrades yet!");
  										}
  									
  									} catch(err) {
  										console.log(err);
  										msg.channel.send("There was a database error.");
  									}
  								}
  							}
  							if (split[1].toLowerCase() === "electric") {
  								if (split[0] > 4 || split[0] < 0) {
  									msg.channel.send("The max level for the Electric Vehicle upgrade tree is **4**");
  								} else {
  									try {
  										
  										let upgradeFind = DB.prepare(`SELECT * FROM '${userProfile.businessType}.upgrades' WHERE name LIKE '%${args}%'`).get();

  										if (split[0] === `${businessProfile.electric+1}`) {

  											if (userProfile.money >= upgradeFind.cost) {
  												let moneyGive = userProfile.money - upgradeFind.cost;
  												let businessUpdate = DB.prepare(`UPDATE '${userProfile.businessType}.businessProfile' SET electric = '${split[0]}'`).run();

  												let userUpgrades = DB.prepare(`INSERT OR IGNORE INTO '${msg.guild.id}.${author.id}.upgrades' (upgradeId, name) VALUES ('${upgradeFind.upgradeId}','${upgradeFind.name}');`).run();
  												let moneyUpdate = DB.prepare(`UPDATE 'Profiles' SET money = ${Math.floor(moneyGive*100)/100} WHERE userId = ${author.id};`).run();
  												let upgradeQuery = DB.prepare(`SELECT upgrades FROM 'Profiles' WHERE userId = ${author.id}`).get();
  												let upgradeUpdate = DB.prepare(`UPDATE 'Profiles' SET upgrades = ${upgradeQuery.upgrades+1} WHERE userId = ${author.id};`).run();
  												msg.channel.send(`You have succesfully bought the upgrade **${upgradeFind.name}** for $${upgradeFind.cost}. Your new bank account balance is $${Math.floor(moneyGive*100)/100}.`);
  											} else {
  												msg.channel.send(`You do not have enough money to buy **${upgradeFind.name}**!`);
  											}

  										} else {
  											msg.channel.send("You have not unlocked the previous upgrades yet!");
  										}
  									
  									} catch(err) {
  										console.log(err);
  										msg.channel.send("There was a database error.");
  									}
  								}
  							}
  							}
  							
  							if (userProfile.businessType === "retail") {
  								
  								if (split[1].toLowerCase() === "checkout") {
  									if (split[0] > 8 || split[0] < 0) {
  										msg.channel.send("The max level for the Check Out Lanes upgrade tree is **8**");
  									} else {
  										
  										try {
  										
  										let upgradeFind = DB.prepare(`SELECT * FROM '${userProfile.businessType}.upgrades' WHERE name LIKE '%${args}%'`).get();

  										if (split[0] === `${businessProfile.checkOut+1}`) {

  											if (userProfile.money >= upgradeFind.cost) {
  												let moneyGive = userProfile.money - upgradeFind.cost;
  												let businessUpdate = DB.prepare(`UPDATE '${userProfile.businessType}.businessProfile' SET checkOut = '${split[0]}'`).run();

  												let userUpgrades = DB.prepare(`INSERT OR IGNORE INTO '${msg.guild.id}.${author.id}.upgrades' (upgradeId, name) VALUES ('${upgradeFind.upgradeId}','${upgradeFind.name}');`).run();
  												let moneyUpdate = DB.prepare(`UPDATE 'Profiles' SET money = ${Math.floor(moneyGive*100)/100} WHERE userId = ${author.id};`).run();
  												let upgradeQuery = DB.prepare(`SELECT upgrades FROM 'Profiles' WHERE userId = ${author.id}`).get();
  												let upgradeUpdate = DB.prepare(`UPDATE 'Profiles' SET upgrades = ${upgradeQuery.upgrades+1} WHERE userId = ${author.id};`).run();
  												msg.channel.send(`You have succesfully bought the upgrade **${upgradeFind.name}** for $${upgradeFind.cost}. Your new bank account balance is $${Math.floor(moneyGive*100)/100}.`);
  											} else {
  												msg.channel.send(`You do not have enough money to buy **${upgradeFind.name}**!`);
  											}

  										} else {
  											msg.channel.send("You have not unlocked the previous upgrades yet!");
  										}
  									
  										} catch(err) {
  											console.log(err);
  											msg.channel.send("There was a database error.");
  										}
  									}
  								}
  								
  								if (split[1].toLowerCase() === "aisle") {
  									if (split[0] > 5 || split[0] < 0) {
  										msg.channel.send("The max level for the Aisles upgrade tree is **5**");
  									} else {
  										
  										try {
  										
  										let upgradeFind = DB.prepare(`SELECT * FROM '${userProfile.businessType}.upgrades' WHERE name LIKE '%${args}%'`).get();

  										if (split[0] === `${businessProfile.aisle+1}`) {

  											if (userProfile.money >= upgradeFind.cost) {
  												let moneyGive = userProfile.money - upgradeFind.cost;
  												let businessUpdate = DB.prepare(`UPDATE '${userProfile.businessType}.businessProfile' SET aisle = '${split[0]}'`).run();

  												let userUpgrades = DB.prepare(`INSERT OR IGNORE INTO '${msg.guild.id}.${author.id}.upgrades' (upgradeId, name) VALUES ('${upgradeFind.upgradeId}','${upgradeFind.name}');`).run();
  												let moneyUpdate = DB.prepare(`UPDATE 'Profiles' SET money = ${Math.floor(moneyGive*100)/100} WHERE userId = ${author.id};`).run();
  												let upgradeQuery = DB.prepare(`SELECT upgrades FROM 'Profiles' WHERE userId = ${author.id}`).get();
  												let upgradeUpdate = DB.prepare(`UPDATE 'Profiles' SET upgrades = ${upgradeQuery.upgrades+1} WHERE userId = ${author.id};`).run();
  												msg.channel.send(`You have succesfully bought the upgrade **${upgradeFind.name}** for $${upgradeFind.cost}. Your new bank account balance is $${Math.floor(moneyGive*100)/100}.`);
  											} else {
  												msg.channel.send(`You do not have enough money to buy **${upgradeFind.name}**!`);
  											}

  										} else {
  											msg.channel.send("You have not unlocked the previous upgrades yet!");
  										}
  									
  										} catch(err) {
  											console.log(err);
  											msg.channel.send("There was a database error.");
  										}
  									}
  								}
  								if (split[1].toLowerCase() === "departments") {
  									if (split[0] > 3 || split[0] < 0) {
  										msg.channel.send("The max level for the Departments upgrade tree is **3**");
  									} else {
  										
  										try {
  										
  										let upgradeFind = DB.prepare(`SELECT * FROM '${userProfile.businessType}.upgrades' WHERE name LIKE '%${args}%'`).get();

  										if (split[0] === `${businessProfile.departments+1}`) {

  											if (userProfile.money >= upgradeFind.cost) {
  												let moneyGive = userProfile.money - upgradeFind.cost;
  												let businessUpdate = DB.prepare(`UPDATE '${userProfile.businessType}.businessProfile' SET departments = '${split[0]}'`).run();

  												let userUpgrades = DB.prepare(`INSERT OR IGNORE INTO '${msg.guild.id}.${author.id}.upgrades' (upgradeId, name) VALUES ('${upgradeFind.upgradeId}','${upgradeFind.name}');`).run();
  												let moneyUpdate = DB.prepare(`UPDATE 'Profiles' SET money = ${Math.floor(moneyGive*100)/100} WHERE userId = ${author.id};`).run();
  												let upgradeQuery = DB.prepare(`SELECT upgrades FROM 'Profiles' WHERE userId = ${author.id}`).get();
  												let upgradeUpdate = DB.prepare(`UPDATE 'Profiles' SET upgrades = ${upgradeQuery.upgrades+1} WHERE userId = ${author.id};`).run();
  												msg.channel.send(`You have succesfully bought the upgrade **${upgradeFind.name}** for $${upgradeFind.cost}. Your new bank account balance is $${Math.floor(moneyGive*100)/100}.`);
  											} else {
  												msg.channel.send(`You do not have enough money to buy **${upgradeFind.name}**!`);
  											}

  										} else {
  											msg.channel.send("You have not unlocked the previous upgrades yet!");
  										}
  									
  										} catch(err) {
  											console.log(err);
  											msg.channel.send("There was a database error.");
  										}
  									}
  								}
  								if (split[1].toLowerCase() === "parking") {
  									if (split[0] > 4 || split[0] < 0) {
  										msg.channel.send("The max level for the Parking Lots upgrade tree is **4**");
  									} else {
  										
  										try {
  										
  										let upgradeFind = DB.prepare(`SELECT * FROM '${userProfile.businessType}.upgrades' WHERE name LIKE '%${args}%'`).get();

  										if (split[0] === `${businessProfile.parkingLot+1}`) {

  											if (userProfile.money >= upgradeFind.cost) {
  												let moneyGive = userProfile.money - upgradeFind.cost;
  												let businessUpdate = DB.prepare(`UPDATE '${userProfile.businessType}.businessProfile' SET parkingLot = '${split[0]}'`).run();

  												let userUpgrades = DB.prepare(`INSERT OR IGNORE INTO '${msg.guild.id}.${author.id}.upgrades' (upgradeId, name) VALUES ('${upgradeFind.upgradeId}','${upgradeFind.name}');`).run();
  												let moneyUpdate = DB.prepare(`UPDATE 'Profiles' SET money = ${Math.floor(moneyGive*100)/100} WHERE userId = ${author.id};`).run();
  												let upgradeQuery = DB.prepare(`SELECT upgrades FROM 'Profiles' WHERE userId = ${author.id}`).get();
  												let upgradeUpdate = DB.prepare(`UPDATE 'Profiles' SET upgrades = ${upgradeQuery.upgrades+1} WHERE userId = ${author.id};`).run();
  												msg.channel.send(`You have succesfully bought the upgrade **${upgradeFind.name}** for $${upgradeFind.cost}. Your new bank account balance is $${Math.floor(moneyGive*100)/100}.`);
  											} else {
  												msg.channel.send(`You do not have enough money to buy **${upgradeFind.name}**!`);
  											}

  										} else {
  											msg.channel.send("You have not unlocked the previous upgrades yet!");
  										}
  									
  										} catch(err) {
  											console.log(err);
  											msg.channel.send("There was a database error.");
  										}
  									}
  								}
  								if (split[1].toLowerCase() === "pharmacy") {
  									if (split[0] > 4 || split[0] < 0) {
  										msg.channel.send("The max level for the Pharmacy upgrade tree is **4**");
  									} else {
  										
  										try {
  										
  										let upgradeFind = DB.prepare(`SELECT * FROM '${userProfile.businessType}.upgrades' WHERE name LIKE '%${args}%'`).get();

  										if (split[0] === `${businessProfile.pharmacy+1}`) {

  											if (userProfile.money >= upgradeFind.cost) {
  												let moneyGive = userProfile.money - upgradeFind.cost;
  												let businessUpdate = DB.prepare(`UPDATE '${userProfile.businessType}.businessProfile' SET pharmacy = '${split[0]}'`).run();

  												let userUpgrades = DB.prepare(`INSERT OR IGNORE INTO '${msg.guild.id}.${author.id}.upgrades' (upgradeId, name) VALUES ('${upgradeFind.upgradeId}','${upgradeFind.name}');`).run();
  												let moneyUpdate = DB.prepare(`UPDATE 'Profiles' SET money = ${Math.floor(moneyGive*100)/100} WHERE userId = ${author.id};`).run();
  												let upgradeQuery = DB.prepare(`SELECT upgrades FROM 'Profiles' WHERE userId = ${author.id}`).get();
  												let upgradeUpdate = DB.prepare(`UPDATE 'Profiles' SET upgrades = ${upgradeQuery.upgrades+1} WHERE userId = ${author.id};`).run();
  												msg.channel.send(`You have succesfully bought the upgrade **${upgradeFind.name}** for $${upgradeFind.cost}. Your new bank account balance is $${Math.floor(moneyGive*100)/100}.`);
  											} else {
  												msg.channel.send(`You do not have enough money to buy **${upgradeFind.name}**!`);
  											}

  										} else {
  											msg.channel.send("You have not unlocked the previous upgrades yet!");
  										}
  									
  										} catch(err) {
  											console.log(err);
  											msg.channel.send("There was a database error.");
  										}
  									}
  								}
  								if (split[1].toLowerCase() === "shopping") {
  									if (split[0] > 7 || split[0] < 0) {
  										msg.channel.send("The max level for the Shopping Carts upgrade tree is **3**");
  									} else {
  										
  										try {
  										
  										let upgradeFind = DB.prepare(`SELECT * FROM '${userProfile.businessType}.upgrades' WHERE name LIKE '%${args}%'`).get();

  										if (split[0] === `${businessProfile.shopping+1}`) {

  											if (userProfile.money >= upgradeFind.cost) {
  												let moneyGive = userProfile.money - upgradeFind.cost;
  												let businessUpdate = DB.prepare(`UPDATE '${userProfile.businessType}.businessProfile' SET shopping = '${split[0]}'`).run();

  												let userUpgrades = DB.prepare(`INSERT OR IGNORE INTO '${msg.guild.id}.${author.id}.upgrades' (upgradeId, name) VALUES ('${upgradeFind.upgradeId}','${upgradeFind.name}');`).run();
  												let moneyUpdate = DB.prepare(`UPDATE 'Profiles' SET money = ${Math.floor(moneyGive*100)/100} WHERE userId = ${author.id};`).run();
  												let upgradeQuery = DB.prepare(`SELECT upgrades FROM 'Profiles' WHERE userId = ${author.id}`).get();
  												let upgradeUpdate = DB.prepare(`UPDATE 'Profiles' SET upgrades = ${upgradeQuery.upgrades+1} WHERE userId = ${author.id};`).run();
  												msg.channel.send(`You have succesfully bought the upgrade **${upgradeFind.name}** for $${upgradeFind.cost}. Your new bank account balance is $${Math.floor(moneyGive*100)/100}.`);
  											} else {
  												msg.channel.send(`You do not have enough money to buy **${upgradeFind.name}**!`);
  											}

  										} else {
  											msg.channel.send("You have not unlocked the previous upgrades yet!");
  										}
  									
  										} catch(err) {
  											console.log(err);
  											msg.channel.send("There was a database error.");
  										}
  									}
  								}
  								if (split[1].toLowerCase() === "logistical") {
  									if (split[0] > 5 || split[0] < 0) {
  										msg.channel.send("The max level for the Logistical upgrade tree is **5**");
  									} else {
  										
  										try {
  										
  										let upgradeFind = DB.prepare(`SELECT * FROM '${userProfile.businessType}.upgrades' WHERE name LIKE '%${args}%'`).get();

  										if (split[0] === `${businessProfile.logistical+1}`) {

  											if (userProfile.money >= upgradeFind.cost) {
  												let moneyGive = userProfile.money - upgradeFind.cost;
  												let businessUpdate = DB.prepare(`UPDATE '${userProfile.businessType}.businessProfile' SET logistical = '${split[0]}'`).run();

  												let userUpgrades = DB.prepare(`INSERT OR IGNORE INTO '${msg.guild.id}.${author.id}.upgrades' (upgradeId, name) VALUES ('${upgradeFind.upgradeId}','${upgradeFind.name}');`).run();
  												let moneyUpdate = DB.prepare(`UPDATE 'Profiles' SET money = ${Math.floor(moneyGive*100)/100} WHERE userId = ${author.id};`).run();
  												let upgradeQuery = DB.prepare(`SELECT upgrades FROM 'Profiles' WHERE userId = ${author.id}`).get();
  												let upgradeUpdate = DB.prepare(`UPDATE 'Profiles' SET upgrades = ${upgradeQuery.upgrades+1} WHERE userId = ${author.id};`).run();
  												msg.channel.send(`You have succesfully bought the upgrade **${upgradeFind.name}** for $${upgradeFind.cost}. Your new bank account balance is $${Math.floor(moneyGive*100)/100}.`);
  											} else {
  												msg.channel.send(`You do not have enough money to buy **${upgradeFind.name}**!`);
  											}

  										} else {
  											msg.channel.send("You have not unlocked the previous upgrades yet!");
  										}
  									
  										} catch(err) {
  											console.log(err);
  											msg.channel.send("There was a database error.");
  										}
  									}
  								}
  							}	
  						}
  					} else {
  						msg.channel.send("That is not a valid search!");
  					}
  				} else {
  					msg.channel.send("Buying upgrades by their ids has not been implented yet! I'm sorry for the inconvience");

  					/*
  					if (args <= 37) {
  						// Search by id
  					} else {
  						msg.channel.send(`Upgrade ids for ${businessType} do not go that high`);
  					}
  					*/
  				}
  			}
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

/*
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
*/

client.login(botconfig.token);
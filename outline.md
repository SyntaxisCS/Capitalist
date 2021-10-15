## Databases

* GuildConfig
	* guildId, prefix

* Profiles
	* userId, username, businessType, businessName, money, upgrades
												   		   (Number)

* ${GuildId}.${userId}.upgrades
	* upgradeId, (unlockDate??)


* businessType.upgrades (List of every upgrade for this particular businessType)
	* upgradeId, name, desc, effect, cost

## Commands

* %start - start a game for user (ask what business type (either args or collector))

* %work - Produce money (depends on upgrade) 
	* cooldown every 5 minutes per user

* %shop - checks user's current upgrades and produces an embed of upgrades that are currently unlockable

* %buy - allows a user to buy upgrades. checks that a user has enough money, has not already bought the upgrade, and has bought all the previous upgrades before adding the upgrade to the users profile
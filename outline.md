## Databases

* GuildConfig
	* guildId, prefix

* Profiles
	* userId, username, businessType, businessName, money, upgrades
												   		   (Number)

* ${GuildId}.${userId}.upgrades
	* upgradeId, (unlockDate??)

* businessType.starting (List of items you start with)
	* name, desc, effect

* businessType.upgrades (List of every upgrade for this particular businessType)
	* upgradeId, name, desc, effect, cost

## Commands

* %start - start a game for user (ask what business type (either args or collector))

* %work - Produce money (depends on upgrade) cooldown every 5 minutes per user
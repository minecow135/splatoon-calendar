const { Client, Events, GatewayIntentBits, ActivityType } = require('discord.js');

if (!process.env.BOT_TOKEN) {
  throw "env variable BOT_TOKEN not set"
}
if (!process.env.BOT_ACTIVITY) {
  throw "env variable BOT_ACTIVITY not set"
}
if (!process.env.BOT_ACTIVITY_TYPE) {
  throw "env variable BOT_ACTIVITY_TYPE not set"
}

const token = process.env.BOT_TOKEN;

// Create a new discordConnect instance
const discordConnect = new Client({ intents: [GatewayIntentBits.Guilds] });

discordConnect.once(Events.ClientReady, readyClient => {
    // When the discordConnect is ready, run this code (only once).
    // The distinction between `discordConnect: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
    // It makes some properties non-nullable.
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    discordConnect.user.setActivity(process.env.BOT_ACTIVITY, { type: ActivityType[process.env.BOT_ACTIVITY_TYPE] });
});

// Log in to Discord with your discordConnect's token
discordConnect.login(token);

module.exports = discordConnect;
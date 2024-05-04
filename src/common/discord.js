const { Client, Events, GatewayIntentBits } = require('discord.js');

const token = process.env.botToken;

// Create a new discordConnect instance
const discordConnect = new Client({ intents: [GatewayIntentBits.Guilds] });

discordConnect.once(Events.ClientReady, readyClient => {
    // When the discordConnect is ready, run this code (only once).
    // The distinction between `discordConnect: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
    // It makes some properties non-nullable.
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Log in to Discord with your discordConnect's token
discordConnect.login(token);

module.exports = discordConnect;
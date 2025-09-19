const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config();

const token = process.env.TOKEN;
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildExpressions,
    GatewayIntentBits.GuildModeration,
  ],
});

(async () => {
  try {
    await require("./src/handlers/index")(client);
    console.log("Handlers loaded");
  } catch (error) {
    console.error("Error loading handlers:", error);
    process.exit(1);
  }
})();

client.login(token);

process.on("SIGINT", async () => {
  console.log("Bot shutting down...");
  if (client.db) {
    await client.db.$disconnect();
    console.log("Database connection closed");
  }
  client.destroy();
  process.exit(0);
});

const { Client, Events, GatewayIntentBits } = require("discord.js");
require("dotenv").config();

const token = process.env.TOKEN;
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
  ],
});

// client.commands = new Collection();

// const commandsFolder = fs.readdirSync("./src/commands");
// for (const folder of commandsFolder) {
//   const commandsFiles = fs
//     .readdirSync(`./src/commands/${folder}`)
//     .filter((file) => file.endsWith(".js"));
//   for (const file of commandsFiles) {
//     const command = require(`./commands/${folder}/${file}`);
//     if ("data" in command && "execute" in command) {
//       client.commands.set(command.data.name, command);
//     } else {
//       console.log(
//         `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
//       );
//     }
//   }
// }

// const eventsFolder = fs.readdirSync("./src/events");
// for (const folder of eventsFolder) {
//   const eventsFiles = fs
//     .readdirSync(`./src/events/${folder}`)
//     .filter((file) => file.endsWith(".js"));
//   for (const file of eventsFiles) {
//     const event = require(`./events/${folder}/${file}`);
//     if (event.once) {
//       client.once(event.name, (...args) => event.execute(...args, client));
//     } else {
//       client.on(event.name, (...args) => event.execute(...args, client));
//     }
//   }
// }

// require("./src/handlers/index")(client);

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

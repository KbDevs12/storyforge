const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");

async function registerCommands(token, clientId, guildId, global = true) {
  try {
    const commands = [];
    const commandsPath = path.join(__dirname, "..", "commands");
    const commandFolders = fs.readdirSync(commandsPath);

    for (const folder of commandFolders) {
      const folderPath = path.join(commandsPath, folder);
      const commandFiles = fs
        .readdirSync(folderPath)
        .filter((file) => file.endsWith(".js"));

      for (const file of commandFiles) {
        const filePath = path.join(folderPath, file);
        const command = require(filePath);
        if ("data" in command && "execute" in command) {
          commands.push(command.data.toJSON());
          console.log(`Including command: ${command.data.name}`);
        } else {
          console.log(
            `[WARNING] The command at ${filePath} is missing required properties.`
          );
        }
      }
    }

    const rest = new REST().setToken(token);
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );
    let data;
    if (global) {
      data = await rest.put(Routes.applicationCommands(clientId), {
        body: commands,
      });
      console.log(`Successfully registered ${data.length} global commands.`);
    } else {
      data = await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands }
      );
      console.log(
        `Successfully registered ${data.length} commands for development guild.`
      );
    }
    return true;
  } catch (error) {
    console.error("Error registering commands:", error);
    return false;
  }
}

module.exports = registerCommands;

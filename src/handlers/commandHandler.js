const { Collection } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = (client) => {
  client.commands = new Collection();

  const loadCommands = () => {
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
          client.commands.set(command.data.name, command);
          console.log(`Loaded command: ${command.data.name}`);
        } else {
          console.log(
            `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
          );
        }
      }
    }
  };

  loadCommands();

  client.reloadCommand = (commandName) => {
    const commandFolders = fs.readdirSync(
      path.join(__dirname, "..", "commands")
    );

    for (const folder of commandFolders) {
      const folderPath = path.join(__dirname, "..", "commands", folder);
      const commandFiles = fs
        .readdirSync(folderPath)
        .filter((file) => file.endsWith(".js"));

      for (const file of commandFiles) {
        const filePath = path.join(folderPath, file);
        const command = require(filePath);

        if (command.data.name === commandName) {
          delete require.cache[require.resolve(filePath)];
          const newCommand = require(filePath);
          client.commands.set(newCommand.data.name, newCommand);
          return true;
        }
      }
    }
    return false;
  };
};

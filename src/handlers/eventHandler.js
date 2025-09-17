const fs = require("fs");
const path = require("path");

module.exports = (client) => {
  const loadEvents = () => {
    const eventsPath = path.join(__dirname, "..", "events");
    const eventFolders = fs.readdirSync(eventsPath);

    for (const folder of eventFolders) {
      const folderPath = path.join(eventsPath, folder);
      const eventFiles = fs
        .readdirSync(folderPath)
        .filter((file) => file.endsWith(".js"));

      for (const file of eventFiles) {
        const filePath = path.join(folderPath, file);
        const event = require(filePath);

        if (event.name && event.execute) {
          if (event.once) {
            client.once(event.name, (...args) =>
              event.execute(...args, client)
            );
          } else {
            client.on(event.name, (...args) => event.execute(...args, client));
          }
          console.log(`Loaded event: ${event.name}`);
        } else {
          console.log(
            `[WARNING] The event at ${filePath} is missing a required "name" or "execute" property.`
          );
        }
      }
    }
  };

  loadEvents();
};

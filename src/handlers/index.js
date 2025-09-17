const fs = require("fs");
const path = require("path");

module.exports = async (client) => {
  const essentialHandlers = [
    "errorHandler",
    "databaseHandler",
    "commandHandler",
    "eventHandler",
  ];

  for (const handler of essentialHandlers) {
    const handlerPath = path.join(__dirname, `${handler}.js`);
    if (fs.existsSync(handlerPath)) {
      try {
        await require(handlerPath)(client);
        console.log(`Loaded essential handler: ${handler}`);
      } catch (error) {
        console.error(`Error loading ${handler}:`, error);
        throw error;
      }
    }
  }

  await require("./commandRegistrationHandler")(client);
  console.log("Command registration handler loaded");

  const handlerFiles = fs
    .readdirSync(__dirname)
    .filter(
      (file) =>
        file.endsWith(".js") &&
        file !== "index.js" &&
        !essentialHandlers.includes(file.replace(".js", "")) &&
        file !== "commandRegistrationHandler.js"
    );

  for (const file of handlerFiles) {
    try {
      await require(path.join(__dirname, file))(client);
      console.log(`Loaded handler: ${file}`);
    } catch (error) {
      console.error(`Error loading handler ${file}:`, error);
    }
  }

  console.log("All handlers loaded");
};

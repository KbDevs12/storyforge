const registerCommands = require("../utils/registerCommands");
const config = require("../../config.json");

module.exports = async (client) => {
  if (!config.autoRegisterCommands) {
    console.log("Auto command registration is disabled in config");
    return;
  }

  const token = process.env.TOKEN;
  const clientId = config.clientId;
  const guildId = config.guildId;

  const isProduction = process.env.NODE_ENV === "production";

  console.log(
    `Starting command registration in ${
      isProduction ? "PRODUCTION" : "DEVELOPMENT"
    } mode`
  );

  try {
    await registerCommands(token, clientId, guildId, isProduction);

    client.registerCommands = async (global = true) => {
      return await registerCommands(token, clientId, guildId, global);
    };
  } catch (error) {
    console.error("Failed to register commands on startup:", error);
  }
};

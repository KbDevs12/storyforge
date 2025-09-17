const { Events, MessageFlags } = require("discord.js");

module.exports = (client) => {
  client.handleInteraction = async (interaction) => {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) {
        console.error(
          `No command matching ${interaction.commandName} was found.`
        );
        return;
      }

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(`Error executing ${interaction.commandName}:`, error);

        try {
          if (interaction.deferred) {
            await interaction
              .editReply({
                content: "There was an error executing this command!",
              })
              .catch((e) => console.error("Could not edit reply:", e));
          } else if (!interaction.replied) {
            await interaction
              .reply({
                content: "There was an error executing this command!",
                flags: MessageFlags.Ephemeral,
              })
              .catch((e) => console.error("Could not reply:", e));
          } else {
            await interaction
              .followUp({
                content: "There was an error executing this command!",
                flags: MessageFlags.Ephemeral,
              })
              .catch((e) => console.error("Could not follow up:", e));
          }
        } catch (followupError) {
          console.error(
            "Error while handling the error response:",
            followupError
          );
        }
      }
    } else if (interaction.isButton()) {
      const buttonId = interaction.customId;
      // Button handler logic here
    } else if (interaction.isStringSelectMenu()) {
      const menuId = interaction.customId;
      // Select menu handler logic here
    } else if (interaction.isModalSubmit()) {
      const modalId = interaction.customId;
      // Modal handler logic here
    }
  };

  client.on(Events.InteractionCreate, client.handleInteraction);
};

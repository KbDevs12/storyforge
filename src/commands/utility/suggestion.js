const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { createEmbed } = require("../../utils/embedBuilder");
const { ownerId } = require("../../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("suggestion")
    .setDescription("Make a suggestion for the bot")
    .addStringOption((option) =>
      option
        .setName("suggestion")
        .setDescription("The suggestion you want to make")
        .setRequired(true)
    ),
  usage: "/suggestion <suggestion>",
  category: "Utility",
  async execute(interaction, client) {
    try {
      const suggestion = interaction.options.getString("suggestion");
      const embed = createEmbed({
        title: "New Suggestion",
        description: suggestion,
        footer: `Suggested by ${interaction.user.tag}`,
      });
      const owner = await client.users.fetch(ownerId);
      await owner.send({ embeds: [embed] });
      return interaction.reply({
        content: "Your suggestion has been sent to the bot owner.",
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: "An error occurred while sending your suggestion.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};

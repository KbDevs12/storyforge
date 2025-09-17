const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { createEmbed } = require("../../utils/embedBuilder");
const { getUsage } = require("../../utils/usage");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("List of available commands"),
  async execute(interaction, client) {
    const commands = [...client.commands.values()];
    const fields = commands.slice(0, 25).map((cmd) => {
      const usage = getUsage(cmd);
      const description = cmd.data.description || "No description";
      return {
        name: `/${cmd.data.name}`,
        value: `• Description: ${description}\n• Usage: ${usage}`,
      };
    });

    const hiddenCount = Math.max(commands.length - 25, 0);
    const embed = createEmbed({
      title: "Command List",
      description: "Here are all the available commands:",
      fields,
      footer:
        hiddenCount > 0 ? `+${hiddenCount} more commands not shown` : undefined,
    });

    await interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
  },
};

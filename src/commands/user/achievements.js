const { SlashCommandBuilder } = require("discord.js");
const { createEmbed } = require("../../utils/embedBuilder");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("achievements")
    .setDescription("View your achievements"),
  usage: "/achievements",
  category: "User",
  async execute(interaction, client) {
    try {
      const prisma = client.db;
      const userId = BigInt(interaction.user.id);

      const achievements = await prisma.achievements.findMany({
        where: { user_id: userId },
      });

      if (achievements.length === 0) {
        return interaction.reply("You have no achievements yet.");
      }

      const embed = createEmbed({
        title: `${interaction.user.username}'s Achievements`,
        description: achievements
          .map((a) => `• ${a.name}: ${a.description}`)
          .join("\n"),
        footer:
          "Keep playing to unlock more achievements!" +
          interaction.user.avatarURL(),
      });

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Error executing achievements command:", error);
      return interaction.reply(
        "⚠️ An error occurred while executing the command."
      );
    }
  },
};

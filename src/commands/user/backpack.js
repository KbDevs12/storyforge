const { SlashCommandBuilder } = require("discord.js");
const { createEmbed } = require("../../utils/embedBuilder");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("backpack")
    .setDescription("View your backpack items"),
  usage: "/backpack",
  category: "User",

  async execute(interaction, client) {
    try {
      const prisma = client.db;
      const userId = BigInt(interaction.user.id);

      const userItems = await prisma.user_items.findMany({
        where: { user_id: userId },
        include: { item: true },
      });

      if (userItems.length === 0) {
        return interaction.reply("Your backpack is empty.");
      }

      const embed = createEmbed({
        title: `${interaction.user.username}'s Backpack`,
        description:
          "**ID | Name - Description**\n" +
          userItems
            .map(
              (ui) =>
                `• \`${ui.item.id}\` | **${ui.item.name}** - ${
                  ui.item.description || "No description"
                }`
            )
            .join("\n"),
        thumbnail: interaction.user.displayAvatarURL({ dynamic: true }),
        footer: `Keep playing to find more items! | Total items: ${
          userItems.length
        } | Viewed on ${new Date().toLocaleDateString()}`,
      });

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Error fetching backpack items:", error);
      return interaction.reply(
        "There was an error fetching your backpack items."
      );
    }
  },
};

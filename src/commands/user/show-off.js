const { SlashCommandBuilder } = require("discord.js");
const { data } = require("./accept-trade");
const { createEmbed } = require("../../utils/embedBuilder");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("show-off")
    .setDescription("Show off an item you own")
    .addIntegerOption((o) =>
      o
        .setName("item_id")
        .setDescription("ID of the item to show off")
        .setRequired(true)
        .setMinValue(1)
    ),
  usage: "/show-off item_id:<item_id>",
  category: "User",
  async execute(interaction, client) {
    const prisma = client.db;
    const itemId = BigInt(interaction.options.getInteger("item_id"));
    const userId = BigInt(interaction.user.id);
    const serverId = BigInt(interaction.guild.id);

    const userItem = await prisma.user_items.findFirst({
      where: { user_id: userId, server_id: serverId, item_id: itemId },
    });

    if (!userItem) {
      return interaction.reply("⚠️ You do not own this item in this server.");
    }

    const item = await prisma.items.findUnique({
      where: { id: itemId },
    });
    if (!item) {
      return interaction.reply("⚠️ Item not found.");
    }

    const embed = createEmbed({
      title: `${interaction.user.username} is showing off an item!`,
      description: `**${item.name}**\n${item.description}`,
      thumbnail: interaction.guild.iconURL(),
      footer: "Keep collecting items!",
    });

    await interaction.reply({ embeds: [embed] });
  },
};

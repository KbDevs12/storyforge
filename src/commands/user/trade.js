const { SlashCommandBuilder } = require("discord.js");
const { execute } = require("./achievements");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("trade")
    .setDescription("Trade items with another user")
    .addUserOption((opt) =>
      opt
        .setName("user")
        .setDescription("The user to trade with")
        .setRequired(true)
    )
    .addIntegerOption((o) =>
      o
        .setName("item_id")
        .setDescription("ID of item to trade")
        .setRequired(true)
        .setMinValue(1)
    ),
  usage: "/trade user:<user> item_id:<item_id>",
  category: "User",

  async execute(interaction, client) {
    const prisma = client.db;
    const userId = BigInt(interaction.user.id);
    const targetUser = interaction.options.getUser("user");
    const targetUserId = BigInt(targetUser.id);
    const itemId = BigInt(interaction.options.getInteger("item_id"));
    const serverId = BigInt(interaction.guild.id);

    if (userId === targetUserId) {
      return interaction.reply("⚠️ You cannot trade with yourself.");
    }

    const userItem = await prisma.user_items.findFirst({
      where: { user_id: userId, server_id: serverId, item_id: itemId },
    });
    if (!userItem) {
      return interaction.reply("⚠️ You do not own this item in this server.");
    }

    const trade = await client.createTrade(
      serverId,
      userId,
      targetUserId,
      itemId
    );

    const item = await prisma.items.findUnique({
      where: { id: itemId },
    });
    if (!item) {
      return interaction.reply("⚠️ Item not found.");
    }

    try {
      const targetUser = interaction.options.getUser("user");
      await targetUser.send(
        `📦 You have a new trade request from ${interaction.user.tag}!\n` +
          `Item: ${item.name} (ID: ${item.id})\n` +
          `To accept the trade, use the command:\n` +
          `/trade accept trade_id:${trade.id}\n` +
          `To decline the trade, use the command:\n` +
          `/trade decline trade_id:${trade.id}`
      );
      return interaction.reply(`✅ Trade request sent to ${targetUser.tag}.`);
    } catch (error) {
      console.error("Error sending trade request:", error);
      return interaction.reply("⚠️ Failed to send trade request.");
    }
  },
};

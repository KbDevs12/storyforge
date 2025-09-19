const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("accept-trade")
    .setDescription("Accept a trade request")
    .addIntegerOption((o) =>
      o
        .setName("trade_id")
        .setDescription("ID of the trade to accept")
        .setRequired(true)
    ),
  usage: "/accept-trade trade_id:<trade_id>",
  category: "User",

  async execute(interaction, client) {
    const prisma = client.db;
    const tradeId = interaction.options.getInteger("trade_id");
    const userId = BigInt(interaction.user.id);

    const trade = await prisma.trades.findUnique({
      where: { id: BigInt(tradeId) },
    });
    if (!trade) {
      return interaction.reply("⚠️ Trade not found.");
    }
    if (trade.to_user !== userId) {
      return interaction.reply("⚠️ You are not the recipient of this trade.");
    }
    if (trade.status !== "pending") {
      return interaction.reply("⚠️ This trade is processed.");
    }

    await prisma.$transaction(async (tx) => {
      await tx.trades.update({
        where: { id: BigInt(tradeId) },
        data: { status: "accepted" },
      });
      await tx.user_items.updateMany({
        where: {
          user_id: trade.from_user,
          server_id: trade.server_id,
          item_id: trade.item_id,
        },
        data: { user_id: trade.to_user },
      });
    });
    try {
      const fromUser = await interaction.client.users.fetch(
        trade.from_user.toString()
      );
      await fromUser.send(
        `✅ Your trade (ID: ${trade.id}) has been accepted by ${interaction.user.tag}.`
      );
    } catch (error) {
      console.error("Error sending trade acceptance DM:", error);
    }

    return interaction.reply("✅ Trade accepted successfully!");
  },
};

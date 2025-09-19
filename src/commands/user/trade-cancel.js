const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("trade-cancel")
    .setDescription("Cancel a trade request")
    .addIntegerOption((o) =>
      o
        .setName("trade_id")
        .setDescription("ID of the trade to cancel")
        .setRequired(true)
    ),
  usage: "/trade-cancel trade_id:<trade_id>",
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
    if (trade.from_user !== userId) {
      return interaction.reply("⚠️ You are not the sender of this trade.");
    }
    if (trade.status !== "pending") {
      return interaction.reply("⚠️ This trade is already processed.");
    }
    await prisma.trades.update({
      where: { id: BigInt(tradeId) },
      data: { status: "cancelled" },
    });
    return interaction.reply("✅ Trade cancelled successfully!");
  },
};

const { SlashCommandBuilder } = require("discord.js");
const { createEmbed } = require("../../utils/embedBuilder");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("top-collector")
    .setDescription("View the top collectors in the server"),
  usage: "/top-collector",
  category: "Info",
  async execute(interaction, client) {
    const prisma = client.db;
    const serverId = BigInt(interaction.guild.id);

    const leaderboard = await prisma.user_items.groupBy({
      by: ["user_id"],
      where: { server_id: serverId },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    });

    if (leaderboard.length === 0) {
      return interaction.reply("No collectors found in this server.");
    }
    const list = await Promise.all(
      leaderboard.map(async (row, i) => {
        const user = await client.users
          .fetch(row.user_id.toString())
          .catch(() => null);
        const username = user ? user.username : `User ID: ${row.user_id}`;
        return `**${i + 1}. ${username}** - ${row._count.id} item(s)`;
      })
    );

    const embed = createEmbed({
      title: "🏆 Top Collectors",
      description: list.join("\n"),
      footer: "Keep collecting items!" + interaction.guild.iconURL(),
    });
    return interaction.reply({ embeds: [embed] });
  },
};

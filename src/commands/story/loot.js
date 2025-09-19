const { SlashCommandBuilder } = require("discord.js");
const config = require("../../../config.json");
const { createEmbed } = require("../../utils/embedBuilder");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("loot")
    .setDescription("Take a daily loot drop"),
  usage: "/loot",
  category: "Story",
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const prisma = client.db;
      const serverId = BigInt(interaction.guild.id);
      const userId = BigInt(interaction.user.id);

      const lootMode = config.lootMode || "per-server";

      const date = new Date();
      date.setHours(0, 0, 0, 0);

      let existingLoot;
      if (lootMode === "global") {
        existingLoot = await prisma.user_items.findFirst({
          where: {
            user_id: userId,
            obtained_at: { gte: date },
          },
        });
      } else {
        existingLoot = await prisma.user_items.findFirst({
          where: {
            user_id: userId,
            server_id: serverId,
            obtained_at: { gte: date },
          },
        });
      }

      if (existingLoot) {
        return interaction.editReply(
          "You have already claimed your loot for today. Come back tomorrow!"
        );
      }
      const server = await client.getServer(serverId);
      if (!server || !server.theme_id) {
        return interaction.editReply(
          "⚠️ Server ini belum punya tema. Gunakan `/theme set` dulu."
        );
      }

      const items = await prisma.items.findMany({
        where: { theme_id: server.theme_id },
      });
      if (items.length === 0) {
        return interaction.editReply("⚠️ Belum ada item di tema ini.");
      }

      const item = items[Math.floor(Math.random() * items.length)];

      await client.giveItemToUser(userId, serverId, item.id);
      const embed = createEmbed({
        title: "🎉 Daily Loot Drop! 🎉",
        description: `You received: **${item.name}**\n_${
          item.description || "No description"
        }_`,
        thumbnail: interaction.guild.iconURL(),
        footer:
          "Come back tomorrow for more loot!" + interaction.user.avatarURL(),
      });
      await interaction.editReply({ embeds: [embed] });

      const totalLoot = await prisma.user_items.count({
        where: {
          user_id: userId,
          ...(lootMode === "per-server" ? { server_id: serverId } : {}),
        },
      });

      const achievements = await prisma.achievements.findMany({
        where: {
          condition_type: "loot_count",
          condition_value: { lte: totalLoot },
        },
      });

      for (const a of achievements) {
        const awarded = await client.awardAchievement(userId, serverId, a.id);
        if (awarded) {
          await interaction.followUp(
            `🏅 Kamu mendapatkan achievement **${a.name}**! 🎉`
          );
        }
      }
    } catch (err) {
      console.error(err);
      if (interaction.deferred || interaction.replied) {
        return interaction.editReply(
          "⚠️ Something went wrong while trying to get your loot."
        );
      } else {
        return interaction.reply(
          "⚠️ Something went wrong while trying to get your loot."
        );
      }
    }
  },
};

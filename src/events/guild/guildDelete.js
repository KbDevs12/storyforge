module.exports = {
  name: "guildDelete",
  once: false,
  async execute(guild, client) {
    const prisma = client.db;
    const toBigInt = prisma?.toBigInt ?? ((v) => BigInt(v));
    const serverId = toBigInt(guild.id);

    console.log(
      `[GUILD DELETE] Removing all data for guild ${guild.name} (${guild.id})`
    );

    try {
      await prisma.$transaction(async (tx) => {
        const stories = await tx.stories.findMany({
          where: { server_id: serverId },
          select: { id: true },
        });
        const storyIds = stories.map((s) => s.id);
        if (storyIds.length) {
          await tx.story_entries.deleteMany({
            where: { story_id: { in: storyIds } },
          });
          await tx.stories.deleteMany({ where: { id: { in: storyIds } } });
        }

        await tx.trades.deleteMany({ where: { server_id: serverId } });

        await tx.user_items.deleteMany({ where: { server_id: serverId } });

        try {
          await tx.user_achievements.deleteMany({
            where: { server_id: serverId },
          });
        } catch {
          await tx.user_achievements.deleteMany({
            where: { server_id: guild.id.toString() },
          });
        }
        const themes = await tx.themes.findMany({
          where: { server_id: serverId },
          select: { id: true },
        });
        const themeIds = themes.map((t) => t.id);
        if (themeIds.length) {
          await tx.items.deleteMany({ where: { theme_id: { in: themeIds } } });
          await tx.themes.deleteMany({ where: { id: { in: themeIds } } });
        }

        await tx.servers.deleteMany({ where: { id: serverId } });
      });

      console.log(`[GUILD DELETE] Cleanup complete for guild ${guild.id}`);
    } catch (err) {
      console.error(
        `[GUILD DELETE] Cleanup failed for guild ${guild.id}:`,
        err
      );

      try {
        await client.db.servers.deleteMany({ where: { id: serverId } });
      } catch (_) {}
    }
  },
};

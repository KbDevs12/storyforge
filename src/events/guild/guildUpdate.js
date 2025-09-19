module.exports = {
  name: "guildUpdate",
  once: false,
  async execute(oldGuild, newGuild, client) {
    try {
      const current = await client.getServer(newGuild.id);
      await client.createOrUpdateServer(
        newGuild.id,
        newGuild.name,
        current?.theme_id ?? null
      );
      console.log(
        `Guild updated: ${oldGuild.name} -> ${newGuild.name} (${newGuild.id})`
      );
    } catch (err) {
      console.error("Failed to sync guild update:", err);
    }
  },
};

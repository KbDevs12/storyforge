module.exports = {
  name: "guildCreate",
  once: false,
  async execute(guild, client) {
    console.log(`Bot joined a new guild: ${guild.name} (${guild.id})`);

    try {
      await client.createOrUpdateServer(guild.id, guild.name);
      const defaultChannel = guild.channels.cache.find(
        (channel) =>
          channel.type === "GUILD_TEXT" &&
          channel.permissionsFor(guild.me).has("SEND_MESSAGES")
      );

      if (defaultChannel) {
        defaultChannel.send({
          content: `👋 Thanks for adding StoryForge to your server! Use \`/help\` to see available commands.`,
        });
      }
    } catch (error) {
      console.error(`Failed to send welcome message to ${guild.name}:`, error);
    }
  },
};

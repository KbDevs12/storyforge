const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { execute } = require("../utility/ping");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("theme")
    .setDescription("Set the theme for server stories (admin only)")
    .addSubcommand((sc) =>
      sc
        .setName("set")
        .setDescription("Set the server's theme")
        .addStringOption((opt) =>
          opt
            .setName("theme_name")
            .setDescription("The name of the theme to set")
            .setRequired(true)
        )
        .addStringOption((opt) =>
          opt
            .setName("description")
            .setDescription("The description of the theme to set")
            .setRequired(true)
        )
    )
    .addSubcommand((sc) =>
      sc.setName("view").setDescription("View the current server theme")
    )
    .addSubcommand((sc) =>
      sc.setName("clear").setDescription("Clear the current server theme")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  usage: "/theme [set|view|clear] [options]",
  category: "Story Setting",

  async execute(interaction, client) {
    try {
      const prisma = client.db;
      const sub = interaction.options.getSubcommand();
      const serverId = BigInt(interaction.guildId);

      if (
        interaction.user.id !== interaction.guild.ownerId &&
        !interaction.memberPermissions.has(PermissionFlagsBits.Administrator)
      ) {
        return interaction.reply(
          "⚠️ You need to be the server owner or have administrator permissions to use this command."
        );
      }

      switch (sub) {
        case "set": {
          const themeName = interaction.options.getString("theme_name");
          const description = interaction.options.getString("description");

          let theme = await prisma.themes.findFirst({
            where: { server_id: serverId, name: themeName },
          });

          if (!theme) {
            theme = await client.createTheme(serverId, themeName, description);
          }

          await client.createOrUpdateServer(
            interaction.guildId,
            interaction.guild.name,
            theme.id ? Number(theme.id) : null
          );
          return interaction.reply(
            `✅ Theme set to **${themeName}** with description: ${description}`
          );
        }
        case "view": {
          const server = await client.getServer(serverId);
          if (!server || !server.theme_id) {
            return interaction.reply(
              "⚠️ This server does not have a theme set."
            );
          }
          const theme = await prisma.themes.findUnique({
            where: { id: server.theme_id },
          });

          if (!theme) {
            return interaction.reply(
              "⚠️ The theme set for this server does not exist."
            );
          }

          return interaction.reply(
            `📚 Current theme: **${theme.name}**\n📝 Description: ${theme.description}`
          );
        }
        case "clear": {
          await client.createOrUpdateServer(
            interaction.guildId,
            interaction.guild.name,
            null
          );
          return interaction.reply("✅ Server theme has been cleared.");
        }
      }
    } catch (error) {}
  },
};

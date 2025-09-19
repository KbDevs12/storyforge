const { SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("messages")
    .setDescription("create custom discord message images")
    .addStringOption((o) =>
      o
        .setName("content")
        .setDescription("message that could send")
        .setRequired(true)
    )
    .addUserOption((o) =>
      o
        .setName("target")
        .setDescription("user who send the message")
        .setRequired(false)
    ),
  usage: "/messages content:<content> [target:<user>]",
  category: "Images",

  async execute(interaction, client) {
    try {
      const user = interaction.options.getUser("target") || interaction.user;
      const messages = interaction.options.getString("content");
      const avatarUrl = user.displayAvatarURL({
        extension: "png",
        size: 1024,
        forceStatic: false,
      });
      const timestamp = new Date().toISOString();

      const url = `https://api.popcat.xyz/v2/discord-message?username=${encodeURIComponent(
        user.username
      )}&avatar=${encodeURIComponent(avatarUrl)}&content=${encodeURIComponent(
        messages
      )}&color=%235865F2&timestamp=${encodeURIComponent(timestamp)}`;

      const response = await fetch(url);
      const res = await response.arrayBuffer();
      const buffer = Buffer.from(res);
      await interaction.reply({
        files: [{ attachment: buffer, name: "message.png" }],
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "An error occurred while generating the message image.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};

const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { createEmbed } = require("../../utils/embedBuilder");
const { category } = require("./biden");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clown")
    .setDescription("Make this user a clown")
    .addUserOption((o) =>
      o
        .setName("user")
        .setDescription("The user to make a clown")
        .setRequired(true)
    ),
  usage: "/clown <user>",
  category: "Fun",
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const user = interaction.options.getUser("user");
      const avatarUrl = user.displayAvatarURL({
        extension: "png",
        size: 1024,
        forceStatic: false,
      });
      const response = await fetch(
        `https://api.popcat.xyz/v2/clown?image=${encodeURIComponent(
          avatarUrl
        )}`,
        { method: "GET" }
      );
      const res = await response.arrayBuffer();
      const buffer = Buffer.from(res);
      const embed = createEmbed({
        title: "🤡 Clownify!",
        description: `${user.username} is now a clown!`,
        footer: `Requested by ${interaction.user.tag}`,
        image: "attachment://clown.png",
      });
      await interaction.editReply({
        embeds: [embed],
        files: [{ attachment: buffer, name: "clown.png" }],
      });
    } catch (error) {
      console.error(error);
      await interaction.editReply({
        content: "An error occurred while processing your request.",
      });
    }
  },
};

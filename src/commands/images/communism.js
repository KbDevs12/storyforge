const { SlashCommandBuilder } = require("discord.js");
const { createEmbed } = require("../../utils/embedBuilder");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("communism")
    .setDescription("Apply the communism effect to an image")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to apply the effect to")
        .setRequired(false)
    ),
  usage: "/communism [user](optional)",
  category: "Images",
  async execute(interaction, client) {
    try {
      await interaction.deferReply(); // ⬅️ cegah timeout

      const user = interaction.options.getUser("user") || interaction.user;
      const userAvatar = user.displayAvatarURL({
        extension: "png",
        size: 512,
        forceStatic: false,
      });

      const response = await fetch(
        `https://api.popcat.xyz/v2/communism?image=${encodeURIComponent(
          userAvatar
        )}`
      );

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const embed = createEmbed(
        "☭ Communism Effect",
        `Applied communism effect to ${user.username}'s avatar.`,
        interaction.user
      ).setImage("attachment://communism.png");

      await interaction.editReply({
        files: [{ attachment: buffer, name: "communism.png" }],
        embeds: [embed],
      });
    } catch (error) {
      console.error(error);
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(
          "⚠️ Something went wrong while trying to get the communism effect."
        );
      } else {
        await interaction.reply(
          "⚠️ Something went wrong while trying to get the communism effect."
        );
      }
    }
  },
};

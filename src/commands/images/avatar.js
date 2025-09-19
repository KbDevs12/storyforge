const { SlashCommandBuilder } = require("discord.js");
const { createEmbed } = require("../../utils/embedBuilder");
const { category } = require("../story/loot");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Get the avatar of a user or yourself")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to get the avatar of")
        .setRequired(false)
    ),
  usage: "/avatar [user](optional)",
  category: "Images",
  async execute(interaction, client) {
    try {
      const user = interaction.options.getUser("user") || interaction.user;
      const avatarUrl = user.displayAvatarURL({
        extension: "png",
        size: 1024,
        forceStatic: false,
      });
      const embed = createEmbed(
        "Avatar",
        `Here is the avatar of ${user.tag}`,
        interaction.user
      )
        .setImage(avatarUrl)
        .setFooter({
          text: `Requested by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL({
            extension: "png",
            size: 64,
            forceStatic: false,
          }),
        });
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Error executing avatar command:", error);
      await interaction.reply({
        content: "There was an error while executing this command.",
        ephemeral: true,
      });
    }
  },
};

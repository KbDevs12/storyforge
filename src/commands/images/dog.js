const { SlashCommandBuilder } = require("discord.js");
const { createEmbed } = require("../../utils/embedBuilder");
const { execute } = require("./avatar");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dog")
    .setDescription("Get a random dog image"),
  usage: "/dog",
  category: "Images",
  async execute(interaction, client) {
    try {
      const dog = await fetch("https://dog.ceo/api/breeds/image/random").then(
        (res) => res.json()
      );
      const embed = createEmbed(
        "Random Dog",
        "Here is a random dog image for you!",
        interaction.user
      ).setImage(dog.message);
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply(
        "⚠️ Something went wrong while trying to get a dog image."
      );
    }
  },
};

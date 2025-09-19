const { SlashCommandBuilder } = require("discord.js");
const { createEmbed } = require("../../utils/embedBuilder");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cat")
    .setDescription("Get a random cat image"),
  usage: "/cat",
  category: "Images",
  async execute(interaction, client) {
    try {
      const cat = await fetch(
        "https://api.thecatapi.com/v1/images/search"
      ).then((res) => res.json());
      const embed = createEmbed(
        "Random Cat",
        "Here is a random cat image for you!",
        interaction.user
      ).setImage(cat[0].url);
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Error fetching cat image:", error);
      await interaction.reply({
        content: "There was an error while fetching a cat image.",
        ephemeral: true,
      });
    }
  },
};

const { SlashCommandBuilder } = require("discord.js");
const figlet = require("figlet");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("ascii")
    .setDescription("Convert text to ASCII art")
    .addStringOption((option) =>
      option.setName("text").setDescription("Text to convert").setRequired(true)
    ),
  usage: "/ascii <text>",
  category: "Fun",
  async execute(interaction, client) {
    try {
      const text = interaction.options.getString("text");
      const asciiArt = await textToAsciiArt(text);
      await interaction.reply({ content: asciiArt });
    } catch (error) {
      console.error("Error executing /ascii command:", error);
      await interaction.reply({
        content: "An error occurred while processing your request.",
        ephemeral: true,
      });
    }
  },
};
async function textToAsciiArt(text) {
  return new Promise((resolve, reject) => {
    figlet(text, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve("```\n" + data + "\n```");
      }
    });
  });
}

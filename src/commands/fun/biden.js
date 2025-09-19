const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { createEmbed } = require("../../utils/embedBuilder");
const { execute } = require("../story/loot");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("biden")
    .setDescription("make biden tweet something")
    .addStringOption((option) =>
      option.setName("text").setDescription("text to tweet").setRequired(true)
    ),
  usage: "/biden <text>",
  category: "Fun",
  async execute(interaction, client) {
    try {
      const text = interaction.options.getString("text");
      const tweet = await fetch(
        `https://api.popcat.xyz/v2/biden?text=${encodeURIComponent(text)}`,
        { method: "GET" }
      );
      const res = await tweet.arrayBuffer();
      const buffer = Buffer.from(res);
      const embed = createEmbed(
        "Biden Tweet",
        `Here is the tweet from Biden: "${text}"`,
        interaction.user
      ).setImage("attachment://biden.png");
      await interaction.reply({
        embeds: [embed],
        files: [{ attachment: buffer, name: "biden.png" }],
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "An error occurred while fetching the tweet.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};

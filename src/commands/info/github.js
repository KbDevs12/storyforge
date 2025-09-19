const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { createEmbed } = require("../../utils/embedBuilder");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("github")
    .setDescription("Get someone github information")
    .addStringOption((option) =>
      option
        .setName("username")
        .setDescription("The github username to get information about")
        .setRequired(true)
    ),
  usage: "/github <username>",
  category: "Info",
  async execute(interaction, client) {
    try {
      const username = interaction.options.getString("username");
      const response = await fetch(
        `https://api.popcat.xyz/v2/github/${encodeURIComponent(username)}`,
        { method: "GET" }
      );
      const data = await response.json();
      if (data.error) {
        return interaction.reply({
          content: `⚠️ User **${username}** not found on GitHub.`,
          flags: MessageFlags.Ephemeral,
        });
      }
      const fixData = data.message;
      const embed = createEmbed({
        title: `GitHub Info: ${fixData.name}`,
        description: fixData.bio || "No bio available",
        fields: [
          { name: "Username", value: fixData.name || "N/A", inline: true },
          { name: "Email", value: fixData.email || "N/A", inline: true },
          { name: "Location", value: fixData.location || "N/A", inline: true },
          {
            name: "Public Repos",
            value: `${fixData.public_repos}`,
            inline: true,
          },
          { name: "Followers", value: `${fixData.followers}`, inline: true },
          { name: "Following", value: `${fixData.following}`, inline: true },
          { name: "Blog", value: fixData.blog || "N/A", inline: true },
          { name: "Company", value: fixData.company || "N/A", inline: true },
          {
            name: "Account Created",
            value: new Date(fixData.created_at).toLocaleDateString() || "N/A",
            inline: true,
          },
        ],
        thumbnail: fixData.avatar,
      });
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Error fetching GitHub data:", error);
      await interaction.reply({
        content: "⚠️ An error occurred while fetching GitHub information.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};

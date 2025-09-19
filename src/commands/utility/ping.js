const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { createEmbed } = require("../../utils/embedBuilder");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check the bot's response time"),
  usage: "/ping",
  category: "Utility",

  async execute(interaction, client) {
    try {
      await interaction.deferReply();

      const sent = Date.now();
      const latency = sent - interaction.createdTimestamp;
      const apiLatency = Math.round(client.ws.ping);

      const embed = createEmbed({
        title: "🏓 Pong!",
        fields: [
          { name: "Bot Latency", value: `${latency}ms`, inline: true },
          { name: "API Latency", value: `${apiLatency}ms`, inline: true },
        ],
      });

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error("Ping command error:", err);

      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(
          "⚠️ An error occurred while executing ping."
        );
      } else {
        await interaction.reply({
          content: "⚠️ An error occurred while executing ping.",
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  },
};

const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { createEmbed } = require("../../utils/embedBuilder");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("weather")
    .setDescription("Get the weather of a location")
    .addStringOption((option) =>
      option
        .setName("location")
        .setDescription("The location to get weather for")
        .setRequired(true)
    ),
  usage: "/weather <location>",
  category: "Info",
  async execute(interaction, client) {
    try {
      const location = interaction.options.getString("location");
      const res = await fetch(
        `https://api.popcat.xyz/v2/weather?q=${encodeURIComponent(location)}`
      );
      const data = await res.json();

      await interaction.deferReply();

      if (data.error) {
        return interaction.editReply({
          content: `⚠️ Could not find weather data for **${location}**.`,
          flags: MessageFlags.Ephemeral,
        });
      }

      const weather = data.message[0];

      const embed = createEmbed({
        title: `Weather in ${weather.location.name}`,
        thumbnail: weather.current.imageUrl,
        fields: [
          {
            name: "Temperature",
            value: `${weather.current.temperature}°C`,
            inline: true,
          },
          {
            name: "Feels Like",
            value: `${weather.current.feelslike}°C`,
            inline: true,
          },
          { name: "Condition", value: weather.current.skytext, inline: true },
          {
            name: "Humidity",
            value: `${weather.current.humidity}%`,
            inline: true,
          },
          { name: "Wind", value: weather.current.winddisplay, inline: true },
          {
            name: "Observation Time",
            value: weather.current.observationtime,
            inline: true,
          },
          {
            name: "Forecast",
            value: weather.forecast
              .map(
                (day) =>
                  ` **${day.day}**\n` +
                  `• Condition: ${day.skytextday}\n` +
                  `• Temp: ${day.low}°C - ${day.high}°C\n` +
                  `• Precipitation: ${day.precip}%`
              )
              .join("\n\n"),
          },
        ],
        footer: `Last Updated: ${weather.current.date} at ${weather.current.observationtime}`,
      });

      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Weather command error:", error);
      return interaction.editReply({
        content: "❌ An error occurred while fetching weather data.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};

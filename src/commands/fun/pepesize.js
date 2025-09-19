const { SlashCommandBuilder } = require("discord.js");
const { createEmbed } = require("../../utils/embedBuilder");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("pepesize")
    .setDescription("Get a your`s friend pepe size")
    .addUserOption((option) =>
      option.setName("user").setDescription("Select a user").setRequired(true)
    ),
  usage: "/pepesize <user>",
  category: "Fun",
  execute(interaction, client) {
    let m;
    const user = interaction.options.getUser("user");
    const randomSize = Math.floor(Math.random() * 12) + 3;

    const pepeSize = "8" + "=".repeat(randomSize) + "D";
    if (randomSize <= 5) {
      m = "That`s a cute pepe:3";
    } else {
      m = "It`s so big man!";
    }
    const embed = createEmbed({
      title: `${user.username}'s Pepe Size`,
      description: "```\n" + pepeSize + "\n```",
      thumbnail: user.displayAvatarURL({ dynamic: true }),
      footer: m,
    });
    interaction.reply({ embeds: [embed] });
  },
};

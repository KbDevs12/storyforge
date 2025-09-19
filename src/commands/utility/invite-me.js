const { SlashCommandBuilder } = require("discord.js");
const { createEmbed } = require("../../utils/embedBuilder");
const { inviteLink } = require("../../../config.json");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("invite-me")
    .setDescription("Get an invite link to add the bot to your server"),
  usage: "/invite-me",
  category: "Utility",
  execute(interaction, client) {
    const embed = createEmbed({
      title: "Invite Me",
      description: `[Click here to invite the bot to your server](${inviteLink})`,
      footer: "Thank you for using Storyforge!",
    }).setThumbnail(client.user.displayAvatarURL({ dynamic: true }));
    return interaction.reply({ embeds: [embed] });
  },
};

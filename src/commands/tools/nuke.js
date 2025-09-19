const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { createEmbed } = require("../../utils/embedBuilder");
const { execute } = require("./nickname");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("nuke")
    .setDescription("Nuke a channel (admin only)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  usage: "/nuke",
  category: "Tools",
  async execute(interaction, client) {
    try {
      if (
        interaction.user.id !== interaction.guild.ownerId &&
        !interaction.memberPermissions.has(PermissionFlagsBits.Administrator)
      ) {
        return interaction.reply(
          "⚠️ You need to be the server owner or have administrator permissions to use this command."
        );
      }
      if (
        !interaction.guild.members.me.permissions.has(
          PermissionFlagsBits.ManageChannels
        )
      ) {
        return interaction.reply(
          "⚠️ I do not have permission to manage channels."
        );
      }
      const channel = interaction.channel;
      const clonedChannel = await channel.clone();
      await channel.delete();
      await clonedChannel.setPosition(channel.position);
      const embed = createEmbed({
        title: "Channel Nuked",
        description: `<a:b_yes:721969088813072425> This channel has been nuked by ${interaction.user.username}.`,
        color: "#FF0000",
        thumbnail: `https://media.giphy.com/media/oe33xf3B50fsc/giphy.gif`,
      });
      return clonedChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error("Error executing nuke command:", error);
      return interaction.reply(
        "⚠️ An error occurred while trying to nuke the channel."
      );
    }
  },
};

const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cooldown")
    .setDescription("set a channel cooldown")
    .addIntegerOption((o) =>
      o
        .setName("number")
        .setDescription("amount to set cooldown")
        .setMinValue(0)
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  usage: "/cooldown <amount>",
  category: "Tools",
  async execute(interaction, client) {
    try {
      if (
        !interaction.guild.members.me.permissions.has(
          PermissionFlagsBits.ManageChannels
        )
      ) {
        return interaction.reply(
          "Missing Permission! I need `Manage Channels` permission to set cooldown."
        );
      }
      if (
        !interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)
      ) {
        return interaction.reply(
          "You need `Manage Channels` permission to set cooldown."
        );
      }
      const amount = interaction.options.getInteger("number") || 0;
      interaction.channel.setRateLimitPerUser(
        amount,
        `Set by ${interaction.user.tag}`
      );
      return interaction.reply({
        content: `<a:b_yes:721969088813072425> Set the channel cooldown to **${amount}** seconds.`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: `❌ An error occurred while setting the cooldown.`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};

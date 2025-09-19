const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { data } = require("./nickname");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Bulk delete messages (admin only)")
    .addIntegerOption((o) =>
      o
        .setName("amount")
        .setDescription("Number of messages to delete (max 100)")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  usage: "/purge amount:<amount>",
  category: "Tools",
  async execute(interaction, client) {
    try {
      const amount = interaction.options.getInteger("amount");
      if (!interaction.member.permissions.has("MANAGE_MESSAGES")) {
        return interaction.reply(
          "⚠️ You do not have permission to use this command."
        );
      }
      const deleted = await interaction.channel.bulkDelete(amount, true);
      return interaction
        .reply(`<a:b_yes:721969088813072425> Deleted ${deleted.size} messages.`)
        .then((msg) => {
          setTimeout(() => msg.delete(), 5000);
        });
    } catch (error) {
      console.error(error);
      return interaction.reply(
        "⚠️ An error occurred while trying to purge messages."
      );
    }
  },
};

const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { usage, execute } = require("../story/loot");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("nickname")
    .setDescription("Change a member's nickname (admin only)")
    .addUserOption((o) =>
      o
        .setName("user")
        .setDescription("The user to change the nickname for")
        .setRequired(true)
    )
    .addStringOption((o) =>
      o
        .setName("nickname")
        .setDescription("The new nickname for the user")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames),
  usage: "/nickname user:<user> nickname:<nickname>",
  category: "Tools",
  async execute(interaction, client) {
    try {
      const target = interaction.options.getMember("user");
      const newNickname = interaction.options.getString("nickname");

      if (client.user.id === target.id) {
        return interaction.reply("⚠️ I cannot change my own nickname.");
      }

      if (
        interaction.member.roles.highest.position <=
          target.roles.highest.position &&
        interaction.guild.ownerId !== interaction.user.id
      ) {
        return interaction.reply(
          "⚠️ You cannot change the nickname of this user due to role hierarchy."
        );
      }
      if (!target.manageable) {
        return interaction.reply(
          "⚠️ I cannot change the nickname of this user due to role hierarchy."
        );
      }
      if (newNickname.length > 32) {
        return interaction.reply(
          "⚠️ Nickname cannot be longer than 32 characters."
        );
      }
      if (
        !interaction.guild.members.me.permissions.has(
          PermissionFlagsBits.ManageNicknames
        )
      ) {
        return interaction.reply(
          "⚠️ I do not have permission to change nicknames."
        );
      }

      await target.setNickname(newNickname);
      return interaction.reply(
        `<a:b_yes:721969088813072425> Nickname changed to **${newNickname}**.`
      );
    } catch (error) {
      console.error(error);
      return interaction.reply(
        "⚠️ An error occurred while changing the nickname."
      );
    }
  },
};

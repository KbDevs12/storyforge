const { SlashCommandBuilder } = require("discord.js");
const {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("calculator")
    .setDescription("Opens an interactive calculator"),

  async execute(interaction, client) {
    let expression = "";

    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("Calculator")
      .setDescription("```\n0\n```")
      .setFooter({ text: "Only the command user can use the calculator" });

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("7")
        .setLabel("7")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("8")
        .setLabel("8")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("9")
        .setLabel("9")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("/")
        .setLabel("÷")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("clear")
        .setLabel("C")
        .setStyle(ButtonStyle.Danger)
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("4")
        .setLabel("4")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("5")
        .setLabel("5")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("6")
        .setLabel("6")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("*")
        .setLabel("×")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("backspace")
        .setLabel("⌫")
        .setStyle(ButtonStyle.Danger)
    );

    const row3 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("1")
        .setLabel("1")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("2")
        .setLabel("2")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("3")
        .setLabel("3")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("-")
        .setLabel("-")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("=")
        .setLabel("=")
        .setStyle(ButtonStyle.Success)
    );

    const row4 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("0")
        .setLabel("0")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(".")
        .setLabel(".")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("+")
        .setLabel("+")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("end")
        .setLabel("End")
        .setStyle(ButtonStyle.Danger)
    );

    const rows = [row1, row2, row3, row4];

    const message = await interaction.reply({
      embeds: [embed],
      components: rows,
      fetchReply: true,
    });

    const collector = message.createMessageComponentCollector({
      filter: (i) => i.user.id === interaction.user.id,
      time: 300000,
    });

    collector.on("collect", async (i) => {
      const id = i.customId;

      if (id === "=") {
        try {
          const sanitizedExp = expression.replace(/[^0-9+\-*/().]/g, "");
          const result = Function(
            '"use strict";return (' + sanitizedExp + ")"
          )();
          expression = result.toString();
        } catch (error) {
          expression = "Error";
        }
      } else if (id === "clear") {
        expression = "";
      } else if (id === "end") {
        collector.stop();
        return;
      } else if (id === "backspace") {
        expression = expression.slice(0, -1);
      } else {
        expression += id;
      }

      const updatedEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle("Calculator")
        .setDescription(`\`\`\`\n${expression || "0"}\n\`\`\``)
        .setFooter({ text: "Only the command user can use the calculator" });

      await i.update({ embeds: [updatedEmbed], components: rows });
    });

    collector.on("end", async () => {
      const disabledRows = rows.map((row) => {
        const newRow = ActionRowBuilder.from(row);
        newRow.components.forEach((button) => button.setDisabled(true));
        return newRow;
      });

      const finalEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle("Calculator")
        .setDescription(`\`\`\`\n${expression || "0"}\n\`\`\``)
        .setFooter({ text: "Calculator session ended" });

      await interaction.editReply({
        embeds: [finalEmbed],
        components: disabledRows,
      });
    });
  },
};

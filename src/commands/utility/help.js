const {
  SlashCommandBuilder,
  MessageFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { createEmbed } = require("../../utils/embedBuilder");
const { getUsage } = require("../../utils/usage");

function groupByCategory(commands) {
  const map = new Map();
  for (const cmd of commands) {
    const cat = (cmd.category || "General").toString();
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat).push(cmd);
  }
  const categories = [...map.keys()].sort((a, b) =>
    a.localeCompare(b, "en", { sensitivity: "base" })
  );
  for (const cat of categories) {
    map.get(cat).sort((a, b) => a.data.name.localeCompare(b.data.name));
  }
  return { categories, map };
}

function buildPageEmbed(category, commands, pageIndex, totalPages) {
  const fields = commands.slice(0, 25).map((cmd) => {
    const usages = getUsage(cmd);
    const description = cmd.data?.description || "No description";
    return {
      name: `/${cmd.data.name}`,
      value: `• Description: ${description}\n• Usage:\n${usages
        .map((u) => `  - ${u}`)
        .join("\n")}`,
    };
  });

  const hiddenCount = Math.max(commands.length - 25, 0);
  return createEmbed({
    title: `Help — ${category} (${pageIndex + 1}/${totalPages})`,
    description: "Use the buttons below to navigate categories.",
    fields,
    footer:
      hiddenCount > 0
        ? `+${hiddenCount} more commands in this category not shown`
        : undefined,
  });
}

function buildNavRow(ownerId, session, pageIndex, totalPages) {
  const prevDisabled = pageIndex <= 0;
  const nextDisabled = pageIndex >= totalPages - 1;

  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`help:nav:${ownerId}:${session}:${pageIndex - 1}`)
      .setLabel("◀ Prev")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(prevDisabled),
    new ButtonBuilder()
      .setCustomId(`help:nav:${ownerId}:${session}:${pageIndex + 1}`)
      .setLabel("Next ▶")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(nextDisabled),
    new ButtonBuilder()
      .setCustomId(`help:close:${ownerId}:${session}`)
      .setLabel("Close")
      .setStyle(ButtonStyle.Danger)
  );
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("List of available commands"),
  category: "utility",
  usage: "/help",
  async execute(interaction, client) {
    const all = [...client.commands.values()];
    const { categories, map } = groupByCategory(all);

    if (categories.length === 0) {
      return interaction.reply({
        content: "No commands available.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const ownerId = interaction.user.id;
    const session = Date.now().toString(36);
    const pageIndex = 0;
    const totalPages = categories.length;

    const category = categories[pageIndex];
    const cmds = map.get(category) || [];
    const embed = buildPageEmbed(category, cmds, pageIndex, totalPages);
    const row = buildNavRow(ownerId, session, pageIndex, totalPages);

    await interaction.reply({
      embeds: [embed],
      components: [row],
      flags: MessageFlags.Ephemeral,
    });
  },
};

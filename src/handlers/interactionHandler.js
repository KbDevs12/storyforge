const { Events, MessageFlags } = require("discord.js");
const { createEmbed } = require("../utils/embedBuilder");
const { getUsage } = require("../utils/usage");

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

module.exports = (client) => {
  client.handleInteraction = async (interaction) => {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) {
        console.error(
          `No command matching ${interaction.commandName} was found.`
        );
        return;
      }

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(`Error executing ${interaction.commandName}:`, error);

        try {
          if (interaction.deferred) {
            await interaction
              .editReply({
                content: "There was an error executing this command!",
              })
              .catch((e) => console.error("Could not edit reply:", e));
          } else if (!interaction.replied) {
            await interaction
              .reply({
                content: "There was an error executing this command!",
                flags: MessageFlags.Ephemeral,
              })
              .catch((e) => console.error("Could not reply:", e));
          } else {
            await interaction
              .followUp({
                content: "There was an error executing this command!",
                flags: MessageFlags.Ephemeral,
              })
              .catch((e) => console.error("Could not follow up:", e));
          }
        } catch (followupError) {
          console.error(
            "Error while handling the error response:",
            followupError
          );
        }
      }
      return;
    }

    if (interaction.isButton()) {
      const id = interaction.customId;
      if (id.startsWith("help:")) {
        const parts = id.split(":");
        const action = parts[1];
        const ownerId = parts[2];
        const session = parts[3];

        if (interaction.user.id !== ownerId) {
          return interaction.reply({
            content: "You cannot control someone else's help menu.",
            flags: MessageFlags.Ephemeral,
          });
        }

        const all = [...client.commands.values()];
        const { categories, map } = groupByCategory(all);
        const totalPages = categories.length;

        if (action === "close") {
          return interaction.update({ components: [] }).catch(() => {});
        }

        if (action === "nav") {
          const targetIndex = Math.max(
            0,
            Math.min(totalPages - 1, parseInt(parts[4], 10) || 0)
          );

          const category = categories[targetIndex];
          const cmds = map.get(category) || [];
          const embed = buildPageEmbed(category, cmds, targetIndex, totalPages);

          const {
            ActionRowBuilder,
            ButtonBuilder,
            ButtonStyle,
          } = require("discord.js");

          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(
                `help:nav:${ownerId}:${session}:${Math.max(0, targetIndex - 1)}`
              )
              .setLabel("◀ Prev")
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(targetIndex <= 0),
            new ButtonBuilder()
              .setCustomId(
                `help:nav:${ownerId}:${session}:${Math.min(
                  totalPages - 1,
                  targetIndex + 1
                )}`
              )
              .setLabel("Next ▶")
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(targetIndex >= totalPages - 1),
            new ButtonBuilder()
              .setCustomId(`help:close:${ownerId}:${session}`)
              .setLabel("Close")
              .setStyle(ButtonStyle.Danger)
          );

          return interaction
            .update({ embeds: [embed], components: [row] })
            .catch(() => {});
        }
      }
      return;
    }

    if (interaction.isStringSelectMenu()) {
      // Tambahkan handler select menu bila perlu
      return;
    }

    if (interaction.isModalSubmit()) {
      // Tambahkan handler modal bila perlu
      return;
    }
  };

  client.on(Events.InteractionCreate, client.handleInteraction);
};

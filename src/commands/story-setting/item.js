const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { createEmbed } = require("../../utils/embedBuilder");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("item")
    .setDescription("Manage story items (admin only)")
    .addSubcommand((sc) =>
      sc
        .setName("add")
        .setDescription("Add a new item to the server's theme")
        .addStringOption((opt) =>
          opt
            .setName("item_name")
            .setDescription("Name of the item")
            .setRequired(true)
        )
        .addStringOption((opt) =>
          opt
            .setName("rarity")
            .setDescription("Rarity of the item")
            .setRequired(true)
        )
        .addStringOption((opt) =>
          opt
            .setName("type")
            .setDescription("Type of the item (e.g., weapon, armor)")
            .setRequired(true)
        )
        .addStringOption((opt) =>
          opt
            .setName("description")
            .setDescription("Description of the item")
            .setRequired(true)
        )
    )
    .addSubcommand((sc) =>
      sc
        .setName("remove")
        .setDescription("Remove an item from the server's theme")
        .addStringOption((opt) =>
          opt
            .setName("item_name")
            .setDescription("Name of the item to remove")
            .setRequired(true)
        )
    )
    .addSubcommand((sc) =>
      sc.setName("list").setDescription("List all items in the server's theme")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  usage: "/item [add|remove|list] [options]",
  category: "Story Setting",
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
      const prisma = client.db;
      const sub = interaction.options.getSubcommand();
      const serverId = BigInt(interaction.guild.id);

      const server = await client.getServer(serverId);
      if (!server || !server.theme_id) {
        return interaction.reply(
          "⚠️ This server does not have a theme set. Use `/theme set` first."
        );
      }

      switch (sub) {
        case "add": {
          const itemName = interaction.options.getString("item_name");
          const rarity = interaction.options.getString("rarity");
          const type = interaction.options.getString("type");
          const description = interaction.options.getString("description");

          const existingItem = await prisma.items.findFirst({
            where: { name: itemName },
          });

          if (existingItem) {
            return interaction.reply(
              "⚠️ An item with that name already exists in this theme."
            );
          }
          await prisma.items.create({
            data: {
              theme_id: server.theme_id,
              type,
              name: itemName,
              rarity,
              description,
            },
          });
          return interaction.reply(
            `✅ Item **${itemName}** added to the theme.`
          );
        }
        case "remove": {
          const itemName = interaction.options.getString("item_name");
          const item = await prisma.items.findFirst({
            where: { theme_id: server.theme_id, name: itemName },
          });

          if (!item) {
            return interaction.reply(
              "⚠️ No item with that name exists in this theme."
            );
          }
          await prisma.items.delete({
            where: { id: item.id },
          });
          return interaction.reply(
            `✅ Item **${itemName}** removed from the theme.`
          );
        }
        case "list": {
          const items = await prisma.items.findMany({
            where: { theme_id: server.theme_id },
          });
          if (items.length === 0) {
            return interaction.reply("⚠️ No items found in this theme.");
          }
          const itemList = items
            .map(
              (item) =>
                `- **${item.name}** (Rarity: ${item.rarity}, Type: ${item.type})`
            )
            .join("\n");
          const embed = createEmbed({
            title: "Items in Current Theme",
            description: itemList,
            footer: "Use /item add or /item remove to manage items.",
          });
          return interaction.reply({ embeds: [embed] });
        }
      }
    } catch (error) {
      console.error("Error executing item command:", error);
      return interaction.reply(
        "⚠️ An error occurred while executing the command."
      );
    }
  },
};

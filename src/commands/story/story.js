const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("story")
    .setDescription("Start or manage your story")
    .addSubcommand((sc) =>
      sc
        .setName("add")
        .setDescription("Add a new entry to your story")
        .addStringOption((opt) =>
          opt
            .setName("content")
            .setDescription("The content of your story entry")
            .setRequired(true)
        )
        .addIntegerOption((opt) =>
          opt
            .setName("item_id")
            .setDescription("ID of item to use for this entry")
            .setRequired(true)
        )
    )
    .addSubcommand((sc) =>
      sc.setName("view").setDescription("View your current story")
    )
    .addSubcommand((sc) =>
      sc.setName("save").setDescription("Save this month's story(admin only)")
    ),
  usage: "/story [add|view|save] [options]",
  category: "Story",

  async execute(interaction, client) {
    try {
      const prisma = client.db;
      const serverId = BigInt(interaction.guild.id);
      const userId = BigInt(interaction.user.id);
      const sub = interaction.options.getSubcommand();

      const server = await client.getServer(serverId);
      if (!server || !server.theme_id) {
        return interaction.reply(
          "⚠️ This server does not have a theme set. Use `/theme set` first."
        );
      }
      const now = new Date();
      let story = await prisma.stories.findFirst({
        where: {
          server_id: serverId,
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        },
      });
      if (!story) {
        story = await client.createStory(
          serverId,
          server.theme_id,
          now.getMonth() + 1,
          now.getFullYear()
        );
      }

      switch (sub) {
        case "add": {
          const content = interaction.options.getString("content");
          const itemId = interaction.options.getInteger("item_id");

          const userItem = await prisma.user_items.findFirst({
            where: {
              user_id: userId,
              server_id: serverId,
              item_id: itemId,
            },
          });

          if (!userItem) {
            return interaction.reply("⚠️ You don't own this item.");
          }

          await client.addStoryEntry(story.id, userId, content, itemId);
          const count = await prisma.story_entries.count({
            where: { user_id: userId, server_id: serverId },
          });
          const achievements = await prisma.achievements.findMany({
            where: {
              condition_type: "story_entries",
              condition_value: { lte: count },
            },
          });

          for (const ach of achievements) {
            const awarded = await client.awardAchievement(
              userId,
              serverId,
              ach.id
            );
            if (awarded) {
              interaction.followUp(
                `🏆 You earned the achievement: **${ach.name}**!`
              );
            }
          }
          return interaction.reply("✅ Story entry added!");
        }
        case "view": {
          const entries = await prisma.story_entries.findMany({
            where: { story_id: story.id },
            orderBy: { created_at: "asc" },
          });

          if (entries.length === 0) return interaction.reply("No entries yet.");

          const story = entries
            .map((e) => `- <@${e.user_id}>: ${e.content}`)
            .join("\n");
          return interaction.reply(`📖 Current Story:\n${story}`);
        }
        case "save": {
          if (
            interaction.user.id !== interaction.guild.ownerId &&
            !interaction.memberPermissions.has(
              PermissionFlagsBits.Administrator
            )
          ) {
            return interaction.reply(
              "⚠️ You need to be the server owner or have administrator permissions to use this command."
            );
          }

          if (entries.length === 0) {
            return interaction.reply("⚠️ No entries to save for this month.");
          }
          const entries = await prisma.story_entries.findMany({
            where: { story_id: story.id },
            orderBy: { created_at: "asc" },
          });

          if (entries.length === 0) {
            return interaction.reply("⚠️ No entries to save for this month.");
          }

          const monthName = now.toLocaleString("default", { month: "long" });
          const storyTitle = `# Monthly Story - ${monthName} ${now.getFullYear()}`;

          const storyContent = entries
            .map((e) => `## Entry by <@${e.user_id}>\n\n${e.content}`)
            .join("\n\n---\n\n");

          const formattedStory = `${storyTitle}\n\n${storyContent}`;

          return interaction.reply({
            content: "✅ Story saved successfully!",
            files: [
              {
                attachment: Buffer.from(formattedStory),
                name: `story-${now.getFullYear()}-${now.getMonth() + 1}.md`,
              },
            ],
          });
        }
      }
    } catch (error) {
      console.error("Error executing story command:", error);
      return interaction.reply(
        "⚠️ An error occurred while executing the command."
      );
    }
  },
};

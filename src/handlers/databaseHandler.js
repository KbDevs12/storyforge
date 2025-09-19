const prisma = require("../utils/database");

module.exports = async (client) => {
  client.db = prisma;

  client.getUserAchievements = async (userId, serverId) => {
    try {
      const achievements = await prisma.user_achievements.findMany({
        where: {
          user_id: userId.toString(),
          server_id: serverId.toString(),
        },
        include: {
          achievements: true,
        },
      });
      return achievements;
    } catch (error) {
      console.error("Error fetching user achievements:", error);
      return [];
    }
  };

  client.getUserItems = async (userId, serverId) => {
    try {
      const userItems = await prisma.user_items.findMany({
        where: {
          user_id: BigInt(userId),
          server_id: BigInt(serverId),
        },
      });

      if (userItems.length > 0) {
        const itemIds = userItems
          .map((ui) => ui.item_id)
          .filter((id) => id !== null);
        const items = await prisma.items.findMany({
          where: {
            id: {
              in: itemIds.map((id) => BigInt(id)),
            },
          },
        });

        return userItems.map((ui) => {
          const itemDetails = items.find((item) => item.id === ui.item_id);
          return {
            ...ui,
            itemDetails,
          };
        });
      }

      return userItems;
    } catch (error) {
      console.error("Error fetching user items:", error);
      return [];
    }
  };

  client.getServer = async (serverId) => {
    try {
      return await prisma.servers.findUnique({
        where: {
          id: BigInt(serverId),
        },
      });
    } catch (error) {
      console.error("Error fetching server:", error);
      return null;
    }
  };

  client.createOrUpdateServer = async (
    serverId,
    serverName,
    themeId = null
  ) => {
    try {
      return await prisma.servers.upsert({
        where: {
          id: BigInt(serverId),
        },
        update: {
          name: serverName,
          theme_id: themeId ? Number(themeId) : null,
        },
        create: {
          id: BigInt(serverId),
          name: serverName,
          theme_id: themeId ? Number(themeId) : null,
        },
      });
    } catch (error) {
      console.error("Error creating/updating server:", error);
      return null;
    }
  };

  client.createStory = async (serverId, themeId = null, month, year) => {
    try {
      return await prisma.stories.create({
        data: {
          server_id: BigInt(serverId),
          theme_id: themeId,
          month,
          year,
        },
      });
    } catch (error) {
      console.error("Error creating story:", error);
      return null;
    }
  };

  client.addStoryEntry = async (
    storyId,
    userId,
    content,
    usedItemId = null
  ) => {
    try {
      return await prisma.story_entries.create({
        data: {
          story_id: storyId,
          user_id: BigInt(userId),
          content,
          used_item_id: usedItemId,
        },
      });
    } catch (error) {
      console.error("Error adding story entry:", error);
      return null;
    }
  };

  client.giveItemToUser = async (userId, serverId, itemId) => {
    try {
      return await prisma.user_items.create({
        data: {
          user_id: BigInt(userId),
          server_id: BigInt(serverId),
          item_id: Number(itemId),
        },
      });
    } catch (error) {
      console.error("Error giving item to user:", error);
      return null;
    }
  };

  client.createTrade = async (serverId, fromUser, toUser, itemId) => {
    try {
      return await prisma.trades.create({
        data: {
          server_id: BigInt(serverId),
          from_user: BigInt(fromUser),
          to_user: BigInt(toUser),
          item_id: itemId,
          status: "pending",
        },
      });
    } catch (error) {
      console.error("Error creating trade:", error);
      return null;
    }
  };

  client.awardAchievement = async (userId, serverId, achievementId) => {
    try {
      const existingAchievement = await prisma.user_achievements.findFirst({
        where: {
          user_id: userId.toString(),
          server_id: serverId.toString(),
          achievement_id: achievementId,
        },
      });

      if (existingAchievement) {
        return existingAchievement;
      }

      return await prisma.user_achievements.create({
        data: {
          user_id: userId.toString(),
          server_id: serverId.toString(),
          achievement_id: achievementId,
        },
      });
    } catch (error) {
      console.error("Error awarding achievement:", error);
      return null;
    }
  };

  client.createTheme = async (serverId, name, description) => {
    try {
      return await prisma.themes.create({
        data: {
          server_id: BigInt(serverId),
          name,
          description,
        },
      });
    } catch (error) {
      console.error("Error creating theme:", error);
      return null;
    }
  };

  client.getServerThemes = async (serverId) => {
    try {
      return await prisma.themes.findMany({
        where: {
          server_id: BigInt(serverId),
        },
      });
    } catch (error) {
      console.error("Error fetching server themes:", error);
      return [];
    }
  };

  const connectDatabase = async () => {
    try {
      await prisma.$connect();
      console.log("Connected to MySQL database successfully");
      return true;
    } catch (error) {
      console.error("Failed to connect to database:", error);
      return false;
    }
  };

  const connected = await connectDatabase();
  if (!connected) {
    console.error(
      "Database connection failed. Bot may not function correctly."
    );
  }
};

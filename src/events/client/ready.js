module.exports = {
  name: "clientReady",
  once: true,
  async execute(client) {
    console.log(`Logged in as ${client.user.tag}!`);

    try {
      await client.user.setPresence({
        activities: [{ name: "with stories", type: 0 }],
        status: "online",
      });
      console.log("Initial presence set successfully");

      setInterval(async () => {
        const activities = [
          { name: "with stories", type: 0 },
          { name: "to your tales", type: 2 },
          { name: "your adventures", type: 3 },
        ];

        const activity =
          activities[Math.floor(Math.random() * activities.length)];
        try {
          await client.user.setPresence({
            activities: [activity],
            status: "online",
          });
          console.log(`Presence updated to: ${activity.name}`);
        } catch (error) {
          console.error("Failed to update presence:", error);
        }
      }, 30 * 60 * 1000);
    } catch (error) {
      console.error("Failed to set initial presence:", error);
    }
  },
};

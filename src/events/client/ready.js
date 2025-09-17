module.exports = (client) => {
  client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);

    client.user.setPresence({
      activities: [
        {
          name: "with stories",
          type: 0,
        },
      ],
      status: "online",
    });

    setInterval(() => {
      const activities = [
        { name: "with stories", type: 0 },
        { name: "to your tales", type: 2 },
        { name: "your adventures", type: 3 },
      ];

      const activity =
        activities[Math.floor(Math.random() * activities.length)];

      client.user.setPresence({
        activities: [activity],
        status: "online",
      });
    }, 30 * 60 * 1000);
  });
};

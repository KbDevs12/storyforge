const { createEmbed } = require("../../utils/embedBuilder");
module.exports = {
  name: "messageCreate",
  once: false,
  execute(message) {
    if (message.mentions.has(message.client.user.id) && !message.author.bot) {
      const embed = createEmbed({
        title: "Hello! 👋",
        description: `You mentioned me, ${message.author.username}? How can I assist you today?`,
        footer: "I'm here to help!",
      });
      message.channel.send({ embeds: [embed] });
    }
  },
};

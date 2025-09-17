module.exports = {
  name: "messageCreate",
  once: false,
  execute(message) {
    if (message.mentions.has(message.client.user.id) && !message.author.bot) {
      message.reply(`Hello ${message.author.username}, you mentioned me?`);
    }
  },
};

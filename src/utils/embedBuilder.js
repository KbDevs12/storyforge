const { EmbedBuilder } = require("discord.js");
const config = require("../../config.json");

function createEmbed(options = {}) {
  const {
    title,
    description,
    color = config.embedColor,
    fields = [],
    footer = config.footerText,
    thumbnail,
    image,
    author,
    timestamp = true,
  } = options;

  const embed = new EmbedBuilder().setColor(color);

  if (title) embed.setTitle(title);
  if (description) embed.setDescription(description);
  if (fields.length > 0) embed.addFields(fields);
  if (footer) embed.setFooter({ text: footer });
  if (thumbnail) embed.setThumbnail(thumbnail);
  if (image) embed.setImage(image);
  if (author) embed.setAuthor(author);
  if (timestamp) embed.setTimestamp();

  return embed;
}

module.exports = { createEmbed };

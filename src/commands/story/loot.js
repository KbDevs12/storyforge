const { SlashCommandBuilder } = require("discord.js");

const TYPES = ["character", "weapon", "location", "item", "ability"];
const RARITIES = ["common", "uncommon", "rare", "epic", "legendary"];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("loot")
    .setDescription("Generate a random loot item"),
};

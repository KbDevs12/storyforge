module.exports = {
  name: "shardReady",
  once: false,
  execute(id, unavailableGuilds, client) {
    console.log(
      `Shard ${id} ready (${unavailableGuilds?.size ?? 0} unavailable guilds)`
    );
  },
};
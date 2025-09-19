module.exports = {
  name: "shardError",
  once: false,
  execute(error, shardId) {
    console.error(`Shard ${shardId} error:`, error);
  },
};

module.exports = {
  name: "invalidated",
  once: false,
  async execute(client) {
    console.error("Gateway session invalidated. Shutting down...");
    try {
      await client.destroy();
    } finally {
      process.exit(1);
    }
  },
};

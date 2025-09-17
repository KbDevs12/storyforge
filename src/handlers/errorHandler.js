module.exports = (client) => {
  process.on("unhandledRejection", (reason, promise) => {
    console.log("Unhandled Rejection at:", promise, "reason:", reason);
  });

  process.on("uncaughtException", (error) => {
    console.log("Uncaught Exception:", error);
  });

  client.on("error", (error) => {
    console.error("Discord client error:", error);
  });
};

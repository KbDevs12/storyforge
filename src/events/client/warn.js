module.exports = {
  name: "warn",
  once: false,
  execute(info) {
    console.warn("[WARN]", info);
  },
};
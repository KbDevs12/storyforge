const { PrismaClient } = require("../generated/prisma");

let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ["query", "info", "warn", "error"],
    });
  }
  prisma = global.prisma;
}

/**
 * Helper function to safely convert values to BigInt
 * @param {string|number} value - The value to convert
 * @returns {BigInt|null} - The converted BigInt or null if conversion fails
 */
const toBigInt = (value) => {
  if (value === null || value === undefined) return null;
  try {
    return BigInt(value);
  } catch (error) {
    console.error(`Failed to convert value to BigInt: ${value}`);
    return null;
  }
};

/**
 * Helper function to safely handle BigInt serialization for JSON
 * @param {Object} data - Object potentially containing BigInt values
 * @returns {Object} - Object with BigInt converted to strings for JSON serialization
 */
const serializeBigInt = (data) => {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
};

Object.assign(prisma, {
  toBigInt,
  serializeBigInt,
});

module.exports = prisma;

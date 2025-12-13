const { initializeDatabase } = require("../db/db.connect");
const Product = require("../models/product.model");

const deleteAllProducts = async () => {
  try {
    await initializeDatabase();
    const result = await Product.deleteMany({});
    console.log(`Deleted ${result.deletedCount} products.`);
  } catch (error) {
    console.error("Error deleting all products:", error);
  } finally {
    process.exit();
  }
};

deleteAllProducts();
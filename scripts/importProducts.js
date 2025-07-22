const fs = require("fs");
const Product = require("../models/product.model");
const { initializeDatabase } = require("../db/db.connect");

const importProducts = async () => {
  await initializeDatabase();

  try {
    const products = JSON.parse(
      fs.readFileSync("data/products_final.json", "utf-8")
    );
    await Product.insertMany(products);
    console.log("Products seeded successfully.");
  } catch (error) {
    console.error("Error inserting products:", error);
  } finally {
    process.exit();
  }
};

importProducts();

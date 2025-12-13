// removeDuplicates.js
const fs = require("fs");
const path = require("path");

// Load original data
const filePath = path.join(__dirname, "..",  "data", "products_cleaned_titles.json");
const raw = fs.readFileSync(filePath, "utf8");
const products = JSON.parse(raw);

// Use a Map to ensure uniqueness by title
const uniqueMap = new Map();

products.forEach((prod) => {
  if (!uniqueMap.has(prod.title)) {
    uniqueMap.set(prod.title, prod);
  }
});

// Convert back to array of unique values
const deduped = Array.from(uniqueMap.values());

console.log(`Reduced from ${products.length} to ${deduped.length} products.`);

// Save result to new JSON (or overwrite)
fs.writeFileSync(
  path.join(__dirname, "..", "data", "products_unique.json"),
  JSON.stringify(deduped, null, 2),
  "utf8"
);

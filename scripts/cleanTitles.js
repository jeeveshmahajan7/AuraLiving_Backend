const fs = require("fs");

const products = require("../data/products_cleaned.json");

const cleanedProducts = products.map((product) => {
  return { ...product, title: product.title.split(" #")[0] };
});

fs.writeFileSync(
  "products_cleaned_titles.json",
  JSON.stringify(cleanedProducts, null, 2)
);

console.log(
  `✅ Cleaned titles file saved. ${cleanedProducts.length} products corrected.`
);

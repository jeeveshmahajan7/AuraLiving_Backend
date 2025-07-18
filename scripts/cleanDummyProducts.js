const fs = require("fs");

const products = require("../data/products_500_real_images.json");

const filteredProducts = products.filter(
  (product) => !product.imgUrl.startsWith("https://example.com")
);

fs.writeFileSync(
  "products_cleaned.json",
  JSON.stringify(filteredProducts, null, 2)
);

console.log(
  `✅ Cleaned file saved. ${filteredProducts.length} products retained.`
);

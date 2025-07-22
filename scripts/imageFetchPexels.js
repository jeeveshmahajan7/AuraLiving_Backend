const fs = require("fs");
require("dotenv").config();
const fetch = require("node-fetch"); // npm install node-fetch@2

const accessKey = process.env.PEXELS_KEY;
const products = require("../data/products_data");

const fetchImageUrl = async (query) => {
  const res = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(
      query
    )}&per_page=1`,
    {
      headers: {
        Authorization: accessKey,
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch image for ${query}`);
  }

  const data = await res.json();

  if (data.photos && data.photos.length > 0) {
    return data.photos[0].src.large;
  } else {
    throw new Error(`No images found for ${query}`);
  }
};

(async () => {
  for (let product of products) {
    try {
      const searchTerm = product.title.split("#")[0]; // remove #123 if any
      product.imgUrl = await fetchImageUrl(searchTerm);
      console.log("✅ Updated", product.title);
    } catch (error) {
      console.error("❌ Error occured for:", product.title, ":", error.message);
    }
  }

  fs.writeFileSync("../data/products_final.json", JSON.stringify(products, null, 2));

  console.log("🎉 Done! See products_500_real_images.json");
})();

const { initializeDatabase } = require("./db/db.connect");
const Product = require("./models/product.model");
initializeDatabase();

const express = require("express");
const app = express();
const cors = require("cors");

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(express.json());
app.use(cors(corsOptions));

const getProducts = async () => {
  try {
    const products = await Product.find();
    return products;
  } catch (error) {
    console.log("Error fetching products:", error);
  }
};

app.get("/products", async (req, res) => {
  try {
    const products = await getProducts();
    if (products.length > 0) {
      res.status(200).json({
        message: "Products fetched successfully.",
        products: products,
      });
    } else {
      res.status(404).json({ message: "Products not found." });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products." });
  }
});

const createNewProduct = async (newProduct) => {
  try {
    const product = new Product(newProduct);
    const saveProduct = await product.save();
    return saveProduct;
  } catch (error) {
    console.log("Error creating new product:", error);
  }
};

app.post("/product", async (req, res) => {
  try {
    const newProduct = await createNewProduct(req.body);
    if (newProduct) {
      res.status(201).json({
        message: "New Product created succssfully.",
        product: newProduct,
      });
    } else {
      res.status(400).json({ message: "Invalid product data." });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to create new product." });
  }
});

// to delete app products from the db
app.delete("/products", async (req, res) => {
  try {
    await Product.deleteMany({});
    res.status(200).json({ message: "All products deleted." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete products." });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log("Server is running on PORT", PORT);
});

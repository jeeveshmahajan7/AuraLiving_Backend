const { initializeDatabase } = require("./db/db.connect");
const Product = require("./models/products.model");
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

// to get all the products from the db
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
    res
      .status(500)
      .json({ message: "Failed to fetch products.", error: error.message });
  }
});

// save a new product into the db
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
    res
      .status(500)
      .json({ message: "Failed to create new product.", error: error.message });
  }
});

// to delete all products from the db
app.delete("/products", async (req, res) => {
  try {
    await Product.deleteMany({});
    res.status(200).json({ message: "All products deleted." });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete products.", error: error.message });
  }
});

// get product by productId from the db
const findProductById = async (productId) => {
  try {
    const productById = await Product.findById(productId);
    return productById;
  } catch (error) {
    console.log("Error finding the product:", error.message);
  }
};

app.get("/products/details/:productId", async (req, res) => {
  try {
    const productById = await findProductById(req.params.productId);
    if (productById) {
      res
        .status(200)
        .json({ message: "Found product by Id.", product: productById });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch product by productId.",
      error: error.message,
    });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log("Server is running on PORT", PORT);
});

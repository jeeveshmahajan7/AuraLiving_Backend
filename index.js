const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { initializeDatabase } = require("./db/db.connect");
const Product = require("./models/products.model");
const seedDefaultUser = require("./scripts/seedDefaultUser");
const AuraUser = require("./models/users.model");
const Cart = require("./models/cart.model");
const Order = require("./models/orders.model");

const app = express();

// CORS setup
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(express.json());
app.use(cors(corsOptions));

// Initialize database and seed user
(async () => {
  try {
    await initializeDatabase();
    await seedDefaultUser();
    console.log("Connected to the Database.✅");
  } catch (err) {
    console.error("❌ Failed to connect to database:", err.message);
  }
})();

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

// find a user by Id
const findUserById = async (userId) => {
  try {
    const user = await AuraUser.findById(userId);
    return user;
  } catch (error) {
    console.log("Error finding user by Id:", error.message);
  }
};

// fetch user details
app.get("/users/:userId/details", async (req, res) => {
  try {
    const user = await findUserById(req.params.userId);
    if (user) {
      res.status(200).json({ message: "Found the user.", userDetails: user });
    } else {
      res.status(404).json({ message: "User not found." });
    }
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch user.",
      error: error.message || "Unknown error",
    });
  }
});

// add a new address for user
app.post("/users/:userId/address", async (req, res) => {
  try {
    const user = await findUserById(req.params.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (req.body.isDefault) {
      user.address.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.address.push(req.body);
    await user.save();
    res.status(200).json({ message: "Successfully added user address." });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add user address by Id.",
      error: error.message,
    });
  }
});

// update existing address for user
app.put("/users/:userId/address/:addressId", async (req, res) => {
  try {
    const user = await findUserById(req.params.userId); // using the same helper function
    const address = user.address.id(req.params.addressId);
    const updatedAddress = req.body;

    if (!user) return res.status(404).json({ error: "User not found" });

    if (!address) return res.status(404).json({ error: "Address not found." });

    Object.assign(address, updatedAddress); // applies changes
    await user.save(); // persists changes
    res.status(200).json({ message: "Address updated successfully." });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update user address by user and address Id.",
      error: error.message,
    });
  }
});

// mark an address as default
app.put("/users/:userId/address/:addressId/default", async (req, res) => {
  try {
    const user = await findUserById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    const address = user.address.id(req.params.addressId);
    if (!address) return res.status(404).json({ error: "Address not found" });
    // reset all addresses
    user.address.forEach((addr) => (addr.isDefault = false));
    address.isDefault = true; // mark current address as default

    await user.save();
    res.status(200).json({ message: "Default address updated successfully." });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update default address.",
      error: error.message,
    });
  }
});

// delete an address for the user
app.delete("/users/:userId/address/:addressId", async (req, res) => {
  try {
    const user = await findUserById(req.params.userId); // using the same helper function

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const addressId = req.params.addressId;
    const address = user.address.id(addressId);

    if (!address) {
      return res.status(404).json({ error: "Address not found." });
    }

    // Use pull to remove the address
    user.address.pull({ _id: addressId });
    await user.save(); // makes the changes persist

    res.status(200).json({ message: "Address successfully deleted." });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete address by user and address Id.",
      error: error.message,
    });
  }
});

// add a product to user favorites
app.post("/users/:userId/favorites/:productId", async (req, res) => {
  try {
    const user = await findUserById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    const productId = req.params.productId;
    // prevent duplicates
    if (user.favoriteProducts.includes(productId)) {
      return res
        .status(400)
        .json({ message: "Product is already in user favorites." });
    }

    user.favoriteProducts.push(productId);
    await user.save();

    res
      .status(200)
      .json({ message: "Product successfully added to user favorites." });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add product to user favorites.",
      error: error.message,
    });
  }
});

// delete a product from user favorites
app.delete("/users/:userId/favorites/:productId", async (req, res) => {
  try {
    const user = await findUserById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    const productId = req.params.productId;
    user.favoriteProducts = user.favoriteProducts.filter(
      (favId) => favId.toString() !== productId
    );
    await user.save();

    res.status(200).json({ message: "Product removed from favorites." });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete product from user favorites.",
      error: error.message,
    });
  }
});

// get all favorites products of the user
app.get("/users/:userId/favorites", async (req, res) => {
  try {
    const user = await findUserById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found." });
    await user.populate("favoriteProducts");
    // populate to get full product objects and not just the id

    res.status(200).json({
      message: "Successfully fetched user favorites.",
      favoriteProducts: user.favoriteProducts,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch user favorites.",
      error: error.message,
    });
  }
});

// find cart by userId
const findCartByUserId = async (userId) => {
  try {
    const cartById = await Cart.findOne({ user: userId });
    return cartById;
  } catch (error) {
    console.log("Error finding cart by userId:", error.message);
  }
};

// add product to cart
app.post("/users/:userId/cart/:productId", async (req, res) => {
  try {
    const { userId, productId } = req.params;
    let userCart = await findCartByUserId(userId); // using the findCartByUserId helper function

    // create a cart if it does not already exist, this will happen only once when first product is added
    if (!userCart) {
      userCart = new Cart({ user: userId, items: [] });
    }

    // find whether product already exists in the cart
    const existingItem = userCart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += 1; // increase quantity if it already exists
    } else {
      userCart.items.push({ product: productId, quantity: 1 }); // push the productId if it does not exist already
    }

    await userCart.save();

    res.status(200).json({ message: "Product added to cart", cart: userCart });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add product to cart.",
      error: error.message,
    });
  }
});

// remove product from cart if qty is 1 or {all=true} in request url / decrease the qty if it is greater than 1
// So, if you want to remove the item from the cart regardless of the qty, include: ?all=true (at the end of the request url)
app.delete("/users/:userId/cart/:productId", async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const removeAll = req.query.all === "true"; // ?all=true in request url

    const userCart = await findCartByUserId(userId); // using the same findCartByUserId helper function

    if (!userCart) {
      return res.status(404).json({ message: "No cart found for the user." });
    }

    // find whether product already exists in the cart
    const existingItem = userCart.items.find(
      (item) => item.product.toString() === productId
    );

    if (!existingItem) {
      return res.status(404).json({
        message: "Product not found in the cart.",
      });
    }

    if (existingItem.quantity === 1 || removeAll) {
      // remove the whole product
      userCart.items = userCart.items.filter(
        (item) => item.product.toString() !== productId
      );
    } else {
      // decrease the qty if it is greater than 1
      existingItem.quantity -= 1;
    }

    await userCart.save();

    res.status(200).json({
      message:
        removeAll || existingItem.quantity === 1
          ? "Product removed from the cart."
          : "Product quantity decreased.",
      cart: userCart,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete product from the cart.",
      error: error.message,
    });
  }
});

// fetch all products from cart
app.get("/users/:userId/cart", async (req, res) => {
  try {
    const userId = req.params.userId;

    const userCart = await findCartByUserId(userId);

    if (!userCart) {
      return res.status(404).json({ message: "Cart not found for the user." });
    }

    await userCart.populate("items.product");

    res.status(200).json({
      message: "Cart fetched successfully.",
      cart: userCart.items,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch products from the cart.",
      error: error.message,
    });
  }
});

// create order in orders
app.post("/users/:userId/orders", async (req, res) => {
  try {
    const { userId } = req.params;
    const { products, totalPrice, address } = req.body;

    if (!products || !products.length) {
      return res.status(400).json({ message: "No products in order." });
    }

    const newOrder = new Order({
      user: userId,
      products,
      totalPrice,
      address,
    });

    await newOrder.save();

    // clearing the cart after placing an order
    await Cart.findOneAndUpdate({ user: userId }, { items: [] });

    res
      .status(201)
      .json({ message: "Order Placed Successfully", order: newOrder });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to place order", error: error.message });
  }
});

// helper to find orders by userId
const findOrdersByUserId = async (userId) => {
  try {
    const orderById = await Order.find({ user: userId }).populate(
      "products.product",
      "title price"
    );
    return orderById;
  } catch (error) {
    console.log("Error finding orders by userId:", error.message);
  }
};

// fetch all orders
app.get("/users/:userId/orders", async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await findOrdersByUserId(userId);

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found for user." });
    }

    res.status(200).json({
      message: "Successfully fetched orders for user.",
      orders: orders,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch orders.", error: error.message });
  }
});

// Export for Vercel - to start the server
module.exports = app;

// local dev server
if (process.env.NODE_ENV !== "production") {
  app.listen(3000, () => console.log("Local server running."));
}

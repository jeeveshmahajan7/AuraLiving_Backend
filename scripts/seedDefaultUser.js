const User = require("../models/users.model");
require("dotenv").config();

const seedDefaultUser = async () => {
  const existing = await User.findOne({ email: process.env.DEFAULT_EMAIL });

  if (!existing) {
    const user = new User({
      name: process.env.DEFAULT_NAME,
      email: process.env.DEFAULT_EMAIL,
      phoneNumber: process.env.DEFAULT_PHONE,
    });
    await user.save();
    console.log("✅ Default user created.");
  } else {
    console.log("Default user exists.");
  }
};

module.exports = seedDefaultUser;

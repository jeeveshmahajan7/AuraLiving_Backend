const AuraUser = require("../models/users.model");
require("dotenv").config();

const seedDefaultUser = async () => {
  const existing = await AuraUser.findOne({ email: process.env.DEFAULT_EMAIL });

  if (!existing) {
    const user = new AuraUser({
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

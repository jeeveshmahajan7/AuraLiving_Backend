const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: Number,
    required: true,
  },
  address: [
    {
      name: String,
      street: String,
      city: String,
      state: String,
      zip: Number,
      phone: Number,
      isDefault: Boolean,
    },
  ],
});

const AuraUser = mongoose.model("AuraUser", userSchema);

module.exports = AuraUser;
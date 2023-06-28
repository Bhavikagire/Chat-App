const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    Username: String,
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    verificationToken: {
      type: String,
      default: null
    }
});

const userModel = mongoose.model("user", userSchema);

module.exports = { userModel };

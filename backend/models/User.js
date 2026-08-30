const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    minlength: [3, "Name must be at least 3 characters"],
    maxlength: [50, "Name must not exceed 50 characters"],
    match: [
      /^[A-Za-z]+(?: [A-Za-z]+)*$/,
      "Name can contain only letters and single spaces",
    ],
    trim: true,
  },

  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      "Please enter a valid email address",
    ],
  },

  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters"],
  },

  role: {
    type: String,
    enum: {
      values: ["user", "admin"],
      message: "Role must be either user or admin",
    },
    default: "user",
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;

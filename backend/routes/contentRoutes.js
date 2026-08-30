const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");
const Content = require("../models/Content");

// GET ALL CONTENT - USER + ADMIN
router.get("/", authenticateToken, async (req, res) => {
  try {
    const content = await Content.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      content,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch content",
      error: error.message,
    });
  }
});

module.exports = router;
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authenticateToken = require("../middleware/authMiddleware");
const authorizeRole = require("../middleware/roleMiddleware");
const Content = require("../models/Content");

// TEST ADMIN ROUTE
router.get(
  "/test",
  authenticateToken,
  authorizeRole("admin"),
  (req, res) => {
    res.json({
      message: "Welcome Admin 👑",
      user: req.user,
    });
  }
);

// ADD CONTENT - ADMIN ONLY
router.post(
  "/content",
  authenticateToken,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const { title, description, status } = req.body;

      if (!title || !description) {
        return res.status(400).json({
          message: "Title and description are required",
        });
      }

      const content = new Content({
        title,
        description,
        status,
      });

      await content.save();

      res.status(201).json({
        message: "Content created successfully",
        content,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to create content",
        error: error.message,
      });
    }
  }
);

// UPDATE CONTENT - ADMIN ONLY
router.put(
  "/content/:id",
  authenticateToken,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const { title, description, status } = req.body;

      const content = await Content.findByIdAndUpdate(
        req.params.id,
        {
          title,
          description,
          status,
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!content) {
        return res.status(404).json({
          message: "Content not found",
        });
      }

      res.status(200).json({
        message: "Content updated successfully",
        content,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to update content",
        error: error.message,
      });
    }
  }
);

// DELETE CONTENT - ADMIN ONLY
router.delete(
  "/content/:id",
  authenticateToken,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const content = await Content.findByIdAndDelete(
        req.params.id
      );

      if (!content) {
        return res.status(404).json({
          message: "Content not found",
        });
      }

      res.status(200).json({
        message: "Content deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to delete content",
        error: error.message,
      });
    }
  }
);

// GET ALL USERS - ADMIN ONLY
router.get(
  "/users",
  authenticateToken,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const users = await User.find().select("-password");

      res.status(200).json({
        users,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch users",
        error: error.message,
      });
    }
  }
);

// UPDATE USER - ADMIN ONLY
router.put(
  "/users/:id",
  authenticateToken,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const userId = req.params.id;
      const { name, email, role } = req.body;

      // Prevent admin from editing their own role
      if (userId === req.user.id && role && role !== "admin") {
        return res.status(400).json({
          message: "You cannot change your own admin role",
        });
      }

      const user = await User.findByIdAndUpdate(
        userId,
        {
          name,
          email,
          role,
        },
        {
          new: true,
          runValidators: true,
        }
      ).select("-password");

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      res.status(200).json({
        message: "User updated successfully",
        user,
      });
    } catch (error) {
      console.log("UPDATE USER ERROR:", error);

      // Duplicate email
      if (error.code === 11000) {
        return res.status(400).json({
          message: "Email is already registered",
        });
      }

      res.status(500).json({
        message: "Failed to update user",
        error: error.message,
      });
    }
  }
);

// DELETE USER - ADMIN ONLY
router.delete(
  "/users/:id",
  authenticateToken,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const userId = req.params.id;

      // Prevent admin from deleting their own account
      if (userId === req.user.id) {
        return res.status(400).json({
          message: "You cannot delete your own admin account",
        });
      }

      const user = await User.findByIdAndDelete(userId);

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      res.status(200).json({
        message: "User deleted successfully",
      });
    } catch (error) {
      console.log("DELETE USER ERROR:", error);

      res.status(500).json({
        message: "Failed to delete user",
        error: error.message,
      });
    }
  }
);

module.exports = router;
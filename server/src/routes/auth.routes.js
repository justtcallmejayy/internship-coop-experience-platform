const express = require("express");
const db = require("../db/knex");
const {
  validatePassword,
  hashPassword,
  comparePassword,
} = require("../services/password.service");

// Create a new router instance
const router = express.Router();

// Register a new user
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
});

// Login a user and admin then passwords matching logic with hash comparison
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Fetch the user from the database
    const user = await db("users").where({ username }).first();

    if (!user) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    // Compare the provided password with the stored hash
    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    // Store user information in session
    req.session.user = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    res.json({ message: "Login successful.", user: req.session.user });
  } catch (error) {
    console.error("Error during login:", error);
  }
});

// Logout a user
router.post("/logout", (req, res) => {
  if (!req.session) {
    return res.status(200).json({
      message: "Logged out successfully.",
    });
  }

  req.session.destroy((error) => {
    if (error) {
      console.error("Logout error:", error);
      return res.status(500).json({
        error: "Unable to log out.",
      });
    }

    return res.status(200).json({
      message: "Logged out successfully.",
    });
  });
});

// me 
router.get("/me", (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      error: "Authentication required.",
    });
  }
// Return the user information from the session
  return res.status(200).json({
    user: req.session.user,
  });
});

module.exports = router;
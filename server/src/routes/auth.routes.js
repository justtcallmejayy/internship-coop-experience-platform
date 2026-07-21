const express = require("express");
const db = require("../db/knex");
const {
  validatePassword,
  hashPassword,
  comparePassword,
} = require("../services/password.service");
describe("Auth routes", () => {
  beforeAll(async () => {
    await db.migrate.rollback(undefined, true);
    await db.migrate.latest();
  });

  beforeEach(async () => {
    await db("users").del();
  });

  afterAll(async () => {
    await db.destroy();
  });

  //all the post and get methods for the auth routes will be tested here, including register, login, logout, and me endpoints. Each test will check for proper responses and session handling.
});

// Create a new router instance
const router = express.Router();

// Register a new user
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
});

// Login a user and admin then passwords matching logic with hash comparison
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await db("users").where({ email: cleanEmail }).first();

    if (!user) {
      return res.status(401).json({
        error: "Email or password is incorrect.",
      });
    }
    // Compare the provided password with the stored hash
    const passwordMatches = await comparePassword(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({
        error: "Email or password is incorrect.",
      });
    }
    // Store user information in session

    req.session.user = publicUser(user);

    return res.status(200).json({
      message: "Logged in successfully.",
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      error: "Unable to log in.",
    });
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

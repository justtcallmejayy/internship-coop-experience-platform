const express = require("express");
const db = require("../db/knex");
const {
  validatePassword,
  hashPassword,
  comparePassword,
} = require("../services/password.service");
//all the post and get methods for the auth routes will be tested here, including register, login, logout, and me endpoints. Each test will check for proper responses and session handling.

const router = express.Router();

function publicUser(user) {
  return {
    user_id: user.user_id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    program: user.program,
    graduation_year: user.graduation_year,
    linkedin_url: user.linkedin_url,
    created_at: user.created_at,
  };
}

router.post("/register", async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        error: "Full name, email, and password are required.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        error: "A valid email address is required.",
      });
    }

    const passwordResult = validatePassword(password);
    if (!passwordResult.isValid) {
      return res.status(400).json({
        error: passwordResult.message,
      });
    }

    const existingUser = await db("users").where({ email: cleanEmail }).first();

    if (existingUser) {
      return res.status(409).json({
        error: "An account with this email already exists.",
      });
    }

    const password_hash = await hashPassword(password);

    const insertedIds = await db("users").insert({
      full_name: full_name.trim(),
      email: cleanEmail,
      password_hash,
      role: "Student",
    });

    const user = await db("users").where({ user_id: insertedIds[0] }).first();

    req.session.user = publicUser(user);

    return res.status(201).json({
      message: "Account registered successfully.",
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      error: "Unable to register account.",
    });
  }
});

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
//me endpoint
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

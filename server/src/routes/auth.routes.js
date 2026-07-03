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
const express = require("express");
const db = require("../db/knex");
const { requireAuth } = require("../middleware/auth.middleware");

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

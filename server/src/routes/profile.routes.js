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
function validateProfileUpdate(body) {
  const errors = [];

  // Validate each field in the request body
  if ("full_name" in body) {
    if (
      typeof body.full_name !== "string" ||
      body.full_name.trim().length < 2
    ) {
      errors.push("Full name must be at least 2 characters.");
    }
  }
  // checking program and graduation year for null values and type checking. If they are not null, they must be of the correct type and within the specified constraints.
  if ("program" in body) {
    if (body.program !== null && typeof body.program !== "string") {
      errors.push("Program must be text.");
    }

    if (typeof body.program === "string" && body.program.trim().length > 120) {
      errors.push("Program must be 120 characters or fewer.");
    }
  }

  if ("graduation_year" in body) {
    const year = body.graduation_year;

    if (year !== null && year !== undefined) {
      if (!Number.isInteger(year) || year < 2020 || year > 2100) {
        errors.push(
          "Graduation year must be a valid year between 2020 and 2100.",
        );
      }
    }
  }
  return errors;
}

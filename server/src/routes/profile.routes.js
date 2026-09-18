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

//linkedIn URL validation function

/* 

  if ("linkedin_url" in body) {
    const linkedinUrl = body.linkedin_url;

      if (typeof linkedinUrl === "string" && linkedinUrl.length > 255) {
        errors.push("LinkedIn URL must be 255 characters or fewer.");
      }

  }

*/

//router to have custom errors for profile
router.get("/", requireAuth, async (req, res) => {
  try {
    const user = await db("users")
      .where({ user_id: req.session.user.user_id })
      .first();

    if (!user) {
      return res.status(404).json({
        error: "User profile not found.",
      });
    }

    return res.status(200).json({
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return res.status(500).json({
      error: "Unable to fetch profile.",
    });
  }
});

// functions and conditions for profile updation

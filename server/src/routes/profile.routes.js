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

    if (linkedinUrl !== null && linkedinUrl !== "") {
      if (typeof linkedinUrl !== "string") {
        errors.push("LinkedIn URL must be text.");
      } else if (!linkedinUrl.startsWith("https://www.linkedin.com/") && !linkedinUrl.startsWith("https://linkedin.com/")) {
        errors.push("LinkedIn URL must be a valid LinkedIn URL.");
      }

      if (typeof linkedinUrl === "string" && linkedinUrl.length > 255) {
        errors.push("LinkedIn URL must be 255 characters or fewer.");
      }
    }
  }

  return errors;
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
router.patch("/", requireAuth, async (req, res) => {
  try {
    const blockedFields = [
      "email",
      "password",
      "password_hash",
      "role",
      "user_id",
      "created_at",
    ];

    const attemptedBlockedFields = blockedFields.filter(
      (field) => field in req.body,
    );

    if (attemptedBlockedFields.length > 0) {
      return res.status(400).json({
        error: `These fields cannot be updated from profile: ${attemptedBlockedFields.join(", ")}.`,
      });
    }

    const errors = validateProfileUpdate(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        error: "Profile validation failed.",
        details: errors,
      });
    }

    /* 
    fullname, program, graduation_year, linkedin_url are the fields that can be updated in the profile. The code checks if these fields are present in the request body and updates them accordingly. If a field is not present, it retains its current value from the database.
    */

    const allowedUpdates = {};

    if ("full_name" in req.body) {
      allowedUpdates.full_name = req.body.full_name.trim();
    }

    if ("program" in req.body) {
      allowedUpdates.program =
        req.body.program === null ? null : req.body.program.trim();
    }

    if ("graduation_year" in req.body) {
      allowedUpdates.graduation_year = req.body.graduation_year ?? null;
    }

    if ("linkedin_url" in req.body) {
      allowedUpdates.linkedin_url =
        req.body.linkedin_url === null || req.body.linkedin_url === ""
          ? null
          : req.body.linkedin_url.trim();
    }

    if (Object.keys(allowedUpdates).length === 0) {
      return res.status(400).json({
        error: "No valid profile fields were provided.",
      });
    }

    /*     await db("users")
      .where({ user_id: req.session.user.user_id })
      .update(allowedUpdates);

    const updatedUser = await db("users")
      .where({ user_id: req.session.user.user_id })
      .first();

    req.session.user = publicUser(updatedUser);

    return res.status(200).json({
      message: "Profile updated successfully.",
      user: publicUser(updatedUser)
    }); */

    //      message: "Profile updated successfully.",
  } catch (error) {
    console.error("Profile update error:", error);
    return res.status(500).json({
      error: "Unable to update profile.",
    });
  }
});

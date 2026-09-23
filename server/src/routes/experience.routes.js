/* Experience Routes */
const express = require("express");
const db = require("../db/knex");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

const VALID_WORK_TERM_TYPES = ["Internship", "Co-op"];
const VALID_WORK_MODES = ["In-person", "Hybrid", "Remote"];
const VALID_INTERVIEW_FORMATS = ["In-person", "Online"];

/* Validation Functions- this is a set of helper functions to validate the experience data */
function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

// Helper functions to validate individual fields
function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isInteger(value) {
  return Number.isInteger(value);
}

function isValidMonth(value) {
  return isInteger(value) && value >= 1 && value <= 12;
}

function isValidYear(value) {
  return isInteger(value) && value >= 2000 && value <= 2100;
}

/* Validate Experience Payload- This function validates the experience data against a set of rules */
function validateExperiencePayload(body, options = { partial: false }) {
  const partial = options.partial === true;
  const errors = [];
  const data = {};

  if (!isPlainObject(body)) {
    return {
      errors: ["Request body must be an object."],
      data,
      technology_ids: undefined,
      custom_tech_name: undefined,
    };
  }

  function requireOrValidateString(field, label, maxLength) {
    if (!partial || field in body) {
      if (!isNonEmptyString(body[field])) {
        errors.push(`${label} is required.`);
        return;
      }

      const value = body[field].trim();

      if (value.length > maxLength) {
        errors.push(`${label} must be ${maxLength} characters or fewer.`);
        return;
      }

      data[field] = value;
    }
  }

  requireOrValidateString("company_name", "Company name", 200);
  requireOrValidateString("role_title", "Role title", 200);
  requireOrValidateString("location_city", "Location city", 120);
  requireOrValidateString("location_province", "Location province", 120);

  if (!partial || "industry_id" in body) {
    if (!isInteger(body.industry_id)) {
      errors.push("Industry ID must be an integer.");
    } else {
      data.industry_id = body.industry_id;
    }
  }

  if (!partial || "work_term_type" in body) {
    if (!VALID_WORK_TERM_TYPES.includes(body.work_term_type)) {
      errors.push("Work term type must be Internship or Co-op.");
    } else {
      data.work_term_type = body.work_term_type;
    }
  }

  if (!partial || "work_mode" in body) {
    if (!VALID_WORK_MODES.includes(body.work_mode)) {
      errors.push("Work mode must be In-person, Hybrid, or Remote.");
    } else {
      data.work_mode = body.work_mode;
    }
  }

  if (!partial || "interview_format" in body) {
    if (!VALID_INTERVIEW_FORMATS.includes(body.interview_format)) {
      errors.push("Interview format must be In-person or Online.");
    } else {
      data.interview_format = body.interview_format;
    }
  }

  if (!partial || "start_month" in body) {
    if (!isValidMonth(body.start_month)) {
      errors.push("Start month must be an integer from 1 to 12.");
    } else {
      data.start_month = body.start_month;
    }
  }

  if (!partial || "start_year" in body) {
    if (!isValidYear(body.start_year)) {
      errors.push("Start year must be a valid year between 2000 and 2100.");
    } else {
      data.start_year = body.start_year;
    }
  }

  if (!partial || "end_month" in body) {
    if (!isValidMonth(body.end_month)) {
      errors.push("End month must be an integer from 1 to 12.");
    } else {
      data.end_month = body.end_month;
    }
  }

  if (!partial || "end_year" in body) {
    if (!isValidYear(body.end_year)) {
      errors.push("End year must be a valid year between 2000 and 2100.");
    } else {
      data.end_year = body.end_year;
    }
  }
  /* Validate the date range for existing experiences */
  const startMonth = data.start_month ?? body.start_month;
  const startYear = data.start_year ?? body.start_year;
  const endMonth = data.end_month ?? body.end_month;
  const endYear = data.end_year ?? body.end_year;

  if (
    isValidMonth(startMonth) &&
    isValidYear(startYear) &&
    isValidMonth(endMonth) &&
    isValidYear(endYear)
  ) {
    const startNumber = startYear * 100 + startMonth;
    const endNumber = endYear * 100 + endMonth;

    if (endNumber < startNumber) {
      errors.push("End date cannot be before start date.");
    }
  }

  if (!partial || "learning_outcomes" in body) {
    if (!isNonEmptyString(body.learning_outcomes)) {
      errors.push("Learning outcomes are required.");
    } else {
      const value = body.learning_outcomes.trim();

      if (value.length > 500) {
        errors.push("Learning outcomes must be 500 characters or fewer.");
      } else {
        data.learning_outcomes = value;
      }
    }
  }

  let technology_ids;

  if (!partial || "technology_ids" in body) {
    if (
      !Array.isArray(body.technology_ids) ||
      body.technology_ids.length === 0
    ) {
      errors.push("At least one technology must be selected.");
    } else if (!body.technology_ids.every(Number.isInteger)) {
      errors.push("Technology IDs must be integers.");
    } else {
      const uniqueTechnologyIds = [...new Set(body.technology_ids)];
      technology_ids = uniqueTechnologyIds;
    }
  }

  let custom_tech_name;

  if ("custom_tech_name" in body) {
    if (body.custom_tech_name === null || body.custom_tech_name === "") {
      custom_tech_name = null;
    } else if (typeof body.custom_tech_name !== "string") {
      errors.push("Custom technology name must be text.");
    } else if (body.custom_tech_name.trim().length > 50) {
      errors.push("Custom technology name must be 50 characters or fewer.");
    } else {
      custom_tech_name = body.custom_tech_name.trim();
    }
  }

  // Return the validation results
  return {
    errors,
    data,
    technology_ids,
    custom_tech_name,
  };
}
// Helper function to insert reference data for testing
async function getEntryWithTechnologies(entryId) {
  const entry = await db("experience_entries as e")
    .join("industries as i", "e.industry_id", "i.industry_id")
    .leftJoin("users as reviewer", "e.reviewed_by_id", "reviewer.user_id")
    .select(
      "e.entry_id",
      "e.author_id",
      "e.industry_id",
      "i.industry_name",
      "e.reviewed_by_id",
      "reviewer.full_name as reviewed_by_name",
      "e.company_name",
      "e.role_title",
      "e.work_term_type",
      "e.work_mode",
      "e.location_city",
      "e.location_province",
      "e.start_month",
      "e.start_year",
      "e.end_month",
      "e.end_year",
      "e.interview_format",
      "e.learning_outcomes",
      "e.moderation_status",
      "e.submission_date",
      "e.last_updated_date",
      "e.review_date",
    )
    .where("e.entry_id", entryId)
    .first();

  if (!entry) return null;

  const technologies = await db("experience_technologies as et")
    .join("technologies as t", "et.tech_id", "t.tech_id")
    .select(
      "et.exp_tech_id",
      "et.tech_id",
      "t.tech_name",
      "et.custom_tech_name",
    )
    .where("et.entry_id", entryId)
    .orderBy("t.tech_name", "asc");

  return {
    ...entry,
    technologies,
  };
}
/* Helper function to validate reference data */
async function validateReferenceData(industryId, technologyIds) {
  const errors = [];

  if (industryId !== undefined) {
    const industry = await db("industries")
      .where({ industry_id: industryId })
      .first();

    if (!industry) {
      errors.push("Selected industry does not exist.");
    }
  }

  if (technologyIds !== undefined) {
    const technologies = await db("technologies").whereIn(
      "tech_id",
      technologyIds,
    );

    if (technologies.length !== technologyIds.length) {
      errors.push("One or more selected technologies do not exist.");
    }
  }

  return errors;
}

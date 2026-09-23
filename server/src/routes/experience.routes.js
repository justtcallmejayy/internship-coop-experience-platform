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
  return { errors, data };
}

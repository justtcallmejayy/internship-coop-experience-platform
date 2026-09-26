//this is the main code for the browse routes
const express = require("express");
const db = require("../db/knex");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

const VALID_WORK_TERM_TYPES = ["Internship", "Co-op"];
const VALID_WORK_MODES = ["In-person", "Hybrid", "Remote"];
const VALID_SORT_VALUES = ["recent"];

function parseIntegerParam(value) {
  if (value === undefined) return undefined;

  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

async function getApprovedEntryWithTechnologies(entryId) {
  const entry = await db("experience_entries as e")
    .join("industries as i", "e.industry_id", "i.industry_id")
    .join("users as author", "e.author_id", "author.user_id")
    .select(
      "e.entry_id",
      "e.author_id",
      "author.full_name as author_name",
      "e.industry_id",
      "i.industry_name",
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
    .where("e.moderation_status", "Approved")
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

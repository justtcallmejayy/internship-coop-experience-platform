/* Admin Routes */
const express = require("express");
const db = require("../db/knex");
const { requireAdmin } = require("../middleware/auth.middleware");

const router = express.Router();

function parseEntryId(id) {
  const entryId = Number(id);

  if (!Number.isInteger(entryId)) {
    return null;
  }

  return entryId;
}
/* Fetch an experience entry with all associated data for admin purposes */
async function getAdminEntry(entryId) {
  const entry = await db("experience_entries as e")
    .join("users as author", "e.author_id", "author.user_id")
    .join("industries as i", "e.industry_id", "i.industry_id")
    .leftJoin("users as reviewer", "e.reviewed_by_id", "reviewer.user_id")
    .select(
      "e.entry_id",
      "e.author_id",
      "author.full_name as author_name",
      "author.email as author_email",
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
  if (!entry) return null; // Entry not found

  // Fetch associated technologies for the entry
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

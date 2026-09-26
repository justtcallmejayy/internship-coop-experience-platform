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
router.get("/experiences", requireAuth, async (req, res) => {
  try {
    const {
      search,
      industry_id,
      work_term_type,
      work_mode,
      sort = "recent",
    } = req.query;

    const parsedIndustryId = parseIntegerParam(industry_id);

    if (parsedIndustryId === null) {
      return res.status(400).json({
        error: "Industry ID must be an integer.",
      });
    }

    if (work_term_type && !VALID_WORK_TERM_TYPES.includes(work_term_type)) {
      return res.status(400).json({
        error: "Work term type must be Internship or Co-op.",
      });
    }

    if (work_mode && !VALID_WORK_MODES.includes(work_mode)) {
      return res.status(400).json({
        error: "Work mode must be In-person, Hybrid, or Remote.",
      });
    }

    if (!VALID_SORT_VALUES.includes(sort)) {
      return res.status(400).json({
        error: "Sort must be recent.",
      });
    }

    let query = db("experience_entries as e")
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
      )
      .where("e.moderation_status", "Approved");

    if (search && search.trim() !== "") {
      const searchTerm = `%${search.trim().toLowerCase()}%`;

      query = query.andWhere((builder) => {
        builder
          .whereRaw("LOWER(e.company_name) LIKE ?", [searchTerm])
          .orWhereRaw("LOWER(e.role_title) LIKE ?", [searchTerm]);
      });
    }

    if (parsedIndustryId !== undefined) {
      query = query.andWhere("e.industry_id", parsedIndustryId);
    }

    if (work_term_type) {
      query = query.andWhere("e.work_term_type", work_term_type);
    }

    if (work_mode) {
      query = query.andWhere("e.work_mode", work_mode);
    }

    query = query.orderBy("e.submission_date", "desc");

    const rows = await query;

    const entries = [];

    for (const row of rows) {
      const technologies = await db("experience_technologies as et")
        .join("technologies as t", "et.tech_id", "t.tech_id")
        .select(
          "et.exp_tech_id",
          "et.tech_id",
          "t.tech_name",
          "et.custom_tech_name",
        )
        .where("et.entry_id", row.entry_id)
        .orderBy("t.tech_name", "asc");

      entries.push({
        ...row,
        technologies,
      });
    }

    return res.status(200).json({
      entries,
    });
  } catch (error) {
    console.error("Browse approved experiences error:", error);
    return res.status(500).json({
      error: "Unable to fetch approved experience entries.",
    });
  }
});
router.get("/experiences/:id", requireAuth, async (req, res) => {
  try {
    const entryId = Number(req.params.id);

    if (!Number.isInteger(entryId)) {
      return res.status(400).json({
        error: "Experience entry ID must be an integer.",
      });
    }

    const entry = await getApprovedEntryWithTechnologies(entryId);

    if (!entry) {
      return res.status(404).json({
        error: "Approved experience entry not found.",
      });
    }

    return res.status(200).json({
      entry,
    });
  } catch (error) {
    console.error("Browse approved experience detail error:", error);
    return res.status(500).json({
      error: "Unable to fetch approved experience entry.",
    });
  }
});

module.exports = router;

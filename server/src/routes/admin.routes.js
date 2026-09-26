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
// Admin route to fetch all pending experience entries
router.get("/experiences/pending", requireAdmin, async (req, res) => {
  try {
    const pendingRows = await db("experience_entries")
      .where({ moderation_status: "Pending" })
      .orderBy("submission_date", "asc");

    const entries = [];

    for (const row of pendingRows) {
      entries.push(await getAdminEntry(row.entry_id));
    }

    return res.status(200).json({ entries });
  } catch (error) {
    console.error("Admin pending queue error:", error);
    return res.status(500).json({
      error: "Unable to fetch pending experience entries.",
    });
  }
});

// Admin route to fetch a specific experience entry by ID
router.get("/experiences/:id", requireAdmin, async (req, res) => {
  try {
    const entryId = parseEntryId(req.params.id);

    if (!entryId) {
      return res.status(400).json({
        error: "Experience entry ID must be an integer.",
      });
    }

    const entry = await getAdminEntry(entryId);

    if (!entry) {
      return res.status(404).json({
        error: "Experience entry not found.",
      });
    }

    return res.status(200).json({ entry });
  } catch (error) {
    console.error("Admin fetch experience error:", error);
    return res.status(500).json({
      error: "Unable to fetch experience entry.",
    });
  }
});

//reject experience entry
router.patch("/experiences/:id/reject", requireAdmin, async (req, res) => {
  try {
    const entryId = parseEntryId(req.params.id);

    if (!entryId) {
      return res.status(400).json({
        error: "Experience entry ID must be an integer.",
      });
    }

    const entry = await db("experience_entries")
      .where({ entry_id: entryId })
      .first();

    if (!entry) {
      return res.status(404).json({
        error: "Experience entry not found.",
      });
    }

    if (entry.moderation_status !== "Pending") {
      return res.status(400).json({
        error: "Only Pending entries can be rejected.",
      });
    }

    const now = new Date().toISOString();

    await db("experience_entries").where({ entry_id: entryId }).update({
      moderation_status: "Rejected",
      reviewed_by_id: req.session.user.user_id,
      review_date: now,
      last_updated_date: now,
    });

    const updatedEntry = await getAdminEntry(entryId);

    return res.status(200).json({
      message: "Experience entry rejected.",
      entry: updatedEntry,
    });
  } catch (error) {
    console.error("Admin reject experience error:", error);
    return res.status(500).json({
      error: "Unable to reject experience entry.",
    });
  }
});

//approve experience entry
router.patch("/experiences/:id/approve", requireAdmin, async (req, res) => {
  try {
    const entryId = parseEntryId(req.params.id);

    if (!entryId) {
      return res.status(400).json({
        error: "Experience entry ID must be an integer.",
      });
    }

    const entry = await db("experience_entries")
      .where({ entry_id: entryId })
      .first();

    if (!entry) {
      return res.status(404).json({
        error: "Experience entry not found.",
      });
    }

    if (entry.moderation_status !== "Pending") {
      return res.status(400).json({
        error: "Only Pending entries can be approved.",
      });
    }

    const now = new Date().toISOString();

    await db("experience_entries").where({ entry_id: entryId }).update({
      moderation_status: "Approved",
      reviewed_by_id: req.session.user.user_id,
      review_date: now,
      last_updated_date: now,
    });

    const updatedEntry = await getAdminEntry(entryId);

    return res.status(200).json({
      message: "Experience entry approved.",
      entry: updatedEntry,
    });
  } catch (error) {
    console.error("Admin approve experience error:", error);
    return res.status(500).json({
      error: "Unable to approve experience entry.",
    });
  }
});
module.exports = router;

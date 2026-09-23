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
async function findOwnedEntry(entryId, userId) {
  return db("experience_entries")
    .where({
      entry_id: entryId,
      author_id: userId,
    })
    .first();
}

/* Get a specific experience entry by ID */
router.post("/", requireAuth, async (req, res) => {
  try {
    const { errors, data, technology_ids, custom_tech_name } =
      validateExperiencePayload(req.body, { partial: false });

    const referenceErrors = await validateReferenceData(
      data.industry_id,
      technology_ids,
    );

    const allErrors = [...errors, ...referenceErrors];

    if (allErrors.length > 0) {
      return res.status(400).json({
        error: "Experience validation failed.",
        details: allErrors,
      });
    }
    /* Create a new experience entry */
    const entryId = await db.transaction(async (trx) => {
      const insertedIds = await trx("experience_entries").insert({
        ...data,
        author_id: req.session.user.user_id,
        moderation_status: "Draft",
        last_updated_date: new Date().toISOString(),
      });

      const newEntryId = insertedIds[0];

      const technologyRows = technology_ids.map((tech_id) => ({
        entry_id: newEntryId,
        tech_id,
        custom_tech_name: custom_tech_name || null,
      }));

      await trx("experience_technologies").insert(technologyRows);

      return newEntryId;
    });

    const entry = await getEntryWithTechnologies(entryId);

    return res.status(201).json({
      message: "Experience entry created successfully.",
      entry,
    });
  } catch (error) {
    console.error("Create experience error:", error);
    return res.status(500).json({
      error: "Unable to create experience entry.",
    });
  }
});
/* Get a user's own experience entries */
router.get("/my", requireAuth, async (req, res) => {
  try {
    const entries = await db("experience_entries")
      .where({ author_id: req.session.user.user_id })
      .orderBy("last_updated_date", "desc");

    const entriesWithTechnologies = [];

    for (const entry of entries) {
      entriesWithTechnologies.push(
        await getEntryWithTechnologies(entry.entry_id),
      );
    }

    return res.status(200).json({
      entries: entriesWithTechnologies,
    });
  } catch (error) {
    console.error("Fetch my experiences error:", error);
    return res.status(500).json({
      error: "Unable to fetch experience entries.",
    });
  }
});
/* Get a specific experience entry by ID */
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const entryId = Number(req.params.id);

    if (!Number.isInteger(entryId)) {
      return res.status(400).json({
        error: "Experience entry ID must be an integer.",
      });
    }

    const ownedEntry = await findOwnedEntry(entryId, req.session.user.user_id);

    if (!ownedEntry) {
      return res.status(404).json({
        error: "Experience entry not found.",
      });
    }

    const entry = await getEntryWithTechnologies(entryId);

    return res.status(200).json({
      entry,
    });
  } catch (error) {
    console.error("Fetch experience error:", error);
    return res.status(500).json({
      error: "Unable to fetch experience entry.",
    });
  }
});
/* Update a specific experience entry by ID */
router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const entryId = Number(req.params.id);

    if (!Number.isInteger(entryId)) {
      return res.status(400).json({
        error: "Experience entry ID must be an integer.",
      });
    }

    const ownedEntry = await findOwnedEntry(entryId, req.session.user.user_id);

    if (!ownedEntry) {
      return res.status(404).json({
        error: "Experience entry not found.",
      });
    }

    if (ownedEntry.moderation_status === "Pending") {
      return res.status(400).json({
        error: "Entries under review cannot be edited.",
      });
    }

    const { errors, data, technology_ids, custom_tech_name } =
      validateExperiencePayload(req.body, { partial: true });

    if (
      Object.keys(data).length === 0 &&
      technology_ids === undefined &&
      custom_tech_name === undefined
    ) {
      return res.status(400).json({
        error: "No valid experience fields were provided.",
      });
    }

    if (custom_tech_name !== undefined && technology_ids === undefined) {
      return res.status(400).json({
        error:
          "Custom technology name can only be updated with technology IDs.",
      });
    }
    /* Validate the reference data */
    const referenceErrors = await validateReferenceData(
      data.industry_id,
      technology_ids,
    );

    const allErrors = [...errors, ...referenceErrors];

    if (allErrors.length > 0) {
      return res.status(400).json({
        error: "Experience validation failed.",
        details: allErrors,
      });
    }
    /* Update the experience entry in the database */
    await db.transaction(async (trx) => {
      if (Object.keys(data).length > 0) {
        await trx("experience_entries")
          .where({ entry_id: entryId })
          .update({
            ...data,
            last_updated_date: new Date().toISOString(),
          });
      }

      if (technology_ids !== undefined) {
        await trx("experience_technologies").where({ entry_id: entryId }).del();

        const technologyRows = technology_ids.map((tech_id) => ({
          entry_id: entryId,
          tech_id,
          custom_tech_name: custom_tech_name || null,
        }));

        await trx("experience_technologies").insert(technologyRows);
      }
    });

    const entry = await getEntryWithTechnologies(entryId);

    return res.status(200).json({
      message: "Experience entry updated successfully.",
      entry,
    });
  } catch (error) {
    console.error("Update experience error:", error);
    return res.status(500).json({
      error: "Unable to update experience entry.",
    });
  }
});
/* Delete a specific experience entry by ID */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const entryId = Number(req.params.id);

    if (!Number.isInteger(entryId)) {
      return res.status(400).json({
        error: "Experience entry ID must be an integer.",
      });
    }

    const ownedEntry = await findOwnedEntry(entryId, req.session.user.user_id);

    if (!ownedEntry) {
      return res.status(404).json({
        error: "Experience entry not found.",
      });
    }

    await db.transaction(async (trx) => {
      await trx("experience_technologies").where({ entry_id: entryId }).del();

      await trx("experience_entries").where({ entry_id: entryId }).del();
    });

    return res.status(200).json({
      message: "Experience entry deleted successfully.",
    });
  } catch (error) {
    console.error("Delete experience error:", error);
    return res.status(500).json({
      error: "Unable to delete experience entry.",
    });
  }
});
/* Submit a specific experience entry by ID for review */
router.post("/:id/submit", requireAuth, async (req, res) => {
  try {
    const entryId = Number(req.params.id);

    if (!Number.isInteger(entryId)) {
      return res.status(400).json({
        error: "Experience entry ID must be an integer.",
      });
    }

    const ownedEntry = await findOwnedEntry(entryId, req.session.user.user_id);

    if (!ownedEntry) {
      return res.status(404).json({
        error: "Experience entry not found.",
      });
    }

    if (ownedEntry.moderation_status === "Pending") {
      return res.status(400).json({
        error: "Experience entry has already been submitted for review.",
      });
    }

    if (ownedEntry.moderation_status === "Approved") {
      return res.status(400).json({
        error: "Approved entries cannot be resubmitted.",
      });
    }

    const technologies = await db("experience_technologies").where({
      entry_id: entryId,
    });

    if (technologies.length === 0) {
      return res.status(400).json({
        error: "At least one technology is required before submission.",
      });
    }
    /* Update the experience entry in the database */
    await db("experience_entries").where({ entry_id: entryId }).update({
      moderation_status: "Pending",
      submission_date: new Date().toISOString(),
      last_updated_date: new Date().toISOString(),
    });

    const entry = await getEntryWithTechnologies(entryId);

    return res.status(200).json({
      message: "Experience entry submitted for review.",
      entry,
    });
  } catch (error) {
    console.error("Submit experience error:", error);
    return res.status(500).json({
      error: "Unable to submit experience entry.",
    });
  }
});

module.exports = router;

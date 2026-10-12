const express = require("express");
const db = require("../db/knex");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/industries", requireAuth, async (req, res) => {
  try {
    const industries = await db("industries")
      .select("industry_id", "industry_name")
      .orderBy("industry_name", "asc");

    return res.status(200).json({ industries });
  } catch (error) {
    console.error("Fetch industries error:", error);
    return res.status(500).json({
      error: "Unable to fetch industries.",
    });
  }
});

router.get("/technologies", requireAuth, async (req, res) => {
  try {
    const technologies = await db("technologies")
      .select("tech_id", "tech_name")
      .orderBy("tech_name", "asc");

    return res.status(200).json({ technologies });
  } catch (error) {
    console.error("Fetch technologies error:", error);
    return res.status(500).json({
      error: "Unable to fetch technologies.",
    });
  }
});

module.exports = router;

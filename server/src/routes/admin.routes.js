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

const knex = require("knex");
const config = require("../../knexfile"); //database configuration

const env = process.env.NODE_ENV || "development"; //db connections file and this also check what env we are running it for, by defalut it connects to dev.slite3
if (["staging", "production"].includes(env) && !process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required for staging and production.");
}

module.exports = knex(config[env]);

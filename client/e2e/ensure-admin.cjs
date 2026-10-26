const path = require("node:path");

process.chdir(path.resolve(__dirname, "../../server"));

const db = require("../../server/src/db/knex");
const { hashPassword } = require("../../server/src/services/password.service");

async function ensureAdmin() {
  await db.migrate.latest();
  const email = "admin1@test.com";
  const password_hash = await hashPassword("P@ssw0rd1");
  const existing = await db("users").where({ email }).first();

  if (existing) {
    await db("users").where({ email }).update({
      full_name: "Admin One",
      password_hash,
      role: "Admin",
    });
  } else {
    await db("users").insert({
      full_name: "Admin One",
      email,
      password_hash,
      role: "Admin",
    });
  }
}

ensureAdmin()
  .then(() => db.destroy())
  .catch(async (error) => {
    console.error(error);
    await db.destroy();
    process.exitCode = 1;
  });

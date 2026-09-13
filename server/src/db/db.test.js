const fs = require("fs");
const path = require("path");

process.env.NODE_ENV = "test";

const db = require("./knex");

describe("Database setup", () => {
  const dbPath = path.join(__dirname, "../../test.sqlite3");

  beforeAll(async () => {
    await db.migrate.rollback(undefined, true);
    await db.migrate.latest();
  });

  afterAll(async () => {
    await db.destroy();

    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
  });

  test("migrations create the expected tables", async () => {
    const tables = await db("sqlite_master")
      .select("name")
      .where({ type: "table" })
      .where("name", "not like", "sqlite_%");

    const tableNames = tables.map((table) => table.name).sort();

    expect(tableNames).toEqual(
      [
        "experience_entries",
        "experience_technologies",
        "industries",
        "knex_migrations",
        "knex_migrations_lock",
        "technologies",
        "users",
      ].sort(),
    );
  });
});

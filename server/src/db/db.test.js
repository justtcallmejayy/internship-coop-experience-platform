const fs = require("fs");
const path = require("path");

describe("Database setup", () => {
  const dbPath = path.join(__dirname, "../../test.sqlite3");

  beforeAll(() => {
    process.env.NODE_ENV = "test";
  });

  afterAll(async () => {
    const knex = require("./knex");
    await knex.destroy();

    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
  });

  test("migrations create the expected tables", async () => {
    const knex = require("./knex");

    await knex.migrate.latest();

    const tables = await knex("sqlite_master")
      .select("name")
      .where({ type: "table" })
      .whereNotLike("name", "sqlite_%");

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

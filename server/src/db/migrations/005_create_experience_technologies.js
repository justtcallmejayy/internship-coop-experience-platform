exports.up = async (knex) => {
  await knex.schema.createTable("experience_technologies", (t) => {
    t.increments("exp_tech_id").primary();

    t.integer("entry_id")
      .notNullable()
      .references("entry_id")
      .inTable("experience_entries")
      .onDelete("CASCADE");

    t.integer("tech_id")
      .notNullable()
      .references("tech_id")
      .inTable("technologies");

    t.string("custom_tech_name", 50).nullable();

    t.unique(["entry_id", "tech_id"]);
    t.index(["entry_id"]);
    t.index(["tech_id"]);
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists("experience_technologies");
};


/* About content: this will create the experience table.
- exp_tech_id: auto-incrementing p key for each experience-technology relationship.
- entry_id: the ID of the experience entry this relationship belongs to.
- tech_id: the ID of the technology this relationship belongs to.
- custom_tech_name: a custom name for the technology if it's not in the technologies table.
*/
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

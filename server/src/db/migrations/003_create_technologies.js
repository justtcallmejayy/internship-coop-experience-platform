
/* About the table content: this will create the technologies table.
- tech_id: auto-incrementing primary key for each technology.
- tech_name: the name of the technology, required and up to 100 characters.
*/
exports.up = async (knex) => {
  await knex.schema.createTable("technologies", (t) => {
    t.increments("tech_id").primary();
    t.string("tech_name", 100).notNullable().unique();
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists("technologies");
};

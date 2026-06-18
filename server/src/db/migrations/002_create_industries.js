/* About the table content: this will create the industries table.
- industry_id: auto-incrementing primary key for each industry just like uid.
- industry_name: the name of the industry, required and up to 100 characters.
*/
exports.up = async (knex) => {
  await knex.schema.createTable("industries", (t) => {
    t.increments("industry_id").primary();
    t.string("industry_name", 100).notNullable().unique();
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists("industries");
};

exports.up = async (knex) => {
  await knex.schema.createTable("industries", (t) => {
    t.increments("industry_id").primary();
    t.string("industry_name", 100).notNullable().unique();
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists("industries");
};

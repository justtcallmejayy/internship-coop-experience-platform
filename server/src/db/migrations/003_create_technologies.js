exports.up = async (knex) => {
  await knex.schema.createTable("technologies", (t) => {
    t.increments("tech_id").primary();
    t.string("tech_name", 100).notNullable().unique();
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists("technologies");
};

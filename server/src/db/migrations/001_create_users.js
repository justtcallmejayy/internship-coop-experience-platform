exports.up = async (knex) => {
  await knex.schema.createTable("users", (t) => {
    t.increments("user_id").primary();

    t.string("full_name", 200).notNullable();
    t.string("email", 320).notNullable().unique();
    t.string("password_hash", 255).notNullable();

    t.string("role", 20).notNullable(); // Student or Admin

    t.string("program", 120).nullable();
    t.integer("graduation_year").nullable();
    t.string("linkedin_url", 255).nullable();

    t.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists("users");
};

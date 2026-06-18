exports.up = async (knex) => {
  await knex.schema.createTable("experience_entries", (t) => {
    t.increments("entry_id").primary();

    t.integer("author_id")
      .notNullable()
      .references("user_id")
      .inTable("users")
      .onDelete("CASCADE");

    t.integer("industry_id")
      .notNullable()
      .references("industry_id")
      .inTable("industries");

    t.integer("reviewed_by_id")
      .nullable()
      .references("user_id")
      .inTable("users");

    t.string("company_name", 200).notNullable();
    t.string("role_title", 200).notNullable();

    t.string("work_term_type", 20).notNullable();
    t.string("work_mode", 20).notNullable();

    t.string("location_city", 120).notNullable();
    t.string("location_province", 120).notNullable();

    t.integer("start_month").notNullable();
    t.integer("start_year").notNullable();
    t.integer("end_month").notNullable();
    t.integer("end_year").notNullable();

    t.string("interview_format", 20).notNullable();

    t.text("learning_outcomes").notNullable();

    t.string("moderation_status", 20).notNullable().defaultTo("Draft");

    t.timestamp("submission_date").nullable();
    t.timestamp("last_updated_date").notNullable().defaultTo(knex.fn.now());
    t.timestamp("review_date").nullable();

    t.index(["author_id"]);
    t.index(["industry_id"]);
    t.index(["moderation_status"]);
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists("experience_entries");
};

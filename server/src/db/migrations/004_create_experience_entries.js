/* About the table content: this will create the experience entries table.
- entry_id: auto-incrementing primary key for each experience entry.
- author_id: the ID of the user who created the experience entry.
- industry_id: the ID of the industry this experience entry belongs to.
- reviewed_by_id: the ID of the user who reviewed the experience entry.
- company_name: the name of the company where the experience was gained.
- role_title: the title of the role held at the company.
- work_term_type: the type of work term (e.g., full-time, part-time, internship).
- work_mode: the mode of work (e.g., on-site, remote).
- location_city: the city where the experience was gained.
- location_province: the province where the experience was gained.
- start_month: the month when the experience started.
- start_year: the year when the experience started.
- end_month: the month when the experience ended.
- end_year: the year when the experience ended.
- interview_format: the format of the interview (e.g., in-person, video).
- learning_outcomes: a description of what was learned during the experience.
- moderation_status: a flag indicating whether a user has submitted their entry for moderation and its current status (Draft, Submitted, Approved, Rejected).
- submission_date: a timestamp indicating when a user submitted their entry for moderation.
- last_updated_date: a timestamp indicating when an entry was last updated.
- review_date: a timestamp indicating when an entry was reviewed by a moderator.
*/
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

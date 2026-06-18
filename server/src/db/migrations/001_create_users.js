//this will create the users tble.

/* About the table content: this will match my proposal
- user_id: auto-incrementing primary key for each user.
- full_name: the user's full name, required and up to 200 characters.
- email: email address, required, unique, and up to 320 characters.
- password_hash: a hashed version of the user's password, required and up to 255 characters.
- role: the user's role in the system (e.g., "Student" or "Admin"), required and up to 20 characters.
- program: the academic program the user is enrolled in (optional, up to 120 characters).
- graduation_year: the year the user is expected to graduate (optional).
- linkedin_url: a URL to the user's LinkedIn profile (optional, up to 255 characters).
- created_at: a timestamp indicating when the user was created, automatically set to the current time when a new record is inserted. for this i might need to use a realtime JS function to set the default value to the current timestamp.
*/
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

//this will drop or rollback the users table if we need to undo the migration.
exports.down = async (knex) => {
  await knex.schema.dropTableIfExists("users");
};

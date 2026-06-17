## Phase 2 Debug Notes

During database setup, I encountered Knex migration errors caused by running commands from the wrong folder and incomplete migration files missing `exports.up` and `exports.down`. I fixed this by running commands from `/server`, correcting migration file contents, and keeping tests outside the migrations folder.

Both the tests for the database and app passed 
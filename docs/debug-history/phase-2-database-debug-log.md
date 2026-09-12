## Phase 2 Debug Notes

During database setup, I encountered Knex migration errors caused by running commands from the wrong folder and incomplete migration files missing `exports.up` and `exports.down`. I fixed this by running commands from `/server`, correcting migration file contents, and keeping tests outside the migrations folder.

Both the tests for the database and app passed

<!--

the below error was fixed 

 PASS  src/db/db.test.js
 PASS  src/routes/auth.routes.test.js
 PASS  src/services/password.service.test.js
 PASS  src/app.test.js

Test Suites: 4 passed, 4 total
Tests:       6 passed, 6 total
Snapshots:   0 total
Time:        0.646 s, estimated 1 s
Ran all test suites.



> server@1.0.0 test
> jest --runInBand

 FAIL  src/routes/auth.routes.test.js
  ● Console

    console.error
      Register error: Error: Unable to acquire a connection
          at Client_SQLite3.acquireConnection (/Users/jayychoksi/Developer/02_School_Code/Capstone/capstone/server/node_modules/knex/lib/client.js:404:13)
          at Runner.ensureConnection (/Users/jayychoksi/Developer/02_School_Code/Capstone/capstone/server/node_modules/knex/lib/execution/runner.js:305:46)
          at Runner.run (/Users/jayychoksi/Developer/02_School_Code/Capstone/capstone/server/node_modules/knex/lib/execution/runner.js:30:30)
          at QueryBuilder_SQLite3.Target.then (/Users/jayychoksi/Developer/02_School_Code/Capstone/capstone/server/node_modules/knex/lib/builder-interface-augmenter.js:24:43)
          at processTicksAndRejections (node:internal/process/task_queues:104:5)
          at /Users/jayychoksi/Developer/02_School_Code/Capstone/capstone/server/src/routes/auth.routes.js:51:26

      75 |     });
      76 |   } catch (error) {
    > 77 |     console.error("Register error:", error);
         |             ^
      78 |     return res.status(500).json({
      79 |       error: "Unable to register account.",
      80 |     });

      at error (src/routes/auth.routes.js:77:13)

  ● POST /auth/register creates a student user

    expect(received).toBe(expected) // Object.is equality

    Expected: 201
    Received: 500

      48 |   });
      49 |
    > 50 |   expect(res.statusCode).toBe(201);
         |                          ^
      51 |   expect(res.body.user.email).toBe("student1@test.com");
      52 |   expect(res.body.user.role).toBe("Student");
      53 |   expect(res.body.user.password_hash).toBeUndefined();

      at Object.toBe (src/routes/auth.routes.test.js:50:26)

 PASS  src/db/db.test.js
 PASS  src/services/password.service.test.js
 PASS  src/app.test.js

Test Suites: 1 failed, 3 passed, 4 total
Tests:       1 failed, 5 passed, 6 total
Snapshots:   0 total
Time:        0.579 s
Ran all test suites.

test failed because: 
 -->

process.env.NODE_ENV = "test";
process.env.SESSION_SECRET = "test-secret";

const request = require("supertest");
const app = require("../app");
const db = require("../db/knex");
const { hashPassword } = require("../services/password.service");

/* 
reason to fail
 Test suite failed to run

    Your test suite must contain at least one test.

      at onResult (node_modules/@jest/core/build/index.js:1054:18)
      at node_modules/@jest/core/build/index.js:1125:165
      at node_modules/emittery/index.js:363:13
          at Array.map (<anonymous>)
      at Emittery.emit (node_modules/emittery/index.js:361:23)

      AI-assisted debugging was used to understand why Jest failed when test code was  in auth.routes.js. (it was use to just create a sample test case for auth routes.)
*/

describe("Auth routes", () => {
  beforeAll(async () => {
    await db.migrate.rollback(undefined, true);
    await db.migrate.latest();
  });

  afterAll(async () => {
    await db.destroy();
  });

  test("GET /auth/me rejects unauthenticated users", async () => {
    const res = await request(app).get("/auth/me");

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Authentication required.");
  });
});

// creates a student user
test("POST /auth/register creates a student user", async () => {
  const res = await request(app).post("/auth/register").send({
    full_name: "Student One",
    email: "student1@test.com",
    password: "P@ssw0rd123",
  });

  expect(res.statusCode).toBe(201);
  expect(res.body.user.email).toBe("student1@test.com");
  expect(res.body.user.role).toBe("Student");
  expect(res.body.user.password_hash).toBeUndefined();

  const userInDb = await db("users")
    .where({ email: "student1@test.com" })
    .first();

  expect(userInDb).toBeTruthy();
  expect(userInDb.password_hash).not.toBe("P@ssw0rd123");
});

//rejects weak password

//rejects duplicate email registration

//login with correct credentials

//login with incorrect credentials

//logout user
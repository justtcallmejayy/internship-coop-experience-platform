process.env.NODE_ENV = "test";
process.env.SESSION_SECRET = "test-secret";

const request = require("supertest");
const app = require("../app");
const db = require("../db/knex");
const { hashPassword } = require("../services/password.service");

/*
Previous reason for failure:

Test suite failed to run:
"Your test suite must contain at least one test."

This happened because test code was previously placed incorrectly
or Jest was detecting a file that did not contain an actual test().

AI-assisted debugging was used to understand the Jest error
and to create the initial sample authentication route test cases.
*/

describe("Auth routes", () => {
  // Reset the test database and run all migrations before the test suite starts.
  beforeAll(async () => {
    await db.migrate.rollback(undefined, true);
    await db.migrate.latest();
  });

  /*
  Clear database data before every test so that each test starts
  with a clean and predictable database.

  Child tables must be cleared before parent tables because of
  foreign key relationships. Otherwise, deleting a parent record
  could cause a foreign key constraint violation.
  */
  beforeEach(async () => {
    await db("experience_technologies").del();
    await db("experience_entries").del();
    await db("technologies").del();
    await db("industries").del();
    await db("users").del();
  });

  // Close the database connection after all tests have finished.
  afterAll(async () => {
    await db.destroy();
  });

  // Creates a student user with valid registration information.
  test("POST /auth/register creates a student user", async () => {
    const res = await request(app).post("/auth/register").send({
      full_name: "Student One",
      email: "student1@test.com",
      password: "P@ssw0rd123",
    });

    expect(res.statusCode).toBe(201);

    // Check that the correct user information is returned.
    expect(res.body.user.email).toBe("student1@test.com");
    expect(res.body.user.role).toBe("Student");

    // The password hash should never be returned to the client.
    expect(res.body.user.password_hash).toBeUndefined();

    // Check that the user was actually saved in the database.
    const userInDb = await db("users")
      .where({ email: "student1@test.com" })
      .first();

    expect(userInDb).toBeTruthy();

    // The password stored in the database should be hashed,
    // not stored as the original plain-text password.
    expect(userInDb.password_hash).not.toBe("P@ssw0rd123");
  });

  // Rejects registration when the password does not meet requirements.
  test("POST /auth/register rejects weak password", async () => {
    const res = await request(app).post("/auth/register").send({
      full_name: "Student One",
      email: "student1@test.com",
      password: "weak",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("Password must be");
  });

  // Rejects registration when an account already uses the same email.
  test("POST /auth/register rejects duplicate email registration", async () => {
    const passwordHash = await hashPassword("P@ssw0rd123");

    // Insert an existing user before attempting duplicate registration.
    await db("users").insert({
      full_name: "Student One",
      email: "student1@test.com",
      password_hash: passwordHash,
      role: "Student",
    });

    const res = await request(app).post("/auth/register").send({
      full_name: "Student Two",
      email: "student1@test.com",
      password: "P@ssw0rd123",
    });

    expect(res.statusCode).toBe(409);
    expect(res.body.error).toBe("An account with this email already exists.");
  });

  // Logs in successfully when the email and password are correct.
  test("POST /auth/login logs in with correct credentials", async () => {
    const passwordHash = await hashPassword("P@ssw0rd123");

    // Create a user that can be used for the login test.
    await db("users").insert({
      full_name: "Student One",
      email: "student1@test.com",
      password_hash: passwordHash,
      role: "Student",
    });

    /*
    request.agent(app) keeps the session cookie between requests.

    This allows us to:
    1. Log in
    2. Keep the session
    3. Call /auth/me as the same logged-in user
    */
    const agent = request.agent(app);

    const loginRes = await agent.post("/auth/login").send({
      email: "student1@test.com",
      password: "P@ssw0rd123",
    });

    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body.user.email).toBe("student1@test.com");

    // Confirm that the session now recognizes the logged-in user.
    const meRes = await agent.get("/auth/me");

    expect(meRes.statusCode).toBe(200);
    expect(meRes.body.user.email).toBe("student1@test.com");
  });

  // Rejects login when the password is incorrect.
  test("POST /auth/login rejects incorrect credentials", async () => {
    const passwordHash = await hashPassword("P@ssw0rd123");

    await db("users").insert({
      full_name: "Student One",
      email: "student1@test.com",
      password_hash: passwordHash,
      role: "Student",
    });

    const res = await request(app).post("/auth/login").send({
      email: "student1@test.com",
      password: "WrongPassword1@",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Email or password is incorrect.");
  });

  // Rejects users who try to access /auth/me without logging in.
  test("GET /auth/me rejects unauthenticated users", async () => {
    const res = await request(app).get("/auth/me");

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Authentication required.");
  });

  // Logs the user out and verifies that the session is removed.
  test("POST /auth/logout clears the user session", async () => {
    const passwordHash = await hashPassword("P@ssw0rd123");

    await db("users").insert({
      full_name: "Student One",
      email: "student1@test.com",
      password_hash: passwordHash,
      role: "Student",
    });

    const agent = request.agent(app);

    // Log in first so that a session exists.
    const loginRes = await agent.post("/auth/login").send({
      email: "student1@test.com",
      password: "P@ssw0rd123",
    });

    expect(loginRes.statusCode).toBe(200);

    // Log out using the same session.
    const logoutRes = await agent.post("/auth/logout");

    expect(logoutRes.statusCode).toBe(200);

    // After logout, the same session should no longer be authenticated.
    const meRes = await agent.get("/auth/me");

    expect(meRes.statusCode).toBe(401);
    expect(meRes.body.error).toBe("Authentication required.");
  });
});

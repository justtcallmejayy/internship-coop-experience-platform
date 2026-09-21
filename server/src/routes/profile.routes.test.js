process.env.NODE_ENV = "test";
process.env.SESSION_SECRET = "test-secret";

const request = require("supertest");
const app = require("../app");
const db = require("../db/knex");
const { hashPassword } = require("../services/password.service");

async function createStudentUser() {
  const password_hash = await hashPassword("P@ssw0rd1");

  const insertedIds = await db("users").insert({
    full_name: "Student One",
    email: "student1@test.com",
    password_hash,
    role: "Student",
    program: "CST - Software Development",
    graduation_year: 2026,
    linkedin_url: "https://www.linkedin.com/in/studentone", // this is a valid LinkedIn URL for example purposes
  });

  return insertedIds[0];
}

// Test suite for profile routes
async function loginAsStudent(agent) {
  await agent.post("/auth/login").send({
    email: "student1@test.com",
    password: "P@ssw0rd123",
  });
}

describe("Profile routes", () => {
  beforeAll(async () => {
    await db.migrate.rollback(undefined, true);
    await db.migrate.latest();
  });

  beforeEach(async () => {
    await db("users").del();
  });

  afterAll(async () => {
    await db.destroy();
  });

  test("GET /profile rejects unauthenticated users", async () => {
    const res = await request(app).get("/profile");

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Authentication required.");
  });
  // profile routes test for authenticated users returning user profile data loggedin as a student

  //profile routes test for updated profile data logged in as a student

  //profile rejects email update.

  //profile rejects role update

  //profile rejects invlaid graduation year update

  //profile rejects invalid linkedin url update

  //profile rejects invalid profile feilds update

  //
});

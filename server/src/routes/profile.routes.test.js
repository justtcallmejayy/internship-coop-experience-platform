process.env.NODE_ENV = "test";
process.env.SESSION_SECRET = "test-secret";

const request = require("supertest");
const app = require("../app");
const db = require("../db/knex");
const { hashPassword } = require("../services/password.service");

async function createStudentUser() {
  const password_hash = await hashPassword("P@ssw0rd123");

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
  // profile routes test for authenticated users returning user profile data loggedin as a student rejected unauthenticated users and returns logged-in user profile data for authenticated users.
  test("GET /profile rejects unauthenticated users", async () => {
    const res = await request(app).get("/profile");

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Authentication required.");
  });

  test("GET /profile returns logged-in user profile", async () => {
    await createStudentUser();

    const agent = request.agent(app);
    await loginAsStudent(agent);

    const res = await agent.get("/profile");

    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe("student1@test.com");
    expect(res.body.user.full_name).toBe("Student One");
    expect(res.body.user.program).toBe("CST - Software Development");
    expect(res.body.user.graduation_year).toBe(2026);
    expect(res.body.user.linkedin_url).toBe(
      "https://www.linkedin.com/in/studentone",
    );
    expect(res.body.user.password_hash).toBeUndefined();
  });

  //profile routes test for updated profile data logged in as a student

  test("PATCH /profile updates allowed profile fields", async () => {
    await createStudentUser();

    const agent = request.agent(app);
    await loginAsStudent(agent);

    const res = await agent.patch("/profile").send({
      full_name: "Updated Student",
      program: "Computer Systems Technology - Software Development",
      graduation_year: 2027,
      linkedin_url: "https://www.linkedin.com/in/updatedstudent",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Profile updated successfully.");
    expect(res.body.user.full_name).toBe("Updated Student");
    expect(res.body.user.program).toBe(
      "Computer Systems Technology - Software Development",
    );
    expect(res.body.user.graduation_year).toBe(2027);
    expect(res.body.user.linkedin_url).toBe(
      "https://www.linkedin.com/in/updatedstudent",
    );

    const userInDb = await db("users")
      .where({ email: "student1@test.com" })
      .first();

    expect(userInDb.full_name).toBe("Updated Student");
  });

  //profile rejects email update.

  test("PATCH /profile rejects email update", async () => {
    await createStudentUser();

    const agent = request.agent(app);
    await loginAsStudent(agent);

    const res = await agent.patch("/profile").send({
      email: "newemail@test.com",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("email");
  });
  //profile rejects role update

  test("PATCH /profile rejects role update", async () => {
    await createStudentUser();

    const agent = request.agent(app);
    await loginAsStudent(agent);

    const res = await agent.patch("/profile").send({
      role: "Admin",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("role");
  });

  //profile rejects invlaid graduation year update
  test("PATCH /profile rejects invalid graduation year", async () => {
    await createStudentUser();

    const agent = request.agent(app);
    await loginAsStudent(agent);

    const res = await agent.patch("/profile").send({
      graduation_year: 1800,
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Profile validation failed.");
    expect(res.body.details).toContain(
      "Graduation year must be a valid year between 2020 and 2100.",
    );
  });
  //profile rejects invalid linkedin url update

  test("PATCH /profile rejects invalid LinkedIn URL", async () => {
    await createStudentUser();

    const agent = request.agent(app);
    await loginAsStudent(agent);

    const res = await agent.patch("/profile").send({
      linkedin_url: "https://example.com/studentone",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Profile validation failed.");
    expect(res.body.details).toContain(
      "LinkedIn URL must be a valid LinkedIn URL.",
    );
  });

  //profile rejects invalid profile feilds update
  test("PATCH /profile rejects request with no valid profile fields", async () => {
    await createStudentUser();

    const agent = request.agent(app);
    await loginAsStudent(agent);

    const res = await agent.patch("/profile").send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("No valid profile fields were provided.");
  });
  //
});

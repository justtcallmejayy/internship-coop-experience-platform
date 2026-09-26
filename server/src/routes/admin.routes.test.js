process.env.NODE_ENV = "test";
process.env.SESSION_SECRET = "test-secret";

const request = require("supertest");
const app = require("../app");
const db = require("../db/knex");
const { hashPassword } = require("../services/password.service");
// Helper function to create a test user
async function createUser({
  full_name,
  email,
  password = "P@ssw0rd123",
  role,
}) {
  const password_hash = await hashPassword(password);

  const insertedIds = await db("users").insert({
    full_name,
    email,
    password_hash,
    role,
  });

  return insertedIds[0];
}

async function login(agent, email, password = "P@ssw0rd123") {
  await agent.post("/auth/login").send({
    email,
    password,
  });
}

async function seedReferenceData() {
  const [industryId] = await db("industries").insert({
    industry_name: "Technology",
  });

  const [techId] = await db("technologies").insert({
    tech_name: "SQL",
  });

  return {
    industryId,
    techId,
  };
}
// async function for creating an experience entry
async function createPendingExperience({ authorId, industryId, techId }) {
  const [entryId] = await db("experience_entries").insert({
    author_id: authorId,
    industry_id: industryId,
    company_name: "TransUnion Canada",
    role_title: "Engineering Operations Co-op",
    work_term_type: "Co-op",
    work_mode: "Hybrid",
    location_city: "Burlington",
    location_province: "ON",
    start_month: 9,
    start_year: 2025,
    end_month: 12,
    end_year: 2025,
    interview_format: "Online",
    learning_outcomes:
      "Improved troubleshooting, documentation, endpoint support, and enterprise IT workflow understanding.",
    moderation_status: "Pending",
    submission_date: new Date().toISOString(),
    last_updated_date: new Date().toISOString(),
  });

  await db("experience_technologies").insert({
    entry_id: entryId,
    tech_id: techId,
  });

  return entryId;
}
//admin route helper function to validate entryId
describe("Admin moderation routes", () => {
  let refs;
  let studentId;
  let adminId;

  beforeAll(async () => {
    await db.migrate.rollback(undefined, true);
    await db.migrate.latest();
  });

  beforeEach(async () => {
    await db("experience_technologies").del();
    await db("experience_entries").del();
    await db("technologies").del();
    await db("industries").del();
    await db("users").del();

    refs = await seedReferenceData();

    studentId = await createUser({
      full_name: "Student One",
      email: "student1@test.com",
      role: "Student",
    });

    adminId = await createUser({
      full_name: "Admin One",
      email: "admin1@test.com",
      role: "Admin",
    });
  });

  afterAll(async () => {
    await db.destroy();
  });

  //get /admin/experiences/pending route tests
  test("GET /admin/experiences/pending rejects unauthenticated users", async () => {
    const res = await request(app).get("/admin/experiences/pending");

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Authentication required.");
  });

  //get /admin/experiences/:id route tests
  test("GET /admin/experiences/pending rejects student users", async () => {
    const agent = request.agent(app);
    await login(agent, "student1@test.com");

    const res = await agent.get("/admin/experiences/pending");

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe("Admin access required.");
  });

  //get /admin/experiences/:id route tests
  test("GET /admin/experiences/pending returns pending entries for admin", async () => {
    await createPendingExperience({
      authorId: studentId,
      industryId: refs.industryId,
      techId: refs.techId,
    });

    const agent = request.agent(app);
    await login(agent, "admin1@test.com");

    const res = await agent.get("/admin/experiences/pending");

    expect(res.statusCode).toBe(200);
    expect(res.body.entries).toHaveLength(1);
    expect(res.body.entries[0].moderation_status).toBe("Pending");
    expect(res.body.entries[0].author_email).toBe("student1@test.com");
  });

  //get /admin/experiences/:id route tests
  test("GET /admin/experiences/:id returns entry detail for admin", async () => {
    const entryId = await createPendingExperience({
      authorId: studentId,
      industryId: refs.industryId,
      techId: refs.techId,
    });

    const agent = request.agent(app);
    await login(agent, "admin1@test.com");

    const res = await agent.get(`/admin/experiences/${entryId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.entry.entry_id).toBe(entryId);
    expect(res.body.entry.company_name).toBe("TransUnion Canada");
    expect(res.body.entry.technologies).toHaveLength(1);
  });
  test("PATCH /admin/experiences/:id/approve approves pending entry", async () => {
    const entryId = await createPendingExperience({
      authorId: studentId,
      industryId: refs.industryId,
      techId: refs.techId,
    });

    const agent = request.agent(app);
    await login(agent, "admin1@test.com");

    const res = await agent.patch(`/admin/experiences/${entryId}/approve`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Experience entry approved.");
    expect(res.body.entry.moderation_status).toBe("Approved");
    expect(res.body.entry.reviewed_by_id).toBe(adminId);
    expect(res.body.entry.review_date).toBeTruthy();
  });

  test("PATCH /admin/experiences/:id/reject rejects pending entry", async () => {
    const entryId = await createPendingExperience({
      authorId: studentId,
      industryId: refs.industryId,
      techId: refs.techId,
    });

    const agent = request.agent(app);
    await login(agent, "admin1@test.com");

    const res = await agent.patch(`/admin/experiences/${entryId}/reject`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Experience entry rejected.");
    expect(res.body.entry.moderation_status).toBe("Rejected");
    expect(res.body.entry.reviewed_by_id).toBe(adminId);
    expect(res.body.entry.review_date).toBeTruthy();
  });

  test("PATCH /admin/experiences/:id/approve rejects non-pending entry", async () => {
    const entryId = await createPendingExperience({
      authorId: studentId,
      industryId: refs.industryId,
      techId: refs.techId,
    });

    await db("experience_entries")
      .where({ entry_id: entryId })
      .update({ moderation_status: "Approved" });

    const agent = request.agent(app);
    await login(agent, "admin1@test.com");

    const res = await agent.patch(`/admin/experiences/${entryId}/approve`);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Only Pending entries can be approved.");
  });

  test("PATCH /admin/experiences/:id/reject rejects invalid id", async () => {
    const agent = request.agent(app);
    await login(agent, "admin1@test.com");

    const res = await agent.patch("/admin/experiences/not-a-number/reject");

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Experience entry ID must be an integer.");
  });

  test("PATCH /admin/experiences/:id/reject returns 404 for missing entry", async () => {
    const agent = request.agent(app);
    await login(agent, "admin1@test.com");

    const res = await agent.patch("/admin/experiences/999/reject");

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("Experience entry not found.");
  });
});

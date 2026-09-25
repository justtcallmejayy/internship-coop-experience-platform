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
});

//this is the test code for the browse routes
process.env.NODE_ENV = "test";
process.env.SESSION_SECRET = "test-secret";

const request = require("supertest");
const app = require("../app");
const db = require("../db/knex");
const { hashPassword } = require("../services/password.service");

async function createUser({
  full_name = "Student One",
  email = "student1@test.com",
  password = "P@ssw0rd123",
  role = "Student",
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
async function login(
  agent,
  email = "student1@test.com",
  password = "P@ssw0rd1",
) {
  await agent.post("/auth/login").send({
    email,
    password,
  });
}

async function seedReferenceData() {
  const [technologyIndustryId] = await db("industries").insert({
    industry_name: "Technology",
  });

  const [financeIndustryId] = await db("industries").insert({
    industry_name: "Finance",
  });

  const [healthcareIndustryId] = await db("industries").insert({
    industry_name: "Healthcare",
  });

  const [sqlTechId] = await db("technologies").insert({
    tech_name: "SQL",
  });

  const [reactTechId] = await db("technologies").insert({
    tech_name: "React",
  });

  return {
    industries: {
      technology: technologyIndustryId,
      finance: financeIndustryId,
      healthcare: healthcareIndustryId,
    },
    technologies: {
      sql: sqlTechId,
      react: reactTechId,
    },
  };
}

async function createExperience({
  authorId,
  industryId,
  techId,
  companyName,
  roleTitle,
  workTermType = "Co-op",
  workMode = "Hybrid",
  status = "Approved",
  submissionDate = "2026-01-01T10:00:00.000Z",
}) {
  const [entryId] = await db("experience_entries").insert({
    author_id: authorId,
    industry_id: industryId,
    company_name: companyName,
    role_title: roleTitle,
    work_term_type: workTermType,
    work_mode: workMode,
    location_city: "Burlington",
    location_province: "ON",
    start_month: 9,
    start_year: 2025,
    end_month: 12,
    end_year: 2025,
    interview_format: "Online",
    learning_outcomes:
      "Improved technical skills, workplace communication, and understanding of professional software workflows.",
    moderation_status: status,
    submission_date: status === "Draft" ? null : submissionDate,
    last_updated_date: submissionDate,
  });

  await db("experience_technologies").insert({
    entry_id: entryId,
    tech_id: techId,
  });

  return entryId;
}

describe("Browse approved experience routes", () => {
  let refs;
  let studentId;

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
  });

  afterAll(async () => {
    await db.destroy();
  });

  test("GET /browse/experiences rejects unauthenticated users", async () => {
    const res = await request(app).get("/browse/experiences");

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Authentication required.");
  });

  test("GET /browse/experiences returns only Approved entries", async () => {
    await createExperience({
      authorId: studentId,
      industryId: refs.industries.technology,
      techId: refs.technologies.sql,
      companyName: "TransUnion Canada",
      roleTitle: "Engineering Operations Co-op",
      status: "Approved",
    });

    await createExperience({
      authorId: studentId,
      industryId: refs.industries.finance,
      techId: refs.technologies.sql,
      companyName: "Foresters Financial",
      roleTitle: "Security Administrator Co-op",
      status: "Pending",
    });

    await createExperience({
      authorId: studentId,
      industryId: refs.industries.healthcare,
      techId: refs.technologies.react,
      companyName: "West Haldimand General Hospital",
      roleTitle: "HR Assistant Intern",
      status: "Rejected",
    });

    const agent = request.agent(app);
    await login(agent);

    const res = await agent.get("/browse/experiences");

    expect(res.statusCode).toBe(200);
    expect(res.body.entries).toHaveLength(1);
    expect(res.body.entries[0].company_name).toBe("TransUnion Canada");
    expect(res.body.entries[0].moderation_status).toBe("Approved");
  });
});

process.env.NODE_ENV = "test";
process.env.SESSION_SECRET = "test-secret";

/* 
Jest. (n.d.). Jest documentation: Globals. https://jestjs.io/docs/api

Jest. (n.d.). Jest documentation: Expect. https://jestjs.io/docs/expect

Forward Email. (n.d.). SuperTest: HTTP assertions made easy via SuperAgent.
https://github.com/forwardemail/supertest

OpenJS Foundation. (n.d.). Express routing.
https://expressjs.com/en/guide/routing/

Knex.js. (n.d.). Knex.js documentation.
https://knexjs.org/
*/
const request = require("supertest");
const app = require("../app");
const db = require("../db/knex");
const { hashPassword } = require("../services/password.service");

/* Helper function to create a user for testing */
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
  password = "P@ssw0rd123",
) {
  await agent.post("/auth/login").send({
    email,
    password,
  });
}

async function seedReferenceData() {
  const insertedIndustryIds = {};
  const insertedTechnologyIds = {};

  const [technologyIndustryId] = await db("industries").insert({
    industry_name: "Technology",
  });

  const [financeIndustryId] = await db("industries").insert({
    industry_name: "Finance",
  });

  insertedIndustryIds.technology = technologyIndustryId;
  insertedIndustryIds.finance = financeIndustryId;

  const [sqlTechId] = await db("technologies").insert({
    tech_name: "SQL",
  });

  const [powerShellTechId] = await db("technologies").insert({
    tech_name: "PowerShell",
  });

  const [intuneTechId] = await db("technologies").insert({
    tech_name: "Intune",
  });

  insertedTechnologyIds.sql = sqlTechId;
  insertedTechnologyIds.powerShell = powerShellTechId;
  insertedTechnologyIds.intune = intuneTechId;

  return {
    industries: insertedIndustryIds,
    technologies: insertedTechnologyIds,
  };
}

/* Helper function to create a valid experience payload for testing */
function validExperiencePayload(refs) {
  return {
    company_name: "TransUnion Canada",
    industry_id: refs.industries.technology,
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
      "Improved technical troubleshooting, endpoint support, documentation, and enterprise IT workflow understanding.",
    technology_ids: [
      refs.technologies.sql,
      refs.technologies.powerShell,
      refs.technologies.intune,
    ],
  };
}
/* Helper function to create a valid experience payload for testing */
describe("Experience routes", () => {
  let refs;

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
  });

  afterAll(async () => {
    await db.destroy();
  });
  // testing post route for experiences rejects unauthenticated users
  test("POST /experiences rejects unauthenticated users", async () => {
    const res = await request(app)
      .post("/experiences")
      .send(validExperiencePayload(refs));

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Authentication required.");
  });

  // testing post route for experiences creates a draft experience entry
  test("POST /experiences creates a draft experience entry", async () => {
    await createUser({});

    const agent = request.agent(app);
    await login(agent);

    const res = await agent
      .post("/experiences")
      .send(validExperiencePayload(refs));

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Experience entry created successfully.");
    expect(res.body.entry.company_name).toBe("TransUnion Canada");
    expect(res.body.entry.moderation_status).toBe("Draft");
    expect(res.body.entry.technologies).toHaveLength(3);

    const entryInDb = await db("experience_entries")
      .where({ entry_id: res.body.entry.entry_id })
      .first();

    expect(entryInDb).toBeTruthy();
    expect(entryInDb.author_id).toBe(res.body.entry.author_id);
  });
  //invalid work mode test for post route for experiences
  test("POST /experiences rejects invalid work mode", async () => {
    await createUser({});

    const agent = request.agent(app);
    await login(agent);

    const payload = validExperiencePayload(refs);
    payload.work_mode = "Office";

    const res = await agent.post("/experiences").send(payload);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Experience validation failed.");
    expect(res.body.details).toContain(
      "Work mode must be In-person, Hybrid, or Remote.",
    );
  });

  // testing get route for experiences returns only the logged-in user's entries
  test("GET /experiences/my returns only the logged-in user's entries", async () => {
    await createUser({
      full_name: "Student One",
      email: "student1@test.com",
    });

    await createUser({
      full_name: "Student Two",
      email: "student2@test.com",
    });

    const agentOne = request.agent(app);
    await login(agentOne, "student1@test.com");

    const agentTwo = request.agent(app);
    await login(agentTwo, "student2@test.com");

    await agentOne.post("/experiences").send(validExperiencePayload(refs));

    const secondPayload = validExperiencePayload(refs);
    secondPayload.company_name = "Foresters Financial";
    secondPayload.industry_id = refs.industries.finance;

    await agentTwo.post("/experiences").send(secondPayload);

    const res = await agentOne.get("/experiences/my");

    expect(res.statusCode).toBe(200);
    expect(res.body.entries).toHaveLength(1);
    expect(res.body.entries[0].company_name).toBe("TransUnion Canada");
  });
  //get route for experiences returns an owned entry
  test("GET /experiences/:id returns an owned entry", async () => {
    await createUser({});

    const agent = request.agent(app);
    await login(agent);

    const createRes = await agent
      .post("/experiences")
      .send(validExperiencePayload(refs));

    const entryId = createRes.body.entry.entry_id;

    const res = await agent.get(`/experiences/${entryId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.entry.entry_id).toBe(entryId);
    expect(res.body.entry.company_name).toBe("TransUnion Canada");
  });
  //patch route for experiences updates an owned draft entry
  test("PATCH /experiences/:id updates an owned draft entry", async () => {
    await createUser({});

    const agent = request.agent(app);
    await login(agent);

    const createRes = await agent
      .post("/experiences")
      .send(validExperiencePayload(refs));

    const entryId = createRes.body.entry.entry_id;

    const res = await agent.patch(`/experiences/${entryId}`).send({
      company_name: "Updated Company",
      work_mode: "Remote",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Experience entry updated successfully.");
    expect(res.body.entry.company_name).toBe("Updated Company");
    expect(res.body.entry.work_mode).toBe("Remote");
  });
  //patch route for experiences rejects editing while entry is pending
  test("PATCH /experiences/:id rejects editing while entry is Pending", async () => {
    await createUser({});

    const agent = request.agent(app);
    await login(agent);

    const createRes = await agent
      .post("/experiences")
      .send(validExperiencePayload(refs));

    const entryId = createRes.body.entry.entry_id;

    await agent.post(`/experiences/${entryId}/submit`);

    const res = await agent.patch(`/experiences/${entryId}`).send({
      company_name: "Should Not Update",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Entries under review cannot be edited.");
  });
});

process.env.NODE_ENV = "test";
process.env.SESSION_SECRET = "test-secret";

const request = require("supertest");
const app = require("../app");
const db = require("../db/knex");
const { hashPassword } = require("../services/password.service");

async function createUser() {
  const password_hash = await hashPassword("P@ssw0rd1");

  await db("users").insert({
    full_name: "Student One",
    email: "student1@test.com",
    password_hash,
    role: "Student",
  });
}

async function login(agent) {
  await agent.post("/auth/login").send({
    email: "student1@test.com",
    password: "P@ssw0rd1",
  });
}

describe("Reference routes", () => {
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

    await db("industries").insert([
      { industry_name: "Technology" },
      { industry_name: "Finance" },
    ]);

    await db("technologies").insert([
      { tech_name: "React" },
      { tech_name: "SQL" },
    ]);

    await createUser();
  });

  afterAll(async () => {
    await db.destroy();
  });

  test("GET /reference/industries rejects unauthenticated users", async () => {
    const res = await request(app).get("/reference/industries");

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Authentication required.");
  });

  test("GET /reference/industries returns industry list", async () => {
    const agent = request.agent(app);
    await login(agent);

    const res = await agent.get("/reference/industries");

    expect(res.statusCode).toBe(200);
    expect(res.body.industries).toHaveLength(2);
    expect(res.body.industries[0]).toHaveProperty("industry_id");
    expect(res.body.industries[0]).toHaveProperty("industry_name");
  });

  test("GET /reference/technologies returns technology list", async () => {
    const agent = request.agent(app);
    await login(agent);

    const res = await agent.get("/reference/technologies");

    expect(res.statusCode).toBe(200);
    expect(res.body.technologies).toHaveLength(2);
    expect(res.body.technologies[0]).toHaveProperty("tech_id");
    expect(res.body.technologies[0]).toHaveProperty("tech_name");
  });
});

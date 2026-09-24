process.env.NODE_ENV = "test";
process.env.SESSION_SECRET = "test-secret";

const request = require("supertest");
const app = require("../app");
const db = require("../db/knex");
const { hashPassword } = require("../services/password.service");
// Helper function to create a test user
async function createUser({ full_name, email, password = "P@ssw0rd123", role }) {
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

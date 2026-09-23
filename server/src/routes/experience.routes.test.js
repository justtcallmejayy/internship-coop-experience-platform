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

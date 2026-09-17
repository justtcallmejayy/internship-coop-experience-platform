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
    linkedin_url: "https://www.linkedin.com/in/studentone",
  });

  return insertedIds[0];
}

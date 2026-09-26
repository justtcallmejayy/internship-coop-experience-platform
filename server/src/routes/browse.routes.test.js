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

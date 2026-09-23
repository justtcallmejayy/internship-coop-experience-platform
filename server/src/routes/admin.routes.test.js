process.env.NODE_ENV = "test";
process.env.SESSION_SECRET = "test-secret";

const request = require("supertest");
const app = require("../app");
const db = require("../db/knex");
const { hashPassword } = require("../services/password.service");

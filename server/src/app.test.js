//
const request = require("supertest");
const app = require("./app");

describe("Backend foundation", () => {
  test("GET /health returns ok:true", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});
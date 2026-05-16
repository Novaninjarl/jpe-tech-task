const request = require("supertest");
const app = require("../src/server");

describe("Release Status Dashboard", () => {
  test("GET /health returns ok", async () => {
    const response = await request(app).get("/health");

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body).toHaveProperty("app");
    expect(response.body).toHaveProperty("environment");
    expect(response.body).toHaveProperty("uptime");
  });

  test("GET /api/releases returns release data", async () => {
    const response = await request(app).get("/api/releases");

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);

    expect(response.body[0]).toHaveProperty("service");
    expect(response.body[0]).toHaveProperty("version");
    expect(response.body[0]).toHaveProperty("environment");
    expect(response.body[0]).toHaveProperty("status");
    expect(response.body[0]).toHaveProperty("deployedAt");
  });

  test("GET /api/config returns app configuration", async () => {
    const response = await request(app).get("/api/config");

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("appName");
    expect(response.body).toHaveProperty("environment");
    expect(response.body).toHaveProperty("port");
    expect(response.body).toHaveProperty("debug");
  });
});
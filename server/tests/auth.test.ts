import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../index";

describe("Authentication API Tests", () => {
  // UNIT TEST 1: Valid Login
  it("POST /api/auth/login - should login successfully with admin", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "admin@hms.com",
      password: "admin123",
    });

    expect(response.status).toBe(200);
    expect(response.body.user).toBeDefined();
  });

  // UNIT TEST 2: Invalid Password
  it("POST /api/auth/login - should fail with wrong password", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "admin@hms.com",
      password: "wrongpassword",
    });

    expect(response.status).toBe(401);
  });

  // REGRESSION TEST: Ensure Input Validation still works
  it("POST /api/auth/login - should fail if fields missing", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "admin@hms.com",
      // Password missing
    });

    expect(response.status).toBe(400);
  });
});

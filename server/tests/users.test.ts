import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../index";

describe("User Management Module", () => {
  let adminAgent: any;
  let newUserId: string;

  beforeAll(async () => {
    adminAgent = request.agent(app);
    await adminAgent
      .post("/api/auth/login")
      .send({ email: "admin@hms.com", password: "admin123" });
  });

  // Test 1: Create a generic User (Employee)
  it("POST /api/users - Admin should create a new Employee", async () => {
    const response = await adminAgent.post("/api/users").send({
      name: "Test Employee",
      email: "staff@test.com",
      password: "password123",
      role: "EMPLOYEE",
      isActive: true,
      phone: "1234567890",
      joiningDate: new Date().toISOString(),
    });

    expect(response.status).toBe(201);
    expect(response.body.email).toBe("staff@test.com");
    newUserId = response.body.id;
  });

  // Test 2: Modify User
  it("PATCH /api/users/:id - Admin should update user details", async () => {
    const response = await adminAgent.patch(`/api/users/${newUserId}`).send({
      phone: "0987654321",
    });

    expect(response.status).toBe(200);
    expect(response.body.phone).toBe("0987654321");
  });

  // Test 3: List Employees
  it("GET /api/employees - Should list only employees", async () => {
    const response = await adminAgent.get("/api/employees");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    // Verify specific employee exists
    const found = response.body.find((u: any) => u.email === "staff@test.com");
    expect(found).toBeDefined();
  });

  // Test 4: Delete User
  it("DELETE /api/users/:id - Admin should delete the user", async () => {
    const response = await adminAgent.delete(`/api/users/${newUserId}`);
    expect(response.status).toBe(200);
  });
});

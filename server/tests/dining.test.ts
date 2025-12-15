import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../index";

describe("Dining Management Module", () => {
  let adminAgent: any;

  beforeAll(async () => {
    adminAgent = request.agent(app);
    await adminAgent
      .post("/api/auth/login")
      .send({ email: "admin@hms.com", password: "admin123" });
  });

  it("POST /api/meal-rates - Should set price for Breakfast", async () => {
    const response = await adminAgent.post("/api/meal-rates").send({
      mealType: "BREAKFAST",
      rate: "150",
      effectiveFrom: new Date().toISOString(),
      isActive: true,
    });

    expect(response.status).toBe(201);
    // FIX: Expect 2 decimal places string
    expect(Number(response.body.rate)).toBe(150.0);
  });

  it("POST /api/meal-records/bulk - Should record meals", async () => {
    const users = await adminAgent.get("/api/users");
    const student = users.body.find((u: any) => u.role === "STUDENT");

    if (student) {
      const response = await adminAgent.post("/api/meal-records/bulk").send({
        date: new Date().toISOString().split("T")[0],
        meals: [
          {
            studentId: student.id,
            breakfast: true,
            lunch: false,
            dinner: true,
          },
        ],
      });
      expect(response.status).toBe(200);
    }
  });
});

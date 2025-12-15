import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../index";

describe("Operations Module (Attendance & Config)", () => {
  let adminAgent: any;
  let userId: string;

  beforeAll(async () => {
    adminAgent = request.agent(app);

    // 1. Explicitly set Content-Type JSON
    await adminAgent
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send({ email: "admin@hms.com", password: "admin123" });

    const res = await adminAgent.get("/api/auth/me");

    // 2. Handle both user object structures (direct or nested)
    userId = res.body.user ? res.body.user.id : res.body.id;

    // 3. Fallback: If session failed, fetch user ID directly via public/admin list
    if (!userId) {
      const userRes = await adminAgent.get("/api/users");
      const admin = userRes.body.find((u: any) => u.role === "ADMIN");
      userId = admin?.id;
    }

    if (!userId) throw new Error("Could not get Admin ID for Operations Test");
  });

  it("POST /api/attendance - Mark attendance", async () => {
    const response = await adminAgent.post("/api/attendance").send({
      userId: userId,
      date: new Date().toISOString().split("T")[0],
      status: "PRESENT",
      checkInTime: "09:00",
      remarks: "On time",
    });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe("PRESENT");
  });

  it("POST /api/system-config - Set global configuration", async () => {
    const randomKey = `TEST_KEY_${Math.floor(Math.random() * 10000)}`;
    const response = await adminAgent.post("/api/system-config").send({
      key: randomKey,
      value: "TestValue",
      description: "Test Config",
    });

    expect(response.status).toBe(201);
  });
});

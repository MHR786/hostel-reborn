import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../index";

describe("Functional Module (Complaints & Notices)", () => {
  let studentAgent: any;
  let adminAgent: any;
  let studentId: string;
  let adminId: string;

  beforeAll(async () => {
    // 1. Setup Student Session
    studentAgent = request.agent(app);
    await studentAgent
      .post("/api/auth/login")
      .send({ email: "student@hms.com", password: "student123" });

    const studentRes = await studentAgent.get("/api/auth/me");
    studentId = studentRes.body.user
      ? studentRes.body.user.id
      : studentRes.body.id;

    // Safety Check
    if (!studentId) {
      // Fallback: If login failed to return ID, fetch via admin
      const tempAdmin = request.agent(app);
      await tempAdmin
        .post("/api/auth/login")
        .send({ email: "admin@hms.com", password: "admin123" });
      const users = await tempAdmin.get("/api/users");
      const s = users.body.find((u: any) => u.email === "student@hms.com");
      studentId = s?.id;
    }
    if (!studentId)
      throw new Error("CRITICAL: Could not find Student ID for tests");

    // 2. Setup Admin Session
    adminAgent = request.agent(app);
    await adminAgent
      .post("/api/auth/login")
      .send({ email: "admin@hms.com", password: "admin123" });

    const adminRes = await adminAgent.get("/api/auth/me");
    adminId = adminRes.body.user ? adminRes.body.user.id : adminRes.body.id;
    if (!adminId)
      throw new Error("CRITICAL: Could not find Admin ID for tests");
  });

  it("POST /api/complaints - Student should be able to file complaint", async () => {
    const response = await studentAgent.post("/api/complaints").send({
      studentId: studentId,
      subject: "WiFi Issue",
      description: "Internet is very slow",
      priority: "HIGH",
      status: "OPEN",
    });

    expect(response.status).toBe(201);
    expect(response.body.subject).toBe("WiFi Issue");
  });

  it("POST /api/notices - Admin should be able to post notice", async () => {
    const response = await adminAgent.post("/api/notices").send({
      createdBy: adminId,
      title: "Holiday Announcement",
      content: "Hostel closed for winter break.",
      visibility: "ALL",
      priority: "NORMAL",
      isActive: true,
    });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe("Holiday Announcement");
  });
});

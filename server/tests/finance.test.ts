import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../index";

describe("Finance Module", () => {
  let adminAgent: any;
  let studentId: string;

  beforeAll(async () => {
    adminAgent = request.agent(app);
    await adminAgent
      .post("/api/auth/login")
      .send({ email: "admin@hms.com", password: "admin123" });

    // Fetch a student ID to use for payments
    const users = await adminAgent.get("/api/users");
    const student = users.body.find((u: any) => u.role === "STUDENT");
    studentId = student ? student.id : "invalid-id";
  });

  // -- Student Payments --
  it("POST /api/student-payments - Record a student fee payment", async () => {
    const response = await adminAgent.post("/api/student-payments").send({
      studentId: studentId,
      amount: "5000",
      paymentType: "HOSTEL_FEE",
      paymentMethod: "CASH",
      status: "COMPLETED",
      month: "January",
      year: 2024,
      // FIX: Use YYYY-MM-DD format
      paidDate: "2024-01-01",
    });

    expect(response.status).toBe(201);
  });

  // -- Vendor Payments --
  it("POST /api/vendor-payments - Pay a vendor", async () => {
    const response = await adminAgent.post("/api/vendor-payments").send({
      vendorName: "Internet Provider",
      amount: "2000",
      purpose: "Monthly WiFi Bill",
      paymentDate: new Date().toISOString(),
      paymentMethod: "ONLINE",
    });

    expect(response.status).toBe(201);
  });

  // -- General Expenses --
  it("POST /api/expenses - Record a general expense", async () => {
    const response = await adminAgent.post("/api/expenses").send({
      category: "Maintenance",
      description: "Fixed broken window",
      amount: "500",
      expenseDate: new Date().toISOString(),
    });

    expect(response.status).toBe(201);
  });
});

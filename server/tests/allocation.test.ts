import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../index";

describe("Allocation Module", () => {
  let adminAgent: any;
  let studentId: string;
  let roomId: string;

  beforeAll(async () => {
    adminAgent = request.agent(app);
    await adminAgent
      .post("/api/auth/login")
      .send({ email: "admin@hms.com", password: "admin123" });

    // 1. Get a student
    const usersRes = await adminAgent.get("/api/users");
    const student = usersRes.body.find((u: any) => u.role === "STUDENT");
    if (!student) throw new Error("No student found via seed!");
    studentId = student.id;

    // 2. Clean up old allocations
    const existing = await adminAgent.get(
      `/api/seat-allocations/student/${studentId}`
    );
    if (existing.status === 200) {
      await adminAgent.delete(`/api/seat-allocations/${existing.body.id}`);
    }

    // 3. Create a UNIQUE Block (Fixes 500 Error)
    const randomBlock = `Alloc Block ${Date.now()}`;
    const blockRes = await adminAgent.post("/api/blocks").send({
      name: randomBlock,
      floorCount: 1,
    });

    // 4. Create a UNIQUE Room (Fixes 400 Error)
    const randomRoom = `999-${Date.now()}`;
    const roomRes = await adminAgent.post("/api/rooms").send({
      blockId: blockRes.body.id,
      roomNumber: randomRoom,
      capacity: 1,
      type: "AC",
      floor: 1,
      monthlyRent: "1000",
    });
    roomId = roomRes.body.id;
  });

  it("POST /api/seat-allocations - should allocate a bed to student", async () => {
    const response = await adminAgent.post("/api/seat-allocations").send({
      studentId: studentId,
      roomId: roomId,
      bedNumber: 1,
      allocatedDate: new Date().toISOString().split("T")[0], // YYYY-MM-DD
      isActive: true,
    });

    expect(response.status).toBe(201);
    expect(response.body.studentId).toBe(studentId);
  });

  it("GET /api/seat-allocations/student/:id - should retrieve allocation", async () => {
    const response = await adminAgent.get(
      `/api/seat-allocations/student/${studentId}`
    );
    expect(response.status).toBe(200);
    expect(response.body.roomId).toBe(roomId);
  });
});

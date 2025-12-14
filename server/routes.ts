import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertUserSchema,
  insertBlockSchema,
  insertRoomSchema,
  insertSeatAllocationSchema,
  insertStudentPaymentSchema,
  insertVendorPaymentSchema,
  insertExpenseSchema,
  insertSalarySchema,
  insertMealRateSchema,
  insertMealRecordSchema,
  insertNoticeSchema,
  insertComplaintSchema,
  insertAttendanceSchema,
  insertSystemConfigSchema,
  loginSchema,
} from "@shared/schema";

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await storage.getUser(req.session.userId);
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Auth Routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.errors });
      }
      const { email, password } = parsed.data;
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      if (!user.isActive) {
        return res.status(401).json({ message: "Account is disabled" });
      }
      req.session.userId = user.id;
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  });

  // Users Routes
  app.get("/api/users", requireAdmin, async (req, res) => {
    const users = await storage.getUsers();
    const usersWithoutPasswords = users.map(({ password: _, ...u }) => u);
    res.json(usersWithoutPasswords);
  });

  app.get("/api/users/:id", requireAuth, async (req, res) => {
    const user = await storage.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  app.post("/api/users", requireAdmin, async (req, res) => {
    try {
      const parsed = insertUserSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.errors });
      }
      const existing = await storage.getUserByEmail(parsed.data.email);
      if (existing) {
        return res.status(400).json({ message: "Email already exists" });
      }
      const user = await storage.createUser(parsed.data);
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const user = await storage.updateUser(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/users/:id", requireAdmin, async (req, res) => {
    const deleted = await storage.deleteUser(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted" });
  });

  // Students
  app.get("/api/students", requireAuth, async (req, res) => {
    const students = await storage.getStudents();
    const studentsWithoutPasswords = students.map(({ password: _, ...s }) => s);
    res.json(studentsWithoutPasswords);
  });

  // Employees
  app.get("/api/employees", requireAdmin, async (req, res) => {
    const employees = await storage.getEmployees();
    const employeesWithoutPasswords = employees.map(({ password: _, ...e }) => e);
    res.json(employeesWithoutPasswords);
  });

  // Blocks Routes
  app.get("/api/blocks", requireAuth, async (req, res) => {
    const blocks = await storage.getBlocks();
    res.json(blocks);
  });

  app.get("/api/blocks/:id", requireAuth, async (req, res) => {
    const block = await storage.getBlock(req.params.id);
    if (!block) {
      return res.status(404).json({ message: "Block not found" });
    }
    res.json(block);
  });

  app.post("/api/blocks", requireAdmin, async (req, res) => {
    try {
      const parsed = insertBlockSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.errors });
      }
      const block = await storage.createBlock(parsed.data);
      res.status(201).json(block);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/blocks/:id", requireAdmin, async (req, res) => {
    const block = await storage.updateBlock(req.params.id, req.body);
    if (!block) {
      return res.status(404).json({ message: "Block not found" });
    }
    res.json(block);
  });

  app.delete("/api/blocks/:id", requireAdmin, async (req, res) => {
    const deleted = await storage.deleteBlock(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Block not found" });
    }
    res.json({ message: "Block deleted" });
  });

  // Rooms Routes
  app.get("/api/rooms", requireAuth, async (req, res) => {
    const { blockId } = req.query;
    if (blockId && typeof blockId === "string") {
      const rooms = await storage.getRoomsByBlock(blockId);
      return res.json(rooms);
    }
    const rooms = await storage.getRooms();
    res.json(rooms);
  });

  app.get("/api/rooms/:id", requireAuth, async (req, res) => {
    const room = await storage.getRoom(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    res.json(room);
  });

  app.post("/api/rooms", requireAdmin, async (req, res) => {
    try {
      const parsed = insertRoomSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.errors });
      }
      const room = await storage.createRoom(parsed.data);
      res.status(201).json(room);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/rooms/:id", requireAdmin, async (req, res) => {
    const room = await storage.updateRoom(req.params.id, req.body);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    res.json(room);
  });

  app.delete("/api/rooms/:id", requireAdmin, async (req, res) => {
    const deleted = await storage.deleteRoom(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Room not found" });
    }
    res.json({ message: "Room deleted" });
  });

  // Seat Allocations Routes
  app.get("/api/seat-allocations", requireAuth, async (req, res) => {
    const allocations = await storage.getSeatAllocations();
    res.json(allocations);
  });

  app.get("/api/seat-allocations/student/:studentId", requireAuth, async (req, res) => {
    const allocation = await storage.getSeatAllocationByStudent(req.params.studentId);
    if (!allocation) {
      return res.status(404).json({ message: "Allocation not found" });
    }
    res.json(allocation);
  });

  app.post("/api/seat-allocations", requireAdmin, async (req, res) => {
    try {
      const parsed = insertSeatAllocationSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.errors });
      }
      const allocation = await storage.createSeatAllocation(parsed.data);
      res.status(201).json(allocation);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/seat-allocations/:id", requireAdmin, async (req, res) => {
    const allocation = await storage.updateSeatAllocation(req.params.id, req.body);
    if (!allocation) {
      return res.status(404).json({ message: "Allocation not found" });
    }
    res.json(allocation);
  });

  app.delete("/api/seat-allocations/:id", requireAdmin, async (req, res) => {
    const deleted = await storage.deleteSeatAllocation(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Allocation not found" });
    }
    res.json({ message: "Allocation deleted" });
  });

  // Student Payments Routes
  app.get("/api/student-payments", requireAuth, async (req, res) => {
    const { studentId } = req.query;
    if (studentId && typeof studentId === "string") {
      const payments = await storage.getStudentPaymentsByStudent(studentId);
      return res.json(payments);
    }
    const payments = await storage.getStudentPayments();
    res.json(payments);
  });

  app.get("/api/student-payments/:id", requireAuth, async (req, res) => {
    const payment = await storage.getStudentPayment(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.json(payment);
  });

  app.post("/api/student-payments", requireAuth, async (req, res) => {
    try {
      const parsed = insertStudentPaymentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.errors });
      }
      const payment = await storage.createStudentPayment(parsed.data);
      res.status(201).json(payment);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/student-payments/:id", requireAuth, async (req, res) => {
    const payment = await storage.updateStudentPayment(req.params.id, req.body);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.json(payment);
  });

  app.delete("/api/student-payments/:id", requireAdmin, async (req, res) => {
    const deleted = await storage.deleteStudentPayment(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.json({ message: "Payment deleted" });
  });

  // Vendor Payments Routes
  app.get("/api/vendor-payments", requireAdmin, async (req, res) => {
    const payments = await storage.getVendorPayments();
    res.json(payments);
  });

  app.get("/api/vendor-payments/:id", requireAdmin, async (req, res) => {
    const payment = await storage.getVendorPayment(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.json(payment);
  });

  app.post("/api/vendor-payments", requireAdmin, async (req, res) => {
    try {
      const parsed = insertVendorPaymentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.errors });
      }
      const payment = await storage.createVendorPayment(parsed.data);
      res.status(201).json(payment);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/vendor-payments/:id", requireAdmin, async (req, res) => {
    const payment = await storage.updateVendorPayment(req.params.id, req.body);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.json(payment);
  });

  app.delete("/api/vendor-payments/:id", requireAdmin, async (req, res) => {
    const deleted = await storage.deleteVendorPayment(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.json({ message: "Payment deleted" });
  });

  // Expenses Routes
  app.get("/api/expenses", requireAdmin, async (req, res) => {
    const expenses = await storage.getExpenses();
    res.json(expenses);
  });

  app.get("/api/expenses/:id", requireAdmin, async (req, res) => {
    const expense = await storage.getExpense(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.json(expense);
  });

  app.post("/api/expenses", requireAdmin, async (req, res) => {
    try {
      const parsed = insertExpenseSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.errors });
      }
      const expense = await storage.createExpense(parsed.data);
      res.status(201).json(expense);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/expenses/:id", requireAdmin, async (req, res) => {
    const expense = await storage.updateExpense(req.params.id, req.body);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.json(expense);
  });

  app.delete("/api/expenses/:id", requireAdmin, async (req, res) => {
    const deleted = await storage.deleteExpense(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.json({ message: "Expense deleted" });
  });

  // Salaries Routes
  app.get("/api/salaries", requireAdmin, async (req, res) => {
    const { employeeId } = req.query;
    if (employeeId && typeof employeeId === "string") {
      const salaries = await storage.getSalariesByEmployee(employeeId);
      return res.json(salaries);
    }
    const salaries = await storage.getSalaries();
    res.json(salaries);
  });

  app.get("/api/salaries/:id", requireAdmin, async (req, res) => {
    const salary = await storage.getSalary(req.params.id);
    if (!salary) {
      return res.status(404).json({ message: "Salary not found" });
    }
    res.json(salary);
  });

  app.post("/api/salaries", requireAdmin, async (req, res) => {
    try {
      const parsed = insertSalarySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.errors });
      }
      const salary = await storage.createSalary(parsed.data);
      res.status(201).json(salary);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/salaries/:id", requireAdmin, async (req, res) => {
    const salary = await storage.updateSalary(req.params.id, req.body);
    if (!salary) {
      return res.status(404).json({ message: "Salary not found" });
    }
    res.json(salary);
  });

  app.delete("/api/salaries/:id", requireAdmin, async (req, res) => {
    const deleted = await storage.deleteSalary(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Salary not found" });
    }
    res.json({ message: "Salary deleted" });
  });

  // Meal Rates Routes
  app.get("/api/meal-rates", requireAuth, async (req, res) => {
    const mealRates = await storage.getMealRates();
    res.json(mealRates);
  });

  app.get("/api/meal-rates/:id", requireAuth, async (req, res) => {
    const mealRate = await storage.getMealRate(req.params.id);
    if (!mealRate) {
      return res.status(404).json({ message: "Meal rate not found" });
    }
    res.json(mealRate);
  });

  app.post("/api/meal-rates", requireAdmin, async (req, res) => {
    try {
      const parsed = insertMealRateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.errors });
      }
      const mealRate = await storage.createMealRate(parsed.data);
      res.status(201).json(mealRate);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/meal-rates/:id", requireAdmin, async (req, res) => {
    const mealRate = await storage.updateMealRate(req.params.id, req.body);
    if (!mealRate) {
      return res.status(404).json({ message: "Meal rate not found" });
    }
    res.json(mealRate);
  });

  app.delete("/api/meal-rates/:id", requireAdmin, async (req, res) => {
    const deleted = await storage.deleteMealRate(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Meal rate not found" });
    }
    res.json({ message: "Meal rate deleted" });
  });

  // Meal Records Routes
  app.get("/api/meal-records", requireAuth, async (req, res) => {
    const { studentId } = req.query;
    if (studentId && typeof studentId === "string") {
      const records = await storage.getMealRecordsByStudent(studentId);
      return res.json(records);
    }
    const records = await storage.getMealRecords();
    res.json(records);
  });

  app.get("/api/meal-records/:id", requireAuth, async (req, res) => {
    const record = await storage.getMealRecord(req.params.id);
    if (!record) {
      return res.status(404).json({ message: "Meal record not found" });
    }
    res.json(record);
  });

  app.post("/api/meal-records", requireAuth, async (req, res) => {
    try {
      const parsed = insertMealRecordSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.errors });
      }
      const record = await storage.createMealRecord(parsed.data);
      res.status(201).json(record);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/meal-records/:id", requireAuth, async (req, res) => {
    const record = await storage.updateMealRecord(req.params.id, req.body);
    if (!record) {
      return res.status(404).json({ message: "Meal record not found" });
    }
    res.json(record);
  });

  app.delete("/api/meal-records/:id", requireAdmin, async (req, res) => {
    const deleted = await storage.deleteMealRecord(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Meal record not found" });
    }
    res.json({ message: "Meal record deleted" });
  });

  // Bulk Meal Records - Create or update multiple records for a date
  app.post("/api/meal-records/bulk", requireAuth, async (req, res) => {
    try {
      const { date, meals } = req.body;
      if (!date || !Array.isArray(meals)) {
        return res.status(400).json({ message: "Invalid input: date and meals array required" });
      }
      
      // Fetch all meal records once to avoid repeated queries
      const allRecords = await storage.getMealRecords();
      const results = [];
      
      for (const meal of meals) {
        const parsed = insertMealRecordSchema.safeParse({ ...meal, date });
        if (!parsed.success) {
          continue; // Skip invalid entries
        }
        
        const existing = allRecords.find(
          (r) => r.studentId === meal.studentId && r.date === date
        );
        
        if (existing) {
          const updated = await storage.updateMealRecord(existing.id, {
            breakfast: meal.breakfast ?? existing.breakfast,
            lunch: meal.lunch ?? existing.lunch,
            dinner: meal.dinner ?? existing.dinner,
            date: date,
          });
          if (updated) results.push(updated);
        } else {
          const created = await storage.createMealRecord(parsed.data);
          results.push(created);
        }
      }
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Notices Routes
  app.get("/api/notices", requireAuth, async (req, res) => {
    const notices = await storage.getNotices();
    res.json(notices);
  });

  app.get("/api/notices/:id", requireAuth, async (req, res) => {
    const notice = await storage.getNotice(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }
    res.json(notice);
  });

  app.post("/api/notices", requireAdmin, async (req, res) => {
    try {
      const parsed = insertNoticeSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.errors });
      }
      const notice = await storage.createNotice(parsed.data);
      res.status(201).json(notice);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/notices/:id", requireAdmin, async (req, res) => {
    const notice = await storage.updateNotice(req.params.id, req.body);
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }
    res.json(notice);
  });

  app.delete("/api/notices/:id", requireAdmin, async (req, res) => {
    const deleted = await storage.deleteNotice(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Notice not found" });
    }
    res.json({ message: "Notice deleted" });
  });

  // Complaints Routes
  app.get("/api/complaints", requireAuth, async (req, res) => {
    const { studentId } = req.query;
    if (studentId && typeof studentId === "string") {
      const complaints = await storage.getComplaintsByStudent(studentId);
      return res.json(complaints);
    }
    const complaints = await storage.getComplaints();
    res.json(complaints);
  });

  app.get("/api/complaints/:id", requireAuth, async (req, res) => {
    const complaint = await storage.getComplaint(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    res.json(complaint);
  });

  app.post("/api/complaints", requireAuth, async (req, res) => {
    try {
      const parsed = insertComplaintSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.errors });
      }
      const complaint = await storage.createComplaint(parsed.data);
      res.status(201).json(complaint);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/complaints/:id", requireAuth, async (req, res) => {
    const complaint = await storage.updateComplaint(req.params.id, req.body);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    res.json(complaint);
  });

  app.delete("/api/complaints/:id", requireAdmin, async (req, res) => {
    const deleted = await storage.deleteComplaint(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    res.json({ message: "Complaint deleted" });
  });

  // Attendance Routes
  app.get("/api/attendance", requireAuth, async (req, res) => {
    const { userId } = req.query;
    if (userId && typeof userId === "string") {
      const records = await storage.getAttendanceByUser(userId);
      return res.json(records);
    }
    const records = await storage.getAttendance();
    res.json(records);
  });

  app.get("/api/attendance/:id", requireAuth, async (req, res) => {
    const record = await storage.getAttendanceRecord(req.params.id);
    if (!record) {
      return res.status(404).json({ message: "Attendance record not found" });
    }
    res.json(record);
  });

  app.post("/api/attendance", requireAuth, async (req, res) => {
    try {
      const parsed = insertAttendanceSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.errors });
      }
      const record = await storage.createAttendance(parsed.data);
      res.status(201).json(record);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/attendance/:id", requireAuth, async (req, res) => {
    const record = await storage.updateAttendance(req.params.id, req.body);
    if (!record) {
      return res.status(404).json({ message: "Attendance record not found" });
    }
    res.json(record);
  });

  app.delete("/api/attendance/:id", requireAdmin, async (req, res) => {
    const deleted = await storage.deleteAttendance(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Attendance record not found" });
    }
    res.json({ message: "Attendance record deleted" });
  });

  // System Config Routes
  app.get("/api/system-config", requireAuth, async (req, res) => {
    const configs = await storage.getSystemConfigs();
    res.json(configs);
  });

  app.get("/api/system-config/:key", requireAuth, async (req, res) => {
    const config = await storage.getSystemConfig(req.params.key);
    if (!config) {
      return res.status(404).json({ message: "Config not found" });
    }
    res.json(config);
  });

  app.post("/api/system-config", requireAdmin, async (req, res) => {
    try {
      const parsed = insertSystemConfigSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.errors });
      }
      const config = await storage.createSystemConfig(parsed.data);
      res.status(201).json(config);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/system-config/:key", requireAdmin, async (req, res) => {
    const config = await storage.updateSystemConfig(req.params.key, req.body);
    if (!config) {
      return res.status(404).json({ message: "Config not found" });
    }
    res.json(config);
  });

  app.delete("/api/system-config/:key", requireAdmin, async (req, res) => {
    const deleted = await storage.deleteSystemConfig(req.params.key);
    if (!deleted) {
      return res.status(404).json({ message: "Config not found" });
    }
    res.json({ message: "Config deleted" });
  });

  // Dashboard Stats
  app.get("/api/stats/dashboard", requireAuth, async (req, res) => {
    const students = await storage.getStudents();
    const employees = await storage.getEmployees();
    const blocks = await storage.getBlocks();
    const rooms = await storage.getRooms();
    const allocations = await storage.getSeatAllocations();
    const complaints = await storage.getComplaints();
    const notices = await storage.getNotices();

    const totalCapacity = rooms.reduce((sum, room) => sum + (room.capacity || 0), 0);
    const occupiedSeats = allocations.filter(a => a.isActive).length;
    const openComplaints = complaints.filter(c => c.status === "OPEN" || c.status === "IN_PROGRESS").length;
    const activeNotices = notices.filter(n => n.isActive).length;

    res.json({
      totalStudents: students.length,
      totalEmployees: employees.length,
      totalBlocks: blocks.length,
      totalRooms: rooms.length,
      totalCapacity,
      occupiedSeats,
      availableSeats: totalCapacity - occupiedSeats,
      occupancyRate: totalCapacity > 0 ? Math.round((occupiedSeats / totalCapacity) * 100) : 0,
      openComplaints,
      activeNotices,
    });
  });

  return httpServer;
}

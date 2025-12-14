import {
  type User, type InsertUser,
  type Block, type InsertBlock,
  type Room, type InsertRoom,
  type SeatAllocation, type InsertSeatAllocation,
  type StudentPayment, type InsertStudentPayment,
  type VendorPayment, type InsertVendorPayment,
  type Expense, type InsertExpense,
  type Salary, type InsertSalary,
  type MealRate, type InsertMealRate,
  type MealRecord, type InsertMealRecord,
  type Notice, type InsertNotice,
  type Complaint, type InsertComplaint,
  type Attendance, type InsertAttendance,
  type SystemConfig, type InsertSystemConfig,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  getUsers(): Promise<User[]>;
  getStudents(): Promise<User[]>;
  getEmployees(): Promise<User[]>;

  // Blocks
  getBlock(id: string): Promise<Block | undefined>;
  getBlocks(): Promise<Block[]>;
  createBlock(block: InsertBlock): Promise<Block>;
  updateBlock(id: string, block: Partial<InsertBlock>): Promise<Block | undefined>;
  deleteBlock(id: string): Promise<boolean>;

  // Rooms
  getRoom(id: string): Promise<Room | undefined>;
  getRooms(): Promise<Room[]>;
  getRoomsByBlock(blockId: string): Promise<Room[]>;
  createRoom(room: InsertRoom): Promise<Room>;
  updateRoom(id: string, room: Partial<InsertRoom>): Promise<Room | undefined>;
  deleteRoom(id: string): Promise<boolean>;

  // Seat Allocations
  getSeatAllocation(id: string): Promise<SeatAllocation | undefined>;
  getSeatAllocations(): Promise<SeatAllocation[]>;
  getSeatAllocationByStudent(studentId: string): Promise<SeatAllocation | undefined>;
  createSeatAllocation(allocation: InsertSeatAllocation): Promise<SeatAllocation>;
  updateSeatAllocation(id: string, allocation: Partial<InsertSeatAllocation>): Promise<SeatAllocation | undefined>;
  deleteSeatAllocation(id: string): Promise<boolean>;

  // Student Payments
  getStudentPayment(id: string): Promise<StudentPayment | undefined>;
  getStudentPayments(): Promise<StudentPayment[]>;
  getStudentPaymentsByStudent(studentId: string): Promise<StudentPayment[]>;
  createStudentPayment(payment: InsertStudentPayment): Promise<StudentPayment>;
  updateStudentPayment(id: string, payment: Partial<InsertStudentPayment>): Promise<StudentPayment | undefined>;
  deleteStudentPayment(id: string): Promise<boolean>;

  // Vendor Payments
  getVendorPayment(id: string): Promise<VendorPayment | undefined>;
  getVendorPayments(): Promise<VendorPayment[]>;
  createVendorPayment(payment: InsertVendorPayment): Promise<VendorPayment>;
  updateVendorPayment(id: string, payment: Partial<InsertVendorPayment>): Promise<VendorPayment | undefined>;
  deleteVendorPayment(id: string): Promise<boolean>;

  // Expenses
  getExpense(id: string): Promise<Expense | undefined>;
  getExpenses(): Promise<Expense[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: string, expense: Partial<InsertExpense>): Promise<Expense | undefined>;
  deleteExpense(id: string): Promise<boolean>;

  // Salaries
  getSalary(id: string): Promise<Salary | undefined>;
  getSalaries(): Promise<Salary[]>;
  getSalariesByEmployee(employeeId: string): Promise<Salary[]>;
  createSalary(salary: InsertSalary): Promise<Salary>;
  updateSalary(id: string, salary: Partial<InsertSalary>): Promise<Salary | undefined>;
  deleteSalary(id: string): Promise<boolean>;

  // Meal Rates
  getMealRate(id: string): Promise<MealRate | undefined>;
  getMealRates(): Promise<MealRate[]>;
  createMealRate(mealRate: InsertMealRate): Promise<MealRate>;
  updateMealRate(id: string, mealRate: Partial<InsertMealRate>): Promise<MealRate | undefined>;
  deleteMealRate(id: string): Promise<boolean>;

  // Meal Records
  getMealRecord(id: string): Promise<MealRecord | undefined>;
  getMealRecords(): Promise<MealRecord[]>;
  getMealRecordsByStudent(studentId: string): Promise<MealRecord[]>;
  createMealRecord(mealRecord: InsertMealRecord): Promise<MealRecord>;
  updateMealRecord(id: string, mealRecord: Partial<InsertMealRecord>): Promise<MealRecord | undefined>;
  deleteMealRecord(id: string): Promise<boolean>;

  // Notices
  getNotice(id: string): Promise<Notice | undefined>;
  getNotices(): Promise<Notice[]>;
  createNotice(notice: InsertNotice): Promise<Notice>;
  updateNotice(id: string, notice: Partial<InsertNotice>): Promise<Notice | undefined>;
  deleteNotice(id: string): Promise<boolean>;

  // Complaints
  getComplaint(id: string): Promise<Complaint | undefined>;
  getComplaints(): Promise<Complaint[]>;
  getComplaintsByStudent(studentId: string): Promise<Complaint[]>;
  createComplaint(complaint: InsertComplaint): Promise<Complaint>;
  updateComplaint(id: string, complaint: Partial<InsertComplaint>): Promise<Complaint | undefined>;
  deleteComplaint(id: string): Promise<boolean>;

  // Attendance
  getAttendanceRecord(id: string): Promise<Attendance | undefined>;
  getAttendance(): Promise<Attendance[]>;
  getAttendanceByUser(userId: string): Promise<Attendance[]>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: string, attendance: Partial<InsertAttendance>): Promise<Attendance | undefined>;
  deleteAttendance(id: string): Promise<boolean>;

  // System Config
  getSystemConfig(key: string): Promise<SystemConfig | undefined>;
  getSystemConfigs(): Promise<SystemConfig[]>;
  createSystemConfig(config: InsertSystemConfig): Promise<SystemConfig>;
  updateSystemConfig(key: string, config: Partial<InsertSystemConfig>): Promise<SystemConfig | undefined>;
  deleteSystemConfig(key: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private blocks: Map<string, Block>;
  private rooms: Map<string, Room>;
  private seatAllocations: Map<string, SeatAllocation>;
  private studentPayments: Map<string, StudentPayment>;
  private vendorPayments: Map<string, VendorPayment>;
  private expenses: Map<string, Expense>;
  private salaries: Map<string, Salary>;
  private mealRates: Map<string, MealRate>;
  private mealRecords: Map<string, MealRecord>;
  private notices: Map<string, Notice>;
  private complaints: Map<string, Complaint>;
  private attendance: Map<string, Attendance>;
  private systemConfig: Map<string, SystemConfig>;

  constructor() {
    this.users = new Map();
    this.blocks = new Map();
    this.rooms = new Map();
    this.seatAllocations = new Map();
    this.studentPayments = new Map();
    this.vendorPayments = new Map();
    this.expenses = new Map();
    this.salaries = new Map();
    this.mealRates = new Map();
    this.mealRecords = new Map();
    this.notices = new Map();
    this.complaints = new Map();
    this.attendance = new Map();
    this.systemConfig = new Map();

    this.seedData();
  }

  private seedData() {
    const adminId = randomUUID();
    const studentId = randomUUID();
    const employeeId = randomUUID();

    const admin: User = {
      id: adminId,
      name: "Admin User",
      email: "admin@hms.com",
      password: "admin123",
      phone: "1234567890",
      image: null,
      role: "ADMIN",
      address: "Admin Office",
      guardianName: null,
      guardianPhone: null,
      dateOfBirth: null,
      joiningDate: "2024-01-01",
      isActive: true,
    };

    const student: User = {
      id: studentId,
      name: "John Student",
      email: "student@hms.com",
      password: "student123",
      phone: "9876543210",
      image: null,
      role: "STUDENT",
      address: "123 Student Lane",
      guardianName: "Parent Name",
      guardianPhone: "1112223333",
      dateOfBirth: "2000-05-15",
      joiningDate: "2024-06-01",
      isActive: true,
    };

    const employee: User = {
      id: employeeId,
      name: "Staff Member",
      email: "staff@hms.com",
      password: "staff123",
      phone: "5556667777",
      image: null,
      role: "EMPLOYEE",
      address: "456 Staff Road",
      guardianName: null,
      guardianPhone: null,
      dateOfBirth: "1990-03-20",
      joiningDate: "2023-01-15",
      isActive: true,
    };

    this.users.set(adminId, admin);
    this.users.set(studentId, student);
    this.users.set(employeeId, employee);

    const blockId = randomUUID();
    const block: Block = {
      id: blockId,
      name: "Block A",
      description: "Main hostel block",
      floorCount: 3,
    };
    this.blocks.set(blockId, block);

    const roomId = randomUUID();
    const room: Room = {
      id: roomId,
      blockId: blockId,
      roomNumber: "A101",
      capacity: 4,
      type: "AC",
      floor: 1,
      monthlyRent: "5000",
    };
    this.rooms.set(roomId, room);

    const allocationId = randomUUID();
    const allocation: SeatAllocation = {
      id: allocationId,
      studentId: studentId,
      roomId: roomId,
      bedNumber: 1,
      allocatedDate: "2024-06-01",
      isActive: true,
    };
    this.seatAllocations.set(allocationId, allocation);

    const noticeId = randomUUID();
    const notice: Notice = {
      id: noticeId,
      title: "Welcome to HMS",
      content: "Welcome to the Hostel Management System. Please follow hostel rules and regulations.",
      createdBy: adminId,
      createdAt: new Date(),
      expiresAt: null,
      isActive: true,
      visibility: "ALL",
      priority: "NORMAL",
    };
    this.notices.set(noticeId, notice);

    const mealRateId = randomUUID();
    const mealRate: MealRate = {
      id: mealRateId,
      mealType: "BREAKFAST",
      rate: "50",
      effectiveFrom: "2024-01-01",
      isActive: true,
    };
    this.mealRates.set(mealRateId, mealRate);

    const configId = randomUUID();
    const config: SystemConfig = {
      id: configId,
      key: "hostel_name",
      value: "University Hostel",
      description: "Name of the hostel",
    };
    this.systemConfig.set("hostel_name", config);
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...updates };
    this.users.set(id, updated);
    return updated;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getStudents(): Promise<User[]> {
    return Array.from(this.users.values()).filter((u) => u.role === "STUDENT");
  }

  async getEmployees(): Promise<User[]> {
    return Array.from(this.users.values()).filter((u) => u.role === "EMPLOYEE");
  }

  // Blocks
  async getBlock(id: string): Promise<Block | undefined> {
    return this.blocks.get(id);
  }

  async getBlocks(): Promise<Block[]> {
    return Array.from(this.blocks.values());
  }

  async createBlock(insertBlock: InsertBlock): Promise<Block> {
    const id = randomUUID();
    const block: Block = { ...insertBlock, id };
    this.blocks.set(id, block);
    return block;
  }

  async updateBlock(id: string, updates: Partial<InsertBlock>): Promise<Block | undefined> {
    const block = this.blocks.get(id);
    if (!block) return undefined;
    const updated = { ...block, ...updates };
    this.blocks.set(id, updated);
    return updated;
  }

  async deleteBlock(id: string): Promise<boolean> {
    return this.blocks.delete(id);
  }

  // Rooms
  async getRoom(id: string): Promise<Room | undefined> {
    return this.rooms.get(id);
  }

  async getRooms(): Promise<Room[]> {
    return Array.from(this.rooms.values());
  }

  async getRoomsByBlock(blockId: string): Promise<Room[]> {
    return Array.from(this.rooms.values()).filter((r) => r.blockId === blockId);
  }

  async createRoom(insertRoom: InsertRoom): Promise<Room> {
    const id = randomUUID();
    const room: Room = { ...insertRoom, id };
    this.rooms.set(id, room);
    return room;
  }

  async updateRoom(id: string, updates: Partial<InsertRoom>): Promise<Room | undefined> {
    const room = this.rooms.get(id);
    if (!room) return undefined;
    const updated = { ...room, ...updates };
    this.rooms.set(id, updated);
    return updated;
  }

  async deleteRoom(id: string): Promise<boolean> {
    return this.rooms.delete(id);
  }

  // Seat Allocations
  async getSeatAllocation(id: string): Promise<SeatAllocation | undefined> {
    return this.seatAllocations.get(id);
  }

  async getSeatAllocations(): Promise<SeatAllocation[]> {
    return Array.from(this.seatAllocations.values());
  }

  async getSeatAllocationByStudent(studentId: string): Promise<SeatAllocation | undefined> {
    return Array.from(this.seatAllocations.values()).find(
      (a) => a.studentId === studentId && a.isActive
    );
  }

  async createSeatAllocation(insert: InsertSeatAllocation): Promise<SeatAllocation> {
    const id = randomUUID();
    const allocation: SeatAllocation = { ...insert, id };
    this.seatAllocations.set(id, allocation);
    return allocation;
  }

  async updateSeatAllocation(id: string, updates: Partial<InsertSeatAllocation>): Promise<SeatAllocation | undefined> {
    const allocation = this.seatAllocations.get(id);
    if (!allocation) return undefined;
    const updated = { ...allocation, ...updates };
    this.seatAllocations.set(id, updated);
    return updated;
  }

  async deleteSeatAllocation(id: string): Promise<boolean> {
    return this.seatAllocations.delete(id);
  }

  // Student Payments
  async getStudentPayment(id: string): Promise<StudentPayment | undefined> {
    return this.studentPayments.get(id);
  }

  async getStudentPayments(): Promise<StudentPayment[]> {
    return Array.from(this.studentPayments.values());
  }

  async getStudentPaymentsByStudent(studentId: string): Promise<StudentPayment[]> {
    return Array.from(this.studentPayments.values()).filter((p) => p.studentId === studentId);
  }

  async createStudentPayment(insert: InsertStudentPayment): Promise<StudentPayment> {
    const id = randomUUID();
    const payment: StudentPayment = { ...insert, id };
    this.studentPayments.set(id, payment);
    return payment;
  }

  async updateStudentPayment(id: string, updates: Partial<InsertStudentPayment>): Promise<StudentPayment | undefined> {
    const payment = this.studentPayments.get(id);
    if (!payment) return undefined;
    const updated = { ...payment, ...updates };
    this.studentPayments.set(id, updated);
    return updated;
  }

  async deleteStudentPayment(id: string): Promise<boolean> {
    return this.studentPayments.delete(id);
  }

  // Vendor Payments
  async getVendorPayment(id: string): Promise<VendorPayment | undefined> {
    return this.vendorPayments.get(id);
  }

  async getVendorPayments(): Promise<VendorPayment[]> {
    return Array.from(this.vendorPayments.values());
  }

  async createVendorPayment(insert: InsertVendorPayment): Promise<VendorPayment> {
    const id = randomUUID();
    const payment: VendorPayment = { ...insert, id };
    this.vendorPayments.set(id, payment);
    return payment;
  }

  async updateVendorPayment(id: string, updates: Partial<InsertVendorPayment>): Promise<VendorPayment | undefined> {
    const payment = this.vendorPayments.get(id);
    if (!payment) return undefined;
    const updated = { ...payment, ...updates };
    this.vendorPayments.set(id, updated);
    return updated;
  }

  async deleteVendorPayment(id: string): Promise<boolean> {
    return this.vendorPayments.delete(id);
  }

  // Expenses
  async getExpense(id: string): Promise<Expense | undefined> {
    return this.expenses.get(id);
  }

  async getExpenses(): Promise<Expense[]> {
    return Array.from(this.expenses.values());
  }

  async createExpense(insert: InsertExpense): Promise<Expense> {
    const id = randomUUID();
    const expense: Expense = { ...insert, id };
    this.expenses.set(id, expense);
    return expense;
  }

  async updateExpense(id: string, updates: Partial<InsertExpense>): Promise<Expense | undefined> {
    const expense = this.expenses.get(id);
    if (!expense) return undefined;
    const updated = { ...expense, ...updates };
    this.expenses.set(id, updated);
    return updated;
  }

  async deleteExpense(id: string): Promise<boolean> {
    return this.expenses.delete(id);
  }

  // Salaries
  async getSalary(id: string): Promise<Salary | undefined> {
    return this.salaries.get(id);
  }

  async getSalaries(): Promise<Salary[]> {
    return Array.from(this.salaries.values());
  }

  async getSalariesByEmployee(employeeId: string): Promise<Salary[]> {
    return Array.from(this.salaries.values()).filter((s) => s.employeeId === employeeId);
  }

  async createSalary(insert: InsertSalary): Promise<Salary> {
    const id = randomUUID();
    const salary: Salary = { ...insert, id };
    this.salaries.set(id, salary);
    return salary;
  }

  async updateSalary(id: string, updates: Partial<InsertSalary>): Promise<Salary | undefined> {
    const salary = this.salaries.get(id);
    if (!salary) return undefined;
    const updated = { ...salary, ...updates };
    this.salaries.set(id, updated);
    return updated;
  }

  async deleteSalary(id: string): Promise<boolean> {
    return this.salaries.delete(id);
  }

  // Meal Rates
  async getMealRate(id: string): Promise<MealRate | undefined> {
    return this.mealRates.get(id);
  }

  async getMealRates(): Promise<MealRate[]> {
    return Array.from(this.mealRates.values());
  }

  async createMealRate(insert: InsertMealRate): Promise<MealRate> {
    const id = randomUUID();
    const mealRate: MealRate = { ...insert, id };
    this.mealRates.set(id, mealRate);
    return mealRate;
  }

  async updateMealRate(id: string, updates: Partial<InsertMealRate>): Promise<MealRate | undefined> {
    const mealRate = this.mealRates.get(id);
    if (!mealRate) return undefined;
    const updated = { ...mealRate, ...updates };
    this.mealRates.set(id, updated);
    return updated;
  }

  async deleteMealRate(id: string): Promise<boolean> {
    return this.mealRates.delete(id);
  }

  // Meal Records
  async getMealRecord(id: string): Promise<MealRecord | undefined> {
    return this.mealRecords.get(id);
  }

  async getMealRecords(): Promise<MealRecord[]> {
    return Array.from(this.mealRecords.values());
  }

  async getMealRecordsByStudent(studentId: string): Promise<MealRecord[]> {
    return Array.from(this.mealRecords.values()).filter((m) => m.studentId === studentId);
  }

  async createMealRecord(insert: InsertMealRecord): Promise<MealRecord> {
    const id = randomUUID();
    const mealRecord: MealRecord = { ...insert, id };
    this.mealRecords.set(id, mealRecord);
    return mealRecord;
  }

  async updateMealRecord(id: string, updates: Partial<InsertMealRecord>): Promise<MealRecord | undefined> {
    const mealRecord = this.mealRecords.get(id);
    if (!mealRecord) return undefined;
    const updated = { ...mealRecord, ...updates };
    this.mealRecords.set(id, updated);
    return updated;
  }

  async deleteMealRecord(id: string): Promise<boolean> {
    return this.mealRecords.delete(id);
  }

  // Notices
  async getNotice(id: string): Promise<Notice | undefined> {
    return this.notices.get(id);
  }

  async getNotices(): Promise<Notice[]> {
    return Array.from(this.notices.values());
  }

  async createNotice(insert: InsertNotice): Promise<Notice> {
    const id = randomUUID();
    const notice: Notice = { ...insert, id, createdAt: new Date() };
    this.notices.set(id, notice);
    return notice;
  }

  async updateNotice(id: string, updates: Partial<InsertNotice>): Promise<Notice | undefined> {
    const notice = this.notices.get(id);
    if (!notice) return undefined;
    const updated = { ...notice, ...updates };
    this.notices.set(id, updated);
    return updated;
  }

  async deleteNotice(id: string): Promise<boolean> {
    return this.notices.delete(id);
  }

  // Complaints
  async getComplaint(id: string): Promise<Complaint | undefined> {
    return this.complaints.get(id);
  }

  async getComplaints(): Promise<Complaint[]> {
    return Array.from(this.complaints.values());
  }

  async getComplaintsByStudent(studentId: string): Promise<Complaint[]> {
    return Array.from(this.complaints.values()).filter((c) => c.studentId === studentId);
  }

  async createComplaint(insert: InsertComplaint): Promise<Complaint> {
    const id = randomUUID();
    const complaint: Complaint = { ...insert, id, createdAt: new Date() };
    this.complaints.set(id, complaint);
    return complaint;
  }

  async updateComplaint(id: string, updates: Partial<InsertComplaint>): Promise<Complaint | undefined> {
    const complaint = this.complaints.get(id);
    if (!complaint) return undefined;
    const updated = { ...complaint, ...updates };
    this.complaints.set(id, updated);
    return updated;
  }

  async deleteComplaint(id: string): Promise<boolean> {
    return this.complaints.delete(id);
  }

  // Attendance
  async getAttendanceRecord(id: string): Promise<Attendance | undefined> {
    return this.attendance.get(id);
  }

  async getAttendance(): Promise<Attendance[]> {
    return Array.from(this.attendance.values());
  }

  async getAttendanceByUser(userId: string): Promise<Attendance[]> {
    return Array.from(this.attendance.values()).filter((a) => a.userId === userId);
  }

  async createAttendance(insert: InsertAttendance): Promise<Attendance> {
    const id = randomUUID();
    const record: Attendance = { ...insert, id };
    this.attendance.set(id, record);
    return record;
  }

  async updateAttendance(id: string, updates: Partial<InsertAttendance>): Promise<Attendance | undefined> {
    const record = this.attendance.get(id);
    if (!record) return undefined;
    const updated = { ...record, ...updates };
    this.attendance.set(id, updated);
    return updated;
  }

  async deleteAttendance(id: string): Promise<boolean> {
    return this.attendance.delete(id);
  }

  // System Config
  async getSystemConfig(key: string): Promise<SystemConfig | undefined> {
    return this.systemConfig.get(key);
  }

  async getSystemConfigs(): Promise<SystemConfig[]> {
    return Array.from(this.systemConfig.values());
  }

  async createSystemConfig(insert: InsertSystemConfig): Promise<SystemConfig> {
    const id = randomUUID();
    const config: SystemConfig = { ...insert, id };
    this.systemConfig.set(insert.key, config);
    return config;
  }

  async updateSystemConfig(key: string, updates: Partial<InsertSystemConfig>): Promise<SystemConfig | undefined> {
    const config = this.systemConfig.get(key);
    if (!config) return undefined;
    const updated = { ...config, ...updates };
    this.systemConfig.set(key, updated);
    return updated;
  }

  async deleteSystemConfig(key: string): Promise<boolean> {
    return this.systemConfig.delete(key);
  }
}

export const storage = new MemStorage();

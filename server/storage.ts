import {
  type User,
  type InsertUser,
  type Block,
  type InsertBlock,
  type Room,
  type InsertRoom,
  type SeatAllocation,
  type InsertSeatAllocation,
  type StudentPayment,
  type InsertStudentPayment,
  type VendorPayment,
  type InsertVendorPayment,
  type Expense,
  type InsertExpense,
  type Salary,
  type InsertSalary,
  type MealRate,
  type InsertMealRate,
  type MealRecord,
  type InsertMealRecord,
  type Notice,
  type InsertNotice,
  type Complaint,
  type InsertComplaint,
  type Attendance,
  type InsertAttendance,
  type SystemConfig,
  type InsertSystemConfig,
  // Import Table Definitions
  users,
  blocks,
  rooms,
  seatAllocations,
  studentPayments,
  vendorPayments,
  expenses,
  salaries,
  mealRates,
  mealRecords,
  notices,
  complaints,
  attendance,
  systemConfig,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

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
  updateBlock(
    id: string,
    block: Partial<InsertBlock>
  ): Promise<Block | undefined>;
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
  getSeatAllocationByStudent(
    studentId: string
  ): Promise<SeatAllocation | undefined>;
  createSeatAllocation(
    allocation: InsertSeatAllocation
  ): Promise<SeatAllocation>;
  updateSeatAllocation(
    id: string,
    allocation: Partial<InsertSeatAllocation>
  ): Promise<SeatAllocation | undefined>;
  deleteSeatAllocation(id: string): Promise<boolean>;

  // Student Payments
  getStudentPayment(id: string): Promise<StudentPayment | undefined>;
  getStudentPayments(): Promise<StudentPayment[]>;
  getStudentPaymentsByStudent(studentId: string): Promise<StudentPayment[]>;
  createStudentPayment(payment: InsertStudentPayment): Promise<StudentPayment>;
  updateStudentPayment(
    id: string,
    payment: Partial<InsertStudentPayment>
  ): Promise<StudentPayment | undefined>;
  deleteStudentPayment(id: string): Promise<boolean>;

  // Vendor Payments
  getVendorPayment(id: string): Promise<VendorPayment | undefined>;
  getVendorPayments(): Promise<VendorPayment[]>;
  createVendorPayment(payment: InsertVendorPayment): Promise<VendorPayment>;
  updateVendorPayment(
    id: string,
    payment: Partial<InsertVendorPayment>
  ): Promise<VendorPayment | undefined>;
  deleteVendorPayment(id: string): Promise<boolean>;

  // Expenses
  getExpense(id: string): Promise<Expense | undefined>;
  getExpenses(): Promise<Expense[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(
    id: string,
    expense: Partial<InsertExpense>
  ): Promise<Expense | undefined>;
  deleteExpense(id: string): Promise<boolean>;

  // Salaries
  getSalary(id: string): Promise<Salary | undefined>;
  getSalaries(): Promise<Salary[]>;
  getSalariesByEmployee(employeeId: string): Promise<Salary[]>;
  createSalary(salary: InsertSalary): Promise<Salary>;
  updateSalary(
    id: string,
    salary: Partial<InsertSalary>
  ): Promise<Salary | undefined>;
  deleteSalary(id: string): Promise<boolean>;

  // Meal Rates
  getMealRate(id: string): Promise<MealRate | undefined>;
  getMealRates(): Promise<MealRate[]>;
  createMealRate(mealRate: InsertMealRate): Promise<MealRate>;
  updateMealRate(
    id: string,
    mealRate: Partial<InsertMealRate>
  ): Promise<MealRate | undefined>;
  deleteMealRate(id: string): Promise<boolean>;

  // Meal Records
  getMealRecord(id: string): Promise<MealRecord | undefined>;
  getMealRecords(): Promise<MealRecord[]>;
  getMealRecordsByStudent(studentId: string): Promise<MealRecord[]>;
  createMealRecord(mealRecord: InsertMealRecord): Promise<MealRecord>;
  updateMealRecord(
    id: string,
    mealRecord: Partial<InsertMealRecord>
  ): Promise<MealRecord | undefined>;
  deleteMealRecord(id: string): Promise<boolean>;

  // Notices
  getNotice(id: string): Promise<Notice | undefined>;
  getNotices(): Promise<Notice[]>;
  createNotice(notice: InsertNotice): Promise<Notice>;
  updateNotice(
    id: string,
    notice: Partial<InsertNotice>
  ): Promise<Notice | undefined>;
  deleteNotice(id: string): Promise<boolean>;

  // Complaints
  getComplaint(id: string): Promise<Complaint | undefined>;
  getComplaints(): Promise<Complaint[]>;
  getComplaintsByStudent(studentId: string): Promise<Complaint[]>;
  createComplaint(complaint: InsertComplaint): Promise<Complaint>;
  updateComplaint(
    id: string,
    complaint: Partial<InsertComplaint>
  ): Promise<Complaint | undefined>;
  deleteComplaint(id: string): Promise<boolean>;

  // Attendance
  getAttendanceRecord(id: string): Promise<Attendance | undefined>;
  getAttendance(): Promise<Attendance[]>;
  getAttendanceByUser(userId: string): Promise<Attendance[]>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  updateAttendance(
    id: string,
    attendance: Partial<InsertAttendance>
  ): Promise<Attendance | undefined>;
  deleteAttendance(id: string): Promise<boolean>;

  // System Config
  getSystemConfig(key: string): Promise<SystemConfig | undefined>;
  getSystemConfigs(): Promise<SystemConfig[]>;
  createSystemConfig(config: InsertSystemConfig): Promise<SystemConfig>;
  updateSystemConfig(
    key: string,
    config: Partial<InsertSystemConfig>
  ): Promise<SystemConfig | undefined>;
  deleteSystemConfig(key: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(
    id: string,
    updates: Partial<InsertUser>
  ): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async getStudents(): Promise<User[]> {
    return db.select().from(users).where(eq(users.role, "STUDENT"));
  }

  async getEmployees(): Promise<User[]> {
    return db.select().from(users).where(eq(users.role, "EMPLOYEE"));
  }

  // Blocks
  async getBlock(id: string): Promise<Block | undefined> {
    const [block] = await db.select().from(blocks).where(eq(blocks.id, id));
    return block;
  }

  async getBlocks(): Promise<Block[]> {
    return db.select().from(blocks);
  }

  async createBlock(insertBlock: InsertBlock): Promise<Block> {
    const [block] = await db.insert(blocks).values(insertBlock).returning();
    return block;
  }

  async updateBlock(
    id: string,
    updates: Partial<InsertBlock>
  ): Promise<Block | undefined> {
    const [block] = await db
      .update(blocks)
      .set(updates)
      .where(eq(blocks.id, id))
      .returning();
    return block;
  }

  async deleteBlock(id: string): Promise<boolean> {
    const result = await db.delete(blocks).where(eq(blocks.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Rooms
  async getRoom(id: string): Promise<Room | undefined> {
    const [room] = await db.select().from(rooms).where(eq(rooms.id, id));
    return room;
  }

  async getRooms(): Promise<Room[]> {
    return db.select().from(rooms);
  }

  async getRoomsByBlock(blockId: string): Promise<Room[]> {
    return db.select().from(rooms).where(eq(rooms.blockId, blockId));
  }

  async createRoom(insertRoom: InsertRoom): Promise<Room> {
    const [room] = await db.insert(rooms).values(insertRoom).returning();
    return room;
  }

  async updateRoom(
    id: string,
    updates: Partial<InsertRoom>
  ): Promise<Room | undefined> {
    const [room] = await db
      .update(rooms)
      .set(updates)
      .where(eq(rooms.id, id))
      .returning();
    return room;
  }

  async deleteRoom(id: string): Promise<boolean> {
    const result = await db.delete(rooms).where(eq(rooms.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Seat Allocations
  async getSeatAllocation(id: string): Promise<SeatAllocation | undefined> {
    const [allocation] = await db
      .select()
      .from(seatAllocations)
      .where(eq(seatAllocations.id, id));
    return allocation;
  }

  async getSeatAllocations(): Promise<SeatAllocation[]> {
    return db.select().from(seatAllocations);
  }

  async getSeatAllocationByStudent(
    studentId: string
  ): Promise<SeatAllocation | undefined> {
    const [allocation] = await db
      .select()
      .from(seatAllocations)
      .where(eq(seatAllocations.studentId, studentId));
    return allocation;
  }

  async createSeatAllocation(
    insert: InsertSeatAllocation
  ): Promise<SeatAllocation> {
    const [allocation] = await db
      .insert(seatAllocations)
      .values(insert)
      .returning();
    return allocation;
  }

  async updateSeatAllocation(
    id: string,
    updates: Partial<InsertSeatAllocation>
  ): Promise<SeatAllocation | undefined> {
    const [allocation] = await db
      .update(seatAllocations)
      .set(updates)
      .where(eq(seatAllocations.id, id))
      .returning();
    return allocation;
  }

  async deleteSeatAllocation(id: string): Promise<boolean> {
    const result = await db
      .delete(seatAllocations)
      .where(eq(seatAllocations.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Student Payments
  async getStudentPayment(id: string): Promise<StudentPayment | undefined> {
    const [payment] = await db
      .select()
      .from(studentPayments)
      .where(eq(studentPayments.id, id));
    return payment;
  }

  async getStudentPayments(): Promise<StudentPayment[]> {
    return db.select().from(studentPayments);
  }

  async getStudentPaymentsByStudent(
    studentId: string
  ): Promise<StudentPayment[]> {
    return db
      .select()
      .from(studentPayments)
      .where(eq(studentPayments.studentId, studentId));
  }

  async createStudentPayment(
    insert: InsertStudentPayment
  ): Promise<StudentPayment> {
    const [payment] = await db
      .insert(studentPayments)
      .values(insert)
      .returning();
    return payment;
  }

  async updateStudentPayment(
    id: string,
    updates: Partial<InsertStudentPayment>
  ): Promise<StudentPayment | undefined> {
    const [payment] = await db
      .update(studentPayments)
      .set(updates)
      .where(eq(studentPayments.id, id))
      .returning();
    return payment;
  }

  async deleteStudentPayment(id: string): Promise<boolean> {
    const result = await db
      .delete(studentPayments)
      .where(eq(studentPayments.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Vendor Payments
  async getVendorPayment(id: string): Promise<VendorPayment | undefined> {
    const [payment] = await db
      .select()
      .from(vendorPayments)
      .where(eq(vendorPayments.id, id));
    return payment;
  }

  async getVendorPayments(): Promise<VendorPayment[]> {
    return db.select().from(vendorPayments);
  }

  async createVendorPayment(
    insert: InsertVendorPayment
  ): Promise<VendorPayment> {
    const [payment] = await db
      .insert(vendorPayments)
      .values(insert)
      .returning();
    return payment;
  }

  async updateVendorPayment(
    id: string,
    updates: Partial<InsertVendorPayment>
  ): Promise<VendorPayment | undefined> {
    const [payment] = await db
      .update(vendorPayments)
      .set(updates)
      .where(eq(vendorPayments.id, id))
      .returning();
    return payment;
  }

  async deleteVendorPayment(id: string): Promise<boolean> {
    const result = await db
      .delete(vendorPayments)
      .where(eq(vendorPayments.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Expenses
  async getExpense(id: string): Promise<Expense | undefined> {
    const [expense] = await db
      .select()
      .from(expenses)
      .where(eq(expenses.id, id));
    return expense;
  }

  async getExpenses(): Promise<Expense[]> {
    return db.select().from(expenses);
  }

  async createExpense(insert: InsertExpense): Promise<Expense> {
    const [expense] = await db.insert(expenses).values(insert).returning();
    return expense;
  }

  async updateExpense(
    id: string,
    updates: Partial<InsertExpense>
  ): Promise<Expense | undefined> {
    const [expense] = await db
      .update(expenses)
      .set(updates)
      .where(eq(expenses.id, id))
      .returning();
    return expense;
  }

  async deleteExpense(id: string): Promise<boolean> {
    const result = await db.delete(expenses).where(eq(expenses.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Salaries
  async getSalary(id: string): Promise<Salary | undefined> {
    const [salary] = await db
      .select()
      .from(salaries)
      .where(eq(salaries.id, id));
    return salary;
  }

  async getSalaries(): Promise<Salary[]> {
    return db.select().from(salaries);
  }

  async getSalariesByEmployee(employeeId: string): Promise<Salary[]> {
    return db
      .select()
      .from(salaries)
      .where(eq(salaries.employeeId, employeeId));
  }

  async createSalary(insert: InsertSalary): Promise<Salary> {
    const [salary] = await db.insert(salaries).values(insert).returning();
    return salary;
  }

  async updateSalary(
    id: string,
    updates: Partial<InsertSalary>
  ): Promise<Salary | undefined> {
    const [salary] = await db
      .update(salaries)
      .set(updates)
      .where(eq(salaries.id, id))
      .returning();
    return salary;
  }

  async deleteSalary(id: string): Promise<boolean> {
    const result = await db.delete(salaries).where(eq(salaries.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Meal Rates
  async getMealRate(id: string): Promise<MealRate | undefined> {
    const [rate] = await db
      .select()
      .from(mealRates)
      .where(eq(mealRates.id, id));
    return rate;
  }

  async getMealRates(): Promise<MealRate[]> {
    return db.select().from(mealRates);
  }

  async createMealRate(insert: InsertMealRate): Promise<MealRate> {
    const [rate] = await db.insert(mealRates).values(insert).returning();
    return rate;
  }

  async updateMealRate(
    id: string,
    updates: Partial<InsertMealRate>
  ): Promise<MealRate | undefined> {
    const [rate] = await db
      .update(mealRates)
      .set(updates)
      .where(eq(mealRates.id, id))
      .returning();
    return rate;
  }

  async deleteMealRate(id: string): Promise<boolean> {
    const result = await db.delete(mealRates).where(eq(mealRates.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Meal Records
  async getMealRecord(id: string): Promise<MealRecord | undefined> {
    const [record] = await db
      .select()
      .from(mealRecords)
      .where(eq(mealRecords.id, id));
    return record;
  }

  async getMealRecords(): Promise<MealRecord[]> {
    return db.select().from(mealRecords);
  }

  async getMealRecordsByStudent(studentId: string): Promise<MealRecord[]> {
    return db
      .select()
      .from(mealRecords)
      .where(eq(mealRecords.studentId, studentId));
  }

  async createMealRecord(insert: InsertMealRecord): Promise<MealRecord> {
    const [record] = await db.insert(mealRecords).values(insert).returning();
    return record;
  }

  async updateMealRecord(
    id: string,
    updates: Partial<InsertMealRecord>
  ): Promise<MealRecord | undefined> {
    const [record] = await db
      .update(mealRecords)
      .set(updates)
      .where(eq(mealRecords.id, id))
      .returning();
    return record;
  }

  async deleteMealRecord(id: string): Promise<boolean> {
    const result = await db.delete(mealRecords).where(eq(mealRecords.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Notices
  async getNotice(id: string): Promise<Notice | undefined> {
    const [notice] = await db.select().from(notices).where(eq(notices.id, id));
    return notice;
  }

  async getNotices(): Promise<Notice[]> {
    return db.select().from(notices);
  }

  async createNotice(insert: InsertNotice): Promise<Notice> {
    const [notice] = await db.insert(notices).values(insert).returning();
    return notice;
  }

  async updateNotice(
    id: string,
    updates: Partial<InsertNotice>
  ): Promise<Notice | undefined> {
    const [notice] = await db
      .update(notices)
      .set(updates)
      .where(eq(notices.id, id))
      .returning();
    return notice;
  }

  async deleteNotice(id: string): Promise<boolean> {
    const result = await db.delete(notices).where(eq(notices.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Complaints
  async getComplaint(id: string): Promise<Complaint | undefined> {
    const [complaint] = await db
      .select()
      .from(complaints)
      .where(eq(complaints.id, id));
    return complaint;
  }

  async getComplaints(): Promise<Complaint[]> {
    return db.select().from(complaints);
  }

  async getComplaintsByStudent(studentId: string): Promise<Complaint[]> {
    return db
      .select()
      .from(complaints)
      .where(eq(complaints.studentId, studentId));
  }

  async createComplaint(insert: InsertComplaint): Promise<Complaint> {
    const [complaint] = await db.insert(complaints).values(insert).returning();
    return complaint;
  }

  async updateComplaint(
    id: string,
    updates: Partial<InsertComplaint>
  ): Promise<Complaint | undefined> {
    const [complaint] = await db
      .update(complaints)
      .set(updates)
      .where(eq(complaints.id, id))
      .returning();
    return complaint;
  }

  async deleteComplaint(id: string): Promise<boolean> {
    const result = await db.delete(complaints).where(eq(complaints.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Attendance
  async getAttendanceRecord(id: string): Promise<Attendance | undefined> {
    const [record] = await db
      .select()
      .from(attendance)
      .where(eq(attendance.id, id));
    return record;
  }

  async getAttendance(): Promise<Attendance[]> {
    return db.select().from(attendance);
  }

  async getAttendanceByUser(userId: string): Promise<Attendance[]> {
    return db.select().from(attendance).where(eq(attendance.userId, userId));
  }

  async createAttendance(insert: InsertAttendance): Promise<Attendance> {
    const [record] = await db.insert(attendance).values(insert).returning();
    return record;
  }

  async updateAttendance(
    id: string,
    updates: Partial<InsertAttendance>
  ): Promise<Attendance | undefined> {
    const [record] = await db
      .update(attendance)
      .set(updates)
      .where(eq(attendance.id, id))
      .returning();
    return record;
  }

  async deleteAttendance(id: string): Promise<boolean> {
    const result = await db.delete(attendance).where(eq(attendance.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // System Config
  async getSystemConfig(key: string): Promise<SystemConfig | undefined> {
    const [config] = await db
      .select()
      .from(systemConfig)
      .where(eq(systemConfig.key, key));
    return config;
  }

  async getSystemConfigs(): Promise<SystemConfig[]> {
    return db.select().from(systemConfig);
  }

  async createSystemConfig(insert: InsertSystemConfig): Promise<SystemConfig> {
    const [config] = await db.insert(systemConfig).values(insert).returning();
    return config;
  }

  async updateSystemConfig(
    key: string,
    updates: Partial<InsertSystemConfig>
  ): Promise<SystemConfig | undefined> {
    const [config] = await db
      .update(systemConfig)
      .set(updates)
      .where(eq(systemConfig.key, key))
      .returning();
    return config;
  }

  async deleteSystemConfig(key: string): Promise<boolean> {
    const result = await db
      .delete(systemConfig)
      .where(eq(systemConfig.key, key));
    return (result.rowCount ?? 0) > 0;
  }
}

export const storage = new DatabaseStorage();

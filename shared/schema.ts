// import { sql } from "drizzle-orm";
// import { pgTable, text, varchar, integer, timestamp, boolean, decimal, date } from "drizzle-orm/pg-core";
// import { createInsertSchema } from "drizzle-zod";
// import { z } from "zod";

// export const roleEnum = ["SUPER_ADMIN", "ADMIN", "EMPLOYEE", "STUDENT"] as const;
// export type Role = typeof roleEnum[number];

// export const paymentStatusEnum = ["PENDING", "APPROVED", "REJECTED"] as const;
// export type PaymentStatus = typeof paymentStatusEnum[number];

// export const roomTypeEnum = ["AC", "NON_AC"] as const;
// export type RoomType = typeof roomTypeEnum[number];

// export const complaintStatusEnum = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;
// export type ComplaintStatus = typeof complaintStatusEnum[number];

// export const attendanceStatusEnum = ["PRESENT", "ABSENT", "LEAVE"] as const;
// export type AttendanceStatus = typeof attendanceStatusEnum[number];

// // Users table
// export const users = pgTable("users", {
//   id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
//   name: text("name").notNull(),
//   email: text("email").notNull().unique(),
//   password: text("password").notNull(),
//   phone: text("phone"),
//   image: text("image"),
//   role: text("role").notNull().default("STUDENT"),
//   address: text("address"),
//   guardianName: text("guardian_name"),
//   guardianPhone: text("guardian_phone"),
//   dateOfBirth: date("date_of_birth"),
//   joiningDate: date("joining_date"),
//   isActive: boolean("is_active").notNull().default(true),
// });

// // Blocks table
// export const blocks = pgTable("blocks", {
//   id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
//   name: text("name").notNull().unique(),
//   description: text("description"),
//   floorCount: integer("floor_count").default(1),
// });

// // Rooms table
// export const rooms = pgTable("rooms", {
//   id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
//   blockId: varchar("block_id").notNull().references(() => blocks.id),
//   roomNumber: text("room_number").notNull(),
//   capacity: integer("capacity").notNull().default(4),
//   type: text("type").notNull().default("NON_AC"),
//   floor: integer("floor").default(1),
//   monthlyRent: decimal("monthly_rent", { precision: 10, scale: 2 }).default("0"),
// });

// // Seat Allocation table
// export const seatAllocations = pgTable("seat_allocations", {
//   id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
//   studentId: varchar("student_id").notNull().references(() => users.id),
//   roomId: varchar("room_id").notNull().references(() => rooms.id),
//   bedNumber: integer("bed_number").notNull(),
//   allocatedDate: date("allocated_date").notNull(),
//   isActive: boolean("is_active").notNull().default(true),
// });

// // Student Payment table
// export const studentPayments = pgTable("student_payments", {
//   id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
//   studentId: varchar("student_id").notNull().references(() => users.id),
//   amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
//   paymentType: text("payment_type").notNull(),
//   paymentMethod: text("payment_method").default("CASH"),
//   status: text("status").notNull().default("PENDING"),
//   month: text("month").notNull(),
//   year: integer("year").notNull(),
//   transactionId: text("transaction_id"),
//   remarks: text("remarks"),
//   paidDate: timestamp("paid_date"),
//   approvedBy: varchar("approved_by").references(() => users.id),
//   approvedDate: timestamp("approved_date"),
// });

// // Vendor Payment table
// export const vendorPayments = pgTable("vendor_payments", {
//   id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
//   vendorName: text("vendor_name").notNull(),
//   amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
//   purpose: text("purpose").notNull(),
//   paymentDate: date("payment_date").notNull(),
//   paymentMethod: text("payment_method").default("CASH"),
//   invoiceNumber: text("invoice_number"),
//   remarks: text("remarks"),
// });

// // Expense table (Bill & Cost Management)
// export const expenses = pgTable("expenses", {
//   id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
//   category: text("category").notNull(),
//   description: text("description").notNull(),
//   amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
//   expenseDate: date("expense_date").notNull(),
//   paidBy: varchar("paid_by").references(() => users.id),
//   receiptNumber: text("receipt_number"),
//   remarks: text("remarks"),
// });

// // Salary table
// export const salaries = pgTable("salaries", {
//   id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
//   employeeId: varchar("employee_id").notNull().references(() => users.id),
//   amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
//   month: text("month").notNull(),
//   year: integer("year").notNull(),
//   paymentDate: date("payment_date").notNull(),
//   paymentMethod: text("payment_method").default("CASH"),
//   bonus: decimal("bonus", { precision: 10, scale: 2 }).default("0"),
//   deductions: decimal("deductions", { precision: 10, scale: 2 }).default("0"),
//   remarks: text("remarks"),
// });

// // Meal Rate table
// export const mealRates = pgTable("meal_rates", {
//   id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
//   mealType: text("meal_type").notNull(),
//   rate: decimal("rate", { precision: 10, scale: 2 }).notNull(),
//   effectiveFrom: date("effective_from").notNull(),
//   isActive: boolean("is_active").notNull().default(true),
// });

// // Meal Record table
// export const mealRecords = pgTable("meal_records", {
//   id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
//   studentId: varchar("student_id").notNull().references(() => users.id),
//   date: date("date").notNull(),
//   breakfast: boolean("breakfast").notNull().default(false),
//   lunch: boolean("lunch").notNull().default(false),
//   dinner: boolean("dinner").notNull().default(false),
// });

// // Notice table
// export const notices = pgTable("notices", {
//   id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
//   title: text("title").notNull(),
//   content: text("content").notNull(),
//   createdBy: varchar("created_by").notNull().references(() => users.id),
//   createdAt: timestamp("created_at").notNull().defaultNow(),
//   expiresAt: timestamp("expires_at"),
//   isActive: boolean("is_active").notNull().default(true),
//   visibility: text("visibility").notNull().default("ALL"),
//   priority: text("priority").default("NORMAL"),
// });

// // Complaint table
// export const complaints = pgTable("complaints", {
//   id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
//   studentId: varchar("student_id").notNull().references(() => users.id),
//   subject: text("subject").notNull(),
//   description: text("description").notNull(),
//   status: text("status").notNull().default("OPEN"),
//   priority: text("priority").default("NORMAL"),
//   createdAt: timestamp("created_at").notNull().defaultNow(),
//   resolvedAt: timestamp("resolved_at"),
//   resolvedBy: varchar("resolved_by").references(() => users.id),
//   resolution: text("resolution"),
// });

// // Attendance table
// export const attendance = pgTable("attendance", {
//   id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
//   userId: varchar("user_id").notNull().references(() => users.id),
//   date: date("date").notNull(),
//   status: text("status").notNull().default("PRESENT"),
//   checkInTime: text("check_in_time"),
//   checkOutTime: text("check_out_time"),
//   remarks: text("remarks"),
// });

// // System Config table
// export const systemConfig = pgTable("system_config", {
//   id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
//   key: text("key").notNull().unique(),
//   value: text("value").notNull(),
//   description: text("description"),
// });

// // Insert Schemas
// export const insertUserSchema = createInsertSchema(users).omit({ id: true });
// export const insertBlockSchema = createInsertSchema(blocks).omit({ id: true });
// export const insertRoomSchema = createInsertSchema(rooms).omit({ id: true });
// export const insertSeatAllocationSchema = createInsertSchema(seatAllocations).omit({ id: true });
// export const insertStudentPaymentSchema = createInsertSchema(studentPayments).omit({ id: true });
// export const insertVendorPaymentSchema = createInsertSchema(vendorPayments).omit({ id: true });
// export const insertExpenseSchema = createInsertSchema(expenses).omit({ id: true });
// export const insertSalarySchema = createInsertSchema(salaries).omit({ id: true });
// export const insertMealRateSchema = createInsertSchema(mealRates).omit({ id: true });
// export const insertMealRecordSchema = createInsertSchema(mealRecords).omit({ id: true });
// export const insertNoticeSchema = createInsertSchema(notices).omit({ id: true, createdAt: true });
// export const insertComplaintSchema = createInsertSchema(complaints).omit({ id: true, createdAt: true });
// export const insertAttendanceSchema = createInsertSchema(attendance).omit({ id: true });
// export const insertSystemConfigSchema = createInsertSchema(systemConfig).omit({ id: true });

// // Insert Types
// export type InsertUser = z.infer<typeof insertUserSchema>;
// export type InsertBlock = z.infer<typeof insertBlockSchema>;
// export type InsertRoom = z.infer<typeof insertRoomSchema>;
// export type InsertSeatAllocation = z.infer<typeof insertSeatAllocationSchema>;
// export type InsertStudentPayment = z.infer<typeof insertStudentPaymentSchema>;
// export type InsertVendorPayment = z.infer<typeof insertVendorPaymentSchema>;
// export type InsertExpense = z.infer<typeof insertExpenseSchema>;
// export type InsertSalary = z.infer<typeof insertSalarySchema>;
// export type InsertMealRate = z.infer<typeof insertMealRateSchema>;
// export type InsertMealRecord = z.infer<typeof insertMealRecordSchema>;
// export type InsertNotice = z.infer<typeof insertNoticeSchema>;
// export type InsertComplaint = z.infer<typeof insertComplaintSchema>;
// export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
// export type InsertSystemConfig = z.infer<typeof insertSystemConfigSchema>;

// // Select Types
// export type User = typeof users.$inferSelect;
// export type Block = typeof blocks.$inferSelect;
// export type Room = typeof rooms.$inferSelect;
// export type SeatAllocation = typeof seatAllocations.$inferSelect;
// export type StudentPayment = typeof studentPayments.$inferSelect;
// export type VendorPayment = typeof vendorPayments.$inferSelect;
// export type Expense = typeof expenses.$inferSelect;
// export type Salary = typeof salaries.$inferSelect;
// export type MealRate = typeof mealRates.$inferSelect;
// export type MealRecord = typeof mealRecords.$inferSelect;
// export type Notice = typeof notices.$inferSelect;
// export type Complaint = typeof complaints.$inferSelect;
// export type Attendance = typeof attendance.$inferSelect;
// export type SystemConfig = typeof systemConfig.$inferSelect;

// // Login Schema
// export const loginSchema = z.object({
//   email: z.string().email("Please enter a valid email"),
//   password: z.string().min(1, "Password is required"),
// });

// export type LoginInput = z.infer<typeof loginSchema>;




import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  timestamp,
  boolean,
  decimal,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const roleEnum = [
  "SUPER_ADMIN",
  "ADMIN",
  "EMPLOYEE",
  "STUDENT",
] as const;
export type Role = (typeof roleEnum)[number];

export const paymentStatusEnum = ["PENDING", "APPROVED", "REJECTED"] as const;
export type PaymentStatus = (typeof paymentStatusEnum)[number];

export const roomTypeEnum = ["AC", "NON_AC"] as const;
export type RoomType = (typeof roomTypeEnum)[number];

export const complaintStatusEnum = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
] as const;
export type ComplaintStatus = (typeof complaintStatusEnum)[number];

export const attendanceStatusEnum = ["PRESENT", "ABSENT", "LEAVE"] as const;
export type AttendanceStatus = (typeof attendanceStatusEnum)[number];

// Users table
export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone"),
  image: text("image"),
  role: text("role").notNull().default("STUDENT"),
  address: text("address"),
  guardianName: text("guardian_name"),
  guardianPhone: text("guardian_phone"),
  dateOfBirth: date("date_of_birth"),
  joiningDate: date("joining_date"),
  isActive: boolean("is_active").notNull().default(true),
});

// Blocks table
export const blocks = pgTable("blocks", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  floorCount: integer("floor_count").default(1),
});

// Rooms table
export const rooms = pgTable("rooms", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  blockId: varchar("block_id")
    .notNull()
    .references(() => blocks.id),
  roomNumber: text("room_number").notNull(),
  capacity: integer("capacity").notNull().default(4),
  type: text("type").notNull().default("NON_AC"),
  floor: integer("floor").default(1),
  monthlyRent: decimal("monthly_rent", { precision: 10, scale: 2 }).default(
    "0"
  ),
});

// Seat Allocation table
export const seatAllocations = pgTable("seat_allocations", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  studentId: varchar("student_id")
    .notNull()
    .references(() => users.id),
  roomId: varchar("room_id")
    .notNull()
    .references(() => rooms.id),
  bedNumber: integer("bed_number").notNull(),
  allocatedDate: date("allocated_date").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

// Student Payment table
export const studentPayments = pgTable("student_payments", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  studentId: varchar("student_id")
    .notNull()
    .references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentType: text("payment_type").notNull(),
  paymentMethod: text("payment_method").default("CASH"),
  status: text("status").notNull().default("PENDING"),
  month: text("month").notNull(),
  year: integer("year").notNull(),
  transactionId: text("transaction_id"),
  remarks: text("remarks"),
  paidDate: timestamp("paid_date"),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedDate: timestamp("approved_date"),
});

// Vendor Payment table
export const vendorPayments = pgTable("vendor_payments", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  vendorName: text("vendor_name").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  purpose: text("purpose").notNull(),
  paymentDate: date("payment_date").notNull(),
  paymentMethod: text("payment_method").default("CASH"),
  invoiceNumber: text("invoice_number"),
  remarks: text("remarks"),
});

// Expense table (Bill & Cost Management)
export const expenses = pgTable("expenses", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  category: text("category").notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  expenseDate: date("expense_date").notNull(),
  paidBy: varchar("paid_by").references(() => users.id),
  receiptNumber: text("receipt_number"),
  remarks: text("remarks"),
});

// Salary table
export const salaries = pgTable("salaries", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id")
    .notNull()
    .references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  month: text("month").notNull(),
  year: integer("year").notNull(),
  paymentDate: date("payment_date").notNull(),
  paymentMethod: text("payment_method").default("CASH"),
  bonus: decimal("bonus", { precision: 10, scale: 2 }).default("0"),
  deductions: decimal("deductions", { precision: 10, scale: 2 }).default("0"),
  remarks: text("remarks"),
});

// Meal Rate table
export const mealRates = pgTable("meal_rates", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  mealType: text("meal_type").notNull(),
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull(),
  effectiveFrom: date("effective_from").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

// Meal Record table
export const mealRecords = pgTable("meal_records", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  studentId: varchar("student_id")
    .notNull()
    .references(() => users.id),
  date: date("date").notNull(),
  breakfast: boolean("breakfast").notNull().default(false),
  lunch: boolean("lunch").notNull().default(false),
  dinner: boolean("dinner").notNull().default(false),
});

// Notice table
export const notices = pgTable("notices", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdBy: varchar("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").notNull().default(true),
  visibility: text("visibility").notNull().default("ALL"),
  priority: text("priority").default("NORMAL"),
});

// Complaint table
export const complaints = pgTable("complaints", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  studentId: varchar("student_id")
    .notNull()
    .references(() => users.id),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("OPEN"),
  priority: text("priority").default("NORMAL"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: varchar("resolved_by").references(() => users.id),
  resolution: text("resolution"),
});

// Attendance table
export const attendance = pgTable("attendance", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  date: date("date").notNull(),
  status: text("status").notNull().default("PRESENT"),
  checkInTime: text("check_in_time"),
  checkOutTime: text("check_out_time"),
  remarks: text("remarks"),
});

// System Config table
export const systemConfig = pgTable("system_config", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
});

// --- FIX: Updated Schemas with Optional Date Coercion ---

export const insertUserSchema = createInsertSchema(users, {
  dateOfBirth: z.coerce.date().optional().nullable(), // Nullable
  joiningDate: z.coerce.date().optional().nullable(), // Nullable
}).omit({ id: true });

export const insertBlockSchema = createInsertSchema(blocks).omit({ id: true });
export const insertRoomSchema = createInsertSchema(rooms).omit({ id: true });

export const insertSeatAllocationSchema = createInsertSchema(seatAllocations, {
  allocatedDate: z.coerce.date(), // Required
}).omit({ id: true });

export const insertStudentPaymentSchema = createInsertSchema(studentPayments, {
  paidDate: z.coerce.date().optional().nullable(), // Nullable
  approvedDate: z.coerce.date().optional().nullable(), // Nullable
}).omit({ id: true });

export const insertVendorPaymentSchema = createInsertSchema(vendorPayments, {
  paymentDate: z.coerce.date(), // Required
}).omit({ id: true });

export const insertExpenseSchema = createInsertSchema(expenses, {
  expenseDate: z.coerce.date(), // Required
}).omit({ id: true });

export const insertSalarySchema = createInsertSchema(salaries, {
  paymentDate: z.coerce.date(), // Required
}).omit({ id: true });

export const insertMealRateSchema = createInsertSchema(mealRates, {
  effectiveFrom: z.coerce.date(), // Required
}).omit({ id: true });

export const insertMealRecordSchema = createInsertSchema(mealRecords, {
  date: z.coerce.date(), // Required
}).omit({ id: true });

export const insertNoticeSchema = createInsertSchema(notices).omit({
  id: true,
  createdAt: true,
});
export const insertComplaintSchema = createInsertSchema(complaints).omit({
  id: true,
  createdAt: true,
});

export const insertAttendanceSchema = createInsertSchema(attendance, {
  date: z.coerce.date(), // Required
}).omit({ id: true });

export const insertSystemConfigSchema = createInsertSchema(systemConfig).omit({
  id: true,
});

// Insert Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertBlock = z.infer<typeof insertBlockSchema>;
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type InsertSeatAllocation = z.infer<typeof insertSeatAllocationSchema>;
export type InsertStudentPayment = z.infer<typeof insertStudentPaymentSchema>;
export type InsertVendorPayment = z.infer<typeof insertVendorPaymentSchema>;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type InsertSalary = z.infer<typeof insertSalarySchema>;
export type InsertMealRate = z.infer<typeof insertMealRateSchema>;
export type InsertMealRecord = z.infer<typeof insertMealRecordSchema>;
export type InsertNotice = z.infer<typeof insertNoticeSchema>;
export type InsertComplaint = z.infer<typeof insertComplaintSchema>;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type InsertSystemConfig = z.infer<typeof insertSystemConfigSchema>;

// Select Types
export type User = typeof users.$inferSelect;
export type Block = typeof blocks.$inferSelect;
export type Room = typeof rooms.$inferSelect;
export type SeatAllocation = typeof seatAllocations.$inferSelect;
export type StudentPayment = typeof studentPayments.$inferSelect;
export type VendorPayment = typeof vendorPayments.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type Salary = typeof salaries.$inferSelect;
export type MealRate = typeof mealRates.$inferSelect;
export type MealRecord = typeof mealRecords.$inferSelect;
export type Notice = typeof notices.$inferSelect;
export type Complaint = typeof complaints.$inferSelect;
export type Attendance = typeof attendance.$inferSelect;
export type SystemConfig = typeof systemConfig.$inferSelect;

// Login Schema
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
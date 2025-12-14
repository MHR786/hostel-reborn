import "dotenv/config";
import { db } from "../server/db";
import { users, blocks, rooms } from "../shared/schema";
import { exit } from "process";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // 1. Create Admin User
    await db.insert(users).values({
      name: "Admin User",
      email: "admin@hms.com",
      password: "admin123", // In a real app, hash this password!
      role: "ADMIN",
      joiningDate: "2024-01-01",
      isActive: true,
    });
    console.log("✅ Admin created: admin@hms.com / admin123");

    // 2. Create Student User
    await db.insert(users).values({
      name: "John Student",
      email: "student@hms.com",
      password: "student123",
      role: "STUDENT",
      joiningDate: "2024-06-01",
      isActive: true,
    });
    console.log("✅ Student created: student@hms.com / student123");

    // 3. Create a Demo Block & Room (Optional)
    const [block] = await db
      .insert(blocks)
      .values({
        name: "Block A",
        floorCount: 3,
      })
      .returning();

    await db.insert(rooms).values({
      blockId: block.id,
      roomNumber: "101",
      capacity: 4,
      type: "AC",
      floor: 1,
      monthlyRent: "5000",
    });
    console.log("✅ Demo Block A & Room 101 created");

    console.log("🎉 Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    exit(0);
  }
}

seed();

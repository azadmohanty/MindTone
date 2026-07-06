const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const bcrypt = require("bcryptjs");
const path = require("path");

const dbPath = path.resolve(__dirname, "../dev.db");
const adapter = new PrismaBetterSqlite3({
  url: `file:${dbPath}`
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("--- STARTING DATABASE AND RELATIONSHIP VERIFICATION ---");

  try {
    // 1. Verify User exists
    console.log("\n[Step 1] Verifying seeded users...");
    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    const user = await prisma.user.findFirst({ where: { role: "USER" } });

    if (!admin || !user) {
      throw new Error("Seeded users were not found in the database!");
    }
    console.log(`[OK] Found Admin: ${admin.name} (${admin.email})`);
    console.log(`[OK] Found Standard User: ${user.name} (${user.email})`);

    // 2. Verify Authentication Hashing
    console.log("\n[Step 2] Validating password encryption security...");
    const correctPasswordMatch = await bcrypt.compare("user123", user.password);
    const wrongPasswordMatch = await bcrypt.compare("wrong_password", user.password);

    if (!correctPasswordMatch) {
      throw new Error("Password decryption check failed for correct password!");
    }
    if (wrongPasswordMatch) {
      throw new Error("Password decryption check allowed a wrong password!");
    }
    console.log("[OK] Encryption checks passed. Passwords correctly hashed and verified.");

    // 3. Verify Foreign-Key Assessments Mapping
    console.log("\n[Step 3] Checking relationship mappings & assessment records...");
    const assessments = await prisma.assessment.findMany({
      where: { userId: user.id },
      orderBy: { date: "asc" }
    });

    if (assessments.length !== 2) {
      throw new Error(`Expected exactly 2 mock assessments, found ${assessments.length}`);
    }

    console.log(`[OK] Successfully retrieved ${assessments.length} records connected to User ID ${user.id}`);
    
    // Log the progression
    console.log("\n--- HISTORICAL RECORD LOGS ---");
    assessments.forEach((record, index) => {
      console.log(`Record #${index + 1} (${record.date.toDateString()}):`);
      console.log(`  - Fused Diagnosis: ${record.finalDisorder}`);
      console.log(`  - Fusion Decision: ${record.decision}`);
      console.log(`  - PHQ-9 Clinical Score: ${record.phq9Score}`);
      console.log(`  - Anxiety-7 Clinical Score: ${record.anxiety7Score}`);
      console.log(`  - Pitch/Speed Acoustic features: ${record.pitch.toFixed(1)}Hz / ${record.speechRate.toFixed(1)} zcr`);
    });

    console.log("\n--- ALL DATABASE INTEGRITY TESTS PASSED SUCCESSFULY ---");
  } catch (err) {
    console.error("❌ Database verification failed:", err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

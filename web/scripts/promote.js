const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

// Load .env manually
try {
  const envPath = path.join(__dirname, "..", ".env");
  if (fs.existsSync(envPath)) {
    const envLines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of envLines) {
      const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)$/);
      if (match) {
        const key = match[1].trim();
        let val = match[2].trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.substring(1, val.length - 1);
        }
        process.env[key] = val;
      }
    }
  }
} catch (err) {
  console.warn("Could not load .env file:", err.message);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not defined in your .env file!");
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const email = process.argv[2];

if (!email) {
  console.error("Please provide a user email address. Example: node scripts/promote.js user@example.com");
  process.exit(1);
}

async function main() {
  try {
    const user = await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { role: "ADMIN" }
    });
    console.log(`Successfully promoted user ${user.name} (${user.email}) to ADMIN!`);
  } catch (error) {
    console.error("Failed to promote user:", error.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();

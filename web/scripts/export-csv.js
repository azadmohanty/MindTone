const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

// Load .env manually to check connection type
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

const userId = process.argv[2];
if (!userId) {
  console.error("Please provide a userId. Usage: node scripts/export-csv.js <userId>");
  process.exit(1);
}

async function main() {
  let prisma;
  let pool;
  
  if (connectionString.startsWith("postgresql://") || connectionString.startsWith("postgres://")) {
    pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
  } else {
    // Falls back to standard Prisma initialization for local SQLite (file:...)
    prisma = new PrismaClient();
  }

  try {
    const assessments = await prisma.assessment.findMany({
      where: { userId: userId },
      orderBy: { date: "desc" }
    });

    if (assessments.length === 0) {
      console.log(`No assessments found for userId: ${userId}`);
      return;
    }

    // Define CSV Headers
    const headers = [
      "ID", "Date", "Full Name", "PHQ-9 Score", "Anxiety-7 Score", 
      "Audio Disorder", "Audio Confidence", "Final Disorder", "Decision", 
      "Pitch", "Speech Rate", "Jitter", "Shimmer", "HNR"
    ];

    const csvRows = [headers.join(",")];

    for (const item of assessments) {
      const row = [
        `"${item.id}"`,
        `"${item.date.toISOString()}"`,
        `"${item.fullName.replace(/"/g, '""')}"`,
        item.phq9Score,
        item.anxiety7Score,
        `"${item.audioDisorder || ""}"`,
        item.audioConfidence || 0.0,
        `"${item.finalDisorder || ""}"`,
        `"${item.decision || ""}"`,
        item.pitch || 0.0,
        item.speechRate || 0.0,
        item.jitter || 0.0,
        item.shimmer || 0.0,
        item.hnr || 0.0
      ];
      csvRows.push(row.join(","));
    }

    const outputPath = path.join(__dirname, "..", `assessments_user_${userId}.csv`);
    fs.writeFileSync(outputPath, csvRows.join("\n"), "utf-8");
    console.log(`Successfully exported ${assessments.length} rows to: ${outputPath}`);

  } catch (error) {
    console.error("Failed to export assessments:", error.message);
  } finally {
    if (prisma) await prisma.$disconnect();
    if (pool) await pool.end();
  }
}

main();

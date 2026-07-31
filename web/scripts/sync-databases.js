const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
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

// Read database URL argument or environment fallback
const remoteUrl = process.argv[2] || process.env.REMOTE_DATABASE_URL;

if (!remoteUrl) {
  console.error("Usage: node scripts/sync-databases.js <remote_postgresql_url>");
  console.error("Example: node scripts/sync-databases.js postgresql://mindtone_db_user:password@host.render.com/mindtone_db?sslmode=require");
  process.exit(1);
}

async function main() {
  console.log("Connecting to remote PostgreSQL database...");
  const pool = new Pool({ connectionString: remoteUrl });

  // Initialize local SQLite Prisma Client
  process.env.DATABASE_URL = "file:./dev.db";
  const localPrisma = new PrismaClient();

  try {
    // 1. Fetch Users from Remote PostgreSQL
    console.log("Fetching users from remote database...");
    const userRes = await pool.query('SELECT * FROM "User"');
    const remoteUsers = userRes.rows;
    console.log(`Found ${remoteUsers.length} users on remote.`);

    // 2. Sync Users to Local SQLite
    for (const u of remoteUsers) {
      await localPrisma.user.upsert({
        where: { id: u.id },
        update: {
          name: u.name,
          email: u.email,
          password: u.password,
          role: u.role,
          createdAt: u.created_at || u.createdAt || new Date(),
          updatedAt: u.updated_at || u.updatedAt || new Date()
        },
        create: {
          id: u.id,
          name: u.name,
          email: u.email,
          password: u.password,
          role: u.role,
          createdAt: u.created_at || u.createdAt || new Date(),
          updatedAt: u.updated_at || u.updatedAt || new Date()
        }
      });
    }
    console.log("Synced users successfully.");

    // 3. Fetch Assessments from Remote PostgreSQL
    console.log("Fetching assessments from remote database...");
    const assessRes = await pool.query('SELECT * FROM "Assessment"');
    const remoteAssessments = assessRes.rows;
    console.log(`Found ${remoteAssessments.length} assessments on remote.`);

    // 4. Sync Assessments to Local SQLite
    for (const a of remoteAssessments) {
      await localPrisma.assessment.upsert({
        where: { id: a.id },
        update: {
          userId: a.user_id || a.userId,
          date: a.date,
          fullName: a.full_name || a.fullName,
          mobileNumber: a.mobile_number || a.mobileNumber,
          phq9Score: a.phq9_score || a.phq9Score,
          anxiety7Score: a.anxiety7_score || a.anxiety7Score,
          audioDisorder: a.audio_disorder || a.audioDisorder,
          audioConfidence: parseFloat(a.audio_confidence || a.audioConfidence || 0.0),
          tabularDisorder: a.tabular_disorder || a.tabularDisorder,
          finalDisorder: a.final_disorder || a.finalDisorder,
          decision: a.decision,
          pdfReportName: a.pdf_report_name || a.pdfReportName,
          pitch: parseFloat(a.pitch || 0.0),
          speechRate: parseFloat(a.speech_rate || a.speechRate || 0.0),
          jitter: parseFloat(a.jitter || 0.0),
          shimmer: parseFloat(a.shimmer || 0.0),
          hnr: parseFloat(a.hnr || 0.0),
          feelingOfLoneliness: a.feeling_of_loneliness || a.feelingOfLoneliness || "No",
          familyDynamics: a.family_dynamics || a.familyDynamics || "Stable"
        },
        create: {
          id: a.id,
          userId: a.user_id || a.userId,
          date: a.date,
          fullName: a.full_name || a.fullName,
          mobileNumber: a.mobile_number || a.mobileNumber,
          phq9Score: a.phq9_score || a.phq9Score,
          anxiety7Score: a.anxiety7_score || a.anxiety7Score,
          audioDisorder: a.audio_disorder || a.audioDisorder,
          audioConfidence: parseFloat(a.audio_confidence || a.audioConfidence || 0.0),
          tabularDisorder: a.tabular_disorder || a.tabularDisorder,
          finalDisorder: a.final_disorder || a.finalDisorder,
          decision: a.decision,
          pdfReportName: a.pdf_report_name || a.pdfReportName,
          pitch: parseFloat(a.pitch || 0.0),
          speechRate: parseFloat(a.speech_rate || a.speechRate || 0.0),
          jitter: parseFloat(a.jitter || 0.0),
          shimmer: parseFloat(a.shimmer || 0.0),
          hnr: parseFloat(a.hnr || 0.0),
          feelingOfLoneliness: a.feeling_of_loneliness || a.feelingOfLoneliness || "No",
          familyDynamics: a.family_dynamics || a.familyDynamics || "Stable"
        }
      });
    }
    console.log("Synced assessments successfully.");

  } catch (error) {
    console.error("Database sync failed:", error.message);
  } finally {
    await localPrisma.$disconnect();
    await pool.end();
  }
}

main();

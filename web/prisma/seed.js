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
  console.log("Starting database seeding...");

  // Delete existing data
  await prisma.assessment.deleteMany();
  await prisma.user.deleteMany();

  // Create Admin
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.create({
    data: {
      name: "System Administrator",
      email: "admin@mentalhealth.local",
      password: adminPassword,
      role: "ADMIN"
    }
  });
  console.log(`Created administrator: ${admin.email}`);

  // Create User
  const userPassword = await bcrypt.hash("user123", 10);
  const user = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "user@mentalhealth.local",
      password: userPassword,
      role: "USER"
    }
  });
  console.log(`Created standard user: ${user.email}`);

  // Setup Assessment Timestamps
  const oneMonthAgo = new Date();
  oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  // Mock Assessment 1: High Severity Comorbidity
  await prisma.assessment.create({
    data: {
      userId: user.id,
      date: oneMonthAgo,
      fullName: "John Doe",
      mobileNumber: "1234567890",
      moodChanges: "Yes",
      optimismLevel: 3,
      currentEmotionalState: "Sad",
      overthinking: "Yes",
      socialFear: "High",
      concentration: 3,
      socialInteraction: "Low",
      sleepPattern: "Reduced",
      reducedNeedForSleep: "No",
      increasedEnergyLevel: "No",
      suicidalThoughts: "No",
      phq9Score: 18,
      anxiety7Score: 16,
      pastTrauma: "Yes",
      intrusiveMemories: "Yes",
      avoidanceBehaviour: "Yes",
      familyStructure: "Joint",
      familyDynamics: "Neutral",
      maritalAndFamilyConflict: "Occasional",
      financialStress: "High",
      emotionalSupport: "Partial Available",
      feelingOfLoneliness: "Yes",
      feelingUnderstood: "Sometimes",
      phq9_1: 2, phq9_2: 2, phq9_3: 2, phq9_4: 2, phq9_5: 2, phq9_6: 2, phq9_7: 2, phq9_8: 2, phq9_9: 2,
      gad7_1: 2, gad7_2: 2, gad7_3: 2, gad7_4: 2, gad7_5: 2, gad7_6: 2, gad7_7: 2,
      pitch: 145.2,
      pitchVariability: 18.4,
      speechRate: 2.1,
      pauseDuration: 1.2,
      voiceEnergy: 0.015,
      jitter: 0.025,
      shimmer: 0.075,
      hnr: 10.4,
      audioDisorder: "Major Depressive Disorder (Depression Risk)",
      audioConfidence: 68.5,
      tabularDisorder: "Anxiety-Depression Comorbidity",
      finalDisorder: "Anxiety-Depression Comorbidity",
      decision: "Verified by Audio",
      allTabularPredictions: JSON.stringify({
        "Depression": 42.15,
        "GAD": 28.31,
        "PTSD": 8.4,
        "Dysthymia": 15.6,
        "Comorbidity": 58.4,
        "Bipolar I": 1.2,
        "Bipolar II": 4.1,
        "Normal": 0.5
      }),
      riskFlags: JSON.stringify({
        "Suicide Risk": "No",
        "Psychological Distress": "Yes",
        "Family-Related Mental Health Risk": "No",
        "Loneliness Risk": "Yes"
      })
    }
  });

  // Mock Assessment 2: Improved Moderate Condition
  await prisma.assessment.create({
    data: {
      userId: user.id,
      date: twoWeeksAgo,
      fullName: "John Doe",
      mobileNumber: "1234567890",
      moodChanges: "No",
      optimismLevel: 6,
      currentEmotionalState: "Neutral",
      overthinking: "Sometimes",
      socialFear: "Moderate",
      concentration: 6,
      socialInteraction: "Moderate",
      sleepPattern: "Normal",
      reducedNeedForSleep: "No",
      increasedEnergyLevel: "No",
      suicidalThoughts: "No",
      phq9Score: 8,
      anxiety7Score: 7,
      pastTrauma: "Yes",
      intrusiveMemories: "No",
      avoidanceBehaviour: "No",
      familyStructure: "Joint",
      familyDynamics: "Supportive",
      maritalAndFamilyConflict: "No",
      financialStress: "Medium",
      emotionalSupport: "Available",
      feelingOfLoneliness: "Sometimes",
      feelingUnderstood: "Yes",
      phq9_1: 1, phq9_2: 1, phq9_3: 1, phq9_4: 1, phq9_5: 1, phq9_6: 1, phq9_7: 1, phq9_8: 1, phq9_9: 0,
      gad7_1: 1, gad7_2: 1, gad7_3: 1, gad7_4: 1, gad7_5: 1, gad7_6: 1, gad7_7: 1,
      pitch: 155.6,
      pitchVariability: 28.5,
      speechRate: 2.6,
      pauseDuration: 0.45,
      voiceEnergy: 0.045,
      jitter: 0.012,
      shimmer: 0.035,
      hnr: 16.2,
      audioDisorder: "Normal Mental Health Status",
      audioConfidence: 75.2,
      tabularDisorder: "Normal Mental Health Status",
      finalDisorder: "Normal Mental Health Status",
      decision: "Verified by Audio",
      allTabularPredictions: JSON.stringify({
        "Depression": 12.35,
        "GAD": 9.42,
        "PTSD": 1.2,
        "Dysthymia": 8.5,
        "Comorbidity": 11.2,
        "Bipolar I": 0.5,
        "Bipolar II": 2.1,
        "Normal": 65.4
      }),
      riskFlags: JSON.stringify({
        "Suicide Risk": "No",
        "Psychological Distress": "No",
        "Family-Related Mental Health Risk": "No",
        "Loneliness Risk": "No"
      })
    }
  });

  console.log("Mock assessment records inserted successfully.");
  console.log("Database seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

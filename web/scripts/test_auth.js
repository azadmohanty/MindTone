const { exec } = require("child_process");
const http = require("http");
const path = require("path");

function waitServer(url, timeout = 45000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const timer = setInterval(() => {
      http.get(url, (res) => {
        clearInterval(timer);
        resolve(true);
      }).on("error", () => {
        if (Date.now() - start > timeout) {
          clearInterval(timer);
          reject(new Error("Timeout waiting for Next.js server to start."));
        }
      });
    }, 500);
  });
}

async function main() {
  console.log("--- STARTING FRONTEND AUTHENTICATION API TEST ---");

  // 1. Start next.js server locally on port 3001
  console.log("\n[Step 1] Launching local Next.js dev server on port 3001...");
  const devServer = exec("npm run dev -- --port 3001", {
    cwd: path.resolve(__dirname, "..")
  });

  // Track if we successfully shut down
  let isShutdown = false;
  const shutdown = () => {
    if (isShutdown) return;
    isShutdown = true;
    console.log("\nShutting down Next.js dev server...");
    devServer.kill("SIGTERM");
    console.log("Server process terminated.");
  };

  try {
    // 2. Wait for Next.js to start
    await waitServer("http://127.0.0.1:3001");
    console.log("[OK] Next.js dev server is running on port 3001.");

    const baseURL = "http://127.0.0.1:3001/api";
    const uniqueEmail = `test_user_${Date.now()}@example.com`;

    // 3. Test Registration Endpoint
    console.log("\n[Step 2] Testing POST /auth/register...");
    const regRes = await fetch(`${baseURL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Verification Test User",
        email: uniqueEmail,
        password: "testpassword123"
      })
    });

    const regData = await regRes.json();
    if (regRes.status !== 201) {
      throw new Error(`Expected registration to return 201, got ${regRes.status}. Details: ${JSON.stringify(regData)}`);
    }
    console.log(`[OK] User registered successfully with email: ${uniqueEmail}`);

    // 4. Test Registration Duplicate Conflict Guard
    console.log("\n[Step 3] Testing registration duplicate constraint...");
    const dupRes = await fetch(`${baseURL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Duplicate User",
        email: uniqueEmail,
        password: "password123"
      })
    });

    const dupData = await dupRes.json();
    if (dupRes.status !== 409) {
      throw new Error(`Expected duplicate to return 409 conflict, got ${dupRes.status}`);
    }
    console.log(`[OK] Duplicate email blocked successfully. Details: ${dupData.error}`);

    // 5. Test Login Endpoint
    console.log("\n[Step 4] Testing POST /auth/login with correct password...");
    const loginRes = await fetch(`${baseURL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: uniqueEmail,
        password: "testpassword123"
      })
    });

    const loginData = await loginRes.json();
    if (loginRes.status !== 200) {
      throw new Error(`Expected login to return 200, got ${loginRes.status}. Details: ${JSON.stringify(loginData)}`);
    }

    // Verify session cookie was set in headers
    const cookieHeader = loginRes.headers.get("set-cookie");
    const hasSessionCookie = cookieHeader && cookieHeader.includes("session=");

    if (!hasSessionCookie) {
      throw new Error("Login failed to set session cookie! set-cookie header was missing.");
    }
    console.log("[OK] Login authenticated successfully.");
    console.log(`[OK] Cookie set-headers verified: ${cookieHeader.split(";")[0]}`);

    // 6. Test Login Failure
    console.log("\n[Step 5] Testing POST /auth/login validation with wrong credentials...");
    const failRes = await fetch(`${baseURL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: uniqueEmail,
        password: "wrongpassword"
      })
    });

    const failData = await failRes.json();
    if (failRes.status !== 401) {
      throw new Error(`Expected wrong credentials to return 401, got ${failRes.status}. Details: ${JSON.stringify(failData)}`);
    }
    console.log(`[OK] Wrong credentials rejected successfully. Details: ${failData.error}`);

    console.log("\n--- ALL AUTHENTICATION AND API ROUTE TESTS PASSED SUCCESSFULY ---");
  } catch (err) {
    console.error("❌ Authentication test failed:", err.message);
    shutdown();
    process.exit(1);
  }

  shutdown();
}

main();

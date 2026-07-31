# Chapter 7: Testing and Validation

To ensure the safety, predictability, and performance of the proposed clinical utility, a structured validation methodology was executed. This section details the systematic evaluation of the system, comprising functional unit test cases, cross-service integration, and latency benchmarks under load constraints.

---

## 7.1 Software Testing Methodology

MindTone underwent a rigorous, multi-tier testing pipeline to verify stability at every layer of the software stack.

### 7.1.1 Unit Testing
Unit testing focused on verifying individual functions in complete isolation:
*   **Cryptographic Operations:** Hashing and verification operations governed by the `bcrypt` library were validated to ensure user passwords are encrypted securely prior to storage.
*   **JSON Web Tokens (JWT):** The token operations managed by the session utility were tested to verify successful signature generation, token encryption, payload retrieval, and absolute session expiration.
*   **Database Pools:** Database pool allocations were monitored under simulated concurrent requests to confirm that Neon PostgreSQL server connections are established and recycled without memory leaks.
*   **Audio Conversion Helpers:** Standalone audio format conversion utilities were tested using sample files, ensuring that incoming `.webm` audio blocks are correctly parsed and normalized into standardized `.wav` containers prior to signal processing.

### 7.1.2 Integration Testing
Integration testing focused on verifying the communication between different components:
*   **Next.js API Proxy Gateway:** Verified that client-side tokens and API parameters are passed to the FastAPI ML backend with headers and security credentials intact.
*   **Multimodal Payloads:** Integration pathways transferring questionnaire answers (JSON) and vocal recordings (binary blocks) were validated to ensure multipart form data is successfully received, parsed, and mapped by the Python service.
*   **Matplotlib Headless Processing:** Integration testing verified that the Matplotlib instance executes strictly under the `'Agg'` backend, ensuring that data plots are rendered on a headless server layout without trigger failures.

### 7.1.3 System (End-to-End) Testing
System testing simulated complete real-world user paths:
*   **User Path:** Registration $\rightarrow$ Secure Login $\rightarrow$ Multimodal Assessment intake $\rightarrow$ Voice Reflection audio submission $\rightarrow$ Processing and score aggregation $\rightarrow$ Dashboard display and PDF report download.
*   **Admin Path:** Administrator credentials authentication $\rightarrow$ Dashboard telemetry view $\rightarrow$ User database query execution $\rightarrow$ Patient record deletion $\rightarrow$ Temporary file system cleanup.

---

## 7.2 Functional Test Cases

Below is the verified test matrix documenting standard clinical screening scenarios:

| Test ID | Scenario | Input / Action | Expected Result | Observed Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-1** | User Registration | Valid email, name, and strong password. | Account created, password hashed, redirect to login. | Database entry created, password encrypted, redirect triggered. | **PASS** |
| **TC-2** | JWT Authorization | Request to `/dashboard` with invalid token. | Access denied, redirect to `/login` page. | 401 Unauthorized status, redirect executed successfully. | **PASS** |
| **TC-3** | Admin Redirection | Log in using an account assigned with the `ADMIN` role. | Instant redirection to `/admin` dashboard panel. | Bypassed standard user dashboard, immediate redirection to admin panel. | **PASS** |
| **TC-4** | Audio Recording | Click record, speak for 10 seconds, click submit. | Audio captured, saved locally as WebM, forwarded to API. | WebM file written to disk, forwarded successfully. | **PASS** |
| **TC-5** | Audio Feature Extraction | Submit 10s audio recording to `/predict/audio`. | FastAPI extracts pitch, jitter, shimmer, HNR; returns JSON. | Feature values calculated and successfully returned in JSON payload. | **PASS** |
| **TC-6** | Report PDF Generation | Click download PDF report on dashboard. | Trigger `/api/report?force=true`. Compile PDF, render charts, return file stream. | Headless Matplotlib renders plots, ReportLab compiles PDF, file downloads. | **PASS** |

---

## 7.3 Performance & Stability Evaluation

### 7.3.1 Response Time & Latency
*   **Performance Benchmark:** The system targets an end-to-end processing threshold of under 5 seconds for a standard 10-second voice assessment.
*   **Observed Latency:** During load testing, the complete execution cycle (audio upload $\rightarrow$ feature extraction $\rightarrow$ model inference $\rightarrow$ decision fusion $\rightarrow$ JSON response) completed in **less than 3.5 seconds** under ordinary network conditions.

### 7.3.2 System Resource Utilization
*   **RAM Footprint:** Audio signal processing libraries can be memory-intensive. Load testing demonstrated that the FastAPI process maintains an average RAM consumption of **approximately 250 MB** during active feature extraction, safely preventing Out of Memory (OOM) crashes on basic 512MB hosting containers.
*   **CPU Utilization:** CPU usage spikes briefly to 100% on a single core during the Librosa feature calculation phase, but immediately drops to normal idle thresholds (< 5%) once inference completes.

### 7.3.3 Build System Integrity
*   **Turbopack watch-panic:** During local testing on Windows, the Next.js Turbopack compiler encountered watch-mode crashes.
*   **Resolution:** Fallback testing verified that switching the Next.js dev server compiler script to standard Webpack (`"dev": "next dev --webpack"`) completely resolved compilation crashes.

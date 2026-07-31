# Chapter 3: Requirement Analysis

A systematic requirements elicitation process defines the functional limits and operational constraints of the MindTone framework. This section establishes the functional and non-functional specifications, followed by the baseline software and hardware specifications, alongside proposed IoT integration protocols.

---

## 3.1 Functional Requirements

Functional requirements define the core processing operations, inputs, outputs, and behaviors that the system must execute. The core pipeline is divided into eight primary functional blocks:

| ID | Functional Requirement | Input | Output | Description |
| :--- | :--- | :--- | :--- | :--- |
| **FR-1** | User Registration & Authentication | User details, credentials | Secure user account, active JWT session | Allows users to securely register, log in, and establish an encrypted session. |
| **FR-2** | Multimodal Data Collection | User responses | Structured check-in assessment object | Collects patient questionnaire details (PHQ-9/GAD-7) along with family environment and loneliness parameters. |
| **FR-3** | Real-Time Audio Capture | Patient voice response | Processed audio file (`.wav`) | Captures audio inputs directly through the user's microphone during the assessment. |
| **FR-4** | Preprocessing & Feature Extraction | Questionnaire data, raw audio | Normalized feature vectors | Preprocesses structured data and uses `librosa` to extract acoustic feature vectors (pitch, jitter, shimmer, HNR). |
| **FR-5** | Mental Health Prediction | Processed feature vectors | Predicted disorder risk scores | Utilizes trained CatBoost models to predict risk tiers for specific mental health disorders. |
| **FR-6** | Explainable AI Analysis | Model parameters, feature values | SHAP visual attribution data | Generates SHAP local explanation maps to justify how features influenced the prediction. |
| **FR-7** | Clinical Report Generation | Prediction scores, XAI data | Timestamped, printable PDF report | Compiles observed metrics, risk indicators, and SHAP graphs into an Indigo-themed PDF using ReportLab. |
| **FR-8** | Assessment History Retrieval | User historical query | Saved database records | Enables patients and authorized clinicians to view historical trends and progress charts. |

---

## 3.2 Non-Functional Requirements

Non-functional requirements describe the operational qualities, constraints, and performance benchmarks of the system.

1. **Security:** Patient data must be protected using standard encryption. Passwords must be hashed using `bcrypt` before storage. Client-server sessions must be secured with JSON Web Tokens (JWT) stored in HTTP-only cookies.
2. **Reliability:** The backend must handle high-memory operations (like audio processing and PDF compiling) without crashing. Graphic generation using Matplotlib must execute in a headless thread (`'Agg'` backend) to prevent crashes.
3. **Performance:** The ML inference pipeline (audio feature extraction + CatBoost prediction + SHAP generation) must return results within an acceptable threshold (< 5 seconds for a standard 10-second audio clip).
4. **Scalability:** The database connection pool must handle concurrent read/write queries without resource locking, managed via serverless pooling mechanisms (Prisma PgAdapter).
5. **Usability:** The frontend user interface must be clean, responsive, and provide clear tooltips explaining complex clinical metrics (e.g., pitch, jitter, and shimmer boundaries).

---

## 3.3 System Requirements

### 3.3.1 Software Requirements
* **Operating System:** Windows 10/11, macOS, or Linux (Ubuntu 20.04 LTS recommended for production deployment).
* **Development Environment (IDE):** Visual Studio Code (VS Code).
* **Runtime Environments:** Node.js (v18+) for frontend; Python (v3.10+) for ML backend.
* **Frontend Technologies:** React.js, Next.js (version 16), TypeScript, TailwindCSS.
* **Backend Technologies:** FastAPI, Uvicorn, Prisma ORM.
* **Machine Learning & Signal Processing Libraries:** CatBoost, Scikit-learn, SHAP, Librosa, NumPy, Pandas.
* **Visualization & Output Libraries:** Matplotlib, ReportLab.
* **Database Management System:** PostgreSQL (hosted on Neon.tech).
* **Version Control:** Git & GitHub.

### 3.3.2 Baseline Hardware Requirements (Client & Server)
* **Client Device:** Any standard PC, laptop, or tablet equipped with a functional microphone for voice reflection recording.
* **Developer/Server Compute Specs:** 
  * Minimum: 1 vCPU, 1 GB RAM (AWS Lightsail, DigitalOcean Droplet, or Google Cloud Run container).
  * Storage: 10 GB SSD headroom for temporary audio conversions and local build assets.

### 3.3.3 Proposed IoT Hardware Expansion (Optional Modules)
*Note: This hardware segment represents the proposed physical sensor integration scope for dedicated clinical kiosk deployments:*
* **Microcontroller:** ESP32-WROOM-32D Development Board (incorporating Wi-Fi and Bluetooth LE).
* **Acoustic/Bio-Sensors:**
  * MAX30102 PPG Sensor (Pulse & SpO2 tracking).
  * AD8232 ECG Sensor Module (Heart Rate Variability / HRV mapping).
  * Grove GSR Sensor (Skin conductance tracking for emotional stress).
  * OEM Automatic BP Cuff (pressure sensor, 5V inflation motor, solenoid valve).
* **Power Configuration:** 2x 18650 Li-ion cells with a TP4056 protective charging circuit and a 5V boost converter.

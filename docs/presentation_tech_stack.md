# MindTone Technical Stack & Architecture (PPT Slide Content)

Below is the refined and accurate technology stack of the MindTone project, tailored specifically to match our codebase and architecture:

---

### **1. Frontend Architecture**
* **Framework:** Next.js (React.js) with TypeScript for a robust, typed, component-driven user interface.
* **Styling & UI:** TailwindCSS for responsive layouts and modern, custom-designed clinical dashboard interfaces.
* **State & Auth:** Client-side React Hooks coupled with cookie-based JWT session authentication and middleware routing.

### **2. FastAPI Backend Service**
* **Framework:** FastAPI (Python) for high-performance, asynchronous REST APIs.
* **Server:** Uvicorn server handling backend endpoints, multi-threaded request queuing, and integration.
* **Integration Bridge:** A custom Next.js API proxy routing traffic seamlessly between the frontend and the FastAPI ML service.

### **3. Machine Learning & Explainable AI (XAI)**
* **Classification Model:** CatBoost Classifier optimized for multi-modal clinical diagnostic tier mapping.
* **Explainable AI (XAI):** SHAP (SHapley Additive exPlanations) values to extract feature weights, justifying predictions for clinicians.
* **Core Processing:** Pandas, NumPy, and Scikit-learn for data manipulation, normalization, and feature pipelines.

### **4. Multimodal Data Processing**
* **Voice Analysis:** Librosa library for acoustic feature extraction (extracting pitch, jitter, and shimmer from vocal recordings).
* **Behavioral Analysis:** Questionnaire scoring algorithms mapping diagnostic risk indices (Loneliness, Coping, and Family dynamics).
* **Webcam Telemetry (Future-Ready):** MediaPipe (Iris & FaceMesh) and WebGazer.js running client-side for gaze tracking and facial expression mapping.

### **5. Database & ORM**
* **Database Engine:** PostgreSQL (Neon.tech serverless database).
* **Database Interface:** Prisma ORM (using Prisma Client and PgAdapter) for type-safe database queries and migrations.

### **6. Visualization & Reporting**
* **Data Visuals:** Matplotlib (configured with headless `'Agg'` backend for server compatibility) to plot diagnostic charts.
* **Clinical Reporting:** ReportLab engine to compile data, charts, and SHAP explanations into premium, printable PDF clinical reports.

### **7. IoT & Hardware Prototyping (Proposed)**
* **Microcontroller:** ESP32-WROOM-32D using Bluetooth LE and WebSockets to transmit biometrics to the web client.
* **Biosensors:** AD8232 (ECG / Heart Rate Variability), Grove GSR (skin conductance), MAX30102 (Pulse/SpO2), and OEM BP Cuff.

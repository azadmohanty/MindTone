# 🧠 MentalHealth_ML

## Explainable Multimodal AI Framework for Mental Health Assessment

**MentalHealth_ML** is an explainable multimodal machine learning framework developed for early mental health screening and assessment. It combines survey questionnaire data (as the primary prediction modality) and conversational audio analysis (as the verification modality) to predict potential disorders and associated psychological risk factors.

The project is structured statelessly, exposing a local Python FastAPI microservice that can be consumed by multi-user web interfaces (Next.js, dashboards) for secure, simultaneous assessments.

---

## 🚀 Key Features

* **Multimodal Decision Fusion:** Combines survey responses and conversational speech features to generate verified diagnoses.
* **Stateless API Architecture:** A lightweight FastAPI server processing requests in-memory with automatic cleanup (no disk conflicts).
* **Production-Grade Safeguards:**
  * **Audio Edge-Case Protection:** Automatically catches sound failures (silence, static, short recordings) and returns safe baseline averages instead of crashing the extraction pipeline.
  * **Input Validation:** Categorical inputs are validated against trained encoder domains, blocking malformed API requests with clean validation errors.
  * **Regression Bounding:** Bounds CatBoost Regressor outputs to `[0.0, 100.0]%` and rounds probabilities to two decimal places.
* **CLI & Web Execution Support:** Run via command-line batch or through HTTP requests.

---

## 🛠️ Technology Stack

* **Machine Learning:** CatBoost Regressor & Classifier, Scikit-learn
* **Audio Analysis:** Librosa, Parselmouth (Praat C++ bindings wrapper)
* **Web Services:** FastAPI, Uvicorn, Pydantic
* **Data & Math:** Pandas, NumPy, Joblib

---

## 📁 Project Structure

```text
MentalHealth_ML/
├── dataset/             # Datasets used for model training
├── history/             # Assessment history local CSV database (for CLI)
├── models/              # Pickled models and category encoders
├── outputs/             # Static PDF reports and graphs outputs
├── src/
│   ├── api/             # FastAPI App Server (server.py)
│   ├── audio/           # Feature extraction & audio classification model
│   ├── config/          # Global target columns and file paths configuration
│   ├── explainability/  # SHAP explainability & feature attribution analyses
│   ├── fusion/          # FusionEngine decision algorithms
│   ├── history/         # CLI history logger and cleanup utilities
│   ├── report/          # ReportLab PDF compiler & matplotlib graphs scripts
│   └── tabular/         # Tabular preprocessing & CatBoost regressor models
├── scratch/             # Persistent scratch verification scripts
├── web/                 # Next.js Web App Isolation Directory
│   ├── prisma/          # Prisma ORM Schema & SQLite dev.db file
│   ├── public/          # Static assets & user-recorded audio files
│   ├── src/             # Next.js App Router codebase
│   │   ├── app/         # Pages, Layouts, and API routes
│   │   ├── components/  # Reusable React components (Sidebar, AudioRecorder)
│   │   └── lib/         # Prisma client, sessions, cookies, JWT encryption
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── main.py              # CLI batch execution entrypoint
└── requirements.txt     # Python package requirements
```

---

## 💾 Database & Local Storage

The user accounts, profile details, and wellness check-in records are stored in a relational **SQLite** database managed by **Prisma ORM**.

### 1. Database File Location
The database is saved locally at:
`web/prisma/dev.db`

### 2. How to Access the Database Locally
You can view, search, and edit database records in two ways:

* **Interactive GUI (Prisma Studio)**:
  Run this command inside the `web/` directory to launch a clean graphical database editor in your browser:
  ```bash
  npx prisma studio
  ```
  It will open automatically at [http://localhost:5555](http://localhost:5555).

* **Direct SQLite Access**:
  Since `dev.db` is a standard SQLite database file, you can open it with any local database tool such as:
  * **DB Browser for SQLite** (https://sqlitebrowser.org/)
  * **DBeaver** or **DataGrip**
  * **VS Code SQLite Viewer** extension

---

## 📊 SHAP Explainability & PDF Reports

### 1. SHAP (SHapley Additive exPlanations)
To provide explainable AI (XAI) for mental health classifications, the framework incorporates SHAP values. SHAP models feature attribution as a cooperative game, calculating the exact positive or negative push that user inputs (such as overthinking levels or sleep patterns) exert on their anxiety and depression scores.

### 2. On-Demand PDF Report Compilation
When a survey is submitted via the web app:
1. The Next.js endpoint forwards payload inputs to the FastAPI engine.
2. The engine generates ML classification predictions.
3. The engine dynamically calls `src/report/graphs.py` to compile visualization charts (probabilities bar graph and risk flags tracker) under `outputs/graphs/`.
4. The engine executes `src/report/generate_report.py` to compile a print-ready ReportLab PDF document under `outputs/reports/`.
5. The generated PDF file is securely served via the Next.js `/api/assessment/pdf/[pdfName]` download stream.

---

## ⚙️ Running Locally

### 1. Install Dependencies
Ensure you have Python 3.12+ (or target 3.14) installed, then run:
```bash
pip install -r requirements.txt
```

### 2. Start the API Server
Launch the stateless FastAPI microservice using Uvicorn:
```bash
uvicorn src.api.server:app --reload --host 127.0.0.1 --port 8000
```
Once running, the interactive API documentation (Swagger UI) is available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

### 3. API Endpoints
* **`POST /predict/tabular`**: Send survey JSON answers to return disorder probabilities and risk flags.
* **`POST /predict/audio`**: Upload a WAV file to return acoustic voice features and classification.
* **`POST /predict/multimodal`**: Upload both the survey JSON (as a form field) and WAV file to execute full predictions and the fused decision in one request.

---

## 🧪 Testing and Verification

To verify that your local environment is fully configured and the models load correctly, run these verification scripts:

* **Verify Stateless Core Modules:**
  ```bash
  python scratch/test_api.py
  ```
* **Verify API Server Endpoints:**
  ```bash
  python scratch/test_server.py
  ```

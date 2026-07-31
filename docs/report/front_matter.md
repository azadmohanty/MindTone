# MindTone: Front Matter

---

## 1. Cover Page

### **PROJECT REPORT**
on
### **MULTIMODAL EXPLAINABLE AI & MENTAL HEALTH**

Submitted in partial fulfillment of the requirements for the
**Summer Internship on Research Sensitization & Innovative Project Development**

#### **Submitted By:**
| Name of Student | Roll Number |
| :--- | :--- |
| Adishakti Panigrahi | 2401109146 |
| Azad Mohanty | 2401109172 |
| Bablu Gouda | 2401109174 |
| K. Om Prakash Reddy | 2401109190 |
| Sahil Maharana | 2401109225 |
| Satyajeet Maharana | 2401109228 |
| Satyajit Nath | 2401109229 |
| Shuvabrata Sahoo | 2401109232 |
| Suraj Kumar Sahoo | 2401109248 |
| Suvankar Jena | 2401109252 |

#### **Under the Guidance of:**
**Dr. Debasis Mohapatra** & **Dr. Ranumayee Sing**  
Faculty Mentors, Department of Computer Science & Engineering

![Institution Logo](./logo-pmec.png)

**DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING**  
**PARALA MAHARAJA ENGINEERING COLLEGE**  
(A Constituent College of Biju Patnaik University of Technology, BPUT, Odisha)  
Berhampur, Odisha - 761003  
**Academic Year: 2025 - 2026**

---

## 2. Certificate

### **PARALA MAHARAJA ENGINEERING COLLEGE**
**Berhampur, Odisha**  
**DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING**

This is to certify that the project report entitled **"Multimodal Explainable AI & Mental Health"** is a bonafide record of the work carried out by the team under our supervision and guidance, in partial fulfillment of the requirements for the Summer Internship on Research Sensitization & Innovative Project Development.

<br><br>
**Dr. Debasis Mohapatra**  
Faculty Mentor  
Department of CSE  

**Dr. Ranumayee Sing**  
Faculty Mentor  
Department of CSE  

<br><br>
**Head of the Department**  
Department of Computer Science & Engineering  
Parala Maharaja Engineering College  

---

## 3. Declaration

We, the undersigned, hereby declare that the project entitled **"Multimodal Explainable AI & Mental Health"** submitted to the Department of Computer Science & Engineering, Parala Maharaja Engineering College, is an original piece of work carried out by us under the guidance of Dr. Debasis Mohapatra and Dr. Ranumayee Sing.

We further declare that to the best of our knowledge, this work has not formed the basis for the award of any other degree or diploma at this or any other university.

#### **Group Members:**
* Azad Mohanty (Roll No: 2401109172)
* Adishakti Panigrahi (Roll No: 2401109146)
* Bablu Gouda (Roll No: 2401109174)
* K. Om Prakash Reddy (Roll No: 2401109190)
* Sahil Maharana (Roll No: 2401109225)
* Satyajeet Maharana (Roll No: 2401109228)
* Satyajit Nath (Roll No: 2401109229)
* Shuvabrata Sahoo (Roll No: 2401109232)
* Suraj Kumar Sahoo (Roll No: 2401109248)
* Suvankar Jena (Roll No: 2401109252)

Date:  
Place: Berhampur, Odisha  

---

## 4. Acknowledgement

We express our deep sense of gratitude and sincere thanks to our project mentors, **Dr. Debasis Mohapatra** and **Dr. Ranumayee Sing**, Department of Computer Science & Engineering, Parala Maharaja Engineering College, for their invaluable guidance, constant encouragement, and constructive suggestions throughout the course of this project.

We are highly indebted to the **Head of the Department, Computer Science & Engineering**, for providing the necessary facilities and support that enabled us to complete our work successfully.

Finally, we extend our heartfelt appreciation to our family members, peers, and friends who supported us directly or indirectly throughout this research and software development process.

---

## 5. Abstract

Mental health conditions represent a critical global health burden, with a significant proportion of the population remaining undiagnosed due to clinical resource shortages and social stigma. Traditional screening methods depend heavily on subjective, self-reported questionnaires, which are prone to recall bias. To address these challenges, this project introduces **MindTone**, an Explainable Multimodal AI Framework designed to predict mental health conditions and analyze the clinical impact of domestic family environments and subjective loneliness. 

The framework integrates structured questionnaire assessments (combining DSM-5 diagnostic criteria, PHQ-9, and GAD-7) with objective vocal acoustic feature extractions (fundamental frequency $F_0$, jitter, shimmer, HNR, and speech rate) computed using the `librosa` and `parselmouth` Python libraries. Machine learning pipelines were developed using gradient boosting classifiers and regressors. Evaluation results show that the **CatBoostRegressor** achieved an $R^2$ score of **0.71** (with an accuracy of **96.13%** within a $\pm 10\%$ error margin) when predicting disorder severity from tabular check-ins, outperforming XGBoost and Random Forest. For vocal distress classification, the **CatBoostClassifier** achieved an accuracy of **86.90%** and an F1-Score of **86.89%**. 

To establish clinical trust, **SHAP (SHapley Additive exPlanations)** is integrated to generate visual feature-weight attributions, validating that the models align with DSM-5 criteria by identifying loneliness and dysfunctional family dynamics as the primary contributors to elevated depression and anxiety risk. The backend dynamically compiles results into a printable PDF clinical report using ReportLab. MindTone provides a secure, lightweight, and low-cost pre-clinical screening kiosk framework, offering objective and transparent evaluations to support medical decision-making.

**Keywords:** Multimodal AI, Explainable AI (XAI), CatBoost, SHAP, Vocal Biomarkers, Librosa, Mental Health Screening.

---

## 6. Table of Contents (Outline)

*   **Front Matter**
    *   Cover Page
    *   Certificate
    *   Declaration
    *   Acknowledgement
    *   Abstract
*   **Chapter 1: Introduction**
    *   1.1 Background
    *   1.2 Problem Statement
    *   1.3 Need for the Product
    *   1.4 Objectives
    *   1.5 Scope
    *   1.6 Contributions
*   **Chapter 2: Literature Review**
    *   2.1 Review of Research Papers
    *   2.2 Overall Research Gaps
    *   2.3 Proposed Innovative Solution: MindTone
*   **Chapter 3: Requirement Analysis**
    *   3.1 Functional Requirements
    *   3.2 Non-Functional Requirements
    *   3.3 System Requirements
        *   3.3.1 Software Requirements
        *   3.3.2 Baseline Hardware Requirements
        *   3.3.3 Proposed IoT Hardware Expansion
*   **Chapter 4: Product Design**
    *   4.1 System Architecture
    *   4.2 Flowchart (System Workflow)
    *   4.3 UML Diagrams
        *   4.3.1 Use-Case Diagram
        *   4.3.2 Class Diagram
        *   4.3.3 Sequence Diagram
    *   4.4 Database Design
    *   4.5 User Interface (UI) Design
*   **Chapter 5: Product Development**
    *   5.1 Development Life Cycle (Roadmap)
    *   5.2 Core Software Modules
    *   5.3 System Algorithms
        *   Algorithm 1: Data Preprocessing and Model Training
        *   Algorithm 2: User Assessment and Multimodal Prediction
        *   Algorithm 3: Admin Management Module
*   **Chapter 6: Implementation**
    *   6.1 Development & Run-time Environment
    *   6.2 Key Software Libraries & Frameworks
    *   6.3 System Deployment
    *   6.4 Interface Screenshots
*   **Chapter 7: Testing and Validation**
    *   7.1 Software Testing Methodology
    *   7.2 Functional Test Cases
    *   7.3 Performance & Stability Evaluation
*   **Chapter 8: Results and Discussion**
    *   8.1 Machine Learning Model Performance
    *   8.2 Explainable AI (XAI) Validation
    *   8.3 System & Report Validation
*   **Chapter 9: Conclusion and Future Works**
    *   9.1 Conclusion
    *   9.2 Future Scope
*   **References**

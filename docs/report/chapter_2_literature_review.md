# Chapter 2: Literature Review

A review of relevant academic literature establishes the clinical and computational foundations of the proposed system. Key areas of interest comprise explainable artificial intelligence (XAI) frameworks, multimodal machine learning architectures in psychiatric screening, and socio-cultural determinants of mental health—including family structure and subjective loneliness—within the Indian demographic.

---

## 2.1 Review of Research Papers

### Paper 1: Explainable AI for Mental Health through Transparency and Interpretability for Understandability (TIFU Framework)
* **Authors:** Dan W. Joyce, Andrey Kormilitzin, Katharine A. Smith, and Andrea Cipriani
* **Data Sources:** PubMed review of 15 XAI-based mental health studies published between 2018 and 2022.
* **Methodology:** The authors introduced the TIFU (Transparency and Interpretability for Understandability) framework, evaluating clinical models against reference models (like Logistic Regression) and discussing local feature attributions using SHAP (SHapley Additive exPlanations) and LIME.
* **Key Results:** The review demonstrated that XAI improves clinical trust, but only 3 out of 15 studies actually evaluated clinician understanding of these explanations.
* **Research Gaps:** The study highlighted that there is no consensus on standard definitions of explainability in mental healthcare. Furthermore, SHAP and LIME alone do not guarantee clinical interpretability without physician validation.

### Paper 2: Toward Explainable AI (XAI) for Mental Health Detection Based on Language Behavior
* **Authors:** Elma Kerz, Sourabh Zanwar, Yu Qiao, and Daniel Wiechmann
* **Data Sources:** Social media clinical text datasets extracted from online platforms (Reddit, Twitter, and mental health forums).
* **Methodology:** Tested multiple traditional classifiers (SVM, Random Forest, Decision Tree, Logistic Regression, Naïve Bayes) and deep learning models (BERT) combined with SHAP and LIME to explain key linguistic feature weights.
* **Key Results:** Deep learning models (BERT) showed superior language-parsing capability, while local SHAP attributions successfully identified specific depression-indicative words and syntactic structures.
* **Research Gaps:** The models rely on privacy-sensitive social media data, which limits clinical utility. Additionally, there is a critical need for cross-cultural and multilingual validation, as language markers vary globally.

### Paper 3: Mental Health Diagnosis: A Case for Explainable Artificial Intelligence
* **Authors:** G. Antoniou, E. Papadakis, and G. Baryannis (UK NHS-based study)
* **Data Sources:** 500 adult ADHD patient clinical cases collected from the UK National Health Service (NHS).
* **Methodology:** Developed a Hybrid Model combining a machine learning binary classifier with an expert knowledge-based rule system. 
* **Key Results:** The hybrid approach achieved a high diagnostic classification accuracy of **98%** while incorporating expert clinical rules to resolve conflicting AI predictions.
* **Research Gaps:** The rule-based component scales poorly when applied to multiple overlapping mental health conditions (such as comorbid depression and anxiety), and there is a lack of standard quantitative metrics to evaluate the explanation quality.

### Paper 4: Explainable Artificial Intelligence Approaches for Predicting Depression by Combining Feature Selection Methods and Machine Learning Classifiers
* **Authors:** Min Gyeong Kim, Kun Chang Lee, Kwanho Lee, Hyung Uk Kim, Young Wook Seo, and Seong Wook Chae
* **Data Sources:** National Mental Health Survey of Korea (2021) dataset containing clinical profiles of 5,511 adults.
* **Methodology:** Tested feature selection methods (ReliefF, Markov Blanket, CFS) paired with multiple machine learning classifiers and SHAP-based local explainability.
* **Key Results:** The ReliefF feature selection method combined with a Stacking Ensemble classifier achieved the best performance with an **F2-Score of 98.51%**. The SHAP analysis identified loneliness, social distress, and quality of life indicators as the most dominant risk factors.
* **Research Gaps:** The study did not perform cross-cultural validation. Furthermore, it suffered from potential circular reasoning since some feature attributes were directly derived from diagnostic questionnaire inputs.

### Paper 5: A Multimodal Fairness-Aware Machine Learning Framework for Mental Health Risk Prediction in University Students
* **Authors:** Zhu Tian, Jian Zhang, and Xia Wang
* **Data Sources:** Survey data collected from 14,604 university students across 24 academic institutions.
* **Methodology:** Proposed the BD-MHAM (Bi-directional Multimodal Fairness-Aware Machine Learning) framework to predict student mental health risks while using SHAP to analyze demographic influences.
* **Key Results:** The framework achieved an **AUC of 0.972, a classification accuracy of 95.6%, and an F1-Score of 0.928** while reducing prediction bias across demographic subgroups.
* **Research Gaps:** The study was limited to academic environments and relied heavily on student self-reports, lacking integration of physical physiological markers or vocal acoustic vectors.

### Paper 6: An Explainable Multimodal Deep Learning Approach for Stress Detection in Emotion-Aware Systems
* **Authors:** Sai H. Prajwal, Sofia Singh, and Dipti Theng
* **Data Sources:** The public WESAD (Wearable Stress and Affect Detection) dataset containing physiological signals from 15 subjects.
* **Methodology:** Developed an explainable framework for stress detection using Random Forest classifiers, SHAP attributions, and wavelet-based Heart Rate Variability (HRV) feature extraction.
* **Key Results:** The physiological-based stress classifier achieved an overall classification accuracy of **83%**.
* **Research Gaps:** The dataset size was extremely small (15 participants), limiting generalization. The framework lacked multimodal integration with behavioral or speech-based indicators.

### Paper 7: Epidemiology of Common Mental Disorders (CMDs) in India — NMHS 2015–16
* **Authors:** Pavithra Jayasankar, Narayana Manjunatha, Girish N. Rao, and the NMHS India Collaborator Group
* **Data Sources:** National Mental Health Survey (NMHS) India database covering representative adult populations (18+) across multiple states.
* **Methodology:** Conducted structured assessments using the MINI v6.0.0 (Mini International Neuropsychiatric Interview) clinical criteria paired with multiple logistic regression analysis.
* **Key Results:** The study revealed a massive mental health treatment gap in India. Higher prevalence rates of common mental disorders were identified among middle-aged populations, females, urban dwellers, and individuals suffering from economic insecurity.
* **Research Gaps:** The research did not incorporate computational ML modeling, focusing strictly on retrospective epidemiological statistics.

### Paper 8: Family Mental Health in India — A Systematic Review (2015–2025)
* **Authors:** Justin Raj, Nishant Goyal, and Senthil M.
* **Data Sources:** Systematic review of 50 Indian studies published between 2015 and 2025.
* **Methodology:** Qualitative and meta-analysis synthesis of cross-sectional, longitudinal, and qualitative studies focusing on domestic dynamics.
* **Key Results:** The review established that family structures (joint vs. nuclear), family conflicts, caregiving burdens, stigma, and gender roles play a major role in shaping clinical depression and anxiety outcomes in India.
* **Research Gaps:** There was no translation of these psychosocial family indicators into structured machine learning pipelines or screening software interfaces.

---

## 2.2 Overall Research Gaps

An evaluation of the current state of the art highlights three primary research gaps:

1. **Lack of Multimodal Integration:** Traditional models focus on either text, audio, or physiological sensors in isolation. Few frameworks combine clinical questionnaires (PHQ-9/GAD-7) with objective voice analysis and family environment features into a unified prediction pipeline.
2. **Abstract Explainability:** While models utilize SHAP or LIME, the output graphs are rarely translated into simplified clinical reports that doctors can verify. There is a lack of translation from raw feature mathematical weights into actionable clinical dashboards.
3. **Absence of Socio-Cultural Context:** Most diagnostic models are trained on Western demographic data. They completely ignore family support dynamics, economic stress parameters, and loneliness indices that are highly specific to the social fabric of the Indian population.

---

## 2.3 Proposed Innovative Solution: MindTone
To bridge these gaps, **MindTone** introduces an explainable multimodal framework that combines structured clinical questionnaires (PHQ-9/GAD-7), objective voice acoustic analysis (via `librosa`), and dedicated psychosocial indices (family dynamics, family structure, and loneliness). By applying **CatBoost** modeling and mapping feature weights using **SHAP**, MindTone exports a visual clinical PDF report, providing transparent, localized, and socio-culturally calibrated mental health screenings.

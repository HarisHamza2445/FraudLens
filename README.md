# FraudLens — The Living Threat Shield for Digital Payments

**FraudLens** is an intelligent, multi-modal UPI fraud detection platform that analyzes suspicious **SMS/WhatsApp messages**, **phishing URLs**, and **QR-code payment requests**, classifying them as **Safe**, **Suspicious**, or **High Risk** — with clear, human-readable explanations and a ready-to-file 1930 cybercrime report.

It combines a **custom TF-IDF + Naive Bayes machine-learning classifier**, **rule-based heuristic detectors**, **Explainable AI (XAI)**, and an immersive real-time **Three.js WebGL threat core**.

---

## Key Features

1. **3D Reactive WebGL Threat Shield (Three.js)**
   A cybernetic core that morphs in real time based on the detected threat level:
   - **Safe (0–30)** — calming emerald orbital rings and shield matrix
   - **Suspicious (31–70)** — amber hazard pulse with concentric rings
   - **High Risk (71–100)** — glitching crimson core with an alert particle vortex

2. **Reverse-Debit UPI QR Trap Detector**
   Flags `upi://pay` requests that fraudsters send while claiming the victim will *"receive money/cashback"*, warning that entering the UPI PIN will **deduct** funds instead.

3. **Machine-Learning Pipeline (custom JS)**
   A TF-IDF vectorizer + Multinomial Naive Bayes classifier trained on an authentic Indian UPI scam corpus (English & Hinglish). Live token-feature importance shows the exact words that triggered the model.

4. **Explainable AI & 1930 Cybercrime Drafter**
   Synthesizes social-engineering vectors (fear of loss, false urgency, authority impersonation) and generates a pre-formatted incident report for the National Cyber Crime Portal (`1930` / `cybercrime.gov.in`).

5. **Live Threat Intelligence**
   A real-time telemetry bar and an auto-rotating threat feed (sourced from the audit engine) integrated into the navigation.

6. **Scenario Playbook**
   Interactive, pre-configured attack scenarios you can run through the detection engine with a single click.

---

## Component Architecture

```
frontend/src/
├── App.jsx                      # Router + global navbar/footer + page transitions
├── pages/
│   ├── LandingDashboard.jsx     # Cinematic hero, live metrics, modules, playbook
│   ├── MessagePage.jsx          # SMS / WhatsApp analyzer
│   ├── URLPage.jsx              # Phishing link scanner
│   ├── QRPage.jsx               # QR image upload + camera + raw UPI parser
│   ├── HistoryPage.jsx          # Audit trail search/filter/export
│   └── ModelPage.jsx            # ML model inspector
└── components/
    ├── Navbar.jsx               # Nav + live threat ticker
    ├── ThreatTicker.jsx         # Auto-rotating live threat intel feed
    ├── HeroSection.jsx          # Full-viewport cinematic hero
    ├── AuroraBackground.jsx     # Animated aurora gradient blobs
    ├── LiveMetricsBar.jsx       # Real-time scan metrics from /api/stats
    ├── ThreeThreatShield.jsx    # Interactive Three.js threat core
    ├── MessageAnalyzer.jsx      # NLP & ML text scanner (Hinglish supported)
    ├── URLAnalyzer.jsx          # Typosquatting & domain entropy scanner
    ├── QRScanner.jsx            # Camera + upload + UPI intent parser
    ├── RiskScore.jsx / RiskMeter.jsx
    ├── DetectionReasons.jsx / AIExplanation.jsx
    ├── ScenarioPlaybook.jsx     # Pre-configured attack scenarios
    ├── LiveMetricsBar.jsx       # Live scan statistics
    └── Reveal.jsx               # Reusable scroll-reveal animation toolkit
```

---

## Getting Started

### 1. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Start the backend API (port 5005)

```bash
cd backend && npm start
```

Endpoints:
- `POST /api/analyze/message`
- `POST /api/analyze/url`
- `POST /api/analyze/qr`
- `GET /api/history`
- `GET /api/stats`
- `GET /api/health`

### 3. Start the frontend (port 5173)

```bash
cd frontend && npm run dev
```

Open `http://localhost:5173`. The Vite dev server proxies `/api` requests to the backend automatically.

---

## Demo Test Scenarios

| Scenario | Input Sample | Expected Result |
| :--- | :--- | :--- |
| **Electricity Disconnection Threat** | `"Dear consumer your electricity power will be disconnected tonight at 9:30 PM..."` | **High Risk (92/100)** |
| **Reverse-Debit QR Trap** | `upi://pay?pa=rewards@okhdfcbank&am=4999` (expected action: "Receive") | **High Risk (98/100)** · PIN alert |
| **Fake SBI KYC Phishing** | `http://sbi-pan-kyc-verify.vip` | **High Risk** · typosquatting alert |
| **Genuine Merchant Order** | `upi://pay?pa=swiggy.food@icici&mc=5812&am=380` | **Safe (12/100)** |

---

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, Three.js, React Router
- **Backend:** Node.js, Express
- **ML:** Custom JS TF-IDF + Multinomial Naive Bayes classifier
- **QR decoding:** jsQR (camera + image upload)

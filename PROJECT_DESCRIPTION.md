# FraudLens — Project Description & Tech Stack

## 1. What the project is

**FraudLens** is a full-stack, multi-modal fraud-detection platform for Indian **UPI** (Unified Payments Interface) users. It scans three real attack vectors — **SMS/WhatsApp messages**, **phishing URLs**, and **QR-code payment requests** — and classifies each as **Safe / Suspicious / High Risk** with a plain-language risk score, a human explanation, and a ready-to-file **cybercrime (1930 National Cyber Crime Portal) report**.

It targets the exact scams facing hundreds of millions of UPI users: fake "KYC blocked" messages, "your electricity will be disconnected at 9:30 PM" SMS, "scan to receive cashback" **reverse-debit QR traps**, typosquatted banking domains, and trojan `.apk` deliveries.

---

## 2. Architecture

```
┌────────────── FRONTEND (React + Vite, port 5173) ──────────────┐
│ Pages: Dashboard · Message · URL Scanner · QR Chamber ·        │
│        Audit History · (Model inspector route)                 │
│ Components: HeroSection (3D), Navbar, ThreatTicker,            │
│             LiveMetricsBar, MessageAnalyzer, URLAnalyzer,      │
│             QRScanner, ThreeThreatShield, AIExplanation,       │
│             RiskMeter, ScenarioPlaybook (attack scenarios)    │
└──────────────┬─────────────────────────────────────────────────┘
               │  HTTP → /api/* (Vite proxy)
┌──────────────▼────────────── BACKEND (Express, port 5005) ─────┐
│  /api/analyze/message  → ML classifier + heuristic NLP         │
│  /api/analyze/url      → typosquat / entropy / apk detector    │
│  /api/analyze/qr       → UPI intent parser (reverse-debit)     │
│  /api/history          → audit log (persisted JSON)            │
│  /api/stats            → real-time telemetry                   │
│  Cross-cutting: Groq LLM explanations, rate limiting,          │
│                 input validation, CORS                        │
└────────────────────────────────────────────────────────────────┘
```

---

## 3. The AI/ML intelligence (3 cooperating layers)

### A. Machine Learning — custom TF-IDF + Multinomial Naive Bayes
Written **from scratch in JavaScript** (`ml_engine/classifier.js`), no heavy ML framework:
- Tokenizes (lowercase, strip URLs, remove English + **Hinglish** stopwords).
- Computes IDF weights → rare scam words matter more.
- Predicts Safe/Suspicious/High Risk via log-posteriors + **Laplace smoothing**.
- **Critical hack:** a `HIGH_RISK_TRIGGERS` table multiplies the weight of scam-critical tokens (`upi pin` ×5, `apk` ×4.5, `disconnected` ×3.8, `kyc` ×3.6, `scan qr` ×3.5) to bias the model toward real scam vocabulary.
- Outputs a 0–100 score plus `contributingTokens` (which words fired) → this feeds the explainable layer.

### B. Heuristic / rule-based detectors
Hand-coded pattern engines catching fingerprints the statistical model might miss:
- `nlpDetector.js` — electricity-disconnection phrasing, personal mobile numbers, KYC-suspension keywords.
- `urlDetector.js` — brand typosquatting (Levenshtein distance), risky TLDs (`.vip`/`.top`), raw-IP links, `.apk` downloads, URL entropy.
- `upiQrDetector.js` — parses `upi://pay`/`upi://collect` intents and flags **reverse-debit traps** (a "receive/cashback" request that is actually a debit with a hard-coded amount).

### C. Explainable AI (XAI) + Live Groq LLM
- `aiExplainer.js` — rule-based plain-English explanation + formatted **1930 complaint draft**.
- `groqClient.js` — when a `GROQ_API_KEY` is set, calls the **Groq** Llama/Qwen LLM via native `fetch` (no extra dependency) to rewrite the explanation fluently (summary, psychological tactics, immediate action, safety takeaway). **Auto-falls back** across models, then to rule-based XAI, so it never breaks. The UI shows an **"LLM-Generated Reasoning" vs "Rule-Based Reasoning"** badge.

### Fusion (server.js)
```
ML score (45%) + Heuristic score (55%)  →  weighted fusion
      + critical-flag override → force High Risk
      → score + classification + flags
      → XAI / LLM explanation + 1930 draft
```

---

## 4. Technology stack — used, and why

### Frontend
| Tech | Used for | Why |
|---|---|---|
| **React 18** | All UI (components, state) | Industry standard, fast component-based UI, huge ecosystem |
| **Vite** | Build tool, dev server, `/api` proxy | Instant reload + fast builds + easy code-splitting |
| **Tailwind CSS** | All styling / glassmorphism / animation | Ship a polished UI fast without handwritten CSS |
| **Three.js** | Interactive 3D threat shield that reacts to risk | The visual "wow factor" — a physical, reactive centerpiece |
| **Framer Motion** | Scroll reveals, stagger, hero/transition/page animations | Premium, smooth product feel judges remember |
| **React Router** | Multi-page routing | A real navigable product, not one demo screen |
| **jsQR** | Decode QR from camera / image upload | Solves the reverse-debit QR problem hands-on |
| **lucide-react** | Icons | Clean, consistent iconography |
| **canvas-confetti** | Safe-scan celebration | Micro-delight reinforcing correct results |

### Backend
| Tech | Why |
|---|---|
| **Node.js + Express** | One language full-stack, lightweight REST API, trivial to run |
| **CORS** | Lets frontend (5173) call API (5005) in dev |
| **dotenv** | Secure env config (port, CORS origin, API key) |

### ML / AI
| Tech | Why |
|---|---|
| **Custom TF-IDF + Naive Bayes (JS)** | Runs natively in the same Node process — proves algorithm understanding, one-command demo, no Python service |
| **Heuristic detectors (JS)** | Catch known scam fingerprints statistically-hard cases |
| **Groq LLM API** | Fluent, human explanations via native `fetch` (no SDK); graceful model + XAI fallback |

### DevOps / project hygiene
| Tech | Why |
|---|---|
| **Node built-in test runner** (`node --test`) | 15 passing tests with zero extra deps |
| **Docker + docker-compose** | One-command deploy (frontend nginx, backend, data volume) |
| **React.lazy + Suspense code-splitting** | Main bundle cut from 995 kB → 313 kB; fast load |
| **Rate limiting / validation / .env** | Enterprise-grade reliability and security |

---

## 5. Why it's positioned to win

- **Problem relevance** — directly targets NPCI/CERT-In-flagged UPI scams; aligns with the national digital-fraud challenge.
- **WOW factor** — animated 3D shield, live threat ticker, real telemetry, cinematic hero. Judges remember it.
- **It actually works** — genuine ML + heuristics + XAI, 15 passing tests, persistence, live stats, live LLM explanations.
- **Finished product** — Docker-deployable, code-split bundle, rate limiting, clean branding, documented.
- **Demo-able in 60 seconds** — an "Attack Playbook" lets judges click a real scam scenario and watch it get flagged live with an AI explanation and 1930 report.

### One-line pitch
> *"FraudLens is a hybrid ML + explainable-AI system that intercepts real UPI fraud — from electricity-disconnection SMS to reverse-debit QR traps — with a live 3D threat core, real-time telemetry, and a one-click 1930 cybercrime report."*

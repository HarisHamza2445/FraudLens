import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { mlClassifier } from './ml_engine/classifier.js';
import { analyzeMessageHeuristics } from './services/nlpDetector.js';
import { analyzeUrlSafety } from './services/urlDetector.js';
import { analyzeUPIPayload } from './services/upiQrDetector.js';
import { generateAIExplanation } from './services/aiExplainer.js';
import { buildAIExplanation } from './services/groqClient.js';
import { storage } from './services/storage.js';

const app = express();
const PORT = process.env.PORT || 5005;

// Lightweight in-memory rate limiter (60 requests / 15 min per client IP)
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 60;
const requests = new Map();

function rateLimiter(req, res, next) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  const hits = (requests.get(ip) || []).filter((t) => t > windowStart);
  if (hits.length >= RATE_LIMIT_MAX) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }
  hits.push(now);
  requests.set(ip, hits);
  next();
}

// Allow all origins in dev, or restrict via CORS_ORIGIN env (comma-separated)
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin: allowedOrigins.length
    ? (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
        return cb(new Error('Not allowed by CORS'));
      }
    : true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '256kb' }));
app.use('/api/analyze', rateLimiter);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'FraudLens UPI Scam Detection & Risk Analysis System',
    timestamp: new Date().toISOString(),
    engine: 'Hybrid ML + Rule-based + Explainable AI'
  });
});

// 1. Analyze Message (SMS / WhatsApp / Hinglish)
app.post('/api/analyze/message', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text message is required' });
    }
    if (text.length > 5000) {
      return res.status(400).json({ error: 'Message too long (max 5000 characters)' });
    }
    if (!text.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    // Step A: ML Classifier Prediction (TF-IDF + Naive Bayes)
    const mlResult = mlClassifier.predict(text);

    // Step B: Rule-based Heuristic NLP
    const heuristicResult = analyzeMessageHeuristics(text);

    // Step C: Weighted Fusion of ML + Heuristics
    // Override to High-Risk when a critical (PIN/electricity/APK) flag fires,
    // or when multiple independent high-risk scam signatures stack up.
    let finalScore = Math.round(mlResult.score * 0.45 + heuristicResult.heuristicScore * 0.55);
    const flags = heuristicResult.detectedFlags;
    const highRiskSignal =
      flags.some(f => f.severity === 'critical') ||
      flags.filter(f => f.severity === 'high').length >= 2;

    if (highRiskSignal && finalScore < 75) {
      finalScore = Math.max(finalScore, 85);
    }

    finalScore = Math.min(Math.max(finalScore, 5), 98);

    let classification = 'Safe';
    if (finalScore >= 70) {
      classification = 'High Risk';
    } else if (finalScore >= 35) {
      classification = 'Suspicious';
    }

    // Step D: AI Explanation & 1930 Draft (LLM-enriched with local XAI fallback)
    const aiExplanation = await buildAIExplanation({
      type: 'message',
      input: text,
      riskScore: finalScore,
      classification,
      flags: heuristicResult.detectedFlags
    }, generateAIExplanation({
      type: 'message',
      input: text,
      riskScore: finalScore,
      classification,
      flags: heuristicResult.detectedFlags
    }));

    // Step E: Save to History
    const historyEntry = storage.addRecord({
      type: 'message',
      title: heuristicResult.detectedFlags[0]?.title || (classification === 'Safe' ? 'Legitimate Message' : 'Suspicious Message'),
      preview: text.length > 80 ? text.slice(0, 80) + '...' : text,
      riskScore: finalScore,
      classification,
      category: heuristicResult.tactics[0] || 'SMS / Chat'
    });

    return res.json({
      type: 'message',
      input: text,
      riskScore: finalScore,
      classification,
      confidence: mlResult.confidence,
      flags: heuristicResult.detectedFlags,
      tactics: heuristicResult.tactics,
      mlBreakdown: {
        probabilities: mlResult.probabilities,
        contributingTokens: mlResult.contributingTokens,
        metrics: mlResult.metrics
      },
      aiExplanation,
      recordId: historyEntry.id
    });
  } catch (err) {
    console.error('Error analyzing message:', err);
    res.status(500).json({ error: 'Failed to analyze message', details: err.message });
  }
});

// 2. Analyze URL / Phishing Link
app.post('/api/analyze/url', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL is required' });
    }
    if (url.length > 2048) {
      return res.status(400).json({ error: 'URL too long (max 2048 characters)' });
    }

    const urlResult = analyzeUrlSafety(url);

    const aiExplanation = await buildAIExplanation({
      type: 'url',
      input: url,
      riskScore: urlResult.riskScore,
      classification: urlResult.classification,
      flags: urlResult.flags
    }, generateAIExplanation({
      type: 'url',
      input: url,
      riskScore: urlResult.riskScore,
      classification: urlResult.classification,
      flags: urlResult.flags
    }));

    const historyEntry = storage.addRecord({
      type: 'url',
      title: urlResult.flags[0]?.title || (urlResult.classification === 'Safe' ? 'Legitimate Domain' : 'Suspicious Link'),
      preview: url,
      riskScore: urlResult.riskScore,
      classification: urlResult.classification,
      category: 'Phishing / Link'
    });

    return res.json({
      type: 'url',
      input: url,
      ...urlResult,
      aiExplanation,
      recordId: historyEntry.id
    });
  } catch (err) {
    console.error('Error analyzing URL:', err);
    res.status(500).json({ error: 'Failed to analyze URL', details: err.message });
  }
});

// 3. Analyze QR Code / UPI Intent
app.post('/api/analyze/qr', async (req, res) => {
  try {
    const { qrContent, userContext } = req.body;
    if (!qrContent || typeof qrContent !== 'string') {
      return res.status(400).json({ error: 'QR code content or UPI string is required' });
    }
    if (qrContent.length > 2048) {
      return res.status(400).json({ error: 'QR content too long (max 2048 characters)' });
    }

    const qrResult = analyzeUPIPayload(qrContent, userContext || {});

    const aiExplanation = await buildAIExplanation({
      type: 'qr',
      input: qrContent,
      riskScore: qrResult.riskScore,
      classification: qrResult.classification,
      flags: qrResult.flags,
      parsedData: qrResult.parsedData
    }, generateAIExplanation({
      type: 'qr',
      input: qrContent,
      riskScore: qrResult.riskScore,
      classification: qrResult.classification,
      flags: qrResult.flags,
      parsedData: qrResult.parsedData
    }));

    const historyEntry = storage.addRecord({
      type: 'qr',
      title: qrResult.flags[0]?.title || (qrResult.classification === 'Safe' ? 'Verified UPI QR' : 'Suspicious UPI QR'),
      preview: qrContent.length > 80 ? qrContent.slice(0, 80) + '...' : qrContent,
      riskScore: qrResult.riskScore,
      classification: qrResult.classification,
      category: qrResult.parsedData?.isDebitIntent ? 'UPI Payment' : 'QR Code'
    });

    return res.json({
      type: 'qr',
      input: qrContent,
      ...qrResult,
      aiExplanation,
      recordId: historyEntry.id
    });
  } catch (err) {
    console.error('Error analyzing QR:', err);
    res.status(500).json({ error: 'Failed to analyze QR code', details: err.message });
  }
});

// 4. Get Scanned History
app.get('/api/history', (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  res.json(storage.getAll(limit));
});

// 5. Get Real-time Statistics
app.get('/api/stats', (req, res) => {
  res.json(storage.getStats());
});

app.listen(PORT, () => {
  console.log(`[FraudLens Backend] Listening on http://localhost:${PORT}`);
  console.log(`[FraudLens ML] Loaded TF-IDF + Naive Bayes Classifier with ${mlClassifier.docCount} training docs.`);
});

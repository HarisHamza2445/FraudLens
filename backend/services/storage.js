/**
 * FraudLens: Data Persistence & Historical Analysis Store
 * Compatible with MongoDB schemas, with automatic in-memory & JSON file fallback.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const HISTORY_FILE = path.join(__dirname, 'history.json');

class AnalysisStorage {
  constructor() {
    this.history = [];
    this.loadHistory();
    this.seedDefaultsIfEmpty();
  }

  loadHistory() {
    try {
      if (fs.existsSync(HISTORY_FILE)) {
        const raw = fs.readFileSync(HISTORY_FILE, 'utf8');
        this.history = JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Could not read history.json, starting with empty array:', err.message);
      this.history = [];
    }
  }

  saveHistory() {
    try {
      fs.writeFileSync(HISTORY_FILE, JSON.stringify(this.history.slice(0, 100), null, 2), 'utf8');
    } catch (err) {
      console.warn('Could not write history.json:', err.message);
    }
  }

  seedDefaultsIfEmpty() {
    if (this.history.length === 0) {
      this.history = [
        {
          id: 'FL-2026-001',
          type: 'message',
          title: 'Fake Electricity Disconnection SMS',
          preview: 'Dear consumer your electricity power will be disconnected tonight at 9:30 PM...',
          riskScore: 92,
          classification: 'High Risk',
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          category: 'Utility Scam'
        },
        {
          id: 'FL-2026-002',
          type: 'qr',
          title: 'Reverse-Debit Cashback QR',
          preview: 'upi://pay?pa=cashback-rewards@okhdfcbank&pn=GPayCashback&am=4999',
          riskScore: 96,
          classification: 'High Risk',
          timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
          category: 'Reverse QR Trap'
        },
        {
          id: 'FL-2026-003',
          type: 'url',
          title: 'SBI Phishing Portal',
          preview: 'http://sbi-pan-kyc-verify.vip',
          riskScore: 88,
          classification: 'High Risk',
          timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
          category: 'Phishing'
        },
        {
          id: 'FL-2026-004',
          type: 'qr',
          title: 'Verified Merchant QR (Swiggy)',
          preview: 'upi://pay?pa=swiggy.food@icici&pn=Swiggy&mc=5812',
          riskScore: 12,
          classification: 'Safe',
          timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
          category: 'Legitimate Merchant'
        }
      ];
      this.saveHistory();
    }
  }

  addRecord(record) {
    const newEntry = {
      id: `FL-${Date.now().toString(36).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      ...record
    };
    this.history.unshift(newEntry);
    this.saveHistory();
    return newEntry;
  }

  getAll(limit = 20) {
    return this.history.slice(0, limit);
  }

  getStats() {
    const total = this.history.length;
    if (total === 0) {
      return { total: 0, safe: 0, suspicious: 0, highRisk: 0, safePct: 0, highRiskPct: 0 };
    }

    const safe = this.history.filter(h => h.classification === 'Safe').length;
    const suspicious = this.history.filter(h => h.classification === 'Suspicious').length;
    const highRisk = this.history.filter(h => h.classification === 'High Risk').length;

    return {
      total,
      safe,
      suspicious,
      highRisk,
      safePct: Math.round((safe / total) * 100),
      suspiciousPct: Math.round((suspicious / total) * 100),
      highRiskPct: Math.round((highRisk / total) * 100)
    };
  }
}

export const storage = new AnalysisStorage();

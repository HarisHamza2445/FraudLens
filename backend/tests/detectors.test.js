/**
 * FraudLens detector unit tests.
 * Run with: node --test tests/
 *
 * Uses Node's built-in test runner (Node 18+) — no external dependencies.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { analyzeMessageHeuristics } from '../services/nlpDetector.js';
import { analyzeUrlSafety } from '../services/urlDetector.js';
import { analyzeUPIPayload, parseUPIString } from '../services/upiQrDetector.js';
import { mlClassifier } from '../ml_engine/classifier.js';

describe('Message Heuristic Detector (nlpDetector)', () => {
  it('flags electricity disconnection SMS as high risk', () => {
    const res = analyzeMessageHeuristics(
      'Dear consumer your electricity power will be disconnected tonight at 9:30 PM. Contact officer at 9876543210'
    );
    assert.equal(res.heuristicScore, 100);
    assert.ok(res.detectedFlags.some((f) => f.type === 'ELECTRICITY_DISCONNECTION_SCAM'));
  });

  it('flags reverse-debit / PIN trap messaging', () => {
    const res = analyzeMessageHeuristics('Scan this QR to receive your cashback refund. Enter UPI PIN to approve.');
    assert.equal(res.heuristicScore, 45);
    assert.ok(res.detectedFlags.some((f) => f.type === 'LOTTERY_REFUND_BAIT'));
  });

  it('leaves a normal bank alert with no flags', () => {
    const res = analyzeMessageHeuristics(
      'Sent Rs 450.00 from HDFC Bank A/c XX4019 to Swiggy via UPI Ref No 429104928172. Available balance Rs 24,190.00.'
    );
    assert.equal(res.heuristicScore, 0);
    assert.equal(res.detectedFlags.length, 0);
  });
});

describe('URL Phishing Detector (urlDetector)', () => {
  it('flags typosquatted banking domains', () => {
    const res = analyzeUrlSafety('http://sbi-pan-kyc-verify.vip');
    assert.equal(res.classification, 'High Risk');
    assert.ok(res.flags.some((f) => f.title.includes('Brand Impersonation')));
  });

  it('detects high-risk top-level domains used for phishing', () => {
    const res = analyzeUrlSafety('http://sbi-pan-kyc.vip');
    assert.ok(res.flags.some((f) => f.title.includes('High-Risk Top-Level Domain')));
  });

  it('flags direct Android APK download links as High Risk', () => {
    const res = analyzeUrlSafety('http://jio-5g-upgrade-secure.apk');
    assert.equal(res.classification, 'High Risk');
    assert.ok(res.flags.some((f) => f.title.includes('APK Payload')));
  });

  it('treats a known good domain as Safe', () => {
    const res = analyzeUrlSafety('https://www.sbi.co.in');
    assert.equal(res.classification, 'Safe');
  });
});

describe('UPI QR / Reverse-Debit Detector (upiQrDetector)', () => {
  it('parses a valid upi:// string', () => {
    const parsed = parseUPIString('upi://pay?pa=swiggy.food@icici&pn=Swiggy&am=380.00&mc=5812');
    assert.equal(parsed.params.pa, 'swiggy.food@icici');
    assert.equal(parsed.params.pn, 'Swiggy');
  });

  it('warns on "receive/cashback" reverse-debit trap with debit intent', () => {
    const res = analyzeUPIPayload(
      'upi://pay?pa=rewards-cashback-desk@okhdfcbank&am=4999.00&tn=CashbackRewardCreditApproved',
      { userContext: 'receive' }
    );
    assert.equal(res.riskScore, 99);
    assert.equal(res.classification, 'High Risk');
  });

  it('accepts a verified merchant QR as Safe', () => {
    const res = analyzeUPIPayload('upi://pay?pa=swiggy.food@icici&pn=Swiggy&mc=5812&am=380.00');
    assert.equal(res.classification, 'Safe');
  });
});

describe('ML Classifier (TF-IDF + Naive Bayes)', () => {
  it('returns a numeric score and classification structure', () => {
    const res = mlClassifier.predict('Your account will be blocked. Update KYC now.');
    assert.equal(typeof res.score, 'number');
    assert.ok(res.confidence >= 0 && res.confidence <= 1);
    assert.ok(Array.isArray(res.contributingTokens));
  });
});

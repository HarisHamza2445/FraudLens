/**
 * FraudLens LLM (Groq) explanation tests.
 * Runs against the live Groq client with a mocked fetch — no network or key needed.
 */
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { generateLLMExplanation, buildAIExplanation } from '../services/groqClient.js';
import { generateAIExplanation } from '../services/aiExplainer.js';

const LLM_JSON = JSON.stringify({
  summary: 'This SMS threatens immediate power disconnection and asks you to call a personal mobile number.',
  socialEngineeringTactics: ['Fear of essential service loss', 'Authority impersonation'],
  immediateAction: 'Do not call the number. Verify on the official portal.',
  keyTakeaway: 'Electricity boards never send personal SMS threatening same-night disconnection.',
});

function mockFetchOk() {
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({ choices: [{ message: { content: LLM_JSON } }] }),
  });
}

function mockFetchFail() {
  globalThis.fetch = async () => ({ ok: false, status: 500, text: async () => 'boom' });
}

describe('Groq LLM client (groqClient)', () => {
  beforeEach(() => { delete process.env.GROQ_API_KEY; });
  afterEach(() => { delete globalThis.fetch; });

  it('throws NO_KEY when no API key is configured', async () => {
    await assert.rejects(
      () => generateLLMExplanation({ type: 'message', input: 'x', riskScore: 90, classification: 'High Risk', flags: [] }),
      (err) => err.code === 'NO_KEY'
    );
  });

  it('parses a valid LLM response into a structured explanation', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    mockFetchOk();
    const out = await generateLLMExplanation({
      type: 'message', input: 'x', riskScore: 92, classification: 'High Risk', flags: [],
    });
    assert.equal(out.generatedByLLM, true);
    assert.match(out.summary, /power disconnection/);
    assert.equal(out.socialEngineeringTactics.length, 2);
  });

  it('buildAIExplanation falls back to local XAI on API failure', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    mockFetchFail();
    const local = generateAIExplanation({ type: 'message', input: 'x', riskScore: 92, classification: 'High Risk', flags: [] });
    const out = await buildAIExplanation(
      { type: 'message', input: 'x', riskScore: 92, classification: 'High Risk', flags: [] },
      local
    );
    assert.equal(out.generatedByLLM, false);
    assert.ok(out.complaintDraft); // local draft preserved
  });

  it('buildAIExplanation returns local XAI directly when no key set', async () => {
    const local = generateAIExplanation({ type: 'message', input: 'x', riskScore: 92, classification: 'High Risk', flags: [] });
    const out = await buildAIExplanation(
      { type: 'message', input: 'x', riskScore: 92, classification: 'High Risk', flags: [] },
      local
    );
    assert.equal(out.generatedByLLM, false);
  });
});

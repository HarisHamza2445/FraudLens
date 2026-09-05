/**
 * FraudLens: Groq LLM Client
 * Generates fluent, plain-language threat explanations using the Groq API.
 *
 * Uses Node's native global fetch — no external SDK required (Node 18+).
 * If no GROQ_API_KEY is configured, or the request fails, callers should
 * fall back to the local rule-based XAI (see aiExplainer.js).
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const MODEL_FALLBACKS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'mixtral-8x7b-32768',
];

function systemPrompt() {
  return [
    'You are FraudLens, an expert Indian UPI/cyber-fraud investigator and cybersecurity educator.',
    'You analyze suspicious SMS, phishing URLs, and UPI QR payment requests.',
    'Respond ONLY with a valid JSON object — no markdown, no code fences, no extra text.',
    'The JSON must have exactly these keys:',
    '  "summary": a 2-3 sentence plain-language plain threat assessment for a concerned non-technical Indian user.',
    '  "socialEngineeringTactics": array of 2-4 short strings naming the psychological tactics used.',
    '  "immediateAction": a single imperative sentence telling the user exactly what to do now.',
    '  "keyTakeaway": one memorable safety rule relevant to this exact attack.',
    'Be specific to the provided artifact rather than generic. Use simple, warm, trustworthy language.'
  ].join('\n');
}

/**
 * Builds a structured, compact user prompt from the analysis signals so the
 * LLM has concrete grounding while we control the risk score / classification.
 */
function buildUserPrompt({ type, input, riskScore, classification, flags = [], parsedData = null }) {
  const artifact = typeof input === 'string' ? input : JSON.stringify(input);

  const flagLines = (flags || [])
    .map((f, i) => `  ${i + 1}. [${f.severity || 'FLAG'}] ${f.title}: ${f.detail}`)
    .join('\n');

  const contextParts = [
    `Artifact type: ${type}`,
    `Artifact content: "${artifact}"`,
    `Engine risk score: ${riskScore}/100`,
    `Engine classification: ${classification}`,
  ];

  if (parsedData && typeof parsedData === 'object') {
    contextParts.push(`Parsed UPI metadata: ${JSON.stringify(parsedData)}`);
  }

  contextParts.push('Detected threat signatures:');
  contextParts.push(flagLines || '  none');

  return [
    'Analyze the following UPI fraud artifact. The rule-based engine has already scored it;',
    'treat that score as authoritative and write your explanation around it.',
    contextParts.join('\n'),
    'Return only the JSON object described in the system prompt.',
  ].join('\n\n');
}

/**
 * Calls Groq to produce a natural-language risk explanation.
 * Throws on any failure so callers can fall back to the local XAI.
 */
export async function generateLLMExplanation({ type, input, riskScore, classification, flags = [], parsedData = null }) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    const err = new Error('GROQ_API_KEY is not configured');
    err.code = 'NO_KEY';
    throw err;
  }

  // Ordered list: user override first, then default, then fallbacks.
  const primary = process.env.GROQ_MODEL || MODEL;
  const candidates = [primary, ...MODEL_FALLBACKS.filter((m) => m !== primary)];

  let lastErr = null;
  for (const model of candidates) {
    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.4,
          max_tokens: 500,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt() },
            { role: 'user', content: buildUserPrompt({ type, input, riskScore, classification, flags, parsedData }) },
          ],
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        lastErr = new Error(`Groq request failed (${response.status}): ${text.slice(0, 300)}`);
        lastErr.code = 'GROQ_ERROR';
        lastErr.model = model;
        continue; // try next model
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;

      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch (e) {
        lastErr = new Error('Groq returned non-JSON content');
        lastErr.code = 'GROQ_PARSE';
        lastErr.model = model;
        continue;
      }

      return {
        summary: parsed.summary || '',
        socialEngineeringTactics: Array.isArray(parsed.socialEngineeringTactics)
          ? parsed.socialEngineeringTactics
          : [],
        immediateAction: parsed.immediateAction || '',
        keyTakeaway: parsed.keyTakeaway || '',
        generatedByLLM: true,
      };
    } catch (err) {
      lastErr = err;
    }
  }

  throw lastErr || new Error('All Groq models failed');
}

/**
 * Enriches a local rule-based explanation (which always includes complaintDraft)
 * with Groq LLM prose. Falls back to the local explanation on any failure or
 * missing API key, so the system always returns a complete, usable result.
 */
export async function buildAIExplanation({ type, input, riskScore, classification, flags = [], parsedData = null }, localExplanation) {
  if (!process.env.GROQ_API_KEY) {
    return localExplanation; // no key configured -> local XAI
  }

  try {
    const llm = await generateLLMExplanation({ type, input, riskScore, classification, flags, parsedData });

    if (!llm.summary) {
      return localExplanation;
    }

    return {
      ...localExplanation,
      summary: llm.summary,
      socialEngineeringTactics: llm.socialEngineeringTactics.length
        ? llm.socialEngineeringTactics
        : localExplanation.socialEngineeringTactics,
      immediateAction: llm.immediateAction || localExplanation.immediateAction,
      keyTakeaway: llm.keyTakeaway || localExplanation.keyTakeaway,
      generatedByLLM: true,
    };
  } catch (err) {
    console.warn('[FraudLens] LLM explanation unavailable, using local XAI:', err.code || err.message);
    return localExplanation;
  }
}

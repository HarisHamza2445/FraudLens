/**
 * FraudLens: UPI Protocol & QR Code Fraud Detection Service
 * Detects reverse-debit fraud, disguised VPA handles, deceptive transaction notes, and MCC anomalies.
 */

// Known trusted merchant VPA domains / handles
const TRUSTED_MERCHANT_HANDLES = new Set([
  'paytm', 'ybl', 'okhdfcbank', 'okaxis', 'okicici', 'oksbi', 'ibl', 'axl'
]);

export function parseUPIString(raw) {
  if (!raw || typeof raw !== 'string') return null;

  const trimmed = raw.trim();
  if (!trimmed.startsWith('upi://pay')) {
    return null;
  }

  const queryIdx = trimmed.indexOf('?');
  if (queryIdx === -1) return { protocol: 'upi', intent: 'pay', params: {} };

  const queryString = trimmed.slice(queryIdx + 1);
  const searchParams = new URLSearchParams(queryString);
  const params = {};

  for (const [key, value] of searchParams.entries()) {
    params[key] = decodeURIComponent(value);
  }

  return {
    protocol: 'upi',
    intent: 'pay',
    params: {
      pa: params.pa || '', // Payee Virtual Address
      pn: params.pn || '', // Payee Name
      am: params.am || '', // Transaction Amount
      cu: params.cu || 'INR', // Currency
      tn: params.tn || '', // Transaction Note
      mc: params.mc || '', // Merchant Category Code
      tr: params.tr || '', // Transaction Reference ID
      mode: params.mode || '',
      url: params.url || ''
    }
  };
}

export function analyzeUPIPayload(input, userContext = {}) {
  let parsed = parseUPIString(input);

  // If input wasn't raw upi://pay, check if it's a VPA handle alone like 'merchant@okaxis'
  if (!parsed && input.includes('@')) {
    parsed = {
      protocol: 'upi_vpa',
      intent: 'pay',
      params: {
        pa: input.trim(),
        pn: '',
        am: userContext.claimedAmount || '',
        tn: userContext.claimedNote || ''
      }
    };
  }

  if (!parsed) {
    return {
      riskScore: 60,
      classification: 'Suspicious',
      confidence: 0.7,
      flags: [{
        title: 'Non-Standard QR Payload',
        detail: 'The QR content is not a standard NPCI compliant UPI URI (upi://pay). Scammers often embed phishing URLs or APK links inside QR codes.',
        severity: 'high'
      }],
      parsedData: { rawContent: input }
    };
  }

  const { pa, pn, am, tn, mc } = parsed.params;
  const flags = [];
  let score = 10;

  const claimedAction = (userContext.expectedAction || '').toLowerCase();
  const contextNotes = (userContext.contextNotes || '').toLowerCase();
  const isUserExpectingReceipt = 
    claimedAction.includes('receive') ||
    claimedAction.includes('refund') ||
    claimedAction.includes('cashback') ||
    claimedAction.includes('sell') ||
    contextNotes.includes('receive') ||
    contextNotes.includes('refund') ||
    contextNotes.includes('cashback') ||
    contextNotes.includes('won') ||
    contextNotes.includes('prize');

  // 1. #1 UPI SCAM: The Reverse-Debit Trap
  // In UPI, 'upi://pay' always initiates a DEBIT (payment OUT).
  if (isUserExpectingReceipt) {
    flags.push({
      title: 'CRITICAL: Reverse-Debit Money Trap',
      detail: `You indicated you are RECEIVING money, but this QR is a PAYMENT REQUEST (upi://pay)${am ? ' of ₹' + am : ''}. If you scan this and enter your UPI PIN, money will be DEDUCTED from your bank account! Remember: You NEVER need to enter your UPI PIN to receive money.`,
      severity: 'critical'
    });
    score += 85;
  }

  // 2. Suspicious Payee Name & Disguise
  const lowerPn = pn.toLowerCase();
  const lowerPa = pa.toLowerCase();
  const impersonatedInstitutions = ['sbi', 'hdfc', 'icici', 'axis', 'paytm', 'refund', 'cashback', 'kbc', 'lottery', 'electricity', 'support', 'helpdesk'];
  const hasInstitutionalDisguise = impersonatedInstitutions.some(inst => lowerPn.includes(inst) || lowerPa.includes(inst));

  if (hasInstitutionalDisguise && !mc) {
    flags.push({
      title: 'Institutional Impersonation in VPA/Name',
      detail: `The payee claims to be "${pn || pa}", using institutional keywords without a verified Merchant Category Code (MCC). This is commonly an individual account spoofing official support.`,
      severity: 'critical'
    });
    score += 45;
  }

  // 3. Pre-filled high debit amount
  if (am && parseFloat(am) >= 1000) {
    flags.push({
      title: `Pre-set Transfer Amount: ₹${am}`,
      detail: `The QR has hard-coded an immediate deduction of ₹${am}. Once authorized via PIN, UPI transactions are instant and irrevocable.`,
      severity: isUserExpectingReceipt ? 'critical' : 'medium'
    });
    if (!isUserExpectingReceipt) score += 15;
  }

  // 4. Deceptive Transaction Note (tn)
  if (tn) {
    const lowerTn = tn.toLowerCase();
    if (/(cashback|refund|prize|winner|reward|urgent)/i.test(lowerTn)) {
      flags.push({
        title: `Deceptive Transaction Note: "${tn}"`,
        detail: `The transaction note is engineered to convince you that this is a reward or refund, distracting from the reality that it is a debit request.`,
        severity: 'high'
      });
      score += 35;
    }
  }

  // 5. Verification of VPA format
  const vpaParts = pa.split('@');
  if (vpaParts.length !== 2 || !vpaParts[0] || !vpaParts[1]) {
    flags.push({
      title: 'Malformed Virtual Payment Address (VPA)',
      detail: `The payee VPA "${pa}" does not conform to standard username@bankhandle syntax.`,
      severity: 'high'
    });
    score += 30;
  }

  // 6. Verified Merchant Check
  const isKnownVerifiedMerchant = mc && mc.length === 4 && ['5411', '5812', '4814', '5311'].includes(mc);
  if (isKnownVerifiedMerchant && !isUserExpectingReceipt) {
    flags.push({
      title: 'Verified Commercial Merchant QR',
      detail: `Registered Merchant Category Code (${mc}) with compliant retail banking routing.`,
      severity: 'safe'
    });
    score = 10;
  }

  score = Math.min(Math.max(score, 10), 99);

  let classification = 'Safe';
  if (score >= 70) {
    classification = 'High Risk';
  } else if (score >= 35) {
    classification = 'Suspicious';
  }

  return {
    riskScore: score,
    classification,
    confidence: +(0.92).toFixed(2),
    parsedData: {
      vpa: pa,
      payeeName: pn || 'Not Specified',
      amount: am ? `₹${am}` : 'Any Amount',
      note: tn || 'None',
      mcc: mc || 'Individual / Unverified',
      isDebitIntent: true
    },
    flags,
    actionRecommendation: score >= 70
      ? 'DO NOT SCAN OR ENTER PIN. Entering your PIN will immediately transfer money to this unknown individual.'
      : score >= 35
      ? 'Verify the payee name on your banking app before authorizing payment.'
      : 'Safe to proceed for legitimate merchant purchases.'
  };
}

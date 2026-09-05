

export function generateAIExplanation({ type, input, riskScore, classification, flags = [], parsedData = null }) {
  let summary = '';
  let socialEngineeringTactics = [];
  let immediateAction = '';
  let legalNotice = '';

  if (classification === 'High Risk') {
    summary = `This ${type} contains indicators consistent with an active scam pattern (Risk Score: ${riskScore}/100). The mechanics match known techniques used to mislead UPI users via psychological pressure or inverted payment flows.`;
    immediateAction = 'Do not interact, do not click any links, do not install external APKs, and never enter your UPI PIN or share OTPs.';
    socialEngineeringTactics = [
      'Artificial urgency to prompt hasty action',
      'Impersonation of banking or utility authorities',
      'Reverse payment deception (framing a debit as a credit/refund)'
    ];
  } else if (classification === 'Suspicious') {
    summary = `Several irregular signals were detected in this ${type} (Risk Score: ${riskScore}/100). While not conclusively malicious, it deviates from standard official banking notifications.`;
    immediateAction = 'Verify independently through official bank websites or phone numbers printed on your card.';
    socialEngineeringTactics = [
      'Unsolicited contact channel',
      'Unverified redirection link'
    ];
  } else {
    summary = `This ${type} looks legitimate (Risk Score: ${riskScore}/100). Attributes align with standard transactional formats and no scam indicators were triggered.`;
    immediateAction = 'Safe to proceed. Remember that your UPI PIN is only needed when transferring money out.';
    socialEngineeringTactics = ['None detected'];
  }

  // Pre-formatted 1930 Cyber Crime Helpline Incident Report
  const complaintDraft = `=== CYBERCRIME INCIDENT REPORT (1930 / cybercrime.gov.in) ===
Category: Online Financial Fraud / UPI Deception
Generated: ${new Date().toISOString()}

1. SUSPECT EVIDENCE / ARTIFACT:
Type: ${type.toUpperCase()}
Payload / Content:
"${typeof input === 'string' ? input : JSON.stringify(input)}"

2. FRAUD RISK METRICS:
Overall Risk Assessment: ${classification} (${riskScore}/100)
Detected Threat Signatures:
${flags.map((f, i) => `  ${i + 1}. [${f.severity ? f.severity.toUpperCase() : 'FLAG'}] ${f.title}: ${f.detail}`).join('\n') || '  None'}

3. SUMMARY OF DECEPTION:
${summary}

4. SUGGESTED LAW ENFORCEMENT ACTION:
Request immediate blacklisting of associated VPA handles/domains across NPCI, CERT-In, and DoT (Department of Telecommunications) for SIM spoofing and unauthorized payment collection.
=============================================================================`;

  return {
    summary,
    socialEngineeringTactics,
    immediateAction,
    complaintDraft,
    keyTakeaway: classification === 'High Risk'
      ? 'UPI PIN is strictly a debit authorization key. You NEVER need to enter your PIN to receive money, cashback, or refunds.'
      : 'Banks and utility boards never threaten same-day disconnection or SIM deactivation via personal SMS.',
    generatedByLLM: false
  };
}

/**
 * FraudLens: NLP & Heuristic Scam Analysis Service
 * Detects psychological coercion, urgency triggers, fake authorities, and APK threats.
 */

export function analyzeMessageHeuristics(text) {
  if (!text || typeof text !== 'string') {
    return {
      heuristicScore: 0,
      detectedFlags: [],
      tactics: [],
      severity: 'safe'
    };
  }

  const lower = text.toLowerCase();
  const flags = [];
  const tactics = [];
  let penaltyScore = 0;

  // 1. Critical Reverse-Debit / PIN Trick (Highest Hazard)
  if (/enter (?:your )?(?:upi )?pin to receive/i.test(lower) || 
      /pin daale.*paise milenge/i.test(lower) || 
      /scan.*enter pin/i.test(lower)) {
    flags.push({
      type: 'CRITICAL_PIN_TRICK',
      severity: 'critical',
      title: 'Reverse-Debit PIN Trap',
      detail: 'Message instructs you to enter your UPI PIN to RECEIVE money. In UPI architecture, your PIN is strictly used to DEDUCT funds, never to receive funds.'
    });
    tactics.push('Reverse Payment Deception');
    penaltyScore += 65;
  }

  // 2. Electricity Disconnection Scam (Very widespread in India)
  if (/(electricity|bijli|power).*displaced|disconnect|line cut|aaj raat/i.test(lower) ||
      /(power|electricity).*will be disconnected.*(tonight|bill)/i.test(lower)) {
    flags.push({
      type: 'ELECTRICITY_DISCONNECTION_SCAM',
      severity: 'critical',
      title: 'Power Disconnection Scare',
      detail: 'Classic utility threat. State electricity boards (BESCOM, TNEB, MSEB, Tata Power) never send personal SMS asking you to call personal mobile numbers to avoid disconnection.'
    });
    tactics.push('Fear of Essential Service Loss');
    penaltyScore += 55;
  }

  // 3. Fake Bank Account / KYC Suspension
  if (/(account|pan|aadhaar|sim).*(blocked|suspended|deactivated|expire)/i.test(lower) ||
      /update.*(pan|kyc).*immediately/i.test(lower) ||
      /yono.*(blocked|suspended)/i.test(lower)) {
    flags.push({
      type: 'FAKE_KYC_EXPIRY',
      severity: 'high',
      title: 'Fake KYC / Account Suspension Threat',
      detail: 'Banks (SBI, HDFC, ICICI) and telecom operators never send SMS threatening suspension within hours or demanding document uploads via third-party web links.'
    });
    tactics.push('Urgency & Bank Impersonation');
    penaltyScore += 50;
  }

  // 4. Malicious APK File Link
  if (/\.apk\b/i.test(lower) || /download (?:this )?app from/i.test(lower)) {
    flags.push({
      type: 'MALICIOUS_APK_DOWNLOAD',
      severity: 'critical',
      title: 'Suspicious APK Payload Detected',
      detail: 'The message attempts to deliver an Android APK package. Fraudsters use malicious APKs (like fake AnyDesk, TeamViewer, or spoofed banking apps) to read OTPs and drain accounts.'
    });
    tactics.push('Trojan / Remote Access Delivery');
    penaltyScore += 60;
  }

  // 5. Lottery, Refund, or Fake Cashback
  if (/(kbc|lottery|lucky draw|cash prize|won|cashback)/i.test(lower) && 
      /(claim|scan|click|approve|congratulations)/i.test(lower)) {
    flags.push({
      type: 'LOTTERY_REFUND_BAIT',
      severity: 'high',
      title: 'Unsolicited Financial Bait / Cashback Trap',
      detail: 'Promises unearned cash rewards or cashback to manipulate victims into scanning QR codes or clicking malicious portals.'
    });
    tactics.push('Greed / Financial Baiting');
    penaltyScore += 45;
  }

  // 6. Urgency and Coercive Time Limits
  if (/(tonight|immediately|within 24 hours|turant|urgent|last warning|9:30 pm)/i.test(lower)) {
    flags.push({
      type: 'ARTIFICIAL_URGENCY',
      severity: 'medium',
      title: 'Artificial Urgency & Panic Induction',
      detail: 'Imposes short deadlines (e.g., "tonight at 9:30 PM", "within 24 hours") engineered to disable rational thinking and force hurried actions.'
    });
    tactics.push('Psychological Panic Induction');
    penaltyScore += 25;
  }

  // 7. Personal Mobile Number for Official Work
  const phoneMatches = text.match(/(?:\+91[\-\s]?)?[6-9]\d{9}/g);
  if (phoneMatches && phoneMatches.length > 0 && /(call|contact|officer|manager|helpline)/i.test(lower)) {
    flags.push({
      type: 'PERSONAL_MOBILE_SPOOF',
      severity: 'medium',
      title: 'Personal Mobile Routed as Official Helpline',
      detail: `Message asks victim to contact personal mobile number (${phoneMatches[0]}) instead of verified institutional toll-free 1800 numbers.`
    });
    tactics.push('Spoofed Direct Contact');
    penaltyScore += 20;
  }

  // 8. Part-time Job / Easy Money Scheme
  if (/part time|work from home|like youtube|rating hotels|earn \d{3,}|daily income|side hustle|instagram task|telegram task|youtube task|online task/i.test(lower) &&
      /(whatsapp|telegram|wa\.me|earn|task|registration fee|join)/i.test(lower)) {
    flags.push({
      type: 'TASK_INVESTMENT_SCAM',
      severity: 'high',
      title: 'Task-Based / Part-Time Job Scam',
      detail: 'Promises daily income for simple online tasks (YouTube likes, Instagram/Task apps) leading to Telegram prepaid investment traps.'
    });
    tactics.push('Prepaid Task Deception');
    penaltyScore += 50;
  }

  // 9. Pay-a-Fee to Receive Money / Parcel / Loan / Prize (Prepayment scam)
  if (/(pay|deposit|transfer|send) (?:rs|rs\.|\₹)?\s?\d+(?:\s?\.\s?\d+)?/i.test(lower) &&
      /(fee|to receive|to claim|prize|parcel|packet|courier|customs|loan sanctioned|release|processing)/i.test(lower)) {
    flags.push({
      type: 'PREPAYMENT_FEE_SCAM',
      severity: 'high',
      title: 'Advance-Fee / Prepayment Scam',
      detail: 'Asks you to pay an upfront fee (courier, customs, GST, registration, processing) to receive money, a parcel, a loan, or a prize. Legitimate organizations never require advance payment to release funds or goods.'
    });
    tactics.push('Advance-Fee Deception');
    penaltyScore += 45;
  }

  // 10. Suspicious risky TLD in raw text (typically phishing)
  if (/https?:\/\/[^\s]*(\.top|\.vip|\.live|\.win|\.xyz|\.click|\.info|\.buzz)\b/i.test(lower)) {
    flags.push({
      type: 'SUSPICIOUS_TLD',
      severity: 'high',
      title: 'Risky/Suspicious Domain Extension',
      detail: 'The embedded link uses a cheap, frequently-abused TLD (.top/.vip/.live/.xyz) that registered scammers often use for phishing portals disguised as banks or government sites.'
    });
    tactics.push('Typosquat / Fake Portal Redirect');
    penaltyScore += 40;
  }

  return {
    heuristicScore: Math.min(penaltyScore, 100),
    detectedFlags: flags,
    tactics: Array.from(new Set(tactics))
  };
}

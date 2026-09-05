/**
 * FraudLens: URL & Phishing Link Inspection Engine
 * Detects typosquatting, deceptive subdomains, suspicious TLDs, and IP address hosts.
 */

const TRUSTED_DOMAINS = [
  'onlinesbi.sbi',
  'sbi.co.in',
  'hdfcbank.com',
  'icicibank.com',
  'axisbank.com',
  'pnbindia.in',
  'bankofbaroda.in',
  'paytm.com',
  'phonepe.com',
  'google.com',
  'bhimupi.org.in',
  'npci.org.in',
  'rbi.org.in',
  'incometax.gov.in',
  'cybercrime.gov.in',
  'bescom.karnataka.gov.in'
];

const TARGETED_BRANDS = [
  'sbi', 'onlinesbi', 'yono', 'hdfc', 'icici', 'axis', 'pnb', 'bob',
  'paytm', 'phonepe', 'gpay', 'bhim', 'npci', 'aadhaar', 'uidai',
  'incometax', 'electricity', 'bescom', 'tneb', 'mseb', 'tatapower'
];

const SUSPICIOUS_TLDS = new Set([
  'vip', 'top', 'xyz', 'live', 'work', 'click', 'buzz', 'cfd',
  'link', 'gq', 'ml', 'cf', 'tk', 'icu', 'rest', 'monster', 'site', 'fun'
]);

function levenshteinDistance(s1, s2) {
  const m = s1.length;
  const n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

function calculateEntropy(str) {
  const map = {};
  for (let char of str) {
    map[char] = (map[char] || 0) + 1;
  }
  let entropy = 0;
  for (let char in map) {
    const p = map[char] / str.length;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

export function analyzeUrlSafety(inputUrl) {
  if (!inputUrl || typeof inputUrl !== 'string') {
    return {
      riskScore: 0,
      classification: 'Safe',
      reasons: ['No URL provided']
    };
  }

  let normalized = inputUrl.trim();
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = 'http://' + normalized;
  }

  let parsed;
  try {
    parsed = new URL(normalized);
  } catch (err) {
    return {
      riskScore: 75,
      classification: 'Suspicious',
      reasons: [{ title: 'Malformed URL', detail: 'URL syntax is invalid or obfuscated.', severity: 'high' }]
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  const pathname = parsed.pathname.toLowerCase();
  const flags = [];
  let score = 5;

  // 1. Check if it's already an exact trusted institutional domain
  const isDirectTrusted = TRUSTED_DOMAINS.some(td => hostname === td || hostname.endsWith('.' + td));
  if (isDirectTrusted) {
    return {
      url: normalized,
      hostname,
      riskScore: 5,
      classification: 'Safe',
      confidence: 0.98,
      isTrustedDomain: true,
      flags: [{
        title: 'Verified Official Domain',
        detail: `Matches authentic registered domain of ${hostname}.`,
        severity: 'safe'
      }],
      securityChecklist: {
        sslTls: parsed.protocol === 'https:',
        typosquattingSafe: true,
        reputableTLD: true,
        ipHostSafe: true
      }
    };
  }

  // 2. IP Address in Hostname
  const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
  if (isIpAddress) {
    flags.push({
      title: 'Raw IP Address Host',
      detail: `URL uses a raw IP address (${hostname}) instead of a registered domain name. Major red flag for temporary phishing command servers.`,
      severity: 'critical'
    });
    score += 50;
  }

  // 3. Suspicious / Abused TLD
  const domainParts = hostname.split('.');
  const tld = domainParts[domainParts.length - 1];
  if (SUSPICIOUS_TLDS.has(tld)) {
    flags.push({
      title: `High-Risk Top-Level Domain (.${tld})`,
      detail: `The .${tld} extension has a high statistical correlation with disposable cyber fraud infrastructure according to global threat intelligence.`,
      severity: 'high'
    });
    score += 35;
  }

  // 4. Typosquatting / Brand Name Impersonation in Hostname or Path
  let brandSpoofed = null;
  TARGETED_BRANDS.forEach(brand => {
    if (hostname.includes(brand)) {
      brandSpoofed = brand.toUpperCase();
    }
  });

  if (brandSpoofed && !isDirectTrusted) {
    flags.push({
      title: `Brand Impersonation (${brandSpoofed})`,
      detail: `The domain contains "${brandSpoofed}", but is not an official domain of this institution. Scammers create spoofed domains to harvest login credentials and OTPs.`,
      severity: 'critical'
    });
    score += 55;
  }

  // 5. Check Levenshtein Distance against genuine bank domains
  TRUSTED_DOMAINS.forEach(genuine => {
    const mainGenuine = genuine.split('.')[0];
    const mainInput = domainParts[domainParts.length - 2] || domainParts[0];
    const dist = levenshteinDistance(mainGenuine, mainInput);
    if (dist >= 1 && dist <= 2 && mainInput.length > 3) {
      flags.push({
        title: `Lookalike Typosquatting of ${genuine}`,
        detail: `The domain "${hostname}" is deceptively similar to legitimate portal "${genuine}" (Levenshtein distance: ${dist}).`,
        severity: 'critical'
      });
      score += 50;
    }
  });

  // 6. Dangerous keywords in URL (KYC, verify, update-pan, download)
  const phishingKeywords = ['kyc', 'update-pan', 'verify', 'yono', 'netbanking', 'cashback', 'refund', 'login', 'free-gift'];
  const matchedKeywords = phishingKeywords.filter(kw => hostname.includes(kw) || pathname.includes(kw));
  if (matchedKeywords.length > 0) {
    flags.push({
      title: `Phishing Lure Terminology (${matchedKeywords.join(', ')})`,
      detail: `URL path contains terms commonly weaponized in credential harvesting campaigns.`,
      severity: 'medium'
    });
    score += 20 * matchedKeywords.length;
  }

  // 7. APK or Executable download (path OR hostname — scammers host raw .apk in the domain)
  if (pathname.endsWith('.apk') || pathname.endsWith('.exe') || /\.apk$|\.exe$/i.test(hostname)) {
    flags.push({
      title: 'Direct Android APK Payload Download',
      detail: 'Attempts to download an untrusted mobile application package bypassing the official Google Play Store.',
      severity: 'critical'
    });
    score += 45;
  }

  // 8. Excessive Subdomains & Entropy
  if (domainParts.length > 3) {
    flags.push({
      title: 'Excessive Subdomain Layering',
      detail: `Domain uses ${domainParts.length} levels of subdomains to visually mask the actual root domain on mobile browsers.`,
      severity: 'medium'
    });
    score += 20;
  }

  const entropy = calculateEntropy(hostname);
  if (entropy > 3.8 && hostname.length > 15) {
    flags.push({
      title: 'High Domain Name Entropy',
      detail: 'Hostname exhibits high character randomness typical of algorithmically generated domain names (DGA).',
      severity: 'medium'
    });
    score += 20;
  }

  // Clamp final score
  score = Math.min(Math.max(score, 10), 99);

  let classification = 'Safe';
  if (score >= 70) {
    classification = 'High Risk';
  } else if (score >= 35) {
    classification = 'Suspicious';
  }

  return {
    url: normalized,
    hostname,
    protocol: parsed.protocol,
    tld: `.${tld}`,
    riskScore: score,
    classification,
    confidence: +(0.85 + (score > 60 ? 0.12 : 0.05)).toFixed(2),
    flags,
    securityChecklist: {
      sslTls: parsed.protocol === 'https:',
      typosquattingSafe: !brandSpoofed,
      reputableTLD: !SUSPICIOUS_TLDS.has(tld),
      ipHostSafe: !isIpAddress
    }
  };
}

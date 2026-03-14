export async function verifyLicense() {
  const rawKey = process.env.LICENSE_KEY || process.env.NEXT_PUBLIC_LICENSE_KEY;
  const key = rawKey?.trim();
  
  // 1. Check if a key even exists
  if (!key) {
    return { valid: false, reason: "CRITICAL: No license key provided in environment variables. Please add LICENSE_KEY." };
  }

  // 2. Format validation (e.g., expecting a White-Label key starting with WL-)
  if (!key.startsWith('WL-')) {
    return { valid: false, reason: `LICENSE ERROR: Invalid license key format. Key must be a valid White-Label issuance. (Received: ${key.substring(0, 3)}...)` };
  }

  // 3. Centralized Agency Verification (Placeholder)
  // In your real production deployment, you will uncomment this code to make
  // a fetch request back to YOUR master database to ensure they paid their monthly bill.
  /*
  try {
    const res = await fetch(`https://your-master-agency-site.com/api/verify?key=${key}`);
    const data = await res.json();
    if (!data.isValid) {
      return { valid: false, reason: "LICENSE REVOKED: This software license is expired or suspended due to non-payment." };
    }
  } catch (err) {
    return { valid: false, reason: "LICENSE TIMEOUT: Unable to contact the master licensing server." };
  }
  */

  return { valid: true, reason: "" };
}

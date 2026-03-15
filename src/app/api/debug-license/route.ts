import { NextResponse } from "next/server";
import { getLicenseKey } from "@/lib/license";

/** Debug: check if license key is visible at runtime. Hit /api/debug-license on Vercel. */
export async function GET() {
  const key = await getLicenseKey();
  return NextResponse.json({
    licenseKeySet: !!key,
    hint: key ? "Key is present (starts with WL-)" : "Set NEXT_PUBLIC_LICENSE_KEY in Vercel and redeploy.",
  });
}

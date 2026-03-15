import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";

// Inject LICENSE_KEY into request headers so layout can read it at runtime (Vercel).
// Server components may not see process.env at request time; middleware runs per-request.
function injectLicenseHeader(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const key = process.env.LICENSE_KEY ?? process.env.NEXT_PUBLIC_LICENSE_KEY ?? "";
  requestHeaders.set("x-license-key", key);
  return requestHeaders;
}

export default function middleware(request: NextRequest) {
  const requestHeaders = injectLicenseHeader(request);

  const isDashboard =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/api/dashboard");

  if (isDashboard) {
    const authResponse = withAuth({
      pages: { signIn: "/login" },
    })(request);
    if (authResponse.status === 307 || authResponse.status === 302) return authResponse;
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

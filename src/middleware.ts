import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

// Inject LICENSE_KEY into request headers so layout can read it at runtime (Vercel).
function injectLicenseHeader(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const key =
    process.env.LICENSE_KEY ?? process.env.NEXT_PUBLIC_LICENSE_KEY ?? "";
  requestHeaders.set("x-license-key", key);
  return requestHeaders;
}

/**
 * Multi-tenant Middleware
 *
 * Handles:
 * 1. Custom domain routing (directory.theircompany.com → their directory)
 * 2. Subdomain routing (slug.trianglehub.online → agency directory)
 * 3. Tenant isolation (inject agency_id into all queries)
 * 4. Auth protection for /dashboard routes
 */

export async function middleware(request: NextRequest) {
    const { hostname, pathname } = request.nextUrl;
    const requestHeaders = injectLicenseHeader(request);

    // Skip API routes and static files (except API auth check)
    const isApiRoute = pathname.startsWith('/api');
    const isStaticFile = pathname.includes('.') || pathname.startsWith('/_next/static');

    if (isStaticFile) {
        return NextResponse.next();
    }

    // Derive secureCookie from NEXTAUTH_URL — same logic NextAuth uses to name the cookie.
    // request.nextUrl.protocol is unreliable on Vercel (SSL terminates at edge).
    const nextAuthUrl = process.env.NEXTAUTH_URL ?? '';
    const isSecure = nextAuthUrl.startsWith('https://') || request.headers.get('x-forwarded-proto') === 'https';
    const tokenOptions = {
        req: request,
        secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-local-dev-only",
        secureCookie: isSecure,
    };

    // First-time setup page — allow unauthenticated access
    if (pathname.startsWith('/setup')) {
        return NextResponse.next({ request: { headers: requestHeaders } });
    }

    // Dashboard auth protection (admin)
    const isDashboard = pathname.startsWith('/dashboard');
    if (isDashboard) {
        const token = await getToken(tokenOptions);
        if (!token) {
            const url = new URL("/login", request.url);
            url.searchParams.set("callbackUrl", encodeURI(request.url));
            return NextResponse.redirect(url);
        }
    }

    // SMB portal auth protection
    const isSmbPortal = pathname.startsWith('/smb') &&
        !pathname.startsWith('/smb/login') &&
        !pathname.startsWith('/smb/auth-callback');
    if (isSmbPortal) {
        const token = await getToken(tokenOptions);
        if (!token) {
            return NextResponse.redirect(new URL('/smb/login', request.url));
        }
    }
    
    // Multi-tenant routing: only activate for actual subdomains (e.g. agency.trianglehub.online)
    // Do NOT fetch for the primary domain — that fired on every request and consumed all CPU.
    if (!isApiRoute) {
        const hostParts = hostname.split('.');
        let agencySlug: string | null = null;
        if (hostParts.length >= 3) {
            const potentialSlug = hostParts[0];
            if (potentialSlug !== 'www' && potentialSlug !== 'app') {
                agencySlug = potentialSlug;
            }
        }

        if (agencySlug) {
            try {
                const agencyUrl = new URL('/api/agencies', request.url);
                agencyUrl.searchParams.set('slug', agencySlug);

                const agencyRes = await fetch(agencyUrl.toString());
                if (agencyRes.ok) {
                    const agencyData = await agencyRes.json();
                    if (agencyData.data && (!Array.isArray(agencyData.data) || agencyData.data.length > 0)) {
                        const agency = Array.isArray(agencyData.data) ? agencyData.data[0] : agencyData.data;
                        requestHeaders.set('x-agency-id', agency.id.toString());
                        requestHeaders.set('x-agency-slug', agency.slug);
                        requestHeaders.set('x-agency-name', agency.name);
                        requestHeaders.set('x-agency-primary-color', agency.primary_color || '#3b82f6');
                        requestHeaders.set('x-agency-secondary-color', agency.secondary_color || '#10b981');
                        requestHeaders.set('x-agency-logo', agency.logo_url || '');
                        requestHeaders.set('x-tenant-mode', 'true');
                    }
                }
            } catch (error) {
                console.error('Middleware agency lookup error:', error);
            }
        }
    }

    return NextResponse.next({
        request: { headers: requestHeaders },
    });
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
    ],
};

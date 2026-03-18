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

    // Dashboard auth protection (admin)
    const isDashboard = pathname.startsWith('/dashboard');
    if (isDashboard) {
        const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
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
        const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
        if (!token) {
            return NextResponse.redirect(new URL('/smb/login', request.url));
        }
    }
    
    // Multi-tenant routing for custom domains
    if (!isApiRoute && !isStaticFile) {
        // Get agency from custom domain or subdomain
        let agencySlug: string | null = null;
        let agencyDomain: string | null = null;

        // Check for custom domain
        const customDomain = hostname;
        
        // Check for subdomain (e.g., agency.trianglehub.online)
        const hostParts = hostname.split('.');
        if (hostParts.length >= 3) {
            const potentialSlug = hostParts[0];
            if (potentialSlug !== 'www' && potentialSlug !== 'app') {
                agencySlug = potentialSlug;
            }
        }

        // Fetch agency info and set headers
        if (agencySlug || (customDomain && !customDomain.includes('vercel.app'))) {
            try {
                const agencyUrl = new URL('/api/agencies', request.url);
                if (agencySlug) {
                    agencyUrl.searchParams.set('slug', agencySlug);
                } else if (customDomain) {
                    agencyUrl.searchParams.set('domain', customDomain);
                }

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
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
    ],
};

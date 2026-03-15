import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Multi-tenant Middleware
 * 
 * Handles:
 * 1. Custom domain routing (directory.theircompany.com → their directory)
 * 2. Subdomain routing (slug.trianglehub.online → agency directory)
 * 3. Tenant isolation (inject agency_id into all queries)
 */

export async function middleware(request: NextRequest) {
    const { hostname, pathname } = request.nextUrl;
    
    // Skip API routes and static files
    if (pathname.startsWith('/api') || pathname.includes('.')) {
        return NextResponse.next();
    }

    // Get agency from custom domain or subdomain
    let agencySlug: string | null = null;
    let agencyDomain: string | null = null;

    // Check for custom domain (e.g., directory.theircompany.com)
    const customDomain = hostname;
    
    // Check for subdomain (e.g., agency.trianglehub.online)
    const hostParts = hostname.split('.');
    if (hostParts.length >= 3) {
        // Has subdomain
        const potentialSlug = hostParts[0];
        if (potentialSlug !== 'www' && potentialSlug !== 'app') {
            agencySlug = potentialSlug;
        }
    }

    // Fetch agency info and set headers
    if (agencySlug || customDomain) {
        try {
            // Fetch agency from database via API (in production, use edge-compatible DB)
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
                    
                    // Set headers with agency info for downstream use
                    const response = NextResponse.next();
                    response.headers.set('x-agency-id', agency.id.toString());
                    response.headers.set('x-agency-slug', agency.slug);
                    response.headers.set('x-agency-name', agency.name);
                    response.headers.set('x-agency-primary-color', agency.primary_color || '#3b82f6');
                    response.headers.set('x-agency-secondary-color', agency.secondary_color || '#10b981');
                    response.headers.set('x-agency-logo', agency.logo_url || '');
                    response.headers.set('x-tenant-mode', 'true');
                    
                    return response;
                }
            }
        } catch (error) {
            console.error('Middleware agency lookup error:', error);
            // Continue without tenant mode on error
        }
    }

    // Default: master directory
    const response = NextResponse.next();
    response.headers.set('x-tenant-mode', 'false');
    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};

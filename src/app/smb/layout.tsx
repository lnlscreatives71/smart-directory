'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { LayoutDashboard, Settings, Star, LogOut, ExternalLink, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function SmbLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);

    // Redirect to SMB login if not authenticated or not an SMB user
    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const isPublicSmbPage = pathname === '/smb/login' || pathname === '/smb/auth-callback';

    if (!isPublicSmbPage && (status === 'unauthenticated' || (session && (session.user as any)?.role !== 'smb'))) {
        if (typeof window !== 'undefined') router.replace('/smb/login');
        return null;
    }

    const navItems = [
        { name: 'Dashboard', href: '/smb', icon: LayoutDashboard },
        { name: 'Edit Listing', href: '/smb/listing', icon: Settings },
        { name: 'Upgrade to Premium', href: '/pricing', icon: Star, external: true },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
            {/* Top nav */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <Link href="/smb" className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-400">
                        My Business Portal
                    </Link>

                    <nav className="hidden sm:flex items-center gap-1">
                        {navItems.map(item => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return item.external ? (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition"
                                >
                                    <Icon size={15} /> {item.name}
                                </Link>
                            ) : (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${isActive
                                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    <Icon size={15} /> {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User menu */}
                    <div className="relative">
                        <button
                            onClick={() => setMenuOpen(p => !p)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                        >
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center text-white font-bold text-xs uppercase">
                                {session?.user?.name?.[0] || 'B'}
                            </div>
                            <span className="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[120px] truncate">
                                {session?.user?.name || 'My Business'}
                            </span>
                            <ChevronDown size={14} className="text-slate-400" />
                        </button>

                        {menuOpen && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 z-50">
                                <a
                                    href={`/`}
                                    target="_blank"
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                >
                                    <ExternalLink size={14} /> View Directory
                                </a>
                                <button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                    <LogOut size={14} /> Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile nav */}
                <div className="sm:hidden border-t border-slate-100 dark:border-slate-800 px-4 py-2 flex gap-1 overflow-x-auto">
                    {navItems.map(item => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${isActive
                                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                            >
                                <Icon size={13} /> {item.name}
                            </Link>
                        );
                    })}
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                {children}
            </main>
        </div>
    );
}

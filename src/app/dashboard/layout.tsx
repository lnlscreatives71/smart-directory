'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, Users, LayoutDashboard, Database, CreditCard, Bell, Search, Menu, X, ExternalLink, Upload, Calendar, FileText, Briefcase, LogOut, Tags, MenuSquare, ShieldCheck, Send } from 'lucide-react';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Listings', href: '/dashboard/listings', icon: Database },
        { name: 'Claim Requests', href: '/dashboard/claims', icon: ShieldCheck },
        { name: 'Import Businesses', href: '/dashboard/import', icon: Upload },
        { name: 'Plans', href: '/dashboard/plans', icon: CreditCard },
        { name: 'Leads & CRM', href: '/dashboard/leads', icon: Users },
        { name: 'Outreach', href: '/dashboard/outreach', icon: Send },
        { name: 'Bookings', href: '/dashboard/bookings', icon: Calendar },
        { name: 'Events', href: '/dashboard/events', icon: Bell },
        { name: 'Blogs', href: '/dashboard/blogs', icon: LayoutDashboard },
        { name: 'News', href: '/dashboard/news', icon: FileText },
        { name: 'Jobs', href: '/dashboard/jobs', icon: Briefcase },
        { name: 'Categories', href: '/dashboard/categories', icon: MenuSquare },
        { name: 'Business Tags', href: '/dashboard/tags', icon: Tags },
        { name: 'Menu Builder', href: '/dashboard/menu-builder', icon: MenuSquare },
        { name: 'Branding & Settings', href: '/dashboard/settings', icon: Settings },
    ];

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-200 ease-in-out ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} md:translate-x-0 md:static md:flex flex-col h-screen`}>
                <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                    <Link href="/dashboard" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-400">
                        SmartDir Admin
                    </Link>
                    <button className="md:hidden text-slate-400 hover:text-slate-600" onClick={() => setMobileMenuOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-4">
                    <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Main Menu</p>
                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard');
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center px-3 py-2.5 rounded-lg font-medium transition-colors ${isActive
                                            ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                >
                                    <Icon size={18} className={`mr-3 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'}`} /> {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-600 to-secondary-400 flex items-center justify-center text-white font-bold text-sm shadow-sm uppercase shrink-0">
                            {session?.user?.name?.[0] || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{session?.user?.name || 'Administrator'}</p>
                            <p className="text-xs text-slate-500 truncate">{session?.user?.email || 'admin@triangle.hub'}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                    >
                        <LogOut size={16} /> Sign Out
                    </button>
                    
                    {/* Agency Backend Branding */}
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center opacity-60 hover:opacity-100 transition-opacity cursor-default">
                        <span className="text-[9px] font-bold tracking-widest uppercase text-slate-400 mb-1.5">Powered By</span>
                        <div className="flex items-center gap-2">
                             <img src="/ai-agency-logo-no-background.png" alt="LNL Ai Agency" className="h-16 w-auto object-contain" />
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
                {/* Top Header */}
                <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0">
                    <div className="flex items-center flex-1 gap-4">
                        <button className="md:hidden text-slate-500 hover:text-slate-700" onClick={() => setMobileMenuOpen(true)}>
                            <Menu size={20} />
                        </button>

                        <div className="max-w-md w-full relative hidden sm:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search everywhere..."
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border-transparent focus:bg-white focus:border-primary-500 dark:focus:border-primary-500 rounded-lg text-sm transition-all outline-none ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-primary-500"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 sm:space-x-5">
                        <button className="relative text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-900"></span>
                            <Bell size={20} />
                        </button>
                        <div className="h-5 w-px bg-slate-200 dark:bg-slate-700"></div>
                        <Link href="/" target="_blank" className="flex items-center text-sm font-medium text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors group">
                            <span className="hidden sm:inline">View Site</span>
                            <ExternalLink size={16} className="ml-1 sm:ml-2 text-slate-400 group-hover:text-primary-600" />
                        </Link>
                    </div>
                </header>

                {/* Scrollable Canvas */}
                <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#0a0f1c] p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity" onClick={() => setMobileMenuOpen(false)}></div>
            )}
        </div>
    );
}

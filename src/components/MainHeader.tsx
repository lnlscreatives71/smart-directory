'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Phone, UserCircle, ArrowUpRight } from 'lucide-react';
import DynamicMenu from './DynamicMenu';

interface Props {
    phone: string;
    phoneRaw: string;
}

export default function MainHeader({ phone, phoneRaw }: Props) {
    const pathname = usePathname();
    if (pathname.startsWith('/smb')) return null;

    return (
        <header className="fixed top-0 z-50 w-full glass-nav">
            <div className="max-w-7xl mx-auto px-4 h-24 flex items-center justify-between gap-4">
                <Link href="/" className="flex items-center shrink-0">
                    <img src="/triangle-hub-logo-dark.png" alt="Triangle Local Hub" className="h-[75px] w-auto drop-shadow-lg" />
                </Link>
                <DynamicMenu />
                <div className="flex items-center gap-5 shrink-0">
                    <a href={`tel:${phoneRaw}`} className="hidden xl:flex items-center gap-2 text-[14px] font-bold text-slate-300 hover:text-white transition-colors">
                        <Phone size={16} className="text-primary-400" />
                        {phone}
                    </a>
                    <Link href="/dashboard" className="hidden md:flex items-center gap-2 text-[14px] font-bold text-slate-300 hover:text-white transition-colors">
                        <UserCircle size={18} />
                        Login
                    </Link>
                    <Link href="/pricing" className="btn-primary flex items-center gap-1.5 px-5 py-2.5 text-sm whitespace-nowrap">
                        Add Business <ArrowUpRight size={16} />
                    </Link>
                </div>
            </div>
        </header>
    );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

interface MenuItem {
    id: number;
    title: string;
    href: string;
    icon: string | null;
    open_in_new_tab: boolean;
    css_class: string | null;
    menu_type: string;
    children: MenuItem[];
}

interface MenuSettings {
    menu_name: string;
    max_depth: number;
    show_icons: boolean;
    layout_style: string;
}

interface MenuData {
    settings: MenuSettings;
    menu: MenuItem[];
}

export default function DynamicMenu({ agencyId }: { agencyId?: number }) {
    const [menuData, setMenuData] = useState<MenuData | null>(null);
    const [loading, setLoading] = useState(true);
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const [currentAgencyId, setCurrentAgencyId] = useState<number | null>(agencyId || null);

    useEffect(() => {
        // Fetch agency ID if not provided
        if (!currentAgencyId) {
            fetchAgencyId();
        } else {
            fetchMenu();
        }
    }, [currentAgencyId]);

    const fetchAgencyId = async () => {
        try {
            const res = await fetch('/api/agencies');
            if (res.ok) {
                const data = await res.json();
                console.log('Agencies API response:', data);
                // Get the first agency (for single-directory setup)
                if (data.data && Array.isArray(data.data) && data.data.length > 0) {
                    setCurrentAgencyId(data.data[0].id);
                } else if (data.data && data.data.id) {
                    // Fallback for single object response
                    setCurrentAgencyId(data.data.id);
                } else {
                    console.error('No agency found in response');
                    setLoading(false);
                }
            } else {
                console.error('Failed to fetch agencies:', res.status);
                setLoading(false);
            }
        } catch (error) {
            console.error('Error fetching agency:', error);
            setLoading(false);
        }
    };

    const fetchMenu = async () => {
        if (!currentAgencyId) return;

        try {
            const res = await fetch(`/api/menu?agency_id=${currentAgencyId}`);
            console.log('Menu API response status:', res.status);
            if (res.ok) {
                const data = await res.json();
                console.log('Menu data:', data);
                setMenuData(data.data);
            } else {
                console.error('Failed to fetch menu:', res.status);
            }
        } catch (error) {
            console.error('Error fetching menu:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="hidden lg:flex items-center gap-6 flex-1 justify-center">
                <div className="text-slate-400 text-sm">Loading menu...</div>
            </div>
        );
    }

    // If no menu exists, show default fallback menu
    if (!menuData || menuData.menu.length === 0) {
        return (
            <nav className="hidden lg:flex items-center gap-6 flex-1 justify-center">
                <div className="relative group">
                    <Link href="/" className="flex items-center gap-1.5 py-2 text-[15px] font-semibold text-slate-300 hover:text-white transition-all">
                        Home
                    </Link>
                </div>
                <div className="relative group">
                    <Link href="/category/dining" className="flex items-center gap-1.5 py-2 text-[15px] font-semibold text-slate-300 hover:text-white transition-all">
                        Dining
                    </Link>
                </div>
                <div className="relative group">
                    <Link href="/category/services" className="flex items-center gap-1.5 py-2 text-[15px] font-semibold text-slate-300 hover:text-white transition-all">
                        Services
                    </Link>
                </div>
                <div className="relative group">
                    <Link href="/category/retail" className="flex items-center gap-1.5 py-2 text-[15px] font-semibold text-slate-300 hover:text-white transition-all">
                        Retail
                    </Link>
                </div>
                <div className="relative group">
                    <Link href="/category/health" className="flex items-center gap-1.5 py-2 text-[15px] font-semibold text-slate-300 hover:text-white transition-all">
                        Health & Wellness
                    </Link>
                </div>
                <div className="relative group">
                    <Link href="/blogs" className="flex items-center gap-1.5 py-2 text-[15px] font-semibold text-slate-300 hover:text-white transition-all">
                        Blogs
                    </Link>
                </div>
                <div className="relative group">
                    <Link href="/pricing" className="flex items-center gap-1.5 py-2 text-[15px] font-semibold text-slate-300 hover:text-white transition-all">
                        Pricing
                    </Link>
                </div>
            </nav>
        );
    }

    const { settings, menu } = menuData;

    const renderMenuItem = (item: MenuItem, depth: number = 0) => {
        const hasChildren = item.children && item.children.length > 0;
        const showIcon = settings.show_icons && item.icon;

        return (
            <div
                key={item.id}
                className="relative group"
                onMouseEnter={() => setOpenDropdown(item.id)}
                onMouseLeave={() => setOpenDropdown(null)}
            >
                <Link
                    href={item.href}
                    target={item.open_in_new_tab ? '_blank' : undefined}
                    rel={item.open_in_new_tab ? 'noopener noreferrer' : undefined}
                    className={`flex items-center gap-1.5 py-2 text-[15px] font-semibold text-slate-300 hover:text-white transition-all whitespace-nowrap tracking-wide ${item.css_class || ''}`}
                >
                    {showIcon && <span>{item.icon}</span>}
                    {item.title}
                    {hasChildren && (
                        <ChevronDown
                            size={16}
                            className={`opacity-50 transition-transform duration-200 ${
                                openDropdown === item.id ? 'rotate-180' : ''
                            }`}
                        />
                    )}
                </Link>

                {/* Dropdown menu */}
                {hasChildren && depth < settings.max_depth - 1 && (
                    <div
                        className={`absolute top-10 left-0 pt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 translate-y-2 group-hover:translate-y-0 ${
                            settings.layout_style === 'mega' ? 'w-[600px] left-1/2 -translate-x-1/2' : ''
                        }`}
                    >
                        <div className="glass rounded-xl shadow-2xl p-2 flex flex-col gap-1 border border-slate-700/50 overflow-hidden">
                            {item.children.map((child) => renderMenuItem(child, depth + 1))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <nav className="hidden lg:flex items-center gap-6 flex-1 justify-center">
            <div className="relative group">
                <Link href="/" className="flex items-center gap-1.5 py-2 text-[15px] font-semibold text-slate-300 hover:text-white transition-all whitespace-nowrap tracking-wide">
                    Home
                </Link>
            </div>
            {menu.map((item) => renderMenuItem(item))}
        </nav>
    );
}

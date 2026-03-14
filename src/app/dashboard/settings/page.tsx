'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Save, Loader2, CheckCircle2, AlertTriangle, Upload, Palette,
    Type, Globe, Image, LayoutTemplate, Menu, Plus, Trash2,
    ChevronDown, ChevronRight, GripVertical, Eye
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────
interface BrandingSettings {
    site_name: string; tagline: string; logo_url: string;
    footer_logo_url: string; favicon_url: string;
    topbar_bg_color: string; topbar_text_color: string;
    topbar_font: string; topbar_font_size: string; accent_color: string;
}
interface HeroSettings {
    title: string; subtitle: string; image_url: string;
    search_button_color: string; heading_text_color: string;
    subheading_text_color: string; display_map: boolean;
}
interface HomepageSettings {
    heading: string; text1: string; text2: string;
    heading_color: string; text1_color: string; text2_color: string;
    main_image_url: string; featured_per_page: number; free_per_page: number;
    phone_number: string; contact_email: string; address: string;
}
interface MenuItem { id: string; label: string; href: string; children?: MenuItem[]; }
interface MenuSettings { items: MenuItem[]; }

type Tab = 'branding' | 'hero' | 'homepage' | 'menu';

const FONTS = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'Nunito', 'Georgia', 'Arial'];
const FONT_SIZES = ['14px', '15px', '16px', '17px', '18px'];
const FEATURED_OPTIONS = [2, 3, 4, 6, 8];
const FREE_OPTIONS = [4, 6, 8, 12, 16];

// ── Reusable field components ──────────────────────────────────────────────
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
            {hint && <p className="text-xs text-gray-400 mb-2">{hint}</p>}
            {children}
        </div>
    );
}
function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
    return <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />;
}
function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <div className="flex items-center gap-2">
            <div className="relative">
                <input type="color" value={value} onChange={e => onChange(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
            </div>
            <input type="text" value={value} onChange={e => onChange(e.target.value)}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono text-gray-700 outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
    );
}
function SelectInput({ value, onChange, options }: { value: string | number; onChange: (v: string) => void; options: (string | number)[] }) {
    return (
        <select value={value} onChange={e => onChange(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-primary-500 bg-white">
            {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
    );
}
function ImageField({ label, hint, value, onChange }: { label: string; hint?: string; value: string; onChange: (v: string) => void }) {
    return (
        <Field label={label} hint={hint}>
            <div className="space-y-2">
                {value && (
                    <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50" style={{ height: 120 }}>
                        <img src={value} alt={label} className="w-full h-full object-cover" />
                    </div>
                )}
                <div className="flex gap-2">
                    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder="Image URL..."
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-primary-500" />
                    <label className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium cursor-pointer transition border border-gray-200">
                        <Upload size={14} /> Upload
                        <input type="file" accept="image/*" className="hidden" onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) onChange(URL.createObjectURL(file));
                        }} />
                    </label>
                </div>
            </div>
        </Field>
    );
}

// ── Section card wrapper ───────────────────────────────────────────────────
function SectionCard({ title, subtitle, icon: Icon, children }: { title: string; subtitle?: string; icon: React.ElementType; children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-primary-600" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
                    {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
                </div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                {children}
            </div>
        </div>
    );
}

// ── Menu Item Editor ───────────────────────────────────────────────────────
function MenuItemRow({ item, onUpdate, onDelete, depth = 0, parentId }: {
    item: MenuItem; onUpdate: (id: string, data: Partial<MenuItem>) => void;
    onDelete: (id: string, parentId?: string) => void; depth?: number; parentId?: string
}) {
    const [open, setOpen] = useState(true);
    return (
        <div className={`rounded-xl border ${depth === 0 ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'} overflow-hidden`}>
            <div className="flex items-center gap-2 px-4 py-3">
                <GripVertical size={16} className="text-gray-300 cursor-grab shrink-0" />
                {item.children && item.children.length > 0 && (
                    <button onClick={() => setOpen(!open)} className="text-gray-400 hover:text-gray-600">
                        {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                    </button>
                )}
                <input value={item.label} onChange={e => onUpdate(item.id, { label: e.target.value })}
                    className="flex-1 font-semibold text-sm text-gray-800 border-0 outline-none bg-transparent" placeholder="Menu label" />
                <input value={item.href} onChange={e => onUpdate(item.id, { href: e.target.value })}
                    className="w-52 text-xs text-gray-500 font-mono border border-gray-200 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-primary-400 bg-white" placeholder="/category/..." />
                {depth === 0 && <span className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full font-medium">Top Level</span>}
                {depth === 1 && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">sub item</span>}
                <button onClick={() => onDelete(item.id, parentId)} className="text-gray-300 hover:text-red-400 transition ml-1">
                    <Trash2 size={14} />
                </button>
            </div>

            {open && item.children && item.children.length > 0 && (
                <div className="pl-8 pr-4 pb-3 space-y-2">
                    {item.children.map(child => (
                        <MenuItemRow key={child.id} item={child} depth={1} parentId={item.id}
                            onUpdate={onUpdate} onDelete={onDelete} />
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Main Settings Page ─────────────────────────────────────────────────────
export default function SettingsPage() {
    const [tab, setTab] = useState<Tab>('branding');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    const [branding, setBranding] = useState<BrandingSettings>({
        site_name: 'Triangle Local Hub', tagline: 'Find Local Businesses You Can Trust',
        logo_url: '', footer_logo_url: '', favicon_url: '',
        topbar_bg_color: '#FFFFFF', topbar_text_color: '#1F2937',
        topbar_font: 'Inter', topbar_font_size: '16px', accent_color: '#EF4444',
    });
    const [hero, setHero] = useState<HeroSettings>({
        title: 'Find Local Businesses You Can Trust',
        subtitle: 'Search by name, category, or keyword — and support the businesses that make your community thrive.',
        image_url: 'https://images.unsplash.com/photo-1565791380713-1756b9a05343?q=80&w=2070',
        search_button_color: '#EF4444', heading_text_color: '#FFFFFF',
        subheading_text_color: 'rgba(255,255,255,0.8)', display_map: false,
    });
    const [homepage, setHomepage] = useState<HomepageSettings>({
        heading: 'Triangle Local Hub — Discover & Support Small Businesses',
        text1: 'The Triangle Hub is your go-to directory for finding trusted small businesses near you.',
        text2: 'Explore shops, services, restaurants, and more — all in one place.',
        heading_color: '#1F2937', text1_color: '#4B5563', text2_color: '#6B7280',
        main_image_url: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=600',
        featured_per_page: 4, free_per_page: 8,
        phone_number: '(919) 555-0100', contact_email: 'hello@trianglelocalhub.com', address: 'Raleigh, NC 27601',
    });
    const [menu, setMenu] = useState<MenuSettings>({
        items: [
            { id: '1', label: 'Dining', href: '/category/dining', children: [{ id: '1-1', label: 'Bakeries', href: '/category/bakeries' }, { id: '1-2', label: 'Café & Brunch', href: '/category/cafes' }, { id: '1-3', label: 'Pizza', href: '/category/pizza' }] },
            { id: '2', label: 'Services', href: '/category/services', children: [{ id: '2-1', label: 'HVAC', href: '/category/hvac' }, { id: '2-2', label: 'Real Estate', href: '/category/real-estate' }, { id: '2-3', label: 'Med Spa', href: '/category/med-spa' }] },
            { id: '3', label: 'More', href: '/category/all', children: [{ id: '3-1', label: 'Pet Services', href: '/category/pet-services' }, { id: '3-2', label: 'Retail', href: '/category/retail' }] },
        ],
    });

    const showToast = (type: 'success' | 'error', msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3500);
    };

    const loadSettings = useCallback(async () => {
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            if (data.success) {
                if (data.settings.branding) setBranding(data.settings.branding as BrandingSettings);
                if (data.settings.hero) setHero(data.settings.hero as HeroSettings);
                if (data.settings.homepage) setHomepage(data.settings.homepage as HomepageSettings);
                if (data.settings.menu) setMenu(data.settings.menu as MenuSettings);
            }
        } catch { /* use defaults */ } finally { setLoading(false); }
    }, []);

    useEffect(() => { loadSettings(); }, [loadSettings]);

    const save = async () => {
        setSaving(true);
        try {
            const sections: [string, unknown][] = [['branding', branding], ['hero', hero], ['homepage', homepage], ['menu', menu]];
            for (const [key, value] of sections) {
                await fetch('/api/settings', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key, value }),
                });
            }
            showToast('success', 'Settings saved successfully!');
        } catch {
            showToast('error', 'Failed to save settings.');
        } finally { setSaving(false); }
    };

    // Menu helpers
    const updateMenuItem = (id: string, data: Partial<MenuItem>, items = menu.items): MenuItem[] => {
        return items.map(item => {
            if (item.id === id) return { ...item, ...data };
            if (item.children) return { ...item, children: updateMenuItem(id, data, item.children) };
            return item;
        });
    };
    const deleteMenuItem = (id: string, parentId?: string) => {
        if (parentId) {
            setMenu(prev => ({
                items: prev.items.map(item =>
                    item.id === parentId ? { ...item, children: (item.children || []).filter(c => c.id !== id) } : item
                )
            }));
        } else {
            setMenu(prev => ({ items: prev.items.filter(item => item.id !== id) }));
        }
    };
    const addTopLevel = () => {
        const id = Date.now().toString();
        setMenu(prev => ({ items: [...prev.items, { id, label: 'New Category', href: '/category/new', children: [] }] }));
    };
    const addSubItem = (parentId: string) => {
        const id = `${parentId}-${Date.now()}`;
        setMenu(prev => ({
            items: prev.items.map(item =>
                item.id === parentId ? { ...item, children: [...(item.children || []), { id, label: 'New Sub Item', href: '/category/sub' }] } : item
            )
        }));
    };

    const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
        { id: 'branding', label: '1. General', icon: Palette },
        { id: 'hero', label: '2. Hero / Content', icon: Image },
        { id: 'homepage', label: '3. Home Page', icon: LayoutTemplate },
        { id: 'menu', label: '4. Menu Builder', icon: Menu },
    ];

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <Loader2 size={28} className="animate-spin text-primary-500" />
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        Branding & Settings
                        <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-500 text-xs flex items-center justify-center font-bold cursor-help" title="Configure your directory appearance and content">?</span>
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Customize your directory&apos;s look, content, and navigation.</p>
                </div>
                <div className="flex gap-3">
                    <a href="/" target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition">
                        <Eye size={14} /> Preview Site
                    </a>
                    <button onClick={save} disabled={saving}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold text-sm transition shadow-md shadow-primary-600/20 disabled:opacity-60">
                        {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <div className={`flex items-center gap-3 p-4 rounded-xl text-sm font-medium animate-fade-in ${toast.type === 'success' ? 'bg-secondary-50 text-secondary-700 border border-secondary-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                    {toast.msg}
                </div>
            )}

            {/* Tabs */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="flex border-b border-gray-100 dark:border-slate-800 overflow-x-auto">
                    {TABS.map(t => {
                        const Icon = t.icon;
                        return (
                            <button key={t.id} onClick={() => setTab(t.id)}
                                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${tab === t.id ? 'text-primary-600 border-primary-600 bg-primary-50/50 dark:bg-primary-900/10' : 'text-gray-500 border-transparent hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
                                <Icon size={15} /> {t.label}
                            </button>
                        );
                    })}
                </div>

                <div className="p-6 space-y-6">

                    {/* ── TAB 1: Branding ──────────────────────────── */}
                    {tab === 'branding' && (
                        <>
                            <SectionCard title="Brand Logos" subtitle="Upload and manage your brand logos" icon={Image}>
                                <ImageField label="Header Logo" hint="Recommended: 300×150px, 2:1 ratio, 1MB max" value={branding.logo_url} onChange={v => setBranding(p => ({ ...p, logo_url: v }))} />
                                <ImageField label="Auth Logo" hint="Shown on login/register pages" value={branding.logo_url} onChange={v => setBranding(p => ({ ...p, logo_url: v }))} />
                                <ImageField label="Footer Logo" hint="Shown in the site footer" value={branding.footer_logo_url} onChange={v => setBranding(p => ({ ...p, footer_logo_url: v }))} />
                                <ImageField label="Favicon" hint="16×16px or 32×32px .ico or .png" value={branding.favicon_url} onChange={v => setBranding(p => ({ ...p, favicon_url: v }))} />
                            </SectionCard>

                            <SectionCard title="Topbar Styling" subtitle="Customize your header appearance" icon={Palette}>
                                <Field label="Topbar Background Color">
                                    <ColorInput value={branding.topbar_bg_color} onChange={v => setBranding(p => ({ ...p, topbar_bg_color: v }))} />
                                </Field>
                                <Field label="Topbar Text Color">
                                    <ColorInput value={branding.topbar_text_color} onChange={v => setBranding(p => ({ ...p, topbar_text_color: v }))} />
                                </Field>
                                <Field label="Accent / Button Color">
                                    <ColorInput value={branding.accent_color} onChange={v => setBranding(p => ({ ...p, accent_color: v }))} />
                                </Field>
                                <div className="flex gap-3">
                                    <Field label="Topbar Font">
                                        <SelectInput value={branding.topbar_font} onChange={v => setBranding(p => ({ ...p, topbar_font: v }))} options={FONTS} />
                                    </Field>
                                    <Field label="Font Size">
                                        <SelectInput value={branding.topbar_font_size} onChange={v => setBranding(p => ({ ...p, topbar_font_size: v }))} options={FONT_SIZES} />
                                    </Field>
                                </div>
                            </SectionCard>

                            <SectionCard title="Site Identity" subtitle="Your site name and tagline" icon={Globe}>
                                <Field label="Site Name">
                                    <TextInput value={branding.site_name} onChange={v => setBranding(p => ({ ...p, site_name: v }))} />
                                </Field>
                                <Field label="Tagline">
                                    <TextInput value={branding.tagline} onChange={v => setBranding(p => ({ ...p, tagline: v }))} />
                                </Field>
                            </SectionCard>
                        </>
                    )}

                    {/* ── TAB 2: Hero ───────────────────────────────── */}
                    {tab === 'hero' && (
                        <>
                            <SectionCard title="Hero Section" subtitle="Configure hero section content and styling" icon={Image}>
                                <div className="md:col-span-2">
                                    <ImageField label="Hero Background Image" hint="Recommended: 1280×320px, 4:1 ratio, 1MB max" value={hero.image_url} onChange={v => setHero(p => ({ ...p, image_url: v }))} />
                                </div>
                                <Field label="Title">
                                    <TextInput value={hero.title} onChange={v => setHero(p => ({ ...p, title: v }))} placeholder="Find Local Businesses You Can Trust" />
                                </Field>
                                <Field label="Sub Title">
                                    <TextInput value={hero.subtitle} onChange={v => setHero(p => ({ ...p, subtitle: v }))} placeholder="Search by name, category..." />
                                </Field>
                                <Field label="Heading Text Color">
                                    <ColorInput value={hero.heading_text_color} onChange={v => setHero(p => ({ ...p, heading_text_color: v }))} />
                                </Field>
                                <Field label="Sub Heading Text Color">
                                    <ColorInput value={hero.subheading_text_color} onChange={v => setHero(p => ({ ...p, subheading_text_color: v }))} />
                                </Field>
                                <Field label="Search Button Color">
                                    <ColorInput value={hero.search_button_color} onChange={v => setHero(p => ({ ...p, search_button_color: v }))} />
                                </Field>
                                <Field label="Display Map">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <div className={`relative w-11 h-6 rounded-full transition-colors ${hero.display_map ? 'bg-primary-600' : 'bg-gray-200'}`}
                                            onClick={() => setHero(p => ({ ...p, display_map: !p.display_map }))}>
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${hero.display_map ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </div>
                                        <span className="text-sm text-gray-600">{hero.display_map ? 'Showing map' : 'Hidden'}</span>
                                    </label>
                                </Field>
                            </SectionCard>

                            {/* Live Preview */}
                            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                                <div className="bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                                    <Eye size={12} /> Hero Preview
                                </div>
                                <div className="relative h-40 flex flex-col items-center justify-center text-center px-6"
                                    style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.6)), url(${hero.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                                    <h2 className="font-extrabold text-lg mb-1" style={{ color: hero.heading_text_color }}>{hero.title}</h2>
                                    <p className="text-sm mb-3" style={{ color: hero.subheading_text_color }}>{hero.subtitle}</p>
                                    <div className="flex rounded-lg overflow-hidden shadow-lg text-sm">
                                        <div className="bg-white px-4 py-2 text-gray-500">Search businesses...</div>
                                        <div className="px-4 py-2 text-white font-bold" style={{ backgroundColor: hero.search_button_color }}>Search</div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ── TAB 3: Home Page Content ──────────────────── */}
                    {tab === 'homepage' && (
                        <>
                            <SectionCard title="Home Page — Main Content" subtitle="Configure main headings and content for the home page" icon={Type}>
                                <div className="md:col-span-2">
                                    <ImageField label="Main Content Image" hint="Recommended: 300×156px, 2:1 ratio, 1MB max" value={homepage.main_image_url} onChange={v => setHomepage(p => ({ ...p, main_image_url: v }))} />
                                </div>
                                <Field label="Heading">
                                    <TextInput value={homepage.heading} onChange={v => setHomepage(p => ({ ...p, heading: v }))} />
                                </Field>
                                <Field label="Text 1">
                                    <TextInput value={homepage.text1} onChange={v => setHomepage(p => ({ ...p, text1: v }))} />
                                </Field>
                                <div className="md:col-span-2">
                                    <Field label="Text 2">
                                        <TextInput value={homepage.text2} onChange={v => setHomepage(p => ({ ...p, text2: v }))} />
                                    </Field>
                                </div>
                            </SectionCard>

                            <SectionCard title="Home Page — Main Content Styling" subtitle="Customize colors for the home page content section" icon={Palette}>
                                <Field label="Heading Color">
                                    <ColorInput value={homepage.heading_color} onChange={v => setHomepage(p => ({ ...p, heading_color: v }))} />
                                </Field>
                                <Field label="Text 1 Color">
                                    <ColorInput value={homepage.text1_color} onChange={v => setHomepage(p => ({ ...p, text1_color: v }))} />
                                </Field>
                                <Field label="Text 2 Color">
                                    <ColorInput value={homepage.text2_color} onChange={v => setHomepage(p => ({ ...p, text2_color: v }))} />
                                </Field>
                            </SectionCard>

                            <SectionCard title="Listings Display Settings" subtitle="Configure how many listings are displayed per page" icon={LayoutTemplate}>
                                <Field label="Featured Listings Per Page">
                                    <SelectInput value={homepage.featured_per_page} onChange={v => setHomepage(p => ({ ...p, featured_per_page: Number(v) }))} options={FEATURED_OPTIONS} />
                                </Field>
                                <Field label="Free Listings Per Page">
                                    <SelectInput value={homepage.free_per_page} onChange={v => setHomepage(p => ({ ...p, free_per_page: Number(v) }))} options={FREE_OPTIONS} />
                                </Field>
                            </SectionCard>

                            <SectionCard title="Contact Information" subtitle="Shown in the header and footer" icon={Globe}>
                                <Field label="Phone Number">
                                    <TextInput value={homepage.phone_number} onChange={v => setHomepage(p => ({ ...p, phone_number: v }))} placeholder="(919) 555-0100" />
                                </Field>
                                <Field label="Contact Email">
                                    <TextInput value={homepage.contact_email} onChange={v => setHomepage(p => ({ ...p, contact_email: v }))} placeholder="hello@yourdirectory.com" />
                                </Field>
                                <div className="md:col-span-2">
                                    <Field label="Address">
                                        <TextInput value={homepage.address} onChange={v => setHomepage(p => ({ ...p, address: v }))} placeholder="Raleigh, NC 27601" />
                                    </Field>
                                </div>
                            </SectionCard>
                        </>
                    )}

                    {/* ── TAB 4: Menu Builder ───────────────────────── */}
                    {tab === 'menu' && (
                        <div className="space-y-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-gray-800">Header Menu</h3>
                                    <p className="text-xs text-gray-400 mt-0.5">Add, reorder, and nest your navigation items</p>
                                </div>
                                <button onClick={addTopLevel}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold transition">
                                    <Plus size={14} /> Add Top-Level Item
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Menu structure */}
                                <div className="space-y-3">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Menu Structure</p>
                                    {menu.items.map(item => (
                                        <div key={item.id} className="space-y-2">
                                            <MenuItemRow
                                                item={item}
                                                onUpdate={(id, data) => setMenu(prev => ({ items: updateMenuItem(id, data, prev.items) }))}
                                                onDelete={deleteMenuItem}
                                            />
                                            <button onClick={() => addSubItem(item.id)}
                                                className="ml-8 flex items-center gap-1 text-xs text-primary-500 hover:text-primary-700 font-medium transition">
                                                <Plus size={12} /> Add sub item to &quot;{item.label}&quot;
                                            </button>
                                        </div>
                                    ))}
                                    {menu.items.length === 0 && (
                                        <div className="text-center py-10 text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                            No menu items yet. Click &quot;Add Top-Level Item&quot; to start.
                                        </div>
                                    )}
                                </div>

                                {/* Live nav preview */}
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Navigation Preview</p>
                                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                        <div className="flex items-center gap-1 px-4 py-3 border-b border-gray-100 bg-gray-50">
                                            <div className="w-8 h-8 rounded bg-gray-200 text-[10px] flex items-center justify-center font-bold text-gray-500">LOGO</div>
                                            <div className="flex items-center gap-1 ml-3">
                                                {menu.items.map(item => (
                                                    <div key={item.id} className="px-3 py-1.5 text-xs font-semibold text-gray-700 hover:text-primary-600 cursor-pointer flex items-center gap-1 rounded hover:bg-primary-50 transition">
                                                        {item.label}
                                                        {item.children && item.children.length > 0 && <ChevronDown size={10} />}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        {menu.items.map(item => (
                                            item.children && item.children.length > 0 && (
                                                <div key={item.id} className="px-4 py-2 border-b border-gray-50 last:border-0">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">{item.label}</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {item.children.map(child => (
                                                            <span key={child.id} className="text-[11px] bg-gray-50 border border-gray-200 text-gray-600 px-2 py-0.5 rounded">
                                                                {child.label}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

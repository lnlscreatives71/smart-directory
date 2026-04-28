'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    Building2, Phone, Globe, Mail, MapPin, FileText,
    Camera, Clock, Save, CheckCircle2, AlertCircle, Plus, Trash2,
    ChevronDown
} from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIMES = Array.from({ length: 48 }, (_, i) => {
    const h = Math.floor(i / 2);
    const m = i % 2 === 0 ? '00' : '30';
    const ampm = h < 12 ? 'AM' : 'PM';
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return { value: `${String(h).padStart(2, '0')}:${m}`, label: `${h12}:${m} ${ampm}` };
});

interface BusinessHour {
    day: string;
    open: string;
    close: string;
    closed: boolean;
}

interface Listing {
    id: number;
    name: string;
    slug: string;
    description: string;
    phone: string;
    website: string;
    contact_name: string;
    contact_email: string;
    street_address: string;
    image_url: string;
    business_hours: BusinessHour[] | null;
    services: string[];
}

function Field({
    label, icon: Icon, value, onChange, placeholder, type = 'text', multiline = false
}: {
    label: string;
    icon: any;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    type?: string;
    multiline?: boolean;
}) {
    return (
        <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
            <div className={`flex ${multiline ? 'items-start' : 'items-center'} gap-3 border border-slate-200 dark:border-slate-700 rounded-xl px-4 ${multiline ? 'py-3' : 'py-3'} bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition`}>
                <Icon size={16} className={`text-slate-400 flex-shrink-0 ${multiline ? 'mt-0.5' : ''}`} />
                {multiline ? (
                    <textarea
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        placeholder={placeholder}
                        rows={4}
                        className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none resize-none"
                    />
                ) : (
                    <input
                        type={type}
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        placeholder={placeholder}
                        className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none"
                    />
                )}
            </div>
        </div>
    );
}

function HoursEditor({ hours, onChange }: { hours: BusinessHour[]; onChange: (h: BusinessHour[]) => void }) {
    const updateDay = (day: string, field: keyof BusinessHour, value: string | boolean) => {
        const existing = hours.find(h => h.day === day);
        if (existing) {
            onChange(hours.map(h => h.day === day ? { ...h, [field]: value } : h));
        } else {
            onChange([...hours, { day, open: '09:00', close: '17:00', closed: false, [field]: value }]);
        }
    };

    const getDay = (day: string): BusinessHour => {
        return hours.find(h => h.day === day) || { day, open: '09:00', close: '17:00', closed: true };
    };

    return (
        <div className="space-y-2">
            {DAYS.map(day => {
                const h = getDay(day);
                return (
                    <div key={day} className="flex items-center gap-3 flex-wrap">
                        <div className="w-24 shrink-0">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{day.slice(0, 3)}</span>
                        </div>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!h.closed}
                                onChange={e => updateDay(day, 'closed', !e.target.checked)}
                                className="rounded border-slate-300"
                            />
                            <span className="text-xs text-slate-500">Open</span>
                        </label>
                        {!h.closed && (
                            <>
                                <select
                                    value={h.open}
                                    onChange={e => updateDay(day, 'open', e.target.value)}
                                    className="border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    {TIMES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                                <span className="text-slate-400 text-xs">to</span>
                                <select
                                    value={h.close}
                                    onChange={e => updateDay(day, 'close', e.target.value)}
                                    className="border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    {TIMES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                            </>
                        )}
                        {h.closed && <span className="text-xs text-slate-400 italic">Closed</span>}
                    </div>
                );
            })}
        </div>
    );
}

function ServicesEditor({ services, onChange }: { services: string[]; onChange: (s: string[]) => void }) {
    const [input, setInput] = useState('');

    const add = () => {
        const trimmed = input.trim();
        if (trimmed && !services.includes(trimmed)) {
            onChange([...services, trimmed]);
            setInput('');
        }
    };

    return (
        <div>
            <div className="flex gap-2 mb-3">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
                    placeholder="e.g. Hair coloring, Balayage..."
                    className="flex-1 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                    type="button"
                    onClick={add}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold transition"
                >
                    <Plus size={14} /> Add
                </button>
            </div>
            {services.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {services.map(s => (
                        <span key={s} className="flex items-center gap-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs font-medium px-3 py-1.5 rounded-full">
                            {s}
                            <button type="button" onClick={() => onChange(services.filter(x => x !== s))}>
                                <Trash2 size={11} className="opacity-60 hover:opacity-100" />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function SmbListingEditorPage() {
    const router = useRouter();
    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');

    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [phone, setPhone] = useState('');
    const [website, setWebsite] = useState('');
    const [contactName, setContactName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [streetAddress, setStreetAddress] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [hours, setHours] = useState<BusinessHour[]>([]);
    const [services, setServices] = useState<string[]>([]);
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetch('/api/smb/listing')
            .then(r => r.json())
            .then(d => {
                if (d.success) {
                    const l: Listing = d.data;
                    setListing(l);
                    setName(l.name || '');
                    setDescription(l.description || '');
                    setPhone(l.phone || '');
                    setWebsite(l.website || '');
                    setContactName(l.contact_name || '');
                    setContactEmail(l.contact_email || '');
                    setStreetAddress(l.street_address || '');
                    setImageUrl(l.image_url || '');
                    setHours(Array.isArray(l.business_hours) ? l.business_hours : []);
                    setServices(Array.isArray(l.services) ? l.services : []);
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const handleImageUpload = async (file: File) => {
        setUploadingImage(true);
        try {
            const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
                method: 'POST',
                body: file,
            });
            const data = await res.json();
            if (data.url) setImageUrl(data.url);
            else throw new Error(data.error || 'Upload failed');
        } catch {
            alert('Image upload failed. Please try again.');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveStatus('idle');
        try {
            const res = await fetch('/api/smb/listing', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description,
                    phone,
                    website,
                    contact_name: contactName,
                    contact_email: contactEmail,
                    street_address: streetAddress,
                    image_url: imageUrl,
                    business_hours: hours,
                    services,
                }),
            });
            const d = await res.json();
            if (d.success) {
                setSaveStatus('saved');
                setTimeout(() => setSaveStatus('idle'), 3000);
            } else {
                setSaveStatus('error');
            }
        } catch {
            setSaveStatus('error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="text-center py-20">
                <p className="text-slate-500">No listing found. Contact support.</p>
            </div>
        );
    }

    // Block editing until approved
    if ((listing as any).claim_status === 'pending') {
        return (
            <div className="max-w-lg mx-auto text-center py-16">
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-5">
                    <Clock size={28} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Awaiting approval</h2>
                <p className="text-slate-500 text-sm">You'll be able to edit your listing once your claim has been approved by our team.</p>
            </div>
        );
    }

    if ((listing as any).claim_status === 'rejected') {
        return (
            <div className="max-w-lg mx-auto text-center py-16">
                <p className="text-slate-500 text-sm">Your claim was not approved. Please contact support.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Listing</h1>
                    <p className="text-slate-500 text-sm mt-1">Changes save immediately and appear on your public profile.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition"
                >
                    {saving ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : saveStatus === 'saved' ? (
                        <CheckCircle2 size={15} />
                    ) : (
                        <Save size={15} />
                    )}
                    {saving ? 'Saving…' : saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}
                </button>
            </div>

            {saveStatus === 'error' && (
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
                    <AlertCircle size={15} /> Failed to save. Please try again.
                </div>
            )}

            {/* Photo */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Camera size={16} className="text-primary-500" /> Business Photo
                </h2>
                <div className="flex items-start gap-4">
                    {imageUrl ? (
                        <Image src={imageUrl} alt="Business" width={96} height={96} className="w-24 h-24 rounded-xl object-cover border border-slate-200 dark:border-slate-700" />
                    ) : (
                        <div className="w-24 h-24 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600">
                            <Camera size={24} className="text-slate-300 dark:text-slate-600" />
                        </div>
                    )}
                    <div className="flex-1 space-y-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingImage}
                            className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:border-primary-400 hover:text-primary-600 transition disabled:opacity-50"
                        >
                            {uploadingImage ? (
                                <span className="w-3.5 h-3.5 border-2 border-slate-300 border-t-primary-500 rounded-full animate-spin" />
                            ) : (
                                <Camera size={14} />
                            )}
                            {uploadingImage ? 'Uploading…' : 'Upload Photo'}
                        </button>
                        <p className="text-xs text-slate-400">JPG, PNG or WebP · Max 5MB</p>
                    </div>
                </div>
            </div>

            {/* Business Info */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Building2 size={16} className="text-primary-500" /> Business Information
                </h2>
                <Field label="Business Name" icon={Building2} value={name} onChange={setName} placeholder="Your Business Name" />
                <Field label="Description" icon={FileText} value={description} onChange={setDescription} placeholder="Tell customers what makes your business special..." multiline />
                <Field label="Phone" icon={Phone} value={phone} onChange={setPhone} placeholder="(919) 555-0100" type="tel" />
                <Field label="Website" icon={Globe} value={website} onChange={setWebsite} placeholder="https://yourbusiness.com" type="url" />
                <Field label="Street Address" icon={MapPin} value={streetAddress} onChange={setStreetAddress} placeholder="123 Main St, Raleigh, NC 27601" />
            </div>

            {/* Contact Info */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Mail size={16} className="text-primary-500" /> Contact Details
                </h2>
                <Field label="Your Name" icon={Building2} value={contactName} onChange={setContactName} placeholder="Jane Smith" />
                <Field label="Contact Email" icon={Mail} value={contactEmail} onChange={setContactEmail} placeholder="you@yourbusiness.com" type="email" />
            </div>

            {/* Services */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-primary-500" /> Services Offered
                </h2>
                <ServicesEditor services={services} onChange={setServices} />
            </div>

            {/* Business Hours */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock size={16} className="text-primary-500" /> Business Hours
                </h2>
                <HoursEditor hours={hours} onChange={setHours} />
            </div>

            {/* Save button (bottom) */}
            <div className="flex items-center justify-between pb-8">
                <button
                    type="button"
                    onClick={() => router.push('/smb')}
                    className="px-4 py-2.5 text-sm text-slate-500 hover:text-slate-700 transition"
                >
                    ← Back to Dashboard
                </button>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition"
                >
                    {saving ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Save size={15} />
                    )}
                    {saving ? 'Saving…' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
}

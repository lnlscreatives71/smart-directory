'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plan, Listing } from '@/lib/types';
import { CheckCircle2, AlertCircle, Save, Tags, X, Plus, ImageIcon, Loader2 } from 'lucide-react';

interface Tag {
    id: number;
    name: string;
    slug: string;
    icon: string | null;
    color: string;
}

export default function ListingForm({ initialData = null, agencyId }: { initialData?: Listing | null, agencyId?: number }) {
    const router = useRouter();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(false);
    const [availableTags, setAvailableTags] = useState<Tag[]>([]);
    const [selectedTags, setSelectedTags] = useState<number[]>([]);
    const [tagSearch, setTagSearch] = useState('');

    // Toast State
    const [toast, setToast] = useState<{ show: boolean, type: 'success' | 'error', message: string }>({ show: false, type: 'success', message: '' });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.image_url || null);
    const [googlePhotoUrl, setGooglePhotoUrl] = useState<string | null>(null);
    const [fetchingPhoto, setFetchingPhoto] = useState(false);
    const [photoFetchMsg, setPhotoFetchMsg] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        contact_name: initialData?.contact_name || '',
        contact_email: initialData?.contact_email || '',
        phone: initialData?.phone || '',
        website: initialData?.website || '',
        slug: initialData?.slug || '',
        category: initialData?.category || '',
        description: initialData?.description || '',
        location_city: initialData?.location_city || '',
        location_state: initialData?.location_state || 'NC',
        location_region: initialData?.location_region || 'Triangle',
        services: initialData?.services?.join(', ') || '',
        plan_id: initialData?.plan_id || 1,
        featured: initialData?.featured || false,
        claimed: initialData?.claimed || false,
        feature_flags: initialData?.feature_flags || {
            highlight_on_home: false,
            priority_ranking: false,
            ai_chat_widget: false,
            booking_calendar: false,
            extra_images: false
        }
    });

    useEffect(() => {
        fetch('/api/plans').then(res => res.json()).then(data => {
            if (data.success) setPlans(data.data);
        });
        
        // Fetch available tags
        if (agencyId) {
            fetch(`/api/tags?agency_id=${agencyId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.data) setAvailableTags(data.data);
                });
            
            // Fetch listing's current tags if editing
            if (initialData?.id) {
                fetch(`/api/listing-tags?listing_id=${initialData.id}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.data) {
                            setSelectedTags(data.data.map((t: Tag) => t.id));
                        }
                    });
            }
        }
    }, []);

    const fetchGooglePhoto = async () => {
        if (!formData.name || !formData.location_city) {
            setPhotoFetchMsg('Enter business name and city first.');
            return;
        }
        setFetchingPhoto(true);
        setPhotoFetchMsg(null);
        try {
            const res = await fetch(
                `/api/places-photo?name=${encodeURIComponent(formData.name)}&city=${encodeURIComponent(formData.location_city)}&state=${encodeURIComponent(formData.location_state)}`
            );
            const data = await res.json();
            if (data.success) {
                setGooglePhotoUrl(data.imageUrl);
                setPreviewUrl(data.imageUrl);
                setPhotoFetchMsg(`Found: ${data.placeName || formData.name}`);
            } else {
                setPhotoFetchMsg(data.error || 'No photo found on Google.');
            }
        } catch {
            setPhotoFetchMsg('Failed to fetch photo.');
        } finally {
            setFetchingPhoto(false);
        }
    };

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ show: true, type, message });
        setTimeout(() => setToast({ show: false, type: 'success', message: '' }), 4000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Basic Validation
        if (!formData.name || !formData.slug || !formData.category || !formData.location_city || !formData.plan_id) {
            showToast('error', 'Please fill out all required fields.');
            setLoading(false);
            return;
        }

        let image_url = googlePhotoUrl || initialData?.image_url;

        // Auto-upload image to Vercel Blob if a file was selected
        if (imageFile && formData.feature_flags.extra_images) {
            try {
                const res = await fetch(`/api/upload?filename=${encodeURIComponent(imageFile.name)}`, {
                    method: 'POST',
                    body: imageFile,
                });
                if (res.ok) {
                    const blob = await res.json();
                    image_url = blob.url;
                } else {
                    showToast('error', 'Failed to upload image. Please try again.');
                    setLoading(false);
                    return;
                }
            } catch (error) {
                showToast('error', 'Network error while uploading image.');
                setLoading(false);
                return;
            }
        }

        const payload = {
            ...formData,
            image_url,
            services: formData.services.split(',').map(s => s.trim()).filter(Boolean),
        };

        try {
            const url = initialData ? `/api/listings/${initialData.id}` : '/api/listings';
            const method = initialData ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const result = initialData ? await res.json() : await res.json();
                const listingId = initialData?.id || result.data?.id;
                
                showToast('success', initialData ? 'Listing updated successfully!' : 'Listing created successfully!');
                
                // Update tags if we have a listing ID
                if (listingId && agencyId) {
                    // Remove old tags
                    const oldTagsRes = await fetch(`/api/listing-tags?listing_id=${listingId}`);
                    if (oldTagsRes.ok) {
                        const oldTagsData = await oldTagsRes.json();
                        if (oldTagsData.data) {
                            for (const oldTag of oldTagsData.data) {
                                if (!selectedTags.includes(oldTag.id)) {
                                    await fetch(`/api/listing-tags?listing_id=${listingId}&tag_id=${oldTag.id}`, { method: 'DELETE' });
                                }
                            }
                        }
                    }
                    
                    // Add new tags
                    for (const tagId of selectedTags) {
                        await fetch('/api/listing-tags', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ listing_id: listingId, tag_id: tagId })
                        });
                    }
                }
                
                if (!initialData) {
                    router.push('/dashboard/listings');
                } else {
                    router.refresh();
                }
            } else {
                const err = await res.json();
                showToast('error', err.error || 'Failed to save listing. Please try again.');
            }
        } catch (err) {
            showToast('error', 'Network error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const selectedPlan = plans.find(p => p.id === Number(formData.plan_id));

    // Layout helper
    const SectionHeading = ({ title, subtitle }: { title: string, subtitle?: string }) => (
        <div className="mb-6 border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
            {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
    );

    return (
        <div className="relative">
            {/* Toast Notification */}
            {toast.show && (
                <div className={`fixed top-4 right-4 z-50 flex items-center p-4 pr-6 rounded-lg shadow-lg border animate-in slide-in-from-top-2 fade-in ${toast.type === 'success' ? 'bg-secondary-50 border-secondary-200 text-secondary-800 dark:bg-secondary-950/50 dark:border-secondary-900 dark:text-secondary-400' : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/50 dark:border-red-900 dark:text-red-400'}`}>
                    {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-3" /> : <AlertCircle className="w-5 h-5 mr-3" />}
                    <p className="font-medium text-sm">{toast.message}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-12">
                {/* Section 1: Business Info */}
                <section className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <SectionHeading title="Business Info" subtitle="Core details used for directory listing and search." />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold mb-1.5">Business Name <span className="text-red-500">*</span></label>
                            <input required type="text" className="w-full p-2.5 border border-slate-300 rounded-lg dark:bg-slate-950 dark:border-slate-800 focus:ring-2 focus:ring-primary-500/50 outline-none"
                                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1.5">Website</label>
                            <input type="url" className="w-full p-2.5 border border-slate-300 rounded-lg dark:bg-slate-950 dark:border-slate-800 focus:ring-2 focus:ring-primary-500/50 outline-none"
                                placeholder="https://example.com"
                                value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1.5">Phone Number</label>
                            <input type="tel" className="w-full p-2.5 border border-slate-300 rounded-lg dark:bg-slate-950 dark:border-slate-800 focus:ring-2 focus:ring-primary-500/50 outline-none"
                                placeholder="(555) 123-4567"
                                value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1.5">Contact Name <span className="text-slate-500 text-xs">(Owner/Manager)</span></label>
                            <input type="text" className="w-full p-2.5 border border-slate-300 rounded-lg dark:bg-slate-950 dark:border-slate-800 focus:ring-2 focus:ring-primary-500/50 outline-none"
                                placeholder="Jane Doe"
                                value={formData.contact_name} onChange={e => setFormData({ ...formData, contact_name: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1.5">Contact Email <span className="text-slate-500 text-xs">(for CRM Outreach)</span></label>
                            <input type="email" className="w-full p-2.5 border border-slate-300 rounded-lg dark:bg-slate-950 dark:border-slate-800 focus:ring-2 focus:ring-primary-500/50 outline-none"
                                placeholder="owner@business.com"
                                value={formData.contact_email} onChange={e => setFormData({ ...formData, contact_email: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1.5">URL Slug <span className="text-red-500">*</span></label>
                            <input required type="text" className="w-full p-2.5 border border-slate-300 rounded-lg dark:bg-slate-950 dark:border-slate-800 focus:ring-2 focus:ring-primary-500/50 outline-none"
                                value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} />
                            <p className="text-xs text-slate-500 mt-1.5">Used in the URL: /biz/<b>{formData.slug || 'your-slug'}</b></p>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1.5">Category <span className="text-red-500">*</span></label>
                            <select 
                                required 
                                className="w-full p-2.5 border border-slate-300 rounded-lg dark:bg-slate-950 dark:border-slate-800 focus:ring-2 focus:ring-primary-500/50 outline-none bg-white dark:bg-slate-950 appearance-none"
                                value={formData.category} 
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="" disabled>Select a category...</option>
                                <optgroup label="Dining">
                                    <option value="Restaurants">Restaurants</option>
                                    <option value="Cafés & Brunch">Cafés & Brunch</option>
                                    <option value="Pizza">Pizza</option>
                                    <option value="Sushi">Sushi</option>
                                    <option value="Bakeries">Bakeries</option>
                                </optgroup>
                                <optgroup label="Services">
                                    <option value="HVAC">HVAC</option>
                                    <option value="Plumbing">Plumbing</option>
                                    <option value="Real Estate">Real Estate</option>
                                    <option value="Law Firms">Law Firms</option>
                                    <option value="Professional Services">Professional Services</option>
                                    <option value="Home Services">Home Services</option>
                                </optgroup>
                                <optgroup label="Retail">
                                    <option value="Clothing">Clothing</option>
                                    <option value="Electronics">Electronics</option>
                                    <option value="Home Goods">Home Goods</option>
                                </optgroup>
                                <optgroup label="Health & Wellness">
                                    <option value="Gyms">Gyms</option>
                                    <option value="Yoga Studios">Yoga Studios</option>
                                    <option value="Massage Therapy">Massage Therapy</option>
                                    <option value="Med Spas">Med Spas</option>
                                    <option value="Health">Health</option>
                                </optgroup>
                                <optgroup label="Other">
                                    <option value="Education">Education</option>
                                    <option value="Pet Services">Pet Services</option>
                                </optgroup>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1.5">City <span className="text-red-500">*</span></label>
                                <input required type="text" className="w-full p-2.5 border border-slate-300 rounded-lg dark:bg-slate-950 dark:border-slate-800 focus:ring-2 focus:ring-primary-500/50 outline-none"
                                    value={formData.location_city} onChange={e => setFormData({ ...formData, location_city: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1.5">State</label>
                                <input type="text" className="w-full p-2.5 border border-slate-300 rounded-lg dark:bg-slate-950 dark:border-slate-800 focus:ring-2 focus:ring-primary-500/50 outline-none"
                                    value={formData.location_state} onChange={e => setFormData({ ...formData, location_state: e.target.value })} />
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold mb-1.5">Description <span className="text-red-500">*</span></label>
                            <textarea required rows={4} className="w-full p-3 border border-slate-300 rounded-lg dark:bg-slate-950 dark:border-slate-800 focus:ring-2 focus:ring-primary-500/50 outline-none resize-y"
                                value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                        </div>
                        
                        {/* Google Photo Fetch */}
                        <div className="md:col-span-2 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-sm font-semibold">Business Photo</label>
                                <button
                                    type="button"
                                    onClick={fetchGooglePhoto}
                                    disabled={fetchingPhoto}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition disabled:opacity-50"
                                >
                                    {fetchingPhoto ? <Loader2 size={13} className="animate-spin" /> : <ImageIcon size={13} />}
                                    {fetchingPhoto ? 'Fetching...' : 'Fetch from Google'}
                                </button>
                            </div>
                            <div className="flex items-center gap-4">
                                {previewUrl && (
                                    <img src={previewUrl} alt="Preview" className="w-24 h-24 object-cover rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm shrink-0" />
                                )}
                                <div className="text-xs text-slate-500 space-y-1">
                                    {photoFetchMsg && (
                                        <p className={googlePhotoUrl ? 'text-emerald-500 font-medium' : 'text-red-400'}>{photoFetchMsg}</p>
                                    )}
                                    {!previewUrl && <p>Enter the business name and city above, then click Fetch from Google.</p>}
                                    {googlePhotoUrl && (
                                        <button type="button" onClick={() => { setGooglePhotoUrl(null); setPreviewUrl(null); setPhotoFetchMsg(null); }} className="text-slate-400 hover:text-red-400 underline">
                                            Remove photo
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {formData.feature_flags.extra_images && (
                            <div className="md:col-span-2 border border-primary-500/20 bg-primary-50/50 dark:bg-primary-900/10 p-5 rounded-xl border-dashed">
                                <label className="block text-sm font-semibold text-primary-800 dark:text-primary-300 mb-2">
                                    Premium High-Res Storefront Photo
                                </label>
                                <div className="flex items-center gap-4">
                                    {previewUrl && (
                                        <img src={previewUrl} alt="Preview" className="w-24 h-24 object-cover rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm" />
                                    )}
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setImageFile(e.target.files[0]);
                                                setPreviewUrl(URL.createObjectURL(e.target.files[0]));
                                            }
                                        }}
                                        className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-600 file:text-white hover:file:bg-primary-700 transition"
                                    />
                                </div>
                                <p className="text-xs text-primary-600/70 dark:text-primary-400/70 mt-3 font-medium">Uploaded image will override the automatic Google Maps photo fetch.</p>
                            </div>
                        )}
                        
                    </div>
                </section>

                {/* Section 2: Services & Business Tags */}
                <section className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <SectionHeading title="Services & Business Tags" subtitle="Tags and status badges displayed on the profile." />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-semibold mb-1.5">Services (comma separated keywords)</label>
                            <textarea rows={3} className="w-full p-3 border border-slate-300 rounded-lg dark:bg-slate-950 dark:border-slate-800 focus:ring-2 focus:ring-primary-500/50 outline-none resize-y placeholder:text-slate-400"
                                placeholder="e.g. WiFi, Free Parking, Real Estate Consulting"
                                value={formData.services} onChange={e => setFormData({ ...formData, services: e.target.value })} />
                            <p className="text-xs text-slate-500 mt-2">These act as filter parameters on the public directory.</p>
                        </div>

                        <div className="space-y-4 pt-2">
                            <label className="flex items-center space-x-3 p-4 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                    checked={formData.featured} onChange={e => setFormData({ ...formData, featured: e.target.checked })} />
                                <div>
                                    <p className="font-semibold text-sm">Featured Profile</p>
                                    <p className="text-xs text-slate-500">Adds visual "Featured" UI badges directly onto cards.</p>
                                </div>
                            </label>
                            <label className="flex items-center space-x-3 p-4 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                    checked={formData.claimed} onChange={e => setFormData({ ...formData, claimed: e.target.checked })} />
                                <div>
                                    <p className="font-semibold text-sm">Owner Claimed</p>
                                    <p className="text-xs text-slate-500">Marks the business as officially verified by the owner.</p>
                                </div>
                            </label>
                        </div>
                    </div>
                    
                    {/* Business Tags Selector */}
                    {availableTags.length > 0 && (
                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <label className="block text-sm font-semibold mb-3 flex items-center gap-2">
                                <Tags size={18} /> Business Tags
                            </label>
                            <p className="text-sm text-slate-500 mb-4">Select tags that apply to this business. These tags can be used to build custom navigation menus.</p>
                            
                            {/* Search */}
                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Search tags..."
                                    value={tagSearch}
                                    onChange={(e) => setTagSearch(e.target.value)}
                                    className="w-full md:w-64 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            
                            {/* Selected Tags */}
                            {selectedTags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {availableTags
                                        .filter(tag => selectedTags.includes(tag.id))
                                        .map(tag => (
                                            <span
                                                key={tag.id}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border"
                                                style={{ 
                                                    backgroundColor: `${tag.color}20`,
                                                    borderColor: tag.color,
                                                    color: tag.color
                                                }}
                                            >
                                                {tag.icon && <span className="mr-1">{tag.icon}</span>}
                                                {tag.name}
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedTags(prev => prev.filter(id => id !== tag.id))}
                                                    className="ml-1 hover:opacity-70"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </span>
                                        ))}
                                </div>
                            )}
                            
                            {/* Available Tags */}
                            <div className="flex flex-wrap gap-2">
                                {availableTags
                                    .filter(tag => {
                                        const matchesSearch = tag.name.toLowerCase().includes(tagSearch.toLowerCase());
                                        const isSelected = selectedTags.includes(tag.id);
                                        return matchesSearch && !isSelected;
                                    })
                                    .map(tag => (
                                        <button
                                            key={tag.id}
                                            type="button"
                                            onClick={() => setSelectedTags(prev => [...prev, tag.id])}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border border-slate-200 dark:border-slate-700 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition"
                                            style={{ color: tag.color }}
                                        >
                                            {tag.icon && <span className="mr-1">{tag.icon}</span>}
                                            {tag.name}
                                            <Plus size={14} />
                                        </button>
                                    ))}
                            </div>
                        </div>
                    )}
                </section>

                {/* Section 3: Plan & Features */}
                <section className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm border-t-4 border-t-secondary-500">
                    <SectionHeading title="Plan & Feature Flags" subtitle="Control monetization tier and explicit UI gating for this business." />

                    <div className="mb-8">
                        <label className="block text-sm font-semibold mb-2">Assigned Subscription Plan <span className="text-red-500">*</span></label>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <select
                                className="w-full sm:w-1/3 p-3 border border-slate-300 rounded-lg dark:bg-slate-950 dark:border-slate-800 focus:ring-2 focus:ring-secondary-500/50 outline-none font-medium"
                                value={formData.plan_id}
                                onChange={e => setFormData({ ...formData, plan_id: Number(e.target.value) })}
                            >
                                {plans.map(p => <option key={p.id} value={p.id}>{p.name.toUpperCase()}</option>)}
                            </select>

                            {selectedPlan && (
                                <div className="flex-1 flex items-center p-3 bg-secondary-50 border border-secondary-100 dark:bg-secondary-950/20 dark:border-secondary-900/50 rounded-lg">
                                    <span className="font-bold text-lg text-secondary-700 dark:text-secondary-400 mr-3">${selectedPlan.monthly_price}/mo</span>
                                    <span className="text-sm text-secondary-800 dark:text-secondary-200/70 leading-tight">{selectedPlan.description}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <h4 className="font-bold mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">Component Rendering Overrides</h4>
                    <p className="text-sm text-slate-500 mb-5">Manually enable or disable premium features specifically for this profile regardless of base plan limitations.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.keys(formData.feature_flags).map(flagKey => (
                            <label key={flagKey} className={`flex items-start space-x-3 p-4 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition ${formData.feature_flags[flagKey] ? 'border-secondary-500/50 bg-secondary-50/30' : 'border-slate-200 dark:border-slate-800'}`}>
                                <input
                                    type="checkbox"
                                    className="mt-0.5 w-5 h-5 rounded border-slate-300 text-secondary-600 focus:ring-secondary-500 dark:border-slate-600 dark:bg-slate-800"
                                    checked={!!formData.feature_flags[flagKey]}
                                    onChange={e => {
                                        setFormData({
                                            ...formData,
                                            feature_flags: {
                                                ...formData.feature_flags,
                                                [flagKey]: e.target.checked
                                            }
                                        });
                                    }}
                                />
                                <div>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white block capitalize">{flagKey.replace(/_/g, ' ')}</span>
                                    <span className="text-[11px] text-slate-500 font-medium">
                                        {flagKey === 'ai_chat_widget' && 'Renders real-time GenAI lead bot.'}
                                        {flagKey === 'highlight_on_home' && 'Displays as verified premium card.'}
                                        {flagKey === 'priority_ranking' && 'Ranks at top of ILIKE queries.'}
                                        {flagKey === 'booking_calendar' && 'Shows Calendly/Booking block.'}
                                        {flagKey === 'extra_images' && 'Unlocks rich media carousel.'}
                                    </span>
                                </div>
                            </label>
                        ))}
                    </div>
                </section>

                {/* Global Save Action Row */}
                <div className="sticky bottom-6 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-2xl flex justify-between items-center">
                    <p className="text-sm text-slate-500 hidden sm:block px-2">Ensure all required <span className="text-red-500">*</span> fields are valid.</p>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button type="button" onClick={() => router.back()} className="px-6 py-2.5 rounded-lg font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition w-full sm:w-auto">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="px-8 py-2.5 rounded-lg font-bold bg-primary-600 hover:bg-primary-700 text-white shadow hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-full sm:w-auto">
                            {loading ? (
                                <span className="flex items-center"><svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Saving...</span>
                            ) : (
                                <span className="flex items-center"><Save className="w-4 h-4 mr-2" /> {initialData ? 'Save Changes' : 'Create Listing'}</span>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

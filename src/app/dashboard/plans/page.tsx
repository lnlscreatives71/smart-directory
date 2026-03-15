'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Loader2, X, Check, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import { Plan } from '@/lib/types';

const EMPTY_PLAN: Omit<Plan, 'id'> = {
    name: '',
    monthly_price: 0,
    annual_price: 0,
    description: '',
    limits: { images: 1, categories: 1 },
    active: true,
    is_default: false,
    features: [],
};

import { ALL_FEATURES } from '@/lib/constants';
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            onClick={() => onChange(!checked)}
            className={`relative w-12 h-6 rounded-full transition-colors focus:outline-none ${checked ? 'bg-primary-600' : 'bg-gray-200'}`}
        >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-7' : 'translate-x-1'}`} />
        </button>
    );
}

function PlanModal({
    plan, onClose, onSave,
}: {
    plan: Partial<Plan> | null;
    onClose: () => void;
    onSave: (data: Omit<Plan, 'id'>) => Promise<void>;
}) {
    const isNew = !plan?.id;
    const [form, setForm] = useState<Omit<Plan, 'id'>>({
        ...EMPTY_PLAN,
        ...(plan ? { ...plan } : {}),
    } as Omit<Plan, 'id'>);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [customFeature, setCustomFeature] = useState('');

    const set = (key: keyof Omit<Plan, 'id'>, value: unknown) => setForm(p => ({ ...p, [key]: value }));

    const submit = async () => {
        if (!form.name.trim()) { setError('Plan name is required.'); return; }
        setSaving(true);
        setError('');
        try {
            await onSave(form);
            onClose();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Failed to save plan.');
        } finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">{isNew ? 'Add New Plan' : `Edit Plan — ${plan?.name}`}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition"><X size={20} /></button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
                            <AlertTriangle size={15} /> {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Plan Name *</label>
                        <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Community Listing"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Monthly Price ($)</label>
                            <input type="number" min="0" step="0.01" value={form.monthly_price}
                                onChange={e => set('monthly_price', parseFloat(e.target.value) || 0)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Annual Price ($)</label>
                            <input type="number" min="0" step="0.01" value={form.annual_price}
                                onChange={e => set('annual_price', parseFloat(e.target.value) || 0)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                        <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} placeholder="Describe what this plan includes..."
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Max Images</label>
                            <input type="number" min="1" value={form.limits?.images ?? 1}
                                onChange={e => set('limits', { ...form.limits, images: parseInt(e.target.value) || 1 })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Max Categories</label>
                            <input type="number" min="1" value={form.limits?.categories ?? 1}
                                onChange={e => set('limits', { ...form.limits, categories: parseInt(e.target.value) || 1 })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>
                    </div>

                    <div className="flex items-center gap-6 pt-1">
                        <label className="flex items-center gap-2.5 cursor-pointer">
                            <Toggle checked={form.active} onChange={v => set('active', v)} />
                            <span className="text-sm font-medium text-gray-700">Active</span>
                        </label>
                        <label className="flex items-center gap-2.5 cursor-pointer">
                            <input type="checkbox" checked={form.is_default} onChange={e => set('is_default', e.target.checked)}
                                className="w-4 h-4 rounded text-primary-600 focus:ring-primary-400" />
                            <span className="text-sm font-medium text-gray-700">Set as Default</span>
                        </label>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-semibold text-gray-700">Included Features</label>
                            <span className="text-xs text-gray-500">Check features for this plan</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">
                            These features will be available to businesses on this plan. Uncheck to make them premium-only.
                        </p>
                        <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto px-1 mb-3">
                            {Array.from(new Set([...ALL_FEATURES, ...(form.features || [])])).map(feat => {
                                const included = (form.features || []).includes(feat);
                                return (
                                    <label key={feat} className="flex items-center gap-2 cursor-pointer group">
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${included ? 'bg-primary-600 border-primary-600 text-white' : 'border-gray-300 bg-white group-hover:border-primary-400'}`}>
                                            {included && <Check size={12} strokeWidth={3} />}
                                        </div>
                                        <span className="text-sm text-gray-700 group-hover:text-gray-900 truncate" title={feat}>{feat}</span>
                                        <input 
                                            type="checkbox" 
                                            className="hidden" 
                                            checked={included} 
                                            onChange={() => {
                                                const cur = form.features || [];
                                                set('features', included ? cur.filter(f => f !== feat) : [...cur, feat]);
                                            }}
                                        />
                                    </label>
                                );
                            })}
                        </div>
                        
                        {/* Add custom feature */}
                        <div className="flex items-center gap-2 px-1">
                            <input 
                                type="text" 
                                value={customFeature}
                                onChange={e => setCustomFeature(e.target.value)}
                                placeholder="Add custom feature (e.g. SEO Audit)..."
                                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (customFeature.trim() && !(form.features || []).includes(customFeature.trim())) {
                                            set('features', [...(form.features || []), customFeature.trim()]);
                                            setCustomFeature('');
                                        }
                                    }
                                }}
                            />
                            <button 
                                type="button"
                                onClick={() => {
                                    if (customFeature.trim() && !(form.features || []).includes(customFeature.trim())) {
                                        set('features', [...(form.features || []), customFeature.trim()]);
                                        setCustomFeature('');
                                    }
                                }}
                                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
                    <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 transition">Cancel</button>
                    <button onClick={submit} disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition shadow-sm disabled:opacity-60">
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        {saving ? 'Saving...' : isNew ? 'ADD PLAN' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function PlansPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<{ open: boolean; plan: Partial<Plan> | null }>({ open: false, plan: null });
    const [deleteConfirm, setDeleteConfirm] = useState<Plan | null>(null);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const [tab, setTab] = useState<'pricing' | 'advanced'>('pricing');

    const showToast = (type: 'success' | 'error', msg: string) => {
        setToast({ type, msg }); setTimeout(() => setToast(null), 3500);
    };

    const fetchPlans = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/plans');
            const data = await res.json();
            if (data.success) setPlans(data.data as Plan[]);
        } catch { showToast('error', 'Failed to load plans.'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchPlans(); }, [fetchPlans]);

    const handleSave = async (formData: Omit<Plan, 'id'>) => {
        const isEdit = !!modal.plan?.id;
        const url = isEdit ? `/api/plans/${modal.plan!.id}` : '/api/plans';
        const method = isEdit ? 'PATCH' : 'POST';

        const res = await fetch(url, {
            method, headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Save failed');
        showToast('success', isEdit ? 'Plan updated.' : 'Plan created.');
        fetchPlans();
    };

    const toggleActive = async (plan: Plan) => {
        await fetch(`/api/plans/${plan.id}`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ active: !plan.active }),
        });
        setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, active: !p.active } : p));
    };

    const handleDelete = async (plan: Plan) => {
        const res = await fetch(`/api/plans/${plan.id}`, { method: 'DELETE' });
        const data = await res.json();
        if (!data.success) { showToast('error', data.error || 'Delete failed.'); return; }
        showToast('success', `"${plan.name}" deleted.`);
        setDeleteConfirm(null);
        fetchPlans();
    };

    const fmt = (n: number) => n === 0 ? '$0' : `$${n}`;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        Plans & Pricing
                        <span className="w-5 h-5 rounded-full bg-gray-200 dark:bg-slate-700 text-gray-500 text-xs flex items-center justify-center font-bold cursor-help" title="Configure your subscription plans and feature gating">?</span>
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Set your own pricing and decide which features are free vs premium. These plans are what YOU charge small businesses.</p>
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <div className={`flex items-center gap-3 p-4 rounded-xl text-sm font-medium ${toast.type === 'success' ? 'bg-secondary-50 text-secondary-700 border border-secondary-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                    {toast.msg}
                </div>
            )}

            {/* Strategy Guide */}
            <div className="bg-gradient-to-r from-primary-600/10 to-primary-500/10 border border-primary-500/30 rounded-2xl p-6">
                <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-primary-400" />
                    Pricing Strategy Tips
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-300">
                    <div>
                        <strong className="text-white block mb-1">Free Plan</strong>
                        Basic exposure only. Get businesses in the door, then upsell premium.
                    </div>
                    <div>
                        <strong className="text-white block mb-1">Premium ($29-49/mo)</strong>
                        AI Chat + Booking. Most popular for small businesses.
                    </div>
                    <div>
                        <strong className="text-white block mb-1">Pro ($97-197/mo)</strong>
                        All features + priority. For serious growth businesses.
                    </div>
                </div>
            </div>

            {/* Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                {/* Tabs + Add button */}
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 px-1">
                    <div className="flex">
                        {[{ id: 'pricing', label: 'Price and Planning' }, { id: 'advanced', label: 'Advanced Settings' }].map(t => (
                            <button key={t.id} onClick={() => setTab(t.id as 'pricing' | 'advanced')}
                                className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${tab === t.id ? 'text-gray-900 border-gray-900 dark:text-white dark:border-white' : 'text-gray-400 border-transparent hover:text-gray-600'}`}>
                                {t.label}
                            </button>
                        ))}
                    </div>
                    <div className="pr-4">
                        <button onClick={() => setModal({ open: true, plan: null })}
                            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white rounded-xl text-sm font-bold transition shadow-sm">
                            <Plus size={15} /> ADD PLAN
                        </button>
                    </div>
                </div>

                {/* Pricing Tab */}
                {tab === 'pricing' && (
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 size={24} className="animate-spin text-primary-500" />
                            </div>
                        ) : (
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-gray-100 dark:border-slate-800">
                                    <tr className="text-gray-500 dark:text-slate-400 text-xs uppercase tracking-wide">
                                        <th className="px-6 py-4 font-semibold w-8"></th>
                                        <th className="px-6 py-4 font-semibold">Plan Name</th>
                                        <th className="px-6 py-4 font-semibold text-center">Monthly</th>
                                        <th className="px-6 py-4 font-semibold text-center">Annual</th>
                                        <th className="px-6 py-4 font-semibold text-center">Active</th>
                                        <th className="px-6 py-4 font-semibold text-center">Edit</th>
                                        <th className="px-6 py-4 font-semibold text-center">Delete</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                                    {plans.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-14 text-center text-gray-400">
                                                No plans yet. Click ADD PLAN to create your first tier.
                                            </td>
                                        </tr>
                                    ) : plans.map(plan => (
                                        <tr key={plan.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="text-gray-300 cursor-grab text-lg leading-none">⠿</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-semibold text-gray-900 dark:text-white">{plan.name}</span>
                                                    {plan.is_default && (
                                                        <span className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                                                            DEFAULT
                                                        </span>
                                                    )}
                                                </div>
                                                {plan.description && (
                                                    <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{plan.description}</p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center font-semibold text-gray-700 dark:text-slate-300">
                                                {fmt(plan.monthly_price)}
                                            </td>
                                            <td className="px-6 py-4 text-center font-semibold text-gray-700 dark:text-slate-300">
                                                {fmt(plan.annual_price ?? 0)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center">
                                                    <Toggle checked={plan.active ?? true} onChange={() => toggleActive(plan)} />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button onClick={() => setModal({ open: true, plan })}
                                                    className="text-gray-400 hover:text-primary-600 transition p-1.5 rounded-lg hover:bg-primary-50">
                                                    <Pencil size={15} />
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button onClick={() => setDeleteConfirm(plan)}
                                                    className="text-gray-400 hover:text-red-500 transition p-1.5 rounded-lg hover:bg-red-50">
                                                    <Trash2 size={15} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {/* Pagination */}
                        {plans.length > 0 && (
                            <div className="flex items-center justify-center gap-2 py-4 border-t border-gray-50 dark:border-slate-800">
                                <button className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 font-medium transition">← Previous</button>
                                <span className="w-8 h-8 flex items-center justify-center bg-slate-900 text-white rounded-lg text-sm font-bold">1</span>
                                <button className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 font-medium transition">Next →</button>
                            </div>
                        )}
                    </div>
                )}

                {/* Advanced Tab */}
                {tab === 'advanced' && (
                    <div className="p-8 space-y-5">
                        <p className="text-sm text-gray-500 mb-6">Configure advanced billing and upgrade settings for your directory plans.</p>
                        {plans.map(plan => (
                            <div key={plan.id} className="flex items-center justify-between p-5 rounded-xl border border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/40 transition">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2.5 h-2.5 rounded-full ${plan.active ? 'bg-secondary-500' : 'bg-gray-300'}`} />
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{plan.name}</p>
                                        <p className="text-xs text-gray-400">{plan.limits?.images ?? 1} images · {plan.limits?.categories ?? 1} categories</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-slate-400">
                                    <div className="text-right">
                                        <p className="font-bold">{fmt(plan.monthly_price)}<span className="font-normal text-gray-400">/mo</span></p>
                                        <p className="text-xs text-gray-400">{fmt(plan.annual_price ?? 0)}/yr</p>
                                    </div>
                                    <button onClick={() => setModal({ open: true, plan })}
                                        className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-800 transition">
                                        Edit <ChevronRight size={12} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {modal.open && (
                <PlanModal
                    plan={modal.plan}
                    onClose={() => setModal({ open: false, plan: null })}
                    onSave={handleSave}
                />
            )}

            {/* Delete Confirm */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
                        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={22} className="text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Delete &ldquo;{deleteConfirm.name}&rdquo;?</h3>
                        <p className="text-sm text-gray-500 mb-6">This cannot be undone. Listings on this plan must be reassigned first.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                            <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

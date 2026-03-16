'use client';

import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Edit2 } from 'lucide-react';

interface Category {
    id: number;
    name: string;
    slug: string;
    icon?: string;
    order_index: number;
}

export default function CategoryManagerPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({ name: '', slug: '', icon: '' });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            const data = await res.json();
            if (data.success) {
                setCategories(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!editForm.name || !editForm.slug) return;
        
        setSaving(true);
        try {
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingId ? { ...editForm, id: editingId } : editForm)
            });
            const data = await res.json();
            if (data.success) {
                fetchCategories();
                setEditForm({ name: '', slug: '', icon: '' });
                setEditingId(null);
            }
        } catch (err) {
            console.error('Failed to save category:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this category?')) return;
        
        try {
            await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
            fetchCategories();
        } catch (err) {
            console.error('Failed to delete category:', err);
        }
    };

    const startEdit = (cat: Category) => {
        setEditingId(cat.id);
        setEditForm({ name: cat.name, slug: cat.slug, icon: cat.icon || '' });
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Category Manager</h1>
            <p className="text-slate-400 mb-8">Add, edit, or remove categories from your directory menu. No code required!</p>

            {/* Add/Edit Form */}
            <div className="glass rounded-2xl p-6 border border-slate-700 mb-8">
                <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Category' : 'Add New Category'}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Name</label>
                        <input
                            type="text"
                            value={editForm.name}
                            onChange={e => setEditForm({...editForm, name: e.target.value})}
                            placeholder="e.g. Restaurants"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-primary-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Slug</label>
                        <input
                            type="text"
                            value={editForm.slug}
                            onChange={e => setEditForm({...editForm, slug: e.target.value})}
                            placeholder="e.g. restaurants"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-primary-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Icon (emoji)</label>
                        <input
                            type="text"
                            value={editForm.icon}
                            onChange={e => setEditForm({...editForm, icon: e.target.value})}
                            placeholder="e.g. 🍽️"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-primary-500"
                        />
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleSave}
                        disabled={saving || !editForm.name || !editForm.slug}
                        className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 px-6 py-2 rounded-lg font-bold"
                    >
                        <Save size={18} /> {saving ? 'Saving...' : (editingId ? 'Update' : 'Add Category')}
                    </button>
                    {editingId && (
                        <button
                            onClick={() => { setEditingId(null); setEditForm({ name: '', slug: '', icon: '' }); }}
                            className="px-6 py-2 border border-slate-700 rounded-lg hover:bg-slate-800"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>

            {/* Categories List */}
            <div className="glass rounded-2xl border border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-700">
                    <h2 className="text-xl font-bold">Current Categories</h2>
                </div>
                {loading ? (
                    <div className="p-8 text-center text-slate-400">Loading...</div>
                ) : categories.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">No categories yet. Add your first one!</div>
                ) : (
                    <div className="divide-y divide-slate-700">
                        {categories.map(cat => (
                            <div key={cat.id} className="p-4 flex items-center justify-between hover:bg-slate-800/50 transition">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{cat.icon || '📁'}</span>
                                    <div>
                                        <p className="font-bold text-white">{cat.name}</p>
                                        <p className="text-xs text-slate-400">/{cat.slug}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => startEdit(cat)}
                                        className="p-2 text-primary-400 hover:bg-primary-500/20 rounded-lg transition"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cat.id)}
                                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

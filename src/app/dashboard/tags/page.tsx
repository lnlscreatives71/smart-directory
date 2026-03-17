'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Tag, Plus, Edit2, Trash2, Save, X, AlertCircle, Loader2 } from 'lucide-react';

interface Tag {
    id: number;
    name: string;
    slug: string;
    icon: string;
    color: string;
    description: string;
    is_active: boolean;
}

export default function TagsPage() {
    const { data: session } = useSession();
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [agencyId, setAgencyId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        icon: '',
        color: '#3b82f6',
        description: '',
        is_active: true
    });

    useEffect(() => {
        fetchAgencyId();
    }, []);

    useEffect(() => {
        if (agencyId) {
            fetchTags();
        }
    }, [agencyId]);

    const fetchAgencyId = async () => {
        try {
            const res = await fetch('/api/agencies');
            if (res.ok) {
                const data = await res.json();
                if (data.data && data.data.id) {
                    setAgencyId(data.data.id);
                }
            }
        } catch (err) {
            console.error('Error fetching agency:', err);
        }
    };

    const fetchTags = async () => {
        if (!agencyId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/tags?agency_id=${agencyId}`);
            if (res.ok) {
                const data = await res.json();
                setTags(data.data || []);
            }
        } catch (err) {
            console.error('Error fetching tags:', err);
            setError('Failed to load tags');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name || !formData.slug) {
            setError('Name and slug are required');
            return;
        }

        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/tags', {
                method: editingId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    id: editingId,
                    agency_id: agencyId
                })
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(editingId ? 'Tag updated successfully' : 'Tag created successfully');
                setShowForm(false);
                setEditingId(null);
                setFormData({ name: '', slug: '', icon: '', color: '#3b82f6', description: '', is_active: true });
                fetchTags();
            } else {
                setError(data.error || 'Failed to save tag');
            }
        } catch (err) {
            setError('Failed to save tag');
        }
    };

    const handleEdit = (tag: Tag) => {
        setEditingId(tag.id);
        setFormData({
            name: tag.name,
            slug: tag.slug,
            icon: tag.icon || '',
            color: tag.color || '#3b82f6',
            description: tag.description || '',
            is_active: tag.is_active
        });
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this tag? This will remove it from all listings.')) return;

        try {
            const res = await fetch(`/api/tags?id=${id}&agency_id=${agencyId}`, { method: 'DELETE' });
            if (res.ok) {
                setSuccess('Tag deleted successfully');
                fetchTags();
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to delete tag');
            }
        } catch (err) {
            setError('Failed to delete tag');
        }
    };

    const generateSlug = (name: string) => {
        return name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setFormData(prev => ({
            ...prev,
            name,
            slug: editingId ? prev.slug : generateSlug(name)
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Business Tags</h1>
                    <p className="text-slate-500 mt-1">Create and manage tags to organize your businesses and build custom menus</p>
                </div>
                <button
                    onClick={() => {
                        setShowForm(true);
                        setEditingId(null);
                        setFormData({ name: '', slug: '', icon: '', color: '#3b82f6', description: '', is_active: true });
                    }}
                    className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg font-medium"
                >
                    <Plus size={18} /> Add New Tag
                </button>
            </div>

            {error && (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3 text-red-700 dark:text-red-400">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                    <button onClick={() => setError('')} className="ml-auto"><X size={16} /></button>
                </div>
            )}

            {success && (
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center gap-3 text-green-700 dark:text-green-400">
                    <span>{success}</span>
                    <button onClick={() => setSuccess('')} className="ml-auto"><X size={16} /></button>
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h2 className="text-xl font-bold">{editingId ? 'Edit Tag' : 'Create New Tag'}</h2>
                            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Tag Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={handleNameChange}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="e.g. Pet Friendly"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Slug *</label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="e.g. pet-friendly"
                                />
                                <p className="text-xs text-slate-500 mt-1">URL-friendly name (lowercase, hyphens only)</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Icon (emoji)</label>
                                    <input
                                        type="text"
                                        value={formData.icon}
                                        onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="🏷️"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Color</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={formData.color}
                                            onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                                            className="w-12 h-10 rounded border border-slate-300 dark:border-slate-700 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={formData.color}
                                            onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                                            className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="#3b82f6"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    rows={3}
                                    placeholder="Describe what this tag represents..."
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                                    className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                />
                                <label htmlFor="is_active" className="text-sm font-medium">Active (visible on frontend)</label>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                            <button
                                onClick={() => { setShowForm(false); setEditingId(null); }}
                                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="btn-primary px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                            >
                                <Save size={18} /> {editingId ? 'Update' : 'Create'} Tag
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tags List */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tag</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Slug</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Color</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center">
                                        <Loader2 className="animate-spin mx-auto text-slate-400" size={24} />
                                        <p className="text-slate-500 mt-2">Loading tags...</p>
                                    </td>
                                </tr>
                            ) : tags.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        <Tag size={48} className="mx-auto mb-3 opacity-20" />
                                        <p>No tags created yet</p>
                                        <p className="text-sm mt-1">Create your first tag to start organizing businesses</p>
                                    </td>
                                </tr>
                            ) : (
                                tags.map((tag) => (
                                    <tr key={tag.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {tag.icon && <span className="text-xl">{tag.icon}</span>}
                                                <div>
                                                    <p className="font-medium">{tag.name}</p>
                                                    {tag.description && <p className="text-sm text-slate-500">{tag.description}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{tag.slug}</code>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded border border-slate-200 dark:border-slate-700" style={{ backgroundColor: tag.color }}></div>
                                                <code className="text-sm text-slate-500">{tag.color}</code>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                tag.is_active 
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                                    : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
                                            }`}>
                                                {tag.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(tag)}
                                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} className="text-slate-500" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(tag.id)}
                                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} className="text-red-500" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

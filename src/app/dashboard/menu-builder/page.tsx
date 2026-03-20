'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
    Menu, Plus, Edit2, Trash2, Save, X, AlertCircle, Loader2,
    ChevronUp, ChevronDown, ChevronRight, ChevronLeft, GripVertical,
    ExternalLink, Tag, Folder, FileText, Settings, Eye, EyeOff
} from 'lucide-react';

interface MenuItem {
    id: number;
    parent_id: number | null;
    title: string;
    menu_type: 'category' | 'tag' | 'custom_link' | 'listing';
    target_type: string | null;
    target_value: string | null;
    icon: string | null;
    order_index: number;
    is_visible: boolean;
    open_in_new_tab: boolean;
    css_class: string | null;
    children?: MenuItem[];
}

interface Tag {
    id: number;
    name: string;
    slug: string;
    icon: string | null;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    icon: string | null;
}

export default function MenuBuilderPage() {
    const { data: session } = useSession();
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [agencyId, setAgencyId] = useState<number | null>(null);
    const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
    const [draggedItem, setDraggedItem] = useState<MenuItem | null>(null);
    const [dragOverItem, setDragOverItem] = useState<number | null>(null);

    const [showAddForm, setShowAddForm] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [showSettings, setShowSettings] = useState(false);

    const [menuSettings, setMenuSettings] = useState({
        menu_name: 'Main Menu',
        max_depth: 2,
        show_icons: true,
        layout_style: 'dropdown'
    });

    const [formData, setFormData] = useState({
        title: '',
        menu_type: 'custom_link' as 'category' | 'tag' | 'custom_link' | 'listing',
        target_value: '',
        icon: '',
        open_in_new_tab: false,
        css_class: ''
    });

    useEffect(() => {
        fetchAgencyId();
    }, []);

    useEffect(() => {
        if (agencyId) {
            fetchAllData();
        }
    }, [agencyId]);

    const fetchAgencyId = async () => {
        try {
            const res = await fetch('/api/agencies');
            if (res.ok) {
                const data = await res.json();
                if (data.data && Array.isArray(data.data) && data.data.length > 0) {
                    setAgencyId(data.data[0].id);
                } else if (data.data && data.data.id) {
                    setAgencyId(data.data.id);
                }
            }
        } catch (err) {
            console.error('Error fetching agency:', err);
        }
    };

    const fetchAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchMenuItems(),
                fetchTags(),
                fetchCategories(),
                fetchMenuSettings()
            ]);
        } catch (err) {
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const fetchMenuItems = async () => {
        if (!agencyId) return;
        const res = await fetch(`/api/menu-items?agency_id=${agencyId}`);
        if (res.ok) {
            const data = await res.json();
            setMenuItems(data.tree || []);
        }
    };

    const fetchTags = async () => {
        if (!agencyId) return;
        const res = await fetch(`/api/tags?agency_id=${agencyId}`);
        if (res.ok) {
            const data = await res.json();
            setTags(data.data || []);
        }
    };

    const fetchCategories = async () => {
        if (!agencyId) return;
        const res = await fetch(`/api/categories?agency_id=${agencyId}`);
        if (res.ok) {
            const data = await res.json();
            setCategories(data.data || []);
        }
    };

    const fetchMenuSettings = async () => {
        if (!agencyId) return;
        const res = await fetch(`/api/menu-settings?agency_id=${agencyId}`);
        if (res.ok) {
            const data = await res.json();
            if (data.data) {
                setMenuSettings(data.data);
            }
        }
    };

    const handleAddItem = async () => {
        if (!formData.title || !formData.menu_type) {
            setError('Title and type are required');
            return;
        }

        try {
            const res = await fetch('/api/menu-items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    agency_id: agencyId,
                    target_type: formData.menu_type === 'custom_link' ? 'url' : `${formData.menu_type}_slug`
                })
            });

            if (res.ok) {
                setSuccess('Menu item added successfully');
                setShowAddForm(false);
                setFormData({ title: '', menu_type: 'custom_link', target_value: '', icon: '', open_in_new_tab: false, css_class: '' });
                fetchMenuItems();
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to add menu item');
            }
        } catch (err) {
            setError('Failed to add menu item');
        }
    };

    const handleUpdateItem = async () => {
        if (!editingItem) return;

        try {
            const res = await fetch('/api/menu-items', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...editingItem,
                    agency_id: agencyId
                })
            });

            if (res.ok) {
                setSuccess('Menu item updated successfully');
                setEditingItem(null);
                fetchMenuItems();
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to update menu item');
            }
        } catch (err) {
            setError('Failed to update menu item');
        }
    };

    const handleDeleteItem = async (id: number) => {
        if (!confirm('Are you sure you want to delete this menu item? Children will be moved to the top level.')) return;

        try {
            const res = await fetch(`/api/menu-items?id=${id}&agency_id=${agencyId}`, { method: 'DELETE' });
            if (res.ok) {
                setSuccess('Menu item deleted successfully');
                fetchMenuItems();
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to delete menu item');
            }
        } catch (err) {
            setError('Failed to delete menu item');
        }
    };

    const handleSaveSettings = async () => {
        try {
            const res = await fetch('/api/menu-settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...menuSettings,
                    agency_id: agencyId
                })
            });

            if (res.ok) {
                setSuccess('Menu settings saved successfully');
                setShowSettings(false);
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to save settings');
            }
        } catch (err) {
            setError('Failed to save settings');
        }
    };

    const toggleExpand = (id: number) => {
        setExpandedItems(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    // Drag and drop handlers
    const handleDragStart = (e: React.DragEvent, item: MenuItem) => {
        setDraggedItem(item);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, itemId: number) => {
        e.preventDefault();
        if (draggedItem && draggedItem.id !== itemId) {
            setDragOverItem(itemId);
        }
    };

    const handleDragLeave = () => {
        setDragOverItem(null);
    };

    const handleDrop = async (e: React.DragEvent, targetItem: MenuItem) => {
        e.preventDefault();
        setDragOverItem(null);

        if (!draggedItem || draggedItem.id === targetItem.id) return;

        // Prevent dropping parent into its own child
        const isChild = (item: MenuItem, parentId: number): boolean => {
            if (item.id === parentId) return true;
            if (item.children) {
                return item.children.some(child => isChild(child, parentId));
            }
            return false;
        };

        if (isChild(targetItem, draggedItem.id)) {
            setError('Cannot move a parent item inside its child');
            return;
        }

        try {
            const res = await fetch('/api/menu-items', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...draggedItem,
                    parent_id: targetItem.id,
                    agency_id: agencyId
                })
            });

            if (res.ok) {
                setSuccess('Menu item moved successfully');
                fetchMenuItems();
            }
        } catch (err) {
            setError('Failed to move menu item');
        }

        setDraggedItem(null);
    };

    const handleReorder = async (items: MenuItem[], newOrder: MenuItem[]) => {
        try {
            const flattenItems = (items: MenuItem[], order: number[] = []): MenuItem[] => {
                items.forEach((item, index) => {
                    item.order_index = order[index] ?? item.order_index;
                    if (item.children) {
                        flattenItems(item.children, order);
                    }
                });
                return items;
            };

            const res = await fetch('/api/menu-items/reorder', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agency_id: agencyId,
                    items: newOrder.map((item, index) => ({
                        id: item.id,
                        order_index: index,
                        parent_id: item.parent_id
                    }))
                })
            });

            if (res.ok) {
                fetchMenuItems();
            }
        } catch (err) {
            console.error('Failed to reorder:', err);
        }
    };

    const renderMenuTree = (items: MenuItem[], depth: number = 0) => {
        return items.map((item) => (
            <div key={item.id} className="select-none">
                <div
                    className={`flex items-center gap-2 p-3 rounded-lg border transition-all cursor-move ${
                        dragOverItem === item.id
                            ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700'
                    }`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onDragOver={(e) => handleDragOver(e, item.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, item)}
                >
                    <GripVertical size={16} className="text-slate-400 cursor-grab" />
                    
                    {item.children && item.children.length > 0 && (
                        <button
                            onClick={() => toggleExpand(item.id)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                        >
                            {expandedItems.has(item.id) ? (
                                <ChevronDown size={16} />
                            ) : (
                                <ChevronRight size={16} />
                            )}
                        </button>
                    )}

                    {getMenuTypeIcon(item.menu_type)}
                    
                    <span className="flex-1 font-medium">{item.title}</span>
                    
                    <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                        {item.menu_type}
                    </span>

                    {!item.is_visible && (
                        <EyeOff size={16} className="text-slate-400" />
                    )}

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setEditingItem(item)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                        >
                            <Edit2 size={14} />
                        </button>
                        <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        >
                            <Trash2 size={14} className="text-red-500" />
                        </button>
                    </div>
                </div>

                {expandedItems.has(item.id) && item.children && (
                    <div className="ml-8 mt-2 space-y-2 border-l-2 border-slate-200 dark:border-slate-800 pl-4">
                        {renderMenuTree(item.children, depth + 1)}
                    </div>
                )}
            </div>
        ));
    };

    const getMenuTypeIcon = (type: string) => {
        switch (type) {
            case 'category': return <Folder size={16} className="text-blue-500" />;
            case 'tag': return <Tag size={16} className="text-green-500" />;
            case 'listing': return <FileText size={16} className="text-purple-500" />;
            default: return <ExternalLink size={16} className="text-slate-500" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Menu Builder</h1>
                    <p className="text-slate-500 mt-1">Create custom navigation menus using your business tags and categories</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowSettings(true)}
                        className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-2"
                    >
                        <Settings size={18} /> Settings
                    </button>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg font-medium"
                    >
                        <Plus size={18} /> Add Menu Item
                    </button>
                </div>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Menu Structure */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Menu size={20} /> Menu Structure
                        </h2>
                        <p className="text-sm text-slate-500 mb-4">
                            Drag and drop items to reorder. Drop items on top of others to create sub-menus.
                        </p>
                        
                        {loading ? (
                            <div className="text-center py-8">
                                <Loader2 className="animate-spin mx-auto text-slate-400" size={24} />
                            </div>
                        ) : menuItems.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                <Menu size={48} className="mx-auto mb-3 opacity-20" />
                                <p>No menu items yet</p>
                                <p className="text-sm">Add your first menu item to get started</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {renderMenuTree(menuItems)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Available Items */}
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                        <h2 className="text-lg font-bold mb-4">Available Tags</h2>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {tags.map(tag => (
                                <div
                                    key={tag.id}
                                    className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-primary-300 cursor-move"
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, {
                                        id: 0,
                                        parent_id: null,
                                        title: tag.name,
                                        menu_type: 'tag',
                                        target_type: 'tag_slug',
                                        target_value: tag.slug,
                                        icon: tag.icon,
                                        order_index: 0,
                                        is_visible: true,
                                        open_in_new_tab: false,
                                        css_class: null
                                    })}
                                >
                                    {tag.icon && <span>{tag.icon}</span>}
                                    <span className="flex-1 text-sm">{tag.name}</span>
                                    <Plus size={14} className="text-slate-400" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                        <h2 className="text-lg font-bold mb-4">Available Categories</h2>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {categories.map(cat => (
                                <div
                                    key={cat.id}
                                    className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-primary-300 cursor-move"
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, {
                                        id: 0,
                                        parent_id: null,
                                        title: cat.name,
                                        menu_type: 'category',
                                        target_type: 'category_slug',
                                        target_value: cat.slug,
                                        icon: cat.icon,
                                        order_index: 0,
                                        is_visible: true,
                                        open_in_new_tab: false,
                                        css_class: null
                                    })}
                                >
                                    {cat.icon && <span>{cat.icon}</span>}
                                    <span className="flex-1 text-sm">{cat.name}</span>
                                    <Plus size={14} className="text-slate-400" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Item Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h2 className="text-xl font-bold">Add Menu Item</h2>
                            <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-primary-500"
                                    placeholder="e.g. Restaurants"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Type *</label>
                                <select
                                    value={formData.menu_type}
                                    onChange={(e) => setFormData(prev => ({ ...prev, menu_type: e.target.value as any }))}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="custom_link">Custom Link</option>
                                    <option value="category">Category</option>
                                    <option value="tag">Tag</option>
                                    <option value="listing">Listing</option>
                                </select>
                            </div>
                            {formData.menu_type === 'custom_link' ? (
                                <div>
                                    <label className="block text-sm font-medium mb-2">URL</label>
                                    <input
                                        type="text"
                                        value={formData.target_value}
                                        onChange={(e) => setFormData(prev => ({ ...prev, target_value: e.target.value }))}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-primary-500"
                                        placeholder="https://example.com"
                                    />
                                </div>
                            ) : formData.menu_type === 'category' ? (
                                <div>
                                    <label className="block text-sm font-medium mb-2">Category</label>
                                    <select
                                        value={formData.target_value}
                                        onChange={(e) => setFormData(prev => ({ ...prev, target_value: e.target.value }))}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="">Select a category...</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.slug}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : formData.menu_type === 'tag' ? (
                                <div>
                                    <label className="block text-sm font-medium mb-2">Tag</label>
                                    <select
                                        value={formData.target_value}
                                        onChange={(e) => setFormData(prev => ({ ...prev, target_value: e.target.value }))}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="">Select a tag...</option>
                                        {tags.map(tag => (
                                            <option key={tag.id} value={tag.slug}>{tag.name}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : null}
                            <div>
                                <label className="block text-sm font-medium mb-2">Icon (emoji)</label>
                                <input
                                    type="text"
                                    value={formData.icon}
                                    onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-primary-500"
                                    placeholder="📁"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="open_in_new_tab"
                                    checked={formData.open_in_new_tab}
                                    onChange={(e) => setFormData(prev => ({ ...prev, open_in_new_tab: e.target.checked }))}
                                    className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                />
                                <label htmlFor="open_in_new_tab" className="text-sm font-medium">Open in new tab</label>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                            <button
                                onClick={() => setShowAddForm(false)}
                                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddItem}
                                className="btn-primary px-4 py-2 rounded-lg font-medium"
                            >
                                Add Item
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Item Modal */}
            {editingItem && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h2 className="text-xl font-bold">Edit Menu Item</h2>
                            <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Title *</label>
                                <input
                                    type="text"
                                    value={editingItem.title}
                                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="edit_visible"
                                        checked={editingItem.is_visible}
                                        onChange={(e) => setEditingItem({ ...editingItem, is_visible: e.target.checked })}
                                        className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <label htmlFor="edit_visible" className="text-sm font-medium">Visible</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="edit_new_tab"
                                        checked={editingItem.open_in_new_tab}
                                        onChange={(e) => setEditingItem({ ...editingItem, open_in_new_tab: e.target.checked })}
                                        className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <label htmlFor="edit_new_tab" className="text-sm font-medium">Open in new tab</label>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                            <button
                                onClick={() => setEditingItem(null)}
                                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateItem}
                                className="btn-primary px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                            >
                                <Save size={18} /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h2 className="text-xl font-bold">Menu Settings</h2>
                            <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Menu Name</label>
                                <input
                                    type="text"
                                    value={menuSettings.menu_name}
                                    onChange={(e) => setMenuSettings(prev => ({ ...prev, menu_name: e.target.value }))}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Max Depth</label>
                                <select
                                    value={menuSettings.max_depth}
                                    onChange={(e) => setMenuSettings(prev => ({ ...prev, max_depth: parseInt(e.target.value) }))}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value={1}>1 level (no submenus)</option>
                                    <option value={2}>2 levels</option>
                                    <option value={3}>3 levels</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="show_icons"
                                    checked={menuSettings.show_icons}
                                    onChange={(e) => setMenuSettings(prev => ({ ...prev, show_icons: e.target.checked }))}
                                    className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                />
                                <label htmlFor="show_icons" className="text-sm font-medium">Show icons in menu</label>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Layout Style</label>
                                <select
                                    value={menuSettings.layout_style}
                                    onChange={(e) => setMenuSettings(prev => ({ ...prev, layout_style: e.target.value }))}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="dropdown">Dropdown</option>
                                    <option value="mega">Mega Menu</option>
                                    <option value="accordion">Accordion (Mobile)</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                            <button
                                onClick={() => setShowSettings(false)}
                                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveSettings}
                                className="btn-primary px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                            >
                                <Save size={18} /> Save Settings
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

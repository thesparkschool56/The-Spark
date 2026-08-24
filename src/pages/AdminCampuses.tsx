import React, { useState, useEffect } from 'react';
import { ref, update, remove, onValue, set } from 'firebase/database';
import { db } from '../lib/firebase';
import { Plus, Trash2, Edit2, MapPin } from 'lucide-react';
import ConfirmModal from '../components/ui/ConfirmModal';

export interface Campus {
    id: string;
    name: string;
    slug: string;
    color_theme: string;
}

const AdminCampuses: React.FC = () => {
    const [campuses, setCampuses] = useState<Campus[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [colorTheme, setColorTheme] = useState('blue');
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Modal State
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        const campusesRef = ref(db, 'campuses');
        
        const unsubscribe = onValue(campusesRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const dataArray = Object.entries(data).map(([id, val]: [string, any]) => ({
                    id,
                    ...val
                })) as Campus[];
                setCampuses(dataArray);
            } else {
                setCampuses([]);
            }
            setLoading(false);
        }, (error) => {
            console.error('Error fetching campuses:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleEdit = (campus: Campus) => {
        setEditingId(campus.id);
        setName(campus.name);
        setSlug(campus.slug);
        setColorTheme(campus.color_theme || 'blue');
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!name.trim() || !slug.trim()) {
            setFormMessage({ type: 'error', text: 'Name and Slug are required fields.' });
            return;
        }
        
        setSubmitting(true);

        const campusData = {
            name,
            slug,
            color_theme: colorTheme
        };

        try {
            if (editingId) {
                const campusRef = ref(db, `campuses/${editingId}`);
                await update(campusRef, campusData);
            } else {
                const newId = `campus_${slug.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
                const campusRef = ref(db, `campuses/${newId}`);
                await set(campusRef, campusData);
            }

            setFormMessage({ type: 'success', text: `Campus successfully ${editingId ? 'updated' : 'added'}!` });
            setName('');
            setSlug('');
            setColorTheme('blue');
            setEditingId(null);
            setShowForm(false);
            setTimeout(() => setFormMessage(null), 3000);
        } catch (error: any) {
            setFormMessage({ type: 'error', text: `Error ${editingId ? 'updating' : 'adding'} campus: ` + error.message });
        }
        setSubmitting(false);
    };

    const handleDelete = async (id: string) => {
        setIdToDelete(id);
        setIsConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!idToDelete) return;

        try {
            const campusRef = ref(db, `campuses/${idToDelete}`);
            await remove(campusRef);

            setFormMessage({ type: 'success', text: 'Campus deleted successfully.' });
            setTimeout(() => setFormMessage(null), 3000);
        } catch (error: any) {
            console.error('Delete error:', error);
            setFormMessage({ type: 'error', text: 'Error deleting campus: ' + error.message });
        }
        setIsConfirmOpen(false);
        setIdToDelete(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2 font-serif">
                    <span className="w-1 h-6 bg-accent rounded-full"></span>
                    Manage Campuses
                </h2>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setName('');
                        setSlug('');
                        setColorTheme('blue');
                        setShowForm(!showForm);
                    }}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                >
                    {showForm ? <Trash2 size={16} /> : <Plus size={16} />}
                    {showForm ? 'Cancel' : 'Add Campus'}
                </button>
            </div>

            {formMessage && (
                <div className={`p-4 rounded-lg text-sm font-medium ${formMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    {formMessage.text}
                </div>
            )}

            {showForm && (
                <div className="bg-stone-50 p-6 rounded-xl border border-stone-200">
                    <h3 className="text-lg font-semibold text-stone-800 mb-4 font-serif">{editingId ? 'Edit Campus' : 'Add New Campus'}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Campus Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                    placeholder="e.g. Jinnah Campus"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Campus Slug (URL friendly)</label>
                                <input
                                    type="text"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                    placeholder="e.g. jinnah"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-stone-700 mb-1">Color Theme</label>
                                <select
                                    value={colorTheme}
                                    onChange={(e) => setColorTheme(e.target.value)}
                                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                >
                                    <option value="blue">Blue</option>
                                    <option value="green">Green</option>
                                    <option value="amber">Amber</option>
                                    <option value="red">Red</option>
                                    <option value="purple">Purple</option>
                                    <option value="indigo">Indigo</option>
                                    <option value="stone">Stone</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-70 flex items-center gap-2"
                            >
                                {submitting ? 'Saving...' : (editingId ? 'Update Campus' : 'Save Campus')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-stone-500 flex flex-col items-center justify-center">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                        Loading campuses...
                    </div>
                ) : campuses.length === 0 ? (
                    <div className="p-8 text-center text-stone-500">
                        No campuses found. Add one to get started.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-stone-50 border-b border-stone-200 text-sm text-stone-500">
                                    <th className="p-4 font-medium">Campus Info</th>
                                    <th className="p-4 font-medium">Slug</th>
                                    <th className="p-4 font-medium">Theme</th>
                                    <th className="p-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {campuses.map((campus) => (
                                    <tr key={campus.id} className="hover:bg-stone-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${campus.color_theme}-100 text-${campus.color_theme}-600`}>
                                                    <MapPin size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-stone-800">{campus.name}</div>
                                                    <div className="text-xs text-stone-500 font-mono text-[10px] uppercase tracking-wider">{campus.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="bg-stone-100 text-stone-600 px-2 py-1 rounded text-xs font-medium">
                                                {campus.slug}
                                            </span>
                                        </td>
                                        <td className="p-4 capitalize">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-3 h-3 rounded-full bg-${campus.color_theme}-500`}></span>
                                                <span className="text-sm text-stone-600">{campus.color_theme}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right space-x-2">
                                            <button
                                                onClick={() => handleEdit(campus)}
                                                className="p-2 text-stone-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(campus.id)}
                                                className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Campus"
                message="Are you sure you want to delete this campus? This action cannot be undone."
                confirmText="Delete Campus"
            />
        </div>
    );
};

export default AdminCampuses;

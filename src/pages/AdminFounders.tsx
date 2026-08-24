import React, { useState, useEffect } from 'react';
import { ref, set, push, update, remove, onValue } from 'firebase/database';
import { db } from '../lib/firebase';
import { Plus, Trash2, Edit2, Loader2, Quote, User } from 'lucide-react';
import ConfirmModal from '../components/ui/ConfirmModal';

export interface Founder {
    id: string;
    name: string;
    role: string;
    bio: string;
    image_url: string;
    order: number;
}

const AdminFounders: React.FC = () => {
    const [founders, setFounders] = useState<Founder[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Modal State
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState<string | null>(null);

    // Form inputs
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [quote, setQuote] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    useEffect(() => {
        setLoading(true);
        const foundersRef = ref(db, 'founders');
        
        const unsubscribe = onValue(foundersRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const dataArray = Object.entries(data).map(([id, val]: [string, any]) => ({
                    id,
                    ...val
                })) as Founder[];
                dataArray.sort((a, b) => (a.order || 0) - (b.order || 0));
                setFounders(dataArray);
            } else {
                setFounders([]);
            }
            setLoading(false);
        }, (error) => {
            console.error('Error fetching founders:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleEdit = (founder: Founder) => {
        setEditingId(founder.id);
        setName(founder.name);
        setRole(founder.role || '');
        setQuote(founder.bio || '');
        setImageUrl(founder.image_url || '');
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!name.trim() || !role.trim()) {
            setFormMessage({ type: 'error', text: 'Name and Role are required fields.' });
            return;
        }
        
        setSubmitting(true);

        const founderData = {
            name,
            role,
            bio: quote,
            image_url: imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
            order: founders.length // just append to end for simplicity
        };

        try {
            if (editingId) {
                const founderRef = ref(db, `founders/${editingId}`);
                await update(founderRef, founderData);
            } else {
                const foundersRef = ref(db, 'founders');
                const newFounderRef = push(foundersRef);
                await set(newFounderRef, founderData);
            }

            setFormMessage({ type: 'success', text: `Founder successfully ${editingId ? 'updated' : 'added'}!` });
            setName('');
            setRole('');
            setQuote('');
            setImageUrl('');
            setEditingId(null);
            setShowForm(false);
            setTimeout(() => setFormMessage(null), 3000);
        } catch (error: any) {
            console.error('Error saving founder:', error);
            setFormMessage({ type: 'error', text: `Error ${editingId ? 'updating' : 'adding'} founder: ` + error.message });
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
            const founderRef = ref(db, `founders/${idToDelete}`);
            await remove(founderRef);

            setFormMessage({ type: 'success', text: 'Founder deleted successfully.' });
            setTimeout(() => setFormMessage(null), 3000);
        } catch (error: any) {
            console.error('Delete error:', error);
            setFormMessage({ type: 'error', text: 'Error deleting founder: ' + error.message });
        }
        setIsConfirmOpen(false);
        setIdToDelete(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2 font-serif">
                    <span className="w-1 h-6 bg-accent rounded-full"></span>
                    Founders Management
                </h2>
                <button
                    onClick={() => {
                        setShowForm(!showForm);
                        setEditingId(null);
                        setName('');
                        setRole('');
                        setQuote('');
                        setImageUrl('');
                    }}
                    className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                    <Plus size={18} /> Add Founder
                </button>
            </div>

            {formMessage && (
                <div className={`p-4 rounded-xl text-sm border ${formMessage.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
                    {formMessage.text}
                </div>
            )}

            {showForm && (
                <div className="bg-stone-50 p-6 rounded-xl border border-stone-200 mb-6 animate-in slide-in-from-top-4 fade-in duration-200">
                    <h3 className="text-lg font-bold text-stone-700 mb-4 font-serif">{editingId ? 'Edit Founder' : 'Add New Founder'}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Role</label>
                                <input
                                    type="text"
                                    value={role}
                                    onChange={e => setRole(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-stone-700 mb-1">Quote</label>
                                <textarea
                                    value={quote}
                                    onChange={e => setQuote(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    rows={3}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-stone-700 mb-1">Image URL</label>
                                <input
                                    type="url"
                                    value={imageUrl}
                                    onChange={e => setImageUrl(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 text-stone-600 hover:text-stone-800 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-70 flex items-center gap-2"
                            >
                                {submitting ? <Loader2 size={18} className="animate-spin" /> : (editingId ? <Edit2 size={18} /> : <Plus size={18} />)}
                                {editingId ? 'Update Founder' : 'Add Founder'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="text-center py-12">
                    <Loader2 size={32} className="animate-spin mx-auto text-primary mb-2" />
                    <p className="text-stone-500">Loading founders...</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-6">
                    {founders.length === 0 ? (
                        <div className="col-span-2 text-center py-12 border-2 border-dashed border-stone-200 rounded-xl">
                            <User size={48} className="mx-auto text-stone-300 mb-4" />
                            <h3 className="text-lg font-medium text-stone-900">No Founders Yet</h3>
                            <p className="text-stone-500">Add the school's founders to display them on the landing page.</p>
                        </div>
                    ) : (
                        founders.map(founder => (
                            <div key={founder.id} className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex gap-4 group relative hover:border-accent/30 transition-all">
                                <img
                                    src={founder.image_url || undefined}
                                    alt={founder.name}
                                    className="w-20 h-20 rounded-full object-cover bg-stone-100 border-2 border-white shadow-md"
                                />
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-stone-800">{founder.name}</h3>
                                    <p className="text-accent text-sm font-medium uppercase tracking-wide mb-2">{founder.role}</p>
                                    {founder.bio && (
                                        <p className="text-stone-500 text-sm italic flex gap-2">
                                            <Quote size={12} className="shrink-0 mt-1" />
                                            {founder.bio}
                                        </p>
                                    )}
                                </div>
                                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEdit(founder)}
                                        className="p-2 text-stone-400 hover:text-accent hover:bg-accent/5 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(founder.id)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Founder"
                message="Are you sure you want to delete this founder profile? This action will remove them from the landing page loop."
            />
        </div>
    );
};

export default AdminFounders;

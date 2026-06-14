import React, { useState, useEffect } from 'react';
import { ref, get, set, push, update, remove, onValue } from 'firebase/database';
import { db } from '../lib/firebase';
import { Plus, Trash2, MessageSquare, Star, Edit2 } from 'lucide-react';
import ConfirmModal from '../components/ui/ConfirmModal';

export interface Review {
    id: string;
    reviewer_name: string;
    role: string;
    review_text: string;
    is_published: boolean;
    created_at: string;
}

const AdminReviews: React.FC = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [text, setText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Modal State
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState<string | null>(null);

    const handleEdit = (review: Review) => {
        setEditingId(review.id);
        setName(review.reviewer_name);
        setRole(review.role || '');
        setText(review.review_text);
        setShowForm(true);
    };

    useEffect(() => {
        setLoading(true);
        const reviewsRef = ref(db, 'reviews');
        
        const unsubscribe = onValue(reviewsRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const dataArray = Object.entries(data).map(([id, val]: [string, any]) => ({
                    id,
                    ...val
                })) as Review[];
                dataArray.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                setReviews(dataArray);
            } else {
                setReviews([]);
            }
            setLoading(false);
        }, (error) => {
            console.error('Error fetching reviews:', error.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!name.trim() || !text.trim()) {
            setFormMessage({ type: 'error', text: 'Reviewer Name and Review Text are required fields.' });
            return;
        }
        
        setSubmitting(true);

        const reviewData: any = { 
            reviewer_name: name, 
            review_text: text,
            role,
            is_published: true,
            created_at: new Date().toISOString()
        };

        try {
            if (editingId) {
                const reviewRef = ref(db, `reviews/${editingId}`);
                await update(reviewRef, reviewData);
            } else {
                const reviewsRef = ref(db, 'reviews');
                const newReviewRef = push(reviewsRef);
                await set(newReviewRef, reviewData);
            }

            setFormMessage({ type: 'success', text: `Review successfully ${editingId ? 'updated' : 'added'}!` });
            setName('');
            setRole('');
            setText('');
            setEditingId(null);
            setShowForm(false);
            setTimeout(() => setFormMessage(null), 3000);
        } catch (error: any) {
            setFormMessage({ type: 'error', text: `Error ${editingId ? 'updating' : 'adding'} review: ` + error.message });
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
            const reviewRef = ref(db, `reviews/${idToDelete}`);
            await remove(reviewRef);

            setFormMessage({ type: 'success', text: 'Review deleted successfully.' });
            setTimeout(() => setFormMessage(null), 3000);
        } catch (error: any) {
            console.error('Delete error:', error);
            setFormMessage({ type: 'error', text: 'Error deleting review: ' + error.message });
        }
        setIsConfirmOpen(false);
        setIdToDelete(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2 font-serif">
                    <span className="w-1 h-6 bg-accent rounded-full"></span>
                    Reviews Management
                </h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                    <Plus size={18} /> Add Review
                </button>
            </div>

            {formMessage && (
                <div className={`p-4 rounded-xl text-sm border ${formMessage.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
                    {formMessage.text}
                </div>
            )}

            {showForm && (
                <div className="bg-stone-50 p-6 rounded-xl border border-stone-200 mb-6 animate-in slide-in-from-top-4 fade-in duration-200">
                    <h3 className="font-bold text-stone-700 mb-4 font-serif">{editingId ? 'Edit Testimonial' : 'New Testimonial'}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-stone-500 mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder="Jane Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-stone-500 mb-1">Role/Class</label>
                                <input
                                    type="text"
                                    required
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder="Class of 2024 / Parent"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-stone-500 mb-1">Testimonial Text</label>
                            <textarea
                                required
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                rows={3}
                                className="w-full p-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                                placeholder="Share the experience..."
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => { setShowForm(false); setEditingId(null); }}
                                className="px-4 py-2 text-stone-600 hover:bg-stone-200 rounded-lg text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary/90"
                            >
                                {submitting ? 'Saving...' : (editingId ? 'Update Review' : 'Save Review')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
                {loading ? (
                    <div className="col-span-2 p-8 text-center text-stone-500">Loading reviews...</div>
                ) : reviews.length === 0 ? (
                    <div className="col-span-2 p-12 text-center border-2 border-dashed border-stone-200 rounded-xl">
                        <MessageSquare className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                        <h3 className="text-stone-900 font-medium">No reviews yet</h3>
                        <p className="text-stone-500 text-sm mt-1">Add testimonials to display on the site.</p>
                    </div>
                ) : (
                    reviews.map(review => (
                        <div key={review.id} className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm relative group hover:border-accent/30 transition-all">
                            <div className="flex gap-1 mb-3 text-amber-500">
                                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                            </div>
                             <p className="text-stone-600 italic text-sm mb-4 leading-relaxed">"{review.review_text}"</p>
                             <div className="flex justify-between items-end">
                                 <div>
                                     <h5 className="font-bold text-stone-900 text-sm">{review.reviewer_name}</h5>
                                     <p className="text-[10px] text-stone-400 font-bold uppercase">{review.role}</p>
                                 </div>
                             </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEdit(review)}
                                    className="text-stone-300 hover:text-accent hover:bg-accent/5 p-2 rounded-lg transition-all"
                                    title="Edit Review"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(review.id)}
                                    className="text-stone-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"
                                    title="Delete Review"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Testimonial"
                message="Are you sure you want to delete this student review? This action cannot be undone."
            />
        </div>
    );
};

export default AdminReviews;

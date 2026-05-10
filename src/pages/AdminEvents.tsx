import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, Calendar as CalendarIcon, Edit2 } from 'lucide-react';
import ConfirmModal from '../components/ui/ConfirmModal';

import { Database } from '../lib/database.types';
 
type Event = Database['public']['Tables']['events']['Row'];

const AdminEvents: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form State
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [category, setCategory] = useState<string>('Academic');
    const [campusId, setCampusId] = useState<string>('all'); // 'all' or specific campus ID
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [time, setTime] = useState('');
    const [location, setLocation] = useState('');
    const [generalInfo, setGeneralInfo] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [className, setClassName] = useState('');
    const [section, setSection] = useState('');

    // Modal State
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState<number | null>(null);

    const [campuses, setCampuses] = useState<{ id: number, name: string }[]>([]);


    const fetchEvents = React.useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('date', { ascending: false });

        if (data) setEvents(data);
        if (error) console.error('Error fetching events:', error);
        setLoading(false);
    }, []);

    useEffect(() => {
        const fetchCampuses = async () => {
            const { data } = await supabase.from('campuses').select('id, name');
            if (data) setCampuses(data);
        };
        const init = async () => {
            await fetchEvents();
            await fetchCampuses();
        };
        init();
    }, [fetchEvents]);

    const handleEdit = (ev: Event) => {
        setEditingId(ev.id);
        setTitle(ev.title);
        setDate(ev.date);
        setCategory(ev.category || 'Academic');
        setCampusId(ev.campus_id ? String(ev.campus_id) : 'all');
        setTime(ev.time || '');
        setLocation(ev.location || '');
        setGeneralInfo(ev.general_info || '');
        setDescription(ev.description || '');
        setImageUrl(ev.image_url || '');
        setClassName(ev.class_name || '');
        setSection(ev.section || '');
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const eventData: any = {
            title,
            date,
            category,
            campus_id: campusId === 'all' ? null : Number(campusId),
            time,
            location,
            description,
            general_info: generalInfo,
            image_url: imageUrl,
            class_name: className,
            section: section
        };

        let result;
        if (editingId) {
            result = await (supabase.from('events') as any)
                .update(eventData)
                .eq('id', editingId);
        } else {
            result = await (supabase.from('events') as any)
                .insert([eventData]);
        }

        const { error } = result;

        if (error) {
            setFormMessage({ type: 'error', text: `Error ${editingId ? 'updating' : 'adding'} event: ` + error.message });
        } else {
            setFormMessage({ type: 'success', text: `Event successfully ${editingId ? 'updated' : 'added'}!` });
            setTitle('');
            setDate('');
            setTime('');
            setLocation('');
            setGeneralInfo('');
            setDescription('');
            setImageUrl('');
            setClassName('');
            setSection('');
            setCampusId('all');
            setEditingId(null);
            setShowForm(false);
            fetchEvents();
            setTimeout(() => setFormMessage(null), 3000);
        }
        setSubmitting(false);
    };

    const handleDelete = async (id: number) => {
        setIdToDelete(id);
        setIsConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!idToDelete) return;

        try {
            const { error } = await supabase.from('events')
                .delete()
                .eq('id', idToDelete);

            if (error) {
                console.error('Delete error:', error);
                setFormMessage({ type: 'error', text: 'Error deleting event: ' + error.message });
            } else {
                fetchEvents();
                setFormMessage({ type: 'success', text: 'Event deleted successfully.' });
                setTimeout(() => setFormMessage(null), 3000);
            }
        } catch (err: any) {
            setFormMessage({ type: 'error', text: 'Error deleting event: ' + err.message });
        }
        setIsConfirmOpen(false);
        setIdToDelete(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2 font-serif">
                    <span className="w-1 h-6 bg-accent rounded-full"></span>
                    Events Management
                </h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                    <Plus size={18} /> Add Event
                </button>
            </div>

            {formMessage && (
                <div className={`p-4 rounded-xl text-sm border ${formMessage.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
                    {formMessage.text}
                </div>
            )}

            {showForm && (
                <div className="bg-stone-50 p-6 rounded-xl border border-stone-200 mb-6 animate-in slide-in-from-top-4 fade-in duration-200">
                    <h3 className="font-bold text-stone-700 mb-4 font-serif">{editingId ? 'Edit Event' : 'New Event Details'}</h3>
                    <form onSubmit={handleSubmit} className="grid md:grid-cols-4 gap-4 items-end">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-stone-500 mb-1">Event Title</label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full p-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-primary/20 outline-none"
                                placeholder="E.g., Annual Sports Day"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-stone-500 mb-1">Date</label>
                            <input
                                type="date"
                                required
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full p-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-stone-500 mb-1">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full p-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-primary/20 outline-none"
                            >
                                <option value="Academic">Academic</option>
                                <option value="Sports">Sports</option>
                                <option value="Exam">Exam</option>
                                <option value="Holiday">Holiday</option>
                            </select>
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs font-medium text-stone-500 mb-1">Time</label>
                            <input
                                type="text"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full p-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-primary/20 outline-none"
                                placeholder="E.g., 09:00 AM"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs font-medium text-stone-500 mb-1">Location</label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full p-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-primary/20 outline-none"
                                placeholder="Main Auditorium"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-stone-500 mb-1">Campus</label>
                            <select
                                value={campusId}
                                onChange={(e) => setCampusId(e.target.value)}
                                className="w-full p-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-primary/20 outline-none"
                            >
                                <option value="all">All Campuses</option>
                                {campuses.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-stone-500 mb-1">Image URL</label>
                            <input
                                type="url"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                className="w-full p-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-primary/20 outline-none"
                                placeholder="https://images.unsplash.com/..."
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs font-medium text-stone-500 mb-1">Class Name</label>
                            <input
                                type="text"
                                value={className}
                                onChange={(e) => setClassName(e.target.value)}
                                className="w-full p-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-primary/20 outline-none"
                                placeholder="E.g., Grade 10"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs font-medium text-stone-500 mb-1">Section</label>
                            <input
                                type="text"
                                value={section}
                                onChange={(e) => setSection(e.target.value)}
                                className="w-full p-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-primary/20 outline-none"
                                placeholder="E.g., Section A"
                            />
                        </div>
                        <div className="md:col-span-4">
                            <label className="block text-xs font-medium text-stone-500 mb-1">Short Description (Summary)</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full p-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-primary/20 outline-none min-h-[80px]"
                                placeholder="A brief summary for the marquee and overview..."
                            />
                        </div>
                        <div className="md:col-span-4">
                            <label className="block text-xs font-medium text-stone-500 mb-1">General Info / Guidelines</label>
                            <textarea
                                value={generalInfo}
                                onChange={(e) => setGeneralInfo(e.target.value)}
                                className="w-full p-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-primary/20 outline-none min-h-[120px]"
                                placeholder="Additional details, expectations, or instructions..."
                            />
                        </div>
                        <div className="md:col-span-4 flex justify-end gap-2 mt-2">
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
                                {submitting ? 'Saving...' : (editingId ? 'Update Event' : 'Save Event')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid gap-4">
                {loading ? (
                    <div className="p-8 text-center text-stone-500">Loading events...</div>
                ) : events.length === 0 ? (
                    <div className="p-12 text-center border-2 border-dashed border-stone-200 rounded-xl">
                        <CalendarIcon className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                        <h3 className="text-stone-900 font-medium">No events scheduled</h3>
                        <p className="text-stone-500 text-sm mt-1">Add your first event to get started.</p>
                    </div>
                ) : (
                    events.map(event => (
                        <div key={event.id} className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center justify-between group hover:border-accent/30 transition-all">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-lg ${event.category === 'Exam' ? 'bg-primary/10 text-primary' :
                                    event.category === 'Sports' ? 'bg-emerald-100 text-emerald-700' :
                                        event.category === 'Academic' ? 'bg-amber-100 text-amber-700' :
                                            'bg-stone-100 text-stone-700'
                                    }`}>
                                    <CalendarIcon size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-stone-800">{event.title}</h4>
                                    <div className="flex gap-3 text-sm text-stone-500">
                                        <span>{new Date(event.date).toLocaleDateString()}</span>
                                        <span className="text-stone-300">•</span>
                                        <span>{event.category}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEdit(event)}
                                    className="text-stone-300 hover:text-accent hover:bg-accent/5 p-2 rounded-lg transition-all"
                                    title="Edit Event"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(event.id)}
                                    className="text-stone-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                    title="Delete Event"
                                >
                                    <Trash2 size={18} />
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
                title="Delete Event"
                message="Are you sure you want to delete this event? This action cannot be undone."
            />
        </div>
    );
};

export default AdminEvents;

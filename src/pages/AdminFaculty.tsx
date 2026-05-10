import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, User, UserPlus, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from '../components/ui/ConfirmModal';

interface FacultyMember {
    id: number;
    name: string;
    role: string;
    section: 'PG - Class 2' | 'Class 3 - 5' | 'Class 6 - 8' | 'Class 9 - 10/12';
    image_url?: string;
    campus_id?: number | null;
}

const AdminFaculty: React.FC = () => {
    const [faculty, setFaculty] = useState<FacultyMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [section, setSection] = useState<'PG - Class 2' | 'Class 3 - 5' | 'Class 6 - 8' | 'Class 9 - 10/12'>('PG - Class 2');
    const [campusId, setCampusId] = useState('all');
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState<number | null>(null);

    const [campuses, setCampuses] = useState<{ id: number, name: string }[]>([]);

    const fetchFaculty = React.useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('faculty')
            .select('*')
            .order('created_at', { ascending: true });

        if (data) setFaculty(data as FacultyMember[]);
        if (error) console.error('Error fetching faculty:', error);
        setLoading(false);
    }, []);

    useEffect(() => {
        const fetchCampuses = async () => {
            const { data } = await supabase.from('campuses').select('id, name');
            if (data) setCampuses(data);
        };
        const init = async () => {
            await fetchFaculty();
            await fetchCampuses();
        };
        init();
    }, [fetchFaculty]);

    const handleEdit = (member: FacultyMember) => {
        setEditingId(member.id);
        setName(member.name);
        setRole(member.role);
        setSection(member.section);
        setCampusId(member.campus_id ? String(member.campus_id) : 'all');
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const facultyData = {
            name,
            role,
            section,
            campus_id: campusId === 'all' ? null : Number(campusId),
            image_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random` // Default placeholder
        };

        let result;
        if (editingId) {
            result = await (supabase.from('faculty') as any)
                .update(facultyData as any)
                .eq('id', editingId);
        } else {
            result = await (supabase.from('faculty') as any)
                .insert([facultyData as any]);
        }

        const { error } = result;

        if (error) {
            setFormMessage({ type: 'error', text: `Error ${editingId ? 'updating' : 'adding'} faculty member: ` + error.message });
        } else {
            setFormMessage({ type: 'success', text: `Faculty member successfully ${editingId ? 'updated' : 'added'}!` });
            setName('');
            setRole('');
            setCampusId('all');
            setEditingId(null);
            setShowForm(false);
            fetchFaculty();
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

        const { error } = await supabase.from('faculty')
            .delete()
            .eq('id', idToDelete);

        if (error) {
            console.error('Delete error:', error);
            setFormMessage({ type: 'error', text: 'Error deleting faculty member: ' + error.message });
        } else {
            fetchFaculty();
            setFormMessage({ type: 'success', text: 'Faculty member deleted successfully.' });
            setTimeout(() => setFormMessage(null), 3000);
        }
        setIsConfirmOpen(false);
        setIdToDelete(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2 font-serif">
                    <span className="w-1 h-6 bg-accent rounded-full"></span>
                    Faculty Directory
                </h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                    <Plus size={18} /> Add Faculty
                </button>
            </div>

            {formMessage && (
                <div className={`p-4 rounded-xl text-sm border ${formMessage.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
                    {formMessage.text}
                </div>
            )}

            {showForm && (
                <div className="bg-stone-50 p-6 rounded-xl border border-stone-200 mb-6 animate-in slide-in-from-top-4 fade-in duration-200">
                    <h3 className="font-bold text-stone-700 mb-4 flex items-center gap-2 font-serif">
                        <UserPlus size={20} className="text-accent" /> New Staff Member
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-stone-500 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder="e.g. Dr. Jane Smith"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-stone-500 mb-1">Role/Position</label>
                                <input
                                    type="text"
                                    required
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder="e.g. Mathematics Coord."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-stone-500 mb-1">Section</label>
                                <select
                                    value={section}
                                    onChange={(e) => setSection(e.target.value as 'PG - Class 2' | 'Class 3 - 5' | 'Class 6 - 8' | 'Class 9 - 10/12')}
                                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-primary/20 outline-none"
                                >
                                    <option value="PG - Class 2">PG - Class 2</option>
                                    <option value="Class 3 - 5">Class 3 - 5</option>
                                    <option value="Class 6 - 8">Class 6 - 8</option>
                                    <option value="Class 9 - 10/12">Class 9 - 10/12</option>
                                </select>
                            </div>
                            <div>
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
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 text-stone-600 hover:bg-stone-200 rounded-lg text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary/90"
                            >
                                {submitting ? 'Saving...' : 'Save Profile'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Search Filter */}
            <div className="flex gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Search by name or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
                />
            </div>

            <div className="space-y-8">
                {['PG - Class 2', 'Class 3 - 5', 'Class 6 - 8', 'Class 9 - 10/12'].map((sec, index) => {
                    const sectionMembers = faculty.filter(f =>
                        f.section === sec &&
                        (f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            f.role.toLowerCase().includes(searchTerm.toLowerCase()))
                    );

                    if (sectionMembers.length === 0) return null;

                    return (
                        <motion.div
                            key={sec}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <h3 className="text-lg font-bold text-stone-700 mb-3 border-b border-stone-200 pb-2 flex items-center gap-2 font-serif">
                                <span className={`w-2 h-2 rounded-full ${sec === 'PG - Class 2' ? 'bg-[#3d2b1f]' :
                                    sec === 'Class 3 - 5' ? 'bg-[#ca8a04]' :
                                        sec === 'Class 6 - 8' ? 'bg-[#b48a3d]' :
                                            'bg-[#5c3d2e]'
                                    }`}></span>
                                {sec} Section
                            </h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <AnimatePresence>
                                    {sectionMembers.map(member => (
                                        <motion.div
                                            key={member.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.2 }}
                                            className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center gap-4 group hover:border-accent/30 hover:shadow-md transition-all relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-accent/5 to-transparent -mr-10 -mt-10 rounded-full transition-transform group-hover:scale-150 duration-500"></div>

                                            <img src={member.image_url} alt={member.name} className="w-12 h-12 rounded-full object-cover bg-stone-100 border-2 border-white shadow-sm z-10" />
                                            <div className="flex-1 z-10">
                                                <h4 className="font-bold text-stone-800 group-hover:text-accent transition-colors">{member.name}</h4>
                                                <div className="flex gap-2 items-center flex-wrap">
                                                    <span className="text-xs text-stone-500 uppercase tracking-wide font-medium">{member.role}</span>
                                                    {member.campus_id && (
                                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 border border-stone-200">
                                                            {campuses.find(c => c.id === Number(member.campus_id))?.name || 'All Campuses'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                <button
                                                    onClick={() => handleEdit(member)}
                                                    className="p-1.5 text-stone-400 hover:text-accent hover:bg-accent/5 rounded-lg transition-all"
                                                    title="Edit Member"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(member.id)}
                                                    className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete Member"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    );
                })}

                {!loading && faculty.length === 0 && (
                    <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-xl">
                        <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-slate-900 font-medium">No faculty members</h3>
                        <p className="text-slate-500 text-sm mt-1">Add staff profiles to populate the directory.</p>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Faculty Member"
                message="Are you sure you want to delete this faculty member? This action cannot be undone."
            />
        </div>
    );
};

export default AdminFaculty;

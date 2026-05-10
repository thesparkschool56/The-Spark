import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { RefreshCw, Check, X, Trash2, Eye, X as CloseIcon } from 'lucide-react';
import ConfirmModal from '../components/ui/ConfirmModal';
import { Database } from '../lib/database.types';

type Admission = Database['public']['Tables']['admissions']['Row'];

const AdminAdmissions: React.FC = () => {
    const [admissions, setAdmissions] = useState<Admission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState<string | null>(null);
    const [selectedApplication, setSelectedApplication] = useState<Admission | null>(null);

    const fetchAdmissions = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: fetchError } = await supabase.from('admissions')
                .select('*')
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setAdmissions(data || []);
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAdmissions(); }, [fetchAdmissions]);

    const updateStatus = async (id: string, newStatus: string) => {
        const { error } = await (supabase.from('admissions') as any)
            .update({ status: newStatus })
            .eq('id', id);

        if (!error) {
            fetchAdmissions();
        } else {
            setError(error.message || 'Failed to update status');
        }
    };

    const confirmDelete = async () => {
        if (!idToDelete) return;
        const { error } = await supabase.from('admissions').delete().eq('id', idToDelete);
        if (!error) {
            fetchAdmissions();
        } else {
            setError(error.message || 'Failed to delete application');
        }
        setIsConfirmOpen(false);
        setIdToDelete(null);
    };

    const getStatusColor = (status: string | null) => {
        if (!status) return 'bg-stone-100 text-stone-700';
        switch (status) {
            case 'Pending': return 'bg-amber-100 text-amber-700';
            case 'Accepted': return 'bg-green-100 text-green-700';
            case 'Rejected': return 'bg-red-100 text-red-700';
            default: return 'bg-stone-100 text-stone-700';
        }
    };

    const getCampusName = (id: number | null) => {
        switch (id) {
            case 1: return 'Jinnah';
            case 2: return 'Shebaz';
            case 3: return 'Ghazali';
            case 4: return 'Latif';
            case 5: return 'Sachal';
            case 6: return 'Iqbal';
            default: return 'N/A';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2 font-serif">
                    <span className="w-1 h-6 bg-primary rounded-full"></span>
                    Admissions Management
                </h2>
                <button onClick={fetchAdmissions} className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1">
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    Database Error: {error}
                </div>
            )}

            <div className="overflow-x-auto rounded-lg border border-stone-200 shadow-sm bg-white">
                <table className="w-full text-left">
                    <thead className="bg-stone-50 border-b border-stone-200">
                        <tr>
                            <th className="p-4 font-semibold text-stone-600 text-sm">Student</th>
                            <th className="p-4 font-semibold text-stone-600 text-sm">Date</th>
                            <th className="p-4 font-semibold text-stone-600 text-sm">Grade</th>
                            <th className="p-4 font-semibold text-stone-600 text-sm">Campus</th>
                            <th className="p-4 font-semibold text-stone-600 text-sm">Status</th>
                            <th className="p-4 font-semibold text-stone-600 text-sm text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {!loading && admissions.map(app => (
                            <tr key={app.id} className="hover:bg-stone-50 transition-colors">
                                <td className="p-4 text-sm font-medium text-stone-900">{app.student_name}</td>
                                <td className="p-4 text-sm text-stone-500">{new Date(app.created_at).toLocaleDateString()}</td>
                                <td className="p-4 text-sm font-bold text-stone-700">{app.grade}</td>
                                <td className="p-4 text-sm font-medium text-primary uppercase tracking-wider">{getCampusName(app.campus_id)}</td>
                                <td className="p-4">
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getStatusColor(app.status)}`}>
                                        {app.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-1">
                                        <button onClick={() => setSelectedApplication(app)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="View Details">
                                            <Eye size={18} />
                                        </button>
                                        <button onClick={() => updateStatus(app.id, 'Accepted')} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Accept">
                                            <Check size={18} />
                                        </button>
                                        <button onClick={() => updateStatus(app.id, 'Rejected')} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Reject">
                                            <X size={18} />
                                        </button>
                                        <button onClick={() => { setIdToDelete(app.id); setIsConfirmOpen(true); }} className="p-1.5 text-stone-400 hover:text-red-600 rounded" title="Delete">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedApplication && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                            <div>
                                <h3 className="text-xl font-serif font-bold text-stone-900">Application Context</h3>
                                <p className="text-sm text-stone-500">Submitted {new Date(selectedApplication.created_at).toLocaleDateString()}</p>
                            </div>
                            <button onClick={() => setSelectedApplication(null)} className="p-2 hover:bg-stone-200 rounded-full transition-colors">
                                <CloseIcon size={20} className="text-stone-500" />
                            </button>
                        </div>

                        <div className="p-8 grid md:grid-cols-2 gap-8">
                            <section className="space-y-4">
                                <h4 className="text-xs font-bold text-primary uppercase tracking-widest border-b pb-2">Student Profile</h4>
                                <div>
                                    <p className="text-xs text-stone-400 uppercase font-bold">Full Name</p>
                                    <p className="text-stone-900 font-medium">{selectedApplication.student_name}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-stone-400 uppercase font-bold">DOB</p>
                                        <p className="text-stone-900 font-medium">{selectedApplication.dob || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-stone-400 uppercase font-bold">Gender</p>
                                        <p className="text-stone-900 font-medium">{selectedApplication.gender || 'N/A'}</p>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h4 className="text-xs font-bold text-primary uppercase tracking-widest border-b pb-2">Academic Info</h4>
                                <div>
                                    <p className="text-xs text-stone-400 uppercase font-bold">Grade Applying For</p>
                                    <p className="text-stone-900 font-bold">{selectedApplication.grade}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-stone-400 uppercase font-bold">Previous School</p>
                                    <p className="text-stone-900 font-medium">{selectedApplication.previous_school || 'None / First School'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-stone-400 uppercase font-bold">Preferred Campus</p>
                                    <p className="text-primary font-bold uppercase tracking-widest">{getCampusName(selectedApplication.campus_id)} Campus</p>
                                </div>
                            </section>

                            <section className="space-y-4 md:col-span-2 bg-stone-50 p-4 rounded-xl border border-stone-100">
                                <h4 className="text-xs font-bold text-stone-600 uppercase tracking-widest">Contact & Guardianship</h4>
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div>
                                        <p className="text-xs text-stone-400 uppercase font-bold">Guardian Name</p>
                                        <p className="text-stone-900 font-medium">{selectedApplication.guardian_name || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-stone-400 uppercase font-bold">Contact Number</p>
                                        <p className="text-primary font-bold">{selectedApplication.guardian_contact}</p>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <div className="p-6 bg-stone-50 border-t border-stone-100 flex justify-end gap-3">
                            <button onClick={() => setSelectedApplication(null)} className="px-6 py-2 text-sm font-bold text-stone-600 hover:text-stone-900">Close</button>
                            {selectedApplication.status === 'Pending' && (
                                <button onClick={() => { updateStatus(selectedApplication.id, 'Accepted'); setSelectedApplication(null); }} className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 shadow-lg shadow-primary/20">Accept Student</button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={confirmDelete} title="Delete Admission Application" message="Are you sure you want to delete this application? This action cannot be undone." />
        </div>
    );
};

export default AdminAdmissions;

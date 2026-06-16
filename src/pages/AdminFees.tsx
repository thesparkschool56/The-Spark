import React, { useState, useEffect } from 'react';
import { ref, update, remove, onValue, set, push, get } from 'firebase/database';
import { db } from '../lib/firebase';
import { Plus, Trash2, Edit2, DollarSign } from 'lucide-react';
import ConfirmModal from '../components/ui/ConfirmModal';

export interface FeeRecord {
    id: string;
    campus_id: string;
    section: string;
    class_name: string;
    tuition_fee: number;
    admission_fee: number;
}

const SECTIONS = ['PG - Class 2', 'Class 3 - 5', 'Class 6 - 8', 'Class 9 - 10/12'];

const AdminFees: React.FC = () => {
    const [fees, setFees] = useState<FeeRecord[]>([]);
    const [campuses, setCampuses] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form
    const [campusId, setCampusId] = useState('');
    const [section, setSection] = useState(SECTIONS[0]);
    const [className, setClassName] = useState('');
    const [tuitionFee, setTuitionFee] = useState<number | ''>('');
    const [admissionFee, setAdmissionFee] = useState<number | ''>('');
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Modal State
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState<string | null>(null);

    useEffect(() => {
        const fetchCampuses = async () => {
            const snapshot = await get(ref(db, 'campuses'));
            if (snapshot.exists()) {
                const data = snapshot.val();
                const dataArray = Object.entries(data).map(([id, val]: [string, any]) => ({
                    id: id,
                    name: val.name || val
                }));
                setCampuses(dataArray);
                if (dataArray.length > 0) {
                    setCampusId(dataArray[0].id);
                }
            }
        };
        fetchCampuses();
    }, []);

    useEffect(() => {
        setLoading(true);
        const feesRef = ref(db, 'fees');
        
        const unsubscribe = onValue(feesRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const dataArray = Object.entries(data).map(([id, val]: [string, any]) => ({
                    id,
                    ...val
                })) as FeeRecord[];
                setFees(dataArray);
            } else {
                setFees([]);
            }
            setLoading(false);
        }, (error) => {
            console.error('Error fetching fees:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleEdit = (fee: FeeRecord) => {
        setEditingId(fee.id);
        setCampusId(fee.campus_id);
        setSection(fee.section);
        setClassName(fee.class_name);
        setTuitionFee(fee.tuition_fee);
        setAdmissionFee(fee.admission_fee);
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!campusId || !className.trim() || tuitionFee === '' || admissionFee === '') {
            setFormMessage({ type: 'error', text: 'All fields are required.' });
            return;
        }
        
        setSubmitting(true);

        const feeData = {
            campus_id: campusId,
            section,
            class_name: className,
            tuition_fee: Number(tuitionFee),
            admission_fee: Number(admissionFee)
        };

        try {
            if (editingId) {
                const feeRef = ref(db, `fees/${editingId}`);
                await update(feeRef, feeData);
            } else {
                const feesRef = ref(db, 'fees');
                const newFeeRef = push(feesRef);
                await set(newFeeRef, feeData);
            }

            setFormMessage({ type: 'success', text: `Fee structure successfully ${editingId ? 'updated' : 'added'}!` });
            setClassName('');
            setTuitionFee('');
            setAdmissionFee('');
            setEditingId(null);
            setShowForm(false);
            setTimeout(() => setFormMessage(null), 3000);
        } catch (error: any) {
            setFormMessage({ type: 'error', text: `Error ${editingId ? 'updating' : 'adding'} fee structure: ` + error.message });
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
            const feeRef = ref(db, `fees/${idToDelete}`);
            await remove(feeRef);

            setFormMessage({ type: 'success', text: 'Fee structure deleted successfully.' });
            setTimeout(() => setFormMessage(null), 3000);
        } catch (error: any) {
            console.error('Delete error:', error);
            setFormMessage({ type: 'error', text: 'Error deleting fee structure: ' + error.message });
        }
        setIsConfirmOpen(false);
        setIdToDelete(null);
    };

    const getCampusName = (id: string) => {
        const campus = campuses.find(c => c.id === id || String(c.id) === id);
        return campus ? campus.name : id;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2 font-serif">
                    <span className="w-1 h-6 bg-accent rounded-full"></span>
                    Manage Fee Structures
                </h2>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setClassName('');
                        setTuitionFee('');
                        setAdmissionFee('');
                        setShowForm(!showForm);
                    }}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                >
                    {showForm ? <Trash2 size={16} /> : <Plus size={16} />}
                    {showForm ? 'Cancel' : 'Add Fee Structure'}
                </button>
            </div>

            {formMessage && (
                <div className={`p-4 rounded-lg text-sm font-medium ${formMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    {formMessage.text}
                </div>
            )}

            {showForm && (
                <div className="bg-stone-50 p-6 rounded-xl border border-stone-200">
                    <h3 className="text-lg font-semibold text-stone-800 mb-4 font-serif">{editingId ? 'Edit Fee Structure' : 'Add New Fee Structure'}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Campus</label>
                                <select
                                    value={campusId}
                                    onChange={(e) => setCampusId(e.target.value)}
                                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                    required
                                >
                                    {campuses.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Section</label>
                                <select
                                    value={section}
                                    onChange={(e) => setSection(e.target.value)}
                                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                    required
                                >
                                    {SECTIONS.map(sec => (
                                        <option key={sec} value={sec}>{sec}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Class Name</label>
                                <input
                                    type="text"
                                    value={className}
                                    onChange={(e) => setClassName(e.target.value)}
                                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                    placeholder="e.g. Grade 1"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">Tuition Fee</label>
                                    <input
                                        type="number"
                                        value={tuitionFee}
                                        onChange={(e) => setTuitionFee(e.target.value === '' ? '' : Number(e.target.value))}
                                        className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                        placeholder="e.g. 15000"
                                        required
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">Admission Fee</label>
                                    <input
                                        type="number"
                                        value={admissionFee}
                                        onChange={(e) => setAdmissionFee(e.target.value === '' ? '' : Number(e.target.value))}
                                        className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                        placeholder="e.g. 25000"
                                        required
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-70 flex items-center gap-2"
                            >
                                {submitting ? 'Saving...' : (editingId ? 'Update Fee Structure' : 'Save Fee Structure')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-stone-500 flex flex-col items-center justify-center">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                        Loading fees...
                    </div>
                ) : fees.length === 0 ? (
                    <div className="p-8 text-center text-stone-500">
                        No fee structures found. Add one to get started.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-stone-50 border-b border-stone-200 text-sm text-stone-500">
                                    <th className="p-4 font-medium">Campus</th>
                                    <th className="p-4 font-medium">Section / Class</th>
                                    <th className="p-4 font-medium">Tuition Fee</th>
                                    <th className="p-4 font-medium">Admission Fee</th>
                                    <th className="p-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {fees.map((fee) => (
                                    <tr key={fee.id} className="hover:bg-stone-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-semibold text-stone-800">{getCampusName(fee.campus_id)}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm font-medium text-stone-800">{fee.class_name}</div>
                                            <div className="text-xs text-stone-500">{fee.section}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1 font-mono font-medium text-stone-700">
                                                Rs. {fee.tuition_fee.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1 font-mono font-medium text-stone-700">
                                                Rs. {fee.admission_fee.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right space-x-2">
                                            <button
                                                onClick={() => handleEdit(fee)}
                                                className="p-2 text-stone-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(fee.id)}
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
                title="Delete Fee Structure"
                message="Are you sure you want to delete this fee record? This action cannot be undone."
                confirmText="Delete Record"
            />
        </div>
    );
};

export default AdminFees;

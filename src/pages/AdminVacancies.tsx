import React, { useState, useEffect } from 'react';
import { ref, set, push, update, remove, onValue } from 'firebase/database';
import { db } from '../lib/firebase';
import { Plus, Trash2, Briefcase, RefreshCw, Users, FileText, Download, Check, X } from 'lucide-react';
import ConfirmModal from '../components/ui/ConfirmModal';

export interface JobPosition {
    id: string;
    title: string;
    description: string;
    department: string;
    campus_id?: string | number | null;
    status: string;
    created_at: string;
}

export interface Applicant {
    id: string;
    job_id: string;
    full_name: string;
    email: string;
    phone: string;
    resume_url: string;
    status: string;
    created_at: string;
    job_positions?: {
        title: string;
    } | null;
}

const AdminVacancies: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'jobs' | 'applicants'>('jobs');
    
    // Jobs State
    const [jobs, setJobs] = useState<JobPosition[]>([]);
    const [loadingJobs, setLoadingJobs] = useState(true);
    const [isSubmittingJob, setIsSubmittingJob] = useState(false);
    
    // Applicants State
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [loadingApplicants, setLoadingApplicants] = useState(true);
    const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    
    // Form State for new Job
    const [jobTitle, setJobTitle] = useState('');
    const [department, setDepartment] = useState('Academic');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('Open');
    const [campusId, setCampusId] = useState('');
    const [campuses, setCampuses] = useState<{ id: string | number; name: string }[]>([]);

    // Modal State for Deletion
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [jobToDelete, setJobToDelete] = useState<string | null>(null);

    useEffect(() => {
        let currentJobsMap: Record<string, any> = {};
        let currentApplicantsRaw: Record<string, any> = {};

        const updateApplicants = () => {
             const dataArray = Object.entries(currentApplicantsRaw).map(([key, app]: [string, any]) => {
                    const jobTitle = currentJobsMap[app.job_id] ? currentJobsMap[app.job_id].title : 'Unknown Position';
                    return {
                        id: key,
                        ...app,
                        job_positions: { title: jobTitle }
                    };
                }) as Applicant[];
                dataArray.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
                setApplicants(dataArray);
                setLoadingApplicants(false);
        };

        const unsubJobs = onValue(ref(db, 'job_positions'), (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                currentJobsMap = data;
                const dataArray = Object.entries(data).map(([id, val]: [string, any]) => ({
                    id,
                    ...val
                })) as JobPosition[];
                dataArray.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
                setJobs(dataArray);
            } else {
                currentJobsMap = {};
                setJobs([]);
            }
            setLoadingJobs(false);
            updateApplicants();
        });

        const unsubApplicants = onValue(ref(db, 'job_applicants'), (snapshot) => {
            if (snapshot.exists()) {
                currentApplicantsRaw = snapshot.val();
            } else {
                currentApplicantsRaw = {};
            }
            updateApplicants();
        });

        const unsubCampuses = onValue(ref(db, 'campuses'), (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const dataArray = Object.entries(data).map(([id, val]: [string, any]) => ({
                    id: Number(id) || id,
                    name: val.name || val
                }));
                setCampuses(dataArray);
            } else {
                setCampuses([]);
            }
        });

        return () => {
            unsubJobs();
            unsubApplicants();
            unsubCampuses();
        };
    }, []);

    const handleCreateJob = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!jobTitle.trim() || !department.trim()) {
            setActionMessage({ type: 'error', text: 'Title and Department are required fields.' });
            return;
        }
        
        setIsSubmittingJob(true);
        try {
            const newJob = {
                title: jobTitle,
                description,
                department,
                status: status,
                campus_id: campusId ? campusId : null,
                created_at: new Date().toISOString()
            };

            const jobsRef = ref(db, 'job_positions');
            const newJobRef = push(jobsRef);
            await set(newJobRef, newJob);
            
            // Reset form
            setJobTitle('');
            setDescription('');
            setCampusId('');
            setActionMessage({ type: 'success', text: 'Job posted successfully!' });
            setTimeout(() => setActionMessage(null), 3000);
            
        } catch (error: any) {
            console.error('Error posting job:', error);
            setActionMessage({ type: 'error', text: 'Failed to post job: ' + (error.message || 'Unknown error') });
        } finally {
            setIsSubmittingJob(false);
        }
    };

    const handleDeleteJob = async (id: string) => {
        setJobToDelete(id);
        setIsConfirmOpen(true);
    };

    const confirmDeleteJob = async () => {
        if (!jobToDelete) return;
        
        try {
            const jobRef = ref(db, `job_positions/${jobToDelete}`);
            await remove(jobRef);
            setActionMessage({ type: 'success', text: 'Job deleted successfully.' });
            setTimeout(() => setActionMessage(null), 3000);
        } catch (error: any) {
            console.error('Error deleting job:', error);
            setActionMessage({ type: 'error', text: 'Failed to delete job: ' + (error.message || 'Unknown error') });
        } finally {
            setIsConfirmOpen(false);
            setJobToDelete(null);
        }
    };

    const toggleJobStatus = async (id: string, currentStatus: string | null) => {
        const nextStatus = currentStatus === 'Open' ? 'Closed' : 'Open';
        try {
            const jobRef = ref(db, `job_positions/${id}`);
            await update(jobRef, { status: nextStatus });
        } catch (error: any) {
            console.error('Error updating job status:', error);
            setActionMessage({ type: 'error', text: 'Failed to update job status: ' + (error.message || 'Unknown error') });
        }
    };

    const updateApplicantStatus = async (id: string, newStatus: string) => {
        try {
            const appRef = ref(db, `job_applicants/${id}`);
            await update(appRef, { status: newStatus });
        } catch (error: any) {
            console.error('Error updating applicant status:', error);
            setActionMessage({ type: 'error', text: 'Failed to update status: ' + (error.message || 'Unknown error') });
        }
    };

    const getCampusName = (id?: string | number | null) => {
        const campus = campuses.find(c => String(c.id) === String(id));
        return campus ? campus.name : 'All Campuses';
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-stone-800 font-serif flex items-center gap-2">
                        <Briefcase className="text-primary" size={24} />
                        Recruitment Management
                    </h2>
                    <p className="text-stone-500 text-sm mt-1">Manage job postings and review applicant submissions.</p>
                </div>
                
                {/* Tabs */}
                <div className="flex bg-stone-100 p-1 rounded-xl">
                    <button 
                        onClick={() => setActiveTab('jobs')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-colors ${activeTab === 'jobs' ? 'bg-white text-primary shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                    >
                        <Briefcase size={16} /> Vacancies
                    </button>
                    <button 
                        onClick={() => setActiveTab('applicants')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-colors ${activeTab === 'applicants' ? 'bg-white text-primary shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                    >
                        <Users size={16} /> Applicants
                    </button>
                </div>
            </div>

            {actionMessage && (
                <div className={`p-4 rounded-xl text-sm border ${actionMessage.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
                    {actionMessage.text}
                </div>
            )}

            {activeTab === 'jobs' && (
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Add New Job Form */}
                    <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-stone-100 shadow-sm h-fit">
                        <h3 className="font-bold text-stone-800 mb-6 flex items-center gap-2 uppercase tracking-wide text-sm">
                            <Plus size={18} className="text-accent" /> Add New Position
                        </h3>
                        <form onSubmit={handleCreateJob} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-2">Job Title</label>
                                <input 
                                    type="text" 
                                    required
                                    value={jobTitle}
                                    onChange={(e) => setJobTitle(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="e.g. Senior Math Teacher"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-2">Department</label>
                                    <select 
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                        className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-primary outline-none"
                                    >
                                        <option>Academic</option>
                                        <option>Administration</option>
                                        <option>Operations</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-2">Campus</label>
                                    <select 
                                        value={campusId}
                                        onChange={(e) => setCampusId(e.target.value)}
                                        className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-primary outline-none"
                                    >
                                        <option value="">Any Campus</option>
                                        {campuses.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-2">Status</label>
                                    <select 
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-primary outline-none"
                                    >
                                        <option value="Open">Open</option>
                                        <option value="Closed">Closed</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-2">Description</label>
                                <textarea 
                                    required
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-primary outline-none min-h-[100px]"
                                    placeholder="Brief description of the role..."
                                />
                            </div>
                            
                            <button 
                                type="submit" 
                                disabled={isSubmittingJob}
                                className="w-full bg-primary text-white py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-stone-900 transition-colors shadow-lg disabled:opacity-50 flex justify-center"
                            >
                                {isSubmittingJob ? <RefreshCw className="animate-spin" size={16} /> : 'Publish Job'}
                            </button>
                        </form>
                    </div>

                    {/* Jobs List */}
                    <div className="lg:col-span-2 space-y-4">
                        {loadingJobs ? (
                            <div className="p-8 text-center bg-white rounded-2xl border border-stone-100">
                                <RefreshCw className="animate-spin mx-auto text-stone-300 mb-2" size={24} />
                                <p className="text-stone-500">Loading jobs...</p>
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="p-12 text-center bg-white rounded-2xl border border-stone-100 shadow-sm">
                                <p className="text-stone-500 font-medium">No job postings found.</p>
                                <p className="text-stone-400 text-sm mt-2">Create your first job posting using the form.</p>
                            </div>
                        ) : (
                            jobs.map(job => (
                                <div key={job.id} className={`bg-white p-6 rounded-2xl border ${job.status === 'Open' ? 'border-stone-100' : 'border-stone-200 opacity-70'} shadow-sm flex flex-col sm:flex-row items-start justify-between group hover:border-primary/30 transition-colors gap-4`}>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="font-bold text-lg text-stone-800">{job.title}</h4>
                                            {job.status === 'Open' ? (
                                                <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] uppercase font-bold tracking-wider rounded-full flex items-center gap-1"><Check size={10} /> Open</span>
                                            ) : (
                                                <span className="px-2 py-1 bg-stone-100 text-stone-600 text-[10px] uppercase font-bold tracking-wider rounded-full flex items-center gap-1"><X size={10} /> Closed</span>
                                            )}
                                        </div>
                                        <p className="text-stone-500 text-sm line-clamp-2 max-w-xl mb-4">{job.description}</p>
                                        <div className="flex flex-wrap gap-4 text-xs font-medium text-stone-400 uppercase tracking-wider">
                                            <span>{job.department}</span>
                                            <span>&bull;</span>
                                            <span className="text-primary font-bold">{getCampusName(job.campus_id)}</span>
                                            <span>&bull;</span>
                                            <span>Posted: {new Date(job.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                                        <button 
                                            onClick={() => toggleJobStatus(job.id, job.status)}
                                            className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all bg-stone-100 hover:bg-stone-200 text-stone-700 whitespace-nowrap"
                                        >
                                            {job.status === 'Open' ? 'Close Position' : 'Re-open'}
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteJob(job.id)}
                                            className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center gap-2"
                                            title="Delete posting"
                                        >
                                            <Trash2 size={14} /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'applicants' && (
                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-stone-50 border-b border-stone-100">
                                <tr>
                                    <th className="p-4 font-semibold text-stone-600 text-sm">Applicant Name</th>
                                    <th className="p-4 font-semibold text-stone-600 text-sm">Position</th>
                                    <th className="p-4 font-semibold text-stone-600 text-sm">Contact</th>
                                    <th className="p-4 font-semibold text-stone-600 text-sm">Status</th>
                                    <th className="p-4 font-semibold text-stone-600 text-sm text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {loadingApplicants ? (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-stone-500">
                                            <RefreshCw className="animate-spin mx-auto text-stone-300 mb-2" size={24} />
                                            Loading applicants...
                                        </td>
                                    </tr>
                                ) : applicants.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-stone-500">
                                            <FileText size={48} className="mx-auto text-stone-200 mb-4" />
                                            No applications received yet.
                                        </td>
                                    </tr>
                                ) : (
                                    applicants.map(app => (
                                        <tr key={app.id} className="hover:bg-stone-50 transition-colors">
                                            <td className="p-4">
                                                <div className="font-bold text-stone-800">{app.full_name}</div>
                                                <div className="text-[10px] text-stone-400 uppercase tracking-widest mt-1">{new Date(app.created_at).toLocaleDateString()}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-full">
                                                    {app.job_positions?.title || 'Unknown Position'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm text-stone-600">{app.email}</div>
                                                <div className="text-sm text-stone-500">{app.phone}</div>
                                            </td>
                                            <td className="p-4">
                                                <select 
                                                    value={app.status || 'Pending'}
                                                    onChange={(e) => updateApplicantStatus(app.id, e.target.value)}
                                                    className="text-xs font-bold uppercase tracking-wide p-2 rounded-lg border border-stone-200 outline-none"
                                                >
                                                    <option>Pending</option>
                                                    <option>Reviewed</option>
                                                    <option>Shortlisted</option>
                                                    <option>Rejected</option>
                                                </select>
                                            </td>
                                            <td className="p-4 text-right">
                                                <a 
                                                    href={app.resume_url || '#'}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
                                                >
                                                    <Download size={14} /> Resume
                                                </a>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <ConfirmModal 
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={confirmDeleteJob}
                title="Delete Job Posting"
                message="Are you sure you want to delete this job vacancy? This action cannot be undone."
            />
        </div>
    );
};

export default AdminVacancies;

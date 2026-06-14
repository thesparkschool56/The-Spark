import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Loader2, Send, X, CheckCircle2 } from 'lucide-react';
import { ref, get, push, set, onValue } from 'firebase/database';
import { db } from '../lib/firebase';
 
interface JobPosition {
    id: string;
    title: string;
    description: string;
    type: string;
    campus_id: number | null;
    status: string;
}
 
const Vacancies: React.FC = () => {
    const [jobs, setJobs] = useState<JobPosition[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState<JobPosition | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const [applicantData, setApplicantData] = useState({
        name: '',
        email: '',
        age: '',
        degree: '',
        education: '',
        department: '',
        resume_url: ''
    });

    useEffect(() => {
        const jobsRef = ref(db, 'job_positions');
        setLoading(true);
        const unsubscribe = onValue(jobsRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const dataArray = Object.entries(data)
                    .map(([id, val]: [string, any]) => ({ id, ...val }))
                    .filter(job => job.status === 'Open');
                setJobs(dataArray as JobPosition[]);
            } else {
                setJobs([]);
            }
            setLoading(false);
        }, (error) => {
            console.error(error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedJob) return;
        setIsSubmitting(true);

        try {
            const applicantsRef = ref(db, 'job_applicants');
            const newApplicantRef = push(applicantsRef);
            await set(newApplicantRef, {
                job_id: selectedJob.id,
                full_name: applicantData.name,
                email: applicantData.email,
                age: applicantData.age ? parseInt(applicantData.age) : null,
                degree: applicantData.degree,
                education: applicantData.education,
                department: applicantData.department,
                resume_url: applicantData.resume_url,
                status: 'Pending',
                created_at: new Date().toISOString()
            });
            setSuccess(true);
            setTimeout(() => {
                setShowApplyModal(false);
                setSuccess(false);
                setApplicantData({ name: '', email: '', age: '', degree: '', education: '', department: '', resume_url: '' });
            }, 3000);
        } catch (err) {
            console.error('Application Error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-[#faf9f6] min-h-screen py-20 font-sans">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-4 tracking-tight">Join Our Mission</h1>
                    <p className="text-stone-500 max-w-xl mx-auto text-sm md:text-base">We are looking for exceptional educators and administrative leaders to shape the future of learning.</p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="animate-spin text-stone-300 mb-4" size={32} />
                        <p className="text-stone-400 text-sm font-medium">Scanning open roles...</p>
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-stone-100 shadow-sm">
                        <Briefcase className="mx-auto text-stone-200 mb-4" size={48} />
                        <h3 className="text-stone-800 font-bold text-lg">No Active Vacancies</h3>
                        <p className="text-stone-400 text-sm mt-1">Check back later or follow our social channels for updates.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {jobs.map(job => (
                            <motion.div 
                                key={job.id} 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white p-8 rounded-[2rem] border border-stone-100 shadow-sm hover:shadow-xl hover:border-accent/20 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="px-3 py-1 bg-stone-50 text-stone-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-stone-100">
                                            {job.type}
                                        </span>
                                        <span className="px-3 py-1 bg-accent/5 text-accent text-[10px] font-black uppercase tracking-widest rounded-full border border-accent/10">
                                            {job.campus_id ? `Campus ${job.campus_id}` : 'All Campuses'}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-serif font-bold text-stone-900 mb-2 group-hover:text-primary transition-colors uppercase tracking-tight">
                                        {job.title}
                                    </h3>
                                    <p className="text-stone-500 text-sm line-clamp-2 max-w-2xl font-light leading-relaxed">
                                        {job.description}
                                    </p>
                                </div>
                                
                                <div className="flex items-center gap-4 shrink-0">
                                    <button 
                                        onClick={() => { setSelectedJob(job); setShowApplyModal(true); }}
                                        className="bg-stone-900 text-white px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-primary transition-all shadow-xl shadow-stone-200 active:scale-95"
                                    >
                                        Apply Now
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Application Modal */}
            <AnimatePresence>
                {showApplyModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowApplyModal(false)} className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
                            <div className="p-8 border-b border-stone-50 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-serif font-bold text-stone-900">Application Form</h3>
                                    <p className="text-stone-400 text-xs mt-1 uppercase tracking-widest font-bold">Role: {selectedJob?.title}</p>
                                </div>
                                <button onClick={() => setShowApplyModal(false)} className="p-2 hover:bg-stone-50 rounded-xl text-stone-400"><X size={20} /></button>
                            </div>
                            
                            <div className="p-8">
                                {success ? (
                                    <div className="py-12 text-center space-y-4">
                                        <div className="w-16 h-16 bg-stone-900 text-white rounded-2xl flex items-center justify-center mx-auto shadow-xl"><CheckCircle2 size={32} /></div>
                                        <h4 className="text-2xl font-serif font-bold text-stone-900">Application Sent</h4>
                                        <p className="text-stone-500 text-sm">We've received your inquiry and will be in touch shortly.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleApply} className="space-y-5">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Full Name</label>
                                                <input required type="text" value={applicantData.name} onChange={e => setApplicantData({...applicantData, name: e.target.value})} className="w-full px-5 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-stone-50 focus:border-stone-400 transition-all text-sm" placeholder="Your full name" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Email Address</label>
                                                <input required type="email" value={applicantData.email} onChange={e => setApplicantData({...applicantData, email: e.target.value})} className="w-full px-5 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-stone-50 focus:border-stone-400 transition-all text-sm" placeholder="name@email.com" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Age</label>
                                                <input required type="number" min="18" max="80" value={applicantData.age} onChange={e => setApplicantData({...applicantData, age: e.target.value})} className="w-full px-5 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-stone-50 focus:border-stone-400 transition-all text-sm" placeholder="e.g. 28" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Department</label>
                                                <select required value={applicantData.department} onChange={e => setApplicantData({...applicantData, department: e.target.value})} className="w-full px-5 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-stone-50 focus:border-stone-400 transition-all text-sm appearance-none cursor-pointer">
                                                    <option value="" disabled>Select Department</option>
                                                    <option value="Academic">Academic / Faculty</option>
                                                    <option value="Administration">Administration</option>
                                                    <option value="Technology">Technology</option>
                                                    <option value="Operations">Operations</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Highest Degree</label>
                                                <input required type="text" value={applicantData.degree} onChange={e => setApplicantData({...applicantData, degree: e.target.value})} className="w-full px-5 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-stone-50 focus:border-stone-400 transition-all text-sm" placeholder="e.g. Masters in Education" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">University / Institution</label>
                                                <input required type="text" value={applicantData.education} onChange={e => setApplicantData({...applicantData, education: e.target.value})} className="w-full px-5 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-stone-50 focus:border-stone-400 transition-all text-sm" placeholder="University Name" />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Resume / CV Link</label>
                                            <input required type="url" value={applicantData.resume_url} onChange={e => setApplicantData({...applicantData, resume_url: e.target.value})} className="w-full px-5 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-stone-50 focus:border-stone-400 transition-all text-sm" placeholder="URL to your LinkedIn, Portfolio, or Drive file" />
                                            <p className="text-[10px] text-stone-400 ml-1 mt-1">Please provide a public link to your resume or professional profile.</p>
                                        </div>

                                        <button disabled={isSubmitting} type="submit" className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-stone-200 mt-2">
                                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> Submit Application</>}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Vacancies;

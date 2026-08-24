import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, Loader2, User, Users, BookOpen, MapPin, Phone } from 'lucide-react';
import { ref, push, set } from 'firebase/database';
import { db } from '../lib/firebase';

const Admissions: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Comprehensive Form State
    const [formData, setFormData] = useState({
        // Student Details
        studentName: '',
        dob: '',
        gender: '',
        // Parent Details
        fatherName: '',
        motherName: '',
        primaryContact: '',
        secondaryContact: '',
        address: '',
        // Academic History
        previousSchool: '',
        previousGrade: '',
        gradeApplyingFor: '',
        campusId: '',
    });

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        const studentName = formData.studentName.trim();
        const primaryContact = formData.primaryContact.trim();

        if (!studentName || !primaryContact || !formData.gradeApplyingFor) {
            setSubmitError('Please complete all required fields (Student Name, Primary Contact, Grade).');
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const admissionsRef = ref(db, 'admissions');
            const newAdmissionRef = push(admissionsRef);
            await set(newAdmissionRef, {
                student_name: studentName,
                dob: formData.dob,
                gender: formData.gender,
                father_name: formData.fatherName.trim(),
                mother_name: formData.motherName.trim(),
                guardian_name: formData.fatherName.trim(), // mapped from schema
                guardian_contact: primaryContact,
                parent_contact: formData.secondaryContact.trim() || primaryContact, // mapped from schema
                secondary_contact: formData.secondaryContact.trim(),
                residential_address: formData.address.trim(),
                previous_school: formData.previousSchool.trim(),
                previous_grade: formData.previousGrade.trim(),
                grade: formData.gradeApplyingFor,
                grade_applying: formData.gradeApplyingFor, // mapped from schema
                campus_id: formData.campusId ? parseInt(formData.campusId) : null,
                status: 'Pending',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

            setCurrentStep(4); // Success step
        } catch (err: any) {
            setSubmitError(err.message || 'Submission failed. Please check your connection.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const steps = [
        { id: 1, title: "Student", icon: <User size={18} /> },
        { id: 2, title: "Parents", icon: <Users size={18} /> },
        { id: 3, title: "Academic", icon: <BookOpen size={18} /> }
    ];

    return (
        <div className="bg-[#faf9f6] min-h-screen py-20 font-sans">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-4 tracking-tight">Admission Inquiry</h1>
                    <p className="text-stone-500 max-w-xl mx-auto text-sm md:text-base">Please provide comprehensive details to begin the enrollment process at The Spark School & College.</p>
                </div>

                {/* Stepper */}
                <div className="flex items-center justify-center gap-4 mb-12">
                    {steps.map((step, idx) => (
                        <React.Fragment key={step.id}>
                            <div className="flex flex-col items-center gap-2">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                                    currentStep >= step.id ? 'bg-stone-900 text-white shadow-xl shadow-stone-200' : 'bg-white text-stone-300 border border-stone-100'
                                }`}>
                                    {currentStep > step.id ? <Check size={20} /> : step.icon}
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${currentStep >= step.id ? 'text-stone-900' : 'text-stone-300'}`}>{step.title}</span>
                            </div>
                            {idx < steps.length - 1 && (
                                <div className={`w-12 h-[2px] mb-6 transition-colors duration-500 ${currentStep > step.id ? 'bg-stone-900' : 'bg-stone-200'}`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                <div className="bg-white rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.03)] border border-stone-100 overflow-hidden">
                    <form onSubmit={handleNext} className="p-8 md:p-12">
                        <AnimatePresence mode="wait">
                            {currentStep === 1 && (
                                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                    <div className="pb-4 border-b border-stone-50">
                                        <h2 className="text-xl font-serif font-bold text-stone-900">Student Particulars</h2>
                                        <p className="text-stone-400 text-xs mt-1 uppercase tracking-widest font-bold">Step 01 / 03</p>
                                    </div>
                                    
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-stone-400 uppercase tracking-widest ml-1">Student Full Name</label>
                                            <input required type="text" value={formData.studentName} onChange={e => setFormData({...formData, studentName: e.target.value})} className="w-full px-5 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-stone-50 focus:border-stone-400 outline-none transition-all" placeholder="Enter student name" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-stone-400 uppercase tracking-widest ml-1">Date of Birth</label>
                                            <input required type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="w-full px-5 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-stone-50 focus:border-stone-400 outline-none transition-all" />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-[11px] font-bold text-stone-400 uppercase tracking-widest ml-1 block mb-4">Gender Selection</label>
                                            <div className="flex gap-4">
                                                {['Male', 'Female', 'Other'].map(g => (
                                                    <button key={g} type="button" onClick={() => setFormData({...formData, gender: g})} className={`flex-1 py-4 rounded-2xl border text-sm font-bold transition-all ${formData.gender === g ? 'bg-stone-900 border-stone-900 text-white shadow-lg' : 'bg-stone-50 border-stone-100 text-stone-500 hover:bg-stone-100'}`}>
                                                        {g}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {currentStep === 2 && (
                                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                    <div className="pb-4 border-b border-stone-50">
                                        <h2 className="text-xl font-serif font-bold text-stone-900">Parental Information</h2>
                                        <p className="text-stone-400 text-xs mt-1 uppercase tracking-widest font-bold">Step 02 / 03</p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-stone-400 uppercase tracking-widest ml-1">Father's Full Name</label>
                                            <input required type="text" value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} className="w-full px-5 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-stone-50 focus:border-stone-400 outline-none transition-all" placeholder="Enter father's name" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-stone-400 uppercase tracking-widest ml-1">Mother's Full Name</label>
                                            <input required type="text" value={formData.motherName} onChange={e => setFormData({...formData, motherName: e.target.value})} className="w-full px-5 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-stone-50 focus:border-stone-400 outline-none transition-all" placeholder="Enter mother's name" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-stone-400 uppercase tracking-widest ml-1">Primary Contact</label>
                                            <div className="relative">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                                                <input required type="tel" value={formData.primaryContact} onChange={e => setFormData({...formData, primaryContact: e.target.value})} className="w-full pl-12 pr-5 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-stone-50 focus:border-stone-400 outline-none transition-all" placeholder="+92 XXX XXXXXXX" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-stone-400 uppercase tracking-widest ml-1">Secondary Contact</label>
                                            <div className="relative">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                                                <input required type="tel" value={formData.secondaryContact} onChange={e => setFormData({...formData, secondaryContact: e.target.value})} className="w-full pl-12 pr-5 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-stone-50 focus:border-stone-400 outline-none transition-all" placeholder="+92 XXX XXXXXXX" />
                                            </div>
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-[11px] font-bold text-stone-400 uppercase tracking-widest ml-1">Residential Address</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-5 text-stone-300" size={18} />
                                                <textarea required rows={3} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full pl-12 pr-5 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-stone-50 focus:border-stone-400 outline-none transition-all resize-none" placeholder="Enter complete residential address"></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {currentStep === 3 && (
                                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                    <div className="pb-4 border-b border-stone-50">
                                        <h2 className="text-xl font-serif font-bold text-stone-900">Academic History</h2>
                                        <p className="text-stone-400 text-xs mt-1 uppercase tracking-widest font-bold">Step 03 / 03</p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-[11px] font-bold text-stone-400 uppercase tracking-widest ml-1">Previous Institution</label>
                                            <input required type="text" value={formData.previousSchool} onChange={e => setFormData({...formData, previousSchool: e.target.value})} className="w-full px-5 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-stone-50 focus:border-stone-400 outline-none transition-all" placeholder="Enter previous school name" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-stone-400 uppercase tracking-widest ml-1">Previous Grade</label>
                                            <input required type="text" value={formData.previousGrade} onChange={e => setFormData({...formData, previousGrade: e.target.value})} className="w-full px-5 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-stone-50 focus:border-stone-400 outline-none transition-all" placeholder="e.g. Grade 5" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-stone-400 uppercase tracking-widest ml-1">Grade Applying For</label>
                                            <select required value={formData.gradeApplyingFor} onChange={e => setFormData({...formData, gradeApplyingFor: e.target.value})} className="w-full px-5 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-stone-50 focus:border-stone-400 outline-none transition-all">
                                                <option value="">Select Grade</option>
                                                {['PG', 'Nursery', 'KG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'O-Levels', 'A-Levels'].map(g => (
                                                    <option key={g} value={g}>{g}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-[11px] font-bold text-stone-400 uppercase tracking-widest ml-1">Preferred Campus</label>
                                            <select required value={formData.campusId} onChange={e => setFormData({...formData, campusId: e.target.value})} className="w-full px-5 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-stone-50 focus:border-stone-400 outline-none transition-all">
                                                <option value="">Select Campus</option>
                                                <option value="1">Jinnah Campus</option>
                                                <option value="2">Shebaz Campus</option>
                                                <option value="3">Ghazali Campus</option>
                                                <option value="4">Latif Campus</option>
                                                <option value="5">Sachal Campus</option>
                                                <option value="6">Iqbal Campus</option>
                                            </select>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {currentStep === 4 && (
                                <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12 space-y-6">
                                    <div className="w-20 h-20 bg-stone-900 text-white rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                                        <Check size={40} />
                                    </div>
                                    <h2 className="text-3xl font-serif font-bold text-stone-900">Application Received</h2>
                                    <p className="text-stone-500 max-w-sm mx-auto">Thank you for choosing The Spark. Our admissions team will contact you within 48 hours for the next steps.</p>
                                    <button type="button" onClick={() => window.location.href = '/'} className="px-8 py-4 bg-stone-50 text-stone-800 font-bold rounded-2xl hover:bg-stone-100 transition-all">
                                        Return Home
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {currentStep < 4 && (
                            <div className="mt-16 pt-8 border-t border-stone-50 flex items-center justify-between">
                                <button type="button" disabled={currentStep === 1} onClick={() => setCurrentStep(prev => prev - 1)} className="text-sm font-bold text-stone-400 hover:text-stone-900 transition-colors disabled:opacity-0">
                                    Previous Step
                                </button>
                                
                                <button type="submit" disabled={isSubmitting} className="bg-stone-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-black transition-all flex items-center gap-3 shadow-xl shadow-stone-200">
                                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (
                                        <>
                                            {currentStep === 3 ? 'Submit Application' : 'Continue'}
                                            <ChevronRight size={18} />
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </form>
                </div>

                {submitError && (
                    <p className="text-center mt-6 text-red-500 text-xs font-medium bg-red-50 py-3 px-6 rounded-xl inline-block mx-auto">{submitError}</p>
                )}
            </div>
        </div>
    );
};

export default Admissions;

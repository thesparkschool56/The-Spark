import React, { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { db } from '../../lib/firebase';
import { CreditCard, ChevronRight, Info, Loader2 } from 'lucide-react';

interface FeeRecord {
    id: number;
    section: string;
    class_name: string;
    tuition_fee: number;
    admission_fee: number;
}

interface Props {
    campusId: string;
    themeColor?: string;
}

const CampusFeeStructure: React.FC<Props> = ({ campusId }) => {
    const [fees, setFees] = useState<FeeRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSection, setSelectedSection] = useState<string>('');
    const [selectedClass, setSelectedClass] = useState<string>('');

    useEffect(() => {
        const fetchFees = async () => {
            const snapshot = await get(ref(db, 'fees'));
            if (snapshot.exists()) {
                const data = snapshot.val();
                const dataArray = Object.keys(data).map(key => ({ id: key, ...data[key] }));
                const feeData = dataArray.filter(f => String(f.campus_id) === String(campusId)) as any as FeeRecord[];
                setFees(feeData);
                if (feeData.length > 0) {
                    const sections = Array.from(new Set(feeData.map(f => f.section)));
                    setSelectedSection(sections[0] || '');
                }
            }
            setLoading(false);
        };
        fetchFees();
    }, [campusId]);

    const sections = Array.from(new Set(fees.map(f => f.section)));
    const classes = fees.filter(f => f.section === selectedSection).map(f => f.class_name);
    const currentFee = fees.find(f => f.section === selectedSection && f.class_name === selectedClass);

    useEffect(() => {
        if (classes.length > 0 && !classes.includes(selectedClass)) {
            setSelectedClass(classes[0]);
        }
    }, [selectedSection, classes, selectedClass]);

    if (loading) return (
        <div className="bg-white p-12 rounded-[2.5rem] border border-stone-100 flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 className="animate-spin text-primary mb-4" size={32} />
            <p className="text-stone-400 text-sm font-medium animate-pulse">Synchronizing Fee Data...</p>
        </div>
    );

    if (fees.length === 0) return null;

    return (
        <div className="bg-white rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.05)] border border-stone-100 overflow-hidden">
            <div className="p-10 md:p-14 border-b border-stone-50">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                    <div className="max-w-xl">
                        <span className="text-primary font-black tracking-[0.4em] uppercase text-[10px] mb-3 block">Financial Transparency</span>
                        <h3 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 leading-tight">Investment in <span className="text-stone-400 italic">Excellence</span></h3>
                        <p className="text-stone-500 mt-4 font-light leading-relaxed">Comprehensive fee schedules tailored for each academic tier. Select your child's level to view the investment breakdown.</p>
                    </div>
                </div>
                
                {/* Section Tabs */}
                <div className="flex flex-wrap gap-2 mt-12 p-1.5 bg-stone-50 rounded-2xl border border-stone-100 inline-flex">
                    {sections.map(s => (
                        <button
                            key={s}
                            onClick={() => setSelectedSection(s)}
                            className={`px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                selectedSection === s 
                                ? 'bg-white text-primary shadow-lg shadow-stone-200/50' 
                                : 'text-stone-400 hover:text-stone-600'
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-10 md:p-14 bg-white">
                <div className="grid lg:grid-cols-12 gap-12">
                    {/* Class Selector Sidebar */}
                    <div className="lg:col-span-4 space-y-3">
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] mb-6 px-2">Select Class</p>
                        {classes.map(c => (
                            <button
                                key={c}
                                onClick={() => setSelectedClass(c)}
                                className={`w-full text-left px-6 py-5 rounded-2xl text-sm font-bold transition-all flex justify-between items-center group ${
                                    selectedClass === c
                                    ? 'bg-stone-900 text-white shadow-2xl shadow-stone-900/20 translate-x-2'
                                    : 'bg-white border border-stone-100 text-stone-600 hover:border-stone-300'
                                }`}
                            >
                                {c}
                                <ChevronRight size={16} className={`transition-transform duration-300 ${selectedClass === c ? 'translate-x-1 opacity-100' : 'opacity-0'}`} />
                            </button>
                        ))}
                    </div>

                    {/* Fee Details Content */}
                    <div className="lg:col-span-8">
                        <div className="grid md:grid-cols-2 gap-8 h-full">
                            <div className="bg-stone-50/50 p-10 rounded-[2.5rem] border border-stone-100 flex flex-col justify-between group hover:bg-white hover:shadow-2xl transition-all duration-500">
                                <div>
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-stone-800 mb-8 shadow-sm group-hover:scale-110 transition-transform">
                                        <CreditCard size={28} />
                                    </div>
                                    <p className="text-stone-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Monthly Installment</p>
                                    <h4 className="text-stone-500 text-sm font-medium mb-1">Tuition Fee</h4>
                                </div>
                                <div>
                                    <div className="text-5xl font-serif font-bold text-stone-900 mb-6 tracking-tighter">
                                        Rs. {currentFee?.tuition_fee.toLocaleString() || '0'}
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] text-stone-400 font-bold uppercase tracking-widest py-3 border-t border-stone-100">
                                        <Info size={14} className="text-primary" />
                                        <span>Full resource access included</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-stone-50/50 p-10 rounded-[2.5rem] border border-stone-100 flex flex-col justify-between group hover:bg-white hover:shadow-2xl transition-all duration-500">
                                <div>
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-stone-800 mb-8 shadow-sm group-hover:scale-110 transition-transform">
                                        <ChevronRight size={28} />
                                    </div>
                                    <p className="text-stone-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Registration Cycle</p>
                                    <h4 className="text-stone-500 text-sm font-medium mb-1">Admission Fee</h4>
                                </div>
                                <div>
                                    <div className="text-5xl font-serif font-bold text-stone-900 mb-6 tracking-tighter">
                                        Rs. {currentFee?.admission_fee.toLocaleString() || '0'}
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] text-stone-400 font-bold uppercase tracking-widest py-3 border-t border-stone-100">
                                        <Info size={14} className="text-primary" />
                                        <span>One-time administrative fee</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CampusFeeStructure;

import React, { useState, useEffect } from 'react';
import { ref, get, set, onValue } from 'firebase/database';
import { db } from '../lib/firebase';
import { Trophy, Plus, Minus, CheckCircle, ChevronRight, School, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SECTIONS = ['Junior', 'Middle', 'Senior', 'College'];
const HOUSES = ['Zest', 'Sharp', 'Brave', 'Decent', 'Smart'];

const AdminScoreboard: React.FC = () => {
    const [campuses, setCampuses] = useState<{ id: string | number; name: string }[]>([]);
    const [step, setStep] = useState(1);
    const [selectedCampus, setSelectedCampus] = useState<string | number | null>(null);
    const [selectedSection, setSelectedSection] = useState<string | null>(null);
    const [selectedHouse, setSelectedHouse] = useState<string | null>(null);
    
    const [points, setPoints] = useState<number>(0);
    const [isUpdating, setIsUpdating] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        const fetchCampuses = async () => {
            try {
                const snapshot = await get(ref(db, 'campuses'));
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const dataArray = Object.keys(data).map(key => ({
                        id: Number(key) || key,
                        name: data[key].name || data[key]
                    })) as any[];
                    setCampuses(dataArray);
                }
            } catch (error: any) {
                console.error("Scoreboard Campuses Fetch Error:", error);
                setMessage({ type: 'error', text: 'Failed to load campuses: ' + error.message });
            }
        };
        fetchCampuses();
    }, []);

    useEffect(() => {
        let unsubscribe: (() => void) | undefined;
        
        if (step === 3 && selectedCampus && selectedSection && selectedHouse) {
            const id = `${selectedCampus}_${selectedSection}_${selectedHouse}`;
            const pointsRef = ref(db, `scoreboard/${id}`);
            
            unsubscribe = onValue(pointsRef, (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    setPoints(data?.points || 0);
                } else {
                    setPoints(0);
                }
            }, (err) => {
                console.error("Scoreboard Points Fetch Error:", err);
                setMessage({ type: 'error', text: 'An unexpected error occurred.' });
            });
        }
        
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [step, selectedCampus, selectedSection, selectedHouse]);

    const handleUpdatePoints = async (amount: number) => {
        if (!selectedCampus || !selectedSection || !selectedHouse) return;
        
        setIsUpdating(true);
        const id = `${selectedCampus}_${selectedSection}_${selectedHouse}`;
        const newPoints = points + amount;

        try {
            const pointsRef = ref(db, `scoreboard/${id}`);
            await set(pointsRef, {
                id,
                campus_id: selectedCampus,
                section: selectedSection,
                house_name: selectedHouse,
                points: newPoints
            });
            
            setMessage({ type: 'success', text: `Points updated! ${selectedHouse} now has ${newPoints}.` });
            setTimeout(() => setMessage(null), 3000);
        } catch (error: any) {
            setMessage({ type: 'error', text: 'Failed to update points: ' + error.message });
        }
        setIsUpdating(false);
    };

    const reset = () => {
        setStep(1);
        setSelectedCampus(null);
        setSelectedSection(null);
        setSelectedHouse(null);
        setMessage(null);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-serif font-bold text-stone-900 flex items-center gap-3">
                    <Trophy className="text-amber-500" /> Scoreboard Controller
                </h1>
                <p className="text-stone-500 mt-2">Manage inter-house competition points in realtime.</p>
            </div>

            {/* Stepper Header */}
            <div className="flex items-center gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-stone-200">
                <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-stone-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === 1 ? 'bg-primary text-white' : 'bg-stone-100'}`}>1</div>
                    <span className="font-bold hidden sm:inline">Campus</span>
                </div>
                <ChevronRight size={16} className="text-stone-300" />
                <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-stone-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === 2 ? 'bg-primary text-white' : 'bg-stone-100'}`}>2</div>
                    <span className="font-bold hidden sm:inline">Section</span>
                </div>
                <ChevronRight size={16} className="text-stone-300" />
                <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary' : 'text-stone-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === 3 ? 'bg-primary text-white' : 'bg-stone-100'}`}>3</div>
                    <span className="font-bold hidden sm:inline">Update</span>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div 
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
                    >
                        {campuses.map(campus => (
                            <button
                                key={campus.id}
                                onClick={() => { setSelectedCampus(campus.id); setStep(2); }}
                                className="bg-white p-6 rounded-2xl border-2 border-stone-100 hover:border-primary hover:shadow-lg transition-all text-left group"
                            >
                                <School className="text-stone-300 group-hover:text-primary mb-4" size={32} />
                                <h3 className="font-bold text-lg text-stone-800">{campus.name}</h3>
                                <p className="text-sm text-stone-500">Select this campus to manage its houses.</p>
                            </button>
                        ))}
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div 
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-stone-800">Select Section</h2>
                            <button onClick={() => setStep(1)} className="text-primary font-bold text-sm">Change Campus</button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {SECTIONS.map(section => (
                                <button
                                    key={section}
                                    onClick={() => { setSelectedSection(section); setStep(3); }}
                                    className="bg-white p-6 rounded-2xl border-2 border-stone-100 hover:border-primary hover:shadow-lg transition-all group text-center"
                                >
                                    <LayoutGrid className="text-stone-300 group-hover:text-primary mx-auto mb-3" size={24} />
                                    <span className="font-bold text-stone-800">{section}</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div 
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-stone-800">Update Points</h2>
                                <p className="text-sm text-stone-500">
                                    {campuses.find(c => c.id === selectedCampus)?.name} • {selectedSection} Section
                                </p>
                            </div>
                            <button onClick={() => setStep(2)} className="text-primary font-bold text-sm">Change Section</button>
                        </div>

                        {/* House Selector */}
                        <div className="flex flex-wrap gap-3">
                            {HOUSES.map(house => (
                                <button
                                    key={house}
                                    onClick={() => setSelectedHouse(house)}
                                    className={`px-6 py-3 rounded-full font-bold transition-all ${
                                        selectedHouse === house 
                                        ? 'bg-primary text-white shadow-lg scale-105' 
                                        : 'bg-white text-stone-600 border border-stone-200 hover:border-primary'
                                    }`}
                                >
                                    {house} House
                                </button>
                            ))}
                        </div>

                        {selectedHouse && (
                            <div className="bg-white p-8 rounded-3xl shadow-xl border border-stone-100 text-center">
                                <span className="text-stone-400 font-bold uppercase tracking-widest text-xs mb-2 block">Current Points</span>
                                <div className="text-6xl font-serif font-bold text-stone-900 mb-8">{points}</div>
                                
                                <div className="flex items-center justify-center gap-6">
                                    <button
                                        disabled={isUpdating}
                                        onClick={() => handleUpdatePoints(-10)}
                                        className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
                                    >
                                        <Minus size={32} />
                                    </button>
                                    <button
                                        disabled={isUpdating}
                                        onClick={() => handleUpdatePoints(-50)}
                                        className="px-6 py-4 rounded-2xl bg-stone-100 font-bold text-stone-600 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
                                    >
                                        -50
                                    </button>
                                    <div className="w-px h-12 bg-stone-100"></div>
                                    <button
                                        disabled={isUpdating}
                                        onClick={() => handleUpdatePoints(50)}
                                        className="px-6 py-4 rounded-2xl bg-primary/10 font-bold text-primary hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                                    >
                                        +50
                                    </button>
                                    <button
                                        disabled={isUpdating}
                                        onClick={() => handleUpdatePoints(10)}
                                        className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                                    >
                                        <Plus size={32} />
                                    </button>
                                </div>

                                {message && (
                                    <div className={`mt-8 p-4 rounded-xl flex items-center gap-3 justify-center ${
                                        message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                    }`}>
                                        <CheckCircle size={20} />
                                        <span className="font-medium">{message.text}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="pt-8 border-t border-stone-100">
                            <button 
                                onClick={reset}
                                className="w-full py-4 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-colors"
                            >
                                Finish & Start Over
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminScoreboard;

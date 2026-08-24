import React, { useState, useEffect } from 'react';
import { ref, get, set, onValue } from 'firebase/database';
import { db } from '../lib/firebase';
import { Trophy, Plus, Minus, CheckCircle, ChevronRight, School, LayoutGrid, Award, BarChart3, SlidersHorizontal, RefreshCw, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SECTIONS = ['Junior', 'Middle', 'Senior', 'College'];
const HOUSES = ['Zest', 'Sharp', 'Brave', 'Decent', 'Smart'];

const HOUSE_COLORS: Record<string, { bg: string; text: string; border: string; accent: string }> = {
    Zest: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', accent: '#f59e0b' },
    Sharp: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', accent: '#3b82f6' },
    Brave: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', accent: '#ef4444' },
    Decent: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', accent: '#10b981' },
    Smart: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', accent: '#8b5cf6' },
};

export interface ScoreRecord {
    id: string;
    campus_id: string | number;
    section: string;
    house_name: string;
    points: number;
}

const AdminScoreboard: React.FC = () => {
    const [campuses, setCampuses] = useState<{ id: string | number; name: string }[]>([]);
    const [allScores, setAllScores] = useState<ScoreRecord[]>([]);
    const [loading, setLoading] = useState(true);

    // Active View Mode: 'overview' | 'controller'
    const [viewMode, setViewMode] = useState<'overview' | 'controller'>('overview');

    // Filters for Overview Table
    const [filterCampus, setFilterCampus] = useState<string>('ALL');
    const [filterSection, setFilterSection] = useState<string>('ALL');

    // Wizard Controller State
    const [step, setStep] = useState(1);
    const [selectedCampus, setSelectedCampus] = useState<string | number | null>(null);
    const [selectedSection, setSelectedSection] = useState<string | null>(null);
    const [selectedHouse, setSelectedHouse] = useState<string | null>(null);
    const [currentWizardPoints, setCurrentWizardPoints] = useState<number>(0);
    
    const [isUpdating, setIsUpdating] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Load Campuses
    useEffect(() => {
        const fetchCampuses = async () => {
            try {
                const snapshot = await get(ref(db, 'campuses'));
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const dataArray = Object.entries(data).map(([key, val]: [string, any]) => ({
                        id: key,
                        name: val.name || val
                    }));
                    setCampuses(dataArray);
                }
            } catch (error: any) {
                console.error("Scoreboard Campuses Fetch Error:", error);
            }
        };
        fetchCampuses();
    }, []);

    // Recursive score extractor to parse numeric scores or object snapshots
    const parseScoreboardSnapshot = (snapshotVal: any): ScoreRecord[] => {
        if (!snapshotVal || typeof snapshotVal !== 'object') return [];
        const recordsMap = new Map<string, ScoreRecord>();

        const traverse = (node: any, pathKeys: string[]) => {
            if (node === null || node === undefined) return;
            if (pathKeys.includes('house_totals') || pathKeys.includes('totals') || pathKeys.includes('last_updated')) return;

            // Direct numeric score value at node (e.g. scoreboard_hierarchy/campuses/campus_jinnah/Senior/Zest = 150)
            if (typeof node === 'number' || (typeof node === 'string' && node.trim() !== '' && !isNaN(Number(node)))) {
                const points = Math.max(0, Number(node) || 0);
                if (pathKeys.length >= 3) {
                    const house_name = pathKeys[pathKeys.length - 1];
                    const section = pathKeys[pathKeys.length - 2];
                    const campus_id = pathKeys[pathKeys.length - 3];
                    const id = `${campus_id}_${section}_${house_name}`;

                    if (HOUSES.includes(house_name) && SECTIONS.includes(section)) {
                        recordsMap.set(id, { id, campus_id, section, house_name, points });
                    }
                }
                return;
            }

            // Object node containing points property
            if (typeof node === 'object' && 'points' in node) {
                const points = Math.max(0, Number(node.points) || 0);
                const house_name = node.house_name || pathKeys[pathKeys.length - 1];
                const section = node.section || pathKeys[pathKeys.length - 2];
                const campus_id = node.campus_id || pathKeys[pathKeys.length - 3] || pathKeys[0];
                const id = node.id || `${campus_id}_${section}_${house_name}`;

                if (HOUSES.includes(house_name)) {
                    recordsMap.set(id, { id, campus_id, section, house_name, points });
                }
                return;
            }

            if (typeof node === 'object') {
                Object.keys(node).forEach(key => {
                    traverse(node[key], [...pathKeys, key]);
                });
            }
        };

        traverse(snapshotVal, []);
        return Array.from(recordsMap.values());
    };

    // Realtime Listener for All Scoreboard Records (Hierarchy & Flat)
    useEffect(() => {
        setLoading(true);
        let hierarchyScores: ScoreRecord[] = [];
        let flatScores: ScoreRecord[] = [];

        const updateCombined = () => {
            const combinedMap = new Map<string, ScoreRecord>();
            flatScores.forEach(s => combinedMap.set(s.id, s));
            hierarchyScores.forEach(s => combinedMap.set(s.id, s)); // hierarchy takes precedence
            setAllScores(Array.from(combinedMap.values()));
            setLoading(false);
        };

        const hierarchyRef = ref(db, 'scoreboard_hierarchy');
        const unsubHierarchy = onValue(hierarchyRef, (snapshot) => {
            if (snapshot.exists()) {
                hierarchyScores = parseScoreboardSnapshot(snapshot.val());
            } else {
                hierarchyScores = [];
            }
            updateCombined();
        }, (err) => {
            console.error("Scoreboard Hierarchy Listener Error:", err);
            setLoading(false);
        });

        const flatRef = ref(db, 'scoreboard');
        const unsubFlat = onValue(flatRef, (snapshot) => {
            if (snapshot.exists()) {
                flatScores = parseScoreboardSnapshot(snapshot.val());
            } else {
                flatScores = [];
            }
            updateCombined();
        }, (err) => {
            console.error("Scoreboard Flat Listener Error:", err);
            setLoading(false);
        });

        return () => {
            unsubHierarchy();
            unsubFlat();
        };
    }, []);

    // Sync wizard points state when inputs change
    useEffect(() => {
        if (selectedCampus && selectedSection && selectedHouse) {
            const id = `${selectedCampus}_${selectedSection}_${selectedHouse}`;
            const record = allScores.find(s => String(s.id) === String(id) || (String(s.campus_id) === String(selectedCampus) && s.section === selectedSection && s.house_name === selectedHouse));
            setCurrentWizardPoints(record ? record.points : 0);
        }
    }, [selectedCampus, selectedSection, selectedHouse, allScores]);

    const getCampusName = (id: string | number) => {
        const found = campuses.find(c => String(c.id) === String(id));
        return found ? found.name : `Campus (${id})`;
    };

    // Calculate and Push Direct Final Score Numbers to Database
    const syncDatabaseTotals = async (scoresList: ScoreRecord[]) => {
        const campusIds = campuses.length > 0 
            ? campuses.map(c => String(c.id))
            : ['campus_jinnah', 'campus_shebaz', 'campus_ghazali', 'campus_latif', 'campus_sachal', 'campus_iqbal'];

        // 1. Initialize full campus -> section -> house grid with 0 final score numbers
        const campusHierarchy: Record<string, Record<string, Record<string, number>>> = {};
        campusIds.forEach(cId => {
            campusHierarchy[cId] = {};
            SECTIONS.forEach(sec => {
                campusHierarchy[cId][sec] = {};
                HOUSES.forEach(h => {
                    campusHierarchy[cId][sec][h] = 0;
                });
            });
        });

        // 2. Populate final calculated scores
        scoresList.forEach(s => {
            const cId = String(s.campus_id);
            const sec = s.section;
            const house = s.house_name;

            if (!campusHierarchy[cId]) campusHierarchy[cId] = {};
            if (!campusHierarchy[cId][sec]) campusHierarchy[cId][sec] = {};

            campusHierarchy[cId][sec][house] = Math.max(0, Number(s.points) || 0);
        });

        // 3. Overall House Final Totals
        const houseTotalsObj: Record<string, number> = {};
        HOUSES.forEach(h => { houseTotalsObj[h] = 0; });
        scoresList.forEach(s => {
            if (s.house_name && HOUSES.includes(s.house_name)) {
                houseTotalsObj[s.house_name] = (houseTotalsObj[s.house_name] || 0) + (Number(s.points) || 0);
            }
        });

        // Write direct final numeric scores to scoreboard_hierarchy
        await set(ref(db, 'scoreboard_hierarchy/campuses'), campusHierarchy);
        await set(ref(db, 'scoreboard_hierarchy/house_totals'), houseTotalsObj);
        await set(ref(db, 'scoreboard_hierarchy/last_updated'), new Date().toISOString());
    };

    // Update Points & Write Direct Final Score Number to Database
    const updateRecordPoints = async (campusId: string | number, section: string, houseName: string, amount: number) => {
        setIsUpdating(true);
        const id = `${campusId}_${section}_${houseName}`;
        const existingRecord = allScores.find(s => String(s.id) === String(id));
        const newPoints = Math.max(0, (existingRecord?.points || 0) + amount);

        // Calculate predicted updated list
        let updatedList: ScoreRecord[];
        if (existingRecord) {
            updatedList = allScores.map(s => s.id === id ? { ...s, points: newPoints } : s);
        } else {
            updatedList = [...allScores, { id, campus_id: campusId, section, house_name: houseName, points: newPoints }];
        }

        try {
            // 1. Write flat record to `/scoreboard/{id}`
            const pointsRef = ref(db, `scoreboard/${id}`);
            await set(pointsRef, {
                id,
                campus_id: campusId,
                section: section,
                house_name: houseName,
                points: newPoints
            });

            // 2. Write direct final numeric score value to `/scoreboard_hierarchy/campuses/{campus_id}/{section}/{house_name}`
            const hierarchyScoreRef = ref(db, `scoreboard_hierarchy/campuses/${campusId}/${section}/${houseName}`);
            await set(hierarchyScoreRef, newPoints);

            // 3. Calculate & sync aggregated final totals to database
            await syncDatabaseTotals(updatedList);

            setMessage({ type: 'success', text: `Updated ${houseName} House to ${newPoints} points!` });
            setTimeout(() => setMessage(null), 3000);
        } catch (error: any) {
            setMessage({ type: 'error', text: 'Failed to update points: ' + error.message });
        }
        setIsUpdating(false);
    };

    // Manual Trigger to Sync Existing Database Totals
    const handleManualSync = async () => {
        setIsUpdating(true);
        try {
            await syncDatabaseTotals(allScores);
            setMessage({ type: 'success', text: 'All House, Campus, and Section total points synchronized to Firebase Database!' });
            setTimeout(() => setMessage(null), 3500);
        } catch (err: any) {
            setMessage({ type: 'error', text: 'Sync failed: ' + err.message });
        }
        setIsUpdating(false);
    };

    // Filtered scores based on active campus & section dropdowns
    const filteredScores = allScores.filter(s => {
        const matchesCampus = filterCampus === 'ALL' || String(s.campus_id) === String(filterCampus);
        const matchesSection = filterSection === 'ALL' || s.section === filterSection;
        return matchesCampus && matchesSection;
    });

    // Calculate Total Points per House dynamically for the selected filters
    const houseTotals = HOUSES.map(house => {
        const total = filteredScores
            .filter(s => s.house_name === house)
            .reduce((acc, curr) => acc + (curr.points || 0), 0);
        return { house, total };
    }).sort((a, b) => b.total - a.total);

    const resetWizard = () => {
        setStep(1);
        setSelectedCampus(null);
        setSelectedSection(null);
        setSelectedHouse(null);
    };

    const activeFilterLabel = () => {
        const campusLabel = filterCampus === 'ALL' ? 'All Campuses' : getCampusName(filterCampus);
        const sectionLabel = filterSection === 'ALL' ? 'All Sections' : `${filterSection} Section`;
        return `${campusLabel} • ${sectionLabel}`;
    };

    return (
        <div className="space-y-8 font-sans">
            {/* Header & View Switcher */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
                <div>
                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 flex items-center gap-3">
                        <Trophy className="text-amber-500" size={32} /> House Scoreboard Dashboard
                    </h1>
                    <p className="text-stone-500 text-sm mt-1">Realtime inter-house competition standings across all campuses and sections.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={handleManualSync}
                        disabled={isUpdating}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-all disabled:opacity-50"
                        title="Save total points summary to database"
                    >
                        <Database size={14} /> Sync Database Totals
                    </button>

                    <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-2xl border border-stone-200">
                        <button
                            onClick={() => setViewMode('overview')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                                viewMode === 'overview'
                                ? 'bg-stone-900 text-white shadow-md'
                                : 'text-stone-500 hover:text-stone-900'
                            }`}
                        >
                            <BarChart3 size={16} /> Total Summary
                        </button>
                        <button
                            onClick={() => setViewMode('controller')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                                viewMode === 'controller'
                                ? 'bg-stone-900 text-white shadow-md'
                                : 'text-stone-500 hover:text-stone-900'
                            }`}
                        >
                            <SlidersHorizontal size={16} /> Point Controller
                        </button>
                    </div>
                </div>
            </div>

            {/* Global Message Banner */}
            {message && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 justify-center text-sm font-bold shadow-sm ${
                    message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                    <CheckCircle size={18} />
                    <span>{message.text}</span>
                </div>
            )}

            {/* VIEW MODE 1: TOTAL OVERVIEW TABLE & MATRIX */}
            {viewMode === 'overview' && (
                <div className="space-y-8">
                    {/* Campus & Section Filters Bar */}
                    <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm flex flex-wrap gap-6 items-center justify-between">
                        <div className="flex flex-wrap items-center gap-6">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1.5 ml-1">Filter by Campus</label>
                                <select
                                    value={filterCampus}
                                    onChange={(e) => setFilterCampus(e.target.value)}
                                    className="px-5 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-bold text-stone-800 outline-none focus:ring-2 focus:ring-primary min-w-[200px]"
                                >
                                    <option value="ALL">All Campuses</option>
                                    {campuses.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1.5 ml-1">Filter by Section</label>
                                <select
                                    value={filterSection}
                                    onChange={(e) => setFilterSection(e.target.value)}
                                    className="px-5 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-bold text-stone-800 outline-none focus:ring-2 focus:ring-primary min-w-[180px]"
                                >
                                    <option value="ALL">All Sections</option>
                                    {SECTIONS.map(s => (
                                        <option key={s} value={s}>{s} Section</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold px-4 py-2 bg-stone-100 text-stone-700 rounded-xl">
                                Scope: {activeFilterLabel()}
                            </span>
                            <span className="text-xs text-stone-400 font-medium flex items-center gap-1">
                                <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Live DB
                            </span>
                        </div>
                    </div>

                    {/* HOUSE TOTAL STANDINGS CARDS (FILTERED BY CAMPUS & SECTION) */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-1">
                            <h2 className="text-sm font-black uppercase tracking-widest text-stone-400 flex items-center gap-2">
                                <Award size={16} className="text-amber-500" /> House Standings for <span className="text-primary">{activeFilterLabel()}</span>
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                            {houseTotals.map((item, index) => {
                                const style = HOUSE_COLORS[item.house] || { bg: 'bg-stone-50', text: 'text-stone-800', border: 'border-stone-200', accent: '#333' };
                                
                                // Rank & Medal styling based on actual points
                                const isMedal = item.total > 0 && index < 3;
                                const rankBadge = isMedal 
                                    ? (index === 0 ? '🥇 1ST' : index === 1 ? '🥈 2ND' : '🥉 3RD')
                                    : `#${index + 1}`;
                                
                                const trophyColor = isMedal
                                    ? (index === 0 ? '#eab308' : index === 1 ? '#64748b' : '#b45309')
                                    : style.accent;

                                return (
                                    <motion.div
                                        key={item.house}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`${style.bg} ${style.border} border-2 p-6 rounded-3xl relative overflow-hidden shadow-sm hover:shadow-lg transition-all`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <span className={`text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-lg shadow-sm ${isMedal ? 'bg-white text-stone-900' : 'bg-stone-100/80 text-stone-500'}`}>
                                                {rankBadge}
                                            </span>
                                            <Trophy size={22} style={{ color: trophyColor }} />
                                        </div>
                                        <h3 className={`text-xl font-serif font-bold ${style.text}`}>{item.house} House</h3>
                                        <div className="mt-3">
                                            <span className="text-3xl md:text-4xl font-serif font-extrabold text-stone-900 tracking-tight">
                                                {item.total.toLocaleString()}
                                            </span>
                                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mt-0.5">Points Saved</span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
                        <div className="p-6 border-b border-stone-50 flex justify-between items-center">
                            <h3 className="font-serif font-bold text-stone-900 text-lg">Score Breakdown & Controls</h3>
                            <span className="text-xs text-stone-400">Click quick buttons (+ / -) to update points live in database</span>
                        </div>

                        {filteredScores.length === 0 ? (
                            <div className="p-12 text-center text-stone-400 font-medium">
                                No score entries matching the selected filters. Use the Point Controller tab to initialize points for campuses!
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-stone-50 border-b border-stone-100 text-[11px] font-bold text-stone-400 uppercase tracking-widest">
                                            <th className="p-5">Campus</th>
                                            <th className="p-5">Section</th>
                                            <th className="p-5">House</th>
                                            <th className="p-5 text-center">Score</th>
                                            <th className="p-5 text-right">Quick Adjust</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100">
                                        {filteredScores.map((record) => {
                                            const style = HOUSE_COLORS[record.house_name] || { bg: 'bg-stone-50', text: 'text-stone-800', border: 'border-stone-200', accent: '#333' };

                                            return (
                                                <tr key={record.id} className="hover:bg-stone-50/60 transition-colors">
                                                    <td className="p-5 font-bold text-stone-800 text-sm">
                                                        {getCampusName(record.campus_id)}
                                                    </td>
                                                    <td className="p-5 text-sm font-medium text-stone-500">
                                                        <span className="px-3 py-1 bg-stone-100 rounded-full text-xs font-bold">
                                                            {record.section}
                                                        </span>
                                                    </td>
                                                    <td className="p-5">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${style.bg} ${style.text} border ${style.border}`}>
                                                            {record.house_name} House
                                                        </span>
                                                    </td>
                                                    <td className="p-5 text-center">
                                                        <span className="font-serif font-extrabold text-2xl text-stone-900">
                                                            {record.points}
                                                        </span>
                                                    </td>
                                                    <td className="p-5 text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <button
                                                                disabled={isUpdating}
                                                                onClick={() => updateRecordPoints(record.campus_id, record.section, record.house_name, -50)}
                                                                className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-600 text-xs font-bold transition-all disabled:opacity-50"
                                                                title="Subtract 50"
                                                            >
                                                                -50
                                                            </button>
                                                            <button
                                                                disabled={isUpdating}
                                                                onClick={() => updateRecordPoints(record.campus_id, record.section, record.house_name, -10)}
                                                                className="p-1.5 rounded-lg bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-600 transition-all disabled:opacity-50"
                                                                title="Subtract 10"
                                                            >
                                                                <Minus size={14} />
                                                            </button>
                                                            <div className="w-px h-6 bg-stone-200 mx-1"></div>
                                                            <button
                                                                disabled={isUpdating}
                                                                onClick={() => updateRecordPoints(record.campus_id, record.section, record.house_name, 10)}
                                                                className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-white transition-all disabled:opacity-50"
                                                                title="Add 10"
                                                            >
                                                                <Plus size={14} />
                                                            </button>
                                                            <button
                                                                disabled={isUpdating}
                                                                onClick={() => updateRecordPoints(record.campus_id, record.section, record.house_name, 50)}
                                                                className="px-2.5 py-1.5 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-white text-xs font-bold transition-all disabled:opacity-50"
                                                                title="Add 50"
                                                            >
                                                                +50
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* VIEW MODE 2: STEP CONTROLLER WIZARD */}
            {viewMode === 'controller' && (
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 space-y-8">
                    {/* Stepper Header */}
                    <div className="flex items-center gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-100">
                        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary font-bold' : 'text-stone-400'}`}>
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${step === 1 ? 'bg-stone-900 text-white shadow-md' : 'bg-stone-200'}`}>1</div>
                            <span className="text-xs uppercase tracking-wider hidden sm:inline">Campus</span>
                        </div>
                        <ChevronRight size={16} className="text-stone-300" />
                        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary font-bold' : 'text-stone-400'}`}>
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${step === 2 ? 'bg-stone-900 text-white shadow-md' : 'bg-stone-200'}`}>2</div>
                            <span className="text-xs uppercase tracking-wider hidden sm:inline">Section</span>
                        </div>
                        <ChevronRight size={16} className="text-stone-300" />
                        <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary font-bold' : 'text-stone-400'}`}>
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${step === 3 ? 'bg-stone-900 text-white shadow-md' : 'bg-stone-200'}`}>3</div>
                            <span className="text-xs uppercase tracking-wider hidden sm:inline">Update</span>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div 
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <h3 className="font-serif font-bold text-xl text-stone-900">Step 1: Select Campus</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {campuses.map(campus => (
                                        <button
                                            key={campus.id}
                                            onClick={() => { setSelectedCampus(campus.id); setStep(2); }}
                                            className="bg-white p-6 rounded-2xl border-2 border-stone-100 hover:border-primary hover:shadow-lg transition-all text-left group"
                                        >
                                            <School className="text-stone-300 group-hover:text-primary mb-4" size={32} />
                                            <h4 className="font-bold text-lg text-stone-800">{campus.name}</h4>
                                            <p className="text-xs text-stone-500 mt-1">Select this campus to manage its houses.</p>
                                        </button>
                                    ))}
                                </div>
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
                                    <div>
                                        <h3 className="font-serif font-bold text-xl text-stone-900">Step 2: Select Section</h3>
                                        <p className="text-xs text-stone-500">Selected Campus: {getCampusName(selectedCampus!)}</p>
                                    </div>
                                    <button onClick={() => setStep(1)} className="text-primary font-bold text-xs uppercase tracking-wider">Change Campus</button>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {SECTIONS.map(section => (
                                        <button
                                            key={section}
                                            onClick={() => { setSelectedSection(section); setStep(3); }}
                                            className="bg-white p-6 rounded-2xl border-2 border-stone-100 hover:border-primary hover:shadow-lg transition-all group text-center"
                                        >
                                            <LayoutGrid className="text-stone-300 group-hover:text-primary mx-auto mb-3" size={24} />
                                            <span className="font-bold text-stone-800 text-sm">{section} Section</span>
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
                                        <h3 className="font-serif font-bold text-xl text-stone-900">Step 3: Update House Points</h3>
                                        <p className="text-xs text-stone-500">
                                            {getCampusName(selectedCampus!)} • {selectedSection} Section
                                        </p>
                                    </div>
                                    <button onClick={() => setStep(2)} className="text-primary font-bold text-xs uppercase tracking-wider">Change Section</button>
                                </div>

                                {/* House Selector */}
                                <div className="flex flex-wrap gap-3">
                                    {HOUSES.map(house => (
                                        <button
                                            key={house}
                                            onClick={() => setSelectedHouse(house)}
                                            className={`px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider transition-all ${
                                                selectedHouse === house 
                                                ? 'bg-stone-900 text-white shadow-lg scale-105' 
                                                : 'bg-stone-50 text-stone-600 border border-stone-200 hover:border-stone-400'
                                            }`}
                                        >
                                            {house} House
                                        </button>
                                    ))}
                                </div>

                                {selectedHouse ? (
                                    <div className="bg-stone-50/50 p-8 rounded-3xl border border-stone-200 text-center space-y-6">
                                        <span className="text-stone-400 font-bold uppercase tracking-widest text-xs block">Current Points for {selectedHouse} House</span>
                                        <div className="text-6xl font-serif font-bold text-stone-900 tracking-tight">{currentWizardPoints}</div>
                                        
                                        <div className="flex items-center justify-center gap-4 flex-wrap">
                                            <button
                                                disabled={isUpdating}
                                                onClick={() => updateRecordPoints(selectedCampus!, selectedSection!, selectedHouse, -50)}
                                                className="px-6 py-4 rounded-2xl bg-white border border-stone-200 font-bold text-stone-600 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
                                            >
                                                -50
                                            </button>
                                            <button
                                                disabled={isUpdating}
                                                onClick={() => updateRecordPoints(selectedCampus!, selectedSection!, selectedHouse, -10)}
                                                className="w-16 h-16 rounded-2xl bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
                                            >
                                                <Minus size={28} />
                                            </button>
                                            <div className="w-px h-12 bg-stone-200"></div>
                                            <button
                                                disabled={isUpdating}
                                                onClick={() => updateRecordPoints(selectedCampus!, selectedSection!, selectedHouse, 10)}
                                                className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                                            >
                                                <Plus size={28} />
                                            </button>
                                            <button
                                                disabled={isUpdating}
                                                onClick={() => updateRecordPoints(selectedCampus!, selectedSection!, selectedHouse, 50)}
                                                className="px-6 py-4 rounded-2xl bg-primary/10 border border-primary/20 font-bold text-primary hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                                            >
                                                +50
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-8 text-center bg-stone-50 rounded-2xl text-stone-400 text-sm font-medium border border-stone-100">
                                        Select a house above to adjust its score.
                                    </div>
                                )}

                                <div className="pt-6 border-t border-stone-100">
                                    <button 
                                        onClick={resetWizard}
                                        className="w-full py-4 bg-stone-900 text-white rounded-2xl font-bold hover:bg-black transition-colors"
                                    >
                                        Done / Select Another Campus
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default AdminScoreboard;

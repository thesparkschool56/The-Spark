import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Users, ChevronDown, Clock, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { ref, get, onValue } from 'firebase/database';
import { db } from '../lib/firebase';
import InfiniteSlider from '../components/ui/InfiniteSlider';
import CampusFeeStructure from '../components/fees/CampusFeeStructure';

const getCampusNumericId = (slug: string | undefined): string | null => {
    return slug ? `campus_${slug.toLowerCase()}` : null;
};

const getThemeColors = (theme: string) => {
    switch (theme) {
        case 'green': return { text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', gradient: 'from-green-600', ring: 'focus:ring-green-500', accent: 'text-green-700' };
        case 'yellow': return { text: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', gradient: 'from-amber-500', ring: 'focus:ring-amber-500', accent: 'text-amber-600' };
        case 'blue': return { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', gradient: 'from-blue-600', ring: 'focus:ring-blue-500', accent: 'text-blue-700' };
        case 'rose': return { text: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', gradient: 'from-rose-600', ring: 'focus:ring-rose-500', accent: 'text-rose-700' };
        case 'orange': return { text: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', gradient: 'from-orange-600', ring: 'focus:ring-orange-500', accent: 'text-orange-700' };
        case 'red': return { text: 'text-red-800', bg: 'bg-red-50', border: 'border-red-200', gradient: 'from-red-800', ring: 'focus:ring-red-500', accent: 'text-red-900' };
        default: return { text: 'text-primary', bg: 'bg-stone-50', border: 'border-stone-200', gradient: 'from-primary', ring: 'focus:ring-primary', accent: 'text-accent' };
    }
};

const CAMPUS_UI_CONFIG: Record<string, { description: string, image: string, theme: string }> = {
    jinnah: {
        description: 'Main Campus',
        image: 'https://media.gettyimages.com/id/171306436/photo/red-brick-high-school-building-exterior.jpg?s=612x612&w=gi&k=20&c=8to_zwGxxcI1iYcix7DhmWahoDTlaqxEMzumDwJtxeg=',
        theme: 'green'
    },
    sachal: {
        description: 'Excellence in Learning',
        image: 'https://media.gettyimages.com/id/171306436/photo/red-brick-high-school-building-exterior.jpg?s=612x612&w=gi&k=20&c=8to_zwGxxcI1iYcix7DhmWahoDTlaqxEMzumDwJtxeg=',
        theme: 'blue'
    },
    latif: {
        description: 'Primary Group',
        image: 'https://media.gettyimages.com/id/171306436/photo/red-brick-high-school-building-exterior.jpg?s=612x612&w=gi&k=20&c=8to_zwGxxcI1iYcix7DhmWahoDTlaqxEMzumDwJtxeg=',
        theme: 'yellow'
    },
    shebaz: {
        description: 'Senior Group',
        image: 'https://media.gettyimages.com/id/171306436/photo/red-brick-high-school-building-exterior.jpg?s=612x612&w=gi&k=20&c=8to_zwGxxcI1iYcix7DhmWahoDTlaqxEMzumDwJtxeg=',
        theme: 'rose'
    },
    iqbal: {
        description: 'Creative Arts & Sciences',
        image: 'https://media.gettyimages.com/id/171306436/photo/red-brick-high-school-building-exterior.jpg?s=612x612&w=gi&k=20&c=8to_zwGxxcI1iYcix7DhmWahoDTlaqxEMzumDwJtxeg=',
        theme: 'red'
    },
    ghazali: {
        description: 'Advanced Studies',
        image: 'https://media.gettyimages.com/id/171306436/photo/red-brick-high-school-building-exterior.jpg?s=612x612&w=gi&k=20&c=8to_zwGxxcI1iYcix7DhmWahoDTlaqxEMzumDwJtxeg=',
        theme: 'orange'
    }
};

const CampusDashboard: React.FC = () => {
    const params = useParams();
    const identifier = params.slug || params.id; // Grab whichever one the router is using
    const safeSlug = identifier?.toLowerCase();

    const numericCampusId = getCampusNumericId(safeSlug);
    const campusConfig = safeSlug ? CAMPUS_UI_CONFIG[safeSlug] : null;

    const [campusDetails, setCampusDetails] = useState<{ name: string, color_theme: string } | null>(null);

    const [scoreboardData, setScoreboardData] = useState<any[]>([]);
    const [facultyData, setFacultyData] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);

    const [loading, setLoading] = useState<boolean>(true);

    // UI state
    const facultySections = ['Primary', 'Secondary', 'Senior', 'Admin'];
    const scoreboardSections = ['Junior', 'Middle', 'Senior', 'College'];

    const [openSection, setOpenSection] = useState<string>('Primary');
    const [activeScoreboardSection, setActiveScoreboardSection] = useState<string>('Junior');

    useEffect(() => {
        if (!numericCampusId) return;

        let isMounted = true;

        const fetchData = async () => {
            setLoading(true);

            try {
                if (numericCampusId) {
                    const snapshot = await get(ref(db, `campuses/${numericCampusId}`));
                    if (snapshot.exists() && isMounted) {
                        setCampusDetails(snapshot.val());
                    }
                }

                // Fetch Faculty
                const facultySnapshot = await get(ref(db, 'faculty'));
                if (facultySnapshot.exists() && isMounted) {
                    const data = facultySnapshot.val();
                    const dataArray = Object.keys(data).map(key => ({
                        id: key,
                        ...data[key]
                    }));
                    setFacultyData(dataArray);
                }

                // Fetch Events
                const eventsSnapshot = await get(ref(db, 'events'));
                if (eventsSnapshot.exists() && isMounted) {
                    const data = eventsSnapshot.val();
                    const dataArray = Object.keys(data)
                        .map(key => ({ id: key, ...data[key] }))
                        .filter(e => {
                            // Filter by campus
                            const cId = e.campus_id;
                            return cId === numericCampusId || cId === 'all' || !cId;
                        });
                    dataArray.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                    setEvents(dataArray.slice(0, 4).map(e => ({
                        id: e.id,
                        title: e.title,
                        date: e.date,
                        category: e.category
                    })));
                }
            } catch (err: any) {
                console.error("Unexpected Fetch Error:", err.message);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();

        // Realtime Subscription for scoreboard
        const unsubscribeScoreboard = onValue(ref(db, 'scoreboard'), (snapshot: any) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                if (data) {
                    const dataArray = Object.keys(data).map(key => ({
                        id: key,
                        ...data[key]
                    }));
                    const filtered = dataArray.filter(s => String(s.campus_id) === String(numericCampusId));
                    if (isMounted) setScoreboardData(filtered);
                } else {
                    if (isMounted) setScoreboardData([]);
                }
            } else {
                if (isMounted) setScoreboardData([]);
            }
        });

        return () => {
            isMounted = false;
            unsubscribeScoreboard();
        };
    }, [numericCampusId]);

    // Error / 404 UI
    if (!campusConfig || !campusDetails || numericCampusId === null) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center bg-stone-50 p-4">
                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-800 mb-4 text-center">404 - Campus Not Found</h1>
                <p className="text-stone-500 mb-8 text-center max-w-md">The campus you are looking for doesn't exist, has been moved, or has an invalid ID mapping.</p>
                <Link to="/#campuses" className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors inline-flex items-center gap-2">
                    <ArrowRight className="rotate-180" size={18} /> View All Campuses
                </Link>
            </div>
        );
    }

    // Loading State
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-stone-500 font-medium animate-pulse">Loading Data...</p>
                </div>
            </div>
        );
    }

    // Safely group scoreboard
    const ALL_HOUSES = [
        { name: 'Zest', color: 'bg-yellow-500' },
        { name: 'Sharp', color: 'bg-emerald-500' },
        { name: 'Brave', color: 'bg-rose-500' },
        { name: 'Decent', color: 'bg-indigo-500' },
        { name: 'Smart', color: 'bg-cyan-500' }
    ];

    const scoreboardBySection = Array.isArray(scoreboardData) ? scoreboardData.reduce((acc, curr) => {
        const sec = curr.section || 'Junior'; // Fallback if section isn't available
        if (!acc[sec]) acc[sec] = [];
        acc[sec].push(curr);
        return acc;
    }, {} as Record<string, any[]>) : {};

    const fetchedPoints = scoreboardBySection[activeScoreboardSection] || [];

    const getHousePoints = (houseName: string) => {
        const house = fetchedPoints.find((h: any) => h.house_name === houseName);
        return house ? (house.points || 0) : 0;
    };

    const maxPoints = Math.max(...ALL_HOUSES.map(h => getHousePoints(h.name)), 1);

    const currentSectionPoints = [...ALL_HOUSES].map(h => ({
        ...h,
        points: getHousePoints(h.name)
    })).sort((a, b) => b.points - a.points);

    const galleryImages = [
        "https://media.gettyimages.com/id/171306436/photo/red-brick-high-school-building-exterior.jpg?s=612x612&w=gi&k=20&c=8to_zwGxxcI1iYcix7DhmWahoDTlaqxEMzumDwJtxeg=",
        "https://media.gettyimages.com/id/171306436/photo/red-brick-high-school-building-exterior.jpg?s=612x612&w=gi&k=20&c=8to_zwGxxcI1iYcix7DhmWahoDTlaqxEMzumDwJtxeg=",
        "https://media.gettyimages.com/id/171306436/photo/red-brick-high-school-building-exterior.jpg?s=612x612&w=gi&k=20&c=8to_zwGxxcI1iYcix7DhmWahoDTlaqxEMzumDwJtxeg=",
        "https://media.gettyimages.com/id/171306436/photo/red-brick-high-school-building-exterior.jpg?s=612x612&w=gi&k=20&c=8to_zwGxxcI1iYcix7DhmWahoDTlaqxEMzumDwJtxeg=",
        "https://media.gettyimages.com/id/171306436/photo/red-brick-high-school-building-exterior.jpg?s=612x612&w=gi&k=20&c=8to_zwGxxcI1iYcix7DhmWahoDTlaqxEMzumDwJtxeg=",
        "https://media.gettyimages.com/id/171306436/photo/red-brick-high-school-building-exterior.jpg?s=612x612&w=gi&k=20&c=8to_zwGxxcI1iYcix7DhmWahoDTlaqxEMzumDwJtxeg="
    ];

    return (
        <div className="min-h-screen bg-stone-50 pb-20">
            {/* Hero */}
            <div className="h-[60vh] relative overflow-hidden">
                <div className="absolute inset-0 bg-stone-900/50 z-10"></div>
                <img src={campusConfig.image} alt={campusDetails.name} loading="lazy" className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 w-full z-20 bg-gradient-to-t from-stone-900 via-stone-900/50 to-transparent pt-32 pb-12">
                    <div className="container mx-auto px-4">
                        <Link to="/#campuses" className="text-white/80 hover:text-white flex items-center gap-2 mb-4 transition-colors">
                            <ArrowRight className="rotate-180" size={18} /> Back to Campuses
                        </Link>
                        <h1 className={`text-3xl sm:text-5xl md:text-7xl font-serif font-bold text-white mb-4 ${getThemeColors(campusDetails.color_theme || campusConfig.theme).text} leading-tight`}>
                            {campusDetails.name}
                        </h1>
                        <p className="text-base sm:text-xl text-stone-200 max-w-2xl px-1">{campusConfig.description}</p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-10 relative z-30">
                {/* House Section Selector */}
                <div className="bg-white p-4 rounded-xl shadow-lg border border-stone-100 mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div className="flex items-center gap-2">
                        <Trophy className="text-amber-500" size={24} />
                        <h3 className="font-bold text-stone-700 text-lg">House Scoreboard</h3>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-sm text-stone-500 font-medium whitespace-nowrap">Select Section:</span>
                        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
                            {scoreboardSections.map(sec => (
                                <button
                                    key={sec}
                                    onClick={() => setActiveScoreboardSection(sec)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeScoreboardSection === sec
                                        ? 'bg-primary text-white shadow-md'
                                        : 'bg-stone-50 text-stone-500 hover:bg-stone-100'
                                        }`}
                                >
                                    {sec}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-stone-100 flex items-center gap-4">
                        <div className={`p-4 rounded-full ${getThemeColors(campusDetails.color_theme || campusConfig.theme).bg} ${getThemeColors(campusDetails.color_theme || campusConfig.theme).text}`}>
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-stone-500 text-sm font-bold uppercase tracking-wider">Students</p>
                            <p className="text-2xl font-bold text-stone-800">1,200+</p>
                        </div>
                    </div>

                    {currentSectionPoints.map((house: any) => (
                        <div key={house.name} className="bg-white p-6 rounded-xl shadow-lg border border-stone-100 flex items-center gap-4">
                            <div className={`p-4 rounded-full ${getThemeColors(campusDetails.color_theme || campusConfig.theme).bg} ${getThemeColors(campusDetails.color_theme || campusConfig.theme).text}`}>
                                <Trophy size={24} />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-stone-700">{house.name}</span>
                                    <motion.span
                                        key={house.points}
                                        initial={{ scale: 1.5, color: '#f59e0b' }}
                                        animate={{ scale: 1, color: '#f59e0b' }}
                                        className="font-bold text-amber-500"
                                    >
                                        {house.points}
                                    </motion.span>
                                </div>
                                <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                                    <motion.div
                                        layout
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.max((house.points / maxPoints) * 100, 5)}%` }}
                                        transition={{ type: "spring", stiffness: 50, damping: 20 }}
                                        className={`h-full ${house.color}`}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Dynamic Fee Structure - Phase 3 */}
                <div className="mb-12">
                    <CampusFeeStructure
                        campusId={numericCampusId}
                        themeColor={campusDetails.color_theme || campusConfig.theme}
                    />
                </div>
            </div>

            <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Sidebar / Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
                        <h3 className="font-bold text-stone-800 mb-4 font-serif">Campus News</h3>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="pb-3 border-b border-stone-50 last:border-0 last:pb-0">
                                    <span className="text-xs text-accent font-bold uppercase">Oct {10 + i}, 2024</span>
                                    <p className="text-sm text-stone-600 mt-1 hover:text-primary cursor-pointer">
                                        Inter-house debate competition finals scheduled at the auditorium.
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Faculty Directory */}
                <div className="lg:col-span-2">
                    <h2 className="text-3xl font-serif font-bold text-stone-900 mb-8">Faculty Directory</h2>
                    <div className="space-y-4">
                        {facultySections.map(section => {
                            const sectionFaculty = Array.isArray(facultyData) ? facultyData.filter(f => f.section === section) : [];

                            return (
                                <div key={section} className={`bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden ${openSection !== section ? 'opacity-70' : ''}`}>
                                    <button
                                        onClick={() => setOpenSection(section)}
                                        className="w-full flex justify-between items-center p-6 bg-stone-50 hover:bg-stone-100 transition-colors text-left"
                                    >
                                        <span className="font-bold text-lg text-stone-800">{section} Section</span>
                                        <ChevronDown className={`text-stone-400 transition-transform ${openSection === section ? '' : 'transform -rotate-90'}`} />
                                    </button>

                                    <motion.div
                                        initial={false}
                                        animate={{ height: openSection === section ? 'auto' : 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 border-t border-slate-100">
                                            {sectionFaculty.length > 0 ? (
                                                sectionFaculty.map((teacher: any) => (
                                                    <div key={teacher.id} className="flex items-center gap-4 p-3 rounded-lg border border-slate-50 hover:border-slate-200 transition-colors">
                                                        <img
                                                            src={teacher.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name || 'User')}&background=random`}
                                                            className="w-12 h-12 rounded-full object-cover bg-slate-100"
                                                            alt={teacher.name}
                                                            onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name || 'User')}&background=random` }}
                                                        />
                                                        <div>
                                                            <div className="font-bold text-slate-800 text-sm">{teacher.name || 'Unknown'}</div>
                                                            <div className="text-xs text-slate-500">{teacher.designation || teacher.role} {teacher.subject ? `• ${teacher.subject}` : ''}</div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="col-span-1 md:col-span-2 text-center text-slate-400 text-sm py-4 italic">
                                                    No faculty listings available for this section.
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Upcoming Events */}
            <div className="container mx-auto px-4 mt-12">
                <h2 className="text-3xl font-serif font-bold text-stone-900 mb-8 flex items-center gap-3">
                    Upcoming Events
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.isArray(events) && events.length > 0 ? (
                        events.map((event: any, index: number) => (
                            <div key={event.id || index} className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="bg-primary/5 rounded-lg p-3 flex flex-col items-center justify-center min-w-[70px]">
                                        <span className="text-primary font-bold text-2xl">
                                            {event.date ? new Date(event.date).getDate() : '-'}
                                        </span>
                                        <span className="text-xs text-stone-500 uppercase font-bold">
                                            {event.date ? new Date(event.date).toLocaleString('default', { month: 'short' }) : '-'}
                                        </span>
                                    </div>
                                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${event.category === 'Exam' ? 'bg-amber-100 text-amber-700' :
                                        event.category === 'Sports' ? 'bg-green-100 text-green-700' :
                                            event.category === 'Holiday' ? 'bg-red-100 text-red-700' :
                                                'bg-[#f7f3ed] text-primary'
                                        }`}>
                                        {event.category || 'Event'}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-stone-800 leading-tight group-hover:text-primary transition-colors">
                                    {event.title || 'Untitled Event'}
                                </h3>
                                <div className="mt-4 pt-4 border-t border-stone-50 flex items-center text-stone-400 text-sm gap-2">
                                    <Clock size={14} />
                                    <span>{event.date ? new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-stone-300">
                            <Calendar className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                            <p className="text-stone-500 italic">No upcoming events scheduled for this campus.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Gallery */}
            <div className="container mx-auto px-4 mt-16">
                <h2 className="text-3xl font-serif font-bold text-stone-900 mb-8">Campus Gallery</h2>
                {galleryImages.length > 4 ? (
                    <InfiniteSlider speed={35}>
                        {galleryImages.map((src, i) => (
                            <div key={i} className="w-64 sm:w-72 h-48 sm:h-64 rounded-xl overflow-hidden hover:opacity-90 transition-opacity cursor-pointer flex-shrink-0">
                                <img src={src} alt="Campus view" loading="lazy" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
                            </div>
                        ))}
                    </InfiniteSlider>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {galleryImages.map((src, i) => (
                            <div key={i} className="h-64 rounded-xl overflow-hidden hover:opacity-90 transition-opacity cursor-pointer">
                                <img src={src} alt="Campus view" loading="lazy" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CampusDashboard;

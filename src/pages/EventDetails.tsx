import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, ArrowLeft, Loader2, Info, School } from 'lucide-react';
import { ref, get } from 'firebase/database';
import { db } from '../lib/firebase';

const EventDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const eventRef = ref(db, `events/${id}`);
        setLoading(true);
        const unsubscribe = onValue(eventRef, (snapshot) => {
            if (snapshot.exists()) {
                setEvent({ id, ...snapshot.val() });
            } else {
                setEvent(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="text-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                <p className="text-stone-400 font-serif italic">Curating event details...</p>
            </div>
        </div>
    );

    if (!event) return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50">
            <div className="text-center">
                <h1 className="text-4xl font-serif text-stone-800 mb-4 uppercase">Event Not Found</h1>
                <Link to="/calendar" className="text-primary font-bold flex items-center justify-center gap-2">
                    <ArrowLeft size={16} /> Return to Calendar
                </Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white">
            {/* Stunning Hero Layout */}
            <div className="h-[70vh] relative overflow-hidden">
                <motion.img
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.5 }}
                    src={event.image_url || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80'}
                    alt={event.title}
                    loading="lazy"
                    className="w-full h-full object-cover grayscale-[0.2]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/40 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full p-10 md:p-24 z-10">
                    <div className="container mx-auto">
                        <Link to="/calendar" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-8 uppercase text-[10px] font-black tracking-[0.4em]">
                            <ArrowLeft size={14} /> Back to Network Calendar
                        </Link>
                        <motion.h1 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-9xl font-serif text-white uppercase tracking-tighter leading-none mb-6"
                        >
                            {event.title}
                        </motion.h1>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-center gap-4"
                        >
                            <span className="bg-accent text-white px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl">
                                {event.category}
                            </span>
                            <div className="h-px w-20 bg-white/20 hidden md:block"></div>
                            <span className="text-white/60 text-[10px] font-black uppercase tracking-[0.4em] hidden md:block">
                                Event ID: {event.id}
                            </span>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Metadata Grid - Spacious & Minimalist */}
            <div className="container mx-auto px-4 -mt-24 relative z-20">
                <div className="bg-white border border-stone-100 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] rounded-[4rem] p-12 md:p-20 grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-20">
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                            <Calendar size={12} className="text-accent" /> Date
                        </p>
                        <p className="text-2xl font-bold text-stone-800 font-serif">
                            {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                            <Clock size={12} className="text-accent" /> Time
                        </p>
                        <p className="text-2xl font-bold text-stone-800 font-serif">
                            {event.time || '09:00 AM'}
                        </p>
                    </div>
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                            <MapPin size={12} className="text-accent" /> Location
                        </p>
                        <p className="text-2xl font-bold text-stone-800 font-serif line-clamp-1">
                            {event.location || 'Main Auditorium'}
                        </p>
                    </div>
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                            <School size={12} className="text-accent" /> Target Class
                        </p>
                        <p className="text-2xl font-bold text-stone-800 font-serif">
                            {event.class_name || 'All Students'} {event.section ? `- ${event.section}` : ''}
                        </p>
                    </div>
                </div>

                {/* Typography Block */}
                <div className="max-w-4xl mx-auto py-32 space-y-20">
                    <section>
                        <div className="flex items-center gap-4 mb-10">
                            <div className="h-px flex-1 bg-stone-100" />
                            <span className="text-stone-300 text-[10px] font-black uppercase tracking-[0.6em]">Event Overview</span>
                            <div className="h-px flex-1 bg-stone-100" />
                        </div>
                        <p className="text-3xl md:text-4xl font-serif text-stone-700 leading-[1.6] italic tracking-tight text-center">
                            "{event.description || 'No description provided for this upcoming event.'}"
                        </p>
                    </section>
                    
                    {event.general_info && (
                        <section className="bg-stone-50 rounded-[3rem] p-12 md:p-20 border border-stone-100 relative overflow-hidden">
                            <Info size={120} className="absolute -bottom-10 -right-10 text-stone-100 opacity-50" />
                            <div className="relative z-10">
                                <h4 className="text-stone-900 font-black uppercase tracking-[0.4em] text-xs mb-8 flex items-center gap-3">
                                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" /> Important Guidelines
                                </h4>
                                <div className="text-stone-500 font-light leading-loose text-lg whitespace-pre-wrap columns-1 md:columns-2 gap-12">
                                    {event.general_info}
                                </div>
                            </div>
                        </section>
                    )}

                    <div className="text-center pt-10">
                        <Link to="/admissions" className="inline-block bg-stone-900 text-white px-12 py-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.5em] hover:bg-primary transition-all shadow-2xl hover:scale-105 active:scale-95">
                            Enroll For Admission
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetails;

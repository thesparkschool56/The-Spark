import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Users,
    Star,
    ArrowRight,
    Quote,
    Calendar as CalendarIcon,
    Briefcase
} from 'lucide-react';

import { supabase } from '../lib/supabase';
import SplitText from '../components/ui/SplitText';
import ShinyText from '../components/ui/ShinyText';
import Carousel from '../components/ui/Carousel';
import InfiniteSlider from '../components/ui/InfiniteSlider';
import clsx from 'clsx';

const Landing: React.FC = () => {
    const [events, setEvents] = useState<any[]>([]);
    const [founders, setFounders] = useState<any[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [campuses, setCampuses] = useState<any[]>([]);
    const [vacancies, setVacancies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Founders - Pruned
                const { data: foundersData } = await supabase
                    .from('founders')
                    .select('name, role, quote, bio, image_url, order')
                    .order('order', { ascending: true });
                setFounders(foundersData || []);

                // Fetch Events - Pruned & Limited to 4
                const { data: eventsData } = await supabase
                    .from('events')
                    .select('id, title, date, image_url, category')
                    .order('date', { ascending: true })
                    .limit(4);
                setEvents(eventsData || []);

                // Fetch Reviews - Correct Schema
                const { data: reviewsData } = await supabase
                    .from('reviews')
                    .select('id, reviewer_name, review_text, role, campus_id')
                    .eq('is_published', true)
                    .limit(5);
                setReviews(reviewsData || []);

                // Fetch Campuses
                const { data: campusesData } = await supabase
                    .from('campuses')
                    .select('*')
                    .order('id', { ascending: true });
                setCampuses(campusesData || []);

                // Fetch Vacancies - Limited to 3
                const { data: vacanciesData } = await supabase
                    .from('job_positions')
                    .select('*')
                    .eq('status', 'Open')
                    .order('created_at', { ascending: false })
                    .limit(3);
                setVacancies(vacanciesData || []);
            } catch (error) {
                console.error("Error fetching landing data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-white container mx-auto px-4 py-20 space-y-20">
                <div className="h-20 w-3/4 bg-stone-100 animate-pulse rounded-2xl mx-auto" />
                <div className="grid md:grid-cols-2 gap-12">
                    <div className="h-[500px] bg-stone-50 animate-pulse rounded-[3rem]" />
                    <div className="space-y-6 flex flex-col justify-center">
                        <div className="h-4 w-1/4 bg-stone-100 animate-pulse rounded-full" />
                        <div className="h-12 w-full bg-stone-100 animate-pulse rounded-xl" />
                        <div className="h-12 w-5/6 bg-stone-100 animate-pulse rounded-xl" />
                        <div className="h-24 w-full bg-stone-50 animate-pulse rounded-xl" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-stone-50 animate-pulse rounded-[2rem]" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-20 pb-20">
            {/* Hero Section */}
            <section id="home" className="relative min-h-[90vh] flex items-center bg-white overflow-hidden">
                <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
                    <div className="z-10 order-2 md:order-1 pt-10 md:pt-0">
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-block mb-4"
                        >
                            <ShinyText text="Excellence Since 1985" disabled={false} speed={3} className="text-accent font-bold tracking-widest uppercase text-xs" />
                        </motion.span>
                        <motion.h1
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif text-slate-900 leading-[1.1] mb-8 uppercase tracking-tighter"
                        >
                            <SplitText text="Igniting Minds," className="block" delay={0} />
                            <span className="italic text-gradient block mt-2">Shaping Futures.</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-lg text-slate-500 mb-10 max-w-md leading-relaxed font-light"
                        >
                            A legacy of academic prestige and holistic development. Join a global community dedicated to intellectual growth and moral integrity.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="flex flex-col sm:flex-row gap-4"
                        >
                            <Link to="/admissions" className="bg-primary text-white px-10 py-5 rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-2xl shadow-primary/20 uppercase tracking-widest text-xs">
                                Enroll Now <ArrowRight size={18} />
                            </Link>
                            <Link to="/#campuses" className="px-10 py-5 rounded-xl font-bold text-slate-700 hover:text-primary transition-all border border-slate-200 hover:border-primary/30 text-center uppercase tracking-widest text-xs">
                                Explore Campuses
                            </Link>
                        </motion.div>
                    </div>

                    <div className="relative order-1 md:order-2 h-[50vh] md:h-[80vh] w-full mr-[-10%] rounded-l-[4rem] overflow-hidden shadow-[0_40px_100px_-15px_rgba(0,0,0,0.3)] animate-float border-l-8 border-stone-50">
                        <img
                            src="THE SPARK/src/components/pages/sp main.jpg"
                            alt="Campus Architecture"
                            loading="lazy"
                            className="w-full h-full object-cover transform scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent"></div>
                    </div>
                </div>


            </section>

            {/* Introduction Section */}
            <section className="container mx-auto px-4 py-32 md:py-48 mt-12">
                <div className="grid md:grid-cols-2 gap-20 items-center">
                    <div className="relative group">
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/20 transition-colors"></div>
                        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors"></div>
                        <img
                            src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                            alt="Student Life"
                            loading="lazy"
                            className="relative rounded-[2.5rem] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.25)] z-10 w-full object-cover h-[550px]"
                        />
                        <div className="absolute -bottom-12 -right-12 bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl z-20 max-w-xs hidden lg:block border border-stone-100">
                            <Quote size={32} className="text-accent mb-4 opacity-30" />
                            <p className="font-serif italic text-stone-600 text-xl leading-relaxed">"Where tradition meets innovation in perfect harmony."</p>
                        </div>
                    </div>
                    <div>
                        <span className="text-primary font-bold tracking-[0.3em] uppercase text-xs mb-4 block text-center md:text-left">Welcome to The Spark</span>
                        <h2 className="text-4xl md:text-6xl font-serif text-slate-900 mb-8 leading-[1.1] text-center md:text-left uppercase">A Legacy of <span className="text-accent italic underline decoration-accent/20 underline-offset-8">Excellence</span></h2>
                        <p className="text-stone-600 text-lg mb-8 leading-relaxed text-center md:text-left font-light">
                            Founded in 1985, The Spark School & College has been a beacon of educational brilliance for nearly four decades. We believe in nurturing the whole child—academically, socially, and morally.
                        </p>
                        <p className="text-stone-500 text-base mb-10 leading-relaxed text-center md:text-left italic">
                            Our curriculum is designed to challenge and inspire, fostering critical thinking and creativity. With state-of-the-art facilities and a dedicated faculty, we prepare students not just for exams, but for life.
                        </p>

                        <div className="grid grid-cols-2 gap-8 mb-12">
                            <div className="flex gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-100/50">
                                <div className="mt-1 bg-white p-3 rounded-xl text-amber-700 h-fit shadow-sm"><Users size={20} /></div>
                                <div>
                                    <h4 className="font-bold text-stone-800 text-sm uppercase tracking-wider">Community</h4>
                                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Inclusive & Diverse</p>
                                </div>
                            </div>
                            <div className="flex gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-100/50">
                                <div className="mt-1 bg-white p-3 rounded-xl text-accent h-fit shadow-sm"><Star size={20} /></div>
                                <div>
                                    <h4 className="font-bold text-stone-800 text-sm uppercase tracking-wider">Holistic</h4>
                                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Mind, Body & Soul</p>
                                </div>
                            </div>
                        </div>

                        <div className="text-center md:text-left">
                            <Link to="/about" className="text-primary font-bold hover:gap-3 transition-all inline-flex items-center gap-2 group uppercase tracking-widest text-xs">
                                Read Our Full Story <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Founders Section - Premium Carousel */}
            <section id="founders" className="container mx-auto px-4 py-20">
                <div className="text-center mb-16">
                    <span className="text-accent font-bold tracking-[0.4em] uppercase text-[10px] mb-2 block">Our Vision</span>
                    <h2 className="text-4xl md:text-6xl font-serif text-slate-900 mt-2 uppercase tracking-tight">Institutional <span className="text-gradient">Legacy</span></h2>
                </div>

                <div className="max-w-6xl mx-auto px-4">
                    <Carousel className="h-[550px] md:h-[600px]" autoPlay={true} interval={8000}>
                        {(!founders || founders.length === 0) ? (
                            <div className="flex items-center justify-center h-full"><span className="text-stone-400">Loading founders...</span></div>
                        ) : (founders || []).map((founder, i) => (
                            <div key={i} className="h-full py-6">
                                <div className="bg-white rounded-[3rem] shadow-[0_40px_100px_-15px_rgba(0,0,0,0.1)] overflow-hidden border border-stone-100 h-full flex flex-col md:flex-row">
                                    <div className="w-full md:w-5/12 h-64 md:h-full relative overflow-hidden">
                                         <img
                                            src={founder?.image_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=800&h=800&q=80'}
                                            alt={founder?.name}
                                            loading="lazy"
                                            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10"></div>
                                    </div>
                                    <div className="w-full md:w-7/12 p-10 md:p-20 flex flex-col justify-center relative">
                                        <Quote size={100} className="text-stone-50 absolute top-10 right-10 -z-0 opacity-40" />
                                        <div className="relative z-10">
                                            <p className="text-2xl md:text-4xl text-stone-700 italic font-serif leading-relaxed mb-12 tracking-tight">
                                                "{founder?.quote || founder?.bio}"
                                            </p>
                                            <div className="flex items-center gap-6">
                                                <div className="h-px w-16 bg-accent/20"></div>
                                                <div>
                                                    <h4 className="text-3xl font-bold text-stone-900 uppercase tracking-tighter">{founder?.name}</h4>
                                                    <p className="text-primary font-bold tracking-[0.3em] uppercase text-[10px] mt-2">{founder?.role}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Carousel>
                </div>
            </section>

            {/* Campus Grid */}
            <section id="campuses" className="container mx-auto px-4 py-16">
                <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 gap-4">
                    <div className="text-center md:text-left">
                        <span className="text-primary font-bold tracking-[0.4em] uppercase text-[10px] mb-2 block">Our Network</span>
                        <h2 className="text-4xl md:text-6xl font-serif text-slate-900 uppercase tracking-tight">Explore Campuses</h2>
                    </div>
                    <Link to="/admissions" className="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all uppercase tracking-widest text-[10px] bg-stone-50 px-6 py-3 rounded-full border border-stone-100">
                        Find nearest campus <ArrowRight size={14} />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {(!campuses || campuses.length === 0) ? (
                        <div className="col-span-3 text-center text-stone-400">Loading campuses...</div>
                    ) : (campuses || []).map((campus) => (
                        <Link to={`/campus/${campus?.slug}`} key={campus?.id} className="group relative h-[450px] overflow-hidden rounded-[2.5rem] cursor-pointer shadow-2xl hover:shadow-primary/20 transition-all duration-700">
                            <img
                                src="https://media.gettyimages.com/id/171306436/photo/red-brick-high-school-building-exterior.jpg?s=612x612&w=gi&k=20&c=8to_zwGxxcI1iYcix7DhmWahoDTlaqxEMzumDwJtxeg="
                                alt={campus?.name}
                                loading="lazy"
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-900/40 to-transparent">
                                <div className="absolute bottom-0 left-0 p-10 w-full">
                                    <h3 className="text-3xl font-serif text-white mb-3 uppercase tracking-tight">{campus?.name}</h3>
                                    <div className="h-0 overflow-hidden group-hover:h-auto opacity-0 group-hover:opacity-100 transition-all duration-500">
                                        <p className="text-stone-300 text-sm font-light leading-relaxed transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                            {campus?.description || 'Experience excellence at this campus.'}
                                        </p>
                                        <div className="flex items-center gap-2 mt-6 text-accent font-bold text-[10px] uppercase tracking-[0.3em]">
                                            View Dashboard <div className="w-8 h-px bg-accent"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Events Section - Redesigned Teasers */}
            <section id="events" className="container mx-auto px-4 py-24 bg-stone-50/50 rounded-[4rem] my-10 border border-stone-100/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px] -mr-48 -mt-48"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -ml-48 -mb-48"></div>

                <div className="text-center mb-20 relative z-10">
                    <span className="text-accent font-bold tracking-[0.5em] uppercase text-[10px] mb-4 block">Campus Life</span>
                    <h2 className="text-4xl md:text-6xl font-serif text-stone-900 mt-2 uppercase tracking-tight">Upcoming <span className="text-gradient">Events</span></h2>
                </div>

                 {!events || events.length === 0 ? (
                    <div className="text-center py-32 bg-white/50 rounded-[3rem] border border-stone-100 shadow-inner relative z-10">
                        <CalendarIcon size={64} className="mx-auto text-stone-200 mb-6" />
                        <p className="text-stone-400 font-serif italic text-xl">No upcoming events are currently scheduled.</p>
                    </div>
                ) : (
                    <div className="relative z-10">
                        <InfiniteSlider gap={32} speed={40} hoverToPause={true}>
                            {(events || []).map((event) => (
                                <Link to={`/events/${event.id}`} key={event.id} className="group block w-[300px] md:w-[350px]">
                                    <div className="bg-white rounded-[2.5rem] p-4 border border-stone-100 shadow-sm hover:shadow-2xl transition-all duration-700 h-full flex flex-col">
                                        <div className="relative h-48 mb-6 overflow-hidden rounded-[2rem]">
                                            <img
                                                src={event.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'}
                                                alt={event.title}
                                                loading="lazy"
                                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                                            />
                                            <div className="absolute top-4 right-4">
                                                <span className={clsx(
                                                    "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-white backdrop-blur-md shadow-lg",
                                                    event?.category === 'Exam' ? "bg-primary/80" :
                                                        event?.category === 'Sports' ? "bg-emerald-600/80" :
                                                            event?.category === 'Academic' ? "bg-accent/80" : "bg-stone-500/80"
                                                )}>
                                                    {event?.category}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="px-2 flex flex-col flex-1">
                                            <p className="text-[10px] font-bold text-accent uppercase tracking-widest mb-2">
                                                {event?.date ? new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                                            </p>
                                            <h3 className="font-serif font-bold text-xl text-stone-900 mb-4 group-hover:text-primary transition-colors uppercase leading-tight line-clamp-2">
                                                {event.title}
                                            </h3>
                                            <div className="mt-auto flex items-center gap-2 text-[10px] font-black text-stone-400 uppercase tracking-widest group-hover:text-stone-600 transition-colors">
                                                View Details <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </InfiniteSlider>
                    </div>
                )}
                <div className="text-center mt-16 relative z-10">
                    <Link to="/calendar" className="text-primary font-bold hover:scale-105 transition-all inline-flex items-center gap-3 uppercase tracking-[0.3em] text-[10px] bg-white px-8 py-4 rounded-full shadow-xl shadow-stone-200/50 border border-stone-100">
                        View Network Calendar <ArrowRight size={16} className="text-accent" />
                    </Link>
                </div>
            </section>

            {/* Reviews Section - Infinite Marquee */}
            <section id="reviews" className="py-24 bg-white overflow-hidden border-t border-stone-100">
                <style>{`
                    @keyframes marquee {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(calc(-50% - 1rem)); }
                    }
                    .animate-marquee {
                        animation: marquee 40s linear infinite;
                    }
                    .group:hover .animate-marquee {
                        animation-play-state: paused;
                    }
                `}</style>
                <div className="container mx-auto px-4 text-center mb-16">
                    <span className="text-accent font-bold tracking-[0.6em] uppercase text-[10px] mb-4 block">Testimonials</span>
                    <h2 className="text-4xl md:text-5xl font-serif text-stone-900 mt-2 uppercase tracking-tight">Voices of the Legacy</h2>
                </div>

                <div className="relative flex overflow-x-hidden group">
                    {(!reviews || reviews.length === 0) ? (
                        <div className="text-center text-stone-400 py-10 w-full">No reviews available yet.</div>
                    ) : (
                        <div className="flex animate-marquee gap-8 whitespace-nowrap px-4">
                            {[...(reviews || []), ...(reviews || [])].map((review, i) => (
                                <div key={i} className="w-[400px] md:w-[500px] flex-shrink-0 bg-stone-50/50 border border-stone-100 p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:bg-white transition-all duration-500 whitespace-normal">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="flex gap-1 text-accent">
                                            {[...Array(5)].map((_, idx) => <Star key={idx} size={14} fill="currentColor" strokeWidth={0} />)}
                                        </div>
                                        <Quote size={32} className="text-stone-200" />
                                    </div>
                                     <p className="text-stone-600 text-lg leading-relaxed font-serif italic mb-10">"{review?.review_text}"</p>
                                    <div className="flex items-center gap-4">
                                        <img 
                                            src={`https://ui-avatars.com/api/?name=${review?.reviewer_name?.replace(/ /g, '+') || 'A'}&background=random&color=fff&bold=true`} 
                                            alt={review?.reviewer_name || 'User'} 
                                            loading="lazy"
                                            className="w-12 h-12 rounded-full object-cover shadow-md border border-stone-100"
                                        />
                                        <div>
                                            <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wider">{review?.reviewer_name || 'Anonymous'}</h4>
                                            <p className="text-[9px] uppercase tracking-widest text-stone-400 font-bold mt-0.5">{review?.role || 'Parent / Student'}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {/* Gradient Fade Edges */}
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent"></div>
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent"></div>
                </div>
            </section>
            {/* Vacancies Section */}
            <section className="container mx-auto px-4 py-24">
                <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 gap-4">
                    <div className="text-center md:text-left">
                        <span className="text-primary font-bold tracking-[0.4em] uppercase text-[10px] mb-2 block">Careers</span>
                        <h2 className="text-4xl md:text-6xl font-serif text-stone-900 uppercase tracking-tight">Join Our Faculty</h2>
                    </div>
                    <Link to="/careers" className="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all uppercase tracking-widest text-[10px] bg-stone-50 px-6 py-3 rounded-full border border-stone-100">
                        View All Positions <ArrowRight size={14} />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {(!vacancies || vacancies.length === 0) ? (
                        <div className="col-span-3 text-center text-stone-400 py-10 border border-stone-100 rounded-[2.5rem]">No open positions at the moment.</div>
                    ) : (vacancies || []).map((job) => (
                        <div key={job?.id} className="bg-white border border-stone-100 rounded-[2rem] p-8 hover:shadow-xl transition-all duration-500 group flex flex-col justify-between h-full">
                            <div>
                                <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-800 mb-6 group-hover:scale-110 transition-transform">
                                    <Briefcase size={24} />
                                </div>
                                <h3 className="font-serif font-bold text-2xl text-stone-900 mb-2">{job?.title}</h3>
                                <div className="flex items-center gap-3 text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-6">
                                    <span>{job?.department || 'General'}</span>
                                    <span>•</span>
                                    <span>Campus {job?.campus_id || 'All'}</span>
                                </div>
                                <p className="text-stone-500 text-sm line-clamp-3 mb-8">{job?.description}</p>
                            </div>
                            <Link to="/careers" className="w-full bg-stone-900 text-white text-center py-4 rounded-xl font-bold hover:bg-black transition-all text-xs uppercase tracking-widest mt-auto">
                                Apply Now
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* Admissions CTA */}
            <section id="apply" className="relative py-32 mt-10 overflow-hidden rounded-[5rem] mx-4 md:mx-10 shadow-[0_50px_100px_rgba(0,0,0,0.3)]">
                <div className="absolute inset-0 bg-[#2d1b0d]">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-primary via-stone-900 to-black"></div>
                </div>
                <div className="container mx-auto px-4 text-center relative z-10 py-10">
                    <span className="text-accent font-black tracking-[0.6em] uppercase text-[10px] mb-8 block">Academic Session 2024-25</span>
                    <h2 className="text-5xl md:text-8xl font-serif mb-10 text-white leading-tight uppercase tracking-tighter">Join the <span className="italic text-accent">Spark</span> Legacy</h2>
                    <p className="text-stone-300 text-xl max-w-2xl mx-auto mb-16 font-light leading-relaxed">
                        Admission portals are now active. Begin your journey toward academic distinction and professional leadership.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                        <Link to="/admissions" className="inline-block bg-accent text-white px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-[0.4em] hover:bg-white hover:text-stone-900 transition-all shadow-2xl hover:scale-105 active:scale-95 group">
                            Start Application <ArrowRight size={16} className="inline ml-2 group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Landing;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { ref, onValue } from 'firebase/database';
import { db } from '../lib/firebase';
import { Link } from 'react-router-dom';

interface Event {
    id: string;
    title: string;
    date: string;
    category: 'Exam' | 'Sports' | 'Academic' | 'Holiday';
    description?: string;
}

const CalendarPage: React.FC = () => {
    const [selectedCategories, setSelectedCategories] = useState<string[]>(['Exam', 'Sports', 'Academic', 'Holiday']);
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        const eventsRef = ref(db, 'events');
        setLoading(true);
        const unsubscribe = onValue(eventsRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const dataArray = Object.entries(data).map(([id, val]: [string, any]) => ({
                    id,
                    ...val
                })) as Event[];
                dataArray.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                setEvents(dataArray);
            } else {
                setEvents([]);
            }
            setLoading(false);
        }, (error) => {
            console.error('Error fetching events:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const categories = [
        { name: 'Exam', color: 'bg-primary' },
        { name: 'Sports', color: 'bg-emerald-600' },
        { name: 'Academic', color: 'bg-accent' },
        { name: 'Holiday', color: 'bg-stone-500' },
    ];

    const toggleCategory = (cat: string) => {
        setSelectedCategories(prev =>
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        );
    };

    // Calendar logic
    const monthYear = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

    const getDayEvents = (day: number) => {
        const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        return events.filter(e => e.date === dateStr && selectedCategories.includes(e.category));
    };

    const upcomingEvents = events.filter(e => {
        const eventDate = new Date(e.date);
        return eventDate >= new Date() && selectedCategories.includes(e.category);
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mb-12">
                <span className="text-accent font-bold tracking-widest uppercase text-xs mb-2 block">Institutional Schedule</span>
                <h1 className="text-4xl md:text-5xl font-serif text-stone-800 flex items-center gap-3 tracking-tight uppercase">
                    <CalendarIcon size={32} className="text-primary" /> Network Calendar
                </h1>
            </div>

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Sidebar */}
                <aside className="w-full lg:w-80 shrink-0 space-y-8">
                    <div className="bg-white p-8 rounded-2xl shadow-xl shadow-stone-200/50 border border-stone-100">
                        <h3 className="flex items-center gap-2 font-bold text-stone-800 mb-6 font-serif uppercase tracking-widest text-sm">
                            <Filter size={18} className="text-accent" /> Categories
                        </h3>

                        <div className="space-y-4">
                            {categories.map(cat => (
                                <label key={cat.name} className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={selectedCategories.includes(cat.name)}
                                            onChange={() => toggleCategory(cat.name)}
                                            className="peer sr-only"
                                        />
                                        <div className="w-5 h-5 border-2 border-stone-200 rounded-md peer-checked:bg-primary peer-checked:border-primary transition-all"></div>
                                        <motion.div
                                            initial={false}
                                            animate={{ scale: selectedCategories.includes(cat.name) ? 1 : 0 }}
                                            className="absolute inset-0 flex items-center justify-center text-white pointer-events-none"
                                        >
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </motion.div>
                                    </div>
                                    <div className={`w-3 h-3 rounded-full ${cat.color} opacity-40`}></div>
                                    <span className="text-stone-600 font-medium tracking-tight group-hover:text-stone-900 transition-colors uppercase text-xs">{cat.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-xl shadow-stone-200/50 border border-stone-100">
                        <h3 className="font-bold text-stone-800 mb-6 flex justify-between items-center font-serif uppercase tracking-widest text-sm">
                            Upcoming
                            {loading && <Loader2 size={16} className="animate-spin text-accent" />}
                        </h3>
                        <div className="space-y-6">
                            {upcomingEvents.length === 0 ? (
                                <p className="text-stone-400 text-xs italic">No upcoming events found.</p>
                            ) : (
                                upcomingEvents.slice(0, 4).map(event => (
                                    <Link to={`/events/${event.id}`} key={event.id} className="flex items-start gap-4 group cursor-pointer transition-all">
                                        <div className="bg-stone-50 p-2 rounded-xl text-center min-w-[3.5rem] border border-stone-200/50 group-hover:border-accent/40 transition-colors shadow-sm">
                                            <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-tighter">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                                            <span className="block text-xl font-bold text-primary">{new Date(event.date).getDate()}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-stone-700 text-xs group-hover:text-primary transition-colors uppercase leading-tight">{event.title}</h4>
                                            <span className={clsx("text-[9px] px-2 py-0.5 rounded-full text-white inline-block mt-2 font-bold uppercase tracking-widest",
                                                event.category === 'Exam' && "bg-primary",
                                                event.category === 'Sports' && "bg-emerald-600",
                                                event.category === 'Academic' && "bg-accent",
                                                event.category === 'Holiday' && "bg-stone-500"
                                            )}>
                                                {event.category}
                                            </span>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                </aside>

                {/* Calendar Grid */}
                <main className="flex-1 bg-white rounded-3xl shadow-2xl shadow-stone-200/60 border border-stone-100 overflow-hidden">
                    <div className="p-8 border-b border-stone-50 flex justify-between items-center bg-stone-50/20">
                        <h2 className="text-2xl font-serif font-bold text-stone-800 tracking-tight flex items-center gap-3">
                            <span className="uppercase">{monthYear}</span>
                            {loading && <Loader2 size={20} className="animate-spin text-accent" />}
                        </h2>
                        <div className="flex gap-4">
                            <button
                                onClick={prevMonth}
                                className="p-2.5 hover:bg-white hover:shadow-md rounded-xl transition-all border border-transparent hover:border-stone-100 text-stone-600 active:scale-95"
                            >
                                <ChevronLeft size={22} />
                            </button>
                            <button
                                onClick={nextMonth}
                                className="p-2.5 hover:bg-white hover:shadow-md rounded-xl transition-all border border-transparent hover:border-stone-100 text-stone-600 active:scale-95"
                            >
                                <ChevronRight size={22} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 text-center font-bold text-stone-400 text-[10px] py-4 border-b border-stone-50 bg-white tracking-[0.2em] uppercase">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
                    </div>

                    <div className="grid grid-cols-7 auto-rows-fr h-[650px]">
                        {/* Empty cells for prev month offset */}
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                            <div key={`empty-${i}`} className="bg-stone-50/30 border-r border-b border-stone-100 p-2"></div>
                        ))}

                        {/* Days */}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const dayEvents = getDayEvents(day);
                            const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

                            return (
                                <motion.div
                                    key={day}
                                    whileHover={{ backgroundColor: '#fcfaf7' }}
                                    className="border-r border-b border-stone-50 p-2 overflow-hidden flex flex-col items-start gap-1 transition-colors relative group"
                                >
                                    <span className={clsx(
                                        "text-sm font-bold w-7 h-7 flex items-center justify-center rounded-lg transition-all",
                                        isToday ? "bg-accent text-white shadow-xl scale-110" :
                                            dayEvents.length > 0 ? "bg-primary/10 text-primary" : "text-stone-400 group-hover:text-stone-800"
                                    )}>
                                        {day}
                                    </span>

                                    <div className="w-full flex flex-col gap-1 mt-1">
                                        {dayEvents.map(ev => (
                                            <Link
                                                to={`/events/${ev.id}`}
                                                key={ev.id}
                                                className={clsx(
                                                    "text-[9px] truncate px-2 py-1 rounded text-white font-bold uppercase tracking-widest w-full cursor-pointer hover:brightness-110 shadow-sm transition-all",
                                                    ev.category === 'Exam' && "bg-primary",
                                                    ev.category === 'Sports' && "bg-emerald-600",
                                                    ev.category === 'Academic' && "bg-accent",
                                                    ev.category === 'Holiday' && "bg-stone-500"
                                                )}
                                            >
                                                {ev.title}
                                            </Link>
                                        ))}
                                    </div>
                                </motion.div>
                            );
                        })}

                        {/* Empty cells for padding */}
                        {Array.from({ length: (42 - (daysInMonth + firstDayOfMonth)) % 7 }).map((_, i) => (
                            <div key={`next-empty-${i}`} className="bg-stone-50/30 border-r border-b border-stone-100 p-2"></div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CalendarPage;

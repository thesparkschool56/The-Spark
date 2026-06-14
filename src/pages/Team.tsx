import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ref, get, onValue } from 'firebase/database';
import { db } from '../lib/firebase';
import ShinyText from '../components/ui/ShinyText';
import { User } from 'lucide-react';



const Team: React.FC = () => {
    const [faculty, setFaculty] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFaculty = () => {
            const facultyRef = ref(db, 'faculty');
            setLoading(true);
            const unsubscribe = onValue(facultyRef, (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const dataArray = Object.entries(data).map(([id, val]: [string, any]) => ({ id, ...val }));
                    dataArray.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
                    setFaculty(dataArray);
                } else {
                    setFaculty([]);
                }
                setLoading(false);
            }, (error) => {
                console.error(error);
                setLoading(false);
            });

            return unsubscribe;
        };

        const unsubscribe = fetchFaculty();
        return () => unsubscribe();
    }, []);

    const sections = ['PG - Class 2', 'Class 3 - 5', 'Class 6 - 8', 'Class 9 - 10/12'];

    return (
        <div className="pt-20 min-h-screen bg-stone-50">
            {/* Hero */}
            <div className="bg-primary py-24 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <ShinyText text="Our Dedicated Team" disabled={false} speed={3} className="text-accent font-bold tracking-widest uppercase text-sm mb-4 inline-block" />
                        <h1 className="text-4xl md:text-5xl font-serif text-white mb-6 tracking-tight">Meet the Faculty</h1>
                        <p className="text-stone-300/80 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
                            Experienced educators committed to nurturing your child's potential.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Faculty List */}
            <div className="container mx-auto px-4 py-20">
                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-stone-500">Loading faculty...</p>
                    </div>
                ) : (
                    <div className="space-y-20">
                        {sections.map((section, sectionIndex) => {
                            const sectionMembers = faculty.filter(f => f.section === section);
                            if (sectionMembers.length === 0) return null;

                            return (
                                <motion.div
                                    key={section}
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: sectionIndex * 0.1 }}
                                >
                                    <div className="flex items-center gap-2 sm:gap-4 mb-8">
                                        <div className="h-px bg-stone-200 flex-1"></div>
                                        <h2 className="text-sm sm:text-lg md:text-2xl font-serif font-bold text-stone-800 uppercase tracking-widest border border-stone-200 px-4 sm:px-8 py-2.5 rounded-full bg-white shadow-sm text-center">
                                            {section}
                                        </h2>
                                        <div className="h-px bg-stone-200 flex-1"></div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                        {sectionMembers.map((member) => (
                                            <motion.div
                                                key={member.id}
                                                whileHover={{ y: -8 }}
                                                className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 hover:shadow-xl hover:border-accent/20 transition-all group text-center"
                                            >
                                                <div className="w-24 h-24 mx-auto bg-stone-100 rounded-full mb-4 overflow-hidden border-4 border-white shadow-md relative">
                                                    {member.image_url ? (
                                                        <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                                                            <User size={32} />
                                                        </div>
                                                    )}
                                                </div>
                                                <h3 className="text-lg font-bold text-stone-800 mb-1 group-hover:text-primary transition-colors">{member.name}</h3>
                                                <p className="text-sm text-accent font-semibold uppercase tracking-wide">{member.role}</p>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Team;

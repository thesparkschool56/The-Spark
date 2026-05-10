import React from 'react';
import { motion } from 'framer-motion';
import { Award, Users, Globe, Target, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import ShinyText from '../components/ui/ShinyText';
import SplitText from '../components/ui/SplitText';

const About: React.FC = () => {
    return (
        <div className="pt-20 pb-20">
            {/* Hero Section */}
            <section className="relative py-20 bg-stone-50 overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 -skew-x-12 transform origin-top-right"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-block mb-4"
                        >
                            <ShinyText text="Our Story & Vision" disabled={false} speed={3} className="text-accent font-bold tracking-widest uppercase text-sm" />
                        </motion.span>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-6xl font-serif text-stone-900 mb-6"
                        >
                            <SplitText text="Cultivating Leaders" className="block" delay={0} />
                            <span className="italic text-primary block mt-2">Since 1985</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg text-stone-600 leading-relaxed"
                        >
                            The Spark School & College is more than just an educational institution; it is a vibrant community dedicated to academic excellence, character building, and holistic development.
                        </motion.p>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="container mx-auto px-4 py-16">
                <div className="grid md:grid-cols-2 gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-primary relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Target size={120} />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                                <Target size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-stone-900 mb-4 font-serif">Our Mission</h3>
                            <p className="text-stone-600 leading-relaxed">
                                To provide a dynamic learning environment that fosters critical thinking, creativity, and moral integrity. We aim to empower students to become responsible global citizens who contribute positively to society.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-accent relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Globe size={120} />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center mb-6">
                                <Globe size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-stone-900 mb-4 font-serif">Our Vision</h3>
                            <p className="text-stone-600 leading-relaxed">
                                To be a premier institution recognized for excellence in education, innovation, and leadership development, nurturing minds that will shape the future of our nation and the world.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Principal's Message */}
            <section className="bg-stone-900 text-white py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="text-accent font-bold tracking-widest uppercase text-sm mb-2 block">Leadership</span>
                            <h2 className="text-4xl font-serif mb-6">Principal's Message</h2>
                            <blockquote className="text-xl italic text-stone-300 mb-8 leading-loose border-l-4 border-accent pl-6">
                                "At The Spark, we believe that every child has a unique light within them. Our job is not just to teach, but to kindle that spark into a roaring flame of curiosity and passion. We don't just build careers; we build character."
                            </blockquote>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <h4 className="font-bold text-lg">Dr. Ayesha Rahman</h4>
                                    <p className="text-accent text-sm uppercase tracking-wide">Principal</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-accent rounded-2xl transform rotate-3 translate-x-2 translate-y-2"></div>
                            <img
                                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                                alt="Principal"
                                className="relative rounded-2xl shadow-2xl w-full max-w-md mx-auto grayscale hover:grayscale-0 transition-all duration-500"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="container mx-auto px-4 py-20">
                <div className="text-center mb-16">
                    <span className="text-primary font-bold tracking-widest uppercase text-sm">Our Foundation</span>
                    <h2 className="text-4xl font-serif text-slate-900 mt-2">Core Values</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8 text-center">
                    {[
                        { icon: Award, title: 'Excellence', desc: 'Striving for the highest standards in everything we do.', color: 'text-amber-700', bg: 'bg-amber-50' },
                        { icon: Heart, title: 'Integrity', desc: 'Upholding honesty, ethics, and moral courage.', color: 'text-red-700', bg: 'bg-red-50' },
                        { icon: Users, title: 'Community', desc: 'Fostering a supportive and inclusive family environment.', color: 'text-primary', bg: 'bg-stone-100' }
                    ].map((value, i) => (
                        <div key={i} className="group p-8 rounded-2xl hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-transparent">
                            <div className={`w-16 h-16 ${value.bg} ${value.color} rounded-full flex items-center justify-center mx-auto mb-6 transition-transform group-hover:scale-110`}>
                                <value.icon size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-stone-900 mb-3">{value.title}</h3>
                            <p className="text-stone-600">{value.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="bg-primary py-16">
                <div className="container mx-auto px-4 text-center text-white">
                    <h2 className="text-3xl md:text-4xl font-serif mb-6">Join Our Growing Community</h2>
                    <p className="text-primary-100 mb-8 max-w-2xl mx-auto text-lg">
                        Discover the difference a holistic education makes. Applications for the next academic year are now open.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link to="/admissions" className="bg-white text-primary px-8 py-3 rounded-full font-bold hover:bg-stone-50 transition-colors shadow-lg">
                            Enroll Now
                        </Link>
                        <Link to="/contact" className="border-2 border-white/30 text-white px-8 py-3 rounded-full font-bold hover:bg-white/10 transition-colors">
                            Contact Us
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;

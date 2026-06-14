import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', path: '/#home' },
        { name: 'About', path: '/about' },
        { name: 'Founders', path: '/#founders' },
        { name: 'Campuses', path: '/#campuses' },
        { name: 'Events', path: '/#events' },
        { name: 'Reviews', path: '/#reviews' },
        { name: 'Enroll Now', path: '/#apply' },
    ];

    return (
        <nav
            className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-lg shadow-md py-3' : 'bg-transparent py-5'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="bg-white p-1 rounded-full shadow-lg group-hover:shadow-primary/30 transition-all overflow-hidden w-12 h-12 flex items-center justify-center">
                            <img src="/sp.jpg" alt="The Spark Logo" className="w-full h-full object-cover rounded-full" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-serif text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 leading-none">The Spark</span>
                            <span className="text-[10px] tracking-widest uppercase text-slate-500 font-bold mt-0.5">School & College</span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center space-x-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`font-semibold transition-all text-xs uppercase tracking-wider relative group ${location.pathname === link.path
                                    ? 'text-primary'
                                    : 'text-slate-600 hover:text-primary'
                                    }`}
                            >
                                {link.name}
                                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full ${location.pathname === link.path ? 'w-full' : ''}`}></span>
                            </Link>
                        ))}
                        <Link to="/vacancies" className="font-bold transition-all text-xs uppercase tracking-wider relative group text-stone-600 hover:text-accent border-r border-stone-200 pr-4 mr-2">
                            Join as Team
                        </Link>
                        <Link to="/contact" className="bg-slate-900 text-white px-7 py-2.5 rounded-full font-bold text-xs uppercase tracking-wide hover:bg-primary transition-colors shadow-lg shadow-slate-900/20 hover:shadow-primary/30">
                            Contact Us
                        </Link>
                        <Link to="/admin" className="text-[10px] font-bold text-stone-300 hover:text-stone-900 transition-colors">ADMIN</Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="lg:hidden text-stone-600 p-2 hover:bg-stone-100 rounded-lg transition-colors"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm lg:hidden z-[-1]"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 h-screen w-[280px] bg-white shadow-2xl lg:hidden z-50 flex flex-col"
                        >
                            <div className="p-6 flex justify-between items-center border-b border-stone-100">
                                <span className="font-serif font-bold text-xl text-stone-900">Menu</span>
                                <button onClick={() => setIsOpen(false)} className="text-stone-500 p-2">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 space-y-1">
                                {navLinks.map((link, idx) => (
                                    <motion.div
                                        key={link.name}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 + 0.1 }}
                                    >
                                        <Link
                                            to={link.path}
                                            className={`block py-4 text-stone-600 font-bold transition-all border-b border-stone-50 active:scale-95 ${location.pathname + location.hash === link.path ? 'text-primary pl-2 border-l-4 border-l-primary' : 'hover:text-primary pr-2'}`}
                                            onClick={() => setIsOpen(false)}
                                        >
                                            {link.name}
                                        </Link>
                                    </motion.div>
                                ))}
                                <div className="pt-6 space-y-4">
                                    <Link
                                        to="/vacancies"
                                        onClick={() => setIsOpen(false)}
                                        className="block w-full text-center bg-stone-100 text-stone-800 py-4 rounded-xl font-bold border border-stone-200"
                                    >
                                        Join as Team
                                    </Link>
                                    <Link
                                        to="/contact"
                                        onClick={() => setIsOpen(false)}
                                        className="block w-full text-center bg-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/20"
                                    >
                                        Contact Us
                                    </Link>
                                    <Link
                                        to="/admin"
                                        onClick={() => setIsOpen(false)}
                                        className="block w-full text-center text-stone-400 font-medium py-2 text-xs uppercase"
                                    >
                                        Admin Portal
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;

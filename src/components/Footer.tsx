import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Youtube, Video } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-background-dark text-white pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-white p-1 rounded-full w-10 h-10 flex items-center justify-center overflow-hidden">
                                <img src="/sp.jpg" alt="The Spark Logo" className="w-full h-full object-cover rounded-full" />
                            </div>
                            <h3 className="font-serif text-2xl font-bold">The Spark</h3>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                            Igniting minds and shaping futures through excellence in education.
                            We are committed to nurturing the leaders of tomorrow.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-slate-400 hover:text-white transition-colors"><Facebook size={20} /></a>
                            <a href="#" className="text-slate-400 hover:text-white transition-colors"><Video size={20} /></a>
                            <a href="#" className="text-slate-400 hover:text-white transition-colors"><Youtube size={20} /></a>
                            <a href="#" className="text-slate-400 hover:text-white transition-colors"><Twitter size={20} /></a>
                            <a href="#" className="text-slate-400 hover:text-white transition-colors"><Instagram size={20} /></a>
                            <a href="#" className="text-slate-400 hover:text-white transition-colors"><Linkedin size={20} /></a>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-serif text-lg font-bold mb-6 text-accent">Quick Links</h4>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li><Link to="/#about" className="hover:text-white transition-colors">About Us</Link></li>
                            <li><Link to="/admissions" className="hover:text-white transition-colors">Admissions</Link></li>
                            <li><Link to="/calendar" className="hover:text-white transition-colors">Academic Calendar</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-serif text-lg font-bold mb-6 text-accent">Campuses</h4>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li><Link to="/campus/jinnah" className="hover:text-white transition-colors">Jinnah Campus</Link></li>
                            <li><Link to="/campus/shebaz" className="hover:text-white transition-colors">Shebaz Campus</Link></li>
                            <li><Link to="/campus/ghazali" className="hover:text-white transition-colors">Ghazali Campus</Link></li>
                            <li><Link to="/campus/latif" className="hover:text-white transition-colors">Latif Campus</Link></li>
                            <li><Link to="/campus/sachal" className="hover:text-white transition-colors">Sachal Campus</Link></li>
                            <li><Link to="/campus/iqbal" className="hover:text-white transition-colors">Iqbal Campus</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-serif text-lg font-bold mb-6 text-accent">Contact</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li className="flex items-start gap-3">
                                <MapPin size={18} className="mt-0.5 shrink-0" />
                                <span>123 Education Avenue, Knowledge City, SP 54000</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone size={18} className="shrink-0" />
                                <span>+1 (555) 123-4567</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={18} className="shrink-0" />
                                <span>admissions@spark.edu</span>
                            </li>
                        </ul>

                        <div className="mt-8">
                            <h4 className="font-serif text-sm font-bold mb-4 text-accent uppercase tracking-wider">Office Hours</h4>
                            <div className="text-xs text-slate-400 space-y-4">
                                <div>
                                    <p className="text-white font-semibold mb-1">General Office</p>
                                    <p>Mon - Thu: 08:00am - 02:30pm</p>
                                    <p>Fri: 08:00am - 01:00pm</p>
                                    <p>Sat: 09:00am - 01:30pm</p>
                                </div>
                                <div>
                                    <p className="text-white font-semibold mb-1">Accounts Office</p>
                                    <p>Mon - Thu: 08:00am - 02:30pm</p>
                                    <p>Fri: 08:00am - 01:00pm</p>
                                    <p>Sat: 09:00am - 01:30pm</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
                    <p>&copy; 2024 The Spark School & College. All rights reserved.</p>
                    <div className="flex space-x-6">
                        <a href="#" className="hover:text-white">Privacy Policy</a>
                        <a href="#" className="hover:text-white">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

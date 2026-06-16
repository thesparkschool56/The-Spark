import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Users, Calendar, MessageSquare, LogOut, GraduationCap, Contact, Mail, Briefcase, Trophy, MapPin, DollarSign } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

const AdminLayout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error: any) {
            console.error('Error signing out:', error.message);
        }
    };

    const menuItems = [
        { icon: <Trophy size={20} />, label: 'Scoreboard', path: '/admin' },
        { icon: <Users size={20} />, label: 'Admissions', path: '/admin/admissions' },
        { icon: <Contact size={20} />, label: 'Faculty', path: '/admin/faculty' },
        { icon: <Calendar size={20} />, label: 'Events', path: '/admin/events' },
        { icon: <MessageSquare size={20} />, label: 'Reviews', path: '/admin/reviews' },
        { icon: <Users size={20} />, label: 'Founders', path: '/admin/founders' },
        { icon: <Mail size={20} />, label: 'Messages', path: '/admin/messages' },
        { icon: <MapPin size={20} />, label: 'Campuses', path: '/admin/campuses' },
        { icon: <DollarSign size={20} />, label: 'Fees', path: '/admin/fees' },
        { icon: <Briefcase size={20} />, label: 'Vacancies', path: '/admin/vacancies' },
    ];

    return (
        <div className="flex min-h-screen bg-stone-100 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-primary bg-gradient-to-b from-primary to-stone-900 text-white fixed h-full shadow-2xl z-20">
                <div className="p-6 border-b border-white/10 flex items-center gap-3">
                    <div className="bg-accent text-white p-1.5 rounded">
                        <GraduationCap size={20} />
                    </div>
                    <span className="font-serif font-bold text-lg tracking-wide">Spark Admin</span>
                </div>

                <nav className="p-4 space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.label}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${location.pathname === item.path || (item.path === '/admin' && location.pathname === '/admin/')
                                ? 'bg-accent text-white shadow-lg shadow-accent/30'
                                : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                                }`}
                        >
                            {item.icon}
                            <span className="font-medium text-sm">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t border-white/10">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-4 py-3 text-stone-300 hover:text-red-400 transition-colors w-full"
                    >
                        <LogOut size={20} />
                        <span className="font-medium text-sm">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8 overflow-y-auto">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-stone-800 font-serif">Administrator Portal</h1>
                        <p className="text-stone-500 text-sm">Welcome back, Administrator</p>
                    </div>
                    <div className="h-10 w-10 bg-stone-200 rounded-full border-2 border-white shadow-sm overflow-hidden">
                        <img src="https://ui-avatars.com/api/?name=Admin+User&background=3d2b1f&color=fff" alt="Admin" />
                    </div>
                </header>
                <div className="bg-white rounded-xl shadow-sm border border-stone-100 min-h-[500px] p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;

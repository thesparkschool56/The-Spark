import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import BlurText from '../components/ui/BlurText';
import ShinyText from '../components/ui/ShinyText';
import { ref, push, set } from 'firebase/database';
import { db } from '../lib/firebase';
import { motion } from 'framer-motion';

const Contact: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        setErrorMessage(null);

        try {
            const messagesRef = ref(db, 'messages');
            const newMessageRef = push(messagesRef);
            await set(newMessageRef, {
                sender_name: formData.name,
                email: formData.email,
                message_body: formData.message,
                subject: 'General Inquiry',
                is_read: false,
                created_at: new Date().toISOString()
            });

            setStatus('success');
            setFormData({ name: '', email: '', message: '' });
        } catch (error: any) {
            console.error('Error submitting form:', error);
            setStatus('error');
            setErrorMessage(error.message || 'Something went wrong. Please try again later.');
            setTimeout(() => setStatus('idle'), 5000);
        } finally {
            if (status !== 'error') setStatus('success');
            setTimeout(() => {
                if (status === 'success') setStatus('idle');
            }, 5000);
        }
    };

    return (
        <div className="min-h-screen pt-20 pb-10 bg-stone-50">
            {/* Header */}
            <div className="bg-primary py-24 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex justify-center">
                        <BlurText text="Get in Touch" className="text-5xl md:text-6xl font-serif text-white mb-4 tracking-tight" delay={0.1} />
                    </div>
                    <p className="text-stone-300 opacity-90 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
                        We'd love to hear from you. Reach out to us for admissions, inquiries, or just to say hello.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-10 relative z-20">
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Contact Info Cards */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white p-8 rounded-2xl shadow-xl shadow-stone-200/50 flex flex-col items-center text-center border border-stone-100"
                    >
                        <div className="p-4 bg-stone-100 text-primary rounded-full mb-4 border border-stone-200/50">
                            <Phone size={24} />
                        </div>
                        <h3 className="font-serif text-xl font-bold text-stone-800 mb-2">Phone</h3>
                        <p className="text-stone-500 font-medium">+92 (22) 211-1234</p>
                        <p className="text-stone-500 font-medium">+92 (300) 123-4567</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="bg-white p-8 rounded-2xl shadow-xl shadow-stone-200/50 flex flex-col items-center text-center border border-stone-100"
                    >
                        <div className="p-4 bg-amber-50 text-accent rounded-full mb-4 border border-amber-100">
                            <Mail size={24} />
                        </div>
                        <h3 className="font-serif text-xl font-bold text-stone-800 mb-2">Email</h3>
                        <p className="text-stone-500 font-medium">admissions@spark.edu.pk</p>
                        <p className="text-stone-500 font-medium">contact@spark.edu.pk</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="bg-white p-8 rounded-2xl shadow-xl shadow-stone-200/50 flex flex-col items-center text-center border border-stone-100"
                    >
                        <div className="p-4 bg-stone-100 text-stone-600 rounded-full mb-4 border border-stone-200/50">
                            <MapPin size={24} />
                        </div>
                        <h3 className="font-serif text-xl font-bold text-stone-800 mb-2">Campus</h3>
                        <p className="text-stone-500 font-medium">Main Autobahn Road</p>
                        <p className="text-stone-500 font-medium">Latifabad, Hyderabad, Sindh</p>
                    </motion.div>
                </div>

                {/* Contact Form */}
                <div className="max-w-4xl mx-auto mt-16 bg-white rounded-3xl shadow-2xl shadow-stone-200/50 overflow-hidden flex flex-col md:flex-row border border-stone-100">
                    <div className="md:w-1/2 bg-stone-900 p-12 text-white flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')] bg-cover bg-center"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-stone-900/95 to-primary/95"></div>

                        <div className="relative z-10">
                            <ShinyText text="Contact Us" disabled={false} speed={3} className="text-accent font-bold tracking-widest uppercase text-sm mb-2" />
                            <h2 className="text-3xl font-serif font-bold mb-6 tracking-wide">Send us a Message</h2>
                            <p className="text-stone-300/80 leading-relaxed mb-8 font-medium">
                                Whether you have a question about admissions, academics, or campus life, our team is ready to answer all your questions.
                            </p>
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 text-stone-400 mb-2">
                                <span className="w-8 h-[1px] bg-accent"></span>
                                <span className="text-sm uppercase tracking-wider">Office Hours</span>
                            </div>
                            <p className="text-sm text-white font-medium">Monday - Friday: 8:00 AM - 4:00 PM</p>
                        </div>
                    </div>

                    <div className="md:w-1/2 p-12">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">Your Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-stone-300"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-stone-300"
                                    placeholder="john@example.com"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">Message</label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none placeholder:text-stone-300"
                                    placeholder="How can we help you?"
                                    required
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={status === 'submitting'}
                                className="w-full bg-primary text-white py-4 rounded-lg font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {status === 'submitting' ? 'Sending...' : status === 'success' ? 'Message Sent!' : status === 'error' ? 'Failed to Send' : 'Send Message'}
                                {status === 'idle' && <Send size={18} />}
                                {status === 'success' && <div className="text-emerald-400">✓</div>}
                            </button>
                            {status === 'success' && (
                                <p className="text-center text-emerald-600 text-sm font-bold animate-pulse">
                                    We've received your message. Thank you!
                                </p>
                            )}
                            {status === 'error' && (
                                <p className="text-center text-red-600 text-sm font-bold">
                                    {errorMessage}
                                </p>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;

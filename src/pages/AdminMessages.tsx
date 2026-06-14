import React, { useState, useEffect } from 'react';
import { ref, get, update, remove, onValue } from 'firebase/database';
import { db } from '../lib/firebase';
import { Trash2, Mail, CheckCircle, Clock } from 'lucide-react';
import ConfirmModal from '../components/ui/ConfirmModal';

export interface Message {
    id: string;
    sender_name: string;
    email: string;
    subject?: string;
    message_body: string;
    is_read: boolean;
    created_at: string;
}

const AdminMessages: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Modal State
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        const messagesRef = ref(db, 'messages');
        
        const unsubscribe = onValue(messagesRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const dataArray = Object.entries(data).map(([id, val]: [string, any]) => ({
                    id,
                    ...val
                })) as Message[];
                dataArray.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                setMessages(dataArray);
            } else {
                setMessages([]);
            }
            setLoading(false);
        }, (error) => {
            console.error('Error fetching messages:', error);
            setActionMessage({ type: 'error', text: 'Error fetching messages: ' + error.message });
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleDelete = async (id: string) => {
        setIdToDelete(id);
        setIsConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!idToDelete) return;

        try {
            const messageRef = ref(db, `messages/${idToDelete}`);
            await remove(messageRef);

            setActionMessage({ type: 'success', text: 'Message deleted successfully.' });
            setTimeout(() => setActionMessage(null), 3000);
        } catch (error: any) {
            console.error('Delete error:', error);
            setActionMessage({ type: 'error', text: 'Error deleting message: ' + error.message });
        }
        setIsConfirmOpen(false);
        setIdToDelete(null);
    };

    const handleToggleRead = async (id: string, currentReadStatus: boolean) => {
        try {
            const messageRef = ref(db, `messages/${id}`);
            await update(messageRef, { is_read: !currentReadStatus });
        } catch (error: any) {
            setActionMessage({ type: 'error', text: 'Error updating status: ' + error.message });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-serif text-stone-800">Messages</h2>
                <div className="flex items-center gap-2 text-sm text-stone-500">
                    <Mail size={16} />
                    <span>{messages.length} Total Messages</span>
                </div>
            </div>

            {actionMessage && (
                <div className={`p-4 rounded-xl text-sm border ${actionMessage.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
                    {actionMessage.text}
                </div>
            )}

            {loading ? (
                <div className="text-center py-20 text-stone-400">Loading messages...</div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-stone-100">
                    {messages.length === 0 ? (
                        <div className="text-center py-20 text-stone-500">No messages found.</div>
                    ) : (
                        <div className="divide-y divide-stone-100">
                             {messages.map((msg: Message) => (
                                 <div key={msg.id} className={`p-6 hover:bg-stone-50 transition-colors ${!msg.is_read ? 'bg-primary/5' : ''}`}>
                                     <div className="flex justify-between items-start mb-2">
                                         <div className="flex items-center gap-3">
                                             <h3 className={`font-bold text-stone-900 ${!msg.is_read ? 'text-primary' : ''}`}>
                                                 {msg.sender_name}
                                             </h3>
                                             <span className="text-sm text-stone-500 bg-stone-100 px-2 py-1 rounded-full flex items-center gap-1">
                                                 <Mail size={12} /> {msg.email}
                                             </span>
                                             {!msg.is_read && (
                                                 <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-1 rounded-full">NEW</span>
                                             )}
                                         </div>
                                         <div className="flex items-center gap-2">
                                             <span className="text-xs text-stone-400 flex items-center gap-1 mr-4">
                                                 <Clock size={12} />
                                                 {new Date(msg.created_at).toLocaleDateString()}
                                             </span>
                                             <button
                                                 onClick={() => handleToggleRead(msg.id, msg.is_read ?? false)}
                                                 className={`p-2 rounded-lg transition-colors ${!msg.is_read ? 'text-accent hover:bg-accent/10' : 'text-stone-400 hover:text-stone-600'}`}
                                                 title={!msg.is_read ? "Mark as Read" : "Mark as Unread"}
                                             >
                                                 <CheckCircle size={18} />
                                             </button>
                                             <button
                                                 onClick={() => handleDelete(msg.id)}
                                                 className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                 title="Delete Message"
                                             >
                                                 <Trash2 size={18} />
                                             </button>
                                         </div>
                                     </div>
                                     <div className="mb-2">
                                         <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Subject: </span>
                                         <span className="text-sm font-medium text-stone-600">{msg.subject || 'General Inquiry'}</span>
                                     </div>
                                     <p className="text-stone-700 leading-relaxed pl-1 border-l-2 border-stone-200 ml-1">
                                         {msg.message_body}
                                     </p>
                                 </div>
                             ))}
                        </div>
                    )}
                </div>
            )}

            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Message"
                message="Are you sure you want to delete this contact message? This action is permanent."
            />
        </div>
    );
};

export default AdminMessages;

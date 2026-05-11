import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/client';
import Navbar from '../../components/layout/Navbar';
import AdminSidebar from '../../components/layout/AdminSidebar';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PageTransition from '../../components/animations/PageTransition';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState({});

  useEffect(() => {
    api.get('/messages').then(({ data }) => {
      setMessages(Array.isArray(data) ? data : data.$values || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const sendReply = async (msgId) => {
    if (!reply[msgId]) return;
    try {
      await api.post(`/messages/${msgId}/reply`, { content: reply[msgId] });
      setReply((r) => ({ ...r, [msgId]: '' }));
    } catch {}
  };

  if (loading) return <LoadingSpinner />;

  return (
    <PageTransition>
      <div className="min-h-screen bg-warm-light">
        <Navbar />
        <AdminSidebar />
        <div className="pl-64 pt-16">
          <div className="max-w-7xl mx-auto px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Messages</h1>

            {messages.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-400">No messages yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="card">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="font-semibold text-gray-900">{msg.senderName || msg.sender?.name || msg.sender?.email || 'Unknown'}</span>
                        <span className="text-gray-400 text-xs ml-3">{msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ''}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{msg.content || msg.message}</p>
                    <div className="flex gap-2">
                      <Input value={reply[msg.id] || ''} onChange={(e) => setReply((r) => ({ ...r, [msg.id]: e.target.value }))} placeholder="Type a reply..." className="mb-0" />
                      <Button variant="teal" className="!px-4 whitespace-nowrap" onClick={() => sendReply(msg.id)}>Send</Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/client';
import Navbar from '../../components/layout/Navbar';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PageTransition from '../../components/animations/PageTransition';

export default function ClientMessages() {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/messages').then(({ data }) => {
      setMessages(Array.isArray(data) ? data : data.$values || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const sendMessage = async () => {
    if (!newMsg.trim()) return;
    try {
      const { data } = await api.post('/messages', { content: newMsg });
      setMessages((prev) => [...prev, data]);
      setNewMsg('');
    } catch {}
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-warm-light">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Messages</h1>

          <div className="bg-white rounded-2xl shadow-md p-6 mb-6 max-h-[500px] overflow-y-auto space-y-4">
            {messages.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No messages yet. Start a conversation!</p>
            ) : (
              messages.map((msg, i) => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className={`p-4 rounded-xl max-w-[80%] ${msg.senderId === 'me' ? 'bg-coral/10 ml-auto' : 'bg-gray-50'}`}
                >
                  <p className="text-sm text-gray-700">{msg.content || msg.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ''}</p>
                </motion.div>
              ))
            )}
          </div>

          <div className="flex gap-3">
            <Input value={newMsg} onChange={(e) => setNewMsg(e.target.value)} placeholder="Type your message..." className="mb-0" onKeyDown={(e) => e.key === 'Enter' && sendMessage()} />
            <Button variant="primary" onClick={sendMessage} className="whitespace-nowrap">Send</Button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

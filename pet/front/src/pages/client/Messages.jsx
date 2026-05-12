import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/client';
import Navbar from '../../components/layout/Navbar';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PageTransition from '../../components/animations/PageTransition';

export default function ClientMessages() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    api.get('/conversations').then(({ data }) => {
      if (!cancelled) setConversations(data.$values || data || []);
    }).catch(() => {}).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openConversation = async (conv) => {
    setActiveConv(conv);
    setMessagesLoading(true);
    try {
      const { data } = await api.get(`/conversations/${conv.id}/messages`);
      setMessages(data.items || data.$values || []);
    } catch { setMessages([]); }
    finally { setMessagesLoading(false); }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConv) return;
    setSending(true);
    try {
      const { data } = await api.post(`/conversations/${activeConv.id}/messages`, { content: newMessage });
      setMessages((prev) => [...prev, data]);
      setNewMessage('');
    } catch {}
    finally { setSending(false); }
  };

  const closeConversation = async () => {
    if (!activeConv) return;
    try {
      await api.patch(`/conversations/${activeConv.id}/close`);
      setConversations((prev) => prev.map((c) => c.id === activeConv.id ? { ...c, isOpen: false } : c));
      setActiveConv((prev) => ({ ...prev, isOpen: false }));
    } catch {}
  };

  const user = JSON.parse(localStorage.getItem('sh-user') || '{}');
  const userId = user.id || user.user_id;

  return (
    <PageTransition>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-[calc(100vh-10rem)]">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden md:col-span-1">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Conversations</h2>
              </div>
              <div className="overflow-y-auto h-[calc(100%-4rem)]">
                {loading ? <LoadingSpinner /> : conversations.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-8">No conversations yet</p>
                ) : conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => openConversation(conv)}
                    className={`w-full text-left p-4 border-b border-gray-50 hover:bg-warm/50 transition-colors ${activeConv?.id === conv.id ? 'bg-warm' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-coral-light flex items-center justify-center text-lg font-bold text-coral shrink-0">
                        {conv.otherUserName?.[0] || '?'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-gray-900 text-sm truncate">{conv.otherUserName || 'Unknown'}</p>
                          {conv.unreadCount > 0 && <span className="bg-coral text-white text-xs rounded-full px-2 py-0.5">{conv.unreadCount}</span>}
                        </div>
                        <p className="text-xs text-gray-400 truncate">{conv.lastMessageContent || 'No messages'}</p>
                        {conv.petName && <p className="text-xs text-coral mt-0.5">About: {conv.petName}</p>}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden md:col-span-2 flex flex-col">
              {!activeConv ? (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="text-6xl mb-4">💬</div>
                    <p>Select a conversation to start chatting</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-coral-light flex items-center justify-center text-lg font-bold text-coral">
                        {activeConv.otherUserName?.[0] || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{activeConv.otherUserName}</p>
                        {activeConv.petName && <p className="text-xs text-gray-400">About: {activeConv.petName}</p>}
                      </div>
                    </div>
                    {activeConv.isOpen && (
                      <button onClick={closeConversation} className="text-xs text-red-500 hover:text-red-600 font-medium">Close</button>
                    )}
                    {!activeConv.isOpen && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Closed</span>}
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messagesLoading ? <LoadingSpinner /> : messages.length === 0 ? (
                      <p className="text-gray-400 text-sm text-center py-8">No messages yet. Say hello!</p>
                    ) : messages.map((msg) => {
                      const isMe = String(msg.senderId) === String(userId);
                      return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${isMe ? 'bg-coral text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'}`}>
                            <p>{msg.content}</p>
                            <p className={`text-xs mt-1 ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {activeConv.isOpen && (
                    <div className="p-4 border-t border-gray-100">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                          placeholder="Type a message..."
                          className="input flex-1"
                        />
                        <Button onClick={sendMessage} disabled={sending || !newMessage.trim()} className="shrink-0">
                          {sending ? '...' : 'Send'}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import api from '../../config/api';

function Messaging({ recipientId, recipientName, onClose }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const currentUserId = localStorage.getItem('pawfinds-userId');

    useEffect(() => {
        const fetchMessages = async () => {
            const token = localStorage.getItem('pawfinds-token');
            try {
                const res = await api.get(`/messages`);
                
                // Filter messages for this conversation only
                const conversationMessages = res.data.filter(msg => 
                    (msg.senderId == currentUserId && msg.recipientId == recipientId) ||
                    (msg.senderId == recipientId && msg.recipientId == currentUserId)
                );
                
                setMessages(conversationMessages);
            } catch (err) {
                setError("Error loading messages");
                console.error("API Error:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMessages();
    }, [recipientId, currentUserId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const token = localStorage.getItem('pawfinds-token');
        try {
            const res = await api.post('/messages', {
                recipientId: recipientId,
                content: newMessage
            });

            setMessages([...messages, res.data]);
            setNewMessage('');
        } catch (err) {
            setError("Error sending message");
            console.error("API Error:", err);
        }
    };

    if (isLoading) return <div className="loading">Loading messages...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="messaging-container">
            <div className="messaging-header">
                <h3>Conversation with {recipientName}</h3>
                <button onClick={onClose} className="close-button">×</button>
            </div>
            
            <div className="messages-list">
                {messages.map((message) => (
                    <div 
                        key={message.id} 
                        className={`message ${message.senderId == currentUserId ? 'sent' : 'received'}`}
                    >
                        <div className="message-content">{message.content}</div>
                        <div className="message-time">
                            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={handleSendMessage} className="message-form">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    required
                />
                <button type="submit">Send</button>
            </form>

            <style jsx>{`
                .messaging-container {
                    display: flex;
                    flex-direction: column;
                    height: 500px;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    overflow: hidden;
                    background: white;
                    width: 400px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }
                
                .messaging-header {
                    padding: 15px;
                    background-color: #1a237e;
                    color: white;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .close-button {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 0 5px;
                }
                
                .messages-list {
                    flex: 1;
                    padding: 15px;
                    overflow-y: auto;
                    background-color: #f5f5f5;
                }
                
                .message {
                    max-width: 70%;
                    margin-bottom: 15px;
                    padding: 10px 15px;
                    border-radius: 18px;
                    position: relative;
                    word-wrap: break-word;
                }
                
                .message.sent {
                    background-color: #1a237e;
                    color: white;
                    margin-left: auto;
                    border-bottom-right-radius: 0;
                }
                
                .message.received {
                    background-color: #e0e0e0;
                    color: #212121;
                    margin-right: auto;
                    border-bottom-left-radius: 0;
                }
                
                .message-time {
                    font-size: 0.75rem;
                    opacity: 0.8;
                    text-align: right;
                    margin-top: 5px;
                }
                
                .message-form {
                    display: flex;
                    padding: 10px;
                    background-color: white;
                    border-top: 1px solid #e0e0e0;
                }
                
                .message-form input {
                    flex: 1;
                    padding: 10px 15px;
                    border: 1px solid #e0e0e0;
                    border-radius: 20px;
                    margin-right: 10px;
                }
                
                .message-form button {
                    padding: 10px 20px;
                    background-color: #1a237e;
                    color: white;
                    border: none;
                    border-radius: 20px;
                    cursor: pointer;
                }
                
                .loading, .error {
                    padding: 20px;
                    text-align: center;
                }
            `}</style>
        </div>
    );
}

export default Messaging;
// src/Components/AdminPanel/AdminMessagePanel.jsx

import React, { useState } from 'react';
import api from '../../config/api';

const AdminMessagePanel = ({ client, onBack }) => {
    const [message, setMessage] = useState("");

    const handleSend = async () => {
      if (!message.trim()) return;
      try {
        await api.post('/messages', { recipientId: client.id, content: message });
        setMessage('');
        alert('Message sent');
      } catch (err) {
        alert('Failed to send message');
      }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <button
                onClick={onBack}
                className="mb-4 text-blue-500 hover:underline"
            >
                ← Retour à la liste des clients
            </button>

            <h2 className="text-xl font-semibold mb-4">
                Envoyer un message à {client.name}
            </h2>

            <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-2 border rounded mb-4"
                rows="5"
                placeholder="Écris ton message ici..."
            />

            <button
                onClick={handleSend}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
                Envoyer
            </button>
        </div>
    );
};

export default AdminMessagePanel;

import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import { useNavigate } from 'react-router-dom';
import Messaging from '../msg/Messaging';

const AdminMessaging = () => {
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClients = async () => {
            const token = localStorage.getItem('pawfinds-token');
            
            try {
                const res = await api.get('/organizations/users', {
                    headers: {
                    }
                });
                
                setClients(res.data.data);
            } catch (err) {
                if (err.response?.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/admin');
                }
                setError(err.response?.data?.message || "Failed to load clients");
            } finally {
                setLoading(false);
            }
        };

        fetchClients();
    }, [navigate]);

    if (loading) {
        return <div className="p-4 text-center">Loading clients...</div>;
    }

    if (error) {
        return (
            <div className="p-4 text-center text-red-500">
                {error}
                <button 
                    onClick={() => window.location.reload()}
                    className="ml-2 px-3 py-1 bg-blue-500 text-white rounded"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Admin Messaging</h1>
            
            {!selectedClient ? (
                <div className="bg-white rounded-lg shadow p-4">
                    <h2 className="text-xl mb-4">Select a Client</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {clients.map(client => (
                            <div 
                                key={client.id}
                                className="border p-4 rounded-lg cursor-pointer hover:bg-gray-50"
                                onClick={() => setSelectedClient(client)}
                            >
                                <h3 className="font-medium">{client.name}</h3>
                                <p className="text-gray-600 text-sm">{client.email}</p>
                                <p className="text-gray-500 text-xs mt-2">
                                    Member since: {new Date(client.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow p-4">
                    <button 
                        onClick={() => setSelectedClient(null)}
                        className="mb-4 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                        ← Back to clients
                    </button>
                    <Messaging 
                        recipientId={selectedClient.id}
                        recipientName={selectedClient.name}
                        onClose={() => setSelectedClient(null)}
                    />
                </div>
            )}
        </div>
    );
};

export default AdminMessaging;
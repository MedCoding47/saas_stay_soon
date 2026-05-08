import React, { useState, useEffect } from 'react';
import api from '../../config/api';

function Notifications({ onClose }) {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('pawfinds-token');

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await api.get('/notifications');
                setNotifications(res.data);
            } catch (err) {
                if (err.response?.status === 401) {
                    localStorage.removeItem('pawfinds-token');
                    window.location.href = '/';
                }
                setError(err.response?.data?.message || "Error loading notifications");
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotifications();
    }, [token]);

    const handleMarkAsRead = async (notificationId) => {
        try {
            await api.post(
                `/notifications/${notificationId}/read`, 
                {},
                {
                    headers: {
                    }
                }
            );
            
            setNotifications(notifications.map(n => 
                n.id === notificationId ? {...n, is_read: true} : n
            ));
        } catch (err) {
            setError(err.response?.data?.message || "Error updating notification");
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.post(
                '/notifications/read-all',
                {},
                {
                    headers: {
                    }
                }
            );
            
            setNotifications(notifications.map(n => ({...n, is_read: true})));
        } catch (err) {
            setError(err.response?.data?.message || "Error updating notifications");
        }
    };


    if (isLoading) return <div className="loading">Loading notifications...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="notifications-container">
            <div className="notifications-header">
                <h3>Notifications</h3>
                <div className="notifications-actions">
                    <button onClick={handleMarkAllAsRead} className="mark-all-read">
                        Mark all as read
                    </button>
                    <button onClick={onClose} className="close-button">×</button>
                </div>
            </div>
            
            {notifications.length === 0 ? (
                <div className="empty-state">No new notifications</div>
            ) : (
                <ul className="notifications-list">
                    {notifications.map((notification) => (
                        <li 
                            key={notification.id} 
                            className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
                        >
                            <div className="notification-content">
                                {notification.content}
                                {notification.type === 'new_message' && (
                                    <button 
                                        className="view-message"
                                        onClick={() => {
                                            // You would implement navigation to the message here
                                            handleMarkAsRead(notification.id);
                                        }}
                                    >
                                        View
                                    </button>
                                )}
                            </div>
                            <div className="notification-time">
                                {new Date(notification.createdAt).toLocaleString()}
                            </div>
                            {!notification.isRead && (
                                <button 
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className="mark-as-read"
                                >
                                    Mark as read
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            <style jsx>{`
                .notifications-container {
                    width: 400px;
                    max-height: 500px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }
                
                .notifications-header {
                    padding: 15px;
                    background-color: #1a237e;
                    color: white;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .notifications-actions {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .mark-all-read, .mark-as-read {
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    color: white;
                    padding: 5px 10px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.8rem;
                }
                
                .mark-all-read:hover, .mark-as-read:hover {
                    background: rgba(255, 255, 255, 0.3);
                }
                
                .close-button {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 0 5px;
                }
                
                .notifications-list {
                    max-height: 400px;
                    overflow-y: auto;
                    padding: 0;
                    margin: 0;
                    list-style: none;
                }
                
                .notification-item {
                    padding: 15px;
                    border-bottom: 1px solid #eee;
                }
                
                .notification-item.unread {
                    background-color: #f8f9fa;
                }
                
                .notification-content {
                    margin-bottom: 5px;
                    display: flex;
                    justify-content: space-between;
                }
                
                .view-message {
                    background: #1a237e;
                    color: white;
                    border: none;
                    padding: 2px 8px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.8rem;
                }
                
                .notification-time {
                    font-size: 0.75rem;
                    color: #666;
                }
                
                .empty-state {
                    padding: 20px;
                    text-align: center;
                    color: #666;
                }
                
                .loading, .error {
                    padding: 20px;
                    text-align: center;
                }
                
                .error {
                    color: #d32f2f;
                }
            `}</style>
        </div>
    );
}

export default Notifications;
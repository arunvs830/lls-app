import React, { createContext, useState, useContext, useCallback } from 'react';
import { createPortal } from 'react-dom';
import '../styles/NotificationToast.css';

const NotificationContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

const Toast = ({ message, type, onClose }) => {
    // Auto-dismiss logic is handled by the provider removing the toast
    // This component is just for display

    // Icons based on type
    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️'
    };

    return (
        <div className={`notification-toast ${type} animate-slide-in`}>
            <div className="notification-icon">{icons[type]}</div>
            <div className="notification-content">
                <p className="notification-message">{message}</p>
            </div>
            <button className="notification-close" onClick={onClose}>&times;</button>
        </div>
    );
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const showNotification = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now();
        const newNotification = { id, message, type };

        setNotifications(prev => [...prev, newNotification]);

        if (duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, duration);
        }
    }, [removeNotification]);

    // Helper functions
    const success = (msg, duration) => showNotification(msg, 'success', duration);
    const error = (msg, duration) => showNotification(msg, 'error', duration);
    const info = (msg, duration) => showNotification(msg, 'info', duration);
    const warning = (msg, duration) => showNotification(msg, 'warning', duration);

    return (
        <NotificationContext.Provider value={{ showNotification, success, error, info, warning }}>
            {children}
            {createPortal(
                <div className="notification-container">
                    {notifications.map(n => (
                        <Toast
                            key={n.id}
                            message={n.message}
                            type={n.type}
                            onClose={() => removeNotification(n.id)}
                        />
                    ))}
                </div>,
                document.body
            )}
        </NotificationContext.Provider>
    );
};

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = useCallback((notification) => {
        const id = Date.now();
        const newNotification = {
            id,
            type: notification.type || 'info',
            title: notification.title,
            message: notification.message,
            duration: notification.duration || 5000,
        };

        setNotifications(prev => [...prev, newNotification]);

        // Auto remove after duration
        if (newNotification.duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, newNotification.duration);
        }

        return id;
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const success = useCallback((title, message) => {
        return addNotification({ type: 'success', title, message });
    }, [addNotification]);

    const error = useCallback((title, message) => {
        return addNotification({ type: 'error', title, message });
    }, [addNotification]);

    const warning = useCallback((title, message) => {
        return addNotification({ type: 'warning', title, message });
    }, [addNotification]);

    const info = useCallback((title, message) => {
        return addNotification({ type: 'info', title, message });
    }, [addNotification]);

    return (
        <NotificationContext.Provider value={{ addNotification, removeNotification, success, error, warning, info }}>
            {children}
            <NotificationContainer notifications={notifications} onRemove={removeNotification} />
        </NotificationContext.Provider>
    );
};

const NotificationContainer = ({ notifications, onRemove }) => {
    return (
        <div className="fixed top-4 right-4 z-[9999] space-y-3 max-w-sm w-full pointer-events-none">
            <AnimatePresence>
                {notifications.map((notification) => (
                    <Notification
                        key={notification.id}
                        notification={notification}
                        onClose={() => onRemove(notification.id)}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

const Notification = ({ notification, onClose }) => {
    const config = {
        success: {
            icon: CheckCircle2,
            color: 'brand-green',
            bg: 'bg-brand-green/10',
            border: 'border-brand-green/30'
        },
        error: {
            icon: AlertCircle,
            color: 'brand-red',
            bg: 'bg-brand-red/10',
            border: 'border-brand-red/30'
        },
        warning: {
            icon: AlertTriangle,
            color: 'brand-yellow',
            bg: 'bg-brand-yellow/10',
            border: 'border-brand-yellow/30'
        },
        info: {
            icon: Info,
            color: 'brand-blue',
            bg: 'bg-brand-blue/10',
            border: 'border-brand-blue/30'
        }
    };

    const { icon: Icon, color, bg, border } = config[notification.type] || config.info;

    return (
        <motion.div
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            className={`glass-panel rounded-xl p-4 border ${border} pointer-events-auto shadow-2xl`}
        >
            <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${bg} flex-shrink-0`}>
                    <Icon size={20} className={`text-${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-1">{notification.title}</h4>
                    {notification.message && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">{notification.message}</p>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-slate-50 dark:hover:bg-white/10 rounded transition-colors flex-shrink-0"
                >
                    <X size={16} className="text-slate-500 dark:text-slate-400" />
                </button>
            </div>
        </motion.div>
    );
};

export default NotificationProvider;

import { defineStore } from 'pinia';
import { ref } from 'vue';
export const useNotificationStore = defineStore('notification', () => {
    const notifications = ref([]);
    // Add notification
    const addNotification = (notification) => {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newNotification = {
            id,
            duration: 5000,
            ...notification,
        };
        notifications.value.push(newNotification);
        // Auto remove after duration
        if (newNotification.duration && newNotification.duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, newNotification.duration);
        }
        return id;
    };
    // Remove notification
    const removeNotification = (id) => {
        const index = notifications.value.findIndex((n) => n.id === id);
        if (index > -1) {
            notifications.value.splice(index, 1);
        }
    };
    // Clear all notifications
    const clearNotifications = () => {
        notifications.value = [];
    };
    // Helper methods
    const success = (message, title, duration) => {
        return addNotification({ type: 'success', message, title, duration });
    };
    const error = (message, title, duration) => {
        return addNotification({ type: 'error', message, title, duration });
    };
    const warning = (message, title, duration) => {
        return addNotification({ type: 'warning', message, title, duration });
    };
    const info = (message, title, duration) => {
        return addNotification({ type: 'info', message, title, duration });
    };
    return {
        notifications,
        addNotification,
        removeNotification,
        clearNotifications,
        success,
        error,
        warning,
        info,
    };
});

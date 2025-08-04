import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
  actions?: NotificationAction[]
}

export interface NotificationAction {
  label: string
  handler: () => void
}

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([])
  const timers = new Map<string, number>()

  // Add notification
  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    // Ensure duration is set properly - spread operator should come first
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 3000, // Use nullish coalescing to ensure 3000ms default
    }

    notifications.value.push(newNotification)

    // Auto remove after duration
    if (newNotification.duration && newNotification.duration > 0) {
      const timerId = window.setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
      
      // Store timer ID so we can clean it up if needed
      timers.set(id, timerId)
    }

    return id
  }

  // Remove notification
  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex((n) => n.id === id)
    if (index > -1) {
      // Clear any existing timer
      const timerId = timers.get(id)
      if (timerId) {
        window.clearTimeout(timerId)
        timers.delete(id)
      }
      
      // Use array assignment to ensure reactivity
      notifications.value = notifications.value.filter(n => n.id !== id)
    }
  }

  // Clear all notifications
  const clearNotifications = () => {
    // Clear all timers
    timers.forEach((timerId) => {
      window.clearTimeout(timerId)
    })
    timers.clear()
    
    notifications.value = []
  }

  // Helper methods
  const success = (message: string, title?: string, duration?: number) => {
    return addNotification({ type: 'success', message, title, duration })
  }

  const error = (message: string, title?: string, duration?: number) => {
    return addNotification({ type: 'error', message, title, duration })
  }

  const warning = (message: string, title?: string, duration?: number) => {
    return addNotification({ type: 'warning', message, title, duration })
  }

  const info = (message: string, title?: string, duration?: number) => {
    return addNotification({ type: 'info', message, title, duration })
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    success,
    error,
    warning,
    info,
  }
})

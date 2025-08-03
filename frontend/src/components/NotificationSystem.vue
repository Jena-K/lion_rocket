<template>
  <Teleport to="body">
    <div class="notification-container">
      <TransitionGroup name="notification" tag="div">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification"
          :class="notification.type"
        >
          <div class="notification-icon">
            <i>{{ getIcon(notification.type) }}</i>
          </div>

          <div class="notification-content">
            <h4 v-if="notification.title" class="notification-title">
              {{ notification.title }}
            </h4>
            <p class="notification-message">{{ notification.message }}</p>

            <div v-if="notification.actions" class="notification-actions">
              <button
                v-for="(action, index) in notification.actions"
                :key="index"
                @click="handleAction(action, notification.id)"
                class="notification-action"
              >
                {{ action.label }}
              </button>
            </div>
          </div>

          <button @click="removeNotification(notification.id)" class="notification-close">✕</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useNotificationStore } from '../stores/notification'
import type { NotificationAction } from '../stores/notification'

const notificationStore = useNotificationStore()
const { notifications } = storeToRefs(notificationStore)
const { removeNotification } = notificationStore

// Get icon for notification type
const getIcon = (type: string) => {
  switch (type) {
    case 'success':
      return '✅'
    case 'error':
      return '❌'
    case 'warning':
      return '⚠️'
    case 'info':
      return 'ℹ️'
    default:
      return '📢'
  }
}

// Handle notification action
const handleAction = (action: NotificationAction, notificationId: string) => {
  action.handler()
  removeNotification(notificationId)
}
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 3000;
  pointer-events: none;
}

.notification {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 1rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  min-width: 320px;
  max-width: 480px;
  pointer-events: all;
  border-left: 4px solid;
}

.notification.success {
  border-left-color: #48bb78;
}

.notification.error {
  border-left-color: #f56565;
}

.notification.warning {
  border-left-color: #ed8936;
}

.notification.info {
  border-left-color: #4299e1;
}

.notification-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
}

.notification-title {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
}

.notification-message {
  margin: 0;
  font-size: 0.875rem;
  color: #4a5568;
  line-height: 1.5;
}

.notification-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.notification-action {
  padding: 0.375rem 0.75rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.notification-action:hover {
  background: #5a67d8;
  transform: translateY(-1px);
}

.notification-close {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: #a0aec0;
  font-size: 1.25rem;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.notification-close:hover {
  background: #f7fafc;
  color: #4a5568;
}

/* Animations */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.notification-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.notification-move {
  transition: transform 0.3s ease;
}

/* Responsive */
@media (max-width: 640px) {
  .notification-container {
    left: 1rem;
    right: 1rem;
  }

  .notification {
    min-width: auto;
    max-width: none;
  }
}
</style>

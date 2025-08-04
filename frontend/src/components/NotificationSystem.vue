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
            <svg v-if="notification.type === 'success'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <svg v-else-if="notification.type === 'error'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <svg v-else-if="notification.type === 'warning'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
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

          <button @click="removeNotification(notification.id)" class="notification-close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
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

// Removed - now using inline SVG icons

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
  flex-shrink: 0;
  width: 24px;
  height: 24px;
}

.notification-icon svg {
  width: 100%;
  height: 100%;
}

.notification.success .notification-icon {
  color: #48bb78;
}

.notification.error .notification-icon {
  color: #f56565;
}

.notification.warning .notification-icon {
  color: #ed8936;
}

.notification.info .notification-icon {
  color: #4299e1;
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
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
  padding: 4px;
}

.notification-close svg {
  width: 16px;
  height: 16px;
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

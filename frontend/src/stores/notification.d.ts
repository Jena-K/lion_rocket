export interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    message: string;
    duration?: number;
    actions?: NotificationAction[];
}
export interface NotificationAction {
    label: string;
    handler: () => void;
}
export declare const useNotificationStore: import("pinia").StoreDefinition<"notification", Pick<{
    notifications: import("vue").Ref<{
        id: string;
        type: "success" | "error" | "warning" | "info";
        title?: string | undefined;
        message: string;
        duration?: number | undefined;
        actions?: {
            label: string;
            handler: () => void;
        }[] | undefined;
    }[], Notification[] | {
        id: string;
        type: "success" | "error" | "warning" | "info";
        title?: string | undefined;
        message: string;
        duration?: number | undefined;
        actions?: {
            label: string;
            handler: () => void;
        }[] | undefined;
    }[]>;
    addNotification: (notification: Omit<Notification, "id">) => string;
    removeNotification: (id: string) => void;
    clearNotifications: () => void;
    success: (message: string, title?: string, duration?: number) => string;
    error: (message: string, title?: string, duration?: number) => string;
    warning: (message: string, title?: string, duration?: number) => string;
    info: (message: string, title?: string, duration?: number) => string;
}, "notifications">, Pick<{
    notifications: import("vue").Ref<{
        id: string;
        type: "success" | "error" | "warning" | "info";
        title?: string | undefined;
        message: string;
        duration?: number | undefined;
        actions?: {
            label: string;
            handler: () => void;
        }[] | undefined;
    }[], Notification[] | {
        id: string;
        type: "success" | "error" | "warning" | "info";
        title?: string | undefined;
        message: string;
        duration?: number | undefined;
        actions?: {
            label: string;
            handler: () => void;
        }[] | undefined;
    }[]>;
    addNotification: (notification: Omit<Notification, "id">) => string;
    removeNotification: (id: string) => void;
    clearNotifications: () => void;
    success: (message: string, title?: string, duration?: number) => string;
    error: (message: string, title?: string, duration?: number) => string;
    warning: (message: string, title?: string, duration?: number) => string;
    info: (message: string, title?: string, duration?: number) => string;
}, never>, Pick<{
    notifications: import("vue").Ref<{
        id: string;
        type: "success" | "error" | "warning" | "info";
        title?: string | undefined;
        message: string;
        duration?: number | undefined;
        actions?: {
            label: string;
            handler: () => void;
        }[] | undefined;
    }[], Notification[] | {
        id: string;
        type: "success" | "error" | "warning" | "info";
        title?: string | undefined;
        message: string;
        duration?: number | undefined;
        actions?: {
            label: string;
            handler: () => void;
        }[] | undefined;
    }[]>;
    addNotification: (notification: Omit<Notification, "id">) => string;
    removeNotification: (id: string) => void;
    clearNotifications: () => void;
    success: (message: string, title?: string, duration?: number) => string;
    error: (message: string, title?: string, duration?: number) => string;
    warning: (message: string, title?: string, duration?: number) => string;
    info: (message: string, title?: string, duration?: number) => string;
}, "success" | "error" | "warning" | "info" | "addNotification" | "removeNotification" | "clearNotifications">>;

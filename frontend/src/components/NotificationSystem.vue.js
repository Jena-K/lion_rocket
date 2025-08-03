import { storeToRefs } from 'pinia';
import { useNotificationStore } from '../stores/notification';
const notificationStore = useNotificationStore();
const { notifications } = storeToRefs(notificationStore);
const { removeNotification } = notificationStore;
// Get icon for notification type
const getIcon = (type) => {
    switch (type) {
        case 'success':
            return '✅';
        case 'error':
            return '❌';
        case 'warning':
            return '⚠️';
        case 'info':
            return 'ℹ️';
        default:
            return '📢';
    }
};
// Handle notification action
const handleAction = (action, notificationId) => {
    action.handler();
    removeNotification(notificationId);
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['notification']} */ ;
/** @type {__VLS_StyleScopedClasses['notification']} */ ;
/** @type {__VLS_StyleScopedClasses['notification']} */ ;
/** @type {__VLS_StyleScopedClasses['notification']} */ ;
/** @type {__VLS_StyleScopedClasses['notification-action']} */ ;
/** @type {__VLS_StyleScopedClasses['notification-close']} */ ;
/** @type {__VLS_StyleScopedClasses['notification-container']} */ ;
/** @type {__VLS_StyleScopedClasses['notification']} */ ;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.Teleport;
/** @type {[typeof __VLS_components.Teleport, typeof __VLS_components.Teleport, ]} */ ;
// @ts-ignore
Teleport;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    to: "body",
}));
const __VLS_2 = __VLS_1({
    to: "body",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_4 } = __VLS_3.slots;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "notification-container" },
});
const __VLS_5 = {}.TransitionGroup;
/** @type {[typeof __VLS_components.TransitionGroup, typeof __VLS_components.TransitionGroup, ]} */ ;
// @ts-ignore
TransitionGroup;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
    name: "notification",
    tag: "div",
}));
const __VLS_7 = __VLS_6({
    name: "notification",
    tag: "div",
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
const { default: __VLS_9 } = __VLS_8.slots;
for (const [notification] of __VLS_getVForSourceType((__VLS_ctx.notifications))) {
    // @ts-ignore
    [notifications,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        key: (notification.id),
        ...{ class: "notification" },
        ...{ class: (notification.type) },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "notification-icon" },
    });
    __VLS_asFunctionalElement(__VLS_elements.i, __VLS_elements.i)({});
    (__VLS_ctx.getIcon(notification.type));
    // @ts-ignore
    [getIcon,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "notification-content" },
    });
    if (notification.title) {
        __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({
            ...{ class: "notification-title" },
        });
        (notification.title);
    }
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "notification-message" },
    });
    (notification.message);
    if (notification.actions) {
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "notification-actions" },
        });
        for (const [action, index] of __VLS_getVForSourceType((notification.actions))) {
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(notification.actions))
                            return;
                        __VLS_ctx.handleAction(action, notification.id);
                        // @ts-ignore
                        [handleAction,];
                    } },
                key: (index),
                ...{ class: "notification-action" },
            });
            (action.label);
        }
    }
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.removeNotification(notification.id);
                // @ts-ignore
                [removeNotification,];
            } },
        ...{ class: "notification-close" },
    });
}
var __VLS_8;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['notification-container']} */ ;
/** @type {__VLS_StyleScopedClasses['notification']} */ ;
/** @type {__VLS_StyleScopedClasses['notification-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['notification-content']} */ ;
/** @type {__VLS_StyleScopedClasses['notification-title']} */ ;
/** @type {__VLS_StyleScopedClasses['notification-message']} */ ;
/** @type {__VLS_StyleScopedClasses['notification-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['notification-action']} */ ;
/** @type {__VLS_StyleScopedClasses['notification-close']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            notifications: notifications,
            removeNotification: removeNotification,
            getIcon: getIcon,
            handleAction: handleAction,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
    },
});
; /* PartiallyEnd: #4569/main.vue */

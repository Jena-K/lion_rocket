import { storeToRefs } from 'pinia';
import { useNotificationStore } from '../stores/notification';
const notificationStore = useNotificationStore();
const { notifications } = storeToRefs(notificationStore);
const { removeNotification } = notificationStore;
// Removed - now using inline SVG icons
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
/** @type {__VLS_StyleScopedClasses['notification-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['notification']} */ ;
/** @type {__VLS_StyleScopedClasses['success']} */ ;
/** @type {__VLS_StyleScopedClasses['notification-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['notification']} */ ;
/** @type {__VLS_StyleScopedClasses['error']} */ ;
/** @type {__VLS_StyleScopedClasses['notification-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['notification']} */ ;
/** @type {__VLS_StyleScopedClasses['warning']} */ ;
/** @type {__VLS_StyleScopedClasses['notification-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['notification']} */ ;
/** @type {__VLS_StyleScopedClasses['info']} */ ;
/** @type {__VLS_StyleScopedClasses['notification-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['notification-action']} */ ;
/** @type {__VLS_StyleScopedClasses['notification-close']} */ ;
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
    if (notification.type === 'success') {
        __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "2",
        });
        __VLS_asFunctionalElement(__VLS_elements.path)({
            d: "M22 11.08V12a10 10 0 1 1-5.93-9.14",
        });
        __VLS_asFunctionalElement(__VLS_elements.polyline)({
            points: "22 4 12 14.01 9 11.01",
        });
    }
    else if (notification.type === 'error') {
        __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "2",
        });
        __VLS_asFunctionalElement(__VLS_elements.circle)({
            cx: "12",
            cy: "12",
            r: "10",
        });
        __VLS_asFunctionalElement(__VLS_elements.line)({
            x1: "15",
            y1: "9",
            x2: "9",
            y2: "15",
        });
        __VLS_asFunctionalElement(__VLS_elements.line)({
            x1: "9",
            y1: "9",
            x2: "15",
            y2: "15",
        });
    }
    else if (notification.type === 'warning') {
        __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "2",
        });
        __VLS_asFunctionalElement(__VLS_elements.path)({
            d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z",
        });
        __VLS_asFunctionalElement(__VLS_elements.line)({
            x1: "12",
            y1: "9",
            x2: "12",
            y2: "13",
        });
        __VLS_asFunctionalElement(__VLS_elements.line)({
            x1: "12",
            y1: "17",
            x2: "12.01",
            y2: "17",
        });
    }
    else {
        __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "2",
        });
        __VLS_asFunctionalElement(__VLS_elements.circle)({
            cx: "12",
            cy: "12",
            r: "10",
        });
        __VLS_asFunctionalElement(__VLS_elements.line)({
            x1: "12",
            y1: "16",
            x2: "12",
            y2: "12",
        });
        __VLS_asFunctionalElement(__VLS_elements.line)({
            x1: "12",
            y1: "8",
            x2: "12.01",
            y2: "8",
        });
    }
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
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "2",
    });
    __VLS_asFunctionalElement(__VLS_elements.line)({
        x1: "18",
        y1: "6",
        x2: "6",
        y2: "18",
    });
    __VLS_asFunctionalElement(__VLS_elements.line)({
        x1: "6",
        y1: "6",
        x2: "18",
        y2: "18",
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
            handleAction: handleAction,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
    },
});
; /* PartiallyEnd: #4569/main.vue */

import { ref, reactive, computed, watch, onMounted } from 'vue';
import { userService } from '../../services/user.service';
// State
const settings = reactive({
    theme: 'light',
    language: 'ko',
    notifications: true,
    email_updates: false,
    chat_history_limit: 50,
});
const originalSettings = ref(null);
const saving = ref(false);
const showDeleteModal = ref(false);
const showAccountDeleteModal = ref(false);
const deleteConfirmText = ref('');
// Toast
const toast = reactive({
    show: false,
    message: '',
    type: 'success',
});
// Theme options
const themes = [
    { value: 'light', label: '라이트', icon: '☀️' },
    { value: 'dark', label: '다크', icon: '🌙' },
    { value: 'auto', label: '자동', icon: '🌓' },
];
// Computed
const hasChanges = computed(() => {
    if (!originalSettings.value)
        return false;
    return JSON.stringify(settings) !== JSON.stringify(originalSettings.value);
});
// Methods
const showToast = (message, type = 'success') => {
    toast.message = message;
    toast.type = type;
    toast.show = true;
    setTimeout(() => {
        toast.show = false;
    }, 3000);
};
const loadSettings = () => {
    const saved = userService.getSettings();
    Object.assign(settings, saved);
    originalSettings.value = { ...saved };
};
const saveSettings = () => {
    if (!hasChanges.value)
        return;
    saving.value = true;
    try {
        userService.saveSettings(settings);
        originalSettings.value = { ...settings };
        showToast('설정이 저장되었습니다!', 'success');
    }
    catch (error) {
        showToast('설정 저장에 실패했습니다', 'error');
    }
    finally {
        saving.value = false;
    }
};
const deleteAllChats = async () => {
    try {
        // In a real app, you'd call an API endpoint to delete all chats
        showToast('모든 채팅이 삭제되었습니다', 'success');
        showDeleteModal.value = false;
    }
    catch (error) {
        showToast('채팅 삭제에 실패했습니다', 'error');
    }
};
const closeAccountDeleteModal = () => {
    showAccountDeleteModal.value = false;
    deleteConfirmText.value = '';
};
const deleteAccount = async () => {
    if (deleteConfirmText.value !== 'DELETE')
        return;
    try {
        // In a real app, you'd call an API endpoint to delete the account
        showToast('계정이 삭제되었습니다', 'success');
        // Logout and redirect to home
    }
    catch (error) {
        showToast('계정 삭제에 실패했습니다', 'error');
    }
};
// Watch theme changes
watch(() => settings.theme, (newTheme) => {
    if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
    }
    else {
        document.documentElement.classList.remove('dark');
    }
});
onMounted(() => {
    loadSettings();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-section']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-section']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-item']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-info']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-info']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-option']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-option']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-switch']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-slider']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-slider']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-slider']} */ ;
/** @type {__VLS_StyleScopedClasses['select-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['number-input']} */ ;
/** @type {__VLS_StyleScopedClasses['about-item']} */ ;
/** @type {__VLS_StyleScopedClasses['about-item']} */ ;
/** @type {__VLS_StyleScopedClasses['about-item']} */ ;
/** @type {__VLS_StyleScopedClasses['about-item']} */ ;
/** @type {__VLS_StyleScopedClasses['save-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['save-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['danger']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['confirm-input']} */ ;
/** @type {__VLS_StyleScopedClasses['toast']} */ ;
/** @type {__VLS_StyleScopedClasses['toast']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-item']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-info']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-control']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-option']} */ ;
/** @type {__VLS_StyleScopedClasses['toast']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "user-settings" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "subtitle" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "settings-container" },
});
__VLS_asFunctionalElement(__VLS_elements.section, __VLS_elements.section)({
    ...{ class: "settings-section" },
});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
__VLS_asFunctionalElement(__VLS_elements.i, __VLS_elements.i)({});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "setting-item" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "setting-info" },
});
__VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "setting-control" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "theme-selector" },
});
for (const [theme] of __VLS_getVForSourceType((__VLS_ctx.themes))) {
    // @ts-ignore
    [themes,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.settings.theme = theme.value;
                // @ts-ignore
                [settings,];
            } },
        key: (theme.value),
        ...{ class: "theme-option" },
        ...{ class: ({ active: __VLS_ctx.settings.theme === theme.value }) },
    });
    // @ts-ignore
    [settings,];
    __VLS_asFunctionalElement(__VLS_elements.i, __VLS_elements.i)({});
    (theme.icon);
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
    (theme.label);
}
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "setting-item" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "setting-info" },
});
__VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "setting-control" },
});
__VLS_asFunctionalElement(__VLS_elements.select, __VLS_elements.select)({
    value: (__VLS_ctx.settings.language),
    ...{ class: "select-input" },
});
// @ts-ignore
[settings,];
__VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
    value: "ko",
});
__VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
    value: "en",
});
__VLS_asFunctionalElement(__VLS_elements.section, __VLS_elements.section)({
    ...{ class: "settings-section" },
});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
__VLS_asFunctionalElement(__VLS_elements.i, __VLS_elements.i)({});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "setting-item" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "setting-info" },
});
__VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "setting-control" },
});
__VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
    ...{ class: "toggle-switch" },
});
__VLS_asFunctionalElement(__VLS_elements.input)({
    type: "checkbox",
});
(__VLS_ctx.settings.notifications);
// @ts-ignore
[settings,];
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "toggle-slider" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "setting-item" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "setting-info" },
});
__VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "setting-control" },
});
__VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
    ...{ class: "toggle-switch" },
});
__VLS_asFunctionalElement(__VLS_elements.input)({
    type: "checkbox",
});
(__VLS_ctx.settings.email_updates);
// @ts-ignore
[settings,];
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "toggle-slider" },
});
__VLS_asFunctionalElement(__VLS_elements.section, __VLS_elements.section)({
    ...{ class: "settings-section" },
});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
__VLS_asFunctionalElement(__VLS_elements.i, __VLS_elements.i)({});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "setting-item" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "setting-info" },
});
__VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "setting-control" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "number-input-wrapper" },
});
__VLS_asFunctionalElement(__VLS_elements.input)({
    type: "number",
    min: "10",
    max: "100",
    step: "10",
    ...{ class: "number-input" },
});
(__VLS_ctx.settings.chat_history_limit);
// @ts-ignore
[settings,];
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "input-suffix" },
});
__VLS_asFunctionalElement(__VLS_elements.section, __VLS_elements.section)({
    ...{ class: "settings-section" },
});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
__VLS_asFunctionalElement(__VLS_elements.i, __VLS_elements.i)({});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "setting-item" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "setting-info" },
});
__VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "setting-control" },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.showDeleteModal = true;
            // @ts-ignore
            [showDeleteModal,];
        } },
    ...{ class: "btn danger" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "setting-item" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "setting-info" },
});
__VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "setting-control" },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.showAccountDeleteModal = true;
            // @ts-ignore
            [showAccountDeleteModal,];
        } },
    ...{ class: "btn danger" },
});
__VLS_asFunctionalElement(__VLS_elements.section, __VLS_elements.section)({
    ...{ class: "settings-section" },
});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
__VLS_asFunctionalElement(__VLS_elements.i, __VLS_elements.i)({});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "about-content" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "about-item" },
});
__VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "about-item" },
});
__VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "about-item" },
});
__VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({});
__VLS_asFunctionalElement(__VLS_elements.a, __VLS_elements.a)({
    href: "mailto:support@lionrocket.com",
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "settings-footer" },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.saveSettings) },
    ...{ class: "save-btn" },
    disabled: (!__VLS_ctx.hasChanges),
});
// @ts-ignore
[saveSettings, hasChanges,];
(__VLS_ctx.saving ? '저장 중...' : '설정 저장');
// @ts-ignore
[saving,];
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
if (__VLS_ctx.showDeleteModal) {
    // @ts-ignore
    [showDeleteModal,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showDeleteModal))
                    return;
                __VLS_ctx.showDeleteModal = false;
                // @ts-ignore
                [showDeleteModal,];
            } },
        ...{ class: "modal-overlay" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ onClick: () => { } },
        ...{ class: "modal" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-header" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-body" },
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "warning" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-footer" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showDeleteModal))
                    return;
                __VLS_ctx.showDeleteModal = false;
                // @ts-ignore
                [showDeleteModal,];
            } },
        ...{ class: "btn secondary" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.deleteAllChats) },
        ...{ class: "btn danger" },
    });
    // @ts-ignore
    [deleteAllChats,];
}
var __VLS_3;
const __VLS_5 = {}.Teleport;
/** @type {[typeof __VLS_components.Teleport, typeof __VLS_components.Teleport, ]} */ ;
// @ts-ignore
Teleport;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
    to: "body",
}));
const __VLS_7 = __VLS_6({
    to: "body",
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
const { default: __VLS_9 } = __VLS_8.slots;
if (__VLS_ctx.showAccountDeleteModal) {
    // @ts-ignore
    [showAccountDeleteModal,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showAccountDeleteModal))
                    return;
                __VLS_ctx.showAccountDeleteModal = false;
                // @ts-ignore
                [showAccountDeleteModal,];
            } },
        ...{ class: "modal-overlay" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ onClick: () => { } },
        ...{ class: "modal" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-header" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-body" },
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "warning" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "confirm-input" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({});
    __VLS_asFunctionalElement(__VLS_elements.input)({
        value: (__VLS_ctx.deleteConfirmText),
        type: "text",
        placeholder: "DELETE",
        ...{ class: "form-input" },
    });
    // @ts-ignore
    [deleteConfirmText,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-footer" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.closeAccountDeleteModal) },
        ...{ class: "btn secondary" },
    });
    // @ts-ignore
    [closeAccountDeleteModal,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.deleteAccount) },
        ...{ class: "btn danger" },
        disabled: (__VLS_ctx.deleteConfirmText !== 'DELETE'),
    });
    // @ts-ignore
    [deleteConfirmText, deleteAccount,];
}
var __VLS_8;
const __VLS_10 = {}.Teleport;
/** @type {[typeof __VLS_components.Teleport, typeof __VLS_components.Teleport, ]} */ ;
// @ts-ignore
Teleport;
// @ts-ignore
const __VLS_11 = __VLS_asFunctionalComponent(__VLS_10, new __VLS_10({
    to: "body",
}));
const __VLS_12 = __VLS_11({
    to: "body",
}, ...__VLS_functionalComponentArgsRest(__VLS_11));
const { default: __VLS_14 } = __VLS_13.slots;
const __VLS_15 = {}.transition;
/** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
// @ts-ignore
Transition;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({
    name: "toast",
}));
const __VLS_17 = __VLS_16({
    name: "toast",
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
const { default: __VLS_19 } = __VLS_18.slots;
if (__VLS_ctx.toast.show) {
    // @ts-ignore
    [toast,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "toast" },
        ...{ class: (__VLS_ctx.toast.type) },
    });
    // @ts-ignore
    [toast,];
    (__VLS_ctx.toast.message);
    // @ts-ignore
    [toast,];
}
var __VLS_18;
var __VLS_13;
/** @type {__VLS_StyleScopedClasses['user-settings']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-container']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-section']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-item']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-info']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-control']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-option']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-item']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-info']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-control']} */ ;
/** @type {__VLS_StyleScopedClasses['select-input']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-section']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-item']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-info']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-control']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-switch']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-slider']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-item']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-info']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-control']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-switch']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-slider']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-section']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-item']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-info']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-control']} */ ;
/** @type {__VLS_StyleScopedClasses['number-input-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['number-input']} */ ;
/** @type {__VLS_StyleScopedClasses['input-suffix']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-section']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-item']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-info']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-control']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['danger']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-item']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-info']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-control']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['danger']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-section']} */ ;
/** @type {__VLS_StyleScopedClasses['about-content']} */ ;
/** @type {__VLS_StyleScopedClasses['about-item']} */ ;
/** @type {__VLS_StyleScopedClasses['about-item']} */ ;
/** @type {__VLS_StyleScopedClasses['about-item']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['save-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['modal']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['warning']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['danger']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['modal']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['warning']} */ ;
/** @type {__VLS_StyleScopedClasses['confirm-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['danger']} */ ;
/** @type {__VLS_StyleScopedClasses['toast']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            settings: settings,
            saving: saving,
            showDeleteModal: showDeleteModal,
            showAccountDeleteModal: showAccountDeleteModal,
            deleteConfirmText: deleteConfirmText,
            toast: toast,
            themes: themes,
            hasChanges: hasChanges,
            saveSettings: saveSettings,
            deleteAllChats: deleteAllChats,
            closeAccountDeleteModal: closeAccountDeleteModal,
            deleteAccount: deleteAccount,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
    },
});
; /* PartiallyEnd: #4569/main.vue */

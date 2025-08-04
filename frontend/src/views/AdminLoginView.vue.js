import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useNotificationStore } from '../stores/notification';
const router = useRouter();
const authStore = useAuthStore();
const isLoading = ref(false);
const rememberMe = ref(false);
const credentials = reactive({
    adminId: '',
    password: '',
});
const handleAdminLogin = async () => {
    if (isLoading.value)
        return;
    isLoading.value = true;
    try {
        // Call the real admin login API
        await authStore.adminLogin({
            adminId: credentials.adminId,
            password: credentials.password
        });
        if (rememberMe.value) {
            localStorage.setItem('rememberAdmin', 'true');
        }
        // Redirect to admin user management page
        await router.push('/admin/dashboard/users');
    }
    catch (error) {
        console.error('Admin login error:', error);
        // Show error notification
        const errorMessage = error.message || '관리자 로그인에 실패했습니다';
        const notificationStore = useNotificationStore();
        notificationStore.error('로그인 실패', errorMessage);
    }
    finally {
        isLoading.value = false;
    }
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['admin-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-header']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-header']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['input-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['remember-me']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-login-button']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-login-button']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-login-button']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-login-button']} */ ;
/** @type {__VLS_StyleScopedClasses['back-link']} */ ;
/** @type {__VLS_StyleScopedClasses['back-link']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-login-card']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-header']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-icon']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "admin-login-container" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "admin-login-card" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "admin-header" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "admin-icon" },
});
__VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    'stroke-width': "2",
});
__VLS_asFunctionalElement(__VLS_elements.path)({
    d: "M12 2L2 7L12 12L22 7L12 2Z",
});
__VLS_asFunctionalElement(__VLS_elements.path)({
    d: "M2 17L12 22L22 17",
});
__VLS_asFunctionalElement(__VLS_elements.path)({
    d: "M2 12L12 17L22 12",
});
__VLS_asFunctionalElement(__VLS_elements.h1, __VLS_elements.h1)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "logo-title" },
});
__VLS_asFunctionalElement(__VLS_elements.img)({
    src: "/lion_rocket_logo.png",
    alt: "LionRocket",
    ...{ class: "logo" },
});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.form, __VLS_elements.form)({
    ...{ onSubmit: (__VLS_ctx.handleAdminLogin) },
    ...{ class: "admin-form" },
});
// @ts-ignore
[handleAdminLogin,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
    for: "adminId",
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "input-wrapper" },
});
__VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
    ...{ class: "input-icon" },
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    'stroke-width': "2",
});
__VLS_asFunctionalElement(__VLS_elements.path)({
    d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2",
});
__VLS_asFunctionalElement(__VLS_elements.circle)({
    cx: "12",
    cy: "7",
    r: "4",
});
__VLS_asFunctionalElement(__VLS_elements.input)({
    id: "adminId",
    value: (__VLS_ctx.credentials.adminId),
    type: "text",
    placeholder: "관리자 ID를 입력하세요",
    required: true,
    disabled: (__VLS_ctx.isLoading),
});
// @ts-ignore
[credentials, isLoading,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
    for: "password",
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "input-wrapper" },
});
__VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
    ...{ class: "input-icon" },
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    'stroke-width': "2",
});
__VLS_asFunctionalElement(__VLS_elements.rect)({
    x: "3",
    y: "11",
    width: "18",
    height: "11",
    rx: "2",
    ry: "2",
});
__VLS_asFunctionalElement(__VLS_elements.path)({
    d: "M7 11V7a5 5 0 0 1 10 0v4",
});
__VLS_asFunctionalElement(__VLS_elements.input)({
    id: "password",
    type: "password",
    placeholder: "비밀번호를 입력하세요",
    required: true,
    disabled: (__VLS_ctx.isLoading),
});
(__VLS_ctx.credentials.password);
// @ts-ignore
[credentials, isLoading,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "form-options" },
});
__VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
    ...{ class: "remember-me" },
});
__VLS_asFunctionalElement(__VLS_elements.input)({
    type: "checkbox",
});
(__VLS_ctx.rememberMe);
// @ts-ignore
[rememberMe,];
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    type: "submit",
    ...{ class: "admin-login-button" },
    disabled: (__VLS_ctx.isLoading),
});
// @ts-ignore
[isLoading,];
if (__VLS_ctx.isLoading) {
    // @ts-ignore
    [isLoading,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "loading-spinner" },
    });
}
else {
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "2",
    });
    __VLS_asFunctionalElement(__VLS_elements.path)({
        d: "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4",
    });
    __VLS_asFunctionalElement(__VLS_elements.polyline)({
        points: "10 17 15 12 10 7",
    });
    __VLS_asFunctionalElement(__VLS_elements.line)({
        x1: "15",
        y1: "12",
        x2: "3",
        y2: "12",
    });
}
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "admin-footer" },
});
const __VLS_0 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
// @ts-ignore
RouterLink;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    to: "/login",
    ...{ class: "back-link" },
}));
const __VLS_2 = __VLS_1({
    to: "/login",
    ...{ class: "back-link" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_4 } = __VLS_3.slots;
__VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    'stroke-width': "2",
});
__VLS_asFunctionalElement(__VLS_elements.polyline)({
    points: "15 18 9 12 15 6",
});
var __VLS_3;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "decoration decoration-1" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "decoration decoration-2" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "decoration decoration-3" },
});
/** @type {__VLS_StyleScopedClasses['admin-login-container']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-login-card']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-header']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['logo-title']} */ ;
/** @type {__VLS_StyleScopedClasses['logo']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-form']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['input-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['input-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['input-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['input-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['form-options']} */ ;
/** @type {__VLS_StyleScopedClasses['remember-me']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-login-button']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-spinner']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['back-link']} */ ;
/** @type {__VLS_StyleScopedClasses['decoration']} */ ;
/** @type {__VLS_StyleScopedClasses['decoration-1']} */ ;
/** @type {__VLS_StyleScopedClasses['decoration']} */ ;
/** @type {__VLS_StyleScopedClasses['decoration-2']} */ ;
/** @type {__VLS_StyleScopedClasses['decoration']} */ ;
/** @type {__VLS_StyleScopedClasses['decoration-3']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            isLoading: isLoading,
            rememberMe: rememberMe,
            credentials: credentials,
            handleAdminLogin: handleAdminLogin,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
    },
});
; /* PartiallyEnd: #4569/main.vue */

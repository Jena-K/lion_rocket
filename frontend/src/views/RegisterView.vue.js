import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
const router = useRouter();
const authStore = useAuthStore();
const isLoading = ref(false);
const errorMessage = ref('');
const confirmPassword = ref('');
const formData = reactive({
    username: '',
    email: '',
    password: '',
});
const validatePassword = (password) => {
    // 최소 8자 이상
    if (password.length < 8)
        return false;
    // 대문자, 소문자, 숫자, 특수문자 중 3가지 이상 포함
    let criteria = 0;
    if (/[A-Z]/.test(password))
        criteria++;
    if (/[a-z]/.test(password))
        criteria++;
    if (/[0-9]/.test(password))
        criteria++;
    if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password))
        criteria++;
    return criteria >= 3;
};
const isFormValid = computed(() => {
    return (formData.username.length >= 3 &&
        formData.username.length <= 50 &&
        /^[a-zA-Z0-9_]+$/.test(formData.username) && // 영문, 숫자, 밑줄만
        formData.email.includes('@') &&
        validatePassword(formData.password) &&
        formData.password === confirmPassword.value);
});
const handleRegister = async () => {
    if (isLoading.value || !isFormValid.value)
        return;
    // 상세한 유효성 검사 메시지
    if (formData.username.length < 3 || formData.username.length > 50) {
        errorMessage.value = '사용자명은 3-50자 사이여야 합니다.';
        return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        errorMessage.value = '사용자명은 영문, 숫자, 밑줄(_)만 사용 가능합니다.';
        return;
    }
    if (!formData.email.includes('@')) {
        errorMessage.value = '올바른 이메일 형식이 아닙니다.';
        return;
    }
    if (!validatePassword(formData.password)) {
        errorMessage.value = '비밀번호는 8자 이상이며, 대문자, 소문자, 숫자, 특수문자 중 3가지 이상을 포함해야 합니다.';
        return;
    }
    if (formData.password !== confirmPassword.value) {
        errorMessage.value = '비밀번호가 일치하지 않습니다.';
        return;
    }
    errorMessage.value = '';
    isLoading.value = true;
    try {
        await authStore.register(formData);
        router.push('/');
    }
    catch (error) {
        // 백엔드에서 온 구체적인 에러 메시지 표시
        if (error.response?.data?.detail) {
            errorMessage.value = error.response.data.detail;
        }
        else {
            errorMessage.value = error.message || '회원가입에 실패했습니다.';
        }
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
/** @type {__VLS_StyleScopedClasses['register-container']} */ ;
/** @type {__VLS_StyleScopedClasses['register-header']} */ ;
/** @type {__VLS_StyleScopedClasses['register-header']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['register-button']} */ ;
/** @type {__VLS_StyleScopedClasses['register-button']} */ ;
/** @type {__VLS_StyleScopedClasses['register-button']} */ ;
/** @type {__VLS_StyleScopedClasses['register-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['register-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['register-footer']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "register-container" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "register-card" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "register-header" },
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
    ...{ onSubmit: (__VLS_ctx.handleRegister) },
    ...{ class: "register-form" },
});
// @ts-ignore
[handleRegister,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
    for: "username",
});
__VLS_asFunctionalElement(__VLS_elements.input)({
    id: "username",
    value: (__VLS_ctx.formData.username),
    type: "text",
    required: true,
    disabled: (__VLS_ctx.isLoading),
    autocomplete: "username",
    minlength: "3",
    maxlength: "20",
});
// @ts-ignore
[formData, isLoading,];
__VLS_asFunctionalElement(__VLS_elements.small, __VLS_elements.small)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
    for: "email",
});
__VLS_asFunctionalElement(__VLS_elements.input)({
    id: "email",
    type: "email",
    required: true,
    disabled: (__VLS_ctx.isLoading),
    autocomplete: "email",
});
(__VLS_ctx.formData.email);
// @ts-ignore
[formData, isLoading,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
    for: "password",
});
__VLS_asFunctionalElement(__VLS_elements.input)({
    id: "password",
    type: "password",
    required: true,
    disabled: (__VLS_ctx.isLoading),
    autocomplete: "new-password",
    minlength: "8",
});
(__VLS_ctx.formData.password);
// @ts-ignore
[formData, isLoading,];
__VLS_asFunctionalElement(__VLS_elements.small, __VLS_elements.small)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
    for: "confirmPassword",
});
__VLS_asFunctionalElement(__VLS_elements.input)({
    id: "confirmPassword",
    type: "password",
    required: true,
    disabled: (__VLS_ctx.isLoading),
    autocomplete: "new-password",
});
(__VLS_ctx.confirmPassword);
// @ts-ignore
[isLoading, confirmPassword,];
if (__VLS_ctx.errorMessage) {
    // @ts-ignore
    [errorMessage,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "error-message" },
    });
    (__VLS_ctx.errorMessage);
    // @ts-ignore
    [errorMessage,];
}
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    type: "submit",
    ...{ class: "register-button" },
    disabled: (__VLS_ctx.isLoading || !__VLS_ctx.isFormValid),
});
// @ts-ignore
[isLoading, isFormValid,];
if (__VLS_ctx.isLoading) {
    // @ts-ignore
    [isLoading,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
}
else {
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
}
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "register-footer" },
});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
const __VLS_0 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
// @ts-ignore
RouterLink;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    to: "/login",
}));
const __VLS_2 = __VLS_1({
    to: "/login",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_4 } = __VLS_3.slots;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['register-container']} */ ;
/** @type {__VLS_StyleScopedClasses['register-card']} */ ;
/** @type {__VLS_StyleScopedClasses['register-header']} */ ;
/** @type {__VLS_StyleScopedClasses['logo-title']} */ ;
/** @type {__VLS_StyleScopedClasses['logo']} */ ;
/** @type {__VLS_StyleScopedClasses['register-form']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['error-message']} */ ;
/** @type {__VLS_StyleScopedClasses['register-button']} */ ;
/** @type {__VLS_StyleScopedClasses['register-footer']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            isLoading: isLoading,
            errorMessage: errorMessage,
            confirmPassword: confirmPassword,
            formData: formData,
            isFormValid: isFormValid,
            handleRegister: handleRegister,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
    },
});
; /* PartiallyEnd: #4569/main.vue */

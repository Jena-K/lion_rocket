import { ref, reactive, computed, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { userService } from '../../services/user.service';
const authStore = useAuthStore();
// State
const user = ref(authStore.user);
const stats = ref(null);
const isEditing = ref(false);
const saving = ref(false);
const changingPassword = ref(false);
// Forms
const editForm = reactive({
    email: user.value?.email || '',
});
const passwordForm = reactive({
    current_password: '',
    new_password: '',
    confirm_password: '',
});
// Toast
const toast = reactive({
    show: false,
    message: '',
    type: 'success',
});
// Computed
const userInitial = computed(() => {
    return user.value?.username?.charAt(0).toUpperCase() || '?';
});
// Methods
const formatDate = (dateString) => {
    if (!dateString)
        return '-';
    return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};
const formatTokens = (value) => {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(2)}M`;
    }
    else if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
};
const showToast = (message, type = 'success') => {
    toast.message = message;
    toast.type = type;
    toast.show = true;
    setTimeout(() => {
        toast.show = false;
    }, 3000);
};
const updateProfile = async () => {
    saving.value = true;
    try {
        const updated = await userService.updateProfile({
            email: editForm.email,
        });
        user.value = updated;
        await authStore.getCurrentUser(); // Update auth store
        isEditing.value = false;
        showToast('프로필이 업데이트되었습니다!', 'success');
    }
    catch (error) {
        showToast(error.response?.data?.detail || '프로필 업데이트 실패', 'error');
    }
    finally {
        saving.value = false;
    }
};
const changePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
        showToast('새 비밀번호가 일치하지 않습니다', 'error');
        return;
    }
    changingPassword.value = true;
    try {
        await userService.updatePassword({
            current_password: passwordForm.current_password,
            new_password: passwordForm.new_password,
        });
        // Clear form
        passwordForm.current_password = '';
        passwordForm.new_password = '';
        passwordForm.confirm_password = '';
        showToast('비밀번호가 변경되었습니다!', 'success');
    }
    catch (error) {
        showToast(error.response?.data?.detail || '비밀번호 변경 실패', 'error');
    }
    finally {
        changingPassword.value = false;
    }
};
const fetchStats = async () => {
    try {
        stats.value = await userService.getStats();
    }
    catch (error) {
        console.error('Failed to fetch stats:', error);
    }
};
onMounted(() => {
    fetchStats();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-info']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['badge']} */ ;
/** @type {__VLS_StyleScopedClasses['badge']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['password-card']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['toast']} */ ;
/** @type {__VLS_StyleScopedClasses['toast']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-header']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-section']} */ ;
/** @type {__VLS_StyleScopedClasses['info-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['form-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['toast']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "user-profile" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "subtitle" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "profile-card" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "profile-header" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "avatar-section" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "avatar-large" },
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
(__VLS_ctx.userInitial);
// @ts-ignore
[userInitial,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "avatar-info" },
});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
(__VLS_ctx.user?.username);
// @ts-ignore
[user,];
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
(__VLS_ctx.user?.email);
// @ts-ignore
[user,];
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "member-since" },
});
__VLS_asFunctionalElement(__VLS_elements.i, __VLS_elements.i)({});
(__VLS_ctx.formatDate(__VLS_ctx.user?.created_at));
// @ts-ignore
[user, formatDate,];
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.isEditing = !__VLS_ctx.isEditing;
            // @ts-ignore
            [isEditing, isEditing,];
        } },
    ...{ class: "edit-btn" },
});
(__VLS_ctx.isEditing ? '취소' : '프로필 수정');
// @ts-ignore
[isEditing,];
if (!__VLS_ctx.isEditing) {
    // @ts-ignore
    [isEditing,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "profile-info" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "info-grid" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "info-item" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({});
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
    (__VLS_ctx.user?.username);
    // @ts-ignore
    [user,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "info-item" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({});
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
    (__VLS_ctx.user?.email);
    // @ts-ignore
    [user,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "info-item" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({});
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "badge" },
        ...{ class: (__VLS_ctx.user?.is_admin ? 'admin' : 'user') },
    });
    // @ts-ignore
    [user,];
    (__VLS_ctx.user?.is_admin ? '관리자' : '일반 사용자');
    // @ts-ignore
    [user,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "info-item" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({});
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
    (__VLS_ctx.formatDate(__VLS_ctx.user?.created_at));
    // @ts-ignore
    [user, formatDate,];
}
else {
    __VLS_asFunctionalElement(__VLS_elements.form, __VLS_elements.form)({
        ...{ onSubmit: (__VLS_ctx.updateProfile) },
        ...{ class: "edit-form" },
    });
    // @ts-ignore
    [updateProfile,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        for: "email",
    });
    __VLS_asFunctionalElement(__VLS_elements.input)({
        id: "email",
        type: "email",
        ...{ class: "form-input" },
        required: true,
    });
    (__VLS_ctx.editForm.email);
    // @ts-ignore
    [editForm,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "form-actions" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(!__VLS_ctx.isEditing))
                    return;
                __VLS_ctx.isEditing = false;
                // @ts-ignore
                [isEditing,];
            } },
        type: "button",
        ...{ class: "btn secondary" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        type: "submit",
        ...{ class: "btn primary" },
        disabled: (__VLS_ctx.saving),
    });
    // @ts-ignore
    [saving,];
    (__VLS_ctx.saving ? '저장 중...' : '변경사항 저장');
    // @ts-ignore
    [saving,];
}
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "password-card" },
});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "card-subtitle" },
});
__VLS_asFunctionalElement(__VLS_elements.form, __VLS_elements.form)({
    ...{ onSubmit: (__VLS_ctx.changePassword) },
    ...{ class: "password-form" },
});
// @ts-ignore
[changePassword,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
    for: "current_password",
});
__VLS_asFunctionalElement(__VLS_elements.input)({
    id: "current_password",
    type: "password",
    ...{ class: "form-input" },
    required: true,
});
(__VLS_ctx.passwordForm.current_password);
// @ts-ignore
[passwordForm,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
    for: "new_password",
});
__VLS_asFunctionalElement(__VLS_elements.input)({
    id: "new_password",
    type: "password",
    ...{ class: "form-input" },
    required: true,
    minlength: "8",
});
(__VLS_ctx.passwordForm.new_password);
// @ts-ignore
[passwordForm,];
__VLS_asFunctionalElement(__VLS_elements.small, __VLS_elements.small)({
    ...{ class: "help-text" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
    for: "confirm_password",
});
__VLS_asFunctionalElement(__VLS_elements.input)({
    id: "confirm_password",
    type: "password",
    ...{ class: "form-input" },
    required: true,
});
(__VLS_ctx.passwordForm.confirm_password);
// @ts-ignore
[passwordForm,];
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    type: "submit",
    ...{ class: "btn primary" },
    disabled: (__VLS_ctx.changingPassword),
});
// @ts-ignore
[changingPassword,];
(__VLS_ctx.changingPassword ? '변경 중...' : '비밀번호 변경');
// @ts-ignore
[changingPassword,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "quick-stats" },
});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "stats-grid" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "stat-card" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "stat-icon" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "stat-content" },
});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "stat-value" },
});
(__VLS_ctx.stats?.total_chats || 0);
// @ts-ignore
[stats,];
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "stat-label" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "stat-card" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "stat-icon" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "stat-content" },
});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "stat-value" },
});
(__VLS_ctx.stats?.total_messages || 0);
// @ts-ignore
[stats,];
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "stat-label" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "stat-card" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "stat-icon" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "stat-content" },
});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "stat-value" },
});
(__VLS_ctx.formatTokens(__VLS_ctx.stats?.total_tokens_used || 0));
// @ts-ignore
[stats, formatTokens,];
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "stat-label" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "stat-card" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "stat-icon" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "stat-content" },
});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "stat-value" },
});
(__VLS_ctx.stats?.active_days || 0);
// @ts-ignore
[stats,];
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "stat-label" },
});
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
const __VLS_5 = {}.transition;
/** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
// @ts-ignore
Transition;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
    name: "toast",
}));
const __VLS_7 = __VLS_6({
    name: "toast",
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
const { default: __VLS_9 } = __VLS_8.slots;
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
var __VLS_8;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['user-profile']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-card']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-header']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-section']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-large']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-info']} */ ;
/** @type {__VLS_StyleScopedClasses['member-since']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-info']} */ ;
/** @type {__VLS_StyleScopedClasses['info-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['badge']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-form']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['password-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['password-form']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['help-text']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-content']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-content']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-content']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-content']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['toast']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            user: user,
            stats: stats,
            isEditing: isEditing,
            saving: saving,
            changingPassword: changingPassword,
            editForm: editForm,
            passwordForm: passwordForm,
            toast: toast,
            userInitial: userInitial,
            formatDate: formatDate,
            formatTokens: formatTokens,
            updateProfile: updateProfile,
            changePassword: changePassword,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
    },
});
; /* PartiallyEnd: #4569/main.vue */

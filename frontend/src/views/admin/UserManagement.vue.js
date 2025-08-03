import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { adminService } from '../../services/admin.service';
const authStore = useAuthStore();
// State
const users = ref([]);
const loading = ref(false);
const error = ref('');
const currentPage = ref(1);
const totalPages = ref(1);
const totalUsers = ref(0);
const searchQuery = ref('');
const selectedUser = ref(null);
const userToDelete = ref(null);
const limit = 20;
// Format helpers
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
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
// Fetch users
const fetchUsers = async () => {
    loading.value = true;
    error.value = '';
    try {
        const response = await adminService.getUsers(currentPage.value, limit);
        users.value = response.items;
        totalUsers.value = response.total;
        totalPages.value = response.pages;
    }
    catch (err) {
        error.value = err.response?.data?.detail || '사용자 목록을 불러오는 중 오류가 발생했습니다.';
    }
    finally {
        loading.value = false;
    }
};
// Search handling
const handleSearch = () => {
    // In a real app, you'd implement server-side search
    // For now, we'll just refetch the first page
    currentPage.value = 1;
    fetchUsers();
};
// Pagination
const changePage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
        fetchUsers();
    }
};
// User actions
const viewUserDetail = (user) => {
    selectedUser.value = user;
};
const closeModal = () => {
    selectedUser.value = null;
};
const toggleAdmin = async (user) => {
    try {
        const updatedUser = await adminService.toggleAdminStatus(user.id);
        // Update user in list
        const index = users.value.findIndex((u) => u.id === user.id);
        if (index !== -1) {
            users.value[index] = { ...users.value[index], is_admin: updatedUser.is_admin };
        }
    }
    catch (err) {
        alert(err.response?.data?.detail || '권한 변경 중 오류가 발생했습니다.');
    }
};
const confirmDelete = (user) => {
    userToDelete.value = user;
};
const deleteUser = async () => {
    if (!userToDelete.value)
        return;
    try {
        await adminService.deleteUser(userToDelete.value.id);
        // Remove from list
        users.value = users.value.filter((u) => u.id !== userToDelete.value.id);
        userToDelete.value = null;
        // Refetch if page is now empty
        if (users.value.length === 0 && currentPage.value > 1) {
            currentPage.value--;
            fetchUsers();
        }
    }
    catch (err) {
        alert(err.response?.data?.detail || '사용자 삭제 중 오류가 발생했습니다.');
    }
};
const viewUserChats = (user) => {
    // TODO: Implement user chats view
    alert(`${user.username}의 채팅 기록 보기 - 준비 중`);
};
const viewUserUsage = (user) => {
    // TODO: Implement user usage statistics view
    alert(`${user.username}의 사용량 통계 보기 - 준비 중`);
};
onMounted(() => {
    fetchUsers();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['users-table']} */ ;
/** @type {__VLS_StyleScopedClasses['users-table']} */ ;
/** @type {__VLS_StyleScopedClasses['users-table']} */ ;
/** @type {__VLS_StyleScopedClasses['users-table']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['view-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['delete-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['page-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['danger']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['users-table']} */ ;
/** @type {__VLS_StyleScopedClasses['users-table']} */ ;
/** @type {__VLS_StyleScopedClasses['users-table']} */ ;
/** @type {__VLS_StyleScopedClasses['action-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-grid']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "user-management" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "header-actions" },
});
__VLS_asFunctionalElement(__VLS_elements.input)({
    ...{ onInput: (__VLS_ctx.handleSearch) },
    value: (__VLS_ctx.searchQuery),
    type: "text",
    placeholder: "사용자 검색...",
    ...{ class: "search-input" },
});
// @ts-ignore
[handleSearch, searchQuery,];
if (__VLS_ctx.loading && !__VLS_ctx.users.length) {
    // @ts-ignore
    [loading, users,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "loading-state" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "spinner" },
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
}
else if (__VLS_ctx.error) {
    // @ts-ignore
    [error,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "error-state" },
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
    (__VLS_ctx.error);
    // @ts-ignore
    [error,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.fetchUsers) },
        ...{ class: "retry-btn" },
    });
    // @ts-ignore
    [fetchUsers,];
}
else if (__VLS_ctx.users.length > 0) {
    // @ts-ignore
    [users,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "users-container" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "table-wrapper" },
    });
    __VLS_asFunctionalElement(__VLS_elements.table, __VLS_elements.table)({
        ...{ class: "users-table" },
    });
    __VLS_asFunctionalElement(__VLS_elements.thead, __VLS_elements.thead)({});
    __VLS_asFunctionalElement(__VLS_elements.tr, __VLS_elements.tr)({});
    __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
    __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
    __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
    __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
    __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
    __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
    __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
    __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
    __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
    __VLS_asFunctionalElement(__VLS_elements.tbody, __VLS_elements.tbody)({});
    for (const [user] of __VLS_getVForSourceType((__VLS_ctx.users))) {
        // @ts-ignore
        [users,];
        __VLS_asFunctionalElement(__VLS_elements.tr, __VLS_elements.tr)({
            key: (user.id),
        });
        __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
        (user.id);
        __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "user-info" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
        (user.username);
        __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
        (user.email);
        __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: (['badge', user.is_admin ? 'badge-admin' : 'badge-user']) },
        });
        (user.is_admin ? '관리자' : '일반 사용자');
        __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
        (__VLS_ctx.formatDate(user.created_at));
        // @ts-ignore
        [formatDate,];
        __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
        (user.total_chats || 0);
        __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
        (__VLS_ctx.formatTokens(user.total_tokens || 0));
        // @ts-ignore
        [formatTokens,];
        __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
        (user.last_active ? __VLS_ctx.formatDate(user.last_active) : '-');
        // @ts-ignore
        [formatDate,];
        __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "action-buttons" },
        });
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading && !__VLS_ctx.users.length))
                        return;
                    if (!!(__VLS_ctx.error))
                        return;
                    if (!(__VLS_ctx.users.length > 0))
                        return;
                    __VLS_ctx.viewUserDetail(user);
                    // @ts-ignore
                    [viewUserDetail,];
                } },
            ...{ class: "action-btn view-btn" },
            title: "상세 보기",
        });
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading && !__VLS_ctx.users.length))
                        return;
                    if (!!(__VLS_ctx.error))
                        return;
                    if (!(__VLS_ctx.users.length > 0))
                        return;
                    __VLS_ctx.toggleAdmin(user);
                    // @ts-ignore
                    [toggleAdmin,];
                } },
            ...{ class: "action-btn admin-btn" },
            disabled: (user.id === __VLS_ctx.authStore.user?.id),
            title: (user.is_admin ? '관리자 권한 해제' : '관리자 권한 부여'),
        });
        // @ts-ignore
        [authStore,];
        (user.is_admin ? '👤' : '👑');
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading && !__VLS_ctx.users.length))
                        return;
                    if (!!(__VLS_ctx.error))
                        return;
                    if (!(__VLS_ctx.users.length > 0))
                        return;
                    __VLS_ctx.confirmDelete(user);
                    // @ts-ignore
                    [confirmDelete,];
                } },
            ...{ class: "action-btn delete-btn" },
            disabled: (user.id === __VLS_ctx.authStore.user?.id),
            title: "삭제",
        });
        // @ts-ignore
        [authStore,];
    }
    if (__VLS_ctx.totalPages > 1) {
        // @ts-ignore
        [totalPages,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "pagination" },
        });
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading && !__VLS_ctx.users.length))
                        return;
                    if (!!(__VLS_ctx.error))
                        return;
                    if (!(__VLS_ctx.users.length > 0))
                        return;
                    if (!(__VLS_ctx.totalPages > 1))
                        return;
                    __VLS_ctx.changePage(__VLS_ctx.currentPage - 1);
                    // @ts-ignore
                    [changePage, currentPage,];
                } },
            disabled: (__VLS_ctx.currentPage === 1),
            ...{ class: "page-btn" },
        });
        // @ts-ignore
        [currentPage,];
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "page-info" },
        });
        (__VLS_ctx.currentPage);
        (__VLS_ctx.totalPages);
        // @ts-ignore
        [totalPages, currentPage,];
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading && !__VLS_ctx.users.length))
                        return;
                    if (!!(__VLS_ctx.error))
                        return;
                    if (!(__VLS_ctx.users.length > 0))
                        return;
                    if (!(__VLS_ctx.totalPages > 1))
                        return;
                    __VLS_ctx.changePage(__VLS_ctx.currentPage + 1);
                    // @ts-ignore
                    [changePage, currentPage,];
                } },
            disabled: (__VLS_ctx.currentPage === __VLS_ctx.totalPages),
            ...{ class: "page-btn" },
        });
        // @ts-ignore
        [totalPages, currentPage,];
    }
}
else {
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "empty-state" },
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
}
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
if (__VLS_ctx.selectedUser) {
    // @ts-ignore
    [selectedUser,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ onClick: (__VLS_ctx.closeModal) },
        ...{ class: "modal-overlay" },
    });
    // @ts-ignore
    [closeModal,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ onClick: () => { } },
        ...{ class: "modal" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-header" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.closeModal) },
        ...{ class: "close-btn" },
    });
    // @ts-ignore
    [closeModal,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-body" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "detail-grid" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "detail-item" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({});
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
    (__VLS_ctx.selectedUser.id);
    // @ts-ignore
    [selectedUser,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "detail-item" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({});
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
    (__VLS_ctx.selectedUser.username);
    // @ts-ignore
    [selectedUser,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "detail-item" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({});
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
    (__VLS_ctx.selectedUser.email);
    // @ts-ignore
    [selectedUser,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "detail-item" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({});
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: (['badge', __VLS_ctx.selectedUser.is_admin ? 'badge-admin' : 'badge-user']) },
    });
    // @ts-ignore
    [selectedUser,];
    (__VLS_ctx.selectedUser.is_admin ? '관리자' : '일반 사용자');
    // @ts-ignore
    [selectedUser,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "detail-item" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({});
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
    (__VLS_ctx.formatDate(__VLS_ctx.selectedUser.created_at));
    // @ts-ignore
    [formatDate, selectedUser,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "detail-item" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({});
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
    (__VLS_ctx.selectedUser.total_chats || 0);
    // @ts-ignore
    [selectedUser,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "detail-item" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({});
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
    (__VLS_ctx.formatTokens(__VLS_ctx.selectedUser.total_tokens || 0));
    // @ts-ignore
    [formatTokens, selectedUser,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "detail-item" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({});
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
    (__VLS_ctx.selectedUser.last_active ? __VLS_ctx.formatDate(__VLS_ctx.selectedUser.last_active) : '없음');
    // @ts-ignore
    [formatDate, selectedUser, selectedUser,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-actions" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.selectedUser))
                    return;
                __VLS_ctx.viewUserChats(__VLS_ctx.selectedUser);
                // @ts-ignore
                [selectedUser, viewUserChats,];
            } },
        ...{ class: "modal-btn primary" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.selectedUser))
                    return;
                __VLS_ctx.viewUserUsage(__VLS_ctx.selectedUser);
                // @ts-ignore
                [selectedUser, viewUserUsage,];
            } },
        ...{ class: "modal-btn secondary" },
    });
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
if (__VLS_ctx.userToDelete) {
    // @ts-ignore
    [userToDelete,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.userToDelete))
                    return;
                __VLS_ctx.userToDelete = null;
                // @ts-ignore
                [userToDelete,];
            } },
        ...{ class: "modal-overlay" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ onClick: () => { } },
        ...{ class: "modal confirm-modal" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-header" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-body" },
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "confirm-message" },
    });
    __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
    (__VLS_ctx.userToDelete.username);
    // @ts-ignore
    [userToDelete,];
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "warning-message" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-footer" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.userToDelete))
                    return;
                __VLS_ctx.userToDelete = null;
                // @ts-ignore
                [userToDelete,];
            } },
        ...{ class: "modal-btn secondary" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.deleteUser) },
        ...{ class: "modal-btn danger" },
    });
    // @ts-ignore
    [deleteUser,];
}
var __VLS_8;
/** @type {__VLS_StyleScopedClasses['user-management']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-state']} */ ;
/** @type {__VLS_StyleScopedClasses['spinner']} */ ;
/** @type {__VLS_StyleScopedClasses['error-state']} */ ;
/** @type {__VLS_StyleScopedClasses['retry-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['users-container']} */ ;
/** @type {__VLS_StyleScopedClasses['table-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['users-table']} */ ;
/** @type {__VLS_StyleScopedClasses['user-info']} */ ;
/** @type {__VLS_StyleScopedClasses['action-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['view-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['delete-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination']} */ ;
/** @type {__VLS_StyleScopedClasses['page-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['page-info']} */ ;
/** @type {__VLS_StyleScopedClasses['page-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['modal']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['close-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['modal']} */ ;
/** @type {__VLS_StyleScopedClasses['confirm-modal']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['confirm-message']} */ ;
/** @type {__VLS_StyleScopedClasses['warning-message']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['danger']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            authStore: authStore,
            users: users,
            loading: loading,
            error: error,
            currentPage: currentPage,
            totalPages: totalPages,
            searchQuery: searchQuery,
            selectedUser: selectedUser,
            userToDelete: userToDelete,
            formatDate: formatDate,
            formatTokens: formatTokens,
            fetchUsers: fetchUsers,
            handleSearch: handleSearch,
            changePage: changePage,
            viewUserDetail: viewUserDetail,
            closeModal: closeModal,
            toggleAdmin: toggleAdmin,
            confirmDelete: confirmDelete,
            deleteUser: deleteUser,
            viewUserChats: viewUserChats,
            viewUserUsage: viewUserUsage,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
    },
});
; /* PartiallyEnd: #4569/main.vue */

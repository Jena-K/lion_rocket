import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useNotificationStore } from '../../stores/notification';
import { adminService } from '../../services/admin.service';
const authStore = useAuthStore();
const notificationStore = useNotificationStore();
// State
const users = ref([]);
const loading = ref(false);
const error = ref('');
const currentPage = ref(1);
const totalPages = ref(1);
const totalUsers = ref(0);
const searchQuery = ref('');
const userToDelete = ref(null);
const limit = 20;
// Format helpers
const formatDate = (dateString) => {
    if (!dateString)
        return '-';
    try {
        const date = new Date(dateString);
        // Check if date is valid
        if (isNaN(date.getTime())) {
            return '-';
        }
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    }
    catch (error) {
        console.error('Date formatting error:', error, 'for date:', dateString);
        return '-';
    }
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
// Fetch users from real API
const fetchUsers = async () => {
    loading.value = true;
    error.value = '';
    try {
        const response = await adminService.getUsers(currentPage.value, limit);
        users.value = response.items;
        totalUsers.value = response.total;
        totalPages.value = response.pages;
        currentPage.value = response.page;
    }
    catch (err) {
        console.error('Error fetching users:', err);
        error.value = err.response?.data?.detail || '사용자 목록을 불러오는 중 오류가 발생했습니다.';
    }
    finally {
        loading.value = false;
    }
};
// Search handling
const handleSearch = () => {
    // Reset to first page when searching
    currentPage.value = 1;
    fetchUsers();
};
// Debounced search to avoid too many API calls
let searchTimeout = null;
const debouncedSearch = () => {
    if (searchTimeout)
        clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        handleSearch();
    }, 500);
};
// Pagination
const changePage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
        fetchUsers();
    }
};
// User actions
const toggleAdmin = async (user) => {
    try {
        const updatedUser = await adminService.toggleAdminStatus(user.user_id);
        // Update the user in the current view with the complete updated user data
        const index = users.value.findIndex((u) => u.user_id === user.user_id);
        if (index !== -1) {
            // Ensure all properties are properly updated
            users.value[index] = {
                ...updatedUser,
                // Ensure date fields are properly formatted
                created_at: updatedUser.created_at,
                updated_at: updatedUser.updated_at,
                last_active: updatedUser.last_active,
            };
        }
        // Show success message
        const message = updatedUser.is_admin
            ? `${updatedUser.username}님에게 관리자 권한을 부여했습니다.`
            : `${updatedUser.username}님의 관리자 권한을 해제했습니다.`;
        notificationStore.success(message);
    }
    catch (err) {
        console.error('Error toggling admin status:', err);
        const errorMessage = err.response?.data?.detail || '권한 변경 중 오류가 발생했습니다.';
        notificationStore.error(errorMessage);
    }
};
const confirmDelete = (user) => {
    userToDelete.value = user;
};
const deleteUser = async () => {
    if (!userToDelete.value)
        return;
    try {
        await adminService.deleteUser(userToDelete.value.user_id);
        // Show success message
        notificationStore.success(`${userToDelete.value.username} 사용자가 삭제되었습니다.`);
        userToDelete.value = null;
        // Refetch current page
        // If the current page is now empty and not the first page, go to previous page
        if (users.value.length === 1 && currentPage.value > 1) {
            currentPage.value--;
        }
        await fetchUsers();
    }
    catch (err) {
        console.error('Error deleting user:', err);
        const errorMessage = err.response?.data?.detail || '사용자 삭제 중 오류가 발생했습니다.';
        notificationStore.error(errorMessage);
        userToDelete.value = null;
    }
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
/** @type {__VLS_StyleScopedClasses['search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['retry-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['users-table']} */ ;
/** @type {__VLS_StyleScopedClasses['users-table']} */ ;
/** @type {__VLS_StyleScopedClasses['users-table']} */ ;
/** @type {__VLS_StyleScopedClasses['users-table']} */ ;
/** @type {__VLS_StyleScopedClasses['users-table']} */ ;
/** @type {__VLS_StyleScopedClasses['users-table']} */ ;
/** @type {__VLS_StyleScopedClasses['users-table']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['delete-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['page-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['page-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['close-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['close-btn']} */ ;
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
    ...{ onInput: (__VLS_ctx.debouncedSearch) },
    value: (__VLS_ctx.searchQuery),
    type: "text",
    placeholder: "사용자 검색...",
    ...{ class: "search-input" },
});
// @ts-ignore
[debouncedSearch, searchQuery,];
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
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        ...{ class: "error-icon" },
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "2",
    });
    __VLS_asFunctionalElement(__VLS_elements.circle, __VLS_elements.circle)({
        cx: "12",
        cy: "12",
        r: "10",
    });
    __VLS_asFunctionalElement(__VLS_elements.line, __VLS_elements.line)({
        x1: "15",
        y1: "9",
        x2: "9",
        y2: "15",
    });
    __VLS_asFunctionalElement(__VLS_elements.line, __VLS_elements.line)({
        x1: "9",
        y1: "9",
        x2: "15",
        y2: "15",
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
    __VLS_asFunctionalElement(__VLS_elements.tbody, __VLS_elements.tbody)({});
    for (const [user] of __VLS_getVForSourceType((__VLS_ctx.users))) {
        // @ts-ignore
        [users,];
        __VLS_asFunctionalElement(__VLS_elements.tr, __VLS_elements.tr)({
            key: (user.user_id),
        });
        __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
        (user.user_id);
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
        (user.total_chats || 0);
        __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
        (user.last_active ? __VLS_ctx.formatDate(user.last_active) : '-');
        // @ts-ignore
        [formatDate,];
        __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
        (__VLS_ctx.formatDate(user.created_at));
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
                    __VLS_ctx.toggleAdmin(user);
                    // @ts-ignore
                    [toggleAdmin,];
                } },
            ...{ class: "action-btn admin-btn" },
            disabled: (user.user_id === __VLS_ctx.authStore.user?.user_id),
            title: (user.is_admin ? '관리자 권한 해제' : '관리자 권한 부여'),
        });
        // @ts-ignore
        [authStore,];
        if (user.is_admin) {
            __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                'stroke-width': "2",
            });
            __VLS_asFunctionalElement(__VLS_elements.path, __VLS_elements.path)({
                d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2",
            });
            __VLS_asFunctionalElement(__VLS_elements.circle, __VLS_elements.circle)({
                cx: "9",
                cy: "7",
                r: "4",
            });
            __VLS_asFunctionalElement(__VLS_elements.path, __VLS_elements.path)({
                d: "M23 21v-2a4 4 0 0 0-3-3.87",
            });
            __VLS_asFunctionalElement(__VLS_elements.path, __VLS_elements.path)({
                d: "M16 3.13a4 4 0 0 1 0 7.75",
            });
        }
        else {
            __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                'stroke-width': "2",
            });
            __VLS_asFunctionalElement(__VLS_elements.path, __VLS_elements.path)({
                d: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
            });
        }
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
            disabled: (user.user_id === __VLS_ctx.authStore.user?.user_id),
            title: "삭제",
        });
        // @ts-ignore
        [authStore,];
        __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "2",
        });
        __VLS_asFunctionalElement(__VLS_elements.polyline, __VLS_elements.polyline)({
            points: "3 6 5 6 21 6",
        });
        __VLS_asFunctionalElement(__VLS_elements.path, __VLS_elements.path)({
            d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
        });
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
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        ...{ class: "empty-icon" },
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "2",
    });
    __VLS_asFunctionalElement(__VLS_elements.circle, __VLS_elements.circle)({
        cx: "11",
        cy: "11",
        r: "8",
    });
    __VLS_asFunctionalElement(__VLS_elements.path, __VLS_elements.path)({
        d: "m21 21-4.35-4.35",
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
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        ...{ class: "warning-icon" },
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "2",
    });
    __VLS_asFunctionalElement(__VLS_elements.path, __VLS_elements.path)({
        d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z",
    });
    __VLS_asFunctionalElement(__VLS_elements.line, __VLS_elements.line)({
        x1: "12",
        y1: "9",
        x2: "12",
        y2: "13",
    });
    __VLS_asFunctionalElement(__VLS_elements.line, __VLS_elements.line)({
        x1: "12",
        y1: "17",
        x2: "12.01",
        y2: "17",
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
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['user-management']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-state']} */ ;
/** @type {__VLS_StyleScopedClasses['spinner']} */ ;
/** @type {__VLS_StyleScopedClasses['error-state']} */ ;
/** @type {__VLS_StyleScopedClasses['error-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['retry-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['users-container']} */ ;
/** @type {__VLS_StyleScopedClasses['table-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['users-table']} */ ;
/** @type {__VLS_StyleScopedClasses['user-info']} */ ;
/** @type {__VLS_StyleScopedClasses['action-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['delete-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination']} */ ;
/** @type {__VLS_StyleScopedClasses['page-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['page-info']} */ ;
/** @type {__VLS_StyleScopedClasses['page-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['modal']} */ ;
/** @type {__VLS_StyleScopedClasses['confirm-modal']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['confirm-message']} */ ;
/** @type {__VLS_StyleScopedClasses['warning-message']} */ ;
/** @type {__VLS_StyleScopedClasses['warning-icon']} */ ;
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
            userToDelete: userToDelete,
            formatDate: formatDate,
            fetchUsers: fetchUsers,
            debouncedSearch: debouncedSearch,
            changePage: changePage,
            toggleAdmin: toggleAdmin,
            confirmDelete: confirmDelete,
            deleteUser: deleteUser,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
    },
});
; /* PartiallyEnd: #4569/main.vue */

import { ref, computed, onMounted, watch } from 'vue';
import { adminService } from '@/services/admin.service';
import { useNotificationStore } from '@/stores/notification';
import { getAvatarUrl, getPlaceholderAvatar, handleAvatarError } from '@/services/avatar.service';
// State
const notificationStore = useNotificationStore();
const userSearch = ref('');
const selectedUser = ref(null);
const selectedCharacter = ref(null);
const loading = ref(false);
// Data
const users = ref([]);
const userCharacters = ref([]);
const allChats = ref([]);
// Computed
const filteredUsers = computed(() => {
    if (!userSearch.value)
        return users.value;
    const search = userSearch.value.toLowerCase();
    return users.value.filter(user => user.username.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search));
});
// API Methods
const fetchUsers = async () => {
    try {
        loading.value = true;
        const response = await adminService.getUsers(1, 100); // Get all users
        users.value = response.items;
    }
    catch (error) {
        console.error('Failed to fetch users:', error);
        notificationStore.error('사용자 목록을 불러오는데 실패했습니다.');
    }
    finally {
        loading.value = false;
    }
};
const fetchUserCharacters = async (userId) => {
    try {
        loading.value = true;
        const characterStats = await adminService.getUserCharacterStats(userId);
        userCharacters.value = characterStats.map(stat => ({
            character_id: stat.character_id,
            name: stat.name,
            avatar_url: stat.avatar_url,
            chatCount: stat.chatCount,
            messageCount: stat.messageCount,
            lastChatDate: new Date(stat.lastChatDate),
            firstChatDate: new Date(stat.firstChatDate),
            avgMessagesPerChat: stat.avgMessagesPerChat,
            avgChatDuration: stat.avgChatDuration
        }));
    }
    catch (error) {
        console.error('Failed to fetch user characters:', error);
        notificationStore.error('사용자 캐릭터 통계를 불러오는데 실패했습니다.');
    }
    finally {
        loading.value = false;
    }
};
const fetchChats = async (userId, characterId) => {
    try {
        loading.value = true;
        const response = await adminService.getUserChats2(userId, characterId, 1, 500); // Get all chats
        allChats.value = response.items.map(msg => ({
            message_id: msg.message_id,
            content: msg.content,
            isFromUser: msg.role === 'user',
            timestamp: new Date(msg.created_at)
        })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()); // Sort chronologically
    }
    catch (error) {
        console.error('Failed to fetch messages:', error);
        notificationStore.error('메시지를 불러오는데 실패했습니다.');
    }
    finally {
        loading.value = false;
    }
};
// Methods
const selectUser = async (user) => {
    selectedUser.value = user;
    selectedCharacter.value = null;
    allChats.value = [];
    // Fetch character stats for this user
    await fetchUserCharacters(user.user_id);
};
const selectCharacter = async (character) => {
    selectedCharacter.value = character;
    // Fetch messages for this user-character pair
    if (selectedUser.value) {
        await fetchChats(selectedUser.value.user_id, character.character_id);
    }
};
const formatDate = (date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0)
        return '오늘';
    if (days === 1)
        return '어제';
    if (days < 7)
        return `${days}일 전`;
    if (days < 30)
        return `${Math.floor(days / 7)}주 전`;
    return `${Math.floor(days / 30)}개월 전`;
};
const formatFullDate = (date) => {
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};
const formatTime = (date) => {
    return date.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit'
    });
};
const isNewDay = (index) => {
    if (index === 0)
        return true;
    const currentMessage = allChats.value[index];
    const previousMessage = allChats.value[index - 1];
    const currentDate = new Date(currentMessage.timestamp).toDateString();
    const previousDate = new Date(previousMessage.timestamp).toDateString();
    return currentDate !== previousDate;
};
// Lifecycle
onMounted(() => {
    fetchUsers();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['sidebar-header']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['user-item']} */ ;
/** @type {__VLS_StyleScopedClasses['user-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['character-card']} */ ;
/** @type {__VLS_StyleScopedClasses['back-button']} */ ;
/** @type {__VLS_StyleScopedClasses['back-button']} */ ;
/** @type {__VLS_StyleScopedClasses['header-info']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-content']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-content']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['conversation-messages']} */ ;
/** @type {__VLS_StyleScopedClasses['message-item']} */ ;
/** @type {__VLS_StyleScopedClasses['date-separator']} */ ;
/** @type {__VLS_StyleScopedClasses['date-separator']} */ ;
/** @type {__VLS_StyleScopedClasses['message-content']} */ ;
/** @type {__VLS_StyleScopedClasses['message-content']} */ ;
/** @type {__VLS_StyleScopedClasses['user-message']} */ ;
/** @type {__VLS_StyleScopedClasses['message-sender']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-message']} */ ;
/** @type {__VLS_StyleScopedClasses['message-sender']} */ ;
/** @type {__VLS_StyleScopedClasses['no-messages']} */ ;
/** @type {__VLS_StyleScopedClasses['no-messages']} */ ;
/** @type {__VLS_StyleScopedClasses['content-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['user-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['character-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-characters']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-characters']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-characters']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-characters']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "user-chat-history" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({
    ...{ class: "page-title" },
});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "page-subtitle" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "content-layout" },
});
__VLS_asFunctionalElement(__VLS_elements.aside, __VLS_elements.aside)({
    ...{ class: "user-sidebar" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "sidebar-header" },
});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "user-search" },
});
__VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
    ...{ class: "search-icon" },
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
__VLS_asFunctionalElement(__VLS_elements.input)({
    value: (__VLS_ctx.userSearch),
    type: "text",
    placeholder: "사용자 검색...",
    ...{ class: "search-input" },
});
// @ts-ignore
[userSearch,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "user-list" },
});
if (__VLS_ctx.loading && __VLS_ctx.users.length === 0) {
    // @ts-ignore
    [loading, users,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "loading-users" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "loading-spinner-small" },
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
}
for (const [user] of __VLS_getVForSourceType((__VLS_ctx.filteredUsers))) {
    // @ts-ignore
    [filteredUsers,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.selectUser(user);
                // @ts-ignore
                [selectUser,];
            } },
        key: (user.user_id),
        ...{ class: (['user-item', { active: __VLS_ctx.selectedUser?.user_id === user.user_id }]) },
    });
    // @ts-ignore
    [selectedUser,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "user-avatar" },
    });
    (user.username.charAt(0).toUpperCase());
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "user-info" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "user-name" },
    });
    (user.username);
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "user-email" },
    });
    (user.email);
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "user-stats" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "stat-item" },
    });
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "2",
    });
    __VLS_asFunctionalElement(__VLS_elements.path)({
        d: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
    });
    (user.total_chats || 0);
}
__VLS_asFunctionalElement(__VLS_elements.main, __VLS_elements.main)({
    ...{ class: "main-content" },
});
if (!__VLS_ctx.selectedUser) {
    // @ts-ignore
    [selectedUser,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "empty-state" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "empty-icon" },
    });
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "2",
    });
    __VLS_asFunctionalElement(__VLS_elements.path, __VLS_elements.path)({
        d: "M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2",
    });
    __VLS_asFunctionalElement(__VLS_elements.circle, __VLS_elements.circle)({
        cx: "8.5",
        cy: "7",
        r: "4",
    });
    __VLS_asFunctionalElement(__VLS_elements.line, __VLS_elements.line)({
        x1: "20",
        y1: "8",
        x2: "20",
        y2: "14",
    });
    __VLS_asFunctionalElement(__VLS_elements.line, __VLS_elements.line)({
        x1: "23",
        y1: "11",
        x2: "17",
        y2: "11",
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
}
else if (!__VLS_ctx.selectedCharacter) {
    // @ts-ignore
    [selectedCharacter,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "character-section" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "section-header" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
    (__VLS_ctx.selectedUser.username);
    // @ts-ignore
    [selectedUser,];
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "section-subtitle" },
    });
    (__VLS_ctx.userCharacters.length);
    // @ts-ignore
    [userCharacters,];
    if (__VLS_ctx.loading && __VLS_ctx.userCharacters.length === 0) {
        // @ts-ignore
        [loading, userCharacters,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "loading-characters" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "loading-spinner" },
        });
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
    }
    else if (!__VLS_ctx.loading && __VLS_ctx.userCharacters.length === 0) {
        // @ts-ignore
        [loading, userCharacters,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "empty-characters" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "empty-icon" },
        });
        __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "2",
        });
        __VLS_asFunctionalElement(__VLS_elements.path, __VLS_elements.path)({
            d: "M20 21v-2a4 4 0 0 0-3-3.87",
        });
        __VLS_asFunctionalElement(__VLS_elements.path, __VLS_elements.path)({
            d: "M4 21v-2a4 4 0 0 1 3-3.87",
        });
        __VLS_asFunctionalElement(__VLS_elements.circle, __VLS_elements.circle)({
            cx: "12",
            cy: "7",
            r: "4",
        });
        __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
    }
    else {
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "character-grid" },
        });
        for (const [char] of __VLS_getVForSourceType((__VLS_ctx.userCharacters))) {
            // @ts-ignore
            [userCharacters,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ onClick: (...[$event]) => {
                        if (!!(!__VLS_ctx.selectedUser))
                            return;
                        if (!(!__VLS_ctx.selectedCharacter))
                            return;
                        if (!!(__VLS_ctx.loading && __VLS_ctx.userCharacters.length === 0))
                            return;
                        if (!!(!__VLS_ctx.loading && __VLS_ctx.userCharacters.length === 0))
                            return;
                        __VLS_ctx.selectCharacter(char);
                        // @ts-ignore
                        [selectCharacter,];
                    } },
                key: (char.character_id),
                ...{ class: "character-card" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "character-avatar" },
            });
            if (__VLS_ctx.getAvatarUrl(char.avatar_url)) {
                // @ts-ignore
                [getAvatarUrl,];
                __VLS_asFunctionalElement(__VLS_elements.img)({
                    ...{ onError: (__VLS_ctx.handleAvatarError) },
                    src: (__VLS_ctx.getAvatarUrl(char.avatar_url)),
                    alt: (char.name),
                    ...{ class: "avatar-image" },
                    loading: "lazy",
                });
                // @ts-ignore
                [getAvatarUrl, handleAvatarError,];
            }
            else {
                __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                    ...{ class: "avatar-text" },
                });
                (char.name.charAt(0));
            }
            __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({
                ...{ class: "character-name" },
            });
            (char.name);
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "character-stats" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "stat" },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "stat-value" },
            });
            (char.chatCount);
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "stat-label" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "stat" },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "stat-value" },
            });
            (char.messageCount);
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "stat-label" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "last-chat" },
            });
            (__VLS_ctx.formatDate(char.lastChatDate));
            // @ts-ignore
            [formatDate,];
        }
    }
}
else {
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "conversation-details" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "details-header" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(!__VLS_ctx.selectedUser))
                    return;
                if (!!(!__VLS_ctx.selectedCharacter))
                    return;
                __VLS_ctx.selectedCharacter = null;
                // @ts-ignore
                [selectedCharacter,];
            } },
        ...{ class: "back-button" },
    });
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "2",
    });
    __VLS_asFunctionalElement(__VLS_elements.path)({
        d: "M19 12H5M5 12L12 19M5 12L12 5",
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "header-info" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
    (__VLS_ctx.selectedUser.username);
    (__VLS_ctx.selectedCharacter.name);
    // @ts-ignore
    [selectedUser, selectedCharacter,];
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "header-subtitle" },
    });
    (__VLS_ctx.selectedCharacter.chatCount);
    (__VLS_ctx.selectedCharacter.messageCount);
    // @ts-ignore
    [selectedCharacter, selectedCharacter,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "conversation-stats" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "stat-card" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "stat-icon" },
    });
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "2",
    });
    __VLS_asFunctionalElement(__VLS_elements.rect, __VLS_elements.rect)({
        x: "3",
        y: "4",
        width: "18",
        height: "18",
        rx: "2",
        ry: "2",
    });
    __VLS_asFunctionalElement(__VLS_elements.line, __VLS_elements.line)({
        x1: "16",
        y1: "2",
        x2: "16",
        y2: "6",
    });
    __VLS_asFunctionalElement(__VLS_elements.line, __VLS_elements.line)({
        x1: "8",
        y1: "2",
        x2: "8",
        y2: "6",
    });
    __VLS_asFunctionalElement(__VLS_elements.line, __VLS_elements.line)({
        x1: "3",
        y1: "10",
        x2: "21",
        y2: "10",
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "stat-content" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "stat-value" },
    });
    (__VLS_ctx.formatDate(__VLS_ctx.selectedCharacter.firstChatDate));
    // @ts-ignore
    [selectedCharacter, formatDate,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "stat-label" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "stat-card" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "stat-icon" },
    });
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "2",
    });
    __VLS_asFunctionalElement(__VLS_elements.polyline, __VLS_elements.polyline)({
        points: "22 12 18 12 15 21 9 3 6 12 2 12",
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "stat-content" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "stat-value" },
    });
    (__VLS_ctx.selectedCharacter.avgMessagesPerChat);
    // @ts-ignore
    [selectedCharacter,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "stat-label" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "stat-card" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "stat-icon" },
    });
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
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
    __VLS_asFunctionalElement(__VLS_elements.polyline, __VLS_elements.polyline)({
        points: "12 6 12 12 16 14",
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "stat-content" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "stat-value" },
    });
    (__VLS_ctx.selectedCharacter.avgChatDuration);
    // @ts-ignore
    [selectedCharacter,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "stat-label" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "conversation-messages" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({});
    if (__VLS_ctx.loading && __VLS_ctx.allChats.length === 0) {
        // @ts-ignore
        [loading, allChats,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "loading-messages" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "loading-spinner" },
        });
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
    }
    else {
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "messages-container" },
        });
        for (const [message, index] of __VLS_getVForSourceType((__VLS_ctx.allChats))) {
            // @ts-ignore
            [allChats,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                key: (message.message_id),
                ...{ class: "message-item" },
                ...{ class: ({
                        'user-message': message.isFromUser,
                        'ai-message': !message.isFromUser,
                        'new-day': __VLS_ctx.isNewDay(index)
                    }) },
            });
            // @ts-ignore
            [isNewDay,];
            if (__VLS_ctx.isNewDay(index)) {
                // @ts-ignore
                [isNewDay,];
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    ...{ class: "date-separator" },
                });
                __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
                (__VLS_ctx.formatFullDate(message.timestamp));
                // @ts-ignore
                [formatFullDate,];
            }
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "message-content" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "message-header" },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "message-sender" },
            });
            (message.isFromUser ? __VLS_ctx.selectedUser.username : __VLS_ctx.selectedCharacter.name);
            // @ts-ignore
            [selectedUser, selectedCharacter,];
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "message-time" },
            });
            (__VLS_ctx.formatTime(message.timestamp));
            // @ts-ignore
            [formatTime,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "message-text" },
            });
            (message.content);
        }
        if (__VLS_ctx.allChats.length === 0) {
            // @ts-ignore
            [allChats,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "no-messages" },
            });
            __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                'stroke-width': "2",
            });
            __VLS_asFunctionalElement(__VLS_elements.path, __VLS_elements.path)({
                d: "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z",
            });
            __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
        }
    }
}
/** @type {__VLS_StyleScopedClasses['user-chat-history']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['page-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['content-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['user-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-header']} */ ;
/** @type {__VLS_StyleScopedClasses['user-search']} */ ;
/** @type {__VLS_StyleScopedClasses['search-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['user-list']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-users']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-spinner-small']} */ ;
/** @type {__VLS_StyleScopedClasses['user-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['user-info']} */ ;
/** @type {__VLS_StyleScopedClasses['user-name']} */ ;
/** @type {__VLS_StyleScopedClasses['user-email']} */ ;
/** @type {__VLS_StyleScopedClasses['user-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['main-content']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['character-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-characters']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-spinner']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-characters']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['character-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['character-card']} */ ;
/** @type {__VLS_StyleScopedClasses['character-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-image']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-text']} */ ;
/** @type {__VLS_StyleScopedClasses['character-name']} */ ;
/** @type {__VLS_StyleScopedClasses['character-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['stat']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['last-chat']} */ ;
/** @type {__VLS_StyleScopedClasses['conversation-details']} */ ;
/** @type {__VLS_StyleScopedClasses['details-header']} */ ;
/** @type {__VLS_StyleScopedClasses['back-button']} */ ;
/** @type {__VLS_StyleScopedClasses['header-info']} */ ;
/** @type {__VLS_StyleScopedClasses['header-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['conversation-stats']} */ ;
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
/** @type {__VLS_StyleScopedClasses['conversation-messages']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-messages']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-spinner']} */ ;
/** @type {__VLS_StyleScopedClasses['messages-container']} */ ;
/** @type {__VLS_StyleScopedClasses['message-item']} */ ;
/** @type {__VLS_StyleScopedClasses['date-separator']} */ ;
/** @type {__VLS_StyleScopedClasses['message-content']} */ ;
/** @type {__VLS_StyleScopedClasses['message-header']} */ ;
/** @type {__VLS_StyleScopedClasses['message-sender']} */ ;
/** @type {__VLS_StyleScopedClasses['message-time']} */ ;
/** @type {__VLS_StyleScopedClasses['message-text']} */ ;
/** @type {__VLS_StyleScopedClasses['no-messages']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            getAvatarUrl: getAvatarUrl,
            handleAvatarError: handleAvatarError,
            userSearch: userSearch,
            selectedUser: selectedUser,
            selectedCharacter: selectedCharacter,
            loading: loading,
            users: users,
            userCharacters: userCharacters,
            allChats: allChats,
            filteredUsers: filteredUsers,
            selectUser: selectUser,
            selectCharacter: selectCharacter,
            formatDate: formatDate,
            formatFullDate: formatFullDate,
            formatTime: formatTime,
            isNewDay: isNewDay,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
    },
});
; /* PartiallyEnd: #4569/main.vue */

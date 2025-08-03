import { ref, computed, onMounted } from 'vue';
import { userService } from '../../services/user.service';
import { characterService } from '../../services/character.service';
// State
const chats = ref([]);
const characters = ref([]);
const messages = ref([]);
const loading = ref(false);
const loadingMessages = ref(false);
const searchQuery = ref('');
const selectedCharacter = ref('');
const selectedChat = ref(null);
const chatToDelete = ref(null);
const currentPage = ref(1);
const totalPages = ref(1);
const limit = 12;
// Computed
const filteredChats = computed(() => {
    let filtered = chats.value;
    // Filter by character
    if (selectedCharacter.value) {
        filtered = filtered.filter((chat) => chat.character_id === parseInt(selectedCharacter.value));
    }
    // Filter by search query
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter((chat) => chat.character?.name.toLowerCase().includes(query));
    }
    return filtered;
});
// Methods
const getCharacterIcon = (name) => {
    if (!name)
        return '🤖';
    const icons = {
        'Claude Assistant': '🤖',
        'Creative Writer': '✍️',
        'Code Helper': '💻',
        'Math Tutor': '📐',
    };
    return icons[name] || '🤖';
};
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};
const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
    });
};
const formatRelativeTime = (dateString) => {
    if (!dateString)
        return '없음';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 60)
        return `${minutes}분 전`;
    if (hours < 24)
        return `${hours}시간 전`;
    if (days < 7)
        return `${days}일 전`;
    return formatDate(dateString);
};
const fetchChats = async () => {
    loading.value = true;
    try {
        const response = await userService.getChats(currentPage.value, limit);
        chats.value = response.items;
        totalPages.value = response.pages;
    }
    catch (error) {
        console.error('Failed to fetch chats:', error);
    }
    finally {
        loading.value = false;
    }
};
const fetchCharacters = async () => {
    try {
        characters.value = await characterService.getCharacters();
    }
    catch (error) {
        console.error('Failed to fetch characters:', error);
    }
};
const viewChat = async (chat) => {
    selectedChat.value = chat;
    loadingMessages.value = true;
    try {
        messages.value = await userService.getChatMessages(chat.id);
    }
    catch (error) {
        console.error('Failed to fetch messages:', error);
    }
    finally {
        loadingMessages.value = false;
    }
};
const closeModal = () => {
    selectedChat.value = null;
    messages.value = [];
};
const confirmDelete = (chat) => {
    chatToDelete.value = chat;
};
const deleteChat = async () => {
    if (!chatToDelete.value)
        return;
    try {
        await userService.deleteChat(chatToDelete.value.id);
        chats.value = chats.value.filter((c) => c.id !== chatToDelete.value.id);
        chatToDelete.value = null;
        // Refetch if page is empty
        if (chats.value.length === 0 && currentPage.value > 1) {
            currentPage.value--;
            fetchChats();
        }
    }
    catch (error) {
        console.error('Failed to delete chat:', error);
    }
};
const handleSearch = () => {
    // Reset to first page when searching
    currentPage.value = 1;
};
const filterChats = () => {
    // Reset to first page when filtering
    currentPage.value = 1;
};
const changePage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
        fetchChats();
    }
};
onMounted(() => {
    fetchChats();
    fetchCharacters();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-select']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-info']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['delete-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['delete-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['start-chat-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['page-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['page-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['close-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['message']} */ ;
/** @type {__VLS_StyleScopedClasses['message']} */ ;
/** @type {__VLS_StyleScopedClasses['message-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['message-content']} */ ;
/** @type {__VLS_StyleScopedClasses['message']} */ ;
/** @type {__VLS_StyleScopedClasses['user']} */ ;
/** @type {__VLS_StyleScopedClasses['message-content']} */ ;
/** @type {__VLS_StyleScopedClasses['message']} */ ;
/** @type {__VLS_StyleScopedClasses['user']} */ ;
/** @type {__VLS_StyleScopedClasses['message-time']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['danger']} */ ;
/** @type {__VLS_StyleScopedClasses['controls']} */ ;
/** @type {__VLS_StyleScopedClasses['chats-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['message-content']} */ ;
/** @type {__VLS_StyleScopedClasses['modal']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "chat-history" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "subtitle" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "controls" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "search-box" },
});
__VLS_asFunctionalElement(__VLS_elements.i, __VLS_elements.i)({
    ...{ class: "search-icon" },
});
__VLS_asFunctionalElement(__VLS_elements.input)({
    ...{ onInput: (__VLS_ctx.handleSearch) },
    value: (__VLS_ctx.searchQuery),
    type: "text",
    placeholder: "채팅 검색...",
    ...{ class: "search-input" },
});
// @ts-ignore
[handleSearch, searchQuery,];
__VLS_asFunctionalElement(__VLS_elements.select, __VLS_elements.select)({
    ...{ onChange: (__VLS_ctx.filterChats) },
    value: (__VLS_ctx.selectedCharacter),
    ...{ class: "filter-select" },
});
// @ts-ignore
[filterChats, selectedCharacter,];
__VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
    value: "",
});
for (const [char] of __VLS_getVForSourceType((__VLS_ctx.characters))) {
    // @ts-ignore
    [characters,];
    __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
        key: (char.id),
        value: (char.id),
    });
    (char.name);
}
if (__VLS_ctx.loading) {
    // @ts-ignore
    [loading,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "loading-state" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "spinner" },
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
}
else if (__VLS_ctx.filteredChats.length > 0) {
    // @ts-ignore
    [filteredChats,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "chats-grid" },
    });
    for (const [chat] of __VLS_getVForSourceType((__VLS_ctx.filteredChats))) {
        // @ts-ignore
        [filteredChats,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!(__VLS_ctx.filteredChats.length > 0))
                        return;
                    __VLS_ctx.viewChat(chat);
                    // @ts-ignore
                    [viewChat,];
                } },
            key: (chat.id),
            ...{ class: "chat-card" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "chat-header" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "chat-avatar" },
        });
        __VLS_asFunctionalElement(__VLS_elements.i, __VLS_elements.i)({});
        (__VLS_ctx.getCharacterIcon(chat.character?.name));
        // @ts-ignore
        [getCharacterIcon,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "chat-info" },
        });
        __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({});
        (chat.character?.name || '알 수 없는 캐릭터');
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "chat-date" },
        });
        (__VLS_ctx.formatDate(chat.last_message_at || chat.created_at));
        // @ts-ignore
        [formatDate,];
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!(__VLS_ctx.filteredChats.length > 0))
                        return;
                    __VLS_ctx.confirmDelete(chat);
                    // @ts-ignore
                    [confirmDelete,];
                } },
            ...{ class: "delete-btn" },
            title: "삭제",
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "chat-preview" },
        });
        if (chat.message_count) {
            __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "message-count" },
            });
            (chat.message_count);
        }
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "preview-text" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "chat-footer" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "chat-stat" },
        });
        __VLS_asFunctionalElement(__VLS_elements.i, __VLS_elements.i)({});
        (__VLS_ctx.formatDate(chat.created_at));
        // @ts-ignore
        [formatDate,];
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "chat-stat" },
        });
        __VLS_asFunctionalElement(__VLS_elements.i, __VLS_elements.i)({});
        (__VLS_ctx.formatRelativeTime(chat.last_message_at));
        // @ts-ignore
        [formatRelativeTime,];
    }
}
else {
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "empty-state" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "empty-icon" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
    const __VLS_0 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
    // @ts-ignore
    RouterLink;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        to: "/",
        ...{ class: "start-chat-btn" },
    }));
    const __VLS_2 = __VLS_1({
        to: "/",
        ...{ class: "start-chat-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    const { default: __VLS_4 } = __VLS_3.slots;
    var __VLS_3;
}
if (__VLS_ctx.totalPages > 1) {
    // @ts-ignore
    [totalPages,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "pagination" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
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
if (__VLS_ctx.selectedChat) {
    // @ts-ignore
    [selectedChat,];
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
    (__VLS_ctx.selectedChat.character?.name);
    // @ts-ignore
    [selectedChat,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.closeModal) },
        ...{ class: "close-btn" },
    });
    // @ts-ignore
    [closeModal,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-body" },
    });
    if (__VLS_ctx.loadingMessages) {
        // @ts-ignore
        [loadingMessages,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "loading-messages" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "spinner" },
        });
    }
    else {
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "messages-list" },
        });
        for (const [message] of __VLS_getVForSourceType((__VLS_ctx.messages))) {
            // @ts-ignore
            [messages,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                key: (message.id),
                ...{ class: "message" },
                ...{ class: (message.role) },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "message-avatar" },
            });
            if (message.role === 'user') {
                __VLS_asFunctionalElement(__VLS_elements.i, __VLS_elements.i)({});
            }
            else {
                __VLS_asFunctionalElement(__VLS_elements.i, __VLS_elements.i)({});
                (__VLS_ctx.getCharacterIcon(__VLS_ctx.selectedChat.character?.name));
                // @ts-ignore
                [getCharacterIcon, selectedChat,];
            }
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "message-content" },
            });
            __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
            (message.content);
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "message-time" },
            });
            (__VLS_ctx.formatTime(message.created_at));
            // @ts-ignore
            [formatTime,];
        }
    }
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-footer" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.closeModal) },
        ...{ class: "btn secondary" },
    });
    // @ts-ignore
    [closeModal,];
    const __VLS_10 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
    // @ts-ignore
    RouterLink;
    // @ts-ignore
    const __VLS_11 = __VLS_asFunctionalComponent(__VLS_10, new __VLS_10({
        to: (`/chat/${__VLS_ctx.selectedChat.id}`),
        ...{ class: "btn primary" },
    }));
    const __VLS_12 = __VLS_11({
        to: (`/chat/${__VLS_ctx.selectedChat.id}`),
        ...{ class: "btn primary" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_11));
    const { default: __VLS_14 } = __VLS_13.slots;
    // @ts-ignore
    [selectedChat,];
    var __VLS_13;
}
var __VLS_8;
const __VLS_15 = {}.Teleport;
/** @type {[typeof __VLS_components.Teleport, typeof __VLS_components.Teleport, ]} */ ;
// @ts-ignore
Teleport;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({
    to: "body",
}));
const __VLS_17 = __VLS_16({
    to: "body",
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
const { default: __VLS_19 } = __VLS_18.slots;
if (__VLS_ctx.chatToDelete) {
    // @ts-ignore
    [chatToDelete,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.chatToDelete))
                    return;
                __VLS_ctx.chatToDelete = null;
                // @ts-ignore
                [chatToDelete,];
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
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "warning" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-footer" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.chatToDelete))
                    return;
                __VLS_ctx.chatToDelete = null;
                // @ts-ignore
                [chatToDelete,];
            } },
        ...{ class: "btn secondary" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.deleteChat) },
        ...{ class: "btn danger" },
    });
    // @ts-ignore
    [deleteChat,];
}
var __VLS_18;
/** @type {__VLS_StyleScopedClasses['chat-history']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['controls']} */ ;
/** @type {__VLS_StyleScopedClasses['search-box']} */ ;
/** @type {__VLS_StyleScopedClasses['search-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-select']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-state']} */ ;
/** @type {__VLS_StyleScopedClasses['spinner']} */ ;
/** @type {__VLS_StyleScopedClasses['chats-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-header']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-info']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-date']} */ ;
/** @type {__VLS_StyleScopedClasses['delete-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['message-count']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-text']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-stat']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-stat']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['start-chat-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination']} */ ;
/** @type {__VLS_StyleScopedClasses['page-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['page-info']} */ ;
/** @type {__VLS_StyleScopedClasses['page-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['modal']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['close-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-messages']} */ ;
/** @type {__VLS_StyleScopedClasses['spinner']} */ ;
/** @type {__VLS_StyleScopedClasses['messages-list']} */ ;
/** @type {__VLS_StyleScopedClasses['message']} */ ;
/** @type {__VLS_StyleScopedClasses['message-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['message-content']} */ ;
/** @type {__VLS_StyleScopedClasses['message-time']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['modal']} */ ;
/** @type {__VLS_StyleScopedClasses['confirm-modal']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['warning']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['danger']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            characters: characters,
            messages: messages,
            loading: loading,
            loadingMessages: loadingMessages,
            searchQuery: searchQuery,
            selectedCharacter: selectedCharacter,
            selectedChat: selectedChat,
            chatToDelete: chatToDelete,
            currentPage: currentPage,
            totalPages: totalPages,
            filteredChats: filteredChats,
            getCharacterIcon: getCharacterIcon,
            formatDate: formatDate,
            formatTime: formatTime,
            formatRelativeTime: formatRelativeTime,
            viewChat: viewChat,
            closeModal: closeModal,
            confirmDelete: confirmDelete,
            deleteChat: deleteChat,
            handleSearch: handleSearch,
            filterChats: filterChats,
            changePage: changePage,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
    },
});
; /* PartiallyEnd: #4569/main.vue */

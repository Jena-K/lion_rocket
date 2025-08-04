import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { chatService } from '../services/chat.service';
import { getPlaceholderAvatar } from '../services/avatar.service';
import { useToast } from 'vue-toastification';
const router = useRouter();
const toast = useToast();
// State
const chats = ref([]);
const isLoading = ref(true);
const currentPage = ref(1);
const pageSize = ref(12);
const totalChats = ref(0);
// Computed
const totalPages = computed(() => Math.ceil(totalChats.value / pageSize.value));
// Methods
const loadChats = async () => {
    isLoading.value = true;
    try {
        const skip = (currentPage.value - 1) * pageSize.value;
        const result = await chatService.getChats({
            skip,
            limit: pageSize.value
        });
        chats.value = result.chats;
        totalChats.value = result.total;
    }
    catch (err) {
        console.error('Failed to load chats:', err);
        toast.error('대화 목록을 불러오는데 실패했습니다');
    }
    finally {
        isLoading.value = false;
    }
};
const openChat = (chat) => {
    router.push({
        name: 'chat',
        params: { chatId: chat.chat_id },
        query: { characterId: chat.character_id }
    });
};
const createNewChat = () => {
    router.push('/characters');
};
const goToCharacters = () => {
    router.push('/characters');
};
const deleteChat = async (chat) => {
    if (!confirm('이 대화를 삭제하시겠습니까?'))
        return;
    try {
        await chatService.deleteChat(chat.chat_id);
        toast.success('대화가 삭제되었습니다');
        // Reload chats
        await loadChats();
    }
    catch (err) {
        console.error('Failed to delete chat:', err);
        toast.error('대화 삭제에 실패했습니다');
    }
};
const changePage = (page) => {
    if (page < 1 || page > totalPages.value)
        return;
    currentPage.value = page;
    loadChats();
};
const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) {
        return '오늘';
    }
    else if (days === 1) {
        return '어제';
    }
    else if (days < 7) {
        return `${days}일 전`;
    }
    else if (days < 30) {
        return `${Math.floor(days / 7)}주 전`;
    }
    else if (days < 365) {
        return `${Math.floor(days / 30)}개월 전`;
    }
    else {
        return `${Math.floor(days / 365)}년 전`;
    }
};
// Lifecycle
onMounted(() => {
    loadChats();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['new-chat-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['new-chat-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['start-chat-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['message-count']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['delete-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['delete-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['delete-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['page-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['page-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['page-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['chats-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['header-content']} */ ;
/** @type {__VLS_StyleScopedClasses['chats-main']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "chats-container" },
});
__VLS_asFunctionalElement(__VLS_elements.header, __VLS_elements.header)({
    ...{ class: "chats-header" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "header-content" },
});
__VLS_asFunctionalElement(__VLS_elements.h1, __VLS_elements.h1)({
    ...{ class: "page-title" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "header-actions" },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.createNewChat) },
    ...{ class: "new-chat-btn" },
});
// @ts-ignore
[createNewChat,];
__VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    'stroke-width': "2",
});
__VLS_asFunctionalElement(__VLS_elements.path)({
    d: "M12 5v14M5 12h14",
});
__VLS_asFunctionalElement(__VLS_elements.main, __VLS_elements.main)({
    ...{ class: "chats-main" },
});
if (__VLS_ctx.isLoading) {
    // @ts-ignore
    [isLoading,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "loading-state" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "loading-spinner" },
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
}
else if (!__VLS_ctx.chats.length) {
    // @ts-ignore
    [chats,];
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
    __VLS_asFunctionalElement(__VLS_elements.path)({
        d: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.goToCharacters) },
        ...{ class: "start-chat-btn" },
    });
    // @ts-ignore
    [goToCharacters,];
}
else {
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "chats-grid" },
    });
    for (const [chat] of __VLS_getVForSourceType((__VLS_ctx.chats))) {
        // @ts-ignore
        [chats,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.isLoading))
                        return;
                    if (!!(!__VLS_ctx.chats.length))
                        return;
                    __VLS_ctx.openChat(chat);
                    // @ts-ignore
                    [openChat,];
                } },
            key: (chat.chat_id),
            ...{ class: "chat-card" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "chat-avatar" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "avatar-text" },
        });
        (chat.character ? __VLS_ctx.getPlaceholderAvatar(chat.character) : '?');
        // @ts-ignore
        [getPlaceholderAvatar,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "chat-info" },
        });
        __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
            ...{ class: "chat-title" },
        });
        (chat.title || `${chat.character?.name || '알 수 없음'}과의 대화`);
        if (chat.last_message) {
            __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
                ...{ class: "chat-preview" },
            });
            (chat.last_message);
        }
        else {
            __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
                ...{ class: "chat-preview" },
            });
        }
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "chat-meta" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "chat-date" },
        });
        (__VLS_ctx.formatDate(chat.updated_at));
        // @ts-ignore
        [formatDate,];
        if (chat.message_count) {
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "message-count" },
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
            (chat.message_count);
        }
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.isLoading))
                        return;
                    if (!!(!__VLS_ctx.chats.length))
                        return;
                    __VLS_ctx.deleteChat(chat);
                    // @ts-ignore
                    [deleteChat,];
                } },
            ...{ class: "delete-btn" },
            title: "대화 삭제",
        });
        __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "2",
        });
        __VLS_asFunctionalElement(__VLS_elements.path)({
            d: "M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6",
        });
    }
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
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "2",
    });
    __VLS_asFunctionalElement(__VLS_elements.path)({
        d: "M15 19l-7-7 7-7",
    });
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
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "2",
    });
    __VLS_asFunctionalElement(__VLS_elements.path)({
        d: "M9 5l7 7-7 7",
    });
}
/** @type {__VLS_StyleScopedClasses['chats-container']} */ ;
/** @type {__VLS_StyleScopedClasses['chats-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-content']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['new-chat-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['chats-main']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-state']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-spinner']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['start-chat-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['chats-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-text']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-info']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-title']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-date']} */ ;
/** @type {__VLS_StyleScopedClasses['message-count']} */ ;
/** @type {__VLS_StyleScopedClasses['delete-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination']} */ ;
/** @type {__VLS_StyleScopedClasses['page-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['page-info']} */ ;
/** @type {__VLS_StyleScopedClasses['page-btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            getPlaceholderAvatar: getPlaceholderAvatar,
            chats: chats,
            isLoading: isLoading,
            currentPage: currentPage,
            totalPages: totalPages,
            openChat: openChat,
            createNewChat: createNewChat,
            goToCharacters: goToCharacters,
            deleteChat: deleteChat,
            changePage: changePage,
            formatDate: formatDate,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
    },
});
; /* PartiallyEnd: #4569/main.vue */

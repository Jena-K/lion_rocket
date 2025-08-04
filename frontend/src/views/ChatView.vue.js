import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { getPlaceholderAvatar, getUserPlaceholderAvatar, getAvatarUrl, handleAvatarError } from '../services/avatar.service';
import { characterService } from '../services/character.service';
import { chatService } from '../services/chat.service';
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
// Import the Character type from @/types instead of defining locally
// The Character type is already imported at the top of the file
// State
const characterId = computed(() => Number(route.params.characterId));
const currentCharacter = ref(null);
const messages = ref([]);
const newMessage = ref('');
const messagesContainer = ref();
const messageInput = ref();
const isTyping = ref(false);
const isSending = ref(false);
const isLoadingMessages = ref(false);
const pendingMessageIds = ref(new Set());
// Methods
const loadCharacter = async () => {
    try {
        const character = await characterService.getCharacter(characterId.value);
        currentCharacter.value = character;
    }
    catch (err) {
        console.error('Failed to load character:', err);
        // Handle error - redirect back to character selection
        router.push('/character-selection');
    }
};
const loadMessages = async () => {
    if (!characterId.value)
        return;
    isLoadingMessages.value = true;
    try {
        const existingMessages = await chatService.getMessages(characterId.value);
        messages.value = existingMessages;
        // Use instant scroll for initial load, then smooth scroll for new messages
        await scrollToBottom(false);
    }
    catch (err) {
        console.error('Failed to load messages:', err);
        // Continue with empty messages array
    }
    finally {
        isLoadingMessages.value = false;
    }
};
// Generate unique message ID
let messageIdCounter = Date.now();
const generateMessageId = () => {
    return messageIdCounter++;
};
const sendMessage = async () => {
    if (!newMessage.value.trim() || !currentCharacter.value)
        return;
    // Check character limit
    if (newMessage.value.length > 200) {
        console.warn('Message exceeds 200 character limit');
        return;
    }
    const messageContent = newMessage.value.trim();
    newMessage.value = '';
    // Create user message with unique ID
    const userMessageId = generateMessageId();
    const userMessage = {
        chat_id: userMessageId,
        content: messageContent,
        role: 'user',
        created_at: new Date().toISOString(),
        user_id: authStore.user?.user_id || 0,
        character_id: currentCharacter.value.character_id
    };
    // Add user message immediately for optimistic UI
    messages.value.push(userMessage);
    // Track this pending message
    pendingMessageIds.value.add(userMessageId);
    // Show typing indicator if this is the first pending message
    if (pendingMessageIds.value.size === 1) {
        isTyping.value = true;
    }
    // Send message asynchronously (no await here, allowing multiple messages)
    handleMessageSend(userMessage, messageContent).catch(err => {
        console.error('Message send handler error:', err);
    });
};
// Separate async handler for message sending
const handleMessageSend = async (userMessage, messageContent) => {
    try {
        // Send message to backend API and get both user and AI response
        const response = await chatService.sendMessage({
            content: messageContent,
            character_id: currentCharacter.value.character_id
        });
        // Don't replace the user message - just mark it as sent by removing from pending
        // The user message stays exactly as it was displayed initially
        // Add AI message
        messages.value.push(response.ai_message);
        // Remove from pending set
        pendingMessageIds.value.delete(userMessage.chat_id);
        // Hide typing indicator only if no more pending messages
        if (pendingMessageIds.value.size === 0) {
            isTyping.value = false;
        }
    }
    catch (err) {
        console.error('Failed to send message:', err);
        // Mark message as failed instead of removing it
        const failedIndex = messages.value.findIndex(msg => msg.chat_id === userMessage.chat_id);
        if (failedIndex !== -1) {
            // Create a new message object to trigger Vue reactivity
            messages.value[failedIndex] = {
                ...messages.value[failedIndex],
                failed: true
            };
        }
        // Remove from pending set
        pendingMessageIds.value.delete(userMessage.chat_id);
        // Hide typing indicator only if no more pending messages
        if (pendingMessageIds.value.size === 0) {
            isTyping.value = false;
        }
        // Show error message to user
        const errorMessage = {
            chat_id: Date.now(),
            content: `메시지 전송에 실패했습니다. 다시 시도해주세요.`,
            role: 'assistant',
            created_at: new Date().toISOString(),
            user_id: authStore.user?.user_id || 0,
            character_id: currentCharacter.value?.character_id || 0
        };
        messages.value.push(errorMessage);
    }
};
const scrollToBottom = async (smooth = true) => {
    await nextTick();
    if (messagesContainer.value) {
        const scrollElement = messagesContainer.value;
        const scrollHeight = scrollElement.scrollHeight;
        const clientHeight = scrollElement.clientHeight;
        const maxScrollTop = scrollHeight - clientHeight;
        console.log('🔽 Scrolling to bottom:', {
            smooth,
            scrollHeight,
            clientHeight,
            maxScrollTop,
            currentScrollTop: scrollElement.scrollTop
        });
        if (smooth) {
            // Smooth scroll for better UX
            scrollElement.scrollTo({
                top: maxScrollTop,
                behavior: 'smooth'
            });
        }
        else {
            // Instant scroll for initial load
            scrollElement.scrollTop = maxScrollTop;
        }
        // Ensure we're really at the bottom after a short delay
        setTimeout(() => {
            if (messagesContainer.value) {
                messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
                console.log('✅ Final scroll position:', messagesContainer.value.scrollTop);
            }
        }, 100);
    }
};
const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};
const goBack = () => {
    router.push('/characters');
};
const handleLogout = async () => {
    await authStore.logout();
    router.push('/login');
};
// Watch for messages changes and auto-scroll
watch(() => messages.value.length, async () => {
    // Auto-scroll to bottom when new messages are added
    // This ensures the conversation flows naturally with focus on latest messages
    await scrollToBottom();
}, { flush: 'post' } // Execute after DOM updates
);
// Watch for typing indicator changes and adjust scroll
watch(() => isTyping.value, async (newIsTyping) => {
    if (newIsTyping) {
        // Small delay to let typing indicator render, then scroll
        setTimeout(() => scrollToBottom(), 50);
    }
}, { flush: 'post' });
// Removed SSE handling - now using simple request-response
// Lifecycle
onMounted(async () => {
    await loadCharacter();
    await loadMessages();
    messageInput.value?.focus();
});
// No cleanup needed - removed SSE connections
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['back-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['back-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['logout-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['logout-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['messages-area']} */ ;
/** @type {__VLS_StyleScopedClasses['messages-area']} */ ;
/** @type {__VLS_StyleScopedClasses['messages-area']} */ ;
/** @type {__VLS_StyleScopedClasses['messages-area']} */ ;
/** @type {__VLS_StyleScopedClasses['welcome-message']} */ ;
/** @type {__VLS_StyleScopedClasses['welcome-message']} */ ;
/** @type {__VLS_StyleScopedClasses['msg-avatar-placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['message-bubble']} */ ;
/** @type {__VLS_StyleScopedClasses['message-bubble']} */ ;
/** @type {__VLS_StyleScopedClasses['pending-message']} */ ;
/** @type {__VLS_StyleScopedClasses['message-bubble']} */ ;
/** @type {__VLS_StyleScopedClasses['pending-message']} */ ;
/** @type {__VLS_StyleScopedClasses['user-bubble']} */ ;
/** @type {__VLS_StyleScopedClasses['user-bubble']} */ ;
/** @type {__VLS_StyleScopedClasses['failed-message']} */ ;
/** @type {__VLS_StyleScopedClasses['user-bubble']} */ ;
/** @type {__VLS_StyleScopedClasses['typing-dots']} */ ;
/** @type {__VLS_StyleScopedClasses['typing-dots']} */ ;
/** @type {__VLS_StyleScopedClasses['typing-dots']} */ ;
/** @type {__VLS_StyleScopedClasses['message-input']} */ ;
/** @type {__VLS_StyleScopedClasses['character-counter']} */ ;
/** @type {__VLS_StyleScopedClasses['character-counter']} */ ;
/** @type {__VLS_StyleScopedClasses['message-input']} */ ;
/** @type {__VLS_StyleScopedClasses['send-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['send-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['send-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-header']} */ ;
/** @type {__VLS_StyleScopedClasses['messages-area']} */ ;
/** @type {__VLS_StyleScopedClasses['message-bubble']} */ ;
/** @type {__VLS_StyleScopedClasses['input-area']} */ ;
/** @type {__VLS_StyleScopedClasses['welcome-message']} */ ;
/** @type {__VLS_StyleScopedClasses['welcome-message']} */ ;
/** @type {__VLS_StyleScopedClasses['header-content']} */ ;
/** @type {__VLS_StyleScopedClasses['character-name']} */ ;
/** @type {__VLS_StyleScopedClasses['messages-area']} */ ;
/** @type {__VLS_StyleScopedClasses['input-container']} */ ;
/** @type {__VLS_StyleScopedClasses['send-btn']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "chat-container" },
});
__VLS_asFunctionalElement(__VLS_elements.header, __VLS_elements.header)({
    ...{ class: "chat-header" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "header-content" },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.goBack) },
    ...{ class: "back-btn" },
});
// @ts-ignore
[goBack,];
__VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    'stroke-width': "2",
});
__VLS_asFunctionalElement(__VLS_elements.path)({
    d: "M19 12H5M5 12L12 19M5 12L12 5",
});
if (__VLS_ctx.currentCharacter) {
    // @ts-ignore
    [currentCharacter,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "character-info" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "character-avatar" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "avatar-placeholder" },
    });
    (__VLS_ctx.getPlaceholderAvatar(__VLS_ctx.currentCharacter));
    // @ts-ignore
    [currentCharacter, getPlaceholderAvatar,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "status-dot" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "character-details" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({
        ...{ class: "character-name" },
    });
    (__VLS_ctx.currentCharacter.name);
    // @ts-ignore
    [currentCharacter,];
}
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "header-actions" },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.handleLogout) },
    ...{ class: "logout-btn" },
});
// @ts-ignore
[handleLogout,];
__VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    'stroke-width': "2",
});
__VLS_asFunctionalElement(__VLS_elements.path)({
    d: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
});
__VLS_asFunctionalElement(__VLS_elements.main, __VLS_elements.main)({
    ...{ class: "messages-area" },
    ref: "messagesContainer",
});
/** @type {typeof __VLS_ctx.messagesContainer} */ ;
// @ts-ignore
[messagesContainer,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "messages-wrapper" },
});
if (__VLS_ctx.isLoadingMessages) {
    // @ts-ignore
    [isLoadingMessages,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "loading-state" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "loading-spinner" },
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
}
else if (__VLS_ctx.messages.length === 0) {
    // @ts-ignore
    [messages,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "welcome-message" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "welcome-avatar" },
    });
    if (__VLS_ctx.currentCharacter) {
        // @ts-ignore
        [currentCharacter,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "welcome-avatar-placeholder" },
        });
        (__VLS_ctx.getPlaceholderAvatar(__VLS_ctx.currentCharacter));
        // @ts-ignore
        [currentCharacter, getPlaceholderAvatar,];
    }
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
}
else {
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "messages-list" },
    });
    for (const [message, index] of __VLS_getVForSourceType((__VLS_ctx.messages))) {
        // @ts-ignore
        [messages,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            key: (message.chat_id),
            ...{ class: ([
                    'message-item',
                    message.role === 'user' ? 'user-message' : 'character-message',
                    __VLS_ctx.pendingMessageIds?.has(message.chat_id) ? 'pending-message' : '',
                    message.failed ? 'failed-message' : ''
                ]) },
            ...{ style: ({ animationDelay: `${index * 0.1}s` }) },
        });
        // @ts-ignore
        [pendingMessageIds,];
        if (message.role === 'assistant') {
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "message-avatar" },
            });
            if (__VLS_ctx.currentCharacter) {
                // @ts-ignore
                [currentCharacter,];
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    ...{ class: "msg-avatar-placeholder" },
                });
                (__VLS_ctx.getPlaceholderAvatar(__VLS_ctx.currentCharacter));
                // @ts-ignore
                [currentCharacter, getPlaceholderAvatar,];
            }
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "message-bubble character-bubble" },
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
        else {
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "message-bubble user-bubble" },
            });
            __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
            (message.content);
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "message-time" },
            });
            (__VLS_ctx.formatTime(message.created_at));
            // @ts-ignore
            [formatTime,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "message-avatar" },
            });
            if (__VLS_ctx.authStore.user) {
                // @ts-ignore
                [authStore,];
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    ...{ class: "msg-avatar-placeholder user-avatar" },
                });
                (__VLS_ctx.getUserPlaceholderAvatar(__VLS_ctx.authStore.user));
                // @ts-ignore
                [authStore, getUserPlaceholderAvatar,];
            }
        }
    }
    if (__VLS_ctx.isTyping) {
        // @ts-ignore
        [isTyping,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "message-item character-message typing-message" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "message-avatar" },
        });
        if (__VLS_ctx.currentCharacter && __VLS_ctx.getAvatarUrl(__VLS_ctx.currentCharacter.avatar_url)) {
            // @ts-ignore
            [currentCharacter, currentCharacter, getAvatarUrl,];
            __VLS_asFunctionalElement(__VLS_elements.img)({
                ...{ onError: (__VLS_ctx.handleAvatarError) },
                src: (__VLS_ctx.getAvatarUrl(__VLS_ctx.currentCharacter.avatar_url)),
                alt: (__VLS_ctx.currentCharacter.name),
                ...{ class: "msg-avatar-img" },
            });
            // @ts-ignore
            [currentCharacter, currentCharacter, getAvatarUrl, handleAvatarError,];
        }
        else if (__VLS_ctx.currentCharacter) {
            // @ts-ignore
            [currentCharacter,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "msg-avatar-placeholder" },
            });
            (__VLS_ctx.currentCharacter.name.charAt(0));
            // @ts-ignore
            [currentCharacter,];
        }
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "message-bubble character-bubble typing-bubble" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "typing-dots" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
    }
}
__VLS_asFunctionalElement(__VLS_elements.footer, __VLS_elements.footer)({
    ...{ class: "input-area" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "input-container" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "input-wrapper" },
});
__VLS_asFunctionalElement(__VLS_elements.input)({
    ...{ onKeydown: (__VLS_ctx.sendMessage) },
    ref: "messageInput",
    value: (__VLS_ctx.newMessage),
    type: "text",
    placeholder: "메시지를 입력하세요...",
    ...{ class: "message-input" },
    maxlength: (200),
});
/** @type {typeof __VLS_ctx.messageInput} */ ;
// @ts-ignore
[sendMessage, newMessage, messageInput,];
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "character-counter" },
    ...{ class: ({ 'warning': __VLS_ctx.newMessage.length > 180, 'error': __VLS_ctx.newMessage.length >= 200 }) },
});
// @ts-ignore
[newMessage, newMessage,];
(__VLS_ctx.newMessage.length);
// @ts-ignore
[newMessage,];
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.sendMessage) },
    ...{ class: "send-btn" },
    disabled: (!__VLS_ctx.newMessage.trim() || __VLS_ctx.newMessage.length > 200),
});
// @ts-ignore
[sendMessage, newMessage, newMessage,];
__VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    'stroke-width': "2",
});
__VLS_asFunctionalElement(__VLS_elements.line, __VLS_elements.line)({
    x1: "22",
    y1: "2",
    x2: "11",
    y2: "13",
});
__VLS_asFunctionalElement(__VLS_elements.polygon, __VLS_elements.polygon)({
    points: "22 2 15 22 11 13 2 9 22 2",
});
/** @type {__VLS_StyleScopedClasses['chat-container']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-content']} */ ;
/** @type {__VLS_StyleScopedClasses['back-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['character-info']} */ ;
/** @type {__VLS_StyleScopedClasses['character-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['status-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['character-details']} */ ;
/** @type {__VLS_StyleScopedClasses['character-name']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['logout-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['messages-area']} */ ;
/** @type {__VLS_StyleScopedClasses['messages-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-state']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-spinner']} */ ;
/** @type {__VLS_StyleScopedClasses['welcome-message']} */ ;
/** @type {__VLS_StyleScopedClasses['welcome-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['welcome-avatar-placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['messages-list']} */ ;
/** @type {__VLS_StyleScopedClasses['message-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['msg-avatar-placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['message-bubble']} */ ;
/** @type {__VLS_StyleScopedClasses['character-bubble']} */ ;
/** @type {__VLS_StyleScopedClasses['message-time']} */ ;
/** @type {__VLS_StyleScopedClasses['message-bubble']} */ ;
/** @type {__VLS_StyleScopedClasses['user-bubble']} */ ;
/** @type {__VLS_StyleScopedClasses['message-time']} */ ;
/** @type {__VLS_StyleScopedClasses['message-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['msg-avatar-placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['user-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['message-item']} */ ;
/** @type {__VLS_StyleScopedClasses['character-message']} */ ;
/** @type {__VLS_StyleScopedClasses['typing-message']} */ ;
/** @type {__VLS_StyleScopedClasses['message-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['msg-avatar-img']} */ ;
/** @type {__VLS_StyleScopedClasses['msg-avatar-placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['message-bubble']} */ ;
/** @type {__VLS_StyleScopedClasses['character-bubble']} */ ;
/** @type {__VLS_StyleScopedClasses['typing-bubble']} */ ;
/** @type {__VLS_StyleScopedClasses['typing-dots']} */ ;
/** @type {__VLS_StyleScopedClasses['input-area']} */ ;
/** @type {__VLS_StyleScopedClasses['input-container']} */ ;
/** @type {__VLS_StyleScopedClasses['input-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['message-input']} */ ;
/** @type {__VLS_StyleScopedClasses['character-counter']} */ ;
/** @type {__VLS_StyleScopedClasses['send-btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            getPlaceholderAvatar: getPlaceholderAvatar,
            getUserPlaceholderAvatar: getUserPlaceholderAvatar,
            getAvatarUrl: getAvatarUrl,
            handleAvatarError: handleAvatarError,
            authStore: authStore,
            currentCharacter: currentCharacter,
            messages: messages,
            newMessage: newMessage,
            messagesContainer: messagesContainer,
            messageInput: messageInput,
            isTyping: isTyping,
            isLoadingMessages: isLoadingMessages,
            pendingMessageIds: pendingMessageIds,
            sendMessage: sendMessage,
            formatTime: formatTime,
            goBack: goBack,
            handleLogout: handleLogout,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
    },
});
; /* PartiallyEnd: #4569/main.vue */

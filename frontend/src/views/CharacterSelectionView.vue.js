import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '@/stores/notification';
import { characterService } from '@/services/character.service';
import { Gender as GenderEnum } from '@/types';
import { getAvatarUrl, getPlaceholderAvatar, handleAvatarError } from '@/services/avatar.service';
const authStore = useAuthStore();
const router = useRouter();
const notificationStore = useNotificationStore();
const loading = ref(false);
const characters = ref([]);
const selectedCharacter = ref(null);
const showCharacterModal = ref(false);
// Computed
const hasCharacters = computed(() => characters.value.length > 0);
// Methods
const getGenderLabel = (gender) => {
    const labels = {
        male: '남성',
        female: '여성'
    };
    return labels[gender] || gender;
};
const handleSelectCharacter = (character) => {
    selectedCharacter.value = character;
    showCharacterModal.value = true;
    console.log('Selected character:', character.name);
};
const handleLogout = async () => {
    await authStore.logout();
    router.push('/login');
};
const handleStartChat = async () => {
    console.log('handleStartChat called');
    console.log('selectedCharacter:', selectedCharacter.value);
    console.log('selectedCharacter.character_id:', selectedCharacter.value?.character_id);
    if (selectedCharacter.value && selectedCharacter.value.character_id) {
        try {
            console.log('Starting chat with:', selectedCharacter.value.name);
            console.log('Character ID to pass:', selectedCharacter.value.character_id);
            // Convert character_id to string as Vue Router expects string params
            const characterId = String(selectedCharacter.value.character_id);
            console.log('Converted characterId:', characterId);
            // Navigate directly to the chat page with character ID
            router.push({
                name: 'chat',
                params: { characterId: characterId }
            });
        }
        catch (error) {
            console.error('Failed to start chat:', error);
            notificationStore.error('채팅을 시작할 수 없습니다. 다시 시도해주세요.');
        }
    }
    else {
        console.log('No character selected or missing character_id');
        console.log('Character data:', selectedCharacter.value);
        notificationStore.warning('먼저 캐릭터를 선택해주세요.');
    }
};
const closeModal = () => {
    showCharacterModal.value = false;
    selectedCharacter.value = null;
};
// Note: handleImageError is now imported from avatar.service
// Transform API character to Extended character
const transformCharacter = (char) => {
    return {
        ...char,
        introduction: char.intro,
        personalityTags: char.personality_tags || [],
        interestTags: char.interest_tags || [],
        description: char.intro
    };
};
// Fetch characters from API with improved error handling
const fetchCharacters = async () => {
    loading.value = true;
    try {
        console.log('🔄 Fetching characters from API...');
        // Try to fetch available characters for selection
        const response = await characterService.getAvailableCharacters({
            skip: 0,
            limit: 100
        });
        if (response && response.characters && response.characters.length > 0) {
            characters.value = response.characters.map(transformCharacter);
            console.log('✅ Successfully loaded real characters from API:', characters.value.length);
        }
        else {
            // API responded but no characters found
            console.log('📋 API responded but no characters found');
            handleNoCharactersFound();
        }
    }
    catch (error) {
        console.error('❌ Failed to fetch characters from API:', error);
        handleApiError(error);
    }
    finally {
        loading.value = false;
    }
};
// Handle the case when API responds but no characters are found
const handleNoCharactersFound = () => {
    characters.value = [];
    notificationStore.info('등록된 캐릭터가 없습니다. 관리자가 캐릭터를 추가할 때까지 기다려주세요.');
};
// Handle API errors with specific messaging
const handleApiError = (error) => {
    // Clear characters array for all error cases
    characters.value = [];
    if (error.code === 'ERR_NETWORK' || !error.response) {
        // Network/connection error
        console.log('🔌 Network error - backend server may not be running');
        notificationStore.error('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인하고 다시 시도해주세요.');
    }
    else if (error.response?.status === 401 || error.response?.status === 403) {
        // Authentication/authorization error
        console.log('🔐 Authentication error');
        notificationStore.error('인증이 필요합니다. 다시 로그인해주세요.');
        // Could redirect to login here if needed
    }
    else if (error.response?.status === 404) {
        // Endpoint not found (might be URL mismatch)
        console.log('🔍 Endpoint not found - might be URL mismatch');
        notificationStore.error('캐릭터 정보를 가져올 수 없습니다. 시스템 설정을 확인해주세요.');
    }
    else if (error.response?.status >= 500) {
        // Server error
        console.log('🚨 Server error');
        notificationStore.error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
    else {
        // Other errors
        console.log('❓ Unknown error');
        notificationStore.error('알 수 없는 오류가 발생했습니다. 관리자에게 문의해주세요.');
    }
};
// Lifecycle
onMounted(() => {
    fetchCharacters();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['logout-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['character-card']} */ ;
/** @type {__VLS_StyleScopedClasses['character-card']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-close-button']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-close']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-close']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-introduction']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-section']} */ ;
/** @type {__VLS_StyleScopedClasses['start-chat-button']} */ ;
/** @type {__VLS_StyleScopedClasses['start-chat-button']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['retry-button']} */ ;
/** @type {__VLS_StyleScopedClasses['retry-button']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header']} */ ;
/** @type {__VLS_StyleScopedClasses['logo']} */ ;
/** @type {__VLS_StyleScopedClasses['header-left']} */ ;
/** @type {__VLS_StyleScopedClasses['content-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['characters-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['character-modal']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-close']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "character-selection-container" },
});
__VLS_asFunctionalElement(__VLS_elements.header, __VLS_elements.header)({
    ...{ class: "app-header" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "header-left" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "logo-title" },
});
__VLS_asFunctionalElement(__VLS_elements.img)({
    src: "/lion_rocket_logo.png",
    alt: "LionRocket",
    ...{ class: "logo" },
});
__VLS_asFunctionalElement(__VLS_elements.h1, __VLS_elements.h1)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "header-right" },
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "user-info" },
});
(__VLS_ctx.authStore.user?.username);
// @ts-ignore
[authStore,];
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.handleLogout) },
    ...{ class: "logout-btn" },
});
// @ts-ignore
[handleLogout,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "content-wrapper" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({
    ...{ class: "title" },
});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "subtitle" },
});
if (__VLS_ctx.loading) {
    // @ts-ignore
    [loading,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "loading-container" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "loading-spinner" },
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
}
else if (!__VLS_ctx.hasCharacters && !__VLS_ctx.loading) {
    // @ts-ignore
    [loading, hasCharacters,];
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
    __VLS_asFunctionalElement(__VLS_elements.circle, __VLS_elements.circle)({
        cx: "12",
        cy: "12",
        r: "3",
    });
    __VLS_asFunctionalElement(__VLS_elements.path, __VLS_elements.path)({
        d: "M12 1v12l8-4V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v4l8 4z",
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
        ...{ class: "empty-title" },
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "empty-description" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.fetchCharacters) },
        ...{ class: "retry-button" },
    });
    // @ts-ignore
    [fetchCharacters,];
}
else if (__VLS_ctx.hasCharacters) {
    // @ts-ignore
    [hasCharacters,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "characters-grid" },
    });
    for (const [character] of __VLS_getVForSourceType((__VLS_ctx.characters))) {
        // @ts-ignore
        [characters,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!!(!__VLS_ctx.hasCharacters && !__VLS_ctx.loading))
                        return;
                    if (!(__VLS_ctx.hasCharacters))
                        return;
                    __VLS_ctx.handleSelectCharacter(character);
                    // @ts-ignore
                    [handleSelectCharacter,];
                } },
            key: (character.character_id),
            ...{ class: "character-card" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "character-avatar" },
        });
        if (__VLS_ctx.getAvatarUrl(character.avatar_url)) {
            // @ts-ignore
            [getAvatarUrl,];
            __VLS_asFunctionalElement(__VLS_elements.img)({
                ...{ onError: (__VLS_ctx.handleAvatarError) },
                src: (__VLS_ctx.getAvatarUrl(character.avatar_url)),
                alt: (character.name),
                ...{ class: "avatar-image" },
                loading: "lazy",
            });
            // @ts-ignore
            [getAvatarUrl, handleAvatarError,];
        }
        else {
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "avatar-placeholder" },
            });
            (__VLS_ctx.getPlaceholderAvatar(character));
            // @ts-ignore
            [getPlaceholderAvatar,];
        }
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "character-info" },
        });
        __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
            ...{ class: "character-name" },
        });
        (character.name);
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "character-gender" },
        });
        (__VLS_ctx.getGenderLabel(character.gender));
        // @ts-ignore
        [getGenderLabel,];
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "character-introduction" },
        });
        (character.intro);
    }
}
if (__VLS_ctx.showCharacterModal && __VLS_ctx.selectedCharacter) {
    // @ts-ignore
    [showCharacterModal, selectedCharacter,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ onClick: (__VLS_ctx.closeModal) },
        ...{ class: "modal-backdrop" },
    });
    // @ts-ignore
    [closeModal,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ onClick: () => { } },
        ...{ class: "character-modal" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.closeModal) },
        ...{ class: "modal-close" },
    });
    // @ts-ignore
    [closeModal,];
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "2",
    });
    __VLS_asFunctionalElement(__VLS_elements.line, __VLS_elements.line)({
        x1: "18",
        y1: "6",
        x2: "6",
        y2: "18",
    });
    __VLS_asFunctionalElement(__VLS_elements.line, __VLS_elements.line)({
        x1: "6",
        y1: "6",
        x2: "18",
        y2: "18",
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-avatar" },
    });
    if (__VLS_ctx.getAvatarUrl(__VLS_ctx.selectedCharacter.avatar_url)) {
        // @ts-ignore
        [getAvatarUrl, selectedCharacter,];
        __VLS_asFunctionalElement(__VLS_elements.img)({
            ...{ onError: (__VLS_ctx.handleAvatarError) },
            src: (__VLS_ctx.getAvatarUrl(__VLS_ctx.selectedCharacter.avatar_url)),
            alt: (__VLS_ctx.selectedCharacter.name),
            ...{ class: "avatar-large-image" },
            loading: "lazy",
        });
        // @ts-ignore
        [getAvatarUrl, handleAvatarError, selectedCharacter, selectedCharacter,];
    }
    else {
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "avatar-large" },
        });
        (__VLS_ctx.getPlaceholderAvatar(__VLS_ctx.selectedCharacter));
        // @ts-ignore
        [getPlaceholderAvatar, selectedCharacter,];
    }
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-header" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({
        ...{ class: "modal-name" },
    });
    (__VLS_ctx.selectedCharacter.name);
    // @ts-ignore
    [selectedCharacter,];
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "modal-gender" },
    });
    (__VLS_ctx.getGenderLabel(__VLS_ctx.selectedCharacter.gender));
    // @ts-ignore
    [getGenderLabel, selectedCharacter,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-introduction" },
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
    (__VLS_ctx.selectedCharacter.intro);
    // @ts-ignore
    [selectedCharacter,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-tags" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "tag-section" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
        ...{ class: "tag-title" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "tag-list" },
    });
    for (const [tag] of __VLS_getVForSourceType((__VLS_ctx.selectedCharacter.personality_tags))) {
        // @ts-ignore
        [selectedCharacter,];
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            key: (tag),
            ...{ class: "tag personality-tag" },
        });
        (tag);
    }
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "tag-section" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
        ...{ class: "tag-title" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "tag-list" },
    });
    for (const [tag] of __VLS_getVForSourceType((__VLS_ctx.selectedCharacter.interest_tags))) {
        // @ts-ignore
        [selectedCharacter,];
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            key: (tag),
            ...{ class: "tag interest-tag" },
        });
        (tag);
    }
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.handleStartChat) },
        ...{ class: "start-chat-button" },
    });
    // @ts-ignore
    [handleStartChat,];
}
/** @type {__VLS_StyleScopedClasses['character-selection-container']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-left']} */ ;
/** @type {__VLS_StyleScopedClasses['logo-title']} */ ;
/** @type {__VLS_StyleScopedClasses['logo']} */ ;
/** @type {__VLS_StyleScopedClasses['header-right']} */ ;
/** @type {__VLS_StyleScopedClasses['user-info']} */ ;
/** @type {__VLS_StyleScopedClasses['logout-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['content-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-container']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-spinner']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-title']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-description']} */ ;
/** @type {__VLS_StyleScopedClasses['retry-button']} */ ;
/** @type {__VLS_StyleScopedClasses['characters-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['character-card']} */ ;
/** @type {__VLS_StyleScopedClasses['character-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-image']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['character-info']} */ ;
/** @type {__VLS_StyleScopedClasses['character-name']} */ ;
/** @type {__VLS_StyleScopedClasses['character-gender']} */ ;
/** @type {__VLS_StyleScopedClasses['character-introduction']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-backdrop']} */ ;
/** @type {__VLS_StyleScopedClasses['character-modal']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-close']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-large-image']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-large']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-name']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-gender']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-introduction']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-tags']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-section']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-title']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-list']} */ ;
/** @type {__VLS_StyleScopedClasses['tag']} */ ;
/** @type {__VLS_StyleScopedClasses['personality-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-section']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-title']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-list']} */ ;
/** @type {__VLS_StyleScopedClasses['tag']} */ ;
/** @type {__VLS_StyleScopedClasses['interest-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['start-chat-button']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            getAvatarUrl: getAvatarUrl,
            getPlaceholderAvatar: getPlaceholderAvatar,
            handleAvatarError: handleAvatarError,
            authStore: authStore,
            loading: loading,
            characters: characters,
            selectedCharacter: selectedCharacter,
            showCharacterModal: showCharacterModal,
            hasCharacters: hasCharacters,
            getGenderLabel: getGenderLabel,
            handleSelectCharacter: handleSelectCharacter,
            handleLogout: handleLogout,
            handleStartChat: handleStartChat,
            closeModal: closeModal,
            fetchCharacters: fetchCharacters,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
    },
});
; /* PartiallyEnd: #4569/main.vue */

import { ref, reactive, computed, onMounted } from 'vue';
import { Gender } from '../../types';
import { adminCharacterService } from '@/services/admin.character.service';
import { useNotificationStore } from '@/stores/notification';
import { getPlaceholderAvatar, getAvatarUrl, handleAvatarError } from '@/services/avatar.service';
const notificationStore = useNotificationStore();
// State
const characters = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const filterStatus = ref('all');
const showCreateModal = ref(false);
const editingCharacter = ref(null);
const viewingCharacter = ref(null);
const characterToDelete = ref(null);
const managingAvatarCharacter = ref(null);
const selectedAvatarFile = ref(null);
const avatarPreview = ref(null);
const uploadingAvatar = ref(false);
const deletingAvatar = ref(false);
const avatarFileInput = ref(null);
const currentPage = ref(1);
const itemsPerPage = ref(20);
const totalItems = ref(0);
const creatingDefaults = ref(false);
// Tag inputs
const personalityTagInput = ref('');
const interestTagInput = ref('');
// Form data
const formData = reactive({
    name: '',
    gender: 'male',
    intro: '',
    personality_tags: [],
    interest_tags: [],
    prompt: '',
});
// Computed
const filteredCharacters = computed(() => {
    return characters.value;
});
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));
const isFormValid = computed(() => {
    return (formData.name.trim() &&
        formData.intro.trim() &&
        formData.personality_tags.length > 0 &&
        formData.interest_tags.length > 0 &&
        formData.prompt.trim());
});
// Methods
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
};
const formatNumber = (num) => {
    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
    }
    else if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
};
const fetchCharacters = async () => {
    loading.value = true;
    try {
        let isActive = undefined;
        if (filterStatus.value === 'active')
            isActive = true;
        else if (filterStatus.value === 'inactive')
            isActive = false;
        console.log('🔍 Fetching characters from admin API...');
        const response = await adminCharacterService.getCharacters({
            skip: (currentPage.value - 1) * itemsPerPage.value,
            limit: itemsPerPage.value,
            search: searchQuery.value || undefined,
            is_active: isActive,
        });
        console.log('✅ Admin API response:', response);
        console.log('📊 Characters with stats:', response.characters?.map(c => ({
            name: c.name,
            chat_count: c.chat_count,
            unique_users: c.unique_users
        })));
        characters.value = response.characters || [];
        totalItems.value = response.total || 0;
        if (characters.value.length === 0 && currentPage.value === 1 && !searchQuery.value) {
            console.log('📋 No characters found in database');
            notificationStore.info('데이터베이스에 캐릭터가 없습니다. 새 캐릭터를 추가하거나 기본 캐릭터를 생성하세요.');
        }
    }
    catch (error) {
        console.error('❌ Failed to fetch characters:', error);
        // More detailed error handling
        if (error.response?.status === 401) {
            notificationStore.error('인증이 필요합니다. 다시 로그인해주세요.');
        }
        else if (error.response?.status === 403) {
            notificationStore.error('관리자 권한이 필요합니다.');
        }
        else if (error.response?.status === 500) {
            notificationStore.error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
        else if (error.code === 'NETWORK_ERROR' || !error.response) {
            notificationStore.error('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
        }
        else {
            notificationStore.error('캐릭터 목록을 불러오는데 실패했습니다: ' + (error.message || '알 수 없는 오류'));
        }
        // Set empty state
        characters.value = [];
        totalItems.value = 0;
    }
    finally {
        loading.value = false;
    }
};
const addTag = (type) => {
    const input = type === 'personality' ? personalityTagInput.value : interestTagInput.value;
    const trimmed = input.trim();
    if (trimmed && !formData[`${type}_tags`].includes(trimmed)) {
        formData[`${type}_tags`].push(trimmed);
        if (type === 'personality') {
            personalityTagInput.value = '';
        }
        else {
            interestTagInput.value = '';
        }
    }
};
const removeTag = (type, index) => {
    formData[`${type}_tags`].splice(index, 1);
};
const viewCharacter = (character) => {
    viewingCharacter.value = character;
};
const editCharacter = (character) => {
    editingCharacter.value = character;
    formData.name = character.name;
    formData.gender = character.gender;
    formData.intro = character.intro;
    formData.personality_tags = [...character.personality_tags];
    formData.interest_tags = [...character.interest_tags];
    formData.prompt = character.prompt;
};
const closeModal = () => {
    showCreateModal.value = false;
    editingCharacter.value = null;
    // Reset form
    formData.name = '';
    formData.gender = 'male';
    formData.intro = '';
    formData.personality_tags = [];
    formData.interest_tags = [];
    formData.prompt = '';
    personalityTagInput.value = '';
    interestTagInput.value = '';
};
const handleSubmit = async () => {
    if (!isFormValid.value)
        return;
    if (editingCharacter.value) {
        // Update existing character
        try {
            const updateData = {
                name: formData.name,
                gender: formData.gender,
                intro: formData.intro,
                personality_tags: formData.personality_tags,
                interest_tags: formData.interest_tags,
                prompt: formData.prompt,
            };
            await adminCharacterService.updateCharacter(editingCharacter.value.character_id, updateData);
            notificationStore.success('캐릭터가 성공적으로 수정되었습니다');
            closeModal();
            fetchCharacters();
        }
        catch (error) {
            notificationStore.error('캐릭터 수정에 실패했습니다');
            console.error('Failed to update character:', error);
        }
    }
    else {
        // Create new character
        try {
            await adminCharacterService.createCharacter(formData);
            notificationStore.success('캐릭터가 성공적으로 생성되었습니다');
            closeModal();
            fetchCharacters();
        }
        catch (error) {
            notificationStore.error('캐릭터 생성에 실패했습니다');
            console.error('Failed to create character:', error);
        }
    }
};
const toggleActive = async (character) => {
    try {
        const result = await adminCharacterService.toggleActive(character.character_id);
        notificationStore.success(result.message);
        fetchCharacters();
    }
    catch (error) {
        notificationStore.error('캐릭터 상태 변경에 실패했습니다');
        console.error('Failed to toggle character status:', error);
    }
};
const confirmDelete = (character) => {
    characterToDelete.value = character;
};
const deleteCharacter = async () => {
    if (!characterToDelete.value)
        return;
    try {
        await adminCharacterService.deleteCharacter(characterToDelete.value.character_id);
        notificationStore.success('캐릭터가 성공적으로 삭제되었습니다');
        characterToDelete.value = null;
        fetchCharacters();
    }
    catch (error) {
        notificationStore.error('캐릭터 삭제에 실패했습니다');
        console.error('Failed to delete character:', error);
    }
};
// Avatar management methods
const manageAvatar = (character) => {
    managingAvatarCharacter.value = character;
    // Reset avatar form state
    selectedAvatarFile.value = null;
    avatarPreview.value = null;
};
const triggerFileInput = () => {
    avatarFileInput.value?.click();
};
const handleAvatarFileSelect = (event) => {
    const target = event.target;
    const file = target.files?.[0];
    if (!file)
        return;
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
        notificationStore.error('파일 크기가 너무 큽니다. 5MB 이하의 파일을 선택해주세요.');
        return;
    }
    // Validate file type
    if (!file.type.startsWith('image/')) {
        notificationStore.error('이미지 파일만 업로드할 수 있습니다.');
        return;
    }
    selectedAvatarFile.value = file;
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
        avatarPreview.value = e.target?.result;
    };
    reader.readAsDataURL(file);
};
const uploadAvatar = async () => {
    if (!selectedAvatarFile.value || !managingAvatarCharacter.value)
        return;
    uploadingAvatar.value = true;
    try {
        console.log('📤 Uploading avatar for character:', managingAvatarCharacter.value.name);
        const result = await adminCharacterService.uploadAvatar(managingAvatarCharacter.value.character_id, selectedAvatarFile.value);
        console.log('✅ Avatar upload successful:', result);
        notificationStore.success(result.message || '아바타가 성공적으로 업로드되었습니다');
        // Update the character's avatar_url
        managingAvatarCharacter.value.avatar_url = result.avatar_url;
        // Update the character in the list
        const characterIndex = characters.value.findIndex(c => c.character_id === managingAvatarCharacter.value.character_id);
        if (characterIndex !== -1) {
            characters.value[characterIndex].avatar_url = result.avatar_url;
        }
        // Refresh the character list to ensure we have the latest data from middleware
        await fetchCharacters();
        // Reset form state
        selectedAvatarFile.value = null;
        avatarPreview.value = null;
        if (avatarFileInput.value) {
            avatarFileInput.value.value = '';
        }
        // Close the modal after successful upload
        managingAvatarCharacter.value = null;
    }
    catch (error) {
        console.error('❌ Avatar upload failed:', error);
        if (error.response?.status === 413) {
            notificationStore.error('파일 크기가 너무 큽니다. 더 작은 파일을 선택해주세요.');
        }
        else if (error.response?.status === 400) {
            notificationStore.error('지원하지 않는 파일 형식입니다.');
        }
        else {
            notificationStore.error('아바타 업로드에 실패했습니다: ' + (error.message || '알 수 없는 오류'));
        }
    }
    finally {
        uploadingAvatar.value = false;
    }
};
const deleteAvatar = async () => {
    if (!managingAvatarCharacter.value)
        return;
    deletingAvatar.value = true;
    try {
        console.log('🗑️ Deleting avatar for character:', managingAvatarCharacter.value.name);
        const result = await adminCharacterService.deleteAvatar(managingAvatarCharacter.value.character_id);
        console.log('✅ Avatar deletion successful:', result);
        notificationStore.success(result.message || '아바타가 성공적으로 삭제되었습니다');
        // Update the character's avatar_url to undefined
        managingAvatarCharacter.value.avatar_url = undefined;
        // Update the character in the list
        const characterIndex = characters.value.findIndex(c => c.character_id === managingAvatarCharacter.value.character_id);
        if (characterIndex !== -1) {
            characters.value[characterIndex].avatar_url = undefined;
        }
        // Refresh the character list to ensure we have the latest data from middleware
        await fetchCharacters();
        // Close the modal after successful deletion
        managingAvatarCharacter.value = null;
    }
    catch (error) {
        console.error('❌ Avatar deletion failed:', error);
        notificationStore.error('아바타 삭제에 실패했습니다: ' + (error.message || '알 수 없는 오류'));
    }
    finally {
        deletingAvatar.value = false;
    }
};
// Filter handlers
const handleSearch = () => {
    currentPage.value = 1;
    fetchCharacters();
};
const handleFilterChange = () => {
    currentPage.value = 1;
    fetchCharacters();
};
// Pagination
const changePage = (page) => {
    currentPage.value = page;
    fetchCharacters();
};
// Create default characters
const createDefaultCharacters = async () => {
    creatingDefaults.value = true;
    try {
        console.log('🚀 Creating default characters...');
        const defaultCharacters = [
            {
                name: '미나',
                gender: 'female',
                intro: '친근하고 활발한 성격의 AI 친구입니다. 언제나 긍정적인 에너지로 대화를 이끌어갑니다.',
                personality_tags: ['활발함', '친근함', '긍정적', '유머러스'],
                interest_tags: ['일상 대화', 'K-POP', '맛집 탐방', '여행'],
                prompt: '당신은 활발하고 친근한 AI 친구 미나입니다. 항상 긍정적이고 유머러스한 대화를 나누며, 사용자가 편안함을 느낄 수 있도록 도와주세요. K-POP, 맛집, 여행에 관심이 많고, 일상적인 대화를 즐깁니다.',
            },
            {
                name: '준호',
                gender: 'male',
                intro: '지적이고 차분한 성격의 AI 멘토입니다. 깊이 있는 대화와 조언을 제공합니다.',
                personality_tags: ['차분함', '논리적', '신중함', '배려심'],
                interest_tags: ['자기계발', '독서', '철학', '과학기술'],
                prompt: '당신은 지적이고 차분한 AI 멘토 준호입니다. 논리적이고 신중한 사고로 사용자에게 도움이 되는 조언을 제공하세요. 자기계발, 독서, 철학, 과학기술에 관심이 많으며 깊이 있는 대화를 선호합니다.',
            },
            {
                name: '루나',
                gender: 'female',
                intro: '창의적이고 예술적인 감각을 가진 AI입니다. 상상력이 풍부한 대화를 나눕니다.',
                personality_tags: ['창의적', '감성적', '독특함', '자유로움'],
                interest_tags: ['예술', '음악', '시', '우주와 신비'],
                prompt: '당신은 창의적이고 예술적인 AI 루나입니다. 감성적이고 독특한 관점으로 세상을 바라보며, 예술, 음악, 시, 우주의 신비로운 주제들에 대해 자유롭고 창의적인 대화를 나누세요.',
            },
            {
                name: '사라',
                gender: 'female',
                intro: '전문적이고 실용적인 조언을 제공하는 AI 어시스턴트입니다.',
                personality_tags: ['전문적', '효율적', '체계적', '신뢰할 수 있는'],
                interest_tags: ['업무 효율성', '프로젝트 관리', '학습법', '건강 관리'],
                prompt: '당신은 전문적이고 실용적인 AI 어시스턴트 사라입니다. 효율적이고 체계적인 방식으로 업무와 일상생활에 도움이 되는 실용적인 조언을 제공하세요. 프로젝트 관리, 학습법, 건강 관리 등에 전문성을 갖고 있습니다.',
            },
            {
                name: '레오',
                gender: 'male',
                intro: '스포츠와 건강에 관심이 많은 활동적인 AI 코치입니다.',
                personality_tags: ['활동적', '동기부여', '열정적', '건강한'],
                interest_tags: ['운동', '스포츠', '건강한 식단', '아웃도어 활동'],
                prompt: '당신은 활동적이고 열정적인 AI 코치 레오입니다. 운동, 스포츠, 건강한 생활습관에 대해 동기부여가 되는 조언을 제공하세요. 사용자가 더 건강하고 활동적인 라이프스타일을 만들 수 있도록 도와주세요.',
            }
        ];
        // Create each character
        for (const charData of defaultCharacters) {
            await adminCharacterService.createCharacter(charData);
            console.log(`✅ Created character: ${charData.name}`);
        }
        notificationStore.success(`${defaultCharacters.length}개의 기본 캐릭터가 생성되었습니다!`);
        // Refresh the character list
        await fetchCharacters();
    }
    catch (error) {
        console.error('❌ Failed to create default characters:', error);
        notificationStore.error('기본 캐릭터 생성에 실패했습니다: ' + (error.message || '알 수 없는 오류'));
    }
    finally {
        creatingDefaults.value = false;
    }
};
onMounted(() => {
    fetchCharacters();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['create-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['character-card']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['gender-male']} */ ;
/** @type {__VLS_StyleScopedClasses['gender-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['gender-female']} */ ;
/** @type {__VLS_StyleScopedClasses['gender-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['status-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['status-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['character-info']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-header']} */ ;
/** @type {__VLS_StyleScopedClasses['tag']} */ ;
/** @type {__VLS_StyleScopedClasses['tag']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-header']} */ ;
/** @type {__VLS_StyleScopedClasses['stat']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['view']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['edit']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['delete']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['primary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['modal']} */ ;
/** @type {__VLS_StyleScopedClasses['modal']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['close-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['close-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['form-textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['tag']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-remove']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-remove']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['danger']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['large']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['large']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-info']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-item']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-section']} */ ;
/** @type {__VLS_StyleScopedClasses['tag']} */ ;
/** @type {__VLS_StyleScopedClasses['large']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['warning-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['create-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['controls-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['search-box']} */ ;
/** @type {__VLS_StyleScopedClasses['characters-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['form-row']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-info']} */ ;
/** @type {__VLS_StyleScopedClasses['current-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['large']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-guidelines']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-guidelines']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-guidelines']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-guidelines']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "character-management" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "header-content" },
});
__VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "subtitle" },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.showCreateModal = true;
            // @ts-ignore
            [showCreateModal,];
        } },
    ...{ class: "create-btn" },
});
__VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
    ...{ class: "btn-icon" },
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    'stroke-width': "2",
});
__VLS_asFunctionalElement(__VLS_elements.line, __VLS_elements.line)({
    x1: "12",
    y1: "5",
    x2: "12",
    y2: "19",
});
__VLS_asFunctionalElement(__VLS_elements.line, __VLS_elements.line)({
    x1: "5",
    y1: "12",
    x2: "19",
    y2: "12",
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "controls-bar" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "search-box" },
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
    ...{ onInput: (__VLS_ctx.handleSearch) },
    value: (__VLS_ctx.searchQuery),
    type: "text",
    placeholder: "캐릭터 검색...",
    ...{ class: "search-input" },
});
// @ts-ignore
[handleSearch, searchQuery,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "filter-group" },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.filterStatus = 'all';
            __VLS_ctx.handleFilterChange();
            // @ts-ignore
            [filterStatus, handleFilterChange,];
        } },
    ...{ class: (['filter-btn', { active: __VLS_ctx.filterStatus === 'all' }]) },
});
// @ts-ignore
[filterStatus,];
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.filterStatus = 'active';
            __VLS_ctx.handleFilterChange();
            // @ts-ignore
            [filterStatus, handleFilterChange,];
        } },
    ...{ class: (['filter-btn', { active: __VLS_ctx.filterStatus === 'active' }]) },
});
// @ts-ignore
[filterStatus,];
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.filterStatus = 'inactive';
            __VLS_ctx.handleFilterChange();
            // @ts-ignore
            [filterStatus, handleFilterChange,];
        } },
    ...{ class: (['filter-btn', { active: __VLS_ctx.filterStatus === 'inactive' }]) },
});
// @ts-ignore
[filterStatus,];
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
else if (__VLS_ctx.filteredCharacters.length > 0) {
    // @ts-ignore
    [filteredCharacters,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "characters-grid" },
    });
    for (const [character] of __VLS_getVForSourceType((__VLS_ctx.filteredCharacters))) {
        // @ts-ignore
        [filteredCharacters,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            key: (character.character_id),
            ...{ class: "character-card" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "card-header" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "avatar-section" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "avatar" },
            ...{ class: (`gender-${character.gender}`) },
        });
        if (__VLS_ctx.getAvatarUrl(character.avatar_url)) {
            // @ts-ignore
            [getAvatarUrl,];
            __VLS_asFunctionalElement(__VLS_elements.img)({
                ...{ onError: (__VLS_ctx.handleAvatarError) },
                src: (__VLS_ctx.getAvatarUrl(character.avatar_url)),
                alt: (character.name),
            });
            // @ts-ignore
            [getAvatarUrl, handleAvatarError,];
        }
        else {
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "avatar-placeholder" },
            });
            if (character.gender === 'male') {
                __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    'stroke-width': "2",
                });
                __VLS_asFunctionalElement(__VLS_elements.path)({
                    d: "M10 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z",
                });
                __VLS_asFunctionalElement(__VLS_elements.path)({
                    d: "M10 14v8m0 0l-3-3m3 3l3-3",
                });
                __VLS_asFunctionalElement(__VLS_elements.path)({
                    d: "M15 9V3h6m0 0-3 3m3-3-3 3",
                });
            }
            else if (character.gender === 'female') {
                __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    'stroke-width': "2",
                });
                __VLS_asFunctionalElement(__VLS_elements.circle)({
                    cx: "12",
                    cy: "8",
                    r: "5",
                });
                __VLS_asFunctionalElement(__VLS_elements.path)({
                    d: "M12 13v8m0 0h-3m3 0h3",
                });
            }
            else {
                __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    'stroke-width': "2",
                });
                __VLS_asFunctionalElement(__VLS_elements.circle)({
                    cx: "12",
                    cy: "12",
                    r: "5",
                });
                __VLS_asFunctionalElement(__VLS_elements.path)({
                    d: "M12 17v4",
                });
            }
        }
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "gender-badge" },
        });
        if (character.gender === 'male') {
            __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
                viewBox: "0 0 24 24",
                fill: "currentColor",
                ...{ class: "gender-icon" },
            });
            __VLS_asFunctionalElement(__VLS_elements.path)({
                d: "M15.05 7.05L12.22 9.88C13.3 11.03 13.3 12.88 12.21 14.03C11.1 15.18 9.18 15.18 8.04 14.03C6.91 12.88 6.91 10.97 8.04 9.82C9.17 8.68 11.09 8.68 12.23 9.82L15.05 7L15.76 7.71L16.47 7L19.29 9.82L18.58 10.53L17.87 11.24L17.16 10.53L15.76 9.13L13.64 11.25C14.52 12.61 14.52 14.44 13.64 15.8C12.52 17.5 10.33 17.97 8.63 17.09C6.94 16.22 6.46 14.03 7.34 12.33C8.22 10.63 10.41 10.16 12.11 11.04L13.52 9.63L15.05 8.1V7.05Z",
            });
            __VLS_asFunctionalElement(__VLS_elements.path)({
                d: "M15.05 4.05H21.05V10.05",
            });
        }
        else if (character.gender === 'female') {
            __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
                viewBox: "0 0 24 24",
                fill: "currentColor",
                ...{ class: "gender-icon" },
            });
            __VLS_asFunctionalElement(__VLS_elements.circle)({
                cx: "12",
                cy: "9",
                r: "4",
            });
            __VLS_asFunctionalElement(__VLS_elements.path)({
                d: "M12 13v4m-2 0h4m-2 0v4",
            });
        }
        else {
            __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
                viewBox: "0 0 24 24",
                fill: "currentColor",
                ...{ class: "gender-icon" },
            });
            __VLS_asFunctionalElement(__VLS_elements.path)({
                d: "M12 11.5A2.5 2.5 0 0 1 9.5 9A2.5 2.5 0 0 1 12 6.5A2.5 2.5 0 0 1 14.5 9A2.5 2.5 0 0 1 12 11.5M12 2A10 10 0 0 0 2 12A10 10 0 0 0 12 22A10 10 0 0 0 22 12A10 10 0 0 0 12 2Z",
            });
        }
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "status-indicator" },
            ...{ class: (character.is_active ? 'active' : 'inactive') },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "character-info" },
        });
        __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
        (character.name);
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "character-intro" },
        });
        (character.intro);
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "tags-container" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "tag-group" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "tag-header" },
        });
        __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "2",
        });
        __VLS_asFunctionalElement(__VLS_elements.path)({
            d: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z",
        });
        __VLS_asFunctionalElement(__VLS_elements.line)({
            x1: "7",
            y1: "7",
            x2: "7.01",
            y2: "7",
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "tags" },
        });
        for (const [tag] of __VLS_getVForSourceType((character.personality_tags))) {
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                key: (`p-${tag}`),
                ...{ class: "tag personality" },
            });
            (tag);
        }
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "tag-group" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "tag-header" },
        });
        __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "2",
        });
        __VLS_asFunctionalElement(__VLS_elements.polygon)({
            points: "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2",
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "tags" },
        });
        for (const [tag] of __VLS_getVForSourceType((character.interest_tags))) {
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                key: (`i-${tag}`),
                ...{ class: "tag interest" },
            });
            (tag);
        }
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "prompt-section" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "prompt-header" },
        });
        __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "2",
        });
        __VLS_asFunctionalElement(__VLS_elements.path)({
            d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
        });
        __VLS_asFunctionalElement(__VLS_elements.polyline)({
            points: "14 2 14 8 20 8",
        });
        __VLS_asFunctionalElement(__VLS_elements.line)({
            x1: "16",
            y1: "13",
            x2: "8",
            y2: "13",
        });
        __VLS_asFunctionalElement(__VLS_elements.line)({
            x1: "16",
            y1: "17",
            x2: "8",
            y2: "17",
        });
        __VLS_asFunctionalElement(__VLS_elements.polyline)({
            points: "10 9 9 9 8 9",
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "prompt-preview" },
        });
        (character.prompt);
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "card-footer" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "stats" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "stat" },
        });
        __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "2",
        });
        __VLS_asFunctionalElement(__VLS_elements.path)({
            d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
        (character.chat_count || 0);
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "stat" },
        });
        __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "2",
        });
        __VLS_asFunctionalElement(__VLS_elements.path)({
            d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2",
        });
        __VLS_asFunctionalElement(__VLS_elements.circle)({
            cx: "9",
            cy: "7",
            r: "4",
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
        (character.unique_users || 0);
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "actions" },
        });
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!(__VLS_ctx.filteredCharacters.length > 0))
                        return;
                    __VLS_ctx.viewCharacter(character);
                    // @ts-ignore
                    [viewCharacter,];
                } },
            ...{ class: "action-btn view" },
            title: "상세보기",
        });
        __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "2",
        });
        __VLS_asFunctionalElement(__VLS_elements.path)({
            d: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z",
        });
        __VLS_asFunctionalElement(__VLS_elements.circle)({
            cx: "12",
            cy: "12",
            r: "3",
        });
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!(__VLS_ctx.filteredCharacters.length > 0))
                        return;
                    __VLS_ctx.editCharacter(character);
                    // @ts-ignore
                    [editCharacter,];
                } },
            ...{ class: "action-btn edit" },
            title: "수정",
        });
        __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "2",
        });
        __VLS_asFunctionalElement(__VLS_elements.path)({
            d: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",
        });
        __VLS_asFunctionalElement(__VLS_elements.path)({
            d: "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
        });
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!(__VLS_ctx.filteredCharacters.length > 0))
                        return;
                    __VLS_ctx.manageAvatar(character);
                    // @ts-ignore
                    [manageAvatar,];
                } },
            ...{ class: "action-btn avatar" },
            title: "아바타 관리",
        });
        __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
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
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!(__VLS_ctx.filteredCharacters.length > 0))
                        return;
                    __VLS_ctx.toggleActive(character);
                    // @ts-ignore
                    [toggleActive,];
                } },
            ...{ class: "action-btn toggle" },
            title: (character.is_active ? '비활성화' : '활성화'),
        });
        if (character.is_active) {
            __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                'stroke-width': "2",
            });
            __VLS_asFunctionalElement(__VLS_elements.rect)({
                x: "5",
                y: "13",
                width: "14",
                height: "1",
                rx: "0.5",
                transform: "rotate(-45 12 12)",
            });
            __VLS_asFunctionalElement(__VLS_elements.rect)({
                x: "12",
                y: "6",
                width: "1",
                height: "14",
                rx: "0.5",
                transform: "rotate(-45 12 12)",
            });
        }
        else {
            __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                'stroke-width': "2",
            });
            __VLS_asFunctionalElement(__VLS_elements.polyline)({
                points: "20 6 9 17 4 12",
            });
        }
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!(__VLS_ctx.filteredCharacters.length > 0))
                        return;
                    __VLS_ctx.confirmDelete(character);
                    // @ts-ignore
                    [confirmDelete,];
                } },
            ...{ class: "action-btn delete" },
            title: "삭제",
        });
        __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "2",
        });
        __VLS_asFunctionalElement(__VLS_elements.polyline)({
            points: "3 6 5 6 21 6",
        });
        __VLS_asFunctionalElement(__VLS_elements.path)({
            d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
        });
    }
}
if (__VLS_ctx.totalPages > 1 && !__VLS_ctx.loading) {
    // @ts-ignore
    [loading, totalPages,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "pagination" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.totalPages > 1 && !__VLS_ctx.loading))
                    return;
                __VLS_ctx.changePage(__VLS_ctx.currentPage - 1);
                // @ts-ignore
                [changePage, currentPage,];
            } },
        disabled: (__VLS_ctx.currentPage === 1),
        ...{ class: "pagination-btn" },
    });
    // @ts-ignore
    [currentPage,];
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "2",
    });
    __VLS_asFunctionalElement(__VLS_elements.polyline, __VLS_elements.polyline)({
        points: "15 18 9 12 15 6",
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "pagination-info" },
    });
    (__VLS_ctx.currentPage);
    (__VLS_ctx.totalPages);
    // @ts-ignore
    [totalPages, currentPage,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.totalPages > 1 && !__VLS_ctx.loading))
                    return;
                __VLS_ctx.changePage(__VLS_ctx.currentPage + 1);
                // @ts-ignore
                [changePage, currentPage,];
            } },
        disabled: (__VLS_ctx.currentPage === __VLS_ctx.totalPages),
        ...{ class: "pagination-btn" },
    });
    // @ts-ignore
    [totalPages, currentPage,];
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "2",
    });
    __VLS_asFunctionalElement(__VLS_elements.polyline, __VLS_elements.polyline)({
        points: "9 18 15 12 9 6",
    });
}
else if (__VLS_ctx.characters.length === 0 && !__VLS_ctx.loading) {
    // @ts-ignore
    [loading, characters,];
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
    __VLS_asFunctionalElement(__VLS_elements.rect, __VLS_elements.rect)({
        x: "3",
        y: "11",
        width: "18",
        height: "10",
        rx: "2",
        ry: "2",
    });
    __VLS_asFunctionalElement(__VLS_elements.circle, __VLS_elements.circle)({
        cx: "12",
        cy: "5",
        r: "2",
    });
    __VLS_asFunctionalElement(__VLS_elements.path, __VLS_elements.path)({
        d: "M12 7v4",
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "empty-actions" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.totalPages > 1 && !__VLS_ctx.loading))
                    return;
                if (!(__VLS_ctx.characters.length === 0 && !__VLS_ctx.loading))
                    return;
                __VLS_ctx.showCreateModal = true;
                // @ts-ignore
                [showCreateModal,];
            } },
        ...{ class: "primary-btn" },
    });
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "2",
    });
    __VLS_asFunctionalElement(__VLS_elements.line, __VLS_elements.line)({
        x1: "12",
        y1: "5",
        x2: "12",
        y2: "19",
    });
    __VLS_asFunctionalElement(__VLS_elements.line, __VLS_elements.line)({
        x1: "5",
        y1: "12",
        x2: "19",
        y2: "12",
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.createDefaultCharacters) },
        ...{ class: "secondary-btn" },
        disabled: (__VLS_ctx.creatingDefaults),
    });
    // @ts-ignore
    [createDefaultCharacters, creatingDefaults,];
    if (!__VLS_ctx.creatingDefaults) {
        // @ts-ignore
        [creatingDefaults,];
        __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "2",
        });
        __VLS_asFunctionalElement(__VLS_elements.path, __VLS_elements.path)({
            d: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
        });
        __VLS_asFunctionalElement(__VLS_elements.polyline, __VLS_elements.polyline)({
            points: "9 22 9 12 15 12 15 22",
        });
    }
    else {
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "spinner-small" },
        });
    }
    (__VLS_ctx.creatingDefaults ? '생성 중...' : '기본 캐릭터 생성');
    // @ts-ignore
    [creatingDefaults,];
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
if (__VLS_ctx.showCreateModal || __VLS_ctx.editingCharacter) {
    // @ts-ignore
    [showCreateModal, editingCharacter,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ onClick: (__VLS_ctx.closeModal) },
        ...{ class: "modal-overlay" },
    });
    // @ts-ignore
    [closeModal,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ onClick: () => { } },
        ...{ class: "modal large" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-header" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
    (__VLS_ctx.editingCharacter ? '캐릭터 수정' : '새 캐릭터 추가');
    // @ts-ignore
    [editingCharacter,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.closeModal) },
        ...{ class: "close-btn" },
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
    __VLS_asFunctionalElement(__VLS_elements.form, __VLS_elements.form)({
        ...{ onSubmit: (__VLS_ctx.handleSubmit) },
        ...{ class: "modal-body" },
    });
    // @ts-ignore
    [handleSubmit,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "form-row" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        for: "name",
    });
    __VLS_asFunctionalElement(__VLS_elements.input)({
        id: "name",
        value: (__VLS_ctx.formData.name),
        type: "text",
        ...{ class: "form-input" },
        placeholder: "예: 친절한 도우미",
        required: true,
        maxlength: "50",
    });
    // @ts-ignore
    [formData,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        for: "gender",
    });
    __VLS_asFunctionalElement(__VLS_elements.select, __VLS_elements.select)({
        id: "gender",
        value: (__VLS_ctx.formData.gender),
        ...{ class: "form-input" },
        required: true,
    });
    // @ts-ignore
    [formData,];
    __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
        value: "male",
    });
    __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
        value: "female",
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        for: "intro",
    });
    __VLS_asFunctionalElement(__VLS_elements.textarea, __VLS_elements.textarea)({
        id: "intro",
        value: (__VLS_ctx.formData.intro),
        ...{ class: "form-textarea" },
        placeholder: "캐릭터를 간단히 소개해주세요...",
        rows: "2",
        required: true,
        maxlength: "200",
    });
    // @ts-ignore
    [formData,];
    __VLS_asFunctionalElement(__VLS_elements.small, __VLS_elements.small)({
        ...{ class: "char-count" },
    });
    (__VLS_ctx.formData.intro.length);
    // @ts-ignore
    [formData,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({});
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "tag-input-container" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "tags-display" },
    });
    for (const [tag, index] of __VLS_getVForSourceType((__VLS_ctx.formData.personality_tags))) {
        // @ts-ignore
        [formData,];
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            key: (`personality-${index}`),
            ...{ class: "tag editable" },
        });
        (tag);
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.showCreateModal || __VLS_ctx.editingCharacter))
                        return;
                    __VLS_ctx.removeTag('personality', index);
                    // @ts-ignore
                    [removeTag,];
                } },
            type: "button",
            ...{ class: "tag-remove" },
        });
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
    }
    __VLS_asFunctionalElement(__VLS_elements.input)({
        ...{ onKeydown: (...[$event]) => {
                if (!(__VLS_ctx.showCreateModal || __VLS_ctx.editingCharacter))
                    return;
                __VLS_ctx.addTag('personality');
                // @ts-ignore
                [addTag,];
            } },
        value: (__VLS_ctx.personalityTagInput),
        type: "text",
        ...{ class: "tag-input" },
        placeholder: "태그 입력 후 Enter",
    });
    // @ts-ignore
    [personalityTagInput,];
    __VLS_asFunctionalElement(__VLS_elements.small, __VLS_elements.small)({
        ...{ class: "help-text" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({});
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "tag-input-container" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "tags-display" },
    });
    for (const [tag, index] of __VLS_getVForSourceType((__VLS_ctx.formData.interest_tags))) {
        // @ts-ignore
        [formData,];
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            key: (`interest-${index}`),
            ...{ class: "tag editable" },
        });
        (tag);
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.showCreateModal || __VLS_ctx.editingCharacter))
                        return;
                    __VLS_ctx.removeTag('interest', index);
                    // @ts-ignore
                    [removeTag,];
                } },
            type: "button",
            ...{ class: "tag-remove" },
        });
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
    }
    __VLS_asFunctionalElement(__VLS_elements.input)({
        ...{ onKeydown: (...[$event]) => {
                if (!(__VLS_ctx.showCreateModal || __VLS_ctx.editingCharacter))
                    return;
                __VLS_ctx.addTag('interest');
                // @ts-ignore
                [addTag,];
            } },
        value: (__VLS_ctx.interestTagInput),
        type: "text",
        ...{ class: "tag-input" },
        placeholder: "태그 입력 후 Enter",
    });
    // @ts-ignore
    [interestTagInput,];
    __VLS_asFunctionalElement(__VLS_elements.small, __VLS_elements.small)({
        ...{ class: "help-text" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        for: "prompt",
    });
    __VLS_asFunctionalElement(__VLS_elements.textarea, __VLS_elements.textarea)({
        id: "prompt",
        value: (__VLS_ctx.formData.prompt),
        ...{ class: "form-textarea" },
        placeholder: "이 캐릭터의 성격, 역할, 행동 방식을 상세히 정의하세요...",
        rows: "6",
        required: true,
        maxlength: "2000",
    });
    // @ts-ignore
    [formData,];
    __VLS_asFunctionalElement(__VLS_elements.small, __VLS_elements.small)({
        ...{ class: "char-count" },
    });
    (__VLS_ctx.formData.prompt.length);
    // @ts-ignore
    [formData,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-footer" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.closeModal) },
        type: "button",
        ...{ class: "btn secondary" },
    });
    // @ts-ignore
    [closeModal,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        type: "submit",
        ...{ class: "btn primary" },
        disabled: (!__VLS_ctx.isFormValid),
    });
    // @ts-ignore
    [isFormValid,];
    (__VLS_ctx.editingCharacter ? '수정' : '추가');
    // @ts-ignore
    [editingCharacter,];
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
if (__VLS_ctx.viewingCharacter) {
    // @ts-ignore
    [viewingCharacter,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.viewingCharacter))
                    return;
                __VLS_ctx.viewingCharacter = null;
                // @ts-ignore
                [viewingCharacter,];
            } },
        ...{ class: "modal-overlay" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ onClick: () => { } },
        ...{ class: "modal large" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-header" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.viewingCharacter))
                    return;
                __VLS_ctx.viewingCharacter = null;
                // @ts-ignore
                [viewingCharacter,];
            } },
        ...{ class: "close-btn" },
    });
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
    if (__VLS_ctx.viewingCharacter) {
        // @ts-ignore
        [viewingCharacter,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "modal-body" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "character-detail" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "detail-header" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "avatar large" },
            ...{ class: (`gender-${__VLS_ctx.viewingCharacter.gender}`) },
        });
        // @ts-ignore
        [viewingCharacter,];
        if (__VLS_ctx.getAvatarUrl(__VLS_ctx.viewingCharacter.avatar_url)) {
            // @ts-ignore
            [getAvatarUrl, viewingCharacter,];
            __VLS_asFunctionalElement(__VLS_elements.img)({
                ...{ onError: (__VLS_ctx.handleAvatarError) },
                src: (__VLS_ctx.getAvatarUrl(__VLS_ctx.viewingCharacter.avatar_url)),
                alt: (__VLS_ctx.viewingCharacter.name),
            });
            // @ts-ignore
            [getAvatarUrl, handleAvatarError, viewingCharacter, viewingCharacter,];
        }
        else {
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "avatar-placeholder" },
            });
            if (__VLS_ctx.viewingCharacter.gender === 'male') {
                // @ts-ignore
                [viewingCharacter,];
                __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    'stroke-width': "2",
                });
                __VLS_asFunctionalElement(__VLS_elements.path)({
                    d: "M10 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z",
                });
                __VLS_asFunctionalElement(__VLS_elements.path)({
                    d: "M10 14v8m0 0l-3-3m3 3l3-3",
                });
                __VLS_asFunctionalElement(__VLS_elements.path)({
                    d: "M15 9V3h6m0 0-3 3m3-3-3 3",
                });
            }
            else if (__VLS_ctx.viewingCharacter.gender === 'female') {
                // @ts-ignore
                [viewingCharacter,];
                __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    'stroke-width': "2",
                });
                __VLS_asFunctionalElement(__VLS_elements.circle)({
                    cx: "12",
                    cy: "8",
                    r: "5",
                });
                __VLS_asFunctionalElement(__VLS_elements.path)({
                    d: "M12 13v8m0 0h-3m3 0h3",
                });
            }
            else {
                __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    'stroke-width': "2",
                });
                __VLS_asFunctionalElement(__VLS_elements.circle)({
                    cx: "12",
                    cy: "12",
                    r: "5",
                });
                __VLS_asFunctionalElement(__VLS_elements.path)({
                    d: "M12 17v4",
                });
            }
        }
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "detail-info" },
        });
        __VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({});
        (__VLS_ctx.viewingCharacter.name);
        // @ts-ignore
        [viewingCharacter,];
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "subtitle" },
        });
        (__VLS_ctx.viewingCharacter.intro);
        // @ts-ignore
        [viewingCharacter,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "meta-info" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "meta-item" },
        });
        __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "2",
        });
        __VLS_asFunctionalElement(__VLS_elements.rect)({
            x: "3",
            y: "4",
            width: "18",
            height: "18",
            rx: "2",
            ry: "2",
        });
        __VLS_asFunctionalElement(__VLS_elements.line)({
            x1: "16",
            y1: "2",
            x2: "16",
            y2: "6",
        });
        __VLS_asFunctionalElement(__VLS_elements.line)({
            x1: "8",
            y1: "2",
            x2: "8",
            y2: "6",
        });
        __VLS_asFunctionalElement(__VLS_elements.line)({
            x1: "3",
            y1: "10",
            x2: "21",
            y2: "10",
        });
        (__VLS_ctx.formatDate(__VLS_ctx.viewingCharacter.created_at));
        // @ts-ignore
        [viewingCharacter, formatDate,];
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "meta-item" },
        });
        __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "2",
        });
        __VLS_asFunctionalElement(__VLS_elements.circle)({
            cx: "12",
            cy: "12",
            r: "10",
        });
        __VLS_asFunctionalElement(__VLS_elements.path)({
            d: "M12 6v6l4 2",
        });
        (__VLS_ctx.formatDate(__VLS_ctx.viewingCharacter.updated_at));
        // @ts-ignore
        [viewingCharacter, formatDate,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "detail-section" },
        });
        __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({});
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "tags" },
        });
        for (const [tag] of __VLS_getVForSourceType((__VLS_ctx.viewingCharacter.personality_tags))) {
            // @ts-ignore
            [viewingCharacter,];
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                key: (`vp-${tag}`),
                ...{ class: "tag personality large" },
            });
            (tag);
        }
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "detail-section" },
        });
        __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({});
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "tags" },
        });
        for (const [tag] of __VLS_getVForSourceType((__VLS_ctx.viewingCharacter.interest_tags))) {
            // @ts-ignore
            [viewingCharacter,];
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                key: (`vi-${tag}`),
                ...{ class: "tag interest large" },
            });
            (tag);
        }
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "detail-section" },
        });
        __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({});
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "prompt-box" },
        });
        (__VLS_ctx.viewingCharacter.prompt);
        // @ts-ignore
        [viewingCharacter,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "detail-section" },
        });
        __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({});
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "stats-grid" },
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
        __VLS_asFunctionalElement(__VLS_elements.path)({
            d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "stat-content" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "stat-value" },
        });
        (__VLS_ctx.viewingCharacter.chat_count || 0);
        // @ts-ignore
        [viewingCharacter,];
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
        __VLS_asFunctionalElement(__VLS_elements.path)({
            d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2",
        });
        __VLS_asFunctionalElement(__VLS_elements.circle)({
            cx: "9",
            cy: "7",
            r: "4",
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "stat-content" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "stat-value" },
        });
        (__VLS_ctx.viewingCharacter.unique_users || 0);
        // @ts-ignore
        [viewingCharacter,];
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
        __VLS_asFunctionalElement(__VLS_elements.path)({
            d: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "stat-content" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "stat-value" },
        });
        (__VLS_ctx.formatNumber(__VLS_ctx.viewingCharacter.total_tokens || 0));
        // @ts-ignore
        [viewingCharacter, formatNumber,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "stat-label" },
        });
    }
}
var __VLS_8;
const __VLS_10 = {}.Teleport;
/** @type {[typeof __VLS_components.Teleport, typeof __VLS_components.Teleport, ]} */ ;
// @ts-ignore
Teleport;
// @ts-ignore
const __VLS_11 = __VLS_asFunctionalComponent(__VLS_10, new __VLS_10({
    to: "body",
}));
const __VLS_12 = __VLS_11({
    to: "body",
}, ...__VLS_functionalComponentArgsRest(__VLS_11));
const { default: __VLS_14 } = __VLS_13.slots;
if (__VLS_ctx.characterToDelete) {
    // @ts-ignore
    [characterToDelete,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.characterToDelete))
                    return;
                __VLS_ctx.characterToDelete = null;
                // @ts-ignore
                [characterToDelete,];
            } },
        ...{ class: "modal-overlay" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ onClick: () => { } },
        ...{ class: "modal confirm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-header" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-body" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "warning-icon" },
    });
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "2",
    });
    __VLS_asFunctionalElement(__VLS_elements.path)({
        d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z",
    });
    __VLS_asFunctionalElement(__VLS_elements.line)({
        x1: "12",
        y1: "9",
        x2: "12",
        y2: "13",
    });
    __VLS_asFunctionalElement(__VLS_elements.line)({
        x1: "12",
        y1: "17",
        x2: "12.01",
        y2: "17",
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "confirm-message" },
    });
    __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
    (__VLS_ctx.characterToDelete.name);
    // @ts-ignore
    [characterToDelete,];
    if (__VLS_ctx.characterToDelete.chat_count && __VLS_ctx.characterToDelete.chat_count > 0) {
        // @ts-ignore
        [characterToDelete, characterToDelete,];
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "warning-message" },
        });
        (__VLS_ctx.characterToDelete.chat_count);
        // @ts-ignore
        [characterToDelete,];
    }
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-footer" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.characterToDelete))
                    return;
                __VLS_ctx.characterToDelete = null;
                // @ts-ignore
                [characterToDelete,];
            } },
        ...{ class: "btn secondary" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.deleteCharacter) },
        ...{ class: "btn danger" },
    });
    // @ts-ignore
    [deleteCharacter,];
}
var __VLS_13;
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
if (__VLS_ctx.managingAvatarCharacter) {
    // @ts-ignore
    [managingAvatarCharacter,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.managingAvatarCharacter))
                    return;
                __VLS_ctx.managingAvatarCharacter = null;
                // @ts-ignore
                [managingAvatarCharacter,];
            } },
        ...{ class: "modal-overlay" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ onClick: () => { } },
        ...{ class: "modal confirm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-header" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
    (__VLS_ctx.managingAvatarCharacter.name);
    // @ts-ignore
    [managingAvatarCharacter,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.managingAvatarCharacter))
                    return;
                __VLS_ctx.managingAvatarCharacter = null;
                // @ts-ignore
                [managingAvatarCharacter,];
            } },
        ...{ class: "close-btn" },
    });
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
        ...{ class: "modal-body" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "avatar-management" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "current-avatar" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "avatar large" },
        ...{ class: (`gender-${__VLS_ctx.managingAvatarCharacter.gender}`) },
    });
    // @ts-ignore
    [managingAvatarCharacter,];
    if (__VLS_ctx.getAvatarUrl(__VLS_ctx.managingAvatarCharacter.avatar_url)) {
        // @ts-ignore
        [getAvatarUrl, managingAvatarCharacter,];
        __VLS_asFunctionalElement(__VLS_elements.img)({
            ...{ onError: (__VLS_ctx.handleAvatarError) },
            src: (__VLS_ctx.getAvatarUrl(__VLS_ctx.managingAvatarCharacter.avatar_url)),
            alt: (__VLS_ctx.managingAvatarCharacter.name),
        });
        // @ts-ignore
        [getAvatarUrl, handleAvatarError, managingAvatarCharacter, managingAvatarCharacter,];
    }
    else {
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "avatar-placeholder" },
        });
        if (__VLS_ctx.managingAvatarCharacter.gender === 'male') {
            // @ts-ignore
            [managingAvatarCharacter,];
            __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                'stroke-width': "2",
            });
            __VLS_asFunctionalElement(__VLS_elements.path)({
                d: "M10 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z",
            });
            __VLS_asFunctionalElement(__VLS_elements.path)({
                d: "M10 14v8m0 0l-3-3m3 3l3-3",
            });
            __VLS_asFunctionalElement(__VLS_elements.path)({
                d: "M15 9V3h6m0 0-3 3m3-3-3 3",
            });
        }
        else if (__VLS_ctx.managingAvatarCharacter.gender === 'female') {
            // @ts-ignore
            [managingAvatarCharacter,];
            __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                'stroke-width': "2",
            });
            __VLS_asFunctionalElement(__VLS_elements.circle)({
                cx: "12",
                cy: "8",
                r: "5",
            });
            __VLS_asFunctionalElement(__VLS_elements.path)({
                d: "M12 13v8m0 0h-3m3 0h3",
            });
        }
        else {
            __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                'stroke-width': "2",
            });
            __VLS_asFunctionalElement(__VLS_elements.circle)({
                cx: "12",
                cy: "12",
                r: "5",
            });
            __VLS_asFunctionalElement(__VLS_elements.path)({
                d: "M12 17v4",
            });
        }
    }
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "avatar-status" },
    });
    (__VLS_ctx.managingAvatarCharacter.avatar_url ? '아바타 이미지 설정됨' : '기본 아바타 사용 중');
    // @ts-ignore
    [managingAvatarCharacter,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "upload-section" },
    });
    __VLS_asFunctionalElement(__VLS_elements.input)({
        ...{ onChange: (__VLS_ctx.handleAvatarFileSelect) },
        ref: "avatarFileInput",
        type: "file",
        accept: "image/*",
        ...{ class: "file-input" },
        ...{ style: {} },
    });
    /** @type {typeof __VLS_ctx.avatarFileInput} */ ;
    // @ts-ignore
    [handleAvatarFileSelect, avatarFileInput,];
    if (__VLS_ctx.avatarPreview) {
        // @ts-ignore
        [avatarPreview,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "preview-section" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "preview-container" },
        });
        __VLS_asFunctionalElement(__VLS_elements.img)({
            src: (__VLS_ctx.avatarPreview),
            alt: "Preview",
            ...{ class: "preview-image" },
        });
        // @ts-ignore
        [avatarPreview,];
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "preview-text" },
        });
    }
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "upload-actions" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.triggerFileInput) },
        ...{ class: "btn secondary" },
    });
    // @ts-ignore
    [triggerFileInput,];
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "2",
    });
    __VLS_asFunctionalElement(__VLS_elements.path)({
        d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",
    });
    __VLS_asFunctionalElement(__VLS_elements.polyline)({
        points: "7 10 12 15 17 10",
    });
    __VLS_asFunctionalElement(__VLS_elements.line)({
        x1: "12",
        y1: "15",
        x2: "12",
        y2: "3",
    });
    (__VLS_ctx.selectedAvatarFile ? '다른 파일 선택' : '파일 선택');
    // @ts-ignore
    [selectedAvatarFile,];
    if (__VLS_ctx.selectedAvatarFile) {
        // @ts-ignore
        [selectedAvatarFile,];
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (__VLS_ctx.uploadAvatar) },
            disabled: (__VLS_ctx.uploadingAvatar),
            ...{ class: "btn primary" },
        });
        // @ts-ignore
        [uploadAvatar, uploadingAvatar,];
        if (__VLS_ctx.uploadingAvatar) {
            // @ts-ignore
            [uploadingAvatar,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "spinner-small" },
            });
        }
        else {
            __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                'stroke-width': "2",
            });
            __VLS_asFunctionalElement(__VLS_elements.path)({
                d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",
            });
            __VLS_asFunctionalElement(__VLS_elements.polyline)({
                points: "17 8 12 3 7 8",
            });
            __VLS_asFunctionalElement(__VLS_elements.line)({
                x1: "12",
                y1: "3",
                x2: "12",
                y2: "15",
            });
        }
        (__VLS_ctx.uploadingAvatar ? '업로드 중...' : '아바타 업로드');
        // @ts-ignore
        [uploadingAvatar,];
    }
    if (__VLS_ctx.managingAvatarCharacter.avatar_url) {
        // @ts-ignore
        [managingAvatarCharacter,];
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (__VLS_ctx.deleteAvatar) },
            disabled: (__VLS_ctx.deletingAvatar),
            ...{ class: "btn danger" },
        });
        // @ts-ignore
        [deleteAvatar, deletingAvatar,];
        if (__VLS_ctx.deletingAvatar) {
            // @ts-ignore
            [deletingAvatar,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "spinner-small" },
            });
        }
        else {
            __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                'stroke-width': "2",
            });
            __VLS_asFunctionalElement(__VLS_elements.polyline)({
                points: "3 6 5 6 21 6",
            });
            __VLS_asFunctionalElement(__VLS_elements.path)({
                d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
            });
        }
        (__VLS_ctx.deletingAvatar ? '삭제 중...' : '아바타 삭제');
        // @ts-ignore
        [deletingAvatar,];
    }
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "upload-guidelines" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({});
    __VLS_asFunctionalElement(__VLS_elements.ul, __VLS_elements.ul)({});
    __VLS_asFunctionalElement(__VLS_elements.li, __VLS_elements.li)({});
    __VLS_asFunctionalElement(__VLS_elements.li, __VLS_elements.li)({});
    __VLS_asFunctionalElement(__VLS_elements.li, __VLS_elements.li)({});
}
var __VLS_18;
/** @type {__VLS_StyleScopedClasses['character-management']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-content']} */ ;
/** @type {__VLS_StyleScopedClasses['subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['create-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['controls-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['search-box']} */ ;
/** @type {__VLS_StyleScopedClasses['search-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-group']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-state']} */ ;
/** @type {__VLS_StyleScopedClasses['spinner']} */ ;
/** @type {__VLS_StyleScopedClasses['characters-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['character-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-section']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['gender-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['gender-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['gender-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['gender-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['status-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['character-info']} */ ;
/** @type {__VLS_StyleScopedClasses['character-intro']} */ ;
/** @type {__VLS_StyleScopedClasses['tags-container']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-group']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-header']} */ ;
/** @type {__VLS_StyleScopedClasses['tags']} */ ;
/** @type {__VLS_StyleScopedClasses['tag']} */ ;
/** @type {__VLS_StyleScopedClasses['personality']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-group']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-header']} */ ;
/** @type {__VLS_StyleScopedClasses['tags']} */ ;
/** @type {__VLS_StyleScopedClasses['tag']} */ ;
/** @type {__VLS_StyleScopedClasses['interest']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-section']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-header']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['card-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['stats']} */ ;
/** @type {__VLS_StyleScopedClasses['stat']} */ ;
/** @type {__VLS_StyleScopedClasses['stat']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['view']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['edit']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['delete']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination-info']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['primary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['spinner-small']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['modal']} */ ;
/** @type {__VLS_StyleScopedClasses['large']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['close-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['form-row']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['char-count']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-input-container']} */ ;
/** @type {__VLS_StyleScopedClasses['tags-display']} */ ;
/** @type {__VLS_StyleScopedClasses['tag']} */ ;
/** @type {__VLS_StyleScopedClasses['editable']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-remove']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-input']} */ ;
/** @type {__VLS_StyleScopedClasses['help-text']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-input-container']} */ ;
/** @type {__VLS_StyleScopedClasses['tags-display']} */ ;
/** @type {__VLS_StyleScopedClasses['tag']} */ ;
/** @type {__VLS_StyleScopedClasses['editable']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-remove']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-input']} */ ;
/** @type {__VLS_StyleScopedClasses['help-text']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['char-count']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['modal']} */ ;
/** @type {__VLS_StyleScopedClasses['large']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['close-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['character-detail']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-header']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['large']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-info']} */ ;
/** @type {__VLS_StyleScopedClasses['subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-info']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-item']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-item']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-section']} */ ;
/** @type {__VLS_StyleScopedClasses['tags']} */ ;
/** @type {__VLS_StyleScopedClasses['tag']} */ ;
/** @type {__VLS_StyleScopedClasses['personality']} */ ;
/** @type {__VLS_StyleScopedClasses['large']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-section']} */ ;
/** @type {__VLS_StyleScopedClasses['tags']} */ ;
/** @type {__VLS_StyleScopedClasses['tag']} */ ;
/** @type {__VLS_StyleScopedClasses['interest']} */ ;
/** @type {__VLS_StyleScopedClasses['large']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-section']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-box']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-section']} */ ;
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
/** @type {__VLS_StyleScopedClasses['modal-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['modal']} */ ;
/** @type {__VLS_StyleScopedClasses['confirm']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['warning-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['confirm-message']} */ ;
/** @type {__VLS_StyleScopedClasses['warning-message']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['danger']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['modal']} */ ;
/** @type {__VLS_StyleScopedClasses['confirm']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['close-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-management']} */ ;
/** @type {__VLS_StyleScopedClasses['current-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['large']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-status']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-section']} */ ;
/** @type {__VLS_StyleScopedClasses['file-input']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-section']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-container']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-image']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-text']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['spinner-small']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['danger']} */ ;
/** @type {__VLS_StyleScopedClasses['spinner-small']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-guidelines']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            getAvatarUrl: getAvatarUrl,
            handleAvatarError: handleAvatarError,
            characters: characters,
            loading: loading,
            searchQuery: searchQuery,
            filterStatus: filterStatus,
            showCreateModal: showCreateModal,
            editingCharacter: editingCharacter,
            viewingCharacter: viewingCharacter,
            characterToDelete: characterToDelete,
            managingAvatarCharacter: managingAvatarCharacter,
            selectedAvatarFile: selectedAvatarFile,
            avatarPreview: avatarPreview,
            uploadingAvatar: uploadingAvatar,
            deletingAvatar: deletingAvatar,
            avatarFileInput: avatarFileInput,
            currentPage: currentPage,
            creatingDefaults: creatingDefaults,
            personalityTagInput: personalityTagInput,
            interestTagInput: interestTagInput,
            formData: formData,
            filteredCharacters: filteredCharacters,
            totalPages: totalPages,
            isFormValid: isFormValid,
            formatDate: formatDate,
            formatNumber: formatNumber,
            addTag: addTag,
            removeTag: removeTag,
            viewCharacter: viewCharacter,
            editCharacter: editCharacter,
            closeModal: closeModal,
            handleSubmit: handleSubmit,
            toggleActive: toggleActive,
            confirmDelete: confirmDelete,
            deleteCharacter: deleteCharacter,
            manageAvatar: manageAvatar,
            triggerFileInput: triggerFileInput,
            handleAvatarFileSelect: handleAvatarFileSelect,
            uploadAvatar: uploadAvatar,
            deleteAvatar: deleteAvatar,
            handleSearch: handleSearch,
            handleFilterChange: handleFilterChange,
            changePage: changePage,
            createDefaultCharacters: createDefaultCharacters,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
    },
});
; /* PartiallyEnd: #4569/main.vue */

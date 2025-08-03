import { ref, reactive, onMounted } from 'vue';
import { characterService, } from '../../services/character.service';
// State
const characters = ref([]);
const loading = ref(false);
const saving = ref(false);
const error = ref('');
const showCreateModal = ref(false);
const editingCharacter = ref(null);
const characterToDelete = ref(null);
// Form data
const formData = reactive({
    name: '',
    system_prompt: '',
});
// Format date
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
};
// Fetch characters
const fetchCharacters = async () => {
    loading.value = true;
    error.value = '';
    try {
        characters.value = await characterService.getCharacters();
    }
    catch (err) {
        error.value = err.response?.data?.detail || '캐릭터 목록을 불러오는 중 오류가 발생했습니다.';
    }
    finally {
        loading.value = false;
    }
};
// Create/Edit handlers
const editCharacter = (character) => {
    editingCharacter.value = character;
    formData.name = character.name;
    formData.system_prompt = character.system_prompt;
};
const closeModal = () => {
    showCreateModal.value = false;
    editingCharacter.value = null;
    formData.name = '';
    formData.system_prompt = '';
};
const handleSubmit = async () => {
    saving.value = true;
    try {
        if (editingCharacter.value) {
            // Update existing character
            const updated = await characterService.updateCharacter(editingCharacter.value.id, formData);
            // Update in list
            const index = characters.value.findIndex((c) => c.id === editingCharacter.value.id);
            if (index !== -1) {
                characters.value[index] = { ...characters.value[index], ...updated };
            }
        }
        else {
            // Create new character
            const newCharacter = await characterService.createCharacter(formData);
            characters.value.push(newCharacter);
        }
        closeModal();
    }
    catch (err) {
        alert(err.response?.data?.detail || '저장 중 오류가 발생했습니다.');
    }
    finally {
        saving.value = false;
    }
};
// Delete handlers
const confirmDelete = (character) => {
    characterToDelete.value = character;
};
const deleteCharacter = async () => {
    if (!characterToDelete.value)
        return;
    try {
        await characterService.deleteCharacter(characterToDelete.value.id);
        characters.value = characters.value.filter((c) => c.id !== characterToDelete.value.id);
        characterToDelete.value = null;
    }
    catch (err) {
        alert(err.response?.data?.detail || '캐릭터 삭제 중 오류가 발생했습니다.');
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
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['create-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['character-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['edit']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['delete']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['form-textarea']} */ ;
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
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['create-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['characters-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['card-footer']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "character-management" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.showCreateModal = true;
            // @ts-ignore
            [showCreateModal,];
        } },
    ...{ class: "create-btn" },
});
__VLS_asFunctionalElement(__VLS_elements.i, __VLS_elements.i)({});
if (__VLS_ctx.loading && !__VLS_ctx.characters.length) {
    // @ts-ignore
    [loading, characters,];
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
        ...{ onClick: (__VLS_ctx.fetchCharacters) },
        ...{ class: "retry-btn" },
    });
    // @ts-ignore
    [fetchCharacters,];
}
else if (__VLS_ctx.characters.length > 0) {
    // @ts-ignore
    [characters,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "characters-grid" },
    });
    for (const [character] of __VLS_getVForSourceType((__VLS_ctx.characters))) {
        // @ts-ignore
        [characters,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            key: (character.id),
            ...{ class: "character-card" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "card-header" },
        });
        __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
        (character.name);
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "card-actions" },
        });
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading && !__VLS_ctx.characters.length))
                        return;
                    if (!!(__VLS_ctx.error))
                        return;
                    if (!(__VLS_ctx.characters.length > 0))
                        return;
                    __VLS_ctx.editCharacter(character);
                    // @ts-ignore
                    [editCharacter,];
                } },
            ...{ class: "icon-btn edit" },
            title: "수정",
        });
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading && !__VLS_ctx.characters.length))
                        return;
                    if (!!(__VLS_ctx.error))
                        return;
                    if (!(__VLS_ctx.characters.length > 0))
                        return;
                    __VLS_ctx.confirmDelete(character);
                    // @ts-ignore
                    [confirmDelete,];
                } },
            ...{ class: "icon-btn delete" },
            title: "삭제",
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "card-body" },
        });
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "system-prompt" },
        });
        (character.system_prompt);
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "card-footer" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "stat" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "stat-label" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "stat-value" },
        });
        (character.chat_count || 0);
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "stat" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "stat-label" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "stat-value" },
        });
        (character.total_messages || 0);
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "stat" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "stat-label" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "stat-value" },
        });
        (__VLS_ctx.formatDate(character.created_at));
        // @ts-ignore
        [formatDate,];
    }
}
else {
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "empty-state" },
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.loading && !__VLS_ctx.characters.length))
                    return;
                if (!!(__VLS_ctx.error))
                    return;
                if (!!(__VLS_ctx.characters.length > 0))
                    return;
                __VLS_ctx.showCreateModal = true;
                // @ts-ignore
                [showCreateModal,];
            } },
        ...{ class: "create-btn" },
    });
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
        ...{ class: "modal" },
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
    __VLS_asFunctionalElement(__VLS_elements.form, __VLS_elements.form)({
        ...{ onSubmit: (__VLS_ctx.handleSubmit) },
        ...{ class: "modal-body" },
    });
    // @ts-ignore
    [handleSubmit,];
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
        placeholder: "예: 코딩 도우미",
        required: true,
        maxlength: "50",
    });
    // @ts-ignore
    [formData,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        for: "system_prompt",
    });
    __VLS_asFunctionalElement(__VLS_elements.textarea, __VLS_elements.textarea)({
        id: "system_prompt",
        value: (__VLS_ctx.formData.system_prompt),
        ...{ class: "form-textarea" },
        placeholder: "이 캐릭터의 성격, 역할, 행동 방식을 정의하세요...",
        rows: "6",
        required: true,
        maxlength: "1000",
    });
    // @ts-ignore
    [formData,];
    __VLS_asFunctionalElement(__VLS_elements.small, __VLS_elements.small)({
        ...{ class: "char-count" },
    });
    (__VLS_ctx.formData.system_prompt.length);
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
        disabled: (__VLS_ctx.saving),
    });
    // @ts-ignore
    [saving,];
    (__VLS_ctx.saving ? '저장 중...' : __VLS_ctx.editingCharacter ? '수정' : '추가');
    // @ts-ignore
    [editingCharacter, saving,];
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
var __VLS_8;
/** @type {__VLS_StyleScopedClasses['character-management']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['create-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-state']} */ ;
/** @type {__VLS_StyleScopedClasses['spinner']} */ ;
/** @type {__VLS_StyleScopedClasses['error-state']} */ ;
/** @type {__VLS_StyleScopedClasses['retry-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['characters-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['character-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['card-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['edit']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['delete']} */ ;
/** @type {__VLS_StyleScopedClasses['card-body']} */ ;
/** @type {__VLS_StyleScopedClasses['system-prompt']} */ ;
/** @type {__VLS_StyleScopedClasses['card-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['stat']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['create-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['modal']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['close-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
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
/** @type {__VLS_StyleScopedClasses['confirm-modal']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['confirm-message']} */ ;
/** @type {__VLS_StyleScopedClasses['warning-message']} */ ;
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
            loading: loading,
            saving: saving,
            error: error,
            showCreateModal: showCreateModal,
            editingCharacter: editingCharacter,
            characterToDelete: characterToDelete,
            formData: formData,
            formatDate: formatDate,
            fetchCharacters: fetchCharacters,
            editCharacter: editCharacter,
            closeModal: closeModal,
            handleSubmit: handleSubmit,
            confirmDelete: confirmDelete,
            deleteCharacter: deleteCharacter,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
    },
});
; /* PartiallyEnd: #4569/main.vue */

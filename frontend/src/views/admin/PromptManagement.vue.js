import { ref, reactive, onMounted } from 'vue';
import { promptService, } from '../../services/prompt.service';
// State
const prompts = ref([]);
const loading = ref(false);
const saving = ref(false);
const error = ref('');
const showCreateModal = ref(false);
const editingPrompt = ref(null);
const promptToDelete = ref(null);
// Toast notification
const toast = reactive({
    show: false,
    message: '',
    type: 'success', // 'success' | 'error'
});
// Form data
const formData = reactive({
    name: '',
    prompt_text: '',
});
// Format date
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
};
// Show toast notification
const showToast = (message, type = 'success') => {
    toast.message = message;
    toast.type = type;
    toast.show = true;
    setTimeout(() => {
        toast.show = false;
    }, 3000);
};
// Copy to clipboard
const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        showToast('프롬프트가 클립보드에 복사되었습니다!', 'success');
    }
    catch (err) {
        showToast('클립보드 복사에 실패했습니다.', 'error');
    }
};
// Fetch prompts
const fetchPrompts = async () => {
    loading.value = true;
    error.value = '';
    try {
        prompts.value = await promptService.getPrompts();
    }
    catch (err) {
        error.value = err.response?.data?.detail || '프롬프트 목록을 불러오는 중 오류가 발생했습니다.';
    }
    finally {
        loading.value = false;
    }
};
// Create/Edit handlers
const editPrompt = (prompt) => {
    editingPrompt.value = prompt;
    formData.name = prompt.name;
    formData.prompt_text = prompt.prompt_text;
};
const closeModal = () => {
    showCreateModal.value = false;
    editingPrompt.value = null;
    formData.name = '';
    formData.prompt_text = '';
};
const handleSubmit = async () => {
    saving.value = true;
    try {
        if (editingPrompt.value) {
            // Update existing prompt
            const updated = await promptService.updatePrompt(editingPrompt.value.id, formData);
            // Update in list
            const index = prompts.value.findIndex((p) => p.id === editingPrompt.value.id);
            if (index !== -1) {
                prompts.value[index] = updated;
            }
            showToast('프롬프트가 수정되었습니다!', 'success');
        }
        else {
            // Create new prompt
            const newPrompt = await promptService.createPrompt(formData);
            prompts.value.unshift(newPrompt);
            showToast('프롬프트가 추가되었습니다!', 'success');
        }
        closeModal();
    }
    catch (err) {
        showToast(err.response?.data?.detail || '저장 중 오류가 발생했습니다.', 'error');
    }
    finally {
        saving.value = false;
    }
};
// Delete handlers
const confirmDelete = (prompt) => {
    promptToDelete.value = prompt;
};
const deletePrompt = async () => {
    if (!promptToDelete.value)
        return;
    try {
        await promptService.deletePrompt(promptToDelete.value.id);
        prompts.value = prompts.value.filter((p) => p.id !== promptToDelete.value.id);
        promptToDelete.value = null;
        showToast('프롬프트가 삭제되었습니다!', 'success');
    }
    catch (err) {
        showToast(err.response?.data?.detail || '프롬프트 삭제 중 오류가 발생했습니다.', 'error');
    }
};
onMounted(() => {
    fetchPrompts();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['create-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-item']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-item']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-header']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['copy']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['edit']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['delete']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['form-textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['template-tips']} */ ;
/** @type {__VLS_StyleScopedClasses['template-tips']} */ ;
/** @type {__VLS_StyleScopedClasses['template-tips']} */ ;
/** @type {__VLS_StyleScopedClasses['template-tips']} */ ;
/** @type {__VLS_StyleScopedClasses['template-tips']} */ ;
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
/** @type {__VLS_StyleScopedClasses['toast']} */ ;
/** @type {__VLS_StyleScopedClasses['toast']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['create-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-header']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['toast']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "prompt-management" },
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
if (__VLS_ctx.loading && !__VLS_ctx.prompts.length) {
    // @ts-ignore
    [loading, prompts,];
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
        ...{ onClick: (__VLS_ctx.fetchPrompts) },
        ...{ class: "retry-btn" },
    });
    // @ts-ignore
    [fetchPrompts,];
}
else if (__VLS_ctx.prompts.length > 0) {
    // @ts-ignore
    [prompts,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "prompts-container" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "prompts-list" },
    });
    for (const [prompt] of __VLS_getVForSourceType((__VLS_ctx.prompts))) {
        // @ts-ignore
        [prompts,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            key: (prompt.id),
            ...{ class: "prompt-item" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "prompt-header" },
        });
        __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({});
        (prompt.name);
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "prompt-actions" },
        });
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading && !__VLS_ctx.prompts.length))
                        return;
                    if (!!(__VLS_ctx.error))
                        return;
                    if (!(__VLS_ctx.prompts.length > 0))
                        return;
                    __VLS_ctx.copyToClipboard(prompt.prompt_text);
                    // @ts-ignore
                    [copyToClipboard,];
                } },
            ...{ class: "action-btn copy" },
            title: "복사",
        });
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading && !__VLS_ctx.prompts.length))
                        return;
                    if (!!(__VLS_ctx.error))
                        return;
                    if (!(__VLS_ctx.prompts.length > 0))
                        return;
                    __VLS_ctx.editPrompt(prompt);
                    // @ts-ignore
                    [editPrompt,];
                } },
            ...{ class: "action-btn edit" },
            title: "수정",
        });
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading && !__VLS_ctx.prompts.length))
                        return;
                    if (!!(__VLS_ctx.error))
                        return;
                    if (!(__VLS_ctx.prompts.length > 0))
                        return;
                    __VLS_ctx.confirmDelete(prompt);
                    // @ts-ignore
                    [confirmDelete,];
                } },
            ...{ class: "action-btn delete" },
            title: "삭제",
        });
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "prompt-text" },
        });
        (prompt.prompt_text);
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "prompt-meta" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "meta-item" },
        });
        __VLS_asFunctionalElement(__VLS_elements.i, __VLS_elements.i)({});
        (__VLS_ctx.formatDate(prompt.created_at));
        // @ts-ignore
        [formatDate,];
        if (prompt.updated_at !== prompt.created_at) {
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "meta-item" },
            });
            __VLS_asFunctionalElement(__VLS_elements.i, __VLS_elements.i)({});
            (__VLS_ctx.formatDate(prompt.updated_at));
            // @ts-ignore
            [formatDate,];
        }
    }
}
else {
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "empty-state" },
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.loading && !__VLS_ctx.prompts.length))
                    return;
                if (!!(__VLS_ctx.error))
                    return;
                if (!!(__VLS_ctx.prompts.length > 0))
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
if (__VLS_ctx.showCreateModal || __VLS_ctx.editingPrompt) {
    // @ts-ignore
    [showCreateModal, editingPrompt,];
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
    (__VLS_ctx.editingPrompt ? '프롬프트 수정' : '새 프롬프트 추가');
    // @ts-ignore
    [editingPrompt,];
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
        placeholder: "예: 코드 리뷰 요청",
        required: true,
        maxlength: "100",
    });
    // @ts-ignore
    [formData,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        for: "prompt_text",
    });
    __VLS_asFunctionalElement(__VLS_elements.textarea, __VLS_elements.textarea)({
        id: "prompt_text",
        value: (__VLS_ctx.formData.prompt_text),
        ...{ class: "form-textarea" },
        placeholder: "사용자가 쉽게 사용할 수 있는 프롬프트 템플릿을 작성하세요...",
        rows: "8",
        required: true,
        maxlength: "2000",
    });
    // @ts-ignore
    [formData,];
    __VLS_asFunctionalElement(__VLS_elements.small, __VLS_elements.small)({
        ...{ class: "char-count" },
    });
    (__VLS_ctx.formData.prompt_text.length);
    // @ts-ignore
    [formData,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "template-tips" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h5, __VLS_elements.h5)({});
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
    __VLS_asFunctionalElement(__VLS_elements.ul, __VLS_elements.ul)({});
    __VLS_asFunctionalElement(__VLS_elements.li, __VLS_elements.li)({});
    __VLS_asFunctionalElement(__VLS_elements.code, __VLS_elements.code)({});
    __VLS_asFunctionalElement(__VLS_elements.li, __VLS_elements.li)({});
    __VLS_asFunctionalElement(__VLS_elements.code, __VLS_elements.code)({});
    __VLS_asFunctionalElement(__VLS_elements.li, __VLS_elements.li)({});
    __VLS_asFunctionalElement(__VLS_elements.code, __VLS_elements.code)({});
    __VLS_asFunctionalElement(__VLS_elements.li, __VLS_elements.li)({});
    __VLS_asFunctionalElement(__VLS_elements.code, __VLS_elements.code)({});
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "example" },
    });
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
    (__VLS_ctx.saving ? '저장 중...' : __VLS_ctx.editingPrompt ? '수정' : '추가');
    // @ts-ignore
    [editingPrompt, saving,];
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
if (__VLS_ctx.promptToDelete) {
    // @ts-ignore
    [promptToDelete,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.promptToDelete))
                    return;
                __VLS_ctx.promptToDelete = null;
                // @ts-ignore
                [promptToDelete,];
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
    (__VLS_ctx.promptToDelete.name);
    // @ts-ignore
    [promptToDelete,];
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "warning-message" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-footer" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.promptToDelete))
                    return;
                __VLS_ctx.promptToDelete = null;
                // @ts-ignore
                [promptToDelete,];
            } },
        ...{ class: "btn secondary" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.deletePrompt) },
        ...{ class: "btn danger" },
    });
    // @ts-ignore
    [deletePrompt,];
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
const __VLS_15 = {}.transition;
/** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
// @ts-ignore
Transition;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({
    name: "toast",
}));
const __VLS_17 = __VLS_16({
    name: "toast",
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
const { default: __VLS_19 } = __VLS_18.slots;
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
var __VLS_18;
var __VLS_13;
/** @type {__VLS_StyleScopedClasses['prompt-management']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['create-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-state']} */ ;
/** @type {__VLS_StyleScopedClasses['spinner']} */ ;
/** @type {__VLS_StyleScopedClasses['error-state']} */ ;
/** @type {__VLS_StyleScopedClasses['retry-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['prompts-container']} */ ;
/** @type {__VLS_StyleScopedClasses['prompts-list']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-item']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-header']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['copy']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['edit']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['delete']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-text']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-item']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-item']} */ ;
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
/** @type {__VLS_StyleScopedClasses['template-tips']} */ ;
/** @type {__VLS_StyleScopedClasses['example']} */ ;
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
/** @type {__VLS_StyleScopedClasses['toast']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            prompts: prompts,
            loading: loading,
            saving: saving,
            error: error,
            showCreateModal: showCreateModal,
            editingPrompt: editingPrompt,
            promptToDelete: promptToDelete,
            toast: toast,
            formData: formData,
            formatDate: formatDate,
            copyToClipboard: copyToClipboard,
            fetchPrompts: fetchPrompts,
            editPrompt: editPrompt,
            closeModal: closeModal,
            handleSubmit: handleSubmit,
            confirmDelete: confirmDelete,
            deletePrompt: deletePrompt,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
    },
});
; /* PartiallyEnd: #4569/main.vue */

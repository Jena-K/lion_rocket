import { ref, reactive } from 'vue';
import { useCharacterStore } from '@/stores/character';
const emit = defineEmits();
const characterStore = useCharacterStore();
const loading = ref(false);
const avatarInput = ref();
const selectedAvatar = ref(null);
const avatarPreview = ref(null);
const personalityTagsInput = ref('');
const interestTagsInput = ref('');
const formData = reactive({
    name: '',
    gender: 'male',
    intro: '',
    personality_tags: [],
    interest_tags: [],
    prompt: ''
});
const handleClose = () => {
    if (!loading.value) {
        emit('close');
    }
};
const handleAvatarChange = (event) => {
    const target = event.target;
    const file = target.files?.[0];
    if (file) {
        selectedAvatar.value = file;
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            avatarPreview.value = e.target?.result;
        };
        reader.readAsDataURL(file);
    }
    else {
        selectedAvatar.value = null;
        avatarPreview.value = null;
    }
};
const parseTagsInput = (input) => {
    return input.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
};
const handleSubmit = async () => {
    if (loading.value)
        return;
    loading.value = true;
    try {
        // Parse tags from input strings
        formData.personality_tags = parseTagsInput(personalityTagsInput.value);
        formData.interest_tags = parseTagsInput(interestTagsInput.value);
        // Create character
        const newCharacter = await characterStore.createCharacter(formData);
        // Upload avatar if selected
        if (selectedAvatar.value && newCharacter.character_id) {
            await characterStore.uploadAvatar(newCharacter.character_id, selectedAvatar.value);
        }
        emit('created');
    }
    catch (error) {
        console.error('Failed to create character:', error);
    }
    finally {
        loading.value = false;
    }
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['close-button']} */ ;
/** @type {__VLS_StyleScopedClasses['close-button']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['form-textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['gender-radio']} */ ;
/** @type {__VLS_StyleScopedClasses['gender-label']} */ ;
/** @type {__VLS_StyleScopedClasses['gender-option']} */ ;
/** @type {__VLS_StyleScopedClasses['gender-label']} */ ;
/** @type {__VLS_StyleScopedClasses['cancel-button']} */ ;
/** @type {__VLS_StyleScopedClasses['cancel-button']} */ ;
/** @type {__VLS_StyleScopedClasses['submit-button']} */ ;
/** @type {__VLS_StyleScopedClasses['submit-button']} */ ;
/** @type {__VLS_StyleScopedClasses['submit-button']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input-file']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-container']} */ ;
/** @type {__VLS_StyleScopedClasses['gender-options']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ onClick: (__VLS_ctx.handleClose) },
    ...{ class: "modal-overlay" },
});
// @ts-ignore
[handleClose,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ onClick: () => { } },
    ...{ class: "modal-container" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "modal-header" },
});
__VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({
    ...{ class: "modal-title" },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.handleClose) },
    ...{ class: "close-button" },
});
// @ts-ignore
[handleClose,];
__VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
    viewBox: "0 0 20 20",
    fill: "currentColor",
});
__VLS_asFunctionalElement(__VLS_elements.path)({
    'fill-rule': "evenodd",
    d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z",
    'clip-rule': "evenodd",
});
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
    ...{ class: "form-label" },
});
__VLS_asFunctionalElement(__VLS_elements.input)({
    id: "name",
    value: (__VLS_ctx.formData.name),
    type: "text",
    ...{ class: "form-input" },
    placeholder: "예: 친절한 도우미",
    required: true,
    maxlength: "100",
});
// @ts-ignore
[formData,];
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "form-hint" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
    ...{ class: "form-label" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "gender-options" },
});
__VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
    ...{ class: "gender-option" },
});
__VLS_asFunctionalElement(__VLS_elements.input)({
    type: "radio",
    value: "male",
    ...{ class: "gender-radio" },
    required: true,
});
(__VLS_ctx.formData.gender);
// @ts-ignore
[formData,];
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "gender-label" },
});
__VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
    ...{ class: "gender-icon" },
    viewBox: "0 0 24 24",
    fill: "currentColor",
});
__VLS_asFunctionalElement(__VLS_elements.path)({
    d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z",
});
__VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
    ...{ class: "gender-option" },
});
__VLS_asFunctionalElement(__VLS_elements.input)({
    type: "radio",
    value: "female",
    ...{ class: "gender-radio" },
    required: true,
});
(__VLS_ctx.formData.gender);
// @ts-ignore
[formData,];
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "gender-label" },
});
__VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
    ...{ class: "gender-icon" },
    viewBox: "0 0 24 24",
    fill: "currentColor",
});
__VLS_asFunctionalElement(__VLS_elements.path)({
    d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z",
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
    for: "intro",
    ...{ class: "form-label" },
});
__VLS_asFunctionalElement(__VLS_elements.textarea, __VLS_elements.textarea)({
    id: "intro",
    value: (__VLS_ctx.formData.intro),
    ...{ class: "form-textarea" },
    placeholder: "캐릭터의 간단한 소개글을 입력해주세요...",
    rows: "3",
    required: true,
});
// @ts-ignore
[formData,];
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "form-hint" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
    for: "personalityTags",
    ...{ class: "form-label" },
});
__VLS_asFunctionalElement(__VLS_elements.input)({
    id: "personalityTags",
    value: (__VLS_ctx.personalityTagsInput),
    type: "text",
    ...{ class: "form-input" },
    placeholder: "성격 태그를 쉼표로 구분해서 입력하세요 (예: 친근함, 유머러스, 창의적)",
    required: true,
});
// @ts-ignore
[personalityTagsInput,];
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "form-hint" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
    for: "interestTags",
    ...{ class: "form-label" },
});
__VLS_asFunctionalElement(__VLS_elements.input)({
    id: "interestTags",
    value: (__VLS_ctx.interestTagsInput),
    type: "text",
    ...{ class: "form-input" },
    placeholder: "관심사 태그를 쉼표로 구분해서 입력하세요 (예: 음악, 영화, 게임)",
    required: true,
});
// @ts-ignore
[interestTagsInput,];
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "form-hint" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
    for: "prompt",
    ...{ class: "form-label" },
});
__VLS_asFunctionalElement(__VLS_elements.textarea, __VLS_elements.textarea)({
    id: "prompt",
    value: (__VLS_ctx.formData.prompt),
    ...{ class: "form-textarea" },
    placeholder: "캐릭터의 성격, 말투, 역할 등을 설명해주세요...",
    rows: "4",
    required: true,
});
// @ts-ignore
[formData,];
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "form-hint" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
    for: "avatar",
    ...{ class: "form-label" },
});
__VLS_asFunctionalElement(__VLS_elements.input)({
    ...{ onChange: (__VLS_ctx.handleAvatarChange) },
    id: "avatar",
    ref: "avatarInput",
    type: "file",
    ...{ class: "form-input-file" },
    accept: "image/*",
});
/** @type {typeof __VLS_ctx.avatarInput} */ ;
// @ts-ignore
[handleAvatarChange, avatarInput,];
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "form-hint" },
});
if (__VLS_ctx.avatarPreview) {
    // @ts-ignore
    [avatarPreview,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "avatar-preview" },
    });
    __VLS_asFunctionalElement(__VLS_elements.img)({
        src: (__VLS_ctx.avatarPreview),
        alt: "Avatar Preview",
        ...{ class: "avatar-preview-image" },
    });
    // @ts-ignore
    [avatarPreview,];
}
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "modal-footer" },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.handleClose) },
    type: "button",
    ...{ class: "cancel-button" },
});
// @ts-ignore
[handleClose,];
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    type: "submit",
    ...{ class: "submit-button" },
    disabled: (__VLS_ctx.loading),
});
// @ts-ignore
[loading,];
if (__VLS_ctx.loading) {
    // @ts-ignore
    [loading,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "loading-text" },
    });
}
else {
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
}
/** @type {__VLS_StyleScopedClasses['modal-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-container']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-title']} */ ;
/** @type {__VLS_StyleScopedClasses['close-button']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['gender-options']} */ ;
/** @type {__VLS_StyleScopedClasses['gender-option']} */ ;
/** @type {__VLS_StyleScopedClasses['gender-radio']} */ ;
/** @type {__VLS_StyleScopedClasses['gender-label']} */ ;
/** @type {__VLS_StyleScopedClasses['gender-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['gender-option']} */ ;
/** @type {__VLS_StyleScopedClasses['gender-radio']} */ ;
/** @type {__VLS_StyleScopedClasses['gender-label']} */ ;
/** @type {__VLS_StyleScopedClasses['gender-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['form-textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['form-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['form-textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['form-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input-file']} */ ;
/** @type {__VLS_StyleScopedClasses['form-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-preview-image']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['cancel-button']} */ ;
/** @type {__VLS_StyleScopedClasses['submit-button']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-text']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            loading: loading,
            avatarInput: avatarInput,
            avatarPreview: avatarPreview,
            personalityTagsInput: personalityTagsInput,
            interestTagsInput: interestTagsInput,
            formData: formData,
            handleClose: handleClose,
            handleAvatarChange: handleAvatarChange,
            handleSubmit: handleSubmit,
        };
    },
    __typeEmits: {},
});
export default (await import('vue')).defineComponent({
    setup() {
    },
    __typeEmits: {},
});
; /* PartiallyEnd: #4569/main.vue */

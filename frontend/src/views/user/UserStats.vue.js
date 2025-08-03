import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { userService } from '../../services/user.service';
const authStore = useAuthStore();
// State
const stats = ref(null);
const loading = ref(false);
// Computed
const avgMessagesPerChat = computed(() => {
    if (!stats.value || stats.value.total_chats === 0)
        return 0;
    return Math.round(stats.value.total_messages / stats.value.total_chats);
});
const avgTokensPerMessage = computed(() => {
    if (!stats.value || stats.value.total_messages === 0)
        return '0';
    const avg = stats.value.total_tokens_used / stats.value.total_messages;
    return formatTokens(avg);
});
const avgChatsPerDay = computed(() => {
    if (!stats.value || stats.value.active_days === 0)
        return '0';
    return (stats.value.total_chats / stats.value.active_days).toFixed(1);
});
const avgMessagesPerDay = computed(() => {
    if (!stats.value || stats.value.active_days === 0)
        return '0';
    return Math.round(stats.value.total_messages / stats.value.active_days);
});
const avgTokensPerDay = computed(() => {
    if (!stats.value || stats.value.active_days === 0)
        return 0;
    return stats.value.total_tokens_used / stats.value.active_days;
});
const chatTrend = computed(() => {
    const avg = parseFloat(avgChatsPerDay.value);
    if (avg >= 5)
        return '매우 활발';
    if (avg >= 2)
        return '활발';
    if (avg >= 1)
        return '꾸준함';
    return '가끔씩';
});
const memberDuration = computed(() => {
    if (!authStore.user)
        return '';
    const created = new Date(authStore.user.created_at);
    const now = new Date();
    const days = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    if (days < 30)
        return `${days}일`;
    if (days < 365)
        return `${Math.floor(days / 30)}개월`;
    return `${Math.floor(days / 365)}년`;
});
const chatActivityPercent = computed(() => {
    const avg = parseFloat(avgChatsPerDay.value);
    return Math.min(100, (avg / 10) * 100);
});
const messageActivityPercent = computed(() => {
    const avg = parseInt(avgMessagesPerDay.value);
    return Math.min(100, (avg / 50) * 100);
});
const tokenActivityPercent = computed(() => {
    const avg = avgTokensPerDay.value;
    return Math.min(100, (avg / 10000) * 100);
});
// Mock weekly data
const weekDays = computed(() => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days.map((name, index) => ({
        name,
        value: Math.floor(Math.random() * 10) + 1,
        activity: Math.random() * 100,
    }));
});
// Methods
const formatTokens = (value) => {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(2)}M`;
    }
    else if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
    }
    return Math.round(value).toString();
};
const formatDate = (dateString) => {
    if (!dateString)
        return '-';
    return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};
const getCharacterIcon = (name) => {
    const icons = {
        'Claude Assistant': '🤖',
        'Creative Writer': '✍️',
        'Code Helper': '💻',
        'Math Tutor': '📐',
    };
    return icons[name] || '🤖';
};
const getMilestone = () => {
    if (!stats.value)
        return '';
    const messages = stats.value.total_messages;
    if (messages >= 1000)
        return '1000개 이상의 메시지를 주고받으셨어요!';
    if (messages >= 500)
        return '500개 이상의 메시지를 주고받으셨어요!';
    if (messages >= 100)
        return '100개 이상의 메시지를 주고받으셨어요!';
    if (messages >= 50)
        return '50개 이상의 메시지를 주고받으셨어요!';
    return 'AI와의 대화를 시작하셨네요!';
};
const getReadingEstimate = () => {
    if (!stats.value)
        return '';
    // Assuming average reading speed and words per message
    const minutes = Math.round(stats.value.total_messages * 0.5);
    if (minutes >= 60) {
        const hours = Math.floor(minutes / 60);
        return `약 ${hours}시간의 대화를 나누셨어요`;
    }
    return `약 ${minutes}분의 대화를 나누셨어요`;
};
const getUsageLevel = () => {
    const avg = parseFloat(avgChatsPerDay.value);
    if (avg >= 5)
        return 'AI 채팅 고급 사용자입니다!';
    if (avg >= 2)
        return 'AI를 적극적으로 활용하고 계시네요!';
    if (avg >= 1)
        return 'AI와 꾸준히 대화하고 계시네요!';
    return 'AI와 친해지고 계시는군요!';
};
const fetchStats = async () => {
    loading.value = true;
    try {
        stats.value = await userService.getStats();
    }
    catch (error) {
        console.error('Failed to fetch stats:', error);
    }
    finally {
        loading.value = false;
    }
};
onMounted(() => {
    fetchStats();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['retry-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['favorite-section']} */ ;
/** @type {__VLS_StyleScopedClasses['favorite-info']} */ ;
/** @type {__VLS_StyleScopedClasses['patterns-section']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-card']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['success']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['info']} */ ;
/** @type {__VLS_StyleScopedClasses['activity-section']} */ ;
/** @type {__VLS_StyleScopedClasses['day-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['recent-section']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-content']} */ ;
/** @type {__VLS_StyleScopedClasses['facts-section']} */ ;
/** @type {__VLS_StyleScopedClasses['fact-card']} */ ;
/** @type {__VLS_StyleScopedClasses['fact-card']} */ ;
/** @type {__VLS_StyleScopedClasses['fact-card']} */ ;
/** @type {__VLS_StyleScopedClasses['overview-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['patterns-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['facts-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-days']} */ ;
/** @type {__VLS_StyleScopedClasses['day-bar']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "user-stats" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "subtitle" },
});
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
else if (__VLS_ctx.stats) {
    // @ts-ignore
    [stats,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "stats-content" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "overview-grid" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "stat-card primary" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "card-icon" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "card-content" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "stat-value" },
    });
    (__VLS_ctx.stats.total_chats);
    // @ts-ignore
    [stats,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "stat-trend" },
    });
    (__VLS_ctx.chatTrend);
    // @ts-ignore
    [chatTrend,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "stat-card success" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "card-icon" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "card-content" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "stat-value" },
    });
    (__VLS_ctx.stats.total_messages);
    // @ts-ignore
    [stats,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "stat-average" },
    });
    (__VLS_ctx.avgMessagesPerChat);
    // @ts-ignore
    [avgMessagesPerChat,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "stat-card info" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "card-icon" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "card-content" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "stat-value" },
    });
    (__VLS_ctx.formatTokens(__VLS_ctx.stats.total_tokens_used));
    // @ts-ignore
    [stats, formatTokens,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "stat-average" },
    });
    (__VLS_ctx.avgTokensPerMessage);
    // @ts-ignore
    [avgTokensPerMessage,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "stat-card warning" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "card-icon" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "card-content" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "stat-value" },
    });
    (__VLS_ctx.stats.active_days);
    // @ts-ignore
    [stats,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "stat-since" },
    });
    (__VLS_ctx.memberDuration);
    // @ts-ignore
    [memberDuration,];
    if (__VLS_ctx.stats.favorite_character) {
        // @ts-ignore
        [stats,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "favorite-section" },
        });
        __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "favorite-card" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "favorite-icon" },
        });
        (__VLS_ctx.getCharacterIcon(__VLS_ctx.stats.favorite_character));
        // @ts-ignore
        [stats, getCharacterIcon,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "favorite-info" },
        });
        __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({});
        (__VLS_ctx.stats.favorite_character);
        // @ts-ignore
        [stats,];
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
    }
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "patterns-section" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "patterns-grid" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "pattern-card" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({});
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "pattern-value" },
    });
    (__VLS_ctx.avgChatsPerDay);
    // @ts-ignore
    [avgChatsPerDay,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "pattern-bar" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "bar-fill" },
        ...{ style: ({ width: __VLS_ctx.chatActivityPercent + '%' }) },
    });
    // @ts-ignore
    [chatActivityPercent,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "pattern-card" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({});
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "pattern-value" },
    });
    (__VLS_ctx.avgMessagesPerDay);
    // @ts-ignore
    [avgMessagesPerDay,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "pattern-bar" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "bar-fill success" },
        ...{ style: ({ width: __VLS_ctx.messageActivityPercent + '%' }) },
    });
    // @ts-ignore
    [messageActivityPercent,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "pattern-card" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({});
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "pattern-value" },
    });
    (__VLS_ctx.formatTokens(__VLS_ctx.avgTokensPerDay));
    // @ts-ignore
    [formatTokens, avgTokensPerDay,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "pattern-bar" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "bar-fill info" },
        ...{ style: ({ width: __VLS_ctx.tokenActivityPercent + '%' }) },
    });
    // @ts-ignore
    [tokenActivityPercent,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "activity-section" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "activity-chart" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "chart-days" },
    });
    for (const [day] of __VLS_getVForSourceType((__VLS_ctx.weekDays))) {
        // @ts-ignore
        [weekDays,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            key: (day.name),
            ...{ class: "day-column" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "day-bar" },
            ...{ style: ({ height: day.activity + '%' }) },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "day-value" },
        });
        (day.value);
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "day-name" },
        });
        (day.name);
    }
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "recent-section" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "activity-timeline" },
    });
    if (__VLS_ctx.stats.last_chat_date) {
        // @ts-ignore
        [stats,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "timeline-item" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "timeline-icon" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "timeline-content" },
        });
        __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({});
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
        (__VLS_ctx.formatDate(__VLS_ctx.stats.last_chat_date));
        // @ts-ignore
        [stats, formatDate,];
    }
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "timeline-item" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "timeline-icon" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "timeline-content" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({});
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
    (__VLS_ctx.formatDate(__VLS_ctx.authStore.user?.created_at));
    // @ts-ignore
    [formatDate, authStore,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "facts-section" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "facts-grid" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "fact-card" },
    });
    __VLS_asFunctionalElement(__VLS_elements.i, __VLS_elements.i)({});
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
    (__VLS_ctx.getMilestone());
    // @ts-ignore
    [getMilestone,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "fact-card" },
    });
    __VLS_asFunctionalElement(__VLS_elements.i, __VLS_elements.i)({});
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
    (__VLS_ctx.getReadingEstimate());
    // @ts-ignore
    [getReadingEstimate,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "fact-card" },
    });
    __VLS_asFunctionalElement(__VLS_elements.i, __VLS_elements.i)({});
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
    (__VLS_ctx.getUsageLevel());
    // @ts-ignore
    [getUsageLevel,];
}
else {
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "error-state" },
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.fetchStats) },
        ...{ class: "retry-btn" },
    });
    // @ts-ignore
    [fetchStats,];
}
/** @type {__VLS_StyleScopedClasses['user-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-state']} */ ;
/** @type {__VLS_StyleScopedClasses['spinner']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-content']} */ ;
/** @type {__VLS_StyleScopedClasses['overview-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['card-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['card-content']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-trend']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['success']} */ ;
/** @type {__VLS_StyleScopedClasses['card-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['card-content']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-average']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['info']} */ ;
/** @type {__VLS_StyleScopedClasses['card-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['card-content']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-average']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['warning']} */ ;
/** @type {__VLS_StyleScopedClasses['card-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['card-content']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-since']} */ ;
/** @type {__VLS_StyleScopedClasses['favorite-section']} */ ;
/** @type {__VLS_StyleScopedClasses['favorite-card']} */ ;
/** @type {__VLS_StyleScopedClasses['favorite-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['favorite-info']} */ ;
/** @type {__VLS_StyleScopedClasses['patterns-section']} */ ;
/** @type {__VLS_StyleScopedClasses['patterns-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-card']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-value']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-card']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-value']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['success']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-card']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-value']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['info']} */ ;
/** @type {__VLS_StyleScopedClasses['activity-section']} */ ;
/** @type {__VLS_StyleScopedClasses['activity-chart']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-days']} */ ;
/** @type {__VLS_StyleScopedClasses['day-column']} */ ;
/** @type {__VLS_StyleScopedClasses['day-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['day-value']} */ ;
/** @type {__VLS_StyleScopedClasses['day-name']} */ ;
/** @type {__VLS_StyleScopedClasses['recent-section']} */ ;
/** @type {__VLS_StyleScopedClasses['activity-timeline']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-item']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-content']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-item']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-content']} */ ;
/** @type {__VLS_StyleScopedClasses['facts-section']} */ ;
/** @type {__VLS_StyleScopedClasses['facts-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['fact-card']} */ ;
/** @type {__VLS_StyleScopedClasses['fact-card']} */ ;
/** @type {__VLS_StyleScopedClasses['fact-card']} */ ;
/** @type {__VLS_StyleScopedClasses['error-state']} */ ;
/** @type {__VLS_StyleScopedClasses['retry-btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            authStore: authStore,
            stats: stats,
            loading: loading,
            avgMessagesPerChat: avgMessagesPerChat,
            avgTokensPerMessage: avgTokensPerMessage,
            avgChatsPerDay: avgChatsPerDay,
            avgMessagesPerDay: avgMessagesPerDay,
            avgTokensPerDay: avgTokensPerDay,
            chatTrend: chatTrend,
            memberDuration: memberDuration,
            chatActivityPercent: chatActivityPercent,
            messageActivityPercent: messageActivityPercent,
            tokenActivityPercent: tokenActivityPercent,
            weekDays: weekDays,
            formatTokens: formatTokens,
            formatDate: formatDate,
            getCharacterIcon: getCharacterIcon,
            getMilestone: getMilestone,
            getReadingEstimate: getReadingEstimate,
            getUsageLevel: getUsageLevel,
            fetchStats: fetchStats,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
    },
});
; /* PartiallyEnd: #4569/main.vue */

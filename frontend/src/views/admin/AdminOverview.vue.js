import { ref, computed, onMounted } from 'vue';
import apiClient from '@/services/api.client';
// Tab icons as inline components
const CalendarIcon = {
    template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>`
};
const UsersIcon = {
    template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>`
};
const CharacterIcon = {
    template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="3" y="11" width="18" height="10" rx="2" ry="2"></rect>
    <circle cx="12" cy="5" r="2"></circle>
    <path d="M12 7v4"></path>
  </svg>`
};
// State
const activeTab = ref('date');
const currentDate = computed(() => {
    return new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});
// State
const isLoading = ref(true);
const dashboardStats = ref({
    total_chats: 0,
    total_users: 0
});
const errorMessage = ref('');
// Loading states for different data types
const isLoadingDaily = ref(true);
const isLoadingUsers = ref(true);
const isLoadingCharacters = ref(true);
const tabs = [
    { id: 'date', label: '날짜별 보기', icon: CalendarIcon },
    { id: 'user', label: '사용자별 보기', icon: UsersIcon },
    { id: 'character', label: '캐릭터별 보기', icon: CharacterIcon }
];
// Data from API endpoints
const dateData = ref([]);
const topUsers = ref([]);
const allUsers = ref([]);
const characters = ref([]);
const characterTableData = computed(() => characters.value.map(char => ({
    character_id: char.character_id,
    name: char.name,
    color: char.color,
    totalChats: char.total_chats || char.chat_count,
    activeUsers: char.unique_users || char.user_count
})));
// Methods
const formatDate = (date) => {
    return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric'
    });
};
const formatRelativeTime = (date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1)
        return '방금 전';
    if (hours < 24)
        return `${hours}시간 전`;
    if (hours < 48)
        return '어제';
    return `${Math.floor(hours / 24)}일 전`;
};
const getRankClass = (rank) => {
    if (rank === 1)
        return 'gold';
    if (rank === 2)
        return 'silver';
    if (rank === 3)
        return 'bronze';
    return '';
};
// Load dashboard data
const loadDashboardStats = async () => {
    try {
        isLoading.value = true;
        errorMessage.value = '';
        const response = await apiClient.get('/admin/dashboard/simple-stats');
        dashboardStats.value = response.data;
        console.log('Dashboard stats loaded:', response.data);
    }
    catch (error) {
        console.error('Failed to load dashboard stats:', error);
        errorMessage.value = 'Dashboard 데이터를 불러오는데 실패했습니다.';
        // Keep default values in case of error
        dashboardStats.value = {
            total_chats: 0,
            total_users: 0
        };
    }
    finally {
        isLoading.value = false;
    }
};
// Load daily trends data
const loadDailyTrends = async () => {
    try {
        isLoadingDaily.value = true;
        const response = await apiClient.get('/admin/dashboard/daily-trends?days=7');
        const dailyData = response.data.map(day => ({
            date: new Date(day.date),
            chatCount: day.chat_count,
            userCount: day.user_count,
            topCharacter: day.top_character
        }));
        dateData.value = dailyData;
        console.log('Daily trends loaded:', dailyData);
    }
    catch (error) {
        console.error('Failed to load daily trends:', error);
        // Keep empty array in case of error
        dateData.value = [];
    }
    finally {
        isLoadingDaily.value = false;
    }
};
// Load user rankings and all users data
const loadUsersData = async () => {
    try {
        isLoadingUsers.value = true;
        // Load top users
        const topUsersResponse = await apiClient.get('/admin/dashboard/user-rankings?limit=10');
        topUsers.value = topUsersResponse.data.map(user => ({
            user_id: user.user_id,
            name: user.name,
            email: user.email,
            chatCount: user.chat_count,
            messageCount: user.message_count,
            uniqueCharacters: user.unique_characters,
            lastActive: new Date(user.last_active),
            favoriteCharacter: user.favorite_character,
            avgDuration: user.avg_duration,
            status: user.status
        }));
        // Load all users
        const allUsersResponse = await apiClient.get('/admin/dashboard/all-users?limit=100');
        allUsers.value = allUsersResponse.data.map(user => ({
            user_id: user.user_id,
            name: user.name,
            email: user.email,
            chatCount: user.chat_count,
            messageCount: user.message_count,
            lastActive: new Date(user.last_active),
            favoriteCharacter: user.favorite_character,
            status: user.status
        }));
        console.log('Users data loaded:', { topUsers: topUsers.value.length, allUsers: allUsers.value.length });
    }
    catch (error) {
        console.error('Failed to load users data:', error);
        topUsers.value = [];
        allUsers.value = [];
    }
    finally {
        isLoadingUsers.value = false;
    }
};
// Load character statistics
const loadCharactersData = async () => {
    try {
        isLoadingCharacters.value = true;
        const response = await apiClient.get('/admin/dashboard/character-stats');
        characters.value = response.data.map(char => ({
            character_id: char.character_id,
            name: char.name,
            description: char.description,
            chat_count: char.chat_count,
            total_chats: char.total_chats,
            user_count: char.user_count,
            unique_users: char.unique_users,
            active_users: char.active_users,
            avgRating: char.avg_rating,
            percentage: char.percentage,
            color: char.color,
            last_used: char.last_used ? new Date(char.last_used) : null
        }));
        console.log('Characters data loaded:', characters.value);
    }
    catch (error) {
        console.error('Failed to load characters data:', error);
        characters.value = [];
    }
    finally {
        isLoadingCharacters.value = false;
    }
};
// Load data on component mount
onMounted(() => {
    loadDashboardStats();
    loadDailyTrends();
    loadUsersData();
    loadCharactersData();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['date-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['date-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['export-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['export-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-change']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-change']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-change']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-change']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-header']} */ ;
/** @type {__VLS_StyleScopedClasses['data-table-container']} */ ;
/** @type {__VLS_StyleScopedClasses['data-table']} */ ;
/** @type {__VLS_StyleScopedClasses['data-table']} */ ;
/** @type {__VLS_StyleScopedClasses['data-table']} */ ;
/** @type {__VLS_StyleScopedClasses['user-rank-card']} */ ;
/** @type {__VLS_StyleScopedClasses['rank-number']} */ ;
/** @type {__VLS_StyleScopedClasses['rank-number']} */ ;
/** @type {__VLS_StyleScopedClasses['rank-number']} */ ;
/** @type {__VLS_StyleScopedClasses['user-info']} */ ;
/** @type {__VLS_StyleScopedClasses['user-info']} */ ;
/** @type {__VLS_StyleScopedClasses['activity-graph']} */ ;
/** @type {__VLS_StyleScopedClasses['status-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['status-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['view-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['view-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['character-stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['donut']} */ ;
/** @type {__VLS_StyleScopedClasses['rating']} */ ;
/** @type {__VLS_StyleScopedClasses['trend']} */ ;
/** @type {__VLS_StyleScopedClasses['trend']} */ ;
/** @type {__VLS_StyleScopedClasses['trend']} */ ;
/** @type {__VLS_StyleScopedClasses['neutral']} */ ;
/** @type {__VLS_StyleScopedClasses['trend']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['header-content']} */ ;
/** @type {__VLS_StyleScopedClasses['user-ranking']} */ ;
/** @type {__VLS_StyleScopedClasses['character-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['view-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['data-table']} */ ;
/** @type {__VLS_StyleScopedClasses['data-table']} */ ;
/** @type {__VLS_StyleScopedClasses['data-table']} */ ;
/** @type {__VLS_StyleScopedClasses['user-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['activity-graph']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "admin-overview" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "header-content" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
__VLS_asFunctionalElement(__VLS_elements.h1, __VLS_elements.h1)({
    ...{ class: "page-title" },
});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "page-subtitle" },
});
(__VLS_ctx.currentDate);
// @ts-ignore
[currentDate,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "header-actions" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "date-selector" },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ class: "date-btn" },
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
__VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    'stroke-width': "2",
});
__VLS_asFunctionalElement(__VLS_elements.polyline, __VLS_elements.polyline)({
    points: "6 9 12 15 18 9",
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ class: "export-btn" },
});
__VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    'stroke-width': "2",
});
__VLS_asFunctionalElement(__VLS_elements.path, __VLS_elements.path)({
    d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",
});
__VLS_asFunctionalElement(__VLS_elements.polyline, __VLS_elements.polyline)({
    points: "7 10 12 15 17 10",
});
__VLS_asFunctionalElement(__VLS_elements.line, __VLS_elements.line)({
    x1: "12",
    y1: "15",
    x2: "12",
    y2: "3",
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "stats-grid" },
});
if (__VLS_ctx.isLoading) {
    // @ts-ignore
    [isLoading,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "stat-card" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "stat-loading" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "loading-spinner" },
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
}
else {
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "stat-card" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "stat-icon blue" },
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
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "stat-content" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
        ...{ class: "stat-label" },
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "stat-value" },
    });
    (__VLS_ctx.dashboardStats.total_chats?.toLocaleString() || '0');
    // @ts-ignore
    [dashboardStats,];
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "stat-change neutral" },
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
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "stat-card" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "stat-icon green" },
    });
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "2",
    });
    __VLS_asFunctionalElement(__VLS_elements.path, __VLS_elements.path)({
        d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2",
    });
    __VLS_asFunctionalElement(__VLS_elements.circle, __VLS_elements.circle)({
        cx: "9",
        cy: "7",
        r: "4",
    });
    __VLS_asFunctionalElement(__VLS_elements.path, __VLS_elements.path)({
        d: "M23 21v-2a4 4 0 0 0-3-3.87",
    });
    __VLS_asFunctionalElement(__VLS_elements.path, __VLS_elements.path)({
        d: "M16 3.13a4 4 0 0 1 0 7.75",
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "stat-content" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
        ...{ class: "stat-label" },
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "stat-value" },
    });
    (__VLS_ctx.dashboardStats.total_users?.toLocaleString() || '0');
    // @ts-ignore
    [dashboardStats,];
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "stat-change neutral" },
    });
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "2",
    });
    __VLS_asFunctionalElement(__VLS_elements.path, __VLS_elements.path)({
        d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2",
    });
    __VLS_asFunctionalElement(__VLS_elements.circle, __VLS_elements.circle)({
        cx: "9",
        cy: "7",
        r: "4",
    });
    __VLS_asFunctionalElement(__VLS_elements.path, __VLS_elements.path)({
        d: "M23 21v-2a4 4 0 0 0-3-3.87",
    });
    __VLS_asFunctionalElement(__VLS_elements.path, __VLS_elements.path)({
        d: "M16 3.13a4 4 0 0 1 0 7.75",
    });
}
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "view-tabs" },
});
for (const [tab] of __VLS_getVForSourceType((__VLS_ctx.tabs))) {
    // @ts-ignore
    [tabs,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.activeTab = tab.id;
                // @ts-ignore
                [activeTab,];
            } },
        key: (tab.id),
        ...{ class: (['tab-btn', { active: __VLS_ctx.activeTab === tab.id }]) },
    });
    // @ts-ignore
    [activeTab,];
    const __VLS_0 = ((tab.icon));
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
    const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
    (tab.label);
}
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "tab-content" },
});
if (__VLS_ctx.activeTab === 'date') {
    // @ts-ignore
    [activeTab,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "date-view" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "chart-container" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "chart-header" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "chart-legend" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "legend-item" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "legend-color" },
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "legend-item" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "legend-color" },
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "chart-placeholder" },
    });
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        viewBox: "0 0 800 300",
        ...{ class: "line-chart" },
    });
    __VLS_asFunctionalElement(__VLS_elements.g, __VLS_elements.g)({
        ...{ class: "grid" },
    });
    __VLS_asFunctionalElement(__VLS_elements.line)({
        x1: "50",
        y1: "250",
        x2: "750",
        y2: "250",
        stroke: "#e5e7eb",
    });
    __VLS_asFunctionalElement(__VLS_elements.line)({
        x1: "50",
        y1: "200",
        x2: "750",
        y2: "200",
        stroke: "#e5e7eb",
    });
    __VLS_asFunctionalElement(__VLS_elements.line)({
        x1: "50",
        y1: "150",
        x2: "750",
        y2: "150",
        stroke: "#e5e7eb",
    });
    __VLS_asFunctionalElement(__VLS_elements.line)({
        x1: "50",
        y1: "100",
        x2: "750",
        y2: "100",
        stroke: "#e5e7eb",
    });
    __VLS_asFunctionalElement(__VLS_elements.line)({
        x1: "50",
        y1: "50",
        x2: "750",
        y2: "50",
        stroke: "#e5e7eb",
    });
    __VLS_asFunctionalElement(__VLS_elements.polyline)({
        points: "50,200 150,180 250,150 350,140 450,120 550,100 650,90 750,80",
        fill: "none",
        stroke: "#3b82f6",
        'stroke-width': "3",
    });
    __VLS_asFunctionalElement(__VLS_elements.polyline)({
        points: "50,220 150,210 250,190 350,185 450,170 550,160 650,155 750,150",
        fill: "none",
        stroke: "#10b981",
        'stroke-width': "3",
    });
    __VLS_asFunctionalElement(__VLS_elements.g, __VLS_elements.g)({
        ...{ class: "data-points" },
    });
    __VLS_asFunctionalElement(__VLS_elements.circle)({
        cx: "50",
        cy: "200",
        r: "4",
        fill: "#3b82f6",
    });
    __VLS_asFunctionalElement(__VLS_elements.circle)({
        cx: "150",
        cy: "180",
        r: "4",
        fill: "#3b82f6",
    });
    __VLS_asFunctionalElement(__VLS_elements.circle)({
        cx: "250",
        cy: "150",
        r: "4",
        fill: "#3b82f6",
    });
    __VLS_asFunctionalElement(__VLS_elements.circle)({
        cx: "350",
        cy: "140",
        r: "4",
        fill: "#3b82f6",
    });
    __VLS_asFunctionalElement(__VLS_elements.circle)({
        cx: "450",
        cy: "120",
        r: "4",
        fill: "#3b82f6",
    });
    __VLS_asFunctionalElement(__VLS_elements.circle)({
        cx: "550",
        cy: "100",
        r: "4",
        fill: "#3b82f6",
    });
    __VLS_asFunctionalElement(__VLS_elements.circle)({
        cx: "650",
        cy: "90",
        r: "4",
        fill: "#3b82f6",
    });
    __VLS_asFunctionalElement(__VLS_elements.circle)({
        cx: "750",
        cy: "80",
        r: "4",
        fill: "#3b82f6",
    });
    __VLS_asFunctionalElement(__VLS_elements.g, __VLS_elements.g)({
        ...{ class: "axis-scales" },
    });
    __VLS_asFunctionalElement(__VLS_elements.text, __VLS_elements.text)({
        x: "45",
        y: "255",
        'text-anchor': "end",
        fill: "#6b7280",
        'font-size': "10",
        'font-family': "Inter, system-ui, sans-serif",
    });
    __VLS_asFunctionalElement(__VLS_elements.text, __VLS_elements.text)({
        x: "45",
        y: "205",
        'text-anchor': "end",
        fill: "#6b7280",
        'font-size': "10",
        'font-family': "Inter, system-ui, sans-serif",
    });
    __VLS_asFunctionalElement(__VLS_elements.text, __VLS_elements.text)({
        x: "45",
        y: "155",
        'text-anchor': "end",
        fill: "#6b7280",
        'font-size': "10",
        'font-family': "Inter, system-ui, sans-serif",
    });
    __VLS_asFunctionalElement(__VLS_elements.text, __VLS_elements.text)({
        x: "45",
        y: "105",
        'text-anchor': "end",
        fill: "#6b7280",
        'font-size': "10",
        'font-family': "Inter, system-ui, sans-serif",
    });
    __VLS_asFunctionalElement(__VLS_elements.text, __VLS_elements.text)({
        x: "45",
        y: "55",
        'text-anchor': "end",
        fill: "#6b7280",
        'font-size': "10",
        'font-family': "Inter, system-ui, sans-serif",
    });
    __VLS_asFunctionalElement(__VLS_elements.line)({
        x1: "45",
        y1: "250",
        x2: "50",
        y2: "250",
        stroke: "#6b7280",
        'stroke-width': "1",
    });
    __VLS_asFunctionalElement(__VLS_elements.line)({
        x1: "45",
        y1: "200",
        x2: "50",
        y2: "200",
        stroke: "#6b7280",
        'stroke-width': "1",
    });
    __VLS_asFunctionalElement(__VLS_elements.line)({
        x1: "45",
        y1: "150",
        x2: "50",
        y2: "150",
        stroke: "#6b7280",
        'stroke-width': "1",
    });
    __VLS_asFunctionalElement(__VLS_elements.line)({
        x1: "45",
        y1: "100",
        x2: "50",
        y2: "100",
        stroke: "#6b7280",
        'stroke-width': "1",
    });
    __VLS_asFunctionalElement(__VLS_elements.line)({
        x1: "45",
        y1: "50",
        x2: "50",
        y2: "50",
        stroke: "#6b7280",
        'stroke-width': "1",
    });
    __VLS_asFunctionalElement(__VLS_elements.text, __VLS_elements.text)({
        x: "50",
        y: "270",
        'text-anchor': "middle",
        fill: "#6b7280",
        'font-size': "10",
        'font-family': "Inter, system-ui, sans-serif",
    });
    __VLS_asFunctionalElement(__VLS_elements.text, __VLS_elements.text)({
        x: "150",
        y: "270",
        'text-anchor': "middle",
        fill: "#6b7280",
        'font-size': "10",
        'font-family': "Inter, system-ui, sans-serif",
    });
    __VLS_asFunctionalElement(__VLS_elements.text, __VLS_elements.text)({
        x: "250",
        y: "270",
        'text-anchor': "middle",
        fill: "#6b7280",
        'font-size': "10",
        'font-family': "Inter, system-ui, sans-serif",
    });
    __VLS_asFunctionalElement(__VLS_elements.text, __VLS_elements.text)({
        x: "350",
        y: "270",
        'text-anchor': "middle",
        fill: "#6b7280",
        'font-size': "10",
        'font-family': "Inter, system-ui, sans-serif",
    });
    __VLS_asFunctionalElement(__VLS_elements.text, __VLS_elements.text)({
        x: "450",
        y: "270",
        'text-anchor': "middle",
        fill: "#6b7280",
        'font-size': "10",
        'font-family': "Inter, system-ui, sans-serif",
    });
    __VLS_asFunctionalElement(__VLS_elements.text, __VLS_elements.text)({
        x: "550",
        y: "270",
        'text-anchor': "middle",
        fill: "#6b7280",
        'font-size': "10",
        'font-family': "Inter, system-ui, sans-serif",
    });
    __VLS_asFunctionalElement(__VLS_elements.text, __VLS_elements.text)({
        x: "650",
        y: "270",
        'text-anchor': "middle",
        fill: "#6b7280",
        'font-size': "10",
        'font-family': "Inter, system-ui, sans-serif",
    });
    __VLS_asFunctionalElement(__VLS_elements.text, __VLS_elements.text)({
        x: "750",
        y: "270",
        'text-anchor': "middle",
        fill: "#6b7280",
        'font-size': "10",
        'font-family': "Inter, system-ui, sans-serif",
    });
    __VLS_asFunctionalElement(__VLS_elements.line)({
        x1: "50",
        y1: "250",
        x2: "50",
        y2: "255",
        stroke: "#6b7280",
        'stroke-width': "1",
    });
    __VLS_asFunctionalElement(__VLS_elements.line)({
        x1: "150",
        y1: "250",
        x2: "150",
        y2: "255",
        stroke: "#6b7280",
        'stroke-width': "1",
    });
    __VLS_asFunctionalElement(__VLS_elements.line)({
        x1: "250",
        y1: "250",
        x2: "250",
        y2: "255",
        stroke: "#6b7280",
        'stroke-width': "1",
    });
    __VLS_asFunctionalElement(__VLS_elements.line)({
        x1: "350",
        y1: "250",
        x2: "350",
        y2: "255",
        stroke: "#6b7280",
        'stroke-width': "1",
    });
    __VLS_asFunctionalElement(__VLS_elements.line)({
        x1: "450",
        y1: "250",
        x2: "450",
        y2: "255",
        stroke: "#6b7280",
        'stroke-width': "1",
    });
    __VLS_asFunctionalElement(__VLS_elements.line)({
        x1: "550",
        y1: "250",
        x2: "550",
        y2: "255",
        stroke: "#6b7280",
        'stroke-width': "1",
    });
    __VLS_asFunctionalElement(__VLS_elements.line)({
        x1: "650",
        y1: "250",
        x2: "650",
        y2: "255",
        stroke: "#6b7280",
        'stroke-width': "1",
    });
    __VLS_asFunctionalElement(__VLS_elements.line)({
        x1: "750",
        y1: "250",
        x2: "750",
        y2: "255",
        stroke: "#6b7280",
        'stroke-width': "1",
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "data-table-container" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
    __VLS_asFunctionalElement(__VLS_elements.table, __VLS_elements.table)({
        ...{ class: "data-table" },
    });
    __VLS_asFunctionalElement(__VLS_elements.thead, __VLS_elements.thead)({});
    __VLS_asFunctionalElement(__VLS_elements.tr, __VLS_elements.tr)({});
    __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
    __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
    __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
    __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
    __VLS_asFunctionalElement(__VLS_elements.tbody, __VLS_elements.tbody)({});
    if (__VLS_ctx.isLoadingDaily) {
        // @ts-ignore
        [isLoadingDaily,];
        __VLS_asFunctionalElement(__VLS_elements.tr, __VLS_elements.tr)({});
        __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({
            colspan: "4",
            ...{ class: "text-center" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "loading-spinner" },
        });
    }
    else if (__VLS_ctx.dateData.length === 0) {
        // @ts-ignore
        [dateData,];
        __VLS_asFunctionalElement(__VLS_elements.tr, __VLS_elements.tr)({});
        __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({
            colspan: "4",
            ...{ class: "text-center" },
        });
    }
    else {
        for (const [day] of __VLS_getVForSourceType((__VLS_ctx.dateData))) {
            // @ts-ignore
            [dateData,];
            __VLS_asFunctionalElement(__VLS_elements.tr, __VLS_elements.tr)({
                key: (day.date),
            });
            __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
            (__VLS_ctx.formatDate(day.date));
            // @ts-ignore
            [formatDate,];
            __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
            (day.chatCount.toLocaleString());
            __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
            (day.userCount);
            __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "character-badge" },
            });
            (day.topCharacter);
        }
    }
}
if (__VLS_ctx.activeTab === 'user') {
    // @ts-ignore
    [activeTab,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "user-view" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "chart-container" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "chart-header" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
    __VLS_asFunctionalElement(__VLS_elements.select, __VLS_elements.select)({
        ...{ class: "sort-select" },
    });
    __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({});
    __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({});
    __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({});
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "user-ranking" },
    });
    if (__VLS_ctx.isLoadingUsers) {
        // @ts-ignore
        [isLoadingUsers,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "loading-container" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "loading-spinner" },
        });
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
    }
    else if (__VLS_ctx.topUsers.length === 0) {
        // @ts-ignore
        [topUsers,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "empty-state" },
        });
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
    }
    else {
        for (const [user, index] of __VLS_getVForSourceType((__VLS_ctx.topUsers))) {
            // @ts-ignore
            [topUsers,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                key: (user.user_id),
                ...{ class: "user-rank-card" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "rank-number" },
                ...{ class: (__VLS_ctx.getRankClass(index + 1)) },
            });
            // @ts-ignore
            [getRankClass,];
            (index + 1);
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "user-avatar" },
            });
            (user.name.charAt(0).toUpperCase());
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "user-info" },
            });
            __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({});
            (user.name);
            __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
            (user.email);
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "user-stats" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "mini-stat" },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "mini-value" },
            });
            (user.chatCount);
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "mini-label" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "mini-stat" },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "mini-value" },
            });
            (user.messageCount);
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "mini-label" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "mini-stat" },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "mini-value" },
            });
            (user.avgDuration);
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "mini-label" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "activity-graph" },
            });
            __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
                viewBox: "0 0 100 30",
            });
            __VLS_asFunctionalElement(__VLS_elements.rect)({
                x: "0",
                y: "20",
                width: "8",
                height: "10",
                fill: "#e5e7eb",
            });
            __VLS_asFunctionalElement(__VLS_elements.rect)({
                x: "10",
                y: "15",
                width: "8",
                height: "15",
                fill: "#e5e7eb",
            });
            __VLS_asFunctionalElement(__VLS_elements.rect)({
                x: "20",
                y: "10",
                width: "8",
                height: "20",
                fill: "#3b82f6",
            });
            __VLS_asFunctionalElement(__VLS_elements.rect)({
                x: "30",
                y: "5",
                width: "8",
                height: "25",
                fill: "#3b82f6",
            });
            __VLS_asFunctionalElement(__VLS_elements.rect)({
                x: "40",
                y: "8",
                width: "8",
                height: "22",
                fill: "#3b82f6",
            });
            __VLS_asFunctionalElement(__VLS_elements.rect)({
                x: "50",
                y: "12",
                width: "8",
                height: "18",
                fill: "#e5e7eb",
            });
            __VLS_asFunctionalElement(__VLS_elements.rect)({
                x: "60",
                y: "15",
                width: "8",
                height: "15",
                fill: "#e5e7eb",
            });
        }
    }
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "data-table-container" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
    __VLS_asFunctionalElement(__VLS_elements.table, __VLS_elements.table)({
        ...{ class: "data-table" },
    });
    __VLS_asFunctionalElement(__VLS_elements.thead, __VLS_elements.thead)({});
    __VLS_asFunctionalElement(__VLS_elements.tr, __VLS_elements.tr)({});
    __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
    __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
    __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
    __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
    __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
    __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
    __VLS_asFunctionalElement(__VLS_elements.tbody, __VLS_elements.tbody)({});
    if (__VLS_ctx.isLoadingUsers) {
        // @ts-ignore
        [isLoadingUsers,];
        __VLS_asFunctionalElement(__VLS_elements.tr, __VLS_elements.tr)({});
        __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({
            colspan: "6",
            ...{ class: "text-center" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "loading-spinner" },
        });
    }
    else if (__VLS_ctx.allUsers.length === 0) {
        // @ts-ignore
        [allUsers,];
        __VLS_asFunctionalElement(__VLS_elements.tr, __VLS_elements.tr)({});
        __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({
            colspan: "6",
            ...{ class: "text-center" },
        });
    }
    else {
        for (const [user] of __VLS_getVForSourceType((__VLS_ctx.allUsers))) {
            // @ts-ignore
            [allUsers,];
            __VLS_asFunctionalElement(__VLS_elements.tr, __VLS_elements.tr)({
                key: (user.user_id),
            });
            __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "user-cell" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "small-avatar" },
            });
            (user.name.charAt(0));
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "user-name" },
            });
            (user.name);
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "user-email" },
            });
            (user.email);
            __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
            (user.chatCount);
            __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
            (user.messageCount);
            __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
            (__VLS_ctx.formatRelativeTime(user.lastActive));
            // @ts-ignore
            [formatRelativeTime,];
            __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "character-badge" },
            });
            (user.favoriteCharacter);
            __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: (['status-badge', user.status]) },
            });
            (user.status === 'active' ? '활성' : '비활성');
        }
    }
}
if (__VLS_ctx.activeTab === 'character') {
    // @ts-ignore
    [activeTab,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "character-view" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "chart-container" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "chart-header" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ class: "view-toggle" },
    });
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "2",
    });
    __VLS_asFunctionalElement(__VLS_elements.rect, __VLS_elements.rect)({
        x: "3",
        y: "3",
        width: "7",
        height: "7",
    });
    __VLS_asFunctionalElement(__VLS_elements.rect, __VLS_elements.rect)({
        x: "14",
        y: "3",
        width: "7",
        height: "7",
    });
    __VLS_asFunctionalElement(__VLS_elements.rect, __VLS_elements.rect)({
        x: "14",
        y: "14",
        width: "7",
        height: "7",
    });
    __VLS_asFunctionalElement(__VLS_elements.rect, __VLS_elements.rect)({
        x: "3",
        y: "14",
        width: "7",
        height: "7",
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "character-grid" },
    });
    if (__VLS_ctx.isLoadingCharacters) {
        // @ts-ignore
        [isLoadingCharacters,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "loading-container" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "loading-spinner" },
        });
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
    }
    else if (__VLS_ctx.characters.length === 0) {
        // @ts-ignore
        [characters,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "empty-state" },
        });
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
    }
    else {
        for (const [char] of __VLS_getVForSourceType((__VLS_ctx.characters))) {
            // @ts-ignore
            [characters,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                key: (char.character_id),
                ...{ class: "character-stat-card" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "character-header" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "character-avatar-large" },
                ...{ style: ({ background: char.color }) },
            });
            (char.name.charAt(0));
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "character-details" },
            });
            __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({});
            (char.name);
            __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
                ...{ class: "character-description" },
            });
            (char.description);
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "character-metrics" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "metric" },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "metric-value" },
            });
            (char.chat_count || char.total_chats);
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "metric-label" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "metric" },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "metric-value" },
            });
            (char.user_count || char.unique_users);
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "metric-label" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "metric" },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "metric-value" },
            });
            (char.avgRating);
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "metric-label" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "usage-chart" },
            });
            __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
                viewBox: "0 0 42 42",
                ...{ class: "donut" },
            });
            __VLS_asFunctionalElement(__VLS_elements.circle)({
                cx: "21",
                cy: "21",
                r: "15.915",
                fill: "transparent",
                stroke: "#e5e7eb",
                'stroke-width': "3",
            });
            __VLS_asFunctionalElement(__VLS_elements.circle)({
                cx: "21",
                cy: "21",
                r: "15.915",
                fill: "transparent",
                stroke: (char.color),
                'stroke-width': "3",
                'stroke-dasharray': (`${char.percentage} ${100 - char.percentage}`),
                'stroke-dashoffset': "25",
                'stroke-linecap': "round",
            });
            __VLS_asFunctionalElement(__VLS_elements.text, __VLS_elements.text)({
                x: "21",
                y: "24",
                'text-anchor': "middle",
                fill: "#1a202c",
                'font-size': "8",
                'font-weight': "600",
            });
            (char.percentage);
        }
    }
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "data-table-container" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
    __VLS_asFunctionalElement(__VLS_elements.table, __VLS_elements.table)({
        ...{ class: "data-table" },
    });
    __VLS_asFunctionalElement(__VLS_elements.thead, __VLS_elements.thead)({});
    __VLS_asFunctionalElement(__VLS_elements.tr, __VLS_elements.tr)({});
    __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
    __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
    __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
    __VLS_asFunctionalElement(__VLS_elements.tbody, __VLS_elements.tbody)({});
    if (__VLS_ctx.isLoadingCharacters) {
        // @ts-ignore
        [isLoadingCharacters,];
        __VLS_asFunctionalElement(__VLS_elements.tr, __VLS_elements.tr)({});
        __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({
            colspan: "3",
            ...{ class: "text-center" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "loading-spinner" },
        });
    }
    else if (__VLS_ctx.characterTableData.length === 0) {
        // @ts-ignore
        [characterTableData,];
        __VLS_asFunctionalElement(__VLS_elements.tr, __VLS_elements.tr)({});
        __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({
            colspan: "3",
            ...{ class: "text-center" },
        });
    }
    else {
        for (const [char] of __VLS_getVForSourceType((__VLS_ctx.characterTableData))) {
            // @ts-ignore
            [characterTableData,];
            __VLS_asFunctionalElement(__VLS_elements.tr, __VLS_elements.tr)({
                key: (char.character_id),
            });
            __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "character-cell" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "small-avatar" },
                ...{ style: ({ background: char.color }) },
            });
            (char.name.charAt(0));
            (char.name);
            __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
            (char.totalChats);
            __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
            (char.activeUsers);
        }
    }
}
/** @type {__VLS_StyleScopedClasses['admin-overview']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-content']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['page-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['date-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['date-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['export-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-loading']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-spinner']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['blue']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-content']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-change']} */ ;
/** @type {__VLS_StyleScopedClasses['neutral']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['green']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-content']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-change']} */ ;
/** @type {__VLS_StyleScopedClasses['neutral']} */ ;
/** @type {__VLS_StyleScopedClasses['view-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-content']} */ ;
/** @type {__VLS_StyleScopedClasses['date-view']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-header']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-legend']} */ ;
/** @type {__VLS_StyleScopedClasses['legend-item']} */ ;
/** @type {__VLS_StyleScopedClasses['legend-color']} */ ;
/** @type {__VLS_StyleScopedClasses['legend-item']} */ ;
/** @type {__VLS_StyleScopedClasses['legend-color']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['line-chart']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['data-points']} */ ;
/** @type {__VLS_StyleScopedClasses['axis-scales']} */ ;
/** @type {__VLS_StyleScopedClasses['data-table-container']} */ ;
/** @type {__VLS_StyleScopedClasses['data-table']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-spinner']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['character-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['user-view']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-header']} */ ;
/** @type {__VLS_StyleScopedClasses['sort-select']} */ ;
/** @type {__VLS_StyleScopedClasses['user-ranking']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-container']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-spinner']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['user-rank-card']} */ ;
/** @type {__VLS_StyleScopedClasses['rank-number']} */ ;
/** @type {__VLS_StyleScopedClasses['user-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['user-info']} */ ;
/** @type {__VLS_StyleScopedClasses['user-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-stat']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-value']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-label']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-stat']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-value']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-label']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-stat']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-value']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-label']} */ ;
/** @type {__VLS_StyleScopedClasses['activity-graph']} */ ;
/** @type {__VLS_StyleScopedClasses['data-table-container']} */ ;
/** @type {__VLS_StyleScopedClasses['data-table']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-spinner']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['user-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['small-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['user-name']} */ ;
/** @type {__VLS_StyleScopedClasses['user-email']} */ ;
/** @type {__VLS_StyleScopedClasses['character-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['character-view']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-header']} */ ;
/** @type {__VLS_StyleScopedClasses['view-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['character-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-container']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-spinner']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['character-stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['character-header']} */ ;
/** @type {__VLS_StyleScopedClasses['character-avatar-large']} */ ;
/** @type {__VLS_StyleScopedClasses['character-details']} */ ;
/** @type {__VLS_StyleScopedClasses['character-description']} */ ;
/** @type {__VLS_StyleScopedClasses['character-metrics']} */ ;
/** @type {__VLS_StyleScopedClasses['metric']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-value']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-label']} */ ;
/** @type {__VLS_StyleScopedClasses['metric']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-value']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-label']} */ ;
/** @type {__VLS_StyleScopedClasses['metric']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-value']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-label']} */ ;
/** @type {__VLS_StyleScopedClasses['usage-chart']} */ ;
/** @type {__VLS_StyleScopedClasses['donut']} */ ;
/** @type {__VLS_StyleScopedClasses['data-table-container']} */ ;
/** @type {__VLS_StyleScopedClasses['data-table']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-spinner']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['character-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['small-avatar']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            activeTab: activeTab,
            currentDate: currentDate,
            isLoading: isLoading,
            dashboardStats: dashboardStats,
            isLoadingDaily: isLoadingDaily,
            isLoadingUsers: isLoadingUsers,
            isLoadingCharacters: isLoadingCharacters,
            tabs: tabs,
            dateData: dateData,
            topUsers: topUsers,
            allUsers: allUsers,
            characters: characters,
            characterTableData: characterTableData,
            formatDate: formatDate,
            formatRelativeTime: formatRelativeTime,
            getRankClass: getRankClass,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
    },
});
; /* PartiallyEnd: #4569/main.vue */

import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
// Lazy load components
const LoginView = () => import('../views/LoginView.vue');
const RegisterView = () => import('../views/RegisterView.vue');
const ChatView = () => import('../views/ChatView.vue');
const AdminDashboard = () => import('../views/AdminDashboard.vue');
// Admin components
const AdminOverview = () => import('../views/admin/AdminOverview.vue');
const UserManagement = () => import('../views/admin/UserManagement.vue');
const CharacterManagement = () => import('../views/admin/CharacterManagement.vue');
const PromptManagement = () => import('../views/admin/PromptManagement.vue');
// User components
const UserDashboard = () => import('../views/user/UserDashboard.vue');
const UserProfile = () => import('../views/user/UserProfile.vue');
const ChatHistory = () => import('../views/user/ChatHistory.vue');
const UserSettings = () => import('../views/user/UserSettings.vue');
const UserStats = () => import('../views/user/UserStats.vue');
export const routes = [
    {
        path: '/login',
        name: 'login',
        component: LoginView,
        meta: { requiresGuest: true },
    },
    {
        path: '/register',
        name: 'register',
        component: RegisterView,
        meta: { requiresGuest: true },
    },
    {
        path: '/',
        name: 'chat',
        component: ChatView,
        meta: { requiresAuth: true },
    },
    {
        path: '/chat/:id',
        name: 'chat-detail',
        component: ChatView,
        meta: { requiresAuth: true },
    },
    {
        path: '/user',
        name: 'user',
        component: UserDashboard,
        meta: { requiresAuth: true },
        children: [
            {
                path: '',
                redirect: { name: 'user-profile' },
            },
            {
                path: 'profile',
                name: 'user-profile',
                component: UserProfile,
            },
            {
                path: 'chats',
                name: 'user-chats',
                component: ChatHistory,
            },
            {
                path: 'stats',
                name: 'user-stats',
                component: UserStats,
            },
            {
                path: 'settings',
                name: 'user-settings',
                component: UserSettings,
            },
        ],
    },
    {
        path: '/admin',
        name: 'admin',
        component: AdminDashboard,
        meta: { requiresAuth: true, requiresAdmin: true },
        children: [
            {
                path: '',
                name: 'admin-overview',
                component: AdminOverview,
            },
            {
                path: 'users',
                name: 'admin-users',
                component: UserManagement,
            },
            {
                path: 'characters',
                name: 'admin-characters',
                component: CharacterManagement,
            },
            {
                path: 'prompts',
                name: 'admin-prompts',
                component: PromptManagement,
            },
        ],
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/',
    },
];
export const router = createRouter({
    history: createWebHistory(),
    routes,
});
// 네비게이션 가드
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        // 인증이 필요한 페이지인데 로그인하지 않은 경우
        next('/login');
    }
    else if (to.meta.requiresGuest && authStore.isAuthenticated) {
        // 게스트 전용 페이지인데 이미 로그인한 경우
        next('/');
    }
    else if (to.meta.requiresAdmin && !authStore.isAdmin) {
        // 관리자 권한이 필요한데 관리자가 아닌 경우
        next('/');
    }
    else {
        next();
    }
});
export default router;

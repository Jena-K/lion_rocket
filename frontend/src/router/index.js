import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
// Lazy load components
const LoginView = () => import('../views/LoginView.vue');
const RegisterView = () => import('../views/RegisterView.vue');
const ChatView = () => import('../views/ChatView.vue');
const AdminLoginView = () => import('../views/AdminLoginView.vue');
const AdminDashboard = () => import('../views/AdminDashboard.vue');
const CharacterSelectionView = () => import('../views/CharacterSelectionView.vue');
// Admin components
const UserManagement = () => import('../views/admin/UserManagement.vue');
const CharacterManagement = () => import('../views/admin/CharacterManagement.vue');
const UserChatHistory = () => import('../views/admin/UserChatHistory.vue');
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
        redirect: '/characters',
    },
    {
        path: '/admin/login',
        name: 'admin-login',
        component: AdminLoginView,
        meta: { requiresGuest: true },
    },
    {
        path: '/characters',
        name: 'character-selection',
        component: CharacterSelectionView,
        meta: { requiresAuth: true },
    },
    {
        path: '/chat/:characterId',
        name: 'chat',
        component: ChatView,
        meta: { requiresAuth: true },
    },
    {
        path: '/admin',
        redirect: '/admin/dashboard/users',
    },
    {
        path: '/admin/dashboard',
        name: 'admin-dashboard',
        component: AdminDashboard,
        meta: { requiresAuth: true, requiresAdmin: true },
        redirect: '/admin/dashboard/users',
        children: [
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
                path: 'chat-history',
                name: 'admin-chat-history',
                component: UserChatHistory,
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
router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        // 인증이 필요한 페이지인데 로그인하지 않은 경우
        next('/login');
    }
    else if (to.meta.requiresGuest && authStore.isAuthenticated) {
        // 게스트 전용 페이지인데 이미 로그인한 경우
        next('/characters');
    }
    else if (to.meta.requiresAdmin && !authStore.isAdmin) {
        // 관리자 권한이 필요한데 관리자가 아닌 경우
        next('/characters');
    }
    else if (to.meta.requiresCharacter) {
        // 캐릭터가 필요한 페이지인 경우
        const { useCharacterStore } = await import('../stores/character');
        const characterStore = useCharacterStore();
        // 활성 캐릭터가 없으면 먼저 확인
        if (!characterStore.activeCharacter) {
            await characterStore.fetchActiveCharacter();
        }
        // 여전히 활성 캐릭터가 없으면 캐릭터 선택 페이지로
        if (!characterStore.activeCharacter) {
            next('/characters');
        }
        else {
            next();
        }
    }
    else {
        next();
    }
});
export default router;

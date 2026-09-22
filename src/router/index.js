import { createRouter, createWebHashHistory } from 'vue-router'

// Lazy-loaded pages
const Login = () => import('@/pages/Login.vue')
const Dashboard = () => import('@/pages/Dashboard.vue')
const History = () => import('@/pages/History.vue')

const routes = [
    {
        path: '/',
        redirect: '/dashboard',
    },
    {
        path: '/login',
        name: 'login',
        component: Login,
        meta: { public: true },
    },
    {
        path: '/dashboard',
        name: 'dashboard',
        component: Dashboard,
        meta: { requiresAuth: true },
    },
    {
        path: '/history',
        name: 'history',
        component: History,
        meta: { requiresAuth: true },
    },
]

const router = createRouter({
    // Hash history works better in Electron (no server needed)
    history: createWebHashHistory(),
    routes,
})

// ============================================================
// NAVIGATION GUARDS
// ============================================================
router.beforeEach(async (to, from, next) => {
    const token = await window.electronAPI?.getToken?.()
    const isLoggedIn = Boolean(token)

    // Protected route but not logged in → go to login
    if (to.meta.requiresAuth && !isLoggedIn) {
        return next({ name: 'login' })
    }

    // Login page but already logged in → go to dashboard
    if (to.meta.public && isLoggedIn) {
        return next({ name: 'dashboard' })
    }

    next()
})

export default router
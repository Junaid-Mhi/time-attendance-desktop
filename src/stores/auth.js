import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/services/auth'

export const useAuthStore = defineStore('auth', () => {
    // ============================================================
    // STATE
    // ============================================================
    const token = ref(null)
    const user = ref(null)
    const loading = ref(false)
    const error = ref(null)

    // ============================================================
    // GETTERS (computed)
    // ============================================================
    const isLoggedIn = computed(() => Boolean(token.value))
    const userName = computed(() => user.value?.name || '')
    const userEmail = computed(() => user.value?.email || '')
    const userProfile = computed(() => user.value?.profile || null)

    // ============================================================
    // ACTIONS
    // ============================================================

    /**
     * Load token + user from electron-store (on app start).
     */
    async function loadFromStorage() {
        try {
            const storedToken = await window.electronAPI?.getToken?.()
            const storedUser = await window.electronAPI?.getUser?.()

            if (storedToken) {
                token.value = storedToken
            }
            if (storedUser) {
                user.value = storedUser
            }
        } catch (e) {
            console.error('Failed to load auth from storage', e)
        }
    }

    async function login(email, password) {
        loading.value = true
        error.value = null

        try {
            const response = await authApi.login(email, password)

            // Save token + user
            token.value = response.token
            user.value = response.user

            // Persist to electron-store
            await window.electronAPI?.setToken?.(response.token)
            await window.electronAPI?.setUser?.(response.user)

            return { success: true }
        } catch (e) {
            error.value = e.message || 'Login failed'
            return { success: false, message: error.value }
        } finally {
            loading.value = false
        }
    }

    /**
     * Logout — clears all state.
     */
    async function logout() {
        try {
            // Try server logout (ignore errors)
            await authApi.logout().catch(() => {})
        } finally {
            // Clear local state regardless
            token.value = null
            user.value = null
            error.value = null

            await window.electronAPI?.clearToken?.()
            await window.electronAPI?.setUser?.(null)
        }
    }

    /**
     * Fetch current user (validate token).
     */
    async function fetchMe() {
        try {
            const response = await authApi.me()
            user.value = response.data
            await window.electronAPI?.setUser?.(response.data)
            return true
        } catch (e) {
            // Token invalid → logout
            // await this.logout()
            return false
        }
    }

    return {
        // state
        token,
        user,
        loading,
        error,
        // getters
        isLoggedIn,
        userName,
        userEmail,
        userProfile,
        // actions
        loadFromStorage,
        login,
        logout,
        fetchMe,
    }
})
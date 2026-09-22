<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import ToastContainer from '@/components/ToastContainer.vue'

const router = useRouter()
const auth = useAuthStore()
const toast = useToastStore()

function handleUnauthorized() {
    // Clear local auth state
    auth.token = null
    auth.user = null

    // Clear stored token from electron-store
    window.electronAPI?.clearToken?.()

    // Show message
    toast.error('Session expired. Please login again.')

    // Redirect to login
    router.push({ name: 'login' })
}

onMounted(() => {
    window.addEventListener('api:unauthorized', handleUnauthorized)
})

onUnmounted(() => {
    window.removeEventListener('api:unauthorized', handleUnauthorized)
})
</script>

<template>
    <router-view />
    <ToastContainer />
</template>
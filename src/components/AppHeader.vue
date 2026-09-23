<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToastStore } from '@/stores/toast'
import { useAuthStore } from '@/stores/auth'
import logoUrl from '@/assets/logo.png'

const router = useRouter()
const auth = useAuthStore()

const showMenu = ref(false)
const toast = useToastStore()

const initials = computed(() => {
    const name = auth.userName || 'U'
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
})

function toggleMenu() {
    showMenu.value = !showMenu.value
}

function goToHistory() {
    showMenu.value = false
    router.push({ name: 'history' })
}

async function handleLogout() {
    showMenu.value = false
    await auth.logout()
    toast.info('Logged out')
    router.push({ name: 'login' })
}

// Close menu when clicking outside
function closeMenu(e) {
    if (!e.target.closest('.profile-menu-wrapper')) {
        showMenu.value = false
    }
}

if (typeof window !== 'undefined') {
    document.addEventListener('click', closeMenu)
}
</script>

<template>
    <header class="app-header">
        <div class="header-inner">
            <!-- Left: Brand -->
            <div class="brand">
                <i class="bi bi-clock-history brand-icon"></i>
                <span class="brand-text">Time Attendance</span>
            </div>

              <div class="header-logo">
                <img :src="logoUrl" alt="Logo" />
            </div>

            <!-- Right: User dropdown -->
            <div class="profile-menu-wrapper">
                <button class="user-btn" @click="toggleMenu">
                    <span class="avatar">{{ initials }}</span>
                    <span class="user-name">{{ auth.userName }}</span>
                    <i class="bi bi-chevron-down ms-1"></i>
                </button>

                <!-- Dropdown -->
                <div v-if="showMenu" class="dropdown-menu-custom">
                    <div class="dropdown-header-custom">
                        <strong>{{ auth.userName }}</strong>
                        <small class="text-muted d-block">{{ auth.userEmail }}</small>
                    </div>
                    <hr class="my-1" />
                    <button class="dropdown-item-custom" @click="goToHistory">
                        <i class="bi bi-clock-history me-2"></i>
                        View History
                    </button>
                    <button class="dropdown-item-custom danger" @click="handleLogout">
                        <i class="bi bi-box-arrow-right me-2"></i>
                        Logout
                    </button>
                </div>
            </div>
        </div>
    </header>
</template>

<style scoped>
.app-header {
    background: #ffffff;
    border-bottom: 1px solid #e5e7eb;
    padding: 0 24px;
    height: 64px;
    display: flex;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.header-inner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
}

.header-logo {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
}

.header-logo img {
    height: 40px;
    width: auto;
    max-width: 160px;
    object-fit: contain;
}

.brand {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 18px;
    font-weight: 700;
    color: #1f2937;
}

.brand-icon {
    font-size: 24px;
    color: #667eea;
}

.profile-menu-wrapper {
    position: relative;
}

.user-btn {
    background: none;
    border: none;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s;
    color: #1f2937;
}

.user-btn:hover {
    background: #f3f4f6;
}

.avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #ffffff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 12px;
}

.user-name {
    font-size: 14px;
    font-weight: 500;
}

.dropdown-menu-custom {
    position: absolute;
    right: 0;
    top: calc(100% + 8px);
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
    min-width: 220px;
    padding: 8px;
    z-index: 1000;
}

.dropdown-header-custom {
    padding: 8px 12px 4px;
    font-size: 13px;
}

.dropdown-item-custom {
    display: block;
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    padding: 10px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    color: #1f2937;
    transition: background 0.2s;
}

.dropdown-item-custom:hover {
    background: #f3f4f6;
}

.dropdown-item-custom.danger {
    color: #dc2626;
}

.dropdown-item-custom.danger:hover {
    background: #fef2f2;
}
</style>
<script setup>
import { onMounted, computed, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAttendanceStore } from '@/stores/attendance'
import AppHeader from '@/components/AppHeader.vue'
import StatusCard from '@/components/StatusCard.vue'
import Timeline from '@/components/Timeline.vue'
import ActionButtons from '@/components/ActionButtons.vue'
import { config } from '@/config'

const auth = useAuthStore()
const attendance = useAttendanceStore()

const now = ref(new Date())
let timerInterval = null

// Update the clock every second
function startClock() {
    timerInterval = setInterval(() => {
        now.value = new Date()
    }, config.TIMER_INTERVAL)
}

const greeting = computed(() => {
    const hour = now.value.getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good evening'
})

const formattedDate = computed(() => {
    return now.value.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
})

onMounted(async () => {
    // Ensure auth is loaded
    if (!auth.isLoggedIn) {
        await auth.loadFromStorage()
    }

    // Fetch today's data
    await attendance.fetchToday()

    // Start clock
    startClock()
})

// Cleanup
import { onUnmounted } from 'vue'
onUnmounted(() => {
    if (timerInterval) clearInterval(timerInterval)
})
</script>

<template>
    <div>
        <AppHeader />

        <main class="dashboard-main">
            <div class="dashboard-container">
                <!-- Greeting -->
                <div class="greeting-block">
                    <h1>{{ greeting }}, {{ auth.userName }} 👋</h1>
                    <p class="text-muted mb-0">{{ formattedDate }}</p>
                </div>

                <!-- Loading -->
                <div v-if="attendance.loading && !attendance.attendance" class="text-center py-5">
                    <div class="spinner-border text-primary"></div>
                    <p class="text-muted mt-3">Loading your status...</p>
                </div>

                <!-- Loaded -->
                <template v-else>
                    <StatusCard />
                    <ActionButtons />
                    <Timeline />
                </template>
            </div>
        </main>
    </div>
</template>

<style scoped>
.dashboard-main {
    min-height: calc(100vh - 64px);
    background: #f7f8fc;
    padding: 24px;
}

.dashboard-container {
    max-width: 900px;
    margin: 0 auto;
}

.greeting-block {
    margin-bottom: 24px;
}

.greeting-block h1 {
    font-size: 24px;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 4px;
}

.placeholder-card {
    background: #ffffff;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
</style>
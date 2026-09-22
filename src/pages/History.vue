<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { attendanceApi } from '@/services/attendance'
import AppHeader from '@/components/AppHeader.vue'

const router = useRouter()

const records = ref([])
const loading = ref(false)
const error = ref('')
const currentPage = ref(1)
const lastPage = ref(1)
const totalRecords = ref(0)

/**
 * Format a date like "Fri, 18 Sep 2026".
 */
function formatDate(dateStr) {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

/**
 * Format check-in/out time.
 */
function formatTime(isoString) {
    if (!isoString) return '—'
    return new Date(isoString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    })
}

/**
 * Status badge class.
 */
function statusColor(status) {
    return {
        present: 'success',
        late: 'warning',
        half_day: 'info',
        absent: 'danger',
        leave: 'secondary',
        holiday: 'primary',
        weekend: 'secondary',
    }[status] || 'secondary'
}

/**
 * Human label for status.
 */
function statusLabel(status) {
    if (!status) return '—'
    return status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Fetch a page of history.
 */
async function fetchPage(page = 1) {
    loading.value = true
    error.value = ''

    try {
        const response = await attendanceApi.history(page)

        if (page === 1) {
            records.value = response.data
        } else {
            records.value = [...records.value, ...response.data]
        }

        currentPage.value = response.meta.current_page
        lastPage.value = response.meta.last_page
        totalRecords.value = response.meta.total
    } catch (e) {
        error.value = e.message || 'Failed to load history'
    } finally {
        loading.value = false
    }
}

function loadMore() {
    if (currentPage.value < lastPage.value && !loading.value) {
        fetchPage(currentPage.value + 1)
    }
}

function goBack() {
    router.push({ name: 'dashboard' })
}

const hasMore = computed(() => currentPage.value < lastPage.value)

onMounted(() => {
    fetchPage(1)
})
</script>

<template>
    <div>
        <AppHeader />

        <main class="history-main">
            <div class="history-container">
                <!-- Header -->
                <div class="history-header">
                    <button class="btn btn-link p-0 text-decoration-none" @click="goBack">
                        <i class="bi bi-arrow-left me-1"></i>
                        Back to Dashboard
                    </button>

                    <h1 class="history-title">
                        <i class="bi bi-clock-history me-2"></i>
                        Attendance History
                    </h1>
                    <p class="text-muted small mb-0">
                        Total records: {{ totalRecords }}
                    </p>
                </div>

                <!-- Error -->
                <div v-if="error" class="alert alert-danger">
                    <i class="bi bi-exclamation-circle me-1"></i>
                    {{ error }}
                </div>

                <!-- Loading (first page) -->
                <div v-if="loading && records.length === 0" class="text-center py-5">
                    <div class="spinner-border text-primary"></div>
                    <p class="text-muted mt-3">Loading history...</p>
                </div>

                <!-- Empty state -->
                <div
                    v-else-if="!loading && records.length === 0"
                    class="empty-state"
                >
                    <i class="bi bi-inbox"></i>
                    <p class="mb-0 mt-3">No attendance records yet.</p>
                </div>

                <!-- Records -->
                <div v-else class="records-list">
                    <div
                        v-for="record in records"
                        :key="record.id"
                        class="record-card"
                    >
                        <div class="record-row">
                            <!-- Date -->
                            <div class="record-date">
                                <i class="bi bi-calendar3 me-2 text-muted"></i>
                                <strong>{{ formatDate(record.date) }}</strong>
                            </div>

                            <!-- Status badge -->
                            <span
                                class="badge"
                                :class="`bg-${statusColor(record.status)}`"
                            >
                                {{ statusLabel(record.status) }}
                            </span>
                        </div>

                        <div class="record-meta">
                            <!-- Check-in/out -->
                            <div class="meta-item">
                                <span class="meta-label">
                                    <i class="bi bi-box-arrow-in-right me-1 text-success"></i>
                                    Check In
                                </span>
                                <span class="meta-value">
                                    {{ formatTime(record.check_in_at) }}
                                </span>
                            </div>

                            <div class="meta-item">
                                <span class="meta-label">
                                    <i class="bi bi-box-arrow-right me-1 text-danger"></i>
                                    Check Out
                                </span>
                                <span class="meta-value">
                                    {{ formatTime(record.check_out_at) }}
                                </span>
                            </div>

                            <!-- Worked -->
                            <div class="meta-item">
                                <span class="meta-label">
                                    <i class="bi bi-stopwatch me-1 text-primary"></i>
                                    Worked
                                </span>
                                <span class="meta-value">
                                    {{ record.worked_label || '0m' }}
                                </span>
                            </div>

                            <!-- Break -->
                            <div class="meta-item">
                                <span class="meta-label">
                                    <i class="bi bi-cup-hot me-1 text-warning"></i>
                                    Break
                                </span>
                                <span class="meta-value">
                                    {{ record.break_label || '0m' }}
                                </span>
                            </div>
                        </div>

                        <!-- Late indicator -->
                        <div v-if="record.late_minutes > 0" class="late-info">
                            <i class="bi bi-exclamation-triangle text-warning me-1"></i>
                            Late by {{ record.late_minutes }} min
                        </div>
                    </div>

                    <!-- Load More -->
                    <div v-if="hasMore" class="text-center mt-4">
                        <button
                            class="btn btn-outline-primary"
                            :disabled="loading"
                            @click="loadMore"
                        >
                            <span v-if="loading">
                                <span class="spinner-border spinner-border-sm me-2"></span>
                                Loading...
                            </span>
                            <span v-else>
                                Load More
                            </span>
                        </button>
                    </div>

                    <div v-else class="text-center text-muted small mt-4">
                        — End of records —
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<style scoped>
.history-main {
    min-height: calc(100vh - 64px);
    background: #f7f8fc;
    padding: 24px;
}

.history-container {
    max-width: 900px;
    margin: 0 auto;
}

.history-header {
    margin-bottom: 24px;
}

.history-title {
    font-size: 24px;
    font-weight: 700;
    color: #1f2937;
    margin: 12px 0 4px;
}

.records-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.record-card {
    background: #ffffff;
    border-radius: 12px;
    padding: 16px 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.record-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.record-date {
    font-size: 15px;
    color: #1f2937;
}

.record-meta {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
}

.meta-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.meta-label {
    font-size: 11px;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
}

.meta-value {
    font-size: 14px;
    color: #1f2937;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
}

.late-info {
    font-size: 13px;
    color: #4b5563;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px dashed #e5e7eb;
}

.empty-state {
    background: #ffffff;
    border-radius: 12px;
    padding: 60px 20px;
    text-align: center;
    color: #9ca3af;
}

.empty-state i {
    font-size: 48px;
    color: #d1d5db;
}

@media (max-width: 600px) {
    .record-meta {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>
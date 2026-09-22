<script setup>
import { computed } from 'vue'
import { useAttendanceStore } from '@/stores/attendance'

const attendance = useAttendanceStore()

const events = computed(() => {
    const logs = attendance.attendance?.logs || []

    return logs.map((log) => ({
        id: log.id,
        action: log.action,
        label: log.action_label,
        time: formatTime(log.at),
        reason: log.reason ? capitalize(log.reason) : null,
        icon: iconFor(log.action),
        color: colorFor(log.action),
    }))
})

function formatTime(isoString) {
    if (!isoString) return '—'
    return new Date(isoString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    })
}

function iconFor(action) {
    return {
        check_in: 'bi-box-arrow-in-right',
        check_out: 'bi-box-arrow-right',
        pause: 'bi-pause-circle',
        resume: 'bi-play-circle',
    }[action] || 'bi-circle'
}

function colorFor(action) {
    return {
        check_in: 'success',
        check_out: 'danger',
        pause: 'warning',
        resume: 'primary',
    }[action] || 'secondary'
}

function capitalize(str) {
    if (!str) return ''
    return str.charAt(0).toUpperCase() + str.slice(1)
}
</script>

<template>
    <div v-if="events.length > 0" class="timeline-card">
        <h3 class="timeline-title">
            <i class="bi bi-list-ul me-2"></i>Today's Timeline
        </h3>

        <ul class="timeline-list">
            <li
                v-for="event in events"
                :key="event.id"
                class="timeline-item"
            >
                <span class="timeline-dot" :class="`dot-${event.color}`">
                    <i class="bi" :class="event.icon"></i>
                </span>

                <div class="timeline-content">
                    <div class="timeline-line">
                        <span class="timeline-time">{{ event.time }}</span>
                        <span class="timeline-label">{{ event.label }}</span>
                        <span v-if="event.reason" class="timeline-reason">
                            ({{ event.reason }})
                        </span>
                    </div>
                </div>
            </li>
        </ul>
    </div>
</template>

<style scoped>
.timeline-card {
    background: #ffffff;
    border-radius: 12px;
    padding: 20px 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    margin-bottom: 20px;
}

.timeline-title {
    font-size: 15px;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 16px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.timeline-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.timeline-item {
    display: flex;
    gap: 14px;
    padding: 8px 0;
    align-items: center;
}

.timeline-dot {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 14px;
    color: #ffffff;
}

.dot-success {
    background: #10b981;
}

.dot-danger {
    background: #ef4444;
}

.dot-warning {
    background: #f59e0b;
}

.dot-primary {
    background: #3b82f6;
}

.dot-secondary {
    background: #9ca3af;
}

.timeline-content {
    flex: 1;
    min-width: 0;
}

.timeline-line {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 8px;
}

.timeline-time {
    font-weight: 700;
    color: #1f2937;
    font-variant-numeric: tabular-nums;
    font-size: 14px;
}

.timeline-label {
    color: #6b7280;
    font-size: 14px;
}

.timeline-reason {
    color: #9ca3af;
    font-size: 13px;
    font-style: italic;
}
</style>
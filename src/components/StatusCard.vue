<script setup>
import { computed } from 'vue'
import { useAttendanceStore } from '@/stores/attendance'
import { useAttendanceTimer } from '@/composables/useAttendanceTimer'
import { computed as vueComputed } from 'vue'  

const attendance = useAttendanceStore()

const attendanceRef = computed(() => attendance.attendance)
const { liveWorkedLabel, liveBreakLabel } = useAttendanceTimer(attendanceRef)

const liveTimer = useAttendanceTimer(vueComputed(() => attendance.attendance))

// Determine which state to render
const state = computed(() => {
    if (attendance.hasNoShift) return 'no-shift'
    if (attendance.isCompleted) return 'completed'
    if (attendance.isOnBreak) return 'on-break'
    if (attendance.isWorking) return 'working'
    return 'not-checked-in'
})

// Format the last pause time (used in ON BREAK state)
const formattedLastPause = computed(() => {
    const att = attendance.attendance
    if (!att || !att.logs || att.logs.length === 0) return null

    // Find the last pause log
    const lastPause = [...att.logs]
        .reverse()
        .find((log) => log.action === 'pause')

    if (!lastPause) return null

    return new Date(lastPause.at).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    })
})

// Also — get the reason of last pause
const lastPauseReason = computed(() => {
    const att = attendance.attendance
    if (!att || !att.logs || att.logs.length === 0) return null

    const lastPause = [...att.logs]
        .reverse()
        .find((log) => log.action === 'pause')

    if (!lastPause || !lastPause.reason) return null

    // Capitalize first letter
    return lastPause.reason.charAt(0).toUpperCase() + lastPause.reason.slice(1)
})

const formattedCheckIn = computed(() => {
    if (!attendance.attendance?.check_in_at) return null
    return new Date(attendance.attendance.check_in_at).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    })
})

const formattedCheckOut = computed(() => {
    if (!attendance.attendance?.check_out_at) return null
    return new Date(attendance.attendance.check_out_at).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    })
})
</script>

<template>
    <div class="status-card" :class="`status-${state}`">
        <!-- NO SHIFT -->
        <template v-if="state === 'no-shift'">
            <div class="status-header">
                <i class="bi bi-exclamation-triangle status-icon text-warning"></i>
                <h2 class="status-title">No Shift Assigned</h2>
            </div>
            <p class="status-text">
                You don't have a shift assigned for today.
                Please contact your administrator.
            </p>
        </template>

        <!-- NOT CHECKED IN -->
        <template v-else-if="state === 'not-checked-in'">
            <div class="status-header">
                <i class="bi bi-clock status-icon text-secondary"></i>
                <h2 class="status-title">Not Checked In</h2>
            </div>
            <p class="status-text">
                Ready to start your day?
            </p>
        </template>

        <!-- WORKING -->
        <template v-else-if="state === 'working'">
            <div class="status-header">
                <span class="pulse-dot green"></span>
                <h2 class="status-title">Working</h2>
            </div>

            <div class="timer-row">
                <div class="timer-block">
                    <div class="timer-label">
                        <i class="bi bi-stopwatch me-1"></i>Worked
                    </div>
                     <div class="timer-value">
                    {{ liveWorkedLabel }}
                </div>
            </div>
            <div class="timer-block">
                <div class="timer-label">
                    <i class="bi bi-cup-hot me-1"></i>Break
                </div>
                <div class="timer-value">
                    {{ liveBreakLabel }}
                </div>
                </div>
            </div>

            <div v-if="formattedCheckIn" class="check-time">
                <i class="bi bi-check-circle me-1 text-success"></i>
                Checked in at {{ formattedCheckIn }}
            </div>
        </template>

        <!-- ON BREAK -->
        <template v-else-if="state === 'on-break'">
            <div class="status-header">
                <span class="pulse-dot orange"></span>
                <h2 class="status-title">On Break </h2>
            </div>

            <div class="timer-row">
                <div class="timer-block">
                    <div class="timer-label">
                        <i class="bi bi-stopwatch me-1"></i>Worked
                    </div>
                                    <div class="timer-value">
                    {{ liveWorkedLabel }}
                </div>
            </div>
            <div class="timer-block">
                <div class="timer-label">
                    <i class="bi bi-cup-hot me-1"></i>Break
                </div>
                <div class="timer-value text-warning">
                    {{ liveBreakLabel }}
                </div>
                </div>
            </div>

            <div v-if="formattedLastPause" class="check-time">
                <i class="bi bi-pause-circle me-1 text-warning"></i>
                On break since {{ formattedLastPause }}
                <span v-if="lastPauseReason" class="text-muted">
                    ({{ lastPauseReason }})
                </span>
            </div>
        </template>

        <!-- COMPLETED -->
        <template v-else-if="state === 'completed'">
            <div class="status-header">
                <i class="bi bi-check-circle-fill status-icon text-success"></i>
                <h2 class="status-title">Day Complete</h2>
            </div>

            <div class="timer-row">
                <div class="timer-block">
                    <div class="timer-label">
                        <i class="bi bi-stopwatch me-1"></i>Total Worked
                    </div>
                    <div class="timer-value text-success">
                        {{ attendance.attendance.worked_label }}
                    </div>
                </div>
                <div class="timer-block">
                    <div class="timer-label">
                        <i class="bi bi-cup-hot me-1"></i>Total Break
                    </div>
                    <div class="timer-value">
                        {{ attendance.attendance.break_label }}
                    </div>
                </div>
            </div>

            <div class="checkout-info">
                <div v-if="formattedCheckIn">
                    <i class="bi bi-box-arrow-in-right me-1 text-success"></i>
                    Check-in: {{ formattedCheckIn }}
                </div>
                <div v-if="formattedCheckOut">
                    <i class="bi bi-box-arrow-right me-1 text-danger"></i>
                    Check-out: {{ formattedCheckOut }}
                </div>
            </div>

            <p class="mt-3 mb-0 text-muted small">
                Need to work more? Click "Check In Again" below.
            </p>
        </template>
    </div>
</template>

<style scoped>
.status-card {
    background: #ffffff;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    margin-bottom: 20px;
    transition: background 0.3s;
}

.status-not-checked-in {
    border-left: 4px solid #9ca3af;
}

.status-working {
    background: #f0fdf4;
    border-left: 4px solid #10b981;
}

.status-on-break {
    background: #fffbeb;
    border-left: 4px solid #f59e0b;
}

.status-completed {
    background: #f0f9ff;
    border-left: 4px solid #667eea;
}

.status-no-shift {
    background: #fef2f2;
    border-left: 4px solid #ef4444;
}

.status-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
}

.status-title {
    font-size: 20px;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
}

.status-icon {
    font-size: 24px;
}

.status-text {
    color: #6b7280;
    margin: 0 0 16px;
}

.shift-info {
    background: #f9fafb;
    border-radius: 8px;
    padding: 12px 16px;
    margin-top: 16px;
}

.shift-label {
    font-size: 11px;
    font-weight: 600;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.shift-name {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    margin-top: 2px;
}

.shift-time {
    font-size: 14px;
    color: #6b7280;
    margin-top: 2px;
}

.timer-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin: 16px 0;
}

.timer-block {
    background: rgba(255, 255, 255, 0.7);
    border-radius: 8px;
    padding: 12px 16px;
}

.timer-label {
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.timer-value {
    font-size: 22px;
    font-weight: 700;
    color: #1f2937;
    margin-top: 4px;
    font-variant-numeric: tabular-nums;
}

.check-time,
.checkout-info {
    font-size: 14px;
    color: #4b5563;
    padding: 8px 0;
}

.checkout-info > div {
    padding: 3px 0;
}

.pulse-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    display: inline-block;
    animation: pulse 1.5s ease-in-out infinite;
}

.pulse-dot.green {
    background: #10b981;
}

.pulse-dot.orange {
    background: #f59e0b;
}

@keyframes pulse {
    0%, 100% {
        opacity: 1;
        transform: scale(1);
    }
    50% {
        opacity: 0.5;
        transform: scale(1.2);
    }
}
</style>
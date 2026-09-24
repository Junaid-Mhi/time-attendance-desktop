<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { useAttendanceStore } from '@/stores/attendance'
import { useAttendanceTimer } from '@/composables/useAttendanceTimer'
import { useToastStore } from '@/stores/toast'

const attendance = useAttendanceStore()


const showPauseModal = ref(false)
const pauseReason = ref('lunch')
const customReason = ref('') 
const showCheckoutModal = ref(false)
const errorMessage = ref('')
const errorProgress = ref(100)
let errorTimer = null
const toast = useToastStore()

const attendanceRef = computed(() => attendance.attendance)
const { liveWorkedLabel } = useAttendanceTimer(attendanceRef)

const state = computed(() => {
    if (attendance.hasNoShift) return 'no-shift'
    if (attendance.isCompleted) return 'completed'
    if (attendance.isOnBreak) return 'on-break'
    if (attendance.isWorking) return 'working'
    return 'not-checked-in'
})

const pauseReasons = [
    { value: 'lunch', label: 'Lunch' },
    { value: 'tea', label: 'Tea' },
    { value: 'personal', label: 'Personal' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'other', label: 'Other' },
]

async function handleCheckIn() {
    errorMessage.value = ''
    const result = await attendance.checkIn()
    if (result.success) {
        toast.success('Checked in successfully')
    } else {
        errorMessage.value = result.message
        toast.error(result.message)
    }
}

async function handleCheckOut() {
    showCheckoutModal.value = false
    errorMessage.value = ''
    const result = await attendance.checkOut()
    if (result.success) {
        toast.success('Checked out successfully')
    } else {
        errorMessage.value = result.message
        toast.error(result.message)
    }
}

async function handlePause() {
    // Determine the reason to send
    let finalReason = pauseReason.value

    if (pauseReason.value === 'other') {
        finalReason = customReason.value.trim()

        // Block if user selected "Other" but left it empty
        if (!finalReason) {
            errorMessage.value = 'Please enter a custom reason.'
            return
        }
    }

    showPauseModal.value = false
    errorMessage.value = ''

    const result = await attendance.pause(finalReason)

    if (result.success) {
        const label = finalReason.charAt(0).toUpperCase() + finalReason.slice(1)
        toast.success(`Break started (${label})`)
    } else {
        errorMessage.value = result.message
        toast.error(result.message)
    }
}

async function handleResume() {
    errorMessage.value = ''
    const result = await attendance.resume()
    if (result.success) {
        toast.success('Back to work')
    } else {
        errorMessage.value = result.message
        toast.error(result.message)
    }


}   
 function openPauseModal() {
    pauseReason.value = 'lunch'
    customReason.value = ''
    showPauseModal.value = true
}

watch(errorMessage, (newValue) => {
    // Clear any existing timer
    if (errorTimer) {
        clearInterval(errorTimer)
        errorTimer = null
    }

    if (newValue) {
        errorProgress.value = 100

        // Decrease progress every 50ms
        // 100 steps × 50ms = 5000ms = 5 seconds
        errorTimer = setInterval(() => {
            errorProgress.value -= 1

            if (errorProgress.value <= 0) {
                clearInterval(errorTimer)
                errorTimer = null
                errorMessage.value = ''
                errorProgress.value = 100  // reset for next time
            }
        }, 50)
    }
})

// Clean up on unmount
onUnmounted(() => {
    if (errorTimer) {
        clearInterval(errorTimer)
        errorTimer = null
    }
})
</script>

<template>
    <div class="action-wrapper">
        <!-- Error -->
      <div v-if="errorMessage" class="error-alert">
    <div class="error-progress" :style="{ width: errorProgress + '%' }"></div>

    <div class="error-content">
        <span>
            <i class="bi bi-exclamation-circle me-1"></i>
            {{ errorMessage }}
        </span>
        <button
            type="button"
            class="error-close"
            @click="errorMessage = ''"
            aria-label="Dismiss"
        >
            ×
        </button>
    </div>
</div>

        <!-- NOT CHECKED IN — Check In button -->
        <div v-if="state === 'not-checked-in'" class="action-row">
            <button
                class="btn-action btn-check-in"
                :disabled="attendance.loading || !attendance.actions.can_check_in"
                @click="handleCheckIn"
            >
                <i v-if="!attendance.loading" class="bi bi-box-arrow-in-right"></i>
                <span v-if="!attendance.loading">Check In</span>
                <span v-else>
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    Checking in...
                </span>
            </button>
        </div>

        <!-- WORKING — Pause + Check Out -->
        <div v-else-if="state === 'working'" class="action-row">
            <button
                class="btn-action btn-pause"
                :disabled="attendance.loading || !attendance.actions.can_pause"
                @click="openPauseModal"
            >
                <i class="bi bi-pause-circle"></i>
                Pause
            </button>
            <button
                class="btn-action btn-check-out"
                :disabled="attendance.loading || !attendance.actions.can_check_out"
                @click="showCheckoutModal = true"
            >
                <i class="bi bi-box-arrow-right"></i>
                Check Out
            </button>
        </div>

        <!-- ON BREAK — Resume -->
        <div v-else-if="state === 'on-break'" class="action-row">
            <button
                class="btn-action btn-resume"
                :disabled="attendance.loading || !attendance.actions.can_resume"
                @click="handleResume"
            >
                <i v-if="!attendance.loading" class="bi bi-play-circle"></i>
                <span v-if="!attendance.loading">Resume Work</span>
                <span v-else>
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    Resuming...
                </span>
            </button>
        </div>

        <!-- COMPLETED — no buttons -->
     <div v-else-if="state === 'completed'" class="action-row">
            <button
                class="btn-action btn-check-in"
                :disabled="attendance.loading || !attendance.actions.can_check_in"
                @click="handleCheckIn"
            >
                <i v-if="!attendance.loading" class="bi bi-arrow-clockwise"></i>
                <span v-if="!attendance.loading">Check In Again</span>
                <span v-else>
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    Checking in...
                </span>
            </button>
        </div>

        <!-- NO SHIFT — no buttons -->
        <div v-else-if="state === 'no-shift'" class="text-center text-muted small py-2">
            <i class="bi bi-info-circle me-1"></i>
            Waiting for shift assignment
        </div>

        <!-- ============================================ -->
        <!-- PAUSE MODAL -->
        <!-- ============================================ -->
        <div v-if="showPauseModal" class="modal-backdrop-custom" @click.self="showPauseModal = false">
            <div class="modal-card">
                <div class="modal-header-custom">
                    <h5 class="mb-0">
                        <i class="bi bi-pause-circle me-2"></i>
                        Start a Break
                    </h5>
                </div>
                <div class="modal-body-custom">
                    <label class="form-label small">Reason</label>
                    <select v-model="pauseReason" class="form-select">
                        <option v-for="r in pauseReasons" :key="r.value" :value="r.value">
                            {{ r.label }}
                        </option>
                    </select>
                        <!-- Custom reason input (only shown when "Other" is selected) -->
                    <div v-if="pauseReason === 'other'" class="mt-3">
                        <label class="form-label small">Specify reason</label>
                        <input
                            v-model="customReason"
                            type="text"
                            class="form-control"
                            placeholder="Enter reason..."
                            maxlength="100"
                            autofocus
                        />
                        <small class="text-muted">Max 100 characters</small>
                    </div>
                </div>
                <div class="modal-footer-custom">
                    <button class="btn btn-secondary" @click="showPauseModal = false">
                        Cancel
                    </button>
                    <button class="btn btn-warning" @click="handlePause">
                        <i class="bi bi-pause-circle me-1"></i>
                        Start Break
                    </button>
                </div>
            </div>
        </div>

        <!-- ============================================ -->
        <!-- CHECKOUT MODAL -->
        <!-- ============================================ -->
        <div v-if="showCheckoutModal" class="modal-backdrop-custom" @click.self="showCheckoutModal = false">
            <div class="modal-card">
                <div class="modal-header-custom">
                    <h5 class="mb-0">
                        <i class="bi bi-box-arrow-right me-2"></i>
                        Check Out?
                    </h5>
                </div>
                <div class="modal-body-custom">
                    <p class="mb-0">
                        You've worked <strong>{{ liveWorkedLabel }}</strong> today.
                        Are you sure you want to check out?
                    </p>
                </div>
                <div class="modal-footer-custom">
                    <button class="btn btn-secondary" @click="showCheckoutModal = false">
                        Cancel
                    </button>
                    <button class="btn btn-danger" @click="handleCheckOut">
                        <i class="bi bi-box-arrow-right me-1"></i>
                        Yes, Check Out
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.action-wrapper {
    margin-bottom: 20px;
}

.action-row {
    display: flex;
    gap: 12px;
}

.btn-action {
    flex: 1;
    padding: 14px 24px;
    border: none;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s;
}

.btn-action:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.btn-action:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-check-in {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.btn-pause {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.btn-check-out {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.btn-resume {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

/* Modal */
.modal-backdrop-custom {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 20px;
}

.modal-card {
    background: #ffffff;
    border-radius: 12px;
    width: 100%;
    max-width: 420px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    overflow: hidden;
}

.modal-header-custom {
    padding: 18px 22px;
    border-bottom: 1px solid #e5e7eb;
    color: #1f2937;
}

.modal-body-custom {
    padding: 20px 22px;
    color: #374151;
}

.modal-footer-custom {
    padding: 16px 22px;
    background: #f9fafb;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.error-alert {
    position: relative;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    margin-bottom: 16px;
    overflow: hidden;
}

.error-progress {
    position: absolute;
    top: 0;
    left: 0;
    height: 3px;
    background: #dc2626;
    transition: width 0.05s linear;
}

.error-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 14px;
    font-size: 13px;
    color: #991b1b;
}

.error-close {
    background: none;
    border: none;
    color: #991b1b;
    font-size: 18px;
    line-height: 1;
    padding: 0 4px;
    cursor: pointer;
    opacity: 0.6;
    transition: opacity 0.2s;
}

.error-close:hover {
    opacity: 1;
}
</style>
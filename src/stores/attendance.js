import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { attendanceApi } from '@/services/attendance'

export const useAttendanceStore = defineStore('attendance', () => {
    // ============================================================
    // STATE
    // ============================================================
    const profile = ref(null)
    const shift = ref(null)
    const attendance = ref(null)
    const actions = ref({
        can_check_in: false,
        can_check_out: false,
        can_pause: false,
        can_resume: false,
    })
    const loading = ref(false)
    const error = ref(null)
    const lastSync = ref(null)

    // ============================================================
    // GETTERS
    // ============================================================
    const isNotCheckedIn = computed(
        () => !attendance.value || !attendance.value.check_in_at
    )
    const isWorking = computed(
        () => attendance.value?.is_in_progress && !attendance.value?.is_on_break
    )
    const isOnBreak = computed(() => attendance.value?.is_on_break === true)
    const isCompleted = computed(() => attendance.value?.is_completed === true)
    const hasNoShift = computed(() => !shift.value)

    // ============================================================
    // ACTIONS
    // ============================================================

    /**
     * Fetch today's attendance + shift + profile.
     */
    async function fetchToday() {
        loading.value = true
        error.value = null

        try {
            const response = await attendanceApi.today()
            const data = response.data

            profile.value = data.profile
            shift.value = data.shift
            attendance.value = data.attendance
            actions.value = data.actions
            lastSync.value = new Date()

            return true
        } catch (e) {
            error.value = e.message || 'Failed to load attendance'
            return false
        } finally {
            loading.value = false
        }
    }

    /**
     * Check in.
     */
    async function checkIn() {
        loading.value = true
        error.value = null

        try {
            const response = await attendanceApi.checkIn()
            attendance.value = response.data
            await fetchToday() // refresh full state
            return { success: true, message: response.message }
        } catch (e) {
            error.value = e.message
            return { success: false, message: e.message }
        } finally {
            loading.value = false
        }
    }

    /**
     * Check out.
     */
    async function checkOut() {
        loading.value = true
        error.value = null

        try {
            const response = await attendanceApi.checkOut()
            attendance.value = response.data
            await fetchToday()
            return { success: true, message: response.message }
        } catch (e) {
            error.value = e.message
            return { success: false, message: e.message }
        } finally {
            loading.value = false
        }
    }

    /**
     * Pause (start break).
     */
    async function pause(reason = null) {
        loading.value = true
        error.value = null

        try {
            const response = await attendanceApi.pause(reason)
            attendance.value = response.data
            await fetchToday()
            return { success: true, message: response.message }
        } catch (e) {
            error.value = e.message
            return { success: false, message: e.message }
        } finally {
            loading.value = false
        }
    }

    /**
     * Resume (end break).
     */
    async function resume() {
        loading.value = true
        error.value = null

        try {
            const response = await attendanceApi.resume()
            attendance.value = response.data
            await fetchToday()
            return { success: true, message: response.message }
        } catch (e) {
            error.value = e.message
            return { success: false, message: e.message }
        } finally {
            loading.value = false
        }
    }

    return {
        // state
        profile,
        shift,
        attendance,
        actions,
        loading,
        error,
        lastSync,
        // getters
        isNotCheckedIn,
        isWorking,
        isOnBreak,
        isCompleted,
        hasNoShift,
        // actions
        fetchToday,
        checkIn,
        checkOut,
        pause,
        resume,
    }
})
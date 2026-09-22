import { ref, computed, onMounted, onUnmounted } from 'vue'

/**
 * Composable that computes live worked/break times.
 *
 * @param {Ref} attendance - Ref to the attendance object
 * @returns {Object} - { liveWorkedLabel, liveBreakLabel, seconds }
 */
export function useAttendanceTimer(attendance) {
    const now = ref(Date.now())
    let timerId = null

    function tick() {
        now.value = Date.now()
    }

    onMounted(() => {
        timerId = setInterval(tick, 1000)
    })

    onUnmounted(() => {
        if (timerId) clearInterval(timerId)
    })

      /**
     * Compute worked seconds from logs (accurate to the second).
     */
    const liveWorkedSeconds = computed(() => {
        const att = attendance.value
        if (!att || !att.check_in_at) return 0

        const logs = att.logs || []
        if (logs.length === 0) return 0

        // If already checked out, just use worked_minutes from server
        if (att.check_out_at) {
            return (att.worked_minutes || 0) * 60
        }

        let workedSeconds = 0
        let lastCheckIn = null

        for (const log of logs) {
            const logTime = new Date(log.at).getTime()

            if (log.action === 'check_in') {
                lastCheckIn = logTime
            } else if (log.action === 'resume') {
                lastCheckIn = logTime
            } else if (log.action === 'pause') {
                if (lastCheckIn) {
                    workedSeconds += Math.floor((logTime - lastCheckIn) / 1000)
                    lastCheckIn = null
                }
            } else if (log.action === 'check_out') {
                if (lastCheckIn) {
                    workedSeconds += Math.floor((logTime - lastCheckIn) / 1000)
                    lastCheckIn = null
                }
            }
        }

        // If still working (last action was check_in or resume), add time since
        if (lastCheckIn) {
            workedSeconds += Math.floor((now.value - lastCheckIn) / 1000)
        }

        return Math.max(0, workedSeconds)
    })

       /**
     * Compute break seconds from logs (accurate to the second).
     */
    const liveBreakSeconds = computed(() => {
        const att = attendance.value
        if (!att || !att.logs) return 0

        const logs = att.logs
        if (logs.length === 0) return 0

        let breakSeconds = 0
        let lastPause = null

        for (const log of logs) {
            const logTime = new Date(log.at).getTime()

            if (log.action === 'pause') {
                lastPause = logTime
            } else if (log.action === 'resume') {
                if (lastPause) {
                    breakSeconds += Math.floor((logTime - lastPause) / 1000)
                    lastPause = null
                }
            } else if (log.action === 'check_out') {
                if (lastPause) {
                    breakSeconds += Math.floor((logTime - lastPause) / 1000)
                    lastPause = null
                }
            }
        }

        // If still on break, add time since last pause
        if (lastPause) {
            breakSeconds += Math.floor((now.value - lastPause) / 1000)
        }

        return Math.max(0, breakSeconds)
    })

    /**
     * Format seconds → "Xh Ym Zs" (or "Ym Zs" or "Zs")
     */
    function formatSeconds(totalSeconds) {
        const h = Math.floor(totalSeconds / 3600)
        const m = Math.floor((totalSeconds % 3600) / 60)
        const s = totalSeconds % 60

        if (h > 0) return `${h}h ${m}m ${s}s`
        if (m > 0) return `${m}m ${s}s`
        return `${s}s`
    }

    const liveWorkedLabel = computed(() => formatSeconds(liveWorkedSeconds.value))
    const liveBreakLabel = computed(() => formatSeconds(liveBreakSeconds.value))

    return {
        liveWorkedLabel,
        liveBreakLabel,
        liveWorkedSeconds,
        liveBreakSeconds,
    }
}
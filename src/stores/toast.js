import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
    const toasts = ref([])
    let nextId = 1

    /**
     * Show a toast.
     */
    function show(message, type = 'info', duration = 3000) {
        const id = nextId++

        const toast = {
            id,
            message,
            type,
            progress: 100,   // starts full width
            duration,
        }

        toasts.value.push(toast)

        // Progress ticks: every 50ms, decrease by (100 / steps)%
        const steps = duration / 50
        const decrement = 100 / steps

        const timer = setInterval(() => {
            const current = toasts.value.find((t) => t.id === id)

            // Toast was dismissed manually → stop interval
            if (!current) {
                clearInterval(timer)
                return
            }

            current.progress -= decrement

            if (current.progress <= 0) {
                clearInterval(timer)
                dismiss(id)
            }
        }, 50)

        return id
    }

    function success(message) {
        return show(message, 'success', 3000)
    }

    function error(message) {
        return show(message, 'error', 4000)
    }

    function info(message) {
        return show(message, 'info', 3000)
    }

    function warning(message) {
        return show(message, 'warning', 4000)
    }

    function dismiss(id) {
        toasts.value = toasts.value.filter((t) => t.id !== id)
    }

    return {
        toasts,
        show,
        success,
        error,
        info,
        warning,
        dismiss,
    }
})
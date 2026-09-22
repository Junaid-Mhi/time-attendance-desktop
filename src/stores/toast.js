import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
    const toasts = ref([])
    let nextId = 1

    /**
     * Show a toast.
     * @param {string} message
     * @param {string} type - 'success' | 'error' | 'info' | 'warning'
     * @param {number} duration - ms before auto-dismiss (default 3000)
     */
    function show(message, type = 'info', duration = 3000) {
        const id = nextId++
        const toast = { id, message, type }

        toasts.value.push(toast)

        setTimeout(() => {
            dismiss(id)
        }, duration)

        return id
    }

    function success(message) {
        return show(message, 'success')
    }

    function error(message) {
        return show(message, 'error', 4000)
    }

    function info(message) {
        return show(message, 'info')
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
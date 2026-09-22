<script setup>
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()

function iconFor(type) {
    return {
        success: 'bi-check-circle-fill',
        error: 'bi-x-circle-fill',
        warning: 'bi-exclamation-triangle-fill',
        info: 'bi-info-circle-fill',
    }[type] || 'bi-info-circle-fill'
}
</script>

<template>
    <div class="toast-container">
        <TransitionGroup name="toast">
            <div
                v-for="t in toast.toasts"
                :key="t.id"
                class="toast-item"
                :class="`toast-${t.type}`"
                @click="toast.dismiss(t.id)"
            >
                <i class="bi" :class="iconFor(t.type)"></i>
                <span>{{ t.message }}</span>
            </div>
        </TransitionGroup>
    </div>
</template>

<style scoped>
.toast-container {
    position: fixed;
    bottom: 24px;
    right: 24px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    z-index: 10000;
    pointer-events: none;
}

.toast-item {
    pointer-events: auto;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 20px;
    border-radius: 10px;
    color: #ffffff;
    font-weight: 500;
    font-size: 14px;
    min-width: 260px;
    max-width: 400px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    transition: all 0.3s;
}

.toast-item:hover {
    transform: translateX(-4px);
}

.toast-success {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.toast-error {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.toast-warning {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.toast-info {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

/* Transition */
.toast-enter-active,
.toast-leave-active {
    transition: all 0.3s ease;
}

.toast-enter-from {
    opacity: 0;
    transform: translateX(100%);
}

.toast-leave-to {
    opacity: 0;
    transform: translateX(100%);
}
</style>
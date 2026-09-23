<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToastStore } from '@/stores/toast'
import { useAuthStore } from '@/stores/auth'
import { config } from '@/config'
import logoUrl from '@/assets/logo.png'


const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const localError = ref('')
const toast = useToastStore()

async function handleLogin() {
    localError.value = ''

    if (!email.value || !password.value) {
        localError.value = 'Please fill all fields.'
        return
    }

    const result = await auth.login(email.value, password.value)

    if (result.success) {
        toast.success('Welcome back!')
        router.push({ name: 'dashboard' })
    } else {
        localError.value = result.message
    }
}

function togglePassword() {
    showPassword.value = !showPassword.value
}

onMounted(() => {
    // Clear any stale errors
    auth.error = null
})
</script>

<template>
    <div class="login-wrapper">
        <div class="login-card">
            <!-- Logo / Brand -->
            <div class="text-center mb-4">
                <div class="brand-icon"><img :src="logoUrl" alt="Logo" /></div>
                <h1 class="brand-title">{{ config.APP_NAME }}</h1>
                <p class="brand-subtitle">Welcome Back</p>
            </div>

            <!-- Error Alert -->
            <div v-if="localError" class="alert alert-danger py-2 small">
                ❌ {{ localError }}
            </div>

            <!-- Login Form -->
            <form @submit.prevent="handleLogin">
                <!-- Email -->
                <div class="mb-3">
                    <label class="form-label small">Email</label>
                    <input
                        v-model="email"
                        type="email"
                        class="form-control"
                        placeholder="you@example.com"
                        autocomplete="username"
                        :disabled="auth.loading"
                    />
                </div>

                <!-- Password -->
                <div class="mb-3">
                    <label class="form-label small">Password</label>
                    <div class="input-group">
                        <input
                            v-model="password"
                            :type="showPassword ? 'text' : 'password'"
                            class="form-control"
                            placeholder="Enter password"
                            autocomplete="current-password"
                            :disabled="auth.loading"
                        />
                        <button
                            type="button"
                            class="btn btn-outline-secondary"
                            @click="togglePassword"
                            tabindex="-1"
                        >
                            {{ showPassword ? '🙈' : '👁' }}
                        </button>
                    </div>
                </div>

                <!-- Submit -->
                <button
                    type="submit"
                    class="btn btn-primary w-100 py-2 mt-3"
                    :disabled="auth.loading"
                >
                    <span v-if="!auth.loading">Sign In</span>
                    <span v-else>
                        <span class="spinner-border spinner-border-sm me-2"></span>
                        Signing in...
                    </span>
                </button>
            </form>

        </div>
    </div>
</template>

<style scoped>
.login-wrapper {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
}

.login-card {
    width: 100%;
    max-width: 440px;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
    padding: 40px;
}

.brand-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 16px;
}

.brand-icon img {
    height: 75px;
    width: auto;
    max-width: 200px;
    object-fit: contain;
}

.brand-title {
    font-size: 26px;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 6px;
}

.brand-subtitle {
    color: #6b7280;
    font-size: 14px;
    margin: 0;
}

.form-label {
    font-weight: 600;
    color: #4b5563;
}

.form-control {
    padding: 10px 14px;
    border-radius: 8px;
}

.form-control:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
}

.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.35);
}

.btn-primary:disabled {
    opacity: 0.7;
}

.btn-outline-secondary {
    border-radius: 0 8px 8px 0;
    border-color: #dee2e6;
}
</style>
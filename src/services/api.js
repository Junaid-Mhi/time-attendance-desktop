import axios from 'axios'
import { config } from '@/config'

// Create axios instance with base URL
const api = axios.create({
    baseURL: config.API_BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
})

// ============================================================
// REQUEST INTERCEPTOR
// Attach token to every request
// ============================================================
api.interceptors.request.use(
    async (reqConfig) => {
        const token = await window.electronAPI?.getToken?.()

        if (token) {
            reqConfig.headers.Authorization = `Bearer ${token}`
        }

        return reqConfig
    },
    (error) => Promise.reject(error)
)

// ============================================================
// RESPONSE INTERCEPTOR
// Turn any error into a clean, user-friendly object
// ============================================================
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status
        const data = error.response?.data
        const url = error.config?.url || ''

        const isLoginRequest = url.includes('/api/ta/login')

        // ---- Session expiry handling (non-login 401s) ----
        if (status === 401 && !isLoginRequest) {
            window.dispatchEvent(new CustomEvent('api:unauthorized'))
            return Promise.reject({
                message: 'Session expired. Please login again.',
                code: 'UNAUTHENTICATED',
                status: 401,
            })
        }

        // ---- Network error / no response ----
        if (!error.response) {
            if (error.code === 'ECONNABORTED') {
                return Promise.reject({
                    message: 'Request timed out. Please check your internet.',
                    code: 'TIMEOUT',
                    status: 0,
                })
            }

            return Promise.reject({
                message: 'Cannot reach server. Please check your internet.',
                code: 'NETWORK_ERROR',
                status: 0,
            })
        }

        // ---- Extract message (priority order) ----
        let message = null

        // 1. Validation errors → first error message
        if (status === 422 && data?.errors) {
            message = Object.values(data.errors).flat()[0]
        }

        // 2. Backend `message` field (used by most endpoints including login)
        if (!message && typeof data?.message === 'string' && data.message.trim() !== '') {
            message = data.message
        }

        // 3. Backend `error` field (fallback)
        if (!message && typeof data?.error === 'string' && data.error.trim() !== '') {
            message = data.error
        }

        // 4. Generic message per status code
        if (!message) {
            message = defaultMessageFor(status)
        }

        // ---- Code (from backend or default) ----
        const code = data?.code || defaultCodeFor(status)

        return Promise.reject({
            message,
            code,
            status,
        })
    }
)

// ============================================================
// HELPER: Default messages per HTTP status
// ============================================================
function defaultMessageFor(status) {
    const messages = {
        400: 'Invalid request. Please check your input.',
        401: 'Authentication failed.',
        403: 'You do not have permission to do this.',
        404: 'The requested resource was not found.',
        405: 'This action is not allowed.',
        419: 'Session expired. Please login again.',
        422: 'Please check the fields and try again.',
        429: 'Too many requests. Please wait a moment.',
        500: 'Something went wrong on the server.',
        502: 'Server is temporarily unavailable.',
        503: 'Service is temporarily unavailable.',
        504: 'Server took too long to respond.',
    }

    return messages[status] || 'Something went wrong. Please try again.'
}

// ============================================================
// HELPER: Default error codes
// ============================================================
function defaultCodeFor(status) {
    const codes = {
        400: 'BAD_REQUEST',
        401: 'UNAUTHENTICATED',
        403: 'FORBIDDEN',
        404: 'NOT_FOUND',
        405: 'METHOD_NOT_ALLOWED',
        419: 'SESSION_EXPIRED',
        422: 'VALIDATION_ERROR',
        429: 'TOO_MANY_REQUESTS',
        500: 'SERVER_ERROR',
        502: 'BAD_GATEWAY',
        503: 'SERVICE_UNAVAILABLE',
        504: 'GATEWAY_TIMEOUT',
    }

    return codes[status] || 'UNKNOWN_ERROR'
}

export default api
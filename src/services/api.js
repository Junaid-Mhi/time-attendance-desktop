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
        // ---- 401 Unauthorized ----
        if (error.response?.status === 401) {
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

        // ---- Server responded with an error ----
        const { status, data } = error.response

        // Extract meaningful message
        // Priority: data.message > data.error > data.errors[first] > default per status
            let message = null

            // Prefer our own clean messages for standard HTTP errors
            // Use backend message only for validation errors (they're user-friendly)
            if (status === 422 && data?.errors) {
                // Validation: use first error from errors object
                message = Object.values(data.errors).flat()[0]
            } else if (data?.code) {
                // Backend explicitly sent a code (e.g., ATTENDANCE_ERROR)
                // Use its message
                message = data.message || data.error
            }

            // Fallback to our default
            if (!message || typeof message !== 'string') {
                message = defaultMessageFor(status)
            }

        // Extract code (if backend sends one)
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
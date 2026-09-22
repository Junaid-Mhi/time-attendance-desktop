import api from './api'

export const attendanceApi = {
    async today() {
        const { data } = await api.get('/api/ta/attendance/today')
        return data
    },

    async history(page = 1) {
        const { data } = await api.get('/api/ta/attendance/history', {
            params: { page },
        })
        return data
    },

    async checkIn() {
        const { data } = await api.post('/api/ta/attendance/check-in')
        return data
    },

    async checkOut() {
        const { data } = await api.post('/api/ta/attendance/check-out')
        return data
    },

    async pause(reason = null) {
        const { data } = await api.post('/api/ta/attendance/pause', {
            reason,
        })
        return data
    },

    async resume() {
        const { data } = await api.post('/api/ta/attendance/resume')
        return data
    },

    async currentShift() {
        const { data } = await api.get('/api/ta/shift/current')
        return data
    },
}
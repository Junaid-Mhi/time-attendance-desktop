import api from './api'

export const authApi = {
    async login(email, password, deviceName = 'Desktop App') {
        const { data } = await api.post('/api/ta/login', {
            email,
            password,
            device_name: deviceName,
        })
        return data
    },

    async logout() {
        const { data } = await api.post('/api/ta/logout')
        return data
    },

    async me() {
        const { data } = await api.get('/api/ta/me')
        return data
    },
}
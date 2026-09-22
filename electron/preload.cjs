const { contextBridge, ipcRenderer } = require('electron')

// Expose safe APIs to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    // Token storage
    getToken: () => ipcRenderer.invoke('store:get-token'),
    setToken: (token) => ipcRenderer.invoke('store:set-token', token),
    clearToken: () => ipcRenderer.invoke('store:clear-token'),

    // User info storage
    getUser: () => ipcRenderer.invoke('store:get-user'),
    setUser: (user) => ipcRenderer.invoke('store:set-user', user),

    // Environment info
    isDev: () => !process.env.NODE_ENV || process.env.NODE_ENV === 'development',
})
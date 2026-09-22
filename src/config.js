// App-wide configuration
// Change API_BASE_URL when deploying to production

export const config = {
    // Backend API URL
    API_BASE_URL: 'http://127.0.0.1:8000',
    // API_BASE_URL: 'https://inventory.impexum.com',


    // Polling interval for refreshing today's status (30 seconds)
    POLL_INTERVAL: 30000,

    // Timer update interval for live display (1 second)
    TIMER_INTERVAL: 1000,

    // App info
    APP_NAME: 'Time Attendance',
    APP_VERSION: '1.0.0',
}
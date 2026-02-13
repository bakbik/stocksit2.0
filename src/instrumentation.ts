export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const cron = (await import('node-cron')).default
        const { updateAllStocksData } = await import('./lib/sync')
        const { checkAlerts } = await import('./lib/alerts')

        console.log('--- Background Service Starting ---')

        // Schedule every 6 hours: 0 */6 * * *
        cron.schedule('0 */6 * * *', async () => {
            console.log('--- Running Scheduled Tasks (6-hour cycle) ---')
            try {
                await updateAllStocksData()
                await checkAlerts()
                console.log('--- Scheduled Tasks Completed ---')
            } catch (error) {
                console.error('Error in scheduled tasks:', error)
            }
        })

        console.log('--- Background Service Registered (Every 6 hours) ---')
    }
}
